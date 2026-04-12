import React from 'react';
import type { Camera, Scene, WebGLRenderer } from 'three';
import type { ParticleConfig } from '../types';
import type { CameraRigApi } from '../types/cameraPath';

export type SceneAudioLevels = {
  bass: number;
  treble: number;
  pulse: number;
  bandA: number;
  bandB: number;
};

export type SceneAudioRef = React.MutableRefObject<SceneAudioLevels>;

export type AppSceneProps = {
  audioRef: SceneAudioRef;
  config: ParticleConfig;
  interLayerContactAmount: number;
  isPlaying: boolean;
  isSequencePlaying: boolean;
  postFxEditingHint?: boolean;
  rendererRef: React.MutableRefObject<WebGLRenderer | null>;
  sceneRef?: React.MutableRefObject<Scene | null>;
  cameraRef?: React.MutableRefObject<Camera | null>;
  saveTrigger: number;
  sequenceStepProgressRef: React.MutableRefObject<number>;
  cameraRigApiRef?: React.MutableRefObject<CameraRigApi | null>;
  onCameraPathPlayingChange?: (isPlaying: boolean) => void;
};
