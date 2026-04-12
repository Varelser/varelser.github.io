import assert from 'node:assert/strict';
import {
  estimateParticleDataCount,
  getParticleDataExecutionPlan,
} from '../../lib/particleDataExecutionRoute';
import type { ParticleConfig } from '../../types';

function createConfig(overrides: Partial<ParticleConfig> = {}): ParticleConfig {
  return {
    layer1Count: 0,
    ambientCount: 0,
    layer2Type: 'flow',
    layer3Type: 'flow',
    executionDiagnosticsEnabled: false,
    ...overrides,
  } as ParticleConfig;
}

export async function main() {
  const originalWorker = globalThis.Worker;
  class FakeWorker {}
  // @ts-expect-error test shim
  globalThis.Worker = FakeWorker;

  const lightLayer1 = createConfig({ layer1Count: 2048 });
  assert.equal(estimateParticleDataCount(lightLayer1, 1, false, 'aux'), 2048);
  assert.deepEqual(getParticleDataExecutionPlan(lightLayer1, 1, false, 'aux'), {
    route: 'direct',
    estimatedCount: 2048,
    threshold: 4096,
    reason: 'below-threshold',
  });

  const heavyLayer1 = createConfig({ layer1Count: 12000 });
  assert.deepEqual(getParticleDataExecutionPlan(heavyLayer1, 1, false, 'aux'), {
    route: 'worker',
    estimatedCount: 12000,
    threshold: 4096,
    reason: 'worker-preferred',
  });

  // @ts-expect-error test shim
  globalThis.Worker = undefined;
  assert.deepEqual(getParticleDataExecutionPlan(heavyLayer1, 1, false, 'aux'), {
    route: 'direct',
    estimatedCount: 12000,
    threshold: 4096,
    reason: 'worker-unavailable',
  });

  if (typeof originalWorker === 'undefined') {
    // @ts-expect-error test shim cleanup
    delete globalThis.Worker;
  } else {
    globalThis.Worker = originalWorker;
  }
}
