#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
node scripts/run-target-host-intel-mac-closeout.mjs \
  --refresh-optional \
  --install-playwright-chromium
