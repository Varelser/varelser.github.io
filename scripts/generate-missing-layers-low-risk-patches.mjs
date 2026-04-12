#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    repo: process.cwd(),
    seed: null,
    matrix: null,
    outJson: null,
    outMd: null,
    outDir: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--seed') args.seed = argv[++i];
    else if (arg === '--matrix') args.matrix = argv[++i];
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
  return [...new Set(values.filter(Boolean))];
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

function buildCommonTrunks() {
  return [
    'manifest 正本の意味変更',
    'registry 正本の意味変更',
    'routing 正本の意味変更',
    'package class の最終決定',
    'CURRENT_STATUS.md の最終同期',
    'REVIEW.md / DOCS_INDEX.md の最終 truth 化',
  ];
}

function groupFamilyPackets(matrix) {
  const out = new Map();
  for (const packet of matrix.familyPackets) {
    const arr = out.get(packet.group) ?? [];
    arr.push(packet);
    out.set(packet.group, arr);
  }
  for (const arr of out.values()) {
    arr.sort((a, b) => a.familyId.localeCompare(b.familyId));
  }
  return out;
}

function bundleFromRole(packet, packageScripts, seed) {
  const summary = matrixSummary(seed, null);
  const bundleIdMap = {
    'role-audio-hotspots': 'bundle-audio-hotspot-evidence',
    'role-verification-core': 'bundle-verification-baseline',
    'role-docs-package': 'bundle-docs-package-evidence',
    'role-archive-duplicate-audit': 'bundle-archive-duplicate-audit',
  };
  const titleMap = {
    'role-audio-hotspots': 'Audio hotspot low-risk patch bundle',
    'role-verification-core': 'Verification baseline low-risk patch bundle',
    'role-docs-package': 'Docs and package evidence low-risk patch bundle',
    'role-archive-duplicate-audit': 'Archive duplicate audit low-risk patch bundle',
  };
  const scopeMap = {
    'role-audio-hotspots': 'audio-hotspot-audit',
    'role-verification-core': 'verification-baseline',
    'role-docs-package': 'docs-package-evidence',
    'role-archive-duplicate-audit': 'archive-duplicate-audit',
  };
  const expectedOutputs = {
    'role-audio-hotspots': [
      'audio hotspot evidence note md',
      'audio verify checklist md',
      'audio split proposal md',
    ],
    'role-verification-core': [
      'verification checklist md',
      'proof index md',
      'verify gap note md',
    ],
    'role-docs-package': [
      'docs evidence note md',
      'package class evidence note md',
      'handoff contradiction memo md',
    ],
    'role-archive-duplicate-audit': [
      'archive duplicate audit md',
      'same-relative-path danger list md',
      'mainline escalation memo md',
    ],
  };
  const riskNotes = {
    'role-audio-hotspots': [
      `audio hotspot ${summary.audioHotspots} 本のうち長大 file を含む`,
      'local split 提案までは low-risk だが global routing 変更は禁止',
    ],
    'role-verification-core': [
      'verify baseline は additive でよい',
      'global criteria の最終固定は mainline へ戻す',
    ],
    'role-docs-package': [
      'docs truth は先に確定しない',
      'package class の最終決定は禁止',
    ],
    'role-archive-duplicate-audit': [
      `archive duplicate ${summary.archiveDuplicates} 件は誤統合事故源`,
      'audit は low-risk だが archive 削除や移動は mainline 判断',
    ],
  };
  return {
    bundleId: bundleIdMap[packet.packetId],
    title: titleMap[packet.packetId],
    bundleClass: 'low-risk-docs-generated-patch',
    scope: scopeMap[packet.packetId],
    recommendedRole: packet.recommendedRole,
    recommendedReturnUnit: 'patch',
    includedPackets: [packet.packetId],
    includedFamilies: [],
    includedGroups: [],
    verifyCommands: keepExistingCommands(packet.verifyCommands, packageScripts),
    untouchedTrunks: uniq([...(packet.untouchedTrunks ?? []), ...buildCommonTrunks()]),
    mainlineDecisionPoints: packet.mainlineDecisionPoints,
    candidateAdditiveOutputs: expectedOutputs[packet.packetId],
    riskNotes: riskNotes[packet.packetId],
  };
}

function matrixSummary(seed, matrix) {
  return {
    familyCount: seed.futureNativeFamilies.length,
    archiveDuplicates: seed.archiveDuplicatePaths.length,
    audioHotspots: (seed.conflictHotspots?.largeImplementationFiles ?? []).filter((entry) => entry.path.includes('Audio') || entry.path.includes('audio')).length,
    totalPackets: matrix?.summary?.totalPackets ?? 0,
  };
}

function familyBundleId(group) {
  const map = {
    pbd: 'bundle-pbd-family-closure-evidence',
    mpm: 'bundle-mpm-family-closure-evidence',
    fracture: 'bundle-fracture-family-closure-evidence',
    volumetric: 'bundle-volumetric-family-closure-evidence',
    'specialist-native': 'bundle-specialist-family-mainline-review',
  };
  return map[group] ?? `bundle-${slugify(group)}-family-evidence`;
}

function familyBundleTitle(group) {
  const map = {
    pbd: 'PBD family closure evidence bundle',
    mpm: 'MPM family closure evidence bundle',
    fracture: 'Fracture family closure evidence bundle',
    volumetric: 'Volumetric family closure evidence bundle',
    'specialist-native': 'Specialist native family mainline review bundle',
  };
  return map[group] ?? `${group} family closure evidence bundle`;
}

function familyExpectedOutputs(group) {
  const common = [
    'family evidence note md',
    'family verify checklist md',
    'family closure gap note md',
  ];
  if (group === 'specialist-native') {
    return [
      'specialist family evidence note md',
      'specialist route / export gap note md',
      'mainline review memo md',
    ];
  }
  return common;
}

function familyRiskNotes(group, packets) {
  const partialCount = packets.filter((packet) => packet.officialStateCandidate !== 'implemented').length;
  const mainlineOnly = packets.filter((packet) => packet.ownershipClass === 'mainline-only').length;
  const notes = [
    `${packets.length} family packet をまとめる group bundle`,
    `${partialCount} family が implemented 以外候補`,
  ];
  if (mainlineOnly > 0) notes.push(`${mainlineOnly} family は mainline-only 候補を含む`);
  if (group === 'volumetric') notes.push('scene / preset / runtime coupling の確認を先に行う');
  if (group === 'mpm') notes.push('helper / runtime renderer の長大 file に注意する');
  if (group === 'pbd') notes.push('surface integration / rope payload 接続不足を確認する');
  if (group === 'fracture') notes.push('scene binding と preset 導線の実接続を確認する');
  if (group === 'specialist-native') notes.push('specialist family は final closure を mainline が握る');
  return notes;
}

function buildFamilyBundle(group, packets, packageScripts) {
  const verifyCommands = keepExistingCommands([
    ...packets.flatMap((packet) => packet.verifyCommands ?? []),
    'npm run verify:future-native-project-state-fast',
    group === 'volumetric' ? 'npm run verify:future-native-volumetric-routes' : 'npm run verify:future-native-nonvolumetric-routes',
  ], packageScripts);
  return {
    bundleId: familyBundleId(group),
    title: familyBundleTitle(group),
    bundleClass: 'low-risk-docs-generated-patch',
    scope: `family-${group}`,
    recommendedRole: packets[0]?.recommendedRole ?? 'family-general-worker',
    recommendedReturnUnit: group === 'specialist-native' ? 'patch-with-mainline-review' : 'patch',
    includedPackets: packets.map((packet) => packet.packetId),
    includedFamilies: packets.map((packet) => packet.familyId),
    includedGroups: [group],
    verifyCommands,
    untouchedTrunks: buildCommonTrunks(),
    mainlineDecisionPoints: uniq(packets.flatMap((packet) => packet.mainlineDecisionPoints ?? [])),
    candidateAdditiveOutputs: familyExpectedOutputs(group),
    riskNotes: familyRiskNotes(group, packets),
  };
}

function renderBundleMd(bundle, packetMap, outRelPath) {
  const packetLines = bundle.includedPackets
    .map((packetId) => {
      const packet = packetMap.get(packetId);
      if (!packet) return `- ${packetId}`;
      const label = packet.familyId ? `${packetId} (${packet.familyId})` : `${packetId} (${packet.recommendedRole ?? packet.packetType})`;
      return `- ${label}`;
    })
    .join('\n');

  const familyLines = bundle.includedFamilies.length > 0
    ? bundle.includedFamilies.map((familyId) => `- ${familyId}`).join('\n')
    : '- none';

  const groupLines = bundle.includedGroups.length > 0
    ? bundle.includedGroups.map((group) => `- ${group}`).join('\n')
    : '- none';

  const verifyLines = bundle.verifyCommands.length > 0
    ? bundle.verifyCommands.map((cmd) => `- \`${cmd}\``).join('\n')
    : '- none';

  const outputLines = bundle.candidateAdditiveOutputs.map((item) => `- ${item}`).join('\n');
  const trunkLines = bundle.untouchedTrunks.map((item) => `- ${item}`).join('\n');
  const decisionLines = bundle.mainlineDecisionPoints.map((item) => `- ${item}`).join('\n');
  const riskLines = bundle.riskNotes.map((item) => `- ${item}`).join('\n');

  return `# ${bundle.title}\n\n- bundleId: ${bundle.bundleId}\n- bundleClass: ${bundle.bundleClass}\n- scope: ${bundle.scope}\n- recommendedRole: ${bundle.recommendedRole}\n- recommendedReturnUnit: ${bundle.recommendedReturnUnit}\n- overlayPath: ${outRelPath}\n\n## Scope\n\n- この bundle は low-risk の additive patch 候補に限定する\n- manifest / registry / routing / docs truth の最終決定は含めない\n\n## Included packets\n\n${packetLines}\n\n## Included families\n\n${familyLines}\n\n## Included groups\n\n${groupLines}\n\n## Verify commands\n\n${verifyLines}\n\n## Untouched trunks\n\n${trunkLines}\n\n## Mainline decision points\n\n${decisionLines}\n\n## Candidate additive outputs\n\n${outputLines}\n\n## Risk notes\n\n${riskLines}\n\n## Worker return template\n\n\`\`\`md\n- 対象: ${bundle.scope}\n- 種別: ${bundle.recommendedReturnUnit.includes('branch') ? 'branch' : 'patch'}\n- 触った範囲: \n- 触っていない幹線: \n- 実行 verify: \n- 残件: \n- mainline 判断が必要な点: \n\`\`\`\n`;
}

function buildSummaryMd(index) {
  const bundleRows = index.bundles
    .map((bundle) => `| ${bundle.bundleId} | ${bundle.scope} | ${bundle.includedPackets.length} | ${bundle.recommendedRole} | ${bundle.recommendedReturnUnit} |`)
    .join('\n');
  return `# KALOKAGATHIA Wave 3 low-risk patch bundle index\n\n- 作成日: 2026-04-06\n- bundleCount: ${index.summary.bundleCount}\n- totalIncludedPackets: ${index.summary.totalIncludedPackets}\n- familyBundles: ${index.summary.familyBundles}\n- roleBundles: ${index.summary.roleBundles}\n\n## Bundle summary\n\n| bundleId | scope | packets | role | return |\n|---|---:|---:|---|---|\n${bundleRows}\n`;
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(args.repo);
  const seedPath = path.resolve(args.seed ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'official-ledger-seed-2026-04-06.json'));
  const matrixPath = path.resolve(args.matrix ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'worker-evidence-matrix-2026-04-06.json'));
  const outJson = path.resolve(args.outJson ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'low-risk-patch-bundles-2026-04-06.json'));
  const outMd = path.resolve(args.outMd ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'low-risk-patch-bundles-2026-04-06.md'));
  const outDir = path.resolve(args.outDir ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'low-risk-patches-2026-04-06'));

  const seed = readJson(seedPath);
  const matrix = readJson(matrixPath);
  const packageScripts = parsePackageScripts(repoRoot);
  const packetMap = new Map([...matrix.familyPackets, ...matrix.rolePackets].map((packet) => [packet.packetId, packet]));
  const familyByGroup = groupFamilyPackets(matrix);

  const roleBundles = matrix.rolePackets.map((packet) => bundleFromRole(packet, packageScripts, seed));
  const familyBundles = [...familyByGroup.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([group, packets]) => buildFamilyBundle(group, packets, packageScripts));
  const bundles = [...roleBundles, ...familyBundles].sort((a, b) => a.bundleId.localeCompare(b.bundleId));

  const index = {
    meta: {
      generatedAt: '2026-04-06',
      repoRoot,
      seedPath,
      matrixPath,
      outDir,
    },
    summary: {
      bundleCount: bundles.length,
      roleBundles: roleBundles.length,
      familyBundles: familyBundles.length,
      totalIncludedPackets: bundles.reduce((sum, bundle) => sum + bundle.includedPackets.length, 0),
      futureNativeFamilies: seed.futureNativeFamilies.length,
      archiveDuplicates: seed.archiveDuplicatePaths.length,
      audioHotspots: (seed.conflictHotspots?.largeImplementationFiles ?? []).filter((entry) => entry.path.includes('Audio') || entry.path.includes('audio')).length,
      mainlineReviewBundles: bundles.filter((bundle) => bundle.recommendedReturnUnit.includes('mainline')).length,
    },
    bundles,
    coverage: {
      familyGroups: Object.fromEntries([...familyByGroup.entries()].map(([group, packets]) => [group, packets.length])),
      rolePacketIds: matrix.rolePackets.map((packet) => packet.packetId),
    },
  };

  writeText(outJson, JSON.stringify(index, null, 2) + '\n');
  writeText(outMd, buildSummaryMd(index));
  fs.mkdirSync(outDir, { recursive: true });

  for (const bundle of bundles) {
    const fileName = `${slugify(bundle.bundleId)}.md`;
    const outPath = path.join(outDir, fileName);
    const outRel = path.relative(path.dirname(outJson), outPath).replaceAll(path.sep, '/');
    writeText(outPath, renderBundleMd(bundle, packetMap, outRel));
  }

  console.log(JSON.stringify({
    ok: true,
    outJson,
    outMd,
    outDir,
    bundleCount: index.summary.bundleCount,
    roleBundles: index.summary.roleBundles,
    familyBundles: index.summary.familyBundles,
    totalIncludedPackets: index.summary.totalIncludedPackets,
  }, null, 2));
}

main();
