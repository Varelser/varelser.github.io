#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${1:-$PWD}"
DROP_DIR="${2:-$PWD}"
shift 2 || true

cd "$REPO_DIR"
node scripts/stage-intel-mac-live-browser-proof-artifacts.mjs --source-dir "$DROP_DIR" "$@"
node scripts/verify-intel-mac-live-browser-proof-drop.mjs --source-dir "$DROP_DIR" --write "$REPO_DIR/docs/archive/intel-mac-live-browser-proof-drop-check.json"

echo "[stage-artifacts-on-intel-mac] staged real export / screenshots / logs into $DROP_DIR"
