import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef } from 'react';
import type { ParticleConfig, PresetRecord, PresetSequenceItem } from '../types';
import { normalizeConfig } from './appStateConfigNormalization';
import { createAudioRouteStateMap, evaluateAudioRoutes } from './audioReactiveRuntime';
import type { AudioLevels } from './audioControllerTypes';
import { buildSeededAudioMutationConfig } from './projectSeedRuntime';
import { appendSequenceAudioTriggerDebugHistory, clearSequenceAudioTriggerDebug, writeSequenceAudioTriggerDebug, type SequenceAudioTriggerTarget } from './audioReactiveDebug';
import { getSequenceItemResolvedConfig } from './sequenceEditingShared';

const STEP_ADVANCE_TARGET = 'sequence.stepAdvance';
const CROSSFADE_TARGET = 'sequence.crossfade';
const RANDOMIZE_SEED_TARGET = 'sequence.randomizeSeed';
const SEQUENCE_SEED_MUTATION_SCOPE_TARGETS = {
  motion: 'sequence.seedMutation.motion',
  structure: 'sequence.seedMutation.structure',
  surface: 'sequence.seedMutation.surface',
  hybrid: 'sequence.seedMutation.hybrid',
} as const;
const SEQUENCE_AUDIO_TARGETS = new Set([
  STEP_ADVANCE_TARGET,
  CROSSFADE_TARGET,
  RANDOMIZE_SEED_TARGET,
  'sequence.seedMutation',
  ...Object.values(SEQUENCE_SEED_MUTATION_SCOPE_TARGETS),
]);


function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function resolveSequenceEnterThreshold(config: ParticleConfig) {
  return clamp(config.audioSequenceEnterThreshold, 0.05, 1.5);
}

function resolveSequenceExitThreshold(config: ParticleConfig, enterThreshold: number) {
  return clamp(Math.min(config.audioSequenceExitThreshold, enterThreshold), 0, enterThreshold);
}

function resolveSequenceCooldownMs(config: ParticleConfig, target: string) {
  if (target === STEP_ADVANCE_TARGET) {
    return clamp(config.audioSequenceStepAdvanceCooldownMs, 0, 10000);
  }
  if (target === CROSSFADE_TARGET) {
    return clamp(config.audioSequenceCrossfadeCooldownMs, 0, 10000);
  }
  if (target === RANDOMIZE_SEED_TARGET) {
    return clamp(config.audioSequenceRandomizeSeedCooldownMs, 0, 10000);
  }
  return 400;
}

function getNextSequenceIndex(activeSequenceItemId: string | null, presetSequence: PresetSequenceItem[], sequenceLoopEnabled: boolean) {
  if (presetSequence.length === 0) {
    return -1;
  }

  const currentIndex = activeSequenceItemId
    ? presetSequence.findIndex((item) => item.id === activeSequenceItemId)
    : -1;

  if (currentIndex < 0) {
    return 0;
  }

  const nextIndex = currentIndex + 1;
  if (nextIndex < presetSequence.length) {
    return nextIndex;
  }

  return sequenceLoopEnabled ? 0 : -1;
}

function resolveSequenceTriggerRouteValue(target: string, routes: ReturnType<typeof evaluateAudioRoutes>) {
  let strongest = 0;
  for (const route of routes) {
    const isSeedMutationAlias = (
      target === RANDOMIZE_SEED_TARGET
      && (
        route.target === 'sequence.seedMutation'
        || route.target === SEQUENCE_SEED_MUTATION_SCOPE_TARGETS.motion
        || route.target === SEQUENCE_SEED_MUTATION_SCOPE_TARGETS.structure
        || route.target === SEQUENCE_SEED_MUTATION_SCOPE_TARGETS.surface
        || route.target === SEQUENCE_SEED_MUTATION_SCOPE_TARGETS.hybrid
      )
    );
    const isTargetMatch = route.target === target || isSeedMutationAlias;
    if (!isTargetMatch) {
      continue;
    }
    strongest = Math.max(strongest, route.value);
  }
  return strongest;
}


function resolveSeedMutationTarget(routes: ReturnType<typeof evaluateAudioRoutes>) {
  let strongestTarget: SequenceAudioTriggerTarget = RANDOMIZE_SEED_TARGET;
  let strongestValue = 0;

  const candidates: SequenceAudioTriggerTarget[] = [
    RANDOMIZE_SEED_TARGET,
    SEQUENCE_SEED_MUTATION_SCOPE_TARGETS.motion,
    SEQUENCE_SEED_MUTATION_SCOPE_TARGETS.structure,
    SEQUENCE_SEED_MUTATION_SCOPE_TARGETS.surface,
    SEQUENCE_SEED_MUTATION_SCOPE_TARGETS.hybrid,
  ];

  for (const candidate of candidates) {
    const value = resolveSequenceTriggerRouteValue(candidate, routes);
    if (value > strongestValue) {
      strongestValue = value;
      strongestTarget = candidate;
    }
  }

  return {
    target: strongestTarget,
    value: strongestValue,
  };
}

function resolveSeedMutationScope(
  target: SequenceAudioTriggerTarget,
  fallbackScope: ParticleConfig['audioSequenceSeedMutationScope'],
) {
  if (target === SEQUENCE_SEED_MUTATION_SCOPE_TARGETS.motion) return 'motion';
  if (target === SEQUENCE_SEED_MUTATION_SCOPE_TARGETS.structure) return 'structure';
  if (target === SEQUENCE_SEED_MUTATION_SCOPE_TARGETS.surface) return 'surface';
  if (target === SEQUENCE_SEED_MUTATION_SCOPE_TARGETS.hybrid) return 'hybrid';
  return fallbackScope;
}

type UseSequenceAudioTriggersArgs = {
  activeSequenceItemId: string | null;
  applyConfigMorph: (targetConfig: ParticleConfig, durationSeconds: number, nextPresetId?: string | null, easing?: PresetSequenceItem['transitionEasing']) => boolean;
  audioRef: MutableRefObject<AudioLevels>;
  config: ParticleConfig;
  isPresetTransitioning: boolean;
  isPublicLibraryMode: boolean;
  latestConfigRef: MutableRefObject<ParticleConfig>;
  presetSequence: PresetSequenceItem[];
  presets: PresetRecord[];
  sequenceLoopEnabled: boolean;
  setActiveSequenceItemId: Dispatch<SetStateAction<string | null>>;
  setSequenceStepProgress: Dispatch<SetStateAction<number>>;
};

export function useSequenceAudioTriggers({
  activeSequenceItemId,
  applyConfigMorph,
  audioRef,
  config,
  isPresetTransitioning,
  isPublicLibraryMode,
  latestConfigRef,
  presetSequence,
  presets,
  sequenceLoopEnabled,
  setActiveSequenceItemId,
  setSequenceStepProgress,
}: UseSequenceAudioTriggersArgs) {
  const routeStateRef = useRef(createAudioRouteStateMap());
  const targetActiveRef = useRef(new Map<string, boolean>());
  const targetLastTriggeredAtRef = useRef(new Map<string, number>());
  const debugLastCommitAtRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (isPublicLibraryMode || isPresetTransitioning || !config.audioEnabled || !config.audioRoutesEnabled) {
      routeStateRef.current.clear();
      targetActiveRef.current.clear();
      clearSequenceAudioTriggerDebug();
      return;
    }

    const sequenceRoutes = config.audioRoutes.filter((route) => route.enabled && SEQUENCE_AUDIO_TARGETS.has(route.target));
    if (sequenceRoutes.length === 0) {
      routeStateRef.current.clear();
      targetActiveRef.current.clear();
      clearSequenceAudioTriggerDebug();
      return;
    }

    let frameId = 0;

    const tick = () => {
      const evaluatedRoutes = evaluateAudioRoutes({
        audioEnabled: config.audioEnabled,
        audioRoutesEnabled: config.audioRoutesEnabled,
        audioRoutes: sequenceRoutes,
      }, audioRef.current, routeStateRef.current);

      const now = performance.now();
      const stepAdvanceValue = resolveSequenceTriggerRouteValue(STEP_ADVANCE_TARGET, evaluatedRoutes);
      const crossfadeValue = resolveSequenceTriggerRouteValue(CROSSFADE_TARGET, evaluatedRoutes);
      const seedMutationState = resolveSeedMutationTarget(evaluatedRoutes);
      const randomizeSeedValue = seedMutationState.value;

      const enterThreshold = resolveSequenceEnterThreshold(config);
      const exitThreshold = resolveSequenceExitThreshold(config, enterThreshold);

      const processTarget = (
        target: SequenceAudioTriggerTarget,
        value: number,
        onTrigger: (intensity: number) => void,
      ) => {
        const wasActive = targetActiveRef.current.get(target) ?? false;
        const isActive = wasActive ? value >= exitThreshold : value >= enterThreshold;
        targetActiveRef.current.set(target, isActive);

        const cooldownMs = resolveSequenceCooldownMs(config, target);
        const lastTriggeredAt = targetLastTriggeredAtRef.current.get(target);
        const msSinceLastTrigger = typeof lastTriggeredAt === 'number'
          ? Math.max(0, now - lastTriggeredAt)
          : null;

        if (!isActive) {
          if (wasActive) {
            appendSequenceAudioTriggerDebugHistory({
              updatedAt: now,
              target,
              kind: 'exit',
              value,
              cooldownMs,
              msSinceLastTrigger,
              detail: `exit < ${exitThreshold.toFixed(2)}`,
            });
          }
          return;
        }

        if (wasActive) {
          return;
        }

        if (msSinceLastTrigger !== null && msSinceLastTrigger < cooldownMs) {
          appendSequenceAudioTriggerDebugHistory({
            updatedAt: now,
            target,
            kind: 'blocked',
            value,
            cooldownMs,
            msSinceLastTrigger,
            detail: `hold ${(cooldownMs - msSinceLastTrigger).toFixed(0)}ms`,
          });
          return;
        }

        targetLastTriggeredAtRef.current.set(target, now);
        appendSequenceAudioTriggerDebugHistory({
          updatedAt: now,
          target,
          kind: 'trigger',
          value,
          cooldownMs,
          msSinceLastTrigger,
          detail: `enter ≥ ${enterThreshold.toFixed(2)}`,
        });
        onTrigger(value);
      };

      processTarget(STEP_ADVANCE_TARGET, stepAdvanceValue, () => {
        const nextIndex = getNextSequenceIndex(activeSequenceItemId, presetSequence, sequenceLoopEnabled);
        if (nextIndex < 0) {
          return;
        }

        const nextItem = presetSequence[nextIndex];
        if (!nextItem) {
          return;
        }

        const nextConfig = getSequenceItemResolvedConfig(nextItem, presets);
        if (!nextConfig) {
          return;
        }

        setActiveSequenceItemId(nextItem.id);
        setSequenceStepProgress(0);
        applyConfigMorph(
          nextConfig,
          Math.max(0.05, nextItem.transitionSeconds),
          nextItem.keyframeConfig ? null : nextItem.presetId,
          nextItem.transitionEasing,
        );
      });

      processTarget(CROSSFADE_TARGET, crossfadeValue, (intensity) => {
        const nextIndex = getNextSequenceIndex(activeSequenceItemId, presetSequence, sequenceLoopEnabled);
        if (nextIndex < 0) {
          return;
        }

        const nextItem = presetSequence[nextIndex];
        if (!nextItem) {
          return;
        }

        const nextConfig = getSequenceItemResolvedConfig(nextItem, presets);
        if (!nextConfig) {
          return;
        }

        const crossfadeDuration = clamp(1.45 - (intensity * 1.05), 0.18, 1.45);
        setActiveSequenceItemId(nextItem.id);
        setSequenceStepProgress(0);
        applyConfigMorph(
          nextConfig,
          crossfadeDuration,
          nextItem.keyframeConfig ? null : nextItem.presetId,
          nextItem.transitionEasing,
        );
      });

      processTarget(seedMutationState.target, randomizeSeedValue, (intensity) => {
        const mutationStrength = clamp(config.audioSequenceSeedMutationStrength * Math.max(0.35, intensity), 0.05, 1.5);
        const mutationScope = resolveSeedMutationScope(seedMutationState.target, config.audioSequenceSeedMutationScope);
        const randomizedConfig = normalizeConfig(buildSeededAudioMutationConfig(
          latestConfigRef.current,
          mutationStrength,
          mutationScope,
        ));
        const randomizeDuration = clamp(0.2 + (1 - intensity) * 0.8, 0.2, 1);
        applyConfigMorph(randomizedConfig, randomizeDuration, null, 'ease-in-out');
      });

      if (now - debugLastCommitAtRef.current >= 120) {
        const createDebugTarget = (target: SequenceAudioTriggerTarget, value: number) => {
          const cooldownMs = resolveSequenceCooldownMs(config, target);
          const lastTriggeredAt = targetLastTriggeredAtRef.current.get(target);
          const msSinceLastTrigger = typeof lastTriggeredAt === 'number' ? Math.max(0, now - lastTriggeredAt) : null;
          return {
            target,
            value,
            active: targetActiveRef.current.get(target) ?? false,
            cooldownMs,
            msSinceLastTrigger,
            ready: msSinceLastTrigger === null ? true : msSinceLastTrigger >= cooldownMs,
          };
        };

        writeSequenceAudioTriggerDebug({
          updatedAt: now,
          enterThreshold,
          exitThreshold,
          targets: [
            createDebugTarget(STEP_ADVANCE_TARGET, stepAdvanceValue),
            createDebugTarget(CROSSFADE_TARGET, crossfadeValue),
            createDebugTarget(seedMutationState.target, randomizeSeedValue),
          ],
        });
        debugLastCommitAtRef.current = now;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      clearSequenceAudioTriggerDebug();
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [
    activeSequenceItemId,
    applyConfigMorph,
    audioRef,
    config.audioEnabled,
    config.audioRoutes,
    config.audioRoutesEnabled,
    isPresetTransitioning,
    isPublicLibraryMode,
    latestConfigRef,
    presetSequence,
    presets,
    sequenceLoopEnabled,
    setActiveSequenceItemId,
    setSequenceStepProgress,
  ]);
}
