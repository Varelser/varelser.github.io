import { assert, type VolumetricDensityTransportVerificationBundle } from './shared';

export function verifyVolumetricCoreBand(bundle: VolumetricDensityTransportVerificationBundle): void {
  const { initialStats, stats, render } = bundle;
  assert(stats.totalDensity > initialStats.totalDensity * 0.6, 'volumetric density should remain sustained under obstacle masking');
  assert(stats.centerOfMassY > initialStats.centerOfMassY + 0.18, 'volumetric density should advect upward');
  assert(stats.topBandDensity > 0.002, 'volumetric top band density should remain present near the upper band');
  assert(stats.edgeDensity < stats.totalDensity * 0.2, 'volumetric edge leakage too high');
  assert(stats.divergenceMean < 0.05, `volumetric divergence too high: ${stats.divergenceMean}`);
  assert(stats.maxPressure > 0.001, 'volumetric pressure field too weak');
  assert(render.stats.frame === 80, 'volumetric render frame mismatch');
  assert(render.points && render.points.length >= 9, 'volumetric render points missing');
  assert(render.lines && render.lines.length >= 6, 'volumetric render lines missing');
  assert(Array.isArray(render.scalarSamples) && render.scalarSamples.length === 21, 'volumetric scalar samples missing');
  assert((render.stats.sliceCount ?? 0) >= 2, 'volumetric slice count too low');
  assert((render.stats.sliceLineCount ?? 0) >= 2, 'volumetric slice line count too low');
  assert((render.stats.billowContourPoints ?? 0) >= 4, 'volumetric billow contour missing');
  assert((render.stats.billowSpanX ?? 0) > 0, 'volumetric billow span missing');
  assert((render.stats.meshRowCount ?? 0) >= 3, 'volumetric mesh row count too low');
  assert((render.stats.meshLineCount ?? 0) >= 20, 'volumetric mesh line count too low');
  assert((render.stats.meshTriangleEstimate ?? 0) >= 8, 'volumetric mesh triangle estimate too low');
  assert((render.stats.coreSpineSegments ?? 0) >= 2, 'volumetric core spine missing');
}
