#!/usr/bin/env bash
# Notibar daily dev watch mode.
# Starts wp-scripts in watch mode for hot-rebuild on source changes.
# Run ./setup.sh first if you haven't (or if node_modules is missing).
#
# Usage: ./dev.sh

set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -d node_modules ]]; then
  echo "ERROR: node_modules missing. Run ./setup.sh first."
  exit 1
fi

echo "==> Starting watch mode (Ctrl+C to stop)"
exec npm start
