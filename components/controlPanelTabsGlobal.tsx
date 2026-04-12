import React from 'react';
import { ControlPanelContentProps } from './controlPanelTabsShared';

const GlobalFutureNativeSection = React.lazy(() => import('./controlPanelGlobalFutureNative').then((module) => ({ default: module.GlobalFutureNativeSection })));
const GlobalPresetsSection = React.lazy(() => import('./controlPanelGlobalPresets').then((module) => ({ default: module.GlobalPresetsSection })));
const GlobalSequenceSection = React.lazy(() => import('./controlPanelGlobalSequence').then((module) => ({ default: module.GlobalSequenceSection })));
const GlobalExportSection = React.lazy(() => import('./controlPanelGlobalExport').then((module) => ({ default: module.GlobalExportSection })));
const GlobalProjectSection = React.lazy(() => import('./controlPanelGlobalProject').then((module) => ({ default: module.GlobalProjectSection })));
const GlobalDisplaySection = React.lazy(() => import('./controlPanelGlobalDisplay').then((module) => ({ default: module.GlobalDisplaySection })));

function scheduleDeferredGlobalDisplay(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    callback();
    return () => {};
  }

  const idleWindow = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (typeof idleWindow.requestIdleCallback === 'function') {
    const idleId = idleWindow.requestIdleCallback(callback, { timeout: 1200 });
    return () => {
      if (typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(idleId);
      }
    };
  }

  const timeoutId = window.setTimeout(callback, 700);
  return () => window.clearTimeout(timeoutId);
}

export const GlobalTabContent: React.FC<ControlPanelContentProps> = (props) => {
  const [showDeferredDisplay, setShowDeferredDisplay] = React.useState(false);

  React.useEffect(() => {
    setShowDeferredDisplay(false);
    return scheduleDeferredGlobalDisplay(() => setShowDeferredDisplay(true));
  }, []);

  return (
    <React.Suspense fallback={null}>
      <GlobalFutureNativeSection {...props} />
      <GlobalPresetsSection {...props} />
      <GlobalSequenceSection {...props} />
      <GlobalExportSection {...props} />
      <GlobalProjectSection {...props} />
      {showDeferredDisplay ? <GlobalDisplaySection {...props} /> : null}
    </React.Suspense>
  );
};
