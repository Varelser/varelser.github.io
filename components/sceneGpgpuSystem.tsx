import React from 'react';
import type { FC } from 'react';
import type { GpgpuSystemProps } from './sceneGpgpuSystemShared';
import { GpgpuSystemRender } from './sceneGpgpuSystemRender';
import { useGpgpuSystemRuntime } from './sceneGpgpuSystemRuntime';

export const GpgpuSystem: FC<GpgpuSystemProps> = React.memo((props) => {
  const runtime = useGpgpuSystemRuntime(props);
  return <GpgpuSystemRender config={props.config} {...runtime} />;
});

GpgpuSystem.displayName = 'GpgpuSystem';

export type { GpgpuSystemProps } from './sceneGpgpuSystemShared';
export { GpgpuSystemRender } from './sceneGpgpuSystemRender';
export { useGpgpuSystemRuntime } from './sceneGpgpuSystemRuntime';
