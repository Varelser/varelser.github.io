import React from 'react';
import { ControlPanelContentProps } from './controlPanelTabsShared';

const GlobalTabContent = React.lazy(() => import('./controlPanelTabsGlobal').then((module) => ({ default: module.GlobalTabContent })));
const Layer1TabContent = React.lazy(() => import('./controlPanelTabsLayers').then((module) => ({ default: module.Layer1TabContent })));
const Layer2TabContent = React.lazy(() => import('./controlPanelTabsLayers').then((module) => ({ default: module.Layer2TabContent })));
const Layer3TabContent = React.lazy(() => import('./controlPanelTabsLayers').then((module) => ({ default: module.Layer3TabContent })));
const AmbientTabContent = React.lazy(() => import('./controlPanelTabsAmbient').then((module) => ({ default: module.AmbientTabContent })));
const AudioTabContent = React.lazy(() => import('./controlPanelTabsAudio').then((module) => ({ default: module.AudioTabContent })));

export const ControlPanelContent: React.FC<ControlPanelContentProps> = (props) => {
  const { activeTab, isPublicLibrary } = props;

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
      {isPublicLibrary && (
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-panel uppercase tracking-[0.24em] text-white/60">
          Public exhibition mode: scene parameters and sequence editing are locked. You can still load, morph, play, and export.
        </div>
      )}
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <React.Suspense fallback={null}>
          {activeTab === 'global' && <GlobalTabContent {...props} />}
          {activeTab === 'layer1' && <Layer1TabContent {...props} />}
          {activeTab === 'layer2' && <Layer2TabContent {...props} />}
          {activeTab === 'layer3' && <Layer3TabContent {...props} />}
          {activeTab === 'ambient' && <AmbientTabContent {...props} />}
          {activeTab === 'audio' && <AudioTabContent {...props} />}
        </React.Suspense>
      </div>
    </div>
  );
};
