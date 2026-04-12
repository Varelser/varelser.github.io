import assert from 'node:assert/strict';
import { getFutureNativeVisualFrameStride } from '../../lib/futureNativeVisualCadence';

export async function main() {
  assert.equal(getFutureNativeVisualFrameStride('cinematic', 'pbd-cloth'), 1);
  assert.equal(getFutureNativeVisualFrameStride('balanced', 'pbd-cloth'), 2);
  assert.equal(getFutureNativeVisualFrameStride('draft', 'pbd-cloth'), 3);
  assert.equal(getFutureNativeVisualFrameStride('balanced', 'volumetric-advection'), 3);
  assert.equal(getFutureNativeVisualFrameStride('draft', 'volumetric-smoke'), 4);
}
