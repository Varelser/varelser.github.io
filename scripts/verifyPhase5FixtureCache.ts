import type { ProjectData } from '../types';
import { parseProjectData } from './phase5VerificationProjectCore';
import {
  createDuplicateIdsInvalidActiveFixturePayload,
  createLegacyV24FixturePayload,
  createNativeRichFixturePayload,
  createOrphanSequenceFixturePayload,
  createSparseLayer2FixturePayload,
} from './projectPhase5Fixtures';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function parseFixtureOrThrow(factory: () => Record<string, unknown>, id: string): ProjectData {
  const parsed = parseProjectData(factory());
  if (!parsed) {
    throw new Error(`[${id}] parseProjectData returned null while building verify cache`);
  }
  return parsed;
}

const nativeRichPayload = createNativeRichFixturePayload();
const sparseLayer2Payload = createSparseLayer2FixturePayload();
const legacyV24Payload = createLegacyV24FixturePayload();
const duplicateIdsInvalidActivePayload = createDuplicateIdsInvalidActiveFixturePayload();
const orphanSequencePayload = createOrphanSequenceFixturePayload();

const parsedNativeRichProject = parseFixtureOrThrow(createNativeRichFixturePayload, 'native-rich');
const parsedSparseLayer2Project = parseFixtureOrThrow(createSparseLayer2FixturePayload, 'sparse-layer2-custom');
const parsedLegacyV24Project = parseFixtureOrThrow(createLegacyV24FixturePayload, 'legacy-v24');
const parsedDuplicateIdsInvalidActiveProject = parseFixtureOrThrow(createDuplicateIdsInvalidActiveFixturePayload, 'duplicate-ids-invalid-active');
const parsedOrphanSequenceProject = parseFixtureOrThrow(createOrphanSequenceFixturePayload, 'orphan-sequence');

export function getNativeRichFixturePayloadClone() {
  return clone(nativeRichPayload);
}

export function getSparseLayer2FixturePayloadClone() {
  return clone(sparseLayer2Payload);
}

export function getLegacyV24FixturePayloadClone() {
  return clone(legacyV24Payload);
}

export function getDuplicateIdsInvalidActiveFixturePayloadClone() {
  return clone(duplicateIdsInvalidActivePayload);
}

export function getOrphanSequenceFixturePayloadClone() {
  return clone(orphanSequencePayload);
}

export function getParsedNativeRichProjectClone() {
  return clone(parsedNativeRichProject);
}

export function getParsedSparseLayer2ProjectClone() {
  return clone(parsedSparseLayer2Project);
}

export function getParsedLegacyV24ProjectClone() {
  return clone(parsedLegacyV24Project);
}

export function getParsedDuplicateIdsInvalidActiveProjectClone() {
  return clone(parsedDuplicateIdsInvalidActiveProject);
}

export function getParsedOrphanSequenceProjectClone() {
  return clone(parsedOrphanSequenceProject);
}
