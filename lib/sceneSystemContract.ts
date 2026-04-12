import type { ComponentType, LazyExoticComponent } from 'react';
import type { ParticleConfig } from '../types';
import type { SceneAudioRef } from '../components/AppSceneTypes';
import type { ProceduralSystemId } from './proceduralModeRegistry';

export type SceneSystemSupport = 'stable' | 'experimental' | 'heavy';
export type SceneSystemPerformanceClass = 'light' | 'medium' | 'heavy';
export type SceneSystemCategory = 'procedural-surface' | 'hybrid-surface' | 'future-native';
export type SceneSystemActivationKind = 'procedural' | 'hybrid' | 'future-native';

export type LayerSceneSystemComponentProps = {
  audioRef: SceneAudioRef;
  config: ParticleConfig;
  isPlaying: boolean;
  layerIndex: 2 | 3;
};

export interface SceneSystemContract<TId extends string = string> {
  id: TId;
  label: string;
  category: SceneSystemCategory;
  activationKind: SceneSystemActivationKind;
  support: SceneSystemSupport;
  performanceClass: SceneSystemPerformanceClass;
  manifestFeatures: readonly string[];
  sceneBranches: readonly string[];
  component: ComponentType<LayerSceneSystemComponentProps> | LazyExoticComponent<ComponentType<LayerSceneSystemComponentProps>>;
}

export type ProceduralSceneSystemContract = SceneSystemContract<ProceduralSystemId>;
export type FutureNativeSceneSystemContract = SceneSystemContract<'future-native-bridge'>;

export function createSceneSystemContract<TId extends string>(contract: SceneSystemContract<TId>) {
  return contract;
}
