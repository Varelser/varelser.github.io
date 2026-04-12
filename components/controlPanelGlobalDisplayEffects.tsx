import React from 'react';

import type { GlobalDisplayScreenFxSectionProps } from './controlPanelGlobalDisplayEffectsShared';

const GlobalDisplayPostFxLazySection = React.lazy(() => import('./controlPanelGlobalDisplayPostFx').then((module) => ({ default: module.GlobalDisplayPostFxSection })));
const GlobalDisplayGpgpuLazySection = React.lazy(() => import('./controlPanelGlobalDisplayGpgpu').then((module) => ({ default: module.GlobalDisplayGpgpuSection })));
const GlobalDisplayScreenFxLazySection = React.lazy(() => import('./controlPanelGlobalDisplayScreenFx').then((module) => ({ default: module.GlobalDisplayScreenFxSection })));

export const GlobalDisplayEffectsSection: React.FC<GlobalDisplayScreenFxSectionProps> = ({
  applyScreenFxPreset,
  config,
  updateConfig,
}) => (
  <React.Suspense fallback={null}>
    <GlobalDisplayPostFxLazySection config={config} updateConfig={updateConfig} />
    <GlobalDisplayGpgpuLazySection config={config} updateConfig={updateConfig} />
    <GlobalDisplayScreenFxLazySection
      applyScreenFxPreset={applyScreenFxPreset}
      config={config}
      updateConfig={updateConfig}
    />
  </React.Suspense>
);
