#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

./RUN_TARGET_HOST_INTEL_MAC_CLOSEOUT.command

npm run verify:intel-mac-live-browser-proof-drop || true
npm run doctor:intel-mac-live-browser-proof:refresh || true
npm run report:intel-mac-live-browser-proof-status || true
npm run report:intel-mac-live-browser-proof-blockers || true
npm run report:intel-mac-live-browser-proof-remediation || true

STAMP="$(date +%Y-%m-%d_%H-%M-%S)"
OUTDIR="exports/intel-mac-live-browser-proof-drop/incoming"
OUTZIP="$OUTDIR/kalokagathia-intel-mac-live-browser-proof-$STAMP.zip"
mkdir -p "$OUTDIR"

zip -rq "$OUTZIP" \
  exports/intel-mac-live-browser-proof-drop/README.md \
  exports/intel-mac-live-browser-proof-drop/capture-metadata.json \
  exports/intel-mac-live-browser-proof-drop/real-export \
  exports/intel-mac-live-browser-proof-drop/phase5-proof-input

echo "created: $OUTZIP"
