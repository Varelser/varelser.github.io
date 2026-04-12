import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef } from 'react';
import type { ParticleConfig, PresetRecord, PresetSequenceItem, ProjectData, ProjectManifest, ProjectFutureNativeSpecialistRouteControlEntry } from '../types';
import { PROJECT_MANIFEST_SCHEMA_VERSION, PROJECT_SERIALIZATION_SCHEMA_VERSION } from './projectStateShared';
import { scheduleDeferredHydration } from './scheduleDeferredHydration';
import { buildDefaultProjectFutureNativeSpecialistRouteControls } from './future-native-families/futureNativeSpecialistRouteControls';
import type { Notice } from './audioControllerTypes';

function buildProjectExportFileName(exportedAt: string = new Date().toISOString()) {
  return `kalokagathia-project-${exportedAt.replace(/[:.]/g, '-')}.json`;
}

function serializeProjectData(project: ProjectData) {
  return JSON.stringify(project, null, 2);
}

const PROJECT_AUTOSAVE_QUERY_PARAM = 'projectAutosave';
const PROJECT_AUTOSAVE_DEBUG_FLAG = 'kalokagathia-project-autosave';

function isTruthyFlag(value: string | null) {
  if (value == null) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized in {'1': 1, 'true': 1, 'on': 1, 'yes': 1, 'enabled': 1}) return true;
  if (normalized in {'0': 1, 'false': 1, 'off': 1, 'no': 1, 'disabled': 1}) return false;
  return null;
}

function isProjectAutosaveEnabled() {
  if (typeof window === 'undefined') return false;

  try {
    const queryValue = isTruthyFlag(new URLSearchParams(window.location.search).get(PROJECT_AUTOSAVE_QUERY_PARAM));
    if (queryValue !== null) return queryValue;
  } catch {
    // noop
  }

  try {
    const storedValue = isTruthyFlag(window.localStorage.getItem(PROJECT_AUTOSAVE_DEBUG_FLAG));
    if (storedValue !== null) return storedValue;
  } catch {
    // noop
  }

  return false;
}

function buildProjectAutosaveSignature(input: {
  config: ParticleConfig;
  activePresetId: string | null;
  presetBlendDuration: number;
  sequenceLoopEnabled: boolean;
  presets: PresetRecord[];
  presetSequence: PresetSequenceItem[];
  ui: {
    isPlaying: boolean;
    isPanelOpen: boolean;
    videoExportMode: 'current' | 'sequence';
    videoDurationSeconds: number;
    videoFps: number;
    futureNativeSpecialistRouteControls: ProjectFutureNativeSpecialistRouteControlEntry[];
  };
}) {
  return JSON.stringify(input);
}

type UseProjectTransferArgs = {
  activePresetId: string | null;
  config: ParticleConfig;
  isPanelOpen: boolean;
  isPlaying: boolean;
  isPublicLibraryMode: boolean;
  futureNativeSpecialistRouteControls: ProjectFutureNativeSpecialistRouteControlEntry[];
  presetBlendDuration: number;
  presetSequence: PresetSequenceItem[];
  presets: PresetRecord[];
  sequenceLoopEnabled: boolean;
  setProjectManifest: Dispatch<SetStateAction<ProjectManifest>>;
  setProjectNotice: Dispatch<SetStateAction<Notice | null>>;
  videoDurationSeconds: number;
  videoExportMode: 'current' | 'sequence';
  videoFps: number;
};

type ImportProjectFileArgs = {
  file: File;
  isPublicLibraryMode: boolean;
  setActivePresetId: Dispatch<SetStateAction<string | null>>;
  setConfig: Dispatch<SetStateAction<ParticleConfig>>;
  setFutureNativeSpecialistRouteControls: Dispatch<SetStateAction<ProjectFutureNativeSpecialistRouteControlEntry[]>>;
  setIsPanelOpen: Dispatch<SetStateAction<boolean>>;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  setPresetBlendDuration: Dispatch<SetStateAction<number>>;
  setPresetSequence: Dispatch<SetStateAction<PresetSequenceItem[]>>;
  setPresets: Dispatch<SetStateAction<PresetRecord[]>>;
  setProjectManifest: Dispatch<SetStateAction<ProjectManifest>>;
  setProjectNotice: Dispatch<SetStateAction<Notice | null>>;
  setSequenceLoopEnabled: Dispatch<SetStateAction<boolean>>;
  setVideoDurationSeconds: Dispatch<SetStateAction<number>>;
  setVideoExportMode: Dispatch<SetStateAction<'current' | 'sequence'>>;
  setVideoFps: Dispatch<SetStateAction<number>>;
  stopPresetTransition: () => void;
  stopSequencePlayback: () => void;
};

export function createPendingProjectManifest(): ProjectManifest {
  const emptyAxis = {
    covered: [],
    missing: [],
    hitCount: 0,
    targetCount: 0,
    ratio: 0,
  };

  return {
    schemaVersion: PROJECT_MANIFEST_SCHEMA_VERSION,
    serializationSchemaVersion: PROJECT_SERIALIZATION_SCHEMA_VERSION,
    layers: [],
    execution: [],
    futureNativeSpecialistPackets: [],
    futureNativeSpecialistRoutes: [],
    coverage: {
      depictionMethods: [],
      motionFamilies: [],
      computeBackends: [],
      sourceFamilies: [],
      renderFamilies: [],
      postFamilies: [],
      solverFamilies: [],
      specialistFamilies: [],
      physicalFamilies: [],
      geometryFamilies: [],
      temporalFamilies: [],
      productPackFamilies: [],
      productPacks: [],
      postStackTemplates: [],
      activePostStackId: null,
      activeProductPackId: null,
      gpgpuFeatures: [],
      gapTargets: [],
      productPackScorecards: [],
      coverageRollup: {
        coverageScore: 0,
        targetHitCount: 0,
        targetTotal: 0,
        averagePackCoverageScore: 0,
        bestPackId: null,
        bestPackLabel: null,
        bestPackCoverageScore: 0,
        sourceAxis: { ...emptyAxis },
        renderAxis: { ...emptyAxis },
        postAxis: { ...emptyAxis },
        computeAxis: { ...emptyAxis },
        motionAxis: { ...emptyAxis },
        solverAxis: { ...emptyAxis },
        specialistAxis: { ...emptyAxis },
        physicalAxis: { ...emptyAxis },
        geometryAxis: { ...emptyAxis },
        temporalAxis: { ...emptyAxis },
        missingTargets: [],
      },
      augmentationSuggestions: [],
    },
    stats: {
      presetCount: 0,
      sequenceCount: 0,
      enabledLayerCount: 0,
      mediaSourceCount: 0,
      textSourceCount: 0,
      proceduralModeCount: 0,
      distinctMaterialCount: 0,
      depictionMethodCount: 0,
      motionFamilyCount: 0,
      computeBackendCount: 0,
      sourceFamilyCount: 0,
      renderFamilyCount: 0,
      postFamilyCount: 0,
      solverFamilyCount: 0,
      specialistFamilyCount: 0,
      physicalFamilyCount: 0,
      geometryFamilyCount: 0,
      temporalFamilyCount: 0,
      productPackFamilyCount: 0,
      productPackCount: 0,
      postStackTemplateCount: 0,
      gpgpuFeatureCount: 0,
      coverageGapCount: 0,
      productPackScorecardCount: 0,
      activeProductPackCoverageScore: 0,
      currentCoverageScore: 0,
      currentTargetHitCount: 0,
      currentTargetTotal: 0,
      overallCoverageScore: 0,
      overallTargetHitCount: 0,
      overallTargetTotal: 0,
      averagePackCoverageScore: 0,
      bestPackCoverageScore: 0,
      augmentationSuggestionCount: 0,
    },
  };
}

export async function importProjectFile({
  file,
  isPublicLibraryMode,
  setActivePresetId,
  setConfig,
  setFutureNativeSpecialistRouteControls,
  setIsPanelOpen,
  setIsPlaying,
  setPresetBlendDuration,
  setPresetSequence,
  setPresets,
  setProjectManifest,
  setProjectNotice,
  setSequenceLoopEnabled,
  setVideoDurationSeconds,
  setVideoExportMode,
  setVideoFps,
  stopPresetTransition,
  stopSequencePlayback,
}: ImportProjectFileArgs) {
  if (isPublicLibraryMode) {
    setProjectNotice({ tone: 'error', message: 'Project import is disabled in the public build.' });
    return;
  }

  try {
    const text = await file.text();
    const { buildProjectImportNotice, inspectProjectDataText, prepareImportedProjectData } = await import('./projectTransferShared');
    const inspection = inspectProjectDataText(text);
    if (!inspection.parsed) {
      setProjectNotice({ tone: 'error', message: inspection.message ?? 'Invalid project JSON.' });
      return;
    }
    const parsed = inspection.parsed;

    stopSequencePlayback();
    stopPresetTransition();

    const prepared = prepareImportedProjectData(parsed, {
      importMode: 'replace',
    });

    setPresets(prepared.importedPresets);
    setPresetSequence(prepared.importedSequence);
    setConfig(prepared.project.currentConfig);
    setActivePresetId(prepared.remappedActivePresetId);
    setPresetBlendDuration(prepared.project.presetBlendDuration);
    setSequenceLoopEnabled(prepared.project.sequenceLoopEnabled);
    setIsPlaying(prepared.project.ui.isPlaying);
    setIsPanelOpen(prepared.project.ui.isPanelOpen);
    setVideoExportMode(prepared.project.ui.videoExportMode);
    setVideoDurationSeconds(prepared.project.ui.videoDurationSeconds);
    setVideoFps(prepared.project.ui.videoFps);
    setFutureNativeSpecialistRouteControls(prepared.project.ui.futureNativeSpecialistRouteControls ?? buildDefaultProjectFutureNativeSpecialistRouteControls());
    setProjectManifest(prepared.project.manifest);
    setProjectNotice({
      tone: 'success',
      message: buildProjectImportNotice(prepared.project, prepared.importedPresets.length, prepared.diagnostics),
    });
  } catch (error) {
    console.error('Project import failed:', error);
    setProjectNotice({ tone: 'error', message: 'Project import failed.' });
  }
}

export function useProjectTransfer({
  activePresetId,
  config,
  isPanelOpen,
  isPlaying,
  isPublicLibraryMode,
  futureNativeSpecialistRouteControls,
  presetBlendDuration,
  presetSequence,
  presets,
  sequenceLoopEnabled,
  setProjectManifest,
  setProjectNotice,
  videoDurationSeconds,
  videoExportMode,
  videoFps,
}: UseProjectTransferArgs) {
  const lastAutosaveSignatureRef = useRef<string | null>(null);

  const projectSnapshotInput = useMemo(() => ({
    name: undefined as string | undefined,
    config,
    activePresetId,
    presetBlendDuration,
    sequenceLoopEnabled,
    presets,
    presetSequence,
    ui: {
      isPlaying,
      isPanelOpen,
      videoExportMode,
      videoDurationSeconds,
      videoFps,
      futureNativeSpecialistRouteControls,
    },
  }), [
    activePresetId,
    config,
    isPanelOpen,
    isPlaying,
    presetBlendDuration,
    presetSequence,
    presets,
    sequenceLoopEnabled,
    videoDurationSeconds,
    videoExportMode,
    videoFps,
    futureNativeSpecialistRouteControls,
  ]);

  const projectAutosaveSignature = useMemo(
    () => buildProjectAutosaveSignature(projectSnapshotInput),
    [projectSnapshotInput],
  );

  useEffect(() => {
    let cancelled = false;
    const cleanup = scheduleDeferredHydration(() => {
      void import('./projectStateManifest').then(({ buildProjectManifest }) => {
        if (cancelled) {
          return;
        }
        setProjectManifest(buildProjectManifest(config, presets, presetSequence, { futureNativeSpecialistRouteControls }));
      }).catch((error) => {
        console.warn('Failed to hydrate project manifest:', error);
      });
    }, isPanelOpen ? 650 : 1250);
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [config, futureNativeSpecialistRouteControls, isPanelOpen, presetSequence, presets]);

  useEffect(() => {
    if (isPublicLibraryMode) return;
    if (!isProjectAutosaveEnabled()) return;
    if (projectAutosaveSignature === lastAutosaveSignatureRef.current) return;
    let cancelled = false;
    const cleanup = scheduleDeferredHydration(() => {
      if (cancelled || projectAutosaveSignature === lastAutosaveSignatureRef.current) {
        return;
      }
      void Promise.all([import('./projectStateData'), import('./projectStateStorage')]).then(([{ buildProjectData }, { saveProjectData }]) => {
        if (cancelled) {
          return;
        }
        const payload = buildProjectData({
          ...projectSnapshotInput,
          name: 'Autosave Project',
        });
        saveProjectData(payload);
        lastAutosaveSignatureRef.current = projectAutosaveSignature;
      }).catch((error) => {
        console.warn('Project autosave failed:', error);
      });
    }, 900);
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [isPublicLibraryMode, projectAutosaveSignature, projectSnapshotInput]);

  const handleExportProject = useCallback(async () => {
    if (isPublicLibraryMode) {
      setProjectNotice({ tone: 'error', message: 'Project export is disabled in the public build.' });
      return;
    }

    try {
      const { buildProjectData } = await import('./projectStateData');
      const payload: ProjectData = buildProjectData({
        ...projectSnapshotInput,
        name: 'Workspace Project',
      });
      const blob = new Blob([serializeProjectData(payload)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = buildProjectExportFileName(payload.exportedAt);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      setProjectNotice({ tone: 'success', message: 'Project exported.' });
    } catch (error) {
      console.error('Project export failed:', error);
      setProjectNotice({ tone: 'error', message: 'Project export failed.' });
    }
  }, [isPublicLibraryMode, projectSnapshotInput, setProjectNotice]);

  const dismissProjectNotice = useCallback(() => setProjectNotice(null), [setProjectNotice]);

  return {
    dismissProjectNotice,
    handleExportProject,
  };
}
