import React from 'react';
import { Camera, Download, Pause, Play } from 'lucide-react';
import { Slider, Toggle } from './controlPanelParts';
import { ControlPanelContentProps, NoticeBanner } from './controlPanelTabsShared';
import { GlobalExportFutureNativeSection } from './controlPanelGlobalExportFutureNative';
import { EXPORT_ASPECT_PRESET_OPTIONS } from '../lib/exportDimensions';
import { formatExportRunMetadataSummary } from '../lib/exportBatchQueue';

export const GlobalExportSection: React.FC<ControlPanelContentProps> = ({
  audioSourceMode,
  config,
  frameNotice,
  exportQueue,
  activeExportQueueJobId,
  isFrameExporting,
  isExportQueueRunning,
  isGifExporting,
  isVideoRecording,
  onDismissFrameNotice,
  onDismissGifNotice,
  onDismissVideoNotice,
  onEnqueueFrameExportJob,
  onEnqueueGifExportJob,
  onEnqueueVideoExportJob,
  onStartExportQueue,
  onCancelExportQueue,
  onClearExportQueue,
  onRemoveExportQueueJob,
  onStartFrameExport,
  onStartGifExport,
  onStartVideoRecording,
  onStopFrameExport,
  onStopGifExport,
  onStopVideoRecording,
  onVideoDurationSecondsChange,
  onVideoExportModeChange,
  onVideoFpsChange,
  sequenceSinglePassDuration,
  presetSequence,
  updateConfig,
  presets,
  videoDurationSeconds,
  videoExportMode,
  videoFps,
  videoNotice,
  gifNotice,
}) => (
  <div className="mt-4 rounded border border-white/10 bg-white/5 p-3">
    <div className="flex items-center gap-2 text-panel uppercase font-bold tracking-widest text-white/70 mb-3">
      <Camera size={12} /> Video Export
    </div>
    <Toggle
      label="Recording Mode"
      value={videoExportMode}
      options={[{ label: 'Current', val: 'current' }, { label: 'Sequence', val: 'sequence' }]}
      onChange={onVideoExportModeChange}
    />
    <Slider label="Frame Rate" value={videoFps} min={12} max={60} step={1} onChange={onVideoFpsChange} />
    {videoExportMode === 'current' ? (
      <Slider label="Duration Seconds" value={videoDurationSeconds} min={1} max={30} step={0.5} onChange={onVideoDurationSecondsChange} />
    ) : (
      <div className="mb-4 rounded border border-white/10 bg-black/10 px-3 py-2 text-panel uppercase tracking-widest text-white/55">
        Sequence single-pass length: {sequenceSinglePassDuration.toFixed(2)} sec
      </div>
    )}
    <div className="mb-3 rounded border border-white/10 bg-black/10 p-3">
      <div className="mb-2 text-panel-sm uppercase tracking-[0.2em] text-white/45">Export Aspect</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {EXPORT_ASPECT_PRESET_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => updateConfig('exportAspectPreset', option.value)}
            className={`rounded border px-2 py-2 text-panel-sm uppercase tracking-widest transition-colors ${config.exportAspectPreset === option.value ? 'border-white/30 bg-white/12 text-white' : 'border-white/15 bg-white/5 text-white/68 hover:bg-white/10'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="mt-2 text-panel text-white/45">Current preset: {config.exportAspectPreset}. Screenshot export re-renders at the chosen ratio; WebM and PNG ZIP mirror the live canvas into the selected frame.</div>
    </div>
    <div className="mb-3 rounded border border-white/10 bg-black/10 p-3">
      <div className="mb-2 text-panel-sm uppercase tracking-[0.2em] text-white/45">Capture Helpers</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <button
          onClick={() => onVideoDurationSecondsChange(3)}
          className="rounded border border-white/15 bg-white/5 px-2 py-2 text-panel-sm uppercase tracking-widest text-white/68 hover:bg-white/10"
        >
          3 sec
        </button>
        <button
          onClick={() => onVideoDurationSecondsChange(6)}
          className="rounded border border-white/15 bg-white/5 px-2 py-2 text-panel-sm uppercase tracking-widest text-white/68 hover:bg-white/10"
        >
          6 sec
        </button>
        <button
          onClick={() => onVideoDurationSecondsChange(12)}
          className="rounded border border-white/15 bg-white/5 px-2 py-2 text-panel-sm uppercase tracking-widest text-white/68 hover:bg-white/10"
        >
          12 sec
        </button>
        <button
          onClick={() => onVideoFpsChange(24)}
          className="rounded border border-white/15 bg-white/5 px-2 py-2 text-panel-sm uppercase tracking-widest text-white/68 hover:bg-white/10"
        >
          24 fps
        </button>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          onClick={() => onVideoExportModeChange('sequence')}
          className="rounded border border-sky-300/20 bg-sky-500/10 px-2 py-2 text-panel-sm uppercase tracking-widest text-white/78 hover:bg-sky-500/20"
        >
          Use 1-pass Sequence Loop
        </button>
        <button
          onClick={() => onVideoDurationSecondsChange(Math.max(1, Math.round(sequenceSinglePassDuration * 2) / 2))}
          className="rounded border border-white/15 bg-black/20 px-2 py-2 text-panel-sm uppercase tracking-widest text-white/68 hover:bg-white/10"
        >
          Current = Pass Length
        </button>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={isVideoRecording ? onStopVideoRecording : onStartVideoRecording}
        className="flex items-center justify-center gap-2 py-2 text-panel font-bold uppercase rounded border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
      >
        {isVideoRecording ? <Pause size={12} /> : <Play size={12} />}
        {isVideoRecording ? 'Stop Recording' : 'Record WebM'}
      </button>
      <div className="flex items-center justify-center text-panel-sm uppercase tracking-widest text-white/45 border border-white/10 rounded">
        {isVideoRecording ? 'Recording...' : 'Browser WebM'}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mt-2">
      <button
        onClick={isFrameExporting ? onStopFrameExport : onStartFrameExport}
        className="flex items-center justify-center gap-2 py-2 text-panel font-bold uppercase rounded border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
      >
        {isFrameExporting ? <Pause size={12} /> : <Download size={12} />}
        {isFrameExporting ? 'Stop Frames' : 'Export PNG Frames'}
      </button>
      <div className="flex items-center justify-center text-panel-sm uppercase tracking-widest text-white/45 border border-white/10 rounded">
        {isFrameExporting ? 'Capturing ZIP...' : 'PNG ZIP'}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 mt-2">
      <button
        onClick={isGifExporting ? onStopGifExport : onStartGifExport}
        className="flex items-center justify-center gap-2 py-2 text-panel font-bold uppercase rounded border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
      >
        {isGifExporting ? <Pause size={12} /> : <Download size={12} />}
        {isGifExporting ? 'Stop GIF' : 'Export GIF'}
      </button>
      <div className="flex items-center justify-center text-panel-sm uppercase tracking-widest text-white/45 border border-white/10 rounded">
        {isGifExporting ? 'Encoding GIF...' : 'Animated GIF'}
      </div>
    </div>
    <div className="mt-2 rounded border border-white/10 bg-black/10 px-3 py-2 text-panel text-white/50">
      GIF uses browser-side palette encoding. Heavy exports are capped to 180 frames and may reduce export scale automatically.
    </div>
    {audioSourceMode === 'standalone-synth' && (
      <div className="mt-2 rounded border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-panel uppercase tracking-widest text-amber-100/85">
        When Standalone Synth is active, `Record WebM` mirrors its synth settings into an internal capture track.
      </div>
    )}
    <div className="mt-2 rounded border border-white/10 bg-black/10 px-3 py-2 text-panel text-white/50">
      Every capture now includes a machine-readable manifest. WebM, GIF, and screenshots download a sidecar <span className="font-mono text-white/70">.manifest.json</span>; PNG frame ZIPs embed <span className="font-mono text-white/70">capture.manifest.json</span>.
    </div>
    <div className="mt-3 rounded border border-sky-300/15 bg-sky-500/5 p-3">
      <div className="mb-2 text-panel font-bold uppercase tracking-widest text-sky-100/72">Render Queue / Batch Export</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          onClick={onEnqueueVideoExportJob}
          className="rounded border border-white/20 bg-black/20 px-2 py-2 text-panel font-bold uppercase text-white/75 transition-colors hover:bg-white/10"
        >
          Queue WebM
        </button>
        <button
          onClick={onEnqueueFrameExportJob}
          className="rounded border border-white/20 bg-black/20 px-2 py-2 text-panel font-bold uppercase text-white/75 transition-colors hover:bg-white/10"
        >
          Queue PNG ZIP
        </button>
        <button
          onClick={onEnqueueGifExportJob}
          className="rounded border border-white/20 bg-black/20 px-2 py-2 text-panel font-bold uppercase text-white/75 transition-colors hover:bg-white/10"
        >
          Queue GIF
        </button>
        <button
          onClick={isExportQueueRunning ? onCancelExportQueue : onStartExportQueue}
          className="rounded border border-sky-400/25 bg-sky-500/10 px-2 py-2 text-panel font-bold uppercase text-white/80 transition-colors hover:bg-sky-500/20"
        >
          {isExportQueueRunning ? 'Cancel Queue' : 'Run Queue'}
        </button>
        <button
          onClick={onClearExportQueue}
          className="rounded border border-white/15 bg-black/20 px-2 py-2 text-panel font-bold uppercase text-white/60 transition-colors hover:bg-white/10"
        >
          Clear Queue
        </button>
      </div>
      <div className="mt-2 text-panel-sm text-white/42">
        Queue captures the current export settings, scene config, presets, and sequence snapshot. Jobs replay those captured values and run sequentially in this browser session.
      </div>
      <div className="mt-3 space-y-2">
        {exportQueue.length === 0 ? (
          <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-panel text-white/38">No queued export jobs.</div>
        ) : exportQueue.map((job) => (
          <div key={job.id} className={`rounded border px-3 py-2 ${job.id === activeExportQueueJobId ? 'border-sky-300/30 bg-sky-500/10' : 'border-white/10 bg-black/20'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-panel font-bold uppercase tracking-widest text-white/76">{job.label}</div>
                <div className="mt-1 text-panel-sm text-white/42">
                  status {job.status}
                  {job.cameraPathEnabled && job.cameraPathSlotCount >= 2 ? ` · camera path ${job.cameraPathSlotCount} slots` : ''}
                  {job.resultMessage ? ` · ${job.resultMessage}` : ''}
                  {job.resultMetadata ? ` · ${formatExportRunMetadataSummary(job.resultMetadata)}` : ''}
                </div>
              </div>
              {job.status !== 'running' ? (
                <button
                  onClick={() => onRemoveExportQueueJob(job.id)}
                  className="rounded border border-white/10 bg-black/20 px-2 py-1 text-panel-sm uppercase tracking-widest text-white/52 transition-colors hover:bg-white/10"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
    <GlobalExportFutureNativeSection
      config={config}
      presets={presets}
      presetSequence={presetSequence}
      videoExportMode={videoExportMode}
      onVideoExportModeChange={onVideoExportModeChange}
    />
    <NoticeBanner notice={videoNotice} onDismiss={onDismissVideoNotice} />
    <NoticeBanner notice={frameNotice} onDismiss={onDismissFrameNotice} />
    <NoticeBanner notice={gifNotice} onDismiss={onDismissGifNotice} />
  </div>
);
