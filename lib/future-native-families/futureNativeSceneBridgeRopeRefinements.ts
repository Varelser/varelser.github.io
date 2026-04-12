import type { RopeMetricMap, RopePoint } from "./futureNativeSceneBridgeRopeShared";
import { createRopeRefinementMetricMap, type RopeExtendedRefinementInput, type RopeRefinementState } from "./futureNativeSceneBridgeRopeRefinementTypes";
export type { RopeExtendedRefinementInput, RopeRefinementProfile, RopeRefinementResolvers, RopeRefinementState } from "./futureNativeSceneBridgeRopeRefinementTypes";
import { buildRopeRefinementPhaseOne } from "./futureNativeSceneBridgeRopeRefinementsPhaseOne";
import { buildRopeRefinementPhaseTwo } from "./futureNativeSceneBridgeRopeRefinementsPhaseTwo";
import { buildRopeRefinementPhaseThree } from "./futureNativeSceneBridgeRopeRefinementsPhaseThree";

function createRefinementState(): RopeRefinementState {
  return {
    snapPhaseFieldPoints: [],
    knotShellClusterPoints: [],
    looseEndTurbulencePoints: [],
    snapPhaseShellPoints: [],
    tensionFieldBraidPoints: [],
    breakShellRefinementPoints: [],
    entanglementTurbulenceSplitPoints: [],
    knotTurbulenceRefinementPoints: [],
    breakFieldBraidSplitPoints: [],
    shellFieldCouplingPoints: [],
    looseEndWakeSplitPoints: [],
    knotWakeClusterPoints: [],
    breakShellFieldSplitPoints: [],
    shellWakeBraidRefinementPoints: [],
    breakFieldTurbulenceClusterPoints: [],
    knotShellWakeRefinementPoints: [],
    breakFieldShellClusterPoints: [],
    wakeShellTurbulenceRefinementPoints: [],
    breakFieldWakeClusterPoints: [],
    knotWakeShellRefinementPoints: [],
    breakFieldWakeTurbulenceSplitPoints: [],
    shellWakeFieldRefinementPoints: [],
    breakFieldWakeShellClusterPoints: [],
    knotShellWakeFieldRefinementPoints: [],
    breakFieldWakeShellTurbulenceSplitPoints: [],
    shellWakeFieldBraidRefinementPoints: [],
    breakFieldWakeShellFieldClusterPoints: [],
    knotShellWakeFieldBraidRefinementPoints: [],
    breakFieldWakeShellFieldTurbulenceClusterPoints: [],
    shellWakeFieldBraidTurbulenceRefinementPoints: [],
    breakFieldWakeShellFieldTurbulenceSplitPoints: [],
    knotShellWakeFieldBraidTurbulenceRefinementPoints: [],
    breakFieldWakeShellFieldTurbulenceFieldClusterPoints: [],
  };
}

export function collectRopeRefinementPoints(state: RopeRefinementState): RopePoint[] {
  return [
    ...state.snapPhaseFieldPoints,
    ...state.knotShellClusterPoints,
    ...state.looseEndTurbulencePoints,
    ...state.snapPhaseShellPoints,
    ...state.tensionFieldBraidPoints,
    ...state.breakShellRefinementPoints,
    ...state.entanglementTurbulenceSplitPoints,
    ...state.knotTurbulenceRefinementPoints,
    ...state.breakFieldBraidSplitPoints,
    ...state.shellFieldCouplingPoints,
    ...state.looseEndWakeSplitPoints,
    ...state.knotWakeClusterPoints,
    ...state.breakShellFieldSplitPoints,
    ...state.shellWakeBraidRefinementPoints,
    ...state.breakFieldTurbulenceClusterPoints,
    ...state.knotShellWakeRefinementPoints,
    ...state.breakFieldShellClusterPoints,
    ...state.wakeShellTurbulenceRefinementPoints,
    ...state.breakFieldWakeClusterPoints,
    ...state.knotWakeShellRefinementPoints,
    ...state.breakFieldWakeTurbulenceSplitPoints,
    ...state.shellWakeFieldRefinementPoints,
    ...state.breakFieldWakeShellClusterPoints,
    ...state.knotShellWakeFieldRefinementPoints,
    ...state.breakFieldWakeShellTurbulenceSplitPoints,
    ...state.shellWakeFieldBraidRefinementPoints,
    ...state.breakFieldWakeShellFieldClusterPoints,
    ...state.knotShellWakeFieldBraidRefinementPoints,
    ...state.breakFieldWakeShellFieldTurbulenceClusterPoints,
    ...state.shellWakeFieldBraidTurbulenceRefinementPoints,
    ...state.breakFieldWakeShellFieldTurbulenceSplitPoints,
    ...state.knotShellWakeFieldBraidTurbulenceRefinementPoints,
    ...state.breakFieldWakeShellFieldTurbulenceFieldClusterPoints,
  ];
}

export function buildRopeExtendedRefinements(
  input: RopeExtendedRefinementInput,
): { state: RopeRefinementState; metrics: RopeMetricMap } {
  const state = createRefinementState();
  const metrics = createRopeRefinementMetricMap();
  buildRopeRefinementPhaseOne(input, state, metrics);
  buildRopeRefinementPhaseTwo(input, state, metrics);
  buildRopeRefinementPhaseThree(input, state, metrics);

  return { state, metrics };
}
