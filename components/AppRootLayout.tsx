import React from 'react';
import type { Camera, Scene, WebGLRenderer } from 'three';
import { AppSceneErrorBoundary } from './AppSceneErrorBoundary';
import { getInterLayerContactAmount } from '../lib/appStateCollision';
import type { ParticleConfig } from '../types';
import type { ComparePreviewOrientation } from './controlPanelTypes';
import type { CameraRigApi } from '../types/cameraPath';
import { ControlPanelTrigger } from './controlPanelChrome';
import type { ControlPanelTab } from './controlPanelParts';
import { usePublishedControlPanelProps } from './controlPanelBridgeStore';

const AppScene = React.lazy(() => import('./AppScene').then((module) => ({ default: module.AppScene })));
const AppComparePreview = React.lazy(() => import('./AppComparePreview').then((module) => ({ default: module.AppComparePreview })));
const ControlPanelEntry = React.lazy(() => import('./ControlPanelEntry').then((module) => ({ default: module.ControlPanelEntry })));
const AppExecutionDiagnosticsOverlay = React.lazy(() => import('./AppExecutionDiagnosticsOverlay').then((module) => ({ default: module.AppExecutionDiagnosticsOverlay })));
const CanvasStreamWidget = React.lazy(() => import('./canvasStreamWidget').then((module) => ({ default: module.CanvasStreamWidget })));

export type AppRootLayoutProps = {
  audioRef: React.MutableRefObject<any>;
  compareConfig: ParticleConfig | null;
  comparePreviewEnabled: boolean;
  comparePreviewOrientation: ComparePreviewOrientation;
  comparePreviewSlotIndex: number;
  config: ParticleConfig;
  controlPanelState: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  };
  displayConfig: ParticleConfig;
  isPlaying: boolean;
  isSequencePlaying: boolean;
  rendererRef: React.MutableRefObject<WebGLRenderer | null>;
  sceneRef?: React.MutableRefObject<Scene | null>;
  cameraRef?: React.MutableRefObject<Camera | null>;
  saveTrigger: number;
  sequenceStepProgressRef: React.MutableRefObject<number>;
  cameraRigApiRef?: React.MutableRefObject<CameraRigApi | null>;
  onCameraPathPlayingChange?: (isPlaying: boolean) => void;
};

function scheduleDeferredUiActivation(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    callback();
    return () => {};
  }

  const idleWindow = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (typeof idleWindow.requestIdleCallback === 'function') {
    const idleId = idleWindow.requestIdleCallback(callback, { timeout: 1500 });
    return () => {
      if (typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(idleId);
      }
    };
  }

  const timeoutId = window.setTimeout(callback, 900);
  return () => window.clearTimeout(timeoutId);
}

function scheduleSceneActivation(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    callback();
    return () => {};
  }

  let settled = false;
  let firstRafId = 0;
  let secondRafId = 0;
  let timeoutId = 0;

  const flush = () => {
    if (settled) return;
    settled = true;
    callback();
  };

  firstRafId = window.requestAnimationFrame(() => {
    secondRafId = window.requestAnimationFrame(flush);
  });
  timeoutId = window.setTimeout(flush, 120);

  return () => {
    settled = true;
    window.cancelAnimationFrame(firstRafId);
    window.cancelAnimationFrame(secondRafId);
    window.clearTimeout(timeoutId);
  };
}

export const AppRootLayout: React.FC<AppRootLayoutProps> = ({
  audioRef,
  compareConfig,
  comparePreviewEnabled,
  comparePreviewOrientation,
  comparePreviewSlotIndex,
  config,
  controlPanelState,
  displayConfig,
  isPlaying,
  isSequencePlaying,
  rendererRef,
  sceneRef,
  cameraRef,
  saveTrigger,
  sequenceStepProgressRef,
  cameraRigApiRef,
  onCameraPathPlayingChange,
}) => {
  const [showPrimaryScene, setShowPrimaryScene] = React.useState(false);
  const [showDeferredUi, setShowDeferredUi] = React.useState(false);
  const [hasActivatedControlPanel, setHasActivatedControlPanel] = React.useState(controlPanelState.isOpen);
  const [controlPanelInitialTab, setControlPanelInitialTab] = React.useState<ControlPanelTab>('global');
  const deferredCompareConfig = React.useDeferredValue(compareConfig);
  const shouldRenderComparePreview = comparePreviewEnabled && deferredCompareConfig !== null;
  const shouldRenderDiagnostics = config.executionDiagnosticsEnabled;
  const controlPanelProps = usePublishedControlPanelProps(hasActivatedControlPanel || controlPanelState.isOpen);

  React.useEffect(() => scheduleSceneActivation(() => {
    React.startTransition(() => {
      setShowPrimaryScene(true);
    });
  }), []);
  React.useEffect(() => scheduleDeferredUiActivation(() => setShowDeferredUi(true)), []);
  React.useEffect(() => {
    if (controlPanelState.isOpen) {
      setHasActivatedControlPanel(true);
    }
  }, [controlPanelState.isOpen]);

  return (
    <div className={`relative w-full h-screen ${config.backgroundColor === 'white' ? 'bg-white' : 'bg-black'}`}>
      <div className="absolute inset-0">
        <AppSceneErrorBoundary
          label="Main Scene"
          resetKeys={[displayConfig.layer2Type, displayConfig.layer3Type, displayConfig.backgroundColor, displayConfig.layer2ExecutionEngineOverride, displayConfig.layer3ExecutionEngineOverride]}
        >
          {showPrimaryScene ? (
            <React.Suspense fallback={null}>
              <AppScene
                audioRef={audioRef}
                config={displayConfig}
                interLayerContactAmount={getInterLayerContactAmount(displayConfig)}
                isPlaying={isPlaying}
                isSequencePlaying={isSequencePlaying}
                postFxEditingHint={controlPanelState.isOpen}
                rendererRef={rendererRef}
                sceneRef={sceneRef}
                cameraRef={cameraRef}
                saveTrigger={saveTrigger}
                sequenceStepProgressRef={sequenceStepProgressRef}
                cameraRigApiRef={cameraRigApiRef}
                onCameraPathPlayingChange={onCameraPathPlayingChange}
              />
            </React.Suspense>
          ) : null}
        </AppSceneErrorBoundary>
      </div>
      {showDeferredUi && shouldRenderComparePreview ? (
        <AppSceneErrorBoundary label="Compare Preview" resetKeys={[deferredCompareConfig?.layer2Type, deferredCompareConfig?.layer3Type, deferredCompareConfig?.backgroundColor, comparePreviewSlotIndex]} compact={true}>
          <React.Suspense fallback={null}>
            <AppComparePreview
              audioRef={audioRef}
              compareConfig={deferredCompareConfig}
              comparePreviewEnabled={comparePreviewEnabled}
              comparePreviewOrientation={comparePreviewOrientation}
              comparePreviewSlotIndex={comparePreviewSlotIndex}
              isPlaying={isPlaying}
              isSequencePlaying={isSequencePlaying}
              sequenceStepProgressRef={sequenceStepProgressRef}
            />
          </React.Suspense>
        </AppSceneErrorBoundary>
      ) : null}
      {hasActivatedControlPanel || controlPanelState.isOpen ? (
        controlPanelProps ? (
          <React.Suspense fallback={null}>
            <ControlPanelEntry {...controlPanelProps} initialActiveTab={controlPanelInitialTab} />
          </React.Suspense>
        ) : (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-50 flex w-full justify-end p-3 text-white sm:p-4">
            <div className="pointer-events-auto ml-14 flex min-w-0 flex-1 items-center justify-center rounded-[30px] border border-white/10 bg-black/88 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/60">Loading controls</div>
            </div>
          </div>
        )
      ) : (
        <ControlPanelTrigger
          activeTab={controlPanelInitialTab}
          backgroundColor={config.backgroundColor}
          onOpen={() => {
            setHasActivatedControlPanel(true);
            controlPanelState.setIsOpen(true);
          }}
          onSelectTab={(tab) => {
            setControlPanelInitialTab(tab);
            setHasActivatedControlPanel(true);
            controlPanelState.setIsOpen(true);
          }}
        />
      )}
      {showDeferredUi ? (
        <>
          <React.Suspense fallback={null}>
            <CanvasStreamWidget rendererRef={rendererRef} />
          </React.Suspense>
          {shouldRenderDiagnostics ? (
            <React.Suspense fallback={null}>
              <AppExecutionDiagnosticsOverlay config={config} rendererRef={rendererRef} />
            </React.Suspense>
          ) : null}
        </>
      ) : null}
    </div>
  );
};
