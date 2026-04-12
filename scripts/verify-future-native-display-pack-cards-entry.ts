import { strict as assert } from 'node:assert';
import { FUTURE_NATIVE_DISPLAY_PACK_CARDS } from '../lib/futureNativeDisplayPackCards';
import { loadFullStarterPresetLibrary } from '../lib/starterLibrary';
import {
  FUTURE_NATIVE_FAMILY_LABELS,
  getFutureNativeLibraryCounts,
  getFutureNativeSequenceCounts,
  getRepresentativePresetForFutureNativeFamily,
} from '../lib/presetCatalog';

async function main() {
const starter = await loadFullStarterPresetLibrary();
const ids = new Set<string>();

assert.equal(FUTURE_NATIVE_DISPLAY_PACK_CARDS.length, FUTURE_NATIVE_FAMILY_LABELS.length, 'display pack count mismatch');

for (const card of FUTURE_NATIVE_DISPLAY_PACK_CARDS) {
  assert(!ids.has(card.id), `duplicate display pack id: ${card.id}`);
  ids.add(card.id);
  assert(FUTURE_NATIVE_FAMILY_LABELS.includes(card.familyLabel), `unknown family label: ${card.familyLabel}`);
  assert(card.label.length > 0, `missing label for ${card.id}`);
  assert(card.summary.length > 0, `missing summary for ${card.id}`);
  assert(card.emphasis.length > 0, `missing emphasis for ${card.id}`);
  const representative = getRepresentativePresetForFutureNativeFamily(card.familyLabel, starter.presets);
  assert(representative.preset, `missing representative preset for ${card.familyLabel}`);
}

const libraryCounts = getFutureNativeLibraryCounts(starter.presets);
assert(libraryCounts.futureNativePresetCount > 0, 'future-native preset count should be positive');
for (const familyLabel of FUTURE_NATIVE_FAMILY_LABELS) {
  assert(libraryCounts.familyCounts[familyLabel] > 0, `missing presets for ${familyLabel}`);
}

const sequenceCounts = getFutureNativeSequenceCounts(starter.presetSequence, starter.presets);
assert(sequenceCounts.futureNativeStepCount > 0, 'future-native sequence count should be positive');
for (const familyLabel of FUTURE_NATIVE_FAMILY_LABELS) {
  assert(sequenceCounts.familyCounts[familyLabel] > 0, `missing sequence steps for ${familyLabel}`);
}

console.log(JSON.stringify({
  ok: true,
  displayPackCount: FUTURE_NATIVE_DISPLAY_PACK_CARDS.length,
  futureNativePresetCount: libraryCounts.futureNativePresetCount,
  futureNativeSequenceStepCount: sequenceCounts.futureNativeStepCount,
  familyPresetCounts: libraryCounts.familyCounts,
  familySequenceCounts: sequenceCounts.familyCounts,
}, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
