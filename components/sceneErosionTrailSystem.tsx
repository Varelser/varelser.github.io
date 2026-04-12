import React, { useRef } from 'react';
import type { BufferGeometry, LineSegments, ShaderMaterial } from 'three';
import type { ErosionTrailSystemProps } from './sceneErosionTrailSystemShared';
import { useErosionTrailRuntime } from './sceneErosionTrailSystemRuntime';
import { ErosionTrailSystemRender } from './sceneErosionTrailSystemRender';

export const ErosionTrailSystem: React.FC<ErosionTrailSystemProps> = (props) => {
  const lineRef = useRef<LineSegments>(null);
  const geometryRef = useRef<BufferGeometry | null>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const { layout } = useErosionTrailRuntime(props, lineRef, geometryRef, materialRef);
  if (!layout) return null;
  return <ErosionTrailSystemRender lineRef={lineRef} materialRef={materialRef} />;
};

export type { ErosionProfile, ErosionTrailSystemProps, TrailLayout } from './sceneErosionTrailSystemShared';
export {
  buildTrailLayout,
  createErosionTrailUniforms,
  EROSION_TRAIL_FRAGMENT_SHADER,
  EROSION_TRAIL_VERTEX_SHADER,
  getErosionProfile,
  getErosionTrailLayoutDeps,
  getLayerErosionTrailSettings,
  updateErosionTrailGeometry,
  updateErosionTrailMaterial,
} from './sceneErosionTrailSystemShared';
export { useErosionTrailRuntime } from './sceneErosionTrailSystemRuntime';
export { ErosionTrailSystemRender } from './sceneErosionTrailSystemRender';
