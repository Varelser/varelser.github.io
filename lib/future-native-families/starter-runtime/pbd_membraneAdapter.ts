import { createPbdMembraneRuntimeState, type PbdMembraneRuntimeState } from './pbd_membraneSolver';
import { getDefaultPbdMembraneConfig, type PbdMembraneNormalizedConfig } from './pbd_membraneSchema';

export type PbdMembraneInputConfig = Partial<PbdMembraneNormalizedConfig>;

export function normalizePbdMembraneConfig(input?: PbdMembraneInputConfig): PbdMembraneNormalizedConfig {
  const defaults = getDefaultPbdMembraneConfig();
  return {
    width: Math.max(3, Math.floor(input?.width ?? defaults.width)),
    height: Math.max(3, Math.floor(input?.height ?? defaults.height)),
    spacing: Math.max(0.01, input?.spacing ?? defaults.spacing),
    stiffness: Math.min(1, Math.max(0, input?.stiffness ?? defaults.stiffness)),
    shearStiffness: Math.min(1, Math.max(0, input?.shearStiffness ?? defaults.shearStiffness)),
    bendStiffness: Math.min(1, Math.max(0, input?.bendStiffness ?? defaults.bendStiffness)),
    damping: Math.min(0.999, Math.max(0, input?.damping ?? defaults.damping)),
    gravity: Math.max(0, input?.gravity ?? defaults.gravity),
    pulseX: input?.pulseX ?? defaults.pulseX,
    pulseY: input?.pulseY ?? defaults.pulseY,
    collisionRadius: Math.max(0.001, input?.collisionRadius ?? defaults.collisionRadius),
    floorY: Math.min(0, input?.floorY ?? defaults.floorY),
    selfCollisionStiffness: Math.min(1, Math.max(0, input?.selfCollisionStiffness ?? defaults.selfCollisionStiffness)),
    inflation: Math.max(0, input?.inflation ?? defaults.inflation),
    boundaryTension: Math.max(0, input?.boundaryTension ?? defaults.boundaryTension),
    anchorMode: input?.anchorMode ?? defaults.anchorMode,
    pinGroupCount: Math.max(1, Math.floor(input?.pinGroupCount ?? defaults.pinGroupCount)),
    pinGroupStrength: Math.min(1, Math.max(0, input?.pinGroupStrength ?? defaults.pinGroupStrength)),
    pinChoreographyMode: input?.pinChoreographyMode ?? defaults.pinChoreographyMode,
    pinChoreographyPreset: input?.pinChoreographyPreset ?? defaults.pinChoreographyPreset,
    pinChoreographyAmplitude: Math.max(0, input?.pinChoreographyAmplitude ?? defaults.pinChoreographyAmplitude),
    pinChoreographySpeed: Math.max(0, input?.pinChoreographySpeed ?? defaults.pinChoreographySpeed),
    tearThreshold: Math.max(1.05, input?.tearThreshold ?? defaults.tearThreshold),
    tearPropagationBias: Math.min(1, Math.max(0, input?.tearPropagationBias ?? defaults.tearPropagationBias)),
    tearDirectionX: input?.tearDirectionX ?? defaults.tearDirectionX,
    tearDirectionY: input?.tearDirectionY ?? defaults.tearDirectionY,
    obstacleFieldX: input?.obstacleFieldX ?? defaults.obstacleFieldX,
    obstacleFieldY: input?.obstacleFieldY ?? defaults.obstacleFieldY,
    obstacleFieldRadius: Math.max(0, input?.obstacleFieldRadius ?? defaults.obstacleFieldRadius),
    obstacleFieldStrength: Math.max(0, input?.obstacleFieldStrength ?? defaults.obstacleFieldStrength),
    obstacleField2X: input?.obstacleField2X ?? defaults.obstacleField2X,
    obstacleField2Y: input?.obstacleField2Y ?? defaults.obstacleField2Y,
    obstacleField2Radius: Math.max(0, input?.obstacleField2Radius ?? defaults.obstacleField2Radius),
    obstacleField2Strength: Math.max(0, input?.obstacleField2Strength ?? defaults.obstacleField2Strength),
    obstaclePreset: input?.obstaclePreset ?? defaults.obstaclePreset,
    tearBiasMapPreset: input?.tearBiasMapPreset ?? defaults.tearBiasMapPreset,
    tearBiasMapScale: Math.max(0, input?.tearBiasMapScale ?? defaults.tearBiasMapScale),
    tearBiasMapFrequency: Math.max(0, input?.tearBiasMapFrequency ?? defaults.tearBiasMapFrequency),
    tearBiasMapRotation: input?.tearBiasMapRotation ?? defaults.tearBiasMapRotation,
    tearBiasMapContrast: Math.max(0, input?.tearBiasMapContrast ?? defaults.tearBiasMapContrast),
    windX: input?.windX ?? defaults.windX,
    windY: input?.windY ?? defaults.windY,
    windPulse: Math.max(0, input?.windPulse ?? defaults.windPulse),
    pressureStrength: Math.max(0, input?.pressureStrength ?? defaults.pressureStrength),
    pressurePulse: Math.max(0, input?.pressurePulse ?? defaults.pressurePulse),
    circleColliderX: input?.circleColliderX ?? defaults.circleColliderX,
    circleColliderY: input?.circleColliderY ?? defaults.circleColliderY,
    circleColliderRadius: Math.max(0, input?.circleColliderRadius ?? defaults.circleColliderRadius),
    capsuleColliderAx: input?.capsuleColliderAx ?? defaults.capsuleColliderAx,
    capsuleColliderAy: input?.capsuleColliderAy ?? defaults.capsuleColliderAy,
    capsuleColliderBx: input?.capsuleColliderBx ?? defaults.capsuleColliderBx,
    capsuleColliderBy: input?.capsuleColliderBy ?? defaults.capsuleColliderBy,
    capsuleColliderRadius: Math.max(0, input?.capsuleColliderRadius ?? defaults.capsuleColliderRadius),
  };
}

export function createPbdMembraneRuntimeFromInput(input?: PbdMembraneInputConfig): PbdMembraneRuntimeState {
  return createPbdMembraneRuntimeState(normalizePbdMembraneConfig(input));
}
