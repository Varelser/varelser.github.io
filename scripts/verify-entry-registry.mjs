export const VERIFY_ENTRY_REGISTRY = Object.freeze({
  'verify-fracture-crack-propagation': 'scripts/verify-fracture-crack-propagation-entry.ts',
  'verify-fracture-debris-generation': 'scripts/verify-fracture-debris-generation-entry.ts',
  'verify-fracture-lattice': 'scripts/verify-fracture-lattice-entry.ts',
  'verify-fracture-voxel': 'scripts/verify-fracture-voxel-entry.ts',
  'verify-future-native-family-preview-surfaces': 'scripts/verify-future-native-family-preview-surfaces-entry.ts',
  'verify-future-native-family': 'scripts/verify-future-native-family-entry.ts',
  'verify-future-native-guardrails': 'scripts/verify-future-native-guardrails-entry.ts',
  'verify-future-native-integration': 'scripts/verify-future-native-integration-entry.ts',
  'verify-future-native-nonvolumetric-routes': 'scripts/verify-future-native-nonvolumetric-routes-entry.ts',
  'verify-future-native-project-snapshots': 'scripts/verify-future-native-project-snapshots-entry.ts',
  'verify-future-native-project-state-fast': 'scripts/verify-future-native-project-state-fast-entry.ts',
  'verify-future-native-render-handoff-fast': 'scripts/verify-future-native-render-handoff-fast-entry.ts',
  'verify-future-native-render-handoff': 'scripts/verify-future-native-render-handoff-entry.ts',
  'verify-future-native-runtime-state': 'scripts/verify-future-native-runtime-state-entry.ts',
  'verify-future-native-scene-bindings': 'scripts/verify-future-native-scene-bindings-entry.ts',
  'verify-future-native-specialist-family-previews': 'scripts/verify-future-native-specialist-family-previews-entry.ts',
  'verify-future-native-specialist-routes': 'scripts/verify-future-native-specialist-routes-entry.ts',
  'verify-future-native-specialist-runtime-export-regression': 'scripts/verify-future-native-specialist-runtime-export-regression-entry.ts',
  'verify-future-native-volumetric-routes': 'scripts/verify-future-native-volumetric-routes-entry.ts',
  'verify-mpm-granular': 'scripts/verify-mpm-granular-entry.ts',
  'verify-mpm-mud': 'scripts/verify-mpm-mud-entry.ts',
  'verify-mpm-paste': 'scripts/verify-mpm-paste-entry.ts',
  'verify-mpm-snow': 'scripts/verify-mpm-snow-entry.ts',
  'verify-mpm-viscoplastic': 'scripts/verify-mpm-viscoplastic-entry.ts',
  'verify-pbd-cloth': 'scripts/verify-pbd-cloth-entry.ts',
  'verify-pbd-membrane': 'scripts/verify-pbd-membrane-entry.ts',
  'verify-pbd-rope': 'scripts/verify-pbd-rope-entry.ts',
  'verify-pbd-softbody': 'scripts/verify-pbd-softbody-entry.ts',
  'verify-pbd-surface-integration': 'scripts/verify-pbd-surface-integration-entry.ts',
  'verify-project-state-fast': 'scripts/verify-project-state-entry.ts',
  'verify-specialist-houdini-native': 'scripts/verify-specialist-houdini-native-entry.ts',
  'verify-specialist-niagara-native': 'scripts/verify-specialist-niagara-native-entry.ts',
  'verify-specialist-touchdesigner-native': 'scripts/verify-specialist-touchdesigner-native-entry.ts',
  'verify-specialist-unity-vfx-native': 'scripts/verify-specialist-unity-vfx-native-entry.ts',
  'verify-volumetric-advection': 'scripts/verify-volumetric-advection-entry.ts',
  'verify-volumetric-density-transport': 'scripts/verify-volumetric-density-transport-entry.ts',
  'verify-volumetric-light-shadow': 'scripts/verify-volumetric-light-shadow-entry.ts',
  'verify-volumetric-pressure': 'scripts/verify-volumetric-pressure-entry.ts',
  'verify-volumetric-smoke': 'scripts/verify-volumetric-smoke-entry.ts'
});

export function getVerifyEntryPath(id) {
  return VERIFY_ENTRY_REGISTRY[id] ?? null;
}

export function getVerifyRegistryIds() {
  return Object.keys(VERIFY_ENTRY_REGISTRY);
}

export function createRegisteredVerifyStep(id) {
  return {
    label: id.replace(/^verify-/, 'verify:'),
    cmd: process.execPath,
    args: ['scripts/run-registered-verify-entry.mjs', id],
  };
}
