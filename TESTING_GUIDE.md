# Chrome Extension Testing Guide

## ✅ **Issues Fixed:**

1. **Service worker registration failed** - Fixed syntax error in background.js
2. **Missing icon files** - Added all required icon sizes
3. **Missing images** - Created images directory with placeholder logo
4. **API URL** - Updated to use local development server
5. **Error handling** - Improved error handling in popup.js

## 🚀 **How to Test the Extension:**

### **Step 1: Start the Development Server**

```bash
cd ..  # Go to project root
npm run dev
```

The server should start on `http://localhost:3000`

### **Step 2: Load the Extension in Chrome**

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension should load without errors

### **Step 3: Test the Extension**

#### **Method 1: Right-click on Phone Numbers**

1. Go to any website with phone numbers
2. Select a phone number
3. Right-click and choose "🔍 Check with Fake Order Checker"
4. The extension should open and check the number

#### **Method 2: Use Extension Popup**

1. Click the extension icon in Chrome toolbar
2. Enter a phone number manually
3. Click "Check" button

### **Step 4: Test Different Phone Numbers**

#### **Demo Data Rules:**

- **Ending in 0-3**: Good customer (93% success rate)
- **Ending in 4-6**: Medium risk (58% success rate)
- **Ending in 7-9**: High risk (25% success rate)

#### **Test Numbers:**

- `01712345670` - Good customer
- `01712345674` - Medium risk
- `01712345677` - High risk

## 🔧 **Troubleshooting:**

### **If Extension Won't Load:**

1. Check Chrome console for errors
2. Make sure all files are present in chrome-extension folder
3. Try reloading the extension

### **If API Calls Fail:**

1. Make sure development server is running on port 3000
2. Check browser console for network errors
3. Verify the API endpoint is accessible

### **If Popup Doesn't Work:**

1. Check popup console (right-click popup → Inspect)
2. Look for JavaScript errors
3. Verify all DOM elements are found

## 📱 **Expected Behavior:**

### **Good Customer (0-3):**

- Green success ratio
- "ভালো কাস্টমার!" message
- High delivery rate

### **Medium Risk (4-6):**

- Orange success ratio
- "ব্যবহার ও আচরণের উপর নির্ভর করে" message
- Medium delivery rate

### **High Risk (7-9):**

- Red success ratio
- "সাবধান!" message
- Low delivery rate

## 🎯 **Success Indicators:**

- ✅ Extension loads without errors
- ✅ Popup opens and displays correctly
- ✅ Phone number validation works
- ✅ API calls return demo data
- ✅ Results display with animations
- ✅ Right-click context menu works

The extension should now work perfectly! 🎉
