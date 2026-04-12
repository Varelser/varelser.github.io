import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export type AppOrbitControlsProps = {
  enabled: boolean;
  enablePan: boolean;
  enableZoom: boolean;
  enableRotate: boolean;
  onStart?: () => void;
  onEnd?: () => void;
};

export const AppOrbitControls = React.forwardRef<OrbitControlsImpl, AppOrbitControlsProps>(({
  enabled,
  enablePan,
  enableZoom,
  enableRotate,
  onStart,
  onEnd,
}, forwardedRef) => {
  const { camera, gl, invalidate } = useThree();
  const controls = React.useMemo(() => new OrbitControlsImpl(camera, gl.domElement), [camera, gl.domElement]);

  React.useImperativeHandle(forwardedRef, () => controls, [controls]);

  React.useEffect(() => {
    controls.enabled = enabled;
    controls.enablePan = enablePan;
    controls.enableZoom = enableZoom;
    controls.enableRotate = enableRotate;
    controls.update();
    invalidate();
  }, [controls, enablePan, enableRotate, enableZoom, enabled, invalidate]);

  React.useEffect(() => {
    const handleStart = () => { onStart?.(); };
    const handleEnd = () => { onEnd?.(); };
    const handleChange = () => { invalidate(); };

    (controls as any).addEventListener('start', handleStart);
    (controls as any).addEventListener('end', handleEnd);
    (controls as any).addEventListener('change', handleChange);

    return () => {
      (controls as any).removeEventListener('start', handleStart);
      (controls as any).removeEventListener('end', handleEnd);
      (controls as any).removeEventListener('change', handleChange);
      controls.dispose();
    };
  }, [controls, invalidate, onEnd, onStart]);

  useFrame(() => {
    if (controls.enabled) controls.update();
  }, -1);

  return null;
});
AppOrbitControls.displayName = 'AppOrbitControls';
