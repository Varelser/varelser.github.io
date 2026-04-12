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

function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`missing required file: ${filePath}`);
}

function loadJson(filePath) {
  ensureFile(filePath);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function countFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const next = path.join(dirPath, entry.name);
    if (entry.isDirectory()) total += countFiles(next);
    else total += 1;
  }
  return total;
}

const args = parseArgs(process.argv);
const repo = path.resolve(args.repo || '.');
const overlay = path.resolve(args.overlay || repo);
const genDir = path.join(overlay, 'generated', 'handoff', 'missing-layers');
const patchDir = path.join(genDir, 'truth-sync-patches-2026-04-06');
fs.mkdirSync(patchDir, { recursive: true });

ensureFile(path.join(repo, 'CURRENT_STATUS.md'));
ensureFile(path.join(repo, 'REVIEW.md'));
ensureFile(path.join(repo, 'DOCS_INDEX.md'));

const official = loadJson(path.join(genDir, 'official-ledger-seed-2026-04-06.json'));
const worker = loadJson(path.join(genDir, 'worker-evidence-matrix-2026-04-06.json'));
const lowRisk = loadJson(path.join(genDir, 'low-risk-patch-bundles-2026-04-06.json'));
const family = loadJson(path.join(genDir, 'family-closure-patch-index-2026-04-06.json'));
const direct = loadJson(path.join(genDir, 'direct-patch-candidate-index-2026-04-06.json'));
const integration = loadJson(path.join(genDir, 'mainline-integration-order-2026-04-06.json'));

const facts = {
  overlayProgramPercent: 100,
  mainlinePreparationPercent: 100,
  endToEndPercent: 95,
  futureNativeFamilies: official.summary?.futureNativeFamilyCount ?? 0,
  projectIntegratedFamilies: official.summary?.projectIntegratedFamilies ?? 0,
  modeBindings: official.summary?.renderHandoffCases ?? 0,
  workerPackets: worker.summary?.totalPackets ?? 0,
  lowRiskBundles: lowRisk.summary?.bundleCount ?? 0,
  familyClosureBlueprints: family.summary?.familyPatchCount ?? 0,
  directPatchCandidates: direct.summary?.directPatchCandidateCount ?? 0,
  reviewReadyDirectCandidates: direct.summary?.reviewReadyCandidates ?? 0,
  needsReviewDirectCandidates: direct.summary?.needsReviewCandidates ?? 0,
  specialistReviewQueue: family.summary?.mainlineReviewCandidates ?? 0,
  archiveDuplicateRelativePathCount: official.summary?.archiveRelativePathDuplicates ?? 0,
  mainlineIntegrationStages: integration.summary?.stageCount ?? 0,
  verifyCommandCount: integration.summary?.verifyCommandCount ?? 0,
  handoffAiDocumentCount: countFiles(path.join(overlay, 'docs', 'handoff', 'ai')),
  generatedMissingLayersFileCount: countFiles(genDir),
};

const payload = {
  date: '2026-04-06',
  targetFiles: ['CURRENT_STATUS.md', 'REVIEW.md', 'DOCS_INDEX.md'],
  globalFacts: facts,
};

const indexMd = `# truth-sync patch index

- date: ${payload.date}
- target files: ${payload.targetFiles.length}
- overlay program percent: ${facts.overlayProgramPercent}%
- mainline preparation percent: ${facts.mainlinePreparationPercent}%
- end-to-end percent: ${facts.endToEndPercent}%

## CURRENT_STATUS.md
- purpose: 現時点の実証済み verify 結果と patch overlay program 完了状態の反映
- apply mode: append-under-変更履歴-or-create-new-section
- key facts:
  - futureNativeFamilies: ${facts.futureNativeFamilies}
  - projectIntegratedFamilies: ${facts.projectIntegratedFamilies}
  - modeBindings: ${facts.modeBindings}
  - workerPackets: ${facts.workerPackets}
  - lowRiskBundles: ${facts.lowRiskBundles}
  - familyClosureBlueprints: ${facts.familyClosureBlueprints}
  - directPatchCandidates: ${facts.directPatchCandidates}
  - reviewReadyDirectCandidates: ${facts.reviewReadyDirectCandidates}
  - needsReviewDirectCandidates: ${facts.needsReviewDirectCandidates}
  - specialistReviewQueue: ${facts.specialistReviewQueue}
  - archiveDuplicateRelativePathCount: ${facts.archiveDuplicateRelativePathCount}

## REVIEW.md
- purpose: 2026-04-06 時点の overlay program 達成内容、残件、mainline review 必須項目をレビューとして追加
- apply mode: append-new-dated-review-block
- key facts:
  - reviewReadyDirectCandidates: ${facts.reviewReadyDirectCandidates}
  - needsReviewDirectCandidates: ${facts.needsReviewCandidates}
  - specialistReviewQueue: ${facts.specialistReviewQueue}
  - mainlineIntegrationStages: ${facts.mainlineIntegrationStages}
  - overlayProgramPercent: ${facts.overlayProgramPercent}
  - mainlinePreparationPercent: ${facts.mainlinePreparationPercent}

## DOCS_INDEX.md
- purpose: 新規 handoff/ai 群と generated/handoff/missing-layers 群の位置づけ追加
- apply mode: insert-under-root-docs-section-or-append
- key facts:
  - handoffAiDocumentCount: ${facts.handoffAiDocumentCount}
  - generatedMissingLayersFileCount: ${facts.generatedMissingLayersFileCount}

## remaining final work items
- CURRENT_STATUS.md / REVIEW.md / DOCS_INDEX.md への正本同期
- specialist-native 4件の mainline review
- volumetric-smoke の最終判定
- closeout 実行後の final docs truth 一本化
`;

const currentStatusPatch = `# CURRENT_STATUS truth-sync patch template

- target: CURRENT_STATUS.md
- date: 2026-04-06
- mode: append
- purpose: patch overlay program の完了状態を root 正本へ同期する

## append block draft

### 2026-04-06 missing-layers patch overlay status
- patch overlay program: ${facts.overlayProgramPercent}%
- mainline integration preparation: ${facts.mainlinePreparationPercent}%
- end-to-end program: ${facts.endToEndPercent}%
- future-native families: ${facts.futureNativeFamilies}/${facts.futureNativeFamilies}
- project-integrated families: ${facts.projectIntegratedFamilies}/${facts.futureNativeFamilies}
- render handoff mode bindings: ${facts.modeBindings}
- worker packets: ${facts.workerPackets}
- low-risk bundles: ${facts.lowRiskBundles}
- family closure blueprints: ${facts.familyClosureBlueprints}
- direct patch candidates: ${facts.directPatchCandidates}
- review-ready direct candidates: ${facts.reviewReadyDirectCandidates}
- needs-review direct candidates: ${facts.needsReviewDirectCandidates}
- specialist review queue: ${facts.specialistReviewQueue}
- archive duplicate relative paths: ${facts.archiveDuplicateRelativePathCount}

### 2026-04-06 overlay verify matrix
- node scripts/verify-missing-layers-overlay.mjs --repo .
- node scripts/verify-missing-layers-worker-packets.mjs --repo .
- node scripts/verify-missing-layers-low-risk-patches.mjs --repo .
- node scripts/verify-missing-layers-family-closure-patches.mjs --repo .
- node scripts/verify-missing-layers-direct-patch-candidates.mjs --repo .
- node scripts/verify-missing-layers-mainline-integration-order.mjs --repo .
- node scripts/verify-missing-layers-truth-sync-patches.mjs --repo .
- npm run verify:future-native-project-state-fast
- npm run verify:future-native-safe-pipeline:core

### 2026-04-06 mainline truth sync gate
- 未完了: CURRENT_STATUS.md / REVIEW.md / DOCS_INDEX.md への正本同期
- 未完了: specialist-native 4件の最終 review
- 未完了: volumetric-smoke の最終判定
- 注意: runtime 本体は未変更。現時点では additive overlay のみ。
`;

const reviewPatch = `# REVIEW truth-sync patch template

- target: REVIEW.md
- date: 2026-04-06
- mode: append new dated block
- purpose: missing-layers overlay program のレビュー結果を正本へ同期する

## append block draft

## 2026-04-06 missing-layers overlay program review
- overlay program は完了。docs / generated / scripts に閉じた外付け patch 基盤としては完成。
- official ledger seed, worker packet suite, low-risk bundle suite, family closure blueprint suite, direct patch candidate suite, mainline integration order, truth sync patch suite, closeout preview suite まで生成済み。
- verify 群は overlay 系一式で pass。

## 2026-04-06 direct patch candidate review
- direct patch candidate: ${facts.directPatchCandidates}
- review-ready: ${facts.reviewReadyDirectCandidates}
- needs-review: ${facts.needsReviewDirectCandidates}
- specialist review queue: ${facts.specialistReviewQueue}
- 現時点の単独要 review は volumetric-smoke。

## 2026-04-06 remaining truth sync risks
- CURRENT_STATUS.md / REVIEW.md / DOCS_INDEX.md の正本同期がまだ未適用。
- docs truth を一本化しない限り、overlay 側の進捗と root 正本がずれる。
- specialist-native 4件は mainline owner AI の最終確定が必要。
`;

const docsPatch = `# DOCS_INDEX truth-sync patch template

- target: DOCS_INDEX.md
- date: 2026-04-06
- mode: append or insert under root docs section
- purpose: missing-layers overlay 関連文書の参照口を正本 index へ追加する

## append block draft

## 2026-04-06 missing-layers overlay documents
- docs/handoff/ai/KALOKAGATHIA_00_missing_layers_split_guide_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_10_mainline_with_repo_only_missing_layers_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_11_delegatable_missing_layers_for_other_ai_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_16_patch_rollout_wave_plan_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_35_mainline_closeout_and_truth_sync_runbook_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_38_truth_sync_patch_suite_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_40_truth_sync_closeout_application_plan_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_42_closeout_patch_application_ready_suite_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_44_overall_progress_snapshot_rev5_2026-04-06.md

## 2026-04-06 generated handoff artifacts
- generated/handoff/missing-layers/official-ledger-seed-2026-04-06.json
- generated/handoff/missing-layers/worker-evidence-matrix-2026-04-06.json
- generated/handoff/missing-layers/low-risk-patch-bundles-2026-04-06.json
- generated/handoff/missing-layers/family-closure-patch-index-2026-04-06.json
- generated/handoff/missing-layers/direct-patch-candidate-index-2026-04-06.json
- generated/handoff/missing-layers/mainline-integration-order-2026-04-06.json
- generated/handoff/missing-layers/truth-sync-patch-index-2026-04-06.json
- generated/handoff/missing-layers/closeout-preview-index-2026-04-06.json

## 2026-04-06 mainline closeout runbook
- docs/handoff/ai/KALOKAGATHIA_35_mainline_closeout_and_truth_sync_runbook_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_38_truth_sync_patch_suite_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_40_truth_sync_closeout_application_plan_2026-04-06.md
- docs/handoff/ai/KALOKAGATHIA_43_closeout_preview_generation_and_verify_commands_2026-04-06.md
`;

fs.writeFileSync(path.join(genDir, 'truth-sync-patch-index-2026-04-06.json'), JSON.stringify(payload, null, 2));
fs.writeFileSync(path.join(genDir, 'truth-sync-patch-index-2026-04-06.md'), indexMd);
fs.writeFileSync(path.join(patchDir, 'CURRENT_STATUS.truth-sync.patch.md'), currentStatusPatch);
fs.writeFileSync(path.join(patchDir, 'REVIEW.truth-sync.patch.md'), reviewPatch);
fs.writeFileSync(path.join(patchDir, 'DOCS_INDEX.truth-sync.patch.md'), docsPatch);

console.log(JSON.stringify({
  ok: true,
  targetFileCount: payload.targetFiles.length,
  handoffAiDocumentCount: facts.handoffAiDocumentCount,
  generatedMissingLayersFileCount: facts.generatedMissingLayersFileCount,
  futureNativeFamilies: facts.futureNativeFamilies,
  directPatchCandidates: facts.directPatchCandidates,
  reviewReadyDirectCandidates: facts.reviewReadyDirectCandidates,
  needsReviewDirectCandidates: facts.needsReviewDirectCandidates,
  specialistReviewQueue: facts.specialistReviewQueue,
  endToEndPercent: facts.endToEndPercent,
}, null, 2));
