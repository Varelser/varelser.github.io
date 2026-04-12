import React, { useRef } from 'react';
import type { ShaderMaterial } from 'three';
import type { VolumetricFieldSystemProps } from './sceneVolumetricFieldSystemShared';
import { useVolumetricFieldRuntime } from './sceneVolumetricFieldSystemRuntime';
import { VolumetricFieldSystemRender } from './sceneVolumetricFieldSystemRender';

export const VolumetricFieldSystem: React.FC<VolumetricFieldSystemProps> = (props) => {
  const materialRef = useRef<ShaderMaterial>(null);
  const runtime = useVolumetricFieldRuntime(props, materialRef);
  return <VolumetricFieldSystemRender materialRef={materialRef} {...runtime} />;
};

export type {
  VolumeProfile,
  VolumetricFieldAudioFrame,
  VolumetricFieldSettings,
  VolumetricFieldSystemProps,
} from './sceneVolumetricFieldSystemShared';
export {
  createVolumetricFieldUniforms,
  DEFAULT_VOLUME_PROFILE,
  getVolumetricFieldSettings,
  getVolumetricMaterialStyleIndex,
  getVolumetricProfile,
  getVolumetricSourceAdjustments,
  VOLUMETRIC_FIELD_FRAGMENT_SHADER,
  VOLUMETRIC_FIELD_VERTEX_SHADER,
  VOLUME_MODE_PROFILES,
} from './sceneVolumetricFieldSystemShared';
export { useVolumetricFieldRuntime } from './sceneVolumetricFieldSystemRuntime';
export { VolumetricFieldSystemRender } from './sceneVolumetricFieldSystemRender';
