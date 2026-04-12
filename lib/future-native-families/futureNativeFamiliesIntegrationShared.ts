import type {
  FutureNativeFamilySerializedBlock,
} from './futureNativeFamiliesSerialization';
import type { FutureNativeFamilyId } from './futureNativeFamiliesTypes';
import type { ProjectSerializationBlock } from '../../types';

export const FUTURE_NATIVE_FIRST_WAVE_IDS = [
  'pbd-rope',
  'mpm-granular',
  'fracture-lattice',
  'volumetric-density-transport',
] as const satisfies readonly FutureNativeFamilyId[];

export const FUTURE_NATIVE_PROJECT_INTEGRATED_IDS = [
  ...FUTURE_NATIVE_FIRST_WAVE_IDS,
  'mpm-viscoplastic',
  'mpm-snow',
  'mpm-mud',
  'mpm-paste',
  'fracture-voxel',
  'fracture-crack-propagation',
  'fracture-debris-generation',
  'pbd-cloth',
  'pbd-membrane',
  'pbd-softbody',
  'volumetric-smoke',
  'volumetric-advection',
  'volumetric-pressure-coupling',
  'volumetric-light-shadow-coupling',
] as const satisfies readonly FutureNativeFamilyId[];

export type FutureNativeFirstWaveId = (typeof FUTURE_NATIVE_FIRST_WAVE_IDS)[number];
export type FutureNativeProjectIntegratedId = (typeof FUTURE_NATIVE_PROJECT_INTEGRATED_IDS)[number];

export interface FutureNativeIntegrationSnapshot {
  familyId: FutureNativeProjectIntegratedId;
  title: string;
  currentStage: string;
  progressPercent: number;
  integrationReady: boolean;
  serializerBlock: FutureNativeFamilySerializedBlock;
  starterRuntimeStages: readonly string[];
  uiSectionIds: readonly string[];
  uiControlCount: number;
  runtimeConfigBlock: ProjectSerializationBlock;
  stats: Record<string, number>;
  scalarSamples: readonly number[];
  summary: string;
  nextTargets: readonly string[];
}

export interface ProjectFutureNativeIntegrationSnapshot {
  familyId: FutureNativeProjectIntegratedId;
  title: string;
  serializerBlockKey: string;
  enabled: boolean;
  stage: string;
  progressPercent: number;
  integrationReady: boolean;
  uiSectionIds: readonly string[];
  uiControlCount: number;
  runtimeConfig: ProjectSerializationBlock;
  runtimeState: ProjectSerializationBlock;
  statsKeys: readonly string[];
  nextTargets: readonly string[];
  notes: readonly string[];
}

export interface ProjectFutureNativeIntegrationSummary {
  firstWaveFamilyCount: number;
  averageProgressPercent: number;
  totalUiControls: number;
  serializationKeys: string[];
  topProgressFamilyId: FutureNativeProjectIntegratedId;
}

export interface FutureNativeSharedIntegrationSummary {
  firstWaveFamilyCount: number;
  averageProgressPercent: number;
  totalUiControls: number;
  serializationKeys: string[];
  topProgressFamilyId: FutureNativeProjectIntegratedId;
}

export function countControls(sections: readonly { controls: readonly unknown[] }[]): number {
  return sections.reduce((sum, section) => sum + section.controls.length, 0);
}

export function cleanRuntimeConfigValues(values: Array<string | number | boolean | null | undefined>): string[] {
  return values
    .filter((value): value is string | number | boolean => value !== null && value !== undefined)
    .map((value) => String(value));
}

export function createRuntimeConfigBlock(values: Array<string | number | boolean | null | undefined>): ProjectSerializationBlock {
  return {
    id: 'runtime-config',
    label: 'Runtime config',
    values: cleanRuntimeConfigValues(values),
  };
}

export function simulateFrames<T>(runtime: T, step: (value: T, options?: { iterations?: number; dt?: number }) => T, frames: number, iterations = 12): T {
  let current = runtime;
  for (let index = 0; index < frames; index += 1) {
    current = step(current, { iterations });
  }
  return current;
}

export function getFutureNativeStatsKeys(stats: Record<string, number>): string[] {
  return Object.keys(stats).sort();
}

export function formatRuntimeStateValue(label: string, value: number | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    const normalized = Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
    return `${label}:${normalized}`;
  }
  return `${label}:${value}`;
}

export function buildFutureNativeRuntimeStateBlock(snapshot: FutureNativeIntegrationSnapshot): ProjectSerializationBlock {
  const statsEntries = Object.entries(snapshot.stats)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 6)
    .map(([key, value]) => formatRuntimeStateValue(key, value));
  const scalarEntries = snapshot.scalarSamples.slice(0, 4).map((value, index) => formatRuntimeStateValue(`sample${index + 1}`, value));
  const values = [
    formatRuntimeStateValue('frameSummary', snapshot.summary),
    formatRuntimeStateValue('progress', snapshot.progressPercent),
    ...statsEntries,
    ...scalarEntries,
  ].filter((value): value is string => typeof value === 'string' && value.length > 0);
  return {
    id: 'runtime-state',
    label: 'Runtime state',
    values,
  };
}
