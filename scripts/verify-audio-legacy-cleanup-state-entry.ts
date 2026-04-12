import { strict as assert } from "node:assert";
import { buildAudioLegacyCleanupState } from "../lib/audioLegacyCleanupState";

const resolved = buildAudioLegacyCleanupState({
  focusedConflictKey: "bass::particle.motion",
  hotspotKeys: [],
  manualConflictKeys: [],
  storedManualConflictKeys: [],
  lastHotspotBatchSummary: {
    scope: "current",
    limit: 3,
    beforeHotspotCount: 2,
    afterHotspotCount: 0,
    beforeContextCount: 2,
    afterContextCount: 0,
    beforePendingHotspotCount: 2,
    afterPendingHotspotCount: 0,
    beforePendingContextCount: 2,
    afterPendingContextCount: 0,
    beforePendingSamples: ["bass"],
    afterPendingSamples: [],
    currentAppliedCount: 1,
    currentSamples: ["bass"],
    storedPresetUpdatedCount: 0,
    storedKeyframeUpdatedCount: 0,
    storedAppliedCount: 0,
    storedSamples: [],
    createdAt: new Date().toISOString(),
  },
  lastManualBatchSummary: {
    scope: "stored",
    limit: 3,
    beforeCurrentManualKeyCount: 0,
    afterCurrentManualKeyCount: 0,
    beforeStoredManualKeyCount: 2,
    afterStoredManualKeyCount: 0,
    beforePendingCurrentManualKeyCount: 0,
    afterPendingCurrentManualKeyCount: 0,
    beforePendingStoredManualKeyCount: 2,
    afterPendingStoredManualKeyCount: 0,
    beforePendingCurrentSamples: [],
    afterPendingCurrentSamples: [],
    beforePendingStoredSamples: ["bass"],
    afterPendingStoredSamples: [],
    currentAppliedCount: 0,
    currentSamples: [],
    storedAppliedCount: 2,
    storedSamples: ["preset:a"],
    createdAt: new Date().toISOString(),
    batchLabel: "preview-all",
    previewProfile: "align-residuals",
  },
});
assert.equal(resolved.cleanupReady, true);
assert.equal(resolved.shouldAutoClearFocusedConflict, true);
assert.equal(resolved.shouldAutoDismissLastHotspotBatch, true);
assert.equal(resolved.shouldAutoDismissLastManualBatch, true);

const active = buildAudioLegacyCleanupState({
  focusedConflictKey: "bass::particle.motion",
  hotspotKeys: ["bass::particle.motion"],
  manualConflictKeys: ["bass::particle.motion"],
  storedManualConflictKeys: ["bass::particle.motion"],
  lastHotspotBatchSummary: null,
  lastManualBatchSummary: null,
});
assert.equal(active.cleanupReady, false);
assert.equal(active.focusedConflictTracked, true);
assert.equal(active.shouldAutoClearFocusedConflict, false);
assert.equal(active.shouldAutoDismissLastHotspotBatch, false);
assert.equal(active.shouldAutoDismissLastManualBatch, false);

console.log(JSON.stringify({ resolved, active }, null, 2));
