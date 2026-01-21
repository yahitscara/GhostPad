const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const APP_PATH = path.join(__dirname, '../../dist/mas-universal/GhostPad.app');
const PKG_PATH = path.join(__dirname, '../../dist/mas-universal/GhostPad-MAS.pkg');
const TEAM_ID = 'C34F9R9P79';

const HELPERS = [
  'GhostPad Helper.app',
  'GhostPad Helper (GPU).app',
  'GhostPad Helper (Renderer).app',
  'GhostPad Helper (Plugin).app'
];

describe('Code Signing Verification', function() {
  this.timeout(30000);

  before(function() {
    if (!fs.existsSync(APP_PATH)) {
      this.skip();
    }
  });

  describe('Main App', function() {
    it('should have valid signature', function() {
      const result = execSync(`codesign --verify --deep --strict "${APP_PATH}" 2>&1`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      // codesign outputs nothing on success, or throws on failure
    });

    it('should have correct Team ID', function() {
      const result = execSync(`codesign -dvvv "${APP_PATH}" 2>&1`, { encoding: 'utf8' });
      assert.ok(
        result.includes(`TeamIdentifier=${TEAM_ID}`),
        `Expected Team ID ${TEAM_ID}, got: ${result.match(/TeamIdentifier=(\w+)/)?.[1]}`
      );
    });

    it('should be signed with 3rd Party Mac Developer certificate', function() {
      const result = execSync(`codesign -dvvv "${APP_PATH}" 2>&1`, { encoding: 'utf8' });
      assert.ok(
        result.includes('3rd Party Mac Developer Application'),
        'Expected 3rd Party Mac Developer Application certificate'
      );
    });
  });

  describe('Helper Processes', function() {
    HELPERS.forEach(helper => {
      const helperPath = path.join(APP_PATH, 'Contents/Frameworks', helper);

      describe(helper, function() {
        before(function() {
          if (!fs.existsSync(helperPath)) {
            this.skip();
          }
        });

        it('should have valid signature', function() {
          execSync(`codesign --verify --strict "${helperPath}" 2>&1`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe']
          });
        });

        it('should have same Team ID as main app', function() {
          const result = execSync(`codesign -dvvv "${helperPath}" 2>&1`, { encoding: 'utf8' });
          assert.ok(
            result.includes(`TeamIdentifier=${TEAM_ID}`),
            `${helper} has wrong Team ID`
          );
        });
      });
    });
  });

  describe('PKG Installer', function() {
    before(function() {
      if (!fs.existsSync(PKG_PATH)) {
        this.skip();
      }
    });

    it('should have valid signature', function() {
      const result = execSync(`pkgutil --check-signature "${PKG_PATH}" 2>&1`, { encoding: 'utf8' });
      assert.ok(
        result.includes('signed'),
        'PKG should be signed'
      );
    });
  });
});
