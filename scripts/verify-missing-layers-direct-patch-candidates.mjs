#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = { repo: process.cwd(), index: null, dir: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--index') args.index = argv[++i];
    else if (arg === '--dir') args.dir = argv[++i];
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(args.repo);
  const indexPath = path.resolve(
    args.index ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'direct-patch-candidate-index-2026-04-06.json'),
  );
  const dirPath = path.resolve(
    args.dir ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'direct-patch-candidates-2026-04-06'),
  );
  const issues = [];
  if (!fs.existsSync(indexPath)) issues.push(`missing index: ${path.relative(repoRoot, indexPath)}`);
  if (!fs.existsSync(dirPath)) issues.push(`missing dir: ${path.relative(repoRoot, dirPath)}`);
  let summary = null;
  if (issues.length === 0) {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    const items = index.directPatchCandidates ?? [];
    summary = index.summary ?? {};
    if (items.length !== 18) issues.push(`expected 18 direct patch candidates, got ${items.length}`);
    const files = new Set(fs.readdirSync(dirPath));
    for (const item of items) {
      const expected = `direct-patch-${item.familyId}.md`;
      if (!files.has(expected)) issues.push(`missing candidate file: ${expected}`);
      if (!Array.isArray(item.verifyCommands) || item.verifyCommands.length === 0) issues.push(`missing verify commands: ${item.familyId}`);
      if (!Array.isArray(item.touchableZones) || item.touchableZones.length === 0) issues.push(`missing touchable zones: ${item.familyId}`);
    }
  }
  console.log(JSON.stringify({ ok: issues.length === 0, summary, issues }, null, 2));
  if (issues.length > 0) process.exitCode = 1;
}

main();
