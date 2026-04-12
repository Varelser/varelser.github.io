import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';
import { areConfigsEqualByTrackedKeys } from '../../lib/configTrackedComparator';

export async function main() {
  const baseConfig = {
    ...DEFAULT_CONFIG,
    gpgpuEnabled: true,
    gpgpuCount: 12000,
    renderQuality: 'balanced' as const,
    layer2Color: '#ffffff',
  };

  assert.equal(areConfigsEqualByTrackedKeys(baseConfig, { ...baseConfig, layer2Color: '#00ffff' }, {
    exactKeys: ['renderQuality'],
    prefixes: ['gpgpu'],
  }), true);

  assert.equal(areConfigsEqualByTrackedKeys(baseConfig, { ...baseConfig, gpgpuCount: 16000 }, {
    exactKeys: ['renderQuality'],
    prefixes: ['gpgpu'],
  }), false);

  assert.equal(areConfigsEqualByTrackedKeys(baseConfig, { ...baseConfig, renderQuality: 'draft' }, {
    exactKeys: ['renderQuality'],
    prefixes: ['gpgpu'],
  }), false);
}
