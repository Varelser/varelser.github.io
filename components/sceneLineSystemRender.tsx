import React from 'react';
import { DoubleSide } from 'three';
import type { BufferGeometry, LineSegments, Mesh } from 'three';
import type { ParticleConfig } from '../types';
import { BRUSH_LINE_FRAGMENT_SHADER, BRUSH_LINE_VERTEX_SHADER, createBrushLineUniforms, createClassicLineUniforms, getLineBlendMode, LINE_FRAGMENT_SHADER, LINE_VERTEX_SHADER } from './sceneLineSystemShared';
import { ShaderUniformMap } from './sceneShared';

const EMPTY_FLOAT32 = new Float32Array(0);

export const LineSystemRender: React.FC<{
  config: ParticleConfig;
  layerConnectionStyle: ParticleConfig['layer2ConnectionStyle'];
  uniforms: ShaderUniformMap;
  lineRef: React.RefObject<LineSegments | null>;
  brushRef: React.RefObject<Mesh | null>;
  lineGeometryRef: React.RefObject<BufferGeometry | null>;
  brushGeometryRef: React.RefObject<BufferGeometry | null>;
}> = ({ config, layerConnectionStyle, uniforms, lineRef, brushRef, lineGeometryRef, brushGeometryRef }) => {
  const classicUniforms = React.useMemo(() => createClassicLineUniforms(uniforms), [uniforms]);
  const brushUniforms = React.useMemo(() => createBrushLineUniforms(config, uniforms, layerConnectionStyle), [config, layerConnectionStyle, uniforms]);

  return (
    <>
      <mesh ref={brushRef as React.Ref<any>} visible={layerConnectionStyle !== 'classic'}>
        <bufferGeometry ref={brushGeometryRef as React.Ref<any>}>
          <bufferAttribute attach="attributes-position" count={0} array={EMPTY_FLOAT32} itemSize={3} />
          <bufferAttribute attach="attributes-aPosA" count={0} array={EMPTY_FLOAT32} itemSize={3} />
          <bufferAttribute attach="attributes-aOffA" count={0} array={EMPTY_FLOAT32} itemSize={3} />
          <bufferAttribute attach="attributes-aData1A" count={0} array={EMPTY_FLOAT32} itemSize={4} />
          <bufferAttribute attach="attributes-aData2A" count={0} array={EMPTY_FLOAT32} itemSize={4} />
          <bufferAttribute attach="attributes-aData3A" count={0} array={EMPTY_FLOAT32} itemSize={4} />
          <bufferAttribute attach="attributes-aPosB" count={0} array={EMPTY_FLOAT32} itemSize={3} />
          <bufferAttribute attach="attributes-aOffB" count={0} array={EMPTY_FLOAT32} itemSize={3} />
          <bufferAttribute attach="attributes-aData1B" count={0} array={EMPTY_FLOAT32} itemSize={4} />
          <bufferAttribute attach="attributes-aData2B" count={0} array={EMPTY_FLOAT32} itemSize={4} />
          <bufferAttribute attach="attributes-aData3B" count={0} array={EMPTY_FLOAT32} itemSize={4} />
          <bufferAttribute attach="attributes-aLineCoord" count={0} array={EMPTY_FLOAT32} itemSize={2} />
        </bufferGeometry>
        <shaderMaterial vertexShader={BRUSH_LINE_VERTEX_SHADER} fragmentShader={BRUSH_LINE_FRAGMENT_SHADER} uniforms={brushUniforms} transparent={true} depthWrite={false} side={DoubleSide} blending={getLineBlendMode(config.backgroundColor)} />
      </mesh>
      <lineSegments ref={lineRef as React.Ref<any>} visible={layerConnectionStyle === 'classic'}>
        <bufferGeometry ref={lineGeometryRef as React.Ref<any>}>
          <bufferAttribute attach="attributes-position" count={0} array={EMPTY_FLOAT32} itemSize={3} />
          <bufferAttribute attach="attributes-aPosA" count={0} array={EMPTY_FLOAT32} itemSize={3} />
          <bufferAttribute attach="attributes-aOffA" count={0} array={EMPTY_FLOAT32} itemSize={3} />
          <bufferAttribute attach="attributes-aData1A" count={0} array={EMPTY_FLOAT32} itemSize={4} />
          <bufferAttribute attach="attributes-aData2A" count={0} array={EMPTY_FLOAT32} itemSize={4} />
          <bufferAttribute attach="attributes-aData3A" count={0} array={EMPTY_FLOAT32} itemSize={4} />
          <bufferAttribute attach="attributes-aPosB" count={0} array={EMPTY_FLOAT32} itemSize={3} />
          <bufferAttribute attach="attributes-aOffB" count={0} array={EMPTY_FLOAT32} itemSize={3} />
          <bufferAttribute attach="attributes-aData1B" count={0} array={EMPTY_FLOAT32} itemSize={4} />
          <bufferAttribute attach="attributes-aData2B" count={0} array={EMPTY_FLOAT32} itemSize={4} />
          <bufferAttribute attach="attributes-aData3B" count={0} array={EMPTY_FLOAT32} itemSize={4} />
          <bufferAttribute attach="attributes-aMix" count={0} array={EMPTY_FLOAT32} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial vertexShader={LINE_VERTEX_SHADER} fragmentShader={LINE_FRAGMENT_SHADER} uniforms={classicUniforms} transparent={true} depthWrite={false} blending={getLineBlendMode(config.backgroundColor)} />
      </lineSegments>
    </>
  );
};
