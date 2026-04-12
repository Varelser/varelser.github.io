import React from 'react';
import { AdditiveBlending, Color, FrontSide, NormalBlending, ShaderMaterial } from 'three';
import {
  createVolumetricFieldUniforms,
  VOLUMETRIC_FIELD_FRAGMENT_SHADER,
  VOLUMETRIC_FIELD_VERTEX_SHADER,
  type VolumeProfile,
  type VolumetricFieldSettings,
} from './sceneVolumetricFieldSystemShared';
import { isGraphicMaterialStyle } from '../lib/materialStyle';

export const VolumetricFieldSystemRender: React.FC<{
  materialRef: React.RefObject<ShaderMaterial | null>;
  settings: VolumetricFieldSettings;
  profile: VolumeProfile;
  color: Color;
  tint: Color;
  materialStyleIndex: number;
  scaleBase: number;
  depthScale: number;
}> = ({ materialRef, settings, profile, color, tint, materialStyleIndex, scaleBase, depthScale }) => (
  <mesh scale={[scaleBase, scaleBase, depthScale]} renderOrder={3}>
    <boxGeometry args={[2.4, 2.4, 2.4, 1, 1, 1]} />
    <shaderMaterial
      ref={materialRef as React.Ref<ShaderMaterial>}
      vertexShader={VOLUMETRIC_FIELD_VERTEX_SHADER}
      fragmentShader={VOLUMETRIC_FIELD_FRAGMENT_SHADER}
      transparent={true}
      depthWrite={false}
      side={FrontSide}
      blending={isGraphicMaterialStyle(settings.materialStyle) ? NormalBlending : AdditiveBlending}
      uniforms={createVolumetricFieldUniforms(settings, profile, color, tint, materialStyleIndex)}
    />
  </mesh>
);
