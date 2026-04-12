#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const expectedDocs = [
  'docs/handoff/ai/KALOKAGATHIA_00_missing_layers_split_guide_2026-04-06.md',
  'docs/handoff/ai/KALOKAGATHIA_10_mainline_with_repo_only_missing_layers_2026-04-06.md',
  'docs/handoff/ai/KALOKAGATHIA_11_delegatable_missing_layers_for_other_ai_2026-04-06.md',
  'docs/handoff/ai/KALOKAGATHIA_12_patch_overlay_application_plan_2026-04-06.md',
  'docs/handoff/ai/KALOKAGATHIA_13_repo_inventory_snapshot_2026-04-06.md',
  'docs/handoff/ai/KALOKAGATHIA_14_worker_assignment_matrix_2026-04-06.md',
  'docs/handoff/ai/KALOKAGATHIA_15_dependency_gates_and_conflict_hotspots_2026-04-06.md',
  'docs/handoff/ai/KALOKAGATHIA_16_patch_rollout_wave_plan_2026-04-06.md',
  'docs/handoff/ai/KALOKAGATHIA_17_official_ledger_vocabulary_and_schema_2026-04-06.md',
  'docs/handoff/ai/KALOKAGATHIA_18_official_ledger_seed_future_native_2026-04-06.md',
  'docs/handoff/ai/KALOKAGATHIA_19_overlay_generation_and_verify_commands_2026-04-06.md',
];

const expectedGenerated = [
  'generated/handoff/missing-layers/official-ledger-seed-2026-04-06.json',
  'generated/handoff/missing-layers/official-ledger-seed-2026-04-06.md',
];

function parseArgs(argv) {
  const args = { repo: process.cwd() };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
  }
  return args;
}

function mustExist(repoRoot, relPath, issues) {
  const full = path.join(repoRoot, relPath);
  if (!fs.existsSync(full)) issues.push(`missing:${relPath}`);
  return full;
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(args.repo);
  const issues = [];
  const docPaths = expectedDocs.map((rel) => mustExist(repoRoot, rel, issues));
  const generatedPaths = expectedGenerated.map((rel) => mustExist(repoRoot, rel, issues));

  let json = null;
  const jsonPath = path.join(repoRoot, expectedGenerated[0]);
  if (fs.existsSync(jsonPath)) {
    json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (!Array.isArray(json.futureNativeFamilies) || json.futureNativeFamilies.length < 20) {
      issues.push('bad-json:futureNativeFamilies');
    }
    if (!Array.isArray(json.futureNativeModeBindings) || json.futureNativeModeBindings.length < 10) {
      issues.push('bad-json:futureNativeModeBindings');
    }
    const familyIds = json.futureNativeFamilies.map((entry) => entry.familyId);
    const duplicateIds = familyIds.filter((entry, index) => familyIds.indexOf(entry) !== index);
    if (duplicateIds.length > 0) issues.push(`duplicate-family-ids:${[...new Set(duplicateIds)].join(',')}`);
    for (const binding of json.futureNativeModeBindings ?? []) {
      if (!familyIds.includes(binding.familyId)) {
        issues.push(`binding-missing-family:${binding.mode}->${binding.familyId}`);
      }
    }
  }

  const result = {
    ok: issues.length === 0,
    repoRoot,
    checkedDocs: docPaths.filter((full) => fs.existsSync(full)).length,
    checkedGenerated: generatedPaths.filter((full) => fs.existsSync(full)).length,
    familyCount: json?.futureNativeFamilies?.length ?? 0,
    modeBindingCount: json?.futureNativeModeBindings?.length ?? 0,
    issues,
  };

  console.log(JSON.stringify(result, null, 2));
  if (issues.length > 0) process.exit(1);
}

main();
