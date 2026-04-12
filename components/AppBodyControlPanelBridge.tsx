import React from 'react';
import { useAppControlPanelBridge } from '../lib/useAppControlPanelBridge';
import type { UseAppControlPanelPropsArgs } from '../lib/useAppControlPanelProps';
import { publishControlPanelPropsSnapshot } from './controlPanelBridgeStore';

type AppBodyControlPanelBridgeProps = UseAppControlPanelPropsArgs;

export const AppBodyControlPanelBridge: React.FC<AppBodyControlPanelBridgeProps> = (props) => {
  const controlPanelProps = useAppControlPanelBridge(props);

  React.useEffect(() => {
    publishControlPanelPropsSnapshot(controlPanelProps);
    return () => {
      publishControlPanelPropsSnapshot(null);
    };
  }, [controlPanelProps]);

  return null;
};
