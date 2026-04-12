#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function parseArgs(argv) {
  const args = { repo: '.', overlay: '.', index: 'generated/handoff/missing-layers/closeout-apply-ready-patch-index-2026-04-06.json' };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--overlay') args.overlay = argv[++i];
    else if (arg === '--index') args.index = argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv);
const repoRoot = path.resolve(args.repo);
const overlayRoot = path.resolve(args.overlay);
const indexPath = path.join(overlayRoot, args.index);
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const issues = [];

for (const item of index.targets ?? []) {
  const patchPath = path.join(overlayRoot, item.patchFile);
  const replacementPath = path.join(overlayRoot, item.replacementFile);
  if (!fs.existsSync(patchPath)) issues.push(`missing patch: ${item.patchFile}`);
  if (!fs.existsSync(replacementPath)) issues.push(`missing replacement: ${item.replacementFile}`);
  const dryRun = spawnSync('patch', ['--dry-run', '-p1', '-i', patchPath, '-d', repoRoot], { encoding: 'utf8' });
  if (dryRun.status !== 0) {
    issues.push(`patch dry-run failed for ${item.target}: ${(dryRun.stderr || dryRun.stdout).trim()}`);
  }
}

console.log(JSON.stringify({ ok: issues.length === 0, patchCount: (index.targets ?? []).length, issues }, null, 2));
process.exit(issues.length === 0 ? 0 : 1);
