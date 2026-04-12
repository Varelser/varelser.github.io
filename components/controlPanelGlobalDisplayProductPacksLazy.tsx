import React from 'react';
import type { ControlPanelContentProps } from './controlPanelTabsShared';
import { GlobalDisplayFutureNativePacksSection } from './controlPanelGlobalDisplayFutureNativePacks';
import { GlobalDisplayProductPacksSection } from './controlPanelGlobalDisplayProductPacks';
import { useGlobalDisplayProductPacks } from './useGlobalDisplayProductPacks';

type Props = Pick<ControlPanelContentProps, 'config' | 'isPublicLibrary' | 'updateConfig' | 'presets' | 'presetSequence' | 'onLoadPreset' | 'onAddPresetToSequence'>;

export const GlobalDisplayProductPacksLazySection: React.FC<Props> = ({ config, isPublicLibrary, updateConfig, presets, presetSequence, onLoadPreset, onAddPresetToSequence }) => {
  const productPackState = useGlobalDisplayProductPacks({
    config,
    isPublicLibrary,
    updateConfig,
  });

  return (
    <>
      <GlobalDisplayFutureNativePacksSection
        config={config}
        presets={presets}
        presetSequence={presetSequence}
        isPublicLibrary={isPublicLibrary}
        onLoadPreset={onLoadPreset}
        onAddPresetToSequence={onAddPresetToSequence}
      />
      <GlobalDisplayProductPacksSection {...productPackState} isPublicLibrary={isPublicLibrary} />
    </>
  );
};
