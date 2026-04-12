import React from 'react';
import type { ParticleConfig } from '../types';

type AppBodySceneProps = {
  audioRef: React.MutableRefObject<{ bass: number; treble: number; pulse: number; bandA: number; bandB: number }>;
  compareConfig: ParticleConfig | null;
  comparePreviewEnabled: boolean;
  comparePreviewOrientation: 'vertical' | 'horizontal';
  comparePreviewSlotIndex: number;
  config: ParticleConfig;
  controlPanelState: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  };
  displayConfig: ParticleConfig;
  isPlaying: boolean;
  isSequencePlaying: boolean;
  rendererRef: React.MutableRefObject<unknown | null>;
  saveTrigger: number;
  sequenceStepProgress: number;
};

export const AppBodyScene: React.FC<AppBodySceneProps> = () => (
    <div className="relative min-h-screen overflow-hidden bg-black text-white" data-verify-shell="true">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(70,70,70,0.28),transparent_58%)]" aria-hidden />
      <div className="pointer-events-none absolute left-6 top-6 z-10 rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70" aria-hidden>
        KALOKAGATHIA
      </div>
      <div className="absolute inset-y-0 right-0 left-[min(10vw,6rem)] flex items-center justify-center">
        <div className="rounded-[30px] border border-white/10 bg-black/80 px-6 py-4 text-xs uppercase tracking-[0.24em] text-white/60">
          Verify shell
        </div>
      </div>
    </div>
  );
