import { MathUtils } from 'three';
import type { ShaderMaterial } from 'three';
import type { ParticleConfig } from '../types';
import type { ParticleSystemAudioRef } from './sceneParticleSystemRuntimeTypes';
import { evaluateAudioRoutes, resolveEvaluatedAudioTargetValue, type EvaluatedAudioRoute } from '../lib/audioReactiveRuntime';

function clampToUniform(value: number, min = 0, max = 8) {
  return MathUtils.clamp(value, min, max);
}

export function applyParticleAudioUniforms(
  mat: ShaderMaterial,
  config: ParticleConfig,
  audioRef: ParticleSystemAudioRef,
  prevAudioEnabledRef: { current: boolean },
  audioRouteStateRef: { current: Map<string, number> },
) : EvaluatedAudioRoute[] {
  const audioEnabledChanged = prevAudioEnabledRef.current !== config.audioEnabled;
  prevAudioEnabledRef.current = config.audioEnabled;

  if (config.audioEnabled) {
    const bassInput = audioRef.current.bass * config.audioBeatScale;
    const trebleInput = audioRef.current.treble * config.audioJitterScale;
    const pulseInput = audioRef.current.pulse * config.audioPulseScale;
    const bandAInput = audioRef.current.bandA;
    const bandBInput = audioRef.current.bandB;
    const evaluatedRoutes = evaluateAudioRoutes(config, audioRef.current, audioRouteStateRef.current);

    const bassMotion = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.bassMotion', bassInput * config.audioBassMotionScale, { clampMin: 0, clampMax: 8 });
    const trebleMotion = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.trebleMotion', trebleInput * config.audioTrebleMotionScale, { clampMin: 0, clampMax: 8 });
    const bassSize = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.bassSize', bassInput * config.audioBassSizeScale, { clampMin: 0, clampMax: 8 });
    const trebleSize = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.trebleSize', trebleInput * config.audioTrebleSizeScale, { clampMin: 0, clampMax: 8 });
    const bassAlpha = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.bassAlpha', bassInput * config.audioBassAlphaScale, { clampMin: 0, clampMax: 8 });
    const trebleAlpha = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.trebleAlpha', trebleInput * config.audioTrebleAlphaScale, { clampMin: 0, clampMax: 8 });
    const bassLine = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.bassLine', bassInput * config.audioLineScale, { clampMin: 0, clampMax: 8 });
    const trebleLine = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.trebleLine', trebleInput * config.audioLineScale, { clampMin: 0, clampMax: 8 });
    const bandAMotion = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.bandAMotion', bandAInput * config.audioBandAMotionScale, { clampMin: 0, clampMax: 8 });
    const bandASize = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.bandASize', bandAInput * config.audioBandASizeScale, { clampMin: 0, clampMax: 8 });
    const bandAAlpha = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.bandAAlpha', bandAInput * config.audioBandAAlphaScale, { clampMin: 0, clampMax: 8 });
    const bandBMotion = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.bandBMotion', bandBInput * config.audioBandBMotionScale, { clampMin: 0, clampMax: 8 });
    const bandBSize = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.bandBSize', bandBInput * config.audioBandBSizeScale, { clampMin: 0, clampMax: 8 });
    const bandBAlpha = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.bandBAlpha', bandBInput * config.audioBandBAlphaScale, { clampMin: 0, clampMax: 8 });
    const pulse = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.pulse', pulseInput, { clampMin: 0, clampMax: 8 });
    const morph = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.morph', audioRef.current.pulse * config.audioMorphScale, { clampMin: 0, clampMax: 8 });
    const shatter = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.shatter', ((trebleInput * 0.75) + (pulse * 0.35)) * config.audioShatterScale, { clampMin: 0, clampMax: 8 });
    const twist = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.twist', ((bassInput * 0.6) + (pulse * 0.9)) * config.audioTwistScale, { clampMin: 0, clampMax: 8 });
    const bend = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.bend', ((trebleInput * 0.55) + (pulse * 0.7)) * config.audioBendScale, { clampMin: 0, clampMax: 8 });
    const warp = resolveEvaluatedAudioTargetValue(evaluatedRoutes, 'particle.warp', ((bassInput * 0.35) + (trebleInput * 0.35) + pulse) * config.audioWarpScale, { clampMin: 0, clampMax: 8 });

    mat.uniforms.uAudioBass.value = clampToUniform(bassInput);
    mat.uniforms.uAudioTreble.value = clampToUniform(trebleInput);
    mat.uniforms.uAudioBassMotion.value = clampToUniform(bassMotion);
    mat.uniforms.uAudioTrebleMotion.value = clampToUniform(trebleMotion);
    mat.uniforms.uAudioBassSize.value = clampToUniform(bassSize);
    mat.uniforms.uAudioTrebleSize.value = clampToUniform(trebleSize);
    mat.uniforms.uAudioBassAlpha.value = clampToUniform(bassAlpha);
    mat.uniforms.uAudioTrebleAlpha.value = clampToUniform(trebleAlpha);
    mat.uniforms.uAudioBassLine.value = clampToUniform(bassLine);
    mat.uniforms.uAudioTrebleLine.value = clampToUniform(trebleLine);
    mat.uniforms.uAudioBandAMotion.value = clampToUniform(bandAMotion);
    mat.uniforms.uAudioBandASize.value = clampToUniform(bandASize);
    mat.uniforms.uAudioBandAAlpha.value = clampToUniform(bandAAlpha);
    mat.uniforms.uAudioBandBMotion.value = clampToUniform(bandBMotion);
    mat.uniforms.uAudioBandBSize.value = clampToUniform(bandBSize);
    mat.uniforms.uAudioBandBAlpha.value = clampToUniform(bandBAlpha);
    mat.uniforms.uAudioPulse.value = clampToUniform(pulse);
    mat.uniforms.uAudioMorph.value = clampToUniform(morph);
    mat.uniforms.uAudioShatter.value = clampToUniform(shatter);
    mat.uniforms.uAudioTwist.value = clampToUniform(twist);
    mat.uniforms.uAudioBend.value = clampToUniform(bend);
    mat.uniforms.uAudioWarp.value = clampToUniform(warp);
    return evaluatedRoutes;
  }

  audioRouteStateRef.current.clear();
  if (!audioEnabledChanged) return [];
  mat.uniforms.uAudioBass.value = 0;
  mat.uniforms.uAudioTreble.value = 0;
  mat.uniforms.uAudioBassMotion.value = 0;
  mat.uniforms.uAudioTrebleMotion.value = 0;
  mat.uniforms.uAudioBassSize.value = 0;
  mat.uniforms.uAudioTrebleSize.value = 0;
  mat.uniforms.uAudioBassAlpha.value = 0;
  mat.uniforms.uAudioTrebleAlpha.value = 0;
  mat.uniforms.uAudioBassLine.value = 0;
  mat.uniforms.uAudioTrebleLine.value = 0;
  mat.uniforms.uAudioBandAMotion.value = 0;
  mat.uniforms.uAudioBandASize.value = 0;
  mat.uniforms.uAudioBandAAlpha.value = 0;
  mat.uniforms.uAudioBandBMotion.value = 0;
  mat.uniforms.uAudioBandBSize.value = 0;
  mat.uniforms.uAudioBandBAlpha.value = 0;
  mat.uniforms.uAudioPulse.value = 0;
  mat.uniforms.uAudioMorph.value = 0;
  mat.uniforms.uAudioShatter.value = 0;
  mat.uniforms.uAudioTwist.value = 0;
  mat.uniforms.uAudioBend.value = 0;
  mat.uniforms.uAudioWarp.value = 0;
  return [];
}
