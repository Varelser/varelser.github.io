import React from 'react';
import type { ParticleConfig } from '../types';
import { buildPostFxStackPatch, getPostFxStackBundleById, POST_FX_STACK_BUNDLES, inferPostFxStackBundleId } from '../lib/postFxLibrary';
import { getOrderedActivePostFxStageIds } from '../lib/postFxStack';

type Props = {
  config: ParticleConfig;
  updateConfig: <K extends keyof ParticleConfig>(key: K, value: ParticleConfig[K]) => void;
};

export const GlobalDisplayPostFxStackBundlesSection: React.FC<Props> = ({ config, updateConfig }) => {
  const activePostStackBundle = getPostFxStackBundleById(inferPostFxStackBundleId(config));
  const activePostStages = getOrderedActivePostFxStageIds(config).map((stage) => stage.replace(/-/g, ' '));
  const applyPostFxStackBundle = (bundleId: string) => {
    const patch = buildPostFxStackPatch(bundleId);
    (Object.keys(patch) as Array<keyof typeof patch>).forEach((key) => {
      const value = patch[key];
      if (typeof value !== 'undefined') updateConfig(key as keyof ParticleConfig, value as ParticleConfig[keyof ParticleConfig]);
    });
  };
  return <div className="mt-3 rounded border border-white/10 bg-black/20 p-2"><div className="mb-2 flex items-center justify-between gap-2 text-panel-sm uppercase tracking-widest text-white/40"><span>Independent post stacks</span><span>{activePostStackBundle ? activePostStackBundle.label : 'Custom'}</span></div><div className="grid grid-cols-2 gap-2">{POST_FX_STACK_BUNDLES.map((bundle) => { const active = activePostStackBundle?.id === bundle.id; return <button key={bundle.id} onClick={() => applyPostFxStackBundle(bundle.id)} title={bundle.summary} className={`rounded border px-2 py-2 text-left transition-colors ${active ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100' : 'border-white/10 bg-black/10 text-white/70 hover:bg-white/5'}`}><div className="text-panel-sm uppercase tracking-widest">{bundle.label}</div><div className="mt-1 text-panel-sm leading-relaxed text-white/45">{bundle.emphasis.join(' · ')}</div></button>; })}</div><div className="mt-2 text-panel-sm text-white/40">Active order · {activePostStages.length > 0 ? activePostStages.join(' → ') : 'No post stages enabled'}</div></div>;
};
