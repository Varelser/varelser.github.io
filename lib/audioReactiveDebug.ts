export type SequenceAudioTriggerTarget =
  | 'sequence.stepAdvance'
  | 'sequence.crossfade'
  | 'sequence.randomizeSeed'
  | 'sequence.seedMutation.motion'
  | 'sequence.seedMutation.structure'
  | 'sequence.seedMutation.surface'
  | 'sequence.seedMutation.hybrid';

export interface SequenceAudioTriggerDebugTargetState {
  target: SequenceAudioTriggerTarget;
  value: number;
  active: boolean;
  cooldownMs: number;
  msSinceLastTrigger: number | null;
  ready: boolean;
}

export interface SequenceAudioTriggerDebugSnapshot {
  updatedAt: number;
  enterThreshold: number;
  exitThreshold: number;
  targets: SequenceAudioTriggerDebugTargetState[];
}

export type SequenceAudioTriggerDebugHistoryEntryKind =
  | 'trigger'
  | 'blocked'
  | 'exit';

export interface SequenceAudioTriggerDebugHistoryEntry {
  id: string;
  updatedAt: number;
  target: SequenceAudioTriggerDebugTargetState['target'];
  kind: SequenceAudioTriggerDebugHistoryEntryKind;
  value: number;
  cooldownMs: number;
  msSinceLastTrigger: number | null;
  detail?: string;
}

const MAX_SEQUENCE_AUDIO_TRIGGER_DEBUG_HISTORY = 18;

declare global {
  interface Window {
    __MONOSPHERE_SEQUENCE_AUDIO_TRIGGER_DEBUG__?: SequenceAudioTriggerDebugSnapshot;
    __MONOSPHERE_SEQUENCE_AUDIO_TRIGGER_DEBUG_HISTORY__?: SequenceAudioTriggerDebugHistoryEntry[];
  }
}

export function writeSequenceAudioTriggerDebug(snapshot: SequenceAudioTriggerDebugSnapshot) {
  if (typeof window === 'undefined') {
    return;
  }
  window.__MONOSPHERE_SEQUENCE_AUDIO_TRIGGER_DEBUG__ = snapshot;
}

export function readSequenceAudioTriggerDebug(): SequenceAudioTriggerDebugSnapshot | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.__MONOSPHERE_SEQUENCE_AUDIO_TRIGGER_DEBUG__ ?? null;
}

export function appendSequenceAudioTriggerDebugHistory(
  entry: Omit<SequenceAudioTriggerDebugHistoryEntry, 'id'>,
) {
  if (typeof window === 'undefined') {
    return;
  }

  const nextEntry: SequenceAudioTriggerDebugHistoryEntry = {
    ...entry,
    id: `${entry.target}:${entry.kind}:${entry.updatedAt}:${Math.round(entry.value * 1000)}`,
  };

  const previous = window.__MONOSPHERE_SEQUENCE_AUDIO_TRIGGER_DEBUG_HISTORY__ ?? [];
  const next = [nextEntry, ...previous].slice(0, MAX_SEQUENCE_AUDIO_TRIGGER_DEBUG_HISTORY);
  window.__MONOSPHERE_SEQUENCE_AUDIO_TRIGGER_DEBUG_HISTORY__ = next;
}

export function readSequenceAudioTriggerDebugHistory(): SequenceAudioTriggerDebugHistoryEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }
  return window.__MONOSPHERE_SEQUENCE_AUDIO_TRIGGER_DEBUG_HISTORY__ ?? [];
}

export function clearSequenceAudioTriggerDebug() {
  if (typeof window === 'undefined') {
    return;
  }
  delete window.__MONOSPHERE_SEQUENCE_AUDIO_TRIGGER_DEBUG__;
  delete window.__MONOSPHERE_SEQUENCE_AUDIO_TRIGGER_DEBUG_HISTORY__;
}
