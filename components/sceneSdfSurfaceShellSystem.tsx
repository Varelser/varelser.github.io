import React, { useRef } from 'react';
import type { Mesh } from 'three';
import type { SdfSurfaceShellSystemProps } from './sceneSdfSurfaceShellSystemShared';
import { useSdfSurfaceShellRuntime } from './sceneSdfSurfaceShellSystemRuntime';
import { SdfSurfaceShellSystemRender } from './sceneSdfSurfaceShellSystemRender';

export const SdfSurfaceShellSystem: React.FC<SdfSurfaceShellSystemProps> = (props) => {
  const meshRef = useRef<Mesh>(null);
  const { uniforms, radius } = useSdfSurfaceShellRuntime(props, meshRef);
  return <SdfSurfaceShellSystemRender meshRef={meshRef} radius={radius} uniforms={uniforms} />;
};

export type { SdfSurfaceShellSystemProps, ShellProfile } from './sceneSdfSurfaceShellSystemShared';
export {
  createSdfSurfaceShellUniforms,
  DEFAULT_SHELL_PROFILE,
  getSdfSurfaceShellProfile,
  getSdfSurfaceShellSettings,
  getSdfSurfaceShellSourceAdjustments,
  SDF_SURFACE_SHELL_FRAGMENT_SHADER,
  SDF_SURFACE_SHELL_VERTEX_SHADER,
  SHELL_MODE_PROFILES,
} from './sceneSdfSurfaceShellSystemShared';
export { useSdfSurfaceShellRuntime } from './sceneSdfSurfaceShellSystemRuntime';
export { SdfSurfaceShellSystemRender } from './sceneSdfSurfaceShellSystemRender';
