import React from 'react';
import { Copy, Shuffle } from 'lucide-react';
import {
  LayerAttributeSettings,
  MotionSelector,
  PerSourceMotionConfig,
  Slider,
  SourceMediaSettings,
  SourcePositionConfig,
  Toggle,
} from './controlPanelParts';
import type { Layer2Type } from '../types';
import type { SharedLayerSourceSectionsProps } from './controlPanelLayerTabSharedTypes';

export const SharedLayerTabSourceSections: React.FC<SharedLayerSourceSectionsProps> = ({
  config,
  read,
  write,
  updateConfig,
  updateLayerArray,
  updateMotionArray,
  updatePositionArray,
  sourcePositionsKey,
  motionsKey,
  countsKey,
  sizesKey,
  radiusScalesKey,
  flowSpeedsKey,
  flowAmpsKey,
  flowFreqsKey,
  baseCountKey,
  layerLoad,
  layerName,
  showSourceLayout,
}) => (
  <>
    <div className="mt-4 rounded border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-panel uppercase tracking-widest font-bold text-white/60">Execution Engine</div>
      <Toggle
        label={`${layerName} Engine`}
        value={read<string>('ExecutionEngineOverride')}
        options={[
          { label: 'Auto', val: 'auto' },
          { label: 'CPU', val: 'cpu-geometry' },
          { label: 'Particle', val: 'webgl-particle' },
          { label: 'Procedural', val: 'webgl-procedural-surface' },
          { label: 'GPGPU', val: 'webgl-gpgpu' },
          { label: 'WebGPU', val: 'webgpu-compute' },
          { label: 'Hybrid', val: 'hybrid-runtime' },
        ]}
        onChange={(v) => write('ExecutionEngineOverride', v)}
      />
    </div>
    {(read<string>('Source') === 'image' || read<string>('Source') === 'video' || read<string>('Source') === 'text') && (
      <SourceMediaSettings
        mode={read<string>('Source') === 'video' ? 'video' : read<string>('Source') === 'text' ? 'text' : 'image'}
        currentTheme={config.backgroundColor}
        threshold={read<number>('MediaThreshold')}
        depth={read<number>('MediaDepth')}
        invert={read<boolean>('MediaInvert')}
        frameRate={read<number>('MediaFrameRate')}
        mapWidth={read<number>('MediaMapWidth')}
        mapHeight={read<number>('MediaMapHeight')}
        hasMap={read<number[]>('MediaLumaMap').length > 0}
        onThresholdChange={(v) => write('MediaThreshold', v)}
        onDepthChange={(v) => write('MediaDepth', v)}
        onInvertChange={(v) => write('MediaInvert', v)}
        onFrameRateChange={(v) => write('MediaFrameRate', v)}
        onMapChange={(map, width, height) => {
          write('MediaLumaMap', map);
          write('MediaMapWidth', width);
          write('MediaMapHeight', height);
        }}
        onClear={() => {
          write('MediaLumaMap', []);
          write('MediaMapWidth', 0);
          write('MediaMapHeight', 0);
        }}
        textValue={read<string>('TextMapText')}
        onTextValueChange={(v) => write('TextMapText', v)}
        textFontFamily={read<string>('TextMapFontFamily')}
        onTextFontFamilyChange={(v) => write('TextMapFontFamily', v)}
        textWeight={read<number>('TextMapWeight')}
        onTextWeightChange={(v) => write('TextMapWeight', v)}
        textSize={read<number>('TextMapSize')}
        onTextSizeChange={(v) => write('TextMapSize', v)}
        textPadding={read<number>('TextMapPadding')}
        onTextPaddingChange={(v) => write('TextMapPadding', v)}
        textInvert={read<boolean>('TextMapInvert')}
        onTextInvertChange={(v) => write('TextMapInvert', v)}
      />
    )}
    {showSourceLayout && (
      <div className="border-b border-white/10 pb-4 mb-4">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Copy size={12} /> Multi-Emitter Settings
        </h3>
        <Slider label="Source Count" value={read<number>('SourceCount')} min={1} max={50} step={1} onChange={(v) => write('SourceCount', v)} />
        <Slider label="Source Spread" value={read('SourceSpread')} min={0} max={20000} step={10} onChange={(v) => write('SourceSpread', v)} />
        {read<number>('SourceCount') > 1 && (
          <SourcePositionConfig
            count={read<number>('SourceCount')}
            positions={read<{x: number, y: number, z: number}[]>('SourcePositions')}
            onChange={(idx, axis, val) => updatePositionArray(sourcePositionsKey, idx, axis, val)}
            currentTheme={config.backgroundColor}
          />
        )}
        {read<number>('SourceCount') > 1 && (
          <LayerAttributeSettings
            count={read<number>('SourceCount')}
            counts={read<number[]>('Counts')}
            sizes={read<number[]>('Sizes')}
            radiusScales={read<number[]>('RadiusScales')}
            speeds={read<number[]>('FlowSpeeds')}
            amps={read<number[]>('FlowAmps')}
            freqs={read<number[]>('FlowFreqs')}
            updateCount={(idx, v) => updateLayerArray(countsKey, idx, v, baseCountKey, read('SourceCount'))}
            updateSize={(idx, v) => updateLayerArray(sizesKey, idx, v, baseCountKey, read('SourceCount'))}
            updateRadius={(idx, v) => updateLayerArray(radiusScalesKey, idx, v, baseCountKey, read('SourceCount'))}
            updateSpeed={(idx, v) => updateLayerArray(flowSpeedsKey, idx, v, baseCountKey, read('SourceCount'))}
            updateAmp={(idx, v) => updateLayerArray(flowAmpsKey, idx, v, baseCountKey, read('SourceCount'))}
            updateFreq={(idx, v) => updateLayerArray(flowFreqsKey, idx, v, baseCountKey, read('SourceCount'))}
            currentTheme={config.backgroundColor}
          />
        )}
      </div>
    )}
    {showSourceLayout && (
      <>
        <div className="mb-6 flex items-center justify-between border border-white/20 p-2 rounded bg-white/5">
          <div className="flex items-center gap-2 text-panel uppercase font-bold text-white/80">
            <Shuffle size={14} />
            <span>Mix Motions per Source</span>
          </div>
          <button
            onClick={() => write('MotionMix', !read<boolean>('MotionMix'))}
            className={`w-10 h-5 rounded-full relative transition-colors ${read<boolean>('MotionMix') ? 'bg-white' : 'bg-white/20'}`}
            disabled={read<number>('SourceCount') <= 1}
            title={read<number>('SourceCount') <= 1 ? 'Requires multiple sources' : ''}
          >
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-black transition-all ${read<boolean>('MotionMix') ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
        {read<boolean>('MotionMix') ? (
          <PerSourceMotionConfig count={read<number>('SourceCount')} motions={read<Layer2Type[]>('Motions')} onChange={(idx, val) => updateMotionArray(motionsKey, idx, val)} currentTheme={config.backgroundColor} />
        ) : (
          <MotionSelector value={read<Layer2Type>('Type')} onChange={(v) => write('Type', v)} />
        )}
      </>
    )}
    {showSourceLayout && (
      <div className="mb-4 rounded border border-white/10 bg-white/5 p-3">
        <div className="mb-2 flex items-center justify-between text-panel uppercase tracking-widest font-bold text-white/70">
          <span>Layer Load</span>
          <span className="font-mono">{layerLoad.tier}</span>
        </div>
        <div className="mb-3 text-panel text-white/45">
          {layerLoad.suggestions[0] ?? 'Current count and simulation budget are in a comfortable range.'}
        </div>
        <Toggle
          label="Viewport Quality"
          value={config.renderQuality}
          options={[
            { label: 'Draft', val: 'draft' },
            { label: 'Balanced', val: 'balanced' },
            { label: 'Cinematic', val: 'cinematic' },
          ]}
          onChange={(v) => updateConfig('renderQuality', v)}
        />
      </div>
    )}
  </>
);
