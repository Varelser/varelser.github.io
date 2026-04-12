#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

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
const checked = [];

for (const item of index.targets ?? []) {
  const targetPath = path.join(repoRoot, item.target);
  const replacementPath = path.join(overlayRoot, item.replacementFile);
  if (!fs.existsSync(targetPath)) {
    issues.push(`missing target: ${item.target}`);
    continue;
  }
  if (!fs.existsSync(replacementPath)) {
    issues.push(`missing replacement: ${item.replacementFile}`);
    continue;
  }
  const targetText = fs.readFileSync(targetPath, 'utf8').replace(/\s+$/, '');
  const replacementText = fs.readFileSync(replacementPath, 'utf8').replace(/\s+$/, '');
  if (targetText !== replacementText) {
    issues.push(`mismatch after apply: ${item.target}`);
  }
  checked.push(item.target);
}

console.log(JSON.stringify({ ok: issues.length === 0, checkedTargets: checked, issues }, null, 2));
process.exit(issues.length === 0 ? 0 : 1);
