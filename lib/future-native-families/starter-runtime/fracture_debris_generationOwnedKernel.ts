import type { FractureLatticeInputConfig } from './fracture_latticeAdapter';
import { normalizeFractureLatticeConfig } from './fracture_latticeAdapter';
import { createFractureLatticeRuntimeState, simulateFractureLatticeRuntime, type FractureLatticeRuntimeState } from './fracture_latticeSolver';

export const fractureDebrisGenerationOwnedKernelId = 'owned-kernel:fracture-debris-generation';
export function createFractureDebrisGenerationOwnedKernelRuntime(input: FractureLatticeInputConfig, warmFrameCount: number): FractureLatticeRuntimeState { return simulateFractureLatticeRuntime(createFractureLatticeRuntimeState(normalizeFractureLatticeConfig(input)), warmFrameCount); }
