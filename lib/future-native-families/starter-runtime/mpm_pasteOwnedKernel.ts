import type { MpmGranularInputConfig } from './mpm_granularAdapter';
import { createMpmGranularRuntimeFromInput } from './mpm_granularAdapter';
import { stepMpmGranularRuntime, type MpmGranularRuntimeState } from './mpm_granularSolver';

export const mpmPasteOwnedKernelId = 'owned-kernel:mpm-paste';
export function createMpmPasteOwnedKernelRuntime(input: MpmGranularInputConfig): MpmGranularRuntimeState { return createMpmGranularRuntimeFromInput({ ...input, materialKind: input.materialKind ?? 'paste' }); }
export function stepMpmPasteOwnedKernelRuntime(runtime: MpmGranularRuntimeState, options?: { dt?: number; substeps?: number }): MpmGranularRuntimeState { return stepMpmGranularRuntime(runtime, options); }
