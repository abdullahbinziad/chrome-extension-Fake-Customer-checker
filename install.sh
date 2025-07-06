#!/bin/bash

# Fake Order Checker Chrome Extension Installation Script
# This script helps users install the Chrome extension

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Extension details
EXTENSION_NAME="Fake Order Checker"
EXTENSION_VERSION="1.0.0"
EXTENSION_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Fake Order Checker Extension  ${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Version: ${EXTENSION_VERSION}${NC}"
echo -e "${GREEN}Directory: ${EXTENSION_DIR}${NC}"
echo ""

# Function to check if Chrome is installed
check_chrome() {
    echo -e "${YELLOW}Checking Chrome installation...${NC}"
    
    if command -v google-chrome &> /dev/null; then
        CHROME_PATH="google-chrome"
        echo -e "${GREEN}✓ Chrome found: google-chrome${NC}"
    elif command -v google-chrome-stable &> /dev/null; then
        CHROME_PATH="google-chrome-stable"
        echo -e "${GREEN}✓ Chrome found: google-chrome-stable${NC}"
    elif command -v chromium-browser &> /dev/null; then
        CHROME_PATH="chromium-browser"
        echo -e "${GREEN}✓ Chromium found: chromium-browser${NC}"
    else
        echo -e "${RED}✗ Chrome/Chromium not found${NC}"
        echo -e "${YELLOW}Please install Chrome or Chromium first${NC}"
        exit 1
    fi
}

# Function to validate extension files
validate_files() {
    echo -e "${YELLOW}Validating extension files...${NC}"
    
    required_files=(
        "manifest.json"
        "popup.html"
        "popup.css"
        "popup.js"
        "content.js"
        "content.css"
        "background.js"
    )
    
    missing_files=()
    
    for file in "${required_files[@]}"; do
        if [[ -f "$EXTENSION_DIR/$file" ]]; then
            echo -e "${GREEN}✓ $file${NC}"
        else
            echo -e "${RED}✗ $file (missing)${NC}"
            missing_files+=("$file")
        fi
    done
    
    # Check icons directory
    if [[ -d "$EXTENSION_DIR/icons" ]]; then
        echo -e "${GREEN}✓ icons directory${NC}"
    else
        echo -e "${RED}✗ icons directory (missing)${NC}"
        missing_files+=("icons")
    fi
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        echo -e "${RED}Missing required files: ${missing_files[*]}${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All required files found${NC}"
}

# Function to validate manifest.json
validate_manifest() {
    echo -e "${YELLOW}Validating manifest.json...${NC}"
    
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}Warning: jq not found, skipping manifest validation${NC}"
        return
    fi
    
    if jq empty "$EXTENSION_DIR/manifest.json" 2>/dev/null; then
        echo -e "${GREEN}✓ manifest.json is valid JSON${NC}"
        
        # Check required fields
        if jq -e '.manifest_version' "$EXTENSION_DIR/manifest.json" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ manifest_version found${NC}"
        else
            echo -e "${RED}✗ manifest_version missing${NC}"
        fi
        
        if jq -e '.name' "$EXTENSION_DIR/manifest.json" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ name found${NC}"
        else
            echo -e "${RED}✗ name missing${NC}"
        fi
        
        if jq -e '.version' "$EXTENSION_DIR/manifest.json" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ version found${NC}"
        else
            echo -e "${RED}✗ version missing${NC}"
        fi
        
    else
        echo -e "${RED}✗ manifest.json is not valid JSON${NC}"
        exit 1
    fi
}

# Function to open Chrome extensions page
open_extensions_page() {
    echo -e "${YELLOW}Opening Chrome extensions page...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open -a "Google Chrome" "chrome://extensions/"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        $CHROME_PATH "chrome://extensions/" &
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows (Git Bash)
        echo -e "${YELLOW}Please manually open Chrome and go to: chrome://extensions/${NC}"
    else
        echo -e "${YELLOW}Please manually open Chrome and go to: chrome://extensions/${NC}"
    fi
}

# Function to show installation instructions
show_instructions() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Installation Instructions     ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    echo -e "${GREEN}1. Enable Developer Mode${NC}"
    echo -e "   • Toggle 'Developer mode' in the top right corner"
    echo ""
    echo -e "${GREEN}2. Load the Extension${NC}"
    echo -e "   • Click 'Load unpacked'"
    echo -e "   • Select this directory: ${YELLOW}$EXTENSION_DIR${NC}"
    echo ""
    echo -e "${GREEN}3. Pin the Extension${NC}"
    echo -e "   • Click the puzzle piece icon in Chrome toolbar"
    echo -e "   • Find '${EXTENSION_NAME}' and click the pin icon"
    echo ""
    echo -e "${GREEN}4. Test the Extension${NC}"
    echo -e "   • Go to any website with phone numbers"
    echo -e "   • Select a phone number and right-click"
    echo -e "   • Choose 'Check with Fake Order Checker'"
    echo ""
}

# Function to create desktop shortcut (Linux)
create_desktop_shortcut() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "${YELLOW}Creating desktop shortcut...${NC}"
        
        DESKTOP_DIR="$HOME/Desktop"
        if [[ ! -d "$DESKTOP_DIR" ]]; then
            DESKTOP_DIR="$HOME/Desktop"
        fi
        
        SHORTCUT_FILE="$DESKTOP_DIR/Fake Order Checker.desktop"
        
        cat > "$SHORTCUT_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Fake Order Checker
Comment=Chrome extension for checking fake orders
Exec=$CHROME_PATH chrome://extensions/
Icon=google-chrome
Terminal=false
Categories=Network;WebBrowser;
EOF
        
        chmod +x "$SHORTCUT_FILE"
        echo -e "${GREEN}✓ Desktop shortcut created${NC}"
    fi
}

# Function to show usage tips
show_usage_tips() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Usage Tips                    ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    echo -e "${GREEN}• Select any phone number on any website${NC}"
    echo -e "${GREEN}• Right-click and choose 'Check with Fake Order Checker'${NC}"
    echo -e "${GREEN}• Or click the extension icon for manual input${NC}"
    echo -e "${GREEN}• Phone numbers are automatically highlighted on web pages${NC}"
    echo -e "${GREEN}• Results show order statistics and success ratios${NC}"
    echo ""
    echo -e "${YELLOW}Supported phone formats:${NC}"
    echo -e "• +8801XXXXXXXXX"
    echo -e "• 8801XXXXXXXXX"
    echo -e "• 01XXXXXXXXX"
    echo -e "• 1XXXXXXXXX"
    echo ""
}

# Function to show troubleshooting
show_troubleshooting() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Troubleshooting               ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    echo -e "${YELLOW}If the extension doesn't work:${NC}"
    echo -e "1. Refresh the webpage you're testing on"
    echo -e "2. Check that the extension is enabled"
    echo -e "3. Verify internet connection"
    echo -e "4. Try disabling other extensions"
    echo -e "5. Restart Chrome browser"
    echo ""
    echo -e "${YELLOW}For support:${NC}"
    echo -e "• Email: support@flexsoftr.com"
    echo -e "• Website: https://flexsoftr.com"
    echo -e "• Documentation: See README.md"
    echo ""
}

# Main installation process
main() {
    echo -e "${GREEN}Starting installation process...${NC}"
    echo ""
    
    # Check if we're in the right directory
    if [[ ! -f "$EXTENSION_DIR/manifest.json" ]]; then
        echo -e "${RED}Error: manifest.json not found in current directory${NC}"
        echo -e "${YELLOW}Please run this script from the extension directory${NC}"
        exit 1
    fi
    
    # Run validation checks
    check_chrome
    validate_files
    validate_manifest
    
    echo ""
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    
    # Ask user if they want to open Chrome
    read -p "Do you want to open Chrome extensions page now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open_extensions_page
    fi
    
    # Show instructions
    show_instructions
    
    # Create desktop shortcut on Linux
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        read -p "Create desktop shortcut? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            create_desktop_shortcut
        fi
    fi
    
    # Show usage tips and troubleshooting
    show_usage_tips
    show_troubleshooting
    
    echo -e "${GREEN}Installation script completed!${NC}"
    echo -e "${BLUE}Follow the instructions above to complete the installation.${NC}"
}

# Run main function
main "$@" 