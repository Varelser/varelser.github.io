#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${1:-$PWD}"
PROJECT_SLUG="${2:-kalokagathia-proof}"
BROWSER_EXECUTABLE_PATH="${3:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
DROP_DIR="${4:-$PWD}"
shift 4 || true

REAL_EXPORT_DIR="$DROP_DIR/real-export"
PROOF_INPUT_DIR="$DROP_DIR/phase5-proof-input"
SCREENSHOT_DIR="$PROOF_INPUT_DIR/screenshots"
LOG_DIR="$PROOF_INPUT_DIR/logs"
mkdir -p "$REAL_EXPORT_DIR" "$SCREENSHOT_DIR" "$LOG_DIR"

cd "$REPO_DIR"
echo "[capture-on-intel-mac] repo=$REPO_DIR slug=$PROJECT_SLUG browser=$BROWSER_EXECUTABLE_PATH"
node scripts/run-intel-mac-live-browser-proof-pipeline.mjs --source-dir "$DROP_DIR" --browser-executable-path "$BROWSER_EXECUTABLE_PATH" 2>&1 | tee "$LOG_DIR/pipeline.log"

if [ -f "fixtures/project-state/real-export/manifest.json" ]; then
  cp "fixtures/project-state/real-export/manifest.json" "$REAL_EXPORT_DIR/manifest.json"
fi

echo "[capture-on-intel-mac] export the project JSON from the real browser UI, then stage the files"
echo "[capture-on-intel-mac] example: ./stage-artifacts-on-intel-mac.sh $REPO_DIR $DROP_DIR --slug $PROJECT_SLUG --browser-executable-path '$BROWSER_EXECUTABLE_PATH' --real-export ~/Downloads/kalokagathia-project-$PROJECT_SLUG.json --screenshot ~/Desktop/export-overview.png --log $LOG_DIR/pipeline.log"

if [ "$#" -gt 0 ]; then
  "$DROP_DIR/stage-artifacts-on-intel-mac.sh" "$REPO_DIR" "$DROP_DIR" --slug "$PROJECT_SLUG" --browser-executable-path "$BROWSER_EXECUTABLE_PATH" "$@"
fi

echo "[capture-on-intel-mac] done. review: $DROP_DIR/phase5-proof-input/real-export-proof.json"
