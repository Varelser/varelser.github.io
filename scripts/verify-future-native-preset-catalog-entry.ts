import {
  loadCoreStarterPresetLibrary,
  loadStarterFutureNativeAugmentation,
  mergeStarterLibraryAugmentation,
} from '../lib/starterLibrary';
import {
  FUTURE_NATIVE_LIBRARY_FILTER_OPTIONS,
  getPresetCategories,
  getPresetFutureNativeInfo,
  getPresetSearchText,
  matchesPresetFutureNativeFilter,
} from '../lib/presetCatalog';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const representativeExpectations = [
  {
    presetId: 'future-native-mpm-granular-sand-fall',
    familyLabel: 'MPM',
    expectedTerms: ['future native', 'granular', 'sand'],
  },
  {
    presetId: 'future-native-pbd-cloth-drape',
    familyLabel: 'PBD',
    expectedTerms: ['future native', 'cloth', 'drape'],
  },
  {
    presetId: 'future-native-fracture-voxel-lattice',
    familyLabel: 'Fracture',
    expectedTerms: ['future native', 'voxel', 'lattice'],
  },
  {
    presetId: 'future-native-volumetric-smoke-prism',
    familyLabel: 'Volumetric',
    expectedTerms: ['future native', 'smoke', 'prism'],
  },
] as const;

async function main() {
  const [coreLibrary, futureNativeAugmentation] = await Promise.all([
    loadCoreStarterPresetLibrary(),
    loadStarterFutureNativeAugmentation(),
  ]);
  const mergedLibrary = mergeStarterLibraryAugmentation(coreLibrary, futureNativeAugmentation);

  const familyCounts = new Map<string, number>();
  FUTURE_NATIVE_LIBRARY_FILTER_OPTIONS.forEach((option) => familyCounts.set(option, 0));
  familyCounts.set('All', mergedLibrary.presets.length);

  mergedLibrary.presets.forEach((preset) => {
    const info = getPresetFutureNativeInfo(preset);
    if (!info) return;
    familyCounts.set('Future Native', (familyCounts.get('Future Native') ?? 0) + 1);
    familyCounts.set(info.familyLabel, (familyCounts.get(info.familyLabel) ?? 0) + 1);
  });

  representativeExpectations.forEach((expectation) => {
    const preset = mergedLibrary.presets.find((entry) => entry.id === expectation.presetId);
    assert(preset, `${expectation.presetId}: preset missing from merged starter library`);

    const info = getPresetFutureNativeInfo(preset);
    assert(info, `${expectation.presetId}: future-native info missing`);
    assert(info.familyLabel === expectation.familyLabel, `${expectation.presetId}: expected ${expectation.familyLabel}, received ${info.familyLabel}`);
    assert(matchesPresetFutureNativeFilter(preset, expectation.familyLabel), `${expectation.presetId}: family filter mismatch`);
    assert(matchesPresetFutureNativeFilter(preset, 'Future Native'), `${expectation.presetId}: future-native filter mismatch`);

    const categories = getPresetCategories(preset);
    assert(categories.includes('Future Native'), `${expectation.presetId}: missing Future Native category`);
    assert(categories.includes(expectation.familyLabel), `${expectation.presetId}: missing ${expectation.familyLabel} category`);

    const searchText = getPresetSearchText(preset);
    expectation.expectedTerms.forEach((term) => {
      assert(searchText.includes(term), `${expectation.presetId}: missing search term ${term}`);
    });
  });

  assert((familyCounts.get('Future Native') ?? 0) > 0, 'future-native catalog count missing');
  assert((familyCounts.get('MPM') ?? 0) > 0, 'mpm family count missing');
  assert((familyCounts.get('PBD') ?? 0) > 0, 'pbd family count missing');
  assert((familyCounts.get('Fracture') ?? 0) > 0, 'fracture family count missing');
  assert((familyCounts.get('Volumetric') ?? 0) > 0, 'volumetric family count missing');

  console.log(JSON.stringify({
    ok: true,
    totalPresetCount: mergedLibrary.presets.length,
    futureNativeCount: familyCounts.get('Future Native') ?? 0,
    mpmCount: familyCounts.get('MPM') ?? 0,
    pbdCount: familyCounts.get('PBD') ?? 0,
    fractureCount: familyCounts.get('Fracture') ?? 0,
    volumetricCount: familyCounts.get('Volumetric') ?? 0,
  }, null, 2));
}

void main();
