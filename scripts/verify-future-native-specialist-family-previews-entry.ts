import { listFutureNativeSpecialistFamilyPreviews } from '../lib/future-native-families/futureNativeSpecialistFamilyPreview';

const previews = listFutureNativeSpecialistFamilyPreviews();
const requiredFamilies = [
  'specialist-houdini-native',
  'specialist-niagara-native',
  'specialist-touchdesigner-native',
  'specialist-unity-vfx-native',
];

for (const familyId of requiredFamilies) {
  const preview = previews.find((entry) => entry.familyId === familyId);
  if (!preview) throw new Error(`Missing specialist family preview: ${familyId}`);
  if (!preview.previewSignature.includes(familyId)) {
    throw new Error(`Specialist family preview signature drifted: ${familyId}`);
  }
  if (!preview.comparisonSignature.includes(familyId)) {
    throw new Error(`Specialist family comparison signature drifted: ${familyId}`);
  }
}

console.log(JSON.stringify({
  verifiedAt: new Date().toISOString(),
  specialistFamilyPreviewCount: previews.length,
  specialistFamilyIds: previews.map((entry) => entry.familyId),
}, null, 2));
