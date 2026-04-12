import React from 'react';
import { ControlPanelTrigger } from './controlPanelChrome';
import type { ControlPanelProps } from './controlPanelTypes';
import type { ControlPanelTab } from './controlPanelParts';

const ControlPanel = React.lazy(() => import('./ControlPanel').then((module) => ({ default: module.ControlPanel })));

type ControlPanelEntryProps = ControlPanelProps & {
  initialActiveTab?: ControlPanelTab;
};

export const ControlPanelEntry: React.FC<ControlPanelEntryProps> = (props) => {
  const [activeTab, setActiveTab] = React.useState<ControlPanelTab>(props.initialActiveTab ?? 'global');
  const [hasLoadedPanel, setHasLoadedPanel] = React.useState(props.isOpen);

  React.useEffect(() => {
    if (props.isOpen) {
      setHasLoadedPanel(true);
    }
  }, [props.isOpen]);

  React.useEffect(() => {
    if (props.initialActiveTab) {
      setActiveTab(props.initialActiveTab);
    }
  }, [props.initialActiveTab]);

  if (!hasLoadedPanel && !props.isOpen) {
    return (
      <ControlPanelTrigger
        activeTab={activeTab}
        backgroundColor={props.config.backgroundColor}
        onOpen={() => {
          setHasLoadedPanel(true);
          props.setIsOpen(true);
        }}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setHasLoadedPanel(true);
          props.setIsOpen(true);
        }}
      />
    );
  }

  return (
    <React.Suspense fallback={null}>
      <ControlPanel {...props} initialActiveTab={activeTab} />
    </React.Suspense>
  );
};
