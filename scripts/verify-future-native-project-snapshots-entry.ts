import {
  buildFutureNativeProjectSnapshotReport,
} from '../lib/future-native-families/futureNativeFamiliesProjectReport';
import { FUTURE_NATIVE_PROJECT_INTEGRATED_IDS } from '../lib/future-native-families/futureNativeFamiliesIntegration';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const report = buildFutureNativeProjectSnapshotReport();
assert(report.summary.scenarioCount === 3, 'future-native project snapshot scenario count mismatch');
assert(report.summary.baselineFamilyCount === FUTURE_NATIVE_PROJECT_INTEGRATED_IDS.length, 'future-native project snapshot baseline family count mismatch');
assert(report.baseline.verification.allPassed, 'future-native project snapshot baseline verification failed');
assert(report.summary.routeHighlightCount >= 3, 'future-native project snapshot route highlight count mismatch');
assert(report.summary.specialistPacketCount === 4, 'future-native project snapshot specialist packet count mismatch');
assert(report.summary.specialistRouteCount === 4, 'future-native project snapshot specialist route count mismatch');
assert(report.summary.specialistManualSelectionCount === 0, 'future-native project snapshot specialist manual selection count mismatch');
assert(report.summary.specialistFallbackActiveCount === 0, 'future-native project snapshot specialist fallback active count mismatch');
assert(report.summary.specialistPinnedOverrideCount === 0, 'future-native project snapshot specialist pinned override count mismatch');
assert(report.summary.specialistCapabilityDeltaCount === 0, 'future-native project snapshot specialist capability delta count mismatch');
assert(report.summary.specialistOverrideHistoryCount === 0, 'future-native project snapshot specialist override history count mismatch');
assert(report.summary.specialistFallbackHistoryCount === 0, 'future-native project snapshot specialist fallback history count mismatch');
assert(report.summary.specialistCapabilityTrendCount === 0, 'future-native project snapshot specialist capability trend count mismatch');
assert(report.summary.specialistWarningRouteCount === 0, 'future-native project snapshot specialist warning route count mismatch');
assert(report.summary.specialistRouteFixtureDiffCount === 4, 'future-native project snapshot specialist fixture diff count mismatch');
assert(report.summary.specialistRouteFixtureWarningCount === 4, 'future-native project snapshot specialist fixture warning count mismatch');
assert(report.baseline.firstWave.some((entry) => entry.familyId === 'volumetric-advection'), 'future-native project snapshot volumetric-advection baseline missing');
assert(report.baseline.firstWave.some((entry) => entry.familyId === 'volumetric-pressure-coupling'), 'future-native project snapshot volumetric-pressure baseline missing');
assert(report.baseline.firstWave.some((entry) => entry.familyId === 'volumetric-light-shadow-coupling'), 'future-native project snapshot volumetric-light-shadow baseline missing');
assert(report.baseline.specialistPackets.some((entry) => entry.familyId === 'specialist-houdini-native'), 'future-native project snapshot houdini packet missing');
assert(report.baseline.specialistPackets.some((entry) => entry.familyId === 'specialist-niagara-native'), 'future-native project snapshot niagara packet missing');
assert(report.baseline.specialistPackets.some((entry) => entry.familyId === 'specialist-touchdesigner-native'), 'future-native project snapshot touchdesigner packet missing');
assert(report.baseline.specialistPackets.some((entry) => entry.familyId === 'specialist-unity-vfx-native'), 'future-native project snapshot unity-vfx packet missing');
for (const packet of report.baseline.specialistPackets) {
  assert(packet.currentStage === 'project-integrated', `[${packet.familyId}] specialist packet stage mismatch`);
  assert(packet.stageLabels.length === 3, `[${packet.familyId}] specialist packet stage labels mismatch`);
  assert(packet.outputBridges.length >= 3, `[${packet.familyId}] specialist packet bridges too small`);
  assert(packet.adapterMappingCount >= 3, `[${packet.familyId}] specialist packet adapter mappings too small`);
  assert(packet.runtimeConfigValues.some((value) => value.startsWith('graphHint:')), `[${packet.familyId}] specialist packet graph hint missing`);
}
for (const route of report.baseline.specialistRoutes) {
  assert(route.currentStage === 'project-integrated', `[${route.familyId}] specialist route stage mismatch`);
  assert(route.routeId.length > 0, `[${route.familyId}] specialist route id missing`);
  assert(route.executionTarget.startsWith('hybrid:'), `[${route.familyId}] specialist route target mismatch`);
  assert(route.selectedAdapterId.length > 0, `[${route.familyId}] specialist route selected adapter missing`);
  assert(route.selectedAdapterLabel.length > 0, `[${route.familyId}] specialist route selected adapter label missing`);
  assert(route.routingValues.some((value) => value.startsWith('executionTarget:')), `[${route.familyId}] specialist route execution target missing`);
  assert(route.routingValues.some((value) => value.startsWith('serializer:')), `[${route.familyId}] specialist route serializer missing`);
  assert(route.adapterHandshakeValues.some((value) => value.startsWith('provider:')), `[${route.familyId}] specialist route provider handshake missing`);
  assert(route.adapterHandshakeValues.some((value) => value.startsWith('transport:')), `[${route.familyId}] specialist route transport handshake missing`);
  assert(route.adapterBridgeSchemaValues.some((value) => value.startsWith('schemaId:')), `[${route.familyId}] specialist route schema missing`);
  assert(route.adapterBridgeSchemaValues.some((value) => value.startsWith('egress:')), `[${route.familyId}] specialist route egress schema missing`);
  assert(route.adapterSelectionValues.some((value) => value.startsWith('selectedAdapter:')), `[${route.familyId}] specialist route selection missing`);
  assert(route.adapterTargetSwitchValues.some((value) => value.startsWith('activeExecutionTarget:')), `[${route.familyId}] specialist route target switch missing`);
  assert(route.routeTargetDeltaValues.some((value) => value.startsWith('targetFamily:')), `[${route.familyId}] specialist route target delta missing`);
  assert(route.adapterCapabilityDiffValues.some((value) => value.startsWith('selectedCapabilities:')), `[${route.familyId}] specialist route capability diff missing`);
  assert(route.adapterOverrideCandidates.length >= 3, `[${route.familyId}] specialist route override candidates too small`);
  assert(route.adapterOverrideStateValues.some((value) => value.startsWith('overrideMode:')), `[${route.familyId}] specialist route override state missing`);
  assert(route.adapterOverrideStateValues.some((value) => value.startsWith('activeOverrideCandidate:')), `[${route.familyId}] specialist route override candidate missing`);
  assert(route.adapterOverrideStateValues.some((value) => value.startsWith('overrideDisposition:')), `[${route.familyId}] specialist route override disposition missing`);
  assert(route.fallbackReasonValues.some((value) => value.startsWith('selectedReason:')), `[${route.familyId}] specialist route fallback reason missing`);
  assert(route.overrideChangeHistoryValues.some((value) => value.startsWith('changeCount:')), `[${route.familyId}] specialist route override history missing`);
  assert(route.overrideChangeHistoryValues.some((value) => value === 'historyState:baseline-stable'), `[${route.familyId}] specialist route baseline history mismatch`);
  assert(route.adapterFallbackHistoryValues.some((value) => value === 'fallbackTransition:none'), `[${route.familyId}] specialist route fallback history mismatch`);
  assert(route.capabilityTrendDeltaValues.some((value) => value === 'capabilityTrend:stable'), `[${route.familyId}] specialist route capability trend mismatch`);
}
assert(report.fixtureComparison.summary.routeCount === 4, 'future-native project snapshot fixture route count mismatch');
assert(report.fixtureComparison.summary.changedRouteCount === 4, 'future-native project snapshot fixture changed-route count mismatch');
assert(report.fixtureComparison.summary.overrideHistoryChangedCount === 4, 'future-native project snapshot fixture override-history count mismatch');
assert(report.fixtureComparison.summary.fallbackHistoryChangedCount === 4, 'future-native project snapshot fixture fallback-history count mismatch');
assert(report.fixtureComparison.summary.capabilityTrendChangedCount === 4, 'future-native project snapshot fixture capability-trend count mismatch');
assert(report.fixtureComparison.summary.warningRouteCount === 4, 'future-native project snapshot fixture warning-route count mismatch');
for (const diff of report.fixtureComparison.routes) {
  assert(diff.changedSections.includes('override-history'), `[${diff.familyId}] fixture override-history section missing`);
  assert(diff.changedSections.includes('fallback-history'), `[${diff.familyId}] fixture fallback-history section missing`);
  assert(diff.changedSections.includes('capability-trend'), `[${diff.familyId}] fixture capability-trend section missing`);
  assert(diff.overrideHistoryDeltaValues.some((value) => value === 'historyState:override-updated'), `[${diff.familyId}] fixture override-history delta missing`);
  assert(diff.fallbackHistoryDeltaValues.some((value) => value.startsWith('fallbackTransition:') && value !== 'fallbackTransition:none'), `[${diff.familyId}] fixture fallback-history delta missing`);
  assert(diff.capabilityTrendDeltaValues.some((value) => value === 'capabilityTrend:manual-delta'), `[${diff.familyId}] fixture capability-trend delta missing`);
  assert(diff.warningValues.length >= 3, `[${diff.familyId}] fixture warning values too small`);
}

const smokeRouteHighlight = report.baseline.routeHighlights.find((entry) => entry.familyId === 'volumetric-smoke');
assert(smokeRouteHighlight, 'future-native project snapshot smoke route highlight missing');
const smokeRoute = smokeRouteHighlight!;
assert(smokeRoute.profiles.length === 2, 'future-native project snapshot smoke route profile count mismatch');
assert(smokeRoute.deltaLines.some((value) => value.startsWith('density=')), 'future-native project snapshot smoke density delta missing');
assert(smokeRoute.deltaLines.some((value) => value.startsWith('scatter=')), 'future-native project snapshot smoke scatter delta missing');
assert(smokeRoute.deltaLines.some((value) => value.startsWith('rim=')), 'future-native project snapshot smoke rim delta missing');
const advectionRouteHighlight = report.baseline.routeHighlights.find((entry) => entry.familyId === 'volumetric-advection');
assert(advectionRouteHighlight, 'future-native project snapshot advection route highlight missing');
const advectionRoute = advectionRouteHighlight!;
assert(advectionRoute.profiles.length === 2, 'future-native project snapshot advection route profile count mismatch');
assert(advectionRoute.deltaLines.some((value) => value.startsWith('buoyancy=')), 'future-native project snapshot advection buoyancy delta missing');
assert(advectionRoute.deltaLines.some((value) => value.startsWith('obstacle=')), 'future-native project snapshot advection obstacle delta missing');
assert(advectionRoute.deltaLines.some((value) => value.startsWith('volumeDepth=')), 'future-native project snapshot advection depth delta missing');
const pressureRouteHighlight = report.baseline.routeHighlights.find((entry) => entry.familyId === 'volumetric-pressure-coupling');
assert(pressureRouteHighlight, 'future-native project snapshot pressure route highlight missing');
const pressureRoute = pressureRouteHighlight!;
assert(pressureRoute.profiles.length === 2, 'future-native project snapshot pressure route profile count mismatch');
assert(pressureRoute.deltaLines.some((value) => value.startsWith('pressureRelax=')), 'future-native project snapshot pressure projection delta missing');
assert(pressureRoute.deltaLines.some((value) => value.startsWith('obstacle=')), 'future-native project snapshot pressure obstacle delta missing');
assert(pressureRoute.deltaLines.some((value) => value.startsWith('volumeDepth=')), 'future-native project snapshot pressure depth delta missing');
const lightShadowRouteHighlight = report.baseline.routeHighlights.find((entry) => entry.familyId === 'volumetric-light-shadow-coupling');
assert(lightShadowRouteHighlight, 'future-native project snapshot light-shadow route highlight missing');
const lightShadowRoute = lightShadowRouteHighlight!;
assert(lightShadowRoute.profiles.length === 2, 'future-native project snapshot light-shadow route profile count mismatch');
assert(lightShadowRoute.deltaLines.some((value) => value.startsWith('lightAbsorption=')), 'future-native project snapshot light-shadow absorption delta missing');
assert(lightShadowRoute.deltaLines.some((value) => value.startsWith('shadow=')), 'future-native project snapshot light-shadow shadow delta missing');
assert(lightShadowRoute.deltaLines.some((value) => value.startsWith('volumeDepth=')), 'future-native project snapshot light-shadow depth delta missing');
for (const scenario of report.scenarios) {
  assert(scenario.familyCount === FUTURE_NATIVE_PROJECT_INTEGRATED_IDS.length, `[${scenario.id}] future-native family count mismatch`);
  assert(scenario.averageProgressPercent > 40, `[${scenario.id}] average progress too low`);
  assert(scenario.totalRuntimeConfigValues >= 28, `[${scenario.id}] runtime config coverage too low`);
  assert(scenario.totalRuntimeStateValues >= 28, `[${scenario.id}] runtime state coverage too low`);
  assert(scenario.specialistRouteCount === 4, `[${scenario.id}] specialist route count mismatch`);
  for (const family of scenario.families) {
    assert(family.runtimeConfig.values.length >= 4, `[${scenario.id}:${family.familyId}] runtimeConfig too small`);
    assert(family.runtimeState.values.length >= 4, `[${scenario.id}:${family.familyId}] runtimeState too small`);
    assert(family.statsKeys.length >= 3, `[${scenario.id}:${family.familyId}] statsKeys too small`);
    if (family.familyId === 'volumetric-smoke') {
      assert(family.uiControlCount >= 24, `[${scenario.id}:${family.familyId}] smoke ui control coverage too low`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('routeProfiles:')), `[${scenario.id}:${family.familyId}] smoke route profiles missing`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('injectorBias:')), `[${scenario.id}:${family.familyId}] smoke injector bias missing`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('lightScatter:')), `[${scenario.id}:${family.familyId}] smoke light scatter missing`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('scatterAnisotropy:')), `[${scenario.id}:${family.familyId}] smoke scatter anisotropy missing`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('rimBoost:')), `[${scenario.id}:${family.familyId}] smoke rim boost missing`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('prismSeparation:')), `[${scenario.id}:${family.familyId}] smoke prism separation missing`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('persistence:')), `[${scenario.id}:${family.familyId}] smoke persistence missing`);
    }
    if (family.familyId === 'volumetric-advection') {
      assert(family.uiControlCount >= 16, `[${scenario.id}:${family.familyId}] advection ui control coverage too low`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('routeProfiles:')), `[${scenario.id}:${family.familyId}] advection route profiles missing`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('advection:')), `[${scenario.id}:${family.familyId}] advection runtime config missing`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('volumeDepth:')), `[${scenario.id}:${family.familyId}] advection volume depth missing`);
    }
    if (family.familyId === 'volumetric-pressure-coupling') {
      assert(family.uiControlCount >= 16, `[${scenario.id}:${family.familyId}] pressure ui control coverage too low`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('routeProfiles:')), `[${scenario.id}:${family.familyId}] pressure route profiles missing`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('pressureRelax:')), `[${scenario.id}:${family.familyId}] pressure projection config missing`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('volumeDepth:')), `[${scenario.id}:${family.familyId}] pressure volume depth missing`);
    }
    if (family.familyId === 'volumetric-light-shadow-coupling') {
      assert(family.uiControlCount >= 16, `[${scenario.id}:${family.familyId}] light-shadow ui control coverage too low`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('routeProfiles:')), `[${scenario.id}:${family.familyId}] light-shadow route profiles missing`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('lightAbsorption:')), `[${scenario.id}:${family.familyId}] light-shadow absorption config missing`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('lightMarch:')), `[${scenario.id}:${family.familyId}] light-shadow light march missing`);
      assert(family.runtimeConfig.values.some((value) => value.startsWith('volumeDepth:')), `[${scenario.id}:${family.familyId}] light-shadow volume depth missing`);
    }
  }
}

console.log('PASS future-native-project-snapshots');
console.log(JSON.stringify({
  summary: report.summary,
  baselineVerification: report.baseline.verification,
  specialistPackets: report.baseline.specialistPackets.map((packet) => ({
    familyId: packet.familyId,
    stageLabels: packet.stageLabels.length,
    adapterMappingCount: packet.adapterMappingCount,
  })),
  specialistRoutes: report.baseline.specialistRoutes.map((route) => ({
    familyId: route.familyId,
    routeId: route.routeId,
    executionTarget: route.executionTarget,
    selectedAdapterId: route.selectedAdapterId,
    adapterHandshakeValues: route.adapterHandshakeValues.length,
    adapterBridgeSchemaValues: route.adapterBridgeSchemaValues.length,
    adapterSelectionValues: route.adapterSelectionValues.length,
    adapterTargetSwitchValues: route.adapterTargetSwitchValues.length,
    routeTargetDeltaValues: route.routeTargetDeltaValues.length,
    adapterCapabilityDiffValues: route.adapterCapabilityDiffValues.length,
    adapterOverrideStateValues: route.adapterOverrideStateValues.length,
    fallbackReasonValues: route.fallbackReasonValues.length,
    overrideChangeHistoryValues: route.overrideChangeHistoryValues.length,
    adapterFallbackHistoryValues: route.adapterFallbackHistoryValues.length,
    capabilityTrendDeltaValues: route.capabilityTrendDeltaValues.length,
  })),
  scenarios: report.scenarios.map((scenario) => ({
    id: scenario.id,
    familyCount: scenario.familyCount,
    totalRuntimeConfigValues: scenario.totalRuntimeConfigValues,
    totalRuntimeStateValues: scenario.totalRuntimeStateValues,
    specialistRouteCount: scenario.specialistRouteCount,
  })),
}, null, 2));
