#!/usr/bin/env bash
# Notibar release builder.
# Pulls cross-modules, builds assets, and zips a clean, WP-installable package
# into ./release/notibar-{version}.zip. Version is sourced from the plugin
# file header (single source of truth) and synced into readme.txt's Stable tag.
#
# Usage: ./release.sh
# Requires: php, npm, zip, rsync. GITHUB_TOKEN read from .env by pull-modules.php.

set -euo pipefail
cd "$(dirname "$0")"

PLUGIN_FILE="njt-notification-bar.php"
README_FILE="readme.txt"
SLUG="notibar"
RELEASE_DIR="./release"

# Always clean staged tmp on exit (success or failure)
trap 'rm -rf "$RELEASE_DIR/tmp"' EXIT

# 1. Preflight — fail fast if required tools missing
for bin in php npm zip rsync; do
  command -v "$bin" >/dev/null || { echo "ERROR: '$bin' is required but not found in PATH"; exit 1; }
done

# 2. Read version from plugin header (single source of truth)
VERSION=$(grep -E '^[[:space:]]*\*[[:space:]]*Version:' "$PLUGIN_FILE" | head -1 \
  | sed -E 's/.*Version:[[:space:]]*([0-9.]+).*/\1/')
[[ -n "$VERSION" ]] || { echo "ERROR: could not parse Version from $PLUGIN_FILE"; exit 1; }
echo "==> Releasing $SLUG v$VERSION"

# 3. Sync readme.txt "Stable tag:" to plugin header version
#    sed -i.bak form is portable across macOS and GNU sed
if [[ -f "$README_FILE" ]]; then
  sed -i.bak -E "s/^Stable tag:.*/Stable tag: ${VERSION}/" "$README_FILE"
  rm -f "${README_FILE}.bak"
  echo "==> Synced Stable tag in $README_FILE"
fi

# 4. Pull cross-modules (GITHUB_TOKEN loaded from .env by the script itself)
echo "==> Pulling cross-modules"
php bin/pull-modules.php

# 5. Build production assets
echo "==> Installing npm deps"
npm ci
echo "==> Building assets"
npm run build

# 6. Stage to ./release/tmp/notibar/ with exclusions
STAGE="$RELEASE_DIR/tmp/${SLUG}"
ZIP_PATH="$RELEASE_DIR/${SLUG}-${VERSION}.zip"
rm -rf "$RELEASE_DIR/tmp" "$ZIP_PATH"
mkdir -p "$STAGE"

echo "==> Staging files"
rsync -a \
  --exclude='.git/' \
  --exclude='.github/' \
  --exclude='.vscode/' \
  --exclude='.claude/' \
  --exclude='.gitignore' \
  --exclude='.env' \
  --exclude='.env.example' \
  --exclude='src/' \
  --exclude='node_modules/' \
  --exclude='package.json' \
  --exclude='package-lock.json' \
  --exclude='bin/' \
  --exclude='modules.json' \
  --exclude='*.map' \
  --exclude='.DS_Store' \
  --exclude='*.log' \
  --exclude='*.bak' \
  --exclude='release/' \
  --exclude='release.sh' \
  --exclude='dev.sh' \
  --exclude='setup.sh' \
  ./ "$STAGE/"

# 7. Zip (root folder inside zip is "notibar/" — WP-standard, activatable as-is)
echo "==> Zipping"
( cd "$RELEASE_DIR/tmp" && zip -rq "../${SLUG}-${VERSION}.zip" "${SLUG}/" )

echo "==> Done: $ZIP_PATH"
