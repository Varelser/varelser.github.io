import type { ParticleConfig } from './config';
import type { PresetRecord } from './presets';
import type { PresetSequenceItem } from './sequence';

export type ProjectLayerSnapshotKey = 'layer1' | 'layer2' | 'layer3' | 'gpgpu';
export type ProjectCapabilityFlag = 'webgl-stable' | 'webgpu-preferred' | 'export-only' | 'mobile-risky';
export type ProjectFutureNativeVolumetricAuthoringKey = 'layer2' | 'layer3';

export interface ProjectFutureNativeVolumetricAuthoringEntryBase {
  key: ProjectFutureNativeVolumetricAuthoringKey;
  mode: string;
  familyId: string;
  bindingMode: string;
  primaryPresetId: string | null;
  recommendedPresetIds: string[];
  runtimeConfigValues: string[];
}

export type ProjectFutureNativeVolumetricAuthoringEntry = ProjectFutureNativeVolumetricAuthoringEntryBase;
export type ProjectFutureNativeSmokeAuthoringEntry = ProjectFutureNativeVolumetricAuthoringEntryBase;
export type ProjectFutureNativeAdvectionAuthoringEntry = ProjectFutureNativeVolumetricAuthoringEntryBase;
export type ProjectFutureNativePressureAuthoringEntry = ProjectFutureNativeVolumetricAuthoringEntryBase;
export type ProjectFutureNativeLightShadowAuthoringEntry = ProjectFutureNativeVolumetricAuthoringEntryBase;

export interface ProjectFutureNativeSpecialistPacketEntry {
  familyId: string;
  title: string;
  currentStage: string;
  progressPercent: number;
  graphHint: string;
  outputHint: string;
  serializerBlockKey: string;
  stageLabels: string[];
  outputBridges: string[];
  adapterMappingCount: number;
  runtimeConfigValues: string[];
  nextTargets: string[];
}

export interface ProjectFutureNativeSpecialistRouteEntry {
  familyId: string;
  title: string;
  currentStage: string;
  progressPercent: number;
  routeId: string;
  routeLabel: string;
  executionTarget: string;
  selectedAdapterId: string;
  selectedAdapterLabel: string;
  graphHint: string;
  outputHint: string;
  serializerBlockKey: string;
  stageLabels: string[];
  outputBridges: string[];
  routingValues: string[];
  adapterHandshakeValues: string[];
  adapterBridgeSchemaValues: string[];
  adapterSelectionValues: string[];
  adapterTargetSwitchValues: string[];
  routeTargetDeltaValues: string[];
  adapterCapabilityDiffValues: string[];
  adapterOverrideCandidates: string[];
  adapterOverrideStateValues: string[];
  fallbackReasonValues: string[];
  overrideChangeHistoryValues: string[];
  adapterFallbackHistoryValues: string[];
  capabilityTrendDeltaValues: string[];
  nextTargets: string[];
}

export type ProjectFutureNativeSpecialistRouteControlMode = 'auto' | 'manual';
export type ProjectFutureNativeSpecialistRouteOverrideDisposition = 'advisory' | 'pinned';

export interface ProjectFutureNativeSpecialistRouteControlEntry {
  familyId: string;
  selectedAdapterId: string;
  selectedExecutionTarget: string;
  overrideMode: ProjectFutureNativeSpecialistRouteControlMode;
  overrideCandidateId: string;
  overrideDisposition: ProjectFutureNativeSpecialistRouteOverrideDisposition;
}

export interface ProjectFutureNativeVolumetricAuthoringStateSet {
  futureNativeSmokeAuthoring?: ProjectFutureNativeSmokeAuthoringEntry[];
  futureNativeAdvectionAuthoring?: ProjectFutureNativeAdvectionAuthoringEntry[];
  futureNativePressureAuthoring?: ProjectFutureNativePressureAuthoringEntry[];
  futureNativeLightShadowAuthoring?: ProjectFutureNativeLightShadowAuthoringEntry[];
}

export interface ProjectFutureNativeSpecialistPacketStateSet {
  futureNativeSpecialistPackets?: ProjectFutureNativeSpecialistPacketEntry[];
}

export interface ProjectFutureNativeSpecialistRouteControlStateSet {
  futureNativeSpecialistRouteControls?: ProjectFutureNativeSpecialistRouteControlEntry[];
}

export interface ProjectUiState extends ProjectFutureNativeVolumetricAuthoringStateSet, ProjectFutureNativeSpecialistPacketStateSet, ProjectFutureNativeSpecialistRouteControlStateSet {
  isPlaying: boolean;
  isPanelOpen: boolean;
  videoExportMode: 'current' | 'sequence';
  videoDurationSeconds: number;
  videoFps: number;
}

export interface ProjectSerializationBlock {
  id: string;
  label: string;
  values: string[];
}

export interface ProjectFutureNativeFamilySerializationSnapshot {
  familyId: string;
  title: string;
  serializerBlockKey: string;
  enabled: boolean;
  stage: string;
  progressPercent: number;
  integrationReady: boolean;
  uiSectionIds: string[];
  uiControlCount: number;
  runtimeConfig: ProjectSerializationBlock;
  runtimeState: ProjectSerializationBlock;
  statsKeys: string[];
  nextTargets: string[];
  notes: string[];
}

export interface ProjectFutureNativeSerializationSummary {
  firstWaveFamilyCount: number;
  averageProgressPercent: number;
  totalUiControls: number;
  serializationKeys: string[];
  topProgressFamilyId: string;
  specialistRouteCount: number;
}

export interface ProjectFutureNativeSerializationSnapshot {
  summary: ProjectFutureNativeSerializationSummary;
  firstWave: ProjectFutureNativeFamilySerializationSnapshot[];
  specialistRoutes: ProjectFutureNativeSpecialistRouteEntry[];
}

export interface ProjectLayerSerializationBlocks {
  source: ProjectSerializationBlock;
  simulation: ProjectSerializationBlock;
  primitive: ProjectSerializationBlock;
  shading: ProjectSerializationBlock;
  postfx: ProjectSerializationBlock;
  execution: ProjectSerializationBlock;
}

export interface ProjectLayerSerializationSnapshot {
  key: ProjectLayerSnapshotKey;
  label: string;
  modeId: string;
  blocks: ProjectLayerSerializationBlocks;
}

export interface ProjectExecutionRoutingSnapshot {
  key: ProjectLayerSnapshotKey;
  label: string;
  enabled: boolean;
  mode: string;
  renderClass: string;
  simulationClass: string;
  requestedEngine: string;
  resolvedEngine: string;
  path: string;
  overrideId: string;
  proceduralSystemId: string | null;
  hybridKind: string | null;
  futureNativeFamilyId?: string | null;
  futureNativeBindingMode?: string | null;
  futureNativePrimaryPresetId?: string | null;
  futureNativeRecommendedPresetIds?: string[];
  capabilityFlags: ProjectCapabilityFlag[];
  reason: string;
  notes: string[];
  sceneBranches?: string[];
}

export interface ProjectLayerSnapshot {
  key: ProjectLayerSnapshotKey;
  label: string;
  enabled: boolean;
  mode: string;
  source?: string;
  material?: string;
  geometry?: string;
  connectionStyle?: string;
  features: string[];
  capabilityFlags?: ProjectCapabilityFlag[];
}

export interface ProjectProductPackScorecardSummary {
  id: string;
  label: string;
  family: string;
  coverageScore: number;
  targetHitCount: number;
  targetTotal: number;
  emphasis: string[];
  solverFamilies: string[];
  specialistFamilies: string[];
  physicalFamilies: string[];
  geometryFamilies: string[];
  temporalFamilies: string[];
  missingTargets: string[];
}

export interface ProjectCoverageAxisRollupSummary {
  covered: string[];
  missing: string[];
  hitCount: number;
  targetCount: number;
  ratio: number;
}

export interface ProjectCoverageRollupSummary {
  coverageScore: number;
  targetHitCount: number;
  targetTotal: number;
  averagePackCoverageScore: number;
  bestPackId: string | null;
  bestPackLabel: string | null;
  bestPackCoverageScore: number;
  sourceAxis: ProjectCoverageAxisRollupSummary;
  renderAxis: ProjectCoverageAxisRollupSummary;
  postAxis: ProjectCoverageAxisRollupSummary;
  computeAxis: ProjectCoverageAxisRollupSummary;
  motionAxis: ProjectCoverageAxisRollupSummary;
  solverAxis: ProjectCoverageAxisRollupSummary;
  specialistAxis: ProjectCoverageAxisRollupSummary;
  physicalAxis: ProjectCoverageAxisRollupSummary;
  geometryAxis: ProjectCoverageAxisRollupSummary;
  temporalAxis: ProjectCoverageAxisRollupSummary;
  missingTargets: string[];
}

export interface ProjectAugmentationSuggestionSummary {
  id: string;
  label: string;
  family: string;
  coverageGain: number;
  resultCoverageScore: number;
  resultTargetHitCount: number;
  coveredGapTargets: string[];
}

export interface ProjectCoverageSummary {
  depictionMethods: string[];
  motionFamilies: string[];
  computeBackends: string[];
  sourceFamilies: string[];
  renderFamilies: string[];
  postFamilies: string[];
  solverFamilies: string[];
  specialistFamilies: string[];
  physicalFamilies: string[];
  geometryFamilies: string[];
  temporalFamilies: string[];
  productPackFamilies: string[];
  productPacks: string[];
  postStackTemplates: string[];
  activePostStackId: string | null;
  activeProductPackId: string | null;
  gpgpuFeatures: string[];
  gapTargets: string[];
  productPackScorecards: ProjectProductPackScorecardSummary[];
  coverageRollup: ProjectCoverageRollupSummary;
  augmentationSuggestions: ProjectAugmentationSuggestionSummary[];
}

export interface ProjectManifestStats {
  presetCount: number;
  sequenceCount: number;
  enabledLayerCount: number;
  mediaSourceCount: number;
  textSourceCount: number;
  proceduralModeCount: number;
  distinctMaterialCount: number;
  depictionMethodCount: number;
  motionFamilyCount: number;
  computeBackendCount: number;
  sourceFamilyCount: number;
  renderFamilyCount: number;
  postFamilyCount: number;
  solverFamilyCount: number;
  specialistFamilyCount: number;
  physicalFamilyCount: number;
  geometryFamilyCount: number;
  temporalFamilyCount: number;
  productPackFamilyCount: number;
  productPackCount: number;
  postStackTemplateCount: number;
  gpgpuFeatureCount: number;
  coverageGapCount: number;
  productPackScorecardCount: number;
  activeProductPackCoverageScore: number;
  currentCoverageScore: number;
  currentTargetHitCount: number;
  currentTargetTotal: number;
  overallCoverageScore: number;
  overallTargetHitCount: number;
  overallTargetTotal: number;
  averagePackCoverageScore: number;
  bestPackCoverageScore: number;
  augmentationSuggestionCount: number;
}


export interface ProjectAudioLegacyCloseoutSummary {
  status: 'ready' | 'watchlist' | 'blocked';
  currentVisibilityMode: 'all' | 'review-blocked' | 'retired-safe';
  recommendedVisibilityMode: 'review-blocked' | 'retired-safe';
  modeDrift: boolean;
  safeToDeprecateCount: number;
  currentReviewCount: number;
  currentBlockedCount: number;
  currentResidualCount: number;
  storedReviewCount: number;
  storedBlockedCount: number;
  highestRiskLegacyIds: string[];
  requiresTargetHostProof: boolean;
  closeoutMessage: string;
  nextStepLabel: string;
}

export interface ProjectAudioLegacyRetirementSummary {
  visibilityMode: 'all' | 'review-blocked' | 'retired-safe';
  safeToDeprecateCount: number;
  reviewBeforeDeprecateCount: number;
  blockedDeprecationCount: number;
  residualCount: number;
  presetAffectedReviewCount: number;
  presetAffectedBlockedCount: number;
  sequenceLinkedPresetReviewCount: number;
  sequenceLinkedPresetBlockedCount: number;
  keyframeReviewCount: number;
  keyframeBlockedCount: number;
  highestRiskLegacyIds: string[];
  customConflictHotspotKeys: string[];
}

export interface ProjectAudioLegacyStoredQueuePreviewSummary {
  limit: number;
  scope: 'presets' | 'keyframes' | 'all';
  profile: string;
  keyCount: number;
  appliedKeyCount: number;
  presetUpdatedCount: number;
  keyframeUpdatedCount: number;
  totalUpdatedCount: number;
  totalReviewDelta: number;
  totalBlockedDelta: number;
  totalResidualDelta: number;
  beforePresetContextCount: number;
  afterPresetContextCount: number;
  beforeKeyframeContextCount: number;
  afterKeyframeContextCount: number;
  beforeManualCustomChoiceCount: number;
  afterManualCustomChoiceCount: number;
  beforeManualResidualMergeCount: number;
  afterManualResidualMergeCount: number;
  previewKeys: string[];
  sampleUpdatedIds: string[];
}

export interface ProjectAudioLegacyManualQueueSummary {
  currentManualKeyCount: number;
  storedManualKeyCount: number;
  combinedKeyCount: number;
  currentManualCustomChoiceCount: number;
  currentManualResidualMergeCount: number;
  storedManualCustomChoiceCount: number;
  storedManualResidualMergeCount: number;
  storedPresetContextCount: number;
  storedKeyframeContextCount: number;
  currentHeadKeys: string[];
  storedHeadKeys: string[];
  combinedHeadKeys: string[];
}



export type ProjectDistributionProofBundleId =
  | 'full-local-dev'
  | 'source-only-clean'
  | 'proof-packet'
  | 'proof-packet-verify-status'
  | 'proof-packet-intel-mac-closeout'
  | 'platform-specific-runtime-bundled';

export interface ProjectDistributionProofBundleManifestSummary {
  generatedAt: string;
  outputDir: string;
  immediateResume: ProjectDistributionProofBundleId;
  lightweightHandoff: ProjectDistributionProofBundleId;
  verifyStatusOnly: ProjectDistributionProofBundleId;
  intelMacCloseoutOnly: ProjectDistributionProofBundleId;
  total: number;
  resume: number;
  proof: number;
  bootstrapRequired: number;
  intelMacFocused: number;
  bundleIds: ProjectDistributionProofBundleId[];
}

export interface ProjectSerializationDiagnosticsSnapshot {
  audioLegacyRetirement: ProjectAudioLegacyRetirementSummary;
  audioLegacyCloseout?: ProjectAudioLegacyCloseoutSummary;
}

export interface ProjectExportHandoffManifestSummary {
  generatedAt: string;
  routeCount: number;
  warningFamilyCount: number;
  specialistDriftCount: number;
  specialistManifestDriftCount: number;
  bundleManifestDriftCount: number;
  webgpuDirectCount: number;
  webgpuLimitedCount: number;
  webgpuFallbackOnlyCount: number;
  intelMacVerdict: string;
  intelMacDropProgress: string;
  intelMacTargetProgress: string;
  intelMacBlockerCount: number;
  bundleImmediateResume: ProjectDistributionProofBundleId;
  bundleLightweightHandoff: ProjectDistributionProofBundleId;
  bundleVerifyStatusOnly: ProjectDistributionProofBundleId;
  bundleIntelMacCloseoutOnly: ProjectDistributionProofBundleId;
}

export interface ProjectSeedReplaySummary {
  lockEnabled: boolean;
  currentSeedValue: number;
  autoAdvance: boolean;
  step: number;
  lastAppliedSeed: number;
  lastTriggerKind: ParticleConfig['projectSeedLastTriggerKind'];
  lastMutationScope: ParticleConfig['projectSeedLastMutationScope'];
  lastMutationIntensity: number;
  lastRecordedAt: string;
}

export interface ProjectCloseoutCurrentSummary {
  generatedAt: string;
  repoReady: boolean;
  overallCompletionPercent: number;
  routeCount: number;
  warningFamilyCount: number;
  specialistDriftCount: number;
  specialistManifestDriftCount: number;
  bundleManifestDriftCount: number;
  webgpuDirectCount: number;
  webgpuLimitedCount: number;
  webgpuFallbackOnlyCount: number;
  intelMacVerdict: string;
  intelMacReadyForRealCapture: boolean;
  intelMacReadyForHostFinalize: boolean;
  intelMacDropProgress: string;
  intelMacTargetProgress: string;
  intelMacBlockerCount: number;
  recommendedResumeBundle: string;
  recommendedProofBundle: string;
  recommendedIntelMacBundle: string;
  operatorCommand: string;
  intakeCommand: string;
}

export interface ProjectManifest {
  schemaVersion: number;
  serializationSchemaVersion: number;
  layers: ProjectLayerSnapshot[];
  execution: ProjectExecutionRoutingSnapshot[];
  futureNativeSpecialistPackets?: ProjectFutureNativeSpecialistPacketEntry[];
  futureNativeSpecialistRoutes?: ProjectFutureNativeSpecialistRouteEntry[];
  distributionProofBundles?: ProjectDistributionProofBundleManifestSummary;
  exportHandoff?: ProjectExportHandoffManifestSummary;
  closeoutCurrent?: ProjectCloseoutCurrentSummary;
  seedReplay?: ProjectSeedReplaySummary;
  coverage: ProjectCoverageSummary;
  stats: ProjectManifestStats;
  audioLegacyRetirement?: ProjectAudioLegacyRetirementSummary;
  audioLegacyCloseout?: ProjectAudioLegacyCloseoutSummary;
  audioLegacyStoredQueuePreview?: ProjectAudioLegacyStoredQueuePreviewSummary;
  audioLegacyManualQueue?: ProjectAudioLegacyManualQueueSummary;
}

export interface ProjectExportSchema {
  format: 'kalokagathia-project' | 'monosphere-project';
  projectDataVersion: number;
  manifestSchemaVersion: number;
  serializationSchemaVersion: number;
  migrationState: 'native' | 'migrated';
  migratedFromProjectDataVersion: number | null;
}

export interface ProjectSerializationSnapshot {
  schemaVersion: number;
  layers: ProjectLayerSerializationSnapshot[];
  futureNative?: ProjectFutureNativeSerializationSnapshot;
  diagnostics?: ProjectSerializationDiagnosticsSnapshot;
}

export interface ProjectData {
  version: number;
  schema: ProjectExportSchema;
  exportedAt: string;
  name: string;
  currentConfig: ParticleConfig;
  activePresetId: string | null;
  presetBlendDuration: number;
  sequenceLoopEnabled: boolean;
  presets: PresetRecord[];
  presetSequence: PresetSequenceItem[];
  ui: ProjectUiState;
  serialization: ProjectSerializationSnapshot;
  manifest: ProjectManifest;
}
