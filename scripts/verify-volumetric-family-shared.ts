import { buildProjectData, parseProjectData } from '../lib/projectState';
import { buildProjectFutureNativeVolumetricAuthoringStateSet } from '../lib/future-native-families/futureNativeSmokeAuthoring';
import {
  findProjectFutureNativeVolumetricAuthoringEntry,
  getProjectFutureNativeVolumetricAuthoringEntries,
} from '../lib/future-native-families/futureNativeSmokeAuthoring';
import type { VolumetricRouteHighlightFamilyId } from '../lib/future-native-families/futureNativeVolumetricFamilyMetadata';
import { buildProjectVolumetricRouteHighlights } from '../lib/future-native-families/futureNativeVolumetricRouteHighlights';
import type { ParticleConfig, ProjectFutureNativeVolumetricAuthoringEntry } from '../types';

let cachedVolumetricRouteHighlights: ReturnType<typeof buildProjectVolumetricRouteHighlights> | null = null;

function getCachedVolumetricRouteHighlights(): ReturnType<typeof buildProjectVolumetricRouteHighlights> {
  if (!cachedVolumetricRouteHighlights) cachedVolumetricRouteHighlights = buildProjectVolumetricRouteHighlights();
  return cachedVolumetricRouteHighlights;
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function assertApproxEqual(actual: number, expected: number, message: string): void {
  if (Math.abs(actual - expected) > 1e-6) throw new Error(`${message}: expected ${expected}, received ${actual}`);
}

export function buildVerificationProject(name: string, config: ParticleConfig): ReturnType<typeof buildProjectData> {
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
      ...buildProjectFutureNativeVolumetricAuthoringStateSet(config),
    },
  });
}

export function assertProjectSnapshotArtifacts(
  familyId: string,
  integrated: { familyId: string; currentStage: string; uiControlCount: number; runtimeConfigBlock: { values: string[] } },
  projectSnapshot: { familyId: string; runtimeConfig: { values: string[] } },
  routeHighlightPrefixes: readonly string[],
  runtimeConfigPrefixes: readonly string[],
): void {
  assert(integrated.familyId === familyId, `${familyId}: integrated snapshot family mismatch`);
  assert(integrated.currentStage === 'project-integrated', `${familyId}: integrated stage mismatch`);
  assert(integrated.uiControlCount >= 16, `${familyId}: integrated ui controls too low`);
  for (const prefix of runtimeConfigPrefixes) {
    assert(integrated.runtimeConfigBlock.values.some((value) => value.startsWith(prefix)), `${familyId}: integrated config ${prefix} missing`);
    assert(projectSnapshot.runtimeConfig.values.some((value) => value.startsWith(prefix)), `${familyId}: project snapshot ${prefix} missing`);
  }
  const routeHighlight = getCachedVolumetricRouteHighlights().find((entry) => entry.familyId === familyId);
  assert(routeHighlight, `${familyId}: route highlight missing`);
  for (const prefix of routeHighlightPrefixes) {
    assert(routeHighlight.deltaLines.some((value) => value.startsWith(prefix)), `${familyId}: route highlight ${prefix} missing`);
  }
}

export function assertAuthoringRoundtrip(
  familyId: VolumetricRouteHighlightFamilyId,
  familyLabel: string,
  mode: string,
  project: ReturnType<typeof buildProjectData>,
  runtimeValuePrefixes: readonly string[],
): ProjectFutureNativeVolumetricAuthoringEntry {
  const entries = getProjectFutureNativeVolumetricAuthoringEntries(project.ui, familyId);
  assert(entries.length >= 1, `${mode}: ${familyLabel} authoring session state missing`);
  const authoringEntry = entries.find((item) => item.mode === mode);
  assert(authoringEntry, `${mode}: ${familyLabel} authoring entry missing`);
  assert(
    (authoringEntry.recommendedPresetIds ?? []).includes(project.manifest.execution.find((item) => item.key === 'layer2')?.futureNativePrimaryPresetId ?? ''),
    `${mode}: ${familyLabel} authoring recommendations missing primary`,
  );
  for (const prefix of runtimeValuePrefixes) {
    assert((authoringEntry.runtimeConfigValues ?? []).some((value) => value.startsWith(prefix)), `${mode}: ${familyLabel} authoring ${prefix} missing`);
  }
  const parsedProject = parseProjectData(JSON.parse(JSON.stringify(project)));
  assert(parsedProject, `${mode}: ${familyLabel} project roundtrip failed`);
  const parsedAuthoringEntry = findProjectFutureNativeVolumetricAuthoringEntry(parsedProject.ui, familyId, mode);
  assert(parsedAuthoringEntry, `${mode}: ${familyLabel} authoring roundtrip missing`);
  assert(JSON.stringify(parsedAuthoringEntry.recommendedPresetIds) === JSON.stringify(authoringEntry.recommendedPresetIds), `${mode}: ${familyLabel} authoring recommendations changed on parse`);
  assert(JSON.stringify(parsedAuthoringEntry.runtimeConfigValues) === JSON.stringify(authoringEntry.runtimeConfigValues), `${mode}: ${familyLabel} authoring runtime config changed on parse`);
  return authoringEntry;
}
