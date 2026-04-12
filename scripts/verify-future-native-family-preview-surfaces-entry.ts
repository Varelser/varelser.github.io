import { listFutureNativeMpmFamilyPreviews } from '../lib/future-native-families/futureNativeMpmFamilyPreview';
import { listFutureNativeFractureFamilyPreviews } from '../lib/future-native-families/futureNativeFractureFamilyPreview';
import { listFutureNativePbdFamilyPreviews } from '../lib/future-native-families/futureNativePbdFamilyPreview';
import { buildFutureNativeMpmDedicatedSurfaceReport } from '../lib/future-native-families/futureNativeMpmDedicatedSurfaceReport';
import { buildFutureNativeFractureDedicatedSurfaceReport } from '../lib/future-native-families/futureNativeFractureDedicatedSurfaceReport';
import { listFutureNativeVolumetricFamilyPreviews } from '../lib/future-native-families/futureNativeVolumetricFamilyPreview';

const mpm = listFutureNativeMpmFamilyPreviews();
const fracture = listFutureNativeFractureFamilyPreviews();
const pbd = listFutureNativePbdFamilyPreviews();
const volumetric = listFutureNativeVolumetricFamilyPreviews();
const mpmDedicated = buildFutureNativeMpmDedicatedSurfaceReport();
const fractureDedicated = buildFutureNativeFractureDedicatedSurfaceReport();

const missingMpm = mpm.filter((entry) => entry.previewSignature.length === 0 || entry.routeCount === 0 || entry.presetCount === 0);
if (missingMpm.length > 0) throw new Error(`Future-native MPM family previews incomplete: ${missingMpm.map((entry) => entry.familyId).join(', ')}`);
const missingFracture = fracture.filter((entry) => entry.previewSignature.length === 0 || entry.routeCount === 0 || entry.presetCount === 0);
if (missingFracture.length > 0) throw new Error(`Future-native fracture family previews incomplete: ${missingFracture.map((entry) => entry.familyId).join(', ')}`);
const missingPbd = pbd.filter((entry) => entry.previewSignature.length === 0 || entry.routeCount === 0 || entry.presetCount === 0);
if (missingPbd.length > 0) throw new Error(`Future-native PBD family previews incomplete: ${missingPbd.map((entry) => entry.familyId).join(', ')}`);
const missingVolumetric = volumetric.filter((entry) => entry.previewSignature.length === 0 || entry.routeCount === 0 || entry.presetCount === 0 || entry.helperArtifacts.length === 0 || entry.bundleArtifacts.length === 0);
if (missingVolumetric.length > 0) throw new Error(`Future-native volumetric family previews incomplete: ${missingVolumetric.map((entry) => entry.familyId).join(', ')}`);

console.log(JSON.stringify({
  mpmFamilyPreviewCount: mpm.length,
  fractureFamilyPreviewCount: fracture.length,
  pbdFamilyPreviewCount: pbd.length,
  volumetricFamilyPreviewCount: volumetric.length,
  mpmDedicatedFamilyPreviewCount: mpmDedicated.families.length,
  mpmDedicatedRouteCount: mpmDedicated.summary.routeCount,
  mpmDedicatedCoverageCount: mpmDedicated.summary.coverageCount,
  fractureDedicatedFamilyPreviewCount: fractureDedicated.families.length,
  fractureDedicatedRouteCount: fractureDedicated.summary.routeCount,
  fractureDedicatedCoverageCount: fractureDedicated.summary.coverageCount,
}, null, 2));

const incompleteDedicatedMpmFamilies = mpmDedicated.families.filter((entry) => entry.coverageLabel === null || entry.helperArtifacts.length === 0 || entry.bundleArtifacts.length === 0 || entry.routes.some((route) => route.previewSignature.length === 0 || route.warmFrameCountMin <= 0 || route.warmFrameCountMax < route.warmFrameCountMin));
if (incompleteDedicatedMpmFamilies.length > 0) throw new Error(`Future-native MPM dedicated shared-core previews incomplete: ${incompleteDedicatedMpmFamilies.map((entry) => entry.familyId).join(', ')}`);

const incompleteDedicatedFractureFamilies = fractureDedicated.families.filter((entry) => entry.coverageLabel === null || entry.helperArtifacts.length === 0 || entry.bundleArtifacts.length === 0 || entry.routes.some((route) => route.previewSignature.length === 0 || route.brokenBondCount <= 0 || route.simulationSteps <= 0));
if (incompleteDedicatedFractureFamilies.length > 0) throw new Error(`Future-native fracture dedicated shared-core previews incomplete: ${incompleteDedicatedFractureFamilies.map((entry) => entry.familyId).join(', ')}`);
