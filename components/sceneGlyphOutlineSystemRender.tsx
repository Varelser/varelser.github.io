import React from 'react';
import type { LineSegments } from 'three';
import type { ParticleConfig } from '../types';
import { getGlyphOutlineBlending, type GlyphOutlineProfile } from './sceneGlyphOutlineSystemShared';

export const GlyphOutlineSystemRender: React.FC<{
  lineRef: React.RefObject<LineSegments | null>;
  positions: Float32Array;
  opacity: number;
  profile: GlyphOutlineProfile;
  color: string;
  width: number;
  materialStyle: ParticleConfig['layer2MaterialStyle'];
}> = ({ lineRef, positions, opacity, profile, color, width, materialStyle }) => {
  if (positions.length === 0) return null;

  const blending = getGlyphOutlineBlending(profile.blendMode, materialStyle);

  return (
    <lineSegments ref={lineRef as React.Ref<any>} renderOrder={7}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial
        transparent
        depthWrite={false}
        depthTest={false}
        opacity={opacity * profile.opacityMul}
        color={color}
        blending={blending}
        linewidth={Math.max(1, width * profile.widthMul * 2.5)}
      />
    </lineSegments>
  );
};
