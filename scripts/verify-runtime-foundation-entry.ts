import assert from 'node:assert/strict';
import { normalizeConfig, normalizeSynthPattern } from '../lib/appStateConfigNormalization';
import { DEFAULT_CONFIG } from '../lib/appStateConfigDefaults';
import { createAudioRouteStateMap, evaluateAudioRoutes, resolveEvaluatedAudioTargetValue } from '../lib/audioReactiveRuntime';
import { normalizeAudioRoutes } from '../lib/audioReactiveConfig';

export async function main() {
  const normalized = normalizeConfig({
    particleColor: 'black',
    backgroundColor: 'black',
    synthPattern: [1.2, 20, -10],
    audioRoutes: [{ id: '', enabled: true, target: '', source: 'invalid' as never, amount: 99, bias: 0, curve: 'linear', smoothing: 0.1, attack: 0.1, release: 0.1, clampMin: 0, clampMax: 1, mode: 'add' }],
  });

  assert.equal(normalized.backgroundColor, 'white', 'particle/background contrast should normalize away from same-color state');
  assert.deepEqual(normalized.synthPattern.slice(0, 4), [1, 15, 0, DEFAULT_CONFIG.synthPattern[3]], 'synth pattern should clamp and backfill');
  assert.notEqual(normalized.audioRoutes, DEFAULT_CONFIG.audioRoutes, 'audio route array should clone');
  assert.equal(normalized.audioRoutes[0]?.target, 'particle.pulse', 'invalid target should normalize to default');

  const normalizedOnlyPattern = normalizeSynthPattern([3.7, -2, 30]);
  assert.deepEqual(normalizedOnlyPattern.slice(0, 4), [4, 0, 15, DEFAULT_CONFIG.synthPattern[3]]);

  const routes = normalizeAudioRoutes([
    {
      id: 'route-1',
      enabled: true,
      source: 'pulse',
      target: 'camera.impulse',
      amount: 1,
      bias: 0,
      curve: 'linear',
      smoothing: 1,
      attack: 1,
      release: 1,
      clampMin: 0,
      clampMax: 1,
      mode: 'add',
    },
  ]);

  const stateMap = createAudioRouteStateMap();
  const evaluated = evaluateAudioRoutes(
    {
      audioEnabled: true,
      audioRoutesEnabled: true,
      audioRoutes: routes,
    },
    {
      bass: 0,
      treble: 0,
      pulse: 0.75,
      bandA: 0,
      bandB: 0,
    },
    stateMap,
  );

  assert.equal(evaluated.length, 1, 'one active route should evaluate');
  assert.equal(evaluated[0]?.target, 'camera.impulse');
  assert.equal(evaluated[0]?.value, 0.75);

  const aliasResolved = resolveEvaluatedAudioTargetValue(evaluated, 'camera.shake', 0.1, {
    additiveScale: 1,
    clampMin: 0,
    clampMax: 2,
  });
  assert.equal(aliasResolved, 0.85, 'alias target should resolve through camera.shake -> camera.impulse');

  const clearedState = createAudioRouteStateMap();
  clearedState.set('stale', 1);
  const disabled = evaluateAudioRoutes(
    {
      audioEnabled: false,
      audioRoutesEnabled: true,
      audioRoutes: routes,
    },
    {
      bass: 1,
      treble: 1,
      pulse: 1,
      bandA: 1,
      bandB: 1,
    },
    clearedState,
  );
  assert.equal(disabled.length, 0, 'disabled audio should skip evaluation');
  assert.equal(clearedState.size, 0, 'disabled audio should clear state');

  console.log(JSON.stringify({
    ok: true,
    normalizedRouteTarget: normalized.audioRoutes[0]?.target ?? null,
    aliasResolved,
    evaluatedRouteCount: evaluated.length,
  }, null, 2));
}
