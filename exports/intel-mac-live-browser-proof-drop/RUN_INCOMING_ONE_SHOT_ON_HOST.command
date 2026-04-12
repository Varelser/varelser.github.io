#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
npm run run:intel-mac-live-browser-proof:incoming-one-shot
