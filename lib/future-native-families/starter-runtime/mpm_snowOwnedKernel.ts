import type { MpmGranularInputConfig } from './mpm_granularAdapter';
import { createMpmGranularRuntimeFromInput } from './mpm_granularAdapter';
import { stepMpmGranularRuntime, type MpmGranularRuntimeState } from './mpm_granularSolver';

export const mpmSnowOwnedKernelId = 'owned-kernel:mpm-snow';
export function createMpmSnowOwnedKernelRuntime(input: MpmGranularInputConfig): MpmGranularRuntimeState { return createMpmGranularRuntimeFromInput({ ...input, materialKind: input.materialKind ?? 'snow' }); }
export function stepMpmSnowOwnedKernelRuntime(runtime: MpmGranularRuntimeState, options?: { dt?: number; substeps?: number }): MpmGranularRuntimeState { return stepMpmGranularRuntime(runtime, options); }
