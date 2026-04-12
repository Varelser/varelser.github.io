import React from 'react';
import { Sparkles } from 'lucide-react';
import { buildFutureNativeVolumetricCurrentTuningSet } from '../lib/future-native-families/futureNativeSmokeAuthoring';
import {
  buildVolumetricOverrideFieldsFromSpec,
  getVolumetricFamilyUiSpecs,
} from '../lib/future-native-families/futureNativeVolumetricFamilyMetadata';
import type { ParticleConfig } from '../types';
import { Slider, Toggle } from './controlPanelParts';
import type { UpdateConfig } from './controlPanelTabsShared';
import type { ProceduralMode } from './proceduralModeSettingsCatalog';

type ProceduralModeSpecificControlsProps = {
  config: ParticleConfig;
  layerIndex: 2 | 3;
  updateConfig: UpdateConfig;
  mode: ProceduralMode;
};

export const ProceduralModeSpecificControls: React.FC<ProceduralModeSpecificControlsProps> = ({
  config,
  layerIndex,
  updateConfig,
  mode,
}) => {
  const prefix = layerIndex === 2 ? 'layer2' : 'layer3';
  const key = (suffix: string) => `${prefix}${suffix}` as keyof ParticleConfig;
  const numberValue = (suffix: string) => config[key(suffix)] as number;
  const boolValue = (suffix: string) => config[key(suffix)] as boolean;
  const setNumber = (suffix: string, value: number) => updateConfig(key(suffix), value as never);
  const setBoolean = (suffix: string, value: boolean) => updateConfig(key(suffix), value as never);
  const activeVolumetricSpec = React.useMemo(
    () => getVolumetricFamilyUiSpecs().find((spec) => spec.modes.includes(mode)) ?? null,
    [mode],
  );
  const activeVolumetricTuning = React.useMemo(() => {
    if (!activeVolumetricSpec) return null;
    const tuningSet = buildFutureNativeVolumetricCurrentTuningSet(config, layerIndex);
    return tuningSet[activeVolumetricSpec.currentTuningKey] as Record<string, number> | null;
  }, [activeVolumetricSpec, config, layerIndex]);
  const activeVolumetricOverrideFields = React.useMemo(() => {
    if (!activeVolumetricSpec || !activeVolumetricTuning) return [];
    return buildVolumetricOverrideFieldsFromSpec(config, layerIndex, activeVolumetricTuning, activeVolumetricSpec);
  }, [activeVolumetricSpec, activeVolumetricTuning, config, layerIndex]);
  const activeVolumetricFocusSummary = React.useMemo(() => {
    if (!activeVolumetricSpec || !activeVolumetricTuning) return null;
    return activeVolumetricSpec.focusFormatter(activeVolumetricTuning)
      ?? activeVolumetricOverrideFields
        .slice(0, 4)
        .map((field) => `${field.label.toLowerCase()} ${field.derivedValue.toFixed(field.step < 0.1 ? 3 : 1)}`)
        .join(' · ');
  }, [activeVolumetricSpec, activeVolumetricOverrideFields, activeVolumetricTuning]);

  return (
    <>
<div className="mt-3 rounded border border-white/5 bg-black/10 p-3">
  <div className="mb-2 flex items-center gap-2 text-panel uppercase tracking-widest font-bold text-white/60">
    <Sparkles size={12} /> Temporal profile
  </div>
  <div className="mb-3 text-panel leading-relaxed text-white/50">
    時間変化の傾向をレイヤー全体へ付与します。steady は静的、growth は増殖、decay は減衰、crystallize は段階的硬化、melt は軟化、rupture は破断、oscillate は揺動、accrete は堆積、evaporate は蒸散、shed は剥離、resonate は共鳴、condense は凝縮、ignite は発火、unravel はほどけ、accumulate は蓄積循環、exfoliate は剥離循環、phase shift は相転移、inhale は呼吸、rewrite は再記述、saturate は飽和、delaminate は層剥離、anneal は焼きなまし、bifurcate は分岐、recur は再帰循環、percolate は浸透、slump は崩れ沈み、rebound は反発復元、fissure は亀裂化、ossify は硬化固定、intermittent は断続、hysteresis は履歴遅れ、fatigue は疲労、recover は回復、erupt は噴出、latency は潜伏、emerge は出現、collapse は崩壊、regrow は再成長、invert は反転です。
  </div>
  <Toggle
    label="Profile"
    value={config[key('TemporalProfile')] as string}
    options={[
      { label: 'Steady', val: 'steady' },
      { label: 'Growth', val: 'growth' },
      { label: 'Decay', val: 'decay' },
      { label: 'Crystallize', val: 'crystallize' },
      { label: 'Melt', val: 'melt' },
      { label: 'Rupture', val: 'rupture' },
      { label: 'Oscillate', val: 'oscillate' },
      { label: 'Accrete', val: 'accrete' },
      { label: 'Evaporate', val: 'evaporate' },
      { label: 'Shed', val: 'shed' },
      { label: 'Resonate', val: 'resonate' },
      { label: 'Condense', val: 'condense' },
      { label: 'Ignite', val: 'ignite' },
      { label: 'Unravel', val: 'unravel' },
      { label: 'Accumulate', val: 'accumulate' },
      { label: 'Exfoliate', val: 'exfoliate' },
      { label: 'Phase Shift', val: 'phase_shift' },
      { label: 'Inhale', val: 'inhale' },
      { label: 'Rewrite', val: 'rewrite' },
      { label: 'Saturate', val: 'saturate' },
      { label: 'Delaminate', val: 'delaminate' },
      { label: 'Anneal', val: 'anneal' },
      { label: 'Bifurcate', val: 'bifurcate' },
      { label: 'Recur', val: 'recur' },
      { label: 'Percolate', val: 'percolate' },
      { label: 'Slump', val: 'slump' },
      { label: 'Rebound', val: 'rebound' },
      { label: 'Fissure', val: 'fissure' },
      { label: 'Ossify', val: 'ossify' },
      { label: 'Intermittent', val: 'intermittent' },
      { label: 'Hysteresis', val: 'hysteresis' },
      { label: 'Fatigue', val: 'fatigue' },
      { label: 'Recover', val: 'recover' },
      { label: 'Erupt', val: 'erupt' },
      { label: 'Latency', val: 'latency' },
      { label: 'Emerge', val: 'emerge' },
      { label: 'Collapse', val: 'collapse' },
      { label: 'Regrow', val: 'regrow' },
      { label: 'Invert', val: 'invert' },
    ]}
    onChange={(value) => updateConfig(key('TemporalProfile'), value as never)}
  />
  <div className="mt-3 grid grid-cols-2 gap-4">
    <Slider label="Temporal Strength" value={numberValue('TemporalStrength')} min={0} max={1} step={0.01} onChange={(value) => setNumber('TemporalStrength', value)} />
    <Slider label="Temporal Speed" value={numberValue('TemporalSpeed')} min={0.1} max={3} step={0.01} onChange={(value) => setNumber('TemporalSpeed', value)} />
  </div>
</div>
{(mode === 'sheet' || mode === 'cloth_membrane' || mode === 'elastic_sheet' || mode === 'viscoelastic_membrane') && (
  <div className="grid grid-cols-2 gap-4 mt-3">
    <Slider label="Surface Opacity" value={numberValue('SheetOpacity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('SheetOpacity', value)} />
    <Slider label="Fresnel Glow" value={numberValue('SheetFresnel')} min={0} max={1} step={0.01} onChange={(value) => setNumber('SheetFresnel', value)} />
    <Slider label="Audio Ripple" value={numberValue('SheetAudioReactive')} min={0} max={2} step={0.01} onChange={(value) => setNumber('SheetAudioReactive', value)} />
    <Toggle label="Wireframe" value={boolValue('SheetWireframe')} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(value) => setBoolean('SheetWireframe', value)} />
  </div>
)}

{(mode === 'surface_shell' || mode === 'freeze_skin') && (
  <div className="grid grid-cols-2 gap-4 mt-3">
    <Slider label="Shell Opacity" value={numberValue('HullOpacity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('HullOpacity', value)} />
    <Slider label="Point Budget" value={numberValue('HullPointBudget')} min={128} max={8192} step={64} onChange={(value) => setNumber('HullPointBudget', value)} />
    <Slider label="Jitter" value={numberValue('HullJitter')} min={0} max={1} step={0.01} onChange={(value) => setNumber('HullJitter', value)} />
    <Slider label="Fresnel" value={numberValue('HullFresnel')} min={0} max={1} step={0.01} onChange={(value) => setNumber('HullFresnel', value)} />
    <Slider label="Audio Reactive" value={numberValue('HullAudioReactive')} min={0} max={2} step={0.01} onChange={(value) => setNumber('HullAudioReactive', value)} />
    <Toggle label="Wireframe" value={boolValue('HullWireframe')} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(value) => setBoolean('HullWireframe', value)} />
  </div>
)}

{mode === 'surface_patch' && (
  <div className="grid grid-cols-2 gap-4 mt-3">
    <Slider label="Patch Opacity" value={numberValue('PatchOpacity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('PatchOpacity', value)} />
    <Slider label="Resolution" value={numberValue('PatchResolution')} min={8} max={144} step={1} onChange={(value) => setNumber('PatchResolution', value)} />
    <Slider label="Relax" value={numberValue('PatchRelax')} min={0} max={1} step={0.01} onChange={(value) => setNumber('PatchRelax', value)} />
    <Slider label="Fresnel" value={numberValue('PatchFresnel')} min={0} max={1} step={0.01} onChange={(value) => setNumber('PatchFresnel', value)} />
    <Slider label="Audio Reactive" value={numberValue('PatchAudioReactive')} min={0} max={2} step={0.01} onChange={(value) => setNumber('PatchAudioReactive', value)} />
    <Toggle label="Wireframe" value={boolValue('PatchWireframe')} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(value) => setBoolean('PatchWireframe', value)} />
  </div>
)}

{(mode === 'brush_surface' || mode === 'viscous_flow' || mode === 'advection_flow' || mode === 'melt_front' || mode === 'evaporative_sheet') && (
  <div className="grid grid-cols-2 gap-4 mt-3">
    <Slider label="Opacity" value={numberValue('BrushOpacity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('BrushOpacity', value)} />
    <Slider label="Layers" value={numberValue('BrushLayers')} min={1} max={16} step={1} onChange={(value) => setNumber('BrushLayers', value)} />
    <Slider label="Scale" value={numberValue('BrushScale')} min={0.1} max={4} step={0.01} onChange={(value) => setNumber('BrushScale', value)} />
    <Slider label="Jitter" value={numberValue('BrushJitter')} min={0} max={1} step={0.01} onChange={(value) => setNumber('BrushJitter', value)} />
    <Slider label="Audio Reactive" value={numberValue('BrushAudioReactive')} min={0} max={2} step={0.01} onChange={(value) => setNumber('BrushAudioReactive', value)} />
  </div>
)}

{mode === 'fiber_field' && (
  <div className="grid grid-cols-2 gap-4 mt-3">
    <Slider label="Opacity" value={numberValue('FiberOpacity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('FiberOpacity', value)} />
    <Slider label="Length" value={numberValue('FiberLength')} min={0.05} max={2} step={0.01} onChange={(value) => setNumber('FiberLength', value)} />
    <Slider label="Density" value={numberValue('FiberDensity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('FiberDensity', value)} />
    <Slider label="Curl" value={numberValue('FiberCurl')} min={0} max={1} step={0.01} onChange={(value) => setNumber('FiberCurl', value)} />
    <Slider label="Audio Reactive" value={numberValue('FiberAudioReactive')} min={0} max={2} step={0.01} onChange={(value) => setNumber('FiberAudioReactive', value)} />
  </div>
)}

{(mode === 'growth_field' || mode === 'fracture_grammar' || mode === 'growth_grammar') && (
  <div className="grid grid-cols-2 gap-4 mt-3">
    <Slider label="Opacity" value={numberValue('GrowthOpacity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('GrowthOpacity', value)} />
    <Slider label="Branches" value={numberValue('GrowthBranches')} min={1} max={16} step={1} onChange={(value) => setNumber('GrowthBranches', value)} />
    <Slider label="Length" value={numberValue('GrowthLength')} min={0.05} max={2} step={0.01} onChange={(value) => setNumber('GrowthLength', value)} />
    <Slider label="Spread" value={numberValue('GrowthSpread')} min={0} max={1} step={0.01} onChange={(value) => setNumber('GrowthSpread', value)} />
    <Slider label="Audio Reactive" value={numberValue('GrowthAudioReactive')} min={0} max={2} step={0.01} onChange={(value) => setNumber('GrowthAudioReactive', value)} />
  </div>
)}

{mode === 'deposition_field' && (
  <div className="grid grid-cols-2 gap-4 mt-3">
    <Slider label="Opacity" value={numberValue('DepositionOpacity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('DepositionOpacity', value)} />
    <Slider label="Relief" value={numberValue('DepositionRelief')} min={0} max={1} step={0.01} onChange={(value) => setNumber('DepositionRelief', value)} />
    <Slider label="Erosion" value={numberValue('DepositionErosion')} min={0} max={1} step={0.01} onChange={(value) => setNumber('DepositionErosion', value)} />
    <Slider label="Bands" value={numberValue('DepositionBands')} min={1} max={12} step={1} onChange={(value) => setNumber('DepositionBands', value)} />
    <Slider label="Audio Reactive" value={numberValue('DepositionAudioReactive')} min={0} max={2} step={0.01} onChange={(value) => setNumber('DepositionAudioReactive', value)} />
    <Toggle label="Wireframe" value={boolValue('DepositionWireframe')} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(value) => setBoolean('DepositionWireframe', value)} />
  </div>
)}

{(mode === 'crystal_aggregate' || mode === 'granular_fall' || mode === 'sediment_stack' || mode === 'talus_heap' || mode === 'avalanche_field' || mode === 'jammed_pack') && (
  <div className="grid grid-cols-2 gap-4 mt-3">
    <Slider label="Opacity" value={numberValue('CrystalOpacity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('CrystalOpacity', value)} />
    <Slider label="Scale" value={numberValue('CrystalScale')} min={0.1} max={4} step={0.01} onChange={(value) => setNumber('CrystalScale', value)} />
    <Slider label="Density" value={numberValue('CrystalDensity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('CrystalDensity', value)} />
    <Slider label="Spread" value={numberValue('CrystalSpread')} min={0} max={1} step={0.01} onChange={(value) => setNumber('CrystalSpread', value)} />
    <Slider label="Audio Reactive" value={numberValue('CrystalAudioReactive')} min={0} max={2} step={0.01} onChange={(value) => setNumber('CrystalAudioReactive', value)} />
    <Toggle label="Wireframe" value={boolValue('CrystalWireframe')} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(value) => setBoolean('CrystalWireframe', value)} />
  </div>
)}

{mode === 'erosion_trail' && (
  <div className="grid grid-cols-2 gap-4 mt-3">
    <Slider label="Opacity" value={numberValue('ErosionTrailOpacity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('ErosionTrailOpacity', value)} />
    <Slider label="Density" value={numberValue('ErosionTrailDensity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('ErosionTrailDensity', value)} />
    <Slider label="Length" value={numberValue('ErosionTrailLength')} min={0.05} max={2} step={0.01} onChange={(value) => setNumber('ErosionTrailLength', value)} />
    <Slider label="Drift" value={numberValue('ErosionTrailDrift')} min={0} max={1} step={0.01} onChange={(value) => setNumber('ErosionTrailDrift', value)} />
    <Slider label="Audio Reactive" value={numberValue('ErosionTrailAudioReactive')} min={0} max={2} step={0.01} onChange={(value) => setNumber('ErosionTrailAudioReactive', value)} />
  </div>
)}

{mode === 'voxel_lattice' && (
  <div className="grid grid-cols-2 gap-4 mt-3">
    <Slider label="Opacity" value={numberValue('VoxelOpacity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('VoxelOpacity', value)} />
    <Slider label="Scale" value={numberValue('VoxelScale')} min={0.1} max={4} step={0.01} onChange={(value) => setNumber('VoxelScale', value)} />
    <Slider label="Density" value={numberValue('VoxelDensity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('VoxelDensity', value)} />
    <Slider label="Snap" value={numberValue('VoxelSnap')} min={0} max={1} step={0.01} onChange={(value) => setNumber('VoxelSnap', value)} />
    <Slider label="Audio Reactive" value={numberValue('VoxelAudioReactive')} min={0} max={2} step={0.01} onChange={(value) => setNumber('VoxelAudioReactive', value)} />
    <Toggle label="Wireframe" value={boolValue('VoxelWireframe')} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(value) => setBoolean('VoxelWireframe', value)} />
  </div>
)}

{mode === 'crystal_deposition' && (
  <div className="grid grid-cols-2 gap-4 mt-3">
    <Slider label="Opacity" value={numberValue('CrystalDepositionOpacity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('CrystalDepositionOpacity', value)} />
    <Slider label="Crystal Scale" value={numberValue('CrystalDepositionCrystalScale')} min={0.1} max={4} step={0.01} onChange={(value) => setNumber('CrystalDepositionCrystalScale', value)} />
    <Slider label="Density" value={numberValue('CrystalDepositionDensity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('CrystalDepositionDensity', value)} />
    <Slider label="Relief" value={numberValue('CrystalDepositionRelief')} min={0} max={1} step={0.01} onChange={(value) => setNumber('CrystalDepositionRelief', value)} />
    <Slider label="Audio Reactive" value={numberValue('CrystalDepositionAudioReactive')} min={0} max={2} step={0.01} onChange={(value) => setNumber('CrystalDepositionAudioReactive', value)} />
    <Toggle label="Wireframe" value={boolValue('CrystalDepositionWireframe')} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(value) => setBoolean('CrystalDepositionWireframe', value)} />
  </div>
)}

{(mode === 'reaction_diffusion' || mode === 'cellular_front' || mode === 'corrosion_front' || mode === 'biofilm_skin') && (
  <div className="grid grid-cols-2 gap-4 mt-3">
    <Slider label="Opacity" value={numberValue('ReactionOpacity')} min={0.05} max={1} step={0.01} onChange={(value) => setNumber('ReactionOpacity', value)} />
    <Slider label="Feed" value={numberValue('ReactionFeed')} min={0.001} max={0.09} step={0.001} onChange={(value) => setNumber('ReactionFeed', value)} />
    <Slider label="Kill" value={numberValue('ReactionKill')} min={0.001} max={0.09} step={0.001} onChange={(value) => setNumber('ReactionKill', value)} />
    <Slider label="Scale" value={numberValue('ReactionScale')} min={0.1} max={4} step={0.01} onChange={(value) => setNumber('ReactionScale', value)} />
    <Slider label="Warp" value={numberValue('ReactionWarp')} min={0} max={1} step={0.01} onChange={(value) => setNumber('ReactionWarp', value)} />
    <Slider label="Audio Reactive" value={numberValue('ReactionAudioReactive')} min={0} max={2} step={0.01} onChange={(value) => setNumber('ReactionAudioReactive', value)} />
  </div>
)}

{(mode === 'volume_fog' || mode === 'vortex_transport' || mode === 'pressure_cells' || mode === 'condense_field' || mode === 'sublimate_cloud') && (
  <div className="grid grid-cols-2 gap-4 mt-3">
    <Slider label="Opacity" value={numberValue('FogOpacity')} min={0.01} max={1} step={0.01} onChange={(value) => setNumber('FogOpacity', value)} />
    <Slider label="Density" value={numberValue('FogDensity')} min={0.01} max={1} step={0.01} onChange={(value) => setNumber('FogDensity', value)} />
    <Slider label="Depth" value={numberValue('FogDepth')} min={0.01} max={1.5} step={0.01} onChange={(value) => setNumber('FogDepth', value)} />
    <Slider label="Scale" value={numberValue('FogScale')} min={0.1} max={4} step={0.01} onChange={(value) => setNumber('FogScale', value)} />
    <Slider label="Drift" value={numberValue('FogDrift')} min={0} max={1} step={0.01} onChange={(value) => setNumber('FogDrift', value)} />
    <Slider label="Slices" value={numberValue('FogSlices')} min={4} max={48} step={1} onChange={(value) => setNumber('FogSlices', value)} />
    <Slider label="Glow" value={numberValue('FogGlow')} min={0} max={1} step={0.01} onChange={(value) => setNumber('FogGlow', value)} />
    <Slider label="Anisotropy" value={numberValue('FogAnisotropy')} min={0} max={1} step={0.01} onChange={(value) => setNumber('FogAnisotropy', value)} />
    <Slider label="Audio Reactive" value={numberValue('FogAudioReactive')} min={0} max={2} step={0.01} onChange={(value) => setNumber('FogAudioReactive', value)} />
  </div>
)}

{activeVolumetricSpec && activeVolumetricTuning && (
  <div className="mt-3 rounded border border-white/5 bg-black/10 p-3">
    <div className="mb-2 flex items-center gap-2 text-panel uppercase tracking-widest font-bold text-white/60">
      <Sparkles size={12} /> {activeVolumetricSpec.overrideTitle}
    </div>
    <div className="text-panel leading-relaxed text-white/50">
      {activeVolumetricSpec.overrideDescription}
    </div>
    {activeVolumetricFocusSummary && (
      <div className="mt-2 text-panel-sm leading-relaxed text-white/35">
        Derived now: {activeVolumetricFocusSummary}
      </div>
    )}
    <div className="mt-3">
      <Toggle
        label="Override"
        value={boolValue(activeVolumetricSpec.overrideToggleSuffix)}
        options={[{ label: 'On', val: true }, { label: 'Off', val: false }]}
        onChange={(value) => setBoolean(activeVolumetricSpec.overrideToggleSuffix, value)}
      />
    </div>
    {boolValue(activeVolumetricSpec.overrideToggleSuffix) && (
      <div className="grid grid-cols-2 gap-4">
        {activeVolumetricOverrideFields.map((field) => (
          <div key={String(field.configKey)}>
            <Slider
              label={field.label}
              value={field.value}
              min={field.min}
              max={field.max}
              step={field.step}
              onChange={(value) => updateConfig(field.configKey, value as never)}
            />
            <div className="-mt-3 mb-3 text-panel-sm text-white/35">
              Derived {field.derivedValue.toFixed(field.step < 0.1 ? 3 : 1)}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

{(layerIndex === 2 ? config.layer2Source : config.layer3Source) === 'text' && (
  <div className="mt-4 border-t border-white/5 pt-3">
    <div className="mb-2 flex items-center gap-2 text-panel uppercase font-bold text-white/60">
      <Sparkles size={12} /> Glyph Outline
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Toggle label="Outline" value={boolValue('GlyphOutlineEnabled')} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(value) => setBoolean('GlyphOutlineEnabled', value)} />
      <Slider label="Width" value={numberValue('GlyphOutlineWidth')} min={0.001} max={0.1} step={0.001} onChange={(value) => setNumber('GlyphOutlineWidth', value)} />
      <Slider label="Opacity" value={numberValue('GlyphOutlineOpacity')} min={0.01} max={1} step={0.01} onChange={(value) => setNumber('GlyphOutlineOpacity', value)} />
      <Slider label="Depth Bias" value={numberValue('GlyphOutlineDepthBias')} min={0} max={1} step={0.01} onChange={(value) => setNumber('GlyphOutlineDepthBias', value)} />
      <Slider label="Audio Reactive" value={numberValue('GlyphOutlineAudioReactive')} min={0} max={2} step={0.01} onChange={(value) => setNumber('GlyphOutlineAudioReactive', value)} />
    </div>
  </div>
)}
    </>
  );
};
