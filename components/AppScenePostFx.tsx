import React from 'react';
import { EffectComposer } from '@react-three/postprocessing';
import type { ParticleConfig } from '../types';
import { getOrderedActivePostFxStageIds } from '../lib/postFxStack';

const LazyAppScenePostFxN8ao = React.lazy(async () => ({
  default: (await import('./AppScenePostFxN8ao')).AppScenePostFxN8ao,
}));

const LazyAppScenePostFxBasic = React.lazy(async () => ({
  default: (await import('./AppScenePostFxBasic')).AppScenePostFxBasic,
}));


export const AppScenePostFx: React.FC<{ config: ParticleConfig; editingHint?: boolean }> = ({ config, editingHint = false }) => {
  const orderedPostFxStages = React.useMemo(() => getOrderedActivePostFxStageIds(config), [config]);

  if (orderedPostFxStages.length === 0) {
    return null;
  }

  const hasBasicStages = orderedPostFxStages.some((stage) => stage !== 'n8ao');
  const basicElement = hasBasicStages ? (
    <React.Suspense fallback={null}>
      <LazyAppScenePostFxBasic config={config} editingHint={editingHint} />
    </React.Suspense>
  ) : <></>;
  const n8aoElement = config.postN8aoEnabled ? (
    <React.Suspense fallback={null}>
      <LazyAppScenePostFxN8ao config={config} editingHint={editingHint} />
    </React.Suspense>
  ) : <></>;

  return (
    <EffectComposer>
      {basicElement}
      {n8aoElement}
    </EffectComposer>
  );
};
