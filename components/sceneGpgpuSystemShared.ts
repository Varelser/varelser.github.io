import type { MutableRefObject, RefObject } from 'react';
import type { ParticleConfig } from '../types';

export type GpgpuSystemProps = {
  audioRef: MutableRefObject<{ bass: number; treble: number; pulse: number }>;
  config: ParticleConfig;
  isPlaying: boolean;
  posReadbackRef?: RefObject<Float32Array | null>;
  posReadbackVersionRef?: MutableRefObject<number>;
};
