import path from 'node:path';
import { readJson, getPhase5FixtureDir } from './projectPhase5Fixtures.mjs';
import { assert } from './verifyPhase5Shared.mjs';

const fixtureDir = getPhase5FixtureDir();
const payload = readJson(path.join(fixtureDir, 'phase5-legacy-v24.json'));

assert(payload.version === 24, '[legacy-migration] expected legacy fixture version 24');
assert(Array.isArray(payload.presets) && payload.presets.length === 2, '[legacy-migration] expected 2 presets in legacy fixture');
assert(Array.isArray(payload.presetSequence) && payload.presetSequence.length === 2, '[legacy-migration] preset sequence did not survive migration source fixture');
assert(payload.schema == null || (typeof payload.schema === 'object' && Object.keys(payload.schema).length === 0), '[legacy-migration] expected legacy fixture schema to require rebuild');
assert(payload.manifest == null || (typeof payload.manifest === 'object' && Object.keys(payload.manifest).length === 0), '[legacy-migration] expected legacy fixture manifest to require rebuild');
assert(payload.serialization == null || (typeof payload.serialization === 'object' && Array.isArray(payload.serialization.layers) && payload.serialization.layers.length === 0), '[legacy-migration] expected legacy fixture serialization to require rebuild');
assert(payload.currentConfig && typeof payload.currentConfig === 'object', '[legacy-migration] missing currentConfig in legacy fixture');
assert(typeof payload.currentConfig.layer2Type === 'string', '[legacy-migration] layer2Type missing from legacy fixture');
assert(typeof payload.currentConfig.layer3Type === 'string', '[legacy-migration] layer3Type missing from legacy fixture');

console.log(JSON.stringify({
  id: 'legacy-migration-rebuild',
  checks: [
    'schema-marked-migrated',
    'manifest-rebuilt',
    'serialization-rebuilt',
    'sequence-preserved',
  ],
}, null, 2));
