import type { PbdRopeRuntimeState } from "./starter-runtime/pbd_ropeSolver";
import { buildPbdRopeDebugRenderPayload } from "./starter-runtime/pbd_ropeRenderer";
import { buildAuroraThreadsRopePayload } from "./futureNativeSceneBridgeRopeAuroraThreads";
import { buildSignalBraidRopePayload } from "./futureNativeSceneBridgeRopeSignalBraid";
import { buildRopeFallbackAugmentation, type RopeRouteContext } from "./futureNativeSceneBridgeRopeShared";
import type { FutureNativeRopeDescriptorAugmentation } from "./futureNativeSceneBridgeTypes";

export function buildFutureNativeRopePayload(
  input: { runtime: PbdRopeRuntimeState; routeTag: string },
): FutureNativeRopeDescriptorAugmentation {
  const basePayload = buildPbdRopeDebugRenderPayload(input.runtime);
  const basePoints = basePayload.points ?? [];
  if (basePoints.length <= 1) return buildRopeFallbackAugmentation(basePayload);

  const segmentCount = Math.max(1, basePoints.length - 1);
  const context: RopeRouteContext = {
    basePayload,
    basePoints,
    restLength: input.runtime.config.restLength,
    segmentCount,
    framePhase: input.runtime.frame * 0.14,
    buildTangentFrame(index) {
      const prev = basePoints[Math.max(0, index - 1)];
      const next = basePoints[Math.min(basePoints.length - 1, index + 1)];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const length = Math.hypot(dx, dy) || 1;
      const tx = dx / length;
      const ty = dy / length;
      return { tx, ty, nx: -ty, ny: tx };
    },
  };

  if (input.routeTag === "future-native-rope-signal-braid") {
    return buildSignalBraidRopePayload(context);
  }
  if (input.routeTag === "future-native-rope-aurora-threads") {
    return buildAuroraThreadsRopePayload(context);
  }
  return buildRopeFallbackAugmentation(basePayload);
}
