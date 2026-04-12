import React from 'react';
import type { ParticleConfig } from '../types';
import { applyTemporalProfiles } from '../lib/temporalProfiles';
import { getLayerRuntimeTemporalSnapshot } from '../lib/sceneRenderRoutingRuntime';
import { createLegacySafeRetiredRuntimeConfig } from '../lib/audioReactiveLegacyRuntime';

export function useAppSceneTemporalConfig(config: ParticleConfig, isPlaying: boolean) {
  const [temporalTime, setTemporalTime] = React.useState(0);

  const hasTemporalAnimation = React.useMemo(() => {
    const layer2Temporal = getLayerRuntimeTemporalSnapshot(config, 2);
    const layer3Temporal = getLayerRuntimeTemporalSnapshot(config, 3);
    return [layer2Temporal, layer3Temporal].some((snapshot) => snapshot.enabled && snapshot.profile !== 'steady' && snapshot.strength > 0);
  }, [
    config.layer2Enabled,
    config.layer2TemporalProfile,
    config.layer2TemporalStrength,
    config.layer3Enabled,
    config.layer3TemporalProfile,
    config.layer3TemporalStrength,
  ]);
  const shouldAnimateTemporalProfiles = hasTemporalAnimation && isPlaying;

  React.useEffect(() => {
    if (!shouldAnimateTemporalProfiles) {
      setTemporalTime((current) => (current === 0 ? current : 0));
      return;
    }
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      if (!last || now - last >= 83) {
        last = now;
        setTemporalTime(now / 1000);
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [shouldAnimateTemporalProfiles]);

  return React.useMemo(() => {
    const temporalConfig = hasTemporalAnimation
      ? applyTemporalProfiles(config, temporalTime, isPlaying)
      : config;
    return createLegacySafeRetiredRuntimeConfig(temporalConfig);
  }, [config, hasTemporalAnimation, isPlaying, temporalTime]);
}
