import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../lib/appStateConfig';
import { applyBulkRouteEditToVisible } from '../lib/audioRouteBulkEdit';
import { createAudioRouteSeed } from '../lib/audioReactiveConfig';
import {
  applyMidiMessageToRuntimeState,
  createAudioLevelsFromMidiState,
  createEmptyMidiRuntimeState,
  pickPreferredMidiInput,
  stepMidiRuntimeState,
} from '../lib/audioMidiSource';

const routes = [
  createAudioRouteSeed(0, { id: 'route-a', source: 'bass', target: 'particle.pulse', amount: 1, enabled: true }),
  createAudioRouteSeed(1, { id: 'route-b', source: 'treble', target: 'line.opacity', amount: 0.5, enabled: false, notes: 'existing' }),
];

const visibleRouteIdSet = new Set(['route-a', 'route-b']);
const bulkResult = applyBulkRouteEditToVisible(routes, visibleRouteIdSet, {
  enabled: 'invert',
  source: 'bandA',
  target: 'growth.opacity',
  mode: 'multiply',
  curve: 'ease-in',
  amountScale: 2,
  notesAppend: 'bulk-pass',
});

assert.equal(bulkResult.touchedCount, 2, 'bulk edit should touch both visible routes');
assert.equal(bulkResult.nextRoutes[0].enabled, false, 'first route should invert to disabled');
assert.equal(bulkResult.nextRoutes[1].enabled, true, 'second route should invert to enabled');
assert.equal(bulkResult.nextRoutes[0].source, 'bandA', 'bulk edit should overwrite source');
assert.equal(bulkResult.nextRoutes[0].target, 'growth.opacity', 'bulk edit should overwrite target');
assert.equal(bulkResult.nextRoutes[0].mode, 'multiply', 'bulk edit should overwrite mode');
assert.equal(bulkResult.nextRoutes[0].curve, 'ease-in', 'bulk edit should overwrite curve');
assert.equal(bulkResult.nextRoutes[0].amount, 2, 'bulk edit should scale amount');
assert.match(bulkResult.nextRoutes[1].notes ?? '', /bulk-pass/, 'bulk edit should append notes');

const midiState = createEmptyMidiRuntimeState();
applyMidiMessageToRuntimeState(midiState, new Uint8Array([0x90, 60, 100]), DEFAULT_CONFIG);
assert.ok(midiState.bass > 0, 'note-on should drive bass');
assert.ok(midiState.pulse > 0, 'note-on should drive pulse');
applyMidiMessageToRuntimeState(midiState, new Uint8Array([0xb0, DEFAULT_CONFIG.midiTrebleCC, 96]), DEFAULT_CONFIG);
assert.ok(midiState.treble > 0, 'mapped treble CC should drive treble');
applyMidiMessageToRuntimeState(midiState, new Uint8Array([0x80, 60, 0]), DEFAULT_CONFIG);
assert.equal(midiState.activeNotes.size, 0, 'note-off should clear held note');
stepMidiRuntimeState(midiState, 0.5, DEFAULT_CONFIG);
const levels = createAudioLevelsFromMidiState(midiState);
assert.ok(levels.bass >= 0 && levels.bass <= 1, 'bass level should remain normalized');
assert.ok(levels.treble >= 0 && levels.treble <= 1, 'treble level should remain normalized');

const fakeInputs = [
  { id: 'first', onmidimessage: null },
  { id: 'preferred', onmidimessage: null },
] as unknown as MIDIInput[];
assert.equal(pickPreferredMidiInput(fakeInputs, 'preferred')?.id, 'preferred', 'preferred MIDI input should be selected when present');
assert.equal(pickPreferredMidiInput(fakeInputs, 'missing')?.id, 'first', 'first MIDI input should be fallback');

console.log('verify-audio-midi-bulk-entry: ok');
