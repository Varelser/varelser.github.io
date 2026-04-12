import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import type { Camera } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { CameraPose, CameraRigApi } from '../types/cameraPath';

const tempFromPosition = new Vector3();
const tempToPosition = new Vector3();
const tempFromTarget = new Vector3();
const tempToTarget = new Vector3();

type PlaybackState = {
  poses: CameraPose[];
  durationSeconds: number;
  startedAtMs: number;
  loop: boolean;
};

function cloneVectorData(vector: Vector3) {
  return { x: vector.x, y: vector.y, z: vector.z };
}

function capturePose(camera: Camera, controls: OrbitControlsImpl | null): CameraPose {
  return {
    position: cloneVectorData(camera.position),
    target: cloneVectorData(controls?.target ?? new Vector3(0, 0, 0)),
    fov: 'fov' in camera ? Number((camera as Camera & { fov: number }).fov) : null,
    zoom: 'zoom' in camera ? Number((camera as Camera & { zoom: number }).zoom) : null,
    capturedAt: new Date().toISOString(),
  };
}

function applyPoseToCamera(camera: Camera, controls: OrbitControlsImpl | null, pose: CameraPose) {
  camera.position.set(pose.position.x, pose.position.y, pose.position.z);
  if ('fov' in camera && pose.fov !== null) {
    const perspectiveCamera = camera as Camera & { fov: number; updateProjectionMatrix: () => void };
    perspectiveCamera.fov = pose.fov;
    perspectiveCamera.updateProjectionMatrix();
  }
  if ('zoom' in camera && pose.zoom !== null) {
    const orthographicCamera = camera as Camera & { zoom: number; updateProjectionMatrix: () => void };
    orthographicCamera.zoom = pose.zoom;
    orthographicCamera.updateProjectionMatrix();
  }
  if (controls) {
    controls.target.set(pose.target.x, pose.target.y, pose.target.z);
    controls.update();
  } else {
    camera.lookAt(pose.target.x, pose.target.y, pose.target.z);
  }
}

function interpolatePose(fromPose: CameraPose, toPose: CameraPose, t: number): CameraPose {
  const clampedT = MathUtils.clamp(t, 0, 1);
  tempFromPosition.set(fromPose.position.x, fromPose.position.y, fromPose.position.z);
  tempToPosition.set(toPose.position.x, toPose.position.y, toPose.position.z);
  tempFromTarget.set(fromPose.target.x, fromPose.target.y, fromPose.target.z);
  tempToTarget.set(toPose.target.x, toPose.target.y, toPose.target.z);

  return {
    position: cloneVectorData(tempFromPosition.lerp(tempToPosition, clampedT)),
    target: cloneVectorData(tempFromTarget.lerp(tempToTarget, clampedT)),
    fov: fromPose.fov !== null && toPose.fov !== null ? MathUtils.lerp(fromPose.fov, toPose.fov, clampedT) : toPose.fov,
    zoom: fromPose.zoom !== null && toPose.zoom !== null ? MathUtils.lerp(fromPose.zoom, toPose.zoom, clampedT) : toPose.zoom,
    capturedAt: new Date().toISOString(),
  };
}

export const CAMERA_PATH_SLOT_COUNT = 4;

export function buildInitialCameraPathSlots() {
  return Array.from({ length: CAMERA_PATH_SLOT_COUNT }, () => null);
}

export const AppSceneCameraPathController: React.FC<{
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  cameraRigApiRef: React.MutableRefObject<CameraRigApi | null>;
  isCameraPathPlayingRef: React.MutableRefObject<boolean>;
  isInteractingRef: React.MutableRefObject<boolean>;
  onPlayingChange?: (isPlaying: boolean) => void;
}> = ({ controlsRef, cameraRigApiRef, isCameraPathPlayingRef, isInteractingRef, onPlayingChange }) => {
  const { camera, invalidate } = useThree();
  const playbackRef = React.useRef<PlaybackState | null>(null);

  const stopPlayback = React.useCallback(() => {
    playbackRef.current = null;
    isCameraPathPlayingRef.current = false;
    onPlayingChange?.(false);
    invalidate();
  }, [invalidate, isCameraPathPlayingRef, onPlayingChange]);

  const startPlayback = React.useCallback((poses: CameraPose[], durationSeconds: number, loop: boolean) => {
    if (poses.length < 2) {
      return false;
    }
    playbackRef.current = {
      poses,
      durationSeconds: Math.max(0.2, durationSeconds),
      startedAtMs: performance.now(),
      loop,
    };
    isCameraPathPlayingRef.current = true;
    onPlayingChange?.(true);
    invalidate();
    return true;
  }, [invalidate, isCameraPathPlayingRef, onPlayingChange]);

  React.useEffect(() => {
    cameraRigApiRef.current = {
      capturePose: () => capturePose(camera, controlsRef.current),
      applyPose: (pose, options) => {
        const durationSeconds = options?.durationSeconds ?? 0;
        if (durationSeconds <= 0.05) {
          stopPlayback();
          applyPoseToCamera(camera, controlsRef.current, pose);
          return true;
        }
        return startPlayback([capturePose(camera, controlsRef.current), pose], durationSeconds, false);
      },
      playSequence: (poses, options) => startPlayback(poses, options?.durationSeconds ?? 8, options?.loop ?? false),
      stopPlayback,
      isPlaying: () => playbackRef.current !== null,
    };
    return () => {
      if (cameraRigApiRef.current?.stopPlayback === stopPlayback) {
        cameraRigApiRef.current = null;
      }
    };
  }, [camera, cameraRigApiRef, controlsRef, startPlayback, stopPlayback]);

  useFrame(() => {
    const playback = playbackRef.current;
    if (!playback) return;
    if (isInteractingRef.current) {
      stopPlayback();
      return;
    }
    const elapsedSeconds = Math.max(0, (performance.now() - playback.startedAtMs) / 1000);
    const normalized = elapsedSeconds / playback.durationSeconds;
    if (!playback.loop && normalized >= 1) {
      applyPoseToCamera(camera, controlsRef.current, playback.poses[playback.poses.length - 1]);
      stopPlayback();
      return;
    }
    const wrapped = playback.loop ? ((normalized % 1) + 1) % 1 : MathUtils.clamp(normalized, 0, 1);
    const segmentCount = Math.max(1, playback.poses.length - 1);
    const segmentFloat = wrapped * segmentCount;
    const segmentIndex = Math.min(segmentCount - 1, Math.floor(segmentFloat));
    const localT = segmentFloat - segmentIndex;
    const pose = interpolatePose(playback.poses[segmentIndex], playback.poses[segmentIndex + 1], localT);
    applyPoseToCamera(camera, controlsRef.current, pose);
  }, -2);

  return null;
};
