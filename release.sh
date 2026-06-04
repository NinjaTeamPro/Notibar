#!/usr/bin/env bash
# Notibar release builder.
# Pulls cross-modules, builds assets, and zips a clean, WP-installable package
# into ./release/. Version is sourced from the plugin file header (single source
# of truth) and synced into readme.txt's Stable tag.
#
# Usage:
#   ./release.sh            Pro build  -> ./release/notibar-{version}.zip
#   ./release.sh --lite     Lite build -> ./release/notibar-lite-{version}.zip
#
# The Lite build PHYSICALLY removes all Pro feature code (WordPress.org forbids
# bundled locked features): it strips @pro/@endpro regions, deletes the Pro-only
# files listed in build-tools/pro-manifest.json, swaps in the Lite edition flag,
# and rebuilds the JS bundles from the stripped source so no Pro code survives.
#
# Both builds zip an internal folder named "notibar/" (WP-standard slug).
#
# Requires: php, npm, node, zip, rsync. GITHUB_TOKEN read from .env by pull-modules.php.

set -euo pipefail
cd "$(dirname "$0")"

PLUGIN_FILE="njt-notification-bar.php"
README_FILE="readme.txt"
SLUG="notibar"
RELEASE_DIR="./release"

# Edition: pro (default) | lite
EDITION="pro"
for arg in "$@"; do
  case "$arg" in
    --lite) EDITION="lite" ;;
    *) echo "ERROR: unknown argument '$arg'"; exit 1 ;;
  esac
done

# Always clean staged tmp on exit (success or failure)
trap 'rm -rf "$RELEASE_DIR/tmp"' EXIT

# 1. Preflight — fail fast if required tools missing
for bin in php npm node zip rsync; do
  command -v "$bin" >/dev/null || { echo "ERROR: '$bin' is required but not found in PATH"; exit 1; }
done

# 2. Read version from plugin header (single source of truth)
VERSION=$(grep -E '^[[:space:]]*\*[[:space:]]*Version:' "$PLUGIN_FILE" | head -1 \
  | sed -E 's/.*Version:[[:space:]]*([0-9.]+).*/\1/')
[[ -n "$VERSION" ]] || { echo "ERROR: could not parse Version from $PLUGIN_FILE"; exit 1; }

# Package folder (the directory name inside the zip, = WP plugin slug) and zip
# name differ by edition. Lite keeps the canonical "notibar" slug for WP.org;
# Pro ships as a distinct "notibar-pro" plugin.
if [[ "$EDITION" == "lite" ]]; then
  PKG_SLUG="${SLUG}"
  ZIP_NAME="${SLUG}-lite-${VERSION}.zip"
else
  PKG_SLUG="${SLUG}-pro"
  ZIP_NAME="${SLUG}-pro-${VERSION}.zip"
fi
echo "==> Releasing $PKG_SLUG v$VERSION (edition: $EDITION)"

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

# 5. Install npm deps
echo "==> Installing npm deps"
npm ci

# Shared rsync exclusions for staging the installable package.
STAGE_EXCLUDES=(
  --exclude='.git/'            --exclude='.github/'
  --exclude='.vscode/'         --exclude='.claude/'
  --exclude='.gitignore'       --exclude='.env'
  --exclude='.env.example'     --exclude='src/'
  --exclude='node_modules/'    --exclude='package.json'
  --exclude='package-lock.json' --exclude='bin/'
  --exclude='modules.json'     --exclude='build-tools/'
  --exclude='plans/'           --exclude='*.map'
  --exclude='.DS_Store'        --exclude='*.log'
  --exclude='*.bak'            --exclude='release/'
  --exclude='release.sh'       --exclude='dev.sh'
  --exclude='setup.sh'         --exclude='recommended-modules/.source'
  --exclude='docs'
)

# 6. Build assets + choose the source root to stage from.
if [[ "$EDITION" == "lite" ]]; then
  LITE_ROOT="$RELEASE_DIR/tmp/lite-root"
  rm -rf "$LITE_ROOT"
  mkdir -p "$LITE_ROOT"

  echo "==> Copying source tree for Lite strip"
  rsync -a --exclude='node_modules/' --exclude='.git/' \
    --exclude='release/' --exclude='.env' \
    ./ "$LITE_ROOT/"

  echo "==> Stripping Pro code (markers + manifest)"
  node build-tools/strip-pro.js "$LITE_ROOT"

  # Absolute paths: wp-scripts can't resolve relative entry paths, and webpack
  # resolves the app's deps (@dnd-kit, uuid) by walking parent dirs — lite-root
  # lives inside the repo, so it finds the repo's node_modules without a symlink
  # (a symlink would also get followed into the zip).
  LITE_ABS="$(cd "$LITE_ROOT" && pwd)"

  echo "==> Building Lite assets from stripped source"
  npx wp-scripts build \
    customizer-app="$LITE_ABS/src/customizer-app/index.js" \
    customizer-preview="$LITE_ABS/src/customizer-preview/index.js" \
    frontend="$LITE_ABS/src/frontend/index.js" \
    settings-app="$LITE_ABS/src/settings-app/index.js" \
    --output-path="$LITE_ABS/build"

  SRC_ROOT="$LITE_ROOT"
else
  echo "==> Building assets"
  npm run build
  SRC_ROOT="."
fi

# 7. Stage to ./release/tmp/<pkg-slug>/ with exclusions
STAGE="$RELEASE_DIR/tmp/${PKG_SLUG}"
ZIP_PATH="$RELEASE_DIR/${ZIP_NAME}"
rm -rf "$STAGE" "$ZIP_PATH"
mkdir -p "$STAGE"

echo "==> Staging files"
rsync -a "${STAGE_EXCLUDES[@]}" "$SRC_ROOT/" "$STAGE/"

# 8. Zip (root folder inside zip is the plugin slug — WP-standard, activatable
#    as-is): "notibar/" for Lite, "notibar-pro/" for Pro.
echo "==> Zipping"
( cd "$RELEASE_DIR/tmp" && zip -rq "../${ZIP_NAME}" "${PKG_SLUG}/" )

echo "==> Done: $ZIP_PATH"
