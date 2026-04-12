import type { ProjectData } from '../types';
import type {
  PreparedImportedProjectData,
  PrepareImportedProjectDataOptions,
  ProjectImportInspectionResult,
  ProjectImportPreparationDiagnostics,
  ProjectImportPreparationReport,
} from '../lib/projectTransferSharedTypes';

const core = require('./phase5VerificationProjectCore.cjs') as {
  parseProjectData: (payload: unknown) => ProjectData | null;
  serializeProjectData: (project: ProjectData) => string;
  inspectProjectDataText: (text: string) => ProjectImportInspectionResult;
  parseProjectDataText: (text: string) => ProjectData | null;
  buildProjectExportFileName: (exportedAt?: string) => string;
  prepareImportedProjectData: (parsed: ProjectData, options?: PrepareImportedProjectDataOptions) => PreparedImportedProjectData;
  buildProjectImportNotice: (project: ProjectData, importedPresetCount: number, diagnostics?: ProjectImportPreparationDiagnostics) => string;
  buildProjectImportPreparationReport: (prepared: PreparedImportedProjectData, sourceProject: ProjectData) => ProjectImportPreparationReport;
};

export const parseProjectData = core.parseProjectData;
export const serializeProjectData = core.serializeProjectData;
export const inspectProjectDataText = core.inspectProjectDataText;
export const parseProjectDataText = core.parseProjectDataText;
export const buildProjectExportFileName = core.buildProjectExportFileName;
export const prepareImportedProjectData = core.prepareImportedProjectData;
export const buildProjectImportNotice = core.buildProjectImportNotice;
export const buildProjectImportPreparationReport = core.buildProjectImportPreparationReport;
