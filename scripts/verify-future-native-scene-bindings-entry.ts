import { DEFAULT_CONFIG, normalizeConfig } from '../lib/appStateConfig';
import { buildProjectExecutionRoutingMap } from '../lib/projectExecutionRouting';
import {
  buildFutureNativeScenePresetPatch,
  getFutureNativeRecommendedPresetIds,
  getFutureNativeSceneBinding,
  getFutureNativeScenePresetBindings,
} from '../lib/future-native-families/futureNativeSceneBindings';
import {
  buildVolumetricDensityTransportInput,
  buildVolumetricLightShadowCouplingInput,
  buildVolumetricPressureCouplingInput,
  buildVolumetricSmokeInput,
} from '../lib/future-native-families/futureNativeSceneBridgeVolumetricInputs';
import type { Layer2Type, ParticleConfig } from '../types';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const cases: Array<{ mode: Layer2Type; familyId: string; bindingMode: string; presetId: string }> = [
  { mode: 'cloth_membrane', familyId: 'pbd-cloth', bindingMode: 'native-surface', presetId: 'future-native-pbd-cloth-drape' },
  { mode: 'elastic_sheet', familyId: 'pbd-membrane', bindingMode: 'native-surface', presetId: 'future-native-pbd-membrane-elastic' },
  { mode: 'viscoelastic_membrane', familyId: 'pbd-membrane', bindingMode: 'native-surface', presetId: 'future-native-pbd-membrane-memory' },
  { mode: 'surface_shell', familyId: 'pbd-softbody', bindingMode: 'native-surface', presetId: 'future-native-pbd-softbody-shell' },
  { mode: 'elastic_lattice', familyId: 'pbd-softbody', bindingMode: 'native-surface', presetId: 'future-native-pbd-softbody-lattice' },
  { mode: 'plasma_thread', familyId: 'pbd-rope', bindingMode: 'native-structure', presetId: 'future-native-pbd-rope-plasma-thread' },
  { mode: 'signal_braid', familyId: 'pbd-rope', bindingMode: 'native-structure', presetId: 'future-native-pbd-rope-signal-braid' },
  { mode: 'aurora_threads', familyId: 'pbd-rope', bindingMode: 'native-structure', presetId: 'future-native-pbd-rope-aurora-threads' },
  { mode: 'granular_fall', familyId: 'mpm-granular', bindingMode: 'native-particles', presetId: 'future-native-mpm-granular-sand-fall' },
  { mode: 'jammed_pack', familyId: 'mpm-granular', bindingMode: 'native-particles', presetId: 'future-native-mpm-granular-jammed-pack' },
  { mode: 'viscous_flow', familyId: 'mpm-viscoplastic', bindingMode: 'native-particles', presetId: 'future-native-mpm-viscoplastic-viscous-flow' },
  { mode: 'melt_front', familyId: 'mpm-viscoplastic', bindingMode: 'native-particles', presetId: 'future-native-mpm-viscoplastic-melt-front' },
  { mode: 'evaporative_sheet', familyId: 'mpm-viscoplastic', bindingMode: 'native-particles', presetId: 'future-native-mpm-viscoplastic-evaporative-sheet' },
  { mode: 'ashfall', familyId: 'mpm-snow', bindingMode: 'native-particles', presetId: 'future-native-mpm-snow-ashfall' },
  { mode: 'sediment_stack', familyId: 'mpm-mud', bindingMode: 'native-particles', presetId: 'future-native-mpm-mud-sediment-stack' },
  { mode: 'talus_heap', familyId: 'mpm-mud', bindingMode: 'native-particles', presetId: 'future-native-mpm-mud-talus-heap' },
  { mode: 'liquid_smear', familyId: 'mpm-mud', bindingMode: 'native-particles', presetId: 'future-native-mpm-mud-liquid-smear' },
  { mode: 'capillary_sheet', familyId: 'mpm-paste', bindingMode: 'native-particles', presetId: 'future-native-mpm-paste-capillary-sheet' },
  { mode: 'percolation_sheet', familyId: 'mpm-paste', bindingMode: 'native-particles', presetId: 'future-native-mpm-paste-percolation-sheet' },
  { mode: 'crawl_seep', familyId: 'mpm-paste', bindingMode: 'native-particles', presetId: 'future-native-mpm-paste-crawl-seep' },
  { mode: 'frost_lattice', familyId: 'mpm-snow', bindingMode: 'native-particles', presetId: 'future-native-mpm-snow-frost-lattice' },
  { mode: 'avalanche_field', familyId: 'mpm-snow', bindingMode: 'native-particles', presetId: 'future-native-mpm-snow-avalanche-field' },
  { mode: 'fracture_grammar', familyId: 'fracture-lattice', bindingMode: 'native-structure', presetId: 'future-native-fracture-lattice-grammar' },
  { mode: 'collapse_fracture', familyId: 'fracture-lattice', bindingMode: 'native-structure', presetId: 'future-native-fracture-lattice-collapse' },
  { mode: 'voxel_lattice', familyId: 'fracture-voxel', bindingMode: 'native-structure', presetId: 'future-native-fracture-voxel-lattice' },
  { mode: 'seep_fracture', familyId: 'fracture-crack-propagation', bindingMode: 'native-structure', presetId: 'future-native-fracture-crack-propagation-seep' },
  { mode: 'shard_debris', familyId: 'fracture-debris-generation', bindingMode: 'native-structure', presetId: 'future-native-fracture-debris-generation-shard' },
  { mode: 'orbit_fracture', familyId: 'fracture-debris-generation', bindingMode: 'native-structure', presetId: 'future-native-fracture-debris-generation-orbit' },
  { mode: 'fracture_pollen', familyId: 'fracture-debris-generation', bindingMode: 'native-structure', presetId: 'future-native-fracture-debris-generation-pollen' },
  { mode: 'volume_fog', familyId: 'volumetric-density-transport', bindingMode: 'native-volume', presetId: 'future-native-volumetric-density-plume-weave' },
  { mode: 'prism_smoke', familyId: 'volumetric-smoke', bindingMode: 'native-volume', presetId: 'future-native-volumetric-smoke-prism' },
  { mode: 'static_smoke', familyId: 'volumetric-smoke', bindingMode: 'native-volume', presetId: 'future-native-volumetric-smoke-static-slab' },
  { mode: 'condense_field', familyId: 'volumetric-advection', bindingMode: 'native-volume', presetId: 'future-native-volumetric-condense-field' },
  { mode: 'sublimate_cloud', familyId: 'volumetric-advection', bindingMode: 'native-volume', presetId: 'future-native-volumetric-sublimate-cloud' },
  { mode: 'vortex_transport', familyId: 'volumetric-pressure-coupling', bindingMode: 'native-volume', presetId: 'future-native-volumetric-pressure-vortex-column' },
  { mode: 'pressure_cells', familyId: 'volumetric-pressure-coupling', bindingMode: 'native-volume', presetId: 'future-native-volumetric-pressure-cells-basin' },
  { mode: 'charge_veil', familyId: 'volumetric-light-shadow-coupling', bindingMode: 'native-volume', presetId: 'future-native-volumetric-light-charge-veil' },
  { mode: 'velvet_ash', familyId: 'volumetric-light-shadow-coupling', bindingMode: 'native-volume', presetId: 'future-native-volumetric-shadow-velvet-ash' },
];

const report = cases.map(({ mode, familyId, bindingMode, presetId }) => {
  const binding = getFutureNativeSceneBinding(mode);
  assert(binding, `${mode}: scene binding missing`);
  const sceneBinding = binding!;
  assert(sceneBinding.familyId === familyId, `${mode}: family mismatch`);
  assert(sceneBinding.bindingMode === bindingMode, `${mode}: binding mode mismatch`);
  assert(sceneBinding.primaryPresetId === presetId, `${mode}: preset mismatch`);

  const presets = getFutureNativeScenePresetBindings(mode);
  assert(presets.some((preset) => preset.id === presetId), `${mode}: preset list missing primary preset`);

  if (mode === 'volume_fog') {
    assert(presets.length >= 3, `${mode}: density transport preset bundles missing`);
    const densityProfiles = presets.map((preset) => {
      const densityPatch = buildFutureNativeScenePresetPatch(preset.id, 2);
      assert(densityPatch, `${mode}:${preset.id}: density preset patch missing`);
      const densityConfig = normalizeConfig(densityPatch);
      const input = buildVolumetricDensityTransportInput(densityConfig, 2);
      return {
        id: preset.id,
        fogDensity: (densityPatch as Record<string, unknown>).layer2FogDensity,
        fogGlow: (densityPatch as Record<string, unknown>).layer2FogGlow,
        advectionStrength: input.advectionStrength,
        shadowStrength: input.shadowStrength,
        obstacleStrength: input.obstacleStrength,
      };
    });
    assert(new Set(densityProfiles.map((profile) => String(profile.fogDensity))).size >= 2, `${mode}: density preset density variety missing`);
    assert(new Set(densityProfiles.map((profile) => String(profile.fogGlow))).size >= 2, `${mode}: density preset glow variety missing`);
    assert(new Set(densityProfiles.map((profile) => (profile.advectionStrength ?? 0).toFixed(3))).size >= 2, `${mode}: density preset advection variety missing`);
    assert(new Set(densityProfiles.map((profile) => (profile.shadowStrength ?? 0).toFixed(3))).size >= 2, `${mode}: density preset shadow variety missing`);
    assert(new Set(densityProfiles.map((profile) => (profile.obstacleStrength ?? 0).toFixed(3))).size >= 2, `${mode}: density preset obstacle variety missing`);
  }

  if (mode === 'prism_smoke' || mode === 'static_smoke') {
    assert(presets.length >= 3, `${mode}: smoke authoring preset bundles missing`);
    const smokeProfiles = presets.map((preset) => {
      const smokePatch = buildFutureNativeScenePresetPatch(preset.id, 2);
      assert(smokePatch, `${mode}:${preset.id}: smoke preset patch missing`);
      const smokeConfig = normalizeConfig(smokePatch);
      const input = buildVolumetricSmokeInput(smokeConfig, 2);
      return {
        id: preset.id,
        fogDensity: (smokePatch as Record<string, unknown>).layer2FogDensity,
        fogGlow: (smokePatch as Record<string, unknown>).layer2FogGlow,
        obstacleStrength: input.obstacleStrength,
        lightMarchSteps: input.lightMarchSteps,
      };
    });
    const uniqueFogDensity = new Set(smokeProfiles.map((profile) => String(profile.fogDensity))).size;
    const uniqueFogGlow = new Set(smokeProfiles.map((profile) => String(profile.fogGlow))).size;
    const uniqueObstacleStrength = new Set(smokeProfiles.map((profile) => (profile.obstacleStrength ?? 0).toFixed(3))).size;
    assert(uniqueFogDensity >= 2, `${mode}: smoke preset density variety missing`);
    assert(uniqueFogGlow >= 2, `${mode}: smoke preset glow variety missing`);
    assert(uniqueObstacleStrength >= 2, `${mode}: smoke preset obstacle variety missing`);
  }
  if (mode === 'condense_field' || mode === 'sublimate_cloud') {
    assert(presets.length >= 3, `${mode}: advection authoring preset bundles missing`);
    const advectionProfiles = presets.map((preset) => {
      const advectionPatch = buildFutureNativeScenePresetPatch(preset.id, 2);
      assert(advectionPatch, `${mode}:${preset.id}: advection preset patch missing`);
      const advectionConfig = normalizeConfig(advectionPatch);
      const input = buildVolumetricDensityTransportInput(advectionConfig, 2);
      return {
        id: preset.id,
        fogDensity: (advectionPatch as Record<string, unknown>).layer2FogDensity,
        fogGlow: (advectionPatch as Record<string, unknown>).layer2FogGlow,
        obstacleStrength: input.obstacleStrength,
        buoyancy: input.buoyancy,
      };
    });
    const uniqueFogDensity = new Set(advectionProfiles.map((profile) => String(profile.fogDensity))).size;
    const uniqueFogGlow = new Set(advectionProfiles.map((profile) => String(profile.fogGlow))).size;
    const uniqueObstacleStrength = new Set(advectionProfiles.map((profile) => (profile.obstacleStrength ?? 0).toFixed(3))).size;
    const uniqueBuoyancy = new Set(advectionProfiles.map((profile) => (profile.buoyancy ?? 0).toFixed(3))).size;
    assert(uniqueFogDensity >= 2, `${mode}: advection preset density variety missing`);
    assert(uniqueFogGlow >= 2, `${mode}: advection preset glow variety missing`);
    assert(uniqueObstacleStrength >= 2, `${mode}: advection preset obstacle variety missing`);
    assert(uniqueBuoyancy >= 2, `${mode}: advection preset buoyancy variety missing`);
  }
  if (mode === 'vortex_transport' || mode === 'pressure_cells') {
    assert(presets.length >= 3, `${mode}: pressure authoring preset bundles missing`);
    const pressureProfiles = presets.map((preset) => {
      const pressurePatch = buildFutureNativeScenePresetPatch(preset.id, 2);
      assert(pressurePatch, `${mode}:${preset.id}: pressure preset patch missing`);
      const pressureConfig = normalizeConfig(pressurePatch);
      const input = buildVolumetricPressureCouplingInput(pressureConfig, 2);
      return {
        id: preset.id,
        fogDensity: (pressurePatch as Record<string, unknown>).layer2FogDensity,
        fogGlow: (pressurePatch as Record<string, unknown>).layer2FogGlow,
        pressureRelaxation: input.pressureRelaxation,
        obstacleStrength: input.obstacleStrength,
      };
    });
    const uniqueFogDensity = new Set(pressureProfiles.map((profile) => String(profile.fogDensity))).size;
    const uniqueFogGlow = new Set(pressureProfiles.map((profile) => String(profile.fogGlow))).size;
    const uniquePressureRelaxation = new Set(pressureProfiles.map((profile) => (profile.pressureRelaxation ?? 0).toFixed(3))).size;
    const uniqueObstacleStrength = new Set(pressureProfiles.map((profile) => (profile.obstacleStrength ?? 0).toFixed(3))).size;
    assert(uniqueFogDensity >= 2, `${mode}: pressure preset density variety missing`);
    assert(uniqueFogGlow >= 2, `${mode}: pressure preset glow variety missing`);
    assert(uniquePressureRelaxation >= 2, `${mode}: pressure preset projection variety missing`);
    assert(uniqueObstacleStrength >= 2, `${mode}: pressure preset obstacle variety missing`);
  }
  if (mode === 'charge_veil' || mode === 'velvet_ash') {
    assert(presets.length >= 3, `${mode}: light-shadow authoring preset bundles missing`);
    const lightShadowProfiles = presets.map((preset) => {
      const patch = buildFutureNativeScenePresetPatch(preset.id, 2);
      assert(patch, `${mode}:${preset.id}: light-shadow preset patch missing`);
      const input = buildVolumetricLightShadowCouplingInput(normalizeConfig(patch), 2);
      return {
        fogDensity: (patch as Record<string, unknown>).layer2FogDensity,
        fogGlow: (patch as Record<string, unknown>).layer2FogGlow,
        lightAbsorption: input.lightAbsorption,
        shadowStrength: input.shadowStrength,
      };
    });
    assert(new Set(lightShadowProfiles.map((profile) => String(profile.fogDensity))).size >= 2, `${mode}: light-shadow preset density variety missing`);
    assert(new Set(lightShadowProfiles.map((profile) => String(profile.fogGlow))).size >= 2, `${mode}: light-shadow preset glow variety missing`);
    assert(new Set(lightShadowProfiles.map((profile) => (profile.lightAbsorption ?? 0).toFixed(3))).size >= 2, `${mode}: light-shadow preset absorption variety missing`);
    assert(new Set(lightShadowProfiles.map((profile) => (profile.shadowStrength ?? 0).toFixed(3))).size >= 2, `${mode}: light-shadow preset shadow variety missing`);
  }

  const patch = buildFutureNativeScenePresetPatch(presetId, 2);
  assert(patch, `${mode}: preset patch missing`);
  assert((patch as Record<string, unknown>).layer2Type === mode, `${mode}: preset patch should preserve mode`);

  const config: ParticleConfig = {
    ...DEFAULT_CONFIG,
    layer2Enabled: true,
    layer2Type: mode,
    layer2ExecutionEngineOverride: 'auto',
  };
  const routing = buildProjectExecutionRoutingMap(config).layer2;

  assert(routing.futureNativeFamilyId === familyId, `${mode}: routing future native family mismatch`);
  assert(routing.futureNativeBindingMode === bindingMode, `${mode}: routing binding mode mismatch`);
  assert(routing.futureNativePrimaryPresetId === presetId, `${mode}: routing preset id mismatch`);
  assert((routing.futureNativeRecommendedPresetIds ?? []).includes(presetId), `${mode}: routing recommended presets missing primary`);
  assert(routing.notes.includes(`future-native:${familyId}`), `${mode}: routing note missing future native family`);
  assert(routing.sceneBranches?.includes(`future-native:${familyId}`), `${mode}: routing branch missing future native family`);
  if (mode === 'prism_smoke') {
    const lightBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'prism_smoke',
      layer2Source: 'video',
      layer2FogDensity: 0.18,
      layer2FogGlow: 0.86,
      layer2FogAnisotropy: 0.92,
      layer2TemporalStrength: 0.44,
    });
    const obstacleBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'prism_smoke',
      layer2Source: 'grid',
      layer2FogDensity: 0.92,
      layer2FogGlow: 0.06,
      layer2FogAnisotropy: 0.08,
      layer2TemporalStrength: 0.1,
    });
    const lightRecommendations = getFutureNativeRecommendedPresetIds(mode, lightBiasedConfig, 2);
    const obstacleRecommendations = getFutureNativeRecommendedPresetIds(mode, obstacleBiasedConfig, 2);
    assert(lightRecommendations[1] === 'future-native-volumetric-smoke-prism-light-fan', `${mode}: light-biased recommendation order mismatch`);
    assert(obstacleRecommendations[1] === 'future-native-volumetric-smoke-prism-obstacle-gate', `${mode}: obstacle-biased recommendation order mismatch`);
  }
  if (mode === 'static_smoke') {
    const lanternBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'static_smoke',
      layer2Source: 'video',
      layer2FogDensity: 0.22,
      layer2FogGlow: 0.88,
      layer2FogAnisotropy: 0.64,
      layer2TemporalStrength: 0.42,
    });
    const wallBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'static_smoke',
      layer2Source: 'grid',
      layer2FogDensity: 0.94,
      layer2FogGlow: 0.04,
      layer2FogAnisotropy: 0.06,
      layer2TemporalStrength: 0.08,
    });
    const lanternRecommendations = getFutureNativeRecommendedPresetIds(mode, lanternBiasedConfig, 2);
    const wallRecommendations = getFutureNativeRecommendedPresetIds(mode, wallBiasedConfig, 2);
    assert(lanternRecommendations[1] === 'future-native-volumetric-smoke-static-lantern-slab', `${mode}: lantern-biased recommendation order mismatch`);
    assert(wallRecommendations[1] === 'future-native-volumetric-smoke-static-shadow-wall', `${mode}: wall-biased recommendation order mismatch`);
  }
  if (mode === 'condense_field') {
    const flowBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'condense_field',
      layer2Source: 'plane',
      layer2FogDensity: 0.24,
      layer2FogGlow: 0.22,
      layer2FogAnisotropy: 0.82,
      layer2TemporalStrength: 0.34,
      layer2TemporalSpeed: 0.4,
    });
    const basinBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'condense_field',
      layer2Source: 'plane',
      layer2FogDensity: 0.86,
      layer2FogGlow: 0.04,
      layer2FogAnisotropy: 0.08,
      layer2TemporalStrength: 0.08,
      layer2TemporalSpeed: 0.1,
    });
    const flowRecommendations = getFutureNativeRecommendedPresetIds(mode, flowBiasedConfig, 2);
    const basinRecommendations = getFutureNativeRecommendedPresetIds(mode, basinBiasedConfig, 2);
    assert(flowRecommendations[1] === 'future-native-volumetric-condense-flow-lattice', `${mode}: flow-biased recommendation order mismatch`);
    assert(basinRecommendations[1] === 'future-native-volumetric-condense-obstacle-basin', `${mode}: basin-biased recommendation order mismatch`);
  }
  if (mode === 'sublimate_cloud') {
    const liftBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'sublimate_cloud',
      layer2Source: 'ring',
      layer2FogDensity: 0.18,
      layer2FogGlow: 0.28,
      layer2FogAnisotropy: 0.72,
      layer2TemporalStrength: 0.34,
      layer2TemporalSpeed: 0.42,
    });
    const shadowBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'sublimate_cloud',
      layer2Source: 'ring',
      layer2FogDensity: 0.64,
      layer2FogGlow: 0.04,
      layer2FogAnisotropy: 0.18,
      layer2TemporalStrength: 0.06,
      layer2TemporalSpeed: 0.12,
    });
    const liftRecommendations = getFutureNativeRecommendedPresetIds(mode, liftBiasedConfig, 2);
    const shadowRecommendations = getFutureNativeRecommendedPresetIds(mode, shadowBiasedConfig, 2);
    assert(liftRecommendations[1] === 'future-native-volumetric-sublimate-lift-veil', `${mode}: lift-biased recommendation order mismatch`);
    assert(shadowRecommendations[1] === 'future-native-volumetric-sublimate-shadow-ring', `${mode}: shadow-biased recommendation order mismatch`);
  }
  if (mode === 'vortex_transport') {
    const liftBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'vortex_transport',
      layer2Source: 'ring',
      layer2FogDensity: 0.18,
      layer2FogGlow: 0.28,
      layer2FogAnisotropy: 0.88,
      layer2TemporalStrength: 0.34,
      layer2TemporalSpeed: 0.42,
    });
    const shearBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'vortex_transport',
      layer2Source: 'sphere',
      layer2FogDensity: 0.72,
      layer2FogGlow: 0.04,
      layer2FogAnisotropy: 0.18,
      layer2TemporalStrength: 0.08,
      layer2TemporalSpeed: 0.1,
    });
    const liftRecommendations = getFutureNativeRecommendedPresetIds(mode, liftBiasedConfig, 2);
    const shearRecommendations = getFutureNativeRecommendedPresetIds(mode, shearBiasedConfig, 2);
    assert(liftRecommendations[1] === 'future-native-volumetric-pressure-vortex-lift', `${mode}: lift-biased recommendation order mismatch`);
    assert(shearRecommendations[1] === 'future-native-volumetric-pressure-vortex-shear', `${mode}: shear-biased recommendation order mismatch`);
  }
  if (mode === 'pressure_cells') {
    const lanternBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'pressure_cells',
      layer2Source: 'plane',
      layer2FogDensity: 0.18,
      layer2FogGlow: 0.42,
      layer2FogAnisotropy: 0.26,
      layer2TemporalStrength: 0.28,
      layer2TemporalSpeed: 0.18,
    });
    const wallBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'pressure_cells',
      layer2Source: 'grid',
      layer2FogDensity: 0.84,
      layer2FogGlow: 0.02,
      layer2FogAnisotropy: 0.08,
      layer2TemporalStrength: 0.08,
      layer2TemporalSpeed: 0.08,
    });
    const lanternRecommendations = getFutureNativeRecommendedPresetIds(mode, lanternBiasedConfig, 2);
    const wallRecommendations = getFutureNativeRecommendedPresetIds(mode, wallBiasedConfig, 2);
    assert(lanternRecommendations[1] === 'future-native-volumetric-pressure-cells-lantern', `${mode}: lantern-biased recommendation order mismatch`);
    assert(wallRecommendations[1] === 'future-native-volumetric-pressure-cells-wall', `${mode}: wall-biased recommendation order mismatch`);
  }
  if (mode === 'charge_veil') {
    const radiantBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'charge_veil',
      layer2Source: 'text',
      layer2FogDensity: 0.18,
      layer2FogGlow: 0.92,
      layer2FogAnisotropy: 0.94,
      layer2TemporalStrength: 0.4,
      layer2TemporalSpeed: 0.34,
    });
    const occludedBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'charge_veil',
      layer2Source: 'plane',
      layer2FogDensity: 0.78,
      layer2FogGlow: 0.08,
      layer2FogAnisotropy: 0.18,
      layer2TemporalStrength: 0.08,
      layer2TemporalSpeed: 0.12,
    });
    const radiantRecommendations = getFutureNativeRecommendedPresetIds(mode, radiantBiasedConfig, 2);
    const occludedRecommendations = getFutureNativeRecommendedPresetIds(mode, occludedBiasedConfig, 2);
    assert(radiantRecommendations[1] === 'future-native-volumetric-light-charge-radiant', `${mode}: radiant-biased recommendation order mismatch`);
    assert(occludedRecommendations[1] === 'future-native-volumetric-light-charge-occluded', `${mode}: occluded-biased recommendation order mismatch`);
  }
  if (mode === 'velvet_ash') {
    const lanternBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'velvet_ash',
      layer2Source: 'image',
      layer2FogDensity: 0.28,
      layer2FogGlow: 0.32,
      layer2FogAnisotropy: 0.24,
      layer2TemporalStrength: 0.24,
      layer2TemporalSpeed: 0.2,
    });
    const wallBiasedConfig = normalizeConfig({
      layer2Enabled: true,
      layer2Type: 'velvet_ash',
      layer2Source: 'plane',
      layer2FogDensity: 0.86,
      layer2FogGlow: 0.02,
      layer2FogAnisotropy: 0.08,
      layer2TemporalStrength: 0.08,
      layer2TemporalSpeed: 0.1,
    });
    const lanternRecommendations = getFutureNativeRecommendedPresetIds(mode, lanternBiasedConfig, 2);
    const wallRecommendations = getFutureNativeRecommendedPresetIds(mode, wallBiasedConfig, 2);
    assert(lanternRecommendations[1] === 'future-native-volumetric-shadow-velvet-lantern', `${mode}: lantern-biased recommendation order mismatch`);
    assert(wallRecommendations[1] === 'future-native-volumetric-shadow-velvet-wall', `${mode}: wall-biased recommendation order mismatch`);
  }

  return {
    mode,
    familyId,
    bindingMode,
    presetId,
    recommendedPresetIds: routing.futureNativeRecommendedPresetIds ?? [],
    resolvedEngine: routing.resolvedEngine,
    path: routing.path,
    sceneBranches: routing.sceneBranches,
  };
});

console.log(JSON.stringify({ ok: true, cases: report }, null, 2));
