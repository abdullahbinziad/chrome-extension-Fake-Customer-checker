# Service Worker Troubleshooting Guide

## 🔧 **Current Issue: Service Worker (Inactive)**

The service worker is showing as "Inactive" which means it's not running properly.

## ✅ **What I Fixed:**

1. **Simplified Background Script**: Removed complex class structure that was causing initialization issues
2. **Added Error Handling**: Better error handling throughout the service worker
3. **Fixed Event Listeners**: Proper event listener setup
4. **Added Debug Script**: To test if service worker is working

## 🚀 **How to Test the Fix:**

### **Step 1: Reload the Extension**

1. Go to `chrome://extensions/`
2. Find "Fake Order Checker"
3. Click the **🔄 Reload** button
4. Check if service worker shows as "Active"

### **Step 2: Check Service Worker Status**

1. Click **"Inspect views"** next to the extension
2. Look for "service worker" in the dropdown
3. Click on it to open DevTools
4. Check the console for these messages:
   - ✅ "Background service worker starting..."
   - ✅ "Background service worker initialized successfully"

### **Step 3: Test the Popup**

1. Click the extension icon
2. Open DevTools for the popup (right-click popup → Inspect)
3. Check console for:
   - ✅ "Debug script loaded"
   - ✅ "Testing service worker..."
   - ✅ "Service worker response: {success: true, message: 'Service worker is working!'}"

## 🔍 **If Service Worker is Still Inactive:**

### **Check 1: Manifest Permissions**

Make sure `manifest.json` has these permissions:

```json
"permissions": ["activeTab", "contextMenus", "storage"]
```

### **Check 2: Background Script Path**

Make sure `manifest.json` has:

```json
"background": {
  "service_worker": "background.js"
}
```

### **Check 3: File Structure**

Ensure these files exist:

- ✅ `background.js`
- ✅ `popup.html`
- ✅ `popup.js`
- ✅ `debug.js`
- ✅ `icons/icon16.png`
- ✅ `icons/icon32.png`
- ✅ `icons/icon48.png`
- ✅ `icons/icon128.png`

### **Check 4: Syntax Errors**

1. Open service worker DevTools
2. Look for red error messages
3. Check if there are any JavaScript syntax errors

## 🎯 **Expected Behavior After Fix:**

### **Service Worker Console:**

```
Background service worker starting...
Background service worker initialized successfully
```

### **Popup Console:**

```
Debug script loaded
Testing service worker...
Service worker response: {success: true, message: "Service worker is working!"}
Test data stored
Test data retrieved: {test: "Hello from debug script"}
```

### **Extension Status:**

- ✅ Service Worker: **Active**
- ✅ Context Menus: Working
- ✅ Popup: Opens correctly
- ✅ API Calls: Work with demo data

## 🚨 **If Still Not Working:**

1. **Clear Extension Data:**

   - Go to `chrome://extensions/`
   - Click "Details" on Fake Order Checker
   - Click "Clear data"

2. **Remove and Reinstall:**

   - Remove the extension
   - Load it again as "unpacked"

3. **Check Chrome Version:**

   - Make sure you're using Chrome 88+ (for Manifest V3)

4. **Disable Other Extensions:**
   - Temporarily disable other extensions
   - Test if conflicts exist

The simplified background script should resolve the service worker issues! 🎉
