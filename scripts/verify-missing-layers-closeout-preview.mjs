#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key.startsWith('--')) {
      args[key.slice(2)] = value && !value.startsWith('--') ? value : true;
      if (value && !value.startsWith('--')) i += 1;
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const repo = path.resolve(args.repo || '.');
const genDir = path.join(repo, 'generated', 'handoff', 'missing-layers');
const previewDir = path.join(genDir, 'closeout-preview-2026-04-06');
const indexJson = path.join(genDir, 'closeout-preview-index-2026-04-06.json');
const issues = [];
if (!fs.existsSync(indexJson)) issues.push('missing closeout preview index json');
if (!fs.existsSync(previewDir)) issues.push('missing closeout preview dir');
for (const item of ['CURRENT_STATUS.md', 'REVIEW.md', 'DOCS_INDEX.md']) {
  const filePath = path.join(previewDir, item);
  if (!fs.existsSync(filePath)) {
    issues.push(`missing preview ${item}`);
    continue;
  }
  const text = fs.readFileSync(filePath, 'utf8');
  if (!text.includes('2026-04-06')) issues.push(`${item} missing 2026-04-06 block`);
}
const currentStatusPath = path.join(previewDir, 'CURRENT_STATUS.md');
if (fs.existsSync(currentStatusPath)) {
  const text = fs.readFileSync(currentStatusPath, 'utf8');
  if (!text.includes('future-native families: 22/22')) issues.push('CURRENT_STATUS preview missing 22/22');
  if (!text.includes('direct patch candidates: 18')) issues.push('CURRENT_STATUS preview missing direct patch count');
}
const reviewPath = path.join(previewDir, 'REVIEW.md');
if (fs.existsSync(reviewPath)) {
  const text = fs.readFileSync(reviewPath, 'utf8');
  if (!text.includes('review-ready: 17')) issues.push('REVIEW preview missing review-ready count');
  if (!text.includes('specialist review queue: 4')) issues.push('REVIEW preview missing specialist queue');
}
const docsPath = path.join(previewDir, 'DOCS_INDEX.md');
if (fs.existsSync(docsPath)) {
  const text = fs.readFileSync(docsPath, 'utf8');
  if (!text.includes('closeout-preview-index-2026-04-06.json')) issues.push('DOCS_INDEX preview missing closeout preview index');
}
console.log(JSON.stringify({ ok: issues.length === 0, issues }, null, 2));
if (issues.length > 0) process.exit(1);
