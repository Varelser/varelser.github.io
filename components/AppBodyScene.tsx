import React from 'react';
import type { Camera, Scene, WebGLRenderer } from 'three';
import { AppRootLayout } from './AppRootLayout';
import type { ParticleConfig } from '../types';
import type { CameraRigApi } from '../types/cameraPath';

type ControlPanelState = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

type AppBodySceneProps = {
  audioRef: React.MutableRefObject<{ bass: number; treble: number; pulse: number; bandA: number; bandB: number }>;
  compareConfig: ParticleConfig | null;
  comparePreviewEnabled: boolean;
  comparePreviewOrientation: 'vertical' | 'horizontal';
  comparePreviewSlotIndex: number;
  config: ParticleConfig;
  controlPanelState: ControlPanelState;
  displayConfig: ParticleConfig;
  isPlaying: boolean;
  isSequencePlaying: boolean;
  rendererRef: React.MutableRefObject<WebGLRenderer | null>;
  sceneRef?: React.MutableRefObject<Scene | null>;
  cameraRef?: React.MutableRefObject<Camera | null>;
  saveTrigger: number;
  sequenceStepProgress: number;
  sequenceStepProgressRef: React.MutableRefObject<number>;
  cameraRigApiRef?: React.MutableRefObject<CameraRigApi | null>;
  onCameraPathPlayingChange?: (isPlaying: boolean) => void;
};

export const AppBodyScene: React.FC<AppBodySceneProps> = (props) => <AppRootLayout {...props} />;
