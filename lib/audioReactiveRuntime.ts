import type { ParticleConfig } from '../types';
import type { AudioLevels } from './audioControllerTypes';
import { createAudioFeatureFrameFromLevels, getAudioFeatureValue } from './audioFeatureFrame';
import type { AudioModulationRoute } from '../types/audioReactive';

export type AudioRouteStateMap = Map<string, number>;

export interface EvaluatedAudioRoute {
  id: string;
  target: string;
  source: AudioModulationRoute['source'];
  mode: AudioModulationRoute['mode'];
  value: number;
  notes?: string;
}

const TARGET_ALIAS_MAP: Record<string, string[]> = {
  'particle.bassMotion': ['particle.motion'],
  'particle.trebleMotion': ['particle.motion'],
  'particle.bandAMotion': ['particle.motion'],
  'particle.bandBMotion': ['particle.motion'],
  'particle.bassSize': ['particle.size'],
  'particle.trebleSize': ['particle.size'],
  'particle.bandASize': ['particle.size'],
  'particle.bandBSize': ['particle.size'],
  'particle.bassAlpha': ['particle.alpha'],
  'particle.trebleAlpha': ['particle.alpha'],
  'particle.bandAAlpha': ['particle.alpha'],
  'particle.bandBAlpha': ['particle.alpha'],
  'particle.bassLine': ['line.opacity'],
  'particle.trebleLine': ['line.opacity'],
  'screen.scanlineIntensity': ['postfx.screen', 'overlay.scanline'],
  'screen.noiseIntensity': ['postfx.screen', 'overlay.noise'],
  'screen.vignetteIntensity': ['postfx.screen', 'overlay.vignette'],
  'screen.pulseIntensity': ['postfx.screen', 'overlay.pulse'],
  'screen.pulseSpeed': ['postfx.screen', 'overlay.pulseSpeed'],
  'screen.interferenceIntensity': ['postfx.screen', 'overlay.interference'],
  'screen.persistenceIntensity': ['postfx.screen', 'overlay.persistence'],
  'screen.splitIntensity': ['postfx.screen', 'overlay.split'],
  'screen.sweepIntensity': ['postfx.screen', 'overlay.sweep'],
  'camera.shake': ['camera.impulse'],
  'camera.dolly': ['camera.zoom'],
  'sequence.randomizeSeed': ['sequence.seedMutation'],
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value: number) {
  return clamp(value, 0, 1);
}

function applyCurve(value: number, curve: AudioModulationRoute['curve']) {
  const clamped = clamp01(value);
  switch (curve) {
    case 'ease-in':
      return clamped * clamped;
    case 'ease-out':
      return 1 - ((1 - clamped) * (1 - clamped));
    case 'ease-in-out':
      return clamped * clamped * (3 - 2 * clamped);
    case 'exp':
      return Math.pow(clamped, 3);
    case 'log':
      return Math.log1p(clamped * 9) / Math.log(10);
    case 'gate':
      return clamped >= 0.5 ? 1 : 0;
    case 'linear':
    default:
      return clamped;
  }
}

function smoothRouteValue(previous: number, next: number, route: AudioModulationRoute) {
  const phaseBlend = next >= previous ? route.attack : route.release;
  const blend = clamp(Math.max(route.smoothing, phaseBlend), 0, 1);
  return previous + ((next - previous) * blend);
}

function targetMatches(evaluatedTarget: string, requestedTarget: string) {
  if (evaluatedTarget === requestedTarget) {
    return true;
  }
  const aliases = TARGET_ALIAS_MAP[requestedTarget] ?? [];
  return aliases.includes(evaluatedTarget);
}

export function createAudioRouteStateMap(): AudioRouteStateMap {
  return new Map();
}

export function evaluateAudioRoutes(
  config: Pick<ParticleConfig, 'audioEnabled' | 'audioRoutesEnabled' | 'audioRoutes'>,
  levels: AudioLevels,
  stateMap: AudioRouteStateMap,
): EvaluatedAudioRoute[] {
  if (!config.audioEnabled || !config.audioRoutesEnabled || config.audioRoutes.length === 0) {
    stateMap.clear();
    return [];
  }

  const frame = createAudioFeatureFrameFromLevels(levels);
  const evaluated: EvaluatedAudioRoute[] = [];

  for (const route of config.audioRoutes) {
    if (!route.enabled) {
      continue;
    }

    const sourceValue = clamp01(getAudioFeatureValue(frame, route.source));
    const curved = applyCurve(sourceValue, route.curve);
    const rawValue = clamp((curved * route.amount) + route.bias, route.clampMin, route.clampMax);
    const previous = stateMap.get(route.id) ?? 0;
    const smoothed = smoothRouteValue(previous, rawValue, route);
    stateMap.set(route.id, smoothed);
    evaluated.push({
      id: route.id,
      target: route.target,
      source: route.source,
      mode: route.mode,
      value: smoothed,
      notes: route.notes,
    });
  }

  return evaluated;
}

export function resolveEvaluatedAudioTargetValue(
  evaluatedRoutes: EvaluatedAudioRoute[],
  requestedTarget: string,
  baseValue: number,
  options?: {
    additiveScale?: number;
    multiplicativeScale?: number;
    clampMin?: number;
    clampMax?: number;
  },
) {
  const additiveScale = options?.additiveScale ?? 1;
  const multiplicativeScale = options?.multiplicativeScale ?? additiveScale;
  let result = baseValue;

  for (const route of evaluatedRoutes) {
    if (!targetMatches(route.target, requestedTarget)) {
      continue;
    }

    switch (route.mode) {
      case 'replace':
        result = route.value * additiveScale;
        break;
      case 'multiply':
        result *= Math.max(0, 1 + (route.value * multiplicativeScale));
        break;
      case 'gate':
        if (route.value > 0.001) {
          result = Math.max(result, baseValue + (route.value * additiveScale));
        }
        break;
      case 'trigger':
        if (route.value > 0.1) {
          result = Math.max(result, baseValue + (route.value * additiveScale));
        }
        break;
      case 'add':
      default:
        result += route.value * additiveScale;
        break;
    }
  }

  if (typeof options?.clampMin === 'number' || typeof options?.clampMax === 'number') {
    return clamp(
      result,
      options?.clampMin ?? Number.NEGATIVE_INFINITY,
      options?.clampMax ?? Number.POSITIVE_INFINITY,
    );
  }

  return result;
}
