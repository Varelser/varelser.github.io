import React from "react";
import type { ParticleConfig } from "../types";
import type { UpdateConfig } from "./controlPanelTabsShared";
import { Slider } from "./controlPanelParts";
import {
  LEGACY_AUDIO_BAND_A_SLIDERS,
  LEGACY_AUDIO_BAND_B_SLIDERS,
  LEGACY_AUDIO_PRIMARY_SLIDERS,
  type LegacyAudioSliderDefinition,
} from "./controlPanelTabsAudioLegacy";

type AudioLegacySlidersPanelProps = {
  config: ParticleConfig;
  updateConfig: UpdateConfig;
  shouldRenderLegacySlider: (legacyId: string) => boolean;
};

export const AudioLegacySlidersPanel: React.FC<AudioLegacySlidersPanelProps> = ({
  config,
  updateConfig,
  shouldRenderLegacySlider,
}) => {
  const renderLegacySlider = React.useCallback(
    (definition: LegacyAudioSliderDefinition) => {
      if (!shouldRenderLegacySlider(definition.legacyId)) return null;
      return (
        <Slider
          key={definition.legacyId}
          label={definition.label}
          value={config[definition.key]}
          min={definition.min}
          max={definition.max}
          step={definition.step}
          onChange={(value) => updateConfig(definition.key, value)}
        />
      );
    },
    [config, shouldRenderLegacySlider, updateConfig],
  );

  return (
    <>
      {LEGACY_AUDIO_PRIMARY_SLIDERS.map(renderLegacySlider)}
      <div className="mb-4 mt-4 rounded border border-white/10 bg-black/10 px-3 py-2 text-panel uppercase tracking-widest text-white/55">
        Custom Frequency Bands
      </div>
      <div className="mb-4 rounded border border-cyan-400/15 bg-cyan-500/5 px-3 py-3">
        <div className="mb-2 text-panel uppercase tracking-widest font-bold text-cyan-200/80">
          Band A
        </div>
        <Slider
          label={`Low Cutoff: ${config.audioBandALowHz >= 1000 ? `${(config.audioBandALowHz / 1000).toFixed(1)} kHz` : `${config.audioBandALowHz} Hz`}`}
          value={config.audioBandALowHz}
          min={20}
          max={2000}
          step={5}
          onChange={(value) => updateConfig("audioBandALowHz", value)}
        />
        <Slider
          label={`High Cutoff: ${config.audioBandAHighHz >= 1000 ? `${(config.audioBandAHighHz / 1000).toFixed(1)} kHz` : `${config.audioBandAHighHz} Hz`}`}
          value={config.audioBandAHighHz}
          min={50}
          max={4000}
          step={10}
          onChange={(value) => updateConfig("audioBandAHighHz", value)}
        />
        {LEGACY_AUDIO_BAND_A_SLIDERS.map(renderLegacySlider)}
      </div>
      <div className="mb-4 rounded border border-violet-400/15 bg-violet-500/5 px-3 py-3">
        <div className="mb-2 text-panel uppercase tracking-widest font-bold text-violet-200/80">
          Band B
        </div>
        <Slider
          label={`Low Cutoff: ${config.audioBandBLowHz >= 1000 ? `${(config.audioBandBLowHz / 1000).toFixed(1)} kHz` : `${config.audioBandBLowHz} Hz`}`}
          value={config.audioBandBLowHz}
          min={200}
          max={10000}
          step={50}
          onChange={(value) => updateConfig("audioBandBLowHz", value)}
        />
        <Slider
          label={`High Cutoff: ${config.audioBandBHighHz >= 1000 ? `${(config.audioBandBHighHz / 1000).toFixed(1)} kHz` : `${config.audioBandBHighHz} Hz`}`}
          value={config.audioBandBHighHz}
          min={500}
          max={20000}
          step={100}
          onChange={(value) => updateConfig("audioBandBHighHz", value)}
        />
        {LEGACY_AUDIO_BAND_B_SLIDERS.map(renderLegacySlider)}
      </div>
    </>
  );
};
