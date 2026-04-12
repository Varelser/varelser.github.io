import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { MathUtils, OrthographicCamera, PlaneGeometry, Scene, Vector2, Vector3 } from 'three';
import { LodSystem } from '../lib/lodSystem';
import { createAudioRouteStateMap, evaluateAudioRoutes } from '../lib/audioReactiveRuntime';
import { resolveGpgpuAudioDrives } from '../lib/audioReactiveTargetSets';
import {
  disposeGpgpuTransformFeedbackNativeCapturePass,
  ensureGpgpuTransformFeedbackNativeCapturePass,
  type GpgpuTransformFeedbackNativeCapturePassState,
} from '../lib/gpgpuTransformFeedbackNativeCapturePass';
import {
  createGpgpuFrameDiagnosticSnapshot,
  readbackParticlePositions,
  type GpgpuFrameDiagnosticSnapshot,
} from './gpgpuDiagnostics';
import {
  resolveGpgpuAudioBlast,
  resolveGpgpuFrameRouting,
  resolvePingPongTargets,
  shouldRequestGpgpuCpuReadback,
} from './gpgpuExecutionRouting';
import {
  blitPreviousPositionPass,
  runFluidAdvectionPass,
  runSimulationPasses,
  updateMouseWorldPosition,
} from './gpgpuSimulationPasses';
import { useGpgpuAssets } from './useGpgpuAssets';
import { getTexSize, useGpgpuRuntime } from './useGpgpuRuntime';
import {
  applyLodPolicy,
  pushTrailFrame,
  runDepthSortPass,
  syncVisualUniforms,
} from './gpgpuVisualUpdates';
import type { GpgpuSystemProps } from './sceneGpgpuSystemShared';
import { profileRuntimeTask, useProfiledFrame } from '../lib/runtimeProfiling';

export function useGpgpuSystemRuntime({ audioRef, config, isPlaying, posReadbackRef, posReadbackVersionRef }: GpgpuSystemProps) {
  const { gl, camera } = useThree();
  const mouseNDC = useRef(new Vector2(0, 0));
  const mouseWorldRef = useRef(new Vector3(0, 0, 0));
  const tempMouseVec = useRef(new Vector3());
  const tempMouseDir = useRef(new Vector3());
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);
  const audioRouteStateRef = useRef(createAudioRouteStateMap());
  const routingSnapshotRef = useRef<GpgpuFrameDiagnosticSnapshot | null>(null);
  const nativeTfCapturePassRef = useRef<GpgpuTransformFeedbackNativeCapturePassState | null>(null);

  useEffect(() => {
    const canvas = gl.domElement;
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseNDC.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNDC.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    canvas.addEventListener('mousemove', onMove);
    return () => canvas.removeEventListener('mousemove', onMove);
  }, [gl.domElement]);

  useEffect(() => {
    if (typeof window === 'undefined' || !import.meta.env.DEV) return;
    const target = window as Window & {
      __KALO_GPGPU_DEBUG__?: { getRouting: () => GpgpuFrameDiagnosticSnapshot | null };
    };
    target.__KALO_GPGPU_DEBUG__ = { getRouting: () => routingSnapshotRef.current };
    return () => {
      delete target.__KALO_GPGPU_DEBUG__;
    };
  }, []);

  const lodSystem = useMemo(() => new LodSystem(), []);
  const texSize = useMemo(() => getTexSize(config.gpgpuCount), [config.gpgpuCount]);

  useEffect(
    () => () => {
      const snapshot = disposeGpgpuTransformFeedbackNativeCapturePass({
        renderer: gl,
        stateRef: nativeTfCapturePassRef,
        texSize,
        reason: 'component unmounted',
      });
      routingSnapshotRef.current = routingSnapshotRef.current
        ? { ...routingSnapshotRef.current, nativeTransformFeedbackPass: snapshot }
        : null;
    },
    [gl, texSize],
  );

  const simScene = useMemo(() => new Scene(), []);
  const simCamera = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const simGeo = useMemo(() => new PlaneGeometry(2, 2), []);

  const assets = useGpgpuAssets({ config, texSize, simScene, simGeo });
  const {
    simMeshRef,
    velSimMat,
    posSimMat,
    blitMat,
    sortDepthMat,
    bitonicMat,
    fluidAdvectMat,
    drawGeo,
    streakGeo,
    trailRTs,
    trailHead,
  } = assets;

  const runtime = useGpgpuRuntime({ gl, texSize, config });
  const {
    rtRef,
    pingIsA,
    prevPosRTRef,
    initPosTexRef,
    fluidRTARef,
    fluidRTBRef,
    fluidPingIsA,
    sortRTARef,
    sortRTBRef,
    webgpuStateRef,
    webgpuPosTexRef,
    webgpuVelTexRef,
    webgpuPingIsARef,
    webgpuLastReadbackRef,
    webgpuInitStatusRef,
  } = runtime;

  useProfiledFrame('scene:gpgpu-core', config.executionDiagnosticsEnabled, ({ gl: glCtx }, delta) => {
    if (!isPlaying || !rtRef.current || !simMeshRef.current) return;
    const simMesh = simMeshRef.current;

    const dt = Math.min(delta, 0.05);
    frameCountRef.current += 1;
    timeRef.current += dt;
    if (config.autoLod) lodSystem.update(dt);

    const { isA, posIn, posOut, velIn, velOut } = resolvePingPongTargets(rtRef.current, pingIsA.current);
    const shouldRequestCpuReadback = shouldRequestGpgpuCpuReadback(config, frameCountRef.current);
    const activePosReadbackRef = shouldRequestCpuReadback ? posReadbackRef : undefined;
    const gpgpuAudioFrame = { ...audioRef.current, bandA: 0, bandB: 0 };
    const evaluatedAudioRoutes = evaluateAudioRoutes(config, gpgpuAudioFrame, audioRouteStateRef.current);
    const gpgpuAudioDrives = resolveGpgpuAudioDrives(evaluatedAudioRoutes);
    const blast = MathUtils.clamp(resolveGpgpuAudioBlast(config, gpgpuAudioFrame) + gpgpuAudioDrives.audioBlast, 0, 4);

    updateMouseWorldPosition({
      mouseNDC: mouseNDC.current,
      camera,
      mouseWorld: mouseWorldRef.current,
      tempVec: tempMouseVec.current,
      tempDir: tempMouseDir.current,
    });

    profileRuntimeTask('scene:gpgpu-blit-previous', 'simulation', () => {
      blitPreviousPositionPass({
        config,
        prevPosRT: prevPosRTRef.current,
        blitMat,
        simMesh,
        gl: glCtx,
        simScene,
        simCamera,
        posTexture: posIn.texture,
      });
    });

    profileRuntimeTask('scene:gpgpu-fluid-advection', 'simulation', () => {
      runFluidAdvectionPass({
        config,
        fluidRTA: fluidRTARef.current,
        fluidRTB: fluidRTBRef.current,
        fluidPingIsA,
        fluidAdvectMat,
        velSimMat,
        simMesh,
        gl: glCtx,
        simScene,
        simCamera,
        dt,
        time: timeRef.current,
      });
    });

    const routing = resolveGpgpuFrameRouting({
      config,
      webgpuState: webgpuStateRef.current,
      webgpuPosTexture: webgpuPosTexRef.current,
      webgpuVelTexture: webgpuVelTexRef.current,
      fallbackPosTexture: posOut.texture,
      fallbackVelTexture: velOut.texture,
      posReadbackRef: activePosReadbackRef,
      webgpuInitStatus: webgpuInitStatusRef.current,
    });

    profileRuntimeTask(`scene:gpgpu-simulation-${routing.useWebGPU ? 'webgpu' : 'webgl'}`, 'simulation', () => {
      runSimulationPasses({
        useWebGPU: routing.useWebGPU,
        config,
        texSize,
        dt,
        time: timeRef.current,
        blast,
        gpgpuAudioDrives,
        mouseWorld: mouseWorldRef.current,
        simMesh,
        gl: glCtx,
        simScene,
        simCamera,
        posIn,
        posOut,
        velIn,
        velOut,
        velSimMat,
        posSimMat,
        initPosTex: initPosTexRef.current,
        prevPosTex: prevPosRTRef.current?.texture ?? null,
        webgpuState: webgpuStateRef.current,
        webgpuPosTex: webgpuPosTexRef.current,
        webgpuVelTex: webgpuVelTexRef.current,
        webgpuPingIsARef,
        webgpuLastReadbackRef,
        posReadbackRef: activePosReadbackRef,
      });
    });

    const nativeTfCapturePass = profileRuntimeTask('scene:gpgpu-native-capture', 'simulation', () => ensureGpgpuTransformFeedbackNativeCapturePass({
      renderer: glCtx,
      texSize,
      sourcePositionTexture: posOut.texture,
      sourceVelocityTexture: velOut.texture,
      enabled: config.gpgpuEnabled && !routing.useWebGPU,
      stateRef: nativeTfCapturePassRef,
    }));
    routingSnapshotRef.current = createGpgpuFrameDiagnosticSnapshot(routing, nativeTfCapturePass);

    const finalSortTex = profileRuntimeTask('scene:gpgpu-depth-sort', 'simulation', () => runDepthSortPass({
      config,
      gl: glCtx,
      camera,
      simScene,
      simCamera,
      simMesh,
      posTexture: posOut.texture,
      texSize,
      sortRTA: sortRTARef.current,
      sortRTB: sortRTBRef.current,
      sortDepthMat,
      bitonicMat,
    }));

    profileRuntimeTask('scene:gpgpu-trail-history', 'simulation', () => {
      pushTrailFrame({
        config,
        gl: glCtx,
        simScene,
        simCamera,
        simMesh,
        blitMat,
        trailRTs,
        trailHead,
        posTexture: posOut.texture,
      });
    });

    glCtx.setRenderTarget(null);

    profileRuntimeTask('scene:gpgpu-readback', 'simulation', () => {
      readbackParticlePositions({
        routing,
        gl: glCtx,
        posOut,
        texSize,
        posReadbackRef: activePosReadbackRef,
        posReadbackVersionRef,
      });
    });

    pingIsA.current = !isA;

    const activeCount = profileRuntimeTask('scene:gpgpu-lod-policy', 'simulation', () => applyLodPolicy({
      config,
      lodSystem,
      texSize,
      velSimMat,
      drawGeo,
      streakGeo,
    }));

    profileRuntimeTask('scene:gpgpu-visual-sync', 'simulation', () => {
      syncVisualUniforms({
        config,
        activeCount,
        gpgpuAudioDrives,
        assets,
        posTexture: routing.outputPosTexture,
        velTexture: velOut.texture,
        finalSortTex,
      });
    });
  });

  return { assets };
}
