import type { FutureNativeFamilyId } from './futureNativeFamiliesTypes';

export interface FutureNativeNonVolumetricBundleCoverageEntry {
  familyId: FutureNativeFamilyId;
  helperArtifacts: string[];
  bundleArtifacts: string[];
  coverageLabel: string;
}

const coverageEntries: FutureNativeNonVolumetricBundleCoverageEntry[] = [
  {
    familyId: 'pbd-rope',
    helperArtifacts: ['futureNativeSceneBridgeRopePayload.ts', 'futureNativePbdRopeRoutePreview.ts'],
    bundleArtifacts: ['futureNativeScenePresetPatchesPbdRope.ts'],
    coverageLabel: 'rope-authoring-split',
  },
  {
    familyId: 'pbd-cloth',
    helperArtifacts: ['futureNativeSceneBridgePbdClothSoftbody.ts', 'futureNativePbdFamilyPreview.ts'],
    bundleArtifacts: ['futureNativeScenePresetPatchesPbdClothSoftbody.ts'],
    coverageLabel: 'cloth-family-preview-split',
  },
  {
    familyId: 'pbd-softbody',
    helperArtifacts: ['futureNativeSceneBridgePbdClothSoftbody.ts', 'futureNativePbdFamilyPreview.ts'],
    bundleArtifacts: ['futureNativeScenePresetPatchesPbdClothSoftbody.ts'],
    coverageLabel: 'softbody-family-preview-split',
  },
  {
    familyId: 'mpm-granular',
    helperArtifacts: ['futureNativeSceneBridgeMpmGranular.ts', 'futureNativeMpmFamilyPreview.ts'],
    bundleArtifacts: ['futureNativeScenePresetPatchesMpmGranular.ts', 'futureNativeSceneBridgeMpmRuntime.ts'],
    coverageLabel: 'granular-family-preview-split',
  },
  {
    familyId: 'pbd-membrane',
    helperArtifacts: ['futureNativeSceneBridgePbdMembrane.ts', 'futureNativePbdFamilyPreview.ts'],
    bundleArtifacts: ['futureNativeScenePresetPatchesPbdMembrane.ts'],
    coverageLabel: 'membrane-family-preview-split',
  },
  {
    familyId: 'mpm-viscoplastic',
    helperArtifacts: ['futureNativeSceneBridgeMpmSnowViscoplastic.ts', 'futureNativeMpmDedicatedRoutePreview.ts', 'futureNativeSceneBridgeMpmDedicatedRuntime.ts'],
    bundleArtifacts: ['futureNativeScenePresetPatchesMpmSnowViscoplastic.ts', 'futureNativeSceneBridgeMpmRuntime.ts'],
    coverageLabel: 'viscoplastic-family-preview-split',
  },
  {
    familyId: 'mpm-snow',
    helperArtifacts: ['futureNativeSceneBridgeMpmSnowViscoplastic.ts', 'futureNativeMpmDedicatedRoutePreview.ts', 'futureNativeSceneBridgeMpmDedicatedRuntime.ts'],
    bundleArtifacts: ['futureNativeScenePresetPatchesMpmSnowViscoplastic.ts', 'futureNativeSceneBridgeMpmRuntime.ts'],
    coverageLabel: 'snow-family-preview-split',
  },
  {
    familyId: 'mpm-mud',
    helperArtifacts: ['futureNativeSceneBridgeMpmMudPaste.ts', 'futureNativeMpmDedicatedRoutePreview.ts', 'futureNativeSceneBridgeMpmDedicatedRuntime.ts'],
    bundleArtifacts: ['futureNativeScenePresetPatchesMpmMudPaste.ts', 'futureNativeSceneBridgeMpmRuntime.ts'],
    coverageLabel: 'mud-family-preview-split',
  },
  {
    familyId: 'mpm-paste',
    helperArtifacts: ['futureNativeSceneBridgeMpmMudPaste.ts', 'futureNativeMpmDedicatedRoutePreview.ts', 'futureNativeSceneBridgeMpmDedicatedRuntime.ts'],
    bundleArtifacts: ['futureNativeScenePresetPatchesMpmMudPaste.ts', 'futureNativeSceneBridgeMpmRuntime.ts'],
    coverageLabel: 'paste-family-preview-split',
  },
  {
    familyId: 'fracture-lattice',
    helperArtifacts: ['futureNativeSceneBridgeFractureInputs.ts', 'futureNativeFractureLatticeReportPreview.ts'],
    bundleArtifacts: ['futureNativeScenePresetPatchesFracture.ts'],
    coverageLabel: 'lattice-preview-split',
  },
  {
    familyId: 'fracture-voxel',
    helperArtifacts: ['futureNativeSceneBridgeFractureDedicated.ts', 'futureNativeSceneBridgeFractureDedicatedRuntime.ts', 'futureNativeSceneBridgeRuntimeControl.ts', 'futureNativeFractureDedicatedReportPreview.ts'],
    bundleArtifacts: ['futureNativeScenePresetPatchesFractureDedicated.ts'],
    coverageLabel: 'voxel-family-preview-split',
  },
  {
    familyId: 'fracture-crack-propagation',
    helperArtifacts: ['futureNativeSceneBridgeFractureDedicated.ts', 'futureNativeSceneBridgeFractureDedicatedRuntime.ts', 'futureNativeSceneBridgeRuntimeControl.ts', 'futureNativeFractureDedicatedReportPreview.ts'],
    bundleArtifacts: ['futureNativeScenePresetPatchesFractureDedicated.ts'],
    coverageLabel: 'crack-family-preview-split',
  },
  {
    familyId: 'fracture-debris-generation',
    helperArtifacts: ['futureNativeSceneBridgeFractureDedicated.ts', 'futureNativeSceneBridgeFractureDedicatedRuntime.ts', 'futureNativeSceneBridgeRuntimeControl.ts', 'futureNativeFractureDedicatedReportPreview.ts'],
    bundleArtifacts: ['futureNativeScenePresetPatchesFractureDedicated.ts'],
    coverageLabel: 'debris-family-preview-split',
  },
];

const coverageMap = new Map(coverageEntries.map((entry) => [entry.familyId, entry]));

export function getFutureNativeNonVolumetricBundleCoverage(
  familyId: FutureNativeFamilyId,
): FutureNativeNonVolumetricBundleCoverageEntry | null {
  return coverageMap.get(familyId) ?? null;
}

export function listFutureNativeNonVolumetricBundleCoverage(): FutureNativeNonVolumetricBundleCoverageEntry[] {
  return [...coverageEntries];
}
