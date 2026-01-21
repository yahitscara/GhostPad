const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const APP_PATH = path.join(__dirname, '../../dist/mas-universal/GhostPad.app');

/**
 * Extract entitlements from a signed app as a parsed object
 */
function getEntitlements(appPath) {
  try {
    const result = execSync(`codesign -d --entitlements - "${appPath}" 2>&1`, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024
    });

    // The output contains both stderr (info) and the XML plist
    // Extract just the XML portion
    const xmlMatch = result.match(/<\?xml[\s\S]*<\/plist>/);
    if (!xmlMatch) {
      return null;
    }

    // Simple plist parsing for boolean values
    const xml = xmlMatch[0];
    const entitlements = {};

    // Match <key>name</key> followed by <true/> or <false/> or <string>value</string>
    const keyPattern = /<key>([^<]+)<\/key>\s*(?:<(true|false)\/>|<string>([^<]*)<\/string>|<array>([\s\S]*?)<\/array>)/g;
    let match;

    while ((match = keyPattern.exec(xml)) !== null) {
      const key = match[1];
      if (match[2] === 'true') {
        entitlements[key] = true;
      } else if (match[2] === 'false') {
        entitlements[key] = false;
      } else if (match[3]) {
        entitlements[key] = match[3];
      } else if (match[4]) {
        entitlements[key] = match[4]; // array content as string
      }
    }

    return entitlements;
  } catch (error) {
    return null;
  }
}

describe('Entitlements Verification', function() {
  this.timeout(30000);

  before(function() {
    if (!fs.existsSync(APP_PATH)) {
      this.skip();
    }
  });

  describe('Main App Entitlements', function() {
    let entitlements;

    before(function() {
      entitlements = getEntitlements(APP_PATH);
      if (!entitlements) {
        this.skip();
      }
    });

    it('should have app-sandbox enabled', function() {
      assert.strictEqual(
        entitlements['com.apple.security.app-sandbox'],
        true,
        'App sandbox must be enabled for Mac App Store'
      );
    });

    it('should have files.user-selected.read-write', function() {
      assert.strictEqual(
        entitlements['com.apple.security.files.user-selected.read-write'],
        true,
        'App needs user-selected file access'
      );
    });

    it('should have network.client', function() {
      assert.strictEqual(
        entitlements['com.apple.security.network.client'],
        true,
        'App needs network client access for update checking'
      );
    });

    it('should NOT have com.apple.security.inherit', function() {
      assert.strictEqual(
        entitlements['com.apple.security.inherit'],
        undefined,
        'Main app should NOT have inherit entitlement (only helpers need it)'
      );
    });
  });

  describe('Renderer Helper Entitlements', function() {
    let entitlements;
    const helperPath = path.join(APP_PATH, 'Contents/Frameworks/GhostPad Helper (Renderer).app');

    before(function() {
      if (!fs.existsSync(helperPath)) {
        this.skip();
      }
      entitlements = getEntitlements(helperPath);
      if (!entitlements) {
        this.skip();
      }
    });

    it('should have app-sandbox enabled', function() {
      assert.strictEqual(
        entitlements['com.apple.security.app-sandbox'],
        true,
        'Helper must have sandbox enabled'
      );
    });

    it('should have inherit entitlement (CRITICAL)', function() {
      assert.strictEqual(
        entitlements['com.apple.security.inherit'],
        true,
        'CRITICAL: Helper MUST inherit parent sandbox to avoid "differs from previously opened versions" warning'
      );
    });

    it('should have allow-jit for V8 engine', function() {
      assert.strictEqual(
        entitlements['com.apple.security.cs.allow-jit'],
        true,
        'V8 JavaScript engine requires JIT compilation'
      );
    });

    it('should have allow-unsigned-executable-memory', function() {
      assert.strictEqual(
        entitlements['com.apple.security.cs.allow-unsigned-executable-memory'],
        true,
        'Electron requires unsigned executable memory'
      );
    });

    it('should have disable-library-validation', function() {
      assert.strictEqual(
        entitlements['com.apple.security.cs.disable-library-validation'],
        true,
        'Electron requires library validation disabled'
      );
    });
  });

  describe('GPU Helper Entitlements', function() {
    let entitlements;
    const helperPath = path.join(APP_PATH, 'Contents/Frameworks/GhostPad Helper (GPU).app');

    before(function() {
      if (!fs.existsSync(helperPath)) {
        this.skip();
      }
      entitlements = getEntitlements(helperPath);
      if (!entitlements) {
        this.skip();
      }
    });

    it('should have inherit entitlement', function() {
      assert.strictEqual(
        entitlements['com.apple.security.inherit'],
        true,
        'GPU Helper must inherit parent sandbox'
      );
    });
  });
});
