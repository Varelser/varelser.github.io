import fs from 'node:fs';
import path from 'node:path';

export function getRealExportFixtureDir(rootDir) {
  return path.resolve(rootDir, 'fixtures/project-state/real-export');
}

export function getRealExportManifestPath(rootDir) {
  return path.resolve(rootDir, 'fixtures/project-state/real-export/manifest.json');
}

export function getRealExportReadinessReportPath(rootDir) {
  return path.resolve(rootDir, 'docs/archive/phase5-real-export-readiness-report.json');
}

export function getProofInputDir(rootDir) {
  return path.resolve(rootDir, 'docs/archive/phase5-proof-input');
}

export function getProofNotesPath(rootDir) {
  return path.resolve(rootDir, 'docs/archive/phase5-proof-input/real-export-capture-notes.md');
}

export function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

export function listRealExportJsonFixtures(rootDir) {
  const fixtureDir = getRealExportFixtureDir(rootDir);
  if (!fs.existsSync(fixtureDir)) return [];
  return fs.readdirSync(fixtureDir)
    .filter((name) => /^kalokagathia-project-.+\.json$/i.test(name))
    .sort();
}

export function buildRealExportFixtureCheck(rootDir) {
  const fixtureDir = getRealExportFixtureDir(rootDir);
  const fixtureNames = listRealExportJsonFixtures(rootDir);
  return {
    kind: 'fixture-json',
    target: 'fixtures/project-state/real-export/*.json',
    ok: fixtureNames.length > 0,
    fixtureCount: fixtureNames.length,
    fixtureNames,
    fixtureDir,
  };
}

export function buildRealExportManifestCheck(rootDir) {
  const manifestPath = getRealExportManifestPath(rootDir);
  const manifest = safeReadJson(manifestPath);
  const entryCount = Number.isFinite(manifest?.entryCount) ? manifest.entryCount : 0;
  return {
    kind: 'real-export-manifest',
    target: 'fixtures/project-state/real-export/manifest.json',
    ok: Boolean(manifest && Array.isArray(manifest.entries) && entryCount > 0),
    manifestPath,
    entryCount,
  };
}

export function buildRealExportReadinessReportCheck(rootDir) {
  const reportPath = getRealExportReadinessReportPath(rootDir);
  const report = safeReadJson(reportPath);
  const verifiedCount = Number.isFinite(report?.verifiedCount) ? report.verifiedCount : 0;
  const failingCount = Number.isFinite(report?.failingCount) ? report.failingCount : 0;
  return {
    kind: 'real-export-readiness-report',
    target: 'docs/archive/phase5-real-export-readiness-report.json',
    ok: Boolean(report && verifiedCount > 0 && failingCount === 0),
    reportPath,
    verifiedCount,
    failingCount,
  };
}

export function buildProofNotesCheck(rootDir) {
  const notesPath = getProofNotesPath(rootDir);
  return {
    kind: 'proof-notes-template',
    target: 'docs/archive/phase5-proof-input/real-export-capture-notes.md',
    ok: fs.existsSync(notesPath),
    notesPath,
  };
}
