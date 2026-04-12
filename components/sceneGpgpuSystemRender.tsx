import React from 'react';
import type { ParticleConfig } from '../types';
import { GpgpuRenderOutputs } from './gpgpuRenderOutputs';
import { useGpgpuAssets } from './useGpgpuAssets';

export const GpgpuSystemRender: React.FC<{
  config: ParticleConfig;
  assets: ReturnType<typeof useGpgpuAssets>;
}> = ({ config, assets }) => <GpgpuRenderOutputs config={config} assets={assets} />;
