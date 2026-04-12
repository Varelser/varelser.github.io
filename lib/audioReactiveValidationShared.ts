import {
  AUDIO_FEATURE_KEYS,
  AUDIO_REACTIVE_CURVES,
  AUDIO_REACTIVE_MODES,
  type AudioModulationRoute,
} from '../types/audioReactive';
import { AUDIO_REACTIVE_CAPABILITY_REGISTRY } from './audioReactiveRegistry';
import type { AudioFocusedCustomConflictRouteDetail } from './audioReactiveValidationTypes';

export const AUDIO_FEATURE_KEY_SET = new Set<string>(AUDIO_FEATURE_KEYS as readonly string[]);
export const AUDIO_REACTIVE_CURVE_SET = new Set<string>(AUDIO_REACTIVE_CURVES as readonly string[]);
export const AUDIO_REACTIVE_MODE_SET = new Set<string>(AUDIO_REACTIVE_MODES as readonly string[]);
export const AUDIO_REACTIVE_TARGET_SET = new Set<string>(
  AUDIO_REACTIVE_CAPABILITY_REGISTRY.flatMap((entry) => entry.targets),
);

export function isRecord(candidate: unknown): candidate is Record<string, unknown> {
  return !!candidate && typeof candidate === 'object' && !Array.isArray(candidate);
}

export function parseRawRoutes(text: string): { scope: 'all' | 'visible' | 'unknown'; routes: unknown[] } {
  const parsed = JSON.parse(text) as unknown;
  if (Array.isArray(parsed)) {
    return { scope: 'all', routes: parsed };
  }
  if (isRecord(parsed) && Array.isArray(parsed.routes)) {
    return {
      scope:
        parsed.scope === 'visible'
          ? 'visible'
          : parsed.scope === 'all'
            ? 'all'
            : 'unknown',
      routes: parsed.routes,
    };
  }
  throw new Error('Invalid audio route bundle format');
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function uniqueSorted(items: string[]) {
  return Array.from(new Set(items)).sort((left, right) => left.localeCompare(right));
}

export function createRouteKey(route: Pick<AudioModulationRoute, 'source' | 'target'>) {
  return `${route.source} -> ${route.target}`;
}

export function createRouteComparisonDelta(expected: AudioModulationRoute, actual: AudioModulationRoute) {
  return {
    amountDelta: Math.abs(expected.amount - actual.amount),
    biasDelta: Math.abs(expected.bias - actual.bias),
    timingDelta:
      Math.abs(expected.smoothing - actual.smoothing)
      + Math.abs(expected.attack - actual.attack)
      + Math.abs(expected.release - actual.release)
      + Math.abs(expected.clampMin - actual.clampMin)
      + Math.abs(expected.clampMax - actual.clampMax)
      + (expected.curve === actual.curve ? 0 : 1)
      + (expected.mode === actual.mode ? 0 : 1),
  };
}

export function isLegacyOwnedRoute(route: AudioModulationRoute) {
  return route.id.startsWith('legacy-') || route.notes?.toLowerCase().includes('legacy') === true;
}

export function getRouteOwner(route: AudioModulationRoute): AudioFocusedCustomConflictRouteDetail['owner'] {
  return isLegacyOwnedRoute(route) ? 'legacy' : 'custom';
}

export function createRouteMap(routes: AudioModulationRoute[]) {
  const routeMap = new Map<string, AudioModulationRoute[]>();
  routes.forEach((route) => {
    const key = createRouteKey(route);
    const group = routeMap.get(key);
    if (group) {
      group.push(route);
    } else {
      routeMap.set(key, [route]);
    }
  });
  return routeMap;
}

export function roundMetric(value: number, digits = 3) {
  return Number(value.toFixed(digits));
}
