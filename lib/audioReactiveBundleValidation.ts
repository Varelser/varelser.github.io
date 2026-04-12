import { normalizeAudioRoutes } from './audioReactiveConfig';
import type { AudioModulationRoute } from '../types/audioReactive';
import {
  AUDIO_FEATURE_KEY_SET,
  AUDIO_REACTIVE_CURVE_SET,
  AUDIO_REACTIVE_MODE_SET,
  AUDIO_REACTIVE_TARGET_SET,
  clamp,
  createRouteComparisonDelta,
  createRouteMap,
  isRecord,
  parseRawRoutes,
  uniqueSorted,
} from './audioReactiveValidationShared';
import type {
  AudioRouteBundleDiffSample,
  AudioRouteBundleDiffSummary,
  AudioRouteBundleValidation,
} from './audioReactiveValidationTypes';

function summarizeAudioRouteBundleDiff(
  incomingRoutes: AudioModulationRoute[],
  currentRoutes: AudioModulationRoute[],
): AudioRouteBundleDiffSummary {
  const incomingMap = createRouteMap(incomingRoutes);
  const currentMap = createRouteMap(currentRoutes);
  const allKeys = Array.from(new Set([...incomingMap.keys(), ...currentMap.keys()])).sort((left, right) => left.localeCompare(right));

  let overlappingKeyCount = 0;
  let exactValueMatchCount = 0;
  let changedMatchCount = 0;
  let addedCount = 0;
  let removedCount = 0;

  const sampleAdded: AudioRouteBundleDiffSample[] = [];
  const sampleRemoved: AudioRouteBundleDiffSample[] = [];
  const sampleChanged: AudioRouteBundleDiffSample[] = [];

  allKeys.forEach((key) => {
    const incomingGroup = [...(incomingMap.get(key) ?? [])];
    const currentGroup = [...(currentMap.get(key) ?? [])];

    if (incomingGroup.length === 0) {
      removedCount += currentGroup.length;
      currentGroup.forEach((route) => {
        if (sampleRemoved.length < 6) {
          sampleRemoved.push({ key, currentRouteId: route.id });
        }
      });
      return;
    }

    if (currentGroup.length === 0) {
      addedCount += incomingGroup.length;
      incomingGroup.forEach((route) => {
        if (sampleAdded.length < 6) {
          sampleAdded.push({ key, incomingRouteId: route.id });
        }
      });
      return;
    }

    overlappingKeyCount += 1;
    const unmatchedCurrent = [...currentGroup];

    incomingGroup.forEach((incomingRoute) => {
      if (unmatchedCurrent.length === 0) {
        addedCount += 1;
        if (sampleAdded.length < 6) {
          sampleAdded.push({ key, incomingRouteId: incomingRoute.id });
        }
        return;
      }

      let bestIndex = 0;
      let bestScore = Number.POSITIVE_INFINITY;
      unmatchedCurrent.forEach((currentRoute, currentIndex) => {
        const delta = createRouteComparisonDelta(incomingRoute, currentRoute);
        const score = delta.amountDelta + delta.biasDelta + delta.timingDelta;
        if (score < bestScore) {
          bestScore = score;
          bestIndex = currentIndex;
        }
      });

      const [matchedCurrent] = unmatchedCurrent.splice(bestIndex, 1);
      const delta = createRouteComparisonDelta(incomingRoute, matchedCurrent);
      const isExact = delta.amountDelta < 1e-6 && delta.biasDelta < 1e-6 && delta.timingDelta < 1e-6;
      if (isExact) {
        exactValueMatchCount += 1;
      } else {
        changedMatchCount += 1;
        if (sampleChanged.length < 6) {
          sampleChanged.push({
            key,
            incomingRouteId: incomingRoute.id,
            currentRouteId: matchedCurrent.id,
            amountDelta: Number(delta.amountDelta.toFixed(3)),
            biasDelta: Number(delta.biasDelta.toFixed(3)),
            timingDelta: Number(delta.timingDelta.toFixed(3)),
          });
        }
      }
    });

    if (unmatchedCurrent.length > 0) {
      removedCount += unmatchedCurrent.length;
      unmatchedCurrent.forEach((route) => {
        if (sampleRemoved.length < 6) {
          sampleRemoved.push({ key, currentRouteId: route.id });
        }
      });
    }
  });

  return {
    currentRouteCount: currentRoutes.length,
    incomingRouteCount: incomingRoutes.length,
    overlappingKeyCount,
    exactValueMatchCount,
    changedMatchCount,
    addedCount,
    removedCount,
    sampleAdded,
    sampleRemoved,
    sampleChanged,
  };
}

export function validateAudioRouteBundleText(
  text: string,
  currentRoutes?: AudioModulationRoute[],
): AudioRouteBundleValidation | null {
  if (text.trim().length === 0) {
    return null;
  }

  try {
    const { routes: rawRoutes, scope } = parseRawRoutes(text);
    const normalizedRoutes = normalizeAudioRoutes(rawRoutes);
    const duplicateIds: string[] = [];
    const seenIds = new Set<string>();

    let normalizedSourceCount = 0;
    let normalizedCurveCount = 0;
    let normalizedModeCount = 0;
    let defaultedTargetCount = 0;
    let clampedAmountCount = 0;
    let clampedBiasCount = 0;
    let clampedSmoothingCount = 0;
    let clampedAttackCount = 0;
    let clampedReleaseCount = 0;
    let clampedClampMinCount = 0;
    let clampedClampMaxCount = 0;

    const invalidSources: string[] = [];
    const invalidCurves: string[] = [];
    const invalidModes: string[] = [];
    const unknownTargets: string[] = [];

    normalizedRoutes.forEach((route, index) => {
      if (seenIds.has(route.id)) {
        duplicateIds.push(route.id);
      } else {
        seenIds.add(route.id);
      }

      const raw = isRecord(rawRoutes[index]) ? rawRoutes[index] : {};
      const rawSource = raw.source;
      const rawCurve = raw.curve;
      const rawMode = raw.mode;
      const rawTarget = raw.target;

      if (typeof rawSource !== 'string' || !AUDIO_FEATURE_KEY_SET.has(rawSource)) {
        normalizedSourceCount += 1;
        if (typeof rawSource === 'string' && rawSource.trim().length > 0) {
          invalidSources.push(rawSource);
        }
      }
      if (typeof rawCurve !== 'string' || !AUDIO_REACTIVE_CURVE_SET.has(rawCurve)) {
        normalizedCurveCount += 1;
        if (typeof rawCurve === 'string' && rawCurve.trim().length > 0) {
          invalidCurves.push(rawCurve);
        }
      }
      if (typeof rawMode !== 'string' || !AUDIO_REACTIVE_MODE_SET.has(rawMode)) {
        normalizedModeCount += 1;
        if (typeof rawMode === 'string' && rawMode.trim().length > 0) {
          invalidModes.push(rawMode);
        }
      }
      if (typeof rawTarget !== 'string' || rawTarget.trim().length === 0) {
        defaultedTargetCount += 1;
      }
      if (!AUDIO_REACTIVE_TARGET_SET.has(route.target)) {
        unknownTargets.push(route.target);
      }

      if (!isRecord(raw) || typeof raw.amount !== 'number' || clamp(raw.amount, -8, 8) !== raw.amount) clampedAmountCount += 1;
      if (!isRecord(raw) || typeof raw.bias !== 'number' || clamp(raw.bias, -4, 4) !== raw.bias) clampedBiasCount += 1;
      if (!isRecord(raw) || typeof raw.smoothing !== 'number' || clamp(raw.smoothing, 0, 1) !== raw.smoothing) clampedSmoothingCount += 1;
      if (!isRecord(raw) || typeof raw.attack !== 'number' || clamp(raw.attack, 0, 1) !== raw.attack) clampedAttackCount += 1;
      if (!isRecord(raw) || typeof raw.release !== 'number' || clamp(raw.release, 0, 1) !== raw.release) clampedReleaseCount += 1;
      if (!isRecord(raw) || typeof raw.clampMin !== 'number' || clamp(raw.clampMin, -8, 8) !== raw.clampMin) clampedClampMinCount += 1;
      if (!isRecord(raw) || typeof raw.clampMax !== 'number' || clamp(raw.clampMax, -8, 8) !== raw.clampMax) clampedClampMaxCount += 1;
    });

    return {
      ok: true,
      routeCount: normalizedRoutes.length,
      scope,
      duplicateIds: uniqueSorted(duplicateIds),
      unknownTargets: uniqueSorted(unknownTargets),
      invalidSources: uniqueSorted(invalidSources),
      invalidCurves: uniqueSorted(invalidCurves),
      invalidModes: uniqueSorted(invalidModes),
      normalization: {
        normalizedSourceCount,
        normalizedCurveCount,
        normalizedModeCount,
        defaultedTargetCount,
        clampedAmountCount,
        clampedBiasCount,
        clampedSmoothingCount,
        clampedAttackCount,
        clampedReleaseCount,
        clampedClampMinCount,
        clampedClampMaxCount,
      },
      diff: currentRoutes ? summarizeAudioRouteBundleDiff(normalizedRoutes, currentRoutes) : undefined,
    };
  } catch (error) {
    return {
      ok: false,
      routeCount: 0,
      scope: 'unknown',
      parseError: error instanceof Error ? error.message : 'Audio route bundle parse failed',
      duplicateIds: [],
      unknownTargets: [],
      invalidSources: [],
      invalidCurves: [],
      invalidModes: [],
      normalization: {
        normalizedSourceCount: 0,
        normalizedCurveCount: 0,
        normalizedModeCount: 0,
        defaultedTargetCount: 0,
        clampedAmountCount: 0,
        clampedBiasCount: 0,
        clampedSmoothingCount: 0,
        clampedAttackCount: 0,
        clampedReleaseCount: 0,
        clampedClampMinCount: 0,
        clampedClampMaxCount: 0,
      },
    };
  }
}
