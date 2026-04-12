import assert from 'node:assert/strict';
import { buildProjectCloseoutCurrentDeltaValues, buildProjectCloseoutCurrentPacket, buildProjectCloseoutCurrentSummary } from '../../lib/projectCloseoutCurrent';
import { CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT } from '../../lib/projectDistributionProofBundleCurrent';
import { buildProjectExportHandoffManifestSummary } from '../../lib/projectExportHandoffCurrent';
import { CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT } from '../../lib/projectIntelMacProofCurrent';
import { buildProjectFutureNativeCapabilityMatrix } from '../../lib/projectFutureNativeCapabilityMatrix';
import { CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT } from '../../lib/projectWebgpuCapabilityCurrent';
import { buildProjectFutureNativeSpecialistRouteEntries } from '../../lib/future-native-families/futureNativeFamiliesSpecialistPackets';
import { buildDefaultProjectFutureNativeSpecialistRouteControls } from '../../lib/future-native-families/futureNativeSpecialistRouteControls';
import { getFutureNativeProjectRouteSummary } from '../../lib/futureNativePanelSummaries';
import { DEFAULT_CONFIG } from '../../lib/appStateConfig';

const currentConfig = DEFAULT_CONFIG;
const projectManifest = { execution: [], futureNativeSpecialistRoutes: [] } as any;
const summary = getFutureNativeProjectRouteSummary(currentConfig, projectManifest);
const matrix = buildProjectFutureNativeCapabilityMatrix(currentConfig, projectManifest, []);
const specialistRouteEntries = buildProjectFutureNativeSpecialistRouteEntries(buildDefaultProjectFutureNativeSpecialistRouteControls());
const handoffSummary = buildProjectExportHandoffManifestSummary({
  summary,
  matrix,
  specialistRouteEntries,
  specialistRouteControlDiffsByFamily: new Map(),
  specialistManifestDiffsByFamily: new Map(),
  distributionBundleManifestDriftCount: 0,
  webgpuReport: CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT,
  intelMacReport: CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT,
  distributionBundleReport: CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT,
});

const closeoutSummary = buildProjectCloseoutCurrentSummary({
  handoffSummary,
  webgpuReport: CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT,
  intelMacReport: CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT,
  distributionBundleReport: CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT,
});

assert.equal(closeoutSummary.repoReady, false);
assert.equal(closeoutSummary.overallCompletionPercent, 38);
assert.equal(closeoutSummary.recommendedResumeBundle, 'full-local-dev');
assert.equal(closeoutSummary.recommendedProofBundle, 'proof-packet-verify-status');
assert.equal(closeoutSummary.recommendedIntelMacBundle, 'proof-packet-intel-mac-closeout');
assert.match(closeoutSummary.operatorCommand, /doctor:intel-mac-live-browser-proof:refresh/);
assert.match(closeoutSummary.intakeCommand, /incoming-one-shot/);

const packet = buildProjectCloseoutCurrentPacket(closeoutSummary);
assert.match(packet, /ProjectCloseoutCurrentPacket/);
assert.match(packet, /overallCompletionPercent=38/);
assert.match(packet, /webgpu=5\/2\/18/);
assert.match(packet, /recommendedIntelMacBundle=proof-packet-intel-mac-closeout/);
assert.deepEqual(buildProjectCloseoutCurrentDeltaValues(closeoutSummary, closeoutSummary), []);
assert.ok(buildProjectCloseoutCurrentDeltaValues(undefined, closeoutSummary).includes('manifest:missing'));
assert.ok(
  buildProjectCloseoutCurrentDeltaValues(
    {
      ...closeoutSummary,
      overallCompletionPercent: closeoutSummary.overallCompletionPercent + 1,
      operatorCommand: `${closeoutSummary.operatorCommand} --old`,
    },
    closeoutSummary,
  ).includes('overallCompletionPercent'),
);
assert.ok(
  buildProjectCloseoutCurrentDeltaValues(
    {
      ...closeoutSummary,
      overallCompletionPercent: closeoutSummary.overallCompletionPercent + 1,
      operatorCommand: `${closeoutSummary.operatorCommand} --old`,
    },
    closeoutSummary,
  ).includes('operatorCommand'),
);

console.log('projectCloseoutCurrent ok');
