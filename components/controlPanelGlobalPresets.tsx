import React from 'react';
import { Bookmark, Pause, Save } from 'lucide-react';
import {
  FUTURE_NATIVE_LIBRARY_FILTER_OPTIONS,
  PRESET_CATEGORY_OPTIONS,
  getPresetCategories,
  getPresetFutureNativeInfo,
  getPresetPerformanceTier,
  getPresetSearchText,
  matchesPresetFutureNativeFilter,
} from '../lib/presetCatalog';
import { Slider } from './controlPanelParts';
import { ControlPanelPresetCard } from './controlPanelPresetCard';
import { ControlPanelPresetLibraryIO } from './controlPanelPresetLibraryIO';
import { ControlPanelContentProps, NoticeBanner } from './controlPanelTabsShared';

export const GlobalPresetsSection: React.FC<ControlPanelContentProps> = ({
  activePresetId,
  editingPresetId,
  editingPresetName,
  formatPresetDate,
  handleCreatePreset,
  handleLibraryFileChange,
  handleStartRename,
  handleSubmitRename,
  isPresetDirty,
  isPresetTransitioning,
  isPublicLibrary,
  libraryImportMode,
  libraryInputRef,
  libraryNotice,
  onAddPresetToSequence,
  onDeletePreset,
  onDismissLibraryNotice,
  onDuplicatePreset,
  onExportLibrary,
  onLoadPreset,
  onOverwritePreset,
  onPresetBlendDurationChange,
  onStopPresetTransition,
  onTransitionToPreset,
  presetBlendDuration,
  presetName,
  presets,
  setEditingPresetId,
  setEditingPresetName,
  setLibraryImportMode,
  setPresetName,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<(typeof PRESET_CATEGORY_OPTIONS)[number]>('All');
  const [futureNativeFilter, setFutureNativeFilter] = React.useState<(typeof FUTURE_NATIVE_LIBRARY_FILTER_OPTIONS)[number]>('All');

  const futureNativeCounts = React.useMemo(() => {
    const counts = new Map<(typeof FUTURE_NATIVE_LIBRARY_FILTER_OPTIONS)[number], number>();
    FUTURE_NATIVE_LIBRARY_FILTER_OPTIONS.forEach((option) => counts.set(option, 0));
    counts.set('All', presets.length);

    presets.forEach((preset) => {
      const info = getPresetFutureNativeInfo(preset);
      if (!info) return;
      counts.set('Future Native', (counts.get('Future Native') ?? 0) + 1);
      counts.set(info.familyLabel, (counts.get(info.familyLabel) ?? 0) + 1);
    });

    return counts;
  }, [presets]);

  const filteredPresets = React.useMemo(() => presets.filter((preset) => {
    const categories = getPresetCategories(preset);
    const matchesQuery = searchQuery.trim().length === 0 || getPresetSearchText(preset).includes(searchQuery.trim().toLowerCase());
    const matchesCategory = categoryFilter === 'All' || categories.includes(categoryFilter);
    const matchesFutureNative = matchesPresetFutureNativeFilter(preset, futureNativeFilter);
    return matchesQuery && matchesCategory && matchesFutureNative;
  }), [categoryFilter, futureNativeFilter, presets, searchQuery]);

  return (
    <div>
      <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Bookmark size={12} /> Presets
      </h3>
      {isPublicLibrary ? (
        <div className="mb-3 rounded border border-white/10 bg-white/5 px-3 py-2 text-panel uppercase tracking-widest text-white/55">
          Public build: bundled presets are read-only. Update <code className="font-mono normal-case">public-library.json</code> from your private workspace and redeploy.
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_auto] gap-2 mb-3">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreatePreset();
              }
            }}
            placeholder="New preset name"
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs tracking-wide outline-none focus:border-white/40"
          />
          <button
            onClick={handleCreatePreset}
            disabled={!presetName.trim()}
            className="px-3 py-2 text-panel font-bold uppercase rounded border border-white/20 bg-white text-black disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Save New
          </button>
        </div>
      )}
      {!isPublicLibrary && activePresetId && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => onOverwritePreset(activePresetId)}
            className="flex items-center justify-center gap-2 py-2 text-panel font-bold uppercase tracking-wider border border-white/20 rounded bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Save size={14} />
            Overwrite
          </button>
          <button
            onClick={isPresetTransitioning ? onStopPresetTransition : undefined}
            disabled={!isPresetTransitioning}
            className="flex items-center justify-center gap-2 py-2 text-panel font-bold uppercase tracking-wider border border-white/20 rounded bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Pause size={14} />
            Stop Morph
          </button>
        </div>
      )}
      <Slider
        label="Preset Morph Seconds"
        value={presetBlendDuration}
        min={0.2}
        max={8}
        step={0.1}
        onChange={onPresetBlendDurationChange}
      />
      {!isPublicLibrary && (
        <ControlPanelPresetLibraryIO
          handleLibraryFileChange={handleLibraryFileChange}
          libraryImportMode={libraryImportMode}
          libraryInputRef={libraryInputRef}
          libraryNotice={libraryNotice}
          onDismissLibraryNotice={onDismissLibraryNotice}
          onExportLibrary={onExportLibrary}
          setLibraryImportMode={setLibraryImportMode}
        />
      )}
      {isPublicLibrary && <NoticeBanner notice={libraryNotice} onDismiss={onDismissLibraryNotice} className="mt-4" />}
      <div className="mt-4 rounded border border-white/10 bg-white/5 p-3">
        <div className="mb-3 text-panel uppercase tracking-widest font-bold text-white/70">
          Browse Library
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search presets, motions, categories, or future-native families"
          className="mb-3 w-full rounded border border-white/10 bg-black/20 px-3 py-2 text-xs outline-none focus:border-white/35"
        />
        <div className="flex flex-wrap gap-2">
          {PRESET_CATEGORY_OPTIONS.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-2 py-1 text-panel-sm uppercase tracking-widest rounded border transition-colors ${
                categoryFilter === category
                  ? 'border-transparent bg-white text-black'
                  : 'border-white/15 bg-transparent text-white/55 hover:border-white/35 hover:text-white/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        {(futureNativeCounts.get('Future Native') ?? 0) > 0 && (
          <div className="mt-3 rounded border border-white/10 bg-black/20 p-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">
              Future-native families
            </div>
            <div className="flex flex-wrap gap-2">
              {FUTURE_NATIVE_LIBRARY_FILTER_OPTIONS.map((option) => {
                const count = futureNativeCounts.get(option) ?? 0;
                return (
                  <button
                    key={option}
                    onClick={() => setFutureNativeFilter(option)}
                    className={`px-2 py-1 text-panel-sm uppercase tracking-widest rounded border transition-colors ${
                      futureNativeFilter === option
                        ? 'border-transparent bg-white text-black'
                        : 'border-white/15 bg-transparent text-white/55 hover:border-white/35 hover:text-white/80'
                    }`}
                  >
                    {option} <span className="opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="mt-3 text-panel uppercase tracking-widest text-white/40">
          Showing {filteredPresets.length} of {presets.length}
        </div>
      </div>
      <div className="mt-4 grid max-h-[34rem] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
        {filteredPresets.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded p-3 text-panel uppercase tracking-widest text-white/35">
            {presets.length === 0
              ? (isPublicLibrary ? 'No bundled public presets yet.' : 'No saved presets yet.')
              : 'No presets match the current search/filter.'}
          </div>
        ) : filteredPresets.map((preset) => (
          <ControlPanelPresetCard
            key={preset.id}
            activePresetId={activePresetId}
            categories={getPresetCategories(preset)}
            editingPresetId={editingPresetId}
            editingPresetName={editingPresetName}
            formatPresetDate={formatPresetDate}
            handleStartRename={handleStartRename}
            handleSubmitRename={handleSubmitRename}
            isPresetDirty={isPresetDirty}
            isPublicLibrary={isPublicLibrary}
            onAddPresetToSequence={onAddPresetToSequence}
            onDeletePreset={onDeletePreset}
            onDuplicatePreset={onDuplicatePreset}
            onLoadPreset={onLoadPreset}
            onTransitionToPreset={onTransitionToPreset}
            performanceTier={getPresetPerformanceTier(preset)}
            preset={preset}
            futureNativeInfo={getPresetFutureNativeInfo(preset)}
            setEditingPresetId={setEditingPresetId}
            setEditingPresetName={setEditingPresetName}
          />
        ))}
      </div>
    </div>
  );
};
