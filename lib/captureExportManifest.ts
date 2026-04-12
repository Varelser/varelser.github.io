import type { ParticleConfig, ProjectSeedReplaySummary } from '../types';
import { getConfigPerformanceScore, getConfigPerformanceTier } from './performanceHints';
import { buildProjectSeedReplaySummary } from './projectSeedSummary';

export type CaptureExportKind = 'video-webm' | 'png-sequence' | 'png-screenshot' | 'gif';
export type CaptureExportMode = 'current' | 'sequence';

export interface CaptureCanvasMetrics {
  width: number;
  height: number;
  devicePixelRatio?: number;
}

export interface CaptureExportManifest {
  schemaVersion: 1;
  captureId: string;
  generatedAt: string;
  kind: CaptureExportKind;
  exportMode: CaptureExportMode;
  fileName: string;
  mimeType: string;
  targetDurationSeconds: number;
  fps: number | null;
  frameCount: number | null;
  sequenceLength: number;
  sequenceSinglePassDuration: number | null;
  includeAudio: boolean;
  exportScale: number;
  exportAspectPreset: ParticleConfig['exportAspectPreset'];
  transparentBackground: boolean;
  canvas: CaptureCanvasMetrics | null;
  performanceTier: ReturnType<typeof getConfigPerformanceTier>;
  performanceScore: number;
  configHash: string;
  advice: string[];
  summary: {
    renderQuality: ParticleConfig['renderQuality'];
    backgroundColor: ParticleConfig['backgroundColor'];
    particleColor: ParticleConfig['particleColor'];
    audioSourceMode: ParticleConfig['audioSourceMode'];
    enabledLayers: string[];
    seedReplay: ProjectSeedReplaySummary;
    layerCounts: {
      layer1: number;
      layer2: number;
      layer3: number;
      ambient: number;
      gpgpu: number;
    };
  };
  reproduction: {
    captureFingerprint: string;
    guidance: string;
  };
  configSnapshot: ParticleConfig;
}

export interface BuildCaptureExportManifestArgs {
  kind: CaptureExportKind;
  exportMode: CaptureExportMode;
  fileName: string;
  mimeType: string;
  config: ParticleConfig;
  targetDurationSeconds: number;
  fps?: number | null;
  frameCount?: number | null;
  includeAudio?: boolean;
  exportScale?: number;
  transparentBackground?: boolean;
  canvas?: CaptureCanvasMetrics | null;
  sequenceLength?: number;
  sequenceSinglePassDuration?: number | null;
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => [key, sortObjectKeys(entry)]),
  );
}

function stableStringify(value: unknown) {
  return JSON.stringify(sortObjectKeys(value));
}

function hashString(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function getEnabledLayers(config: ParticleConfig) {
  const enabled: string[] = [];
  if (config.layer1Enabled) enabled.push('layer1');
  if (config.layer2Enabled) enabled.push('layer2');
  if (config.layer3Enabled) enabled.push('layer3');
  if (config.ambientEnabled) enabled.push('ambient');
  if (config.gpgpuEnabled) enabled.push('gpgpu');
  return enabled;
}

export function getCaptureManifestAdvice(config: ParticleConfig) {
  const advice = [
    config.renderQuality === 'cinematic' ? 'Cinematic quality is best for final preview/export checks.' : null,
    config.renderQuality === 'draft' ? 'Draft quality is lighter for iteration and may differ from final export appearance.' : null,
    config.exportTransparent ? 'Transparent PNG export keeps alpha but may hide the configured background tone.' : null,
    config.exportAspectPreset !== 'current' ? `Export aspect preset \`${config.exportAspectPreset}\` overrides the live viewport ratio during capture.` : null,
    config.audioEnabled && config.audioSourceMode !== 'midi' ? `Audio source \`${config.audioSourceMode}\` is active for live behavior.` : null,
    config.projectSeedLockEnabled ? `Seed lock is enabled (seed ${config.projectSeedValue}).` : null,
    config.layer2ConnectionEnabled || config.layer3ConnectionEnabled ? 'Connection lines are a common cost hotspot during capture.' : null,
    config.screenPersistenceIntensity > 0.35 ? 'Screen persistence is active and can amplify long-frame artifacts in heavy scenes.' : null,
  ].filter((entry): entry is string => Boolean(entry));

  return advice;
}

export function buildCaptureExportManifest({
  canvas = null,
  config,
  exportMode,
  exportScale = config.exportScale,
  fileName,
  fps = null,
  frameCount = null,
  includeAudio = false,
  kind,
  mimeType,
  sequenceLength = 0,
  sequenceSinglePassDuration = null,
  targetDurationSeconds,
  transparentBackground = config.exportTransparent,
}: BuildCaptureExportManifestArgs): CaptureExportManifest {
  const generatedAt = new Date().toISOString();
  const configSnapshot = JSON.parse(JSON.stringify(config)) as ParticleConfig;
  const configHash = hashString(stableStringify(configSnapshot));
  const performanceScore = Math.round(getConfigPerformanceScore(config) * 100) / 100;
  const performanceTier = getConfigPerformanceTier(config);
  const captureFingerprint = hashString(stableStringify({
    canvas,
    configHash,
    exportMode,
    fps,
    frameCount,
    kind,
    sequenceLength,
    sequenceSinglePassDuration,
    targetDurationSeconds,
    transparentBackground,
  }));

  return {
    schemaVersion: 1,
    captureId: `${kind}-${captureFingerprint.replace(/^fnv1a-/u, '')}`,
    generatedAt,
    kind,
    exportMode,
    fileName,
    mimeType,
    targetDurationSeconds: Math.round(targetDurationSeconds * 1000) / 1000,
    fps,
    frameCount,
    sequenceLength,
    sequenceSinglePassDuration,
    includeAudio,
    exportScale,
    exportAspectPreset: config.exportAspectPreset,
    transparentBackground,
    canvas,
    performanceTier,
    performanceScore,
    configHash,
    advice: getCaptureManifestAdvice(config),
    summary: {
      renderQuality: config.renderQuality,
      backgroundColor: config.backgroundColor,
      particleColor: config.particleColor,
      audioSourceMode: config.audioSourceMode,
      enabledLayers: getEnabledLayers(config),
      seedReplay: buildProjectSeedReplaySummary(config),
      layerCounts: {
        layer1: config.layer1Enabled ? config.layer1Count : 0,
        layer2: config.layer2Enabled ? config.layer2Count : 0,
        layer3: config.layer3Enabled ? config.layer3Count : 0,
        ambient: config.ambientEnabled ? config.ambientCount : 0,
        gpgpu: config.gpgpuEnabled ? config.gpgpuCount : 0,
      },
    },
    reproduction: {
      captureFingerprint,
      guidance: 'For full replay fidelity, keep this manifest together with a project export from the same session.',
    },
    configSnapshot,
  };
}

export function downloadJsonFile(fileName: string, value: unknown) {
  const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}
