#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    repo: process.cwd(),
    matrix: null,
    lowRisk: null,
    outJson: null,
    outMd: null,
    outDir: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--matrix') args.matrix = argv[++i];
    else if (arg === '--low-risk') args.lowRisk = argv[++i];
    else if (arg === '--out-json') args.outJson = argv[++i];
    else if (arg === '--out-md') args.outMd = argv[++i];
    else if (arg === '--out-dir') args.outDir = argv[++i];
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeText(filePath, text) {
  ensureParent(filePath);
  fs.writeFileSync(filePath, text);
}

function uniq(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parsePackageScripts(repoRoot) {
  const pkgPath = path.join(repoRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return pkg.scripts ?? {};
}

function keepExistingCommands(commands, packageScripts) {
  return uniq(commands).filter((cmd) => {
    const match = cmd.match(/^npm run ([^\s]+)/);
    return match ? Boolean(packageScripts[match[1]]) : true;
  });
}

function groupOrder(group) {
  const order = ['pbd', 'mpm', 'fracture', 'volumetric', 'specialist-native'];
  const idx = order.indexOf(group);
  return idx === -1 ? order.length + 1 : idx;
}

function classifyPatch(packet) {
  if (packet.group === 'specialist-native') return 'patch-with-mainline-review';
  if (packet.ownershipClass === 'mainline-only') return 'patch-with-mainline-review';
  return 'patch';
}

function familyBundleMap(lowRisk) {
  const map = new Map();
  for (const bundle of lowRisk.bundles ?? []) {
    for (const familyId of bundle.includedFamilies ?? []) {
      map.set(familyId, bundle.bundleId);
    }
  }
  return map;
}

function existingCount(repoRoot, relPaths) {
  let count = 0;
  for (const rel of relPaths ?? []) {
    if (fs.existsSync(path.join(repoRoot, rel))) count += 1;
  }
  return count;
}

function dirPrefixes(relPaths) {
  const items = [];
  for (const rel of relPaths ?? []) {
    const parts = rel.split('/');
    if (parts.length >= 2) items.push(parts.slice(0, 2).join('/'));
    else if (parts.length >= 1) items.push(parts[0]);
  }
  return uniq(items).sort();
}

function limitList(values, max = 14) {
  return uniq(values).sort().slice(0, max);
}

function buildExitCriteria(packet) {
  const criteria = [
    'family evidence note が現物パスと矛盾しない',
    'verify 実行結果と officialState 候補が矛盾しない',
    'scene bridge / preset patch / runtime の接続確認結果が記録される',
    'manifest / registry / routing の正本意味変更を含めない',
    'mainline 判断点が返却 bundle に明記される',
  ];
  if (packet.group === 'volumetric') criteria.unshift('volumetric route verify の結果を添付する');
  if (packet.group === 'specialist-native') criteria.unshift('specialist route / export / runtime 差分を mainline review へ戻す');
  return criteria;
}

function buildRiskNotes(packet, evidenceExisting, runtimeExisting) {
  const notes = [
    `evidence ${evidenceExisting}/${packet.evidencePaths.length} paths exist`,
    `runtime ${runtimeExisting}/${packet.runtimeFiles.length} files exist`,
    `${packet.progressPercent}% progress candidate / ${packet.currentStage}`,
    `${packet.officialStateCandidate} / ${packet.closureCandidate} / ${packet.ownershipClass}`,
  ];
  if (packet.group === 'pbd') notes.push('surface integration / rope payload の取り違えに注意');
  if (packet.group === 'mpm') notes.push('starter-runtime renderer helper と scene bridge の差分に注意');
  if (packet.group === 'fracture') notes.push('preset / scene binding と crack / debris runtime の対応確認が必要');
  if (packet.group === 'volumetric') notes.push('route verify と density / pressure / lighting coupling の組み合わせ確認が必要');
  if (packet.group === 'specialist-native') notes.push('specialist family は docs-only で閉じず mainline review が必要');
  return notes;
}

function renderFamilyPatchMd(patch, outRelPath) {
  const verifyLines = patch.verifyCommands.map((cmd) => `- \`${cmd}\``).join('\n');
  const evidenceLines = patch.keyEvidencePaths.map((item) => `- ${item}`).join('\n');
  const runtimeLines = patch.keyRuntimeFiles.map((item) => `- ${item}`).join('\n');
  const zoneLines = patch.touchableZones.map((item) => `- ${item}`).join('\n');
  const trunkLines = patch.untouchedTrunks.map((item) => `- ${item}`).join('\n');
  const decisionLines = patch.mainlineDecisionPoints.map((item) => `- ${item}`).join('\n');
  const outputLines = patch.candidateOutputs.map((item) => `- ${item}`).join('\n');
  const exitLines = patch.exitCriteria.map((item) => `- ${item}`).join('\n');
  const riskLines = patch.riskNotes.map((item) => `- ${item}`).join('\n');
  return `# ${patch.title} family closure patch blueprint\n\n- patchId: ${patch.patchId}\n- familyId: ${patch.familyId}\n- group: ${patch.group}\n- progressPercent: ${patch.progressPercent}\n- officialStateCandidate: ${patch.officialStateCandidate}\n- closureCandidate: ${patch.closureCandidate}\n- ownershipClass: ${patch.ownershipClass}\n- recommendedReturnUnit: ${patch.recommendedReturnUnit}\n- lowRiskBundleId: ${patch.lowRiskBundleId}\n- overlayPath: ${outRelPath}\n\n## Evidence coverage\n\n- declaredEvidencePaths: ${patch.declaredEvidencePaths}\n- existingEvidencePaths: ${patch.existingEvidencePaths}\n- declaredRuntimeFiles: ${patch.declaredRuntimeFiles}\n- existingRuntimeFiles: ${patch.existingRuntimeFiles}\n\n## Verify commands\n\n${verifyLines}\n\n## Touchable zones\n\n${zoneLines}\n\n## Key evidence paths\n\n${evidenceLines}\n\n## Key runtime files\n\n${runtimeLines}\n\n## Untouched trunks\n\n${trunkLines}\n\n## Mainline decision points\n\n${decisionLines}\n\n## Candidate outputs\n\n${outputLines}\n\n## Exit criteria\n\n${exitLines}\n\n## Risk notes\n\n${riskLines}\n\n## Return template\n\n\`\`\`md\n- 対象: ${patch.familyId}\n- 種別: ${patch.recommendedReturnUnit}\n- 触った範囲: \n- 触っていない幹線: \n- 実行 verify: \n- 残件: \n- mainline 判断が必要な点: \n\`\`\`\n`;
}

function renderIndexMd(index) {
  const rows = index.familyPatches.map((patch) => `| ${patch.familyId} | ${patch.group} | ${patch.progressPercent} | ${patch.officialStateCandidate} | ${patch.closureCandidate} | ${patch.recommendedReturnUnit} | ${patch.existingEvidencePaths}/${patch.declaredEvidencePaths} | ${patch.existingRuntimeFiles}/${patch.declaredRuntimeFiles} |`).join('\n');
  return `# KALOKAGATHIA Wave 4 family closure patch index\n\n- 作成日: 2026-04-06\n- familyPatchCount: ${index.summary.familyPatchCount}\n- directPatchCandidates: ${index.summary.directPatchCandidates}\n- mainlineReviewCandidates: ${index.summary.mainlineReviewCandidates}\n- implementedCandidates: ${index.summary.implementedCandidates}\n- reviewReadyCandidates: ${index.summary.reviewReadyCandidates}\n- familyCoveragePercent: ${index.summary.familyCoveragePercent}\n\n## Family summary\n\n| familyId | group | progress | state | closure | return | evidence | runtime |\n|---|---|---:|---|---|---|---:|---:|\n${rows}\n`;
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(args.repo);
  const matrixPath = path.resolve(args.matrix ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'worker-evidence-matrix-2026-04-06.json'));
  const lowRiskPath = path.resolve(args.lowRisk ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'low-risk-patch-bundles-2026-04-06.json'));
  const outJson = path.resolve(args.outJson ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'family-closure-patch-index-2026-04-06.json'));
  const outMd = path.resolve(args.outMd ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'family-closure-patch-index-2026-04-06.md'));
  const outDir = path.resolve(args.outDir ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'family-closure-patches-2026-04-06'));

  const matrix = readJson(matrixPath);
  const lowRisk = readJson(lowRiskPath);
  const packageScripts = parsePackageScripts(repoRoot);
  const bundleByFamily = familyBundleMap(lowRisk);

  const familyPatches = [...matrix.familyPackets]
    .sort((a, b) => groupOrder(a.group) - groupOrder(b.group) || a.familyId.localeCompare(b.familyId))
    .map((packet) => {
      const verifyCommands = keepExistingCommands(packet.verifyCommands, packageScripts);
      const evidenceExisting = existingCount(repoRoot, packet.evidencePaths);
      const runtimeExisting = existingCount(repoRoot, packet.runtimeFiles);
      const patchId = `family-closure-${packet.familyId}`;
      const lowRiskBundleId = bundleByFamily.get(packet.familyId) ?? null;
      const recommendedReturnUnit = classifyPatch(packet);
      const touchableZones = limitList([
        ...dirPrefixes(packet.evidencePaths),
        ...dirPrefixes(packet.runtimeFiles),
      ], 10);
      const candidateOutputs = [
        `${packet.familyId} evidence note md`,
        `${packet.familyId} verify checklist md`,
        `${packet.familyId} closure gap memo md`,
      ];
      if (recommendedReturnUnit.includes('mainline')) candidateOutputs.push(`${packet.familyId} mainline review memo md`);
      return {
        patchId,
        title: packet.title,
        familyId: packet.familyId,
        group: packet.group,
        progressPercent: packet.progressPercent,
        officialStateCandidate: packet.officialStateCandidate,
        closureCandidate: packet.closureCandidate,
        ownershipClass: packet.ownershipClass,
        recommendedReturnUnit,
        lowRiskBundleId,
        verifyCommands,
        declaredEvidencePaths: packet.evidencePaths.length,
        existingEvidencePaths: evidenceExisting,
        declaredRuntimeFiles: packet.runtimeFiles.length,
        existingRuntimeFiles: runtimeExisting,
        keyEvidencePaths: limitList(packet.evidencePaths, 12),
        keyRuntimeFiles: limitList(packet.runtimeFiles, 12),
        touchableZones,
        untouchedTrunks: uniq(packet.untouchedTrunks),
        mainlineDecisionPoints: uniq(packet.mainlineDecisionPoints),
        candidateOutputs,
        exitCriteria: buildExitCriteria(packet),
        riskNotes: buildRiskNotes(packet, evidenceExisting, runtimeExisting),
      };
    });

  const summary = {
    familyPatchCount: familyPatches.length,
    directPatchCandidates: familyPatches.filter((patch) => patch.recommendedReturnUnit === 'patch').length,
    mainlineReviewCandidates: familyPatches.filter((patch) => patch.recommendedReturnUnit !== 'patch').length,
    implementedCandidates: familyPatches.filter((patch) => patch.officialStateCandidate === 'implemented').length,
    reviewReadyCandidates: familyPatches.filter((patch) => patch.closureCandidate === 'review-ready').length,
    familyCoveragePercent: familyPatches.length === matrix.familyPackets.length ? 100 : Math.round((familyPatches.length / Math.max(matrix.familyPackets.length, 1)) * 100),
    groups: Object.fromEntries(uniq(familyPatches.map((patch) => patch.group)).sort().map((group) => [group, familyPatches.filter((patch) => patch.group === group).length])),
  };

  const index = {
    meta: {
      generatedAt: '2026-04-06',
      repoRoot,
      matrixPath,
      lowRiskPath,
      outDir,
    },
    summary,
    familyPatches,
  };

  writeText(outJson, JSON.stringify(index, null, 2) + '\n');
  writeText(outMd, renderIndexMd(index));
  fs.mkdirSync(outDir, { recursive: true });

  for (const patch of familyPatches) {
    const fileName = `${slugify(patch.patchId)}.md`;
    const outPath = path.join(outDir, fileName);
    const outRel = path.relative(path.dirname(outJson), outPath).replaceAll(path.sep, '/');
    writeText(outPath, renderFamilyPatchMd(patch, outRel));
  }

  console.log(JSON.stringify({
    ok: true,
    outJson,
    outMd,
    outDir,
    familyPatchCount: summary.familyPatchCount,
    directPatchCandidates: summary.directPatchCandidates,
    mainlineReviewCandidates: summary.mainlineReviewCandidates,
    implementedCandidates: summary.implementedCandidates,
    reviewReadyCandidates: summary.reviewReadyCandidates,
  }, null, 2));
}

main();
