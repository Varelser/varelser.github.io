import React from "react";
import { Slider, Toggle } from "./controlPanelParts";
import type { ControlPanelContentProps } from "./controlPanelTabsShared";

export const AmbientTabContent: React.FC<ControlPanelContentProps> = ({
  config,
  lockedPanelClass,
  updateConfig,
}) => (
  <div className={lockedPanelClass}>
    <div className="mb-6">
      <Toggle
        label="Ambient Dust"
        value={config.ambientEnabled}
        options={[
          { label: "On", val: true },
          { label: "Off", val: false },
        ]}
        onChange={(v) => updateConfig("ambientEnabled", v)}
      />
    </div>
    {config.ambientEnabled && (
      <>
        <Slider
          label="Particle Count"
          value={config.ambientCount}
          min={0}
          max={100000}
          step={100}
          onChange={(v) => updateConfig("ambientCount", v)}
        />
        <Slider
          label="Spread / Range"
          value={config.ambientSpread}
          min={100}
          max={5000}
          step={10}
          onChange={(v) => updateConfig("ambientSpread", v)}
        />
        <Slider
          label="Drift Speed"
          value={config.ambientSpeed}
          min={0}
          max={2.0}
          step={0.001}
          onChange={(v) => updateConfig("ambientSpeed", v)}
        />
        <Slider
          label="Particle Size"
          value={config.ambientBaseSize}
          min={0.1}
          max={50}
          step={0.1}
          onChange={(v) => updateConfig("ambientBaseSize", v)}
        />
        <div className="mb-4">
          <div className="mb-2 text-panel uppercase tracking-widest font-medium opacity-70">
            Dust Color
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.ambientColor}
              onChange={(e) => updateConfig("ambientColor", e.target.value)}
              className="h-8 w-12 cursor-pointer rounded border border-white/20 bg-transparent p-0.5"
            />
            <span className="font-mono text-panel opacity-60">
              {config.ambientColor.toUpperCase()}
            </span>
            <button
              onClick={() => updateConfig("ambientColor", "#888888")}
              className="ml-auto rounded border border-white/15 bg-white/5 px-2 py-1 text-panel-sm uppercase hover:bg-white/10"
            >
              Reset
            </button>
          </div>
        </div>
      </>
    )}
  </div>
);
