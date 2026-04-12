import React from "react";

import type { ParticleConfig } from "../types";
import { AUDIO_SEQUENCE_SEED_MUTATION_SCOPES } from "../types/audioReactive";
import {
  AUDIO_SEQUENCE_TRIGGER_TUNING_PRESETS,
  createAudioSequenceTriggerTuningPatch,
  type AudioSequenceTriggerTuningPresetId,
} from "../lib/audioSequenceTriggerPresets";
import type {
  SequenceAudioTriggerDebugHistoryEntry,
  SequenceAudioTriggerDebugHistoryEntryKind,
} from "../lib/audioReactiveDebug";
import { Slider, Toggle } from "./controlPanelParts";
import type { UpdateConfig } from "./controlPanelTabsShared";
import { useAudioSequenceTriggerDebug } from "./useAudioSequenceTriggerDebug";

interface AudioSequenceTriggerPanelProps {
  config: ParticleConfig;
  updateConfig: UpdateConfig;
}

function getSequenceTriggerHistoryKindLabel(
  kind: SequenceAudioTriggerDebugHistoryEntryKind,
) {
  if (kind === "trigger") {
    return "trigger";
  }
  if (kind === "blocked") {
    return "blocked";
  }
  return "exit";
}

function getSequenceTriggerHistorySecondaryLabel(
  entry: SequenceAudioTriggerDebugHistoryEntry,
) {
  if (entry.kind === "exit") {
    return `value ${entry.value.toFixed(3)}`;
  }

  if (entry.msSinceLastTrigger === null) {
    return `value ${entry.value.toFixed(3)} · first`;
  }

  return `value ${entry.value.toFixed(3)} · ${entry.msSinceLastTrigger.toFixed(0)}ms since last`;
}

export const AudioSequenceTriggerPanel: React.FC<
  AudioSequenceTriggerPanelProps
> = ({ config, updateConfig }) => {
  const { snapshot: sequenceTriggerDebug, history: sequenceTriggerHistory } =
    useAudioSequenceTriggerDebug(config.audioEnabled, config.audioRoutesEnabled);

  const applySequenceTriggerTuningPreset = React.useCallback(
    (presetId: AudioSequenceTriggerTuningPresetId) => {
      const patch = createAudioSequenceTriggerTuningPatch(config, presetId);
      updateConfig(
        "audioSequenceEnterThreshold",
        patch.audioSequenceEnterThreshold,
      );
      updateConfig(
        "audioSequenceExitThreshold",
        patch.audioSequenceExitThreshold,
      );
      updateConfig(
        "audioSequenceStepAdvanceCooldownMs",
        patch.audioSequenceStepAdvanceCooldownMs,
      );
      updateConfig(
        "audioSequenceCrossfadeCooldownMs",
        patch.audioSequenceCrossfadeCooldownMs,
      );
      updateConfig(
        "audioSequenceRandomizeSeedCooldownMs",
        patch.audioSequenceRandomizeSeedCooldownMs,
      );
      updateConfig(
        "audioSequenceSeedMutationStrength",
        patch.audioSequenceSeedMutationStrength,
      );
      updateConfig(
        "audioSequenceSeedMutationScope",
        patch.audioSequenceSeedMutationScope,
      );
    },
    [config, updateConfig],
  );

  return (
    <>
      <div className="mt-4 rounded border border-white/10 bg-black/10 px-3 py-3 text-panel text-white/70">
        <div className="mb-2 uppercase tracking-widest text-white/45">
          Sequence Trigger Tuning
        </div>
        <div className="mb-2 text-panel-sm uppercase tracking-widest text-white/35">
          Applies to sequence.stepAdvance / crossfade / randomizeSeed /
          sequence.seedMutation targets.
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {AUDIO_SEQUENCE_TRIGGER_TUNING_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applySequenceTriggerTuningPreset(preset.id)}
              className="rounded border border-white/15 bg-white/5 px-2 py-1 text-panel-sm uppercase hover:bg-white/10"
              title={preset.description}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <Slider
          label="Trigger Enter Threshold"
          value={config.audioSequenceEnterThreshold}
          min={0.05}
          max={1.5}
          step={0.01}
          onChange={(v) => updateConfig("audioSequenceEnterThreshold", v)}
        />
        <Slider
          label="Trigger Exit Threshold"
          value={config.audioSequenceExitThreshold}
          min={0}
          max={1.5}
          step={0.01}
          onChange={(v) => updateConfig("audioSequenceExitThreshold", v)}
        />
        <Slider
          label="Step Advance Cooldown (ms)"
          value={config.audioSequenceStepAdvanceCooldownMs}
          min={0}
          max={4000}
          step={10}
          onChange={(v) => updateConfig("audioSequenceStepAdvanceCooldownMs", v)}
        />
        <Slider
          label="Crossfade Cooldown (ms)"
          value={config.audioSequenceCrossfadeCooldownMs}
          min={0}
          max={4000}
          step={10}
          onChange={(v) => updateConfig("audioSequenceCrossfadeCooldownMs", v)}
        />
        <Slider
          label="Randomize Seed Cooldown (ms)"
          value={config.audioSequenceRandomizeSeedCooldownMs}
          min={0}
          max={6000}
          step={10}
          onChange={(v) =>
            updateConfig("audioSequenceRandomizeSeedCooldownMs", v)
          }
        />
        <Slider
          label="Seed Mutation Strength"
          value={config.audioSequenceSeedMutationStrength}
          min={0.05}
          max={1.5}
          step={0.01}
          onChange={(v) => updateConfig("audioSequenceSeedMutationStrength", v)}
        />
        <Toggle
          label="Seed Mutation Scope"
          value={config.audioSequenceSeedMutationScope}
          options={AUDIO_SEQUENCE_SEED_MUTATION_SCOPES.map((scope) => ({
            label: scope,
            val: scope,
          }))}
          onChange={(value) =>
            updateConfig("audioSequenceSeedMutationScope", value)
          }
        />
      </div>
      <div className="mt-4 rounded border border-white/10 bg-black/10 px-3 py-3 text-panel text-white/70">
        <div className="mb-2 uppercase tracking-widest text-white/45">
          Sequence Trigger State
        </div>
        {sequenceTriggerDebug ? (
          <>
            <div className="mb-2 text-panel-sm uppercase tracking-widest text-white/35">
              Enter {sequenceTriggerDebug.enterThreshold.toFixed(2)} / Exit{" "}
              {sequenceTriggerDebug.exitThreshold.toFixed(2)} / Updated{" "}
              {Math.max(
                0,
                performance.now() - sequenceTriggerDebug.updatedAt,
              ).toFixed(0)}
              ms ago
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {sequenceTriggerDebug.targets.map((targetState) => (
                <div
                  key={targetState.target}
                  className="rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-panel-sm uppercase tracking-widest"
                >
                  <div className="mb-1 text-white/70">{targetState.target}</div>
                  <div className="text-white/50">
                    Value {targetState.value.toFixed(3)}
                  </div>
                  <div className="text-white/50">
                    State {targetState.active ? "active" : "idle"} /{" "}
                    {targetState.ready ? "ready" : "cooldown"}
                  </div>
                  <div className="text-white/50">
                    Cooldown {targetState.cooldownMs.toFixed(0)}ms
                  </div>
                  <div className="text-white/50">
                    Last Trigger{" "}
                    {targetState.msSinceLastTrigger === null
                      ? "never"
                      : `${targetState.msSinceLastTrigger.toFixed(0)}ms ago`}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-panel-sm uppercase tracking-widest text-white/35">
            Sequence trigger debug is idle. Enable audio, routes, and sequence
            trigger targets to see live state.
          </div>
        )}
      </div>
      <div className="mt-4 rounded border border-white/10 bg-black/10 px-3 py-3 text-panel text-white/70">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="uppercase tracking-widest text-white/45">
            Sequence Trigger History
          </div>
          <div className="text-panel-sm uppercase tracking-widest text-white/35">
            recent {sequenceTriggerHistory.length} / 18
          </div>
        </div>
        {sequenceTriggerHistory.length > 0 ? (
          <div className="flex flex-col gap-2">
            {sequenceTriggerHistory.map((entry) => (
              <div
                key={entry.id}
                className="rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-panel-sm uppercase tracking-widest"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-white/70">
                    {entry.target} · {getSequenceTriggerHistoryKindLabel(entry.kind)}
                  </div>
                  <div className="text-white/35">
                    {Math.max(0, performance.now() - entry.updatedAt).toFixed(0)}ms ago
                  </div>
                </div>
                <div className="mt-1 text-white/50">
                  {getSequenceTriggerHistorySecondaryLabel(entry)}
                </div>
                <div className="text-white/50">
                  Cooldown {entry.cooldownMs.toFixed(0)}ms
                  {entry.detail ? ` · ${entry.detail}` : ""}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-panel-sm uppercase tracking-widest text-white/35">
            No history yet. Trigger a sequence audio route to record trigger /
            blocked / exit events.
          </div>
        )}
      </div>
    </>
  );
};
