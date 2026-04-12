import type { ParticleConfig } from '../types';
import type { SynthEngine } from './audioControllerTypes';
import { applySynthSettings, restartSynthSequencer } from './audioSynth';
import { createSynthEngine, stopSynthEngine } from './audioSynthSource';

export { createSynthEngine, stopSynthEngine };

export function updateVideoExportSynthSettings(synth: SynthEngine, config: ParticleConfig) {
  applySynthSettings(synth, config);
}

export function restartVideoExportSynthSequencer(synth: SynthEngine, config: ParticleConfig) {
  restartSynthSequencer(synth, config);
}
