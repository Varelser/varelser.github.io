import React from 'react';

const StandaloneSynthWindow = React.lazy(() => import('./StandaloneSynthWindow').then((module) => ({ default: module.StandaloneSynthWindow })));

type AppModeGateProps = React.PropsWithChildren<{
  appModeParam: string;
  appModeValue: string;
}>;

export const AppModeGate: React.FC<AppModeGateProps> = ({ appModeParam, appModeValue, children }) => {
  const appMode = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get(appModeParam)
    : null;
  if (appMode === appModeValue) {
    return (
      <React.Suspense fallback={<div className="min-h-screen bg-black text-white" />}>
        <StandaloneSynthWindow />
      </React.Suspense>
    );
  }
  return <>{children}</>;
};
