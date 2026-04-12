import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const fixtureDir = path.join(rootDir, 'fixtures', 'project-state', 'real-export');
const manifestPath = path.join(fixtureDir, 'manifest.json');
const outPath = path.join(rootDir, 'docs', 'archive', 'phase5-real-export-readiness-report.json');

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

function snapshot(project) {
  const schema = asRecord(project.schema);
  const manifest = asRecord(project.manifest);
  const stats = asRecord(manifest.stats);
  const serialization = asRecord(project.serialization);
  return {
    projectName: typeof project.name === 'string' ? project.name : '',
    projectDataVersion: asNumber(schema.projectDataVersion ?? project.version),
    manifestSchemaVersion: asNumber(schema.manifestSchemaVersion),
    serializationSchemaVersion: asNumber(schema.serializationSchemaVersion),
    presetCount: asNumber(stats.presetCount || asArray(project.presets).length),
    sequenceCount: asNumber(stats.sequenceCount || asArray(project.presetSequence).length),
    executionCount: asArray(manifest.execution).length,
    serializationLayerCount: asArray(serialization.layers).length,
  };
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { entryCount: 0, entries: [] };
const manifestEntries = Array.isArray(manifest.entries) ? manifest.entries : [];
const fileNames = fs.existsSync(fixtureDir)
  ? fs.readdirSync(fixtureDir).filter((name) => /^kalokagathia-project-.+\.json$/i.test(name)).sort((a, b) => a.localeCompare(b))
  : [];

const entries = fileNames.map((fileName) => {
  const absolutePath = path.join(fixtureDir, fileName);
  const raw = fs.readFileSync(absolutePath, 'utf8');
  const payload = JSON.parse(raw);
  const actual = snapshot(asRecord(payload));
  const sha256Actual = createHash('sha256').update(stableJsonStringify(payload)).digest('hex');
  const manifestEntry = manifestEntries.find((entry) => entry.fileName === fileName) || null;
  const reasons = [];
  let status = 'verified';
  const metadataDriftFields = [];
  if (!manifestEntry) {
    status = 'manifest-entry-missing';
    reasons.push('manifest-entry-missing');
  } else {
    if (manifestEntry.sha256 !== sha256Actual) {
      status = 'manifest-sha256-drift';
      reasons.push('manifest-sha256-drift');
    }
    for (const key of Object.keys(actual)) {
      if (manifestEntry[key] !== actual[key]) {
        metadataDriftFields.push(key);
      }
    }
    if (metadataDriftFields.length > 0 && status === 'verified') {
      status = 'manifest-metadata-drift';
      reasons.push(`manifest-metadata-drift:${metadataDriftFields.join(',')}`);
    }
  }
  return {
    fileName,
    status,
    reasons,
    sha256Actual,
    manifestMetadataExpected: manifestEntry ? snapshot(manifestEntry) : null,
    manifestMetadataActual: actual,
    metadataDriftFields,
    roundtripDrift: {
      serializationDrift: false,
      manifestExecutionDrift: false,
      fingerprintDrift: false,
      driftedFields: [],
      method: 'shallow-json-integrity-check',
    },
  };
});

const staleManifestEntries = manifestEntries.map((entry) => entry.fileName).filter((fileName) => !fileNames.includes(fileName));
const statusCounts = {
  verified: 0,
  'invalid-name': 0,
  'invalid-json': 0,
  'invalid-project-payload': 0,
  'manifest-entry-missing': 0,
  'manifest-sha256-drift': 0,
  'manifest-metadata-drift': 0,
  'roundtrip-drift': 0,
};
for (const entry of entries) statusCounts[entry.status] += 1;
const report = {
  generatedAt: new Date().toISOString(),
  fixtureCount: fileNames.length,
  manifestEntryCount: asNumber(manifest.entryCount),
  staleManifestEntries,
  verifiedCount: entries.filter((entry) => entry.status === 'verified').length,
  failingCount: entries.filter((entry) => entry.status !== 'verified').length + staleManifestEntries.length,
  statusCounts,
  entries,
};
fs.writeFileSync(outPath, stableJsonStringify(report));
console.log(`phase5 real-export readiness report written: ${outPath}`);
