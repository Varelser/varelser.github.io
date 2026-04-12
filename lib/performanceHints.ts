import type { ParticleConfig, RenderQuality } from '../types';
import { getLayerRuntimeMode, getLayerRuntimeSource } from './sceneRenderRoutingRuntimeAccessors';

export type PerformanceTier = 'light' | 'medium' | 'heavy';

function clampTier(score: number): PerformanceTier {
  if (score >= 7) return 'heavy';
  if (score >= 4) return 'medium';
  return 'light';
}

export function getRenderQualityDescription(quality: RenderQuality) {
  if (quality === 'draft') return 'Lower DPR and lighter line refresh for heavy exploration.';
  if (quality === 'cinematic') return 'Higher DPR and denser line refresh for preview/export checks.';
  return 'Balanced runtime quality for general editing.';
}

export function getConfigPerformanceScore(config: ParticleConfig) {
  let score = 0;
  const layer1Budget = config.layer1Enabled ? config.layer1Count / 9000 : 0;
  const layer2Budget = config.layer2Enabled ? config.layer2Count / 18000 : 0;
  const layer3Budget = config.layer3Enabled ? config.layer3Count / 5000 : 0;
  const ambientBudget = config.ambientEnabled ? config.ambientCount / 8000 : 0;

  score += layer1Budget + layer2Budget + layer3Budget + ambientBudget;
  score += config.layer2ConnectionEnabled ? 1.4 : 0;
  score += config.layer3ConnectionEnabled ? 1.4 : 0;
  score += config.layer2AuxEnabled ? config.layer2AuxCount / 22000 : 0;
  score += config.layer3AuxEnabled ? config.layer3AuxCount / 22000 : 0;
  score += config.layer2SparkEnabled ? config.layer2SparkCount / 16000 : 0;
  score += config.layer3SparkEnabled ? config.layer3SparkCount / 16000 : 0;
  score += (config.layer2Fidelity + config.layer3Fidelity) * 0.18;
  score += config.screenPersistenceIntensity * config.screenPersistenceLayers * 0.9;
  score += config.screenNoiseIntensity * 0.6 + config.screenInterferenceIntensity * 0.5;
  score += config.interLayerCollisionEnabled ? 0.9 : 0;

  if (config.renderQuality === 'cinematic') score += 1.2;
  if (config.renderQuality === 'draft') score -= 0.8;

  return Math.max(0, score);
}

export function getConfigPerformanceTier(config: ParticleConfig): PerformanceTier {
  return clampTier(getConfigPerformanceScore(config));
}

export function getLayerPerformanceSummary(config: ParticleConfig, layerIndex: 2 | 3) {
  const isLayer2 = layerIndex === 2;
  const count = isLayer2 ? config.layer2Count : config.layer3Count;
  const fidelity = isLayer2 ? config.layer2Fidelity : config.layer3Fidelity;
  const linesEnabled = isLayer2 ? config.layer2ConnectionEnabled : config.layer3ConnectionEnabled;
  const auxEnabled = isLayer2 ? config.layer2AuxEnabled : config.layer3AuxEnabled;
  const sparkEnabled = isLayer2 ? config.layer2SparkEnabled : config.layer3SparkEnabled;
  const tier = clampTier(
    count / (isLayer2 ? 24000 : 7000) +
    fidelity * 0.24 +
    (linesEnabled ? 1.4 : 0) +
    (auxEnabled ? 0.9 : 0) +
    (sparkEnabled ? 1.0 : 0),
  );

  const suggestions = [
    count > (isLayer2 ? 90000 : 18000) ? 'Reduce particle count for iteration.' : null,
    fidelity > 4 ? 'Lower fidelity while designing.' : null,
    linesEnabled ? 'Plexus lines are one of the bigger CPU-side costs.' : null,
    sparkEnabled || auxEnabled ? 'Secondary emitters add a noticeable fill-rate cost.' : null,
  ].filter(Boolean) as string[];

  return {
    tier,
    suggestions,
  };
}

export function getPerformanceBudgetAdvice(config: ParticleConfig) {
  const advice = [
    config.renderQuality === 'cinematic' ? 'Cinematic quality is heavier; use Balanced or Draft while editing.' : null,
    (config.layer2Enabled && config.layer2Count > 90000) || (config.layer3Enabled && config.layer3Count > 18000) ? 'Particle counts are high for live editing; reduce counts before long captures.' : null,
    config.layer2ConnectionEnabled || config.layer3ConnectionEnabled ? 'Connection lines add noticeable CPU cost in dense scenes.' : null,
    config.layer2AuxEnabled || config.layer3AuxEnabled || config.layer2SparkEnabled || config.layer3SparkEnabled ? 'Secondary emitters raise fill-rate cost and can push recordings into long frames.' : null,
    config.screenPersistenceIntensity * config.screenPersistenceLayers > 0.8 ? 'Persistence layers are heavy in combination; trim them if FPS drops.' : null,
    config.interLayerCollisionEnabled ? 'Inter-layer collision adds simulation overhead and may need Draft quality for iteration.' : null,
  ].filter((entry): entry is string => Boolean(entry));

  return advice.slice(0, 3);
}


export function getPerformanceHotspots(config: ParticleConfig) {
  const hotspots = [
    config.layer2Enabled && config.layer2Count > 60000 ? 'Layer 2 particle density' : null,
    config.layer3Enabled && config.layer3Count > 12000 ? 'Layer 3 particle density' : null,
    config.layer2ConnectionEnabled || config.layer3ConnectionEnabled ? 'Connection lines' : null,
    config.layer2AuxEnabled || config.layer3AuxEnabled ? 'Aux emitters' : null,
    config.layer2SparkEnabled || config.layer3SparkEnabled ? 'Spark emitters' : null,
    config.screenPersistenceIntensity * config.screenPersistenceLayers > 0.55 ? 'Persistence stack' : null,
    config.postBloomEnabled || config.postDofEnabled || config.postN8aoEnabled ? 'Post FX stack' : null,
    config.interLayerCollisionEnabled ? 'Inter-layer collision' : null,
  ].filter((entry): entry is string => Boolean(entry));

  return hotspots.slice(0, 4);
}

export function getPerformanceBudgetEstimate(config: ParticleConfig) {
  const score = getConfigPerformanceScore(config);
  const estimatedFps = Math.max(12, Math.min(120, Math.round((86 - score * 6.4) * 10) / 10));
  const lowerBound = Math.max(8, Math.round((estimatedFps - 10) * 10) / 10);
  const upperBound = Math.max(lowerBound, Math.round((estimatedFps + 8) * 10) / 10);
  const tier = getConfigPerformanceTier(config);
  const headroom = tier === 'light' ? 'high' : tier === 'medium' ? 'moderate' : 'low';
  const exportRisk = score >= 8.5 ? 'high' : score >= 5 ? 'watch' : 'low';

  return {
    estimatedFps,
    rangeLabel: `${lowerBound}-${upperBound} fps`,
    headroom,
    exportRisk,
    hotspots: getPerformanceHotspots(config),
  };
}


export type GenerationRuntimeBudgetProfile = {
  mediaMapMaxDimension: number;
  mediaSampleAttempts: number;
  maxPatchResolution: number;
  maxMembraneVertices: number;
  maxGrowthBaseCount: number;
  maxFiberStrands: number;
  maxHullPoints: number;
};

type GenerationBudgetTier = 'light' | 'medium' | 'heavy' | 'very_heavy';

function includesAny(value: string, tokens: readonly string[]) {
  return tokens.some((token) => value.includes(token));
}

function getGenerationBudgetTier(score: number): GenerationBudgetTier {
  if (score >= 8.5) return 'very_heavy';
  if (score >= 6) return 'heavy';
  if (score >= 3.5) return 'medium';
  return 'light';
}

export function getGenerationRuntimeBudgetProfile(config: ParticleConfig, layerIndex: 2 | 3): GenerationRuntimeBudgetProfile {
  const mode = getLayerRuntimeMode(config, layerIndex);
  const source = getLayerRuntimeSource(config, layerIndex);
  const count = layerIndex === 2 ? config.layer2Count : config.layer3Count;
  let score = getConfigPerformanceScore(config) + count / (layerIndex === 2 ? 32000 : 9000);

  if (includesAny(mode, ['surface', 'membrane', 'sheet', 'shell', 'growth', 'fiber', 'fracture', 'grammar', 'voxel', 'smoke', 'fog', 'glyph', 'mesh', 'weave', 'lattice'])) score += 1.4;
  if (includesAny(mode, ['visco', 'granular', 'avalanche', 'jammed', 'talus', 'static_smoke', 'prism_smoke', 'volume_fog'])) score += 1.1;
  if (source === 'image' || source === 'video' || source === 'text') score += 1.2;
  if (config.renderQuality === 'draft') score -= 0.75;
  if (config.renderQuality === 'cinematic') score += 0.4;

  const tier = getGenerationBudgetTier(score);
  const profileByTier: Record<GenerationBudgetTier, GenerationRuntimeBudgetProfile> = {
    light: {
      mediaMapMaxDimension: 192,
      mediaSampleAttempts: 10,
      maxPatchResolution: 56,
      maxMembraneVertices: 4096,
      maxGrowthBaseCount: 96,
      maxFiberStrands: 512,
      maxHullPoints: 160,
    },
    medium: {
      mediaMapMaxDimension: 160,
      mediaSampleAttempts: 8,
      maxPatchResolution: 48,
      maxMembraneVertices: 3072,
      maxGrowthBaseCount: 72,
      maxFiberStrands: 384,
      maxHullPoints: 128,
    },
    heavy: {
      mediaMapMaxDimension: 128,
      mediaSampleAttempts: 6,
      maxPatchResolution: 40,
      maxMembraneVertices: 2048,
      maxGrowthBaseCount: 56,
      maxFiberStrands: 288,
      maxHullPoints: 96,
    },
    very_heavy: {
      mediaMapMaxDimension: 96,
      mediaSampleAttempts: 4,
      maxPatchResolution: 32,
      maxMembraneVertices: 1536,
      maxGrowthBaseCount: 40,
      maxFiberStrands: 224,
      maxHullPoints: 72,
    },
  };

  const budget = { ...profileByTier[tier] };

  if (source === 'text') {
    budget.mediaMapMaxDimension = Math.min(budget.mediaMapMaxDimension, 112);
    budget.mediaSampleAttempts = Math.min(budget.mediaSampleAttempts, 6);
  }
  if (source === 'image' || source === 'video') {
    budget.mediaMapMaxDimension = Math.min(budget.mediaMapMaxDimension, tier === 'light' ? 176 : 128);
  }
  if (includesAny(mode, ['surface', 'patch', 'deposition', 'reaction'])) {
    budget.maxPatchResolution = Math.min(budget.maxPatchResolution, tier === 'light' ? 52 : 40);
  }
  if (includesAny(mode, ['membrane', 'sheet', 'skin'])) {
    budget.maxMembraneVertices = Math.min(budget.maxMembraneVertices, tier === 'light' ? 3072 : tier === 'medium' ? 2304 : 1792);
  }
  if (includesAny(mode, ['growth', 'branch'])) {
    budget.maxGrowthBaseCount = Math.min(budget.maxGrowthBaseCount, tier === 'light' ? 84 : tier === 'medium' ? 64 : 44);
  }
  if (includesAny(mode, ['fiber', 'weave', 'lace', 'threads', 'braid', 'web'])) {
    budget.maxFiberStrands = Math.min(budget.maxFiberStrands, tier === 'light' ? 420 : tier === 'medium' ? 320 : 240);
  }
  if (includesAny(mode, ['shell', 'fracture', 'voxel', 'smoke', 'fog', 'glyph'])) {
    budget.maxHullPoints = Math.min(budget.maxHullPoints, tier === 'light' ? 136 : tier === 'medium' ? 112 : 84);
  }

  return budget;
}
