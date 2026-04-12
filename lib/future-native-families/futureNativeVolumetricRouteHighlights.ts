import {
  buildVolumetricRouteHighlight,
} from './futureNativeVolumetricAuthoringShared';
import {
  getVolumetricFamilyUiSpecs,
  getVolumetricRouteHighlightSpec,
  type VolumetricRouteHighlightFamilyId,
} from './futureNativeVolumetricFamilyMetadata';
import type { FutureNativeProjectRouteHighlight } from './futureNativeVolumetricRouteTypes';

export function getVolumetricRouteHighlightFamilyIds(): VolumetricRouteHighlightFamilyId[] {
  return Array.from(new Set(getVolumetricFamilyUiSpecs().map((spec) => spec.familyId)));
}

export function buildProjectVolumetricRouteHighlights(): FutureNativeProjectRouteHighlight[] {
  return getVolumetricRouteHighlightFamilyIds().map((familyId) => {
    const spec = getVolumetricRouteHighlightSpec(familyId);
    return buildVolumetricRouteHighlight(familyId, spec.routeDefinitions, spec.buildRuntimeConfig as any, spec.routeFields as any);
  });
}
