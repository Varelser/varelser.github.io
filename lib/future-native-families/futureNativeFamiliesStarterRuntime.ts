import type { FutureNativeFamilySpec } from './futureNativeFamiliesTypes';

export type FutureNativeFamilyRuntimeStage = 'schema' | 'adapter' | 'solver' | 'renderer' | 'ui' | 'verification';

export interface FutureNativeFamilyStarterFile {
  path: string;
  purpose: string;
  stage: FutureNativeFamilyRuntimeStage;
}

export interface FutureNativeFamilyStarterRuntimePacket {
  entryId: FutureNativeFamilySpec['id'];
  targetRuntime: 'cpu-prototype' | 'gpu-upgrade-ready' | 'hybrid';
  stages: FutureNativeFamilyRuntimeStage[];
  files: FutureNativeFamilyStarterFile[];
  acceptanceChecklist: string[];
}

const SHARED_STAGES: FutureNativeFamilyRuntimeStage[] = [
  'schema',
  'adapter',
  'solver',
  'renderer',
  'ui',
  'verification',
];

export function buildFutureNativeFamilyStarterRuntimePacket(
  entry: FutureNativeFamilySpec,
): FutureNativeFamilyStarterRuntimePacket {
  const base = entry.id.replace(/-/g, '_');
  return {
    entryId: entry.id,
    targetRuntime: entry.group === 'specialist-native' ? 'hybrid' : 'gpu-upgrade-ready',
    stages: SHARED_STAGES,
    files: [
      { path: `lib/future-native-families/starter-runtime/${base}Schema.ts`, purpose: 'schema defaults and normalized runtime state', stage: 'schema' },
      { path: `lib/future-native-families/starter-runtime/${base}Adapter.ts`, purpose: 'bridge from app config to solver state', stage: 'adapter' },
      { path: `lib/future-native-families/starter-runtime/${base}Solver.ts`, purpose: 'cpu prototype solver with deterministic stepping', stage: 'solver' },
      { path: `lib/future-native-families/starter-runtime/${base}Renderer.ts`, purpose: 'render payload generation and debug overlays', stage: 'renderer' },
      { path: `lib/future-native-families/starter-runtime/${base}Ui.ts`, purpose: 'parameter group layout and control mapping', stage: 'ui' },
      { path: `scripts/verify-${base}.mjs`, purpose: 'verification harness entry point', stage: 'verification' },
    ],
    acceptanceChecklist: [
      'deterministic step() for fixed seed',
      'one preset fixture serializes and round-trips',
      'debug render path exists before production renderer',
      'ui parameters map 1:1 to normalized schema keys',
      'verification script asserts state stability for >= 32 frames',
    ],
  };
}
