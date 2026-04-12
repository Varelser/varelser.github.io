import {
  buildAllFirstWaveIntegrationSnapshots,
  buildFutureNativeIntegrationSnapshotJson,
  buildFutureNativeSharedIntegrationSummary,
  renderFutureNativeSharedIntegrationMarkdown,
} from '../lib/future-native-families/futureNativeFamiliesIntegration';
import {
  assertFutureNativeVerificationReport,
  verifyAllFutureNativeIntegrationSnapshots,
} from '../lib/future-native-families/futureNativeFamiliesVerifier';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const snapshots = buildAllFirstWaveIntegrationSnapshots();
const summary = buildFutureNativeSharedIntegrationSummary(snapshots);
const payload = buildFutureNativeIntegrationSnapshotJson();
const markdown = renderFutureNativeSharedIntegrationMarkdown(snapshots);
const report = verifyAllFutureNativeIntegrationSnapshots(snapshots);

assert(snapshots.length === 4, 'future-native integration should cover 4 first-wave families');
assert(summary.averageProgressPercent > 40, 'future-native integration average progress too low');
assert(summary.totalUiControls >= 16, 'future-native integration ui control coverage too low');
assert(summary.serializationKeys.length === 4, 'future-native integration serialization key count mismatch');
assert(markdown.includes('Future Native Shared Integration Snapshot'), 'future-native integration markdown heading missing');
assert(payload.firstWave.length === snapshots.length, 'future-native integration JSON firstWave mismatch');
for (const snapshot of snapshots) {
  assert(snapshot.currentStage === 'project-integrated', `${snapshot.familyId}: first-wave stage should be project-integrated`);
  assert(snapshot.integrationReady, `${snapshot.familyId}: first-wave integrationReady should be true`);
  assert(snapshot.uiControlCount >= 10, `${snapshot.familyId}: first-wave ui coverage too low`);
}
assertFutureNativeVerificationReport(report, 'future-native-integration');

console.log('PASS future-native-integration');
console.log(JSON.stringify({ summary, verification: report.summary, firstWave: snapshots.map((snapshot) => ({ familyId: snapshot.familyId, progressPercent: snapshot.progressPercent, uiControlCount: snapshot.uiControlCount })) }, null, 2));
