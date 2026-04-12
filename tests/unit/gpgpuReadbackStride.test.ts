import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';
import { getGpgpuCpuReadbackFrameStride } from '../../components/gpgpuExecutionRouting';

export async function main() {
  const baseConfig = {
    ...DEFAULT_CONFIG,
    gpgpuEnabled: true,
    gpgpuSmoothTubeEnabled: false,
    gpgpuMetaballEnabled: false,
  };

  assert.equal(getGpgpuCpuReadbackFrameStride(baseConfig), 0);
  assert.equal(getGpgpuCpuReadbackFrameStride({
    ...baseConfig,
    gpgpuSmoothTubeEnabled: true,
    renderQuality: 'cinematic',
  }), 1);
  assert.equal(getGpgpuCpuReadbackFrameStride({
    ...baseConfig,
    gpgpuSmoothTubeEnabled: true,
    renderQuality: 'balanced',
  }), 2);
  assert.equal(getGpgpuCpuReadbackFrameStride({
    ...baseConfig,
    gpgpuSmoothTubeEnabled: true,
    renderQuality: 'draft',
  }), 3);
  assert.equal(getGpgpuCpuReadbackFrameStride({
    ...baseConfig,
    gpgpuMetaballEnabled: true,
    gpgpuMetaballUpdateSkip: 4,
  }), 4);
  assert.equal(getGpgpuCpuReadbackFrameStride({
    ...baseConfig,
    gpgpuSmoothTubeEnabled: true,
    renderQuality: 'balanced',
    gpgpuMetaballEnabled: true,
    gpgpuMetaballUpdateSkip: 4,
  }), 2);
}
