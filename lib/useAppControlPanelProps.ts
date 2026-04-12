import { useCallback } from 'react';
import { normalizeConfig } from './appStateConfigNormalization';
import { loadInitialPrivateConfig, loadPublicPresetLibraryData } from './appStateLibrary';
import type { ControlPanelProps } from '../types/controlPanel';
import type { ParticleConfig } from '../types';

export type UseAppControlPanelPropsArgs = Omit<ControlPanelProps, 'togglePlay' | 'onSave' | 'onReset'> & {
  isPublicLibraryMode: boolean;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setSaveTrigger: React.Dispatch<React.SetStateAction<number>>;
};

export function useAppControlPanelProps({
  isPublicLibraryMode,
  setConfig,
  setIsPlaying,
  setSaveTrigger,
  ...props
}: UseAppControlPanelPropsArgs): ControlPanelProps {
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, [setIsPlaying]);

  const onSave = useCallback(() => {
    setSaveTrigger((prev) => prev + 1);
  }, [setSaveTrigger]);

  const onReset = useCallback(() => {
    if (!isPublicLibraryMode) {
      setConfig(loadInitialPrivateConfig());
      return;
    }
    void loadPublicPresetLibraryData().then((publicLibrary) => {
      setConfig(normalizeConfig(publicLibrary.currentConfig));
    }).catch((error) => {
      console.warn('Failed to reset to bundled public config:', error);
      setConfig(normalizeConfig({}));
    });
  }, [isPublicLibraryMode, setConfig]);

  return {
    ...props,
    onReset,
    onSave,
    setConfig,
    togglePlay,
  };
}
