import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';
import { getGenerationRuntimeBudgetProfile } from '../../lib/performanceHints';

export async function main() {
  const lightBudget = getGenerationRuntimeBudgetProfile({
    ...DEFAULT_CONFIG,
    layer2Enabled: true,
    layer2Type: 'flow',
    layer2Source: 'sphere',
    layer2Count: 18000,
    renderQuality: 'balanced',
  }, 2);

  const heavyBudget = getGenerationRuntimeBudgetProfile({
    ...DEFAULT_CONFIG,
    layer2Enabled: true,
    layer2Type: 'viscoelastic_membrane',
    layer2Source: 'text',
    layer2Count: 96000,
    renderQuality: 'cinematic',
    layer2ConnectionEnabled: true,
    layer2AuxEnabled: true,
    layer2SparkEnabled: true,
  }, 2);

  assert.ok(heavyBudget.mediaMapMaxDimension < lightBudget.mediaMapMaxDimension);
  assert.ok(heavyBudget.mediaSampleAttempts < lightBudget.mediaSampleAttempts);
  assert.ok(heavyBudget.maxMembraneVertices < lightBudget.maxMembraneVertices);
  assert.ok(heavyBudget.maxPatchResolution <= lightBudget.maxPatchResolution);
  assert.ok(heavyBudget.maxHullPoints < lightBudget.maxHullPoints);
}
