// Popup JavaScript for Fake Order Checker Chrome Extension

class FakeOrderCheckerPopup {
  constructor() {
    console.log("Popup: Constructor starting...");
    // Use deployed Vercel application
    this.API_BASE_URL =
      "https://fake-order-checker.flexsoftr.com/api/fraud-check";
    this.elements = this.initializeElements();
    console.log("Popup: Elements initialized:", this.elements);
    this.bindEvents();
    console.log("Popup: Events bound, loading stored data...");
    this.loadStoredData();
  }

  initializeElements() {
    const elements = {
      phoneInput: document.getElementById("phoneInput"),
      checkButton: document.getElementById("checkButton"),
      loadingState: document.getElementById("loadingState"),
      resultSection: document.getElementById("resultSection"),
      errorState: document.getElementById("errorState"),
      resultPhone: document.getElementById("resultPhone"),
      totalOrders: document.getElementById("totalOrders"),
      totalDeliveries: document.getElementById("totalDeliveries"),
      totalCancellations: document.getElementById("totalCancellations"),
      successRatio: document.getElementById("successRatio"),
      ratioStatus: document.getElementById("ratioStatus"),
      resultMessage: document.getElementById("resultMessage"),
      errorMessage: document.getElementById("errorMessage"),
      retryButton: document.getElementById("retryButton"),
      viewFullReport: document.getElementById("viewFullReport"),
      courierTableBody: document.getElementById("courierTableBody"),
    };

    console.log("Popup: Initializing elements...");
    console.log("Popup: phoneInput found:", elements.phoneInput);
    console.log("Popup: All elements:", elements);

    return elements;
  }

  bindEvents() {
    console.log("Popup: Binding events...");

    // Check button click
    if (this.elements.checkButton) {
      this.elements.checkButton.addEventListener("click", () => {
        this.checkPhoneNumber();
      });
    } else {
      console.warn("Popup: checkButton not found");
    }

    // Enter key press in input
    if (this.elements.phoneInput) {
      this.elements.phoneInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.checkPhoneNumber();
        }
      });

      // Input validation
      this.elements.phoneInput.addEventListener("input", (e) => {
        this.validatePhoneInput(e.target.value);
      });

      // Focus on input when popup opens
      window.addEventListener("load", () => {
        this.elements.phoneInput.focus();
      });
    } else {
      console.warn("Popup: phoneInput not found");
    }

    // Retry button
    if (this.elements.retryButton) {
      this.elements.retryButton.addEventListener("click", () => {
        this.checkPhoneNumber();
      });
    } else {
      console.warn("Popup: retryButton not found");
    }

    // View full report button
    if (this.elements.viewFullReport) {
      this.elements.viewFullReport.addEventListener("click", () => {
        this.openFullReport();
      });
    } else {
      console.warn("Popup: viewFullReport not found");
    }

    console.log("Popup: Events bound successfully");
  }

  validatePhoneInput(value) {
    // Remove non-numeric characters except + and -
    const cleaned = value.replace(/[^\d+\-]/g, "");

    // Limit to 15 characters
    const limited = cleaned.slice(0, 15);

    if (limited !== value) {
      this.elements.phoneInput.value = limited;
    }

    // Enable/disable check button
    this.elements.checkButton.disabled = !this.isValidPhoneNumber(limited);

    if (this.elements.checkButton.disabled) {
      this.elements.checkButton.style.opacity = "0.5";
      this.elements.checkButton.style.cursor = "not-allowed";
    } else {
      this.elements.checkButton.style.opacity = "1";
      this.elements.checkButton.style.cursor = "pointer";
    }
  }

  isValidPhoneNumber(phone) {
    // Bangladeshi phone number patterns
    const patterns = [
      /^(\+880|880)?1[3-9]\d{8}$/, // +8801XXXXXXXXX or 8801XXXXXXXXX or 01XXXXXXXXX
      /^01[3-9]\d{8}$/, // 01XXXXXXXXX
      /^1[3-9]\d{8}$/, // 1XXXXXXXXX
    ];

    // Clean the phone number (remove spaces, dashes, dots)
    const cleaned = phone.replace(/[\s\-\.\(\)]/g, "");

    return patterns.some((pattern) => pattern.test(cleaned));
  }

  formatPhoneNumber(phone) {
    // Clean the phone number
    let cleaned = phone.replace(/[\s\-\.\(\)]/g, "");

    // Handle different formats
    if (cleaned.startsWith("+880")) {
      // Already in international format
      return cleaned;
    } else if (cleaned.startsWith("880")) {
      // Add + prefix
      return "+" + cleaned;
    } else if (cleaned.startsWith("01")) {
      // Convert 01XXXXXXXXX to +880XXXXXXXXX
      return "+880" + cleaned.substring(1);
    } else if (cleaned.startsWith("1") && cleaned.length === 10) {
      // Convert 1XXXXXXXXX to +8801XXXXXXXXX
      return "+880" + cleaned;
    } else if (cleaned.startsWith("1") && cleaned.length === 11) {
      // Already in correct format, add +880
      return "+880" + cleaned;
    }

    // Return as is if no pattern matches
    return cleaned;
  }

  async checkPhoneNumber() {
    const phoneNumber = this.elements.phoneInput.value.trim();
    console.log("Popup: checkPhoneNumber called with:", phoneNumber);

    if (!phoneNumber) {
      console.error("Popup: No phone number provided");
      this.showError("Please enter a phone number");
      return;
    }

    if (!this.isValidPhoneNumber(phoneNumber)) {
      console.error("Popup: Invalid phone number:", phoneNumber);
      this.showError("Please enter a valid Bangladeshi phone number");
      return;
    }

    // Format the phone number for API call
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    console.log(
      "Original phone:",
      phoneNumber,
      "Formatted phone:",
      formattedPhone
    );

    this.showLoading();

    try {
      console.log("Popup: Starting API call...");
      const result = await this.fetchFraudCheck(formattedPhone);
      console.log("Popup: API call successful, showing result");
      this.showResult(result);
      this.saveToHistory(phoneNumber, result);
    } catch (error) {
      console.error("Error checking phone number:", error);
      this.showError(this.getErrorMessage(error));
    }
  }

  async fetchFraudCheck(phoneNumber) {
    const url = `${this.API_BASE_URL}?mobile=${encodeURIComponent(
      phoneNumber
    )}`;

    console.log("API call URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "FakeOrderChecker-ChromeExtension/1.0.0",
      },
      timeout: 10000,
    });

    console.log("API response status:", response.status);
    console.log("API response headers:", response.headers);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error response:", errorData);
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("API success response:", result);
    return result;
  }

  showLoading() {
    this.hideAllStates();
    this.elements.loadingState.classList.remove("hidden");
    this.elements.checkButton.disabled = true;
  }

  showResult(result) {
    this.hideAllStates();
    this.elements.resultSection.classList.remove("hidden");

    // Display phone number
    this.elements.resultPhone.textContent = result.phoneNumber;

    // Animate stats
    this.animateNumber(this.elements.totalOrders, result.totalOrders);
    this.animateNumber(this.elements.totalDeliveries, result.totalDeliveries);
    this.animateNumber(
      this.elements.totalCancellations,
      result.totalCancellations
    );
    this.animateNumber(this.elements.successRatio, result.successRatio, "%");

    // Update success ratio status
    this.updateSuccessRatioStatus(result.successRatio);

    // Display message
    this.displayResultMessage(result);

    // Populate courier breakdown
    console.log("Result object:", result);
    console.log("Couriers from result:", result.couriers);
    this.populateCourierTable(result.couriers || []);

    // Re-enable check button
    this.elements.checkButton.disabled = false;
  }

  animateNumber(element, targetValue, suffix = "") {
    const duration = 1000;
    const startValue = 0;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(
        startValue + (targetValue - startValue) * easeOutQuart
      );

      element.textContent = currentValue + suffix;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = targetValue + suffix;
      }
    };

    requestAnimationFrame(animate);
  }

  updateSuccessRatioStatus(ratio) {
    let status = "";
    let color = "";

    if (ratio >= 70) {
      status = "চমৎকার";
      color = "#059669";
    } else if (ratio >= 40) {
      status = "মাঝারি";
      color = "#d97706";
    } else {
      status = "খারাপ";
      color = "#dc2626";
    }

    this.elements.ratioStatus.textContent = status;
    this.elements.ratioStatus.style.color = color;
  }

  displayResultMessage(result) {
    const messageHtml = `
            <h4>${result.message}</h4>
            <p>This customer has a ${result.successRatio}% success rate with ${result.totalOrders} total orders.</p>
        `;
    this.elements.resultMessage.innerHTML = messageHtml;
  }

  populateCourierTable(couriers) {
    console.log("Populating courier table with data:", couriers);
    console.log("Courier data type:", typeof couriers);
    console.log("Courier data length:", couriers ? couriers.length : 0);

    if (!couriers || couriers.length === 0) {
      console.log("No courier data found, showing empty message");
      this.elements.courierTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">
            No courier data available
          </td>
        </tr>
      `;
      return;
    }

    const courierLogos = {
      steadfast: "images/steadfast.svg",
      pathao: "images/pathao.svg",
      redx: "images/redx.svg",
      "red-x": "images/redx.svg",
      "redx-courier": "images/redx.svg",
      paperfly: "images/paperfly.svg",
      "e-courier": "images/ecourier.svg",
      "delivery-tiger": "images/delivery-tiger.svg",
      sundarban: "images/sundarban.svg",
      "sa-paribahan": "images/sa-paribahan.svg",
    };

    // Sort couriers by total orders (descending) to show most active couriers first
    const sortedCouriers = couriers.sort((a, b) => {
      const totalA =
        (a.orders || 0) + (a.deliveries || 0) + (a.cancellations || 0);
      const totalB =
        (b.orders || 0) + (b.deliveries || 0) + (b.cancellations || 0);
      return totalB - totalA;
    });

    console.log("Sorted couriers:", sortedCouriers);

    const tableRows = sortedCouriers
      .map((courier, index) => {
        console.log(`Processing courier ${index + 1}:`, courier);

        const logoKey = courier.name.toLowerCase().replace(/\s+/g, "-");
        let logoPath = courierLogos[logoKey];

        // If no direct match, try partial matching
        if (!logoPath) {
          const normalizedName = courier.name.toLowerCase();
          console.log(
            `No direct match for ${courier.name}, trying partial matching...`
          );

          if (normalizedName.includes("red") && normalizedName.includes("x")) {
            logoPath = "images/redx.svg";
            console.log(`Found RedX match for: ${courier.name}`);
          } else if (normalizedName.includes("steadfast")) {
            logoPath = "images/steadfast.svg";
          } else if (normalizedName.includes("pathao")) {
            logoPath = "images/pathao.svg";
          } else if (normalizedName.includes("paperfly")) {
            logoPath = "images/paperfly.svg";
          } else if (
            normalizedName.includes("e-courier") ||
            normalizedName.includes("ecourier")
          ) {
            logoPath = "images/ecourier.svg";
          } else if (
            normalizedName.includes("delivery") &&
            normalizedName.includes("tiger")
          ) {
            logoPath = "images/delivery-tiger.svg";
          } else if (normalizedName.includes("sundarban")) {
            logoPath = "images/sundarban.svg";
          } else if (
            normalizedName.includes("sa") &&
            normalizedName.includes("paribahan")
          ) {
            logoPath = "images/sa-paribahan.svg";
          } else {
            logoPath = "images/default-courier.svg";
            console.log(
              `No match found for: ${courier.name}, using default logo`
            );
          }
        }

        console.log(
          `Courier: ${courier.name}, Logo Key: ${logoKey}, Logo Path: ${logoPath}`
        );

        const orders = courier.orders || 0;
        const deliveries = courier.deliveries || 0;
        const cancellations = courier.cancellations || 0;
        const deliveryRate =
          orders > 0 ? Math.round((deliveries / orders) * 100) : 0;

        return `
        <tr>
          <td>
            <img
              src="${logoPath}"
              alt="${courier.name}"
              class="courier-logo"
              onerror="this.src='images/default-courier.svg'"
            />
          </td>
          <td>${orders}</td>
          <td>${deliveries}</td>
          <td>${cancellations}</td>
          <td>${deliveryRate}%</td>
        </tr>
      `;
      })
      .join("");

    console.log("Final table HTML:", tableRows);
    this.elements.courierTableBody.innerHTML = tableRows;
  }

  showError(message) {
    this.hideAllStates();
    this.elements.errorState.classList.remove("hidden");
    this.elements.errorMessage.textContent = message;
    this.elements.checkButton.disabled = false;
  }

  hideAllStates() {
    this.elements.loadingState.classList.add("hidden");
    this.elements.resultSection.classList.add("hidden");
    this.elements.errorState.classList.add("hidden");
  }

  getErrorMessage(error) {
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError")
    ) {
      return "Network error. Please check your internet connection and try again.";
    } else if (error.message.includes("timeout")) {
      return "Request timed out. Please try again.";
    } else if (error.message.includes("HTTP 404")) {
      return "Phone number not found in our database.";
    } else if (error.message.includes("HTTP 429")) {
      return "Too many requests. Please wait a moment and try again.";
    } else if (error.message.includes("HTTP 500")) {
      return "Server error. Please try again later.";
    } else {
      return error.message || "An unexpected error occurred. Please try again.";
    }
  }

  openFullReport() {
    const phoneNumber = this.elements.resultPhone.textContent;
    const url = `https://flexsoftr.com?mobile=${encodeURIComponent(
      phoneNumber
    )}`;
    chrome.tabs.create({ url });
  }

  saveToHistory(phoneNumber, result) {
    chrome.storage.local.get(["searchHistory"], (data) => {
      const history = data.searchHistory || [];
      const newEntry = {
        phoneNumber,
        result,
        timestamp: new Date().toISOString(),
      };

      // Add to beginning of array
      history.unshift(newEntry);

      // Keep only last 50 searches
      if (history.length > 50) {
        history.splice(50);
      }

      chrome.storage.local.set({ searchHistory: history });
    });
  }

  loadStoredData() {
    console.log("Popup: Starting loadStoredData...");

    // Load last searched phone number if available
    chrome.storage.local.get(["lastSearched", "popupPhoneNumber"], (data) => {
      console.log("Popup: Loading stored data:", data);
      console.log("Popup: Elements available:", this.elements);

      if (data.popupPhoneNumber) {
        console.log("Popup: Found popupPhoneNumber:", data.popupPhoneNumber);
        // Use phone number from context menu
        if (this.elements.phoneInput) {
          this.elements.phoneInput.value = data.popupPhoneNumber;
          console.log(
            "Popup: Set phone input value to:",
            data.popupPhoneNumber
          );
          this.validatePhoneInput(data.popupPhoneNumber);
          // Clear the stored phone number
          chrome.storage.local.remove(["popupPhoneNumber"]);
          // Automatically check the phone number
          setTimeout(() => {
            console.log(
              "Popup: Auto-checking phone number:",
              data.popupPhoneNumber
            );
            this.checkPhoneNumber();
          }, 200);
        } else {
          console.error("Popup: phoneInput element not found!");
        }
      } else if (data.lastSearched) {
        console.log("Popup: Found lastSearched:", data.lastSearched);
        // Use last searched phone number
        if (this.elements.phoneInput) {
          this.elements.phoneInput.value = data.lastSearched;
          this.validatePhoneInput(data.lastSearched);
        }
      } else {
        console.log("Popup: No stored phone number found, starting polling...");
        // If no phone number found, try polling for a short time
        this.pollForPhoneNumber();
      }
    });
  }

  pollForPhoneNumber() {
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 100; // 100ms

    const poll = () => {
      attempts++;
      console.log(`Popup: Polling for phone number (attempt ${attempts})`);

      chrome.storage.local.get(["popupPhoneNumber"], (data) => {
        if (data.popupPhoneNumber) {
          console.log(
            "Popup: Found phone number during polling:",
            data.popupPhoneNumber
          );
          this.elements.phoneInput.value = data.popupPhoneNumber;
          this.validatePhoneInput(data.popupPhoneNumber);
          chrome.storage.local.remove(["popupPhoneNumber"]);
          setTimeout(() => {
            this.checkPhoneNumber();
          }, 100);
        } else if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          console.log("Popup: No phone number found after polling");
        }
      });
    };

    setTimeout(poll, pollInterval);
  }

  // Method to be called from content script
  checkSelectedPhone(phoneNumber) {
    console.log("Popup: checkSelectedPhone called with:", phoneNumber);
    if (this.elements.phoneInput) {
      this.elements.phoneInput.value = phoneNumber;
      this.validatePhoneInput(phoneNumber);
      this.checkPhoneNumber();
    } else {
      console.error("Popup: phoneInput not available in checkSelectedPhone");
    }
  }

  // Test method to manually set phone number
  testSetPhoneNumber(phoneNumber) {
    console.log("Popup: testSetPhoneNumber called with:", phoneNumber);
    if (this.elements.phoneInput) {
      this.elements.phoneInput.value = phoneNumber;
      this.validatePhoneInput(phoneNumber);
      console.log("Popup: Phone number set successfully");
    } else {
      console.error("Popup: phoneInput not available in testSetPhoneNumber");
    }
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    console.log("Popup: DOM loaded, initializing...");
    console.log("Popup: Document ready state:", document.readyState);
    console.log("Popup: Document body:", document.body);

    // Test if elements exist
    const testInput = document.getElementById("phoneInput");
    console.log("Popup: Test phoneInput found:", testInput);

    window.fakeOrderCheckerPopup = new FakeOrderCheckerPopup();
    console.log("Fake Order Checker popup initialized successfully");
  } catch (error) {
    console.error("Error initializing popup:", error);
  }
});

// Also initialize when window loads (fallback)
window.addEventListener("load", () => {
  if (!window.fakeOrderCheckerPopup) {
    try {
      console.log("Popup: Window loaded, initializing fallback...");
      window.fakeOrderCheckerPopup = new FakeOrderCheckerPopup();
    } catch (error) {
      console.error("Error initializing popup (fallback):", error);
    }
  }
});

// Immediate initialization test
console.log("Popup: Script loaded, document ready state:", document.readyState);
if (document.readyState === "loading") {
  console.log("Popup: Document still loading, waiting for DOMContentLoaded");
} else {
  console.log("Popup: Document already loaded, initializing immediately");
  try {
    window.fakeOrderCheckerPopup = new FakeOrderCheckerPopup();
  } catch (error) {
    console.error("Error in immediate initialization:", error);
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    console.log("Popup: Received message:", request);

    if (request.action === "checkPhone" && request.phoneNumber) {
      if (window.fakeOrderCheckerPopup) {
        console.log(
          "Popup: Processing checkPhone message for:",
          request.phoneNumber
        );
        window.fakeOrderCheckerPopup.checkSelectedPhone(request.phoneNumber);
      } else {
        console.warn(
          "Popup not initialized yet, storing phone number for later"
        );
        // Store the phone number for when popup initializes
        chrome.storage.local.set({
          popupPhoneNumber: request.phoneNumber,
          popupTimestamp: Date.now(),
        });
      }
      sendResponse({ success: true });
    }
  } catch (error) {
    console.error("Error handling message:", error);
    sendResponse({ success: false, error: error.message });
  }
  return true; // Keep message channel open
});

// Global test function
window.testPhoneNumber = function (phoneNumber) {
  console.log("Global test function called with:", phoneNumber);
  if (window.fakeOrderCheckerPopup) {
    window.fakeOrderCheckerPopup.testSetPhoneNumber(phoneNumber);
  } else {
    console.error("Popup not initialized yet");
  }
};

// Global test function to set phone and check
window.testPhoneAndCheck = function (phoneNumber) {
  console.log(
    "Global test function testPhoneAndCheck called with:",
    phoneNumber
  );
  if (window.fakeOrderCheckerPopup) {
    window.fakeOrderCheckerPopup.testSetPhoneNumber(phoneNumber);
    setTimeout(() => {
      window.fakeOrderCheckerPopup.checkPhoneNumber();
    }, 500);
  } else {
    console.error("Popup not initialized yet");
  }
};

// Global function to check storage
window.checkStorage = function () {
  chrome.storage.local.get(null, (data) => {
    console.log("All storage data:", data);
  });
};

// Global function to set storage
window.setStorage = function (phoneNumber) {
  chrome.storage.local.set(
    {
      popupPhoneNumber: phoneNumber,
      popupTimestamp: Date.now(),
    },
    () => {
      console.log("Storage set successfully for:", phoneNumber);
    }
  );
};
