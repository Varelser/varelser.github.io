import assert from 'node:assert/strict';
import { buildProjectFutureNativeSpecialistRouteEntries } from '../../lib/future-native-families/futureNativeFamiliesSpecialistPackets';
import {
  buildDefaultProjectFutureNativeSpecialistRouteControls,
  buildFutureNativeSpecialistRouteControlDeltaValues,
  buildFutureNativeSpecialistRouteControlPacket,
  buildFutureNativeSpecialistRouteManifestDeltaValues,
  extractFutureNativeSpecialistRouteResolvedControlValues,
  normalizeProjectFutureNativeSpecialistRouteControls,
  patchProjectFutureNativeSpecialistRouteControls,
} from '../../lib/future-native-families/futureNativeSpecialistRouteControls';

export async function main() {
  const defaults = buildDefaultProjectFutureNativeSpecialistRouteControls();
  assert.equal(defaults.length, 4);
  assert.ok(defaults.every((entry) => entry.overrideMode === 'auto'));

  const normalized = normalizeProjectFutureNativeSpecialistRouteControls([
    {
      familyId: 'specialist-houdini-native',
      selectedAdapterId: 'particles-fallback',
      selectedExecutionTarget: 'hybrid:particle-fallback-stack',
      overrideMode: 'manual',
      overrideCandidateId: 'override:particles-fallback',
      overrideDisposition: 'pinned',
    },
  ] as any);
  assert.equal(normalized.length, 4);
  assert.equal(normalized.find((entry) => entry.familyId === 'specialist-houdini-native')?.overrideMode, 'manual');
  assert.equal(normalized.find((entry) => entry.familyId === 'specialist-houdini-native')?.overrideDisposition, 'pinned');

  const manualPatched = patchProjectFutureNativeSpecialistRouteControls(defaults, 'specialist-houdini-native', {
    overrideMode: 'manual',
    selectedAdapterId: 'particles-fallback',
  });
  const manualEntry = manualPatched.find((entry) => entry.familyId === 'specialist-houdini-native');
  assert.ok(manualEntry);
  assert.equal(manualEntry?.overrideMode, 'manual');
  assert.equal(manualEntry?.selectedAdapterId, 'particles-fallback');
  assert.equal(manualEntry?.selectedExecutionTarget, 'hybrid:particle-fallback-stack');
  assert.equal(manualEntry?.overrideCandidateId, 'override:particles-fallback');

  const autoPatched = patchProjectFutureNativeSpecialistRouteControls(manualPatched, 'specialist-houdini-native', {
    overrideMode: 'auto',
    overrideDisposition: 'pinned',
  });
  const autoEntry = autoPatched.find((entry) => entry.familyId === 'specialist-houdini-native');
  assert.ok(autoEntry);
  assert.equal(autoEntry?.overrideMode, 'auto');
  assert.equal(autoEntry?.selectedAdapterId, 'surface-volume-primary');
  assert.equal(autoEntry?.selectedExecutionTarget, 'hybrid:surface-volume-stack');
  assert.equal(autoEntry?.overrideCandidateId, 'override:surface-volume-primary');
  assert.equal(autoEntry?.overrideDisposition, 'pinned');

  const deltaValues = buildFutureNativeSpecialistRouteControlDeltaValues(manualEntry!);
  assert.deepEqual(deltaValues, [
    'mode:auto->manual',
    'adapter:surface-volume-primary->particles-fallback',
    'target:hybrid:surface-volume-stack->hybrid:particle-fallback-stack',
    'candidate:override:surface-volume-primary->override:particles-fallback',
  ]);
  assert.deepEqual(buildFutureNativeSpecialistRouteControlDeltaValues(defaults[0]!), []);

  const currentRoute = buildProjectFutureNativeSpecialistRouteEntries(manualPatched).find((entry) => entry.familyId === 'specialist-houdini-native')!;
  const resolvedValues = extractFutureNativeSpecialistRouteResolvedControlValues(currentRoute);
  assert.equal(resolvedValues.selectedAdapterId, 'particles-fallback');
  assert.equal(resolvedValues.selectedExecutionTarget, 'hybrid:particle-fallback-stack');
  assert.equal(resolvedValues.overrideMode, 'manual');
  assert.equal(resolvedValues.overrideCandidateId, 'override:particles-fallback');
  assert.equal(resolvedValues.overrideDisposition, 'advisory');

  const manifestDeltaValues = buildFutureNativeSpecialistRouteManifestDeltaValues(
    currentRoute,
    buildProjectFutureNativeSpecialistRouteEntries(defaults).find((entry) => entry.familyId === 'specialist-houdini-native')!,
  );
  assert.deepEqual(manifestDeltaValues, [
    'mode:auto->manual',
    'adapter:surface-volume-primary->particles-fallback',
    'target:hybrid:surface-volume-stack->hybrid:particle-fallback-stack',
    'candidate:override:surface-volume-primary->override:particles-fallback',
  ]);
  assert.deepEqual(buildFutureNativeSpecialistRouteManifestDeltaValues(currentRoute, null), ['manifest:missing']);

  const routePacket = buildFutureNativeSpecialistRouteControlPacket(currentRoute);
  assert.match(routePacket, /ProjectFutureNativeSpecialistRouteControlPacket/);
  assert.match(routePacket, /familyId=specialist-houdini-native/);
  assert.match(routePacket, /selectedAdapterId=particles-fallback/);
  assert.match(routePacket, /selectionMode=manual/);
  assert.match(routePacket, /overrideDisposition=advisory/);
}
