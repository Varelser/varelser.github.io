#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = { repo: process.cwd(), index: null, bundlesDir: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--index') args.index = argv[++i];
    else if (arg === '--bundles-dir') args.bundlesDir = argv[++i];
  }
  return args;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(args.repo);
  const indexPath = path.resolve(args.index ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'low-risk-patch-bundles-2026-04-06.json'));
  const bundlesDir = path.resolve(args.bundlesDir ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'low-risk-patches-2026-04-06'));
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const issues = [];

  for (const bundle of index.bundles) {
    const filePath = path.join(bundlesDir, `${slugify(bundle.bundleId)}.md`);
    if (!fs.existsSync(filePath)) {
      issues.push(`missing bundle file: ${bundle.bundleId}`);
      continue;
    }
    const text = fs.readFileSync(filePath, 'utf8');
    for (const heading of ['## Scope', '## Included packets', '## Verify commands', '## Untouched trunks', '## Mainline decision points', '## Candidate additive outputs', '## Worker return template']) {
      if (!text.includes(heading)) issues.push(`missing heading ${heading} in ${bundle.bundleId}`);
    }
  }

  const totalIncludedPackets = index.bundles.reduce((sum, bundle) => sum + bundle.includedPackets.length, 0);
  if (index.summary.bundleCount !== index.bundles.length) issues.push('bundleCount summary mismatch');
  if (index.summary.totalIncludedPackets !== totalIncludedPackets) issues.push('totalIncludedPackets summary mismatch');
  if (index.summary.roleBundles + index.summary.familyBundles !== index.bundles.length) issues.push('role/family summary mismatch');

  const result = {
    ok: issues.length === 0,
    indexPath,
    bundlesDir,
    bundleCount: index.bundles.length,
    totalIncludedPackets,
    issues,
  };
  console.log(JSON.stringify(result, null, 2));
  if (issues.length > 0) process.exitCode = 1;
}

main();
