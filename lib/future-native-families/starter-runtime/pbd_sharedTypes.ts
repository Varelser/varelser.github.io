export interface PbdSharedParticle {
  x: number;
  y: number;
  px: number;
  py: number;
  pinned?: boolean;
}

export interface PbdCircleCollider {
  x: number;
  y: number;
  radius: number;
}

export interface PbdCapsuleCollider {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  radius: number;
}

export interface PbdSharedLink {
  a: number;
  b: number;
  restLength: number;
  stiffness: number;
  kind?: string;
  breakThreshold?: number;
  active?: boolean;
  tearBias?: number;
}

export interface PbdObstacleField {
  x: number;
  y: number;
  radius: number;
  strength: number;
}

export interface PbdObstacleFieldStats {
  obstacleImpulse: number;
  obstacleContacts: number;
}

export interface PbdTearBiasMap {
  scale: number;
  frequency: number;
  rotation: number;
  contrast: number;
}

export interface PbdPinGroupTarget {
  indices: readonly number[];
  x: number;
  y: number;
  strength: number;
}

export type PbdPinChoreographyPreset = 'manual' | 'breath-wave' | 'counter-orbit' | 'shear-walk';

export interface PbdPinChoreographyOptions {
  mode: 'static' | 'sweep' | 'orbit';
  amplitude: number;
  speed: number;
  frame: number;
}

export type PbdTearBiasTexturePreset = 'manual' | 'warp-weft' | 'radial-flare' | 'shear-noise';

export interface PbdLayeredObstaclePresetOptions {
  preset: 'manual' | 'staggered-arc' | 'shear-lattice';
  frame: number;
}

export interface PbdTearPropagationOptions {
  propagationBias?: number;
  directionX?: number;
  directionY?: number;
  obstacleField?: PbdObstacleField;
  obstacleFields?: readonly PbdObstacleField[];
  tearBiasMap?: PbdTearBiasMap;
}
