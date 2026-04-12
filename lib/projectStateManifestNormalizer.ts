import type { ParticleConfig, PresetRecord, PresetSequenceItem, ProjectLayerSnapshot, ProjectManifest, ProjectUiState } from '../types';
import { PROJECT_MANIFEST_SCHEMA_VERSION, PROJECT_SERIALIZATION_SCHEMA_VERSION, isPlainObject, uniqueNonEmpty } from './projectStateShared';
import { buildProjectManifest } from './projectStateManifestBuilder';

export function normalizeProjectManifest(
  payload: unknown,
  config: ParticleConfig,
  presets: PresetRecord[],
  presetSequence: PresetSequenceItem[],
  ui?: Partial<ProjectUiState>,
): ProjectManifest {
  if (!isPlainObject(payload) || !Array.isArray(payload.layers) || !isPlainObject(payload.stats)) {
    return buildProjectManifest(config, presets, presetSequence, ui);
  }

  const manifestPayload = payload as Record<string, unknown>;
  const fallback = buildProjectManifest(config, presets, presetSequence, ui);
  const layers = fallback.layers.map((fallbackLayer) => {
    const manifestLayers = manifestPayload.layers as unknown[];
    const matched = manifestLayers.find((item) => isPlainObject(item) && item.key === fallbackLayer.key);
    if (!isPlainObject(matched)) return fallbackLayer;
    return {
      ...fallbackLayer,
      label: typeof matched.label === 'string' ? matched.label : fallbackLayer.label,
      enabled: typeof matched.enabled === 'boolean' ? matched.enabled : fallbackLayer.enabled,
      mode: typeof matched.mode === 'string' ? matched.mode : fallbackLayer.mode,
      source: typeof matched.source === 'string' ? matched.source : fallbackLayer.source,
      material: typeof matched.material === 'string' ? matched.material : fallbackLayer.material,
      geometry: typeof matched.geometry === 'string' ? matched.geometry : fallbackLayer.geometry,
      connectionStyle: typeof matched.connectionStyle === 'string' ? matched.connectionStyle : fallbackLayer.connectionStyle,
      features: Array.isArray(matched.features) ? uniqueNonEmpty(matched.features.map((item) => typeof item === 'string' ? item : null)) : fallbackLayer.features,
      capabilityFlags: Array.isArray(matched.capabilityFlags) ? uniqueNonEmpty(matched.capabilityFlags.map((item) => typeof item === 'string' ? item : null)) as ProjectLayerSnapshot['capabilityFlags'] : fallbackLayer.capabilityFlags,
    };
  });

  const execution = Array.isArray(manifestPayload.execution)
    ? fallback.execution.map((fallbackEntry) => {
      const matched = (manifestPayload.execution as unknown[]).find((item) => isPlainObject(item) && item.key === fallbackEntry.key);
      if (!isPlainObject(matched)) return fallbackEntry;
      return {
        ...fallbackEntry,
        label: typeof matched.label === 'string' ? matched.label : fallbackEntry.label,
        enabled: typeof matched.enabled === 'boolean' ? matched.enabled : fallbackEntry.enabled,
        mode: typeof matched.mode === 'string' ? matched.mode : fallbackEntry.mode,
        renderClass: typeof matched.renderClass === 'string' ? matched.renderClass : fallbackEntry.renderClass,
        simulationClass: typeof matched.simulationClass === 'string' ? matched.simulationClass : fallbackEntry.simulationClass,
        requestedEngine: typeof matched.requestedEngine === 'string' ? matched.requestedEngine : fallbackEntry.requestedEngine,
        resolvedEngine: typeof matched.resolvedEngine === 'string' ? matched.resolvedEngine : fallbackEntry.resolvedEngine,
        path: typeof matched.path === 'string' ? matched.path : fallbackEntry.path,
        overrideId: typeof matched.overrideId === 'string' ? matched.overrideId : fallbackEntry.overrideId,
        proceduralSystemId: (typeof matched.proceduralSystemId === 'string' || matched.proceduralSystemId === null)
          ? matched.proceduralSystemId as string | null
          : fallbackEntry.proceduralSystemId,
        hybridKind: (typeof matched.hybridKind === 'string' || matched.hybridKind === null)
          ? matched.hybridKind as string | null
          : fallbackEntry.hybridKind,
        futureNativeFamilyId: (typeof matched.futureNativeFamilyId === 'string' || matched.futureNativeFamilyId === null)
          ? matched.futureNativeFamilyId as string | null
          : fallbackEntry.futureNativeFamilyId,
        futureNativeBindingMode: (typeof matched.futureNativeBindingMode === 'string' || matched.futureNativeBindingMode === null)
          ? matched.futureNativeBindingMode as string | null
          : fallbackEntry.futureNativeBindingMode,
        futureNativePrimaryPresetId: (typeof matched.futureNativePrimaryPresetId === 'string' || matched.futureNativePrimaryPresetId === null)
          ? matched.futureNativePrimaryPresetId as string | null
          : fallbackEntry.futureNativePrimaryPresetId,
        futureNativeRecommendedPresetIds: Array.isArray(matched.futureNativeRecommendedPresetIds)
          ? uniqueNonEmpty(matched.futureNativeRecommendedPresetIds.map((item) => typeof item === 'string' ? item : null))
          : fallbackEntry.futureNativeRecommendedPresetIds,
        capabilityFlags: Array.isArray(matched.capabilityFlags) ? uniqueNonEmpty(matched.capabilityFlags.map((item) => typeof item === 'string' ? item : null)) as typeof fallbackEntry.capabilityFlags : fallbackEntry.capabilityFlags,
        reason: typeof matched.reason === 'string' ? matched.reason : fallbackEntry.reason,
        notes: Array.isArray(matched.notes) ? uniqueNonEmpty(matched.notes.map((item) => typeof item === 'string' ? item : null)) : fallbackEntry.notes,
        sceneBranches: Array.isArray(matched.sceneBranches) ? uniqueNonEmpty(matched.sceneBranches.map((item) => typeof item === 'string' ? item : null)) : fallbackEntry.sceneBranches,
      };
    })
    : fallback.execution;
  const futureNativeSpecialistPackets = Array.isArray(manifestPayload.futureNativeSpecialistPackets)
    ? manifestPayload.futureNativeSpecialistPackets
      .filter((item): item is Record<string, unknown> => isPlainObject(item))
      .map((item) => ({
        familyId: typeof item.familyId === 'string' ? item.familyId : '',
        title: typeof item.title === 'string' ? item.title : '',
        currentStage: typeof item.currentStage === 'string' ? item.currentStage : '',
        progressPercent: typeof item.progressPercent === 'number' ? item.progressPercent : 0,
        graphHint: typeof item.graphHint === 'string' ? item.graphHint : '',
        outputHint: typeof item.outputHint === 'string' ? item.outputHint : '',
        serializerBlockKey: typeof item.serializerBlockKey === 'string' ? item.serializerBlockKey : '',
        stageLabels: Array.isArray(item.stageLabels) ? uniqueNonEmpty(item.stageLabels.map((value) => typeof value === 'string' ? value : null)) : [],
        outputBridges: Array.isArray(item.outputBridges) ? uniqueNonEmpty(item.outputBridges.map((value) => typeof value === 'string' ? value : null)) : [],
        adapterMappingCount: typeof item.adapterMappingCount === 'number' ? item.adapterMappingCount : 0,
        runtimeConfigValues: Array.isArray(item.runtimeConfigValues) ? uniqueNonEmpty(item.runtimeConfigValues.map((value) => typeof value === 'string' ? value : null)) : [],
        nextTargets: Array.isArray(item.nextTargets) ? uniqueNonEmpty(item.nextTargets.map((value) => typeof value === 'string' ? value : null)) : [],
      }))
      .filter((item) => item.familyId.length > 0)
    : fallback.futureNativeSpecialistPackets;
  const futureNativeSpecialistRoutes = Array.isArray(manifestPayload.futureNativeSpecialistRoutes)
    ? manifestPayload.futureNativeSpecialistRoutes
      .filter((item): item is Record<string, unknown> => isPlainObject(item))
      .map((item) => ({
        familyId: typeof item.familyId === 'string' ? item.familyId : '',
        title: typeof item.title === 'string' ? item.title : '',
        currentStage: typeof item.currentStage === 'string' ? item.currentStage : '',
        progressPercent: typeof item.progressPercent === 'number' ? item.progressPercent : 0,
        routeId: typeof item.routeId === 'string' ? item.routeId : '',
        routeLabel: typeof item.routeLabel === 'string' ? item.routeLabel : '',
        executionTarget: typeof item.executionTarget === 'string' ? item.executionTarget : '',
        selectedAdapterId: typeof item.selectedAdapterId === 'string' ? item.selectedAdapterId : '',
        selectedAdapterLabel: typeof item.selectedAdapterLabel === 'string' ? item.selectedAdapterLabel : '',
        graphHint: typeof item.graphHint === 'string' ? item.graphHint : '',
        outputHint: typeof item.outputHint === 'string' ? item.outputHint : '',
        serializerBlockKey: typeof item.serializerBlockKey === 'string' ? item.serializerBlockKey : '',
        stageLabels: Array.isArray(item.stageLabels) ? uniqueNonEmpty(item.stageLabels.map((value) => typeof value === 'string' ? value : null)) : [],
        outputBridges: Array.isArray(item.outputBridges) ? uniqueNonEmpty(item.outputBridges.map((value) => typeof value === 'string' ? value : null)) : [],
        routingValues: Array.isArray(item.routingValues) ? uniqueNonEmpty(item.routingValues.map((value) => typeof value === 'string' ? value : null)) : [],
        adapterHandshakeValues: Array.isArray(item.adapterHandshakeValues) ? uniqueNonEmpty(item.adapterHandshakeValues.map((value) => typeof value === 'string' ? value : null)) : [],
        adapterBridgeSchemaValues: Array.isArray(item.adapterBridgeSchemaValues) ? uniqueNonEmpty(item.adapterBridgeSchemaValues.map((value) => typeof value === 'string' ? value : null)) : [],
        adapterSelectionValues: Array.isArray(item.adapterSelectionValues) ? uniqueNonEmpty(item.adapterSelectionValues.map((value) => typeof value === 'string' ? value : null)) : [],
        adapterTargetSwitchValues: Array.isArray(item.adapterTargetSwitchValues) ? uniqueNonEmpty(item.adapterTargetSwitchValues.map((value) => typeof value === 'string' ? value : null)) : [],
        routeTargetDeltaValues: Array.isArray(item.routeTargetDeltaValues) ? uniqueNonEmpty(item.routeTargetDeltaValues.map((value) => typeof value === 'string' ? value : null)) : [],
        adapterCapabilityDiffValues: Array.isArray(item.adapterCapabilityDiffValues) ? uniqueNonEmpty(item.adapterCapabilityDiffValues.map((value) => typeof value === 'string' ? value : null)) : [],
        adapterOverrideCandidates: Array.isArray(item.adapterOverrideCandidates) ? uniqueNonEmpty(item.adapterOverrideCandidates.map((value) => typeof value === 'string' ? value : null)) : [],
        adapterOverrideStateValues: Array.isArray(item.adapterOverrideStateValues) ? uniqueNonEmpty(item.adapterOverrideStateValues.map((value) => typeof value === 'string' ? value : null)) : [],
        fallbackReasonValues: Array.isArray(item.fallbackReasonValues) ? uniqueNonEmpty(item.fallbackReasonValues.map((value) => typeof value === 'string' ? value : null)) : [],
        overrideChangeHistoryValues: Array.isArray(item.overrideChangeHistoryValues) ? uniqueNonEmpty(item.overrideChangeHistoryValues.map((value) => typeof value === 'string' ? value : null)) : [],
        adapterFallbackHistoryValues: Array.isArray(item.adapterFallbackHistoryValues) ? uniqueNonEmpty(item.adapterFallbackHistoryValues.map((value) => typeof value === 'string' ? value : null)) : [],
        capabilityTrendDeltaValues: Array.isArray(item.capabilityTrendDeltaValues) ? uniqueNonEmpty(item.capabilityTrendDeltaValues.map((value) => typeof value === 'string' ? value : null)) : [],
        nextTargets: Array.isArray(item.nextTargets) ? uniqueNonEmpty(item.nextTargets.map((value) => typeof value === 'string' ? value : null)) : [],
      }))
      .filter((item) => item.familyId.length > 0 && item.routeId.length > 0)
    : fallback.futureNativeSpecialistRoutes;
  const distributionProofBundlesPayload = isPlainObject(manifestPayload.distributionProofBundles)
    ? manifestPayload.distributionProofBundles as Record<string, unknown>
    : null;
  const exportHandoffPayload = isPlainObject(manifestPayload.exportHandoff)
    ? manifestPayload.exportHandoff as Record<string, unknown>
    : null;
  const closeoutCurrentPayload = isPlainObject(manifestPayload.closeoutCurrent)
    ? manifestPayload.closeoutCurrent as Record<string, unknown>
    : null;
  const seedReplayPayload = isPlainObject(manifestPayload.seedReplay)
    ? manifestPayload.seedReplay as Record<string, unknown>
    : null;

  const coveragePayload = isPlainObject(manifestPayload.coverage) ? manifestPayload.coverage : {};
  const statsPayload = manifestPayload.stats as Record<string, unknown>;
  const audioLegacyRetirementPayload = isPlainObject(manifestPayload.audioLegacyRetirement)
    ? manifestPayload.audioLegacyRetirement as Record<string, unknown>
    : null;
  const audioLegacyCloseoutPayload = isPlainObject(manifestPayload.audioLegacyCloseout)
    ? manifestPayload.audioLegacyCloseout as Record<string, unknown>
    : null;
  const audioLegacyStoredQueuePreviewPayload = isPlainObject(manifestPayload.audioLegacyStoredQueuePreview)
    ? manifestPayload.audioLegacyStoredQueuePreview as Record<string, unknown>
    : null;
  const audioLegacyManualQueuePayload = isPlainObject(manifestPayload.audioLegacyManualQueue)
    ? manifestPayload.audioLegacyManualQueue as Record<string, unknown>
    : null;

  return {
    schemaVersion: typeof manifestPayload.schemaVersion === 'number' ? manifestPayload.schemaVersion : PROJECT_MANIFEST_SCHEMA_VERSION,
    serializationSchemaVersion: typeof manifestPayload.serializationSchemaVersion === 'number' ? manifestPayload.serializationSchemaVersion : PROJECT_SERIALIZATION_SCHEMA_VERSION,
    layers,
    execution,
    futureNativeSpecialistPackets,
    futureNativeSpecialistRoutes,
    distributionProofBundles: distributionProofBundlesPayload ? {
      generatedAt: typeof distributionProofBundlesPayload.generatedAt === 'string' ? distributionProofBundlesPayload.generatedAt : fallback.distributionProofBundles?.generatedAt ?? '',
      outputDir: typeof distributionProofBundlesPayload.outputDir === 'string' ? distributionProofBundlesPayload.outputDir : fallback.distributionProofBundles?.outputDir ?? '.artifacts',
      immediateResume: typeof distributionProofBundlesPayload.immediateResume === 'string' ? distributionProofBundlesPayload.immediateResume as NonNullable<ProjectManifest['distributionProofBundles']>['immediateResume'] : fallback.distributionProofBundles?.immediateResume ?? 'full-local-dev',
      lightweightHandoff: typeof distributionProofBundlesPayload.lightweightHandoff === 'string' ? distributionProofBundlesPayload.lightweightHandoff as NonNullable<ProjectManifest['distributionProofBundles']>['lightweightHandoff'] : fallback.distributionProofBundles?.lightweightHandoff ?? 'source-only-clean',
      verifyStatusOnly: typeof distributionProofBundlesPayload.verifyStatusOnly === 'string' ? distributionProofBundlesPayload.verifyStatusOnly as NonNullable<ProjectManifest['distributionProofBundles']>['verifyStatusOnly'] : fallback.distributionProofBundles?.verifyStatusOnly ?? 'proof-packet-verify-status',
      intelMacCloseoutOnly: typeof distributionProofBundlesPayload.intelMacCloseoutOnly === 'string' ? distributionProofBundlesPayload.intelMacCloseoutOnly as NonNullable<ProjectManifest['distributionProofBundles']>['intelMacCloseoutOnly'] : fallback.distributionProofBundles?.intelMacCloseoutOnly ?? 'proof-packet-intel-mac-closeout',
      total: typeof distributionProofBundlesPayload.total === 'number' ? distributionProofBundlesPayload.total : fallback.distributionProofBundles?.total ?? 0,
      resume: typeof distributionProofBundlesPayload.resume === 'number' ? distributionProofBundlesPayload.resume : fallback.distributionProofBundles?.resume ?? 0,
      proof: typeof distributionProofBundlesPayload.proof === 'number' ? distributionProofBundlesPayload.proof : fallback.distributionProofBundles?.proof ?? 0,
      bootstrapRequired: typeof distributionProofBundlesPayload.bootstrapRequired === 'number' ? distributionProofBundlesPayload.bootstrapRequired : fallback.distributionProofBundles?.bootstrapRequired ?? 0,
      intelMacFocused: typeof distributionProofBundlesPayload.intelMacFocused === 'number' ? distributionProofBundlesPayload.intelMacFocused : fallback.distributionProofBundles?.intelMacFocused ?? 0,
      bundleIds: Array.isArray(distributionProofBundlesPayload.bundleIds) ? uniqueNonEmpty(distributionProofBundlesPayload.bundleIds.map((value) => typeof value === 'string' ? value : null)) as NonNullable<ProjectManifest['distributionProofBundles']>['bundleIds'] : fallback.distributionProofBundles?.bundleIds ?? [],
    } : fallback.distributionProofBundles,
    exportHandoff: exportHandoffPayload ? {
      generatedAt: typeof exportHandoffPayload.generatedAt === 'string' ? exportHandoffPayload.generatedAt : fallback.exportHandoff?.generatedAt ?? '',
      routeCount: typeof exportHandoffPayload.routeCount === 'number' ? exportHandoffPayload.routeCount : fallback.exportHandoff?.routeCount ?? 0,
      warningFamilyCount: typeof exportHandoffPayload.warningFamilyCount === 'number' ? exportHandoffPayload.warningFamilyCount : fallback.exportHandoff?.warningFamilyCount ?? 0,
      specialistDriftCount: typeof exportHandoffPayload.specialistDriftCount === 'number' ? exportHandoffPayload.specialistDriftCount : fallback.exportHandoff?.specialistDriftCount ?? 0,
      specialistManifestDriftCount: typeof exportHandoffPayload.specialistManifestDriftCount === 'number' ? exportHandoffPayload.specialistManifestDriftCount : fallback.exportHandoff?.specialistManifestDriftCount ?? 0,
      bundleManifestDriftCount: typeof exportHandoffPayload.bundleManifestDriftCount === 'number' ? exportHandoffPayload.bundleManifestDriftCount : fallback.exportHandoff?.bundleManifestDriftCount ?? 0,
      webgpuDirectCount: typeof exportHandoffPayload.webgpuDirectCount === 'number' ? exportHandoffPayload.webgpuDirectCount : fallback.exportHandoff?.webgpuDirectCount ?? 0,
      webgpuLimitedCount: typeof exportHandoffPayload.webgpuLimitedCount === 'number' ? exportHandoffPayload.webgpuLimitedCount : fallback.exportHandoff?.webgpuLimitedCount ?? 0,
      webgpuFallbackOnlyCount: typeof exportHandoffPayload.webgpuFallbackOnlyCount === 'number' ? exportHandoffPayload.webgpuFallbackOnlyCount : fallback.exportHandoff?.webgpuFallbackOnlyCount ?? 0,
      intelMacVerdict: typeof exportHandoffPayload.intelMacVerdict === 'string' ? exportHandoffPayload.intelMacVerdict : fallback.exportHandoff?.intelMacVerdict ?? '',
      intelMacDropProgress: typeof exportHandoffPayload.intelMacDropProgress === 'string' ? exportHandoffPayload.intelMacDropProgress : fallback.exportHandoff?.intelMacDropProgress ?? '',
      intelMacTargetProgress: typeof exportHandoffPayload.intelMacTargetProgress === 'string' ? exportHandoffPayload.intelMacTargetProgress : fallback.exportHandoff?.intelMacTargetProgress ?? '',
      intelMacBlockerCount: typeof exportHandoffPayload.intelMacBlockerCount === 'number' ? exportHandoffPayload.intelMacBlockerCount : fallback.exportHandoff?.intelMacBlockerCount ?? 0,
      bundleImmediateResume: typeof exportHandoffPayload.bundleImmediateResume === 'string' ? exportHandoffPayload.bundleImmediateResume as NonNullable<ProjectManifest['exportHandoff']>['bundleImmediateResume'] : fallback.exportHandoff?.bundleImmediateResume ?? 'full-local-dev',
      bundleLightweightHandoff: typeof exportHandoffPayload.bundleLightweightHandoff === 'string' ? exportHandoffPayload.bundleLightweightHandoff as NonNullable<ProjectManifest['exportHandoff']>['bundleLightweightHandoff'] : fallback.exportHandoff?.bundleLightweightHandoff ?? 'source-only-clean',
      bundleVerifyStatusOnly: typeof exportHandoffPayload.bundleVerifyStatusOnly === 'string' ? exportHandoffPayload.bundleVerifyStatusOnly as NonNullable<ProjectManifest['exportHandoff']>['bundleVerifyStatusOnly'] : fallback.exportHandoff?.bundleVerifyStatusOnly ?? 'proof-packet-verify-status',
      bundleIntelMacCloseoutOnly: typeof exportHandoffPayload.bundleIntelMacCloseoutOnly === 'string' ? exportHandoffPayload.bundleIntelMacCloseoutOnly as NonNullable<ProjectManifest['exportHandoff']>['bundleIntelMacCloseoutOnly'] : fallback.exportHandoff?.bundleIntelMacCloseoutOnly ?? 'proof-packet-intel-mac-closeout',
    } : fallback.exportHandoff,
    closeoutCurrent: closeoutCurrentPayload ? {
      generatedAt: typeof closeoutCurrentPayload.generatedAt === 'string' ? closeoutCurrentPayload.generatedAt : fallback.closeoutCurrent?.generatedAt ?? '',
      repoReady: typeof closeoutCurrentPayload.repoReady === 'boolean' ? closeoutCurrentPayload.repoReady : fallback.closeoutCurrent?.repoReady ?? false,
      overallCompletionPercent: typeof closeoutCurrentPayload.overallCompletionPercent === 'number' ? closeoutCurrentPayload.overallCompletionPercent : fallback.closeoutCurrent?.overallCompletionPercent ?? 0,
      routeCount: typeof closeoutCurrentPayload.routeCount === 'number' ? closeoutCurrentPayload.routeCount : fallback.closeoutCurrent?.routeCount ?? 0,
      warningFamilyCount: typeof closeoutCurrentPayload.warningFamilyCount === 'number' ? closeoutCurrentPayload.warningFamilyCount : fallback.closeoutCurrent?.warningFamilyCount ?? 0,
      specialistDriftCount: typeof closeoutCurrentPayload.specialistDriftCount === 'number' ? closeoutCurrentPayload.specialistDriftCount : fallback.closeoutCurrent?.specialistDriftCount ?? 0,
      specialistManifestDriftCount: typeof closeoutCurrentPayload.specialistManifestDriftCount === 'number' ? closeoutCurrentPayload.specialistManifestDriftCount : fallback.closeoutCurrent?.specialistManifestDriftCount ?? 0,
      bundleManifestDriftCount: typeof closeoutCurrentPayload.bundleManifestDriftCount === 'number' ? closeoutCurrentPayload.bundleManifestDriftCount : fallback.closeoutCurrent?.bundleManifestDriftCount ?? 0,
      webgpuDirectCount: typeof closeoutCurrentPayload.webgpuDirectCount === 'number' ? closeoutCurrentPayload.webgpuDirectCount : fallback.closeoutCurrent?.webgpuDirectCount ?? 0,
      webgpuLimitedCount: typeof closeoutCurrentPayload.webgpuLimitedCount === 'number' ? closeoutCurrentPayload.webgpuLimitedCount : fallback.closeoutCurrent?.webgpuLimitedCount ?? 0,
      webgpuFallbackOnlyCount: typeof closeoutCurrentPayload.webgpuFallbackOnlyCount === 'number' ? closeoutCurrentPayload.webgpuFallbackOnlyCount : fallback.closeoutCurrent?.webgpuFallbackOnlyCount ?? 0,
      intelMacVerdict: typeof closeoutCurrentPayload.intelMacVerdict === 'string' ? closeoutCurrentPayload.intelMacVerdict : fallback.closeoutCurrent?.intelMacVerdict ?? '',
      intelMacReadyForRealCapture: typeof closeoutCurrentPayload.intelMacReadyForRealCapture === 'boolean' ? closeoutCurrentPayload.intelMacReadyForRealCapture : fallback.closeoutCurrent?.intelMacReadyForRealCapture ?? false,
      intelMacReadyForHostFinalize: typeof closeoutCurrentPayload.intelMacReadyForHostFinalize === 'boolean' ? closeoutCurrentPayload.intelMacReadyForHostFinalize : fallback.closeoutCurrent?.intelMacReadyForHostFinalize ?? false,
      intelMacDropProgress: typeof closeoutCurrentPayload.intelMacDropProgress === 'string' ? closeoutCurrentPayload.intelMacDropProgress : fallback.closeoutCurrent?.intelMacDropProgress ?? '',
      intelMacTargetProgress: typeof closeoutCurrentPayload.intelMacTargetProgress === 'string' ? closeoutCurrentPayload.intelMacTargetProgress : fallback.closeoutCurrent?.intelMacTargetProgress ?? '',
      intelMacBlockerCount: typeof closeoutCurrentPayload.intelMacBlockerCount === 'number' ? closeoutCurrentPayload.intelMacBlockerCount : fallback.closeoutCurrent?.intelMacBlockerCount ?? 0,
      recommendedResumeBundle: typeof closeoutCurrentPayload.recommendedResumeBundle === 'string' ? closeoutCurrentPayload.recommendedResumeBundle : fallback.closeoutCurrent?.recommendedResumeBundle ?? 'full-local-dev',
      recommendedProofBundle: typeof closeoutCurrentPayload.recommendedProofBundle === 'string' ? closeoutCurrentPayload.recommendedProofBundle : fallback.closeoutCurrent?.recommendedProofBundle ?? 'proof-packet-verify-status',
      recommendedIntelMacBundle: typeof closeoutCurrentPayload.recommendedIntelMacBundle === 'string' ? closeoutCurrentPayload.recommendedIntelMacBundle : fallback.closeoutCurrent?.recommendedIntelMacBundle ?? 'proof-packet-intel-mac-closeout',
      operatorCommand: typeof closeoutCurrentPayload.operatorCommand === 'string' ? closeoutCurrentPayload.operatorCommand : fallback.closeoutCurrent?.operatorCommand ?? '',
      intakeCommand: typeof closeoutCurrentPayload.intakeCommand === 'string' ? closeoutCurrentPayload.intakeCommand : fallback.closeoutCurrent?.intakeCommand ?? '',
    } : fallback.closeoutCurrent,
    seedReplay: seedReplayPayload ? {
      lockEnabled: typeof seedReplayPayload.lockEnabled === 'boolean' ? seedReplayPayload.lockEnabled : fallback.seedReplay?.lockEnabled ?? config.projectSeedLockEnabled,
      currentSeedValue: typeof seedReplayPayload.currentSeedValue === 'number' ? seedReplayPayload.currentSeedValue : fallback.seedReplay?.currentSeedValue ?? config.projectSeedValue,
      autoAdvance: typeof seedReplayPayload.autoAdvance === 'boolean' ? seedReplayPayload.autoAdvance : fallback.seedReplay?.autoAdvance ?? config.projectSeedAutoAdvance,
      step: typeof seedReplayPayload.step === 'number' ? seedReplayPayload.step : fallback.seedReplay?.step ?? config.projectSeedStep,
      lastAppliedSeed: typeof seedReplayPayload.lastAppliedSeed === 'number' ? seedReplayPayload.lastAppliedSeed : fallback.seedReplay?.lastAppliedSeed ?? config.projectSeedLastApplied,
      lastTriggerKind:
        seedReplayPayload.lastTriggerKind === 'preset-randomize'
        || seedReplayPayload.lastTriggerKind === 'audio-seed-mutation'
        || seedReplayPayload.lastTriggerKind === 'none'
          ? seedReplayPayload.lastTriggerKind
          : fallback.seedReplay?.lastTriggerKind ?? config.projectSeedLastTriggerKind,
      lastMutationScope:
        seedReplayPayload.lastMutationScope === 'motion'
        || seedReplayPayload.lastMutationScope === 'structure'
        || seedReplayPayload.lastMutationScope === 'surface'
        || seedReplayPayload.lastMutationScope === 'hybrid'
          ? seedReplayPayload.lastMutationScope
          : fallback.seedReplay?.lastMutationScope ?? config.projectSeedLastMutationScope,
      lastMutationIntensity: typeof seedReplayPayload.lastMutationIntensity === 'number' ? seedReplayPayload.lastMutationIntensity : fallback.seedReplay?.lastMutationIntensity ?? config.projectSeedLastMutationIntensity,
      lastRecordedAt: typeof seedReplayPayload.lastRecordedAt === 'string' ? seedReplayPayload.lastRecordedAt : fallback.seedReplay?.lastRecordedAt ?? config.projectSeedLastRecordedAt,
    } : fallback.seedReplay ?? {
      lockEnabled: config.projectSeedLockEnabled,
      currentSeedValue: config.projectSeedValue,
      autoAdvance: config.projectSeedAutoAdvance,
      step: config.projectSeedStep,
      lastAppliedSeed: config.projectSeedLastApplied,
      lastTriggerKind: config.projectSeedLastTriggerKind,
      lastMutationScope: config.projectSeedLastMutationScope,
      lastMutationIntensity: config.projectSeedLastMutationIntensity,
      lastRecordedAt: config.projectSeedLastRecordedAt,
    },
    audioLegacyRetirement: audioLegacyRetirementPayload ? {
      visibilityMode:
        audioLegacyRetirementPayload.visibilityMode === 'all'
        || audioLegacyRetirementPayload.visibilityMode === 'review-blocked'
        || audioLegacyRetirementPayload.visibilityMode === 'retired-safe'
          ? audioLegacyRetirementPayload.visibilityMode
          : fallback.audioLegacyRetirement?.visibilityMode ?? 'retired-safe',
      safeToDeprecateCount: typeof audioLegacyRetirementPayload.safeToDeprecateCount === 'number' ? audioLegacyRetirementPayload.safeToDeprecateCount : fallback.audioLegacyRetirement?.safeToDeprecateCount ?? 0,
      reviewBeforeDeprecateCount: typeof audioLegacyRetirementPayload.reviewBeforeDeprecateCount === 'number' ? audioLegacyRetirementPayload.reviewBeforeDeprecateCount : fallback.audioLegacyRetirement?.reviewBeforeDeprecateCount ?? 0,
      blockedDeprecationCount: typeof audioLegacyRetirementPayload.blockedDeprecationCount === 'number' ? audioLegacyRetirementPayload.blockedDeprecationCount : fallback.audioLegacyRetirement?.blockedDeprecationCount ?? 0,
      residualCount: typeof audioLegacyRetirementPayload.residualCount === 'number' ? audioLegacyRetirementPayload.residualCount : fallback.audioLegacyRetirement?.residualCount ?? 0,
      presetAffectedReviewCount: typeof audioLegacyRetirementPayload.presetAffectedReviewCount === 'number' ? audioLegacyRetirementPayload.presetAffectedReviewCount : fallback.audioLegacyRetirement?.presetAffectedReviewCount ?? 0,
      presetAffectedBlockedCount: typeof audioLegacyRetirementPayload.presetAffectedBlockedCount === 'number' ? audioLegacyRetirementPayload.presetAffectedBlockedCount : fallback.audioLegacyRetirement?.presetAffectedBlockedCount ?? 0,
      sequenceLinkedPresetReviewCount: typeof audioLegacyRetirementPayload.sequenceLinkedPresetReviewCount === 'number' ? audioLegacyRetirementPayload.sequenceLinkedPresetReviewCount : fallback.audioLegacyRetirement?.sequenceLinkedPresetReviewCount ?? 0,
      sequenceLinkedPresetBlockedCount: typeof audioLegacyRetirementPayload.sequenceLinkedPresetBlockedCount === 'number' ? audioLegacyRetirementPayload.sequenceLinkedPresetBlockedCount : fallback.audioLegacyRetirement?.sequenceLinkedPresetBlockedCount ?? 0,
      keyframeReviewCount: typeof audioLegacyRetirementPayload.keyframeReviewCount === 'number' ? audioLegacyRetirementPayload.keyframeReviewCount : fallback.audioLegacyRetirement?.keyframeReviewCount ?? 0,
      keyframeBlockedCount: typeof audioLegacyRetirementPayload.keyframeBlockedCount === 'number' ? audioLegacyRetirementPayload.keyframeBlockedCount : fallback.audioLegacyRetirement?.keyframeBlockedCount ?? 0,
      highestRiskLegacyIds: Array.isArray(audioLegacyRetirementPayload.highestRiskLegacyIds) ? uniqueNonEmpty(audioLegacyRetirementPayload.highestRiskLegacyIds.map((value) => typeof value === 'string' ? value : null)) : fallback.audioLegacyRetirement?.highestRiskLegacyIds ?? [],
      customConflictHotspotKeys: Array.isArray(audioLegacyRetirementPayload.customConflictHotspotKeys) ? uniqueNonEmpty(audioLegacyRetirementPayload.customConflictHotspotKeys.map((value) => typeof value === 'string' ? value : null)) : fallback.audioLegacyRetirement?.customConflictHotspotKeys ?? [],
    } : fallback.audioLegacyRetirement,
    audioLegacyCloseout: audioLegacyCloseoutPayload ? {
      status:
        audioLegacyCloseoutPayload.status === 'ready'
        || audioLegacyCloseoutPayload.status === 'watchlist'
        || audioLegacyCloseoutPayload.status === 'blocked'
          ? audioLegacyCloseoutPayload.status
          : fallback.audioLegacyCloseout?.status ?? 'watchlist',
      currentVisibilityMode:
        audioLegacyCloseoutPayload.currentVisibilityMode === 'all'
        || audioLegacyCloseoutPayload.currentVisibilityMode === 'review-blocked'
        || audioLegacyCloseoutPayload.currentVisibilityMode === 'retired-safe'
          ? audioLegacyCloseoutPayload.currentVisibilityMode
          : fallback.audioLegacyCloseout?.currentVisibilityMode ?? 'retired-safe',
      recommendedVisibilityMode:
        audioLegacyCloseoutPayload.recommendedVisibilityMode === 'review-blocked'
        || audioLegacyCloseoutPayload.recommendedVisibilityMode === 'retired-safe'
          ? audioLegacyCloseoutPayload.recommendedVisibilityMode
          : fallback.audioLegacyCloseout?.recommendedVisibilityMode ?? 'retired-safe',
      modeDrift: typeof audioLegacyCloseoutPayload.modeDrift === 'boolean' ? audioLegacyCloseoutPayload.modeDrift : fallback.audioLegacyCloseout?.modeDrift ?? false,
      safeToDeprecateCount: typeof audioLegacyCloseoutPayload.safeToDeprecateCount === 'number' ? audioLegacyCloseoutPayload.safeToDeprecateCount : fallback.audioLegacyCloseout?.safeToDeprecateCount ?? 0,
      currentReviewCount: typeof audioLegacyCloseoutPayload.currentReviewCount === 'number' ? audioLegacyCloseoutPayload.currentReviewCount : fallback.audioLegacyCloseout?.currentReviewCount ?? 0,
      currentBlockedCount: typeof audioLegacyCloseoutPayload.currentBlockedCount === 'number' ? audioLegacyCloseoutPayload.currentBlockedCount : fallback.audioLegacyCloseout?.currentBlockedCount ?? 0,
      currentResidualCount: typeof audioLegacyCloseoutPayload.currentResidualCount === 'number' ? audioLegacyCloseoutPayload.currentResidualCount : fallback.audioLegacyCloseout?.currentResidualCount ?? 0,
      storedReviewCount: typeof audioLegacyCloseoutPayload.storedReviewCount === 'number' ? audioLegacyCloseoutPayload.storedReviewCount : fallback.audioLegacyCloseout?.storedReviewCount ?? 0,
      storedBlockedCount: typeof audioLegacyCloseoutPayload.storedBlockedCount === 'number' ? audioLegacyCloseoutPayload.storedBlockedCount : fallback.audioLegacyCloseout?.storedBlockedCount ?? 0,
      highestRiskLegacyIds: Array.isArray(audioLegacyCloseoutPayload.highestRiskLegacyIds) ? uniqueNonEmpty(audioLegacyCloseoutPayload.highestRiskLegacyIds.map((value) => typeof value === 'string' ? value : null)) : fallback.audioLegacyCloseout?.highestRiskLegacyIds ?? [],
      requiresTargetHostProof: typeof audioLegacyCloseoutPayload.requiresTargetHostProof === 'boolean' ? audioLegacyCloseoutPayload.requiresTargetHostProof : fallback.audioLegacyCloseout?.requiresTargetHostProof ?? false,
      closeoutMessage: typeof audioLegacyCloseoutPayload.closeoutMessage === 'string' ? audioLegacyCloseoutPayload.closeoutMessage : fallback.audioLegacyCloseout?.closeoutMessage ?? '',
      nextStepLabel: typeof audioLegacyCloseoutPayload.nextStepLabel === 'string' ? audioLegacyCloseoutPayload.nextStepLabel : fallback.audioLegacyCloseout?.nextStepLabel ?? '',
    } : fallback.audioLegacyCloseout,
    audioLegacyStoredQueuePreview: audioLegacyStoredQueuePreviewPayload ? {
      limit: typeof audioLegacyStoredQueuePreviewPayload.limit === 'number' ? audioLegacyStoredQueuePreviewPayload.limit : fallback.audioLegacyStoredQueuePreview?.limit ?? 3,
      scope:
        audioLegacyStoredQueuePreviewPayload.scope === 'presets'
        || audioLegacyStoredQueuePreviewPayload.scope === 'keyframes'
        || audioLegacyStoredQueuePreviewPayload.scope === 'all'
          ? audioLegacyStoredQueuePreviewPayload.scope
          : fallback.audioLegacyStoredQueuePreview?.scope ?? 'all',
      profile: typeof audioLegacyStoredQueuePreviewPayload.profile === 'string' ? audioLegacyStoredQueuePreviewPayload.profile : fallback.audioLegacyStoredQueuePreview?.profile ?? 'align-residuals',
      keyCount: typeof audioLegacyStoredQueuePreviewPayload.keyCount === 'number' ? audioLegacyStoredQueuePreviewPayload.keyCount : fallback.audioLegacyStoredQueuePreview?.keyCount ?? 0,
      appliedKeyCount: typeof audioLegacyStoredQueuePreviewPayload.appliedKeyCount === 'number' ? audioLegacyStoredQueuePreviewPayload.appliedKeyCount : fallback.audioLegacyStoredQueuePreview?.appliedKeyCount ?? 0,
      presetUpdatedCount: typeof audioLegacyStoredQueuePreviewPayload.presetUpdatedCount === 'number' ? audioLegacyStoredQueuePreviewPayload.presetUpdatedCount : fallback.audioLegacyStoredQueuePreview?.presetUpdatedCount ?? 0,
      keyframeUpdatedCount: typeof audioLegacyStoredQueuePreviewPayload.keyframeUpdatedCount === 'number' ? audioLegacyStoredQueuePreviewPayload.keyframeUpdatedCount : fallback.audioLegacyStoredQueuePreview?.keyframeUpdatedCount ?? 0,
      totalUpdatedCount: typeof audioLegacyStoredQueuePreviewPayload.totalUpdatedCount === 'number' ? audioLegacyStoredQueuePreviewPayload.totalUpdatedCount : fallback.audioLegacyStoredQueuePreview?.totalUpdatedCount ?? 0,
      totalReviewDelta: typeof audioLegacyStoredQueuePreviewPayload.totalReviewDelta === 'number' ? audioLegacyStoredQueuePreviewPayload.totalReviewDelta : fallback.audioLegacyStoredQueuePreview?.totalReviewDelta ?? 0,
      totalBlockedDelta: typeof audioLegacyStoredQueuePreviewPayload.totalBlockedDelta === 'number' ? audioLegacyStoredQueuePreviewPayload.totalBlockedDelta : fallback.audioLegacyStoredQueuePreview?.totalBlockedDelta ?? 0,
      totalResidualDelta: typeof audioLegacyStoredQueuePreviewPayload.totalResidualDelta === 'number' ? audioLegacyStoredQueuePreviewPayload.totalResidualDelta : fallback.audioLegacyStoredQueuePreview?.totalResidualDelta ?? 0,
      beforePresetContextCount: typeof audioLegacyStoredQueuePreviewPayload.beforePresetContextCount === 'number' ? audioLegacyStoredQueuePreviewPayload.beforePresetContextCount : fallback.audioLegacyStoredQueuePreview?.beforePresetContextCount ?? 0,
      afterPresetContextCount: typeof audioLegacyStoredQueuePreviewPayload.afterPresetContextCount === 'number' ? audioLegacyStoredQueuePreviewPayload.afterPresetContextCount : fallback.audioLegacyStoredQueuePreview?.afterPresetContextCount ?? 0,
      beforeKeyframeContextCount: typeof audioLegacyStoredQueuePreviewPayload.beforeKeyframeContextCount === 'number' ? audioLegacyStoredQueuePreviewPayload.beforeKeyframeContextCount : fallback.audioLegacyStoredQueuePreview?.beforeKeyframeContextCount ?? 0,
      afterKeyframeContextCount: typeof audioLegacyStoredQueuePreviewPayload.afterKeyframeContextCount === 'number' ? audioLegacyStoredQueuePreviewPayload.afterKeyframeContextCount : fallback.audioLegacyStoredQueuePreview?.afterKeyframeContextCount ?? 0,
      beforeManualCustomChoiceCount: typeof audioLegacyStoredQueuePreviewPayload.beforeManualCustomChoiceCount === 'number' ? audioLegacyStoredQueuePreviewPayload.beforeManualCustomChoiceCount : fallback.audioLegacyStoredQueuePreview?.beforeManualCustomChoiceCount ?? 0,
      afterManualCustomChoiceCount: typeof audioLegacyStoredQueuePreviewPayload.afterManualCustomChoiceCount === 'number' ? audioLegacyStoredQueuePreviewPayload.afterManualCustomChoiceCount : fallback.audioLegacyStoredQueuePreview?.afterManualCustomChoiceCount ?? 0,
      beforeManualResidualMergeCount: typeof audioLegacyStoredQueuePreviewPayload.beforeManualResidualMergeCount === 'number' ? audioLegacyStoredQueuePreviewPayload.beforeManualResidualMergeCount : fallback.audioLegacyStoredQueuePreview?.beforeManualResidualMergeCount ?? 0,
      afterManualResidualMergeCount: typeof audioLegacyStoredQueuePreviewPayload.afterManualResidualMergeCount === 'number' ? audioLegacyStoredQueuePreviewPayload.afterManualResidualMergeCount : fallback.audioLegacyStoredQueuePreview?.afterManualResidualMergeCount ?? 0,
      previewKeys: Array.isArray(audioLegacyStoredQueuePreviewPayload.previewKeys) ? uniqueNonEmpty(audioLegacyStoredQueuePreviewPayload.previewKeys.map((value) => typeof value === 'string' ? value : null)) : fallback.audioLegacyStoredQueuePreview?.previewKeys ?? [],
      sampleUpdatedIds: Array.isArray(audioLegacyStoredQueuePreviewPayload.sampleUpdatedIds) ? uniqueNonEmpty(audioLegacyStoredQueuePreviewPayload.sampleUpdatedIds.map((value) => typeof value === 'string' ? value : null)) : fallback.audioLegacyStoredQueuePreview?.sampleUpdatedIds ?? [],
    } : fallback.audioLegacyStoredQueuePreview,
    audioLegacyManualQueue: audioLegacyManualQueuePayload ? {
      currentManualKeyCount: typeof audioLegacyManualQueuePayload.currentManualKeyCount === 'number' ? audioLegacyManualQueuePayload.currentManualKeyCount : fallback.audioLegacyManualQueue?.currentManualKeyCount ?? 0,
      storedManualKeyCount: typeof audioLegacyManualQueuePayload.storedManualKeyCount === 'number' ? audioLegacyManualQueuePayload.storedManualKeyCount : fallback.audioLegacyManualQueue?.storedManualKeyCount ?? 0,
      combinedKeyCount: typeof audioLegacyManualQueuePayload.combinedKeyCount === 'number' ? audioLegacyManualQueuePayload.combinedKeyCount : fallback.audioLegacyManualQueue?.combinedKeyCount ?? 0,
      currentManualCustomChoiceCount: typeof audioLegacyManualQueuePayload.currentManualCustomChoiceCount === 'number' ? audioLegacyManualQueuePayload.currentManualCustomChoiceCount : fallback.audioLegacyManualQueue?.currentManualCustomChoiceCount ?? 0,
      currentManualResidualMergeCount: typeof audioLegacyManualQueuePayload.currentManualResidualMergeCount === 'number' ? audioLegacyManualQueuePayload.currentManualResidualMergeCount : fallback.audioLegacyManualQueue?.currentManualResidualMergeCount ?? 0,
      storedManualCustomChoiceCount: typeof audioLegacyManualQueuePayload.storedManualCustomChoiceCount === 'number' ? audioLegacyManualQueuePayload.storedManualCustomChoiceCount : fallback.audioLegacyManualQueue?.storedManualCustomChoiceCount ?? 0,
      storedManualResidualMergeCount: typeof audioLegacyManualQueuePayload.storedManualResidualMergeCount === 'number' ? audioLegacyManualQueuePayload.storedManualResidualMergeCount : fallback.audioLegacyManualQueue?.storedManualResidualMergeCount ?? 0,
      storedPresetContextCount: typeof audioLegacyManualQueuePayload.storedPresetContextCount === 'number' ? audioLegacyManualQueuePayload.storedPresetContextCount : fallback.audioLegacyManualQueue?.storedPresetContextCount ?? 0,
      storedKeyframeContextCount: typeof audioLegacyManualQueuePayload.storedKeyframeContextCount === 'number' ? audioLegacyManualQueuePayload.storedKeyframeContextCount : fallback.audioLegacyManualQueue?.storedKeyframeContextCount ?? 0,
      currentHeadKeys: Array.isArray(audioLegacyManualQueuePayload.currentHeadKeys) ? uniqueNonEmpty(audioLegacyManualQueuePayload.currentHeadKeys.map((value) => typeof value === 'string' ? value : null)) : fallback.audioLegacyManualQueue?.currentHeadKeys ?? [],
      storedHeadKeys: Array.isArray(audioLegacyManualQueuePayload.storedHeadKeys) ? uniqueNonEmpty(audioLegacyManualQueuePayload.storedHeadKeys.map((value) => typeof value === 'string' ? value : null)) : fallback.audioLegacyManualQueue?.storedHeadKeys ?? [],
      combinedHeadKeys: Array.isArray(audioLegacyManualQueuePayload.combinedHeadKeys) ? uniqueNonEmpty(audioLegacyManualQueuePayload.combinedHeadKeys.map((value) => typeof value === 'string' ? value : null)) : fallback.audioLegacyManualQueue?.combinedHeadKeys ?? [],
    } : fallback.audioLegacyManualQueue,
    coverage: {
      depictionMethods: Array.isArray(coveragePayload.depictionMethods) ? uniqueNonEmpty(coveragePayload.depictionMethods.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.depictionMethods,
      motionFamilies: Array.isArray(coveragePayload.motionFamilies) ? uniqueNonEmpty(coveragePayload.motionFamilies.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.motionFamilies,
      computeBackends: Array.isArray(coveragePayload.computeBackends) ? uniqueNonEmpty(coveragePayload.computeBackends.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.computeBackends,
      sourceFamilies: Array.isArray(coveragePayload.sourceFamilies) ? uniqueNonEmpty(coveragePayload.sourceFamilies.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.sourceFamilies,
      renderFamilies: Array.isArray(coveragePayload.renderFamilies) ? uniqueNonEmpty(coveragePayload.renderFamilies.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.renderFamilies,
      postFamilies: Array.isArray(coveragePayload.postFamilies) ? uniqueNonEmpty(coveragePayload.postFamilies.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.postFamilies,
      solverFamilies: Array.isArray(coveragePayload.solverFamilies) ? uniqueNonEmpty(coveragePayload.solverFamilies.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.solverFamilies,
      specialistFamilies: Array.isArray(coveragePayload.specialistFamilies) ? uniqueNonEmpty(coveragePayload.specialistFamilies.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.specialistFamilies,
      physicalFamilies: Array.isArray(coveragePayload.physicalFamilies) ? uniqueNonEmpty(coveragePayload.physicalFamilies.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.physicalFamilies,
      geometryFamilies: Array.isArray(coveragePayload.geometryFamilies) ? uniqueNonEmpty(coveragePayload.geometryFamilies.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.geometryFamilies,
      temporalFamilies: Array.isArray(coveragePayload.temporalFamilies) ? uniqueNonEmpty(coveragePayload.temporalFamilies.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.temporalFamilies,
      productPackFamilies: Array.isArray(coveragePayload.productPackFamilies) ? uniqueNonEmpty(coveragePayload.productPackFamilies.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.productPackFamilies,
      productPacks: Array.isArray(coveragePayload.productPacks) ? uniqueNonEmpty(coveragePayload.productPacks.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.productPacks,
      postStackTemplates: Array.isArray(coveragePayload.postStackTemplates) ? uniqueNonEmpty(coveragePayload.postStackTemplates.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.postStackTemplates,
      activePostStackId: typeof coveragePayload.activePostStackId === 'string' ? coveragePayload.activePostStackId : fallback.coverage.activePostStackId,
      activeProductPackId: typeof coveragePayload.activeProductPackId === 'string' ? coveragePayload.activeProductPackId : fallback.coverage.activeProductPackId,
      gpgpuFeatures: Array.isArray(coveragePayload.gpgpuFeatures) ? uniqueNonEmpty(coveragePayload.gpgpuFeatures.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.gpgpuFeatures,
      gapTargets: Array.isArray(coveragePayload.gapTargets) ? uniqueNonEmpty(coveragePayload.gapTargets.map((item) => typeof item === 'string' ? item : null)) : fallback.coverage.gapTargets,
      productPackScorecards: Array.isArray(coveragePayload.productPackScorecards)
        ? coveragePayload.productPackScorecards
          .filter((item): item is Record<string, unknown> => isPlainObject(item))
          .map((item) => ({
            id: typeof item.id === 'string' ? item.id : '',
            label: typeof item.label === 'string' ? item.label : 'Unknown Pack',
            family: typeof item.family === 'string' ? item.family : 'unknown',
            coverageScore: typeof item.coverageScore === 'number' ? item.coverageScore : 0,
            targetHitCount: typeof item.targetHitCount === 'number' ? item.targetHitCount : 0,
            targetTotal: typeof item.targetTotal === 'number' ? item.targetTotal : 0,
            emphasis: Array.isArray(item.emphasis) ? uniqueNonEmpty(item.emphasis.map((value) => typeof value === 'string' ? value : null)) : [],
            solverFamilies: Array.isArray(item.solverFamilies) ? uniqueNonEmpty(item.solverFamilies.map((value) => typeof value === 'string' ? value : null)) : [],
            specialistFamilies: Array.isArray(item.specialistFamilies) ? uniqueNonEmpty(item.specialistFamilies.map((value) => typeof value === 'string' ? value : null)) : [],
            physicalFamilies: Array.isArray(item.physicalFamilies) ? uniqueNonEmpty(item.physicalFamilies.map((value) => typeof value === 'string' ? value : null)) : [],
            geometryFamilies: Array.isArray(item.geometryFamilies) ? uniqueNonEmpty(item.geometryFamilies.map((value) => typeof value === 'string' ? value : null)) : [],
            temporalFamilies: Array.isArray(item.temporalFamilies) ? uniqueNonEmpty(item.temporalFamilies.map((value) => typeof value === 'string' ? value : null)) : [],
            missingTargets: Array.isArray(item.missingTargets) ? uniqueNonEmpty(item.missingTargets.map((value) => typeof value === 'string' ? value : null)) : [],
          }))
          .filter((item) => item.id.length > 0)
        : fallback.coverage.productPackScorecards,
      coverageRollup: isPlainObject(coveragePayload.coverageRollup)
        ? {
          coverageScore: typeof coveragePayload.coverageRollup.coverageScore === 'number' ? coveragePayload.coverageRollup.coverageScore : fallback.coverage.coverageRollup.coverageScore,
          targetHitCount: typeof coveragePayload.coverageRollup.targetHitCount === 'number' ? coveragePayload.coverageRollup.targetHitCount : fallback.coverage.coverageRollup.targetHitCount,
          targetTotal: typeof coveragePayload.coverageRollup.targetTotal === 'number' ? coveragePayload.coverageRollup.targetTotal : fallback.coverage.coverageRollup.targetTotal,
          averagePackCoverageScore: typeof coveragePayload.coverageRollup.averagePackCoverageScore === 'number' ? coveragePayload.coverageRollup.averagePackCoverageScore : fallback.coverage.coverageRollup.averagePackCoverageScore,
          bestPackId: typeof coveragePayload.coverageRollup.bestPackId === 'string' ? coveragePayload.coverageRollup.bestPackId : fallback.coverage.coverageRollup.bestPackId,
          bestPackLabel: typeof coveragePayload.coverageRollup.bestPackLabel === 'string' ? coveragePayload.coverageRollup.bestPackLabel : fallback.coverage.coverageRollup.bestPackLabel,
          bestPackCoverageScore: typeof coveragePayload.coverageRollup.bestPackCoverageScore === 'number' ? coveragePayload.coverageRollup.bestPackCoverageScore : fallback.coverage.coverageRollup.bestPackCoverageScore,
          sourceAxis: isPlainObject(coveragePayload.coverageRollup.sourceAxis) ? {
            covered: Array.isArray(coveragePayload.coverageRollup.sourceAxis.covered) ? uniqueNonEmpty(coveragePayload.coverageRollup.sourceAxis.covered.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.sourceAxis.covered,
            missing: Array.isArray(coveragePayload.coverageRollup.sourceAxis.missing) ? uniqueNonEmpty(coveragePayload.coverageRollup.sourceAxis.missing.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.sourceAxis.missing,
            hitCount: typeof coveragePayload.coverageRollup.sourceAxis.hitCount === 'number' ? coveragePayload.coverageRollup.sourceAxis.hitCount : fallback.coverage.coverageRollup.sourceAxis.hitCount,
            targetCount: typeof coveragePayload.coverageRollup.sourceAxis.targetCount === 'number' ? coveragePayload.coverageRollup.sourceAxis.targetCount : fallback.coverage.coverageRollup.sourceAxis.targetCount,
            ratio: typeof coveragePayload.coverageRollup.sourceAxis.ratio === 'number' ? coveragePayload.coverageRollup.sourceAxis.ratio : fallback.coverage.coverageRollup.sourceAxis.ratio,
          } : fallback.coverage.coverageRollup.sourceAxis,
          renderAxis: isPlainObject(coveragePayload.coverageRollup.renderAxis) ? {
            covered: Array.isArray(coveragePayload.coverageRollup.renderAxis.covered) ? uniqueNonEmpty(coveragePayload.coverageRollup.renderAxis.covered.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.renderAxis.covered,
            missing: Array.isArray(coveragePayload.coverageRollup.renderAxis.missing) ? uniqueNonEmpty(coveragePayload.coverageRollup.renderAxis.missing.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.renderAxis.missing,
            hitCount: typeof coveragePayload.coverageRollup.renderAxis.hitCount === 'number' ? coveragePayload.coverageRollup.renderAxis.hitCount : fallback.coverage.coverageRollup.renderAxis.hitCount,
            targetCount: typeof coveragePayload.coverageRollup.renderAxis.targetCount === 'number' ? coveragePayload.coverageRollup.renderAxis.targetCount : fallback.coverage.coverageRollup.renderAxis.targetCount,
            ratio: typeof coveragePayload.coverageRollup.renderAxis.ratio === 'number' ? coveragePayload.coverageRollup.renderAxis.ratio : fallback.coverage.coverageRollup.renderAxis.ratio,
          } : fallback.coverage.coverageRollup.renderAxis,
          postAxis: isPlainObject(coveragePayload.coverageRollup.postAxis) ? {
            covered: Array.isArray(coveragePayload.coverageRollup.postAxis.covered) ? uniqueNonEmpty(coveragePayload.coverageRollup.postAxis.covered.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.postAxis.covered,
            missing: Array.isArray(coveragePayload.coverageRollup.postAxis.missing) ? uniqueNonEmpty(coveragePayload.coverageRollup.postAxis.missing.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.postAxis.missing,
            hitCount: typeof coveragePayload.coverageRollup.postAxis.hitCount === 'number' ? coveragePayload.coverageRollup.postAxis.hitCount : fallback.coverage.coverageRollup.postAxis.hitCount,
            targetCount: typeof coveragePayload.coverageRollup.postAxis.targetCount === 'number' ? coveragePayload.coverageRollup.postAxis.targetCount : fallback.coverage.coverageRollup.postAxis.targetCount,
            ratio: typeof coveragePayload.coverageRollup.postAxis.ratio === 'number' ? coveragePayload.coverageRollup.postAxis.ratio : fallback.coverage.coverageRollup.postAxis.ratio,
          } : fallback.coverage.coverageRollup.postAxis,
          computeAxis: isPlainObject(coveragePayload.coverageRollup.computeAxis) ? {
            covered: Array.isArray(coveragePayload.coverageRollup.computeAxis.covered) ? uniqueNonEmpty(coveragePayload.coverageRollup.computeAxis.covered.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.computeAxis.covered,
            missing: Array.isArray(coveragePayload.coverageRollup.computeAxis.missing) ? uniqueNonEmpty(coveragePayload.coverageRollup.computeAxis.missing.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.computeAxis.missing,
            hitCount: typeof coveragePayload.coverageRollup.computeAxis.hitCount === 'number' ? coveragePayload.coverageRollup.computeAxis.hitCount : fallback.coverage.coverageRollup.computeAxis.hitCount,
            targetCount: typeof coveragePayload.coverageRollup.computeAxis.targetCount === 'number' ? coveragePayload.coverageRollup.computeAxis.targetCount : fallback.coverage.coverageRollup.computeAxis.targetCount,
            ratio: typeof coveragePayload.coverageRollup.computeAxis.ratio === 'number' ? coveragePayload.coverageRollup.computeAxis.ratio : fallback.coverage.coverageRollup.computeAxis.ratio,
          } : fallback.coverage.coverageRollup.computeAxis,
          motionAxis: isPlainObject(coveragePayload.coverageRollup.motionAxis) ? {
            covered: Array.isArray(coveragePayload.coverageRollup.motionAxis.covered) ? uniqueNonEmpty(coveragePayload.coverageRollup.motionAxis.covered.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.motionAxis.covered,
            missing: Array.isArray(coveragePayload.coverageRollup.motionAxis.missing) ? uniqueNonEmpty(coveragePayload.coverageRollup.motionAxis.missing.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.motionAxis.missing,
            hitCount: typeof coveragePayload.coverageRollup.motionAxis.hitCount === 'number' ? coveragePayload.coverageRollup.motionAxis.hitCount : fallback.coverage.coverageRollup.motionAxis.hitCount,
            targetCount: typeof coveragePayload.coverageRollup.motionAxis.targetCount === 'number' ? coveragePayload.coverageRollup.motionAxis.targetCount : fallback.coverage.coverageRollup.motionAxis.targetCount,
            ratio: typeof coveragePayload.coverageRollup.motionAxis.ratio === 'number' ? coveragePayload.coverageRollup.motionAxis.ratio : fallback.coverage.coverageRollup.motionAxis.ratio,
          } : fallback.coverage.coverageRollup.motionAxis,
          solverAxis: isPlainObject(coveragePayload.coverageRollup.solverAxis) ? {
            covered: Array.isArray(coveragePayload.coverageRollup.solverAxis.covered) ? uniqueNonEmpty(coveragePayload.coverageRollup.solverAxis.covered.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.solverAxis.covered,
            missing: Array.isArray(coveragePayload.coverageRollup.solverAxis.missing) ? uniqueNonEmpty(coveragePayload.coverageRollup.solverAxis.missing.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.solverAxis.missing,
            hitCount: typeof coveragePayload.coverageRollup.solverAxis.hitCount === 'number' ? coveragePayload.coverageRollup.solverAxis.hitCount : fallback.coverage.coverageRollup.solverAxis.hitCount,
            targetCount: typeof coveragePayload.coverageRollup.solverAxis.targetCount === 'number' ? coveragePayload.coverageRollup.solverAxis.targetCount : fallback.coverage.coverageRollup.solverAxis.targetCount,
            ratio: typeof coveragePayload.coverageRollup.solverAxis.ratio === 'number' ? coveragePayload.coverageRollup.solverAxis.ratio : fallback.coverage.coverageRollup.solverAxis.ratio,
          } : fallback.coverage.coverageRollup.solverAxis,
          specialistAxis: isPlainObject(coveragePayload.coverageRollup.specialistAxis) ? {
            covered: Array.isArray(coveragePayload.coverageRollup.specialistAxis.covered) ? uniqueNonEmpty(coveragePayload.coverageRollup.specialistAxis.covered.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.specialistAxis.covered,
            missing: Array.isArray(coveragePayload.coverageRollup.specialistAxis.missing) ? uniqueNonEmpty(coveragePayload.coverageRollup.specialistAxis.missing.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.specialistAxis.missing,
            hitCount: typeof coveragePayload.coverageRollup.specialistAxis.hitCount === 'number' ? coveragePayload.coverageRollup.specialistAxis.hitCount : fallback.coverage.coverageRollup.specialistAxis.hitCount,
            targetCount: typeof coveragePayload.coverageRollup.specialistAxis.targetCount === 'number' ? coveragePayload.coverageRollup.specialistAxis.targetCount : fallback.coverage.coverageRollup.specialistAxis.targetCount,
            ratio: typeof coveragePayload.coverageRollup.specialistAxis.ratio === 'number' ? coveragePayload.coverageRollup.specialistAxis.ratio : fallback.coverage.coverageRollup.specialistAxis.ratio,
          } : fallback.coverage.coverageRollup.specialistAxis,
          physicalAxis: isPlainObject(coveragePayload.coverageRollup.physicalAxis) ? {
            covered: Array.isArray(coveragePayload.coverageRollup.physicalAxis.covered) ? uniqueNonEmpty(coveragePayload.coverageRollup.physicalAxis.covered.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.physicalAxis.covered,
            missing: Array.isArray(coveragePayload.coverageRollup.physicalAxis.missing) ? uniqueNonEmpty(coveragePayload.coverageRollup.physicalAxis.missing.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.physicalAxis.missing,
            hitCount: typeof coveragePayload.coverageRollup.physicalAxis.hitCount === 'number' ? coveragePayload.coverageRollup.physicalAxis.hitCount : fallback.coverage.coverageRollup.physicalAxis.hitCount,
            targetCount: typeof coveragePayload.coverageRollup.physicalAxis.targetCount === 'number' ? coveragePayload.coverageRollup.physicalAxis.targetCount : fallback.coverage.coverageRollup.physicalAxis.targetCount,
            ratio: typeof coveragePayload.coverageRollup.physicalAxis.ratio === 'number' ? coveragePayload.coverageRollup.physicalAxis.ratio : fallback.coverage.coverageRollup.physicalAxis.ratio,
          } : fallback.coverage.coverageRollup.physicalAxis,
          geometryAxis: isPlainObject(coveragePayload.coverageRollup.geometryAxis) ? {
            covered: Array.isArray(coveragePayload.coverageRollup.geometryAxis.covered) ? uniqueNonEmpty(coveragePayload.coverageRollup.geometryAxis.covered.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.geometryAxis.covered,
            missing: Array.isArray(coveragePayload.coverageRollup.geometryAxis.missing) ? uniqueNonEmpty(coveragePayload.coverageRollup.geometryAxis.missing.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.geometryAxis.missing,
            hitCount: typeof coveragePayload.coverageRollup.geometryAxis.hitCount === 'number' ? coveragePayload.coverageRollup.geometryAxis.hitCount : fallback.coverage.coverageRollup.geometryAxis.hitCount,
            targetCount: typeof coveragePayload.coverageRollup.geometryAxis.targetCount === 'number' ? coveragePayload.coverageRollup.geometryAxis.targetCount : fallback.coverage.coverageRollup.geometryAxis.targetCount,
            ratio: typeof coveragePayload.coverageRollup.geometryAxis.ratio === 'number' ? coveragePayload.coverageRollup.geometryAxis.ratio : fallback.coverage.coverageRollup.geometryAxis.ratio,
          } : fallback.coverage.coverageRollup.geometryAxis,
          temporalAxis: isPlainObject(coveragePayload.coverageRollup.temporalAxis) ? {
            covered: Array.isArray(coveragePayload.coverageRollup.temporalAxis.covered) ? uniqueNonEmpty(coveragePayload.coverageRollup.temporalAxis.covered.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.temporalAxis.covered,
            missing: Array.isArray(coveragePayload.coverageRollup.temporalAxis.missing) ? uniqueNonEmpty(coveragePayload.coverageRollup.temporalAxis.missing.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.temporalAxis.missing,
            hitCount: typeof coveragePayload.coverageRollup.temporalAxis.hitCount === 'number' ? coveragePayload.coverageRollup.temporalAxis.hitCount : fallback.coverage.coverageRollup.temporalAxis.hitCount,
            targetCount: typeof coveragePayload.coverageRollup.temporalAxis.targetCount === 'number' ? coveragePayload.coverageRollup.temporalAxis.targetCount : fallback.coverage.coverageRollup.temporalAxis.targetCount,
            ratio: typeof coveragePayload.coverageRollup.temporalAxis.ratio === 'number' ? coveragePayload.coverageRollup.temporalAxis.ratio : fallback.coverage.coverageRollup.temporalAxis.ratio,
          } : fallback.coverage.coverageRollup.temporalAxis,
          missingTargets: Array.isArray(coveragePayload.coverageRollup.missingTargets) ? uniqueNonEmpty(coveragePayload.coverageRollup.missingTargets.map((value) => typeof value === 'string' ? value : null)) : fallback.coverage.coverageRollup.missingTargets,
        }
        : fallback.coverage.coverageRollup,
      augmentationSuggestions: Array.isArray(coveragePayload.augmentationSuggestions)
        ? coveragePayload.augmentationSuggestions
          .filter((item): item is Record<string, unknown> => isPlainObject(item))
          .map((item) => ({
            id: typeof item.id === 'string' ? item.id : '',
            label: typeof item.label === 'string' ? item.label : 'Unknown Pack',
            family: typeof item.family === 'string' ? item.family : 'unknown',
            coverageGain: typeof item.coverageGain === 'number' ? item.coverageGain : 0,
            resultCoverageScore: typeof item.resultCoverageScore === 'number' ? item.resultCoverageScore : 0,
            resultTargetHitCount: typeof item.resultTargetHitCount === 'number' ? item.resultTargetHitCount : 0,
            coveredGapTargets: Array.isArray(item.coveredGapTargets) ? uniqueNonEmpty(item.coveredGapTargets.map((value) => typeof value === 'string' ? value : null)) : [],
          }))
          .filter((item) => item.id.length > 0)
        : fallback.coverage.augmentationSuggestions,
    },
    stats: {
      presetCount: typeof statsPayload.presetCount === 'number' ? statsPayload.presetCount : fallback.stats.presetCount,
      sequenceCount: typeof statsPayload.sequenceCount === 'number' ? statsPayload.sequenceCount : fallback.stats.sequenceCount,
      enabledLayerCount: typeof statsPayload.enabledLayerCount === 'number' ? statsPayload.enabledLayerCount : fallback.stats.enabledLayerCount,
      mediaSourceCount: typeof statsPayload.mediaSourceCount === 'number' ? statsPayload.mediaSourceCount : fallback.stats.mediaSourceCount,
      textSourceCount: typeof statsPayload.textSourceCount === 'number' ? statsPayload.textSourceCount : fallback.stats.textSourceCount,
      proceduralModeCount: typeof statsPayload.proceduralModeCount === 'number' ? statsPayload.proceduralModeCount : fallback.stats.proceduralModeCount,
      distinctMaterialCount: typeof statsPayload.distinctMaterialCount === 'number' ? statsPayload.distinctMaterialCount : fallback.stats.distinctMaterialCount,
      depictionMethodCount: typeof statsPayload.depictionMethodCount === 'number' ? statsPayload.depictionMethodCount : fallback.stats.depictionMethodCount,
      motionFamilyCount: typeof statsPayload.motionFamilyCount === 'number' ? statsPayload.motionFamilyCount : fallback.stats.motionFamilyCount,
      computeBackendCount: typeof statsPayload.computeBackendCount === 'number' ? statsPayload.computeBackendCount : fallback.stats.computeBackendCount,
      sourceFamilyCount: typeof statsPayload.sourceFamilyCount === 'number' ? statsPayload.sourceFamilyCount : fallback.stats.sourceFamilyCount,
      renderFamilyCount: typeof statsPayload.renderFamilyCount === 'number' ? statsPayload.renderFamilyCount : fallback.stats.renderFamilyCount,
      postFamilyCount: typeof statsPayload.postFamilyCount === 'number' ? statsPayload.postFamilyCount : fallback.stats.postFamilyCount,
      solverFamilyCount: typeof statsPayload.solverFamilyCount === 'number' ? statsPayload.solverFamilyCount : fallback.stats.solverFamilyCount,
      specialistFamilyCount: typeof statsPayload.specialistFamilyCount === 'number' ? statsPayload.specialistFamilyCount : fallback.stats.specialistFamilyCount,
      physicalFamilyCount: typeof statsPayload.physicalFamilyCount === 'number' ? statsPayload.physicalFamilyCount : fallback.stats.physicalFamilyCount,
      geometryFamilyCount: typeof statsPayload.geometryFamilyCount === 'number' ? statsPayload.geometryFamilyCount : fallback.stats.geometryFamilyCount,
      temporalFamilyCount: typeof statsPayload.temporalFamilyCount === 'number' ? statsPayload.temporalFamilyCount : fallback.stats.temporalFamilyCount,
      productPackFamilyCount: typeof statsPayload.productPackFamilyCount === 'number' ? statsPayload.productPackFamilyCount : fallback.stats.productPackFamilyCount,
      productPackCount: typeof statsPayload.productPackCount === 'number' ? statsPayload.productPackCount : fallback.stats.productPackCount,
      postStackTemplateCount: typeof statsPayload.postStackTemplateCount === 'number' ? statsPayload.postStackTemplateCount : fallback.stats.postStackTemplateCount,
      gpgpuFeatureCount: typeof statsPayload.gpgpuFeatureCount === 'number' ? statsPayload.gpgpuFeatureCount : fallback.stats.gpgpuFeatureCount,
      coverageGapCount: typeof statsPayload.coverageGapCount === 'number' ? statsPayload.coverageGapCount : fallback.stats.coverageGapCount,
      productPackScorecardCount: typeof statsPayload.productPackScorecardCount === 'number' ? statsPayload.productPackScorecardCount : fallback.stats.productPackScorecardCount,
      activeProductPackCoverageScore: typeof statsPayload.activeProductPackCoverageScore === 'number' ? statsPayload.activeProductPackCoverageScore : fallback.stats.activeProductPackCoverageScore,
      currentCoverageScore: typeof statsPayload.currentCoverageScore === 'number' ? statsPayload.currentCoverageScore : fallback.stats.currentCoverageScore,
      currentTargetHitCount: typeof statsPayload.currentTargetHitCount === 'number' ? statsPayload.currentTargetHitCount : fallback.stats.currentTargetHitCount,
      currentTargetTotal: typeof statsPayload.currentTargetTotal === 'number' ? statsPayload.currentTargetTotal : fallback.stats.currentTargetTotal,
      overallCoverageScore: typeof statsPayload.overallCoverageScore === 'number' ? statsPayload.overallCoverageScore : fallback.stats.overallCoverageScore,
      overallTargetHitCount: typeof statsPayload.overallTargetHitCount === 'number' ? statsPayload.overallTargetHitCount : fallback.stats.overallTargetHitCount,
      overallTargetTotal: typeof statsPayload.overallTargetTotal === 'number' ? statsPayload.overallTargetTotal : fallback.stats.overallTargetTotal,
      averagePackCoverageScore: typeof statsPayload.averagePackCoverageScore === 'number' ? statsPayload.averagePackCoverageScore : fallback.stats.averagePackCoverageScore,
      bestPackCoverageScore: typeof statsPayload.bestPackCoverageScore === 'number' ? statsPayload.bestPackCoverageScore : fallback.stats.bestPackCoverageScore,
      augmentationSuggestionCount: typeof statsPayload.augmentationSuggestionCount === 'number' ? statsPayload.augmentationSuggestionCount : fallback.stats.augmentationSuggestionCount,
    },
  };
}
