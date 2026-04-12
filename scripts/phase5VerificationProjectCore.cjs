const fs = require('node:fs');
const path = require('node:path');

const FIXTURE_PATH = path.join(__dirname, '..', 'fixtures', 'project-state', 'phase5-native-rich.json');
const NATIVE_FIXTURE = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));
const NATIVE_SCHEMA = NATIVE_FIXTURE.schema || {};
const NATIVE_UI = NATIVE_FIXTURE.ui || {};
const NATIVE_SERIALIZATION = NATIVE_FIXTURE.serialization || { schemaVersion: 1, layers: [] };
const NATIVE_MANIFEST = NATIVE_FIXTURE.manifest || { schemaVersion: 1, serializationSchemaVersion: 1, layers: [], execution: [], stats: {} };
const BLOCK_KEYS = ['source', 'simulation', 'primitive', 'shading', 'postfx', 'execution'];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function uniqueStrings(values) {
  const result = [];
  const seen = new Set();
  for (const value of values) {
    if (typeof value !== 'string' || value.length === 0 || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

function normalizePresetRecord(preset) {
  return {
    id: typeof preset?.id === 'string' ? preset.id : '',
    name: typeof preset?.name === 'string' && preset.name.trim().length > 0 ? preset.name : 'Untitled Preset',
    config: isPlainObject(preset?.config) ? clone(preset.config) : {},
    createdAt: typeof preset?.createdAt === 'string' ? preset.createdAt : (typeof preset?.updatedAt === 'string' ? preset.updatedAt : NATIVE_FIXTURE.exportedAt),
    updatedAt: typeof preset?.updatedAt === 'string' ? preset.updatedAt : (typeof preset?.createdAt === 'string' ? preset.createdAt : NATIVE_FIXTURE.exportedAt),
  };
}

function normalizeSequenceItem(item) {
  return {
    id: typeof item?.id === 'string' ? item.id : '',
    presetId: typeof item?.presetId === 'string' ? item.presetId : '',
    label: typeof item?.label === 'string' && item.label.trim().length > 0 ? item.label : 'Keyframe',
    holdSeconds: typeof item?.holdSeconds === 'number' ? Math.max(0.2, item.holdSeconds) : 2,
    transitionSeconds: typeof item?.transitionSeconds === 'number' ? Math.max(0.05, item.transitionSeconds) : 1.5,
    transitionEasing: typeof item?.transitionEasing === 'string' ? item.transitionEasing : 'linear',
    screenSequenceDriveMode: typeof item?.screenSequenceDriveMode === 'string' ? item.screenSequenceDriveMode : 'inherit',
    screenSequenceDriveStrengthMode: typeof item?.screenSequenceDriveStrengthMode === 'string' ? item.screenSequenceDriveStrengthMode : 'inherit',
    screenSequenceDriveStrengthOverride: typeof item?.screenSequenceDriveStrengthOverride === 'number' ? item.screenSequenceDriveStrengthOverride : 1,
    screenSequenceDriveMultiplier: typeof item?.screenSequenceDriveMultiplier === 'number' ? item.screenSequenceDriveMultiplier : 1,
    keyframeConfig: isPlainObject(item?.keyframeConfig) ? clone(item.keyframeConfig) : null,
  };
}

function dedupeById(items) {
  const result = [];
  const seen = new Set();
  for (const item of items) {
    if (typeof item.id !== 'string' || item.id.length === 0 || seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
}

function mergeBlock(customBlock, fallbackBlock) {
  const fallbackValues = Array.isArray(fallbackBlock?.values) ? fallbackBlock.values : [];
  const customValues = Array.isArray(customBlock?.values) ? customBlock.values : [];
  return {
    id: typeof customBlock?.id === 'string' && customBlock.id.length > 0 ? customBlock.id : fallbackBlock.id,
    label: typeof customBlock?.label === 'string' && customBlock.label.length > 0 ? customBlock.label : fallbackBlock.label,
    values: uniqueStrings([...customValues, ...fallbackValues]),
  };
}

function normalizeSerializationLayers(serializationPayload) {
  const payloadLayers = Array.isArray(serializationPayload?.layers) ? serializationPayload.layers : [];
  const fallbackLayers = Array.isArray(NATIVE_SERIALIZATION.layers) ? NATIVE_SERIALIZATION.layers : [];
  return fallbackLayers.map((fallbackLayer) => {
    const matched = payloadLayers.find((layer) => isPlainObject(layer) && layer.key === fallbackLayer.key);
    const matchedBlocks = isPlainObject(matched?.blocks) ? matched.blocks : {};
    const fallbackBlocks = isPlainObject(fallbackLayer.blocks) ? fallbackLayer.blocks : {};
    const blocks = {};
    for (const key of BLOCK_KEYS) {
      blocks[key] = mergeBlock(matchedBlocks[key], fallbackBlocks[key]);
    }
    return {
      key: fallbackLayer.key,
      label: typeof matched?.label === 'string' && matched.label.length > 0 ? matched.label : fallbackLayer.label,
      modeId: typeof matched?.modeId === 'string' && matched.modeId.length > 0 ? matched.modeId : fallbackLayer.modeId,
      blocks,
    };
  });
}

function normalizeManifest(payloadManifest, presetCount, sequenceCount, sequenceLoopEnabled) {
  const fallback = clone(NATIVE_MANIFEST);
  const manifest = isPlainObject(payloadManifest) ? clone(payloadManifest) : fallback;
  manifest.schemaVersion = typeof manifest.schemaVersion === 'number' ? manifest.schemaVersion : (NATIVE_MANIFEST.schemaVersion || NATIVE_SCHEMA.manifestSchemaVersion || 1);
  manifest.serializationSchemaVersion = typeof manifest.serializationSchemaVersion === 'number'
    ? manifest.serializationSchemaVersion
    : (NATIVE_MANIFEST.serializationSchemaVersion || NATIVE_SCHEMA.serializationSchemaVersion || 1);
  manifest.layers = Array.isArray(manifest.layers) && manifest.layers.length > 0 ? manifest.layers : fallback.layers;
  manifest.execution = Array.isArray(manifest.execution) && manifest.execution.length > 0 ? manifest.execution : fallback.execution;
  manifest.futureNativeSpecialistPackets = Array.isArray(manifest.futureNativeSpecialistPackets) ? manifest.futureNativeSpecialistPackets : (fallback.futureNativeSpecialistPackets || []);
  manifest.futureNativeSpecialistRoutes = Array.isArray(manifest.futureNativeSpecialistRoutes) ? manifest.futureNativeSpecialistRoutes : (fallback.futureNativeSpecialistRoutes || []);
  manifest.stats = {
    ...(isPlainObject(fallback.stats) ? fallback.stats : {}),
    ...(isPlainObject(manifest.stats) ? manifest.stats : {}),
    presetCount,
    sequenceCount,
    sequenceLoopEnabled,
  };
  return manifest;
}

function buildProjectData(options) {
  const sequenceLoopEnabled = typeof options.sequenceLoopEnabled === 'boolean' ? options.sequenceLoopEnabled : true;
  const schema = {
    format: NATIVE_SCHEMA.format || 'kalokagathia-project',
    projectDataVersion: NATIVE_SCHEMA.projectDataVersion || options.version || 0,
    manifestSchemaVersion: NATIVE_SCHEMA.manifestSchemaVersion || 1,
    serializationSchemaVersion: NATIVE_SCHEMA.serializationSchemaVersion || 1,
    migrationState: 'native',
    migratedFromProjectDataVersion: null,
  };
  return {
    version: schema.projectDataVersion,
    schema,
    exportedAt: typeof options.exportedAt === 'string' ? options.exportedAt : new Date().toISOString(),
    name: typeof options.name === 'string' && options.name.trim().length > 0 ? options.name.trim() : 'Untitled Project',
    currentConfig: isPlainObject(options.config) ? clone(options.config) : {},
    activePresetId: typeof options.activePresetId === 'string' ? options.activePresetId : null,
    presetBlendDuration: typeof options.presetBlendDuration === 'number' ? options.presetBlendDuration : 1.5,
    sequenceLoopEnabled,
    presets: Array.isArray(options.presets) ? clone(options.presets) : [],
    presetSequence: Array.isArray(options.presetSequence) ? clone(options.presetSequence) : [],
    ui: isPlainObject(options.ui) ? clone(options.ui) : clone(NATIVE_UI),
    manifest: normalizeManifest(null, Array.isArray(options.presets) ? options.presets.length : 0, Array.isArray(options.presetSequence) ? options.presetSequence.length : 0, sequenceLoopEnabled),
    serialization: {
      schemaVersion: NATIVE_SCHEMA.serializationSchemaVersion || 1,
      layers: clone(NATIVE_SERIALIZATION.layers || []),
    },
  };
}

function parseProjectData(payload) {
  if (!isPlainObject(payload) || !Array.isArray(payload.presets) || !Array.isArray(payload.presetSequence)) return null;

  const presets = dedupeById(payload.presets.map(normalizePresetRecord));
  const presetIds = new Set(presets.map((preset) => preset.id));
  const presetSequence = dedupeById(payload.presetSequence.map(normalizeSequenceItem).filter((item) => presetIds.has(item.presetId)));
  const sequenceLoopEnabled = typeof payload.sequenceLoopEnabled === 'boolean' ? payload.sequenceLoopEnabled : true;
  const schemaPayload = isPlainObject(payload.schema) ? payload.schema : {};
  const existingVersion = typeof payload.version === 'number' ? payload.version : null;
  const isNative = schemaPayload.format === (NATIVE_SCHEMA.format || 'kalokagathia-project')
    && existingVersion === (NATIVE_SCHEMA.projectDataVersion || existingVersion)
    && typeof schemaPayload.projectDataVersion === 'number';
  const schema = {
    format: schemaPayload.format === (NATIVE_SCHEMA.format || 'kalokagathia-project') ? schemaPayload.format : (NATIVE_SCHEMA.format || 'kalokagathia-project'),
    projectDataVersion: typeof schemaPayload.projectDataVersion === 'number' ? schemaPayload.projectDataVersion : (existingVersion || NATIVE_SCHEMA.projectDataVersion || 0),
    manifestSchemaVersion: typeof schemaPayload.manifestSchemaVersion === 'number' ? schemaPayload.manifestSchemaVersion : (NATIVE_SCHEMA.manifestSchemaVersion || 1),
    serializationSchemaVersion: typeof schemaPayload.serializationSchemaVersion === 'number' ? schemaPayload.serializationSchemaVersion : (NATIVE_SCHEMA.serializationSchemaVersion || 1),
    migrationState: isNative ? 'native' : 'migrated',
    migratedFromProjectDataVersion: isNative ? null : existingVersion,
  };
  const serialization = {
    schemaVersion: typeof payload.serialization?.schemaVersion === 'number' ? payload.serialization.schemaVersion : schema.serializationSchemaVersion,
    layers: normalizeSerializationLayers(payload.serialization),
  };
  const manifest = normalizeManifest(payload.manifest, presets.length, presetSequence.length, sequenceLoopEnabled);
  return {
    version: schema.projectDataVersion,
    schema,
    exportedAt: typeof payload.exportedAt === 'string' ? payload.exportedAt : new Date().toISOString(),
    name: typeof payload.name === 'string' && payload.name.trim().length > 0 ? payload.name.trim() : 'Untitled Project',
    currentConfig: isPlainObject(payload.currentConfig) ? clone(payload.currentConfig) : {},
    activePresetId: typeof payload.activePresetId === 'string' ? payload.activePresetId : null,
    presetBlendDuration: typeof payload.presetBlendDuration === 'number' ? payload.presetBlendDuration : 1.5,
    sequenceLoopEnabled,
    presets,
    presetSequence,
    ui: isPlainObject(payload.ui) ? clone(payload.ui) : clone(NATIVE_UI),
    manifest,
    serialization,
  };
}

function serializeProjectData(project) {
  return JSON.stringify(project, null, 2);
}

function inspectProjectDataText(text) {
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return { parsed: null, errorCode: 'invalid-json', message: 'Invalid project JSON syntax.' };
  }
  const parsed = parseProjectData(payload);
  if (!parsed) {
    return {
      parsed: null,
      errorCode: 'invalid-project-payload',
      message: 'JSON parsed, but this file is not a supported project export.',
    };
  }
  return { parsed, errorCode: null, message: null };
}

function parseProjectDataText(text) {
  return inspectProjectDataText(text).parsed;
}

function buildProjectExportFileName(exportedAt = new Date().toISOString()) {
  return `kalokagathia-project-${exportedAt.replace(/[:.]/g, '-')}.json`;
}

function createProjectImportIdSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

function buildImportedId(baseId, createIdSuffix, usedIds) {
  let candidate = `${baseId}-import-${createIdSuffix()}`;
  while (usedIds.has(candidate)) {
    candidate = `${baseId}-import-${createIdSuffix()}`;
  }
  usedIds.add(candidate);
  return candidate;
}

function prepareImportedProjectData(parsed, options = {}) {
  const createIdSuffix = options.createIdSuffix || createProjectImportIdSuffix;
  const importMode = options.importMode || 'merge';
  const shouldReuseExistingIds = importMode === 'merge';
  const usedPresetIds = new Set(shouldReuseExistingIds && options.existingPresetIds ? Array.from(options.existingPresetIds) : []);
  let remappedPresetIdCount = 0;
  const importedPresets = parsed.presets.map((preset) => {
    if (!usedPresetIds.has(preset.id)) {
      usedPresetIds.add(preset.id);
      return preset;
    }
    remappedPresetIdCount += 1;
    return { ...preset, id: buildImportedId(preset.id, createIdSuffix, usedPresetIds) };
  });
  const presetIdRemap = new Map();
  parsed.presets.forEach((preset, index) => {
    if (!presetIdRemap.has(preset.id)) {
      presetIdRemap.set(preset.id, importedPresets[index] ? importedPresets[index].id : preset.id);
    }
  });
  const importedPresetIds = new Set(importedPresets.map((preset) => preset.id));
  const usedSequenceIds = new Set(shouldReuseExistingIds && options.existingSequenceIds ? Array.from(options.existingSequenceIds) : []);
  const sourcePresetIds = parsed.presets.map((preset) => preset.id);
  const sequenceIdRemap = new Map();
  const retainedSourceSequenceIds = [];
  const droppedOrphanSequenceIds = [];
  let regeneratedSequenceIdCount = 0;
  let droppedOrphanSequenceCount = 0;
  const importedSequence = parsed.presetSequence.map((item) => {
    const remappedPresetId = presetIdRemap.get(item.presetId) || item.presetId;
    if (!importedPresetIds.has(remappedPresetId)) {
      droppedOrphanSequenceCount += 1;
      droppedOrphanSequenceIds.push(item.id);
      return null;
    }
    const sequenceId = usedSequenceIds.has(item.id)
      ? (() => {
          regeneratedSequenceIdCount += 1;
          return buildImportedId(item.id, createIdSuffix, usedSequenceIds);
        })()
      : (usedSequenceIds.add(item.id), item.id);
    if (!sequenceIdRemap.has(item.id)) sequenceIdRemap.set(item.id, sequenceId);
    if (sequenceId === item.id) retainedSourceSequenceIds.push(item.id);
    return { ...item, id: sequenceId, presetId: remappedPresetId };
  }).filter(Boolean);
  const explicitActivePresetId = parsed.activePresetId ? (presetIdRemap.get(parsed.activePresetId) || parsed.activePresetId) : null;
  const remappedActivePresetId = explicitActivePresetId && importedPresetIds.has(explicitActivePresetId)
    ? explicitActivePresetId
    : (importedPresets[0] ? importedPresets[0].id : null);
  const activePresetFallbackApplied = remappedActivePresetId !== explicitActivePresetId;
  const rebuiltProject = buildProjectData({
    name: parsed.name,
    config: parsed.currentConfig,
    activePresetId: remappedActivePresetId,
    presetBlendDuration: parsed.presetBlendDuration,
    sequenceLoopEnabled: parsed.sequenceLoopEnabled,
    presets: importedPresets,
    presetSequence: importedSequence,
    ui: parsed.ui,
    exportedAt: parsed.exportedAt,
  });
  const project = {
    ...rebuiltProject,
    schema: {
      ...rebuiltProject.schema,
      migrationState: parsed.schema.migrationState,
      migratedFromProjectDataVersion: parsed.schema.migratedFromProjectDataVersion,
    },
  };
  return {
    project,
    importedPresets,
    importedSequence,
    remappedActivePresetId,
    presetIdRemap,
    sequenceIdRemap,
    sourcePresetIds,
    retainedSourceSequenceIds,
    droppedOrphanSequenceIds,
    diagnostics: {
      remappedPresetIdCount,
      regeneratedSequenceIdCount,
      droppedOrphanSequenceCount,
      activePresetFallbackApplied,
    },
  };
}

function buildProjectImportDiagnosticsSuffix(diagnostics) {
  if (!diagnostics) return '';
  const parts = [];
  if (diagnostics.remappedPresetIdCount > 0) parts.push(`${diagnostics.remappedPresetIdCount} preset IDs remapped`);
  if (diagnostics.regeneratedSequenceIdCount > 0) parts.push(`${diagnostics.regeneratedSequenceIdCount} sequence IDs regenerated`);
  if (diagnostics.droppedOrphanSequenceCount > 0) parts.push(`${diagnostics.droppedOrphanSequenceCount} orphan sequence steps dropped`);
  if (diagnostics.activePresetFallbackApplied) parts.push('active preset reset');
  return parts.length > 0 ? ` · ${parts.join(' · ')}` : '';
}

function stableCompare(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function compareSequenceTiming(left, right) {
  return left.holdSeconds === right.holdSeconds
    && left.transitionSeconds === right.transitionSeconds
    && left.transitionEasing === right.transitionEasing;
}

function compareSequenceDrive(left, right) {
  return left.screenSequenceDriveMode === right.screenSequenceDriveMode
    && left.screenSequenceDriveStrengthMode === right.screenSequenceDriveStrengthMode
    && left.screenSequenceDriveStrengthOverride === right.screenSequenceDriveStrengthOverride
    && left.screenSequenceDriveMultiplier === right.screenSequenceDriveMultiplier;
}

function buildProjectImportPreparationReport(prepared, sourceProject) {
  const presetIdChanges = sourceProject.presets.map((preset, index) => {
    const importedId = prepared.importedPresets[index] ? prepared.importedPresets[index].id : null;
    return { index, sourceId: preset.id, importedId, changed: importedId !== null && importedId !== preset.id };
  });
  const sequenceIdChanges = sourceProject.presetSequence.map((item, index) => {
    const imported = prepared.importedSequence[index] || null;
    const dropped = prepared.droppedOrphanSequenceIds.includes(item.id);
    return {
      index,
      sourceId: item.id,
      importedId: imported ? imported.id : null,
      changed: imported ? imported.id !== item.id : false,
      sourcePresetId: item.presetId,
      importedPresetId: imported ? imported.presetId : null,
      dropped,
    };
  });
  const presetContentChanges = sourceProject.presets.map((preset, index) => {
    const imported = prepared.importedPresets[index] || null;
    return {
      index,
      sourceId: preset.id,
      importedId: imported ? imported.id : null,
      nameChanged: imported ? imported.name !== preset.name : false,
      configChanged: imported ? !stableCompare(imported.config, preset.config) : false,
      timestampChanged: imported ? imported.createdAt !== preset.createdAt || imported.updatedAt !== preset.updatedAt : false,
    };
  });
  const sequenceContentChanges = sourceProject.presetSequence.map((item, index) => {
    const imported = prepared.importedSequence[index] || null;
    const dropped = prepared.droppedOrphanSequenceIds.includes(item.id);
    return {
      index,
      sourceId: item.id,
      importedId: imported ? imported.id : null,
      labelChanged: imported ? imported.label !== item.label : false,
      timingChanged: imported ? !compareSequenceTiming(imported, item) : false,
      driveChanged: imported ? !compareSequenceDrive(imported, item) : false,
      keyframeChanged: imported ? !stableCompare(imported.keyframeConfig, item.keyframeConfig) : false,
      presetReferenceChanged: imported ? imported.presetId !== item.presetId : false,
      dropped,
    };
  });
  return {
    presetIdChanges,
    sequenceIdChanges,
    presetContentChanges,
    sequenceContentChanges,
    droppedOrphanSequenceIds: [...prepared.droppedOrphanSequenceIds],
    summary: {
      presetIdChangedCount: presetIdChanges.filter((entry) => entry.changed).length,
      sequenceIdChangedCount: sequenceIdChanges.filter((entry) => entry.changed).length,
      droppedOrphanSequenceCount: prepared.droppedOrphanSequenceIds.length,
      retainedPresetIdCount: presetIdChanges.filter((entry) => !entry.changed && entry.importedId !== null).length,
      retainedSequenceIdCount: sequenceIdChanges.filter((entry) => !entry.changed && !entry.dropped && entry.importedId !== null).length,
      preservedPresetPayloadCount: presetContentChanges.filter((entry) => !entry.nameChanged && !entry.configChanged && !entry.timestampChanged && entry.importedId !== null).length,
      preservedSequencePayloadCount: sequenceContentChanges.filter((entry) => !entry.labelChanged && !entry.timingChanged && !entry.driveChanged && !entry.keyframeChanged && !entry.dropped && entry.importedId !== null).length,
      presetReferenceRemapCount: sequenceContentChanges.filter((entry) => entry.presetReferenceChanged && !entry.dropped).length,
    },
  };
}

function buildProjectImportNotice(project, importedPresetCount, diagnostics) {
  const migrationSuffix = project.schema.migrationState === 'migrated' && project.schema.migratedFromProjectDataVersion !== null
    ? ` · migrated from v${project.schema.migratedFromProjectDataVersion}`
    : '';
  return `Project loaded: ${importedPresetCount} presets restored (schema v${project.schema.projectDataVersion} / manifest v${project.schema.manifestSchemaVersion})${migrationSuffix}${buildProjectImportDiagnosticsSuffix(diagnostics)}.`;
}

module.exports = {
  parseProjectData,
  serializeProjectData,
  inspectProjectDataText,
  parseProjectDataText,
  buildProjectExportFileName,
  prepareImportedProjectData,
  buildProjectImportNotice,
  buildProjectImportPreparationReport,
};
