#!/usr/bin/env bash
# Notibar one-time setup + module/dep refresh.
# Run this once on first clone, or any time you want to refresh cross-modules
# or npm deps. After setup completes, use ./dev.sh for daily development.
#
# Usage: ./setup.sh

set -euo pipefail
cd "$(dirname "$0")"

# 1. Preflight — verify required tools exist
for bin in php node npm; do
  command -v "$bin" >/dev/null || {
    echo "ERROR: '$bin' not found in PATH. Install it before running setup.sh."
    exit 1
  }
done

# 2. .env gate — bootstrap from .env.example then halt for manual token entry
if [[ ! -f .env ]]; then
  cp .env.example .env
  cat <<EOF
Created .env from .env.example.

Next steps:
  1. Open .env in your editor.
  2. Generate a fine-grained GitHub PAT with Contents:Read on
     YayCommerce/cross-sell-manager — https://github.com/settings/personal-access-tokens
  3. Paste it as GITHUB_TOKEN=<token>
  4. Rerun ./setup.sh
EOF
  exit 1
fi

# Load .env so we can check GITHUB_TOKEN; pull-modules.php loads it again itself
# shellcheck disable=SC1091
set -a; source .env; set +a

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "ERROR: GITHUB_TOKEN is empty in .env. Add it, then rerun ./setup.sh."
  exit 1
fi

# 3. Pull cross-modules (always — sparse-checkout is cheap, keeps modules fresh)
echo "==> Pulling cross-modules"
php bin/pull-modules.php

# 4. npm install — skip if node_modules is current relative to package-lock.json
if [[ ! -d node_modules ]] || [[ package-lock.json -nt node_modules ]]; then
  echo "==> Installing npm deps"
  npm ci
else
  echo "==> npm deps current, skipping install"
fi

cat <<EOF

==> Setup complete.
    Run ./dev.sh to start watch mode.
EOF
