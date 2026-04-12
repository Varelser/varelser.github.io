import assert from 'node:assert/strict';
import { getFutureNativeProjectRouteSummary } from '../../lib/futureNativePanelSummaries';
import { buildProjectFutureNativeCapabilityMatrix } from '../../lib/projectFutureNativeCapabilityMatrix';
import { normalizeProjectFutureNativeSpecialistRouteControls, buildDefaultProjectFutureNativeSpecialistRouteControls, buildFutureNativeSpecialistRouteControlDeltaValues, buildFutureNativeSpecialistRouteManifestDeltaValues } from '../../lib/future-native-families/futureNativeSpecialistRouteControls';
import { buildProjectFutureNativeSpecialistRouteEntries } from '../../lib/future-native-families/futureNativeFamiliesSpecialistPackets';
import { buildProjectExportHandoffManifestDeltaValues, buildProjectExportHandoffManifestSummary, buildProjectExportHandoffPacket } from '../../lib/projectExportHandoffCurrent';
import { CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT } from '../../lib/projectDistributionProofBundleCurrent';
import { CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT } from '../../lib/projectIntelMacProofCurrent';
import { CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT } from '../../lib/projectWebgpuCapabilityCurrent';

export async function main() {
  const currentConfig = {
    mode: 'flow',
    layer2Mode: 'future-native-volumetric-density-transport',
    layer3Mode: 'flow',
  } as any;

  const projectManifest = {
    schemaVersion: 1,
    serializationSchemaVersion: 1,
    layers: [],
    execution: [
      {
        enabled: true,
        key: 'layer2',
        label: 'Layer 2',
        mode: 'future-native-volumetric-density-transport',
        futureNativeFamilyId: 'volumetric-density-transport',
        futureNativeBindingMode: 'preset',
        futureNativePrimaryPresetId: 'future-native-volumetric-density-plume-weave',
        futureNativeRecommendedPresetIds: ['future-native-volumetric-density-plume-weave'],
        capabilityFlags: [],
        reason: 'unit-test',
      },
    ],
  } as any;

  const summary = getFutureNativeProjectRouteSummary(currentConfig, projectManifest);
  const matrix = buildProjectFutureNativeCapabilityMatrix(currentConfig, projectManifest, []);
  const controls = normalizeProjectFutureNativeSpecialistRouteControls();
  const defaults = buildDefaultProjectFutureNativeSpecialistRouteControls();
  const routes = buildProjectFutureNativeSpecialistRouteEntries(controls);
  const controlDiffs = new Map(controls.map((entry) => [entry.familyId, buildFutureNativeSpecialistRouteControlDeltaValues(entry, defaults)]));
  const manifestDiffs = new Map(routes.map((entry) => [entry.familyId, buildFutureNativeSpecialistRouteManifestDeltaValues(entry, undefined)]));

  const current = buildProjectExportHandoffManifestSummary({
    summary,
    matrix,
    specialistRouteEntries: routes,
    specialistRouteControlDiffsByFamily: controlDiffs,
    specialistManifestDiffsByFamily: manifestDiffs,
    distributionBundleManifestDriftCount: 1,
    webgpuReport: CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT,
    intelMacReport: CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT,
    distributionBundleReport: CURRENT_PROJECT_DISTRIBUTION_PROOF_BUNDLE_REPORT,
  });

  assert.equal(current.webgpuDirectCount, CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT.summary.direct);
  assert.equal(current.intelMacVerdict, CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.decision.verdict);
  assert.equal(current.bundleManifestDriftCount, 1);
  assert.match(buildProjectExportHandoffPacket(current), /ProjectExportHandoffPacket/);
  assert.deepEqual(buildProjectExportHandoffManifestDeltaValues(current, current), []);
  assert.ok(buildProjectExportHandoffManifestDeltaValues(undefined, current).includes('manifest:missing'));

  console.log('projectExportHandoffCurrent ok');
}
