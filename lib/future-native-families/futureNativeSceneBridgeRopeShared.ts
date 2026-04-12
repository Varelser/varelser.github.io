import type { FutureNativeRenderPayload } from "./starter-runtime/runtimeContracts";
import type { FutureNativeRopeDescriptorAugmentation } from "./futureNativeSceneBridgeTypes";

export type RopeBasePoint = NonNullable<FutureNativeRenderPayload["points"]>[number];
export type RopePoint = { x: number; y: number; z: number };
export type RopeLine = NonNullable<FutureNativeRenderPayload["lines"]>[number];
export type RopeMetricMap = Record<string, number>;

export interface RopeTangentFrame {
  tx: number;
  ty: number;
  nx: number;
  ny: number;
}

export interface RopeRouteContext {
  basePayload: FutureNativeRenderPayload;
  basePoints: readonly RopeBasePoint[];
  restLength: number;
  segmentCount: number;
  framePhase: number;
  buildTangentFrame(index: number): RopeTangentFrame;
}

const REFINEMENT_SUMMARY_PREFIXES: Array<[string, string]> = [
  ["entanglementShellLayerCount", "shell"],
  ["snapPhaseFieldRefinementCount", "phasef"],
  ["knotShellClusterCount", "kshell"],
  ["looseEndTurbulenceLayerCount", "turb"],
  ["snapPhaseShellSplitCount", "pshell"],
  ["tensionFieldBraidRefinementCount", "tbraid"],
  ["breakShellRefinementCount", "bshell"],
  ["entanglementTurbulenceSplitCount", "etsplit"],
  ["knotTurbulenceRefinementCount", "kturb"],
  ["breakFieldBraidSplitCount", "bfield"],
  ["shellFieldCouplingCount", "sf"],
  ["looseEndWakeSplitCount", "lwake"],
  ["knotWakeClusterCount", "kwake"],
  ["breakShellFieldSplitCount", "bsfield"],
  ["shellWakeBraidRefinementCount", "swbraid"],
  ["breakFieldTurbulenceClusterCount", "bfturb"],
  ["knotShellWakeRefinementCount", "kswake"],
  ["breakFieldShellClusterCount", "bfshell"],
  ["wakeShellTurbulenceRefinementCount", "wsturb"],
  ["breakFieldWakeClusterCount", "bfwake"],
  ["knotWakeShellRefinementCount", "kwshell"],
  ["breakFieldWakeTurbulenceSplitCount", "bfwturb"],
  ["shellWakeFieldRefinementCount", "swfield"],
  ["breakFieldWakeShellClusterCount", "bfwshell"],
  ["knotShellWakeFieldRefinementCount", "kswfield"],
  ["breakFieldWakeShellTurbulenceSplitCount", "bfwsturb"],
  ["shellWakeFieldBraidRefinementCount", "swfbraid"],
  ["breakFieldWakeShellFieldClusterCount", "bfwsfield"],
  ["knotShellWakeFieldBraidRefinementCount", "kswfbraid"],
  ["breakFieldWakeShellFieldTurbulenceClusterCount", "bfwsfturb"],
  ["shellWakeFieldBraidTurbulenceRefinementCount", "swfbturb"],
  ["breakFieldWakeShellFieldTurbulenceSplitCount", "bfwsfsplit"],
  ["knotShellWakeFieldBraidTurbulenceRefinementCount", "kswfbturb"],
  ["breakFieldWakeShellFieldTurbulenceFieldClusterCount", "bfwsfcluster"],
];

export function clampRopeBundleOffset(
  value: number,
  min: number,
  max: number,
): number {
  return Math.max(min, Math.min(max, value));
}

export function buildRopeFallbackAugmentation(
  basePayload: FutureNativeRenderPayload,
): FutureNativeRopeDescriptorAugmentation {
  const pointCount = (basePayload.points ?? []).length;
  const lineCount = (basePayload.lines ?? []).length;
  return {
    payload: {
      ...basePayload,
      stats: {
        ...basePayload.stats,
        strandCount: 1,
        bundlePointCount: pointCount,
        bundleLineCount: lineCount,
      },
    },
    derivedStats: {
      strandCount: 1,
      bundlePointCount: pointCount,
      bundleLineCount: lineCount,
    },
  };
}

export function buildRopeAugmentation(input: {
  basePayload: FutureNativeRenderPayload;
  points: RopePoint[];
  lines: RopeLine[];
  routeSummaryTokens: string[];
  routeMetrics: RopeMetricMap;
  refinementMetrics?: RopeMetricMap;
  summaryMetrics?: RopeMetricMap;
  extraMetrics?: RopeMetricMap;
}): FutureNativeRopeDescriptorAugmentation {
  const refinementMetrics = input.refinementMetrics ?? {};
  const summaryMetrics = input.summaryMetrics ?? refinementMetrics;
  const extraMetrics = input.extraMetrics ?? {};
  const refinementTokens = REFINEMENT_SUMMARY_PREFIXES
    .map(([key, prefix]) =>
      key in summaryMetrics ? `${prefix}${summaryMetrics[key]}` : null,
    )
    .filter((value): value is string => value !== null);
  const summary = [
    input.basePayload.summary,
    ...input.routeSummaryTokens,
    ...refinementTokens,
  ].join(":");
  const derivedStats = {
    ...input.routeMetrics,
    ...refinementMetrics,
    ...extraMetrics,
  };
  return {
    payload: {
      ...input.basePayload,
      summary,
      points: input.points,
      lines: input.lines,
      stats: {
        ...input.basePayload.stats,
        ...derivedStats,
      },
    },
    derivedStats,
  };
}
