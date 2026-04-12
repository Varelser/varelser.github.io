import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  listFutureNativeFamilyPreviewArtifact,
  renderFutureNativeFamilyPreviewArtifactMarkdown,
} from '../lib/future-native-families/futureNativeFamilyPreviewArtifact';
import type { FutureNativeSpecialistFamilyPreview } from '../lib/future-native-families/futureNativeSpecialistFamilyPreview';

const outputDir = path.join(process.cwd(), 'docs', 'handoff', 'archive', 'generated', 'future-native-release-report');
const specialistPreviewJsonPath = path.join(
  process.cwd(),
  'docs',
  'handoff',
  'archive',
  'generated',
  'future-native-specialist-handoff',
  'future-native-specialist-family-previews.json',
);

function loadExistingSpecialistPreviews(): FutureNativeSpecialistFamilyPreview[] | undefined {
  if (!existsSync(specialistPreviewJsonPath)) return undefined;
  try {
    const parsed = JSON.parse(readFileSync(specialistPreviewJsonPath, 'utf8'));
    return Array.isArray(parsed) ? parsed as FutureNativeSpecialistFamilyPreview[] : undefined;
  } catch {
    return undefined;
  }
}

mkdirSync(outputDir, { recursive: true });
const payload = listFutureNativeFamilyPreviewArtifact({ specialistEntries: loadExistingSpecialistPreviews() });
writeFileSync(path.join(outputDir, 'future-native-family-previews.json'), `${JSON.stringify(payload, null, 2)}
`, 'utf8');
writeFileSync(path.join(outputDir, 'future-native-family-previews.md'), `${renderFutureNativeFamilyPreviewArtifactMarkdown(payload)}
`, 'utf8');
console.log(JSON.stringify({
  emittedAt: payload.generatedAt,
  outputDir,
  specialistPreviewSource: existsSync(specialistPreviewJsonPath) ? path.relative(process.cwd(), specialistPreviewJsonPath) : 'computed',
  mpmFamilyCount: payload.mpm.length,
  fractureFamilyCount: payload.fracture.length,
  pbdFamilyCount: payload.pbd.length,
  volumetricFamilyCount: payload.volumetric.length,
  specialistFamilyCount: payload.specialist.length,
}, null, 2));
