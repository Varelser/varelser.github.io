#!/usr/bin/env bash
set -euo pipefail
export TZ=Asia/Tokyo
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
PROJECT_NAME=$(basename "$ROOT_DIR")
OUT_DIR="$ROOT_DIR/.artifacts"
STAMP=$(date +%Y-%m-%d)
OUT_FILE="$OUT_DIR/${PROJECT_NAME}_source-only_${STAMP}.zip"
MANIFEST_FILE="$OUT_DIR/${PROJECT_NAME}_source-only_${STAMP}.manifest.json"
mkdir -p "$OUT_DIR"
rm -f "$OUT_FILE" "$MANIFEST_FILE"
node "$ROOT_DIR/scripts/verify-package-integrity.mjs" --write docs/archive/package-integrity-report.json >/dev/null

(
  cd "$(dirname "$ROOT_DIR")"
  zip -rq "$OUT_FILE" "$PROJECT_NAME" \
    -x "$PROJECT_NAME/node_modules/*" \
    -x "$PROJECT_NAME/dist/*" \
    -x "$PROJECT_NAME/dist-verify-inline/*" \
    -x "$PROJECT_NAME/.vite/*" \
    -x "$PROJECT_NAME/.out/*" \
    -x "$PROJECT_NAME/.artifacts/*" \
    -x "$PROJECT_NAME/docs/archive/verification-step-logs/*" \
    -x "$PROJECT_NAME/docs/archive/verification-suite-runs/*/step-logs/*"
)
node "$ROOT_DIR/scripts/write-package-manifest.mjs" \
  --output ".artifacts/${PROJECT_NAME}_source-only_${STAMP}.zip" \
  --manifest ".artifacts/${PROJECT_NAME}_source-only_${STAMP}.manifest.json" \
  --class source-only \
  --exclude-node-modules

echo "$OUT_FILE"
