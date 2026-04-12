import type { MpmGranularInputConfig } from './mpm_granularAdapter';
import { createMpmGranularRuntimeFromInput } from './mpm_granularAdapter';
import { stepMpmGranularRuntime, type MpmGranularRuntimeState } from './mpm_granularSolver';

export const mpmViscoplasticOwnedKernelId = 'owned-kernel:mpm-viscoplastic';
export function createMpmViscoplasticOwnedKernelRuntime(input: MpmGranularInputConfig): MpmGranularRuntimeState { return createMpmGranularRuntimeFromInput({ ...input, materialKind: input.materialKind ?? 'sand' }); }
export function stepMpmViscoplasticOwnedKernelRuntime(runtime: MpmGranularRuntimeState, options?: { dt?: number; substeps?: number }): MpmGranularRuntimeState { return stepMpmGranularRuntime(runtime, options); }
