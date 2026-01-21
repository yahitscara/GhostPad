const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * electron-builder afterPack hook
 * Cleans up Info.plist by removing unused privacy descriptors
 * that Electron adds by default but GhostPad doesn't use.
 */
exports.default = async function(context) {
  console.log('[afterPack] Hook started');
  console.log('[afterPack] Platform:', context.electronPlatformName);

  // Only process macOS builds (darwin for regular, mas for Mac App Store)
  if (context.electronPlatformName !== 'darwin' && context.electronPlatformName !== 'mas') {
    console.log('[afterPack] Skipping non-macOS build');
    return;
  }

  const appPath = context.appOutDir;
  const appName = context.packager.appInfo.productFilename;
  const infoPlistPath = path.join(appPath, `${appName}.app`, 'Contents', 'Info.plist');

  console.log('[afterPack] Info.plist path:', infoPlistPath);

  if (!fs.existsSync(infoPlistPath)) {
    console.log('[afterPack] Info.plist not found, skipping');
    return;
  }

  console.log('[afterPack] Cleaning up Info.plist...');

  // Keys to remove - GhostPad doesn't use camera, microphone, or Bluetooth
  const keysToRemove = [
    'NSCameraUsageDescription',
    'NSMicrophoneUsageDescription',
    'NSBluetoothAlwaysUsageDescription',
    'NSBluetoothPeripheralUsageDescription'
  ];

  // Use plutil to remove keys (more reliable than regex)
  for (const key of keysToRemove) {
    try {
      execSync(`plutil -remove "${key}" "${infoPlistPath}" 2>/dev/null`, { encoding: 'utf8' });
      console.log(`[afterPack]   Removed: ${key}`);
    } catch (e) {
      // Key might not exist, that's OK
      console.log(`[afterPack]   Key not found: ${key}`);
    }
  }

  // Fix NSAppTransportSecurity - set it to a proper restrictive value
  // First remove the existing key, then add our custom one
  try {
    execSync(`plutil -remove "NSAppTransportSecurity" "${infoPlistPath}" 2>/dev/null`, { encoding: 'utf8' });
    console.log('[afterPack]   Removed existing NSAppTransportSecurity');
  } catch (e) {
    // Key might not exist
  }

  // Add proper ATS configuration (restrictive, only allowing api.github.com)
  // Using plutil to insert a dict
  try {
    execSync(`plutil -insert "NSAppTransportSecurity" -json '{"NSAllowsArbitraryLoads":false,"NSExceptionDomains":{"api.github.com":{"NSIncludesSubdomains":true,"NSExceptionAllowsInsecureHTTPLoads":false,"NSExceptionRequiresForwardSecrecy":true}}}' "${infoPlistPath}"`, { encoding: 'utf8' });
    console.log('[afterPack]   Added restrictive NSAppTransportSecurity');
  } catch (e) {
    console.log('[afterPack]   Warning: Could not add NSAppTransportSecurity:', e.message);
  }

  console.log('[afterPack] Info.plist cleanup complete');
};
