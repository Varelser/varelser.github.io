import { spawnSync } from 'node:child_process';
import { loadPackageJson } from './packageIntegrityShared.mjs';
import { buildHostRuntimeChecks, summarizeHostRuntimeChecks } from './hostRuntimeShared.mjs';
import { PHASE5_STEP_ENTRYPOINTS, resolvePhase5VerificationStepIds } from './phase5StepRegistry.mjs';

const rootDir = process.cwd();
const packageJson = loadPackageJson(rootDir);
const hostRuntime = buildHostRuntimeChecks(rootDir, packageJson);
const hostSummary = summarizeHostRuntimeChecks(hostRuntime.checks);

if (hostSummary.failed > 0) {
  console.error(JSON.stringify({
    passed: false,
    failedStep: 'host-runtime',
    reason: 'current host is missing native runtime pieces required for phase5 verification',
    host: hostRuntime.host,
    summary: hostSummary,
    recommendedNextSteps: [
      'run npm install on the target host to refresh host-native optional packages',
      'rerun npm run verify:host-runtime',
      'rerun npm run verify:phase5'
    ]
  }, null, 2));
  process.exit(1);
}

const phase5Profile = String(process.env?.VERIFY_PHASE5_PROFILE || 'full').trim().toLowerCase();
const selectedStep = String(process.env?.VERIFY_PHASE5_STEP || '').trim().toLowerCase();
const stepIds = resolvePhase5VerificationStepIds(phase5Profile, selectedStep);
const startedAt = Date.now();
const scenarios = [];

function parseStepJson(stdout, stepId) {
  const trimmed = String(stdout || '').trim();
  if (!trimmed) throw new Error(`[verify-phase5] ${stepId} produced no stdout JSON`);
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.lastIndexOf('\n{');
    if (start >= 0) return JSON.parse(trimmed.slice(start + 1));
    throw new Error(`[verify-phase5] ${stepId} produced non-JSON stdout`);
  }
}

function spawnPhase5Command(commandArgs, displayStepId) {
  const result = spawnSync(process.execPath, commandArgs, {
    cwd: rootDir,
    env: process.env,
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'inherit'],
    maxBuffer: 64 * 1024 * 1024,
  });
  if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);
  return parseStepJson(result.stdout, displayStepId);
}

function executeTsBatch(batchStepIds, startIndex) {
  const batchStartedAt = Date.now();
  console.error(`[verify-phase5] ${startIndex + 1}-${startIndex + batchStepIds.length}/${stepIds.length} ts-batch start ${batchStepIds.join(', ')}`);
  const parsed = spawnPhase5Command(
    ['scripts/run-ts-entry.mjs', 'scripts/verify-phase5-ts-batch-entry.ts', ...batchStepIds],
    batchStepIds.join(','),
  );
  const batchScenarios = Array.isArray(parsed?.scenarios) ? parsed.scenarios : [];
  if (batchScenarios.length !== batchStepIds.length) {
    throw new Error(`[verify-phase5] ts-batch returned ${batchScenarios.length} scenarios for ${batchStepIds.length} requested steps`);
  }
  const scenarioByRequestedStepId = new Map(batchScenarios.map((scenario) => [scenario.requestedStepId || scenario.id, scenario]));
  for (const [offset, stepId] of batchStepIds.entries()) {
    const scenario = scenarioByRequestedStepId.get(stepId);
    if (!scenario) throw new Error(`[verify-phase5] ts-batch omitted scenario ${stepId}`);
    console.error(`[verify-phase5] ${startIndex + offset + 1}/${stepIds.length} ${stepId} done ${scenario.durationMs}ms`);
    scenarios.push(scenario);
  }
  console.error(`[verify-phase5] ${startIndex + 1}-${startIndex + batchStepIds.length}/${stepIds.length} ts-batch done ${Date.now() - batchStartedAt}ms`);
}

for (let index = 0; index < stepIds.length; index += 1) {
  const stepId = stepIds[index];
  const entry = PHASE5_STEP_ENTRYPOINTS[stepId];
  if (!entry) throw new Error(`[verify-phase5] missing entrypoint for ${stepId}`);

  if (entry.type === 'ts') {
    const batchStepIds = [stepId];
    while (index + batchStepIds.length < stepIds.length) {
      const nextStepId = stepIds[index + batchStepIds.length];
      const nextEntry = PHASE5_STEP_ENTRYPOINTS[nextStepId];
      if (!nextEntry || nextEntry.type !== 'ts') break;
      batchStepIds.push(nextStepId);
    }
    executeTsBatch(batchStepIds, index);
    index += batchStepIds.length - 1;
    continue;
  }

  const stepStartedAt = Date.now();
  console.error(`[verify-phase5] ${index + 1}/${stepIds.length} ${stepId} start`);
  const parsed = spawnPhase5Command([entry.entry], stepId);
  const durationMs = Date.now() - stepStartedAt;
  console.error(`[verify-phase5] ${index + 1}/${stepIds.length} ${stepId} done ${durationMs}ms`);
  scenarios.push({ ...parsed, durationMs });
}

console.log(JSON.stringify({
  profile: selectedStep || phase5Profile,
  verifiedScenarioCount: scenarios.length,
  durationMs: Date.now() - startedAt,
  scenarios,
}, null, 2));
