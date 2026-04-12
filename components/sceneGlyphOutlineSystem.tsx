import React, { useRef } from 'react';
import type { LineSegments } from 'three';
import type { GlyphOutlineSystemProps } from './sceneGlyphOutlineSystemShared';
import { useGlyphOutlineRuntime } from './sceneGlyphOutlineSystemRuntime';
import { GlyphOutlineSystemRender } from './sceneGlyphOutlineSystemRender';

export const GlyphOutlineSystem: React.FC<GlyphOutlineSystemProps> = (props) => {
  const lineRef = useRef<LineSegments>(null);
  const runtime = useGlyphOutlineRuntime(props, lineRef);
  return <GlyphOutlineSystemRender lineRef={lineRef} {...runtime} />;
};

export type {
  GlyphOutlineAudioFrame,
  GlyphOutlineProfile,
  GlyphOutlineSystemProps,
} from './sceneGlyphOutlineSystemShared';
export {
  blendTowardGrid,
  buildGlyphOutlinePositions,
  DEFAULT_GLYPH_OUTLINE_PROFILE,
  getGlyphOutlineBlending,
  getGlyphOutlineProfile,
  getHash,
  getResolvedGlyphOutlineProfile,
  GLYPH_MODE_PROFILES,
} from './sceneGlyphOutlineSystemShared';
export { useGlyphOutlineRuntime } from './sceneGlyphOutlineSystemRuntime';
export { GlyphOutlineSystemRender } from './sceneGlyphOutlineSystemRender';
