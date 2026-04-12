import { assert, type VolumetricDensityTransportVerificationBundle } from './shared';

export function verifyVolumetricPlumeAndInjectorBand(bundle: VolumetricDensityTransportVerificationBundle): void {
  const { stats, render } = bundle;
  assert(stats.plumeAnisotropyMean > 0.004, 'volumetric plume anisotropy too weak');
  assert(stats.plumeAnisotropyPeak >= stats.plumeAnisotropyMean, 'volumetric plume anisotropy peak missing');
  assert(stats.plumeBranchActiveCells >= 4, 'volumetric plume branch activity too low');
  assert(stats.injectorCouplingMean > 0.002, 'volumetric injector coupling too weak');
  assert(stats.injectorCouplingPeak >= stats.injectorCouplingMean, 'volumetric injector coupling peak missing');
  assert(stats.injectorSecondaryCells >= 4, 'volumetric secondary injector cells too low');
  assert(stats.injectorTertiaryCells >= 4, 'volumetric tertiary injector cells too low');
  assert(stats.injectorCoupledCells >= 2, 'volumetric injector coupled cells too low');
  assert((render.stats.anisotropicPlumeLineCount ?? 0) >= 1, 'volumetric anisotropic plume lines missing');
  assert((render.stats.plumeBranchBridgeLineCount ?? 0) >= 1, 'volumetric plume branch bridge lines missing');
  assert((render.stats.anisotropicPlumeCentroidCount ?? 0) >= 2, 'volumetric plume centroids missing');
  assert((render.stats.anisotropicPlumeModeCount ?? 0) >= 2, 'volumetric plume modes missing');
  assert((render.stats.injectorCouplingLineCount ?? 0) >= 2, 'volumetric injector coupling lines missing');
  assert((render.stats.injectorBridgeLineCount ?? 0) >= 2, 'volumetric injector bridge lines missing');
  assert((render.stats.injectorCentroidCount ?? 0) >= 2, 'volumetric injector centroids missing');
  assert((render.stats.injectorModeCount ?? 0) >= 2, 'volumetric injector modes missing');
}
