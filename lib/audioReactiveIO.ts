import type { AudioModulationRoute } from '../types/audioReactive';
import { cloneAudioRoutes, normalizeAudioRoutes } from './audioReactiveConfig';

const AUDIO_ROUTE_BUNDLE_VERSION = 1;

const AUDIO_ROUTE_BUNDLE_KIND = 'kalokagathia-audio-route-bundle';
const AUDIO_ROUTE_BUNDLE_KIND_LEGACY = 'monosphere-audio-route-bundle';

export interface AudioRouteBundle {
  kind: typeof AUDIO_ROUTE_BUNDLE_KIND | typeof AUDIO_ROUTE_BUNDLE_KIND_LEGACY;
  version: number;
  routeCount: number;
  exportedAt: string;
  scope: 'all' | 'visible';
  routes: AudioModulationRoute[];
}

function createAudioRouteBundle(
  routes: AudioModulationRoute[],
  scope: 'all' | 'visible' = 'all',
): AudioRouteBundle {
  const normalizedRoutes = cloneAudioRoutes(normalizeAudioRoutes(routes));
  return {
    kind: AUDIO_ROUTE_BUNDLE_KIND,
    version: AUDIO_ROUTE_BUNDLE_VERSION,
    routeCount: normalizedRoutes.length,
    exportedAt: new Date().toISOString(),
    scope,
    routes: normalizedRoutes,
  };
}

export function serializeAudioRouteBundle(
  routes: AudioModulationRoute[],
  scope: 'all' | 'visible' = 'all',
) {
  return JSON.stringify(createAudioRouteBundle(routes, scope), null, 2);
}

function isRouteBundle(candidate: unknown): candidate is { routes: unknown; scope?: 'all' | 'visible' } {
  return !!candidate && typeof candidate === 'object' && 'routes' in candidate;
}

export function parseAudioRouteBundle(text: string) {
  const parsed = JSON.parse(text) as unknown;
  if (Array.isArray(parsed)) {
    const routes = normalizeAudioRoutes(parsed);
    return {
      scope: 'all' as const,
      routes,
      routeCount: routes.length,
    };
  }

  if (isRouteBundle(parsed)) {
    const routes = normalizeAudioRoutes(parsed.routes);
    return {
      scope: parsed.scope === 'visible' ? 'visible' as const : 'all' as const,
      routes,
      routeCount: routes.length,
    };
  }

  throw new Error('Invalid audio route bundle format');
}
