#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${1:-$PWD}"
DROP_DIR="${2:-exports/intel-mac-live-browser-proof-drop}"
BROWSER_EXECUTABLE_PATH="${3:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

cd "$REPO_DIR"
node scripts/run-intel-mac-live-browser-proof-host-ingest.mjs --source-dir "$DROP_DIR" --browser-executable-path "$BROWSER_EXECUTABLE_PATH" --write docs/archive/intel-mac-live-browser-proof-host-ingest.json

echo "[finalize-on-host] extract/finalize/doctor/status regenerated"
