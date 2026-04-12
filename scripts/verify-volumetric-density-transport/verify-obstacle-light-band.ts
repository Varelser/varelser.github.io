import { assert, type VolumetricDensityTransportVerificationBundle } from './shared';

export function verifyVolumetricObstacleAndLightBand(bundle: VolumetricDensityTransportVerificationBundle): void {
  const { stats, render } = bundle;
  assert(stats.meanLighting > 0.2 && stats.meanLighting < 1, 'volumetric lighting mean out of range');
  assert(stats.litTopBand > stats.meanLighting * 0.9, 'volumetric top lighting should remain visible');
  assert(stats.shadowMean > 0.01, 'volumetric shadow coupling too weak');
  assert(stats.meanObstacleMask > 0.01, 'volumetric obstacle mask too weak');
  assert(stats.obstacleOccludedCells >= 8, 'volumetric obstacle occlusion missing');
  assert(stats.primaryObstacleOccludedCells >= 8, 'volumetric primary obstacle occlusion missing');
  assert(stats.secondaryObstacleOccludedCells >= 6, 'volumetric secondary obstacle occlusion missing');
  assert(stats.multiObstacleOverlapCells >= 2, 'volumetric obstacle overlap too weak');
  assert(stats.lightMarchMean > 0.15, 'volumetric light marching too weak');
  assert(stats.lightMarchPeak >= stats.lightMarchMean, 'volumetric light march peak missing');
  assert(stats.lightMarchSecondaryMean > 0.1, 'volumetric secondary light marching too weak');
  assert(stats.lightMarchSecondaryPeak >= stats.lightMarchSecondaryMean, 'volumetric secondary light march peak missing');
  assert(stats.rimLightMean > 0.08, 'volumetric rim light too weak');
  assert(stats.rimLightPeak >= stats.rimLightMean, 'volumetric rim light peak missing');
  assert(stats.multiLightActiveCells >= 12, 'volumetric multi-light activity too low');
  assert(stats.tripleLightInterferenceMean > 0.001, 'volumetric triple-light interference too weak');
  assert(stats.tripleLightInterferencePeak >= stats.tripleLightInterferenceMean, 'volumetric triple-light interference peak missing');
  assert(stats.tripleLightInterferenceCells >= 2, 'volumetric triple-light interference cells too low');
  assert(stats.lightTriadLayerMean > 0.002, 'volumetric light triad layering too weak');
  assert(stats.lightTriadLayerActiveCells >= 4, 'volumetric light triad active cells too low');
  assert((render.stats.obstacleMaskCellCount ?? 0) >= 8, 'volumetric obstacle mask cells missing');
  assert((render.stats.obstacleBoundaryLineCount ?? 0) >= 4, 'volumetric obstacle boundary missing');
  assert((render.stats.secondaryObstacleMaskCellCount ?? 0) >= 6, 'volumetric secondary obstacle mask cells missing');
  assert((render.stats.secondaryObstacleBoundaryLineCount ?? 0) >= 4, 'volumetric secondary obstacle boundary missing');
  assert((render.stats.obstacleBridgeLineCount ?? 0) >= 2, 'volumetric obstacle bridge lines missing');
  assert((render.stats.multiObstacleModeCount ?? 0) >= 2, 'volumetric multi-obstacle modes missing');
  assert((render.stats.lightMarchLineCount ?? 0) >= 2, 'volumetric light march lines missing');
  assert((render.stats.secondaryLightMarchLineCount ?? 0) >= 2, 'volumetric secondary light march lines missing');
  assert((render.stats.multiLightBridgeLineCount ?? 0) >= 2, 'volumetric multi-light bridge lines missing');
  assert((render.stats.lightSplitModeCount ?? 0) >= 2, 'volumetric light split modes missing');
  assert((render.stats.tripleLightInterferenceLineCount ?? 0) >= 2, 'volumetric triple-light interference lines missing');
  assert((render.stats.tripleLightBridgeLineCount ?? 0) >= 2, 'volumetric triple-light bridge lines missing');
  assert((render.stats.tripleLightModeCount ?? 0) >= 2, 'volumetric triple-light modes missing');
}
