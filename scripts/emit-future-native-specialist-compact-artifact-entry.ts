import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildFutureNativeSpecialistRouteCompactArtifact,
  renderFutureNativeSpecialistRouteCompactArtifactMarkdown,
} from '../lib/future-native-families/futureNativeFamiliesSpecialistCompactArtifact';

const artifact = buildFutureNativeSpecialistRouteCompactArtifact();
const markdown = renderFutureNativeSpecialistRouteCompactArtifactMarkdown(artifact);
const outputDir = path.resolve('docs/handoff/archive/generated/future-native-specialist-compact-artifact');
mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, 'future-native-specialist-route-compact-artifact.json'), JSON.stringify(artifact, null, 2));
writeFileSync(path.join(outputDir, 'future-native-specialist-route-compact-artifact.md'), markdown);
console.log(`Wrote ${outputDir}/future-native-specialist-route-compact-artifact.json`);
console.log(`Wrote ${outputDir}/future-native-specialist-route-compact-artifact.md`);
