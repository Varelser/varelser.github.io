#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key.startsWith('--')) {
      args[key.slice(2)] = value && !value.startsWith('--') ? value : true;
      if (value && !value.startsWith('--')) i += 1;
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const repo = path.resolve(args.repo || '.');
const genDir = path.join(repo, 'generated', 'handoff', 'missing-layers');
const patchDir = path.join(genDir, 'truth-sync-patches-2026-04-06');
const jsonPath = path.join(genDir, 'truth-sync-patch-index-2026-04-06.json');
const mdPath = path.join(genDir, 'truth-sync-patch-index-2026-04-06.md');

const issues = [];
if (!fs.existsSync(jsonPath)) issues.push('missing truth-sync json');
if (!fs.existsSync(mdPath)) issues.push('missing truth-sync md');
if (!fs.existsSync(patchDir)) issues.push('missing truth-sync patch dir');

if (fs.existsSync(jsonPath)) {
  const payload = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const facts = payload.globalFacts || {};
  if ((payload.targetFiles?.length ?? 0) !== 3) issues.push('expected exactly 3 target files');
  if ((facts.overlayProgramPercent ?? 0) !== 100) issues.push('overlayProgramPercent must be 100');
  if ((facts.mainlinePreparationPercent ?? 0) !== 100) issues.push('mainlinePreparationPercent must be 100');
  if ((facts.endToEndPercent ?? 0) < 95) issues.push('endToEndPercent must be at least 95');
  if ((facts.futureNativeFamilies ?? 0) !== 22) issues.push('futureNativeFamilies must be 22');
  if ((facts.projectIntegratedFamilies ?? 0) !== 22) issues.push('projectIntegratedFamilies must be 22');
  if ((facts.workerPackets ?? 0) !== 26) issues.push('workerPackets must be 26');
  if ((facts.lowRiskBundles ?? 0) !== 9) issues.push('lowRiskBundles must be 9');
  if ((facts.familyClosureBlueprints ?? 0) !== 22) issues.push('familyClosureBlueprints must be 22');
  if ((facts.directPatchCandidates ?? 0) !== 18) issues.push('directPatchCandidates must be 18');
  if ((facts.reviewReadyDirectCandidates ?? 0) !== 17) issues.push('reviewReadyDirectCandidates must be 17');
  if ((facts.needsReviewDirectCandidates ?? 0) !== 1) issues.push('needsReviewDirectCandidates must be 1');
  if ((facts.specialistReviewQueue ?? 0) !== 4) issues.push('specialistReviewQueue must be 4');
}

if (fs.existsSync(patchDir)) {
  const names = fs.readdirSync(patchDir).filter((name) => name.endsWith('.md')).sort();
  const required = [
    'CURRENT_STATUS.truth-sync.patch.md',
    'DOCS_INDEX.truth-sync.patch.md',
    'REVIEW.truth-sync.patch.md',
  ];
  for (const item of required) if (!names.includes(item)) issues.push(`missing ${item}`);
  const currentStatusPath = path.join(patchDir, 'CURRENT_STATUS.truth-sync.patch.md');
  if (fs.existsSync(currentStatusPath)) {
    const text = fs.readFileSync(currentStatusPath, 'utf8');
    if (!text.includes('future-native families: 22/22')) issues.push('CURRENT_STATUS patch missing 22/22');
    if (!text.includes('direct patch candidates: 18')) issues.push('CURRENT_STATUS patch missing direct patch count');
  }
}

console.log(JSON.stringify({ ok: issues.length === 0, issues }, null, 2));
if (issues.length > 0) process.exit(1);
