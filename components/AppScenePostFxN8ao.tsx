import React from 'react';
import { N8AO } from '@react-three/postprocessing';
import type { ParticleConfig } from '../types';

export const AppScenePostFxN8ao: React.FC<{ config: ParticleConfig; editingHint?: boolean }> = ({ config, editingHint = false }) => {
  if (!config.postN8aoEnabled) {
    return null;
  }

  const effectiveQuality = editingHint ? 'performance' : config.postN8aoQuality;
  const halfRes = editingHint || effectiveQuality === 'performance' || effectiveQuality === 'low';

  return (
    <N8AO
      intensity={config.postN8aoIntensity}
      aoRadius={config.postN8aoRadius}
      distanceFalloff={config.postN8aoDistanceFalloff}
      quality={effectiveQuality}
      halfRes={halfRes}
    />
  );
};
