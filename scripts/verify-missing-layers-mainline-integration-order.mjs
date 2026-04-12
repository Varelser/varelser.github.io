#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    repo: process.cwd(),
    index: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--index') args.index = argv[++i];
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(args.repo);
  const indexPath = path.resolve(
    args.index ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'mainline-integration-order-2026-04-06.json'),
  );
  const data = readJson(indexPath);
  const issues = [];

  if (!Array.isArray(data.stages) || data.stages.length < 7) {
    issues.push('stage 数が不足しています。');
  }

  const stageIds = new Set();
  for (const stage of data.stages ?? []) {
    if (!stage.stageId) issues.push('stageId が空です。');
    if (stageIds.has(stage.stageId)) issues.push(`stageId が重複しています: ${stage.stageId}`);
    stageIds.add(stage.stageId);
    if (!Array.isArray(stage.verifyCommands) || stage.verifyCommands.length === 0) {
      issues.push(`verifyCommands が空です: ${stage.stageId}`);
    }
    if (!stage.verifyCoverageSummary) {
      issues.push(`verifyCoverageSummary がありません: ${stage.stageId}`);
    }
  }

  const required = [
    'stage-0-preflight',
    'stage-1-pbd-direct',
    'stage-2-mpm-direct',
    'stage-3-fracture-direct',
    'stage-4-volumetric-core',
    'stage-5-volumetric-smoke-review',
    'stage-6-specialist-review',
    'stage-7-truth-sync-closeout',
  ];

  for (const value of required) {
    if (!stageIds.has(value)) issues.push(`required stage が不足しています: ${value}`);
  }

  const smokeStage = (data.stages ?? []).find((stage) => stage.stageId === 'stage-5-volumetric-smoke-review');
  if (smokeStage && !(smokeStage.familyIds ?? []).includes('volumetric-smoke')) {
    issues.push('volumetric-smoke review stage に volumetric-smoke が含まれていません。');
  }

  const summary = data.summary ?? {};
  if ((summary.missingVerifyScriptCount ?? 1) !== 0) {
    issues.push(`missingVerifyScriptCount が 0 ではありません: ${summary.missingVerifyScriptCount}`);
  }

  console.log(JSON.stringify({ ok: issues.length === 0, index: path.relative(repoRoot, indexPath), stageCount: (data.stages ?? []).length, issues }, null, 2));
  process.exitCode = issues.length === 0 ? 0 : 1;
}

main();
