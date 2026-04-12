import React from 'react';
import { Bloom, BrightnessContrast, ChromaticAberration, DepthOfField, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import type { ParticleConfig } from '../types';
import { getOrderedActivePostFxStageIds } from '../lib/postFxStack';

export const AppScenePostFxBasic: React.FC<{ config: ParticleConfig; editingHint?: boolean }> = ({ config, editingHint = false }) => {
  const orderedPostFxStages = React.useMemo(
    () => getOrderedActivePostFxStageIds(config).filter((stage) => stage !== 'n8ao'),
    [config],
  );

  const effectElements = orderedPostFxStages.map((stage) => {
    switch (stage) {
      case 'brightness-contrast':
        return (
          <BrightnessContrast
            key={stage}
            brightness={config.postBrightness}
            contrast={config.postContrastAmount}
          />
        );
      case 'noise':
        return (
          <Noise
            key={stage}
            premultiply
            opacity={config.postNoiseOpacity}
            blendFunction={BlendFunction.NORMAL}
          />
        );
      case 'bloom':
        return (
          <Bloom
            key={stage}
            intensity={editingHint ? Math.min(config.postBloomIntensity, 0.55) : config.postBloomIntensity}
            radius={config.postBloomRadius}
            luminanceThreshold={config.postBloomThreshold}
            luminanceSmoothing={0.1}
            mipmapBlur={!editingHint}
          />
        );
      case 'chromatic-aberration':
        return (
          <ChromaticAberration
            key={stage}
            blendFunction={BlendFunction.NORMAL}
            offset={new Vector2(config.postChromaticAberrationOffset, config.postChromaticAberrationOffset)}
            radialModulation={false}
            modulationOffset={0}
          />
        );
      case 'depth-of-field':
        return (
          <DepthOfField
            key={stage}
            focusDistance={config.postDofFocusDistance}
            focalLength={config.postDofFocalLength}
            bokehScale={editingHint ? Math.min(config.postDofBokehScale, 1.2) : config.postDofBokehScale}
          />
        );
      case 'vignette':
        return (
          <Vignette
            key={stage}
            eskil={false}
            offset={config.postVignetteOffset}
            darkness={config.postVignetteDarkness}
          />
        );
      default:
        return null;
    }
  }).filter((element): element is React.ReactElement => element !== null);

  if (effectElements.length === 0) {
    return null;
  }

  return <>{effectElements}</>;
};
