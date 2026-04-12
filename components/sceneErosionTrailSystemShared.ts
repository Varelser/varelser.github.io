import { BufferAttribute, BufferGeometry, Color, LineSegments, ShaderMaterial, Vector3 } from 'three';
import type { MutableRefObject } from 'react';
import type { ParticleConfig } from '../types';
import { generateParticleData } from './particleData';
import { estimateLayerPositionApprox } from './sceneMotionEstimator';
import { getLayerParticleLayoutDeps, getLayerRuntimeErosionTrailSnapshot } from '../lib/sceneRenderRoutingRuntime';
import { getShaderMaterialStyleIndex } from '../lib/materialStyle';

export type ErosionTrailSystemProps = {
  config: ParticleConfig;
  layerIndex: 2 | 3;
  audioRef: React.MutableRefObject<{ bass: number; treble: number; pulse: number; bandA: number; bandB: number }>;
  isPlaying: boolean;
};

export type TrailLayout = {
  particleData: ReturnType<typeof generateParticleData>;
  sampledIndices: Uint32Array;
  trailCount: number;
  segmentsPerTrail: number;
};

export type ErosionProfile = {
  meander: number;
  braid: number;
  fan: number;
  notch: number;
  slump: number;
  orbit: number;
  fracture: number;
  terrace: number;
  curl: number;
};

const tempPos = new Vector3();
const nextPos = new Vector3();
const tangent = new Vector3();
const downhill = new Vector3();
const lateral = new Vector3();
const radial = new Vector3();
const orbitAxis = new Vector3();
const flow = new Vector3();
const pointA = new Vector3();
const pointB = new Vector3();
const refUp = new Vector3(0, 1, 0);
const refRight = new Vector3(1, 0, 0);
const refForward = new Vector3(0, 0, 1);

function fract(value: number) {
  return value - Math.floor(value);
}

function hash(value: number) {
  return fract(Math.sin(value * 127.13 + 19.19) * 43758.5453123);
}

function signedHash(value: number) {
  return hash(value) * 2 - 1;
}

function stepSmooth(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / Math.max(1e-5, edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function getLayerErosionTrailSettings(config: ParticleConfig, layerIndex: 2 | 3) {
  const runtime = getLayerRuntimeErosionTrailSnapshot(config, layerIndex);
  return {
    trailCount: runtime.trailCount,
    opacity: runtime.opacity,
    length: runtime.length,
    drift: runtime.drift,
    audioReactive: runtime.audioReactive,
    color: runtime.color,
    materialStyle: runtime.materialStyle,
    source: runtime.source,
    sourceSpread: runtime.sourceSpread,
    sourceCount: runtime.sourceCount,
    radiusScale: runtime.radiusScale,
  };
}

export function getErosionProfile(config: ParticleConfig, layerIndex: 2 | 3): ErosionProfile {
  const settings = getLayerErosionTrailSettings(config, layerIndex);
  const profile: ErosionProfile = {
    meander: 0.24,
    braid: 0.18,
    fan: 0.18,
    notch: 0.16,
    slump: 0.44,
    orbit: 0.08,
    fracture: 0.14,
    terrace: 0.18,
    curl: 0.16,
  };

  if (settings.source === 'text') {
    profile.braid += 0.26;
    profile.notch += 0.22;
    profile.fracture += 0.12;
    profile.terrace += 0.18;
  } else if (settings.source === 'image' || settings.source === 'video') {
    profile.meander += 0.22;
    profile.fan += 0.12;
    profile.curl += 0.12;
  } else if (settings.source === 'ring' || settings.source === 'disc' || settings.source === 'torus') {
    profile.orbit += 0.3;
    profile.fan += 0.2;
    profile.meander += 0.08;
  } else if (settings.source === 'spiral' || settings.source === 'galaxy') {
    profile.orbit += 0.38;
    profile.curl += 0.28;
    profile.braid += 0.08;
  } else if (settings.source === 'grid' || settings.source === 'plane') {
    profile.terrace += 0.28;
    profile.fracture += 0.22;
    profile.notch += 0.12;
  } else if (settings.source === 'cube' || settings.source === 'cylinder' || settings.source === 'cone') {
    profile.slump += 0.12;
    profile.fracture += 0.18;
    profile.fan += 0.16;
  } else {
    profile.meander += 0.1;
    profile.slump += 0.08;
    profile.curl += 0.06;
  }

  if (settings.materialStyle === 'glass') {
    profile.meander += 0.1;
    profile.curl += 0.12;
    profile.terrace -= 0.08;
  } else if (settings.materialStyle === 'hologram') {
    profile.orbit += 0.16;
    profile.braid += 0.14;
    profile.curl += 0.18;
  } else if (settings.materialStyle === 'chrome') {
    profile.fracture += 0.24;
    profile.notch += 0.14;
    profile.slump += 0.06;
  } else if (settings.materialStyle === 'halftone') {
    profile.terrace += 0.22;
    profile.notch += 0.12;
    profile.braid += 0.08;
  } else if (settings.materialStyle === 'ink') {
    profile.terrace += 0.18;
    profile.curl += 0.04;
  } else if (settings.materialStyle === 'paper') {
    profile.slump += 0.08;
    profile.meander += 0.06;
  } else if (settings.materialStyle === 'stipple') {
    profile.terrace += 0.28;
    profile.notch += 0.16;
  }

  const spreadNorm = Math.min(1.3, Math.max(0, settings.sourceSpread / 320));
  const countNorm = Math.min(1.2, Math.max(0, settings.sourceCount / 10));
  profile.fan += spreadNorm * 0.08;
  profile.braid += countNorm * 0.04;
  profile.meander += Math.min(0.24, settings.drift * 0.22);
  profile.slump += Math.min(0.2, settings.length * 0.12);
  profile.terrace = Math.max(0, profile.terrace);
  return profile;
}

export function buildTrailLayout(config: ParticleConfig, layerIndex: 2 | 3): TrailLayout | null {
  const particleData = generateParticleData(config, layerIndex, false, 'aux');
  if (!particleData || particleData.count < 4) return null;
  const settings = getLayerErosionTrailSettings(config, layerIndex);
  const trailCount = Math.max(8, Math.min(256, Math.floor(settings.trailCount)));
  const dynamicSegments = Math.round(4 + settings.length * 7 + settings.drift * 5 + Math.min(2, settings.sourceCount * 0.2));
  const segmentsPerTrail = Math.max(5, Math.min(18, dynamicSegments));
  const sampledIndices = new Uint32Array(trailCount);
  for (let i = 0; i < trailCount; i += 1) {
    sampledIndices[i] = Math.min(particleData.count - 1, Math.floor((i / Math.max(1, trailCount - 1)) * Math.max(0, particleData.count - 1)));
  }
  return { particleData, sampledIndices, trailCount, segmentsPerTrail };
}

export function getErosionTrailLayoutDeps(config: ParticleConfig, layerIndex: 2 | 3) {
  const runtime = getLayerRuntimeErosionTrailSnapshot(config, layerIndex);
  return getLayerParticleLayoutDeps(config, layerIndex, [runtime.trailCount, runtime.length, runtime.drift]);
}

export function ensureErosionTrailGeometry(
  line: LineSegments,
  geometryRef: MutableRefObject<BufferGeometry | null>,
  layout: TrailLayout,
) {
  if (!geometryRef.current) {
    const segmentPairs = layout.trailCount * layout.segmentsPerTrail;
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(segmentPairs * 2 * 3), 3));
    geometry.setAttribute('trailMix', new BufferAttribute(new Float32Array(segmentPairs * 2), 1));
    geometryRef.current = geometry;
    line.geometry = geometry;
  }
  return geometryRef.current;
}

export function updateErosionTrailGeometry(args: {
  geometry: BufferGeometry;
  layout: TrailLayout;
  config: ParticleConfig;
  layerIndex: 2 | 3;
  settings: ReturnType<typeof getLayerErosionTrailSettings>;
  profile: ErosionProfile;
  globalRadius: number;
  audioBoost: number;
  time: number;
}) {
  const { geometry, layout, config, layerIndex, settings, profile, globalRadius, audioBoost, time } = args;
  const positionAttr = geometry.getAttribute('position') as BufferAttribute;
  const mixAttr = geometry.getAttribute('trailMix') as BufferAttribute;
  const particleData = layout.particleData;
  if (!particleData) return;

  for (let i = 0; i < layout.trailCount; i += 1) {
    const sourceIndex = layout.sampledIndices[i] ?? 0;
    const estimated = estimateLayerPositionApprox({ config, layerIndex, particleData, index: sourceIndex, globalRadius, time });
    const estimatedNext = estimateLayerPositionApprox({ config, layerIndex, particleData, index: sourceIndex, globalRadius, time: time + 0.016 });

    tempPos.set(estimated.x, estimated.y, estimated.z);
    nextPos.set(estimatedNext.x, estimatedNext.y, estimatedNext.z);
    tangent.copy(nextPos).sub(tempPos);
    if (tangent.lengthSq() < 1e-5) tangent.set(signedHash(i + 0.2), signedHash(i + 0.7), signedHash(i + 1.3));
    tangent.normalize();

    radial.copy(tempPos);
    if (radial.lengthSq() < 1e-5) radial.set(0.001, 1, 0);
    radial.normalize();
    orbitAxis.crossVectors(radial, refUp);
    if (orbitAxis.lengthSq() < 1e-5) orbitAxis.crossVectors(radial, refForward);
    orbitAxis.normalize();

    downhill.copy(refUp)
      .multiplyScalar(-1)
      .addScaledVector(radial, 0.18 + profile.fan * 0.22)
      .addScaledVector(tangent, 0.12 + profile.meander * 0.18)
      .normalize();
    lateral.crossVectors(downhill, Math.abs(downhill.z) > 0.9 ? refRight : refForward).normalize();
    if (lateral.lengthSq() < 1e-5) lateral.set(1, 0, 0);

    pointA.copy(tempPos);
    const baseSeed = i * 17.37;
    const totalLength = settings.length * (0.66 + hash(baseSeed + 0.4) * 0.82) * (1 + audioBoost * 0.6);
    const driftScale = settings.drift * globalRadius * 0.052;
    const fanSign = signedHash(baseSeed + 8.2);
    const meanderPhase = hash(baseSeed + 1.2) * Math.PI * 2;

    for (let segment = 0; segment < layout.segmentsPerTrail; segment += 1) {
      const trailMix = segment / Math.max(1, layout.segmentsPerTrail - 1);
      const headMix = 1 - trailMix;
      const segmentLength = totalLength / layout.segmentsPerTrail * (0.7 + hash(baseSeed + segment * 0.91) * 0.72);
      const wave = Math.sin(meanderPhase + segment * (0.74 + profile.meander * 0.8) + time * (0.35 + profile.curl * 0.3));
      const braidWave = Math.sin(baseSeed * 0.4 + segment * 1.6 + time * 0.8) * profile.braid;
      const orbitWave = Math.cos(baseSeed * 0.23 + segment * 0.66 + time * 0.45) * profile.orbit;
      const notchGate = stepSmooth(0.45, 0.72, fract(segment * 0.37 + hash(baseSeed + 4.1))) * profile.notch;
      const fractureSnap = Math.round((wave * (1 + profile.fracture * 3)) * (1 + profile.fracture * 2)) / Math.max(1, 2 + Math.round(profile.fracture * 5));
      const terraceDrop = Math.floor((trailMix + hash(baseSeed + segment * 2.1) * 0.3) * (1 + profile.terrace * 6)) / Math.max(1, 1 + Math.round(profile.terrace * 6));

      flow.copy(downhill)
        .addScaledVector(lateral, wave * driftScale * (0.42 + profile.meander) * headMix)
        .addScaledVector(orbitAxis, orbitWave * driftScale * (0.28 + profile.orbit * 0.7) * headMix)
        .addScaledVector(radial, fanSign * profile.fan * 0.18 * headMix + (terraceDrop - 0.5) * profile.terrace * 0.08)
        .addScaledVector(tangent, fractureSnap * driftScale * (0.08 + profile.fracture * 0.2) + braidWave * driftScale * 0.16)
        .normalize();

      const slump = (0.18 + profile.slump * 0.48) * segmentLength * (0.7 + trailMix * 0.8);
      const wobble = wave * driftScale * (0.42 + profile.meander * 0.7) * headMix;
      const braidOffset = braidWave * driftScale * 0.42 * headMix;
      const orbitOffset = orbitWave * driftScale * 0.32 * headMix;
      const carve = fractureSnap * driftScale * (0.18 + profile.fracture * 0.35);
      const notch = notchGate * driftScale * 0.3;

      pointB.copy(pointA)
        .addScaledVector(flow, segmentLength)
        .addScaledVector(refUp, -slump)
        .addScaledVector(lateral, wobble + braidOffset)
        .addScaledVector(orbitAxis, orbitOffset)
        .addScaledVector(tangent, carve)
        .addScaledVector(radial, notch - profile.fan * trailMix * globalRadius * 0.003)
        .addScaledVector(refUp, -(terraceDrop - 0.5) * profile.terrace * segmentLength * 0.3);

      const baseIndex = (i * layout.segmentsPerTrail + segment) * 2;
      positionAttr.setXYZ(baseIndex + 0, pointA.x, pointA.y, pointA.z);
      positionAttr.setXYZ(baseIndex + 1, pointB.x, pointB.y, pointB.z);
      mixAttr.setX(baseIndex + 0, trailMix);
      mixAttr.setX(baseIndex + 1, Math.min(1, trailMix + 1 / layout.segmentsPerTrail));
      pointA.copy(pointB);
    }
  }

  positionAttr.needsUpdate = true;
  mixAttr.needsUpdate = true;
  geometry.computeBoundingSphere();
}

export function updateErosionTrailMaterial(
  material: ShaderMaterial,
  settings: ReturnType<typeof getLayerErosionTrailSettings>,
  profile: ErosionProfile,
  pulse: number,
  bass: number,
  time: number,
) {
  const styleIndex = getShaderMaterialStyleIndex(settings.materialStyle);
  material.uniforms.uColor.value.set(settings.color);
  material.uniforms.uOpacity.value = settings.opacity;
  material.uniforms.uPulse.value = pulse + bass * 0.25;
  material.uniforms.uMaterialStyle.value = styleIndex;
  material.uniforms.uTime.value = time;
  material.uniforms.uBraid.value = profile.braid;
  material.uniforms.uFracture.value = profile.fracture;
  material.uniforms.uTerrace.value = profile.terrace;
  material.uniforms.uOrbit.value = profile.orbit;
}

export const EROSION_TRAIL_VERTEX_SHADER = `
  attribute float trailMix;
  varying float vTrailMix;
  varying vec3 vWorldPos;
  void main() {
    vTrailMix = trailMix;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const EROSION_TRAIL_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPulse;
  uniform float uMaterialStyle;
  uniform float uTime;
  uniform float uBraid;
  uniform float uFracture;
  uniform float uTerrace;
  uniform float uOrbit;
  varying float vTrailMix;
  varying vec3 vWorldPos;
  void main() {
    float fade = 1.0 - smoothstep(0.0, 1.0, vTrailMix);
    float sediment = 0.5 + 0.5 * sin(vWorldPos.y * (0.08 + uTerrace * 0.05) - vWorldPos.x * 0.05 + uTime * 0.4);
    float braid = 0.5 + 0.5 * sin(vWorldPos.x * 0.09 + vWorldPos.z * 0.07 + uTime * (0.35 + uBraid * 0.5));
    float fracture = smoothstep(0.25, 0.85, 0.5 + 0.5 * sin(vWorldPos.x * 0.18 - vWorldPos.y * 0.06 + uTime * 0.22));
    float orbit = 0.5 + 0.5 * sin(length(vWorldPos.xz) * 0.05 - uTime * (0.28 + uOrbit * 0.44));
    vec3 color = uColor * mix(0.42, 1.02, sediment);
    color *= mix(0.88, 1.14, braid * uBraid + orbit * uOrbit * 0.4);
    float alpha = uOpacity * mix(0.08, 1.0, fade);
    alpha *= mix(0.82, 1.18, fracture * uFracture + (1.0 - sediment) * uTerrace * 0.45);
    color += vec3(1.0) * uPulse * 0.04 * fade;
    if (uMaterialStyle > 0.5 && uMaterialStyle < 1.5) {
      color = mix(color, vec3(0.92, 0.97, 1.0), 0.22);
      alpha *= 0.82;
    } else if (uMaterialStyle > 1.5 && uMaterialStyle < 2.5) {
      color = mix(color, vec3(0.18, 0.96, 1.0), 0.52);
      alpha *= 1.08;
    } else if (uMaterialStyle > 2.5 && uMaterialStyle < 3.5) {
      float band = 0.5 + 0.5 * sin(vWorldPos.y * 0.18 - vWorldPos.x * 0.08 + fracture * 1.6);
      color = mix(vec3(0.2), vec3(1.0), band) * mix(uColor, vec3(1.0), 0.42);
    } else if (uMaterialStyle > 3.5) {
      float gate = step(0.3, fract(vWorldPos.y * (0.06 + uTerrace * 0.04) + vWorldPos.x * 0.03));
      alpha *= mix(0.34, 1.0, gate);
      color *= 0.46 + gate * 0.54;
    }
    gl_FragColor = vec4(color, alpha);
  }
`;

export function createErosionTrailUniforms() {
  return {
    uColor: { value: new Color('#ffffff') },
    uOpacity: { value: 0.35 },
    uPulse: { value: 0 },
    uMaterialStyle: { value: 0 },
    uTime: { value: 0 },
    uBraid: { value: 0 },
    uFracture: { value: 0 },
    uTerrace: { value: 0 },
    uOrbit: { value: 0 },
  };
}
