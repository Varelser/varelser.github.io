import type { ParticleConfig } from "../../types";
import {
  clamp,
  getLayerBaseSize,
  getLayerCollisionRadius,
  getLayerCount,
  getLayerFlowAmplitude,
  getLayerFlowFrequency,
  getLayerGravity,
  getLayerMode,
  getLayerRadiusScale,
  getLayerRepulsion,
  getLayerSource,
  getLayerTemporalSpeed,
  getLayerTemporalStrength,
  type SupportedLayerIndex,
} from "./futureNativeSceneBridgeShared";
import type { PbdClothInputConfig } from "./starter-runtime/pbd_clothAdapter";
import type { PbdMembraneInputConfig } from "./starter-runtime/pbd_membraneAdapter";
import type { PbdSoftbodyInputConfig } from "./starter-runtime/pbd_softbodyAdapter";
import type { PbdRopeInputConfig } from "./starter-runtime/pbd_ropeAdapter";
import { buildFutureNativeClothInput, buildFutureNativeSoftbodyInput } from "./futureNativeSceneBridgePbdClothSoftbody";
import { buildFutureNativeMembraneInput } from "./futureNativeSceneBridgePbdMembrane";

export function buildClothInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): PbdClothInputConfig {
  return buildFutureNativeClothInput(config, layerIndex);
}

export function buildMembraneInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): PbdMembraneInputConfig {
  return buildFutureNativeMembraneInput(config, layerIndex);
}

export function buildSoftbodyInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): PbdSoftbodyInputConfig {
  return buildFutureNativeSoftbodyInput(config, layerIndex);
}

export function buildRopeInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): PbdRopeInputConfig {
  const source = getLayerSource(config, layerIndex);
  const mode = getLayerMode(config, layerIndex);
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  const temporalSpeed = getLayerTemporalSpeed(config, layerIndex);
  const flowAmplitude = getLayerFlowAmplitude(config, layerIndex);
  const flowFrequency = getLayerFlowFrequency(config, layerIndex);
  const dualAnchor = mode === "signal_braid";
  return {
    segments: clamp(Math.round(18 + Math.sqrt(Math.max(1, getLayerCount(config, layerIndex))) * 0.18 + getLayerRadiusScale(config, layerIndex) * 4), 16, 42),
    restLength: clamp(0.048 * getLayerBaseSize(config, layerIndex), 0.028, 0.078),
    stiffness: clamp(0.88 + getLayerRadiusScale(config, layerIndex) * 0.06, 0.78, 0.98),
    bendStiffness: clamp(0.18 + temporalStrength * 0.22 + (mode === "aurora_threads" ? 0.06 : 0), 0.12, 0.56),
    damping: clamp(0.028 + temporalSpeed * 0.08, 0.02, 0.12),
    gravity: clamp(4.8 + getLayerGravity(config, layerIndex) * 0.42 + (mode === "aurora_threads" ? -1.0 : 0), 2.4, 10.8),
    anchorMode: dualAnchor ? "both-ends" : "start",
    collisionRadius: clamp(getLayerCollisionRadius(config, layerIndex) * 0.08, 0.012, 0.038),
    floorY: mode === "aurora_threads" ? -0.72 : -0.96,
    circleColliderX: mode === "signal_braid" ? 0 : source === "ring" ? -0.08 : 0.1,
    circleColliderY: mode === "aurora_threads" ? -0.28 : -0.74,
    circleColliderRadius: clamp(0.12 + flowAmplitude * 0.08 + (mode === "aurora_threads" ? 0.08 : 0), 0.08, 0.24),
    capsuleColliderAx: dualAnchor ? -0.36 : -0.18,
    capsuleColliderAy: mode === "aurora_threads" ? 0.18 : -0.52,
    capsuleColliderBx: dualAnchor ? 0.36 : 0.24,
    capsuleColliderBy: mode === "aurora_threads" ? -0.34 : -0.92,
    capsuleColliderRadius: clamp(0.05 + flowFrequency * 0.002, 0.04, 0.1),
    selfCollisionStiffness: clamp(0.28 + getLayerRepulsion(config, layerIndex) * 0.018 + (mode === "signal_braid" ? 0.12 : 0), 0.16, 0.86),
  };
}
