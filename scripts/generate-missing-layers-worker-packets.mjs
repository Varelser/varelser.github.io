#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    repo: process.cwd(),
    seed: null,
    outJson: null,
    outMd: null,
    outDir: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--seed') args.seed = argv[++i];
    else if (arg === '--out-json') args.outJson = argv[++i];
    else if (arg === '--out-md') args.outMd = argv[++i];
    else if (arg === '--out-dir') args.outDir = argv[++i];
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function walkFiles(dirPath) {
  const out = [];
  if (!fs.existsSync(dirPath)) return out;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function relative(repoRoot, fullPath) {
  return path.relative(repoRoot, fullPath).replaceAll(path.sep, '/');
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function lineCount(filePath) {
  return fs.readFileSync(filePath, 'utf8').split('\n').length;
}

function parsePackageScripts(repoRoot) {
  const pkgPath = path.join(repoRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return pkg.scripts ?? {};
}

function computeArchiveDuplicates(repoRoot) {
  const archiveRoot = path.join(repoRoot, 'docs', 'archive', 'merge_final_conflicts_2026-04-05');
  const duplicates = [];
  if (!fs.existsSync(archiveRoot)) return duplicates;
  for (const full of walkFiles(archiveRoot)) {
    const rel = path.relative(archiveRoot, full);
    if (fs.existsSync(path.join(repoRoot, rel))) duplicates.push(rel.replaceAll(path.sep, '/'));
  }
  duplicates.sort((a, b) => a.localeCompare(b));
  return duplicates;
}

function computeAudioHotspots(repoRoot) {
  const candidates = [
    'components/controlPanelTabsAudioRouteEditor.tsx',
    'components/controlPanelTabsAudioLegacyConflict.tsx',
    'components/useAudioLegacyConflictBatchActions.ts',
    'components/useAudioLegacyConflictManager.ts',
    'components/useAudioLegacyConflictFocusedActions.ts',
    'lib/audioReactiveValidation.ts',
    'lib/audioReactiveRetirementMigration.ts',
  ];
  return candidates
    .map((rel) => {
      const full = path.join(repoRoot, rel);
      if (!fs.existsSync(full)) return null;
      return { path: rel, lineCount: lineCount(full) };
    })
    .filter(Boolean)
    .sort((a, b) => b.lineCount - a.lineCount || a.path.localeCompare(b.path));
}

function buildCommonTrunkRestrictions() {
  return [
    'manifest 正本の意味変更',
    'registry 正本の意味変更',
    'routing 正本の意味変更',
    'package class の最終決定',
    'CURRENT_STATUS.md の最終同期',
    'REVIEW.md / DOCS_INDEX.md の最終 truth 化',
  ];
}

function roleForFamily(group, ownershipClass) {
  if (ownershipClass === 'mainline-only') return 'specialist-mainline-review';
  if (group === 'mpm') return 'family-mpm-worker';
  if (group === 'pbd') return 'family-pbd-worker';
  if (group === 'fracture') return 'family-fracture-worker';
  if (group === 'volumetric') return 'family-volumetric-worker';
  return 'family-general-worker';
}

function buildSearchTokens(familyId, group) {
  const tokens = familyId.split('-');
  const familyToken = familyId.replaceAll('-', '_');
  const extras = [];
  if (group === 'specialist-native') extras.push('specialist');
  if (group === 'volumetric') extras.push('volumetric');
  if (group === 'fracture') extras.push('fracture');
  if (group === 'mpm') extras.push('mpm');
  if (group === 'pbd') extras.push('pbd');
  return uniq([familyId, familyToken, ...tokens, ...extras]);
}

function buildFamilyEvidencePaths(repoRoot, family, modeBindings) {
  const baseDir = path.join(repoRoot, 'lib', 'future-native-families');
  const starterRuntimeDir = path.join(baseDir, 'starter-runtime');
  const allFamilyFiles = walkFiles(baseDir).map((full) => relative(repoRoot, full));
  const allScripts = walkFiles(path.join(repoRoot, 'scripts')).map((full) => relative(repoRoot, full));
  const tokens = buildSearchTokens(family.familyId, family.group);
  const verifyScriptName = `verify-${family.familyId}.mjs`;
  const verifyEntryName = `verify-${family.familyId}-entry.ts`;
  const exacts = [
    'lib/future-native-families/futureNativeFamiliesRegistry.ts',
    'lib/future-native-families/futureNativeFamiliesProgress.ts',
    'lib/future-native-families/futureNativeFamiliesIntegrationShared.ts',
    verifyScriptName ? `scripts/${verifyScriptName}` : null,
    verifyEntryName ? `scripts/${verifyEntryName}` : null,
  ].filter(Boolean);

  const fuzzyFamilyFiles = allFamilyFiles.filter((rel) => {
    const base = rel.toLowerCase();
    return tokens.some((token) => base.includes(token.toLowerCase()));
  });
  const fuzzyScripts = allScripts.filter((rel) => {
    const base = rel.toLowerCase();
    return tokens.some((token) => base.includes(token.toLowerCase()));
  });
  const runtimeFiles = walkFiles(starterRuntimeDir)
    .map((full) => relative(repoRoot, full))
    .filter((rel) => tokens.some((token) => rel.toLowerCase().includes(token.toLowerCase())))
    .sort((a, b) => a.localeCompare(b));

  const docsFiles = [
    'docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md',
    'docs/handoff/FUTURE_NATIVE_SPECIALIST_HANDOFF.md',
  ].filter((rel) => fs.existsSync(path.join(repoRoot, rel)));

  const modeEntries = modeBindings.filter((entry) => entry.familyId === family.familyId);

  const evidencePaths = uniq([
    ...exacts.filter((rel) => fs.existsSync(path.join(repoRoot, rel))),
    ...fuzzyFamilyFiles,
    ...fuzzyScripts,
    ...docsFiles,
  ]).sort((a, b) => a.localeCompare(b));

  return {
    modeEntries,
    runtimeFiles,
    evidencePaths,
    sceneEvidenceCount: evidencePaths.filter((rel) => /SceneBridge|ScenePreset|Bindings|Integration/i.test(rel)).length,
    verifyScriptExists: fs.existsSync(path.join(repoRoot, `scripts/${verifyScriptName}`)),
  };
}

function buildFamilyPacket(repoRoot, family, modeBindings, packageScripts) {
  const role = roleForFamily(family.group, family.proposedOwnershipClass);
  const evidence = buildFamilyEvidencePaths(repoRoot, family, modeBindings);
  const verifyCommands = uniq([
    `npm run verify:${family.familyId}`,
    family.group === 'volumetric' ? 'npm run verify:future-native-volumetric-routes' : 'npm run verify:future-native-nonvolumetric-routes',
    'npm run verify:future-native-project-state-fast',
  ]).filter((cmd) => {
    const match = cmd.match(/^npm run ([^\s]+)/);
    return match ? Boolean(packageScripts[match[1]]) : true;
  });

  return {
    packetId: `family-${family.familyId}`,
    packetType: 'family-evidence',
    familyId: family.familyId,
    title: family.title,
    group: family.group,
    recommendedRole: role,
    recommendedReturnUnit: family.proposedOwnershipClass === 'mainline-only' ? 'patch-with-mainline-review' : 'patch',
    ownershipClass: family.proposedOwnershipClass,
    officialStateCandidate: family.proposedOfficialState,
    closureCandidate: family.closureCandidate,
    progressPercent: family.progressPercent ?? 0,
    currentStage: family.currentStage ?? family.declaredStage,
    serializerBlockKey: family.serializerBlockKey,
    modeEntries: evidence.modeEntries,
    verifyCommands,
    evidencePaths: evidence.evidencePaths.slice(0, 24),
    runtimeFiles: evidence.runtimeFiles.slice(0, 16),
    openChecks: [
      'registry entry が現物と一致するか',
      'progress entry と verify 結果が矛盾しないか',
      evidence.modeEntries.length > 0 ? 'mode binding の source / bindingMode を再確認すること' : 'mode binding 欠落が意図通りか確認すること',
      evidence.sceneEvidenceCount > 0 ? 'scene bridge / preset patch の接続を確認すること' : 'scene bridge / preset patch の接続不足有無を確認すること',
      family.proposedOwnershipClass === 'mainline-only' ? 'specialist family のため final closure は mainline へ戻すこと' : 'manifest / routing truth を変更していないことを確認すること',
    ],
    untouchedTrunks: buildCommonTrunkRestrictions(),
    mainlineDecisionPoints: [
      'officialState の最終確定',
      'closureCandidate の最終確定',
      'parallel / conditional / mainline-only の最終確定',
      'merge unit を patch のまま保持するか branch 化するか',
    ],
  };
}

function buildRolePackets(repoRoot, packageScripts, seed) {
  const audioHotspots = computeAudioHotspots(repoRoot);
  const archiveDuplicates = computeArchiveDuplicates(repoRoot);
  return [
    {
      packetId: 'role-audio-hotspots',
      packetType: 'role-audit',
      title: 'Audio hotspot audit packet',
      recommendedRole: 'audio-worker',
      recommendedReturnUnit: 'patch',
      verifyCommands: [
        'npm run verify:audio',
        'npm run typecheck:audio-reactive:attempt',
        'node scripts/inspect-project-health.mjs',
      ].filter((cmd) => {
        const match = cmd.match(/^npm run ([^\s]+)/);
        return match ? Boolean(packageScripts[match[1]]) : fs.existsSync(path.join(repoRoot, cmd.replace('node ', '').split(' ')[0]));
      }),
      evidencePaths: audioHotspots.map((entry) => entry.path),
      hotspotCounts: audioHotspots,
      openChecks: [
        '巨大 UI / hook を分割しても routing meaning を変えないこと',
        'legacy conflict / route editor 周辺の state 共有境界を確認すること',
        'audio verify と typecheck の両方で退行がないこと',
      ],
      untouchedTrunks: buildCommonTrunkRestrictions(),
      mainlineDecisionPoints: [
        'audio docs truth の最終同期',
        '分割単位を patch に留めるか branch にするか',
      ],
    },
    {
      packetId: 'role-archive-duplicate-audit',
      packetType: 'role-audit',
      title: 'Archive duplicate audit packet',
      recommendedRole: 'docs-package-worker',
      recommendedReturnUnit: 'patch',
      verifyCommands: [
        'node scripts/verify-package-integrity.mjs --strict',
      ].filter((cmd) => fs.existsSync(path.join(repoRoot, 'scripts', 'verify-package-integrity.mjs'))),
      evidencePaths: archiveDuplicates.slice(0, 80),
      archiveDuplicateCount: archiveDuplicates.length,
      openChecks: [
        'archive と現行 root の同 relative path 取り違えリスクを注記すること',
        'archive 由来のファイルを正本扱いしないこと',
        'CURRENT_STATUS だけを先に更新しないこと',
      ],
      untouchedTrunks: buildCommonTrunkRestrictions(),
      mainlineDecisionPoints: [
        'archive 整理を docs only にするか closeout 時にまとめるか',
      ],
    },
    {
      packetId: 'role-verification-core',
      packetType: 'role-audit',
      title: 'Verification core packet',
      recommendedRole: 'verification-worker',
      recommendedReturnUnit: 'patch',
      verifyCommands: [
        'npm run typecheck',
        'npm run verify:future-native-project-state-fast',
        'npm run verify:future-native-safe-pipeline:core',
        'node scripts/verify-package-integrity.mjs --strict',
      ].filter((cmd) => {
        const match = cmd.match(/^npm run ([^\s]+)/);
        return match ? Boolean(packageScripts[match[1]]) : fs.existsSync(path.join(repoRoot, 'scripts', 'verify-package-integrity.mjs'));
      }),
      evidencePaths: [
        'scripts/verify-future-native-project-state-fast.mjs',
        'scripts/verify-future-native-safe-pipeline-core.mjs',
        'scripts/verify-package-integrity.mjs',
      ].filter((rel) => fs.existsSync(path.join(repoRoot, rel))),
      openChecks: [
        'global criteria を subsystem checklist に落とすこと',
        'family verify と core verify の乖離がないか確認すること',
        'resume 系 verify を正本にしないこと',
      ],
      untouchedTrunks: buildCommonTrunkRestrictions(),
      mainlineDecisionPoints: [
        'official verify criteria の最終固定',
      ],
    },
    {
      packetId: 'role-docs-package',
      packetType: 'role-audit',
      title: 'Docs and package evidence packet',
      recommendedRole: 'docs-package-worker',
      recommendedReturnUnit: 'patch',
      verifyCommands: [
        'node scripts/doctor-package-handoff.mjs',
        'node scripts/verify-package-integrity.mjs --strict',
      ].filter((cmd) => fs.existsSync(path.join(repoRoot, 'scripts', cmd.replace('node scripts/', '').split(' ')[0]))),
      evidencePaths: [
        'docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md',
        'scripts/doctor-package-handoff.mjs',
        'scripts/verify-package-integrity.mjs',
      ].filter((rel) => fs.existsSync(path.join(repoRoot, rel))),
      openChecks: [
        'package class 表記揺れを evidence として抽出すること',
        'docs truth を先に確定しないこと',
        'closeout / handoff は最終現物で同期すること',
      ],
      untouchedTrunks: buildCommonTrunkRestrictions(),
      mainlineDecisionPoints: [
        'package class の最終確定',
        'docs truth の最終同期タイミング',
      ],
      observedSummary: {
        futureNativeFamilyCount: seed.summary.futureNativeFamilyCount,
        renderHandoffCases: seed.summary.renderHandoffCases,
        doctorPackageClass: seed.meta?.doctorPackageClass ?? seed.observedFacts?.doctorPackageClass ?? 'unknown',
      },
    },
  ];
}

function buildPacketMarkdown(packet) {
  const lines = [];
  lines.push(`# ${packet.title ?? packet.packetId}`);
  lines.push('');
  lines.push(`- packetId: ${packet.packetId}`);
  lines.push(`- packetType: ${packet.packetType}`);
  if (packet.familyId) lines.push(`- familyId: ${packet.familyId}`);
  if (packet.group) lines.push(`- group: ${packet.group}`);
  if (packet.currentStage) lines.push(`- currentStage: ${packet.currentStage}`);
  if (typeof packet.progressPercent === 'number') lines.push(`- progressPercent: ${packet.progressPercent}`);
  if (packet.ownershipClass) lines.push(`- ownershipClass: ${packet.ownershipClass}`);
  if (packet.officialStateCandidate) lines.push(`- officialStateCandidate: ${packet.officialStateCandidate}`);
  if (packet.closureCandidate) lines.push(`- closureCandidate: ${packet.closureCandidate}`);
  lines.push(`- recommendedRole: ${packet.recommendedRole}`);
  lines.push(`- recommendedReturnUnit: ${packet.recommendedReturnUnit}`);
  lines.push('');
  lines.push('## Worker return template');
  lines.push('');
  lines.push('```md');
  lines.push(`- 対象: ${packet.familyId ?? packet.packetId}`);
  lines.push(`- 種別: ${packet.recommendedReturnUnit.includes('branch') ? 'branch' : 'patch'}`);
  lines.push('- 触った範囲:');
  lines.push('- 触っていない幹線:');
  lines.push('- 実行 verify:');
  lines.push('- 残件:');
  lines.push('- mainline 判断が必要な点:');
  lines.push('```');
  lines.push('');
  if (packet.modeEntries?.length) {
    lines.push('## Mode bindings');
    lines.push('');
    for (const entry of packet.modeEntries) {
      lines.push(`- ${entry.mode} / ${entry.bindingMode} / source=${entry.source} / minPoints=${entry.minPoints}`);
    }
    lines.push('');
  }
  if (packet.verifyCommands?.length) {
    lines.push('## Verify commands');
    lines.push('');
    for (const entry of packet.verifyCommands) lines.push(`- ${entry}`);
    lines.push('');
  }
  if (packet.evidencePaths?.length) {
    lines.push('## Evidence paths');
    lines.push('');
    for (const entry of packet.evidencePaths) lines.push(`- ${entry}`);
    lines.push('');
  }
  if (packet.runtimeFiles?.length) {
    lines.push('## Runtime / implementation focus');
    lines.push('');
    for (const entry of packet.runtimeFiles) lines.push(`- ${entry}`);
    lines.push('');
  }
  if (packet.hotspotCounts?.length) {
    lines.push('## Hotspots');
    lines.push('');
    for (const entry of packet.hotspotCounts) lines.push(`- ${entry.path} (${entry.lineCount} lines)`);
    lines.push('');
  }
  if (packet.openChecks?.length) {
    lines.push('## Open checks');
    lines.push('');
    for (const entry of packet.openChecks) lines.push(`- ${entry}`);
    lines.push('');
  }
  if (packet.untouchedTrunks?.length) {
    lines.push('## Untouched trunks');
    lines.push('');
    for (const entry of packet.untouchedTrunks) lines.push(`- ${entry}`);
    lines.push('');
  }
  if (packet.mainlineDecisionPoints?.length) {
    lines.push('## Mainline decision points');
    lines.push('');
    for (const entry of packet.mainlineDecisionPoints) lines.push(`- ${entry}`);
    lines.push('');
  }
  return lines.join('\n');
}

function buildMatrixMarkdown(payload) {
  const lines = [];
  lines.push('# KALOKAGATHIA worker evidence matrix');
  lines.push('');
  lines.push(`- createdAt: ${payload.meta.createdAt}`);
  lines.push(`- repoPath: ${payload.meta.repoPath}`);
  lines.push(`- familyPackets: ${payload.summary.familyPackets}`);
  lines.push(`- rolePackets: ${payload.summary.rolePackets}`);
  lines.push(`- totalPackets: ${payload.summary.totalPackets}`);
  lines.push(`- audioHotspots: ${payload.summary.audioHotspots}`);
  lines.push(`- archiveDuplicates: ${payload.summary.archiveDuplicates}`);
  lines.push('');
  lines.push('## Family packet summary');
  lines.push('');
  lines.push('| packetId | group | role | state | closure | verify commands | evidence paths | runtime files |');
  lines.push('|---|---|---|---|---|---:|---:|---:|');
  for (const packet of payload.familyPackets) {
    lines.push(`| ${packet.packetId} | ${packet.group} | ${packet.recommendedRole} | ${packet.officialStateCandidate} | ${packet.closureCandidate} | ${packet.verifyCommands.length} | ${packet.evidencePaths.length} | ${packet.runtimeFiles.length} |`);
  }
  lines.push('');
  lines.push('## Role packets');
  lines.push('');
  for (const packet of payload.rolePackets) {
    lines.push(`- ${packet.packetId}: ${packet.recommendedRole} / verify=${packet.verifyCommands.length} / evidence=${packet.evidencePaths.length}`);
  }
  lines.push('');
  lines.push('## Coverage');
  lines.push('');
  for (const entry of payload.coverage.byGroup) {
    lines.push(`- ${entry.group}: ${entry.count} packets`);
  }
  lines.push('');
  return lines.join('\n');
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(args.repo);
  const seedPath = path.resolve(args.seed ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'official-ledger-seed-2026-04-06.json'));
  const outJson = path.resolve(args.outJson ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'worker-evidence-matrix-2026-04-06.json'));
  const outMd = path.resolve(args.outMd ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'worker-evidence-matrix-2026-04-06.md'));
  const outDir = path.resolve(args.outDir ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'worker-packets-2026-04-06'));

  const seed = readJson(seedPath);
  const packageScripts = parsePackageScripts(repoRoot);
  const familyPackets = seed.futureNativeFamilies.map((family) => buildFamilyPacket(repoRoot, family, seed.futureNativeModeBindings, packageScripts));
  const rolePackets = buildRolePackets(repoRoot, packageScripts, seed);

  const payload = {
    meta: {
      createdAt: new Date().toISOString(),
      repoPath: repoRoot,
      seedPath,
      generator: 'generate-missing-layers-worker-packets.mjs',
    },
    summary: {
      familyPackets: familyPackets.length,
      rolePackets: rolePackets.length,
      totalPackets: familyPackets.length + rolePackets.length,
      audioHotspots: computeAudioHotspots(repoRoot).length,
      archiveDuplicates: computeArchiveDuplicates(repoRoot).length,
    },
    familyPackets,
    rolePackets,
    coverage: {
      byGroup: Object.entries(familyPackets.reduce((acc, packet) => {
        acc[packet.group] = (acc[packet.group] ?? 0) + 1;
        return acc;
      }, {})).map(([group, count]) => ({ group, count })).sort((a, b) => a.group.localeCompare(b.group)),
    },
  };

  ensureDir(outJson);
  fs.writeFileSync(outJson, JSON.stringify(payload, null, 2));
  ensureDir(outMd);
  fs.writeFileSync(outMd, `${buildMatrixMarkdown(payload)}\n`);

  fs.mkdirSync(outDir, { recursive: true });
  for (const packet of [...familyPackets, ...rolePackets]) {
    const packetFile = path.join(outDir, `${slugify(packet.packetId)}.md`);
    fs.writeFileSync(packetFile, `${buildPacketMarkdown(packet)}\n`);
  }

  console.log(JSON.stringify({
    ok: true,
    familyPackets: payload.summary.familyPackets,
    rolePackets: payload.summary.rolePackets,
    totalPackets: payload.summary.totalPackets,
    outJson,
    outMd,
    outDir,
  }, null, 2));
}

main();
