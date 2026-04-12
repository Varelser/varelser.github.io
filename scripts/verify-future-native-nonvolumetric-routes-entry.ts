import { listFutureNativeFractureDedicatedReportPreviews } from '../lib/future-native-families/futureNativeFractureDedicatedReportPreview';
import { listFutureNativeMpmDedicatedRoutePreviews } from '../lib/future-native-families/futureNativeMpmDedicatedRoutePreview';
import { buildFutureNativePbdMembraneRoutePreview } from '../lib/future-native-families/futureNativePbdMembraneRoutePreview';
import { listFutureNativeMpmFamilyPreviews } from '../lib/future-native-families/futureNativeMpmFamilyPreview';
import { listFutureNativeFractureFamilyPreviews } from '../lib/future-native-families/futureNativeFractureFamilyPreview';
import { buildFutureNativePbdFamilyPreview } from '../lib/future-native-families/futureNativePbdFamilyPreview';
import { buildProjectNonVolumetricRouteHighlights } from '../lib/future-native-families/futureNativeNonVolumetricRouteHighlights';
import { buildFutureNativeNonVolumetricRouteTrendGroups } from '../lib/future-native-families/futureNativeNonVolumetricRouteGroupTrend';

const highlights = buildProjectNonVolumetricRouteHighlights();
const missingProfiles = highlights.filter((entry) => entry.profiles.length === 0);
const missingPrimaryPresets = highlights.filter((entry) => entry.profiles.some((profile) => !profile.primaryPresetId));
const missingPresetIds = highlights.filter((entry) => entry.profiles.some((profile) => profile.presetIds.length === 0));

if (missingProfiles.length > 0) {
  throw new Error(`Future-native non-volumetric route highlights missing profiles: ${missingProfiles.map((entry) => entry.familyId).join(', ')}`);
}
if (missingPrimaryPresets.length > 0) {
  throw new Error(`Future-native non-volumetric route highlights missing primary presets: ${missingPrimaryPresets.map((entry) => entry.familyId).join(', ')}`);
}
if (missingPresetIds.length > 0) {
  throw new Error(`Future-native non-volumetric route highlights missing preset ids: ${missingPresetIds.map((entry) => entry.familyId).join(', ')}`);
}

const groupSummaries = buildFutureNativeNonVolumetricRouteTrendGroups();
const missingGroups = ['mpm', 'fracture'].filter((group) => !groupSummaries.some((entry) => entry.group === group));
if (missingGroups.length > 0) {
  throw new Error(`Future-native non-volumetric group summaries missing groups: ${missingGroups.join(', ')}`);
}
const requiredCoverageFamilies = ['mpm-granular', 'mpm-viscoplastic', 'mpm-snow', 'mpm-mud', 'mpm-paste', 'fracture-voxel', 'fracture-crack-propagation', 'fracture-debris-generation'] as const;
const mpmDedicatedPreviews = listFutureNativeMpmDedicatedRoutePreviews();
const fractureDedicatedPreviews = listFutureNativeFractureDedicatedReportPreviews();
const membranePreview = buildFutureNativePbdMembraneRoutePreview();
const mpmFamilyPreviews = listFutureNativeMpmFamilyPreviews();
const fractureFamilyPreviews = listFutureNativeFractureFamilyPreviews();
const membraneFamilyPreview = buildFutureNativePbdFamilyPreview('pbd-membrane');
const requiredHighBandCoverageFamilies = ['fracture-lattice'] as const;
const missingLowBandFamilies = requiredCoverageFamilies.filter((familyId) => !groupSummaries.some((group) => group.lowBandFamilies.some((entry) => entry.familyId === familyId)));
if (missingLowBandFamilies.length > 0) {
  throw new Error(`Future-native non-volumetric group summaries missing low-band families: ${missingLowBandFamilies.join(', ')}`);
}

const missingBundleCoverage = requiredCoverageFamilies.filter((familyId) => {
  const summary = groupSummaries.flatMap((group) => group.lowBandFamilies).find((entry) => entry.familyId === familyId);
  return !summary || summary.helperArtifacts.length === 0 || summary.bundleArtifacts.length === 0 || !summary.coverageLabel;
});
if (missingBundleCoverage.length > 0) {
  throw new Error(`Future-native non-volumetric group summaries missing helper/bundle coverage: ${missingBundleCoverage.join(', ')}`);
}

const requiredSurfaceCoverageFamilies = ['pbd-rope', 'pbd-cloth', 'pbd-membrane', 'pbd-softbody'] as const;
const missingSurfaceCoverage = requiredSurfaceCoverageFamilies.filter((familyId) => {
  const highlight = highlights.find((entry) => entry.familyId === familyId);
  return !highlight || highlight.helperArtifacts.length === 0 || highlight.bundleArtifacts.length === 0 || !highlight.coverageLabel;
});
if (missingSurfaceCoverage.length > 0) {
  throw new Error(`Future-native non-volumetric route highlights missing surface coverage: ${missingSurfaceCoverage.join(', ')}`);
}

const missingHighlightCoverage = requiredCoverageFamilies.filter((familyId) => {
  const highlight = highlights.find((entry) => entry.familyId === familyId);
  return !highlight || highlight.helperArtifacts.length === 0 || highlight.bundleArtifacts.length === 0 || !highlight.coverageLabel;
});
if (missingHighlightCoverage.length > 0) {
  throw new Error(`Future-native non-volumetric route highlights missing generated coverage: ${missingHighlightCoverage.join(', ')}`);
}

const missingHighBandCoverage = requiredHighBandCoverageFamilies.filter((familyId) => {
  const highlight = highlights.find((entry) => entry.familyId === familyId);
  return !highlight || highlight.helperArtifacts.length === 0 || highlight.bundleArtifacts.length === 0 || !highlight.coverageLabel;
});
if (missingHighBandCoverage.length > 0) {
  throw new Error(`Future-native non-volumetric route highlights missing high-band coverage: ${missingHighBandCoverage.join(', ')}`);
}



const missingMpmFamilyPreviews = ['mpm-viscoplastic', 'mpm-snow', 'mpm-mud', 'mpm-paste'].filter((familyId) => !mpmFamilyPreviews.some((entry) => entry.familyId === familyId && entry.previewSignature.includes(familyId)));
if (missingMpmFamilyPreviews.length > 0) {
  throw new Error(`Future-native MPM family preview surfaces missing: ${missingMpmFamilyPreviews.join(', ')}`);
}
const missingFractureFamilyPreviews = ['fracture-voxel', 'fracture-crack-propagation', 'fracture-debris-generation'].filter((familyId) => !fractureFamilyPreviews.some((entry) => entry.familyId === familyId && entry.previewSignature.includes(familyId)));
if (missingFractureFamilyPreviews.length > 0) {
  throw new Error(`Future-native fracture family preview surfaces missing: ${missingFractureFamilyPreviews.join(', ')}`);
}
if (!membraneFamilyPreview.previewSignature.includes('pbd-membrane')) {
  throw new Error('Future-native membrane family preview surface missing membrane label');
}

const missingMpmDedicatedPreviews = ['mpm-viscoplastic', 'mpm-snow', 'mpm-mud', 'mpm-paste'].filter((familyId) => !mpmDedicatedPreviews.some((entry) => entry.familyId === familyId && entry.previewSignature.length > 0));
if (missingMpmDedicatedPreviews.length > 0) {
  throw new Error(`Future-native MPM dedicated previews missing: ${missingMpmDedicatedPreviews.join(', ')}`);
}
const missingFractureDedicatedPreviews = ['fracture-voxel', 'fracture-crack-propagation', 'fracture-debris-generation'].filter((familyId) => !fractureDedicatedPreviews.some((entry) => entry.familyId === familyId && entry.previewSignature.length > 0));
if (missingFractureDedicatedPreviews.length > 0) {
  throw new Error(`Future-native fracture dedicated previews missing: ${missingFractureDedicatedPreviews.join(', ')}`);
}
if (!membranePreview.previewSignature.includes('membrane')) {
  throw new Error('Future-native membrane preview signature missing membrane label');
}

const summary = {
  highlightCount: highlights.length,
  routeCount: highlights.reduce((sum, entry) => sum + entry.routeCount, 0),
  presetCount: highlights.reduce((sum, entry) => sum + entry.presetCount, 0),
  groupCount: groupSummaries.length,
  lowBandFamilyCount: groupSummaries.reduce((sum, entry) => sum + entry.lowBandFamilies.length, 0),
  bundleCoverageCount: groupSummaries.reduce((sum, entry) => sum + entry.lowBandFamilies.filter((family) => family.coverageLabel).length, 0),
  surfaceCoverageCount: highlights.filter((entry) => ['pbd-cloth', 'pbd-membrane', 'pbd-softbody'].includes(entry.familyId) && entry.coverageLabel).length,
  dedicatedPreviewCount: mpmDedicatedPreviews.length + fractureDedicatedPreviews.length + 1,
  familyPreviewCount: mpmFamilyPreviews.length + fractureFamilyPreviews.length + 1,
};

console.log(JSON.stringify(summary, null, 2));
