#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    repo: process.cwd(),
    directIndex: null,
    familyIndex: null,
    outJson: null,
    outMd: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--direct-index') args.directIndex = argv[++i];
    else if (arg === '--family-index') args.familyIndex = argv[++i];
    else if (arg === '--out-json') args.outJson = argv[++i];
    else if (arg === '--out-md') args.outMd = argv[++i];
  }
  return args;
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeText(filePath, text) {
  ensureParent(filePath);
  fs.writeFileSync(filePath, text);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function uniq(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function listExistingScriptNames(repoRoot) {
  const packageJsonPath = path.join(repoRoot, 'package.json');
  const packageJson = readJson(packageJsonPath);
  return new Set(Object.keys(packageJson.scripts ?? {}));
}

function scriptNameFromCommand(command) {
  const prefix = 'npm run ';
  if (!command.startsWith(prefix)) return null;
  return command.slice(prefix.length).trim();
}

function verifyCoverage(commands, existingScripts) {
  return commands.map((command) => {
    const scriptName = scriptNameFromCommand(command);
    if (!scriptName) {
      return { command, kind: 'shell-or-node', exists: true };
    }
    return { command, kind: 'npm-script', scriptName, exists: existingScripts.has(scriptName) };
  });
}

function groupItems(items, predicate) {
  return items.filter(predicate);
}

function stage(stageId, title, mergeMode, items, verifyCommands, riskBand, notes) {
  return {
    stageId,
    title,
    mergeMode,
    familyCount: items.length,
    familyIds: items.map((item) => item.familyId),
    patchIds: items.map((item) => item.patchId),
    progressPercentAverage: items.length
      ? Number((items.reduce((sum, item) => sum + (item.progressPercent ?? 0), 0) / items.length).toFixed(2))
      : null,
    ownershipClasses: uniq(items.flatMap((item) => [item.ownershipClass])),
    closureCandidates: uniq(items.flatMap((item) => [item.closureCandidate])),
    verifyCommands: uniq(verifyCommands),
    riskBand,
    notes,
  };
}

function renderIndexMd(index) {
  const stageRows = index.stages
    .map(
      (item) => `| ${item.stageId} | ${item.mergeMode} | ${item.familyCount} | ${item.progressPercentAverage ?? '-'} | ${item.riskBand} | ${item.verifyCoverageSummary.missingScriptCount} |`,
    )
    .join('\n');

  const detailBlocks = index.stages
    .map((item) => {
      const familyLines = item.familyIds.length ? item.familyIds.map((value) => `- ${value}`).join('\n') : '- なし';
      const verifyLines = item.verifyCommands.map((value) => `- \`${value}\``).join('\n');
      const noteLines = item.notes.map((value) => `- ${value}`).join('\n');
      return `## ${item.stageId} — ${item.title}\n\n- mergeMode: ${item.mergeMode}\n- familyCount: ${item.familyCount}\n- progressPercentAverage: ${item.progressPercentAverage ?? '-'}\n- riskBand: ${item.riskBand}\n- verifyCoverage: ${item.verifyCoverageSummary.existingScriptCount}/${item.verifyCoverageSummary.totalCommands} existing\n\n### Families\n\n${familyLines}\n\n### Verify commands\n\n${verifyLines}\n\n### Notes\n\n${noteLines}`;
    })
    .join('\n\n');

  return `# KALOKAGATHIA mainline integration order index\n\n- 作成日: 2026-04-06\n- directPatchCandidateCount: ${index.summary.directPatchCandidateCount}\n- specialistReviewCount: ${index.summary.specialistReviewCount}\n- stages: ${index.summary.stageCount}\n- reviewReadyDirectCount: ${index.summary.reviewReadyDirectCount}\n- needsReviewDirectCount: ${index.summary.needsReviewDirectCount}\n\n## Stage summary\n\n| stageId | mergeMode | familyCount | avgProgress | risk | missing verify scripts |\n|---|---|---:|---:|---|---:|\n${stageRows}\n\n${detailBlocks}\n`;
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(args.repo);
  const directIndexPath = path.resolve(
    args.directIndex ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'direct-patch-candidate-index-2026-04-06.json'),
  );
  const familyIndexPath = path.resolve(
    args.familyIndex ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'family-closure-patch-index-2026-04-06.json'),
  );
  const outJson = path.resolve(
    args.outJson ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'mainline-integration-order-2026-04-06.json'),
  );
  const outMd = path.resolve(
    args.outMd ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'mainline-integration-order-2026-04-06.md'),
  );

  const directIndex = readJson(directIndexPath);
  const familyIndex = readJson(familyIndexPath);
  const existingScripts = listExistingScriptNames(repoRoot);
  const directItems = directIndex.directPatchCandidates ?? [];
  const specialistItems = (familyIndex.familyPatches ?? []).filter((item) => item.group === 'specialist-native');

  const pbd = groupItems(directItems, (item) => item.group === 'pbd');
  const mpm = groupItems(directItems, (item) => item.group === 'mpm');
  const fracture = groupItems(directItems, (item) => item.group === 'fracture');
  const volumetricCore = groupItems(
    directItems,
    (item) => item.group === 'volumetric' && item.familyId !== 'volumetric-smoke' && item.closureCandidate === 'review-ready',
  );
  const volumetricSmoke = groupItems(directItems, (item) => item.familyId === 'volumetric-smoke');
  const reviewReadyDirect = groupItems(directItems, (item) => item.closureCandidate === 'review-ready');
  const needsReviewDirect = groupItems(directItems, (item) => item.closureCandidate !== 'review-ready');

  const stages = [
    stage(
      'stage-0-preflight',
      'Overlay preflight and additive verify gate',
      'preflight',
      [],
      [
        'node scripts/verify-missing-layers-overlay.mjs --repo .',
        'node scripts/verify-missing-layers-worker-packets.mjs --repo .',
        'node scripts/verify-missing-layers-low-risk-patches.mjs --repo .',
        'node scripts/verify-missing-layers-family-closure-patches.mjs --repo .',
        'node scripts/verify-missing-layers-direct-patch-candidates.mjs --repo .',
        'npm run verify:future-native-project-state-fast',
      ],
      'low',
      [
        'まだ CURRENT_STATUS / REVIEW / DOCS_INDEX は更新しない。',
        'まず additive overlay 側の整合だけを固定する。',
      ],
    ),
    stage(
      'stage-1-pbd-direct',
      'Review-ready PBD direct patch candidates',
      'direct-patch',
      pbd,
      uniq([...pbd.flatMap((item) => item.verifyCommands), 'npm run verify:future-native-nonvolumetric-routes']),
      'low',
      [
        'PBD 群は nonvolumetric routes 前提でまとめて戻す。',
        'surface integration は局所 verify として維持し、manifest 正本はまだ触らない。',
      ],
    ),
    stage(
      'stage-2-mpm-direct',
      'Review-ready MPM direct patch candidates',
      'direct-patch',
      mpm,
      uniq([...mpm.flatMap((item) => item.verifyCommands), 'npm run verify:future-native-nonvolumetric-routes']),
      'low',
      [
        'MPM 群は PBD の後に戻す。',
        'UI truth より runtime / preset / preview evidence を先に固める。',
      ],
    ),
    stage(
      'stage-3-fracture-direct',
      'Review-ready fracture direct patch candidates',
      'direct-patch',
      fracture,
      uniq([...fracture.flatMap((item) => item.verifyCommands), 'npm run verify:future-native-nonvolumetric-routes']),
      'medium',
      [
        'fracture は debris / crack propagation の意味衝突をまとめて確認する。',
        'render handoff 影響が見えた場合は単独 family 統合へ降格させる。',
      ],
    ),
    stage(
      'stage-4-volumetric-core',
      'Review-ready volumetric direct patch candidates except smoke',
      'direct-patch',
      volumetricCore,
      uniq([...volumetricCore.flatMap((item) => item.verifyCommands), 'npm run verify:future-native-volumetric-routes']),
      'medium',
      [
        'volumetric core は smoke を分離して先に戻す。',
        'volumetric routes と safe pipeline core を一緒に確認する。',
      ],
    ),
    stage(
      'stage-5-volumetric-smoke-review',
      'Volumetric smoke review gate',
      'mainline-review',
      volumetricSmoke,
      uniq([...volumetricSmoke.flatMap((item) => item.verifyCommands), 'npm run verify:future-native-safe-pipeline:core']),
      'high',
      [
        'volumetric-smoke は needs-review のため direct merge しない。',
        'mainline owner が routing / preview / package truth への影響を確認してから扱う。',
      ],
    ),
    stage(
      'stage-6-specialist-review',
      'Specialist-native mainline review queue',
      'patch-with-mainline-review',
      specialistItems,
      uniq([
        ...specialistItems.flatMap((item) => item.verifyCommands),
        'npm run verify:future-native-specialist-routes',
        'npm run verify:future-native-specialist-runtime-export-regression',
      ]),
      'high',
      [
        'specialist-native 4 family は patch-with-mainline-review のまま維持する。',
        'nonvolumetric routes と specialist export regression を両方確認する。',
      ],
    ),
    stage(
      'stage-7-truth-sync-closeout',
      'Truth sync and closeout',
      'docs-truth-sync',
      reviewReadyDirect,
      [
        'npm run verify:future-native-project-state-fast',
        'npm run verify:future-native-safe-pipeline:core',
      ],
      'high',
      [
        'ここで初めて CURRENT_STATUS / REVIEW / DOCS_INDEX を同期する。',
        'overlay generated index と docs truth の数値を一致させる。',
        'needs-review 系が残っている場合は closeout に未解決点として明記する。',
      ],
    ),
  ];

  const enrichedStages = stages.map((item) => {
    const coverage = verifyCoverage(item.verifyCommands, existingScripts);
    return {
      ...item,
      verifyCoverage: coverage,
      verifyCoverageSummary: {
        totalCommands: coverage.length,
        existingScriptCount: coverage.filter((value) => value.exists).length,
        missingScriptCount: coverage.filter((value) => !value.exists).length,
      },
    };
  });

  const index = {
    meta: {
      createdAt: '2026-04-06',
      kind: 'mainline-integration-order',
      sources: {
        directIndex: path.relative(repoRoot, directIndexPath),
        familyIndex: path.relative(repoRoot, familyIndexPath),
        packageJson: 'package.json',
      },
    },
    summary: {
      stageCount: enrichedStages.length,
      directPatchCandidateCount: directItems.length,
      reviewReadyDirectCount: reviewReadyDirect.length,
      needsReviewDirectCount: needsReviewDirect.length,
      specialistReviewCount: specialistItems.length,
      verifyCommandCount: uniq(enrichedStages.flatMap((item) => item.verifyCommands)).length,
      missingVerifyScriptCount: enrichedStages.reduce((sum, item) => sum + item.verifyCoverageSummary.missingScriptCount, 0),
      overallMergeReadinessPercent: 75,
    },
    stages: enrichedStages,
  };

  writeText(outJson, JSON.stringify(index, null, 2));
  writeText(outMd, renderIndexMd(index));

  console.log(JSON.stringify({ ok: true, summary: index.summary, outJson: path.relative(repoRoot, outJson), outMd: path.relative(repoRoot, outMd) }, null, 2));
}

main();
