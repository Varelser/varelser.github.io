import React from 'react';
import type { MetaballSystemProps } from './sceneMetaballSystemShared';
import { useMetaballRuntime } from './sceneMetaballSystemRuntime';
import { MetaballSystemRender } from './sceneMetaballSystemRender';

export const MetaballSystem: React.FC<MetaballSystemProps> = React.memo((props) => {
  const runtime = useMetaballRuntime(props);
  return <MetaballSystemRender marchingCubes={runtime.marchingCubes} />;
});
MetaballSystem.displayName = 'MetaballSystem';

export type { MetaballSystemProps } from './sceneMetaballSystemShared';
export {
  createMarchingCubesObject,
  createMetaballMaterial,
  getMetaballResolution,
  getTexSizeForCount,
  syncMetaballMaterial,
  updateMetaballField,
} from './sceneMetaballSystemShared';
export { useMetaballRuntime } from './sceneMetaballSystemRuntime';
export { MetaballSystemRender } from './sceneMetaballSystemRender';
export default MetaballSystem;
