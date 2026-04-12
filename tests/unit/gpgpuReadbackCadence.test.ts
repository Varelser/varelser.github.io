import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';
import {
  getGpgpuCpuReadbackFrameStride,
  shouldRequestGpgpuCpuReadback,
} from '../../components/gpgpuExecutionRouting';

export async function main() {
  const disabled = {
    ...DEFAULT_CONFIG,
    gpgpuMetaballEnabled: false,
    gpgpuSmoothTubeEnabled: false,
  };
  assert.equal(getGpgpuCpuReadbackFrameStride(disabled), 0);
  assert.equal(shouldRequestGpgpuCpuReadback(disabled, 1), false);

  const metaballOnly = {
    ...DEFAULT_CONFIG,
    gpgpuMetaballEnabled: true,
    gpgpuMetaballUpdateSkip: 3,
    gpgpuSmoothTubeEnabled: false,
  };
  assert.equal(getGpgpuCpuReadbackFrameStride(metaballOnly), 3);
  assert.equal(shouldRequestGpgpuCpuReadback(metaballOnly, 1), false);
  assert.equal(shouldRequestGpgpuCpuReadback(metaballOnly, 2), false);
  assert.equal(shouldRequestGpgpuCpuReadback(metaballOnly, 3), true);
  assert.equal(shouldRequestGpgpuCpuReadback(metaballOnly, 6), true);

  const smoothTubeEnabled = {
    ...DEFAULT_CONFIG,
    gpgpuMetaballEnabled: true,
    gpgpuMetaballUpdateSkip: 6,
    gpgpuSmoothTubeEnabled: true,
  };
  assert.equal(getGpgpuCpuReadbackFrameStride(smoothTubeEnabled), 1);
  assert.equal(shouldRequestGpgpuCpuReadback(smoothTubeEnabled, 1), true);
  assert.equal(shouldRequestGpgpuCpuReadback(smoothTubeEnabled, 2), true);
}
