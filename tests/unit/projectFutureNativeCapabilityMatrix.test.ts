import assert from 'node:assert/strict';
import {
  buildProjectFutureNativeCapabilityMatrix,
  buildProjectFutureNativeFamilyFocusPacket,
  buildProjectFutureNativeRepresentativePresetPacket,
  buildProjectFutureNativeRouteFocusPacket,
  buildProjectFutureNativeSpecialistAdapterPacketForRow,
  buildProjectFutureNativeSpecialistComparisonPacketForRow,
  buildProjectFutureNativeSpecialistOperatorPacketForRow,
  buildProjectFutureNativeSpecialistPacket,
  buildProjectFutureNativeWarningFocusPacket,
  filterProjectFutureNativeCapabilityRows,
} from '../../lib/projectFutureNativeCapabilityMatrix';

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
    routes: [],
  } as any;

  const matrix = buildProjectFutureNativeCapabilityMatrix(currentConfig, projectManifest, []);
  const warningRows = filterProjectFutureNativeCapabilityRows(matrix, {
    warningsOnly: true,
    searchText: 'specialist',
    exposureStatus: 'all',
    statusFilter: 'all',
  });
  assert.ok(warningRows.length > 0);
  assert.ok(warningRows.every((row) => row.warnings.length > 0));
  assert.ok(warningRows.some((row) => row.familyId.startsWith('specialist-')));

  const packet = buildProjectFutureNativeWarningFocusPacket(warningRows, {
    warningsOnly: true,
    searchText: 'specialist',
    exposureStatus: 'all',
    statusFilter: 'all',
  });
  assert.match(packet, /ProjectFutureNativeWarningFocusPacket/);
  assert.match(packet, /search=specialist/);

  const focusRow = matrix.rows.find((entry) => entry.familyId === 'volumetric-density-transport');
  assert.ok(focusRow, 'expected density transport row');
  const focusPacket = buildProjectFutureNativeFamilyFocusPacket(focusRow!, currentConfig, projectManifest);
  assert.match(focusPacket, /ProjectFutureNativeFamilyFocusPacket/);
  assert.match(focusPacket, /familyId=volumetric-density-transport/);
  assert.ok(focusPacket.includes('current::') || focusPacket.includes('manifest::'));
  assert.match(focusPacket, /manifest::/);


  const presetPacket = buildProjectFutureNativeRepresentativePresetPacket(focusRow!, currentConfig, projectManifest);
  assert.match(presetPacket, /ProjectFutureNativeRepresentativePresetPacket/);
  assert.match(presetPacket, /representativePresetId=future-native-volumetric-density-plume-weave/);

  const routePacket = buildProjectFutureNativeRouteFocusPacket(focusRow!, currentConfig, projectManifest);
  assert.match(routePacket, /ProjectFutureNativeRouteFocusPacket/);
  assert.match(routePacket, /manifest::layer2::Layer 2::future-native-volumetric-density-transport::future-native-volumetric-density-plume-weave/);

  const specialistRow = matrix.rows.find((entry) => entry.familyId === 'specialist-houdini-native');
  assert.ok(specialistRow, 'expected specialist row');
  const specialistPacket = buildProjectFutureNativeSpecialistPacket(specialistRow!, currentConfig, projectManifest);
  assert.match(specialistPacket, /ProjectFutureNativeSpecialistPacket/);
  assert.match(specialistPacket, /familyId=specialist-houdini-native/);

  const specialistOperatorPacket = buildProjectFutureNativeSpecialistOperatorPacketForRow(specialistRow!);
  assert.match(specialistOperatorPacket, /FutureNativeSpecialistOperatorPacket/);
  assert.match(specialistOperatorPacket, /familyId=specialist-houdini-native/);

  const specialistAdapterPacket = buildProjectFutureNativeSpecialistAdapterPacketForRow(specialistRow!);
  assert.match(specialistAdapterPacket, /FutureNativeSpecialistAdapterPacket/);
  assert.match(specialistAdapterPacket, /adapterCount=3/);

  const specialistComparisonPacket = buildProjectFutureNativeSpecialistComparisonPacketForRow(specialistRow!);
  assert.match(specialistComparisonPacket, /FutureNativeSpecialistComparisonPacket/);
  assert.match(specialistComparisonPacket, /defaultAdapterId=surface-volume-primary/);

}