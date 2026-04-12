import type { RopeLine, RopeMetricMap, RopePoint } from './futureNativeSceneBridgeRopeShared';

export interface RopeRefinementState {
  snapPhaseFieldPoints: RopePoint[];
  knotShellClusterPoints: RopePoint[];
  looseEndTurbulencePoints: RopePoint[];
  snapPhaseShellPoints: RopePoint[];
  tensionFieldBraidPoints: RopePoint[];
  breakShellRefinementPoints: RopePoint[];
  entanglementTurbulenceSplitPoints: RopePoint[];
  knotTurbulenceRefinementPoints: RopePoint[];
  breakFieldBraidSplitPoints: RopePoint[];
  shellFieldCouplingPoints: RopePoint[];
  looseEndWakeSplitPoints: RopePoint[];
  knotWakeClusterPoints: RopePoint[];
  breakShellFieldSplitPoints: RopePoint[];
  shellWakeBraidRefinementPoints: RopePoint[];
  breakFieldTurbulenceClusterPoints: RopePoint[];
  knotShellWakeRefinementPoints: RopePoint[];
  breakFieldShellClusterPoints: RopePoint[];
  wakeShellTurbulenceRefinementPoints: RopePoint[];
  breakFieldWakeClusterPoints: RopePoint[];
  knotWakeShellRefinementPoints: RopePoint[];
  breakFieldWakeTurbulenceSplitPoints: RopePoint[];
  shellWakeFieldRefinementPoints: RopePoint[];
  breakFieldWakeShellClusterPoints: RopePoint[];
  knotShellWakeFieldRefinementPoints: RopePoint[];
  breakFieldWakeShellTurbulenceSplitPoints: RopePoint[];
  shellWakeFieldBraidRefinementPoints: RopePoint[];
  breakFieldWakeShellFieldClusterPoints: RopePoint[];
  knotShellWakeFieldBraidRefinementPoints: RopePoint[];
  breakFieldWakeShellFieldTurbulenceClusterPoints: RopePoint[];
  shellWakeFieldBraidTurbulenceRefinementPoints: RopePoint[];
  breakFieldWakeShellFieldTurbulenceSplitPoints: RopePoint[];
  knotShellWakeFieldBraidTurbulenceRefinementPoints: RopePoint[];
  breakFieldWakeShellFieldTurbulenceFieldClusterPoints: RopePoint[];
}

export interface RopeRefinementProfile {
  knotShellClusterX: number;
  knotShellClusterY: number;
  knotShellClusterZ: number;
  looseEndTurbulenceY: number;
  snapPhaseShellY: number;
  tensionFieldBraidY: number;
  breakShellRefinementY: number;
  breakShellRefinementZ: number;
  entanglementSplitX: number;
  entanglementSplitY: number;
  entanglementSplitZ: number;
  knotTurbulenceY: number;
  knotTurbulenceZ: number;
  breakFieldBraidY: number;
  breakFieldBraidZ: number;
  shellFieldCouplingY: number;
  looseEndWakeX: number;
  looseEndWakeY: number;
  looseEndWakeZ: number;
  knotWakeY: number;
  breakShellFieldY: number;
  shellWakeBraidY: number;
  shellWakeBraidZ: number;
  breakFieldTurbulenceY: number;
  knotShellWakeY: number;
  knotShellWakeZ: number;
  breakFieldShellY: number;
  wakeShellTurbulenceY: number;
  wakeShellTurbulenceZ: number;
  breakFieldWakeY: number;
  knotWakeShellY: number;
  knotWakeShellZ: number;
  breakFieldWakeTurbulenceY: number;
  shellWakeFieldY: number;
  shellWakeFieldZ: number;
  breakFieldWakeShellY: number;
  knotShellWakeFieldY: number;
  knotShellWakeFieldZ: number;
  breakFieldWakeShellTurbulenceY: number;
  shellWakeFieldBraidY: number;
  shellWakeFieldBraidZ: number;
  breakFieldWakeShellFieldY: number;
  knotShellWakeFieldBraidY: number;
  knotShellWakeFieldBraidZ: number;
  breakFieldWakeShellFieldTurbulenceY: number;
  shellWakeFieldBraidTurbulenceY: number;
  shellWakeFieldBraidTurbulenceZ: number;
  breakFieldWakeShellFieldTurbulenceSplitY: number;
  knotShellWakeFieldBraidTurbulenceY: number;
  knotShellWakeFieldBraidTurbulenceZ: number;
  breakFieldWakeShellFieldTurbulenceFieldY: number;
}

export interface RopeRefinementResolvers {
  resolveShellField(index: number, state: RopeRefinementState): RopePoint | null;
  resolveShellWakeField(index: number, state: RopeRefinementState): RopePoint | null;
  resolveBreakFieldWakeShellSource(index: number, state: RopeRefinementState): RopePoint | null;
  resolveKnotShellWakeFieldSource(index: number, state: RopeRefinementState): RopePoint | null;
  resolveWakeShellTurbulenceSource(index: number, state: RopeRefinementState): RopePoint | null;
  resolveShellWakeFieldBraidSource(index: number, state: RopeRefinementState): RopePoint | null;
  resolveBreakFieldWakeShellFieldSource(index: number, state: RopeRefinementState): RopePoint | null;
  resolveKnotShellWakeFieldBraidSource(index: number, state: RopeRefinementState): RopePoint | null;
  resolveBreakFieldWakeShellFieldTurbulenceSource(index: number, state: RopeRefinementState): RopePoint | null;
}

export interface RopeExtendedRefinementInput {
  snapSize: number;
  lines: RopeLine[];
  tensionFieldPoints: RopePoint[];
  snapClusterPoints: RopePoint[];
  breakClusterPoints: RopePoint[];
  looseEndFieldPoints: RopePoint[];
  entanglementShellPoints: RopePoint[];
  profile: RopeRefinementProfile;
  resolvers: RopeRefinementResolvers;
}

export const ROPE_REFINEMENT_METRIC_KEYS = [
  'snapPhaseFieldRefinementCount',
  'knotShellClusterCount',
  'looseEndTurbulenceLayerCount',
  'snapPhaseShellSplitCount',
  'tensionFieldBraidRefinementCount',
  'breakShellRefinementCount',
  'entanglementTurbulenceSplitCount',
  'knotTurbulenceRefinementCount',
  'breakFieldBraidSplitCount',
  'shellFieldCouplingCount',
  'looseEndWakeSplitCount',
  'knotWakeClusterCount',
  'breakShellFieldSplitCount',
  'shellWakeBraidRefinementCount',
  'breakFieldTurbulenceClusterCount',
  'knotShellWakeRefinementCount',
  'breakFieldShellClusterCount',
  'wakeShellTurbulenceRefinementCount',
  'breakFieldWakeClusterCount',
  'knotWakeShellRefinementCount',
  'breakFieldWakeTurbulenceSplitCount',
  'shellWakeFieldRefinementCount',
  'breakFieldWakeShellClusterCount',
  'knotShellWakeFieldRefinementCount',
  'breakFieldWakeShellTurbulenceSplitCount',
  'shellWakeFieldBraidRefinementCount',
  'breakFieldWakeShellFieldClusterCount',
  'knotShellWakeFieldBraidRefinementCount',
  'breakFieldWakeShellFieldTurbulenceClusterCount',
  'shellWakeFieldBraidTurbulenceRefinementCount',
  'breakFieldWakeShellFieldTurbulenceSplitCount',
  'knotShellWakeFieldBraidTurbulenceRefinementCount',
  'breakFieldWakeShellFieldTurbulenceFieldClusterCount',
] as const;

export function createRopeRefinementMetricMap(): RopeMetricMap {
  return Object.fromEntries(ROPE_REFINEMENT_METRIC_KEYS.map((key) => [key, 0]));
}
