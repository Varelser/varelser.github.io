import React from 'react';
import { List } from 'lucide-react';
import type { Layer2Type } from '../types';
import { MOTION_OPTIONS } from './controlPanelMotionCatalog';
import { MotionSelector } from './controlPanelMotionSelector';

export { MotionSelector, MOTION_OPTIONS };

export const PerSourceMotionConfig: React.FC<{
  count: number;
  motions: Layer2Type[];
  onChange: (index: number, val: Layer2Type) => void;
  currentTheme: 'white' | 'black';
}> = ({ count, motions, onChange, currentTheme }) => (
  <div className="mb-5 space-y-2">
    <div className="text-panel uppercase tracking-widest font-medium opacity-70 mb-2 flex items-center gap-2">
      <List size={12} /> Configure Motions
    </div>
    {Array.from({ length: Math.min(count, 20) }).map((_, idx) => (
      <div key={idx} className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
        <span className="text-panel font-mono opacity-80">Source {idx + 1}</span>
        <select
          value={motions[idx] || 'flow'}
          onChange={(e) => onChange(idx, e.target.value as Layer2Type)}
          className={`text-panel uppercase font-bold p-1 rounded border-none outline-none cursor-pointer ${
            currentTheme === 'white' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          {MOTION_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>
    ))}
  </div>
);
