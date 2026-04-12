import React from 'react';
import type { AudioRouteTransferSectionProps } from './controlPanelTabsAudioRouteEditorShared';

export function AudioRouteTransferSection({
  routeTransferFileInputRef,
  handleRouteTransferFileChange,
  routeTransferFileMode,
  setRouteTransferFileMode,
  exportRouteBundle,
  copyRouteBundle,
  importRouteBundle,
  openRouteTransferFilePicker,
  setRouteTransferText,
  setRouteTransferNotice,
  handleRouteTransferDragOver,
  handleRouteTransferDragLeave,
  handleRouteTransferDrop,
  routeTransferDragActive,
  routeTransferText,
  routeTransferValidation,
  routeTransferNotice,
}: AudioRouteTransferSectionProps) {
  return (
    <div className="mt-4 rounded border border-white/10 bg-black/10 px-3 py-3 text-panel text-white/70">
      <div className="mb-2 uppercase tracking-widest text-white/45">Route Transfer</div>
      <input
        ref={routeTransferFileInputRef as React.Ref<HTMLInputElement>}
        type="file"
        accept=".json,application/json,text/plain"
        onChange={handleRouteTransferFileChange}
        className="hidden"
      />
      <div className="mb-2 text-panel-sm uppercase tracking-widest text-white/35">
        Drop mode controls what happens when you drop a route bundle file or plain JSON text below.
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(['box', 'append', 'replace'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setRouteTransferFileMode(mode)}
            className={`rounded border px-2 py-1 text-panel-sm uppercase ${routeTransferFileMode === mode ? 'border-cyan-400/35 bg-cyan-500/15 text-cyan-50' : 'border-white/15 bg-white/5 hover:bg-white/10'}`}
          >
            Drop Mode: {mode}
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <button onClick={() => exportRouteBundle('all')} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-panel-sm uppercase hover:bg-white/10">Export All → Box</button>
        <button onClick={() => exportRouteBundle('visible')} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-panel-sm uppercase hover:bg-white/10">Export Visible → Box</button>
        <button onClick={() => { void copyRouteBundle('all'); }} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-panel-sm uppercase hover:bg-white/10">Copy All</button>
        <button onClick={() => { void copyRouteBundle('visible'); }} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-panel-sm uppercase hover:bg-white/10">Copy Visible</button>
        <button onClick={() => importRouteBundle('append')} disabled={!routeTransferValidation?.ok} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-panel-sm uppercase hover:bg-white/10 disabled:opacity-30">Import Append</button>
        <button onClick={() => importRouteBundle('replace')} disabled={!routeTransferValidation?.ok} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-panel-sm uppercase hover:bg-white/10 disabled:opacity-30">Import Replace</button>
        <button onClick={() => openRouteTransferFilePicker('box')} className="rounded border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-panel-sm uppercase text-cyan-100/85 hover:bg-cyan-500/20">Load File → Box</button>
        <button onClick={() => openRouteTransferFilePicker('append')} className="rounded border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-panel-sm uppercase text-cyan-100/85 hover:bg-cyan-500/20">Load File → Append</button>
        <button onClick={() => openRouteTransferFilePicker('replace')} className="rounded border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-panel-sm uppercase text-cyan-100/85 hover:bg-cyan-500/20">Load File → Replace</button>
        <button onClick={() => { setRouteTransferText(''); setRouteTransferNotice('Transfer box cleared.'); }} className="rounded border border-white/15 bg-white/5 px-2 py-1 text-panel-sm uppercase hover:bg-white/10">Clear Box</button>
      </div>
      <div onDragOver={handleRouteTransferDragOver} onDragLeave={handleRouteTransferDragLeave} onDrop={handleRouteTransferDrop} className={`rounded border px-2 py-2 transition-colors ${routeTransferDragActive ? 'border-cyan-300/45 bg-cyan-500/10' : 'border-white/10 bg-black/10'}`}>
        <div className="mb-2 text-panel-sm uppercase tracking-widest text-white/35">Drop route bundle file or JSON text here.</div>
        <textarea
          value={routeTransferText}
          onChange={(event) => setRouteTransferText(event.target.value)}
          rows={10}
          placeholder="Paste exported audio route JSON here or load / drop a bundle file"
          className="w-full rounded border border-white/10 bg-black/30 px-2 py-2 font-mono text-panel text-white/80"
        />
      </div>
      {routeTransferValidation && (
        <div className={`mt-2 rounded border px-3 py-2 text-panel-sm uppercase tracking-widest ${routeTransferValidation.ok ? 'border-white/10 bg-white/[0.03] text-white/55' : 'border-red-400/20 bg-red-500/10 text-red-100/80'}`}>
          {routeTransferValidation.ok ? (
            <>
              <div>Validation / {routeTransferValidation.routeCount} routes / scope {routeTransferValidation.scope}</div>
              <div className="mt-1 text-white/40">Duplicates {routeTransferValidation.duplicateIds.length} / Unknown Targets {routeTransferValidation.unknownTargets.length} / Invalid Sources {routeTransferValidation.invalidSources.length} / Invalid Curves {routeTransferValidation.invalidCurves.length} / Invalid Modes {routeTransferValidation.invalidModes.length}</div>
              <div className="mt-1 text-white/40">Normalized Sources {routeTransferValidation.normalization.normalizedSourceCount} / Curves {routeTransferValidation.normalization.normalizedCurveCount} / Modes {routeTransferValidation.normalization.normalizedModeCount} / Defaulted Targets {routeTransferValidation.normalization.defaultedTargetCount}</div>
              <div className="mt-1 text-white/40">Clamped Amount {routeTransferValidation.normalization.clampedAmountCount} / Bias {routeTransferValidation.normalization.clampedBiasCount} / Smoothing {routeTransferValidation.normalization.clampedSmoothingCount} / Attack {routeTransferValidation.normalization.clampedAttackCount} / Release {routeTransferValidation.normalization.clampedReleaseCount} / ClampMin {routeTransferValidation.normalization.clampedClampMinCount} / ClampMax {routeTransferValidation.normalization.clampedClampMaxCount}</div>
              {routeTransferValidation.diff && (
                <>
                  <div className="mt-1 text-white/40">Diff vs Current / Overlap Keys {routeTransferValidation.diff.overlappingKeyCount} / Exact Route Matches {routeTransferValidation.diff.exactValueMatchCount} / Changed {routeTransferValidation.diff.changedMatchCount} / Added {routeTransferValidation.diff.addedCount} / Removed {routeTransferValidation.diff.removedCount}</div>
                  {routeTransferValidation.diff.sampleChanged.length > 0 && (
                    <div className="mt-1 space-y-1 text-white/35">
                      {routeTransferValidation.diff.sampleChanged.map((sample) => (
                        <div key={`${sample.key}:${sample.incomingRouteId}:${sample.currentRouteId}`}>
                          Changed {sample.key} / incoming {sample.incomingRouteId ?? 'n/a'} / current {sample.currentRouteId ?? 'n/a'} / amount Δ {(sample.amountDelta ?? 0).toFixed(2)} / bias Δ {(sample.biasDelta ?? 0).toFixed(2)} / timing Δ {(sample.timingDelta ?? 0).toFixed(2)}
                        </div>
                      ))}
                    </div>
                  )}
                  {routeTransferValidation.diff.sampleAdded.length > 0 && (
                    <div className="mt-1 text-white/35">Added sample: {routeTransferValidation.diff.sampleAdded.map((sample) => `${sample.key} / ${sample.incomingRouteId ?? 'n/a'}`).join(' / ')}</div>
                  )}
                  {routeTransferValidation.diff.sampleRemoved.length > 0 && (
                    <div className="mt-1 text-white/35">Removed sample: {routeTransferValidation.diff.sampleRemoved.map((sample) => `${sample.key} / ${sample.currentRouteId ?? 'n/a'}`).join(' / ')}</div>
                  )}
                </>
              )}
              {routeTransferValidation.duplicateIds.length > 0 && <div className="mt-1 text-white/35">Duplicate IDs: {routeTransferValidation.duplicateIds.slice(0, 6).join(' / ')}</div>}
              {routeTransferValidation.unknownTargets.length > 0 && <div className="mt-1 text-white/35">Unknown Targets: {routeTransferValidation.unknownTargets.slice(0, 6).join(' / ')}</div>}
              {routeTransferValidation.invalidSources.length > 0 && <div className="mt-1 text-white/35">Invalid Sources: {routeTransferValidation.invalidSources.slice(0, 6).join(' / ')}</div>}
              {routeTransferValidation.invalidCurves.length > 0 && <div className="mt-1 text-white/35">Invalid Curves: {routeTransferValidation.invalidCurves.slice(0, 6).join(' / ')}</div>}
              {routeTransferValidation.invalidModes.length > 0 && <div className="mt-1 text-white/35">Invalid Modes: {routeTransferValidation.invalidModes.slice(0, 6).join(' / ')}</div>}
            </>
          ) : (
            <div>{routeTransferValidation.parseError}</div>
          )}
        </div>
      )}
      {routeTransferNotice && <div className="mt-2 text-panel-sm uppercase tracking-widest text-white/45">{routeTransferNotice}</div>}
    </div>
  );
}
