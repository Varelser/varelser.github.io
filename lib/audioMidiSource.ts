import type React from 'react';
import type { ParticleConfig } from '../types';
import { EMPTY_AUDIO_FEATURE_FRAME, createAudioFeatureFrameFromLevels } from './audioFeatureFrame';
import type { AudioLevels, Notice } from './audioControllerTypes';

export type MidiRuntimeState = {
  bass: number;
  treble: number;
  bandA: number;
  bandB: number;
  pulse: number;
  activeNotes: Map<number, number>;
};

export type StartMidiAudioSourceArgs = {
  latestConfigRef: React.MutableRefObject<ParticleConfig>;
  audioRef: React.MutableRefObject<AudioLevels>;
  audioFeatureFrameRef: React.MutableRefObject<typeof EMPTY_AUDIO_FEATURE_FRAME>;
  setAudioNotice: React.Dispatch<React.SetStateAction<Notice | null>>;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
  setIsAudioActive: React.Dispatch<React.SetStateAction<boolean>>;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function createEmptyMidiRuntimeState(): MidiRuntimeState {
  return {
    bass: 0,
    treble: 0,
    bandA: 0,
    bandB: 0,
    pulse: 0,
    activeNotes: new Map<number, number>(),
  };
}

function normalizeMidiValue(value: number, config: ParticleConfig) {
  return clamp01((value / 127) * Math.max(0.05, config.audioSensitivity) * Math.max(0.05, config.midiVelocityGain));
}

export function applyMidiMessageToRuntimeState(
  state: MidiRuntimeState,
  data: Uint8Array,
  config: ParticleConfig,
) {
  const status = (data[0] ?? 0) & 0xf0;
  const data1 = data[1] ?? 0;
  const data2 = data[2] ?? 0;

  if (status === 0x90 && data2 > 0) {
    const noteStrength = normalizeMidiValue(data2, config);
    state.activeNotes.set(data1, noteStrength);
    state.bass = Math.max(state.bass, noteStrength);
    state.pulse = Math.max(state.pulse, noteStrength);
    state.bandA = Math.max(state.bandA, noteStrength * 0.65);
    return true;
  }

  if (status === 0x80 || (status === 0x90 && data2 === 0)) {
    state.activeNotes.delete(data1);
    return true;
  }

  if (status === 0xb0) {
    const controlStrength = normalizeMidiValue(data2, {
      ...config,
      midiVelocityGain: 1,
    });
    if (data1 === config.midiBassCC) {
      state.bass = Math.max(state.bass, controlStrength);
      return true;
    }
    if (data1 === config.midiTrebleCC) {
      state.treble = Math.max(state.treble, controlStrength);
      return true;
    }
    if (data1 === config.midiBandACC) {
      state.bandA = Math.max(state.bandA, controlStrength);
      return true;
    }
    if (data1 === config.midiBandBCC) {
      state.bandB = Math.max(state.bandB, controlStrength);
      return true;
    }
  }

  return false;
}

export function stepMidiRuntimeState(
  state: MidiRuntimeState,
  deltaSeconds: number,
  config: Pick<ParticleConfig, 'midiDecay'>,
) {
  const safeDelta = Math.max(0, deltaSeconds);
  const levelRetain = Math.max(0, 1 - Math.max(0.1, config.midiDecay) * safeDelta);
  const pulseRetain = Math.max(0, 1 - Math.max(0.1, config.midiDecay) * 1.8 * safeDelta);

  state.bass *= levelRetain;
  state.treble *= levelRetain;
  state.bandA *= levelRetain;
  state.bandB *= levelRetain;
  state.pulse *= pulseRetain;

  let heldPeak = 0;
  for (const value of state.activeNotes.values()) {
    heldPeak = Math.max(heldPeak, value);
  }

  if (heldPeak > 0) {
    state.bass = Math.max(state.bass, heldPeak * 0.92);
    state.pulse = Math.max(state.pulse, heldPeak * 0.55);
  }

  state.bass = clamp01(state.bass);
  state.treble = clamp01(state.treble);
  state.bandA = clamp01(state.bandA);
  state.bandB = clamp01(state.bandB);
  state.pulse = clamp01(state.pulse);

  return state;
}

export function createAudioLevelsFromMidiState(state: MidiRuntimeState): AudioLevels {
  return {
    bass: clamp01(state.bass),
    treble: clamp01(state.treble),
    pulse: clamp01(state.pulse),
    bandA: clamp01(state.bandA),
    bandB: clamp01(state.bandB),
  };
}

export function pickPreferredMidiInput(inputs: MIDIInput[], preferredInputId: string) {
  return inputs.find((input) => input.id === preferredInputId) ?? inputs[0] ?? null;
}

export async function startMidiAudioSource({
  latestConfigRef,
  audioRef,
  audioFeatureFrameRef,
  setAudioNotice,
  setConfig,
  setIsAudioActive,
}: StartMidiAudioSourceArgs) {
  if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
    throw new Error('Web MIDI API is not supported in this browser. Use Chromium-based browsers for MIDI input.');
  }

  const midiAccess = await navigator.requestMIDIAccess({ sysex: false });
  const inputs = Array.from(midiAccess.inputs.values());
  const selectedInput = pickPreferredMidiInput(inputs, latestConfigRef.current.midiPreferredInputId);

  if (!selectedInput) {
    throw new Error('No MIDI input device was found. Connect a MIDI keyboard or controller and try again.');
  }

  const state = createEmptyMidiRuntimeState();
  let rafId = 0;
  let lastFrameTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  const syncAudioLevels = () => {
    audioRef.current = createAudioLevelsFromMidiState(state);
    audioFeatureFrameRef.current = createAudioFeatureFrameFromLevels(audioRef.current);
  };

  const handleMidiMessage = (event: MIDIMessageEvent) => {
    if (!event.data) return;
    if (applyMidiMessageToRuntimeState(state, event.data, latestConfigRef.current)) {
      syncAudioLevels();
    }
  };

  const frame = (now: number) => {
    const deltaSeconds = Math.max(0, (now - lastFrameTime) / 1000);
    lastFrameTime = now;
    stepMidiRuntimeState(state, deltaSeconds, latestConfigRef.current);
    syncAudioLevels();
    rafId = window.requestAnimationFrame(frame);
  };

  selectedInput.onmidimessage = handleMidiMessage;

  midiAccess.onstatechange = () => {
    const liveInputs = Array.from(midiAccess.inputs.values());
    const stillConnected = liveInputs.some((input) => input.id === selectedInput.id && input.state !== 'disconnected');
    if (!stillConnected) {
      audioRef.current = { bass: 0, treble: 0, pulse: 0, bandA: 0, bandB: 0 };
      audioFeatureFrameRef.current = { ...EMPTY_AUDIO_FEATURE_FRAME };
      setIsAudioActive(false);
      setConfig((prev) => ({ ...prev, audioEnabled: false }));
      setAudioNotice({ tone: 'error', message: 'MIDI input disconnected.' });
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }
  };

  setConfig((prev) => ({
    ...prev,
    audioEnabled: true,
    midiPreferredInputId: selectedInput.id,
  }));
  setIsAudioActive(true);
  setAudioNotice({
    tone: 'success',
    message: `MIDI input connected: ${selectedInput.name ?? selectedInput.manufacturer ?? selectedInput.id}`,
  });
  syncAudioLevels();
  rafId = window.requestAnimationFrame(frame);

  return () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    if (selectedInput.onmidimessage === handleMidiMessage) {
      selectedInput.onmidimessage = null;
    }
    midiAccess.onstatechange = null;
    audioRef.current = { bass: 0, treble: 0, pulse: 0, bandA: 0, bandB: 0 };
    audioFeatureFrameRef.current = { ...EMPTY_AUDIO_FEATURE_FRAME };
  };
}
