#!/usr/bin/env bash
set -euo pipefail

DROP_DIR="${1:-$PWD}"
PROJECT_SLUG="${2:-kalokagathia-proof}"
OUT_DIR="$DROP_DIR/incoming"
OUT_PATH="$OUT_DIR/kalokagathia-intel-mac-live-browser-proof-${PROJECT_SLUG}.zip"
mkdir -p "$OUT_DIR"
cd "$DROP_DIR"
zip -qr "$OUT_PATH" real-export phase5-proof-input capture-metadata.json README.md capture-on-intel-mac.sh stage-artifacts-on-intel-mac.sh finalize-on-host.sh package-proof-bundle.sh
zip -T "$OUT_PATH"
echo "[package-proof-bundle] wrote $OUT_PATH"
