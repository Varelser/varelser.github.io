import { strict as assert } from 'node:assert';
import { buildProjectManifest } from '../lib/projectStateManifest';
import { loadFullStarterPresetLibrary } from '../lib/starterLibrary';
import {
  getFutureNativeExportAdvice,
  getFutureNativeProjectRouteSummary,
} from '../lib/futureNativePanelSummaries';

async function main() {
  const starter = await loadFullStarterPresetLibrary();
  const activePreset = starter.presets.find((preset) => preset.id === 'future-native-volumetric-smoke-prism');
  assert(activePreset, 'missing volumetric representative preset');

  const projectManifest = buildProjectManifest(activePreset.config, starter.presets, starter.presetSequence);
  const exportAdvice = getFutureNativeExportAdvice(activePreset.config, starter.presets, starter.presetSequence);
  const projectSummary = getFutureNativeProjectRouteSummary(activePreset.config, projectManifest);

  assert(exportAdvice.activeRoutes.length > 0, 'expected active future-native export routes');
  assert.equal(exportAdvice.preferredVideoMode, 'sequence', 'volumetric export should prefer sequence mode');
  assert(projectSummary.currentRoutes.length > 0, 'expected current future-native project routes');
  assert(projectSummary.manifestRoutes.length > 0, 'expected manifest future-native project routes');
  assert(projectSummary.familyCounts.Volumetric > 0, 'expected volumetric family in manifest summary');

  console.log(JSON.stringify({
    ok: true,
    activeRouteCount: exportAdvice.activeRoutes.length,
    preferredVideoMode: exportAdvice.preferredVideoMode,
    preferredCaptureLabel: exportAdvice.preferredCaptureLabel,
    manifestRouteCount: projectSummary.manifestRoutes.length,
    familyCounts: projectSummary.familyCounts,
    recommendedPresetIds: projectSummary.recommendedPresetIds.length,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
