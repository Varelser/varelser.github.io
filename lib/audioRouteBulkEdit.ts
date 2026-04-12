import { createAudioRouteSeed } from './audioReactiveConfig';
import type { AudioFeatureKey, AudioModulationRoute, AudioReactiveCurve, AudioReactiveMode } from '../types/audioReactive';

export type BulkRouteEditDraft = {
  enabled: 'keep' | 'enabled' | 'disabled' | 'invert';
  source: 'keep' | AudioFeatureKey;
  target: 'keep' | string;
  mode: 'keep' | AudioReactiveMode;
  curve: 'keep' | AudioReactiveCurve;
  amountScale: number;
  amountSet: number | '';
  biasSet: number | '';
  clampMinSet: number | '';
  clampMaxSet: number | '';
  smoothingSet: number | '';
  attackSet: number | '';
  releaseSet: number | '';
  notesMode: 'keep' | 'append' | 'replace' | 'clear';
  notesText: string;
  notesAppend?: string;
};

export const DEFAULT_BULK_ROUTE_EDIT_DRAFT: BulkRouteEditDraft = {
  enabled: 'keep',
  source: 'keep',
  target: 'keep',
  mode: 'keep',
  curve: 'keep',
  amountScale: 1,
  amountSet: '',
  biasSet: '',
  clampMinSet: '',
  clampMaxSet: '',
  smoothingSet: '',
  attackSet: '',
  releaseSet: '',
  notesMode: 'keep',
  notesText: '',
  notesAppend: '',
};

function normalizeBulkRouteEditDraft(draft: Partial<BulkRouteEditDraft>): BulkRouteEditDraft {
  const normalized = {
    ...DEFAULT_BULK_ROUTE_EDIT_DRAFT,
    ...draft,
  } as BulkRouteEditDraft;
  if ((draft.notesAppend ?? '').trim().length > 0 && draft.notesMode === undefined) {
    normalized.notesMode = 'append';
    normalized.notesText = draft.notesAppend ?? '';
  }
  return normalized;
}

function resolveFiniteOverride(value: number | '', fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function resolveNotes(route: AudioModulationRoute, draft: BulkRouteEditDraft): string | undefined {
  const nextText = (draft.notesText || draft.notesAppend || '').trim();
  if (draft.notesMode === 'keep') {
    return route.notes;
  }
  if (draft.notesMode === 'clear') {
    return undefined;
  }
  if (nextText.length === 0) {
    return route.notes;
  }
  if (draft.notesMode === 'replace') {
    return nextText;
  }
  return route.notes && route.notes.trim().length > 0
    ? `${route.notes} | ${nextText}`
    : nextText;
}

export function applyBulkRouteEditToVisible(
  routes: AudioModulationRoute[],
  visibleRouteIdSet: Set<string>,
  draftInput: Partial<BulkRouteEditDraft>,
) {
  const draft = normalizeBulkRouteEditDraft(draftInput);
  let touchedCount = 0;
  const nextRoutes = routes.map((route) => {
    if (!visibleRouteIdSet.has(route.id)) {
      return route;
    }

    touchedCount += 1;
    const nextEnabled =
      draft.enabled === 'keep'
        ? route.enabled
        : draft.enabled === 'invert'
          ? !route.enabled
          : draft.enabled === 'enabled';

    const scaledAmount = route.amount * (Number.isFinite(draft.amountScale) ? draft.amountScale : 1);

    return createAudioRouteSeed(0, {
      ...route,
      enabled: nextEnabled,
      source: draft.source === 'keep' ? route.source : draft.source,
      target: draft.target === 'keep' ? route.target : draft.target,
      mode: draft.mode === 'keep' ? route.mode : draft.mode,
      curve: draft.curve === 'keep' ? route.curve : draft.curve,
      amount: resolveFiniteOverride(draft.amountSet, scaledAmount),
      bias: resolveFiniteOverride(draft.biasSet, route.bias),
      clampMin: resolveFiniteOverride(draft.clampMinSet, route.clampMin),
      clampMax: resolveFiniteOverride(draft.clampMaxSet, route.clampMax),
      smoothing: resolveFiniteOverride(draft.smoothingSet, route.smoothing),
      attack: resolveFiniteOverride(draft.attackSet, route.attack),
      release: resolveFiniteOverride(draft.releaseSet, route.release),
      notes: resolveNotes(route, draft),
    });
  });

  return {
    nextRoutes,
    touchedCount,
  };
}
