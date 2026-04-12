import assert from 'node:assert/strict';
import { createAudioRouteSeed } from '../../lib/audioReactiveConfig';
import { parseAudioRouteBundle, serializeAudioRouteBundle } from '../../lib/audioReactiveIO';

export async function main() {
  const route = createAudioRouteSeed(0, {
    id: 'route-visible-bass',
    source: 'bass',
    target: 'particle.size',
    amount: 2.5,
    mode: 'multiply',
    notes: 'unit-test',
  });

  const serialized = serializeAudioRouteBundle([route], 'visible');
  const parsed = parseAudioRouteBundle(serialized);
  assert.equal(parsed.scope, 'visible');
  assert.equal(parsed.routeCount, 1);
  assert.equal(parsed.routes[0]?.id, 'route-visible-bass');
  assert.equal(parsed.routes[0]?.source, 'bass');
  assert.equal(parsed.routes[0]?.mode, 'multiply');

  const parsedLegacy = parseAudioRouteBundle(JSON.stringify([
    {
      source: 'not-a-real-feature',
      amount: 99,
      clampMin: -99,
      clampMax: 99,
      smoothing: 5,
    },
  ]));
  assert.equal(parsedLegacy.scope, 'all');
  assert.equal(parsedLegacy.routeCount, 1);
  assert.equal(parsedLegacy.routes[0]?.id, 'audio-route-1');
  assert.equal(parsedLegacy.routes[0]?.source, 'pulse');
  assert.equal(parsedLegacy.routes[0]?.amount, 8);
  assert.equal(parsedLegacy.routes[0]?.clampMin, -8);
  assert.equal(parsedLegacy.routes[0]?.clampMax, 8);
  assert.equal(parsedLegacy.routes[0]?.smoothing, 1);

  assert.throws(() => parseAudioRouteBundle(JSON.stringify({ kind: 'invalid' })), /Invalid audio route bundle format/);
}
