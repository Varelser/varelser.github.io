import React from 'react';
import { ControlPanelTrigger } from './controlPanelChrome';
import { ControlPanelProps } from './controlPanelTypes';
import type { ControlPanelTab } from './controlPanelParts';

const ControlPanelConnected = React.lazy(() => import('./ControlPanelConnected').then((module) => ({ default: module.ControlPanelConnected })));

type ControlPanelComponentProps = ControlPanelProps & {
  initialActiveTab?: ControlPanelTab;
};

export const ControlPanel: React.FC<ControlPanelComponentProps> = (props) => {
  const [isWide, setIsWide] = React.useState(false);
  const {
    config,
    isOpen,
    setIsOpen,
    initialActiveTab,
  } = props;
  const [activeTab, setActiveTab] = React.useState<ControlPanelTab>(initialActiveTab ?? 'global');

  React.useEffect(() => {
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);

  if (!isOpen) {
    return (
      <ControlPanelTrigger
        activeTab={activeTab}
        backgroundColor={config.backgroundColor}
        onOpen={() => setIsOpen(true)}
        onSelectTab={setActiveTab}
      />
    );
  }

  return (
    <React.Suspense
      fallback={(
        <div className="pointer-events-none absolute inset-y-0 right-0 z-50 flex w-full justify-end p-3 text-white sm:p-4">
          <div className={`pointer-events-auto flex h-full w-full items-stretch justify-end ${isWide ? 'max-w-[min(96vw,78rem)]' : 'max-w-[min(96vw,66rem)]'}`}>
            <div className="ml-14 flex min-w-0 flex-1 items-center justify-center rounded-[30px] border border-white/10 bg-black/88 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/60">Loading controls</div>
            </div>
          </div>
        </div>
      )}
    >
      <ControlPanelConnected
        {...props}
        initialActiveTab={activeTab}
        isWide={isWide}
        onActiveTabChange={setActiveTab}
        onClose={() => setIsOpen(false)}
        onToggleWidth={() => setIsWide((prev) => !prev)}
      />
    </React.Suspense>
  );
};
