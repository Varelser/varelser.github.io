import { Color, InstancedMesh, MathUtils, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import type { MutableRefObject } from 'react';
import type { ParticleConfig } from '../types';
import { generateParticleData } from './particleData';
import { estimateLayerPositionApprox } from './sceneMotionEstimator';
import { getLayerParticleLayoutDeps, getLayerRuntimeVoxelSnapshot } from '../lib/sceneRenderRoutingRuntime';
import { resolveVoxelAudioDrives } from '../lib/audioReactiveTargetSets';
import type { EvaluatedAudioRoute } from '../lib/audioReactiveRuntime';

export type VoxelLatticeAudioFrame = {
  bass: number;
  treble: number;
  pulse: number;
  bandA: number;
  bandB: number;
};

export type VoxelLatticeSystemProps = {
  config: ParticleConfig;
  layerIndex: 2 | 3;
  audioRef: MutableRefObject<VoxelLatticeAudioFrame>;
  isPlaying: boolean;
};

export type VoxelSettings = {
  opacity: number;
  scale: number;
  density: number;
  snap: number;
  audioReactive: number;
  wireframe: boolean;
  color: string;
  materialStyle: ParticleConfig['layer2MaterialStyle'];
  source: ParticleConfig['layer2Source'];
  radiusScale: number;
};

export type VoxelMode = ParticleConfig['layer2Type'];

export type VoxelProfile = {
  snapMul: number;
  jitter: number;
  shellBias: number;
  planarBias: number;
  waveAmp: number;
  waveFreq: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  opacityMul: number;
  opacityAdd: number;
  roughness: number;
  metalness: number;
  hueShift: number;
  lightnessShift: number;
  forceWireframe: boolean | null;
  cavity: number;
  column: number;
  shear: number;
  ring: number;
  orbitSpin: number;
  slump: number;
  edgeSharpen: number;
  surfaceBias: number;
  cellSnap: number;
  gridBias: number;
};

export type VoxelLayout = {
  particleData: ReturnType<typeof generateParticleData>;
  anchorIndices: Uint32Array;
  instanceCount: number;
};

const DEFAULT_VOXEL_PROFILE: VoxelProfile = {
  snapMul: 1,
  jitter: 0.05,
  shellBias: 0,
  planarBias: 0,
  waveAmp: 0,
  waveFreq: 1,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  opacityMul: 1,
  opacityAdd: 0,
  roughness: 0.55,
  metalness: 0.08,
  hueShift: 0,
  lightnessShift: 0,
  forceWireframe: null,
  cavity: 0,
  column: 0,
  shear: 0,
  ring: 0,
  orbitSpin: 0,
  slump: 0,
  edgeSharpen: 0,
  surfaceBias: 0,
  cellSnap: 0,
  gridBias: 0,
};

const VOXEL_PROFILES: Partial<Record<VoxelMode, Partial<VoxelProfile>>> = {
  voxel_lattice: { snapMul: 1, jitter: 0.05, shellBias: 0.08, scaleX: 1, scaleY: 1.12, scaleZ: 1, roughness: 0.52, metalness: 0.1, cavity: 0.04 },
  skin_lattice: { snapMul: 0.82, jitter: 0.03, shellBias: 0.38, planarBias: 0.18, scaleX: 1.14, scaleY: 0.88, scaleZ: 1.14, opacityMul: 0.82, roughness: 0.58, metalness: 0.06, cavity: 0.08, slump: 0.04 },
  frost_lattice: { snapMul: 0.74, jitter: 0.02, shellBias: 0.12, planarBias: 0.08, scaleX: 0.72, scaleY: 1.86, scaleZ: 0.72, opacityMul: 0.9, opacityAdd: 0.02, roughness: 0.24, metalness: 0.18, hueShift: -0.02, lightnessShift: 0.12, forceWireframe: false, column: 0.22 },
  pollen_lattice: { snapMul: 0.68, jitter: 0.03, shellBias: 0.16, planarBias: 0.24, scaleX: 0.84, scaleY: 0.96, scaleZ: 0.84, opacityMul: 0.88, roughness: 0.46, metalness: 0.04, hueShift: 0.03, lightnessShift: 0.1, ring: 0.18, cavity: 0.12 },
  elastic_lattice: { snapMul: 0.54, jitter: 0.04, shellBias: 0.12, planarBias: 0.18, waveAmp: 0.08, waveFreq: 1.2, scaleX: 1.12, scaleY: 0.92, scaleZ: 1.08, opacityMul: 1.02, roughness: 0.36, metalness: 0.18, hueShift: 0.02, lightnessShift: 0.04, forceWireframe: false, shear: 0.18, orbitSpin: 0.12 },
  creep_lattice: { snapMul: 0.42, jitter: 0.06, shellBias: 0.14, planarBias: 0.26, waveAmp: 0.12, waveFreq: 0.74, scaleX: 1.18, scaleY: 0.82, scaleZ: 1.1, opacityMul: 0.94, roughness: 0.62, metalness: 0.06, hueShift: 0.01, lightnessShift: -0.02, forceWireframe: false, shear: 0.14, slump: 0.18 },
  lattice_surge: { snapMul: 0.9, jitter: 0.08, shellBias: 0.1, planarBias: 0.12, waveAmp: 0.24, waveFreq: 1.9, scaleX: 0.88, scaleY: 1.62, scaleZ: 0.88, opacityMul: 1.02, opacityAdd: 0.02, roughness: 0.28, metalness: 0.34, hueShift: 0.02, lightnessShift: 0.08, forceWireframe: false, orbitSpin: 0.22, ring: 0.08 },
};

const tempPos = new Vector3();
const snapped = new Vector3();
const nextPos = new Vector3();
const tangent = new Vector3();
const outward = new Vector3();
const horizontal = new Vector3();
const jitterVec = new Vector3();
const waveVec = new Vector3();
const direction = new Vector3();
const upAxis = new Vector3(0, 1, 0);
const quat = new Quaternion();
const spinQuat = new Quaternion();
const scaleVec = new Vector3();
const matrix = new Matrix4();
const color = new Color();

function fract(v: number) { return v - Math.floor(v); }
function hash(v: number) { return fract(Math.sin(v * 127.13 + 19.37) * 43758.5453123); }
function signedHash(v: number) { return hash(v) * 2 - 1; }

function getVoxelSourceAdjustments(
  source: ParticleConfig['layer2Source'],
  style: VoxelSettings['materialStyle'],
): Partial<VoxelProfile> {
  const profile: Partial<VoxelProfile> = {};
  if (source === 'text') {
    Object.assign(profile, { planarBias: 0.12, shear: 0.18, cavity: 0.06, scaleY: -0.06 });
  } else if (source === 'image' || source === 'video') {
    Object.assign(profile, { cavity: 0.12, shellBias: 0.08, waveAmp: 0.05, ring: 0.04 });
  } else if (source === 'ring' || source === 'disc' || source === 'torus') {
    Object.assign(profile, { ring: 0.22, orbitSpin: 0.18, cavity: 0.1, planarBias: 0.08 });
  } else if (source === 'spiral' || source === 'galaxy') {
    Object.assign(profile, { orbitSpin: 0.24, shear: 0.16, waveAmp: 0.06, shellBias: 0.04 });
  } else if (source === 'grid' || source === 'plane') {
    Object.assign(profile, { planarBias: 0.18, shear: 0.08, ring: 0.04 });
  } else if (source === 'cube' || source === 'cylinder' || source === 'cone') {
    Object.assign(profile, { column: 0.2, slump: 0.18, cavity: 0.04, scaleY: 0.08 });
  } else if (source === 'center' || source === 'random') {
    Object.assign(profile, { cavity: 0.08, orbitSpin: 0.06 });
  }

  if (style === 'glass') {
    profile.cavity = (profile.cavity ?? 0) + 0.08;
    profile.waveAmp = (profile.waveAmp ?? 0) + 0.04;
  } else if (style === 'chrome') {
    profile.shear = (profile.shear ?? 0) + 0.12;
    profile.column = (profile.column ?? 0) + 0.08;
  } else if (style === 'hologram') {
    profile.orbitSpin = (profile.orbitSpin ?? 0) + 0.14;
    profile.ring = (profile.ring ?? 0) + 0.08;
  } else if (style === 'halftone') {
    profile.planarBias = (profile.planarBias ?? 0) + 0.12;
    profile.shear = (profile.shear ?? 0) + 0.06;
  } else if (style === 'ink') {
    profile.edgeSharpen = (profile.edgeSharpen ?? 0) + 0.1;
    profile.lightnessShift = (profile.lightnessShift ?? 0) - 0.06;
  } else if (style === 'paper') {
    profile.surfaceBias = (profile.surfaceBias ?? 0) + 0.08;
    profile.lightnessShift = (profile.lightnessShift ?? 0) + 0.08;
  } else if (style === 'stipple') {
    profile.cellSnap = (profile.cellSnap ?? 0) + 0.12;
    profile.gridBias = (profile.gridBias ?? 0) + 0.1;
  }
  return profile;
}

export function getVoxelProfile(
  mode: VoxelMode,
  source: ParticleConfig['layer2Source'],
  style: VoxelSettings['materialStyle'],
): VoxelProfile {
  const sourceAdjustments = getVoxelSourceAdjustments(source, style);
  return { ...DEFAULT_VOXEL_PROFILE, ...(VOXEL_PROFILES[mode] ?? {}), ...sourceAdjustments };
}

export function getVoxelLatticeSettings(config: ParticleConfig, layerIndex: 2 | 3): VoxelSettings {
  const runtime = getLayerRuntimeVoxelSnapshot(config, layerIndex);
  return {
    opacity: runtime.opacity,
    scale: runtime.scale,
    density: runtime.density,
    snap: runtime.snap,
    audioReactive: runtime.audioReactive,
    wireframe: runtime.wireframe,
    color: runtime.color,
    materialStyle: runtime.materialStyle,
    source: runtime.source,
    radiusScale: runtime.radiusScale,
  };
}

export function buildVoxelLatticeLayout(config: ParticleConfig, layerIndex: 2 | 3): VoxelLayout | null {
  const particleData = generateParticleData(config, layerIndex, false, 'aux');
  if (!particleData || particleData.count < 4) return null;
  const settings = getVoxelLatticeSettings(config, layerIndex);
  const instanceCount = Math.max(12, Math.min(320, Math.floor(settings.density)));
  const anchorIndices = new Uint32Array(instanceCount);
  for (let i = 0; i < instanceCount; i += 1) {
    anchorIndices[i] = Math.min(particleData.count - 1, Math.floor((i / Math.max(1, instanceCount - 1)) * Math.max(0, particleData.count - 1)));
  }
  return { particleData, anchorIndices, instanceCount };
}

export function getVoxelLatticeLayoutDeps(config: ParticleConfig, layerIndex: 2 | 3) {
  const runtime = getLayerRuntimeVoxelSnapshot(config, layerIndex);
  return getLayerParticleLayoutDeps(config, layerIndex, [runtime.density]);
}

export function applyVoxelMaterialStyle(baseColor: Color, style: VoxelSettings['materialStyle'], pulse: number) {
  const c = baseColor.clone();
  let emissive = c.clone().multiplyScalar(0.18 + pulse * 0.12);
  let opacity = 1;
  if (style === 'glass') {
    c.lerp(new Color('#f0fbff'), 0.24);
    emissive = c.clone().multiplyScalar(0.12 + pulse * 0.08);
    opacity = 0.78;
  } else if (style === 'hologram') {
    c.lerp(new Color('#47fff1'), 0.4);
    emissive = new Color('#38f6ff').multiplyScalar(0.35 + pulse * 0.25);
    opacity = 0.88;
  } else if (style === 'chrome') {
    const band = 0.58 + 0.42 * Math.sin(baseColor.r * 10 + pulse * 7);
    c.setScalar(0.2 + band * 0.8).lerp(baseColor, 0.25);
    emissive = new Color('#ffffff').multiplyScalar(0.05 + pulse * 0.05);
    opacity = 0.94;
  } else if (style === 'halftone') {
    c.multiplyScalar(0.72);
    emissive = c.clone().multiplyScalar(0.06 + pulse * 0.03);
    opacity = 0.84;
  } else if (style === 'ink') {
    c.lerp(new Color('#111827'), 0.58);
    emissive = new Color('#111827').multiplyScalar(0.02 + pulse * 0.01);
    opacity = 0.92;
  } else if (style === 'paper') {
    c.lerp(new Color('#f5f1e6'), 0.52);
    emissive = new Color('#f6f0dd').multiplyScalar(0.03 + pulse * 0.015);
    opacity = 0.96;
  } else if (style === 'stipple') {
    c.multiplyScalar(0.66).lerp(new Color('#f3f4f6'), 0.1);
    emissive = c.clone().multiplyScalar(0.05 + pulse * 0.03);
    opacity = 0.88;
  }
  return { color: c, emissive, opacity };
}

export function updateVoxelLatticeInstances(args: {
  mesh: InstancedMesh;
  material: MeshStandardMaterial;
  layout: VoxelLayout;
  config: ParticleConfig;
  layerIndex: 2 | 3;
  runtime: ReturnType<typeof getLayerRuntimeVoxelSnapshot>;
  audioFrame: VoxelLatticeAudioFrame;
  audioRouteEvaluation: EvaluatedAudioRoute[];
  isPlaying: boolean;
  time: number;
}) {
  const { mesh, material, layout, config, layerIndex, runtime, audioFrame, audioRouteEvaluation, isPlaying, time } = args;
  const settings = getVoxelLatticeSettings(config, layerIndex);
  const globalRadius = config.sphereRadius * settings.radiusScale;
  const voxelDrives = resolveVoxelAudioDrives(audioRouteEvaluation, 'voxelLattice');
  const pulse = config.audioEnabled ? audioFrame.pulse * config.audioBurstScale : 0;
  const bass = config.audioEnabled ? audioFrame.bass * config.audioBeatScale : 0;
  const audioReactiveAmount = settings.audioReactive + voxelDrives.scale * 0.45 + voxelDrives.jitter * 0.18;
  const audioDrive = isPlaying ? (pulse + bass * 0.6) * audioReactiveAmount : 0;
  const style = applyVoxelMaterialStyle(color.set(settings.color), settings.materialStyle, pulse + bass * 0.25);
  const profile = getVoxelProfile(runtime.mode, settings.source, settings.materialStyle);
  const particleData = layout.particleData;
  if (!particleData) return;

  for (let i = 0; i < layout.instanceCount; i += 1) {
    const sourceIndex = layout.anchorIndices[i] ?? 0;
    const estimated = estimateLayerPositionApprox({ config, layerIndex, particleData, index: sourceIndex, globalRadius, time });
    const estimatedNext = estimateLayerPositionApprox({ config, layerIndex, particleData, index: sourceIndex, globalRadius, time: time + 0.03 });
    tempPos.set(estimated.x, estimated.y, estimated.z);
    nextPos.set(estimatedNext.x, estimatedNext.y, estimatedNext.z);
    tangent.copy(nextPos).sub(tempPos);
    if (tangent.lengthSq() < 1e-5) tangent.set(signedHash(i + 0.1), signedHash(i + 0.2), signedHash(i + 0.3));
    tangent.normalize();

    const snap = Math.max(4, settings.snap * profile.snapMul * Math.max(0.3, 1 + voxelDrives.snap * 0.45));
    jitterVec.set(
      signedHash(i + 11.3) * globalRadius * profile.jitter * (1 + voxelDrives.jitter * 0.4),
      signedHash(i + 18.7) * globalRadius * profile.jitter * (1 + voxelDrives.jitter * 0.4),
      signedHash(i + 25.9) * globalRadius * profile.jitter * (1 + voxelDrives.jitter * 0.4),
    );
    snapped.set(
      Math.round((tempPos.x + jitterVec.x) / snap) * snap,
      Math.round((tempPos.y + jitterVec.y) / snap) * snap,
      Math.round((tempPos.z + jitterVec.z) / snap) * snap,
    );

    outward.copy(tempPos);
    if (outward.lengthSq() < 1e-5) outward.copy(upAxis);
    outward.normalize();
    if (profile.shellBias !== 0) {
      snapped.lerp(outward.clone().multiplyScalar(tempPos.length() + globalRadius * 0.04), profile.shellBias * 0.22);
    }
    if (profile.planarBias !== 0) {
      snapped.y *= 1 - profile.planarBias * 0.45;
    }
    if (profile.waveAmp !== 0) {
      horizontal.crossVectors(tangent, outward);
      if (horizontal.lengthSq() < 1e-5) horizontal.set(1, 0, 0);
      horizontal.normalize();
      const wave = Math.sin(time * (1.1 + profile.waveFreq) + i * 0.19 + audioDrive * 3.2);
      waveVec.copy(horizontal).multiplyScalar(globalRadius * 0.08 * profile.waveAmp * wave);
      waveVec.addScaledVector(tangent, globalRadius * 0.04 * profile.waveAmp * Math.cos(time * 0.84 + i * 0.11));
      snapped.add(waveVec);
    }
    if (profile.cavity > 0) {
      snapped.addScaledVector(outward, globalRadius * profile.cavity * (0.08 + hash(i + 30.4) * 0.06));
    }
    if (profile.ring > 0) {
      horizontal.set(snapped.x, 0, snapped.z);
      if (horizontal.lengthSq() < 1e-5) horizontal.set(Math.cos(i * 0.3), 0, Math.sin(i * 0.3));
      horizontal.normalize();
      snapped.y *= 1 - Math.min(0.72, profile.ring * 0.42);
      snapped.addScaledVector(horizontal, globalRadius * profile.ring * (0.04 + hash(i + 41.9) * 0.06));
    }
    if (profile.column > 0) {
      snapped.y += globalRadius * profile.column * (0.05 + hash(i + 44.1) * 0.08);
      snapped.x *= 1 - Math.min(0.4, profile.column * 0.16);
      snapped.z *= 1 - Math.min(0.4, profile.column * 0.16);
    }
    if (profile.shear > 0) {
      snapped.x += snapped.y * profile.shear * 0.18;
      snapped.z += Math.sin(time * 0.42 + i * 0.17) * globalRadius * profile.shear * 0.04;
    }
    if (profile.orbitSpin > 0) {
      const spin = time * profile.orbitSpin * 0.6 + i * 0.08;
      const cosSpin = Math.cos(spin);
      const sinSpin = Math.sin(spin);
      const rx = snapped.x * cosSpin - snapped.z * sinSpin;
      const rz = snapped.x * sinSpin + snapped.z * cosSpin;
      snapped.x = rx;
      snapped.z = rz;
    }
    if (profile.slump > 0) {
      snapped.y -= globalRadius * profile.slump * (0.04 + hash(i + 52.7) * 0.08);
    }

    direction.copy(tangent).addScaledVector(outward, 0.18 + profile.jitter * 0.8);
    if (direction.lengthSq() < 1e-5) direction.copy(upAxis);
    direction.normalize();
    quat.setFromUnitVectors(upAxis, direction);
    if (runtime.mode === 'lattice_surge') {
      spinQuat.setFromAxisAngle(direction, time * 0.46 + i * 0.04 + audioDrive * 0.9);
      quat.multiply(spinQuat);
    }

    const s = globalRadius * 0.015 * settings.scale * (1 + voxelDrives.scale * 0.24) * (0.86 + hash(i + 9.8) * 1.18) * (1 + audioDrive * 0.45);
    scaleVec.set(
      s * profile.scaleX,
      s * profile.scaleY * (0.9 + hash(i + 6.2) * (runtime.mode === 'frost_lattice' ? 1.1 : 0.7)),
      s * profile.scaleZ,
    );
    matrix.compose(snapped, quat, scaleVec);
    mesh.setMatrixAt(i, matrix);
    mesh.setColorAt(i, style.color.clone().offsetHSL(profile.hueShift, 0, profile.lightnessShift + signedHash(i + 13.7) * 0.06));
  }

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  material.opacity = MathUtils.clamp(settings.opacity * style.opacity * profile.opacityMul + profile.opacityAdd + voxelDrives.opacity * 0.18, 0.04, 1.24);
  material.emissive.copy(style.emissive);
  material.color.copy(style.color);
  material.roughness = MathUtils.clamp(profile.roughness + (settings.materialStyle === 'chrome' ? -0.08 : settings.materialStyle === 'glass' ? -0.06 : settings.materialStyle === 'paper' ? 0.16 : settings.materialStyle === 'ink' ? 0.12 : 0), 0.04, 1);
  material.metalness = MathUtils.clamp(profile.metalness + (settings.materialStyle === 'chrome' ? 0.42 : settings.materialStyle === 'glass' ? 0.12 : settings.materialStyle === 'paper' ? -0.08 : 0), 0, 1);
  material.wireframe = profile.forceWireframe ?? (settings.wireframe || voxelDrives.wireframe > 0.08);
}
