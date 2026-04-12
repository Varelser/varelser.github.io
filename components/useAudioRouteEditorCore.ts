import React from "react";
import { createAudioRouteSeed } from "../lib/audioReactiveConfig";
import { validateAudioRouteBundleText } from "../lib/audioReactiveValidation";
import { AUDIO_REACTIVE_CAPABILITY_REGISTRY } from "../lib/audioReactiveRegistry";
import type { ParticleConfig } from "../types";
import type { AudioModulationRoute } from "../types/audioReactive";
import type { ControlPanelContentProps } from "./controlPanelTabsShared";

type UpdateConfigFn = ControlPanelContentProps["updateConfig"];

type Args = {
  config: ParticleConfig;
  updateConfig: UpdateConfigFn;
  focusedConflictKey: string | null;
  routeSearch: string;
  routeSourceFilter: "all" | AudioModulationRoute["source"];
  routeStateFilter: "all" | "enabled" | "disabled";
  routeSystemFilter: string;
  routeTransferText: string;
  setRouteEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useAudioRouteEditorCore({
  config,
  updateConfig,
  focusedConflictKey,
  routeSearch,
  routeSourceFilter,
  routeStateFilter,
  routeSystemFilter,
  routeTransferText,
  setRouteEditorOpen,
}: Args) {
  const targetOptions = React.useMemo(
    () =>
      AUDIO_REACTIVE_CAPABILITY_REGISTRY.flatMap((entry) =>
        entry.targets.map((target) => ({
          system: entry.system,
          label: `${entry.label} / ${target}`,
          target,
        })),
      ),
    [],
  );

  const targetSystemMap = React.useMemo(
    () => new Map(targetOptions.map((option) => [option.target, option.system])),
    [targetOptions],
  );

  const routeSystemOptions = React.useMemo(
    () => Array.from(new Set(targetOptions.map((option) => option.system))).sort(),
    [targetOptions],
  );

  const updateRoute = React.useCallback(
    (routeId: string, patch: Partial<AudioModulationRoute>) => {
      updateConfig(
        "audioRoutes",
        config.audioRoutes.map((route) =>
          route.id === routeId ? { ...route, ...patch } : route,
        ),
      );
    },
    [config.audioRoutes, updateConfig],
  );

  const removeRoute = React.useCallback(
    (routeId: string) => {
      updateConfig(
        "audioRoutes",
        config.audioRoutes.filter((route) => route.id !== routeId),
      );
    },
    [config.audioRoutes, updateConfig],
  );

  const duplicateRoute = React.useCallback(
    (routeId: string) => {
      const route = config.audioRoutes.find((entry) => entry.id === routeId);
      if (!route) return;
      updateConfig("audioRoutes", [
        ...config.audioRoutes,
        createAudioRouteSeed(config.audioRoutes.length, {
          ...route,
          id: `${route.id}-copy-${config.audioRoutes.length + 1}`,
          notes: route.notes ? `${route.notes} (copy)` : "Duplicated route",
        }),
      ]);
      updateConfig("audioRoutesEnabled", true);
    },
    [config.audioRoutes, updateConfig],
  );

  const addRoute = React.useCallback(() => {
    const fallbackTarget = targetOptions[0]?.target ?? "particle.pulse";
    updateConfig("audioRoutes", [
      ...config.audioRoutes,
      createAudioRouteSeed(config.audioRoutes.length, {
        target: fallbackTarget,
        source: "pulse",
        notes: "Manual route",
      }),
    ]);
    updateConfig("audioRoutesEnabled", true);
    setRouteEditorOpen(true);
  }, [config.audioRoutes, setRouteEditorOpen, targetOptions, updateConfig]);

  const moveRoute = React.useCallback(
    (routeId: string, direction: -1 | 1) => {
      const currentIndex = config.audioRoutes.findIndex(
        (route) => route.id === routeId,
      );
      if (currentIndex < 0) return;
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= config.audioRoutes.length) return;
      const nextRoutes = [...config.audioRoutes];
      const [route] = nextRoutes.splice(currentIndex, 1);
      nextRoutes.splice(nextIndex, 0, route);
      updateConfig("audioRoutes", nextRoutes);
    },
    [config.audioRoutes, updateConfig],
  );

  const reorderRoute = React.useCallback(
    (
      routeId: string,
      targetRouteId: string,
      placement: "before" | "after" = "before",
    ) => {
      if (routeId === targetRouteId) return;
      const nextRoutes = [...config.audioRoutes];
      const currentIndex = nextRoutes.findIndex((route) => route.id === routeId);
      const targetIndex = nextRoutes.findIndex(
        (route) => route.id === targetRouteId,
      );
      if (currentIndex < 0 || targetIndex < 0) return;
      const [route] = nextRoutes.splice(currentIndex, 1);
      const targetIndexAfterRemoval = nextRoutes.findIndex(
        (entry) => entry.id === targetRouteId,
      );
      if (targetIndexAfterRemoval < 0) return;
      const insertIndex =
        placement === "after"
          ? targetIndexAfterRemoval + 1
          : targetIndexAfterRemoval;
      nextRoutes.splice(insertIndex, 0, route);
      updateConfig("audioRoutes", nextRoutes);
    },
    [config.audioRoutes, updateConfig],
  );

  const filteredRoutes = React.useMemo(() => {
    const query = routeSearch.trim().toLowerCase();
    return config.audioRoutes.filter((route) => {
      const routeSystem = targetSystemMap.get(route.target) ?? "unknown";
      if (
        focusedConflictKey &&
        `${route.source} -> ${route.target}` !== focusedConflictKey
      ) {
        return false;
      }
      if (routeSystemFilter !== "all" && routeSystem !== routeSystemFilter) {
        return false;
      }
      if (routeSourceFilter !== "all" && route.source !== routeSourceFilter) {
        return false;
      }
      if (routeStateFilter === "enabled" && !route.enabled) return false;
      if (routeStateFilter === "disabled" && route.enabled) return false;
      if (query.length === 0) return true;
      return [
        route.id,
        route.target,
        route.source,
        route.mode,
        route.curve,
        route.notes ?? "",
        routeSystem,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [
    config.audioRoutes,
    focusedConflictKey,
    routeSearch,
    routeSourceFilter,
    routeStateFilter,
    routeSystemFilter,
    targetSystemMap,
  ]);

  const filteredRouteIdSet = React.useMemo(
    () => new Set(filteredRoutes.map((route) => route.id)),
    [filteredRoutes],
  );

  const routeTransferValidation = React.useMemo(
    () => validateAudioRouteBundleText(routeTransferText, config.audioRoutes),
    [config.audioRoutes, routeTransferText],
  );

  return {
    addRoute,
    duplicateRoute,
    filteredRouteIdSet,
    filteredRoutes,
    moveRoute,
    removeRoute,
    reorderRoute,
    routeSystemOptions,
    routeTransferValidation,
    targetOptions,
    targetSystemMap,
    updateRoute,
  };
}
