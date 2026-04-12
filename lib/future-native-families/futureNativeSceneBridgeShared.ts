import type { ParticleConfig } from '../../types';
import type { FutureNativeSceneBoundFamilyId } from './futureNativeSceneBindingData';

export type SupportedLayerIndex = 2 | 3;

export interface FutureNativeSceneSurfaceMeshDescriptor {
  positions: Float32Array;
  indices: Uint16Array | Uint32Array;
  hullLines?: Float32Array;
  surfaceKind: 'cloth' | 'membrane' | 'softbody';
  triangleCount: number;
  hullSegmentCount: number;
  surfaceCenterX: number;
  surfaceCenterY: number;
  surfaceMaxRadius: number;
  zMin: number;
  zMax: number;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getLayerCount(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2Count : config.layer3Count;
}

export function getLayerSource(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2Source : config.layer3Source;
}

export function getLayerBaseSize(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2BaseSize : config.layer3BaseSize;
}

export function getLayerRadiusScale(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2RadiusScale : config.layer3RadiusScale;
}

export function getLayerGravity(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2Gravity : config.layer3Gravity;
}

export function getLayerWindX(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2WindX : config.layer3WindX;
}

export function getLayerWindY(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2WindY : config.layer3WindY;
}

export function getLayerTemporalStrength(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2TemporalStrength : config.layer3TemporalStrength;
}

export function getLayerTemporalSpeed(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2TemporalSpeed : config.layer3TemporalSpeed;
}

export function getLayerFlowAmplitude(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2FlowAmplitude : config.layer3FlowAmplitude;
}

export function getLayerFlowFrequency(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2FlowFrequency : config.layer3FlowFrequency;
}

export function getLayerCollisionRadius(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2CollisionRadius : config.layer3CollisionRadius;
}

export function getLayerRepulsion(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2Repulsion : config.layer3Repulsion;
}

export function getLayerSourceSpread(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2SourceSpread : config.layer3SourceSpread;
}

export function getLayerColor(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2Color : config.layer3Color;
}

export function getLayerSheetOpacity(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2SheetOpacity : config.layer3SheetOpacity;
}

export function getLayerHullOpacity(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2HullOpacity : config.layer3HullOpacity;
}

export function getLayerMode(config: ParticleConfig, layerIndex: SupportedLayerIndex) {
  return layerIndex === 2 ? config.layer2Type : config.layer3Type;
}

export function deriveGridDimensions(count: number, source: string, familyId: FutureNativeSceneBoundFamilyId) {
  const base = clamp(Math.round(Math.sqrt(Math.max(1, count)) / 6), 8, familyId === 'pbd-softbody' ? 10 : 22);
  const aspect = source === 'text' ? 1.35 : source === 'plane' || source === 'grid' ? 1.18 : 1.0;
  const width = clamp(Math.round(base * aspect), familyId === 'pbd-softbody' ? 7 : 9, familyId === 'pbd-softbody' ? 14 : 24);
  const height = clamp(Math.round(base / Math.max(0.8, aspect * 0.92)), familyId === 'pbd-softbody' ? 7 : 8, familyId === 'pbd-softbody' ? 14 : 22);
  return { width, height };
}

export function deriveSceneScale(config: ParticleConfig, layerIndex: SupportedLayerIndex, familyId: FutureNativeSceneBoundFamilyId) {
  const spread = getLayerSourceSpread(config, layerIndex);
  const radiusScale = getLayerRadiusScale(config, layerIndex);
  const count = getLayerCount(config, layerIndex);
  const base = 110 + Math.sqrt(Math.max(1, count)) * 0.45 + radiusScale * 46;
  const spreadTerm = spread * 0.018;
  const familyBias = familyId === 'pbd-softbody' ? 24 : familyId === 'pbd-membrane' ? 12 : familyId === 'pbd-rope' ? 10 : familyId === 'volumetric-density-transport' || familyId === 'volumetric-smoke' || familyId === 'volumetric-advection' || familyId === 'volumetric-pressure-coupling' ? 18 : familyId === 'mpm-granular' || familyId === 'mpm-viscoplastic' || familyId === 'mpm-snow' || familyId === 'mpm-mud' || familyId === 'mpm-paste' ? 8 : 0;
  return clamp(base + spreadTerm + familyBias, 120, 280);
}
