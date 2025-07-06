// Content Script for Fake Order Checker Chrome Extension

class PhoneNumberDetector {
  constructor() {
    this.initialize();
  }

  initialize() {
    this.setupSelectionListener();
    this.setupContextMenu();
    this.setupPhoneNumberHighlighting();
  }

  setupSelectionListener() {
    document.addEventListener("mouseup", (e) => {
      this.handleTextSelection(e);
    });

    document.addEventListener("touchend", (e) => {
      this.handleTextSelection(e);
    });
  }

  handleTextSelection(event) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText && this.isPhoneNumber(selectedText)) {
      this.showQuickCheckButton(event, selectedText);
    } else {
      this.hideQuickCheckButton();
    }
  }

  isPhoneNumber(text) {
    // Bangladeshi phone number patterns
    const patterns = [
      /^(\+880|880)?1[3-9]\d{8}$/, // +8801XXXXXXXXX or 8801XXXXXXXXX or 01XXXXXXXXX
      /^01[3-9]\d{8}$/, // 01XXXXXXXXX
      /^1[3-9]\d{8}$/, // 1XXXXXXXXX
      /^\d{11}$/, // 11 digits (common format)
      /^\d{10}$/, // 10 digits (without country code)
    ];

    // Clean the text (remove spaces, dashes, dots)
    const cleaned = text.replace(/[\s\-\.\(\)]/g, "");

    console.log(
      "Content script: Checking phone number:",
      text,
      "Cleaned:",
      cleaned
    );
    const isValid = patterns.some((pattern) => pattern.test(cleaned));
    console.log("Content script: Phone number valid:", isValid);

    return isValid;
  }

  showQuickCheckButton(event, phoneNumber) {
    this.hideQuickCheckButton();

    const button = document.createElement("div");
    button.id = "fake-order-checker-quick-btn";
    button.innerHTML = `
            <div class="quick-check-button">
                <div class="quick-check-icon">🔍</div>
                <div class="quick-check-text">
                    <div>Check Fake Orders</div>
                    <div class="quick-check-phone">${phoneNumber}</div>
                </div>
            </div>
        `;

    // Position the button near the selection
    const rect = this.getSelectionRect();
    if (rect) {
      button.style.position = "fixed";
      button.style.left = `${rect.left}px`;
      button.style.top = `${rect.bottom + 10}px`;
      button.style.zIndex = "999999";
    } else {
      // Fallback positioning near mouse
      button.style.position = "fixed";
      button.style.left = `${event.clientX}px`;
      button.style.top = `${event.clientY + 20}px`;
      button.style.zIndex = "999999";
    }

    // Add click handler
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.checkPhoneNumber(phoneNumber);
      this.hideQuickCheckButton();
    });

    document.body.appendChild(button);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideQuickCheckButton();
    }, 5000);
  }

  hideQuickCheckButton() {
    const existingButton = document.getElementById(
      "fake-order-checker-quick-btn"
    );
    if (existingButton) {
      existingButton.remove();
    }
  }

  getSelectionRect() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      return rect;
    }
    return null;
  }

  setupContextMenu() {
    document.addEventListener("contextmenu", (e) => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText && this.isPhoneNumber(selectedText)) {
        // Store the selected phone number for context menu
        chrome.runtime.sendMessage({
          action: "setContextPhone",
          phoneNumber: selectedText,
        });
      }
    });
  }

  setupPhoneNumberHighlighting() {
    // Highlight phone numbers on page load
    this.highlightPhoneNumbers();

    // Watch for dynamic content changes
    const observer = new MutationObserver(() => {
      this.highlightPhoneNumbers();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  highlightPhoneNumbers() {
    // Find all text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    // Process each text node
    textNodes.forEach((textNode) => {
      if (
        textNode.parentNode &&
        !textNode.parentNode.classList.contains("fake-order-checker-highlight")
      ) {
        this.processTextNode(textNode);
      }
    });
  }

  processTextNode(textNode) {
    const text = textNode.textContent;
    const phoneRegex = /(\+880|880)?1[3-9]\d{8}|01[3-9]\d{8}/g;
    const matches = text.match(phoneRegex);

    if (matches) {
      const parent = textNode.parentNode;
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;

      matches.forEach((match) => {
        const matchIndex = text.indexOf(match, lastIndex);

        // Add text before match
        if (matchIndex > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.substring(lastIndex, matchIndex))
          );
        }

        // Create highlighted span for phone number
        const span = document.createElement("span");
        span.className = "fake-order-checker-highlight";
        span.textContent = match;
        span.style.cssText = `
                    background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
                    padding: 2px 4px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1px solid #e2e8f0;
                `;

        // Add hover effect
        span.addEventListener("mouseenter", () => {
          span.style.transform = "scale(1.05)";
          span.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
        });

        span.addEventListener("mouseleave", () => {
          span.style.transform = "scale(1)";
          span.style.boxShadow = "none";
        });

        // Add click handler
        span.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.checkPhoneNumber(match);
        });

        fragment.appendChild(span);
        lastIndex = matchIndex + match.length;
      });

      // Add remaining text
      if (lastIndex < text.length) {
        fragment.appendChild(
          document.createTextNode(text.substring(lastIndex))
        );
      }

      parent.replaceChild(fragment, textNode);
    }
  }

  async checkPhoneNumber(phoneNumber) {
    try {
      console.log("Content script: Checking phone number:", phoneNumber);

      // Store phone number for popup
      chrome.storage.local.set(
        {
          popupPhoneNumber: phoneNumber,
          popupTimestamp: Date.now(),
        },
        () => {
          console.log("Phone number stored in storage:", phoneNumber);
        }
      );

      // Send message to background script
      chrome.runtime.sendMessage(
        {
          action: "checkPhone",
          phoneNumber: phoneNumber,
        },
        (response) => {
          console.log("Background script response:", response);
        }
      );

      // Show success notification
      this.showNotification(`Checking ${phoneNumber}...`, "info");
    } catch (error) {
      console.error("Error checking phone number:", error);
      this.showNotification("Error checking phone number", "error");
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `fake-order-checker-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "error" ? "#ef4444" : "#10b981"};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .quick-check-button {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s ease;
        min-width: 200px;
    }

    .quick-check-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
    }

    .quick-check-icon {
        font-size: 18px;
    }

    .quick-check-text {
        display: flex;
        flex-direction: column;
    }

    .quick-check-phone {
        font-size: 12px;
        opacity: 0.9;
        font-weight: 400;
    }
`;
document.head.appendChild(style);

// Initialize the phone number detector
const phoneDetector = new PhoneNumberDetector();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlightPhone" && request.phoneNumber) {
    phoneDetector.highlightSpecificPhone(request.phoneNumber);
    sendResponse({ success: true });
  }
});
