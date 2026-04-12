import { buildFutureNativeSpecialistRouteCompactArtifact } from '../lib/future-native-families/futureNativeFamiliesSpecialistCompactArtifact';
import { buildFutureNativeSpecialistRouteExportImportComparison } from '../lib/future-native-families/futureNativeFamiliesSpecialistRouteComparison';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const comparison = buildFutureNativeSpecialistRouteExportImportComparison();
const artifact = buildFutureNativeSpecialistRouteCompactArtifact();

assert(comparison.baselineSummary.routeCount === 4, 'future-native specialist route baseline count mismatch');
assert(comparison.baselineSummary.warningRouteCount === 0, 'future-native specialist route baseline warning count mismatch');
assert(comparison.fixtureSummary.routeCount === 4, 'future-native specialist route fixture count mismatch');
assert(comparison.fixtureSummary.changedRouteCount === 4, 'future-native specialist route changed route count mismatch');
assert(comparison.fixtureSummary.warningRouteCount === 4, 'future-native specialist route warning count mismatch');
assert(comparison.exportImportSummary.routeCount === 4, 'future-native specialist route export/import count mismatch');
assert(comparison.exportImportSummary.changedRouteCount === 4, 'future-native specialist route export/import changed count mismatch');
assert(comparison.exportImportSummary.warningRouteCount === 4, 'future-native specialist route export/import warning count mismatch');
assert(comparison.exportImportSummary.manifestRoundtripStableCount === 4, 'future-native specialist route manifest roundtrip mismatch');
assert(comparison.exportImportSummary.serializationRoundtripStableCount === 4, 'future-native specialist route serialization roundtrip mismatch');
assert(comparison.exportImportSummary.controlRoundtripStableCount === 4, 'future-native specialist route control roundtrip mismatch');
for (const route of comparison.routes) {
  assert(route.changedSections.includes('override-history'), `[${route.familyId}] override-history diff missing`);
  assert(route.changedSections.includes('fallback-history'), `[${route.familyId}] fallback-history diff missing`);
  assert(route.changedSections.includes('capability-trend'), `[${route.familyId}] capability-trend diff missing`);
  assert(route.warningValues.length >= 3, `[${route.familyId}] warning values too small`);
  assert(route.manifestRoundtripStable, `[${route.familyId}] manifest roundtrip drift`);
  assert(route.serializationRoundtripStable, `[${route.familyId}] serialization roundtrip drift`);
  assert(route.controlRoundtripStable, `[${route.familyId}] control roundtrip drift`);
  assert(route.manifestDeltaValues.length === 0, `[${route.familyId}] manifest delta should be empty`);
  assert(route.serializationDeltaValues.length === 0, `[${route.familyId}] serialization delta should be empty`);
  assert(route.controlDeltaValues.length === 0, `[${route.familyId}] control delta should be empty`);
}
assert(artifact.summary.routeCount === 4, 'future-native specialist compact artifact route count mismatch');
assert(artifact.summary.fixtureChangedRouteCount === 4, 'future-native specialist compact artifact changed route count mismatch');
assert(artifact.summary.fixtureWarningRouteCount === 4, 'future-native specialist compact artifact warning route count mismatch');
assert(artifact.summary.exportImportWarningRouteCount === 4, 'future-native specialist compact artifact export/import warning mismatch');
assert(artifact.summary.manifestRoundtripStableCount === 4, 'future-native specialist compact artifact manifest stable mismatch');
assert(artifact.summary.serializationRoundtripStableCount === 4, 'future-native specialist compact artifact serialization stable mismatch');
assert(artifact.summary.controlRoundtripStableCount === 4, 'future-native specialist compact artifact control stable mismatch');

console.log('PASS future-native-specialist-routes');
console.log(JSON.stringify({ comparison, artifact }, null, 2));
