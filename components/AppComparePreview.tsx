import React from 'react';
import type { ComparePreviewOrientation } from './controlPanelTypes';
import type { SceneAudioRef } from './AppSceneTypes';
import type { ParticleConfig } from '../types';
import { AppScene } from './AppScene';
import { AppSceneErrorBoundary } from './AppSceneErrorBoundary';
import { getInterLayerContactAmount } from '../lib/appStateCollision';

interface AppComparePreviewProps {
  audioRef: SceneAudioRef;
  compareConfig: ParticleConfig | null;
  comparePreviewEnabled: boolean;
  comparePreviewOrientation: ComparePreviewOrientation;
  comparePreviewSlotIndex: number;
  isPlaying: boolean;
  isSequencePlaying: boolean;
  sequenceStepProgressRef: React.MutableRefObject<number>;
}

export function buildComparePreviewConfig(config: ParticleConfig): ParticleConfig {
  return {
    ...config,
    renderQuality: 'draft',
    autoLod: true,
    postBloomEnabled: false,
    postChromaticAberrationEnabled: false,
    postBrightnessContrastEnabled: false,
    postDofEnabled: false,
    postNoiseEnabled: false,
    postVignetteEnabled: false,
    postN8aoEnabled: false,
  };
}

export const AppComparePreview: React.FC<AppComparePreviewProps> = ({
  audioRef,
  compareConfig,
  comparePreviewEnabled,
  comparePreviewOrientation,
  comparePreviewSlotIndex,
  isPlaying,
  isSequencePlaying,
  sequenceStepProgressRef,
}) => {
  if (!comparePreviewEnabled || !compareConfig) return null;
  const previewConfig = React.useMemo(() => buildComparePreviewConfig(compareConfig), [compareConfig]);
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden border-white/15"
        style={comparePreviewOrientation === 'vertical'
          ? { clipPath: 'inset(0 0 0 50%)' }
          : { clipPath: 'inset(50% 0 0 0)' }}
      >
        <AppSceneErrorBoundary
          label={`Compare ${String.fromCharCode(65 + comparePreviewSlotIndex)}`}
          compact={true}
          resetKeys={[previewConfig.layer2Type, previewConfig.layer3Type, previewConfig.backgroundColor, comparePreviewSlotIndex]}
        >
          <AppScene
            audioRef={audioRef}
            config={previewConfig}
            interLayerContactAmount={getInterLayerContactAmount(previewConfig)}
            isPlaying={isPlaying}
            isSequencePlaying={isSequencePlaying}
            rendererRef={{ current: null }}
            saveTrigger={0}
            sequenceStepProgressRef={sequenceStepProgressRef}
          />
        </AppSceneErrorBoundary>
      </div>
      <div
        className="pointer-events-none absolute bg-white/25"
        style={comparePreviewOrientation === 'vertical'
          ? { top: 0, bottom: 0, left: '50%', width: 1 }
          : { left: 0, right: 0, top: '50%', height: 1 }}
      />
      <div className="pointer-events-none absolute left-4 top-4 rounded border border-white/15 bg-black/45 px-2 py-1 text-panel uppercase tracking-widest text-white/70">Live</div>
      <div
        className="pointer-events-none absolute rounded border border-cyan-300/25 bg-black/45 px-2 py-1 text-panel uppercase tracking-widest text-cyan-100/80"
        style={comparePreviewOrientation === 'vertical' ? { right: 16, top: 16 } : { right: 16, bottom: 16 }}
      >
        Compare {String.fromCharCode(65 + comparePreviewSlotIndex)}
      </div>
    </>
  );
};
