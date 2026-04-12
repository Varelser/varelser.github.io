import React from 'react';

import type { ParticleConfig } from '../types';
import { buildProductPackPatch, getProductPackBundleById, inferProductPackBundleId } from '../lib/productPackLibrary';
import {
  createCustomProductPackRecord,
  duplicateCustomProductPackRecord,
  inferActiveCustomProductPackRecordId,
  loadCustomProductPackRecords,
  refreshCustomProductPackRecord,
  saveCustomProductPackRecords,
  type CustomProductPackRecord,
} from '../lib/productPackCustomLibrary';
import { getCurrentCoverageProgress, getProductPackAugmentationSuggestions, type ProductPackAugmentationSuggestion } from '../lib/productPackAugmentation';
import {
  buildProductPackCoverageRollup,
  getAllProductPackCoverageScorecards,
  getProductPackCoverageScorecardById,
  type ProductPackCoverageRollup,
  type ProductPackCoverageScorecard,
} from '../lib/productPackScorecards';
import { getCoverageProfile, type CoverageProfile } from '../lib/depictionCoverage';
import { getProductPackDetailGroups, type ProductPackDetailControl } from '../lib/productPackDetailControls';
import { normalizeConfig } from '../lib/appStateConfig';
import { Slider, Toggle } from './controlPanelParts';
import type { UpdateConfig } from './controlPanelTabsShared';

type ProductPackDetailGroup = ReturnType<typeof getProductPackDetailGroups>[number];
export type ProductPackDetailScope = 'common' | 'family' | 'pack' | 'solver';

interface UseGlobalDisplayProductPacksArgs {
  config: ParticleConfig;
  isPublicLibrary: boolean;
  updateConfig: UpdateConfig;
}

export interface GlobalDisplayProductPackState {
  activeProductPackBundle: ReturnType<typeof getProductPackBundleById>;
  activeProductPackScorecard: ProductPackCoverageScorecard | null;
  productPackScorecards: ProductPackCoverageScorecard[];
  productPackCoverageRollup: ProductPackCoverageRollup;
  currentCoverageProgress: ReturnType<typeof getCurrentCoverageProgress>;
  coverageProfile: CoverageProfile;
  augmentationSuggestions: ProductPackAugmentationSuggestion[];
  activeProductPackDetailGroups: ProductPackDetailGroup[];
  deltaOnlyControls: boolean;
  setDeltaOnlyControls: React.Dispatch<React.SetStateAction<boolean>>;
  customProductPacks: CustomProductPackRecord[];
  activeCustomProductPack: CustomProductPackRecord | null;
  activeCustomProductPackId: string | null;
  groupedDetailSections: Record<ProductPackDetailScope, ProductPackDetailGroup[]>;
  groupedDetailVisibleCounts: Record<ProductPackDetailScope, number>;
  activeDetailVisibleControlCount: number;
  activeDetailControlCount: number;
  activeDetailModifiedCount: number;
  getScopeDefaultOpen: (scope: ProductPackDetailScope) => boolean;
  getScopeLabel: (scope: ProductPackDetailScope) => string;
  getDetailGroupModifiedCount: (group: ProductPackDetailGroup) => number;
  getVisibleControlsForGroup: (group: ProductPackDetailGroup) => ProductPackDetailControl[];
  getDetailGroupModifiedPreview: (group: ProductPackDetailGroup) => string;
  resetDetailGroupToPackBase: (group: ProductPackDetailGroup) => void;
  renderProductPackDetailControl: (control: ProductPackDetailControl) => React.ReactNode;
  applyProductPackBundle: (bundleId: string) => void;
  saveCurrentAsCustomProductPack: () => void;
  duplicateCurrentProductPackState: () => void;
  formatCustomPackDate: (value: string) => string;
  applyCustomProductPackRecord: (record: CustomProductPackRecord) => void;
  overwriteCustomProductPack: (record: CustomProductPackRecord) => void;
  duplicateCustomProductPack: (record: CustomProductPackRecord) => void;
  deleteCustomProductPack: (recordId: string) => void;
}

const DETAIL_SECTION_SCOPES: ProductPackDetailScope[] = ['common', 'pack', 'family', 'solver'];
const EMPTY_DETAIL_GROUPS: Record<ProductPackDetailScope, ProductPackDetailGroup[]> = {
  common: [],
  family: [],
  pack: [],
  solver: [],
};

function getDetailGroupScope(groupId: string): ProductPackDetailScope {
  if (groupId.startsWith('pack-')) return 'pack';
  if (groupId.startsWith('family-')) return 'family';
  if (groupId.startsWith('solver-')) return 'solver';
  return 'common';
}

function getScopeLabel(scope: ProductPackDetailScope) {
  return {
    common: 'Common',
    family: 'Family',
    pack: 'Pack Specific',
    solver: 'Solver',
  }[scope];
}

function getScopeDefaultOpen(scope: ProductPackDetailScope) {
  return scope === 'common' || scope === 'pack';
}

export function useGlobalDisplayProductPacks({ config, isPublicLibrary, updateConfig }: UseGlobalDisplayProductPacksArgs): GlobalDisplayProductPackState {
  const activeProductPackBundle = React.useMemo(() => getProductPackBundleById(inferProductPackBundleId(config)), [config]);
  const activeProductPackScorecard = React.useMemo(
    () => getProductPackCoverageScorecardById(activeProductPackBundle?.id ?? null),
    [activeProductPackBundle],
  );
  const productPackScorecards = React.useMemo(() => getAllProductPackCoverageScorecards(), []);
  const productPackCoverageRollup = React.useMemo(
    () => buildProductPackCoverageRollup(productPackScorecards),
    [productPackScorecards],
  );
  const currentCoverageProgress = React.useMemo(() => getCurrentCoverageProgress(config), [config]);
  const coverageProfile = React.useMemo(() => getCoverageProfile(config), [config]);
  const augmentationSuggestions = React.useMemo(
    () => getProductPackAugmentationSuggestions(config, {
      excludeIds: activeProductPackBundle ? [activeProductPackBundle.id] : [],
      limit: 4,
    }),
    [activeProductPackBundle, config],
  );
  const activeProductPackDetailGroups = React.useMemo(() => getProductPackDetailGroups(config), [config]);
  const [deltaOnlyControls, setDeltaOnlyControls] = React.useState(false);
  const [customProductPacks, setCustomProductPacks] = React.useState<CustomProductPackRecord[]>(() => loadCustomProductPackRecords());

  React.useEffect(() => {
    saveCustomProductPackRecords(customProductPacks);
  }, [customProductPacks]);

  const activeProductPackBasePatch = React.useMemo(
    () => (activeProductPackBundle ? buildProductPackPatch(activeProductPackBundle.id) : null),
    [activeProductPackBundle],
  );
  const activeProductPackBaseConfig = React.useMemo(
    () => normalizeConfig(activeProductPackBasePatch ?? {}),
    [activeProductPackBasePatch],
  );
  const activeCustomProductPackId = React.useMemo(
    () => inferActiveCustomProductPackRecordId(config, customProductPacks),
    [config, customProductPacks],
  );
  const activeCustomProductPack = React.useMemo(
    () => customProductPacks.find((record) => record.id === activeCustomProductPackId) ?? null,
    [activeCustomProductPackId, customProductPacks],
  );

  const controlHasBaseValue = React.useCallback((control: ProductPackDetailControl) => (
    Boolean(activeProductPackBasePatch && typeof activeProductPackBasePatch[control.key] !== 'undefined')
  ), [activeProductPackBasePatch]);

  const isDetailControlModified = React.useCallback((control: ProductPackDetailControl) => {
    if (!activeProductPackBasePatch || typeof activeProductPackBasePatch[control.key] === 'undefined') return false;
    return config[control.key] !== activeProductPackBasePatch[control.key];
  }, [activeProductPackBasePatch, config]);

  const getDetailGroupModifiedCount = React.useCallback((group: ProductPackDetailGroup) => (
    group.controls.filter((control) => isDetailControlModified(control)).length
  ), [isDetailControlModified]);

  const getVisibleControlsForGroup = React.useCallback((group: ProductPackDetailGroup) => (
    deltaOnlyControls
      ? group.controls.filter((control) => isDetailControlModified(control))
      : group.controls
  ), [deltaOnlyControls, isDetailControlModified]);

  const getDetailGroupModifiedPreview = React.useCallback((group: ProductPackDetailGroup) => {
    const modifiedLabels = group.controls
      .filter((control) => isDetailControlModified(control))
      .map((control) => control.label)
      .slice(0, 3);

    if (modifiedLabels.length > 0) {
      return `modified · ${modifiedLabels.join(' · ')}`;
    }

    return deltaOnlyControls ? 'no delta in this group' : 'base-aligned';
  }, [deltaOnlyControls, isDetailControlModified]);

  const groupedDetailSections = React.useMemo(() => activeProductPackDetailGroups.reduce<Record<ProductPackDetailScope, ProductPackDetailGroup[]>>((acc, group) => {
    const scope = getDetailGroupScope(group.id);
    acc[scope].push(group);
    return acc;
  }, {
    common: [...EMPTY_DETAIL_GROUPS.common],
    family: [...EMPTY_DETAIL_GROUPS.family],
    pack: [...EMPTY_DETAIL_GROUPS.pack],
    solver: [...EMPTY_DETAIL_GROUPS.solver],
  }), [activeProductPackDetailGroups]);

  const groupedDetailVisibleCounts = React.useMemo(() => ({
    common: groupedDetailSections.common.reduce((sum, group) => sum + getVisibleControlsForGroup(group).length, 0),
    family: groupedDetailSections.family.reduce((sum, group) => sum + getVisibleControlsForGroup(group).length, 0),
    pack: groupedDetailSections.pack.reduce((sum, group) => sum + getVisibleControlsForGroup(group).length, 0),
    solver: groupedDetailSections.solver.reduce((sum, group) => sum + getVisibleControlsForGroup(group).length, 0),
  }), [getVisibleControlsForGroup, groupedDetailSections]);

  const activeDetailControlCount = React.useMemo(
    () => activeProductPackDetailGroups.reduce((sum, group) => sum + group.controls.length, 0),
    [activeProductPackDetailGroups],
  );
  const activeDetailModifiedCount = React.useMemo(
    () => activeProductPackDetailGroups.reduce((sum, group) => sum + getDetailGroupModifiedCount(group), 0),
    [activeProductPackDetailGroups, getDetailGroupModifiedCount],
  );
  const activeDetailVisibleControlCount = React.useMemo(
    () => activeProductPackDetailGroups.reduce((sum, group) => sum + getVisibleControlsForGroup(group).length, 0),
    [activeProductPackDetailGroups, getVisibleControlsForGroup],
  );

  const applyConfigSnapshot = React.useCallback((nextConfig: ParticleConfig) => {
    (Object.keys(nextConfig) as Array<keyof ParticleConfig>).forEach((key) => {
      updateConfig(key, nextConfig[key]);
    });
  }, [updateConfig]);

  const applyProductPackBundle = React.useCallback((bundleId: string) => {
    const patch = buildProductPackPatch(bundleId);
    (Object.keys(patch) as Array<keyof typeof patch>).forEach((key) => {
      const value = patch[key];
      if (typeof value !== 'undefined') {
        updateConfig(key as keyof ParticleConfig, value as ParticleConfig[keyof ParticleConfig]);
      }
    });
  }, [updateConfig]);

  const resetDetailGroupToPackBase = React.useCallback((group: ProductPackDetailGroup) => {
    if (!activeProductPackBasePatch) return;
    group.controls.forEach((control) => {
      const nextValue = activeProductPackBasePatch[control.key];
      if (typeof nextValue !== 'undefined') {
        updateConfig(control.key, nextValue as ParticleConfig[keyof ParticleConfig]);
      }
    });
  }, [activeProductPackBasePatch, updateConfig]);

  const renderProductPackDetailControl = React.useCallback((control: ProductPackDetailControl) => {
    const modified = isDetailControlModified(control);
    const hasBaseValue = controlHasBaseValue(control);
    const baseValue = hasBaseValue && activeProductPackBasePatch ? activeProductPackBasePatch[control.key] : undefined;

    const input = control.kind === 'slider' ? (
      <Slider
        key={`${control.label}-${String(control.key)}`}
        label={control.label}
        value={config[control.key] as number}
        min={control.min}
        max={control.max}
        step={control.step}
        onChange={(value) => updateConfig(control.key, value as ParticleConfig[keyof ParticleConfig])}
      />
    ) : (
      <Toggle
        key={`${control.label}-${String(control.key)}`}
        label={control.label}
        value={config[control.key] as string | number | boolean}
        options={control.options}
        onChange={(value) => updateConfig(control.key, value as ParticleConfig[keyof ParticleConfig])}
      />
    );

    return (
      <div key={`${control.label}-${String(control.key)}`} className={`rounded border px-2 py-2 ${modified ? 'border-cyan-300/30 bg-cyan-400/5' : 'border-white/5 bg-black/10'}`}>
        <div className="mb-1 flex items-center justify-between gap-2 text-panel-sm uppercase tracking-[0.18em] text-white/35">
          <span>{String(control.key)}</span>
          <div className="flex items-center gap-2">
            {hasBaseValue ? <span className="font-mono text-white/35">base {String(baseValue)}</span> : <span className="text-white/20">base n/a</span>}
            {modified ? <span className="rounded border border-cyan-300/25 px-1 py-0.5 text-cyan-100">changed</span> : <span className="text-white/20">base</span>}
            {hasBaseValue ? (
              <button
                onClick={() => updateConfig(control.key, baseValue as ParticleConfig[keyof ParticleConfig])}
                className="rounded border border-white/10 bg-black/20 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.18em] text-white/55 hover:bg-white/10"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
        {input}
      </div>
    );
  }, [activeProductPackBasePatch, config, controlHasBaseValue, isDetailControlModified, updateConfig]);

  const saveCurrentAsCustomProductPack = React.useCallback(() => {
    if (isPublicLibrary || typeof window === 'undefined') return;
    const suggestedLabel = activeProductPackBundle ? `${activeProductPackBundle.label} Variant ${customProductPacks.length + 1}` : `Custom Product Pack ${customProductPacks.length + 1}`;
    const label = window.prompt('Custom product pack name', suggestedLabel)?.trim();
    if (!label) return;
    const record = createCustomProductPackRecord({
      label,
      baseProductPackId: activeProductPackBundle?.id ?? null,
      baseProductPackLabel: activeProductPackBundle?.label ?? null,
      config,
      baseConfig: activeProductPackBaseConfig,
    });
    setCustomProductPacks((prev) => [record, ...prev]);
  }, [activeProductPackBaseConfig, activeProductPackBundle, config, customProductPacks.length, isPublicLibrary]);

  const duplicateCurrentProductPackState = React.useCallback(() => {
    if (isPublicLibrary) return;
    if (activeCustomProductPack) {
      setCustomProductPacks((prev) => [duplicateCustomProductPackRecord(activeCustomProductPack), ...prev]);
      return;
    }
    const label = activeProductPackBundle ? `${activeProductPackBundle.label} Copy` : 'Custom Product Pack Copy';
    const record = createCustomProductPackRecord({
      label,
      baseProductPackId: activeProductPackBundle?.id ?? null,
      baseProductPackLabel: activeProductPackBundle?.label ?? null,
      config,
      baseConfig: activeProductPackBaseConfig,
    });
    setCustomProductPacks((prev) => [record, ...prev]);
  }, [activeCustomProductPack, activeProductPackBaseConfig, activeProductPackBundle, config, isPublicLibrary]);

  const applyCustomProductPackRecord = React.useCallback((record: CustomProductPackRecord) => {
    applyConfigSnapshot(record.config);
  }, [applyConfigSnapshot]);

  const duplicateCustomProductPack = React.useCallback((record: CustomProductPackRecord) => {
    if (isPublicLibrary) return;
    setCustomProductPacks((prev) => [duplicateCustomProductPackRecord(record), ...prev]);
  }, [isPublicLibrary]);

  const overwriteCustomProductPack = React.useCallback((record: CustomProductPackRecord) => {
    if (isPublicLibrary) return;
    setCustomProductPacks((prev) => prev.map((entry) => (
      entry.id === record.id
        ? refreshCustomProductPackRecord(entry, { config, baseConfig: activeProductPackBaseConfig })
        : entry
    )));
  }, [activeProductPackBaseConfig, config, isPublicLibrary]);

  const deleteCustomProductPack = React.useCallback((recordId: string) => {
    if (isPublicLibrary) return;
    setCustomProductPacks((prev) => prev.filter((entry) => entry.id !== recordId));
  }, [isPublicLibrary]);

  const formatCustomPackDate = React.useCallback((value: string) => {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  }, []);

  return {
    activeProductPackBundle,
    activeProductPackScorecard,
    productPackScorecards,
    productPackCoverageRollup,
    currentCoverageProgress,
    coverageProfile,
    augmentationSuggestions,
    activeProductPackDetailGroups,
    deltaOnlyControls,
    setDeltaOnlyControls,
    customProductPacks,
    activeCustomProductPack,
    activeCustomProductPackId,
    groupedDetailSections,
    groupedDetailVisibleCounts,
    activeDetailVisibleControlCount,
    activeDetailControlCount,
    activeDetailModifiedCount,
    getScopeDefaultOpen,
    getScopeLabel,
    getDetailGroupModifiedCount,
    getVisibleControlsForGroup,
    getDetailGroupModifiedPreview,
    resetDetailGroupToPackBase,
    renderProductPackDetailControl,
    applyProductPackBundle,
    saveCurrentAsCustomProductPack,
    duplicateCurrentProductPackState,
    formatCustomPackDate,
    applyCustomProductPackRecord,
    overwriteCustomProductPack,
    duplicateCustomProductPack,
    deleteCustomProductPack,
  };
}

export { DETAIL_SECTION_SCOPES, type ProductPackDetailControl, type ProductPackDetailGroup };
