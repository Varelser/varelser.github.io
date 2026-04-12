import React from "react";
import { createAudioRouteSeed } from "../lib/audioReactiveConfig";
import {
  parseAudioRouteBundle,
  serializeAudioRouteBundle,
} from "../lib/audioReactiveIO";
import { validateAudioRouteBundleText } from "../lib/audioReactiveValidation";
import type { ControlPanelContentProps } from "./controlPanelTabsShared";
import type { ParticleConfig } from "../types";
import type { AudioModulationRoute } from "../types/audioReactive";

type UpdateConfigFn = ControlPanelContentProps["updateConfig"];

type BulkNumericOffsets = {
  amount: number;
  bias: number;
  clampMin: number;
  clampMax: number;
  smoothing: number;
  attack: number;
  release: number;
};

type Args = {
  config: ParticleConfig;
  updateConfig: UpdateConfigFn;
  filteredRoutes: AudioModulationRoute[];
  filteredRouteIdSet: Set<string>;
  targetSystemMap: Map<string, string>;
  routeTransferText: string;
  setRouteTransferText: React.Dispatch<React.SetStateAction<string>>;
  setRouteTransferNotice: React.Dispatch<React.SetStateAction<string | null>>;
  routeTransferFileMode: "box" | "append" | "replace";
  setRouteTransferFileMode: React.Dispatch<
    React.SetStateAction<"box" | "append" | "replace">
  >;
  setRouteTransferDragActive: React.Dispatch<React.SetStateAction<boolean>>;
  routeTransferFileInputRef: React.RefObject<HTMLInputElement | null>;
  setRouteEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  bulkNumericOffsets: BulkNumericOffsets;
  setBulkNumericOffsets: React.Dispatch<React.SetStateAction<BulkNumericOffsets>>;
};

export function useAudioRouteTransferUtilities({
  config,
  updateConfig,
  filteredRoutes,
  filteredRouteIdSet,
  targetSystemMap,
  routeTransferText,
  setRouteTransferText,
  setRouteTransferNotice,
  routeTransferFileMode,
  setRouteTransferFileMode,
  setRouteTransferDragActive,
  routeTransferFileInputRef,
  setRouteEditorOpen,
  bulkNumericOffsets,
  setBulkNumericOffsets,
}: Args) {
  const applyBulkToVisible = React.useCallback(
    (patch: Partial<AudioModulationRoute>) => {
      updateConfig(
        "audioRoutes",
        config.audioRoutes.map((route) =>
          filteredRouteIdSet.has(route.id)
            ? createAudioRouteSeed(0, { ...route, ...patch })
            : route,
        ),
      );
    },
    [config.audioRoutes, filteredRouteIdSet, updateConfig],
  );

  const sortRoutes = React.useCallback(
    (sortBy: "source" | "target" | "system") => {
      const nextRoutes = [...config.audioRoutes].sort((left, right) => {
        if (sortBy === "source") return left.source.localeCompare(right.source);
        if (sortBy === "target") return left.target.localeCompare(right.target);
        return (targetSystemMap.get(left.target) ?? "unknown").localeCompare(
          targetSystemMap.get(right.target) ?? "unknown",
        );
      });
      updateConfig("audioRoutes", nextRoutes);
    },
    [config.audioRoutes, targetSystemMap, updateConfig],
  );

  const removeDisabledRoutes = React.useCallback(() => {
    updateConfig(
      "audioRoutes",
      config.audioRoutes.filter((route) => route.enabled),
    );
  }, [config.audioRoutes, updateConfig]);

  const exportRouteBundle = React.useCallback(
    (scope: "all" | "visible") => {
      const routes = scope === "visible" ? filteredRoutes : config.audioRoutes;
      const serialized = serializeAudioRouteBundle(routes, scope);
      setRouteTransferText(serialized);
      setRouteTransferNotice(
        `Exported ${routes.length} ${scope === "visible" ? "visible " : ""}routes to transfer box.`,
      );
    },
    [
      config.audioRoutes,
      filteredRoutes,
      setRouteTransferNotice,
      setRouteTransferText,
    ],
  );

  const copyRouteBundle = React.useCallback(
    async (scope: "all" | "visible") => {
      const routes = scope === "visible" ? filteredRoutes : config.audioRoutes;
      const serialized = serializeAudioRouteBundle(routes, scope);
      setRouteTransferText(serialized);
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        setRouteTransferNotice(
          "Clipboard API unavailable. Transfer JSON is in the box below.",
        );
        return;
      }
      try {
        await navigator.clipboard.writeText(serialized);
        setRouteTransferNotice(
          `Copied ${routes.length} ${scope === "visible" ? "visible " : ""}routes to clipboard.`,
        );
      } catch {
        setRouteTransferNotice(
          "Clipboard write failed. Transfer JSON is in the box below.",
        );
      }
    },
    [
      config.audioRoutes,
      filteredRoutes,
      setRouteTransferNotice,
      setRouteTransferText,
    ],
  );

  const loadRouteBundleText = React.useCallback(
    (text: string, mode: "box" | "replace" | "append") => {
      if (mode === "box") {
        setRouteTransferText(text);
        const summary = validateAudioRouteBundleText(text);
        if (summary?.ok) {
          const warningCount =
            summary.duplicateIds.length +
            summary.unknownTargets.length +
            summary.invalidSources.length +
            summary.invalidCurves.length +
            summary.invalidModes.length;
          setRouteTransferNotice(
            `Loaded ${summary.routeCount} routes into transfer box${warningCount > 0 ? ` / ${warningCount} warnings` : ""}.`,
          );
        } else {
          setRouteTransferNotice(
            summary?.parseError ??
              "Loaded file into transfer box. JSON not validated yet.",
          );
        }
        return;
      }

      try {
        const parsed = parseAudioRouteBundle(text);
        const nextRoutes =
          mode === "replace"
            ? parsed.routes
            : [
                ...config.audioRoutes,
                ...parsed.routes.map((route, index) =>
                  createAudioRouteSeed(config.audioRoutes.length + index, route),
                ),
              ];
        updateConfig("audioRoutes", nextRoutes);
        updateConfig("audioRoutesEnabled", true);
        setRouteEditorOpen(true);
        setRouteTransferText(text);
        setRouteTransferNotice(
          `${mode === "replace" ? "Replaced with" : "Appended"} ${parsed.routeCount} imported routes.`,
        );
      } catch (error) {
        setRouteTransferNotice(
          error instanceof Error ? error.message : "Route import failed.",
        );
      }
    },
    [
      config.audioRoutes,
      setRouteEditorOpen,
      setRouteTransferNotice,
      setRouteTransferText,
      updateConfig,
    ],
  );

  const importRouteBundle = React.useCallback(
    (mode: "replace" | "append") => {
      loadRouteBundleText(routeTransferText, mode);
    },
    [loadRouteBundleText, routeTransferText],
  );

  const openRouteTransferFilePicker = React.useCallback(
    (mode: "box" | "append" | "replace") => {
      setRouteTransferFileMode(mode);
      if (routeTransferFileInputRef.current) {
        routeTransferFileInputRef.current.value = "";
        routeTransferFileInputRef.current.click();
      }
    },
    [routeTransferFileInputRef, setRouteTransferFileMode],
  );

  const handleRouteTransferFileChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        loadRouteBundleText(text, routeTransferFileMode);
      } catch (error) {
        setRouteTransferNotice(
          error instanceof Error ? error.message : "Route file read failed.",
        );
      } finally {
        event.target.value = "";
      }
    },
    [loadRouteBundleText, routeTransferFileMode, setRouteTransferNotice],
  );

  const handleRouteTransferDragOver = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "copy";
      }
      setRouteTransferDragActive(true);
    },
    [setRouteTransferDragActive],
  );

  const handleRouteTransferDragLeave = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      const relatedTarget = event.relatedTarget as Node | null;
      if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
        return;
      }
      setRouteTransferDragActive(false);
    },
    [setRouteTransferDragActive],
  );

  const handleRouteTransferDrop = React.useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setRouteTransferDragActive(false);

      const file = event.dataTransfer.files?.[0];
      if (file) {
        try {
          const text = await file.text();
          loadRouteBundleText(text, routeTransferFileMode);
        } catch (error) {
          setRouteTransferNotice(
            error instanceof Error
              ? error.message
              : "Dropped route file read failed.",
          );
        }
        return;
      }

      const droppedText = event.dataTransfer.getData("text/plain");
      if (droppedText) {
        loadRouteBundleText(droppedText, routeTransferFileMode);
        return;
      }

      setRouteTransferNotice(
        "Drop skipped because no readable file or text payload was found.",
      );
    },
    [
      loadRouteBundleText,
      routeTransferFileMode,
      setRouteTransferDragActive,
      setRouteTransferNotice,
    ],
  );

  const updateBulkNumericOffset = React.useCallback(
    (key: keyof BulkNumericOffsets, value: number) => {
      setBulkNumericOffsets((current) => ({
        ...current,
        [key]: Number.isFinite(value) ? value : 0,
      }));
    },
    [setBulkNumericOffsets],
  );

  const applyVisibleNumericOffsets = React.useCallback(() => {
    const offsetEntries = Object.entries(bulkNumericOffsets).filter(
      ([, value]) => value !== 0,
    );
    if (offsetEntries.length === 0) {
      setRouteTransferNotice(
        "Bulk numeric offset skipped because every offset is 0.",
      );
      return;
    }

    let touchedCount = 0;
    updateConfig(
      "audioRoutes",
      config.audioRoutes.map((route) => {
        if (!filteredRouteIdSet.has(route.id)) {
          return route;
        }
        touchedCount += 1;
        return createAudioRouteSeed(0, {
          ...route,
          amount: route.amount + bulkNumericOffsets.amount,
          bias: route.bias + bulkNumericOffsets.bias,
          clampMin: route.clampMin + bulkNumericOffsets.clampMin,
          clampMax: route.clampMax + bulkNumericOffsets.clampMax,
          smoothing: route.smoothing + bulkNumericOffsets.smoothing,
          attack: route.attack + bulkNumericOffsets.attack,
          release: route.release + bulkNumericOffsets.release,
        });
      }),
    );
    setRouteTransferNotice(
      `Applied numeric offsets to ${touchedCount} visible routes.`,
    );
  }, [
    bulkNumericOffsets,
    config.audioRoutes,
    filteredRouteIdSet,
    setRouteTransferNotice,
    updateConfig,
  ]);

  const resetBulkNumericOffsets = React.useCallback(() => {
    setBulkNumericOffsets({
      amount: 0,
      bias: 0,
      clampMin: 0,
      clampMax: 0,
      smoothing: 0,
      attack: 0,
      release: 0,
    });
  }, [setBulkNumericOffsets]);

  return {
    applyBulkToVisible,
    applyVisibleNumericOffsets,
    copyRouteBundle,
    exportRouteBundle,
    handleRouteTransferDragLeave,
    handleRouteTransferDragOver,
    handleRouteTransferDrop,
    handleRouteTransferFileChange,
    importRouteBundle,
    openRouteTransferFilePicker,
    removeDisabledRoutes,
    resetBulkNumericOffsets,
    sortRoutes,
    updateBulkNumericOffset,
  };
}
