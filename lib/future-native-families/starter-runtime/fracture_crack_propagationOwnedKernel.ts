import type { FractureLatticeInputConfig } from './fracture_latticeAdapter';
import { normalizeFractureLatticeConfig } from './fracture_latticeAdapter';
import { createFractureLatticeRuntimeState, simulateFractureLatticeRuntime, type FractureLatticeRuntimeState } from './fracture_latticeSolver';

export const fractureCrackPropagationOwnedKernelId = 'owned-kernel:fracture-crack-propagation';
export function createFractureCrackPropagationOwnedKernelRuntime(input: FractureLatticeInputConfig, warmFrameCount: number): FractureLatticeRuntimeState { return simulateFractureLatticeRuntime(createFractureLatticeRuntimeState(normalizeFractureLatticeConfig(input)), warmFrameCount); }
