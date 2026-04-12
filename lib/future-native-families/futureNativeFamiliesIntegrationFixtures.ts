import type { ProjectSerializationBlock } from '../../types';
import { normalizeFractureLatticeConfig } from './starter-runtime/fracture_latticeAdapter';
import { normalizeMpmGranularConfig } from './starter-runtime/mpm_granularAdapter';
import { normalizePbdClothConfig } from './starter-runtime/pbd_clothAdapter';
import { normalizePbdMembraneConfig } from './starter-runtime/pbd_membraneAdapter';
import { normalizePbdRopeConfig } from './starter-runtime/pbd_ropeAdapter';
import { normalizePbdSoftbodyConfig } from './starter-runtime/pbd_softbodyAdapter';
import { normalizeVolumetricDensityTransportConfig } from './starter-runtime/volumetric_density_transportAdapter';
import {
  createRuntimeConfigBlock,
  type FutureNativeProjectIntegratedId,
} from './futureNativeFamiliesIntegrationShared';
import {
  getIntegratedVolumetricFixtureInput,
  getIntegratedVolumetricRuntimeConfigValues,
  isIntegratedVolumetricFamilyId,
} from './futureNativeFamiliesIntegrationVolumetricFixtures';
import {
  getIntegratedFractureFixtureInput,
  getIntegratedFractureRuntimeConfigValues,
  isIntegratedFractureFamilyId,
} from './futureNativeFamiliesIntegrationFractureFixtures';

export function getIntegratedFixtureInput(familyId: FutureNativeProjectIntegratedId): Record<string, unknown> {
  if (isIntegratedVolumetricFamilyId(familyId)) {
    return getIntegratedVolumetricFixtureInput(familyId);
  }
  if (isIntegratedFractureFamilyId(familyId)) {
    return getIntegratedFractureFixtureInput(familyId);
  }
  switch (familyId) {
    case 'pbd-rope':
      return {
        segments: 24,
        restLength: 0.045,
        stiffness: 0.96,
        bendStiffness: 0.24,
        damping: 0.03,
        gravity: 9.8,
        anchorMode: 'start',
        collisionRadius: 0.015,
        floorY: -0.9,
        circleColliderX: 0.08,
        circleColliderY: -0.8,
        circleColliderRadius: 0.18,
        capsuleColliderAx: -0.16,
        capsuleColliderAy: -0.58,
        capsuleColliderBx: 0.22,
        capsuleColliderBy: -0.92,
        capsuleColliderRadius: 0.075,
        selfCollisionStiffness: 0.72,
      };
    case 'mpm-granular':
      return {
        particleCount: 144,
        particleRadius: 0.018,
        spawnWidth: 0.44,
        spawnHeight: 0.34,
        wallHalfWidth: 0.62,
        floorY: -0.9,
        gravity: 10.2,
        cohesion: 0.08,
        friction: 0.82,
        damping: 0.035,
        substeps: 4,
        cellResolution: 28,
        materialKind: 'snow',
      };
    case 'mpm-viscoplastic':
      return {
        particleCount: 160,
        particleRadius: 0.018,
        spawnWidth: 0.52,
        spawnHeight: 0.22,
        wallHalfWidth: 0.68,
        floorY: -1.02,
        gravity: 7.1,
        cohesion: 0.24,
        friction: 0.48,
        damping: 0.08,
        substeps: 5,
        cellResolution: 30,
        materialKind: 'paste',
        plasticity: 0.72,
        yieldRate: 0.58,
        kernelRadius: 2.1,
        apicBlend: 0.66,
        stressGain: 0.56,
        hardening: 0.42,
      };
    case 'mpm-snow':
    case 'mpm-mud':
    case 'mpm-paste':
      return {
        particleCount: familyId === 'mpm-mud' ? 156 : familyId === 'mpm-paste' ? 152 : 168,
        particleRadius: familyId === 'mpm-mud' ? 0.018 : familyId === 'mpm-paste' ? 0.019 : 0.017,
        spawnWidth: familyId === 'mpm-mud' ? 0.56 : familyId === 'mpm-paste' ? 0.58 : 0.54,
        spawnHeight: familyId === 'mpm-paste' ? 0.18 : 0.24,
        wallHalfWidth: familyId === 'mpm-mud' ? 0.74 : familyId === 'mpm-paste' ? 0.78 : 0.72,
        floorY: familyId === 'mpm-mud' ? -0.98 : familyId === 'mpm-paste' ? -0.96 : -0.94,
        gravity: familyId === 'mpm-mud' ? 8.4 : familyId === 'mpm-paste' ? 6.3 : 9.8,
        cohesion: familyId === 'mpm-mud' ? 0.2 : familyId === 'mpm-paste' ? 0.27 : 0.14,
        friction: familyId === 'mpm-mud' ? 0.58 : familyId === 'mpm-paste' ? 0.46 : 0.76,
        damping: familyId === 'mpm-mud' ? 0.074 : familyId === 'mpm-paste' ? 0.098 : 0.058,
        substeps: familyId === 'mpm-paste' ? 6 : 5,
        cellResolution: familyId === 'mpm-mud' ? 30 : familyId === 'mpm-paste' ? 34 : 32,
        materialKind: familyId === 'mpm-mud' ? 'mud' : familyId === 'mpm-paste' ? 'paste' : 'snow',
        plasticity: familyId === 'mpm-mud' ? 0.58 : familyId === 'mpm-paste' ? 0.74 : 0.62,
        yieldRate: familyId === 'mpm-mud' ? 0.46 : familyId === 'mpm-paste' ? 0.62 : 0.42,
        kernelRadius: familyId === 'mpm-mud' ? 1.96 : familyId === 'mpm-paste' ? 2.14 : 1.98,
        apicBlend: familyId === 'mpm-mud' ? 0.6 : familyId === 'mpm-paste' ? 0.68 : 0.64,
        stressGain: familyId === 'mpm-mud' ? 0.48 : familyId === 'mpm-paste' ? 0.56 : 0.6,
        hardening: familyId === 'mpm-mud' ? 0.3 : familyId === 'mpm-paste' ? 0.46 : 0.46,
      };
    case 'pbd-cloth':
      return {
        width: 10,
        height: 8,
        spacing: 0.09,
        pinMode: 'top-band',
        pinGroupStrength: 0.22,
        pinGroupCount: 3,
        pinChoreographyPreset: 'breath-wave',
        tearThreshold: 1.16,
        tearPropagationBias: 0.34,
        stiffness: 0.95,
        shearStiffness: 0.78,
        bendStiffness: 0.26,
        damping: 0.035,
        gravity: 9.8,
        pulseX: 0.42,
        pulseY: 0,
        collisionRadius: 0.018,
        floorY: -0.3,
        selfCollisionStiffness: 0.4,
        windX: 0.34,
        windY: 0.08,
        windPulse: 0.46,
        pressureStrength: 0.1,
        pressurePulse: 0.24,
        obstacleFieldX: 0.01,
        obstacleFieldY: -0.05,
        obstacleFieldRadius: 0.26,
        obstacleFieldStrength: 0.62,
        obstacleField2X: -0.16,
        obstacleField2Y: -0.16,
        obstacleField2Radius: 0.14,
        obstacleField2Strength: 0.33,
        tearBiasMapPreset: 'warp-weft',
        tearBiasMapScale: 0.48,
        tearBiasMapFrequency: 2.8,
        tearBiasMapRotation: 0.52,
        tearBiasMapContrast: 0.76,
        tearDirectionX: 1,
        tearDirectionY: -0.12,
      };
    case 'pbd-membrane':
      return {
        width: 9,
        height: 9,
        spacing: 0.08,
        anchorMode: 'rim-quadrants',
        pinGroupCount: 4,
        pinChoreographyPreset: 'counter-orbit',
        pinGroupStrength: 0.2,
        tearThreshold: 1.14,
        tearPropagationBias: 0.42,
        stiffness: 0.94,
        shearStiffness: 0.74,
        bendStiffness: 0.22,
        damping: 0.04,
        gravity: 7.4,
        pulseX: 0.08,
        pulseY: 0.14,
        collisionRadius: 0.018,
        floorY: -0.26,
        selfCollisionStiffness: 0.36,
        inflation: 0.34,
        boundaryTension: 0.28,
        windX: 0.18,
        windY: 0.1,
        windPulse: 0.36,
        pressureStrength: 0.26,
        pressurePulse: 0.42,
        obstacleFieldX: 0,
        obstacleFieldY: -0.02,
        obstacleFieldRadius: 0.24,
        obstacleFieldStrength: 0.56,
        obstacleField2X: 0.16,
        obstacleField2Y: -0.12,
        obstacleField2Radius: 0.16,
        obstacleField2Strength: 0.31,
        tearBiasMapPreset: 'radial-flare',
        tearBiasMapScale: 0.42,
        tearBiasMapFrequency: 2.2,
        tearBiasMapRotation: 1.08,
        tearBiasMapContrast: 0.72,
        tearDirectionX: 0.14,
        tearDirectionY: -1,
      };
    case 'pbd-softbody':
      return {
        width: 7,
        height: 7,
        spacing: 0.085,
        anchorMode: 'core',
        pinGroupCount: 2,
        pinGroupStrength: 0.2,
        pinChoreographyPreset: 'counter-orbit',
        volumePreservation: 0.82,
        clusterStiffness: 0.44,
        shellTension: 0.3,
        stiffness: 0.93,
        shearStiffness: 0.76,
        bendStiffness: 0.28,
        damping: 0.04,
        gravity: 9,
        pulseX: 0.18,
        pulseY: 0.09,
        collisionRadius: 0.02,
        floorY: -0.26,
        selfCollisionStiffness: 0.34,
        windX: 0.24,
        windY: 0.08,
        windPulse: 0.4,
        pressureStrength: 0.24,
        pressurePulse: 0.34,
        obstacleFieldX: -0.02,
        obstacleFieldY: -0.08,
        obstacleFieldRadius: 0.22,
        obstacleFieldStrength: 0.58,
        obstacleField2X: 0.14,
        obstacleField2Y: -0.16,
        obstacleField2Radius: 0.14,
        obstacleField2Strength: 0.32,
        obstaclePreset: 'staggered-arc',
        circleColliderX: 0,
        circleColliderY: -0.04,
        circleColliderRadius: 0.12,
        capsuleColliderAx: -0.14,
        capsuleColliderAy: -0.12,
        capsuleColliderBx: 0.18,
        capsuleColliderBy: -0.15,
        capsuleColliderRadius: 0.05,
      };
    default:
      throw new Error(`unsupported integrated fixture family: ${familyId}`);
  }
}

export function buildFutureNativeRuntimeConfigBlock(familyId: FutureNativeProjectIntegratedId): ProjectSerializationBlock {
  if (isIntegratedVolumetricFamilyId(familyId)) {
    const config = normalizeVolumetricDensityTransportConfig(getIntegratedVolumetricFixtureInput(familyId));
    return createRuntimeConfigBlock(getIntegratedVolumetricRuntimeConfigValues(familyId, config));
  }
  if (isIntegratedFractureFamilyId(familyId)) {
    return createRuntimeConfigBlock(getIntegratedFractureRuntimeConfigValues(familyId));
  }
  switch (familyId) {
    case 'pbd-rope': {
      const config = normalizePbdRopeConfig(getIntegratedFixtureInput(familyId));
      return createRuntimeConfigBlock([
        `segments:${config.segments}`,
        `restLength:${config.restLength}`,
        `stiffness:${config.stiffness}`,
        `bend:${config.bendStiffness}`,
        `gravity:${config.gravity}`,
        `collisionRadius:${config.collisionRadius}`,
        `floorY:${config.floorY}`,
        `circleRadius:${config.circleColliderRadius}`,
        `capsuleRadius:${config.capsuleColliderRadius}`,
        `selfCollision:${config.selfCollisionStiffness}`,
      ]);
    }
    case 'mpm-granular': {
      const config = normalizeMpmGranularConfig(getIntegratedFixtureInput(familyId));
      return createRuntimeConfigBlock([
        `particles:${config.particleCount}`,
        `radius:${config.particleRadius}`,
        `substeps:${config.substeps}`,
        `cellResolution:${config.cellResolution}`,
        `kernelRadius:${config.kernelRadius}`,
        `material:${config.materialKind}`,
        `plasticity:${config.plasticity}`,
        `yieldRate:${config.yieldRate}`,
        `cohesion:${config.cohesion}`,
        `friction:${config.friction}`,
      ]);
    }
    case 'mpm-viscoplastic': {
      const config = normalizeMpmGranularConfig(getIntegratedFixtureInput(familyId));
      return createRuntimeConfigBlock([
        `particles:${config.particleCount}`,
        `radius:${config.particleRadius}`,
        `substeps:${config.substeps}`,
        `cellResolution:${config.cellResolution}`,
        `kernelRadius:${config.kernelRadius}`,
        `material:${config.materialKind}`,
        `plasticity:${config.plasticity}`,
        `yieldRate:${config.yieldRate}`,
        `stressGain:${config.stressGain}`,
        `hardening:${config.hardening}`,
        `cohesion:${config.cohesion}`,
        `damping:${config.damping}`,
      ]);
    }
    case 'mpm-snow':
    case 'mpm-mud':
    case 'mpm-paste': {
      const config = normalizeMpmGranularConfig(getIntegratedFixtureInput(familyId));
      return createRuntimeConfigBlock([
        `particles:${config.particleCount}`,
        `radius:${config.particleRadius}`,
        `substeps:${config.substeps}`,
        `cellResolution:${config.cellResolution}`,
        `kernelRadius:${config.kernelRadius}`,
        `material:${config.materialKind}`,
        `plasticity:${config.plasticity}`,
        `yieldRate:${config.yieldRate}`,
        `stressGain:${config.stressGain}`,
        `hardening:${config.hardening}`,
        `cohesion:${config.cohesion}`,
        familyId === 'mpm-mud' || familyId === 'mpm-paste' ? `damping:${config.damping}` : `friction:${config.friction}`,
      ]);
    }
    case 'pbd-cloth': {
      const config = normalizePbdClothConfig(getIntegratedFixtureInput(familyId));
      return createRuntimeConfigBlock([
        `grid:${config.width}x${config.height}`,
        `spacing:${config.spacing}`,
        `stiffness:${config.stiffness}`,
        `shear:${config.shearStiffness}`,
        `bend:${config.bendStiffness}`,
        `pinMode:${config.pinMode}`,
        `pinGroups:${config.pinGroupCount}`,
        `tear:${config.tearThreshold}`,
        `obstaclePreset:${config.obstaclePreset}`,
        `tearBias:${config.tearBiasMapPreset}`,
      ]);
    }
    case 'pbd-membrane': {
      const config = normalizePbdMembraneConfig(getIntegratedFixtureInput(familyId));
      return createRuntimeConfigBlock([
        `grid:${config.width}x${config.height}`,
        `spacing:${config.spacing}`,
        `stiffness:${config.stiffness}`,
        `inflation:${config.inflation}`,
        `boundaryTension:${config.boundaryTension}`,
        `anchorMode:${config.anchorMode}`,
        `pinGroups:${config.pinGroupCount}`,
        `tear:${config.tearThreshold}`,
        `obstaclePreset:${config.obstaclePreset}`,
        `tearBias:${config.tearBiasMapPreset}`,
      ]);
    }
    case 'pbd-softbody': {
      const config = normalizePbdSoftbodyConfig(getIntegratedFixtureInput(familyId));
      return createRuntimeConfigBlock([
        `grid:${config.width}x${config.height}`,
        `spacing:${config.spacing}`,
        `stiffness:${config.stiffness}`,
        `volume:${config.volumePreservation}`,
        `cluster:${config.clusterStiffness}`,
        `shell:${config.shellTension}`,
        `anchorMode:${config.anchorMode}`,
        `pinGroups:${config.pinGroupCount}`,
        `obstaclePreset:${config.obstaclePreset}`,
        `colliders:circle+capsule`,
      ]);
    }
    default:
      throw new Error(`unsupported future-native runtime config family: ${familyId}`);
  }
}
