import type { ExecutionDiagnosticEntry } from './executionDiagnostics';
import type { RuntimeProfilingEntry } from './runtimeProfiling';

export type GpgpuPreferredPathStatus =
  | 'not-requested'
  | 'warming'
  | 'direct'
  | 'fallback'
  | 'unavailable';

export interface GpgpuExecutionBlockerFocus {
  id: string;
  count: number;
  family: 'field' | 'flocking' | 'constraints' | 'collision' | 'life' | 'rendering' | 'audio' | 'other' | 'runtime';
  rationale: string;
}

export interface GpgpuExecutionStatusSummary {
  status: GpgpuPreferredPathStatus;
  requestedPreferredPath: boolean;
  preferredBackend: 'webgpu-compute' | 'webgl-gpgpu' | 'none';
  activeBackend: string;
  actualRoute: 'webgpu' | 'webgl' | 'idle';
  averageDurationMs: number;
  worstDurationMs: number;
  readiness: 'not-requested' | 'warming' | 'preferred-ready' | 'fallback-active' | 'unavailable';
  blockerSummary: string;
  blockerGroups: string[];
  blockerDetails: string[];
  nextBlockerFocus: GpgpuExecutionBlockerFocus[];
  rationale: string;
}

const UNSUPPORTED_FEATURE_GROUPS: Record<string, string> = {
  'audio-reactive': 'audio',
  metaball: 'rendering',
  volumetric: 'rendering',
  'smooth-tube': 'rendering',
  ribbon: 'rendering',
  tube: 'rendering',
  trail: 'rendering',
  age: 'dynamics-life',
  verlet: 'dynamics-constraints',
  spring: 'dynamics-constraints',
  elastic: 'dynamics-constraints',
  'sdf-collider': 'dynamics-collision',
  sph: 'dynamics-collision',
  boids: 'dynamics-flocking',
  nbody: 'dynamics-flocking',
  magnetic: 'dynamics-flocking',
  curl: 'dynamics-field',
  attractor: 'dynamics-field',
  vortex: 'dynamics-field',
  wind: 'dynamics-field',
  well: 'dynamics-field',
  'vector-field': 'dynamics-field',
  'mouse-force': 'dynamics-field',
  'fluid-field': 'dynamics-field',
};

function classifyUnsupportedFeature(feature: string) {
  return UNSUPPORTED_FEATURE_GROUPS[feature] ?? 'other';
}

function getBlockerFamily(detailGroup: string): GpgpuExecutionBlockerFocus['family'] {
  if (detailGroup === 'runtime') return 'runtime';
  if (detailGroup === 'audio') return 'audio';
  if (detailGroup === 'rendering') return 'rendering';
  if (detailGroup === 'other') return 'other';
  if (detailGroup === 'dynamics-field') return 'field';
  if (detailGroup === 'dynamics-flocking') return 'flocking';
  if (detailGroup === 'dynamics-constraints') return 'constraints';
  if (detailGroup === 'dynamics-collision') return 'collision';
  if (detailGroup === 'dynamics-life') return 'life';
  return 'other';
}

function getBlockerRationale(detailGroup: string, count: number) {
  switch (detailGroup) {
    case 'dynamics-field':
      return count > 0 ? 'Field系はかなり閉じたので、残件が出る場合は実装漏れか capability 判定ずれの可能性が高い。' : 'Field系 blocker は解消済み。';
    case 'dynamics-flocking':
      return '粒子間相互作用が強く、次の compute 拡張候補として最も自然。';
    case 'dynamics-constraints':
      return '近傍拘束や復元力を扱うため、flocking の次候補。';
    case 'dynamics-collision':
      return 'SDF / SPH は計算量とデータ依存が重く、別フェーズで扱うのが安全。';
    case 'dynamics-life':
      return 'age 系は軽量で、compute blocker 解消の最後に寄せやすい。';
    case 'rendering':
      return '描画表現側なので compute だけでは解消しない。';
    case 'audio':
      return '音声入力経路との結合が必要で、compute 単独では閉じない。';
    default:
      return '詳細確認が必要。';
  }
}

function summarizeUnsupportedFeatures(features: string[]) {
  if (!features.length) {
    return {
      blockerGroups: [] as string[],
      blockerDetails: [] as string[],
      nextBlockerFocus: [] as GpgpuExecutionBlockerFocus[],
      blockerSummary: 'preferred path healthy',
    };
  }
  const groupCounts = new Map<string, number>();
  const topCounts = new Map<string, number>();
  for (const feature of features) {
    const detailGroup = classifyUnsupportedFeature(feature);
    const topGroup = detailGroup.startsWith('dynamics-') ? 'dynamics' : detailGroup;
    groupCounts.set(topGroup, (groupCounts.get(topGroup) ?? 0) + 1);
    topCounts.set(detailGroup, (topCounts.get(detailGroup) ?? 0) + 1);
  }
  const blockerGroups = Array.from(groupCounts.entries()).map(([group, count]) => `${group}:${count}`);
  const blockerDetails = Array.from(topCounts.entries()).map(([group, count]) => `${group}:${count}`);
  const nextBlockerFocus = Array.from(topCounts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      const familyOrder = ['dynamics-flocking', 'dynamics-constraints', 'dynamics-collision', 'dynamics-life', 'rendering', 'audio', 'dynamics-field', 'other'];
      return familyOrder.indexOf(a[0]) - familyOrder.indexOf(b[0]);
    })
    .slice(0, 3)
    .map(([group, count]) => ({
      id: group,
      count,
      family: getBlockerFamily(group),
      rationale: getBlockerRationale(group, count),
    }));
  const detailsSuffix = blockerDetails.length ? ` | details ${blockerDetails.join(' · ')}` : '';
  return {
    blockerGroups,
    blockerDetails,
    nextBlockerFocus,
    blockerSummary: `unsupported: ${blockerGroups.join(' · ')}${detailsSuffix} (${features.join(', ')})`,
  };
}

function findEntry(entries: RuntimeProfilingEntry[], id: string) {
  return entries.find((entry) => entry.id === id);
}

export function getGpgpuExecutionStatus(
  entry: ExecutionDiagnosticEntry | null | undefined,
  simulationEntries: RuntimeProfilingEntry[] = [],
): GpgpuExecutionStatusSummary {
  const webgpuEntry = findEntry(simulationEntries, 'scene:gpgpu-simulation-webgpu');
  const webglEntry = findEntry(simulationEntries, 'scene:gpgpu-simulation-webgl');
  const requestedPreferredPath = Boolean(entry && entry.id === 'gpgpu' && entry.requestedEngine === 'webgpu-compute');
  const preferredBackend = requestedPreferredPath ? 'webgpu-compute' : (entry?.engine === 'webgl-gpgpu' ? 'webgl-gpgpu' : 'none');
  const activeBackend = entry?.engine ?? 'none';
  const actualRoute = webgpuEntry?.sampleCount
    ? 'webgpu'
    : webglEntry?.sampleCount
      ? 'webgl'
      : 'idle';
  const averageDurationMs = webgpuEntry?.sampleCount
    ? webgpuEntry.averageDurationMs
    : webglEntry?.averageDurationMs ?? 0;
  const worstDurationMs = webgpuEntry?.sampleCount
    ? webgpuEntry.worstDurationMs
    : webglEntry?.worstDurationMs ?? 0;

  if (!entry || entry.id !== 'gpgpu') {
    return {
      status: 'not-requested',
      requestedPreferredPath: false,
      preferredBackend: 'none',
      activeBackend: 'none',
      actualRoute: 'idle',
      averageDurationMs: 0,
      worstDurationMs: 0,
      readiness: 'not-requested',
      blockerSummary: 'gpgpu route inactive',
      blockerGroups: [],
      blockerDetails: [],
      nextBlockerFocus: [],
      rationale: 'GPGPU execution route is not active in the current routing table.',
    };
  }

  if (!requestedPreferredPath) {
    return {
      status: 'not-requested',
      requestedPreferredPath: false,
      preferredBackend,
      activeBackend,
      actualRoute,
      averageDurationMs,
      worstDurationMs,
      readiness: 'not-requested',
      blockerSummary: 'preferred path not requested',
      blockerGroups: [],
      blockerDetails: [],
      nextBlockerFocus: [],
      rationale: 'WebGPU preferred path is not requested, so current execution stays on the standard route.',
    };
  }

  if (entry.unsupportedFeatures?.length) {
    const unsupportedSummary = summarizeUnsupportedFeatures(entry.unsupportedFeatures);
    return {
      status: 'unavailable',
      requestedPreferredPath,
      preferredBackend,
      activeBackend,
      actualRoute,
      averageDurationMs,
      worstDurationMs,
      readiness: 'unavailable',
      blockerSummary: unsupportedSummary.blockerSummary,
      blockerGroups: unsupportedSummary.blockerGroups,
      blockerDetails: unsupportedSummary.blockerDetails,
      nextBlockerFocus: unsupportedSummary.nextBlockerFocus,
      rationale: `WebGPU preferred path is blocked by unsupported features: ${entry.unsupportedFeatures.join(', ')}.`,
    };
  }

  const webgpuStatus = actualRoute === 'webgpu' ? 'ready' : (actualRoute === 'webgl' ? 'fallback-active' : 'pending');
  if (entry.engine === 'webgpu-compute' && actualRoute === 'webgpu') {
    return {
      status: 'direct',
      requestedPreferredPath,
      preferredBackend,
      activeBackend,
      actualRoute,
      averageDurationMs,
      worstDurationMs,
      readiness: 'preferred-ready',
      blockerSummary: 'preferred path healthy',
      blockerGroups: [],
      blockerDetails: [],
      nextBlockerFocus: [],
      rationale: 'WebGPU preferred path is requested and current frame timing confirms direct WebGPU execution.',
    };
  }

  if (webgpuStatus === 'pending') {
    return {
      status: 'warming',
      requestedPreferredPath,
      preferredBackend,
      activeBackend,
      actualRoute,
      averageDurationMs,
      worstDurationMs,
      readiness: 'warming',
      blockerSummary: 'warming up WebGPU path',
      blockerGroups: [],
      blockerDetails: [],
      nextBlockerFocus: [],
      rationale: 'WebGPU preferred path is requested but runtime initialization is still in progress.',
    };
  }

  if (entry.engine !== 'webgpu-compute' || actualRoute === 'webgl') {
    return {
      status: 'fallback',
      requestedPreferredPath,
      preferredBackend,
      activeBackend,
      actualRoute,
      averageDurationMs,
      worstDurationMs,
      readiness: 'fallback-active',
      blockerSummary: entry.engine !== 'webgpu-compute' ? `engine fallback: ${entry.engine}` : 'runtime fallback: webgl route active',
      blockerGroups: ['runtime'],
      blockerDetails: ['runtime:1'],
      nextBlockerFocus: [{ id: 'runtime', count: 1, family: 'runtime', rationale: 'まず runtime fallback の原因を切るべきです。' }],
      rationale: 'WebGPU preferred path is requested, but current execution is still falling back to the WebGL GPGPU route.',
    };
  }

  return {
    status: 'warming',
    requestedPreferredPath,
    preferredBackend,
    activeBackend,
    actualRoute,
    averageDurationMs,
    worstDurationMs,
    readiness: 'warming',
    blockerSummary: `waiting for direct timing (${webgpuStatus})`,
    blockerGroups: [],
    blockerDetails: [],
    nextBlockerFocus: [],
    rationale: `WebGPU preferred path is requested with runtime status ${webgpuStatus}, but direct frame timing has not been observed yet.`,
  };
}
