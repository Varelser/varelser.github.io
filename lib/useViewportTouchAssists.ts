import React from 'react';

type UseViewportTouchAssistsArgs = {
  setIsPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useViewportTouchAssists({ setIsPanelOpen }: UseViewportTouchAssistsArgs) {
  const [isTouchViewport, setIsTouchViewport] = React.useState(false);
  const hasAppliedTouchDefaultRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const coarseQuery = window.matchMedia('(pointer: coarse)');
    const hoverlessQuery = window.matchMedia('(hover: none)');

    const apply = () => {
      const nextIsTouchViewport = coarseQuery.matches || hoverlessQuery.matches || window.innerWidth < 1100;
      setIsTouchViewport(nextIsTouchViewport);
      if (nextIsTouchViewport && !hasAppliedTouchDefaultRef.current) {
        hasAppliedTouchDefaultRef.current = true;
        setIsPanelOpen(false);
      }
    };

    apply();
    coarseQuery.addEventListener?.('change', apply);
    hoverlessQuery.addEventListener?.('change', apply);
    window.addEventListener('resize', apply);

    return () => {
      coarseQuery.removeEventListener?.('change', apply);
      hoverlessQuery.removeEventListener?.('change', apply);
      window.removeEventListener('resize', apply);
    };
  }, [setIsPanelOpen]);

  return { isTouchViewport };
}
