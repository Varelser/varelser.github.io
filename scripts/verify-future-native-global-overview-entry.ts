import { DEFAULT_CONFIG } from '../lib/appStateConfig';
import {
  loadCoreStarterPresetLibrary,
  loadStarterFutureNativeAugmentation,
  mergeStarterLibraryAugmentation,
} from '../lib/starterLibrary';
import {
  FUTURE_NATIVE_FAMILY_LABELS,
  getFutureNativeLibraryCounts,
  getFutureNativeSequenceCounts,
  getPresetFutureNativeInfo,
} from '../lib/presetCatalog';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const representativePresetIds = {
  MPM: 'future-native-mpm-granular-sand-fall',
  PBD: 'future-native-pbd-cloth-drape',
  Fracture: 'future-native-fracture-voxel-lattice',
  Volumetric: 'future-native-volumetric-smoke-prism',
} as const;

async function main() {
  const [coreLibrary, futureNativeAugmentation] = await Promise.all([
    loadCoreStarterPresetLibrary(),
    loadStarterFutureNativeAugmentation(),
  ]);
  const mergedLibrary = mergeStarterLibraryAugmentation(coreLibrary, futureNativeAugmentation);

  const libraryCounts = getFutureNativeLibraryCounts(mergedLibrary.presets);
  const sequenceCounts = getFutureNativeSequenceCounts(mergedLibrary.presetSequence, mergedLibrary.presets);

  FUTURE_NATIVE_FAMILY_LABELS.forEach((familyLabel) => {
    assert(libraryCounts.familyCounts[familyLabel] > 0, `${familyLabel}: missing library count`);
    const preset = mergedLibrary.presets.find((entry) => entry.id === representativePresetIds[familyLabel]);
    assert(preset, `${familyLabel}: representative preset missing`);
    const info = getPresetFutureNativeInfo(preset);
    assert(info, `${familyLabel}: representative info missing`);
    assert(info.familyLabel === familyLabel, `${familyLabel}: representative family mismatch (${info.familyLabel})`);
  });

  const filteredUnknownSequencePresetIds = futureNativeAugmentation.presetSequence
    .map((item) => item.presetId)
    .filter((presetId) => !mergedLibrary.presets.some((preset) => preset.id === presetId));

  assert(filteredUnknownSequencePresetIds.length === 0, 'merged library still contains unknown sequence preset ids');
  assert(sequenceCounts.futureNativeStepCount > 0, 'future-native sequence steps missing');

  console.log(JSON.stringify({
    ok: true,
    configLayer2Type: DEFAULT_CONFIG.layer2Type,
    configLayer3Type: DEFAULT_CONFIG.layer3Type,
    futureNativePresetCount: libraryCounts.futureNativePresetCount,
    futureNativeSequenceStepCount: sequenceCounts.futureNativeStepCount,
    familyCounts: libraryCounts.familyCounts,
    sequenceFamilyCounts: sequenceCounts.familyCounts,
  }, null, 2));
}

void main();
