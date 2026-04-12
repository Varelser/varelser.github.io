import type { MpmGranularInputConfig } from './mpm_granularAdapter';
import { createMpmGranularRuntimeFromInput } from './mpm_granularAdapter';
import { stepMpmGranularRuntime, type MpmGranularRuntimeState } from './mpm_granularSolver';

export const mpmMudOwnedKernelId = 'owned-kernel:mpm-mud';
export function createMpmMudOwnedKernelRuntime(input: MpmGranularInputConfig): MpmGranularRuntimeState { return createMpmGranularRuntimeFromInput({ ...input, materialKind: input.materialKind ?? 'mud' }); }
export function stepMpmMudOwnedKernelRuntime(runtime: MpmGranularRuntimeState, options?: { dt?: number; substeps?: number }): MpmGranularRuntimeState { return stepMpmGranularRuntime(runtime, options); }
