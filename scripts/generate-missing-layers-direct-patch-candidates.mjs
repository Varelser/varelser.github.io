#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    repo: process.cwd(),
    familyIndex: null,
    outJson: null,
    outMd: null,
    outDir: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--family-index') args.familyIndex = argv[++i];
    else if (arg === '--out-json') args.outJson = argv[++i];
    else if (arg === '--out-md') args.outMd = argv[++i];
    else if (arg === '--out-dir') args.outDir = argv[++i];
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

function renderCandidateMd(item) {
  const verifyLines = item.verifyCommands.map((cmd) => `- \`${cmd}\``).join('\n');
  const zoneLines = item.touchableZones.map((zone) => `- ${zone}`).join('\n');
  const evidenceLines = item.keyEvidencePaths.map((value) => `- ${value}`).join('\n');
  const runtimeLines = item.keyRuntimeFiles.map((value) => `- ${value}`).join('\n');
  const untouchedLines = item.untouchedTrunks.map((value) => `- ${value}`).join('\n');
  const decisionLines = item.mainlineDecisionPoints.map((value) => `- ${value}`).join('\n');
  const riskLines = item.riskNotes.map((value) => `- ${value}`).join('\n');
  return `# ${item.title} direct patch candidate

- patchId: ${item.patchId}
- familyId: ${item.familyId}
- group: ${item.group}
- progressPercent: ${item.progressPercent}
- officialStateCandidate: ${item.officialStateCandidate}
- closureCandidate: ${item.closureCandidate}
- ownershipClass: ${item.ownershipClass}
- mergeClass: direct-patch-candidate

## Ready-to-return outputs

- ${item.familyId} evidence note md
- ${item.familyId} verify checklist md
- ${item.familyId} closure gap memo md
- ${item.familyId} mainline handoff summary md

## Verify commands

${verifyLines}

## Touchable zones

${zoneLines}

## Key evidence paths

${evidenceLines}

## Key runtime files

${runtimeLines}

## Untouched trunks

${untouchedLines}

## Mainline decision points

${decisionLines}

## Risk notes

${riskLines}

## Return template

\`\`\`md
- 対象: ${item.familyId}
- 種別: patch
- 触った範囲: docs/handoff, generated/handoff, lib/future-native-families の局所
- 触っていない幹線: manifest / registry / routing / CURRENT_STATUS / REVIEW / DOCS_INDEX
- 実行 verify: 
- 残件: 
- mainline 判断が必要な点: 
\`\`\`
`;
}

function renderIndexMd(index) {
  const rows = index.directPatchCandidates
    .map((item) => `| ${item.familyId} | ${item.group} | ${item.progressPercent} | ${item.officialStateCandidate} | ${item.closureCandidate} | ${item.verifyCommands.length} |`)
    .join('\n');
  return `# KALOKAGATHIA Wave 5 direct patch candidate index

- 作成日: 2026-04-06
- directPatchCandidateCount: ${index.summary.directPatchCandidateCount}
- reviewReadyCandidates: ${index.summary.reviewReadyCandidates}
- needsReviewCandidates: ${index.summary.needsReviewCandidates}
- progressPercentAverage: ${index.summary.progressPercentAverage}

## Candidate summary

| familyId | group | progress | state | closure | verify count |
|---|---|---:|---|---|---:|
${rows}
`;
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(args.repo);
  const familyIndexPath = path.resolve(
    args.familyIndex ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'family-closure-patch-index-2026-04-06.json'),
  );
  const outJson = path.resolve(
    args.outJson ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'direct-patch-candidate-index-2026-04-06.json'),
  );
  const outMd = path.resolve(
    args.outMd ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'direct-patch-candidate-index-2026-04-06.md'),
  );
  const outDir = path.resolve(
    args.outDir ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'direct-patch-candidates-2026-04-06'),
  );

  const familyIndex = readJson(familyIndexPath);
  const sourceItems = (familyIndex.familyPatches ?? []).filter((item) => item.recommendedReturnUnit === 'patch');
  const directPatchCandidates = sourceItems.map((item) => ({
    patchId: `direct-${item.familyId}`,
    familyId: item.familyId,
    title: item.title,
    group: item.group,
    progressPercent: item.progressPercent,
    officialStateCandidate: item.officialStateCandidate,
    closureCandidate: item.closureCandidate,
    ownershipClass: item.ownershipClass,
    verifyCommands: uniq(item.verifyCommands),
    touchableZones: uniq(item.touchableZones),
    keyEvidencePaths: uniq(item.keyEvidencePaths),
    keyRuntimeFiles: uniq(item.keyRuntimeFiles),
    untouchedTrunks: uniq(item.untouchedTrunks),
    mainlineDecisionPoints: uniq(item.mainlineDecisionPoints),
    riskNotes: uniq([
      ...(item.closureCandidate !== 'review-ready'
        ? ['closureCandidate が review-ready ではないため mainline 判定前に単独統合しない']
        : []),
      ...(item.riskNotes ?? []),
    ]),
    sourceFamilyPatchId: item.patchId,
    overlayRelPath: `generated/handoff/missing-layers/direct-patch-candidates-2026-04-06/direct-patch-${item.familyId}.md`,
  }));

  const summary = {
    directPatchCandidateCount: directPatchCandidates.length,
    reviewReadyCandidates: directPatchCandidates.filter((item) => item.closureCandidate === 'review-ready').length,
    needsReviewCandidates: directPatchCandidates.filter((item) => item.closureCandidate !== 'review-ready').length,
    progressPercentAverage: Number(
      (directPatchCandidates.reduce((sum, item) => sum + item.progressPercent, 0) / Math.max(directPatchCandidates.length, 1)).toFixed(2),
    ),
    groups: Object.fromEntries(
      [...new Set(directPatchCandidates.map((item) => item.group))]
        .sort()
        .map((group) => [group, directPatchCandidates.filter((item) => item.group === group).length]),
    ),
  };

  fs.mkdirSync(outDir, { recursive: true });
  for (const item of directPatchCandidates) {
    const filePath = path.join(outDir, `direct-patch-${item.familyId}.md`);
    writeText(filePath, renderCandidateMd(item));
  }

  const index = {
    meta: {
      createdAt: '2026-04-06',
      kind: 'direct-patch-candidate-index',
      source: path.relative(repoRoot, familyIndexPath),
    },
    summary,
    directPatchCandidates,
  };

  writeText(outJson, JSON.stringify(index, null, 2));
  writeText(outMd, renderIndexMd(index));

  console.log(
    JSON.stringify(
      {
        ok: true,
        summary,
        outJson: path.relative(repoRoot, outJson),
        outMd: path.relative(repoRoot, outMd),
        outDir: path.relative(repoRoot, outDir),
      },
      null,
      2,
    ),
  );
}

main();
