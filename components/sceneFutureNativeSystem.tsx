import React, { useEffect, useMemo, useRef } from 'react';
import { BufferGeometry, DoubleSide, LineBasicMaterial, MeshBasicMaterial, PointsMaterial } from 'three';
import type { Group, LineSegments, Mesh, Points } from 'three';
import type { ParticleConfig } from '../types';
import {
  applyFutureNativeSceneAudioDrive,
  buildFutureNativeSceneBridgeDescriptor,
  buildFutureNativeSceneBridgeRuntimeKey,
  createFutureNativeSceneBridgeRuntime,
  stepFutureNativeSceneBridgeRuntime,
  type FutureNativeSceneBridgeDescriptor,
  type FutureNativeSceneBridgeRuntime,
} from '../lib/future-native-families/futureNativeSceneRendererBridge';
import { buildFutureNativeDescriptorPacket } from '../lib/futureNativeDescriptorPacket';
import { getFutureNativePacketExecutionPlan } from '../lib/futureNativePacketExecutionRoute';
import { buildFutureNativeDescriptorPacketAsync } from '../lib/futureNativeDescriptorPacketAsync';
import {
  clearFutureNativeSceneDiagnostic,
  publishFutureNativeSceneDiagnostic,
} from '../lib/future-native-families/futureNativeSceneDiagnosticsStore';
import { syncFloat32GeometryAttribute, syncGeometryIndex } from '../lib/geometryBufferSync';
import { profileRuntimeTask, useProfiledFrame } from '../lib/runtimeProfiling';
import { getWorkerExecutionEntry } from '../lib/workerExecutionTelemetry';
import { getFutureNativePlaybackWorkerStrategy, getPlaybackPayloadTier } from '../lib/futureNativePlaybackWorkerPolicy';
import { getFutureNativeVisualFrameStride } from '../lib/futureNativeVisualCadence';

type SceneFutureNativeSystemProps = {
  config: ParticleConfig;
  layerIndex: 2 | 3;
  audioRef: React.MutableRefObject<{ bass: number; treble: number; pulse: number; bandA: number; bandB: number }>;
  isPlaying: boolean;
};

const EMPTY_FLOAT32 = new Float32Array(0);
const EMPTY_UINT16 = new Uint16Array(0);

function applyDescriptorPacketToScene(
  descriptorPacket: import('../lib/futureNativeDescriptorPacket').FutureNativeDescriptorPacket,
  {
    surfaceGeometry,
    pointsGeometry,
    linesGeometry,
    hullGeometry,
    surfaceMaterial,
    pointsMaterial,
    lineMaterial,
    hullMaterial,
    groupRef,
    surfaceMeshRef,
    pointsRef,
    lineSegmentsRef,
    hullLineRef,
    layerIndex,
  }: {
    surfaceGeometry: BufferGeometry;
    pointsGeometry: BufferGeometry;
    linesGeometry: BufferGeometry;
    hullGeometry: BufferGeometry;
    surfaceMaterial: MeshBasicMaterial;
    pointsMaterial: PointsMaterial;
    lineMaterial: LineBasicMaterial;
    hullMaterial: LineBasicMaterial;
    groupRef: React.MutableRefObject<Group | null>;
    surfaceMeshRef: React.MutableRefObject<Mesh | null>;
    pointsRef: React.MutableRefObject<Points | null>;
    lineSegmentsRef: React.MutableRefObject<LineSegments | null>;
    hullLineRef: React.MutableRefObject<LineSegments | null>;
    layerIndex: 2 | 3;
  },
) {
  syncFloat32GeometryAttribute(surfaceGeometry, 'position', descriptorPacket.surfacePositions, 3);
  syncFloat32GeometryAttribute(surfaceGeometry, 'color', descriptorPacket.surfaceColors, 3);
  syncGeometryIndex(surfaceGeometry, descriptorPacket.surfaceIndices);
  syncFloat32GeometryAttribute(hullGeometry, 'position', descriptorPacket.hullPositions, 3);
  syncFloat32GeometryAttribute(pointsGeometry, 'position', descriptorPacket.pointPositions, 3);
  syncFloat32GeometryAttribute(linesGeometry, 'position', descriptorPacket.linePositions, 3);

  surfaceMaterial.color.set('#ffffff');
  surfaceMaterial.opacity = descriptorPacket.surfaceOpacity;

  pointsMaterial.color.set(descriptorPacket.pointColor);
  pointsMaterial.opacity = descriptorPacket.pointOpacity;
  pointsMaterial.size = descriptorPacket.pointSize;

  lineMaterial.color.set(descriptorPacket.lineColor);
  lineMaterial.opacity = descriptorPacket.lineOpacity;

  hullMaterial.color.set(descriptorPacket.hullColor);
  hullMaterial.opacity = descriptorPacket.hullOpacity;

  if (groupRef.current) {
    groupRef.current.scale.setScalar(descriptorPacket.sceneScale);
    groupRef.current.position.z = layerIndex === 2 ? -12 : 12;
  }
  if (surfaceMeshRef.current) {
    surfaceMeshRef.current.visible = descriptorPacket.surfaceVisible;
  }
  if (pointsRef.current) {
    pointsRef.current.visible = descriptorPacket.pointsVisible;
  }
  if (lineSegmentsRef.current) {
    lineSegmentsRef.current.visible = descriptorPacket.linesVisible;
  }
  if (hullLineRef.current) {
    hullLineRef.current.visible = descriptorPacket.hullVisible;
  }
}

function getReusableFloat32Array(
  geometry: BufferGeometry,
  name: string,
  expectedLength: number,
) {
  const attribute = geometry.getAttribute(name);
  return attribute && attribute.array instanceof Float32Array && attribute.array.length === expectedLength
    ? attribute.array
    : undefined;
}


export const SceneFutureNativeSystem: React.FC<SceneFutureNativeSystemProps> = ({
  config,
  layerIndex,
  audioRef,
  isPlaying,
}) => {
  const runtimeKey = useMemo(() => buildFutureNativeSceneBridgeRuntimeKey(config, layerIndex), [config, layerIndex]);
  const controller = useMemo(() => createFutureNativeSceneBridgeRuntime(config, layerIndex), [config, layerIndex, runtimeKey]);
  const controllerRef = useRef<FutureNativeSceneBridgeRuntime | null>(controller);
  const descriptorRef = useRef<FutureNativeSceneBridgeDescriptor | null>(null);
  const groupRef = useRef<Group>(null);
  const surfaceMeshRef = useRef<Mesh>(null);
  const pointsRef = useRef<Points>(null);
  const lineSegmentsRef = useRef<LineSegments>(null);
  const hullLineRef = useRef<LineSegments>(null);
  const publishFrameRef = useRef(0);
  const staticFrameSettledRef = useRef(false);
  const staticPacketRequestIdRef = useRef(0);
  const playbackPacketRequestIdRef = useRef(0);
  const playbackPacketPendingRef = useRef(false);
  const playbackPacketLastQueuedAtRef = useRef(0);
  const playbackPacketLastAppliedAtRef = useRef(0);
  const playbackPacketHeldRef = useRef(false);
  const playbackPacketLastHoldAtRef = useRef(0);
  const surfaceGeometry = useMemo(() => new BufferGeometry(), []);
  const pointsGeometry = useMemo(() => new BufferGeometry(), []);
  const linesGeometry = useMemo(() => new BufferGeometry(), []);
  const hullGeometry = useMemo(() => new BufferGeometry(), []);
  const surfaceMaterial = useMemo(
    () => new MeshBasicMaterial({ transparent: true, opacity: 0.32, depthWrite: false, side: DoubleSide, vertexColors: true }),
    [],
  );
  const pointsMaterial = useMemo(
    () => new PointsMaterial({ size: 7, transparent: true, opacity: 0.7, depthWrite: false, sizeAttenuation: false }),
    [],
  );
  const lineMaterial = useMemo(
    () => new LineBasicMaterial({ transparent: true, opacity: 0.5, depthWrite: false }),
    [],
  );
  const hullMaterial = useMemo(
    () => new LineBasicMaterial({ transparent: true, opacity: 0.72, depthWrite: false }),
    [],
  );

  useEffect(() => {
    controllerRef.current = controller;
    staticFrameSettledRef.current = false;
    if (!controllerRef.current) {
      descriptorRef.current = null;
      clearFutureNativeSceneDiagnostic(layerIndex);
      syncFloat32GeometryAttribute(surfaceGeometry, 'position', EMPTY_FLOAT32, 3);
      syncFloat32GeometryAttribute(surfaceGeometry, 'color', EMPTY_FLOAT32, 3);
      syncGeometryIndex(surfaceGeometry, EMPTY_UINT16);
      syncFloat32GeometryAttribute(pointsGeometry, 'position', EMPTY_FLOAT32, 3);
      syncFloat32GeometryAttribute(linesGeometry, 'position', EMPTY_FLOAT32, 3);
      syncFloat32GeometryAttribute(hullGeometry, 'position', EMPTY_FLOAT32, 3);
      return;
    }
    const nextDescriptor = buildFutureNativeSceneBridgeDescriptor(controllerRef.current, config, layerIndex);
    descriptorRef.current = nextDescriptor;
    const requestId = ++staticPacketRequestIdRef.current;
    let disposed = false;
    void buildFutureNativeDescriptorPacketAsync(nextDescriptor, layerIndex, { isPlaying }).then((descriptorPacket) => {
      if (disposed || requestId != staticPacketRequestIdRef.current) return;
      applyDescriptorPacketToScene(descriptorPacket, {
        surfaceGeometry,
        pointsGeometry,
        linesGeometry,
        hullGeometry,
        surfaceMaterial,
        pointsMaterial,
        lineMaterial,
        hullMaterial,
        groupRef,
        surfaceMeshRef,
        pointsRef,
        lineSegmentsRef,
        hullLineRef,
        layerIndex,
      });
      staticFrameSettledRef.current = !isPlaying;
    });
    return () => {
      disposed = true;
    };
  }, [config, controller, hullGeometry, layerIndex, linesGeometry, pointsGeometry, surfaceGeometry]);

  useEffect(() => {
    staticFrameSettledRef.current = false;
    playbackPacketPendingRef.current = false;
    playbackPacketLastQueuedAtRef.current = 0;
    playbackPacketLastAppliedAtRef.current = 0;
    playbackPacketHeldRef.current = false;
    playbackPacketLastHoldAtRef.current = 0;
  }, [isPlaying]);

  useEffect(() => () => {
    clearFutureNativeSceneDiagnostic(layerIndex);
    surfaceGeometry.dispose();
    pointsGeometry.dispose();
    linesGeometry.dispose();
    hullGeometry.dispose();
    surfaceMaterial.dispose();
    pointsMaterial.dispose();
    lineMaterial.dispose();
    hullMaterial.dispose();
  }, [hullGeometry, hullMaterial, layerIndex, lineMaterial, linesGeometry, pointsGeometry, surfaceGeometry, surfaceMaterial, pointsMaterial]);

  useProfiledFrame(`scene:future-native-layer${layerIndex}`, config.executionDiagnosticsEnabled, (_, delta) => {
    const activeController = controllerRef.current;
    if (!activeController) return;
    if (!isPlaying && staticFrameSettledRef.current) return;

    profileRuntimeTask(`scene:future-native-audio-layer${layerIndex}`, 'simulation', () => {
      applyFutureNativeSceneAudioDrive(activeController, audioRef.current, isPlaying);
    });
    if (isPlaying) {
      const steps = Math.max(1, Math.min(3, Math.round(delta * 60)));
      profileRuntimeTask(`scene:future-native-step-layer${layerIndex}`, 'simulation', () => {
        stepFutureNativeSceneBridgeRuntime(activeController, { steps, dt: Math.max(1 / 240, Math.min(1 / 24, delta || 1 / 60)) });
      });
    }

    publishFrameRef.current += 1;
    const visualFrameStride = getFutureNativeVisualFrameStride(config.renderQuality, activeController.familyId);
    const shouldRefreshVisuals = !isPlaying
      || descriptorRef.current === null
      || publishFrameRef.current === 1
      || publishFrameRef.current % visualFrameStride === 0;
    if (!shouldRefreshVisuals) {
      return;
    }

    const nextDescriptor = profileRuntimeTask(`scene:future-native-descriptor-layer${layerIndex}`, 'simulation', () => (
      buildFutureNativeSceneBridgeDescriptor(activeController, config, layerIndex, {
        profilingKeyPrefix: `scene:future-native-descriptor-layer${layerIndex}`,
      })
    ));
    descriptorRef.current = nextDescriptor;
    let playbackEstimatedBytes = 0;
    let playbackPayloadTier = getPlaybackPayloadTier(0);
    let playbackWorkerCooldownMs = 0;
    let playbackWorkerStaleMs = 0;
    let playbackWorkerBackoffMs = 0;
    let playbackWorkerBypassReason: 'none' | 'fallback-pressure' | 'mixed-light' | 'pending-medium' = 'none';

    if (!isPlaying) {
      const requestId = ++staticPacketRequestIdRef.current;
      void buildFutureNativeDescriptorPacketAsync(nextDescriptor, layerIndex, { isPlaying }).then((descriptorPacket) => {
        if (requestId !== staticPacketRequestIdRef.current) return;
        applyDescriptorPacketToScene(descriptorPacket, {
          surfaceGeometry,
          pointsGeometry,
          linesGeometry,
          hullGeometry,
          surfaceMaterial,
          pointsMaterial,
          lineMaterial,
          hullMaterial,
          groupRef,
          surfaceMeshRef,
          pointsRef,
          lineSegmentsRef,
          hullLineRef,
          layerIndex,
        });
        staticFrameSettledRef.current = true;
      });
    } else {
      const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const playbackWorkerPlan = getFutureNativePacketExecutionPlan(nextDescriptor, typeof Worker !== 'undefined', { isPlaying: true });
      playbackEstimatedBytes = playbackWorkerPlan.estimatedBytes;
      const playbackHoldRecentlyActive = playbackPacketHeldRef.current && (nowMs - playbackPacketLastHoldAtRef.current < 260);
      const playbackTelemetryEntry = getWorkerExecutionEntry(
        `worker:future-native-packet-layer${layerIndex}:${nextDescriptor.familyId}:playback`,
        nowMs,
      );
      const playbackStrategy = getFutureNativePlaybackWorkerStrategy({
        estimatedBytes: playbackEstimatedBytes,
        heldRecentlyActive: playbackHoldRecentlyActive,
        telemetryEntry: playbackTelemetryEntry,
      });
      playbackPayloadTier = playbackStrategy.timing.payloadTier;
      playbackWorkerCooldownMs = playbackStrategy.timing.cooldownMs;
      playbackWorkerStaleMs = playbackStrategy.timing.staleMs;
      playbackWorkerBackoffMs = playbackStrategy.timing.backoffMs;
      playbackWorkerBypassReason = playbackStrategy.bypassReason;
      const playbackRoute = playbackWorkerPlan.route === 'worker' && !playbackStrategy.preferDirectPlayback ? 'worker' : 'direct';
      const canQueuePlaybackWorker = playbackRoute === 'worker'
        && !playbackPacketPendingRef.current
        && (nowMs - playbackPacketLastQueuedAtRef.current >= playbackWorkerCooldownMs);
      const shouldHoldPlaybackPacket = playbackRoute === 'worker'
        && (playbackPacketPendingRef.current || (nowMs - playbackPacketLastQueuedAtRef.current < playbackWorkerCooldownMs))
        && (nowMs - playbackPacketLastAppliedAtRef.current < playbackWorkerStaleMs);
      const allowPlaybackWorker = canQueuePlaybackWorker;
      if (shouldHoldPlaybackPacket) {
        if (!playbackPacketHeldRef.current) {
          playbackPacketLastHoldAtRef.current = nowMs;
        }
        playbackPacketHeldRef.current = true;
      }
      if (allowPlaybackWorker) {
        playbackPacketPendingRef.current = true;
        playbackPacketHeldRef.current = false;
        playbackPacketLastHoldAtRef.current = 0;
        playbackPacketLastQueuedAtRef.current = nowMs;
        const requestId = ++playbackPacketRequestIdRef.current;
        void buildFutureNativeDescriptorPacketAsync(nextDescriptor, layerIndex, { isPlaying: true }).then((descriptorPacket) => {
          playbackPacketPendingRef.current = false;
          if (requestId !== playbackPacketRequestIdRef.current) return;
          applyDescriptorPacketToScene(descriptorPacket, {
            surfaceGeometry,
            pointsGeometry,
            linesGeometry,
            hullGeometry,
            surfaceMaterial,
            pointsMaterial,
            lineMaterial,
            hullMaterial,
            groupRef,
            surfaceMeshRef,
            pointsRef,
            lineSegmentsRef,
            hullLineRef,
            layerIndex,
          });
          playbackPacketLastAppliedAtRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
          playbackPacketHeldRef.current = false;
          playbackPacketLastHoldAtRef.current = 0;
          staticFrameSettledRef.current = false;
        }).catch(() => {
          playbackPacketPendingRef.current = false;
          const catchNowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
          if (catchNowMs - playbackPacketLastAppliedAtRef.current < playbackWorkerStaleMs) {
            playbackPacketHeldRef.current = true;
            playbackPacketLastHoldAtRef.current = catchNowMs;
          }
        });
      }

      if (!allowPlaybackWorker && !shouldHoldPlaybackPacket) {
        if (playbackRoute !== 'worker' && nextDescriptor.familyId === 'pbd-softbody') {
          playbackPacketPendingRef.current = false;
        }
        playbackPacketHeldRef.current = false;
        playbackPacketLastHoldAtRef.current = 0;
        profileRuntimeTask(`scene:future-native-geometry-layer${layerIndex}`, 'simulation', () => {
          const descriptorPacket = profileRuntimeTask(`scene:future-native-packet-layer${layerIndex}`, 'simulation', () => buildFutureNativeDescriptorPacket(nextDescriptor, {
            surfaceColors: getReusableFloat32Array(surfaceGeometry, 'color', nextDescriptor.surfaceMesh?.positions.length ?? 0),
            pointPositions: getReusableFloat32Array(pointsGeometry, 'position', nextDescriptor.pointCount * 3),
            linePositions: getReusableFloat32Array(linesGeometry, 'position', nextDescriptor.lineCount * 6),
          }));
          applyDescriptorPacketToScene(descriptorPacket, {
            surfaceGeometry,
            pointsGeometry,
            linesGeometry,
            hullGeometry,
            surfaceMaterial,
            pointsMaterial,
            lineMaterial,
            hullMaterial,
            groupRef,
            surfaceMeshRef,
            pointsRef,
            lineSegmentsRef,
            hullLineRef,
            layerIndex,
          });
          playbackPacketLastAppliedAtRef.current = nowMs;
          playbackPacketHeldRef.current = false;
          playbackPacketLastHoldAtRef.current = 0;
          staticFrameSettledRef.current = false;
        });
      }
    }

    if (publishFrameRef.current % 6 === 0 || publishFrameRef.current === 1) {
      profileRuntimeTask(`scene:future-native-diagnostic-publish-layer${layerIndex}`, 'simulation', () => {
        publishFutureNativeSceneDiagnostic({
          layerIndex,
          familyId: nextDescriptor.familyId,
          bindingMode: nextDescriptor.bindingMode,
          summary: nextDescriptor.summary,
          pointCount: nextDescriptor.pointCount,
          lineCount: nextDescriptor.lineCount,
          stats: { ...nextDescriptor.stats },
          playbackWorkerHeld: playbackPacketHeldRef.current,
          playbackWorkerHeldAgeMs: playbackPacketHeldRef.current ? Math.max(0, (typeof performance !== 'undefined' ? performance.now() : Date.now()) - playbackPacketLastHoldAtRef.current) : 0,
          playbackWorkerPayloadTier: playbackPayloadTier,
          playbackWorkerEstimatedBytes: playbackEstimatedBytes,
          playbackWorkerCooldownMs,
          playbackWorkerStaleMs,
          playbackWorkerBackoffMs,
          playbackWorkerBypassReason,
        });
      });
    }

  });

  if (!controller) return null;

  return (
    <group ref={groupRef as React.Ref<any>}>
      <mesh ref={surfaceMeshRef as React.Ref<any>} geometry={surfaceGeometry} material={surfaceMaterial} frustumCulled={false} />
      <lineSegments ref={hullLineRef as React.Ref<any>} geometry={hullGeometry} material={hullMaterial} frustumCulled={false} />
      <lineSegments ref={lineSegmentsRef as React.Ref<any>} geometry={linesGeometry} material={lineMaterial} frustumCulled={false} />
      <points ref={pointsRef as React.Ref<any>} geometry={pointsGeometry} material={pointsMaterial} frustumCulled={false} />
    </group>
  );
};
