import type { ProjectFutureNativeVolumetricAuthoringKey } from '../../types';

export interface VolumetricNumericFieldDescriptor<T extends object> {
  label: string;
  key: keyof T & string;
  digits?: number;
}

export interface VolumetricPresetPreviewBase {
  presetId: string;
  values: string[];
  focusValues: string[];
}

export interface VolumetricAuthoringEntryBase {
  key: ProjectFutureNativeVolumetricAuthoringKey;
  mode: string;
  familyId: string;
  bindingMode: string;
  primaryPresetId: string | null;
  recommendedPresetIds: string[];
  runtimeConfigValues: string[];
}

export interface FutureNativeProjectRouteProfile {
  routeId: string;
  presetId: string;
  mode: string;
  valueLines: string[];
}

export interface FutureNativeProjectRouteHighlight {
  familyId: string;
  profiles: FutureNativeProjectRouteProfile[];
  deltaLines: string[];
}

export interface VolumetricRouteDefinition {
  routeId: string;
  presetId: string;
  mode: string;
}
