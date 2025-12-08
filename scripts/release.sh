#!/bin/bash
# Quick release script for GhostPad

set -e  # Exit on error

VERSION=$1
NOTES=$2

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$VERSION" ] || [ -z "$NOTES" ]; then
  echo "Usage: ./scripts/release.sh <version> <notes>"
  echo ""
  echo "Examples:"
  echo "  ./scripts/release.sh 1.0.13 'Bug fixes and improvements'"
  echo "  ./scripts/release.sh 1.1.0 'Added export feature'"
  exit 1
fi

echo -e "${GREEN}🚀 Releasing GhostPad version $VERSION${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Run this from the project root."
  exit 1
fi

# Update version
echo "📝 Updating version to $VERSION..."
npm version $VERSION --no-git-tag-version

# Commit version bump
echo "💾 Committing version bump..."
git add package.json package-lock.json
git commit -m "Release v$VERSION - $NOTES"

# Build for Mac App Store
echo ""
echo -e "${YELLOW}🔨 Building for Mac App Store...${NC}"
npm run build:mas

# Verify the build
echo ""
echo "✅ Verifying package signature..."
pkgutil --check-signature dist/mas-universal/GhostPad-MAS.pkg | head -5

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo "📦 Package location:"
echo "   dist/mas-universal/GhostPad-MAS.pkg"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. 📤 Upload to Mac App Store:"
echo "   open -a Transporter"
echo "   Then drag: dist/mas-universal/GhostPad-MAS.pkg"
echo ""
echo "2. 🔄 Push to GitHub:"
echo "   git push"
echo ""
echo "3. 🏷️  Tag this release:"
echo "   git tag v$VERSION"
echo "   git push origin v$VERSION"
echo ""
echo "4. 🪟 For Windows Store:"
echo "   Run GitHub Actions workflow or build locally on Windows"
echo ""
echo -e "${GREEN}Happy releasing! 🎉${NC}"
