#!/bin/bash
# GhostPad Pre-Submission Verification Script
# Run this before every App Store submission to catch issues early

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

APP_PATH="dist/mas-universal/GhostPad.app"
PKG_PATH="dist/mas-universal/GhostPad-MAS.pkg"
TEAM_ID="C34F9R9P79"
BUNDLE_ID="com.ghostpad.app"

ERRORS=0
WARNINGS=0

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  GhostPad Pre-Submission Verification${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if build exists
if [ ! -d "$APP_PATH" ]; then
    echo -e "${RED}ERROR: Build not found at $APP_PATH${NC}"
    echo "Run: npm run build:mas"
    exit 1
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo -e "Checking build version: ${BLUE}$VERSION${NC}"
echo ""

# ============================================
# 1. Code Signing Verification
# ============================================
echo -e "${BLUE}1. Verifying Code Signatures...${NC}"
echo "   --------------------------------"

# Main app signature
if codesign --verify --deep --strict "$APP_PATH" 2>&1; then
    echo -e "   ${GREEN}✓${NC} Main app signature valid"
else
    echo -e "   ${RED}✗${NC} Main app signature INVALID"
    ERRORS=$((ERRORS + 1))
fi

# Verify Team ID
MAIN_TEAM=$(codesign -dvvv "$APP_PATH" 2>&1 | grep "TeamIdentifier=" | cut -d= -f2)
if [ "$MAIN_TEAM" = "$TEAM_ID" ]; then
    echo -e "   ${GREEN}✓${NC} Main app Team ID correct ($TEAM_ID)"
else
    echo -e "   ${RED}✗${NC} Main app Team ID mismatch: $MAIN_TEAM"
    ERRORS=$((ERRORS + 1))
fi

# Helper signatures
for helper in "GhostPad Helper.app" "GhostPad Helper (GPU).app" "GhostPad Helper (Renderer).app" "GhostPad Helper (Plugin).app"; do
    HELPER_PATH="$APP_PATH/Contents/Frameworks/$helper"
    if [ -d "$HELPER_PATH" ]; then
        TEAM=$(codesign -dvvv "$HELPER_PATH" 2>&1 | grep "TeamIdentifier=" | cut -d= -f2)
        if [ "$TEAM" = "$TEAM_ID" ]; then
            echo -e "   ${GREEN}✓${NC} $helper signed correctly"
        else
            echo -e "   ${RED}✗${NC} $helper has wrong Team ID: $TEAM"
            ERRORS=$((ERRORS + 1))
        fi
    fi
done
echo ""

# ============================================
# 2. Entitlements Verification
# ============================================
echo -e "${BLUE}2. Verifying Entitlements...${NC}"
echo "   --------------------------"

# Check Renderer Helper has inherit entitlement (CRITICAL)
RENDERER_ENT=$(codesign -d --entitlements - "$APP_PATH/Contents/Frameworks/GhostPad Helper (Renderer).app" 2>&1)

# Parse entitlements more carefully - look for the key followed by Bool true
if echo "$RENDERER_ENT" | grep -A2 "com.apple.security.inherit" | grep -q "\[Bool\] true"; then
    echo -e "   ${GREEN}✓${NC} Renderer Helper has inherit entitlement (CRITICAL)"
elif echo "$RENDERER_ENT" | grep -q "com.apple.security.inherit.*true"; then
    echo -e "   ${GREEN}✓${NC} Renderer Helper has inherit entitlement (CRITICAL)"
else
    echo -e "   ${RED}✗${NC} Renderer Helper MISSING inherit entitlement (CRITICAL)"
    echo -e "      ${RED}This causes 'differs from previously opened versions' warning!${NC}"
    ERRORS=$((ERRORS + 1))
fi

if echo "$RENDERER_ENT" | grep -q "com.apple.security.cs.allow-jit"; then
    echo -e "   ${GREEN}✓${NC} Renderer Helper has JIT entitlement"
else
    echo -e "   ${RED}✗${NC} Renderer Helper MISSING JIT entitlement"
    ERRORS=$((ERRORS + 1))
fi

if echo "$RENDERER_ENT" | grep -q "com.apple.security.cs.allow-unsigned-executable-memory"; then
    echo -e "   ${GREEN}✓${NC} Renderer Helper has unsigned executable memory entitlement"
else
    echo -e "   ${RED}✗${NC} Renderer Helper MISSING unsigned executable memory entitlement"
    ERRORS=$((ERRORS + 1))
fi

# Check main app has sandbox
MAIN_ENT=$(codesign -d --entitlements - "$APP_PATH" 2>&1)
if echo "$MAIN_ENT" | grep -q "com.apple.security.app-sandbox"; then
    echo -e "   ${GREEN}✓${NC} Main app has sandbox enabled"
else
    echo -e "   ${RED}✗${NC} Main app MISSING sandbox entitlement"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ============================================
# 3. Info.plist Verification
# ============================================
echo -e "${BLUE}3. Verifying Info.plist...${NC}"
echo "   ------------------------"

INFO_PLIST="$APP_PATH/Contents/Info.plist"

# Check for NSAllowsArbitraryLoads
ATS_LOADS=$(plutil -extract NSAppTransportSecurity.NSAllowsArbitraryLoads raw "$INFO_PLIST" 2>/dev/null || echo "not_set")
if [ "$ATS_LOADS" = "true" ]; then
    echo -e "   ${YELLOW}⚠${NC} NSAllowsArbitraryLoads is true (should be false or use exceptions)"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "   ${GREEN}✓${NC} NSAllowsArbitraryLoads is properly configured"
fi

# Check for unused privacy descriptors
for key in NSCameraUsageDescription NSMicrophoneUsageDescription NSBluetoothAlwaysUsageDescription NSBluetoothPeripheralUsageDescription; do
    if plutil -extract "$key" raw "$INFO_PLIST" 2>/dev/null >/dev/null; then
        echo -e "   ${YELLOW}⚠${NC} Unused privacy key present: $key"
        WARNINGS=$((WARNINGS + 1))
    fi
done

# Check ElectronTeamID
ELECTRON_TEAM=$(plutil -extract ElectronTeamID raw "$INFO_PLIST" 2>/dev/null || echo "")
if [ "$ELECTRON_TEAM" = "$TEAM_ID" ]; then
    echo -e "   ${GREEN}✓${NC} ElectronTeamID is correct"
else
    echo -e "   ${RED}✗${NC} ElectronTeamID mismatch or missing (got: $ELECTRON_TEAM)"
    ERRORS=$((ERRORS + 1))
fi

# Check version matches package.json
PLIST_VERSION=$(plutil -extract CFBundleShortVersionString raw "$INFO_PLIST" 2>/dev/null || echo "")
if [ "$PLIST_VERSION" = "$VERSION" ]; then
    echo -e "   ${GREEN}✓${NC} Version matches package.json ($VERSION)"
else
    echo -e "   ${RED}✗${NC} Version mismatch: plist=$PLIST_VERSION, package.json=$VERSION"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ============================================
# 4. PKG Verification
# ============================================
echo -e "${BLUE}4. Verifying PKG Installer...${NC}"
echo "   ---------------------------"

if [ -f "$PKG_PATH" ]; then
    PKG_SIG=$(pkgutil --check-signature "$PKG_PATH" 2>&1)
    if echo "$PKG_SIG" | grep -q "signed by a"; then
        echo -e "   ${GREEN}✓${NC} PKG is properly signed"
    else
        echo -e "   ${RED}✗${NC} PKG signature invalid"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "   ${RED}✗${NC} PKG not found at $PKG_PATH"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ============================================
# 5. Embedded Resources
# ============================================
echo -e "${BLUE}5. Checking Embedded Resources...${NC}"
echo "   -------------------------------"

# Check provisioning profile
if [ -f "$APP_PATH/Contents/embedded.provisionprofile" ]; then
    echo -e "   ${GREEN}✓${NC} Provisioning profile embedded"
else
    echo -e "   ${RED}✗${NC} Provisioning profile NOT embedded"
    ERRORS=$((ERRORS + 1))
fi

# Check icon
if [ -f "$APP_PATH/Contents/Resources/icon.icns" ]; then
    echo -e "   ${GREEN}✓${NC} App icon present"
else
    echo -e "   ${YELLOW}⚠${NC} App icon missing"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# ============================================
# Summary
# ============================================
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  SUMMARY${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "  Errors:   ${RED}$ERRORS${NC}"
echo -e "  Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}FAIL: Fix $ERRORS error(s) before submitting to App Store${NC}"
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}PASS WITH WARNINGS: Review $WARNINGS warning(s) before submitting${NC}"
    echo ""
    exit 0
else
    echo -e "${GREEN}PASS: Build is ready for App Store submission!${NC}"
    echo ""
    exit 0
fi
