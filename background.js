// Background Service Worker for Fake Order Checker Chrome Extension

console.log("Background service worker starting...");

// Global variables
let contextPhoneNumber = null;

// Initialize context menus
function setupContextMenus() {
  try {
    // Remove existing menus first
    chrome.contextMenus.removeAll(() => {
      // Create main context menu
      chrome.contextMenus.create({
        id: "checkPhoneNumber",
        title: "🔍 Check with Fake Order Checker",
        contexts: ["selection"],
        documentUrlPatterns: ["<all_urls>"],
      });

      // Create submenu
      chrome.contextMenus.create({
        id: "fakeOrderCheckerSubmenu",
        title: "Fake Order Checker",
        contexts: ["selection"],
      });

      chrome.contextMenus.create({
        id: "checkAndOpen",
        parentId: "fakeOrderCheckerSubmenu",
        title: "Check & Open Full Report",
        contexts: ["selection"],
      });

      chrome.contextMenus.create({
        id: "copyToClipboard",
        parentId: "fakeOrderCheckerSubmenu",
        title: "Copy Phone Number",
        contexts: ["selection"],
      });
    });
  } catch (error) {
    console.error("Error setting up context menus:", error);
  }
}

// Phone number validation
function isPhoneNumber(text) {
  if (!text || typeof text !== "string") return false;

  const patterns = [
    /^(\+880|880)?1[3-9]\d{8}$/, // +8801XXXXXXXXX or 8801XXXXXXXXX or 01XXXXXXXXX
    /^01[3-9]\d{8}$/, // 01XXXXXXXXX
    /^1[3-9]\d{8}$/, // 1XXXXXXXXX
    /^\d{11}$/, // 11 digits (common format)
    /^\d{10}$/, // 10 digits (without country code)
  ];

  const cleaned = text.replace(/[\s\-\.\(\)]/g, "");
  console.log("Background: Checking phone number:", text, "Cleaned:", cleaned);
  const isValid = patterns.some((pattern) => pattern.test(cleaned));
  console.log("Background: Phone number valid:", isValid);

  return isValid;
}

// Handle context menu clicks
function handleContextMenuClick(info, tab) {
  const selectedText = info.selectionText.trim();

  if (!isPhoneNumber(selectedText)) {
    console.log("Invalid phone number selected:", selectedText);
    return;
  }

  switch (info.menuItemId) {
    case "checkPhoneNumber":
      checkPhoneNumber(selectedText, tab);
      break;
    case "checkAndOpen":
      checkAndOpenFullReport(selectedText, tab);
      break;
    case "copyToClipboard":
      copyToClipboard(selectedText, tab);
      break;
  }
}

// Format phone number for API
function formatPhoneNumber(phone) {
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

// Check phone number
function checkPhoneNumber(phoneNumber, tab) {
  try {
    console.log("Background: Checking phone number:", phoneNumber);

    // Format the phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log("Background: Formatted phone number:", formattedPhone);

    // Store phone number for popup first
    chrome.storage.local.set(
      {
        popupPhoneNumber: phoneNumber,
        popupTimestamp: Date.now(),
      },
      () => {
        console.log(
          "Background: Phone number stored successfully:",
          phoneNumber
        );

        // Open popup after storing the phone number
        chrome.action.openPopup();
      }
    );
  } catch (error) {
    console.error("Error checking phone number:", error);
  }
}

// Open full report
function checkAndOpenFullReport(phoneNumber, tab) {
  try {
    if (!isPhoneNumber(phoneNumber)) {
      console.log("Invalid phone number format");
      return;
    }

    const url = `https://fake-order-checker.flexsoftr.com?mobile=${encodeURIComponent(
      phoneNumber
    )}`;
    chrome.tabs.create({ url });
  } catch (error) {
    console.error("Error opening full report:", error);
  }
}

// Copy to clipboard
function copyToClipboard(phoneNumber, tab) {
  try {
    // Send message to content script to copy
    chrome.tabs.sendMessage(tab.id, {
      action: "copyToClipboard",
      text: phoneNumber,
    });
  } catch (error) {
    console.error("Error copying to clipboard:", error);
  }
}

// Handle messages from popup and content scripts
function handleMessage(request, sender, sendResponse) {
  try {
    switch (request.action) {
      case "setContextPhone":
        contextPhoneNumber = request.phoneNumber;
        sendResponse({ success: true });
        break;

      case "checkPhone":
        checkPhoneNumber(request.phoneNumber, sender.tab);
        sendResponse({ success: true });
        break;

      case "getContextPhone":
        sendResponse({ phoneNumber: contextPhoneNumber });
        break;

      case "clearContextPhone":
        contextPhoneNumber = null;
        sendResponse({ success: true });
        break;

      case "test":
        sendResponse({ success: true, message: "Service worker is working!" });
        break;

      default:
        sendResponse({ success: false, error: "Unknown action" });
    }
  } catch (error) {
    console.error("Error handling message:", error);
    sendResponse({ success: false, error: error.message });
  }
  return true; // Keep message channel open
}

// Setup installation handler
function setupInstallationHandler() {
  chrome.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed/updated:", details.reason);

    if (details.reason === "install") {
      // Set default settings
      chrome.storage.local.set({
        settings: {
          autoHighlight: true,
          showNotifications: true,
          quickCheckEnabled: true,
          theme: "light",
          language: "bn",
        },
        searchHistory: [],
        lastSearched: null,
      });
    }
  });
}

// Event listeners
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);
chrome.runtime.onMessage.addListener(handleMessage);

// Initialize
setupContextMenus();
setupInstallationHandler();

console.log("Background service worker initialized successfully");
