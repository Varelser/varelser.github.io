export type CameraPose = {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number | null;
  zoom: number | null;
  capturedAt: string;
};

export type CameraPathSlot = {
  id: string;
  label: string;
  pose: CameraPose;
  capturedAt: string;
} | null;

export type CameraRigApi = {
  capturePose: () => CameraPose | null;
  applyPose: (pose: CameraPose, options?: { durationSeconds?: number }) => boolean;
  playSequence: (poses: CameraPose[], options?: { durationSeconds?: number; loop?: boolean }) => boolean;
  stopPlayback: () => void;
  isPlaying: () => boolean;
};
