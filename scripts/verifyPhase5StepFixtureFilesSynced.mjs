import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PHASE5_FIXTURE_DEFINITIONS, getPhase5FixtureDir } from './projectPhase5Fixtures.mjs';
import { stableJsonStringify, assert } from './verifyPhase5Shared.mjs';

const fixtureDir = getPhase5FixtureDir();
for (const definition of PHASE5_FIXTURE_DEFINITIONS) {
  const expected = stableJsonStringify(definition.buildPayload());
  const absolutePath = path.join(fixtureDir, definition.fileName);
  const actual = readFileSync(absolutePath, 'utf8');
  assert(actual === expected, `[fixture-sync:${definition.fileName}] fixture file is stale; regenerate Phase 5 fixtures`);
}
console.log(JSON.stringify({
  id: 'fixture-files-synced',
  checks: PHASE5_FIXTURE_DEFINITIONS.map((definition) => definition.fileName),
}, null, 2));
