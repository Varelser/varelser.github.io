import React from 'react';
import { Color, DoubleSide, MathUtils, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2 } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import type { ReactionDiffusionSystemProps } from './sceneReactionDiffusionSystemShared';
import { createAudioRouteStateMap, evaluateAudioRoutes } from '../lib/audioReactiveRuntime';
import { resolveReactionAudioDrives } from '../lib/audioReactiveTargetSets';
import { useFloatRenderTarget } from './AppSceneCameraPrimitives';
import {
  buildResolvedReactionProfile,
  buildSeedTexture,
  displayFragment,
  displayVertex,
  getLayerSource,
  getReactionMode,
  resolveReactionParams,
  simFragment,
  simVertex,
} from './sceneReactionDiffusionSystemShared';

export function useReactionDiffusionRuntime({ config, layerIndex, audioRef, isPlaying }: ReactionDiffusionSystemProps) {
  const size = 256;
  const { gl } = useThree();
  const rtA = useFloatRenderTarget(size);
  const rtB = useFloatRenderTarget(size);
  const mode = getReactionMode(config, layerIndex);
  const source = getLayerSource(config, layerIndex);
  const profile = React.useMemo(() => buildResolvedReactionProfile(mode, source), [mode, source]);
  const seedTexture = React.useMemo(() => buildSeedTexture(size, mode, source, profile), [mode, profile, source]);
  const simScene = React.useMemo(() => new Scene(), []);
  const simCamera = React.useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const simMaterial = React.useMemo(() => new ShaderMaterial({
    uniforms: {
      previousTexture: { value: seedTexture },
      texel: { value: new Vector2(1 / size, 1 / size) },
      feed: { value: 0.037 },
      kill: { value: 0.062 },
      dA: { value: 1.0 },
      dB: { value: 0.5 },
      dt: { value: 1.0 },
      time: { value: 0 },
      warp: { value: 0.3 },
      pulse: { value: 0 },
      flowAniso: { value: 1 },
      reactionBoost: { value: 1 },
    },
    vertexShader: simVertex,
    fragmentShader: simFragment,
  }), [seedTexture]);
  const displayMaterial = React.useMemo(() => new ShaderMaterial({
    uniforms: {
      reactionTexture: { value: rtA.texture },
      baseColor: { value: new Color('#ffffff') },
      opacity: { value: 0.8 },
      time: { value: 0 },
      audioReactive: { value: 0.35 },
      pulse: { value: 0 },
      poolMix: { value: 0.28 },
      colonyBands: { value: 0.34 },
      cellScale: { value: 1 },
      contourTightness: { value: 1 },
      hueShift: { value: 0 },
      lightnessShift: { value: 0 },
      heightGain: { value: 0.22 },
      ridgeGain: { value: 0.42 },
      pitGain: { value: 0.18 },
      wetness: { value: 0.18 },
      scarStrength: { value: 0.12 },
      bulge: { value: 0.18 },
      rimPinch: { value: 0.12 },
      shear: { value: 0.04 },
      tiltX: { value: 0 },
      tiltY: { value: 0 },
      curl: { value: 0.08 },
      depthBands: { value: 0.18 },
      frontBias: { value: 0.08 },
      sourceOrbit: { value: 0 },
      sourceLedger: { value: 0 },
      sourceCanopy: { value: 0 },
      sourceColumn: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    vertexShader: displayVertex,
    fragmentShader: displayFragment,
  }), [rtA.texture]);
  const simQuad = React.useMemo(() => {
    const mesh = new Mesh(new PlaneGeometry(2, 2), simMaterial);
    simScene.add(mesh);
    return mesh;
  }, [simMaterial, simScene]);
  const seededRef = React.useRef(false);
  const targetsRef = React.useRef({ current: rtA, next: rtB });
  const audioRouteStateRef = React.useRef(createAudioRouteStateMap());
  const params = resolveReactionParams(config, layerIndex);

  React.useEffect(() => {
    seededRef.current = false;
  }, [seedTexture, mode, source]);

  React.useEffect(() => {
    if (seededRef.current) return;
    const prev = gl.getRenderTarget();
    gl.setRenderTarget(rtA);
    gl.clear();
    simMaterial.uniforms.previousTexture.value = seedTexture;
    gl.render(simScene, simCamera);
    gl.setRenderTarget(rtB);
    gl.clear();
    simMaterial.uniforms.previousTexture.value = rtA.texture;
    gl.render(simScene, simCamera);
    gl.setRenderTarget(prev);
    targetsRef.current = { current: rtA, next: rtB };
    seededRef.current = true;
  }, [gl, mode, rtA, rtB, seedTexture, simCamera, simMaterial, simScene, source]);

  React.useEffect(() => {
    displayMaterial.uniforms.baseColor.value.set(params.color);
    displayMaterial.uniforms.opacity.value = params.opacity * profile.opacityMul;
    displayMaterial.uniforms.audioReactive.value = params.audioReactive;
    displayMaterial.uniforms.poolMix.value = profile.poolMix;
    displayMaterial.uniforms.colonyBands.value = profile.colonyBands;
    displayMaterial.uniforms.cellScale.value = profile.cellScale;
    displayMaterial.uniforms.contourTightness.value = profile.contourTightness;
    displayMaterial.uniforms.hueShift.value = profile.hueShift;
    displayMaterial.uniforms.lightnessShift.value = profile.lightnessShift;
    displayMaterial.uniforms.heightGain.value = profile.heightGain;
    displayMaterial.uniforms.ridgeGain.value = profile.ridgeGain;
    displayMaterial.uniforms.pitGain.value = profile.pitGain;
    displayMaterial.uniforms.wetness.value = profile.wetness;
    displayMaterial.uniforms.scarStrength.value = profile.scarStrength;
    displayMaterial.uniforms.bulge.value = profile.bulge;
    displayMaterial.uniforms.rimPinch.value = profile.rimPinch;
    displayMaterial.uniforms.shear.value = profile.shear;
    displayMaterial.uniforms.tiltX.value = profile.tiltX;
    displayMaterial.uniforms.tiltY.value = profile.tiltY;
    displayMaterial.uniforms.curl.value = profile.curl;
    displayMaterial.uniforms.depthBands.value = profile.depthBands;
    displayMaterial.uniforms.frontBias.value = profile.frontBias;
    displayMaterial.uniforms.sourceOrbit.value = MathUtils.clamp(profile.seedRing * 0.72 + profile.seedSweep * 0.34, 0, 1);
    displayMaterial.uniforms.sourceLedger.value = MathUtils.clamp(profile.seedLedger, 0, 1);
    displayMaterial.uniforms.sourceCanopy.value = MathUtils.clamp(profile.seedCanopy * 0.86 + profile.seedBlob * 0.24, 0, 1);
    displayMaterial.uniforms.sourceColumn.value = MathUtils.clamp(profile.seedColumn * 0.92 + profile.seedTerrace * 0.18, 0, 1);
  }, [displayMaterial, params.audioReactive, params.color, params.opacity, profile]);

  useFrame(({ clock }) => {
    if (!seededRef.current) return;
    const evaluatedAudioRoutes = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);
    const reactionDrives = resolveReactionAudioDrives(evaluatedAudioRoutes, 'reactionField');
    const pulse = config.audioEnabled ? (audioRef.current.pulse * config.audioBurstScale + audioRef.current.bass * config.audioBeatScale * 0.5) : 0;
    simMaterial.uniforms.feed.value = params.feed + profile.feedAdd + reactionDrives.feed;
    simMaterial.uniforms.kill.value = params.kill + profile.killAdd + reactionDrives.kill;
    simMaterial.uniforms.dA.value = profile.diffusionA;
    simMaterial.uniforms.dB.value = profile.diffusionB;
    simMaterial.uniforms.dt.value = profile.dtMul;
    simMaterial.uniforms.warp.value = Math.max(0, (params.warp + reactionDrives.warp * 0.4) * profile.warpMul);
    simMaterial.uniforms.flowAniso.value = profile.flowAniso;
    simMaterial.uniforms.reactionBoost.value = profile.reactionBoost;
    simMaterial.uniforms.time.value = clock.elapsedTime;
    simMaterial.uniforms.pulse.value = pulse * (params.audioReactive + reactionDrives.relief * 0.35);
    displayMaterial.uniforms.time.value = clock.elapsedTime;
    displayMaterial.uniforms.pulse.value = pulse;
    displayMaterial.uniforms.opacity.value = MathUtils.clamp((params.opacity * profile.opacityMul) + reactionDrives.opacity * 0.25, 0.04, 1.35);
    displayMaterial.uniforms.heightGain.value = profile.heightGain + reactionDrives.relief * 0.08;
    displayMaterial.uniforms.ridgeGain.value = profile.ridgeGain + reactionDrives.relief * 0.12;
    displayMaterial.uniforms.pitGain.value = profile.pitGain + reactionDrives.relief * 0.08;
    displayMaterial.uniforms.bulge.value = profile.bulge + reactionDrives.relief * 0.08;
    displayMaterial.uniforms.depthBands.value = profile.depthBands + reactionDrives.relief * 0.12;

    const iterations = isPlaying ? 2 : 1;
    const prev = gl.getRenderTarget();
    for (let i = 0; i < iterations; i += 1) {
      const targets = targetsRef.current;
      simMaterial.uniforms.previousTexture.value = targets.current.texture;
      gl.setRenderTarget(targets.next);
      gl.render(simScene, simCamera);
      targetsRef.current = { current: targets.next, next: targets.current };
    }
    gl.setRenderTarget(prev);
    displayMaterial.uniforms.reactionTexture.value = targetsRef.current.current.texture;
  });

  React.useEffect(() => () => {
    simScene.remove(simQuad);
    simQuad.geometry.dispose();
    simMaterial.dispose();
    displayMaterial.dispose();
    seedTexture.dispose();
  }, [displayMaterial, seedTexture, simMaterial, simQuad, simScene]);

  const planeSize = Math.max(config.sphereRadius * 1.55, params.spread * 1.45, 180) * Math.max(0.6, params.scale);
  const zOffset = config.sphereRadius * (layerIndex === 2 ? -0.58 : 0.58);

  return { displayMaterial, planeSize, zOffset, mode, source };
}
