import type { ParticleConfig } from "../../types";
import type { SupportedLayerIndex } from "./futureNativeSceneBridgeShared";
import type { MpmGranularInputConfig } from "./starter-runtime/mpm_granularAdapter";
import { buildFutureNativeMpmGranularInput } from "./futureNativeSceneBridgeMpmGranular";

export function buildMpmGranularInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): MpmGranularInputConfig {
  return buildFutureNativeMpmGranularInput(config, layerIndex);
}
