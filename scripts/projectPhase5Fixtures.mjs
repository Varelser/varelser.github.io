import fs from 'node:fs';
import path from 'node:path';

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getPhase5FixtureDir() {
  return path.resolve(process.cwd(), 'fixtures/project-state');
}

export function getPhase5RealExportFixtureDir() {
  return path.join(getPhase5FixtureDir(), 'real-exports');
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const fixtureDir = getPhase5FixtureDir();
const definitions = [
  ['native-rich', 'phase5-native-rich.json'],
  ['sparse-layer2-custom', 'phase5-sparse-layer2-custom.json'],
  ['legacy-v24', 'phase5-legacy-v24.json'],
  ['duplicate-ids-invalid-active', 'phase5-duplicate-ids-invalid-active.json'],
  ['orphan-sequence', 'phase5-orphan-sequence.json'],
];

export const PHASE5_FIXTURE_DEFINITIONS = definitions.map(([id, fileName]) => ({
  id,
  fileName,
  buildPayload: () => deepClone(readJson(path.join(fixtureDir, fileName))),
}));
