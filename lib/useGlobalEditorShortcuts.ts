import React from 'react';
import type { LayerFocusMode, LayerToggleState } from '../types/controlPanel';

type UseGlobalEditorShortcutsArgs = {
  canRedo: boolean;
  canUndo: boolean;
  isPublicLibraryMode: boolean;
  isTouchViewport?: boolean;
  layerFocusMode: LayerFocusMode;
  onLoadSequenceStep: (direction: -1 | 1) => void;
  onRedo: () => void;
  onRequestScreenshot: () => void;
  onSetLayerFocusMode: (mode: LayerFocusMode) => void;
  onTogglePanel: () => void;
  onTogglePlay: () => void;
  onUndo: () => void;
  onRandomize: () => void;
};

const EDITABLE_TAG_NAMES = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  return EDITABLE_TAG_NAMES.has(target.tagName);
}

export function useGlobalEditorShortcuts({
  canRedo,
  canUndo,
  isPublicLibraryMode,
  layerFocusMode,
  onLoadSequenceStep,
  onRedo,
  onRequestScreenshot,
  onSetLayerFocusMode,
  onTogglePanel,
  onTogglePlay,
  onUndo,
  onRandomize,
}: UseGlobalEditorShortcutsArgs) {
  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      const targetIsEditable = isEditableTarget(event.target);
      const hasPrimaryModifier = event.metaKey || event.ctrlKey;

      if (hasPrimaryModifier && event.key.toLowerCase() === 'z') {
        if (event.shiftKey ? canRedo : canUndo) {
          event.preventDefault();
          if (event.shiftKey) {
            onRedo();
          } else {
            onUndo();
          }
        }
        return;
      }

      if (hasPrimaryModifier && event.key.toLowerCase() === 'y') {
        if (canRedo) {
          event.preventDefault();
          onRedo();
        }
        return;
      }

      if (targetIsEditable || hasPrimaryModifier || event.altKey) {
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        onTogglePlay();
        return;
      }

      switch (event.key) {
        case 'p':
        case 'P':
          event.preventDefault();
          onTogglePanel();
          return;
        case 'r':
        case 'R':
          if (!isPublicLibraryMode) {
            event.preventDefault();
            onRandomize();
          }
          return;
        case 's':
        case 'S':
          event.preventDefault();
          onRequestScreenshot();
          return;
        case '1':
          event.preventDefault();
          onSetLayerFocusMode(layerFocusMode === 'layer1' ? 'all' : 'layer1');
          return;
        case '2':
          event.preventDefault();
          onSetLayerFocusMode(layerFocusMode === 'layer2' ? 'all' : 'layer2');
          return;
        case '3':
          event.preventDefault();
          onSetLayerFocusMode(layerFocusMode === 'layer3' ? 'all' : 'layer3');
          return;
        case 'ArrowLeft':
          event.preventDefault();
          onLoadSequenceStep(-1);
          return;
        case 'ArrowRight':
          event.preventDefault();
          onLoadSequenceStep(1);
          return;
        default:
          return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canRedo, canUndo, isPublicLibraryMode, layerFocusMode, onLoadSequenceStep, onRedo, onRequestScreenshot, onSetLayerFocusMode, onTogglePanel, onTogglePlay, onUndo, onRandomize]);
}
