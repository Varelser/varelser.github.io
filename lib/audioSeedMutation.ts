import type { Layer2Type, Layer3Source, ParticleConfig } from '../types';
import type { AudioSequenceSeedMutationScope } from '../types/audioReactive';
import { MOTION_MAP } from './motionMap';

const RANDOM_SOURCE_KEYS: Layer3Source[] = [
  'sphere',
  'center',
  'ring',
  'disc',
  'cube',
  'cylinder',
  'random',
  'cone',
  'torus',
  'spiral',
  'galaxy',
  'grid',
  'plane',
];

const MOTION_KEYS = Object.keys(MOTION_MAP) as Layer2Type[];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number) {
  return a + ((b - a) * t);
}

function choose<T>(values: readonly T[], fallback: T, rng: () => number) {
  if (values.length === 0) return fallback;
  return values[Math.floor(rng() * values.length)] ?? fallback;
}

function mutateTowardRandom(value: number, min: number, max: number, intensity: number, rng: () => number) {
  const next = lerp(value, min + (rng() * (max - min)), clamp(intensity, 0, 1.5));
  return clamp(next, min, max);
}

function mutateSigned(value: number, min: number, max: number, width: number, intensity: number, rng: () => number) {
  return clamp(value + (((rng() * 2) - 1) * width * clamp(intensity, 0, 1.5)), min, max);
}

function mutateCount(value: number, min: number, max: number, amount: number, intensity: number, rng: () => number) {
  const next = Math.round(value + (((rng() * 2) - 1) * amount * clamp(intensity, 0, 1.5)));
  return clamp(next, min, max);
}

function maybeFlip(value: boolean, probability: number, rng: () => number) {
  return rng() < probability ? !value : value;
}

export function buildAudioSeedMutatedConfig(
  prev: ParticleConfig,
  intensity = 0.72,
  scope: AudioSequenceSeedMutationScope = 'hybrid',
  rng: () => number = Math.random,
): ParticleConfig {
  const amount = clamp(intensity, 0, 1.5);
  const next: ParticleConfig = { ...prev };

  const mutateMotion = scope === 'motion' || scope === 'hybrid';
  const mutateStructure = scope === 'structure' || scope === 'hybrid';
  const mutateSurface = scope === 'surface' || scope === 'hybrid';

  if (mutateMotion) {
    next.layer2Type = choose(MOTION_KEYS, prev.layer2Type, rng);
    next.layer3Type = choose(MOTION_KEYS, prev.layer3Type, rng);
    next.layer2Source = choose(RANDOM_SOURCE_KEYS, prev.layer2Source, rng);
    next.layer3Source = choose(RANDOM_SOURCE_KEYS, prev.layer3Source, rng);
    next.rotationSpeedX = mutateSigned(prev.rotationSpeedX, -0.03, 0.03, 0.018, amount, rng);
    next.rotationSpeedY = mutateSigned(prev.rotationSpeedY, -0.03, 0.03, 0.018, amount, rng);
    next.jitter = mutateTowardRandom(prev.jitter, 0, 4.5, amount * 0.8, rng);
    next.pulseSpeed = mutateTowardRandom(prev.pulseSpeed, 0, 4, amount, rng);
    next.pulseAmplitude = mutateTowardRandom(prev.pulseAmplitude, 0, 2.5, amount * 0.8, rng);
    next.layer2FlowSpeed = mutateTowardRandom(prev.layer2FlowSpeed, 0, 4, amount, rng);
    next.layer2FlowAmplitude = mutateTowardRandom(prev.layer2FlowAmplitude, 0, 4, amount, rng);
    next.layer2FlowFrequency = mutateTowardRandom(prev.layer2FlowFrequency, 0, 5, amount, rng);
    next.layer3FlowSpeed = mutateTowardRandom(prev.layer3FlowSpeed, 0, 4, amount, rng);
    next.layer3FlowAmplitude = mutateTowardRandom(prev.layer3FlowAmplitude, 0, 4, amount, rng);
    next.layer3FlowFrequency = mutateTowardRandom(prev.layer3FlowFrequency, 0, 5, amount, rng);
    next.layer2EmitterOrbitSpeed = mutateSigned(prev.layer2EmitterOrbitSpeed, -3, 3, 1.5, amount, rng);
    next.layer3EmitterOrbitSpeed = mutateSigned(prev.layer3EmitterOrbitSpeed, -3, 3, 1.5, amount, rng);
    next.layer2BurstPhase = mutateTowardRandom(prev.layer2BurstPhase, 0, 1, amount, rng);
    next.layer3BurstPhase = mutateTowardRandom(prev.layer3BurstPhase, 0, 1, amount, rng);
    next.screenPulseSpeed = mutateTowardRandom(prev.screenPulseSpeed, 0, 4, amount * 0.8, rng);
    next.screenPulseIntensity = mutateTowardRandom(prev.screenPulseIntensity, 0, 1, amount * 0.55, rng);
  }

  if (mutateStructure) {
    next.layer1Count = mutateCount(prev.layer1Count, 120, 12000, 1800, amount, rng);
    next.layer2Count = mutateCount(prev.layer2Count, 120, 24000, 2400, amount, rng);
    next.layer3Count = mutateCount(prev.layer3Count, 80, 12000, 1200, amount, rng);
    next.ambientCount = mutateCount(prev.ambientCount, 0, 2400, 240, amount, rng);
    next.baseSize = mutateTowardRandom(prev.baseSize, 0.12, 3.5, amount * 0.8, rng);
    next.layer2BaseSize = mutateTowardRandom(prev.layer2BaseSize, 0.12, 6, amount, rng);
    next.layer3BaseSize = mutateTowardRandom(prev.layer3BaseSize, 0.12, 6, amount, rng);
    next.sphereRadius = mutateTowardRandom(prev.sphereRadius, 20, 2800, amount, rng);
    next.layer2RadiusScale = mutateTowardRandom(prev.layer2RadiusScale, 0.1, 8, amount, rng);
    next.layer3RadiusScale = mutateTowardRandom(prev.layer3RadiusScale, 0.1, 8, amount, rng);
    next.layer2EmitterOrbitRadius = mutateTowardRandom(prev.layer2EmitterOrbitRadius, 0, 2000, amount, rng);
    next.layer3EmitterOrbitRadius = mutateTowardRandom(prev.layer3EmitterOrbitRadius, 0, 2000, amount, rng);
    next.layer2ConnectionDistance = mutateTowardRandom(prev.layer2ConnectionDistance, 0, 1200, amount, rng);
    next.layer3ConnectionDistance = mutateTowardRandom(prev.layer3ConnectionDistance, 0, 1200, amount, rng);
    next.layer2ConnectionWidth = mutateTowardRandom(prev.layer2ConnectionWidth, 0.1, 30, amount * 0.8, rng);
    next.layer3ConnectionWidth = mutateTowardRandom(prev.layer3ConnectionWidth, 0.1, 30, amount * 0.8, rng);
    next.layer2GeomScale3D = mutateTowardRandom(prev.layer2GeomScale3D, 0.2, 8, amount, rng);
    next.layer3GeomScale3D = mutateTowardRandom(prev.layer3GeomScale3D, 0.2, 8, amount, rng);
  }

  if (mutateSurface) {
    next.layer2PatchOpacity = mutateTowardRandom(prev.layer2PatchOpacity, 0, 1, amount, rng);
    next.layer2PatchResolution = mutateTowardRandom(prev.layer2PatchResolution, 0.05, 2, amount * 0.7, rng);
    next.layer2PatchRelax = mutateTowardRandom(prev.layer2PatchRelax, 0, 1, amount, rng);
    next.layer2PatchWireframe = maybeFlip(prev.layer2PatchWireframe, 0.12 * amount, rng);
    next.layer2BrushOpacity = mutateTowardRandom(prev.layer2BrushOpacity, 0, 1, amount, rng);
    next.layer2BrushScale = mutateTowardRandom(prev.layer2BrushScale, 0.2, 4, amount, rng);
    next.layer2BrushJitter = mutateTowardRandom(prev.layer2BrushJitter, 0, 2, amount, rng);
    next.layer2CrystalOpacity = mutateTowardRandom(prev.layer2CrystalOpacity, 0, 1, amount, rng);
    next.layer2CrystalScale = mutateTowardRandom(prev.layer2CrystalScale, 0.1, 4, amount, rng);
    next.layer2CrystalSpread = mutateTowardRandom(prev.layer2CrystalSpread, 0, 2, amount, rng);
    next.layer2CrystalWireframe = maybeFlip(prev.layer2CrystalWireframe, 0.12 * amount, rng);
    next.layer2VoxelOpacity = mutateTowardRandom(prev.layer2VoxelOpacity, 0, 1, amount, rng);
    next.layer2VoxelScale = mutateTowardRandom(prev.layer2VoxelScale, 0.1, 4, amount, rng);
    next.layer2VoxelSnap = mutateTowardRandom(prev.layer2VoxelSnap, 0, 2, amount, rng);
    next.layer2VoxelWireframe = maybeFlip(prev.layer2VoxelWireframe, 0.12 * amount, rng);
    next.layer2ReactionOpacity = mutateTowardRandom(prev.layer2ReactionOpacity, 0, 1, amount, rng);
    next.layer2ReactionFeed = mutateTowardRandom(prev.layer2ReactionFeed, 0, 0.2, amount * 0.7, rng);
    next.layer2ReactionKill = mutateTowardRandom(prev.layer2ReactionKill, 0, 0.2, amount * 0.7, rng);
    next.layer2ReactionWarp = mutateTowardRandom(prev.layer2ReactionWarp, 0, 4, amount, rng);
    next.layer2FogOpacity = mutateTowardRandom(prev.layer2FogOpacity, 0, 1, amount, rng);
    next.layer2FogDensity = mutateTowardRandom(prev.layer2FogDensity, 0, 1.2, amount, rng);
    next.layer2FogGlow = mutateTowardRandom(prev.layer2FogGlow, 0, 2, amount, rng);
    next.layer2DepositionOpacity = mutateTowardRandom(prev.layer2DepositionOpacity, 0, 1, amount, rng);
    next.layer2DepositionRelief = mutateTowardRandom(prev.layer2DepositionRelief, 0, 2, amount, rng);
    next.layer2DepositionErosion = mutateTowardRandom(prev.layer2DepositionErosion, 0, 2, amount, rng);
    next.layer2DepositionBands = mutateTowardRandom(prev.layer2DepositionBands, 0, 2, amount, rng);

    next.layer3PatchOpacity = mutateTowardRandom(prev.layer3PatchOpacity, 0, 1, amount, rng);
    next.layer3PatchResolution = mutateTowardRandom(prev.layer3PatchResolution, 0.05, 2, amount * 0.7, rng);
    next.layer3PatchRelax = mutateTowardRandom(prev.layer3PatchRelax, 0, 1, amount, rng);
    next.layer3PatchWireframe = maybeFlip(prev.layer3PatchWireframe, 0.12 * amount, rng);
    next.layer3BrushOpacity = mutateTowardRandom(prev.layer3BrushOpacity, 0, 1, amount, rng);
    next.layer3BrushScale = mutateTowardRandom(prev.layer3BrushScale, 0.2, 4, amount, rng);
    next.layer3BrushJitter = mutateTowardRandom(prev.layer3BrushJitter, 0, 2, amount, rng);
    next.layer3CrystalOpacity = mutateTowardRandom(prev.layer3CrystalOpacity, 0, 1, amount, rng);
    next.layer3CrystalScale = mutateTowardRandom(prev.layer3CrystalScale, 0.1, 4, amount, rng);
    next.layer3CrystalSpread = mutateTowardRandom(prev.layer3CrystalSpread, 0, 2, amount, rng);
    next.layer3CrystalWireframe = maybeFlip(prev.layer3CrystalWireframe, 0.12 * amount, rng);
    next.layer3VoxelOpacity = mutateTowardRandom(prev.layer3VoxelOpacity, 0, 1, amount, rng);
    next.layer3VoxelScale = mutateTowardRandom(prev.layer3VoxelScale, 0.1, 4, amount, rng);
    next.layer3VoxelSnap = mutateTowardRandom(prev.layer3VoxelSnap, 0, 2, amount, rng);
    next.layer3VoxelWireframe = maybeFlip(prev.layer3VoxelWireframe, 0.12 * amount, rng);
    next.layer3ReactionOpacity = mutateTowardRandom(prev.layer3ReactionOpacity, 0, 1, amount, rng);
    next.layer3ReactionFeed = mutateTowardRandom(prev.layer3ReactionFeed, 0, 0.2, amount * 0.7, rng);
    next.layer3ReactionKill = mutateTowardRandom(prev.layer3ReactionKill, 0, 0.2, amount * 0.7, rng);
    next.layer3ReactionWarp = mutateTowardRandom(prev.layer3ReactionWarp, 0, 4, amount, rng);
    next.layer3FogOpacity = mutateTowardRandom(prev.layer3FogOpacity, 0, 1, amount, rng);
    next.layer3FogDensity = mutateTowardRandom(prev.layer3FogDensity, 0, 1.2, amount, rng);
    next.layer3FogGlow = mutateTowardRandom(prev.layer3FogGlow, 0, 2, amount, rng);
    next.layer3DepositionOpacity = mutateTowardRandom(prev.layer3DepositionOpacity, 0, 1, amount, rng);
    next.layer3DepositionRelief = mutateTowardRandom(prev.layer3DepositionRelief, 0, 2, amount, rng);
    next.layer3DepositionErosion = mutateTowardRandom(prev.layer3DepositionErosion, 0, 2, amount, rng);
    next.layer3DepositionBands = mutateTowardRandom(prev.layer3DepositionBands, 0, 2, amount, rng);
  }

  if (scope === 'hybrid' && rng() < 0.24 * amount) {
    next.particleColor = prev.particleColor === 'black' ? 'white' : 'black';
    next.backgroundColor = next.particleColor === 'black' ? 'white' : 'black';
  }

  next.renderQuality = 'draft';
  return next;
}
