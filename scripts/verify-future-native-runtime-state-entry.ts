import {
  assertFutureNativeVerificationReport,
  verifyAllProjectFutureNativeIntegrationSnapshots,
} from '../lib/future-native-families/futureNativeFamiliesVerifier';
import { buildAllProjectFutureNativeIntegrationSnapshots } from '../lib/future-native-families/futureNativeFamiliesIntegration';

const snapshots = buildAllProjectFutureNativeIntegrationSnapshots();
const report = verifyAllProjectFutureNativeIntegrationSnapshots(snapshots);
assertFutureNativeVerificationReport(report, 'future-native-runtime-state');

console.log('PASS future-native-runtime-state');
console.log(JSON.stringify({
  summary: report.summary,
  firstWave: snapshots.map((snapshot) => ({
    familyId: snapshot.familyId,
    runtimeConfigValues: snapshot.runtimeConfig.values.length,
    runtimeStateValues: snapshot.runtimeState.values.length,
    statsKeys: snapshot.statsKeys.length,
  })),
}, null, 2));
