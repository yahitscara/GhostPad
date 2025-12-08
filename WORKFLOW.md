# Super Simple Workflow - Hands Off Release

## Your Workflow (2 Steps!)

### 1. Make Changes & Bump Version
```bash
# Make your code changes
# Edit files, fix bugs, add features, etc.

# When ready to release, bump the version
npm version patch    # 1.0.12 → 1.0.13 (bug fixes)
npm version minor    # 1.0.13 → 1.1.0 (new features)
npm version major    # 1.1.0 → 2.0.0 (breaking changes)

# Commit and push
git push
```

### 2. Wait for Email, Then Upload
- ✅ GitHub Actions automatically builds BOTH Mac and Windows
- ✅ You get a notification when it's done (~15 min)
- ✅ Download the files from the Release page
- ✅ Upload to Mac App Store (Transporter) - 2 minutes
- ✅ Upload to Windows Store (Partner Center) - 3 minutes
- ✅ Done!

---

## That's It!

### Example Session

```bash
# You fixed a bug
git add .
git commit -m "Fix dark mode rendering issue"

# Bump version (automatically tags and commits)
npm version patch

# Push (triggers everything)
git push && git push --tags

# Wait for GitHub email notification
# Download from: https://github.com/yahitscara/GhostPad/releases
# Upload to stores
# Done! 🎉
```

### What Happens Automatically

When you push with a version bump:

1. ⚡ GitHub Actions detects version change
2. 🔨 Builds Mac App Store package (.pkg)
3. 🔨 Builds Windows Store package (.appx)
4. ✅ Verifies signatures automatically
5. 📦 Creates a GitHub Release with both files
6. 📧 Sends you a notification
7. 📄 Includes upload instructions in the release

### Upload to Stores (5 Minutes Total)

**Mac App Store** (2 min):
```bash
open -a Transporter
# Drag .pkg file → Click Deliver → Done
```

**Windows Store** (3 min):
1. Go to https://partner.microsoft.com/dashboard
2. GhostPad → Start update → Upload .appx → Submit

---

## Version Bumping Quick Reference

```bash
npm version patch   # Bug fixes:    1.0.12 → 1.0.13
npm version minor   # New features: 1.0.13 → 1.1.0
npm version major   # Big changes:  1.1.0 → 2.0.0
```

This automatically:
- ✅ Updates package.json
- ✅ Updates package-lock.json
- ✅ Creates a git commit
- ✅ Creates a git tag

Then just:
```bash
git push && git push --tags
```

---

## Complete Example: Releasing v1.0.13

```bash
# 1. Made your changes
git add .
git commit -m "Fixed opacity slider bug"

# 2. Bump version
npm version patch
# Creates commit: "1.0.13"
# Creates tag: "v1.0.13"

# 3. Push
git push && git push --tags

# 4. Wait ~15 minutes (GitHub builds everything)

# 5. Get email: "Release v1.0.13 published"

# 6. Go to: https://github.com/yahitscara/GhostPad/releases/latest

# 7. Download both files:
#    - GhostPad-MAS.pkg
#    - GhostPad.appx

# 8. Upload to stores (5 minutes)

# Done! 🚀
```

---

## What You Get in Each Release

Every release automatically includes:

📦 **Artifacts**:
- Mac App Store signed .pkg
- Windows Store signed .appx

📝 **Documentation**:
- Your commit message as release notes
- Upload instructions for both stores
- Direct links to store dashboards

✅ **Verified**:
- Package signatures checked
- Entitlements verified
- Both platforms built successfully

---

## Monitoring Progress

### Check Build Status
Go to: https://github.com/yahitscara/GhostPad/actions

You'll see:
- ✅ Green check = Build successful, files ready
- 🔄 Yellow circle = Building (wait ~15 min)
- ❌ Red X = Build failed (check logs)

### Get Notified
GitHub will email you when:
- Build completes (success or failure)
- Release is created
- Files are ready for download

---

## Troubleshooting

### Build Failed
1. Check the Actions tab for error logs
2. Usually a dependency issue or out-of-date package
3. Run locally: `npm run build:mas` to debug
4. Fix issue, commit, push again

### Need to Re-release Same Version
```bash
# Delete the tag locally and remotely
git tag -d v1.0.13
git push origin :refs/tags/v1.0.13

# Make your fixes
git add .
git commit -m "Fix issue"

# Re-bump version
npm version 1.0.13 --no-git-tag-version
git add package.json package-lock.json
git commit -m "1.0.13"
git tag v1.0.13
git push && git push --tags
```

---

## Summary

### Before (This Release)
```
Edit code
Debug entitlements
Configure certificates
Manually build
Verify signatures
Create documentation
Upload to stores
😰 Hours of work
```

### After (Next Release)
```
Edit code
npm version patch
git push && git push --tags
[Wait 15 min]
Download files
Upload to stores
😎 20 minutes total, 5 minutes hands-on
```

---

**That's the whole workflow!** Super hands-off. You just code, bump version, push. GitHub does everything else.
