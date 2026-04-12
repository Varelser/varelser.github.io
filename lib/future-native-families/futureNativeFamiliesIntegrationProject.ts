import { buildFutureNativeFamilySerializedMap } from './futureNativeFamiliesSerialization';
import {
  buildIntegratedFamilySnapshot,
  buildAllFirstWaveIntegrationSnapshots,
  getFutureNativeUiSections,
} from './futureNativeFamiliesIntegrationSnapshots';
import {
  buildFutureNativeRuntimeStateBlock,
  countControls,
  getFutureNativeStatsKeys,
  FUTURE_NATIVE_PROJECT_INTEGRATED_IDS,
  type FutureNativeIntegrationSnapshot,
  type FutureNativeProjectIntegratedId,
  type FutureNativeSharedIntegrationSummary,
  type ProjectFutureNativeIntegrationSnapshot,
  type ProjectFutureNativeIntegrationSummary,
} from './futureNativeFamiliesIntegrationShared';

export function buildProjectFutureNativeIntegrationSnapshot(familyId: FutureNativeProjectIntegratedId): ProjectFutureNativeIntegrationSnapshot {
  const integrationSnapshot = buildIntegratedFamilySnapshot(familyId);
  const uiSections = getFutureNativeUiSections(familyId);
  return {
    familyId,
    title: integrationSnapshot.title,
    serializerBlockKey: integrationSnapshot.serializerBlock.serializerBlockKey,
    enabled: integrationSnapshot.serializerBlock.enabled,
    stage: integrationSnapshot.currentStage,
    progressPercent: integrationSnapshot.progressPercent,
    integrationReady: integrationSnapshot.integrationReady,
    uiSectionIds: uiSections.map((section) => section.id),
    uiControlCount: countControls(uiSections),
    runtimeConfig: integrationSnapshot.runtimeConfigBlock,
    runtimeState: buildFutureNativeRuntimeStateBlock(integrationSnapshot),
    statsKeys: getFutureNativeStatsKeys(integrationSnapshot.stats),
    nextTargets: integrationSnapshot.nextTargets,
    notes: integrationSnapshot.serializerBlock.notes,
  };
}

export function buildAllProjectFutureNativeIntegrationSnapshots(): ProjectFutureNativeIntegrationSnapshot[] {
  return FUTURE_NATIVE_PROJECT_INTEGRATED_IDS.map((id) => buildProjectFutureNativeIntegrationSnapshot(id));
}

export function buildProjectFutureNativeIntegrationSummary(
  snapshots = buildAllProjectFutureNativeIntegrationSnapshots(),
): ProjectFutureNativeIntegrationSummary {
  const totalUiControls = snapshots.reduce((sum, snapshot) => sum + snapshot.uiControlCount, 0);
  const averageProgressPercent = snapshots.length > 0
    ? snapshots.reduce((sum, snapshot) => sum + snapshot.progressPercent, 0) / snapshots.length
    : 0;
  const topProgressFamily = [...snapshots].sort((a, b) => b.progressPercent - a.progressPercent)[0] ?? snapshots[0];
  return {
    firstWaveFamilyCount: snapshots.length,
    averageProgressPercent,
    totalUiControls,
    serializationKeys: snapshots.map((snapshot) => snapshot.serializerBlockKey),
    topProgressFamilyId: (topProgressFamily?.familyId ?? 'pbd-rope') as FutureNativeProjectIntegratedId,
  };
}

export function buildFutureNativeSharedIntegrationSummary(
  snapshots = buildAllFirstWaveIntegrationSnapshots(),
): FutureNativeSharedIntegrationSummary {
  const totalUiControls = snapshots.reduce((sum, snapshot) => sum + snapshot.uiControlCount, 0);
  const averageProgressPercent =
    snapshots.length > 0 ? snapshots.reduce((sum, snapshot) => sum + snapshot.progressPercent, 0) / snapshots.length : 0;
  const topProgressFamily = [...snapshots].sort((a, b) => b.progressPercent - a.progressPercent)[0] ?? snapshots[0];
  return {
    firstWaveFamilyCount: snapshots.length,
    averageProgressPercent,
    totalUiControls,
    serializationKeys: snapshots.map((snapshot) => snapshot.serializerBlock.serializerBlockKey),
    topProgressFamilyId: (topProgressFamily?.familyId ?? 'pbd-rope') as FutureNativeProjectIntegratedId,
  };
}

export function renderFutureNativeSharedIntegrationMarkdown(
  snapshots = buildAllFirstWaveIntegrationSnapshots(),
): string {
  const summary = buildFutureNativeSharedIntegrationSummary(snapshots);
  const lines: string[] = [
    '# Future Native Shared Integration Snapshot',
    '',
    `- firstWaveFamilyCount: ${summary.firstWaveFamilyCount}`,
    `- averageProgressPercent: ${summary.averageProgressPercent.toFixed(1)}`,
    `- totalUiControls: ${summary.totalUiControls}`,
    `- topProgressFamilyId: ${summary.topProgressFamilyId}`,
    `- serializationKeys: ${summary.serializationKeys.join(', ')}`,
    '',
  ];
  for (const snapshot of snapshots) {
    lines.push(`## ${snapshot.title} (${snapshot.familyId})`);
    lines.push(`- progressPercent: ${snapshot.progressPercent}`);
    lines.push(`- currentStage: ${snapshot.currentStage}`);
    lines.push(`- uiControlCount: ${snapshot.uiControlCount}`);
    lines.push(`- runtimeConfig: ${snapshot.runtimeConfigBlock.values.join('; ')}`);
    lines.push(`- summary: ${snapshot.summary}`);
    lines.push(`- nextTargets: ${snapshot.nextTargets.join('; ')}`);
    lines.push(`- scalarSamples: ${snapshot.scalarSamples.join(', ')}`);
    lines.push('');
  }
  return lines.join('\n');
}

export function buildFutureNativeIntegrationSnapshotJson(): {
  serializedMap: ReturnType<typeof buildFutureNativeFamilySerializedMap>;
  sharedSummary: FutureNativeSharedIntegrationSummary;
  firstWave: FutureNativeIntegrationSnapshot[];
} {
  const firstWave = buildAllFirstWaveIntegrationSnapshots();
  return {
    serializedMap: buildFutureNativeFamilySerializedMap(),
    sharedSummary: buildFutureNativeSharedIntegrationSummary(firstWave),
    firstWave,
  };
}
