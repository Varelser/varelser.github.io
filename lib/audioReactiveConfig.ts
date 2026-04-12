import type { ParticleConfig } from '../types';
import { AUDIO_FEATURE_KEYS, AUDIO_REACTIVE_CURVES, AUDIO_REACTIVE_MODES, type AudioFeatureKey, type AudioModulationRoute, type AudioReactiveCurve, type AudioReactiveMode } from '../types/audioReactive';

export const AUDIO_ARCHITECTURE_VERSION = 1;
export const AUDIO_FEATURE_FRAME_VERSION = 1;

const DEFAULT_AUDIO_ROUTE_CURVE: AudioReactiveCurve = 'linear';
const DEFAULT_AUDIO_ROUTE_MODE: AudioReactiveMode = 'add';

export function createDefaultAudioRoutes(): AudioModulationRoute[] {
  return [];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeSource(source: unknown): AudioFeatureKey {
  return typeof source === 'string' && (AUDIO_FEATURE_KEYS as readonly string[]).includes(source)
    ? (source as AudioFeatureKey)
    : 'pulse';
}

function normalizeCurve(curve: unknown): AudioReactiveCurve {
  return typeof curve === 'string' && (AUDIO_REACTIVE_CURVES as readonly string[]).includes(curve)
    ? (curve as AudioReactiveCurve)
    : DEFAULT_AUDIO_ROUTE_CURVE;
}

function normalizeMode(mode: unknown): AudioReactiveMode {
  return typeof mode === 'string' && (AUDIO_REACTIVE_MODES as readonly string[]).includes(mode)
    ? (mode as AudioReactiveMode)
    : DEFAULT_AUDIO_ROUTE_MODE;
}

function createRouteId(index: number) {
  return `audio-route-${index + 1}`;
}

export function createAudioRouteSeed(index: number, overrides?: Partial<AudioModulationRoute>): AudioModulationRoute {
  return normalizeAudioRoutes([
    {
      id: overrides?.id ?? createRouteId(index),
      enabled: overrides?.enabled ?? true,
      source: overrides?.source ?? 'pulse',
      target: overrides?.target ?? 'particle.pulse',
      amount: overrides?.amount ?? 1,
      bias: overrides?.bias ?? 0,
      curve: overrides?.curve ?? DEFAULT_AUDIO_ROUTE_CURVE,
      smoothing: overrides?.smoothing ?? 0.18,
      attack: overrides?.attack ?? 0.25,
      release: overrides?.release ?? 0.12,
      clampMin: overrides?.clampMin ?? 0,
      clampMax: overrides?.clampMax ?? 1,
      mode: overrides?.mode ?? DEFAULT_AUDIO_ROUTE_MODE,
      notes: overrides?.notes,
    },
  ])[0];
}

export function normalizeAudioRoutes(candidate: unknown): AudioModulationRoute[] {
  if (!Array.isArray(candidate)) {
    return createDefaultAudioRoutes();
  }

  return candidate.map((route, index) => {
    const next = (route ?? {}) as Partial<AudioModulationRoute>;
    return {
      id: typeof next.id === 'string' && next.id.trim().length > 0 ? next.id : createRouteId(index),
      enabled: next.enabled !== false,
      source: normalizeSource(next.source),
      target: typeof next.target === 'string' && next.target.trim().length > 0 ? next.target : 'particle.pulse',
      amount: typeof next.amount === 'number' ? clamp(next.amount, -8, 8) : 1,
      bias: typeof next.bias === 'number' ? clamp(next.bias, -4, 4) : 0,
      curve: normalizeCurve(next.curve),
      smoothing: typeof next.smoothing === 'number' ? clamp(next.smoothing, 0, 1) : 0.18,
      attack: typeof next.attack === 'number' ? clamp(next.attack, 0, 1) : 0.25,
      release: typeof next.release === 'number' ? clamp(next.release, 0, 1) : 0.12,
      clampMin: typeof next.clampMin === 'number' ? clamp(next.clampMin, -8, 8) : 0,
      clampMax: typeof next.clampMax === 'number' ? clamp(next.clampMax, -8, 8) : 1,
      mode: normalizeMode(next.mode),
      notes: typeof next.notes === 'string' && next.notes.trim().length > 0 ? next.notes : undefined,
    } satisfies AudioModulationRoute;
  });
}

export function cloneAudioRoutes(routes: AudioModulationRoute[]): AudioModulationRoute[] {
  return routes.map((route) => ({ ...route }));
}

type LegacyAudioRouteConfig = Pick<ParticleConfig,
  | 'audioBassMotionScale'
  | 'audioBassSizeScale'
  | 'audioBassAlphaScale'
  | 'audioTrebleMotionScale'
  | 'audioTrebleSizeScale'
  | 'audioTrebleAlphaScale'
  | 'audioPulseScale'
  | 'audioBurstScale'
  | 'audioScreenScale'
  | 'audioMorphScale'
  | 'audioShatterScale'
  | 'audioTwistScale'
  | 'audioBendScale'
  | 'audioWarpScale'
  | 'audioLineScale'
  | 'audioCameraScale'
  | 'audioHueShiftScale'
  | 'audioBandAMotionScale'
  | 'audioBandASizeScale'
  | 'audioBandAAlphaScale'
  | 'audioBandBMotionScale'
  | 'audioBandBSizeScale'
  | 'audioBandBAlphaScale'
>;

export function createLegacyAudioRoutes(config: LegacyAudioRouteConfig): AudioModulationRoute[] {
  const routes: AudioModulationRoute[] = [
    { id: 'legacy-bass-motion', enabled: config.audioBassMotionScale !== 0, source: 'bass', target: 'particle.bassMotion', amount: config.audioBassMotionScale, bias: 0, curve: 'linear', smoothing: 0.18, attack: 0.25, release: 0.12, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Bass -> Motion slider' },
    { id: 'legacy-bass-size', enabled: config.audioBassSizeScale !== 0, source: 'bass', target: 'particle.bassSize', amount: config.audioBassSizeScale, bias: 0, curve: 'linear', smoothing: 0.18, attack: 0.25, release: 0.12, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Bass -> Size slider' },
    { id: 'legacy-bass-alpha', enabled: config.audioBassAlphaScale !== 0, source: 'bass', target: 'particle.bassAlpha', amount: config.audioBassAlphaScale, bias: 0, curve: 'linear', smoothing: 0.18, attack: 0.25, release: 0.12, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Bass -> Opacity slider' },
    { id: 'legacy-treble-motion', enabled: config.audioTrebleMotionScale !== 0, source: 'treble', target: 'particle.trebleMotion', amount: config.audioTrebleMotionScale, bias: 0, curve: 'linear', smoothing: 0.18, attack: 0.22, release: 0.08, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Treble -> Motion slider' },
    { id: 'legacy-treble-size', enabled: config.audioTrebleSizeScale !== 0, source: 'treble', target: 'particle.trebleSize', amount: config.audioTrebleSizeScale, bias: 0, curve: 'linear', smoothing: 0.18, attack: 0.22, release: 0.08, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Treble -> Size slider' },
    { id: 'legacy-treble-alpha', enabled: config.audioTrebleAlphaScale !== 0, source: 'treble', target: 'particle.trebleAlpha', amount: config.audioTrebleAlphaScale, bias: 0, curve: 'linear', smoothing: 0.18, attack: 0.22, release: 0.08, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Treble -> Opacity slider' },
    { id: 'legacy-pulse-particles', enabled: config.audioPulseScale !== 0, source: 'pulse', target: 'particle.pulse', amount: config.audioPulseScale, bias: 0, curve: 'linear', smoothing: 0.12, attack: 0.68, release: 0.18, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Pulse -> Particles slider' },
    { id: 'legacy-pulse-burst', enabled: config.audioBurstScale !== 0, source: 'pulse', target: 'system.burst', amount: config.audioBurstScale, bias: 0, curve: 'linear', smoothing: 0.12, attack: 0.68, release: 0.18, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Pulse -> Burst slider' },
    { id: 'legacy-pulse-screen', enabled: config.audioScreenScale !== 0, source: 'pulse', target: 'postfx.screen', amount: config.audioScreenScale, bias: 0, curve: 'linear', smoothing: 0.12, attack: 0.68, release: 0.18, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Pulse -> Screen FX slider' },
    { id: 'legacy-pulse-morph', enabled: config.audioMorphScale !== 0, source: 'pulse', target: 'particle.morph', amount: config.audioMorphScale, bias: 0, curve: 'linear', smoothing: 0.12, attack: 0.68, release: 0.18, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Pulse -> Motion Morph slider' },
    { id: 'legacy-treble-shatter', enabled: config.audioShatterScale !== 0, source: 'treble', target: 'particle.shatter', amount: config.audioShatterScale, bias: 0, curve: 'linear', smoothing: 0.18, attack: 0.22, release: 0.08, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Treble -> Shatter slider' },
    { id: 'legacy-audio-twist', enabled: config.audioTwistScale !== 0, source: 'pulse', target: 'particle.twist', amount: config.audioTwistScale, bias: 0, curve: 'linear', smoothing: 0.16, attack: 0.32, release: 0.12, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Audio -> Twist slider' },
    { id: 'legacy-audio-bend', enabled: config.audioBendScale !== 0, source: 'pulse', target: 'particle.bend', amount: config.audioBendScale, bias: 0, curve: 'linear', smoothing: 0.16, attack: 0.32, release: 0.12, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Audio -> Bend slider' },
    { id: 'legacy-audio-warp', enabled: config.audioWarpScale !== 0, source: 'pulse', target: 'particle.warp', amount: config.audioWarpScale, bias: 0, curve: 'linear', smoothing: 0.16, attack: 0.32, release: 0.12, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Audio -> Radial Warp slider' },
    { id: 'legacy-audio-lines', enabled: config.audioLineScale !== 0, source: 'pulse', target: 'line.opacity', amount: config.audioLineScale, bias: 0, curve: 'linear', smoothing: 0.16, attack: 0.32, release: 0.12, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Audio -> Lines slider' },
    { id: 'legacy-audio-camera', enabled: config.audioCameraScale !== 0, source: 'pulse', target: 'camera.shake', amount: config.audioCameraScale, bias: 0, curve: 'linear', smoothing: 0.16, attack: 0.32, release: 0.12, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Audio -> Camera slider' },
    { id: 'legacy-audio-hue', enabled: config.audioHueShiftScale !== 0, source: 'pulse', target: 'postfx.hueShift', amount: config.audioHueShiftScale, bias: 0, curve: 'linear', smoothing: 0.16, attack: 0.32, release: 0.12, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Audio -> Hue Shift slider' },
    { id: 'legacy-bandA-motion', enabled: config.audioBandAMotionScale !== 0, source: 'bandA', target: 'particle.bandAMotion', amount: config.audioBandAMotionScale, bias: 0, curve: 'linear', smoothing: 0.18, attack: 0.28, release: 0.1, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Band A -> Motion slider' },
    { id: 'legacy-bandA-size', enabled: config.audioBandASizeScale !== 0, source: 'bandA', target: 'particle.bandASize', amount: config.audioBandASizeScale, bias: 0, curve: 'linear', smoothing: 0.18, attack: 0.28, release: 0.1, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Band A -> Size slider' },
    { id: 'legacy-bandA-alpha', enabled: config.audioBandAAlphaScale !== 0, source: 'bandA', target: 'particle.bandAAlpha', amount: config.audioBandAAlphaScale, bias: 0, curve: 'linear', smoothing: 0.18, attack: 0.28, release: 0.1, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Band A -> Alpha slider' },
    { id: 'legacy-bandB-motion', enabled: config.audioBandBMotionScale !== 0, source: 'bandB', target: 'particle.bandBMotion', amount: config.audioBandBMotionScale, bias: 0, curve: 'linear', smoothing: 0.18, attack: 0.22, release: 0.08, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Band B -> Motion slider' },
    { id: 'legacy-bandB-size', enabled: config.audioBandBSizeScale !== 0, source: 'bandB', target: 'particle.bandBSize', amount: config.audioBandBSizeScale, bias: 0, curve: 'linear', smoothing: 0.18, attack: 0.22, release: 0.08, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Band B -> Size slider' },
    { id: 'legacy-bandB-alpha', enabled: config.audioBandBAlphaScale !== 0, source: 'bandB', target: 'particle.bandBAlpha', amount: config.audioBandBAlphaScale, bias: 0, curve: 'linear', smoothing: 0.18, attack: 0.22, release: 0.08, clampMin: 0, clampMax: 4, mode: 'add', notes: 'Legacy Band B -> Alpha slider' },
  ];

  return routes.filter((route) => route.enabled);
}
