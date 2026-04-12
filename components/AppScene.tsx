import React from 'react';
import { Canvas, extend, useThree } from '@react-three/fiber';
import { BufferGeometry, Color, Group, InstancedMesh, LineSegments, PlaneGeometry, ShaderMaterial } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CameraImpulseRig, getAdaptiveDprRange, SceneBackgroundSync, shouldUseAntialias } from './AppSceneCameraRig';
import { SceneDefaultCamera } from './AppSceneCameraPrimitives';
import { useAppSceneTemporalConfig } from './useAppSceneTemporalConfig';
import type { AppSceneProps } from './AppSceneTypes';

const hasVisibleScreenOverlay = (config: AppSceneProps['config'], interLayerContactAmount: number, isSequencePlaying: boolean) => {
  const hasScreenFx = config.screenScanlineIntensity > 0.001
    || config.screenNoiseIntensity > 0.001
    || config.screenVignetteIntensity > 0.001
    || config.screenPulseIntensity > 0.001
    || config.screenImpactFlashIntensity > 0.001
    || config.screenBurstDrive > 0.001
    || config.screenInterferenceIntensity > 0.001
    || config.screenPersistenceIntensity > 0.001
    || config.screenSplitIntensity > 0.001
    || config.screenSweepIntensity > 0.001;

  const hasSequenceDrive = config.screenSequenceDriveEnabled && isSequencePlaying && config.screenSequenceDriveStrength > 0.001;
  const hasInterLayerDrive = config.interLayerContactFxEnabled && config.interLayerCollisionEnabled && interLayerContactAmount > 0.001;
  const hasAudioDrive = config.audioEnabled && (config.audioScreenScale > 0.001 || config.audioBurstScale > 0.001);

  return hasScreenFx || hasSequenceDrive || hasInterLayerDrive || hasAudioDrive;
};

extend({
  InstancedMesh: InstancedMesh,
  ShaderMaterial: ShaderMaterial,
  Group: Group,
  LineSegments: LineSegments,
  PlaneGeometry: PlaneGeometry,
  BufferGeometry: BufferGeometry,
});



const AppSceneExportBridge: React.FC<{
  sceneRef: React.MutableRefObject<import("three").Scene | null>;
  cameraRef: React.MutableRefObject<import("three").Camera | null>;
}> = ({ sceneRef, cameraRef }) => {
  const { scene, camera } = useThree();

  React.useEffect(() => {
    sceneRef.current = scene;
    cameraRef.current = camera;
    return () => {
      if (sceneRef.current === scene) sceneRef.current = null;
      if (cameraRef.current === camera) cameraRef.current = null;
    };
  }, [camera, cameraRef, scene, sceneRef]);

  return null;
};

const hasActivePostFx = (config: AppSceneProps['config']) => (
  config.postBloomEnabled
  || config.postChromaticAberrationEnabled
  || config.postBrightnessContrastEnabled
  || config.postDofEnabled
  || config.postNoiseEnabled
  || config.postVignetteEnabled
  || config.postN8aoEnabled
);

function scheduleSceneInternalsActivation(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    callback();
    return () => {};
  }

  let settled = false;
  let rafId = 0;
  let timeoutId = 0;

  const flush = () => {
    if (settled) return;
    settled = true;
    callback();
  };

  rafId = window.requestAnimationFrame(flush);
  timeoutId = window.setTimeout(flush, 80);

  return () => {
    settled = true;
    window.cancelAnimationFrame(rafId);
    window.clearTimeout(timeoutId);
  };
}

export const AppScene: React.FC<AppSceneProps> = React.memo(({
  audioRef,
  config,
  interLayerContactAmount,
  isPlaying,
  isSequencePlaying,
  postFxEditingHint = false,
  rendererRef,
  sceneRef = { current: null },
  cameraRef = { current: null },
  saveTrigger,
  sequenceStepProgressRef,
  cameraRigApiRef = { current: null },
  onCameraPathPlayingChange,
}) => {
  const controlsRef = React.useRef<OrbitControlsImpl | null>(null);
  const [showDeferredSceneInternals, setShowDeferredSceneInternals] = React.useState(false);
  const LazyAppSceneLayerContent = React.useMemo(() => React.lazy(async () => ({ default: (await import('./AppSceneLayerContent')).AppSceneLayerContent })), []);
  const LazyAppSceneCameraPathController = React.useMemo(() => React.lazy(async () => ({ default: (await import('./AppSceneCameraPathController')).AppSceneCameraPathController })), []);
  const LazyAppScenePostFx = React.useMemo(() => React.lazy(async () => ({ default: (await import('./AppScenePostFx')).AppScenePostFx })), []);
  const LazyAppOrbitControls = React.useMemo(() => React.lazy(async () => ({ default: (await import('./AppOrbitControls')).AppOrbitControls as React.ComponentType<any> })), []);
  const LazyScreenOverlay = React.useMemo(() => React.lazy(async () => ({ default: (await import('./sceneOverlay')).ScreenOverlay as React.ComponentType<any> })), []);
  const LazyScreenshotManager = React.useMemo(() => React.lazy(async () => ({ default: (await import('./sceneCapture')).ScreenshotManager as React.ComponentType<any> })), []);
  const isInteractingRef = React.useRef(false);
  const isCameraPathPlayingRef = React.useRef(false);
  const metaballPosRef = React.useRef<Float32Array | null>(null);
  const metaballReadbackVersionRef = React.useRef(0);

  const effectiveConfig = useAppSceneTemporalConfig(config, isPlaying);
  const adaptiveDpr = React.useMemo(() => getAdaptiveDprRange(effectiveConfig), [effectiveConfig]);
  const antialias = React.useMemo(() => shouldUseAntialias(effectiveConfig), [effectiveConfig]);
  const shouldRenderScreenOverlay = React.useMemo(
    () => hasVisibleScreenOverlay(effectiveConfig, interLayerContactAmount, isSequencePlaying),
    [effectiveConfig, interLayerContactAmount, isSequencePlaying],
  );
  const shouldRenderPostFx = React.useMemo(() => hasActivePostFx(effectiveConfig), [effectiveConfig]);

  React.useEffect(() => scheduleSceneInternalsActivation(() => {
    React.startTransition(() => {
      setShowDeferredSceneInternals(true);
    });
  }), []);

  return (
    <Canvas
      className="touch-none"
      style={{ touchAction: 'none' }}
      gl={{ preserveDrawingBuffer: false, antialias, alpha: false, powerPreference: 'high-performance' }}
      dpr={adaptiveDpr}
      onCreated={({ gl }) => {
        gl.setClearColor(new Color(effectiveConfig.backgroundColor));
        rendererRef.current = gl;
      }}
    >
      <AppSceneExportBridge sceneRef={sceneRef} cameraRef={cameraRef} />
      <SceneBackgroundSync backgroundColor={effectiveConfig.backgroundColor} />
      <color attach="background" args={[effectiveConfig.backgroundColor]} />
      {effectiveConfig.depthFogEnabled && (
        <fog attach="fog" args={[effectiveConfig.backgroundColor, config.depthFogNear, config.depthFogFar]} />
      )}
      <SceneDefaultCamera config={effectiveConfig} />
      <CameraImpulseRig
        audioRef={audioRef}
        config={effectiveConfig}
        controlsRef={controlsRef}
        isCameraPathPlayingRef={isCameraPathPlayingRef}
        isInteractingRef={isInteractingRef}
        isPlaying={isPlaying}
      />
      {showDeferredSceneInternals ? (
        <React.Suspense fallback={null}>
          <LazyAppSceneCameraPathController
            controlsRef={controlsRef}
            cameraRigApiRef={cameraRigApiRef}
            isCameraPathPlayingRef={isCameraPathPlayingRef}
            isInteractingRef={isInteractingRef}
            onPlayingChange={onCameraPathPlayingChange}
          />
        </React.Suspense>
      ) : null}
      {saveTrigger > 0 ? (
        <React.Suspense fallback={null}>
          <LazyScreenshotManager config={effectiveConfig} saveTrigger={saveTrigger} />
        </React.Suspense>
      ) : null}
      {effectiveConfig.cameraControlMode !== 'auto' && (
        <React.Suspense fallback={null}>
          <LazyAppOrbitControls
            key={`controls-${effectiveConfig.cameraDistance}-${effectiveConfig.viewMode}`}
            ref={controlsRef}
            enabled={true}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            onStart={() => { isInteractingRef.current = true; }}
            onEnd={() => { isInteractingRef.current = false; }}
          />
        </React.Suspense>
      )}
      {showDeferredSceneInternals ? (
        <React.Suspense fallback={null}>
          <LazyAppSceneLayerContent
            audioRef={audioRef}
            config={effectiveConfig}
            interLayerContactAmount={interLayerContactAmount}
            isPlaying={isPlaying}
            metaballPosRef={metaballPosRef}
            metaballReadbackVersionRef={metaballReadbackVersionRef}
          />
        </React.Suspense>
      ) : null}
      {shouldRenderScreenOverlay ? (
        <React.Suspense fallback={null}>
          <LazyScreenOverlay
            audioRef={audioRef}
              config={effectiveConfig}
              isPlaying={isPlaying}
              contactAmount={interLayerContactAmount}
              isSequencePlaying={isSequencePlaying}
              sequenceStepProgressRef={sequenceStepProgressRef}
            />
          </React.Suspense>
        ) : null}
      {shouldRenderPostFx ? (
        <React.Suspense fallback={null}>
          <LazyAppScenePostFx config={effectiveConfig} editingHint={postFxEditingHint} />
        </React.Suspense>
      ) : null}
    </Canvas>
  );
});
AppScene.displayName = 'AppScene';
