#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function parseArgs(argv) {
  const args = {
    repo: process.cwd(),
    outJson: null,
    outMd: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--out-json') args.outJson = argv[++i];
    else if (arg === '--out-md') args.outMd = argv[++i];
  }
  return args;
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
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

function countFiles(dirPath) {
  return walkFiles(dirPath).length;
}

function lineCount(filePath) {
  return readText(filePath).split('\n').length;
}

function parseDoctorPackageClass(repoRoot) {
  const target = path.join(repoRoot, 'scripts', 'doctor-package-handoff.mjs');
  if (!fs.existsSync(target)) return null;
  const result = spawnSync('node', [target], { cwd: repoRoot, encoding: 'utf8' });
  const combined = `${result.stdout || ''}\n${result.stderr || ''}`;
  const match = combined.match(/class=([a-z0-9-]+)/i);
  return match ? match[1] : null;
}

function parseFamilyRegistry(repoRoot) {
  const registryPath = path.join(repoRoot, 'lib', 'future-native-families', 'futureNativeFamiliesRegistry.ts');
  const text = readText(registryPath);
  const familyBlocks = [...text.matchAll(/familySpec\(\{\n([\s\S]*?)\n  \}\),/g)];
  return familyBlocks.map((match) => {
    const block = match[1];
    const id = block.match(/id: '([^']+)'/)?.[1] ?? '';
    const group = block.match(/group: '([^']+)'/)?.[1] ?? '';
    const title = block.match(/title: '([^']+)'/)?.[1] ?? '';
    const declaredStage = block.match(/stage: '([^']+)'/)?.[1] ?? 'research-scaffold';
    const serializerBlockKey = block.match(/serializerBlockKey: '([^']+)'/)?.[1] ?? id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return { familyId: id, group, title, declaredStage, serializerBlockKey };
  });
}

function parseProgressRegistry(repoRoot) {
  const progressPath = path.join(repoRoot, 'lib', 'future-native-families', 'futureNativeFamiliesProgress.ts');
  const text = readText(progressPath);
  const matches = [...text.matchAll(/'([^']+)': \{\n\s+progressPercent: (\d+),\n\s+currentStage: '([^']+)',\n\s+nextTargets: \[([^\]]*)\],/g)];
  const map = new Map();
  for (const match of matches) {
    const familyId = match[1];
    const progressPercent = Number(match[2]);
    const currentStage = match[3];
    const nextTargets = [...match[4].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
    map.set(familyId, { progressPercent, currentStage, nextTargets });
  }
  return map;
}

function parseIntegratedIds(repoRoot) {
  const filePath = path.join(repoRoot, 'lib', 'future-native-families', 'futureNativeFamiliesIntegrationShared.ts');
  const text = readText(filePath);
  const firstWaveSection = text.match(/FUTURE_NATIVE_FIRST_WAVE_IDS = \[\n([\s\S]*?)\n\] as const/)?.[1] ?? '';
  const integratedSection = text.match(/FUTURE_NATIVE_PROJECT_INTEGRATED_IDS = \[\n([\s\S]*?)\n\] as const/)?.[1] ?? '';
  const firstWaveIds = [...firstWaveSection.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  const integratedIds = [...integratedSection.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  return {
    firstWaveIds,
    projectIntegratedIds: [...new Set([...firstWaveIds, ...integratedIds])],
  };
}

function parseRenderHandoffCases(repoRoot) {
  const filePath = path.join(repoRoot, 'scripts', 'verify-future-native-render-handoff-fast-entry.ts');
  const text = readText(filePath);
  return [...text.matchAll(/\{ mode: '([^']+)', familyId: '([^']+)', source: '([^']+)', minPoints: (\d+), bindingMode: '([^']+)' \}/g)]
    .map((match) => ({
      mode: match[1],
      familyId: match[2],
      source: match[3],
      minPoints: Number(match[4]),
      bindingMode: match[5],
    }));
}

function computeArchiveDuplicates(repoRoot) {
  const archiveRoot = path.join(repoRoot, 'docs', 'archive', 'merge_final_conflicts_2026-04-05');
  const duplicates = [];
  if (!fs.existsSync(archiveRoot)) return duplicates;
  for (const full of walkFiles(archiveRoot)) {
    const rel = path.relative(archiveRoot, full);
    if (fs.existsSync(path.join(repoRoot, rel))) duplicates.push(rel);
  }
  duplicates.sort((a, b) => a.localeCompare(b));
  return duplicates;
}

function computeLargeImplementationFiles(repoRoot, threshold = 450) {
  const targets = [
    path.join(repoRoot, 'components'),
    path.join(repoRoot, 'lib'),
  ];
  const files = [];
  for (const target of targets) {
    for (const full of walkFiles(target)) {
      if (!/\.(ts|tsx|js|jsx)$/.test(full)) continue;
      const count = lineCount(full);
      if (count > threshold) {
        files.push({
          path: path.relative(repoRoot, full).replaceAll(path.sep, '/'),
          lineCount: count,
        });
      }
    }
  }
  files.sort((a, b) => b.lineCount - a.lineCount || a.path.localeCompare(b.path));
  return files;
}

function summarizeModesByFamily(cases) {
  const map = new Map();
  for (const entry of cases) {
    if (!map.has(entry.familyId)) map.set(entry.familyId, []);
    map.get(entry.familyId).push(entry);
  }
  return map;
}

function makeFamilyRows(repoRoot) {
  const families = parseFamilyRegistry(repoRoot);
  const progressMap = parseProgressRegistry(repoRoot);
  const { firstWaveIds, projectIntegratedIds } = parseIntegratedIds(repoRoot);
  const modeCases = parseRenderHandoffCases(repoRoot);
  const modeMap = summarizeModesByFamily(modeCases);
  const projectIntegratedSet = new Set(projectIntegratedIds);
  const firstWaveSet = new Set(firstWaveIds);

  return families.map((family) => {
    const progress = progressMap.get(family.familyId) ?? null;
    const verifiedModes = modeMap.get(family.familyId) ?? [];
    const proposedOfficialState = progress && progress.currentStage === 'project-integrated'
      ? 'implemented'
      : progress && progress.progressPercent > 0
        ? 'partial'
        : 'not-started';
    const closureCandidate = progress && progress.currentStage === 'project-integrated' && progress.nextTargets.length === 0
      ? 'review-ready'
      : progress && progress.currentStage === 'project-integrated'
        ? 'needs-review'
        : 'blocked';
    const routingEvidence = verifiedModes.length > 0 ? 'render-handoff-fast' : family.group === 'specialist-native' ? 'specialist-suite' : 'none-yet';
    return {
      familyId: family.familyId,
      group: family.group,
      title: family.title,
      serializerBlockKey: family.serializerBlockKey,
      declaredStage: family.declaredStage,
      progressPercent: progress?.progressPercent ?? null,
      currentStage: progress?.currentStage ?? null,
      nextTargets: progress?.nextTargets ?? [],
      firstWave: firstWaveSet.has(family.familyId),
      projectIntegrated: projectIntegratedSet.has(family.familyId) || progress?.currentStage === 'project-integrated',
      verifiedModes: verifiedModes.map((entry) => entry.mode),
      bindingModes: [...new Set(verifiedModes.map((entry) => entry.bindingMode))],
      proposedOfficialState,
      closureCandidate,
      routingEvidence,
      proposedOwnershipClass: family.group === 'specialist-native' ? 'mainline-only' : 'conditional',
    };
  });
}

function buildMarkdown(payload) {
  const lines = [];
  lines.push('# KALOKAGATHIA official ledger seed');
  lines.push('');
  lines.push(`- createdAt: ${payload.meta.createdAt}`);
  lines.push(`- repoPath: ${payload.meta.repoPath}`);
  lines.push(`- doctorPackageClass: ${payload.meta.doctorPackageClass ?? 'unknown'}`);
  lines.push(`- futureNativeFamilyCount: ${payload.summary.futureNativeFamilyCount}`);
  lines.push(`- projectIntegratedFamilies: ${payload.summary.projectIntegratedFamilies}`);
  lines.push(`- renderHandoffCases: ${payload.summary.renderHandoffCases}`);
  lines.push(`- archiveRelativePathDuplicates: ${payload.summary.archiveRelativePathDuplicates}`);
  lines.push(`- largeImplementationFiles450Plus: ${payload.summary.largeImplementationFiles450Plus}`);
  lines.push('');
  lines.push('## subsystem counts');
  lines.push('');
  for (const entry of payload.subsystems) {
    lines.push(`- ${entry.id}: ${entry.fileCount} files`);
  }
  lines.push('');
  lines.push('## future-native families');
  lines.push('');
  lines.push('| familyId | group | stage | progress | state candidate | closure candidate | verified modes | ownership |');
  lines.push('|---|---|---|---:|---|---|---:|---|');
  for (const family of payload.futureNativeFamilies) {
    lines.push(`| ${family.familyId} | ${family.group} | ${family.currentStage ?? family.declaredStage} | ${family.progressPercent ?? 0} | ${family.proposedOfficialState} | ${family.closureCandidate} | ${family.verifiedModes.length} | ${family.proposedOwnershipClass} |`);
  }
  lines.push('');
  lines.push('## large implementation hotspots');
  lines.push('');
  for (const entry of payload.conflictHotspots.largeImplementationFiles) {
    lines.push(`- ${entry.path} (${entry.lineCount} lines)`);
  }
  lines.push('');
  lines.push('## archive duplicate sample');
  lines.push('');
  for (const rel of payload.archiveDuplicatePaths.sample) {
    lines.push(`- ${rel}`);
  }
  lines.push('');
  lines.push('## render handoff mode bindings');
  lines.push('');
  for (const binding of payload.futureNativeModeBindings) {
    lines.push(`- ${binding.mode} -> ${binding.familyId} (${binding.bindingMode})`);
  }
  lines.push('');
  return lines.join('\n');
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(args.repo);
  const familyRows = makeFamilyRows(repoRoot);
  const modeBindings = parseRenderHandoffCases(repoRoot);
  const duplicates = computeArchiveDuplicates(repoRoot);
  const largeImplementationFiles = computeLargeImplementationFiles(repoRoot, 450);
  const doctorPackageClass = parseDoctorPackageClass(repoRoot);
  const payload = {
    meta: {
      createdAt: new Date().toISOString(),
      repoPath: repoRoot,
      generator: 'generate-missing-layers-ledger-seed.mjs',
      doctorPackageClass,
    },
    vocab: {
      officialState: ['implemented', 'partial', 'not-started'],
      ownershipClass: ['parallel', 'conditional', 'mainline-only'],
      closureCandidate: ['review-ready', 'needs-review', 'blocked'],
    },
    summary: {
      futureNativeFamilyCount: familyRows.length,
      projectIntegratedFamilies: familyRows.filter((entry) => entry.projectIntegrated).length,
      renderHandoffCases: modeBindings.length,
      archiveRelativePathDuplicates: duplicates.length,
      largeImplementationFiles450Plus: largeImplementationFiles.length,
    },
    subsystems: [
      { id: 'components', path: 'components/', fileCount: countFiles(path.join(repoRoot, 'components')) },
      { id: 'lib', path: 'lib/', fileCount: countFiles(path.join(repoRoot, 'lib')) },
      { id: 'scripts', path: 'scripts/', fileCount: countFiles(path.join(repoRoot, 'scripts')) },
      { id: 'generated', path: 'generated/', fileCount: countFiles(path.join(repoRoot, 'generated')) },
      { id: 'types', path: 'types/', fileCount: countFiles(path.join(repoRoot, 'types')) },
      { id: 'docs-handoff', path: 'docs/handoff/', fileCount: countFiles(path.join(repoRoot, 'docs', 'handoff')) },
    ],
    futureNativeFamilies: familyRows,
    futureNativeModeBindings: modeBindings,
    conflictHotspots: {
      largeImplementationFiles,
    },
    archiveDuplicatePaths: {
      count: duplicates.length,
      sample: duplicates.slice(0, 25),
    },
  };

  if (args.outJson) {
    ensureDir(args.outJson);
    fs.writeFileSync(args.outJson, `${JSON.stringify(payload, null, 2)}\n`);
  }
  if (args.outMd) {
    ensureDir(args.outMd);
    fs.writeFileSync(args.outMd, `${buildMarkdown(payload)}\n`);
  }

  console.log(JSON.stringify({
    ok: true,
    outJson: args.outJson,
    outMd: args.outMd,
    familyCount: payload.summary.futureNativeFamilyCount,
    projectIntegratedFamilies: payload.summary.projectIntegratedFamilies,
    renderHandoffCases: payload.summary.renderHandoffCases,
    archiveRelativePathDuplicates: payload.summary.archiveRelativePathDuplicates,
    largeImplementationFiles450Plus: payload.summary.largeImplementationFiles450Plus,
  }, null, 2));
}

main();
