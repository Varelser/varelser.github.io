declare const process: { exitCode?: number };
import { buildProjectData, parseProjectData } from '../lib/projectState';
import { normalizeConfig } from '../lib/appStateConfig';
import { FUTURE_NATIVE_PROJECT_INTEGRATED_IDS } from '../lib/future-native-families/futureNativeFamiliesIntegration';
import type { ParticleConfig, ProjectUiState } from '../types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function createProject(config: ParticleConfig, name: string, ui?: Partial<ProjectUiState>) {
  return buildProjectData({
    name,
    config,
    activePresetId: null,
    presetBlendDuration: 1.5,
    sequenceLoopEnabled: true,
    presets: [],
    presetSequence: [],
    ui: {
      isPlaying: false,
      isPanelOpen: true,
      videoExportMode: 'current',
      videoDurationSeconds: 8,
      videoFps: 30,
      ...ui,
    },
  });
}

const scenarios = [
  {
    id: 'baseline',
    config: normalizeConfig({}),
  },
  {
    id: 'hybrid-video',
    config: normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'surface_shell',
      layer2Source: 'video',
      layer2ConnectionEnabled: true,
      layer2GhostTrailEnabled: true,
      layer2GlyphOutlineEnabled: true,
      postFxStackProfile: 'dream-smear',
      postBloomEnabled: true,
    }),
    ui: {
      futureNativeSpecialistRouteControls: [
        {
          familyId: 'specialist-houdini-native',
          selectedAdapterId: 'particles-fallback',
          selectedExecutionTarget: 'hybrid:particle-fallback-stack',
          overrideMode: 'manual',
          overrideCandidateId: 'override:particles-fallback',
          overrideDisposition: 'pinned',
        },
      ],
    } as Partial<ProjectUiState>,
  },
];

const report = scenarios.map((scenario) => {
  const project = createProject(scenario.config, `Future native project state fast: ${scenario.id}`, scenario.ui);
  const parsed = parseProjectData(JSON.parse(JSON.stringify(project)));
  assert(parsed, `[${scenario.id}] parseProjectData returned null`);
  assert(project.manifest.execution.length === 4, `[${scenario.id}] manifest.execution length mismatch`);
  const projectPackets = project.manifest.futureNativeSpecialistPackets ?? [];
  assert(projectPackets.length === 4, `[${scenario.id}] specialist packet count mismatch`);
  const projectManifestRoutes = project.manifest.futureNativeSpecialistRoutes ?? [];
  const projectFutureNative = project.serialization.futureNative;
  assert(projectFutureNative, `[${scenario.id}] project futureNative serialization missing`);
  const parsedManifestRoutes = parsed.manifest.futureNativeSpecialistRoutes ?? [];
  const parsedFutureNative = parsed.serialization.futureNative;
  assert(parsedFutureNative, `[${scenario.id}] parsed futureNative serialization missing`);
  assert(projectManifestRoutes.length === 4, `[${scenario.id}] specialist route count mismatch`);
  assert(projectFutureNative.firstWave.length === FUTURE_NATIVE_PROJECT_INTEGRATED_IDS.length, `[${scenario.id}] integrated family count mismatch`);
  assert(projectFutureNative.specialistRoutes.length === 4, `[${scenario.id}] serialization specialist route count mismatch`);
  for (const family of projectFutureNative.firstWave) {
    assert(family.runtimeConfig.values.length >= 4, `[${scenario.id}:${family.familyId}] runtimeConfig too small`);
    assert(family.runtimeState.values.length >= 4, `[${scenario.id}:${family.familyId}] runtimeState too small`);
  }
  assert(parsed.manifest.execution.length === project.manifest.execution.length, `[${scenario.id}] parsed manifest execution mismatch`);
  assert(parsedManifestRoutes.length === projectManifestRoutes.length, `[${scenario.id}] parsed specialist route mismatch`);
  assert(parsedFutureNative.firstWave.length === projectFutureNative.firstWave.length, `[${scenario.id}] parsed integrated family mismatch`);
  assert(parsedFutureNative.specialistRoutes.length === projectFutureNative.specialistRoutes.length, `[${scenario.id}] parsed serialization specialist route mismatch`);
  for (const route of projectFutureNative.specialistRoutes) {
    const parsedRoute = parsedFutureNative.specialistRoutes.find((candidate) => candidate.familyId === route.familyId);
    assert(parsedRoute, `[${scenario.id}:${route.familyId}] parsed specialist route missing`);
    assert(parsedRoute.selectedAdapterId === route.selectedAdapterId, `[${scenario.id}:${route.familyId}] selectedAdapterId drift`);
    assert(parsedRoute.executionTarget === route.executionTarget, `[${scenario.id}:${route.familyId}] executionTarget drift`);
  }
  return {
    id: scenario.id,
    integratedFamilyCount: projectFutureNative.firstWave.length,
    specialistRouteCount: projectFutureNative.specialistRoutes.length,
    averageProgressPercent: projectFutureNative.summary.averageProgressPercent,
  };
});

console.log('PASS future-native-project-state-fast');
console.log(JSON.stringify({ ok: true, verifiedScenarioCount: report.length, report }, null, 2));
