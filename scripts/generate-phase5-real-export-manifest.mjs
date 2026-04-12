import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const fixtureDir = path.join(rootDir, 'fixtures', 'project-state', 'real-export');
const manifestPath = path.join(fixtureDir, 'manifest.json');

function stableSort(value) {
  if (Array.isArray(value)) return value.map(stableSort);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, stableSort(v)]),
    );
  }
  return value;
}

function stableJsonStringify(value) {
  return `${JSON.stringify(stableSort(value), null, 2)}\n`;
}

function asRecord(value) {
  return value && typeof value === 'object' ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

fs.mkdirSync(fixtureDir, { recursive: true });
const fileNames = fs.readdirSync(fixtureDir)
  .filter((name) => /^kalokagathia-project-.+\.json$/i.test(name))
  .sort((a, b) => a.localeCompare(b));

const entries = fileNames.map((fileName) => {
  const absolutePath = path.join(fixtureDir, fileName);
  const raw = fs.readFileSync(absolutePath, 'utf8');
  const payload = JSON.parse(raw);
  const project = asRecord(payload);
  const schema = asRecord(project.schema);
  const manifest = asRecord(project.manifest);
  const stats = asRecord(manifest.stats);
  const serialization = asRecord(project.serialization);
  return {
    fileName,
    sha256: createHash('sha256').update(stableJsonStringify(payload)).digest('hex'),
    projectName: typeof project.name === 'string' ? project.name : fileName,
    projectDataVersion: asNumber(schema.projectDataVersion ?? project.version),
    manifestSchemaVersion: asNumber(schema.manifestSchemaVersion),
    serializationSchemaVersion: asNumber(schema.serializationSchemaVersion),
    presetCount: asNumber(stats.presetCount || asArray(project.presets).length),
    sequenceCount: asNumber(stats.sequenceCount || asArray(project.presetSequence).length),
    executionCount: asArray(manifest.execution).length,
    serializationLayerCount: asArray(serialization.layers).length,
  };
});

const manifest = {
  generatedAt: new Date().toISOString(),
  entryCount: entries.length,
  entries,
};
fs.writeFileSync(manifestPath, stableJsonStringify(manifest));
console.log(JSON.stringify({ fixtureDir, manifestPath, entryCount: entries.length, fileNames }, null, 2));
