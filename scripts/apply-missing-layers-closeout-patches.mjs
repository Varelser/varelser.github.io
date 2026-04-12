#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function parseArgs(argv) {
  const args = { repo: '.', overlay: '.', index: 'generated/handoff/missing-layers/closeout-apply-ready-patch-index-2026-04-06.json', mode: 'patch' };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--overlay') args.overlay = argv[++i];
    else if (arg === '--index') args.index = argv[++i];
    else if (arg === '--mode') args.mode = argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv);
const repoRoot = path.resolve(args.repo);
const overlayRoot = path.resolve(args.overlay);
const indexPath = path.join(overlayRoot, args.index);
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

for (const item of index.targets ?? []) {
  if (args.mode === 'replace') {
    const replacementPath = path.join(overlayRoot, item.replacementFile);
    fs.copyFileSync(replacementPath, path.join(repoRoot, item.target));
  } else {
    const patchPath = path.join(overlayRoot, item.patchFile);
    const applied = spawnSync('patch', ['-p1', '-i', patchPath, '-d', repoRoot], { encoding: 'utf8', stdio: 'inherit' });
    if (applied.status !== 0) process.exit(applied.status ?? 1);
  }
}

console.log(JSON.stringify({ ok: true, appliedTargets: (index.targets ?? []).map((item) => item.target), mode: args.mode }, null, 2));
