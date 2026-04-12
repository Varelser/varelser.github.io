#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    repo: process.cwd(),
    index: null,
    dir: null,
    matrix: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--index') args.index = argv[++i];
    else if (arg === '--dir') args.dir = argv[++i];
    else if (arg === '--matrix') args.matrix = argv[++i];
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(args.repo);
  const indexPath = path.resolve(args.index ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'family-closure-patch-index-2026-04-06.json'));
  const dirPath = path.resolve(args.dir ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'family-closure-patches-2026-04-06'));
  const matrixPath = path.resolve(args.matrix ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'worker-evidence-matrix-2026-04-06.json'));
  const pkgPath = path.join(repoRoot, 'package.json');

  const issues = [];
  if (!fs.existsSync(indexPath)) issues.push(`missing index: ${indexPath}`);
  if (!fs.existsSync(dirPath)) issues.push(`missing dir: ${dirPath}`);
  if (!fs.existsSync(matrixPath)) issues.push(`missing matrix: ${matrixPath}`);
  if (!fs.existsSync(pkgPath)) issues.push(`missing package.json: ${pkgPath}`);

  if (issues.length > 0) {
    console.log(JSON.stringify({ ok: false, issues }, null, 2));
    process.exitCode = 1;
    return;
  }

  const index = readJson(indexPath);
  const matrix = readJson(matrixPath);
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const scripts = pkg.scripts ?? {};

  const familyIds = new Set(matrix.familyPackets.map((packet) => packet.familyId));
  if (index.summary.familyPatchCount !== matrix.familyPackets.length) {
    issues.push(`familyPatchCount mismatch: ${index.summary.familyPatchCount} !== ${matrix.familyPackets.length}`);
  }

  for (const patch of index.familyPatches ?? []) {
    if (!familyIds.has(patch.familyId)) issues.push(`unknown familyId in patch index: ${patch.familyId}`);
    const fileName = `${patch.patchId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.md`;
    const mdPath = path.join(dirPath, fileName);
    if (!fs.existsSync(mdPath)) issues.push(`missing family patch md: ${mdPath}`);
    for (const cmd of patch.verifyCommands ?? []) {
      const match = cmd.match(/^npm run ([^\s]+)/);
      if (match && !scripts[match[1]]) issues.push(`missing package script for ${patch.familyId}: ${match[1]}`);
    }
  }

  const direct = index.summary.directPatchCandidates ?? 0;
  const mainline = index.summary.mainlineReviewCandidates ?? 0;
  const total = index.summary.familyPatchCount ?? 0;
  if (direct + mainline !== total) issues.push(`patch candidate split mismatch: ${direct} + ${mainline} !== ${total}`);

  console.log(JSON.stringify({
    ok: issues.length === 0,
    indexPath,
    dirPath,
    familyPatchCount: index.summary.familyPatchCount,
    directPatchCandidates: index.summary.directPatchCandidates,
    mainlineReviewCandidates: index.summary.mainlineReviewCandidates,
    issues,
  }, null, 2));

  if (issues.length > 0) process.exitCode = 1;
}

main();
