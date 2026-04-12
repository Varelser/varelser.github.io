import fs from 'node:fs';
import path from 'node:path';

export function getIntelMacLiveBrowserProofDropDir(rootDir = process.cwd()) {
  return path.resolve(rootDir, 'exports/intel-mac-live-browser-proof-drop');
}

export function getIntelMacLiveBrowserProofFixtureDir(rootDir = process.cwd(), sourceDir = getIntelMacLiveBrowserProofDropDir(rootDir)) {
  return path.resolve(sourceDir, 'real-export');
}


export function getIntelMacLiveBrowserProofIncomingDir(rootDir = process.cwd(), sourceDir = getIntelMacLiveBrowserProofDropDir(rootDir)) {
  return path.resolve(sourceDir, 'incoming');
}

export function listIntelMacLiveBrowserProofBundles(rootDir = process.cwd(), sourceDir = getIntelMacLiveBrowserProofDropDir(rootDir)) {
  const incomingDir = getIntelMacLiveBrowserProofIncomingDir(rootDir, sourceDir);
  if (!fs.existsSync(incomingDir) || !fs.statSync(incomingDir).isDirectory()) return [];
  return fs.readdirSync(incomingDir)
    .filter((name) => /\.zip$/i.test(name))
    .sort();
}

export function getIntelMacLiveBrowserProofInputDir(rootDir = process.cwd(), sourceDir = getIntelMacLiveBrowserProofDropDir(rootDir)) {
  return path.resolve(sourceDir, 'phase5-proof-input');
}

export function getIntelMacLiveBrowserProofNotesPath(rootDir = process.cwd(), sourceDir = getIntelMacLiveBrowserProofDropDir(rootDir)) {
  return path.resolve(getIntelMacLiveBrowserProofInputDir(rootDir, sourceDir), 'real-export-capture-notes.md');
}

export function listIntelMacLiveBrowserProofFixtures(rootDir = process.cwd(), sourceDir = getIntelMacLiveBrowserProofDropDir(rootDir)) {
  const fixtureDir = getIntelMacLiveBrowserProofFixtureDir(rootDir, sourceDir);
  if (!fs.existsSync(fixtureDir) || !fs.statSync(fixtureDir).isDirectory()) return [];
  return fs.readdirSync(fixtureDir)
    .filter((name) => /^kalokagathia-project-.+\.json$/i.test(name))
    .sort();
}

export function listIntelMacLiveBrowserProofFiles(rootDir = process.cwd(), sourceDir = getIntelMacLiveBrowserProofDropDir(rootDir)) {
  const proofDir = getIntelMacLiveBrowserProofInputDir(rootDir, sourceDir);
  if (!fs.existsSync(proofDir) || !fs.statSync(proofDir).isDirectory()) return [];
  const out = [];
  const stack = [proofDir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolutePath);
      } else if (entry.isFile() && /\.(md|log|txt|json)$/i.test(entry.name)) {
        out.push(path.relative(proofDir, absolutePath).replace(/\\/g, '/'));
      }
    }
  }
  return out.sort();
}

export function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

const asRecord = (value) => (value && typeof value === 'object' ? value : null);
const asArray = (value) => (Array.isArray(value) ? value : []);
const nonEmptyString = (value) => (typeof value === 'string' && value.trim() ? value.trim() : '');

export function getIntelMacLiveBrowserProofSummaryPath(rootDir = process.cwd(), sourceDir = getIntelMacLiveBrowserProofDropDir(rootDir)) {
  return path.resolve(getIntelMacLiveBrowserProofInputDir(rootDir, sourceDir), 'real-export-proof.json');
}

export function parseIntelMacLiveBrowserProofNotes(content) {
  const parsed = {
    host: '',
    browserExecutablePath: '',
    exportTimestamp: '',
    sourceProjectSlug: '',
    browserVersion: '',
    notes: '',
  };
  if (typeof content !== 'string' || !content.trim()) return parsed;
  const lines = content.split(/\r?\n/);
  let inNotes = false;
  const noteLines = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (inNotes) noteLines.push('');
      continue;
    }
    const match = /^-\s*([^:]+):\s*(.*)$/.exec(line);
    if (!match) {
      if (inNotes) noteLines.push(line);
      continue;
    }
    const key = match[1].trim().toLowerCase();
    const value = match[2].trim();
    if (key === 'notes') {
      inNotes = true;
      if (value) noteLines.push(value);
      continue;
    }
    if (key === 'host') parsed.host = value;
    if (key === 'browser executable path') parsed.browserExecutablePath = value;
    if (key === 'export timestamp') parsed.exportTimestamp = value;
    if (key === 'source project state slug') parsed.sourceProjectSlug = value;
    if (key === 'browser version') parsed.browserVersion = value;
  }
  parsed.notes = noteLines.join('\n').trim();
  return parsed;
}

export function readIntelMacLiveBrowserProofNotes(rootDir = process.cwd(), sourceDir = getIntelMacLiveBrowserProofDropDir(rootDir)) {
  const notesPath = getIntelMacLiveBrowserProofNotesPath(rootDir, sourceDir);
  if (!fs.existsSync(notesPath)) {
    return { path: notesPath, exists: false, raw: '', parsed: parseIntelMacLiveBrowserProofNotes('') };
  }
  const raw = fs.readFileSync(notesPath, 'utf8');
  return { path: notesPath, exists: true, raw, parsed: parseIntelMacLiveBrowserProofNotes(raw) };
}

export function validateLiveBrowserProofSummaryPayload(payload, fileName = 'real-export-proof.json') {
  const errors = [];
  const summary = asRecord(payload);
  if (!summary) {
    return { fileName, ok: false, errors: ['payload is not an object'], metadata: null };
  }

  const capture = asRecord(summary.capture);
  const browser = asRecord(summary.browser);
  const artifacts = asRecord(summary.artifacts);
  const screenshots = asArray(artifacts?.screenshots);
  const logs = asArray(artifacts?.logs);
  const exports_ = asArray(artifacts?.exports);
  const status = nonEmptyString(summary.status);
  const capturedAt = nonEmptyString(capture?.capturedAt);
  const hostPlatform = nonEmptyString(capture?.hostPlatform);
  const hostArch = nonEmptyString(capture?.hostArch);
  const browserName = nonEmptyString(browser?.name);
  const executablePath = nonEmptyString(browser?.executablePath);

  if (!['pending','captured'].includes(status)) errors.push('status must be pending or captured');
  if (status === 'captured') {
    if (!capturedAt) errors.push('capture.capturedAt is missing');
    if (hostPlatform !== 'darwin') errors.push(`capture.hostPlatform must be darwin (got ${hostPlatform || 'empty'})`);
    if (hostArch !== 'x64') errors.push(`capture.hostArch must be x64 (got ${hostArch || 'empty'})`);
    if (!browserName) errors.push('browser.name is missing');
    if (!executablePath) errors.push('browser.executablePath is missing');
    if (screenshots.length === 0) errors.push('artifacts.screenshots is empty');
    if (logs.length === 0) errors.push('artifacts.logs is empty');
    if (exports_.length === 0) errors.push('artifacts.exports is empty');
  }

  return {
    fileName,
    ok: errors.length === 0 && status === 'captured',
    errors,
    metadata: {
      status: status || null,
      capturedAt: capturedAt || null,
      hostPlatform: hostPlatform || null,
      hostArch: hostArch || null,
      browserName: browserName || null,
      executablePath: executablePath || null,
      screenshotCount: screenshots.length,
      logCount: logs.length,
      exportCount: exports_.length,
    },
  };
}

const normalizeRelativeArtifactPath = (value) => {
  if (typeof value !== 'string') return '';
  const normalized = value.trim().replace(/\\/g, '/');
  if (!normalized || normalized.startsWith('../')) return '';
  return normalized.replace(/^\.\//, '');
};

function inspectListedArtifacts(baseDir, listedPaths) {
  const inspected = [];
  for (const item of listedPaths) {
    const relativePath = normalizeRelativeArtifactPath(item);
    const absolutePath = path.isAbsolute(item) ? item : path.resolve(baseDir, relativePath || item);
    inspected.push({
      listedPath: item,
      relativePath: relativePath || null,
      exists: fs.existsSync(absolutePath),
      absolutePath,
    });
  }
  return inspected;
}

export function inspectLiveBrowserProofSummaryFile(filePath, sourceDir = null) {
  const fileName = path.basename(filePath);
  if (!fs.existsSync(filePath)) {
    return { fileName, ok: false, parsed: false, errors: ['file missing'], metadata: null, artifacts: null };
  }
  try {
    const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const result = validateLiveBrowserProofSummaryPayload(payload, fileName);
    const baseDir = sourceDir ? path.resolve(sourceDir) : path.resolve(path.dirname(filePath), '..');
    const screenshots = inspectListedArtifacts(baseDir, payload?.artifacts?.screenshots ?? []);
    const logs = inspectListedArtifacts(baseDir, payload?.artifacts?.logs ?? []);
    const exports_ = inspectListedArtifacts(baseDir, payload?.artifacts?.exports ?? []);
    const artifactChecks = [...screenshots, ...logs, ...exports_];
    const missingArtifactPaths = artifactChecks.filter((item) => !item.exists).map((item) => item.listedPath);
    const missingArtifactCount = missingArtifactPaths.length;
    const sourceProjectSlug = typeof payload?.capture?.sourceProjectSlug === 'string' ? payload.capture.sourceProjectSlug.trim() : '';
    const exportFileNames = exports_.map((item) => path.basename(item.relativePath || item.listedPath));
    const slugLinked = !sourceProjectSlug
      ? false
      : exportFileNames.some((name) => name === `kalokagathia-project-${sourceProjectSlug}.json`);
    const errors = [...result.errors];
    if ((result.metadata?.status ?? null) === 'captured') {
      if (!sourceProjectSlug) errors.push('capture.sourceProjectSlug is missing');
      if (missingArtifactCount > 0) errors.push(`listed artifact paths missing: ${missingArtifactPaths.join(', ')}`);
      if (sourceProjectSlug && !slugLinked) errors.push(`capture.sourceProjectSlug does not match listed export artifact (${sourceProjectSlug})`);
    }
    return {
      ...result,
      ok: errors.length === 0 && (result.metadata?.status ?? null) === 'captured',
      errors,
      parsed: true,
      artifacts: { screenshots, logs, exports: exports_ },
      metadata: {
        ...result.metadata,
        sourceProjectSlug: sourceProjectSlug || null,
        missingArtifactCount,
        slugLinked,
      },
    };
  } catch (error) {
    return {
      fileName,
      ok: false,
      parsed: false,
      errors: [error instanceof Error ? error.message : 'invalid json'],
      metadata: null,
      artifacts: null,
    };
  }
}

export function validateRealExportFixturePayload(payload, fileName = '<unknown>') {
  const errors = [];
  const project = asRecord(payload);
  if (!project) {
    errors.push('payload is not an object');
    return { fileName, ok: false, errors, metadata: null };
  }

  const schema = asRecord(project.schema);
  const manifest = asRecord(project.manifest);
  const serialization = asRecord(project.serialization);
  const presets = asArray(project.presets);
  const presetSequence = asArray(project.presetSequence);
  const execution = asArray(manifest?.execution);
  const layers = asArray(serialization?.layers);
  const projectName = typeof project.name === 'string' ? project.name.trim() : '';
  const format = typeof schema?.format === 'string' ? schema.format : '';
  const projectDataVersion = typeof schema?.projectDataVersion === 'number'
    ? schema.projectDataVersion
    : (typeof project.version === 'number' ? project.version : 0);
  const manifestSchemaVersion = typeof schema?.manifestSchemaVersion === 'number' ? schema.manifestSchemaVersion : 0;
  const serializationSchemaVersion = typeof schema?.serializationSchemaVersion === 'number' ? schema.serializationSchemaVersion : 0;

  if (!projectName) errors.push('project.name is missing');
  if (format !== 'kalokagathia-project') errors.push(`schema.format must be kalokagathia-project (got ${format || 'empty'})`);
  if (!(projectDataVersion > 0)) errors.push('schema.projectDataVersion is missing or invalid');
  if (!(manifestSchemaVersion > 0)) errors.push('schema.manifestSchemaVersion is missing or invalid');
  if (!(serializationSchemaVersion > 0)) errors.push('schema.serializationSchemaVersion is missing or invalid');
  if (presets.length === 0) errors.push('presets is empty');
  if (presetSequence.length === 0) errors.push('presetSequence is empty');
  if (execution.length === 0) errors.push('manifest.execution is empty');
  if (layers.length === 0) errors.push('serialization.layers is empty');

  return {
    fileName,
    ok: errors.length === 0,
    errors,
    metadata: {
      projectName,
      projectDataVersion,
      manifestSchemaVersion,
      serializationSchemaVersion,
      presetCount: presets.length,
      sequenceCount: presetSequence.length,
      executionCount: execution.length,
      serializationLayerCount: layers.length,
    },
  };
}

export function inspectRealExportFixtureFile(filePath) {
  const fileName = path.basename(filePath);
  if (!fs.existsSync(filePath)) {
    return { fileName, ok: false, errors: ['file missing'], metadata: null, parsed: false };
  }
  try {
    const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const result = validateRealExportFixturePayload(payload, fileName);
    return { ...result, parsed: true };
  } catch (error) {
    return {
      fileName,
      ok: false,
      parsed: false,
      errors: [error instanceof Error ? error.message : 'invalid json'],
      metadata: null,
    };
  }
}
