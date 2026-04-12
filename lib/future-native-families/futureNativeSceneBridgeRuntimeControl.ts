import type { ParticleConfig } from "../../types";
import { getFutureNativeSceneRuntimeBinding } from "./futureNativeSceneBindingRuntime";
import { clamp, deriveSceneScale, getLayerMode, getLayerTemporalSpeed, getLayerTemporalStrength, type SupportedLayerIndex } from "./futureNativeSceneBridgeShared";
import { buildMpmGranularInput } from "./futureNativeSceneBridgeInputs";
import { buildClothInput, buildMembraneInput, buildRopeInput, buildSoftbodyInput } from "./futureNativeSceneBridgePbdInputs";
import { buildVolumetricDensityTransportInput } from "./futureNativeSceneBridgeVolumetricInputs";
import { buildFractureLatticeInput } from "./futureNativeSceneBridgeFractureInputs";
import { createFutureNativeSceneBridgeMpmRuntime } from "./futureNativeSceneBridgeMpmRuntime";
import {
  buildFutureNativeMpmDedicatedRuntimePlan,
  createFutureNativeSceneBridgeMpmDedicatedRuntime,
} from "./futureNativeSceneBridgeMpmDedicatedRuntime";
import {
  buildFutureNativeFractureDedicatedRuntimePlan,
  createFutureNativeSceneBridgeFractureDedicatedRuntime,
} from "./futureNativeSceneBridgeFractureDedicatedRuntime";
import {
  buildEditableVolumetricAdvectionRuntimeConfig,
  buildEditableVolumetricLightShadowRuntimeConfig,
  buildEditableVolumetricPressureRuntimeConfig,
  buildEditableVolumetricSmokeRuntimeConfig,
} from "./futureNativeSceneBridgeVolumetricOverrides";
import { createPbdClothRuntimeFromInput } from "./starter-runtime/pbd_clothAdapter";
import { stepPbdClothRuntime } from "./starter-runtime/pbd_clothSolver";
import { createPbdMembraneRuntimeFromInput } from "./starter-runtime/pbd_membraneAdapter";
import { stepPbdMembraneRuntime } from "./starter-runtime/pbd_membraneSolver";
import { createPbdSoftbodyRuntimeFromInput } from "./starter-runtime/pbd_softbodyAdapter";
import { stepPbdSoftbodyRuntime } from "./starter-runtime/pbd_softbodySolver";
import { createPbdRopeRuntimeFromInput } from "./starter-runtime/pbd_ropeAdapter";
import { stepPbdRopeRuntime } from "./starter-runtime/pbd_ropeSolver";
import { stepMpmGranularRuntime } from "./starter-runtime/mpm_granularSolver";
import { normalizeFractureLatticeConfig } from "./starter-runtime/fracture_latticeAdapter";
import { createFractureLatticeRuntimeState, simulateFractureLatticeRuntime, stepFractureLatticeRuntime } from "./starter-runtime/fracture_latticeSolver";
import { stepVolumetricDensityTransportRuntime } from "./starter-runtime/volumetric_density_transportSolver";
import { createVolumetricBridgeRuntime, getVolumetricWarmFrameCount } from "./futureNativeSceneBridgeVolumetricRuntimeShared";
import type { FutureNativeSceneAudioDriveInput, FutureNativeSceneBridgeRuntime } from "./futureNativeSceneBridgeTypes";

function stringifyRuntimeSeed(seed: unknown) {
  return JSON.stringify(seed);
}

export function buildFutureNativeSceneBridgeRuntimeKey(
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
): string | null {
  const binding = getFutureNativeSceneRuntimeBinding(getLayerMode(config, layerIndex));
  if (!binding) return null;

  const sceneScale = deriveSceneScale(config, layerIndex, binding.familyId);
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  const temporalSpeed = getLayerTemporalSpeed(config, layerIndex);

  if (binding.familyId === "pbd-cloth") {
    return stringifyRuntimeSeed({ layerIndex, familyId: binding.familyId, routeTag: binding.routeTag, sceneScale, baseInput: buildClothInput(config, layerIndex) });
  }
  if (binding.familyId === "pbd-membrane") {
    return stringifyRuntimeSeed({ layerIndex, familyId: binding.familyId, routeTag: binding.routeTag, sceneScale, baseInput: buildMembraneInput(config, layerIndex) });
  }
  if (binding.familyId === "pbd-softbody") {
    return stringifyRuntimeSeed({ layerIndex, familyId: binding.familyId, routeTag: binding.routeTag, sceneScale, baseInput: buildSoftbodyInput(config, layerIndex) });
  }
  if (binding.familyId === "pbd-rope") {
    return stringifyRuntimeSeed({ layerIndex, familyId: binding.familyId, routeTag: binding.routeTag, sceneScale, baseInput: buildRopeInput(config, layerIndex) });
  }
  if (binding.familyId === "mpm-granular") {
    return stringifyRuntimeSeed({
      layerIndex,
      familyId: binding.familyId,
      routeTag: binding.routeTag,
      sceneScale,
      warmFrameCount: Math.max(8, Math.min(18, Math.round((binding.routeTag === "future-native-mpm-granular-jammed" ? 14 : 10) + temporalStrength * 10))),
      baseInput: buildMpmGranularInput(config, layerIndex),
    });
  }
  if (binding.familyId === "mpm-viscoplastic" || binding.familyId === "mpm-snow" || binding.familyId === "mpm-mud" || binding.familyId === "mpm-paste") {
    const plan = buildFutureNativeMpmDedicatedRuntimePlan(binding, config, layerIndex);
    return plan ? stringifyRuntimeSeed({ layerIndex, sceneScale, ...plan }) : null;
  }
  if (binding.familyId === "fracture-lattice") {
    const baseInput = buildFractureLatticeInput(config, layerIndex);
    const warmFrameCount = Math.max(
      3,
      Math.min(
        7,
        Math.round((binding.routeTag === "future-native-fracture-lattice-collapse" ? 5 : 4) + temporalStrength * 2),
      ),
    );
    return stringifyRuntimeSeed({ layerIndex, familyId: binding.familyId, routeTag: binding.routeTag, sceneScale, warmFrameCount, baseInput: normalizeFractureLatticeConfig(baseInput) });
  }
  if (binding.familyId === "fracture-voxel" || binding.familyId === "fracture-crack-propagation" || binding.familyId === "fracture-debris-generation") {
    const plan = buildFutureNativeFractureDedicatedRuntimePlan(binding, config, layerIndex);
    return plan ? stringifyRuntimeSeed({ layerIndex, sceneScale, ...plan }) : null;
  }
  if (binding.familyId === "volumetric-smoke") {
    return stringifyRuntimeSeed({
      layerIndex,
      familyId: binding.familyId,
      routeTag: binding.routeTag,
      sceneScale,
      warmFrameCount: getVolumetricWarmFrameCount(binding.routeTag, temporalSpeed, 20, 14, 30, { routeTag: "future-native-volumetric-smoke-static", frames: 24 }),
      baseInput: buildEditableVolumetricSmokeRuntimeConfig(config, layerIndex),
    });
  }
  if (binding.familyId === "volumetric-advection") {
    return stringifyRuntimeSeed({
      layerIndex,
      familyId: binding.familyId,
      routeTag: binding.routeTag,
      sceneScale,
      warmFrameCount: getVolumetricWarmFrameCount(binding.routeTag, temporalSpeed, 18, 14, 30, { routeTag: "future-native-volumetric-sublimate", frames: 24 }),
      baseInput: buildEditableVolumetricAdvectionRuntimeConfig(config, layerIndex),
    });
  }
  if (binding.familyId === "volumetric-pressure-coupling") {
    return stringifyRuntimeSeed({
      layerIndex,
      familyId: binding.familyId,
      routeTag: binding.routeTag,
      sceneScale,
      warmFrameCount: getVolumetricWarmFrameCount(binding.routeTag, temporalSpeed, 20, 16, 34, { routeTag: "future-native-volumetric-pressure-cells", frames: 26 }),
      baseInput: buildEditableVolumetricPressureRuntimeConfig(config, layerIndex),
    });
  }
  if (binding.familyId === "volumetric-light-shadow-coupling") {
    return stringifyRuntimeSeed({
      layerIndex,
      familyId: binding.familyId,
      routeTag: binding.routeTag,
      sceneScale,
      warmFrameCount: getVolumetricWarmFrameCount(binding.routeTag, temporalSpeed, 28, 16, 34, { routeTag: "future-native-volumetric-shadow-velvet", frames: 24 }),
      baseInput: buildEditableVolumetricLightShadowRuntimeConfig(config, layerIndex),
    });
  }
  return stringifyRuntimeSeed({
    layerIndex,
    familyId: binding.familyId,
    routeTag: binding.routeTag,
    sceneScale,
    warmFrameCount: getVolumetricWarmFrameCount(binding.routeTag, temporalSpeed, 18, 12, 28, { routeTag: "future-native-volumetric-sublimate", frames: 22 }),
    baseInput: buildVolumetricDensityTransportInput(config, layerIndex),
  });
}

export function createFutureNativeSceneBridgeRuntime(
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
): FutureNativeSceneBridgeRuntime | null {
  const binding = getFutureNativeSceneRuntimeBinding(getLayerMode(config, layerIndex));
  if (!binding) return null;
  const sceneScale = deriveSceneScale(config, layerIndex, binding.familyId);
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  const temporalSpeed = getLayerTemporalSpeed(config, layerIndex);
  if (binding.familyId === "pbd-cloth") {
    const baseInput = buildClothInput(config, layerIndex);
    return {
      binding,
      familyId: "pbd-cloth",
      baseInput,
      runtime: createPbdClothRuntimeFromInput(baseInput),
      sceneScale,
    };
  }
  if (binding.familyId === "pbd-membrane") {
    const baseInput = buildMembraneInput(config, layerIndex);
    return {
      binding,
      familyId: "pbd-membrane",
      baseInput,
      runtime: createPbdMembraneRuntimeFromInput(baseInput),
      sceneScale,
    };
  }
  if (binding.familyId === "pbd-softbody") {
    const baseInput = buildSoftbodyInput(config, layerIndex);
    return {
      binding,
      familyId: "pbd-softbody",
      baseInput,
      runtime: createPbdSoftbodyRuntimeFromInput(baseInput),
      sceneScale,
    };
  }
  if (binding.familyId === "pbd-rope") {
    const baseInput = buildRopeInput(config, layerIndex);
    return {
      binding,
      familyId: "pbd-rope",
      baseInput,
      runtime: createPbdRopeRuntimeFromInput(baseInput),
      sceneScale,
    };
  }
  if (binding.familyId === "mpm-granular") {
    return createFutureNativeSceneBridgeMpmRuntime(binding, config, layerIndex, sceneScale);
  }
  if (binding.familyId === "mpm-viscoplastic" || binding.familyId === "mpm-snow" || binding.familyId === "mpm-mud" || binding.familyId === "mpm-paste") {
    return createFutureNativeSceneBridgeMpmDedicatedRuntime(binding, config, layerIndex, sceneScale);
  }
  if (binding.familyId === "fracture-lattice") {
    const baseInput = buildFractureLatticeInput(config, layerIndex);
    const normalized = normalizeFractureLatticeConfig(baseInput);
    const warmFrameCount = Math.max(
      3,
      Math.min(
        7,
        Math.round(
          (binding.routeTag === "future-native-fracture-lattice-collapse" ? 5 : 4) +
            temporalStrength * 2,
        ),
      ),
    );
    return {
      binding,
      familyId: binding.familyId,
      baseInput,
      runtime: simulateFractureLatticeRuntime(
        createFractureLatticeRuntimeState(normalized),
        warmFrameCount,
      ),
      sceneScale,
    };
  }
  if (binding.familyId === "fracture-voxel" || binding.familyId === "fracture-crack-propagation" || binding.familyId === "fracture-debris-generation") {
    return createFutureNativeSceneBridgeFractureDedicatedRuntime(binding, config, layerIndex, sceneScale);
  }
  if (binding.familyId === "volumetric-smoke") {
    const baseInput = buildEditableVolumetricSmokeRuntimeConfig(config, layerIndex);
    return createVolumetricBridgeRuntime(binding, "volumetric-smoke", baseInput, sceneScale, getVolumetricWarmFrameCount(binding.routeTag, temporalSpeed, 20, 14, 30, { routeTag: "future-native-volumetric-smoke-static", frames: 24 }));
  }
  if (binding.familyId === "volumetric-advection") {
    const baseInput = buildEditableVolumetricAdvectionRuntimeConfig(config, layerIndex);
    return createVolumetricBridgeRuntime(binding, "volumetric-advection", baseInput, sceneScale, getVolumetricWarmFrameCount(binding.routeTag, temporalSpeed, 18, 14, 30, { routeTag: "future-native-volumetric-sublimate", frames: 24 }));
  }
  if (binding.familyId === "volumetric-pressure-coupling") {
    const baseInput = buildEditableVolumetricPressureRuntimeConfig(config, layerIndex);
    return createVolumetricBridgeRuntime(binding, "volumetric-pressure-coupling", baseInput, sceneScale, getVolumetricWarmFrameCount(binding.routeTag, temporalSpeed, 20, 16, 34, { routeTag: "future-native-volumetric-pressure-cells", frames: 26 }));
  }
  if (binding.familyId === "volumetric-light-shadow-coupling") {
    const baseInput = buildEditableVolumetricLightShadowRuntimeConfig(config, layerIndex);
    return createVolumetricBridgeRuntime(binding, "volumetric-light-shadow-coupling", baseInput, sceneScale, getVolumetricWarmFrameCount(binding.routeTag, temporalSpeed, 28, 16, 34, { routeTag: "future-native-volumetric-shadow-velvet", frames: 24 }));
  }
  const baseInput = buildVolumetricDensityTransportInput(config, layerIndex);
  return createVolumetricBridgeRuntime(binding, "volumetric-density-transport", baseInput, sceneScale, getVolumetricWarmFrameCount(binding.routeTag, temporalSpeed, 18, 12, 28, { routeTag: "future-native-volumetric-sublimate", frames: 22 }));
}

export function applyFutureNativeSceneAudioDrive(
  controller: FutureNativeSceneBridgeRuntime,
  audio: FutureNativeSceneAudioDriveInput,
  enabled: boolean,
) {
  const pulse = enabled ? audio.pulse : 0;
  const bass = enabled ? audio.bass : 0;
  const treble = enabled ? audio.treble : 0;
  const bandA = enabled ? audio.bandA : 0;
  const bandB = enabled ? audio.bandB : 0;
  if (controller.familyId === "pbd-cloth") {
    controller.runtime.config.windX = clamp(
      (controller.baseInput.windX ?? 0) + bandA * 0.12,
      -0.7,
      0.7,
    );
    controller.runtime.config.windY = clamp(
      (controller.baseInput.windY ?? 0) + pulse * 0.08,
      -0.42,
      0.42,
    );
    controller.runtime.config.pressureStrength = clamp(
      (controller.baseInput.pressureStrength ?? 0) + bass * 0.06,
      0,
      0.4,
    );
    controller.runtime.config.pinChoreographyAmplitude = clamp(
      (controller.baseInput.pinChoreographyAmplitude ?? 0) + bandB * 0.01,
      0.01,
      0.08,
    );
    return;
  }
  if (controller.familyId === "pbd-membrane") {
    controller.runtime.config.windX = clamp(
      (controller.baseInput.windX ?? 0) + bandA * 0.1,
      -0.6,
      0.6,
    );
    controller.runtime.config.windY = clamp(
      (controller.baseInput.windY ?? 0) + pulse * 0.06,
      -0.36,
      0.36,
    );
    controller.runtime.config.pressureStrength = clamp(
      (controller.baseInput.pressureStrength ?? 0) + bass * 0.08,
      0,
      0.52,
    );
    controller.runtime.config.inflation = clamp(
      (controller.baseInput.inflation ?? 0) + pulse * 0.04,
      0,
      0.68,
    );
    return;
  }
  if (controller.familyId === "pbd-softbody") {
    controller.runtime.config.windX = clamp(
      (controller.baseInput.windX ?? 0) + bandA * 0.1,
      -0.6,
      0.6,
    );
    controller.runtime.config.windY = clamp(
      (controller.baseInput.windY ?? 0) + pulse * 0.05,
      -0.3,
      0.3,
    );
    controller.runtime.config.pressureStrength = clamp(
      (controller.baseInput.pressureStrength ?? 0) + bass * 0.06,
      0,
      0.48,
    );
    controller.runtime.config.volumePreservation = clamp(
      (controller.baseInput.volumePreservation ?? 0) + bandB * 0.08,
      0.48,
      1.08,
    );
    return;
  }
  if (controller.familyId === "pbd-rope") {
    controller.runtime.config.gravity = clamp(
      (controller.baseInput.gravity ?? 6.8) + bass * 1.2,
      2.2,
      11.5,
    );
    controller.runtime.config.bendStiffness = clamp(
      (controller.baseInput.bendStiffness ?? 0.2) + pulse * 0.1 + bandB * 0.08,
      0.08,
      0.7,
    );
    controller.runtime.config.selfCollisionStiffness = clamp(
      (controller.baseInput.selfCollisionStiffness ?? 0.3) + bandA * 0.14,
      0.12,
      0.92,
    );
    controller.runtime.config.circleColliderRadius = clamp(
      (controller.baseInput.circleColliderRadius ?? 0.14) + treble * 0.08,
      0.06,
      0.3,
    );
    return;
  }
  if (controller.familyId === "mpm-granular" || controller.familyId === "mpm-viscoplastic" || controller.familyId === "mpm-snow" || controller.familyId === "mpm-mud" || controller.familyId === "mpm-paste") {
    controller.runtime.config.gravity = clamp(
      (controller.baseInput.gravity ?? 9.8) + bass * 1.4,
      controller.familyId === "mpm-viscoplastic" ? 3.8 : controller.familyId === "mpm-mud" ? 4 : controller.familyId === "mpm-paste" ? 3.6 : 4.6,
      controller.familyId === "mpm-viscoplastic" ? 12.2 : controller.familyId === "mpm-mud" ? 12.8 : controller.familyId === "mpm-paste" ? 11.6 : 13.5,
    );
    controller.runtime.config.stressGain = clamp(
      (controller.baseInput.stressGain ?? 0.36) + pulse * 0.18 + (controller.familyId === "mpm-viscoplastic" ? bandA * 0.08 : 0),
      0.18,
      1.3,
    );
    controller.runtime.config.hardening = clamp(
      (controller.baseInput.hardening ?? 0.18) + bandB * 0.18,
      0.08,
      0.82,
    );
    controller.runtime.config.apicBlend = clamp(
      (controller.baseInput.apicBlend ?? 0.42) + treble * 0.12,
      0.2,
      0.9,
    );
    if (controller.familyId === "mpm-viscoplastic") {
      controller.runtime.config.plasticity = clamp(
        (controller.baseInput.plasticity ?? 0.58) + bandA * 0.12 + pulse * 0.08,
        0.24,
        0.96,
      );
      controller.runtime.config.yieldRate = clamp(
        (controller.baseInput.yieldRate ?? 0.48) + treble * 0.1,
        0.18,
        0.92,
      );
    } else if (controller.familyId === "mpm-snow") {
      controller.runtime.config.hardening = clamp(
        (controller.baseInput.hardening ?? 0.34) + bass * 0.12 + bandB * 0.08,
        0.12,
        0.92,
      );
      controller.runtime.config.cohesion = clamp(
        (controller.baseInput.cohesion ?? 0.12) + pulse * 0.04,
        0.04,
        0.36,
      );
    } else if (controller.familyId === "mpm-mud") {
      controller.runtime.config.cohesion = clamp(
        (controller.baseInput.cohesion ?? 0.18) + bandA * 0.06 + pulse * 0.03,
        0.08,
        0.44,
      );
      controller.runtime.config.damping = clamp(
        (controller.baseInput.damping ?? 0.07) + bandB * 0.04,
        0.04,
        0.22,
      );
      controller.runtime.config.yieldRate = clamp(
        (controller.baseInput.yieldRate ?? 0.44) + treble * 0.08,
        0.18,
        0.82,
      );
    } else if (controller.familyId === "mpm-paste") {
      controller.runtime.config.cohesion = clamp(
        (controller.baseInput.cohesion ?? 0.24) + bandA * 0.08 + pulse * 0.04,
        0.12,
        0.52,
      );
      controller.runtime.config.damping = clamp(
        (controller.baseInput.damping ?? 0.09) + bandB * 0.05,
        0.06,
        0.28,
      );
      controller.runtime.config.plasticity = clamp(
        (controller.baseInput.plasticity ?? 0.7) + pulse * 0.08 + bandB * 0.06,
        0.4,
        0.98,
      );
      controller.runtime.config.yieldRate = clamp(
        (controller.baseInput.yieldRate ?? 0.58) + treble * 0.1,
        0.28,
        0.96,
      );
    }
    return;
  }
  if (controller.familyId === "fracture-lattice" || controller.familyId === "fracture-voxel" || controller.familyId === "fracture-crack-propagation" || controller.familyId === "fracture-debris-generation") {
    controller.runtime.config.impulseMagnitude = clamp(
      (controller.baseInput.impulseMagnitude ?? 1.4) + bass * 0.35,
      0.8,
      2.8,
    );
    controller.runtime.config.debrisSpawnRate = clamp(
      (controller.baseInput.debrisSpawnRate ?? 0.18) + pulse * 0.06,
      0.04,
      0.62,
    );
    controller.runtime.config.directionalBias = clamp(
      (controller.baseInput.directionalBias ?? 0.42) + bandA * 0.08,
      0.08,
      0.84,
    );
    return;
  }
  if (
    controller.familyId === "volumetric-smoke" ||
    controller.familyId === "volumetric-advection" ||
    controller.familyId === "volumetric-pressure-coupling" ||
    controller.familyId === "volumetric-light-shadow-coupling" ||
    controller.familyId === "volumetric-density-transport"
  ) {
    controller.runtime.config.injectionRate = clamp(
      (controller.baseInput.injectionRate ?? 0.16) + bass * 0.08,
      0.06,
      0.52,
    );
    controller.runtime.config.swirlStrength = clamp(
      (controller.baseInput.swirlStrength ?? 0.42) + bandA * 0.16 + treble * 0.12,
      0.12,
      1.4,
    );
    controller.runtime.config.buoyancy = clamp(
      (controller.baseInput.buoyancy ?? 0.18) + pulse * 0.08,
      -0.12,
      0.8,
    );
    controller.runtime.config.shadowStrength = clamp(
      (controller.baseInput.shadowStrength ?? 0.55) + bandB * 0.14,
      0.16,
      1.2,
    );
    if (controller.familyId === "volumetric-advection") {
      controller.runtime.config.advectionStrength = clamp(
        (controller.baseInput.advectionStrength ?? 0.84) + bandA * 0.14,
        0.2,
        1.4,
      );
    }
    if (controller.familyId === "volumetric-pressure-coupling") {
      controller.runtime.config.pressureRelaxation = clamp(
        (controller.baseInput.pressureRelaxation ?? 0.48) + bass * 0.1 + bandB * 0.08,
        0.14,
        1,
      );
      controller.runtime.config.obstacleStrength = clamp(
        (controller.baseInput.obstacleStrength ?? 0.48) + pulse * 0.08,
        0.12,
        1,
      );
    }
    if (controller.familyId === "volumetric-light-shadow-coupling") {
      controller.runtime.config.lightAbsorption = clamp(
        (controller.baseInput.lightAbsorption ?? 0.48) + bass * 0.08,
        0.12,
        1.4,
      );
      controller.runtime.config.lightMarchSteps = clamp(
        Math.round((controller.baseInput.lightMarchSteps ?? 8) + treble * 2 + bandA),
        2,
        16,
      );
      controller.runtime.config.obstacleStrength = clamp(
        (controller.baseInput.obstacleStrength ?? 0.42) + pulse * 0.08,
        0.12,
        1,
      );
      controller.runtime.config.volumeDepthScale = clamp(
        (controller.baseInput.volumeDepthScale ?? 0.8) + bandA * 0.12,
        0.1,
        1.6,
      );
    }
  }
}

export function stepFutureNativeSceneBridgeRuntime(
  controller: FutureNativeSceneBridgeRuntime,
  options?: { steps?: number; dt?: number },
): FutureNativeSceneBridgeRuntime {
  const steps = Math.max(1, Math.floor(options?.steps ?? 1));
  const dt = options?.dt ?? 1 / 60;
  for (let i = 0; i < steps; i += 1) {
    if (controller.familyId === "pbd-cloth") {
      controller.runtime = stepPbdClothRuntime(controller.runtime, { dt });
    } else if (controller.familyId === "pbd-membrane") {
      controller.runtime = stepPbdMembraneRuntime(controller.runtime, { dt });
    } else if (controller.familyId === "pbd-softbody") {
      controller.runtime = stepPbdSoftbodyRuntime(controller.runtime, { dt });
    } else if (controller.familyId === "pbd-rope") {
      controller.runtime = stepPbdRopeRuntime(controller.runtime, {
        dt,
        iterations: 14,
      });
    } else if (controller.familyId === "mpm-granular" || controller.familyId === "mpm-viscoplastic" || controller.familyId === "mpm-snow" || controller.familyId === "mpm-mud" || controller.familyId === "mpm-paste") {
      controller.runtime = stepMpmGranularRuntime(controller.runtime, {
        dt,
        substeps: Math.max(2, Math.floor(controller.runtime.config.substeps)),
      });
    } else if (controller.familyId === "fracture-lattice" || controller.familyId === "fracture-voxel" || controller.familyId === "fracture-crack-propagation" || controller.familyId === "fracture-debris-generation") {
      controller.runtime = stepFractureLatticeRuntime(controller.runtime);
    } else {
      controller.runtime = stepVolumetricDensityTransportRuntime(
        controller.runtime,
      );
    }
  }
  return controller;
}
