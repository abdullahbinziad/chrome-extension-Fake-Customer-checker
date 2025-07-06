// Debug script to test service worker functionality

console.log("Debug script loaded");

// Test if service worker is accessible
function testServiceWorker() {
  console.log("Testing service worker...");

  // Test message passing
  chrome.runtime.sendMessage({ action: "test" }, (response) => {
    console.log("Service worker response:", response);
  });

  // Test storage
  chrome.storage.local.set({ test: "Hello from debug script" }, () => {
    console.log("Test data stored");
    chrome.storage.local.get(["test"], (result) => {
      console.log("Test data retrieved:", result);
    });
  });
}

// Run test when script loads
testServiceWorker();

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Debug script received message:", request);
  sendResponse({ debug: "Message received" });
});
