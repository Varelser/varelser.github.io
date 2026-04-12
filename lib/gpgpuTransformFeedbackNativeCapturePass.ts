import type { MutableRefObject } from 'react';
import type { Texture, WebGLRenderer } from 'three';

export type GpgpuTransformFeedbackNativeCapturePassExecution =
  | 'inactive'
  | 'unavailable'
  | 'allocation-failed'
  | 'noop-awaiting-program-binding'
  | 'program-link-failed'
  | 'source-textures-unavailable'
  | 'native-capture-issued';

export type GpgpuTransformFeedbackNativeCapturePassRendererBackend =
  | 'webgl2'
  | 'webgl1'
  | 'unknown';

export type GpgpuTransformFeedbackNativeCapturePassSnapshot = {
  texSize: number;
  particleCount: number;
  bytesPerStream: number;
  resourcesAllocated: boolean;
  programReady: boolean;
  execution: GpgpuTransformFeedbackNativeCapturePassExecution;
  rendererBackend: GpgpuTransformFeedbackNativeCapturePassRendererBackend;
  notes: string[];
};

type NativeProgramState = {
  vertexShader: WebGLShader | null;
  fragmentShader: WebGLShader | null;
  program: WebGLProgram | null;
  vertexArray: WebGLVertexArrayObject | null;
  positionUniform: WebGLUniformLocation | null;
  velocityUniform: WebGLUniformLocation | null;
  texSizeUniform: WebGLUniformLocation | null;
};

export type GpgpuTransformFeedbackNativeCapturePassState = {
  texSize: number;
  transformFeedback: WebGLTransformFeedback | null;
  positionBuffer: WebGLBuffer | null;
  velocityBuffer: WebGLBuffer | null;
  nativeProgram: NativeProgramState | null;
  snapshot: GpgpuTransformFeedbackNativeCapturePassSnapshot | null;
};

function createSnapshot(args: {
  texSize: number;
  particleCount: number;
  bytesPerStream: number;
  resourcesAllocated: boolean;
  programReady: boolean;
  execution: GpgpuTransformFeedbackNativeCapturePassExecution;
  rendererBackend: GpgpuTransformFeedbackNativeCapturePassRendererBackend;
  notes?: string[];
}): GpgpuTransformFeedbackNativeCapturePassSnapshot {
  return {
    texSize: args.texSize,
    particleCount: args.particleCount,
    bytesPerStream: args.bytesPerStream,
    resourcesAllocated: args.resourcesAllocated,
    programReady: args.programReady,
    execution: args.execution,
    rendererBackend: args.rendererBackend,
    notes: args.notes ?? [],
  };
}

function compileShader(ctx: WebGL2RenderingContext, shaderType: number, source: string): WebGLShader | null {
  const shader = ctx.createShader(shaderType);
  if (!shader) return null;
  ctx.shaderSource(shader, source);
  ctx.compileShader(shader);
  if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
    ctx.deleteShader(shader);
    return null;
  }
  return shader;
}

function createNativeProgram(ctx: WebGL2RenderingContext): NativeProgramState | null {
  const vertexShader = compileShader(ctx, ctx.VERTEX_SHADER, `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uPositionTex;
uniform sampler2D uVelocityTex;
uniform int uTexSize;
out vec4 tfPosition;
out vec4 tfVelocity;
void main() {
  int index = gl_VertexID;
  int x = index % uTexSize;
  int y = index / uTexSize;
  ivec2 coord = ivec2(x, y);
  tfPosition = texelFetch(uPositionTex, coord, 0);
  tfVelocity = texelFetch(uVelocityTex, coord, 0);
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  gl_PointSize = 1.0;
}`);
  const fragmentShader = compileShader(ctx, ctx.FRAGMENT_SHADER, `#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  outColor = vec4(0.0, 0.0, 0.0, 1.0);
}`);
  if (!vertexShader || !fragmentShader) {
    if (vertexShader) ctx.deleteShader(vertexShader);
    if (fragmentShader) ctx.deleteShader(fragmentShader);
    return null;
  }

  const program = ctx.createProgram();
  const vertexArray = ctx.createVertexArray();
  if (!program || !vertexArray) {
    if (program) ctx.deleteProgram(program);
    if (vertexArray) ctx.deleteVertexArray(vertexArray);
    ctx.deleteShader(vertexShader);
    ctx.deleteShader(fragmentShader);
    return null;
  }

  ctx.attachShader(program, vertexShader);
  ctx.attachShader(program, fragmentShader);
  ctx.transformFeedbackVaryings(program, ['tfPosition', 'tfVelocity'], ctx.SEPARATE_ATTRIBS);
  ctx.linkProgram(program);
  if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
    ctx.deleteProgram(program);
    ctx.deleteVertexArray(vertexArray);
    ctx.deleteShader(vertexShader);
    ctx.deleteShader(fragmentShader);
    return null;
  }

  return {
    vertexShader,
    fragmentShader,
    program,
    vertexArray,
    positionUniform: ctx.getUniformLocation(program, 'uPositionTex'),
    velocityUniform: ctx.getUniformLocation(program, 'uVelocityTex'),
    texSizeUniform: ctx.getUniformLocation(program, 'uTexSize'),
  };
}

function getNativeTexture(renderer: WebGLRenderer, texture: Texture | null): WebGLTexture | null {
  if (!texture) return null;
  const props = renderer as unknown as {
    properties?: {
      get?: (value: unknown) => Record<string, unknown> | undefined;
    };
  };
  const record = props.properties?.get?.(texture) ?? null;
  return (record?.__webglTexture as WebGLTexture | undefined) ?? null;
}

function disposeNativeProgram(ctx: WebGL2RenderingContext, nativeProgram: NativeProgramState | null): void {
  if (!nativeProgram) return;
  if (nativeProgram.program) ctx.deleteProgram(nativeProgram.program);
  if (nativeProgram.vertexShader) ctx.deleteShader(nativeProgram.vertexShader);
  if (nativeProgram.fragmentShader) ctx.deleteShader(nativeProgram.fragmentShader);
  if (nativeProgram.vertexArray) ctx.deleteVertexArray(nativeProgram.vertexArray);
}

function disposeState(ctx: WebGL2RenderingContext, state: GpgpuTransformFeedbackNativeCapturePassState | null): void {
  if (!state) return;
  if (state.positionBuffer) ctx.deleteBuffer(state.positionBuffer);
  if (state.velocityBuffer) ctx.deleteBuffer(state.velocityBuffer);
  if (state.transformFeedback) ctx.deleteTransformFeedback(state.transformFeedback);
  disposeNativeProgram(ctx, state.nativeProgram);
}

export function disposeGpgpuTransformFeedbackNativeCapturePass(args: {
  renderer: WebGLRenderer;
  stateRef: MutableRefObject<GpgpuTransformFeedbackNativeCapturePassState | null>;
  texSize?: number;
  reason?: string;
}): GpgpuTransformFeedbackNativeCapturePassSnapshot | null {
  const { renderer, stateRef, texSize = stateRef.current?.texSize ?? 0, reason = 'disposed' } = args;
  const particleCount = texSize * texSize;
  const bytesPerStream = particleCount * 4 * 4;
  const rawContext = renderer.getContext();
  const rendererBackend = detectRendererBackend(rawContext);

  if (typeof WebGL2RenderingContext !== 'undefined' && rawContext instanceof WebGL2RenderingContext) {
    disposeState(rawContext, stateRef.current);
  }

  const snapshot = createSnapshot({
    texSize,
    particleCount,
    bytesPerStream,
    resourcesAllocated: false,
    programReady: false,
    execution: 'inactive',
    rendererBackend,
    notes: [reason],
  });

  stateRef.current = {
    texSize,
    transformFeedback: null,
    positionBuffer: null,
    velocityBuffer: null,
    nativeProgram: null,
    snapshot,
  };

  return snapshot;
}

function detectRendererBackend(ctx: WebGLRenderingContext | WebGL2RenderingContext | null): GpgpuTransformFeedbackNativeCapturePassRendererBackend {
  if (!ctx) return 'unknown';
  if (typeof WebGL2RenderingContext !== 'undefined' && ctx instanceof WebGL2RenderingContext) return 'webgl2';
  if (typeof WebGLRenderingContext !== 'undefined' && ctx instanceof WebGLRenderingContext) return 'webgl1';
  return 'unknown';
}

export function ensureGpgpuTransformFeedbackNativeCapturePass(args: {
  renderer: WebGLRenderer;
  texSize: number;
  sourcePositionTexture: Texture | null;
  sourceVelocityTexture: Texture | null;
  enabled?: boolean;
  stateRef: MutableRefObject<GpgpuTransformFeedbackNativeCapturePassState | null>;
}): GpgpuTransformFeedbackNativeCapturePassSnapshot {
  const {
    renderer,
    texSize,
    sourcePositionTexture,
    sourceVelocityTexture,
    enabled = true,
    stateRef,
  } = args;
  const particleCount = texSize * texSize;
  const bytesPerStream = particleCount * 4 * 4;
  const rawContext = renderer.getContext();
  const rendererBackend = detectRendererBackend(rawContext);

  if (!enabled) {
    return disposeGpgpuTransformFeedbackNativeCapturePass({
      renderer,
      stateRef,
      texSize,
      reason: 'capture pass disabled',
    }) ?? createSnapshot({
      texSize,
      particleCount,
      bytesPerStream,
      resourcesAllocated: false,
      programReady: false,
      execution: 'inactive',
      rendererBackend,
      notes: ['capture pass disabled'],
    });
  }

  if (!(typeof WebGL2RenderingContext !== 'undefined' && rawContext instanceof WebGL2RenderingContext)) {
    const snapshot = createSnapshot({
      texSize,
      particleCount,
      bytesPerStream,
      resourcesAllocated: false,
      programReady: false,
      execution: 'unavailable',
      rendererBackend,
      notes: ['native capture requires WebGL2'],
    });
    stateRef.current = {
      texSize,
      transformFeedback: null,
      positionBuffer: null,
      velocityBuffer: null,
      nativeProgram: null,
      snapshot,
    };
    return snapshot;
  }

  const ctx = rawContext;
  let state = stateRef.current;
  const needsAllocate = !state
    || !state.transformFeedback
    || !state.positionBuffer
    || !state.velocityBuffer
    || state.texSize !== texSize;

  if (needsAllocate) {
    const previousState = state;
    disposeState(ctx, previousState ?? null);
    state = null;
    const transformFeedback = ctx.createTransformFeedback();
    const positionBuffer = ctx.createBuffer();
    const velocityBuffer = ctx.createBuffer();
    if (!transformFeedback || !positionBuffer || !velocityBuffer) {
      if (transformFeedback) ctx.deleteTransformFeedback(transformFeedback);
      if (positionBuffer) ctx.deleteBuffer(positionBuffer);
      if (velocityBuffer) ctx.deleteBuffer(velocityBuffer);
      const snapshot = createSnapshot({
        texSize,
        particleCount,
        bytesPerStream,
        resourcesAllocated: false,
        programReady: !!previousState?.nativeProgram?.program,
        execution: 'allocation-failed',
        rendererBackend: 'webgl2',
        notes: ['failed to allocate transform feedback buffers'],
      });
      stateRef.current = {
        texSize,
        transformFeedback: null,
        positionBuffer: null,
        velocityBuffer: null,
        nativeProgram: null,
        snapshot,
      };
      return snapshot;
    }

    ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
    ctx.bufferData(ctx.ARRAY_BUFFER, bytesPerStream, ctx.DYNAMIC_COPY);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, velocityBuffer);
    ctx.bufferData(ctx.ARRAY_BUFFER, bytesPerStream, ctx.DYNAMIC_COPY);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, null);

    state = {
      texSize,
      transformFeedback,
      positionBuffer,
      velocityBuffer,
      nativeProgram: null,
      snapshot: null,
    };
    stateRef.current = state;
  }

  if (!state) {
    throw new Error('gpgpu native capture state allocation failed');
  }

  if (!state.nativeProgram) {
    state.nativeProgram = createNativeProgram(ctx);
    stateRef.current = state;
  }

  if (!state.nativeProgram?.program || !state.nativeProgram.vertexArray) {
    const snapshot = createSnapshot({
      texSize,
      particleCount,
      bytesPerStream,
      resourcesAllocated: true,
      programReady: false,
      execution: 'program-link-failed',
      rendererBackend: 'webgl2',
      notes: ['native transform feedback program compile/link failed'],
    });
    state.snapshot = snapshot;
    return snapshot;
  }

  const nativePositionTexture = getNativeTexture(renderer, sourcePositionTexture);
  const nativeVelocityTexture = getNativeTexture(renderer, sourceVelocityTexture);
  if (!nativePositionTexture || !nativeVelocityTexture) {
    const snapshot = createSnapshot({
      texSize,
      particleCount,
      bytesPerStream,
      resourcesAllocated: true,
      programReady: true,
      execution: 'source-textures-unavailable',
      rendererBackend: 'webgl2',
      notes: ['active ping-pong texture native handles are not available yet'],
    });
    state.snapshot = snapshot;
    return snapshot;
  }

  const previousProgram = ctx.getParameter(ctx.CURRENT_PROGRAM) as WebGLProgram | null;
  const previousVao = ctx.getParameter(ctx.VERTEX_ARRAY_BINDING) as WebGLVertexArrayObject | null;
  const previousActiveTexture = ctx.getParameter(ctx.ACTIVE_TEXTURE) as number;
  const rasterizerDiscardWasEnabled = ctx.isEnabled(ctx.RASTERIZER_DISCARD);

  ctx.useProgram(state.nativeProgram.program);
  ctx.bindVertexArray(state.nativeProgram.vertexArray);
  ctx.bindTransformFeedback(ctx.TRANSFORM_FEEDBACK, state.transformFeedback);
  ctx.bindBufferBase(ctx.TRANSFORM_FEEDBACK_BUFFER, 0, state.positionBuffer);
  ctx.bindBufferBase(ctx.TRANSFORM_FEEDBACK_BUFFER, 1, state.velocityBuffer);

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.bindTexture(ctx.TEXTURE_2D, nativePositionTexture);
  if (state.nativeProgram.positionUniform) ctx.uniform1i(state.nativeProgram.positionUniform, 0);
  ctx.activeTexture(ctx.TEXTURE1);
  ctx.bindTexture(ctx.TEXTURE_2D, nativeVelocityTexture);
  if (state.nativeProgram.velocityUniform) ctx.uniform1i(state.nativeProgram.velocityUniform, 1);
  if (state.nativeProgram.texSizeUniform) ctx.uniform1i(state.nativeProgram.texSizeUniform, texSize);

  if (!rasterizerDiscardWasEnabled) ctx.enable(ctx.RASTERIZER_DISCARD);
  ctx.beginTransformFeedback(ctx.POINTS);
  ctx.drawArrays(ctx.POINTS, 0, particleCount);
  ctx.endTransformFeedback();
  if (!rasterizerDiscardWasEnabled) ctx.disable(ctx.RASTERIZER_DISCARD);

  ctx.bindBufferBase(ctx.TRANSFORM_FEEDBACK_BUFFER, 0, null);
  ctx.bindBufferBase(ctx.TRANSFORM_FEEDBACK_BUFFER, 1, null);
  ctx.bindTransformFeedback(ctx.TRANSFORM_FEEDBACK, null);
  ctx.bindTexture(ctx.TEXTURE_2D, null);
  ctx.activeTexture(ctx.TEXTURE0);
  ctx.bindTexture(ctx.TEXTURE_2D, null);
  ctx.activeTexture(previousActiveTexture);
  ctx.bindVertexArray(previousVao);
  ctx.useProgram(previousProgram);
  renderer.resetState();

  const snapshot = createSnapshot({
    texSize,
    particleCount,
    bytesPerStream,
    resourcesAllocated: true,
    programReady: true,
    execution: 'native-capture-issued',
    rendererBackend: 'webgl2',
    notes: ['issued begin/endTransformFeedback against active ping-pong textures'],
  });
  state.snapshot = snapshot;
  return snapshot;
}
