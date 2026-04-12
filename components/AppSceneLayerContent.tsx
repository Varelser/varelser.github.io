import React from 'react';
import type { ParticleConfig } from '../types';
import { SceneGroup } from './sceneGroup';
import {
  getGpgpuRenderOutputPlan,
  getLayerSceneRenderPlan,
} from '../lib/sceneRenderRoutingPlans';
import {
  getFutureNativeSceneSystemContract,
  getHybridSceneSystemContract,
  getProceduralSceneSystemContract,
} from '../lib/sceneSystemRegistry';
import { areConfigsEqualByTrackedKeys } from '../lib/configTrackedComparator';
import { lazyNamedComponent } from '../lib/lazySceneComponent';
import type { SceneAudioRef } from './AppSceneTypes';

type LayerContentProps = {
  audioRef: SceneAudioRef;
  config: ParticleConfig;
  interLayerContactAmount: number;
  isPlaying: boolean;
  metaballPosRef: React.MutableRefObject<Float32Array | null>;
  metaballReadbackVersionRef: React.MutableRefObject<number>;
};

type GpgpuSystemProps = {
  config: ParticleConfig;
  audioRef: SceneAudioRef;
  isPlaying: boolean;
  posReadbackRef: React.MutableRefObject<Float32Array | null>;
  posReadbackVersionRef: React.MutableRefObject<number>;
};

type GpgpuSmoothTubeProps = {
  config: ParticleConfig;
  posReadbackRef: React.MutableRefObject<Float32Array | null>;
  posReadbackVersionRef: React.MutableRefObject<number>;
  isPlaying: boolean;
};

type MetaballSystemProps = {
  config: ParticleConfig;
  posReadbackRef: React.MutableRefObject<Float32Array | null>;
  posReadbackVersionRef: React.MutableRefObject<number>;
  texSize: number;
  isPlaying: boolean;
};

type GlyphOutlineSystemProps = {
  audioRef: SceneAudioRef;
  config: ParticleConfig;
  layerIndex: 2 | 3;
};

const GpgpuSystem = lazyNamedComponent<GpgpuSystemProps>(() => import('./sceneGpgpuSystem'), 'GpgpuSystem');
const GpgpuSmoothTube = lazyNamedComponent<GpgpuSmoothTubeProps>(() => import('./sceneGpgpuSmoothTube'), 'GpgpuSmoothTube');
const MetaballSystem = lazyNamedComponent<MetaballSystemProps>(() => import('./sceneMetaballSystem'), 'MetaballSystem');
const GlyphOutlineSystem = lazyNamedComponent<GlyphOutlineSystemProps>(() => import('./sceneGlyphOutlineSystem'), 'GlyphOutlineSystem');

const MemoizedGpgpuSystem = React.memo(GpgpuSystem, (previous, next) => (
  previous.audioRef === next.audioRef
  && previous.isPlaying === next.isPlaying
  && previous.posReadbackRef === next.posReadbackRef
  && previous.posReadbackVersionRef === next.posReadbackVersionRef
  && areConfigsEqualByTrackedKeys(previous.config, next.config, {
    exactKeys: ['audioEnabled', 'renderQuality', 'executionDiagnosticsEnabled'],
    prefixes: ['gpgpu'],
  })
));

const MemoizedGpgpuSmoothTube = React.memo(GpgpuSmoothTube, (previous, next) => (
  previous.isPlaying === next.isPlaying
  && previous.posReadbackRef === next.posReadbackRef
  && previous.posReadbackVersionRef === next.posReadbackVersionRef
  && areConfigsEqualByTrackedKeys(previous.config, next.config, {
    exactKeys: [],
    prefixes: ['gpgpu'],
  })
));

const MemoizedMetaballSystem = React.memo(MetaballSystem, (previous, next) => (
  previous.isPlaying === next.isPlaying
  && previous.texSize === next.texSize
  && previous.posReadbackRef === next.posReadbackRef
  && previous.posReadbackVersionRef === next.posReadbackVersionRef
  && areConfigsEqualByTrackedKeys(previous.config, next.config, {
    exactKeys: [],
    prefixes: ['gpgpu'],
  })
));

const ParticleSystem = lazyNamedComponent<{
  config: ParticleConfig;
  layerIndex: 1 | 2 | 3 | 4;
  isAux?: boolean;
  auxMode?: 'aux' | 'spark';
  audioRef: SceneAudioRef;
  isPlaying: boolean;
  contactAmount: number;
}>(() => import('./sceneParticleSystem'), 'ParticleSystem');

function getTexSizeForCount(count: number) {
  return Math.max(2, Math.ceil(Math.sqrt(Math.max(1, count))));
}

const SceneChunkFallback = () => null;

function renderManagedLayerSceneSystems(
  config: ParticleConfig,
  layerIndex: 2 | 3,
  audioRef: SceneAudioRef,
  isPlaying: boolean,
) {
  const layerPlan = getLayerSceneRenderPlan(config, layerIndex);
  const result: React.ReactNode[] = [];

  if (layerPlan.futureNativeRenderer && layerPlan.futureNativeFamilyId) {
    const FutureNativeComponent = getFutureNativeSceneSystemContract().component;
    result.push(
      <FutureNativeComponent
        key={`future-native-${layerIndex}`}
        audioRef={audioRef}
        config={config}
        isPlaying={isPlaying}
        layerIndex={layerIndex}
      />,
    );
    return (
      <React.Suspense fallback={<SceneChunkFallback />}>
        {result}
      </React.Suspense>
    );
  }

  const ProceduralComponent = layerPlan.proceduralSystemId
    ? getProceduralSceneSystemContract(layerPlan.proceduralSystemId)?.component ?? null
    : null;
  if (ProceduralComponent) {
    result.push(
      <ProceduralComponent
        key={`procedural-${layerIndex}`}
        audioRef={audioRef}
        config={config}
        isPlaying={isPlaying}
        layerIndex={layerIndex}
      />,
    );
  }

  const HybridComponent = layerPlan.hybridSystemId
    ? getHybridSceneSystemContract(layerPlan.hybridSystemId)?.component ?? null
    : null;
  if (HybridComponent) {
    result.push(
      <HybridComponent
        key={`hybrid-${layerIndex}`}
        audioRef={audioRef}
        config={config}
        isPlaying={isPlaying}
        layerIndex={layerIndex}
      />,
    );
  }

  if (layerPlan.glyphOutline) {
    result.push(
      <GlyphOutlineSystem
        key={`glyph-outline-${layerIndex}`}
        audioRef={audioRef}
        config={config}
        layerIndex={layerIndex}
      />,
    );
  }

  if (result.length === 0) {
    return null;
  }

  return (
    <React.Suspense fallback={<SceneChunkFallback />}>
      {result}
    </React.Suspense>
  );
}

export const AppSceneLayerContent: React.FC<LayerContentProps> = ({
  audioRef,
  config,
  interLayerContactAmount,
  isPlaying,
  metaballPosRef,
  metaballReadbackVersionRef,
}) => {
  const layer2Plan = getLayerSceneRenderPlan(config, 2);
  const layer3Plan = getLayerSceneRenderPlan(config, 3);
  const gpgpuPlan = getGpgpuRenderOutputPlan(config);

  return (
    <SceneGroup config={config} isPlaying={isPlaying}>
      {config.layer1Enabled && (
        <ParticleSystem config={config} layerIndex={1} audioRef={audioRef} isPlaying={isPlaying} contactAmount={interLayerContactAmount} />
      )}
      {layer2Plan.particleCore && (
        <ParticleSystem config={config} layerIndex={2} audioRef={audioRef} isPlaying={isPlaying} contactAmount={interLayerContactAmount} />
      )}
      {renderManagedLayerSceneSystems(config, 2, audioRef, isPlaying)}
      {layer2Plan.auxParticles && (
        <ParticleSystem config={config} layerIndex={2} isAux={true} audioRef={audioRef} isPlaying={isPlaying} contactAmount={interLayerContactAmount} />
      )}
      {layer2Plan.sparkParticles && (
        <ParticleSystem config={config} layerIndex={2} isAux={true} auxMode="spark" audioRef={audioRef} isPlaying={isPlaying} contactAmount={interLayerContactAmount} />
      )}
      {layer3Plan.particleCore && (
        <ParticleSystem config={config} layerIndex={3} audioRef={audioRef} isPlaying={isPlaying} contactAmount={interLayerContactAmount} />
      )}
      {renderManagedLayerSceneSystems(config, 3, audioRef, isPlaying)}
      {layer3Plan.auxParticles && (
        <ParticleSystem config={config} layerIndex={3} isAux={true} audioRef={audioRef} isPlaying={isPlaying} contactAmount={interLayerContactAmount} />
      )}
      {layer3Plan.sparkParticles && (
        <ParticleSystem config={config} layerIndex={3} isAux={true} auxMode="spark" audioRef={audioRef} isPlaying={isPlaying} contactAmount={interLayerContactAmount} />
      )}
      {config.ambientEnabled && (
        <ParticleSystem config={config} layerIndex={4} audioRef={audioRef} isPlaying={isPlaying} contactAmount={interLayerContactAmount} />
      )}
      <React.Suspense fallback={<SceneChunkFallback />}>
        {gpgpuPlan.core && (
          <MemoizedGpgpuSystem config={config} audioRef={audioRef} isPlaying={isPlaying} posReadbackRef={metaballPosRef} posReadbackVersionRef={metaballReadbackVersionRef} />
        )}
        {gpgpuPlan.smoothTubes && (
          <MemoizedGpgpuSmoothTube config={config} posReadbackRef={metaballPosRef} posReadbackVersionRef={metaballReadbackVersionRef} isPlaying={isPlaying} />
        )}
        {gpgpuPlan.metaballs && (
          <MemoizedMetaballSystem
            config={config}
            posReadbackRef={metaballPosRef}
            posReadbackVersionRef={metaballReadbackVersionRef}
            texSize={getTexSizeForCount(config.gpgpuCount)}
            isPlaying={isPlaying}
          />
        )}
      </React.Suspense>
    </SceneGroup>
  );
};
