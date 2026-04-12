import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export const PRESET_LIBRARY_VERSION = 1;
export const DEFAULT_BLEND_DURATION = 1.5;
export const PUBLIC_LIBRARY_PROVENANCE_VERSION = 1;
export const PUBLIC_LIBRARY_SOURCE_META_VERSION = 1;
export const PUBLIC_LIBRARY_SOURCE_META_KEY = '_publicLibrarySourceMeta';
export const DEFAULT_PUBLIC_LIBRARY_TARGET_PATH = 'public-library.json';
export const DEFAULT_PUBLIC_LIBRARY_SOURCE_PATH = 'exports/public-library/latest-export.json';
export const DEFAULT_PUBLIC_LIBRARY_PROVENANCE_PATH = 'public-library.provenance.json';

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeTimestamp(value) {
  return typeof value === 'string' && value.trim().length > 0
    ? value
    : new Date().toISOString();
}

function normalizeStringOrNull(value) {
  return typeof value === 'string' && value.trim().length > 0
    ? value
    : null;
}

function normalizeNotes(value, fallback = []) {
  return Array.isArray(value)
    ? value.filter((note) => typeof note === 'string' && note.trim().length > 0)
    : fallback;
}

function normalizePresetRecord(value) {
  if (!isObject(value)) return null;
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return null;

  return {
    id: value.id,
    name: value.name,
    config: isObject(value.config) ? value.config : {},
    createdAt: normalizeTimestamp(value.createdAt),
    updatedAt: normalizeTimestamp(value.updatedAt),
  };
}

function normalizeSequenceItem(value, validPresetIds) {
  if (!isObject(value)) return null;
  if (typeof value.id !== 'string' || typeof value.presetId !== 'string') return null;
  if (!validPresetIds.has(value.presetId)) return null;

  return {
    id: value.id,
    presetId: value.presetId,
    label: typeof value.label === 'string' && value.label.trim().length > 0 ? value.label : 'Keyframe',
    holdSeconds: typeof value.holdSeconds === 'number' ? Math.max(0.2, value.holdSeconds) : 2,
    transitionSeconds: typeof value.transitionSeconds === 'number' ? Math.max(0.05, value.transitionSeconds) : DEFAULT_BLEND_DURATION,
    transitionEasing: value.transitionEasing === 'linear' || value.transitionEasing === 'ease-in' || value.transitionEasing === 'ease-out' || value.transitionEasing === 'ease-in-out'
      ? value.transitionEasing
      : 'ease-in-out',
    screenSequenceDriveMode: value.screenSequenceDriveMode === 'inherit' || value.screenSequenceDriveMode === 'on' || value.screenSequenceDriveMode === 'off'
      ? value.screenSequenceDriveMode
      : 'inherit',
    screenSequenceDriveStrengthMode: value.screenSequenceDriveStrengthMode === 'inherit' || value.screenSequenceDriveStrengthMode === 'override'
      ? value.screenSequenceDriveStrengthMode
      : 'inherit',
    screenSequenceDriveStrengthOverride: typeof value.screenSequenceDriveStrengthOverride === 'number'
      ? Math.max(0, Math.min(1.5, value.screenSequenceDriveStrengthOverride))
      : null,
    screenSequenceDriveMultiplier: typeof value.screenSequenceDriveMultiplier === 'number'
      ? Math.max(0, Math.min(2, value.screenSequenceDriveMultiplier))
      : 1,
    keyframeConfig: isObject(value.keyframeConfig) ? value.keyframeConfig : null,
  };
}

export function createDefaultPublicLibrarySourceMeta(overrides = {}) {
  return {
    version: PUBLIC_LIBRARY_SOURCE_META_VERSION,
    sourceKind: overrides.sourceKind === 'private-export' || overrides.sourceKind === 'canonical-export' || overrides.sourceKind === 'canonical-bootstrap'
      ? overrides.sourceKind
      : 'canonical-export',
    exportOrigin: normalizeStringOrNull(overrides.exportOrigin) ?? 'unknown',
    exportTool: normalizeStringOrNull(overrides.exportTool),
    exportedAt: normalizeTimestamp(overrides.exportedAt),
    notes: normalizeNotes(overrides.notes),
  };
}

export function normalizePublicLibrarySourceMeta(payload) {
  if (!isObject(payload)) {
    return null;
  }

  const fallback = createDefaultPublicLibrarySourceMeta();

  return {
    version: typeof payload.version === 'number' ? payload.version : fallback.version,
    sourceKind: payload.sourceKind === 'private-export' || payload.sourceKind === 'canonical-export' || payload.sourceKind === 'canonical-bootstrap'
      ? payload.sourceKind
      : fallback.sourceKind,
    exportOrigin: normalizeStringOrNull(payload.exportOrigin) ?? fallback.exportOrigin,
    exportTool: normalizeStringOrNull(payload.exportTool),
    exportedAt: normalizeTimestamp(payload.exportedAt),
    notes: normalizeNotes(payload.notes),
  };
}

export function extractPublicLibrarySourceMeta(payload) {
  if (!isObject(payload) || !isObject(payload[PUBLIC_LIBRARY_SOURCE_META_KEY])) {
    return null;
  }

  return normalizePublicLibrarySourceMeta(payload[PUBLIC_LIBRARY_SOURCE_META_KEY]);
}

export function stripPublicLibrarySourceMeta(payload) {
  if (!isObject(payload) || !(PUBLIC_LIBRARY_SOURCE_META_KEY in payload)) {
    return payload;
  }

  const next = { ...payload };
  delete next[PUBLIC_LIBRARY_SOURCE_META_KEY];
  return next;
}

export function attachPublicLibrarySourceMeta(payload, sourceMeta) {
  const normalizedPayload = normalizeLibraryPayload(stripPublicLibrarySourceMeta(payload));
  const normalizedSourceMeta = normalizePublicLibrarySourceMeta(sourceMeta);
  if (!normalizedSourceMeta) {
    return normalizedPayload;
  }

  return {
    ...normalizedPayload,
    [PUBLIC_LIBRARY_SOURCE_META_KEY]: normalizedSourceMeta,
  };
}

function normalizeLastSync(value) {
  if (!isObject(value)) return null;

  return {
    sourcePath: normalizeStringOrNull(value.sourcePath),
    targetPath: normalizeStringOrNull(value.targetPath) ?? DEFAULT_PUBLIC_LIBRARY_TARGET_PATH,
    syncedAt: normalizeTimestamp(value.syncedAt),
    sourceSha256: normalizeStringOrNull(value.sourceSha256),
    targetSha256: normalizeStringOrNull(value.targetSha256),
    sourceMatchedCanonical: value.sourceMatchedCanonical === true,
    sourceEmbeddedProvenancePresent: value.sourceEmbeddedProvenancePresent === true,
    sourceEmbeddedProvenance: normalizePublicLibrarySourceMeta(value.sourceEmbeddedProvenance),
  };
}

export function createDefaultPublicLibraryProvenance() {
  return {
    version: PUBLIC_LIBRARY_PROVENANCE_VERSION,
    bundledTargetPath: DEFAULT_PUBLIC_LIBRARY_TARGET_PATH,
    canonicalSourcePath: DEFAULT_PUBLIC_LIBRARY_SOURCE_PATH,
    canonicalSourcePolicy: 'repo-relative',
    canonicalSourceCommitPolicy: 'ignored-local-default',
    canonicalSourceBootstrapPolicy: 'bootstrap-from-bundled-target',
    sourceEmbeddedProvenancePolicy: 'allowed-and-copied-to-last-sync',
    notes: [
      'Place the private export JSON at exports/public-library/latest-export.json when you want a repo-local canonical source.',
      'Use npm run sync:public-library with no args to sync from that canonical source path.',
      'If the canonical source file is missing, bootstrap it from the bundled target with npm run bootstrap:public-library-source.',
      'public-library.json remains a generated bundled target and should not be edited by hand.',
      'The canonical source JSON is ignored by default and is not meant to be committed on every change.',
      'When the source JSON embeds _publicLibrarySourceMeta, sync copies that metadata into public-library.provenance.json lastSync.',
    ],
    lastSync: null,
  };
}

export function normalizePublicLibraryProvenance(payload) {
  const fallback = createDefaultPublicLibraryProvenance();

  if (!isObject(payload)) {
    return fallback;
  }

  return {
    version: typeof payload.version === 'number' ? payload.version : fallback.version,
    bundledTargetPath: normalizeStringOrNull(payload.bundledTargetPath) ?? fallback.bundledTargetPath,
    canonicalSourcePath: normalizeStringOrNull(payload.canonicalSourcePath) ?? fallback.canonicalSourcePath,
    canonicalSourcePolicy: payload.canonicalSourcePolicy === 'repo-relative'
      ? payload.canonicalSourcePolicy
      : fallback.canonicalSourcePolicy,
    canonicalSourceCommitPolicy: payload.canonicalSourceCommitPolicy === 'ignored-local-default' || payload.canonicalSourceCommitPolicy === 'committed-canonical'
      ? payload.canonicalSourceCommitPolicy
      : fallback.canonicalSourceCommitPolicy,
    canonicalSourceBootstrapPolicy: payload.canonicalSourceBootstrapPolicy === 'bootstrap-from-bundled-target' || payload.canonicalSourceBootstrapPolicy === 'manual-copy-only'
      ? payload.canonicalSourceBootstrapPolicy
      : fallback.canonicalSourceBootstrapPolicy,
    sourceEmbeddedProvenancePolicy: payload.sourceEmbeddedProvenancePolicy === 'allowed-and-copied-to-last-sync' || payload.sourceEmbeddedProvenancePolicy === 'forbidden'
      ? payload.sourceEmbeddedProvenancePolicy
      : fallback.sourceEmbeddedProvenancePolicy,
    notes: normalizeNotes(payload.notes, fallback.notes),
    lastSync: normalizeLastSync(payload.lastSync),
  };
}

export function normalizeLibraryPayload(payload) {
  if (!isObject(payload)) {
    throw new Error('Library payload must be a JSON object.');
  }

  const sanitizedPayload = stripPublicLibrarySourceMeta(payload);

  if (!Array.isArray(sanitizedPayload.presets)) {
    throw new Error('Library payload must include a presets array.');
  }

  if (!Array.isArray(sanitizedPayload.presetSequence)) {
    throw new Error('Library payload must include a presetSequence array.');
  }

  const presets = sanitizedPayload.presets
    .map(normalizePresetRecord)
    .filter(Boolean);

  const presetIds = new Set(presets.map((preset) => preset.id));
  const presetSequence = sanitizedPayload.presetSequence
    .map((item) => normalizeSequenceItem(item, presetIds))
    .filter(Boolean);

  const activePresetId = typeof sanitizedPayload.activePresetId === 'string' && presetIds.has(sanitizedPayload.activePresetId)
    ? sanitizedPayload.activePresetId
    : presets[0]?.id ?? null;

  return {
    version: typeof sanitizedPayload.version === 'number' ? sanitizedPayload.version : PRESET_LIBRARY_VERSION,
    exportedAt: normalizeTimestamp(sanitizedPayload.exportedAt),
    currentConfig: isObject(sanitizedPayload.currentConfig) ? sanitizedPayload.currentConfig : {},
    activePresetId,
    presetBlendDuration: typeof sanitizedPayload.presetBlendDuration === 'number'
      ? Math.max(0.2, sanitizedPayload.presetBlendDuration)
      : DEFAULT_BLEND_DURATION,
    sequenceLoopEnabled: typeof sanitizedPayload.sequenceLoopEnabled === 'boolean' ? sanitizedPayload.sequenceLoopEnabled : true,
    presets,
    presetSequence,
  };
}

export function createLibrarySummary(payload, filePath) {
  return {
    target: filePath,
    version: payload.version,
    exportedAt: payload.exportedAt,
    presets: payload.presets.length,
    sequenceSteps: payload.presetSequence.length,
    activePresetId: payload.activePresetId,
    currentConfigKeys: Object.keys(payload.currentConfig ?? {}).length,
    presetIdsSample: payload.presets.slice(0, 5).map((preset) => preset.id),
  };
}

export function createPublicLibrarySourceSummary(provenance, workspaceRoot, options = {}) {
  const provenancePath = options.provenancePath ?? DEFAULT_PUBLIC_LIBRARY_PROVENANCE_PATH;
  const canonicalPath = path.resolve(workspaceRoot, provenance.canonicalSourcePath);
  const bundledPath = path.resolve(workspaceRoot, provenance.bundledTargetPath);

  return {
    provenanceFile: path.relative(workspaceRoot, provenancePath),
    bundledTargetPath: path.relative(workspaceRoot, bundledPath),
    canonicalSourcePath: path.relative(workspaceRoot, canonicalPath),
    canonicalSourcePolicy: provenance.canonicalSourcePolicy,
    canonicalSourceCommitPolicy: provenance.canonicalSourceCommitPolicy,
    canonicalSourceBootstrapPolicy: provenance.canonicalSourceBootstrapPolicy,
    sourceEmbeddedProvenancePolicy: provenance.sourceEmbeddedProvenancePolicy,
    reservedSourceMetaKey: PUBLIC_LIBRARY_SOURCE_META_KEY,
    notes: provenance.notes,
    lastSync: provenance.lastSync,
  };
}

export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function computeFileSha256(filePath) {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export async function readLibraryFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export async function readNormalizedLibraryFile(filePath) {
  const parsed = await readLibraryFile(filePath);
  return normalizeLibraryPayload(parsed);
}

export async function writeJsonFile(filePath, payload) {
  const output = `${JSON.stringify(payload, null, 2)}\n`;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, output, 'utf8');
  return output;
}

export async function writeNormalizedLibraryFile(filePath, payload) {
  const normalized = normalizeLibraryPayload(payload);
  await writeJsonFile(filePath, normalized);
  return normalized;
}

export async function writeCanonicalSourceLibraryFile(filePath, payload, sourceMeta) {
  const sourcePayload = attachPublicLibrarySourceMeta(payload, sourceMeta);
  await writeJsonFile(filePath, sourcePayload);
  return sourcePayload;
}

export async function readPublicLibraryProvenanceFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return normalizePublicLibraryProvenance(JSON.parse(raw));
}

export async function readOrCreatePublicLibraryProvenanceFile(filePath) {
  if (await pathExists(filePath)) {
    return readPublicLibraryProvenanceFile(filePath);
  }

  const payload = createDefaultPublicLibraryProvenance();
  await writePublicLibraryProvenanceFile(filePath, payload);
  return payload;
}

export async function writePublicLibraryProvenanceFile(filePath, payload) {
  const normalized = normalizePublicLibraryProvenance(payload);
  await writeJsonFile(filePath, normalized);
  return normalized;
}
