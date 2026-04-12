import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  listFutureNativeSpecialistFamilyPreviews,
  renderFutureNativeSpecialistFamilyPreviewsMarkdown,
  type FutureNativeSpecialistFamilyPreview,
} from '../lib/future-native-families/futureNativeSpecialistFamilyPreview';
import { buildAllFutureNativeSpecialistRouteSnapshots } from '../lib/future-native-families/futureNativeFamiliesSpecialistPackets';

type HandoffRoute = {
  familyId: FutureNativeSpecialistFamilyPreview['familyId'];
  routeLabel: string;
  changedSections: string[];
  warningValues: string[];
  manifestRoundtripStable: boolean;
  serializationRoundtripStable: boolean;
  controlRoundtripStable: boolean;
};

type HandoffArtifact = { routes?: HandoffRoute[] };

const outputDir = path.resolve('docs/handoff/archive/generated/future-native-specialist-handoff');
const handoffJsonPath = path.join(outputDir, 'future-native-specialist-handoff.json');

function loadPreviewsFromHandoff(): FutureNativeSpecialistFamilyPreview[] | null {
  if (!existsSync(handoffJsonPath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(handoffJsonPath, 'utf8')) as HandoffArtifact;
    if (!Array.isArray(parsed.routes)) return null;
    const routesByFamilyId = new Map(buildAllFutureNativeSpecialistRouteSnapshots().map((entry) => [entry.familyId, entry]));
    return parsed.routes.flatMap((comparisonRoute) => {
      const snapshot = routesByFamilyId.get(comparisonRoute.familyId);
      if (!snapshot) return [];
      return [{
        familyId: snapshot.familyId,
        routeId: snapshot.routeId,
        routeLabel: snapshot.routeLabel,
        selectedAdapterId: snapshot.selectedAdapterId,
        executionTarget: snapshot.executionTarget,
        previewSignature: [snapshot.familyId, snapshot.routeId, snapshot.selectedAdapterId, snapshot.executionTarget].join('|'),
        comparisonSignature: [
          snapshot.familyId,
          comparisonRoute.changedSections.join('+') || 'stable',
          comparisonRoute.manifestRoundtripStable ? 'manifest-stable' : 'manifest-drift',
          comparisonRoute.serializationRoundtripStable ? 'serialization-stable' : 'serialization-drift',
          comparisonRoute.controlRoundtripStable ? 'control-stable' : 'control-drift',
        ].join('|'),
        warningValues: [...comparisonRoute.warningValues],
      } satisfies FutureNativeSpecialistFamilyPreview];
    });
  } catch {
    return null;
  }
}

const previews = loadPreviewsFromHandoff() ?? listFutureNativeSpecialistFamilyPreviews();
mkdirSync(outputDir, { recursive: true });
const jsonPath = path.join(outputDir, 'future-native-specialist-family-previews.json');
const mdPath = path.join(outputDir, 'future-native-specialist-family-previews.md');
writeFileSync(jsonPath, JSON.stringify(previews, null, 2));
writeFileSync(mdPath, renderFutureNativeSpecialistFamilyPreviewsMarkdown(previews));
console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${mdPath}`);
console.log(JSON.stringify({
  previewSource: existsSync(handoffJsonPath) ? path.relative(process.cwd(), handoffJsonPath) : 'computed',
  previewCount: previews.length,
}, null, 2));
