import { buildIntegratedFamilySnapshot } from '../lib/future-native-families/futureNativeFamiliesIntegrationSnapshots';
import { buildProjectFutureNativeIntegrationSnapshot } from '../lib/future-native-families/futureNativeFamiliesIntegrationProject';
import { buildFutureNativeProjectSnapshotReport } from '../lib/future-native-families/futureNativeFamiliesProjectReport';
import { getFutureNativeRecommendedPresetIds, getFutureNativeSceneBinding } from '../lib/future-native-families/futureNativeSceneBindings';
import type { Layer2Type } from '../types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const modeCases: Array<{
  mode: Layer2Type;
  familyId: 'pbd-cloth' | 'pbd-membrane' | 'pbd-softbody';
  bindingMode: 'native-surface';
  presetId: string;
}> = [
  { mode: 'cloth_membrane', familyId: 'pbd-cloth', bindingMode: 'native-surface', presetId: 'future-native-pbd-cloth-drape' },
  { mode: 'elastic_sheet', familyId: 'pbd-membrane', bindingMode: 'native-surface', presetId: 'future-native-pbd-membrane-elastic' },
  { mode: 'viscoelastic_membrane', familyId: 'pbd-membrane', bindingMode: 'native-surface', presetId: 'future-native-pbd-membrane-memory' },
  { mode: 'surface_shell', familyId: 'pbd-softbody', bindingMode: 'native-surface', presetId: 'future-native-pbd-softbody-shell' },
  { mode: 'elastic_lattice', familyId: 'pbd-softbody', bindingMode: 'native-surface', presetId: 'future-native-pbd-softbody-lattice' },
];

const familyCases: Array<{
  familyId: 'pbd-cloth' | 'pbd-membrane' | 'pbd-softbody';
  runtimePrefixes: readonly string[];
  minUiControls: number;
}> = [
  { familyId: 'pbd-cloth', runtimePrefixes: ['pinMode:', 'tearBias:', 'obstaclePreset:'], minUiControls: 18 },
  { familyId: 'pbd-membrane', runtimePrefixes: ['anchorMode:', 'inflation:', 'tearBias:'], minUiControls: 18 },
  { familyId: 'pbd-softbody', runtimePrefixes: ['volume:', 'cluster:', 'obstaclePreset:'], minUiControls: 18 },
];

for (const testCase of modeCases) {
  const binding = getFutureNativeSceneBinding(testCase.mode);
  assert(binding, `${testCase.mode}: scene binding missing`);
  assert(binding.familyId === testCase.familyId, `${testCase.mode}: family mismatch`);
  assert(binding.bindingMode === testCase.bindingMode, `${testCase.mode}: binding mode mismatch`);
  const recommendedPresetIds = getFutureNativeRecommendedPresetIds(testCase.mode);
  assert(recommendedPresetIds.includes(testCase.presetId), `${testCase.mode}: preset recommendation missing primary`);
}

const report = buildFutureNativeProjectSnapshotReport();

for (const familyCase of familyCases) {
  const integrated = buildIntegratedFamilySnapshot(familyCase.familyId);
  const projectSnapshot = buildProjectFutureNativeIntegrationSnapshot(familyCase.familyId);
  assert(integrated.currentStage === 'project-integrated', `${familyCase.familyId}: integrated stage mismatch`);
  assert(projectSnapshot.stage === 'project-integrated', `${familyCase.familyId}: project snapshot stage mismatch`);
  assert(integrated.integrationReady, `${familyCase.familyId}: integrated snapshot should be ready`);
  assert(projectSnapshot.integrationReady, `${familyCase.familyId}: project snapshot should be ready`);
  assert(integrated.uiControlCount >= familyCase.minUiControls, `${familyCase.familyId}: integrated ui coverage too low`);
  assert(projectSnapshot.uiControlCount >= familyCase.minUiControls, `${familyCase.familyId}: project snapshot ui coverage too low`);
  for (const prefix of familyCase.runtimePrefixes) {
    assert(integrated.runtimeConfigBlock.values.some((value) => value.startsWith(prefix)), `${familyCase.familyId}: integrated runtime config ${prefix} missing`);
    assert(projectSnapshot.runtimeConfig.values.some((value) => value.startsWith(prefix)), `${familyCase.familyId}: project snapshot runtime config ${prefix} missing`);
  }
  const baselineEntry = report.baseline.firstWave.find((entry) => entry.familyId === familyCase.familyId);
  assert(baselineEntry, `${familyCase.familyId}: baseline project snapshot missing`);
  assert(baselineEntry.stage === 'project-integrated', `${familyCase.familyId}: baseline stage mismatch`);
  assert(baselineEntry.uiControlCount >= familyCase.minUiControls, `${familyCase.familyId}: baseline ui coverage too low`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      families: familyCases.map(({ familyId }) => {
        const integrated = buildIntegratedFamilySnapshot(familyId);
        return {
          familyId,
          currentStage: integrated.currentStage,
          progressPercent: integrated.progressPercent,
          uiControlCount: integrated.uiControlCount,
        };
      }),
    },
    null,
    2,
  ),
);
