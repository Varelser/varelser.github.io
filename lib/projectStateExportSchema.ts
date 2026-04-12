import type { ProjectExportSchema } from '../types';
import {
  PROJECT_DATA_VERSION,
  PROJECT_FORMAT_ID,
  PROJECT_FORMAT_IDS,
  PROJECT_MANIFEST_SCHEMA_VERSION,
  PROJECT_SERIALIZATION_SCHEMA_VERSION,
} from './projectStateShared';

export function isKnownProjectFormatId(value: unknown): value is typeof PROJECT_FORMAT_IDS[number] {
  return typeof value === 'string' && PROJECT_FORMAT_IDS.includes(value as typeof PROJECT_FORMAT_IDS[number]);
}

export function buildProjectExportSchema(options?: {
  migrationState?: ProjectExportSchema['migrationState'];
  migratedFromProjectDataVersion?: number | null;
  projectDataVersion?: number;
  manifestSchemaVersion?: number;
  serializationSchemaVersion?: number;
}): ProjectExportSchema {
  return {
    format: PROJECT_FORMAT_ID,
    projectDataVersion: options?.projectDataVersion ?? PROJECT_DATA_VERSION,
    manifestSchemaVersion: options?.manifestSchemaVersion ?? PROJECT_MANIFEST_SCHEMA_VERSION,
    serializationSchemaVersion: options?.serializationSchemaVersion ?? PROJECT_SERIALIZATION_SCHEMA_VERSION,
    migrationState: options?.migrationState ?? 'native',
    migratedFromProjectDataVersion: options?.migratedFromProjectDataVersion ?? null,
  };
}
