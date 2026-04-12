import React from 'react';

import { Toggle } from './controlPanelParts';
import type { GlobalDisplayEffectsSharedProps } from './controlPanelGlobalDisplayEffectsShared';

const GlobalDisplayPostFxStackBundlesLazySection = React.lazy(() => import('./controlPanelGlobalDisplayPostFxStackBundles').then((module) => ({ default: module.GlobalDisplayPostFxStackBundlesSection })));
const GlobalDisplayPostFxAdvancedLazySection = React.lazy(() => import('./controlPanelGlobalDisplayPostFxAdvanced').then((module) => ({ default: module.GlobalDisplayPostFxAdvancedSection })));

export const GlobalDisplayPostFxSection: React.FC<GlobalDisplayEffectsSharedProps> = ({ config, updateConfig }) => {
  const hasAdvancedControls = config.postBloomEnabled
    || config.postChromaticAberrationEnabled
    || config.postDofEnabled
    || config.postNoiseEnabled
    || config.postVignetteEnabled
    || config.postN8aoEnabled
    || config.postBrightnessContrastEnabled;

  return (
    <div className="mt-5 rounded border border-white/10 bg-white/5 p-3">
      <div className="mb-3 text-panel uppercase tracking-widest font-bold text-white/70">Post Processing</div>
      <Toggle label="Stack Profile" value={config.postFxStackProfile} options={[{ label: 'Manual', val: 'manual' }, { label: 'Touch', val: 'touch-feedback' }, { label: 'Particular', val: 'particular-glow' }, { label: 'Retro', val: 'retro-feedback' }, { label: 'Dream', val: 'dream-smear' }]} onChange={(v) => updateConfig('postFxStackProfile', v)} />
      <React.Suspense fallback={null}><GlobalDisplayPostFxStackBundlesLazySection config={config} updateConfig={updateConfig} /></React.Suspense>
      <Toggle label="Bloom" value={config.postBloomEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('postBloomEnabled', v)} />
      <Toggle label="Chromatic Aberration" value={config.postChromaticAberrationEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('postChromaticAberrationEnabled', v)} />
      <Toggle label="Depth of Field" value={config.postDofEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('postDofEnabled', v)} />
      <Toggle label="Noise" value={config.postNoiseEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('postNoiseEnabled', v)} />
      <Toggle label="Vignette" value={config.postVignetteEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('postVignetteEnabled', v)} />
      <Toggle label="N8AO" value={config.postN8aoEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('postN8aoEnabled', v)} />
      {config.postN8aoEnabled && <Toggle label="AO Quality" value={config.postN8aoQuality} options={[{ label: 'Perf', val: 'performance' }, { label: 'Low', val: 'low' }, { label: 'Med', val: 'medium' }, { label: 'High', val: 'high' }, { label: 'Ultra', val: 'ultra' }]} onChange={(v) => updateConfig('postN8aoQuality', v)} />}
      <Toggle label="Brightness / Contrast" value={config.postBrightnessContrastEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('postBrightnessContrastEnabled', v)} />
      {hasAdvancedControls ? <React.Suspense fallback={null}><GlobalDisplayPostFxAdvancedLazySection config={config} updateConfig={updateConfig} /></React.Suspense> : null}
    </div>
  );
};
