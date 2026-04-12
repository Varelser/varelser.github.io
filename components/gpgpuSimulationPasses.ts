import type { MutableRefObject, RefObject } from 'react';
import type { Camera, DataTexture, Mesh, Scene, ShaderMaterial, Texture, Vector2, Vector3, WebGLRenderTarget, WebGLRenderer } from 'three';
import type { ParticleConfig } from '../types';
import type { GpgpuAudioDrives } from '../lib/audioReactiveTargetSets';
import {
  stepWebGPUCompute,
  readbackWebGPUState,
} from '../lib/webgpuCompute';
import type { WebGPUComputeReadbackResult, WebGPUComputeState } from '../lib/webgpuCompute';

export function updateMouseWorldPosition(args: {
  mouseNDC: Vector2;
  camera: Camera;
  mouseWorld: Vector3;
  tempVec: Vector3;
  tempDir: Vector3;
}): void {
  const { mouseNDC, camera, mouseWorld, tempVec, tempDir } = args;
  tempVec.set(mouseNDC.x, mouseNDC.y, 0.5).unproject(camera);
  tempDir.copy(tempVec).sub(camera.position).normalize();
  mouseWorld.copy(camera.position).addScaledVector(tempDir, camera.position.length());
}

export function blitPreviousPositionPass(args: {
  config: ParticleConfig;
  prevPosRT: WebGLRenderTarget | null;
  blitMat: ShaderMaterial;
  simMesh: Mesh;
  gl: WebGLRenderer;
  simScene: Scene;
  simCamera: Camera;
  posTexture: Texture;
}): void {
  const { config, prevPosRT, blitMat, simMesh, gl, simScene, simCamera, posTexture } = args;
  if (!config.gpgpuVerletEnabled || !prevPosRT) return;
  blitMat.uniforms.uTex.value = posTexture;
  simMesh.material = blitMat;
  gl.setRenderTarget(prevPosRT);
  gl.render(simScene, simCamera);
}

export function runFluidAdvectionPass(args: {
  config: ParticleConfig;
  fluidRTA: WebGLRenderTarget | null;
  fluidRTB: WebGLRenderTarget | null;
  fluidPingIsA: MutableRefObject<boolean>;
  fluidAdvectMat: ShaderMaterial;
  velSimMat: ShaderMaterial;
  simMesh: Mesh;
  gl: WebGLRenderer;
  simScene: Scene;
  simCamera: Camera;
  dt: number;
  time: number;
}): void {
  const {
    config,
    fluidRTA,
    fluidRTB,
    fluidPingIsA,
    fluidAdvectMat,
    velSimMat,
    simMesh,
    gl,
    simScene,
    simCamera,
    dt,
    time,
  } = args;

  if (config.gpgpuFluidEnabled && fluidRTA && fluidRTB) {
    const fluidIn = fluidPingIsA.current ? fluidRTA : fluidRTB;
    const fluidOut = fluidPingIsA.current ? fluidRTB : fluidRTA;
    fluidAdvectMat.uniforms.uFluidIn.value = fluidIn.texture;
    fluidAdvectMat.uniforms.uDelta.value = dt;
    fluidAdvectMat.uniforms.uFluidDiffuse.value = config.gpgpuFluidDiffuse;
    fluidAdvectMat.uniforms.uFluidDecay.value = config.gpgpuFluidDecay;
    fluidAdvectMat.uniforms.uFluidStrength.value = config.gpgpuFluidStrength;
    fluidAdvectMat.uniforms.uTime.value = time;
    fluidAdvectMat.uniforms.uFluidExtForce.value = config.gpgpuFluidExtForce;
    simMesh.material = fluidAdvectMat;
    gl.setRenderTarget(fluidOut);
    gl.render(simScene, simCamera);
    fluidPingIsA.current = !fluidPingIsA.current;
    const currentFluid = fluidPingIsA.current ? fluidRTA : fluidRTB;
    velSimMat.uniforms.uFluidEnabled.value = true;
    velSimMat.uniforms.uFluidTex.value = currentFluid.texture;
    velSimMat.uniforms.uFluidInfluence.value = config.gpgpuFluidInfluence;
    velSimMat.uniforms.uFluidScale.value = config.gpgpuFluidScale;
    return;
  }

  velSimMat.uniforms.uFluidEnabled.value = false;
}

export function runSimulationPasses(args: {
  useWebGPU: boolean;
  config: ParticleConfig;
  texSize: number;
  dt: number;
  time: number;
  blast: number;
  gpgpuAudioDrives: GpgpuAudioDrives;
  mouseWorld: Vector3;
  simMesh: Mesh;
  gl: WebGLRenderer;
  simScene: Scene;
  simCamera: Camera;
  posIn: WebGLRenderTarget;
  posOut: WebGLRenderTarget;
  velIn: WebGLRenderTarget;
  velOut: WebGLRenderTarget;
  velSimMat: ShaderMaterial;
  posSimMat: ShaderMaterial;
  initPosTex: Texture | null;
  prevPosTex: Texture | null;
  webgpuState: WebGPUComputeState | null;
  webgpuPosTex: DataTexture | null;
  webgpuVelTex: DataTexture | null;
  webgpuPingIsARef: MutableRefObject<boolean>;
  webgpuLastReadbackRef: MutableRefObject<WebGPUComputeReadbackResult | null>;
  posReadbackRef?: RefObject<Float32Array | null>;
}): void {
  const {
    useWebGPU,
    config,
    texSize,
    dt,
    time,
    blast,
    gpgpuAudioDrives,
    mouseWorld,
    simMesh,
    gl,
    simScene,
    simCamera,
    posIn,
    posOut,
    velIn,
    velOut,
    velSimMat,
    posSimMat,
    initPosTex,
    prevPosTex,
    webgpuState,
    webgpuPosTex,
    webgpuVelTex,
    webgpuPingIsARef,
    webgpuLastReadbackRef,
    posReadbackRef,
  } = args;

  if (useWebGPU && webgpuState) {
    stepWebGPUCompute(
      webgpuState,
      webgpuPingIsARef.current,
      dt,
      time,
      Math.max(-4, Math.min(4, config.gpgpuGravity + gpgpuAudioDrives.gravity)),
      Math.max(0, Math.min(4, config.gpgpuTurbulence + gpgpuAudioDrives.turbulence)),
      config.gpgpuBounceRadius,
      config.gpgpuBounce,
      config.gpgpuSpeed,
      config.gpgpuCurlEnabled ? config.gpgpuCurlStrength : 0,
      config.gpgpuCurlEnabled ? config.gpgpuCurlScale : 0,
      config.gpgpuWindEnabled ? config.gpgpuWindStrength : 0,
      config.gpgpuWindEnabled ? config.gpgpuWindX : 0,
      config.gpgpuWindEnabled ? config.gpgpuWindY : 0,
      config.gpgpuWindEnabled ? config.gpgpuWindZ : 0,
      config.gpgpuWindEnabled ? config.gpgpuWindGust : 0,
      config.gpgpuVFieldEnabled ? config.gpgpuVFieldType === 'dipole' ? 0 : config.gpgpuVFieldType === 'saddle' ? 1 : config.gpgpuVFieldType === 'spiral' ? 2 : 3 : 0,
      config.gpgpuVFieldEnabled ? config.gpgpuVFieldStrength : 0,
      config.gpgpuVFieldEnabled ? config.gpgpuVFieldScale : 0,
      config.gpgpuWellEnabled ? config.gpgpuWellStrength : 0,
      config.gpgpuWellEnabled ? config.gpgpuWellSoftening : 0,
      config.gpgpuWellEnabled ? config.gpgpuWellOrbit : 0,
      config.gpgpuVortexEnabled ? config.gpgpuVortexStrength : 0,
      config.gpgpuVortexEnabled ? config.gpgpuVortexTilt : 0,
      config.gpgpuAttractorEnabled ? config.gpgpuAttractorType === 'lorenz' ? 0 : config.gpgpuAttractorType === 'rossler' ? 1 : 2 : 0,
      config.gpgpuAttractorEnabled ? config.gpgpuAttractorStrength : 0,
      config.gpgpuAttractorEnabled ? config.gpgpuAttractorScale : 0,
      config.gpgpuMouseEnabled ? config.gpgpuMouseStrength : 0,
      config.gpgpuMouseEnabled ? config.gpgpuMouseRadius : 0,
      config.gpgpuMouseEnabled ? config.gpgpuMouseMode === 'attract' ? 0 : config.gpgpuMouseMode === 'repel' ? 1 : 2 : 0,
      config.gpgpuMouseEnabled ? mouseWorld.x : 0,
      config.gpgpuMouseEnabled ? mouseWorld.y : 0,
      config.gpgpuMouseEnabled ? mouseWorld.z : 0,
      config.gpgpuFluidEnabled ? config.gpgpuFluidInfluence : 0,
      config.gpgpuFluidEnabled ? config.gpgpuFluidScale : 0,
      config.gpgpuFluidEnabled ? config.gpgpuFluidStrength : 0,
      config.gpgpuFluidEnabled && config.gpgpuFluidExtForce ? 1 : 0,
      config.gpgpuBoidsEnabled ? config.gpgpuBoidsSeparation : 0,
      config.gpgpuBoidsEnabled ? config.gpgpuBoidsAlignment : 0,
      config.gpgpuBoidsEnabled ? config.gpgpuBoidsCohesion : 0,
      config.gpgpuBoidsEnabled ? config.gpgpuBoidsRadius : 0,
      config.gpgpuNBodyEnabled ? config.gpgpuNBodyStrength : 0,
      config.gpgpuNBodyEnabled ? config.gpgpuNBodyRepulsion : 0,
      config.gpgpuNBodyEnabled ? config.gpgpuNBodySoftening : 0,
      config.gpgpuNBodyEnabled ? Math.max(2, Math.min(64, config.gpgpuNBodySampleCount)) : 0,
      config.gpgpuMagneticEnabled ? config.gpgpuMagneticStrength : 0,
      config.gpgpuMagneticEnabled ? config.gpgpuMagneticBX : 0,
      config.gpgpuMagneticEnabled ? config.gpgpuMagneticBY : 0,
      config.gpgpuMagneticEnabled ? config.gpgpuMagneticBZ : 0,
      config.gpgpuSpringEnabled ? config.gpgpuSpringStrength : 0,
      config.gpgpuElasticEnabled ? config.gpgpuElasticStrength : 0,
      config.gpgpuSphEnabled ? config.gpgpuSphPressure : 0,
      config.gpgpuSphEnabled ? config.gpgpuSphViscosity : 0,
      config.gpgpuSphEnabled ? config.gpgpuSphRadius : 0,
      config.gpgpuSphEnabled ? config.gpgpuSphRestDensity : 0,
      config.gpgpuVerletEnabled ? 1 : 0,
      config.gpgpuAgeEnabled ? 1 : 0,
      config.gpgpuAgeEnabled ? config.gpgpuAgeMax : 0,
      config.gpgpuSdfEnabled ? 1 : 0,
      config.gpgpuSdfEnabled ? config.gpgpuSdfShape === 'sphere' ? 0 : config.gpgpuSdfShape === 'box' ? 1 : config.gpgpuSdfShape === 'torus' ? 2 : 3 : 0,
      config.gpgpuSdfEnabled ? config.gpgpuSdfX : 0,
      config.gpgpuSdfEnabled ? config.gpgpuSdfY : 0,
      config.gpgpuSdfEnabled ? config.gpgpuSdfZ : 0,
      config.gpgpuSdfEnabled ? config.gpgpuSdfSize : 0,
      config.gpgpuSdfEnabled ? config.gpgpuSdfBounce : 0,
    );
    webgpuPingIsARef.current = !webgpuPingIsARef.current;
    if (webgpuPosTex && webgpuVelTex) {
      readbackWebGPUState(webgpuState, webgpuLastReadbackRef.current ?? undefined).then(({ positions, velocities }) => {
        webgpuLastReadbackRef.current = {
          positions,
          velocities,
        };

        const posTargetData = webgpuPosTex.image.data;
        if (posTargetData) {
          posTargetData.set(positions);
          webgpuPosTex.needsUpdate = true;
        }
        const velTargetData = webgpuVelTex.image.data;
        if (velTargetData) {
          velTargetData.set(velocities);
          webgpuVelTex.needsUpdate = true;
        }
        if (posReadbackRef) {
          const targetRef = posReadbackRef as MutableRefObject<Float32Array | null>;
          if (!targetRef.current || targetRef.current.length != positions.length) {
            targetRef.current = new Float32Array(positions.length);
          }
          targetRef.current.set(positions);
        }
      });
    }
    return;
  }

  velSimMat.uniforms.uPosTex.value = posIn.texture;
  velSimMat.uniforms.uVelTex.value = velIn.texture;
  velSimMat.uniforms.uDelta.value = dt;
  velSimMat.uniforms.uTime.value = time;
  velSimMat.uniforms.uGravity.value = Math.max(-4, Math.min(4, config.gpgpuGravity + gpgpuAudioDrives.gravity));
  velSimMat.uniforms.uTurbulence.value = Math.max(0, Math.min(4, config.gpgpuTurbulence + gpgpuAudioDrives.turbulence));
  velSimMat.uniforms.uBounceRadius.value = config.gpgpuBounceRadius;
  velSimMat.uniforms.uBounce.value = config.gpgpuBounce;
  velSimMat.uniforms.uAudioBlast.value = blast;
  velSimMat.uniforms.uNBodyEnabled.value = config.gpgpuNBodyEnabled;
  velSimMat.uniforms.uNBodyStrength.value = config.gpgpuNBodyStrength;
  velSimMat.uniforms.uNBodySoftening.value = config.gpgpuNBodySoftening;
  velSimMat.uniforms.uNBodyRepulsion.value = config.gpgpuNBodyRepulsion;
  velSimMat.uniforms.uNBodySamples.value = Math.max(2, Math.min(64, config.gpgpuNBodySampleCount));
  velSimMat.uniforms.uTexSizeF.value = texSize;
  velSimMat.uniforms.uCurlEnabled.value = config.gpgpuCurlEnabled;
  velSimMat.uniforms.uCurlStrength.value = config.gpgpuCurlStrength;
  velSimMat.uniforms.uCurlScale.value = config.gpgpuCurlScale;
  velSimMat.uniforms.uBoidsEnabled.value = config.gpgpuBoidsEnabled;
  velSimMat.uniforms.uBoidsSeparation.value = config.gpgpuBoidsSeparation;
  velSimMat.uniforms.uBoidsAlignment.value = config.gpgpuBoidsAlignment;
  velSimMat.uniforms.uBoidsCohesion.value = config.gpgpuBoidsCohesion;
  velSimMat.uniforms.uBoidsRadius.value = config.gpgpuBoidsRadius;
  velSimMat.uniforms.uAttractorEnabled.value = config.gpgpuAttractorEnabled;
  velSimMat.uniforms.uAttractorType.value = config.gpgpuAttractorType === 'lorenz' ? 0 : config.gpgpuAttractorType === 'rossler' ? 1 : 2;
  velSimMat.uniforms.uAttractorStrength.value = config.gpgpuAttractorStrength;
  velSimMat.uniforms.uAttractorScale.value = config.gpgpuAttractorScale;
  velSimMat.uniforms.uVortexEnabled.value = config.gpgpuVortexEnabled;
  velSimMat.uniforms.uVortexStrength.value = config.gpgpuVortexStrength;
  velSimMat.uniforms.uVortexTilt.value = config.gpgpuVortexTilt;
  velSimMat.uniforms.uWindEnabled.value = config.gpgpuWindEnabled;
  velSimMat.uniforms.uWindStrength.value = config.gpgpuWindStrength;
  velSimMat.uniforms.uWindX.value = config.gpgpuWindX;
  velSimMat.uniforms.uWindY.value = config.gpgpuWindY;
  velSimMat.uniforms.uWindZ.value = config.gpgpuWindZ;
  velSimMat.uniforms.uWindGust.value = config.gpgpuWindGust;
  velSimMat.uniforms.uWellEnabled.value = config.gpgpuWellEnabled;
  velSimMat.uniforms.uWellStrength.value = config.gpgpuWellStrength;
  velSimMat.uniforms.uWellSoftening.value = config.gpgpuWellSoftening;
  velSimMat.uniforms.uWellOrbit.value = config.gpgpuWellOrbit;
  velSimMat.uniforms.uElasticEnabled.value = config.gpgpuElasticEnabled;
  velSimMat.uniforms.uElasticStrength.value = config.gpgpuElasticStrength;
  velSimMat.uniforms.uMagneticEnabled.value = config.gpgpuMagneticEnabled;
  velSimMat.uniforms.uMagneticStrength.value = config.gpgpuMagneticStrength;
  velSimMat.uniforms.uMagneticBX.value = config.gpgpuMagneticBX;
  velSimMat.uniforms.uMagneticBY.value = config.gpgpuMagneticBY;
  velSimMat.uniforms.uMagneticBZ.value = config.gpgpuMagneticBZ;
  velSimMat.uniforms.uSphEnabled.value = config.gpgpuSphEnabled;
  velSimMat.uniforms.uSphPressure.value = config.gpgpuSphPressure;
  velSimMat.uniforms.uSphViscosity.value = config.gpgpuSphViscosity;
  velSimMat.uniforms.uSphRadius.value = config.gpgpuSphRadius;
  velSimMat.uniforms.uSphRestDensity.value = config.gpgpuSphRestDensity;
  velSimMat.uniforms.uVFieldEnabled.value = config.gpgpuVFieldEnabled;
  velSimMat.uniforms.uVFieldType.value = config.gpgpuVFieldType === 'dipole' ? 0 : config.gpgpuVFieldType === 'saddle' ? 1 : config.gpgpuVFieldType === 'spiral' ? 2 : 3;
  velSimMat.uniforms.uVFieldStrength.value = config.gpgpuVFieldStrength;
  velSimMat.uniforms.uVFieldScale.value = config.gpgpuVFieldScale;
  velSimMat.uniforms.uSpringEnabled.value = config.gpgpuSpringEnabled;
  velSimMat.uniforms.uSpringStrength.value = config.gpgpuSpringStrength;
  velSimMat.uniforms.uInitPosTex.value = initPosTex;
  velSimMat.uniforms.uSdfEnabled.value = config.gpgpuSdfEnabled;
  velSimMat.uniforms.uSdfShape.value = config.gpgpuSdfShape === 'sphere' ? 0 : config.gpgpuSdfShape === 'box' ? 1 : config.gpgpuSdfShape === 'torus' ? 2 : 3;
  velSimMat.uniforms.uSdfX.value = config.gpgpuSdfX;
  velSimMat.uniforms.uSdfY.value = config.gpgpuSdfY;
  velSimMat.uniforms.uSdfZ.value = config.gpgpuSdfZ;
  velSimMat.uniforms.uSdfSize.value = config.gpgpuSdfSize;
  velSimMat.uniforms.uSdfBounce.value = config.gpgpuSdfBounce;
  velSimMat.uniforms.uMouseEnabled.value = config.gpgpuMouseEnabled;
  velSimMat.uniforms.uMousePos.value.copy(mouseWorld);
  velSimMat.uniforms.uMouseStrength.value = config.gpgpuMouseStrength;
  velSimMat.uniforms.uMouseRadius.value = config.gpgpuMouseRadius;
  velSimMat.uniforms.uMouseMode.value = config.gpgpuMouseMode === 'attract' ? 0 : config.gpgpuMouseMode === 'repel' ? 1 : 2;
  simMesh.material = velSimMat;
  gl.setRenderTarget(velOut);
  gl.render(simScene, simCamera);

  posSimMat.uniforms.uPosTex.value = posIn.texture;
  posSimMat.uniforms.uVelTex.value = velOut.texture;
  posSimMat.uniforms.uDelta.value = dt;
  posSimMat.uniforms.uSpeed.value = config.gpgpuSpeed;
  posSimMat.uniforms.uBounceRadius.value = config.gpgpuBounceRadius;
  posSimMat.uniforms.uAgeEnabled.value = config.gpgpuAgeEnabled;
  posSimMat.uniforms.uAgeMax.value = config.gpgpuAgeMax;
  posSimMat.uniforms.uVerletEnabled.value = config.gpgpuVerletEnabled;
  posSimMat.uniforms.uPrevPosTex.value = prevPosTex;
  posSimMat.uniforms.uSdfEnabled.value = config.gpgpuSdfEnabled;
  posSimMat.uniforms.uSdfShape.value = config.gpgpuSdfShape === 'sphere' ? 0 : config.gpgpuSdfShape === 'box' ? 1 : config.gpgpuSdfShape === 'torus' ? 2 : 3;
  posSimMat.uniforms.uSdfX.value = config.gpgpuSdfX;
  posSimMat.uniforms.uSdfY.value = config.gpgpuSdfY;
  posSimMat.uniforms.uSdfZ.value = config.gpgpuSdfZ;
  posSimMat.uniforms.uSdfSize.value = config.gpgpuSdfSize;
  posSimMat.uniforms.uSdfBounce.value = config.gpgpuSdfBounce;
  simMesh.material = posSimMat;
  gl.setRenderTarget(posOut);
  gl.render(simScene, simCamera);
}
