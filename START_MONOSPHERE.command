#!/bin/bash
set -e
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi
echo "Running typecheck..."
npm run typecheck
echo "Building production bundle..."
npm run build
echo "Starting dev server..."
npm run dev
