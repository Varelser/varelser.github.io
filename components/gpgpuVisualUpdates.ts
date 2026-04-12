import type { MutableRefObject } from 'react';
import { AdditiveBlending, NormalBlending } from 'three';
import type { BufferGeometry, Camera, Mesh, Scene, ShaderMaterial, Texture, WebGLRenderTarget, WebGLRenderer } from 'three';
import type { ParticleConfig } from '../types';
import type { GpgpuAudioDrives } from '../lib/audioReactiveTargetSets';
import type { LodSystem } from '../lib/lodSystem';
import type { GpgpuAssetBundle } from './useGpgpuAssets';
import { MAX_TRAIL } from './gpgpuShaders';

export function runDepthSortPass(args: {
  config: ParticleConfig;
  gl: WebGLRenderer;
  camera: Camera;
  simScene: Scene;
  simCamera: Camera;
  simMesh: Mesh;
  posTexture: Texture;
  texSize: number;
  sortRTA: WebGLRenderTarget | null;
  sortRTB: WebGLRenderTarget | null;
  sortDepthMat: ShaderMaterial;
  bitonicMat: ShaderMaterial;
}): Texture | null {
  const {
    config,
    gl,
    camera,
    simScene,
    simCamera,
    simMesh,
    posTexture,
    texSize,
    sortRTA,
    sortRTB,
    sortDepthMat,
    bitonicMat,
  } = args;

  if (!config.gpgpuSortEnabled || !sortRTA || !sortRTB) return null;

  sortDepthMat.uniforms.uPosTex.value = posTexture;
  sortDepthMat.uniforms.uViewMatrix.value.copy(camera.matrixWorldInverse);
  simMesh.material = sortDepthMat;
  gl.setRenderTarget(sortRTA);
  gl.render(simScene, simCamera);

  const logN = Math.log2(texSize * texSize);
  let spingA = true;
  bitonicMat.uniforms.uTexSizeF.value = texSize;
  for (let stage = 0; stage < logN; stage++) {
    for (let step = stage; step >= 0; step--) {
      const sIn = spingA ? sortRTA : sortRTB;
      const sOut = spingA ? sortRTB : sortRTA;
      bitonicMat.uniforms.uSortIn.value = sIn.texture;
      bitonicMat.uniforms.uStep.value = step;
      bitonicMat.uniforms.uStage.value = stage;
      simMesh.material = bitonicMat;
      gl.setRenderTarget(sOut);
      gl.render(simScene, simCamera);
      spingA = !spingA;
    }
  }

  return (spingA ? sortRTB : sortRTA).texture;
}

export function pushTrailFrame(args: {
  config: ParticleConfig;
  gl: WebGLRenderer;
  simScene: Scene;
  simCamera: Camera;
  simMesh: Mesh;
  blitMat: ShaderMaterial;
  trailRTs: WebGLRenderTarget[];
  trailHead: MutableRefObject<number>;
  posTexture: Texture;
}): void {
  const { config, gl, simScene, simCamera, simMesh, blitMat, trailRTs, trailHead, posTexture } = args;
  if (!config.gpgpuTrailEnabled && !config.gpgpuRibbonEnabled && !config.gpgpuTubeEnabled) return;

  blitMat.uniforms.uTex.value = posTexture;
  simMesh.material = blitMat;
  gl.setRenderTarget(trailRTs[trailHead.current]);
  gl.render(simScene, simCamera);
  trailHead.current = (trailHead.current + 1) % MAX_TRAIL;
}

export function applyLodPolicy(args: {
  config: ParticleConfig;
  lodSystem: LodSystem;
  texSize: number;
  velSimMat: ShaderMaterial;
  drawGeo: BufferGeometry;
  streakGeo: BufferGeometry;
}): number {
  const { config, lodSystem, texSize, velSimMat, drawGeo, streakGeo } = args;
  const lodCount = config.autoLod ? lodSystem.getEffectiveCount(config.gpgpuCount) : config.gpgpuCount;
  const activeCount = Math.min(lodCount, texSize * texSize);

  if (config.autoLod && lodSystem.shouldSkipExpensive()) {
    velSimMat.uniforms.uNBodyEnabled.value = false;
    velSimMat.uniforms.uSphEnabled.value = false;
    velSimMat.uniforms.uBoidsEnabled.value = false;
  }

  drawGeo.setDrawRange(0, activeCount);
  streakGeo.setDrawRange(0, activeCount * 2);
  return activeCount;
}

export function syncVisualUniforms(args: {
  config: ParticleConfig;
  activeCount: number;
  gpgpuAudioDrives: GpgpuAudioDrives;
  assets: GpgpuAssetBundle;
  posTexture: Texture;
  velTexture: Texture;
  finalSortTex: Texture | null;
}): void {
  const { config, activeCount, gpgpuAudioDrives, assets, posTexture, velTexture, finalSortTex } = args;
  const {
    drawMat,
    trailRTs,
    trailMats,
    trailHead,
    ribbonMats,
    tubeMats,
    streakMat,
    geomMat,
    volumetricGeo,
    volumetricMat,
  } = assets;

  drawMat.uniforms.uPosTex.value = posTexture;
  drawMat.uniforms.uVelTex.value = velTexture;
  drawMat.uniforms.uColor.value.setStyle(config.gpgpuColor);
  drawMat.uniforms.uSize.value = Math.max(0.001, config.gpgpuSize * (1 + gpgpuAudioDrives.size));
  drawMat.uniforms.uOpacity.value = Math.max(0.02, Math.min(1.5, config.gpgpuOpacity + gpgpuAudioDrives.opacity * 0.25));
  drawMat.uniforms.uVelColorEnabled.value = config.gpgpuVelColorEnabled;
  drawMat.uniforms.uVelColorHueMin.value = config.gpgpuVelColorHueMin;
  drawMat.uniforms.uVelColorHueMax.value = config.gpgpuVelColorHueMax;
  drawMat.uniforms.uVelColorSaturation.value = config.gpgpuVelColorSaturation;
  drawMat.uniforms.uAgeEnabled.value = config.gpgpuAgeEnabled;
  drawMat.uniforms.uAgeMax.value = config.gpgpuAgeMax;
  drawMat.uniforms.uAgeFadeIn.value = config.gpgpuAgeFadeIn;
  drawMat.uniforms.uAgeFadeOut.value = config.gpgpuAgeFadeOut;
  drawMat.uniforms.uAgeColorEnabled.value = config.gpgpuAgeColorEnabled;
  drawMat.uniforms.uAgeColorYoung.value.setStyle(config.gpgpuAgeColorYoung);
  drawMat.uniforms.uAgeColorOld.value.setStyle(config.gpgpuAgeColorOld);
  drawMat.uniforms.uAgeSizeEnabled.value = config.gpgpuAgeSizeEnabled;
  drawMat.uniforms.uAgeSizeStart.value = config.gpgpuAgeSizeStart;
  drawMat.uniforms.uAgeSizeEnd.value = config.gpgpuAgeSizeEnd;
  drawMat.uniforms.uSortEnabled.value = config.gpgpuSortEnabled && finalSortTex !== null;
  drawMat.uniforms.uSortTex.value = finalSortTex;
  drawMat.blending = config.gpgpuSortEnabled ? NormalBlending : AdditiveBlending;

  if (config.gpgpuStreakEnabled) {
    streakMat.uniforms.uPosTex.value = posTexture;
    streakMat.uniforms.uVelTex.value = velTexture;
    streakMat.uniforms.uColor.value.setStyle(config.gpgpuColor);
    streakMat.uniforms.uOpacity.value = Math.max(0.02, Math.min(1.5, config.gpgpuStreakOpacity + gpgpuAudioDrives.opacity * 0.2));
    streakMat.uniforms.uStreakLength.value = config.gpgpuStreakLength;
    streakMat.uniforms.uAgeEnabled.value = config.gpgpuAgeEnabled;
    streakMat.uniforms.uAgeMax.value = config.gpgpuAgeMax;
    streakMat.uniforms.uAgeFadeIn.value = config.gpgpuAgeFadeIn;
    streakMat.uniforms.uAgeFadeOut.value = config.gpgpuAgeFadeOut;
  }

  if (config.gpgpuTrailEnabled) {
    const trailLength = Math.min(MAX_TRAIL, Math.max(2, Math.round(config.gpgpuTrailLength + gpgpuAudioDrives.trailLength)));
    for (let i = 0; i < MAX_TRAIL; i++) {
      const rtIdx = ((trailHead.current - 1 - i) + MAX_TRAIL * 2) % MAX_TRAIL;
      const alpha = i < trailLength ? Math.pow(config.gpgpuTrailFade, i + 1) * config.gpgpuOpacity : 0;
      trailMats[i].uniforms.uPosTex.value = trailRTs[rtIdx].texture;
      trailMats[i].uniforms.uVelTex.value = velTexture;
      trailMats[i].uniforms.uColor.value.setStyle(config.gpgpuColor);
      trailMats[i].uniforms.uSize.value = Math.max(0.001, config.gpgpuSize * (1 + gpgpuAudioDrives.size));
      trailMats[i].uniforms.uAlpha.value = alpha;
      trailMats[i].uniforms.uVelocityScale.value = config.gpgpuTrailVelocityScale;
    }
  }

  if (config.gpgpuRibbonEnabled) {
    const trailLength = Math.min(MAX_TRAIL - 1, Math.max(2, Math.round(config.gpgpuTrailLength + gpgpuAudioDrives.trailLength)));
    for (let i = 0; i < MAX_TRAIL - 1; i++) {
      const rtIdxB = ((trailHead.current - 1 - i) + MAX_TRAIL * 2) % MAX_TRAIL;
      const rtIdxA = ((trailHead.current - 2 - i) + MAX_TRAIL * 2) % MAX_TRAIL;
      const alpha = i < trailLength - 1 ? Math.pow(config.gpgpuTrailFade, i + 1) * config.gpgpuRibbonOpacity : 0;
      ribbonMats[i].uniforms.uPosTexA.value = trailRTs[rtIdxA].texture;
      ribbonMats[i].uniforms.uPosTexB.value = trailRTs[rtIdxB].texture;
      ribbonMats[i].uniforms.uColor.value.setStyle(config.gpgpuColor);
      ribbonMats[i].uniforms.uWidth.value = Math.max(0.001, config.gpgpuRibbonWidth * (1 + gpgpuAudioDrives.ribbonWidth));
      ribbonMats[i].uniforms.uAlpha.value = alpha;
      ribbonMats[i].uniforms.uTaper.value = config.gpgpuRibbonTaper;
      ribbonMats[i].uniforms.uMaxSegLen.value = config.gpgpuRibbonMaxSegLen;
    }
  }

  if (config.gpgpuTubeEnabled) {
    const trailLength = Math.min(MAX_TRAIL - 1, Math.max(2, Math.round(config.gpgpuTrailLength + gpgpuAudioDrives.trailLength)));
    for (let i = 0; i < MAX_TRAIL - 1; i++) {
      const rtIdxB = ((trailHead.current - 1 - i) + MAX_TRAIL * 2) % MAX_TRAIL;
      const rtIdxA = ((trailHead.current - 2 - i) + MAX_TRAIL * 2) % MAX_TRAIL;
      const alpha = i < trailLength - 1 ? Math.pow(config.gpgpuTrailFade, i + 1) * config.gpgpuTubeOpacity : 0;
      tubeMats[i].uniforms.uPosTexA.value = trailRTs[rtIdxA].texture;
      tubeMats[i].uniforms.uPosTexB.value = trailRTs[rtIdxB].texture;
      tubeMats[i].uniforms.uColor.value.setStyle(config.gpgpuColor);
      tubeMats[i].uniforms.uTubeRadius.value = config.gpgpuTubeRadius;
      tubeMats[i].uniforms.uAlpha.value = alpha;
      tubeMats[i].uniforms.uMaxSegLen.value = config.gpgpuRibbonMaxSegLen;
    }
  }

  if (config.gpgpuGeomMode !== 'point') {
    geomMat.uniforms.uPosTex.value = posTexture;
    geomMat.uniforms.uVelTex.value = velTexture;
    geomMat.uniforms.uColor.value.setStyle(config.gpgpuColor);
    geomMat.uniforms.uOpacity.value = Math.max(0.02, Math.min(1.5, config.gpgpuOpacity + gpgpuAudioDrives.opacity * 0.25));
    geomMat.uniforms.uGeomScale.value = config.gpgpuBounceRadius * 0.02 * config.gpgpuGeomScale;
    geomMat.uniforms.uVelocityAlign.value = config.gpgpuGeomVelocityAlign ? 1 : 0;
  }

  if (config.gpgpuVolumetricEnabled) {
    volumetricGeo.instanceCount = activeCount;
    volumetricMat.uniforms.uPosTex.value = posTexture;
    volumetricMat.uniforms.uColor.value.setStyle(config.gpgpuVolumetricColor);
    volumetricMat.uniforms.uRadius.value = config.gpgpuVolumetricRadius;
    volumetricMat.uniforms.uDensity.value = Math.max(0.01, Math.min(5, config.gpgpuVolumetricDensity + gpgpuAudioDrives.volumetricDensity * 0.35));
    volumetricMat.uniforms.uOpacity.value = Math.max(0.02, Math.min(1.5, config.gpgpuVolumetricOpacity + gpgpuAudioDrives.opacity * 0.2));
    volumetricMat.uniforms.uSteps.value = config.gpgpuVolumetricSteps;
  }
}
