import React from 'react';
import type { FC } from 'react';
import type { ParticleConfig } from '../types';
import { getGpgpuRenderOutputPlan } from '../lib/sceneRenderRoutingPlans';
import type { GpgpuAssetBundle } from './useGpgpuAssets';

type GpgpuRenderOutputsProps = {
  config: ParticleConfig;
  assets: GpgpuAssetBundle;
};

export const GpgpuRenderOutputs: FC<GpgpuRenderOutputsProps> = React.memo(({ config, assets }) => {
  const {
    drawGeo,
    drawMat,
    geomMeshObj,
    trailMats,
    ribbonGeo,
    ribbonMats,
    tubeGeo,
    tubeMats,
    streakGeo,
    streakMat,
    volumetricMeshObj,
  } = assets;
  const plan = getGpgpuRenderOutputPlan(config);

  return (
    <>
      {plan.pointSprites && (
        <points geometry={drawGeo} material={drawMat} />
      )}
      {plan.instancedSolids && geomMeshObj && (
        <primitive object={geomMeshObj} />
      )}
      {plan.trailPoints && trailMats.map((mat, i) => (
        <points key={i} geometry={drawGeo} material={mat} />
      ))}
      {plan.ribbons && ribbonMats.map((mat, i) => (
        <mesh key={i} geometry={ribbonGeo} material={mat} />
      ))}
      {plan.tubes && tubeMats.map((mat, i) => (
        <mesh key={i} geometry={tubeGeo} material={mat} />
      ))}
      {plan.streakLines && (
        <lineSegments geometry={streakGeo} material={streakMat} />
      )}
      {plan.volumetric && volumetricMeshObj && (
        <primitive object={volumetricMeshObj} />
      )}
    </>
  );
});

GpgpuRenderOutputs.displayName = 'GpgpuRenderOutputs';
