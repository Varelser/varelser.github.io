import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import type { ParticleConfig, PresetRecord } from '../types';
import { normalizeConfig } from './appStateConfigNormalization';
import {
  EMPTY_PUBLIC_PRESET_LIBRARY,
  hasPersistedPresetRecords,
  loadPresetRecords,
  loadPublicPresetLibraryData,
  PRESET_STORAGE_KEY,
} from './appStateLibrary';
import type { Notice } from './audioControllerTypes';
import { createPresetRecord, duplicatePresetRecord } from './presetRecordFactory';
import { buildSeededRandomizedPresetConfig } from './projectSeedRuntime';
import {
  loadCoreStarterPresetLibrary,
  loadStarterFutureNativeAugmentation,
  loadStarterProductPackAugmentation,
  mergeStarterLibraryAugmentation,
} from './starterLibrary';
import { scheduleDeferredHydration } from './scheduleDeferredHydration';

type UsePresetLibraryArgs = {
  capturePresetThumbnail: () => string | null;
  config: ParticleConfig;
  isPublicLibraryMode: boolean;
  setConfig: Dispatch<SetStateAction<ParticleConfig>>;
};

export function usePresetLibrary({
  capturePresetThumbnail,
  config,
  isPublicLibraryMode,
  setConfig,
}: UsePresetLibraryArgs) {
  const [presets, setPresets] = useState<PresetRecord[]>(() => (
    isPublicLibraryMode ? EMPTY_PUBLIC_PRESET_LIBRARY.presets : loadPresetRecords()
  ));
  const [activePresetId, setActivePresetId] = useState<string | null>(() => (
    isPublicLibraryMode
      ? (EMPTY_PUBLIC_PRESET_LIBRARY.activePresetId ?? EMPTY_PUBLIC_PRESET_LIBRARY.presets[0]?.id ?? null)
      : null
  ));
  const [presetBlendDuration, setPresetBlendDuration] = useState(() => (
    isPublicLibraryMode ? EMPTY_PUBLIC_PRESET_LIBRARY.presetBlendDuration : 1.5
  ));
  const [libraryNotice, setLibraryNotice] = useState<Notice | null>(null);

  const validPresetIds = useMemo(
    () => new Set(presets.map((preset) => preset.id)),
    [presets],
  );

  const activePreset = useMemo(
    () => presets.find((preset) => preset.id === activePresetId) ?? null,
    [activePresetId, presets],
  );

  const isPresetDirty = useMemo(() => {
    if (!activePreset) {
      return false;
    }
    return JSON.stringify(activePreset.config) !== JSON.stringify(config);
  }, [activePreset, config]);

  const handleRandomize = useCallback(() => {
    if (isPublicLibraryMode) {
      setLibraryNotice({ tone: 'error', message: 'Public build is locked for exhibition viewing.' });
      return;
    }

    setConfig((prev) => normalizeConfig(buildSeededRandomizedPresetConfig(prev)));
  }, [isPublicLibraryMode, setConfig]);

  const handleCreatePreset = useCallback((name: string) => {
    if (isPublicLibraryMode) {
      setLibraryNotice({ tone: 'error', message: 'Public library is read-only in this build.' });
      return;
    }

    const preset = createPresetRecord(config, name, presets.length, capturePresetThumbnail());
    setPresets((prev) => [preset, ...prev]);
    setActivePresetId(preset.id);
  }, [capturePresetThumbnail, config, isPublicLibraryMode, presets.length]);

  const handleOverwritePreset = useCallback((presetId: string) => {
    if (isPublicLibraryMode) {
      setLibraryNotice({ tone: 'error', message: 'Public library is read-only in this build.' });
      return;
    }

    const now = new Date().toISOString();
    setPresets((prev) => prev.map((preset) => (
      preset.id === presetId
        ? {
          ...preset,
          config: normalizeConfig(config),
          updatedAt: now,
          thumbnailDataUrl: capturePresetThumbnail(),
        }
        : preset
    )));
    setActivePresetId(presetId);
  }, [capturePresetThumbnail, config, isPublicLibraryMode]);

  const handleRenamePreset = useCallback((presetId: string, nextName: string) => {
    if (isPublicLibraryMode) {
      setLibraryNotice({ tone: 'error', message: 'Public library is read-only in this build.' });
      return;
    }

    const trimmedName = nextName.trim();
    if (!trimmedName) {
      return;
    }

    const now = new Date().toISOString();
    setPresets((prev) => prev.map((preset) => (
      preset.id === presetId
        ? { ...preset, name: trimmedName, updatedAt: now }
        : preset
    )));
  }, [isPublicLibraryMode]);

  const handleDuplicatePreset = useCallback((presetId: string) => {
    if (isPublicLibraryMode) {
      setLibraryNotice({ tone: 'error', message: 'Public library is read-only in this build.' });
      return;
    }

    const sourcePreset = presets.find((preset) => preset.id === presetId);
    if (!sourcePreset) {
      return;
    }

    const duplicate = duplicatePresetRecord(sourcePreset);
    setPresets((prev) => [duplicate, ...prev]);
    setActivePresetId(duplicate.id);
    setConfig(normalizeConfig(duplicate.config));
  }, [isPublicLibraryMode, presets, setConfig]);

  const handleDeletePreset = useCallback((presetId: string) => {
    if (isPublicLibraryMode) {
      setLibraryNotice({ tone: 'error', message: 'Public library is read-only in this build.' });
      return;
    }

    setPresets((prev) => prev.filter((preset) => preset.id !== presetId));
    setActivePresetId((prev) => (prev === presetId ? null : prev));
  }, [isPublicLibraryMode]);

  const handleDismissLibraryNotice = useCallback(() => {
    setLibraryNotice(null);
  }, []);

  useEffect(() => {
    if (!isPublicLibraryMode) {
      return;
    }
    let cancelled = false;
    void loadPublicPresetLibraryData().then((publicLibrary) => {
      if (cancelled) return;
      setPresets(publicLibrary.presets);
      setActivePresetId(publicLibrary.activePresetId ?? publicLibrary.presets[0]?.id ?? null);
      setPresetBlendDuration(publicLibrary.presetBlendDuration);
    }).catch((error) => {
      console.warn('Failed to hydrate public preset library:', error);
    });
    return () => {
      cancelled = true;
    };
  }, [isPublicLibraryMode]);

  useEffect(() => {
    if (isPublicLibraryMode || hasPersistedPresetRecords() || presets.length > 0) {
      return;
    }
    let cancelled = false;
    let augmentCleanup = () => {};
    const cleanup = scheduleDeferredHydration(() => {
      void loadCoreStarterPresetLibrary().then((starterLibrary) => {
        if (cancelled) return;
        setPresets((prev) => (prev.length > 0 ? prev : starterLibrary.presets));
        setActivePresetId((prev) => prev ?? starterLibrary.activePresetId ?? starterLibrary.presets[0]?.id ?? null);
        setPresetBlendDuration((prev) => (prev == 1.5 ? starterLibrary.presetBlendDuration : prev));
        augmentCleanup = scheduleDeferredHydration(() => {
          void Promise.all([
            loadStarterProductPackAugmentation(),
            loadStarterFutureNativeAugmentation(),
          ]).then(([productAugmentation, futureNativeAugmentation]) => {
            if (cancelled) return;
            setPresets((prev) => mergeStarterLibraryAugmentation(
              mergeStarterLibraryAugmentation({
                ...starterLibrary,
                presets: prev,
                presetSequence: [],
              }, productAugmentation),
              futureNativeAugmentation,
            ).presets);
          }).catch((error) => {
            console.warn('Failed to hydrate starter future-native presets:', error);
          });
        }, 2400);
        if (cancelled) augmentCleanup();
      }).catch((error) => {
        console.warn('Failed to hydrate core starter preset library:', error);
      });
    }, 1400);
    return () => {
      cancelled = true;
      augmentCleanup();
      cleanup();
    };
  }, [isPublicLibraryMode, presets.length]);

  useEffect(() => {
    if (isPublicLibraryMode || typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
      console.warn('Failed to persist presets:', error);
    }
  }, [isPublicLibraryMode, presets]);

  return {
    activePresetId,
    handleCreatePreset,
    handleDeletePreset,
    handleDismissLibraryNotice,
    handleDuplicatePreset,
    handleOverwritePreset,
    handleRandomize,
    handleRenamePreset,
    isPresetDirty,
    libraryNotice,
    presetBlendDuration,
    presets,
    setActivePresetId,
    setLibraryNotice,
    setPresets,
    setPresetBlendDuration,
    validPresetIds,
  };
}
