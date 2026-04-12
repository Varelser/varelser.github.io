import type { AudioCurationHistoryEntry, AudioCurationHistoryScope, AudioCurationQueueFilterMode } from "../types/audioReactive";

const AUDIO_CURATION_HISTORY_LIMIT = 80;

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function createAudioRouteSignature(route: {
  owner?: unknown;
  source?: unknown;
  target?: unknown;
  mode?: unknown;
  curve?: unknown;
  amount?: unknown;
  bias?: unknown;
  smoothing?: unknown;
  attack?: unknown;
  release?: unknown;
  clampMin?: unknown;
  clampMax?: unknown;
}) {
  return [
    normalizeText(route.owner),
    normalizeText(route.source),
    normalizeText(route.target),
    normalizeText(route.mode),
    normalizeText(route.curve),
    toNumber(route.amount).toFixed(4),
    toNumber(route.bias).toFixed(4),
    toNumber(route.smoothing).toFixed(4),
    toNumber(route.attack).toFixed(4),
    toNumber(route.release).toFixed(4),
    toNumber(route.clampMin).toFixed(4),
    toNumber(route.clampMax).toFixed(4),
  ].join("|");
}

export function createAudioCurationHistoryEntry(input: {
  key: string;
  scope: AudioCurationHistoryScope;
  action: string;
  routeId?: string;
  routeSignature?: string;
  note?: string;
  createdAt?: string;
}): AudioCurationHistoryEntry {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const routeSignature = normalizeText(input.routeSignature);
  return {
    id: `${input.scope}:${input.key}:${input.action}:${routeSignature || normalizeText(input.routeId)}:${createdAt}`,
    key: input.key,
    scope: input.scope,
    action: input.action,
    routeId: input.routeId,
    routeSignature: routeSignature || undefined,
    createdAt,
    note: input.note,
  };
}

export function appendAudioCurationHistory(
  history: AudioCurationHistoryEntry[] | null | undefined,
  entries: AudioCurationHistoryEntry[],
  limit = AUDIO_CURATION_HISTORY_LIMIT,
) {
  const base = Array.isArray(history) ? history : [];
  const incoming = entries.filter((entry) => entry.key);
  if (incoming.length === 0) return base;
  const merged = [...incoming.reverse(), ...base];
  const deduped: AudioCurationHistoryEntry[] = [];
  const seen = new Set<string>();
  merged.forEach((entry) => {
    const signature = `${entry.scope}|${entry.key}|${entry.action}|${entry.routeSignature ?? entry.routeId ?? ""}`;
    if (seen.has(signature)) return;
    seen.add(signature);
    deduped.push(entry);
  });
  return deduped.slice(0, limit);
}

export function summarizeAudioCurationHistory(
  history: AudioCurationHistoryEntry[] | null | undefined,
  limit = 12,
) {
  const entries = Array.isArray(history) ? history.slice(0, limit) : [];
  const keyCounts = new Map<string, number>();
  entries.forEach((entry) => {
    keyCounts.set(entry.key, (keyCounts.get(entry.key) ?? 0) + 1);
  });
  const recentKeys = Array.from(new Set(entries.map((entry) => entry.key)));
  const hottestKeys = Array.from(keyCounts.entries())
    .sort((left, right) => {
      if (right[1] !== left[1]) return right[1] - left[1];
      return left[0].localeCompare(right[0]);
    })
    .slice(0, 8)
    .map(([key, count]) => ({ key, count }));
  return {
    entries,
    recentKeys,
    hottestKeys,
  };
}


export function createAudioCurationKeySet(
  history: AudioCurationHistoryEntry[] | null | undefined,
) {
  return new Set(
    (Array.isArray(history) ? history : [])
      .map((entry) => entry.key)
      .filter(Boolean),
  );
}

export function shouldIncludeAudioCurationKey(
  key: string,
  historyKeySet: ReadonlySet<string>,
  mode: AudioCurationQueueFilterMode,
) {
  if (mode === "all") return true;
  const seen = historyKeySet.has(key);
  return mode === "hide-curated" ? !seen : seen;
}
