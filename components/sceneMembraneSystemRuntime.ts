import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, MathUtils, MeshBasicMaterial, NormalBlending, ShaderMaterial, Vector3 } from 'three';
import type { ParticleConfig } from '../types';
import { estimateLayerPositionApprox } from './sceneMotionEstimator';
import {
  getLayerMode,
  getMembraneProfile,
  getSourceMembraneProfile,
  type MembraneAudioState,
  type MembraneLayout,
  withSourceAwareMembraneProfile,
} from './sceneMembraneSystemShared';
import { createAudioRouteStateMap, evaluateAudioRoutes } from '../lib/audioReactiveRuntime';
import { resolveSurfaceAudioDrives } from '../lib/audioReactiveTargetSets';

const tempPos = new Vector3();

export function useMembraneGeometryBindings(geometry: BufferGeometry, layout: MembraneLayout | null) {
  useEffect(() => {
    if (!layout) return;
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(layout.usedCount * 3), 3));
    geometry.setAttribute('uv', new BufferAttribute(layout.uvArray, 2));
    geometry.setIndex(new BufferAttribute(layout.indexArray, 1));
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return () => {
      geometry.deleteAttribute('position');
      geometry.deleteAttribute('uv');
      geometry.setIndex(null);
    };
  }, [geometry, layout]);

  useEffect(() => () => geometry.dispose(), [geometry]);
}

export function useMembraneRuntime({
  config,
  layerIndex,
  audioRef,
  isPlaying,
  layout,
  geometry,
  surfaceMaterialRef,
  wireMaterialRef,
  frameCounterRef,
}: {
  config: ParticleConfig;
  layerIndex: 2 | 3;
  audioRef: MutableRefObject<MembraneAudioState>;
  isPlaying: boolean;
  layout: MembraneLayout | null;
  geometry: BufferGeometry;
  surfaceMaterialRef: MutableRefObject<ShaderMaterial | null>;
  wireMaterialRef: MutableRefObject<MeshBasicMaterial | null>;
  frameCounterRef: MutableRefObject<number>;
}) {
  const audioRouteStateRef = useRef(createAudioRouteStateMap());

  useFrame(({ clock }) => {
    const surfaceMaterial = surfaceMaterialRef.current;
    const wireMaterial = wireMaterialRef.current;
    if (!layout || !surfaceMaterial || !wireMaterial) return;

    const posAttr = geometry.getAttribute('position') as BufferAttribute | undefined;
    if (!posAttr) return;

    const evaluatedAudioRoutes = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
    const surfaceDrives = resolveSurfaceAudioDrives(evaluatedAudioRoutes, 'membrane');
    const pulse = config.audioEnabled ? audioRef.current.pulse * config.audioBurstScale : 0;
    const mode = getLayerMode(config, layerIndex);
    const source = layerIndex === 2 ? config.layer2Source : config.layer3Source;
    const sourceProfile = getSourceMembraneProfile(source);
    const profile = withSourceAwareMembraneProfile(getMembraneProfile(mode), source);
    const bass = config.audioEnabled ? audioRef.current.bass * config.audioBeatScale : 0;
    const treble = config.audioEnabled ? audioRef.current.treble * config.audioTrebleMotionScale : 0;
    const t = clock.getElapsedTime();
    const globalRadius = config.sphereRadius * (layerIndex === 2 ? config.layer2RadiusScale : config.layer3RadiusScale);
    const rippleAmount = (layerIndex === 2 ? config.layer2SheetAudioReactive : config.layer3SheetAudioReactive) + (surfaceDrives.displacement * 0.55);
    const audioReactive = isPlaying ? (pulse + bass * 0.7 + treble * 0.35) * rippleAmount : 0;
    const surfaceDepthMul = Math.max(0.18, 1 - (surfaceDrives.sliceDepth * 0.35));

    const particleData = layout.particleData;
    if (!particleData) return;
    for (let i = 0; i < layout.usedCount; i += 1) {
      const sourceIndex = layout.sampledIndices[i] ?? 0;
      const estimated = estimateLayerPositionApprox({
        config,
        layerIndex,
        particleData,
        index: sourceIndex,
        globalRadius,
        time: t,
      });
      const uvx = layout.uvArray[i * 2 + 0] - 0.5;
      const uvy = layout.uvArray[i * 2 + 1] - 0.5;
      const radial = Math.sqrt(uvx * uvx + uvy * uvy);
      const theta = Math.atan2(uvy, uvx);
      const radialFalloff = Math.max(0, 1 - radial * 1.8);

      const ripple = Math.sin((uvx * 8.0 + uvy * 6.5) + t * 2.4) * (0.15 + audioReactive) * globalRadius * 0.03;
      const clothFold = Math.sin(uvx * 10.0 + uvy * 14.0 + t * (0.9 + profile.wind)) * globalRadius * profile.fold * 0.08;
      const clothSag = (uvy + 0.18 * Math.abs(uvx)) * globalRadius * profile.sag * -0.6;
      const clothDrape = Math.sin(uvx * 4.0 + t * (0.5 + profile.wind * 0.7)) * globalRadius * profile.drape * 0.07;
      const twist = Math.sin(theta * (2.0 + profile.twist * 5.0) + t * (0.32 + profile.twist * 0.68)) * (0.2 + radial) * globalRadius * profile.twist * 0.12;
      const anisotropic = Math.sin(uvx * Math.PI * (3.0 + profile.anisotropy * 6.0) - t * (0.44 + profile.wind * 0.3)) * globalRadius * profile.anisotropy * 0.06;
      const pocket = -Math.pow(radialFalloff, 1.6) * globalRadius * (profile.pocket + sourceProfile.pocket * 0.22) * (0.08 + 0.04 * Math.sin(t * 0.7 + uvx * 5.0));
      const creepShear = Math.sin(uvy * 7.0 + t * (0.22 + profile.creep * 0.28 + sourceProfile.shear * 0.22) + uvx * 4.0) * (0.3 + radial) * globalRadius * (profile.creep + sourceProfile.shear * 0.22) * 0.08;
      const springLift = Math.sin((uvx * 4.0 - uvy * 3.0) + t * (1.3 + profile.spring * 1.8 + sourceProfile.column * 0.7)) * globalRadius * profile.spring * (0.015 + 0.05 * audioReactive);
      const veilDrift = Math.cos(uvy * 8.0 - t * (0.48 + profile.veil * 0.92 + sourceProfile.veil * 0.8) + uvx * 2.4) * globalRadius * (profile.veil + sourceProfile.veil * 0.22) * 0.05;
      const seamPinch = (1 - Math.min(1, Math.abs(uvx) * 2.0)) * (profile.seam + sourceProfile.ledger * 0.16) * globalRadius * -0.02;
      const orbitBend = Math.sin(theta * (2.0 + sourceProfile.orbit * 6.0) + t * (0.42 + sourceProfile.orbit * 0.8)) * globalRadius * sourceProfile.orbit * 0.06;
      const ledgerSnap = sourceProfile.ledger > 0 ? Math.round((estimated.y + clothSag) / (globalRadius * 0.06)) * (globalRadius * 0.06 * (1 - sourceProfile.ledger * 0.28)) - estimated.y : 0;
      const fractureSnap = sourceProfile.fracture > 0 ? Math.round((estimated.x + anisotropic) / (globalRadius * 0.05)) * (globalRadius * 0.05 * (1 - sourceProfile.fracture * 0.24)) - estimated.x : 0;

      tempPos.copy(estimated).normalize().multiplyScalar(ripple + clothFold + springLift + pocket + orbitBend * 0.35);
      estimated.add(tempPos);
      estimated.y += clothSag + clothDrape + veilDrift * 0.7 + ledgerSnap * 0.5;
      estimated.x += anisotropic + creepShear + twist * uvy * 0.6 + fractureSnap * 0.7;
      estimated.z += (veilDrift + twist + seamPinch + orbitBend) * surfaceDepthMul;
      if (profile.anisotropy > 0 || sourceProfile.column > 0) {
        estimated.x += uvx * globalRadius * (profile.anisotropy * 0.08 + sourceProfile.column * 0.04);
        estimated.z -= uvy * globalRadius * (profile.anisotropy * 0.04 - sourceProfile.column * 0.02) * surfaceDepthMul;
      }
      posAttr.setXYZ(i, estimated.x, estimated.y, estimated.z);
    }

    posAttr.needsUpdate = true;
    if (frameCounterRef.current % 3 === 0) {
      geometry.computeVertexNormals();
    }
    geometry.computeBoundingSphere();
    frameCounterRef.current += 1;

    const opacity = layerIndex === 2 ? config.layer2SheetOpacity : config.layer3SheetOpacity;
    const fresnel = layerIndex === 2 ? config.layer2SheetFresnel : config.layer3SheetFresnel;
    const wireframe = layerIndex === 2 ? config.layer2SheetWireframe : config.layer3SheetWireframe;
    const color = layerIndex === 2 ? config.layer2Color : config.layer3Color;

    surfaceMaterial.uniforms.uColor.value.set(color);
    surfaceMaterial.uniforms.uOpacity.value = MathUtils.clamp((opacity * profile.alphaMul) + surfaceDrives.opacity * 0.28, 0.04, 1.3);
    surfaceMaterial.uniforms.uPulse.value = (pulse + bass * 0.35) * (1 + surfaceDrives.relief * 0.25);
    surfaceMaterial.uniforms.uFresnel.value = Math.min(2, Math.max(0, fresnel + surfaceDrives.relief * 0.45));
    surfaceMaterial.uniforms.uSeam.value = profile.seam + surfaceDrives.relief * 0.08;
    surfaceMaterial.uniforms.uFold.value = profile.fold + surfaceDrives.relief * 0.18;
    surfaceMaterial.uniforms.uPocket.value = profile.pocket + surfaceDrives.relief * 0.1;
    surfaceMaterial.uniforms.uTwist.value = profile.twist + surfaceDrives.relief * 0.12;
    surfaceMaterial.uniforms.uVeil.value = profile.veil + surfaceDrives.relief * 0.08;
    wireMaterial.color.set(color);
    wireMaterial.opacity = Math.min(1, Math.max(0.02, opacity * 0.9 + surfaceDrives.wireframe * 0.4));
    wireMaterial.visible = wireframe || surfaceDrives.wireframe > 0.08;
    surfaceMaterial.blending = profile.additive ? AdditiveBlending : NormalBlending;
  });
}
