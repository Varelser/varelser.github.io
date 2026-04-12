import type { ParticleConfig } from '../types';
import {
  isExternalControlExportPresetId,
  type ExternalControlExportPresetCatalogEntry,
  type ExternalControlExportPresetId,
} from './externalControlExportPresets';

export const EXTERNAL_CONTROL_BRIDGE_URL_PARAM = 'controlBridgeUrl';
export const EXTERNAL_CONTROL_BRIDGE_SESSION_PARAM = 'controlBridgeSession';
export const EXTERNAL_CONTROL_BRIDGE_MODE = 'ws-json';
export const EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX = '/kalokagathia';

export type ExternalControlAction =
  | 'randomize'
  | 'replay-seed'
  | 'sequence-start'
  | 'sequence-stop'
  | 'audio-start'
  | 'audio-stop';

export type ExternalControlPresetTransitionMode = 'instant' | 'morph';

export type ExternalControlExportQueueAction =
  | 'enqueue-video-webm'
  | 'enqueue-png-sequence'
  | 'enqueue-gif'
  | 'start'
  | 'cancel'
  | 'clear';

export type ExternalControlCameraPathAction =
  | 'capture-slot'
  | 'load-slot'
  | 'morph-slot'
  | 'clear-slot'
  | 'play'
  | 'stop'
  | 'set-duration'
  | 'set-export-enabled'
  | 'copy-duration-to-export';

export type ExternalControlExportSettingsAction =
  | 'set-mode'
  | 'set-fps'
  | 'set-duration'
  | 'set-scale'
  | 'set-aspect-preset'
  | 'set-transparent';

export type ExternalControlExportPresetAction = 'apply' | 'enqueue' | 'start';
export type ExternalControlExportPresetQueryAction = 'status';

export type ExternalControlInboundMessage =
  | { type: 'external-control-handshake'; sessionId?: string }
  | { type: 'external-control-patch-config'; sessionId?: string; patch: Partial<ParticleConfig> }
  | { type: 'external-control-replace-config'; sessionId?: string; config: Partial<ParticleConfig> }
  | { type: 'external-control-action'; sessionId?: string; action: ExternalControlAction }
  | { type: 'external-control-load-preset'; sessionId?: string; presetId: string; transitionMode?: ExternalControlPresetTransitionMode }
  | { type: 'external-control-select-sequence-item'; sessionId?: string; itemId: string | null }
  | { type: 'external-control-export-queue'; sessionId?: string; action: ExternalControlExportQueueAction }
  | { type: 'external-control-export-settings'; sessionId?: string; action: 'set-mode'; mode: 'current' | 'sequence' }
  | { type: 'external-control-export-settings'; sessionId?: string; action: 'set-fps'; fps: number }
  | { type: 'external-control-export-settings'; sessionId?: string; action: 'set-duration'; durationSeconds: number }
  | { type: 'external-control-export-settings'; sessionId?: string; action: 'set-scale'; scale: number }
  | { type: 'external-control-export-settings'; sessionId?: string; action: 'set-aspect-preset'; aspectPreset: ParticleConfig['exportAspectPreset'] }
  | { type: 'external-control-export-settings'; sessionId?: string; action: 'set-transparent'; enabled: boolean }
  | { type: 'external-control-export-preset'; sessionId?: string; presetId: ExternalControlExportPresetId; action: ExternalControlExportPresetAction }
  | { type: 'external-control-export-preset-query'; sessionId?: string; action: ExternalControlExportPresetQueryAction }
  | { type: 'external-control-camera-path'; sessionId?: string; action: 'capture-slot' | 'load-slot' | 'morph-slot' | 'clear-slot'; slotIndex: number }
  | { type: 'external-control-camera-path'; sessionId?: string; action: 'play' | 'stop' | 'copy-duration-to-export' }
  | { type: 'external-control-camera-path'; sessionId?: string; action: 'set-duration'; durationSeconds: number }
  | { type: 'external-control-camera-path'; sessionId?: string; action: 'set-export-enabled'; enabled: boolean };

export type ExternalControlOutboundMessage =
  | {
    type: 'external-control-status';
    mode: typeof EXTERNAL_CONTROL_BRIDGE_MODE;
    sessionId: string;
    connected: boolean;
    isSequencePlaying: boolean;
    isAudioActive: boolean;
    activePresetId: string | null;
    activeSequenceItemId: string | null;
    presetCount: number;
    sequenceLength: number;
    exportQueueLength: number;
    isExportQueueRunning: boolean;
    cameraPathSlotCount: number;
    cameraPathDurationSeconds: number;
    cameraPathExportEnabled: boolean;
    isCameraPathPlaying: boolean;
    videoExportMode: 'current' | 'sequence';
    videoDurationSeconds: number;
    videoFps: number;
    exportScale: number;
    exportAspectPreset: ParticleConfig['exportAspectPreset'];
    exportTransparent: boolean;
    exportPresetIds: ExternalControlExportPresetId[];
    exportPresetCatalog: ExternalControlExportPresetCatalogEntry[];
    recommendedExportPresetId: ExternalControlExportPresetId | null;
    config: ParticleConfig;
  }
  | {
    type: 'external-control-error';
    mode: typeof EXTERNAL_CONTROL_BRIDGE_MODE;
    sessionId: string;
    message: string;
  };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const EXTERNAL_CONTROL_EXPORT_ASPECT_PRESETS = ['current', 'square', 'portrait-4-5', 'story-9-16', 'widescreen-16-9'] as const;

function isExternalControlExportAspectPreset(value: unknown): value is ParticleConfig['exportAspectPreset'] {
  return typeof value === 'string' && (EXTERNAL_CONTROL_EXPORT_ASPECT_PRESETS as readonly string[]).includes(value);
}


function normalizeOscAddress(address: string) {
  return `/${address.trim().replace(/^\/+/u, '').replace(/\/+/gu, '/')}`;
}

function readOscStringArg(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function readOscNumberArg(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function readOscBooleanArg(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'on' || normalized === 'yes') {
    return true;
  }
  if (normalized === '0' || normalized === 'false' || normalized === 'off' || normalized === 'no') {
    return false;
  }
  return null;
}

function readOscSlotIndexArg(value: unknown) {
  const numeric = readOscNumberArg(value);
  if (numeric === null || !Number.isInteger(numeric)) {
    return null;
  }
  if (numeric >= 1) {
    return numeric - 1;
  }
  return numeric >= 0 ? numeric : null;
}

function readOscJsonObjectArg(value: unknown) {
  if (isObject(value)) {
    return value;
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  try {
    const parsed = JSON.parse(value);
    return isObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function createExternalControlSessionId() {
  return `external-control-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getExternalControlBridgeOptions(search: string) {
  const params = new URLSearchParams(search);
  const url = params.get(EXTERNAL_CONTROL_BRIDGE_URL_PARAM)?.trim() ?? '';
  if (!url) {
    return null;
  }
  return {
    url,
    sessionId: params.get(EXTERNAL_CONTROL_BRIDGE_SESSION_PARAM)?.trim() || createExternalControlSessionId(),
  };
}

export function parseExternalControlInboundMessage(value: unknown): ExternalControlInboundMessage | null {
  if (typeof value === 'string') {
    try {
      return parseExternalControlInboundMessage(JSON.parse(value));
    } catch {
      return null;
    }
  }
  if (!isObject(value) || typeof value.type !== 'string') {
    return null;
  }

  if (value.type === 'external-control-handshake') {
    return typeof value.sessionId === 'string' || typeof value.sessionId === 'undefined'
      ? { type: value.type, sessionId: value.sessionId }
      : null;
  }

  if (value.type === 'external-control-patch-config' && isObject(value.patch)) {
    return {
      type: value.type,
      sessionId: typeof value.sessionId === 'string' ? value.sessionId : undefined,
      patch: value.patch as Partial<ParticleConfig>,
    };
  }

  if (value.type === 'external-control-replace-config' && isObject(value.config)) {
    return {
      type: value.type,
      sessionId: typeof value.sessionId === 'string' ? value.sessionId : undefined,
      config: value.config as Partial<ParticleConfig>,
    };
  }

  if (
    value.type === 'external-control-action'
    && (value.action === 'randomize'
      || value.action === 'replay-seed'
      || value.action === 'sequence-start'
      || value.action === 'sequence-stop'
      || value.action === 'audio-start'
      || value.action === 'audio-stop')
  ) {
    return {
      type: value.type,
      sessionId: typeof value.sessionId === 'string' ? value.sessionId : undefined,
      action: value.action,
    };
  }

  if (
    value.type === 'external-control-load-preset'
    && typeof value.presetId === 'string'
    && (typeof value.transitionMode === 'undefined' || value.transitionMode === 'instant' || value.transitionMode === 'morph')
  ) {
    return {
      type: value.type,
      sessionId: typeof value.sessionId === 'string' ? value.sessionId : undefined,
      presetId: value.presetId,
      transitionMode: value.transitionMode,
    };
  }

  if (
    value.type === 'external-control-select-sequence-item'
    && (typeof value.itemId === 'string' || value.itemId === null)
  ) {
    return {
      type: value.type,
      sessionId: typeof value.sessionId === 'string' ? value.sessionId : undefined,
      itemId: value.itemId,
    };
  }

  if (
    value.type === 'external-control-export-queue'
    && (value.action === 'enqueue-video-webm'
      || value.action === 'enqueue-png-sequence'
      || value.action === 'enqueue-gif'
      || value.action === 'start'
      || value.action === 'cancel'
      || value.action === 'clear')
  ) {
    return {
      type: value.type,
      sessionId: typeof value.sessionId === 'string' ? value.sessionId : undefined,
      action: value.action,
    };
  }

  if (value.type === 'external-control-export-settings') {
    const sessionId = typeof value.sessionId === 'string' ? value.sessionId : undefined;
    if ((value.action === 'set-mode') && (value.mode === 'current' || value.mode === 'sequence')) {
      return { type: value.type, sessionId, action: value.action, mode: value.mode };
    }
    if (value.action === 'set-fps' && typeof value.fps === 'number' && Number.isFinite(value.fps) && value.fps > 0) {
      return { type: value.type, sessionId, action: value.action, fps: value.fps };
    }
    if (value.action === 'set-duration' && typeof value.durationSeconds === 'number' && Number.isFinite(value.durationSeconds) && value.durationSeconds > 0) {
      return { type: value.type, sessionId, action: value.action, durationSeconds: value.durationSeconds };
    }
    if (value.action === 'set-scale' && typeof value.scale === 'number' && Number.isFinite(value.scale) && value.scale > 0) {
      return { type: value.type, sessionId, action: value.action, scale: value.scale };
    }
    if (value.action === 'set-aspect-preset' && isExternalControlExportAspectPreset(value.aspectPreset)) {
      return { type: value.type, sessionId, action: value.action, aspectPreset: value.aspectPreset };
    }
    if (value.action === 'set-transparent' && typeof value.enabled === 'boolean') {
      return { type: value.type, sessionId, action: value.action, enabled: value.enabled };
    }
  }


  if (
    value.type === 'external-control-export-preset'
    && isExternalControlExportPresetId(value.presetId)
    && (value.action === 'apply' || value.action === 'enqueue' || value.action === 'start')
  ) {
    return {
      type: value.type,
      sessionId: typeof value.sessionId === 'string' ? value.sessionId : undefined,
      presetId: value.presetId,
      action: value.action,
    };
  }

  if (value.type === 'external-control-export-preset-query' && value.action === 'status') {
    return {
      type: value.type,
      sessionId: typeof value.sessionId === 'string' ? value.sessionId : undefined,
      action: value.action,
    };
  }

  if (value.type === 'external-control-camera-path') {
    const sessionId = typeof value.sessionId === 'string' ? value.sessionId : undefined;
    if (
      (value.action === 'capture-slot'
        || value.action === 'load-slot'
        || value.action === 'morph-slot'
        || value.action === 'clear-slot')
      && typeof value.slotIndex === 'number'
      && Number.isInteger(value.slotIndex)
      && value.slotIndex >= 0
    ) {
      return {
        type: value.type,
        sessionId,
        action: value.action,
        slotIndex: value.slotIndex,
      };
    }
    if (value.action === 'play' || value.action === 'stop' || value.action === 'copy-duration-to-export') {
      return {
        type: value.type,
        sessionId,
        action: value.action,
      };
    }
    if (value.action === 'set-duration' && typeof value.durationSeconds === 'number' && Number.isFinite(value.durationSeconds) && value.durationSeconds > 0) {
      return {
        type: value.type,
        sessionId,
        action: value.action,
        durationSeconds: value.durationSeconds,
      };
    }
    if (value.action === 'set-export-enabled' && typeof value.enabled === 'boolean') {
      return {
        type: value.type,
        sessionId,
        action: value.action,
        enabled: value.enabled,
      };
    }
  }

  return null;
}

export function mapExternalControlOscMessage(args: {
  address: string;
  args?: unknown[];
  sessionId?: string;
}): ExternalControlInboundMessage | null {
  const normalizedAddress = normalizeOscAddress(args.address);
  const oscArgs = args.args ?? [];
  const sessionId = args.sessionId;

  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/handshake`) {
    return { type: 'external-control-handshake', sessionId };
  }

  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/randomize`) {
    return { type: 'external-control-action', sessionId, action: 'randomize' };
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/seed/replay`) {
    return { type: 'external-control-action', sessionId, action: 'replay-seed' };
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/audio/start`) {
    return { type: 'external-control-action', sessionId, action: 'audio-start' };
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/audio/stop`) {
    return { type: 'external-control-action', sessionId, action: 'audio-stop' };
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/sequence/start`) {
    return { type: 'external-control-action', sessionId, action: 'sequence-start' };
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/sequence/stop`) {
    return { type: 'external-control-action', sessionId, action: 'sequence-stop' };
  }

  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/config/patch`) {
    const patch = readOscJsonObjectArg(oscArgs[0]);
    return patch ? { type: 'external-control-patch-config', sessionId, patch: patch as Partial<ParticleConfig> } : null;
  }

  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/config/replace`) {
    const config = readOscJsonObjectArg(oscArgs[0]);
    return config ? { type: 'external-control-replace-config', sessionId, config: config as Partial<ParticleConfig> } : null;
  }

  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/preset/load`) {
    const presetId = readOscStringArg(oscArgs[0]);
    const transitionMode = oscArgs[1] === 'morph' ? 'morph' : oscArgs[1] === 'instant' || typeof oscArgs[1] === 'undefined' ? 'instant' : null;
    return presetId && transitionMode
      ? { type: 'external-control-load-preset', sessionId, presetId, transitionMode }
      : null;
  }

  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/sequence/select`) {
    const itemId = oscArgs[0] === null ? null : readOscStringArg(oscArgs[0]);
    return oscArgs[0] === null || itemId
      ? { type: 'external-control-select-sequence-item', sessionId, itemId }
      : null;
  }

  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/queue/enqueue-video-webm`) {
    return { type: 'external-control-export-queue', sessionId, action: 'enqueue-video-webm' };
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/queue/enqueue-png-sequence`) {
    return { type: 'external-control-export-queue', sessionId, action: 'enqueue-png-sequence' };
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/queue/enqueue-gif`) {
    return { type: 'external-control-export-queue', sessionId, action: 'enqueue-gif' };
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/queue/start`) {
    return { type: 'external-control-export-queue', sessionId, action: 'start' };
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/queue/cancel`) {
    return { type: 'external-control-export-queue', sessionId, action: 'cancel' };
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/queue/clear`) {
    return { type: 'external-control-export-queue', sessionId, action: 'clear' };
  }

  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/mode`) {
    const mode = oscArgs[0] === 'current' || oscArgs[0] === 'sequence' ? oscArgs[0] : null;
    return mode ? { type: 'external-control-export-settings', sessionId, action: 'set-mode', mode } : null;
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/fps`) {
    const fps = readOscNumberArg(oscArgs[0]);
    return fps !== null && fps > 0
      ? { type: 'external-control-export-settings', sessionId, action: 'set-fps', fps }
      : null;
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/duration`) {
    const durationSeconds = readOscNumberArg(oscArgs[0]);
    return durationSeconds !== null && durationSeconds > 0
      ? { type: 'external-control-export-settings', sessionId, action: 'set-duration', durationSeconds }
      : null;
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/scale`) {
    const scale = readOscNumberArg(oscArgs[0]);
    return scale !== null && scale > 0
      ? { type: 'external-control-export-settings', sessionId, action: 'set-scale', scale }
      : null;
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/aspect`) {
    const aspectPreset = oscArgs[0];
    return isExternalControlExportAspectPreset(aspectPreset)
      ? { type: 'external-control-export-settings', sessionId, action: 'set-aspect-preset', aspectPreset }
      : null;
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/transparent`) {
    const enabled = readOscBooleanArg(oscArgs[0]);
    return enabled !== null
      ? { type: 'external-control-export-settings', sessionId, action: 'set-transparent', enabled }
      : null;
  }


  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/preset/apply`) {
    const presetId = oscArgs[0];
    return isExternalControlExportPresetId(presetId)
      ? { type: 'external-control-export-preset', sessionId, presetId, action: 'apply' }
      : null;
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/preset/enqueue`) {
    const presetId = oscArgs[0];
    return isExternalControlExportPresetId(presetId)
      ? { type: 'external-control-export-preset', sessionId, presetId, action: 'enqueue' }
      : null;
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/preset/start`) {
    const presetId = oscArgs[0];
    return isExternalControlExportPresetId(presetId)
      ? { type: 'external-control-export-preset', sessionId, presetId, action: 'start' }
      : null;
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/preset/status`) {
    return { type: 'external-control-export-preset-query', sessionId, action: 'status' };
  }

  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/camera-path/capture`) {
    const slotIndex = readOscSlotIndexArg(oscArgs[0]);
    return slotIndex !== null
      ? { type: 'external-control-camera-path', sessionId, action: 'capture-slot', slotIndex }
      : null;
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/camera-path/load`) {
    const slotIndex = readOscSlotIndexArg(oscArgs[0]);
    return slotIndex !== null
      ? { type: 'external-control-camera-path', sessionId, action: 'load-slot', slotIndex }
      : null;
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/camera-path/morph`) {
    const slotIndex = readOscSlotIndexArg(oscArgs[0]);
    return slotIndex !== null
      ? { type: 'external-control-camera-path', sessionId, action: 'morph-slot', slotIndex }
      : null;
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/camera-path/clear`) {
    const slotIndex = readOscSlotIndexArg(oscArgs[0]);
    return slotIndex !== null
      ? { type: 'external-control-camera-path', sessionId, action: 'clear-slot', slotIndex }
      : null;
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/camera-path/play`) {
    return { type: 'external-control-camera-path', sessionId, action: 'play' };
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/camera-path/stop`) {
    return { type: 'external-control-camera-path', sessionId, action: 'stop' };
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/camera-path/duration`) {
    const durationSeconds = readOscNumberArg(oscArgs[0]);
    return durationSeconds !== null && durationSeconds > 0
      ? { type: 'external-control-camera-path', sessionId, action: 'set-duration', durationSeconds }
      : null;
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/camera-path/export-enabled`) {
    const enabled = readOscBooleanArg(oscArgs[0]);
    return enabled !== null
      ? { type: 'external-control-camera-path', sessionId, action: 'set-export-enabled', enabled }
      : null;
  }
  if (normalizedAddress === `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/camera-path/copy-duration-to-export`) {
    return { type: 'external-control-camera-path', sessionId, action: 'copy-duration-to-export' };
  }

  return null;
}
