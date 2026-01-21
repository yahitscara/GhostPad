const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const APP_PATH = path.join(__dirname, '../../dist/mas-universal/GhostPad.app');
const INFO_PLIST = path.join(APP_PATH, 'Contents/Info.plist');

/**
 * Read a value from Info.plist using plutil
 */
function getPlistValue(key) {
  try {
    const result = execSync(`plutil -extract "${key}" raw "${INFO_PLIST}" 2>/dev/null`, {
      encoding: 'utf8'
    });
    return result.trim();
  } catch {
    return undefined;
  }
}

/**
 * Check if a key exists in Info.plist
 */
function plistKeyExists(key) {
  try {
    execSync(`plutil -extract "${key}" raw "${INFO_PLIST}" 2>/dev/null`, {
      encoding: 'utf8'
    });
    return true;
  } catch {
    return false;
  }
}

describe('Info.plist Verification', function() {
  this.timeout(30000);

  before(function() {
    if (!fs.existsSync(INFO_PLIST)) {
      this.skip();
    }
  });

  describe('Required Fields', function() {
    it('should have correct bundle identifier', function() {
      const bundleId = getPlistValue('CFBundleIdentifier');
      assert.strictEqual(bundleId, 'com.ghostpad.app');
    });

    it('should have ElectronTeamID set', function() {
      const teamId = getPlistValue('ElectronTeamID');
      assert.strictEqual(teamId, 'C34F9R9P79');
    });

    it('should have matching version in package.json', function() {
      const plistVersion = getPlistValue('CFBundleShortVersionString');
      const packageJson = require('../../package.json');
      assert.strictEqual(
        plistVersion,
        packageJson.version,
        `Version mismatch: Info.plist has ${plistVersion}, package.json has ${packageJson.version}`
      );
    });

    it('should have productivity category', function() {
      const category = getPlistValue('LSApplicationCategoryType');
      assert.strictEqual(category, 'public.app-category.productivity');
    });
  });

  describe('Security Settings', function() {
    it('should NOT have NSAllowsArbitraryLoads = true', function() {
      const allowsArbitrary = getPlistValue('NSAppTransportSecurity.NSAllowsArbitraryLoads');
      assert.notStrictEqual(
        allowsArbitrary,
        'true',
        'NSAllowsArbitraryLoads should not be true - use exception domains instead'
      );
    });
  });

  describe('Unused Privacy Descriptors (should be removed)', function() {
    const unusedKeys = [
      'NSCameraUsageDescription',
      'NSMicrophoneUsageDescription',
      'NSBluetoothAlwaysUsageDescription',
      'NSBluetoothPeripheralUsageDescription'
    ];

    unusedKeys.forEach(key => {
      it(`should NOT have ${key}`, function() {
        const exists = plistKeyExists(key);
        assert.strictEqual(
          exists,
          false,
          `${key} should be removed - GhostPad does not use this feature`
        );
      });
    });
  });

  describe('Embedded Resources', function() {
    it('should have provisioning profile embedded', function() {
      const profilePath = path.join(APP_PATH, 'Contents/embedded.provisionprofile');
      assert.ok(
        fs.existsSync(profilePath),
        'Provisioning profile must be embedded in the app bundle'
      );
    });
  });
});
