import React from "react";
import type { AudioSourceMode, ParticleConfig, SynthScale, SynthWaveform } from "../types";
import type { UpdateConfig } from "./controlPanelTabsShared";
import { Slider, SynthPatternEditor, Toggle } from "./controlPanelParts";

type AudioSynthControlsPanelProps = {
  audioSourceMode: AudioSourceMode;
  config: ParticleConfig;
  updateConfig: UpdateConfig;
};

export const AudioSynthControlsPanel: React.FC<AudioSynthControlsPanelProps> = ({
  audioSourceMode,
  config,
  updateConfig,
}) => (
  <>
    {audioSourceMode === "shared-audio" && (
      <div className="mb-4 rounded border border-cyan-400/20 bg-cyan-500/10 px-3 py-3 text-panel uppercase tracking-widest text-cyan-100/80">
        <div className="mb-2 font-bold text-cyan-50">YouTube Live / Shared Audio</div>
        <div className="mb-1">1. Press Start Shared Audio.</div>
        <div className="mb-1">2. In the browser picker, prefer a browser tab if you need reliable audio.</div>
        <div className="mb-1">3. Turn on audio sharing before confirming the picker.</div>
        <div>4. If an app window exposes no audio track on macOS, use Standalone Synth instead.</div>
      </div>
    )}
    {audioSourceMode === "midi" && (
      <>
        <div className="mb-4 rounded border border-violet-400/20 bg-violet-500/10 px-3 py-3 text-panel uppercase tracking-widest text-violet-100/80">
          <div className="mb-2 font-bold text-violet-50">Web MIDI Input</div>
          <div className="mb-1">1. Connect a MIDI keyboard or controller before pressing Start MIDI Input.</div>
          <div className="mb-1">2. Note-on drives bass / pulse. CC drives the mapped feature lanes below.</div>
          <div className="mb-1">3. The first available input is auto-selected and remembered as the preferred device.</div>
          <div>4. Chromium-based browsers are the most reliable choice for Web MIDI.</div>
        </div>
        <Slider
          label="MIDI Velocity Gain"
          value={config.midiVelocityGain}
          min={0.1}
          max={2}
          step={0.05}
          onChange={(value) => updateConfig("midiVelocityGain", value)}
        />
        <Slider
          label="MIDI Decay"
          value={config.midiDecay}
          min={0.2}
          max={4}
          step={0.1}
          onChange={(value) => updateConfig("midiDecay", value)}
        />
        <Slider
          label="Bass CC"
          value={config.midiBassCC}
          min={0}
          max={127}
          step={1}
          onChange={(value) => updateConfig("midiBassCC", Math.round(value))}
        />
        <Slider
          label="Treble CC"
          value={config.midiTrebleCC}
          min={0}
          max={127}
          step={1}
          onChange={(value) => updateConfig("midiTrebleCC", Math.round(value))}
        />
        <Slider
          label="Band A CC"
          value={config.midiBandACC}
          min={0}
          max={127}
          step={1}
          onChange={(value) => updateConfig("midiBandACC", Math.round(value))}
        />
        <Slider
          label="Band B CC"
          value={config.midiBandBCC}
          min={0}
          max={127}
          step={1}
          onChange={(value) => updateConfig("midiBandBCC", Math.round(value))}
        />
        <div className="mb-4 rounded border border-white/10 bg-black/10 px-3 py-2 text-panel uppercase tracking-widest text-white/55">
          Preferred Input ID: {config.midiPreferredInputId || "auto / first available"}
        </div>
      </>
    )}
    {audioSourceMode === "standalone-synth" && (
      <div className="mb-4 rounded border border-emerald-400/20 bg-emerald-500/10 px-3 py-3 text-panel uppercase tracking-widest text-emerald-100/80">
        <div className="mb-2 font-bold text-emerald-50">Standalone Synth Window</div>
        <div className="mb-1">1. Press Open Standalone Synth.</div>
        <div className="mb-1">2. A separate window will run the synth and feed analysis back here.</div>
        <div className="mb-1">3. If autoplay is blocked, click Start Audio inside that window once.</div>
        <div className="mb-1">4. This is the reliable fallback when shared app-window/system audio is flaky.</div>
        <div>5. WebM export can mirror this synth into the recording when the standalone synth is active.</div>
      </div>
    )}
    {(audioSourceMode === "internal-synth" || audioSourceMode === "standalone-synth") && (
      <>
        <Toggle
          label="Synth Wave"
          value={config.synthWaveform}
          options={[
            { label: "Sine", val: "sine" },
            { label: "Tri", val: "triangle" },
            { label: "Saw", val: "sawtooth" },
            { label: "Square", val: "square" },
          ]}
          onChange={(value) => updateConfig("synthWaveform", value as SynthWaveform)}
        />
        <Toggle
          label="Synth Scale"
          value={config.synthScale}
          options={[
            { label: "Major", val: "major" },
            { label: "Minor", val: "minor" },
            { label: "Pentatonic", val: "pentatonic" },
            { label: "Chromatic", val: "chromatic" },
          ]}
          onChange={(value) => updateConfig("synthScale", value as SynthScale)}
        />
        <Slider label="Synth Tempo" value={config.synthTempo} min={40} max={200} step={1} onChange={(value) => updateConfig("synthTempo", value)} />
        <Slider label="Base Frequency" value={config.synthBaseFrequency} min={40} max={880} step={1} onChange={(value) => updateConfig("synthBaseFrequency", value)} />
        <Slider label="Master Gain" value={config.synthVolume} min={0} max={1} step={0.01} onChange={(value) => updateConfig("synthVolume", value)} />
        <Slider label="Filter Cutoff" value={config.synthCutoff} min={120} max={8000} step={10} onChange={(value) => updateConfig("synthCutoff", value)} />
        <Slider label="Pattern Depth" value={config.synthPatternDepth} min={0} max={1} step={0.01} onChange={(value) => updateConfig("synthPatternDepth", value)} />
        <SynthPatternEditor pattern={config.synthPattern} onChange={(nextPattern) => updateConfig("synthPattern", nextPattern)} />
        <div className="mb-4 rounded border border-white/10 bg-black/10 px-3 py-2 text-panel uppercase tracking-widest text-white/55">
          {audioSourceMode === "standalone-synth"
            ? "These synth settings are mirrored into the companion window in real time."
            : "Use this only when you want the browser to generate its own reference synth."}
        </div>
      </>
    )}
    <div className="mb-4 rounded border border-white/10 bg-black/10 px-3 py-2 text-panel uppercase tracking-widest text-white/55">Input Gain</div>
    <Slider
      label={audioSourceMode === "microphone" ? "Mic Sensitivity" : "Analysis Sensitivity"}
      value={config.audioSensitivity}
      min={0.1}
      max={5}
      step={0.1}
      onChange={(value) => updateConfig("audioSensitivity", value)}
    />
    <Slider label="Bass Input Gain" value={config.audioBeatScale} min={0} max={3} step={0.1} onChange={(value) => updateConfig("audioBeatScale", value)} />
    <Slider label="Treble Input Gain" value={config.audioJitterScale} min={0} max={3} step={0.1} onChange={(value) => updateConfig("audioJitterScale", value)} />
    <div className="mb-4 mt-4 rounded border border-white/10 bg-black/10 px-3 py-2 text-panel uppercase tracking-widest text-white/55">Analysis Dynamics</div>
    <Slider label="Gate Threshold" value={config.audioGateThreshold} min={0} max={0.35} step={0.01} onChange={(value) => updateConfig("audioGateThreshold", value)} />
    <Slider label="Response Curve" value={config.audioResponseCurve} min={0.35} max={2.5} step={0.05} onChange={(value) => updateConfig("audioResponseCurve", value)} />
    <Slider label="Pulse Decay" value={config.audioPulseDecay} min={0.02} max={0.6} step={0.01} onChange={(value) => updateConfig("audioPulseDecay", value)} />
  </>
);
