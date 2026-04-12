import { buildFutureNativeSpecialistRuntimeExportRegressionArtifact } from '../lib/future-native-families/futureNativeFamiliesSpecialistRuntimeExportRegression';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const artifact = buildFutureNativeSpecialistRuntimeExportRegressionArtifact();
assert(artifact.summary.runtimeRouteCount === 4, 'future-native specialist runtime route count mismatch');
assert(artifact.summary.exportImportRouteCount === 4, 'future-native specialist export/import route count mismatch');
assert(artifact.summary.compactArtifactRouteCount === 4, 'future-native specialist compact artifact route count mismatch');
assert(artifact.summary.projectSnapshotRouteCount === 4, 'future-native specialist project snapshot route count mismatch');
assert(artifact.summary.baselineWarningRouteCount === 0, 'future-native specialist baseline warning count mismatch');
assert(artifact.summary.fixtureChangedRouteCount === 4, 'future-native specialist fixture changed route count mismatch');
assert(artifact.summary.fixtureWarningRouteCount === 4, 'future-native specialist fixture warning route count mismatch');
assert(artifact.summary.exportImportWarningRouteCount === 4, 'future-native specialist export/import warning route count mismatch');
assert(artifact.summary.manifestRoundtripStableCount === 4, 'future-native specialist manifest roundtrip stable count mismatch');
assert(artifact.summary.serializationRoundtripStableCount === 4, 'future-native specialist serialization roundtrip stable count mismatch');
assert(artifact.summary.controlRoundtripStableCount === 4, 'future-native specialist control roundtrip stable count mismatch');
for (const route of artifact.routes) {
  assert(route.warningValues.length >= 3, `[${route.familyId}] warning values too small`);
  assert(route.changedSections.includes('override-history'), `[${route.familyId}] override-history diff missing`);
  assert(route.changedSections.includes('fallback-history'), `[${route.familyId}] fallback-history diff missing`);
  assert(route.changedSections.includes('capability-trend'), `[${route.familyId}] capability-trend diff missing`);
  assert(route.manifestRoundtripStable, `[${route.familyId}] manifest roundtrip drift`);
  assert(route.serializationRoundtripStable, `[${route.familyId}] serialization roundtrip drift`);
  assert(route.controlRoundtripStable, `[${route.familyId}] control roundtrip drift`);
}
console.log('PASS future-native-specialist-runtime-export-regression');
console.log(JSON.stringify(artifact, null, 2));
