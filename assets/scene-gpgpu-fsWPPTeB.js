import{k as $e,j,r as b}from"./react-vendor-BLE9nPfI.js";import{J as Dt,r as Vt,K as Ut,L as Gt}from"./scene-runtime-catalog-DTxoSzGh.js";import{H,ac as ce,h as re,f as _e,j as X,am as pt,ak as It,ah as _t,ai as Wt,aj as Ot,an as dt,D as Xe,z as Ve,af as Je,c as pe,a7 as kt,o as et,F as le,g as se,v as Ze,a8 as Ce,S as St,O as xt,k as ft,p as ct,a9 as gt,ab as Lt,d as Nt,n as qt,a6 as Yt}from"./three-core-CZYXVIXO.js";import{c as Xt,e as Zt}from"./scene-overlay-core-C1hZwqg3.js";import{i as jt}from"./scene-family-membrane-DgBEUXOF.js";import{u as Ht,p as ie}from"./scene-runtime-profiling-CKBHAYLi.js";import{a as Kt,u as Qt}from"./r3f-fiber-CBj7iv8R.js";const yt=$e.memo(({config:u,assets:t})=>{const{drawGeo:e,drawMat:i,geomMeshObj:l,trailMats:s,ribbonGeo:d,ribbonMats:c,tubeGeo:n,tubeMats:f,streakGeo:p,streakMat:o,volumetricMeshObj:a}=t,h=Dt(u);return j.jsxs(j.Fragment,{children:[h.pointSprites&&j.jsx("points",{geometry:e,material:i}),h.instancedSolids&&l&&j.jsx("primitive",{object:l}),h.trailPoints&&s.map((v,x)=>j.jsx("points",{geometry:e,material:v},x)),h.ribbons&&c.map((v,x)=>j.jsx("mesh",{geometry:d,material:v},x)),h.tubes&&f.map((v,x)=>j.jsx("mesh",{geometry:n,material:v},x)),h.streakLines&&j.jsx("lineSegments",{geometry:p,material:o}),h.volumetric&&a&&j.jsx("primitive",{object:a})]})});yt.displayName="GpgpuRenderOutputs";const Tt=({config:u,assets:t})=>j.jsx(yt,{config:u,assets:t}),$t=90;class Jt{constructor(){this.fpsBuffer=[]}update(t){const e=1/Math.max(t,.001);this.fpsBuffer.push(e),this.fpsBuffer.length>$t&&this.fpsBuffer.shift()}getAverageFps(){return this.fpsBuffer.length===0?60:this.fpsBuffer.reduce((t,e)=>t+e,0)/this.fpsBuffer.length}getLevel(){const t=this.getAverageFps();return t>=45?0:t>=25?1:2}getCountMultiplier(){const t=this.getLevel();return t===0?1:t===1?.5:.25}getEffectiveCount(t){return Math.max(16,Math.floor(t*this.getCountMultiplier()))}shouldSkipExpensive(){return this.getLevel()>=2}}function ye(u){return{texSize:u.texSize,particleCount:u.particleCount,bytesPerStream:u.bytesPerStream,resourcesAllocated:u.resourcesAllocated,programReady:u.programReady,execution:u.execution,rendererBackend:u.rendererBackend,notes:u.notes??[]}}function vt(u,t,e){const i=u.createShader(t);return i?(u.shaderSource(i,e),u.compileShader(i),u.getShaderParameter(i,u.COMPILE_STATUS)?i:(u.deleteShader(i),null)):null}function eu(u){const t=vt(u,u.VERTEX_SHADER,`#version 300 es
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
}`),e=vt(u,u.FRAGMENT_SHADER,`#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  outColor = vec4(0.0, 0.0, 0.0, 1.0);
}`);if(!t||!e)return t&&u.deleteShader(t),e&&u.deleteShader(e),null;const i=u.createProgram(),l=u.createVertexArray();return!i||!l?(i&&u.deleteProgram(i),l&&u.deleteVertexArray(l),u.deleteShader(t),u.deleteShader(e),null):(u.attachShader(i,t),u.attachShader(i,e),u.transformFeedbackVaryings(i,["tfPosition","tfVelocity"],u.SEPARATE_ATTRIBS),u.linkProgram(i),u.getProgramParameter(i,u.LINK_STATUS)?{vertexShader:t,fragmentShader:e,program:i,vertexArray:l,positionUniform:u.getUniformLocation(i,"uPositionTex"),velocityUniform:u.getUniformLocation(i,"uVelocityTex"),texSizeUniform:u.getUniformLocation(i,"uTexSize")}:(u.deleteProgram(i),u.deleteVertexArray(l),u.deleteShader(t),u.deleteShader(e),null))}function mt(u,t){var l,s;if(!t)return null;const i=((s=(l=u.properties)==null?void 0:l.get)==null?void 0:s.call(l,t))??null;return(i==null?void 0:i.__webglTexture)??null}function tu(u,t){t&&(t.program&&u.deleteProgram(t.program),t.vertexShader&&u.deleteShader(t.vertexShader),t.fragmentShader&&u.deleteShader(t.fragmentShader),t.vertexArray&&u.deleteVertexArray(t.vertexArray))}function Mt(u,t){t&&(t.positionBuffer&&u.deleteBuffer(t.positionBuffer),t.velocityBuffer&&u.deleteBuffer(t.velocityBuffer),t.transformFeedback&&u.deleteTransformFeedback(t.transformFeedback),tu(u,t.nativeProgram))}function At(u){var p;const{renderer:t,stateRef:e,texSize:i=((p=e.current)==null?void 0:p.texSize)??0,reason:l="disposed"}=u,s=i*i,d=s*4*4,c=t.getContext(),n=Rt(c);typeof WebGL2RenderingContext<"u"&&c instanceof WebGL2RenderingContext&&Mt(c,e.current);const f=ye({texSize:i,particleCount:s,bytesPerStream:d,resourcesAllocated:!1,programReady:!1,execution:"inactive",rendererBackend:n,notes:[l]});return e.current={texSize:i,transformFeedback:null,positionBuffer:null,velocityBuffer:null,nativeProgram:null,snapshot:f},f}function Rt(u){return u?typeof WebGL2RenderingContext<"u"&&u instanceof WebGL2RenderingContext?"webgl2":typeof WebGLRenderingContext<"u"&&u instanceof WebGLRenderingContext?"webgl1":"unknown":"unknown"}function uu(u){var A,R;const{renderer:t,texSize:e,sourcePositionTexture:i,sourceVelocityTexture:l,enabled:s=!0,stateRef:d}=u,c=e*e,n=c*4*4,f=t.getContext(),p=Rt(f);if(!s)return At({renderer:t,stateRef:d,texSize:e,reason:"capture pass disabled"})??ye({texSize:e,particleCount:c,bytesPerStream:n,resourcesAllocated:!1,programReady:!1,execution:"inactive",rendererBackend:p,notes:["capture pass disabled"]});if(!(typeof WebGL2RenderingContext<"u"&&f instanceof WebGL2RenderingContext)){const T=ye({texSize:e,particleCount:c,bytesPerStream:n,resourcesAllocated:!1,programReady:!1,execution:"unavailable",rendererBackend:p,notes:["native capture requires WebGL2"]});return d.current={texSize:e,transformFeedback:null,positionBuffer:null,velocityBuffer:null,nativeProgram:null,snapshot:T},T}const o=f;let a=d.current;if(!a||!a.transformFeedback||!a.positionBuffer||!a.velocityBuffer||a.texSize!==e){const T=a;Mt(o,T??null),a=null;const F=o.createTransformFeedback(),z=o.createBuffer(),B=o.createBuffer();if(!F||!z||!B){F&&o.deleteTransformFeedback(F),z&&o.deleteBuffer(z),B&&o.deleteBuffer(B);const C=ye({texSize:e,particleCount:c,bytesPerStream:n,resourcesAllocated:!1,programReady:!!((A=T==null?void 0:T.nativeProgram)!=null&&A.program),execution:"allocation-failed",rendererBackend:"webgl2",notes:["failed to allocate transform feedback buffers"]});return d.current={texSize:e,transformFeedback:null,positionBuffer:null,velocityBuffer:null,nativeProgram:null,snapshot:C},C}o.bindBuffer(o.ARRAY_BUFFER,z),o.bufferData(o.ARRAY_BUFFER,n,o.DYNAMIC_COPY),o.bindBuffer(o.ARRAY_BUFFER,B),o.bufferData(o.ARRAY_BUFFER,n,o.DYNAMIC_COPY),o.bindBuffer(o.ARRAY_BUFFER,null),a={texSize:e,transformFeedback:F,positionBuffer:z,velocityBuffer:B,nativeProgram:null,snapshot:null},d.current=a}if(!a)throw new Error("gpgpu native capture state allocation failed");if(a.nativeProgram||(a.nativeProgram=eu(o),d.current=a),!((R=a.nativeProgram)!=null&&R.program)||!a.nativeProgram.vertexArray){const T=ye({texSize:e,particleCount:c,bytesPerStream:n,resourcesAllocated:!0,programReady:!1,execution:"program-link-failed",rendererBackend:"webgl2",notes:["native transform feedback program compile/link failed"]});return a.snapshot=T,T}const v=mt(t,i),x=mt(t,l);if(!v||!x){const T=ye({texSize:e,particleCount:c,bytesPerStream:n,resourcesAllocated:!0,programReady:!0,execution:"source-textures-unavailable",rendererBackend:"webgl2",notes:["active ping-pong texture native handles are not available yet"]});return a.snapshot=T,T}const M=o.getParameter(o.CURRENT_PROGRAM),r=o.getParameter(o.VERTEX_ARRAY_BINDING),m=o.getParameter(o.ACTIVE_TEXTURE),g=o.isEnabled(o.RASTERIZER_DISCARD);o.useProgram(a.nativeProgram.program),o.bindVertexArray(a.nativeProgram.vertexArray),o.bindTransformFeedback(o.TRANSFORM_FEEDBACK,a.transformFeedback),o.bindBufferBase(o.TRANSFORM_FEEDBACK_BUFFER,0,a.positionBuffer),o.bindBufferBase(o.TRANSFORM_FEEDBACK_BUFFER,1,a.velocityBuffer),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,v),a.nativeProgram.positionUniform&&o.uniform1i(a.nativeProgram.positionUniform,0),o.activeTexture(o.TEXTURE1),o.bindTexture(o.TEXTURE_2D,x),a.nativeProgram.velocityUniform&&o.uniform1i(a.nativeProgram.velocityUniform,1),a.nativeProgram.texSizeUniform&&o.uniform1i(a.nativeProgram.texSizeUniform,e),g||o.enable(o.RASTERIZER_DISCARD),o.beginTransformFeedback(o.POINTS),o.drawArrays(o.POINTS,0,c),o.endTransformFeedback(),g||o.disable(o.RASTERIZER_DISCARD),o.bindBufferBase(o.TRANSFORM_FEEDBACK_BUFFER,0,null),o.bindBufferBase(o.TRANSFORM_FEEDBACK_BUFFER,1,null),o.bindTransformFeedback(o.TRANSFORM_FEEDBACK,null),o.bindTexture(o.TEXTURE_2D,null),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,null),o.activeTexture(m),o.bindVertexArray(r),o.useProgram(M),t.resetState();const y=ye({texSize:e,particleCount:c,bytesPerStream:n,resourcesAllocated:!0,programReady:!0,execution:"native-capture-issued",rendererBackend:"webgl2",notes:["issued begin/endTransformFeedback against active ping-pong textures"]});return a.snapshot=y,y}function ou(u,t=null){const e=[...u.execution.notes,...(t==null?void 0:t.execution)==="source-textures-unavailable"?["native transform feedback pass resources exist, but source textures are not yet exposed as native handles"]:[],...(t==null?void 0:t.resourcesAllocated)===!0&&(t==null?void 0:t.execution)!=="native-capture-issued"?["native transform feedback pass resources exist, but a real capture issue has not been observed yet"]:[]];return{backend:u.execution.resolvedEngine,requestedBackend:u.execution.requestedEngine,path:u.execution.path,reason:u.execution.reason,capabilityFlags:u.execution.capabilityFlags,notes:e,features:u.foundation.features,unsupportedFeatures:u.foundation.unsupportedFeatures,readbackMode:u.readbackMode,webgpuStatus:u.webgpuStatus,nativeTransformFeedbackPass:t}}function ru(u){const{routing:t,gl:e,posOut:i,texSize:l,posReadbackRef:s,posReadbackVersionRef:d}=u;if(!s||t.readbackMode!=="webgl-readback")return;const c=l*l;(!s.current||s.current.length!==c*4)&&(s.current=new Float32Array(c*4)),e.readRenderTargetPixels(i,0,0,l,l,s.current),d&&(d.current+=1)}function nu(u){const t=u.gpgpuSmoothTubeEnabled?u.renderQuality==="cinematic"?1:u.renderQuality==="draft"?3:2:0,e=u.gpgpuMetaballEnabled?Math.max(1,Math.round(u.gpgpuMetaballUpdateSkip)):0;return t>0&&e>0?Math.min(t,e):Math.max(t,e)}function au(u,t){const e=nu(u);return e<=0?!1:t%e===0}function iu(u,t){return{isA:t,posIn:t?u.posA:u.posB,posOut:t?u.posB:u.posA,velIn:t?u.velA:u.velB,velOut:t?u.velB:u.velA}}function lu(u,t){return!u.gpgpuAudioReactive||!u.audioEnabled?0:(t.bass*.55+t.pulse*.9)*u.gpgpuAudioBlast}function su(u){const{config:t,webgpuState:e,webgpuPosTexture:i,webgpuVelTexture:l,fallbackPosTexture:s,fallbackVelTexture:d,posReadbackRef:c,webgpuInitStatus:n="idle"}=u,f=e!==null&&i!==null&&l!==null,p=Vt(t,{webgpuAvailable:f}),o=Ut(t,"gpgpu",{gpgpuWebgpuAvailable:f})??{key:"gpgpu",label:"GPGPU",enabled:t.gpgpuEnabled,mode:p.features.includes("metaball")?"metaball":p.path,renderClass:p.features.includes("metaball")?"metaball-surface":"gpu-particles",simulationClass:p.backend,requestedEngine:p.requestedBackend,resolvedEngine:p.backend,path:p.path,overrideId:"auto",proceduralSystemId:null,hybridKind:p.backend==="webgpu-compute"?"compute":null,capabilityFlags:[],reason:p.reason,notes:[]};let a={...p,features:[...p.features],supportedFeatures:[...p.supportedFeatures],unsupportedFeatures:[...p.unsupportedFeatures]},h={...o,notes:[...o.notes??[]],capabilityFlags:[...o.capabilityFlags??[]],sceneBranches:[...o.sceneBranches??[]]};const v=h.resolvedEngine==="webgpu-compute"&&e!==null&&i!==null&&l!==null,x=h.requestedEngine==="webgpu-compute"||a.requestedBackend==="webgpu-compute",M=x&&a.unsupportedFeatures.length>0,r=v?"ready":M?"unavailable":x&&n==="ready"?"fallback-active":n;x&&!v&&(M?(h={...h,reason:"webgpu requested, but current config is outside compute capability; staying on webgl route",notes:[...h.notes,`webgpu config blocker: ${a.unsupportedFeatures.join(", ")}`]},a={...a,reason:`webgpu requested, config blocked by unsupported features (${a.unsupportedFeatures.join(", ")})`}):n==="initializing"?(h={...h,reason:"webgpu requested, temporarily using webgl while runtime initializes",notes:[...h.notes,"webgpu runtime: initializing"]},a={...a,reason:"webgpu requested, waiting for runtime init"}):n==="unavailable"?h={...h,notes:[...h.notes,"webgpu runtime: unavailable on this device/browser"]}:n==="failed"&&(h={...h,notes:[...h.notes,"webgpu runtime: initialization failed; using webgl fallback"]}));const m=t.gpgpuMetaballEnabled||t.gpgpuSmoothTubeEnabled;return{foundation:a,execution:h,useWebGPU:v,webgpuStatus:r,outputPosTexture:v&&i?i:s,outputVelTexture:v&&l?l:d,readbackMode:c?v?m?"webgpu-readback":"webgpu-skip":m?"webgl-readback":"none":"none"}}function pu(u){const{pressure:t,viscosity:e,radius:i,restDensity:l}=u;let s=24;i>=64&&(s=32),i>=104&&(s=40),(i>=152||t>=5.5||e>=1.15)&&(s=48);const d=Math.max(.14,Math.min(.24,.14+e*.02+t*.004)),c=Math.max(.14,Math.min(.34,.18+t*.02-e*.03+Math.max(0,l-1.4)*.015));return{sampleCount:s,flowClampScale:d,cohesionStrength:c}}const du=`
struct Uniforms {
  texSize : u32,
  delta   : f32,
  time    : f32,
  gravity : f32,
  turbulence : f32,
  bounceRadius : f32,
  bounce : f32,
  speed  : f32,
  curlStrength : f32,
  curlScale : f32,
  windStrength : f32,
  windX : f32,
  windY : f32,
  windZ : f32,
  windGust : f32,
  vFieldType : f32,
  vFieldStrength : f32,
  vFieldScale : f32,
  wellStrength : f32,
  wellSoftening : f32,
  wellOrbit : f32,
  vortexStrength : f32,
  vortexTilt : f32,
  attractorType : f32,
  attractorStrength : f32,
  attractorScale : f32,
  mouseStrength : f32,
  mouseRadius : f32,
  mouseMode : f32,
  mouseX : f32,
  mouseY : f32,
  mouseZ : f32,
  fluidInfluence : f32,
  fluidScale : f32,
  fluidStrength : f32,
  fluidExtForce : f32,
  boidsSeparation : f32,
  boidsAlignment : f32,
  boidsCohesion : f32,
  boidsRadius : f32,
  nbodyStrength : f32,
  nbodyRepulsion : f32,
  nbodySoftening : f32,
  nbodySampleCount : f32,
  magneticStrength : f32,
  magneticBX : f32,
  magneticBY : f32,
  magneticBZ : f32,
  springStrength : f32,
  elasticStrength : f32,
  sphPressure : f32,
  sphViscosity : f32,
  sphRadius : f32,
  sphRestDensity : f32,
  sphSampleCount : f32,
  sphFlowClampScale : f32,
  sphCohesion : f32,
  sdfEnabled : f32,
  sdfShape : f32,
  sdfX : f32,
  sdfY : f32,
  sdfZ : f32,
  sdfSize : f32,
  sdfBounce : f32,
};

@group(0) @binding(0) var<uniform> u : Uniforms;
@group(0) @binding(1) var<storage, read>       posIn  : array<vec4f>;
@group(0) @binding(2) var<storage, read>       velIn  : array<vec4f>;
@group(0) @binding(3) var<storage, read_write> velOut : array<vec4f>;
@group(0) @binding(4) var<storage, read>       initPos : array<vec4f>;

fn hash3(p: vec3f) -> vec3f {
  var q = vec3f(dot(p, vec3f(127.1, 311.7, 74.7)),
                dot(p, vec3f(269.5, 183.3, 246.1)),
                dot(p, vec3f(113.5, 271.9, 124.6)));
  return fract(sin(q) * 43758.5453) * 2.0 - 1.0;
}
fn vnoise(p: vec3f) -> f32 {
  let i = floor(p); let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(dot(hash3(i),f),
                     dot(hash3(i+vec3f(1,0,0)),f-vec3f(1,0,0)),u.x),
                 mix(dot(hash3(i+vec3f(0,1,0)),f-vec3f(0,1,0)),
                     dot(hash3(i+vec3f(1,1,0)),f-vec3f(1,1,0)),u.x),u.y),
             mix(mix(dot(hash3(i+vec3f(0,0,1)),f-vec3f(0,0,1)),
                     dot(hash3(i+vec3f(1,0,1)),f-vec3f(1,0,1)),u.x),
                 mix(dot(hash3(i+vec3f(0,1,1)),f-vec3f(0,1,1)),
                     dot(hash3(i+vec3f(1,1,1)),f-vec3f(1,1,1)),u.x),u.y));
}


fn sdBox(p: vec3f, b: vec3f) -> f32 {
  let q = abs(p) - b;
  return length(max(q, vec3f(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
}

fn computeSdfCollision(pos: vec3f, sdfShape: f32, sdfX: f32, sdfY: f32, sdfZ: f32, sdfSize: f32) -> vec4f {
  let sc = vec3f(sdfX, sdfY, sdfZ);
  var sd = 0.0;
  var sn = vec3f(0.0, 1.0, 0.0);
  if (sdfShape < 0.5) {
    let dp = pos - sc;
    sd = length(dp) - sdfSize;
    sn = normalize(dp + vec3f(0.0001));
  } else if (sdfShape < 1.5) {
    let dq = pos - sc;
    let aq = abs(dq);
    let dd = aq - vec3f(sdfSize);
    sd = sdBox(dq, vec3f(sdfSize));
    if (max(dd.x, max(dd.y, dd.z)) > 0.0) {
      sn = normalize(max(dd, vec3f(0.0)) * sign(dq) + vec3f(0.0001));
    } else if (dd.x > dd.y && dd.x > dd.z) {
      sn = vec3f(sign(dq.x), 0.0, 0.0);
    } else if (dd.y > dd.z) {
      sn = vec3f(0.0, sign(dq.y), 0.0);
    } else {
      sn = vec3f(0.0, 0.0, sign(dq.z));
    }
  } else if (sdfShape < 2.5) {
    let lp = pos - sc;
    let r2 = sdfSize * 0.35;
    let ringD = length(lp.xz) - sdfSize;
    sd = length(vec2f(ringD, lp.y)) - r2;
    let lxz = length(lp.xz) + 0.001;
    sn = normalize(vec3f(lp.x / lxz * ringD, lp.y, lp.z / lxz * ringD) + vec3f(0.0001));
  } else {
    let yc = clamp(pos.y - sc.y, -sdfSize, sdfSize);
    let dp = vec3f(pos.x - sc.x, pos.y - sc.y - yc, pos.z - sc.z);
    sd = length(dp) - sdfSize * 0.4;
    sn = normalize(dp + vec3f(0.0001));
  }
  return vec4f(sn, sd);
}

fn computeVortexVelocity(pos: vec3f, vortexTilt: f32) -> vec3f {
  let axis = normalize(vec3f(vortexTilt * 0.6, 1.0, (1.0 - abs(vortexTilt)) * 0.35 + 0.05));
  let radial = pos - axis * dot(pos, axis);
  let r2 = max(dot(radial, radial), 0.0008);
  let swirl = cross(axis, radial) / sqrt(r2);
  let lift = axis * (0.22 + clamp(abs(vortexTilt), 0.0, 1.0) * 0.34);
  return swirl + lift;
}
fn computeVectorField(pos: vec3f, fieldType: f32, fieldScale: f32) -> vec3f {
  let scaled = pos * max(0.0001, fieldScale);
  if (fieldType < 0.5) {
    return vec3f(scaled.x, -scaled.y, -scaled.z);
  }
  if (fieldType < 1.5) {
    return vec3f(scaled.x, -scaled.y, 0.0);
  }
  if (fieldType < 2.5) {
    return vec3f(-scaled.y, scaled.x, 0.35 * scaled.z);
  }
  return normalize(scaled + vec3f(0.0001)) * length(scaled);
}


fn computeFluidVelocity(pos: vec3f, time: f32, fluidScale: f32, fluidExtForce: f32) -> vec3f {
  let scale = max(0.0001, fluidScale);
  let uv = pos.xz / scale;
  let t = time * 0.45;
  let flow2 = vec2f(
    sin(uv.y * 1.9 + t) + cos(uv.x * 1.3 - t * 1.2),
    cos(uv.x * 1.7 - t) - sin(uv.y * 1.5 + t * 0.8)
  );
  var flow = vec3f(flow2.x, 0.0, flow2.y);
  if (fluidExtForce > 0.5) {
    let radial = vec3f(pos.x, 0.0, pos.z);
    let tangent = cross(vec3f(0.0, 1.0, 0.0), normalize(radial + vec3f(0.001, 0.0, 0.001)));
    flow += tangent * (0.75 + 0.25 * sin(t + length(radial) * 0.01));
  }
  return flow;
}

fn computeAttractorVelocity(pos: vec3f, attractorType: f32, attractorScale: f32) -> vec3f {
  let ap = pos / max(0.1, attractorScale);
  if (attractorType < 0.5) {
    return vec3f(10.0 * (ap.y - ap.x), ap.x * (28.0 - ap.z) - ap.y, ap.x * ap.y - 2.667 * ap.z);
  }
  if (attractorType < 1.5) {
    return vec3f(-(ap.y + ap.z), ap.x + 0.2 * ap.y, 0.2 + ap.z * (ap.x - 5.7));
  }
  return vec3f(sin(ap.y) - 0.208 * ap.x, sin(ap.z) - 0.208 * ap.y, sin(ap.x) - 0.208 * ap.z);
}


fn computeNBodyVelocity(pos: vec3f, time: f32, strength: f32, repulsionRadius: f32, softening: f32, sampleCount: f32) -> vec3f {
  let samples = max(1.0, sampleCount);
  let stride = 6.2831853 / samples;
  var acc = vec3f(0.0);
  for (var i = 0.0; i < 64.0; i = i + 1.0) {
    if (i >= samples) { break; }
    let angle = i * stride + time * (0.08 + 0.01 * i);
    let radius = repulsionRadius * (0.75 + fract(i * 0.6180339) * 1.4);
    let phase = time * (0.19 + 0.013 * i);
    let anchor = vec3f(
      cos(angle) * radius,
      sin(phase) * radius * 0.45,
      sin(angle) * radius
    );
    let diff = anchor - pos;
    let r2 = dot(diff, diff) + softening * softening;
    let r = sqrt(r2);
    if (r > 0.001) {
      let dir = diff / r;
      if (r > repulsionRadius) {
        acc += dir / r2;
      } else {
        acc -= dir / r2 * 0.5;
      }
    }
  }
  return acc * strength;
}

fn computeBoidsVelocity(pos: vec3f, vel: vec3f, time: f32, radius: f32) -> vec3f {
  let r = max(0.001, radius);
  let scale = 1.0 / r;
  let t = time * 0.35;
  let neighborhood = vec3f(
    sin(pos.y * scale * 0.8 + t) + cos(pos.z * scale * 0.6 - t * 1.3),
    cos(pos.z * scale * 0.7 + t * 0.9) + sin(pos.x * scale * 0.5 + t * 0.6),
    sin(pos.x * scale * 0.75 - t * 0.8) + cos(pos.y * scale * 0.55 + t)
  );
  let alignmentTarget = normalize(neighborhood + vec3f(0.0001));
  let alignment = alignmentTarget - normalize(vel + vec3f(0.0001));
  let cohesion = -pos / max(length(pos), r * 0.4 + 0.001);
  let separationSeed = vec3f(
    vnoise(pos * scale * 1.7 + vec3f(t, 7.1, 3.3)),
    vnoise(pos.yzx * scale * 1.9 + vec3f(5.2, t, 11.7)),
    vnoise(pos.zxy * scale * 1.5 + vec3f(9.8, 2.4, t))
  );
  let separation = -normalize(separationSeed + vec3f(0.0001));
  return separation * u.boidsSeparation + alignment * u.boidsAlignment + cohesion * u.boidsCohesion;
}


fn computeSphVelocity(idx: u32, pos: vec3f, vel: vec3f, texSize: u32, pressure: f32, viscosity: f32, radius: f32, restDensity: f32, sampleCountF: f32, flowClampScale: f32, cohesionStrength: f32) -> vec3f {
  let h = max(1.0, radius);
  let h2 = h * h;
  let count = texSize * texSize;
  let base = idx * 1103515245u + 12345u;
  let sampleCount = u32(clamp(sampleCountF, 8.0, 64.0));
  let stiffness = pressure * 0.9;
  let damp = viscosity * 0.65;
  let targetDensity = max(1.0, restDensity);
  var density = 0.0;
  var neighborWeight = 0.0;
  var velocityMean = vec3f(0.0);
  for (var i: u32 = 0u; i < sampleCount; i = i + 1u) {
    let stride = 2654435761u + i * 2246822519u;
    let candidate = (base + stride) % count;
    if (candidate == idx) { continue; }
    let otherPos = posIn[candidate].xyz;
    let otherVel = velIn[candidate].xyz;
    let r = pos - otherPos;
    let r2 = dot(r, r);
    if (r2 < h2 && r2 > 0.0001) {
      let dist = sqrt(r2);
      let q = dist / h;
      let kernel = max(0.0, 1.0 - q);
      let densityKernel = kernel * kernel * kernel;
      density += densityKernel;
      neighborWeight += 1.0;
      velocityMean += otherVel * densityKernel;
    }
  }
  if (neighborWeight < 1.0) { return vec3f(0.0); }
  let norm = max(1.0, neighborWeight);
  let densityRatio = density / norm;
  let sparseNeighborBias = clamp((6.0 - neighborWeight) / 6.0, 0.0, 1.0);
  let pressureBias = max(0.0, densityRatio * targetDensity - targetDensity) / targetDensity * (1.0 - sparseNeighborBias * 0.45);
  let cohesionBias = clamp((targetDensity - densityRatio * targetDensity) / targetDensity, 0.0, 1.0) * (0.55 + sparseNeighborBias * 0.45);
  let averageNeighborVelocity = velocityMean / max(0.0001, density);
  var pressureForce = vec3f(0.0);
  var viscosityForce = vec3f(0.0);
  var cohesionForce = vec3f(0.0);
  for (var i: u32 = 0u; i < sampleCount; i = i + 1u) {
    let stride = 2246822519u + i * 3266489917u;
    let candidate = (base + stride) % count;
    if (candidate == idx) { continue; }
    let otherPos = posIn[candidate].xyz;
    let otherVel = velIn[candidate].xyz;
    let r = pos - otherPos;
    let r2 = dot(r, r);
    if (r2 < h2 && r2 > 0.0001) {
      let dist = sqrt(r2);
      let q = dist / h;
      let kernel = max(0.0, 1.0 - q);
      let gradKernel = kernel * kernel;
      let viscKernel = kernel;
      let dir = normalize(r + vec3f(0.0001));
      pressureForce += dir * pressureBias * gradKernel * stiffness;
      viscosityForce += (otherVel - vel) * viscKernel * damp;
      cohesionForce -= dir * cohesionBias * gradKernel * pressure * cohesionStrength;
    }
  }
  let densityScale = 1.0 / targetDensity;
  let neighborVelocityPull = clamp(damp * 0.18, 0.12, 0.3);
  let flow = (pressureForce * densityScale + viscosityForce + (averageNeighborVelocity - vel) * neighborVelocityPull + cohesionForce) * (11.0 / norm);
  let flowLen = length(flow);
  let flowLimit = max(7.0, h * max(0.12, flowClampScale));
  return select(flow, normalize(flow) * flowLimit, flowLen > flowLimit);
}

fn computeMagneticVelocity(vel: vec3f, strength: f32, bx: f32, by: f32, bz: f32) -> vec3f {
  let field = vec3f(bx, by, bz);
  let fieldLen = length(field);
  let normalizedField = select(vec3f(0.0, 1.0, 0.0), field / fieldLen, fieldLen > 0.0001);
  return cross(vel, normalizedField) * strength;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let idx = gid.x;
  if (idx >= u.texSize * u.texSize) { return; }
  var pos = posIn[idx].xyz;
  var vel = velIn[idx].xyz;

  vel.y -= u.gravity * u.delta * 9.8;

  if (u.turbulence > 0.001) {
    let t = u.time * 0.25;
    let np = pos * 0.007;
    vel += vec3f(vnoise(np+vec3f(t,0,0)),
                 vnoise(np+vec3f(0,t+13.7,0)),
                 vnoise(np+vec3f(0,0,t+27.4))) * u.turbulence * 18.0 * u.delta;
  }

  if (u.curlStrength > 0.001) {
    let curlScale = max(0.0001, u.curlScale);
    let np = pos * curlScale + vec3f(u.time * 0.08, u.time * 0.05, u.time * 0.11);
    let flow = vec3f(
      vnoise(np + vec3f(0.0, 13.1, 7.9)),
      vnoise(np.yzx + vec3f(17.3, 0.0, 11.7)),
      vnoise(np.zxy + vec3f(5.7, 19.9, 0.0))
    );
    vel += normalize(flow + vec3f(0.0001)) * u.curlStrength * 14.0 * u.delta;
  }

  if (u.windStrength > 0.001) {
    let windDir = vec3f(u.windX, u.windY, u.windZ);
    let dirLen = length(windDir);
    let normalizedWind = select(vec3f(0.0, 1.0, 0.0), windDir / dirLen, dirLen > 0.0001);
    let gust = 1.0 + sin(u.time * 1.7 + pos.x * 0.013 + pos.z * 0.011) * u.windGust;
    vel += normalizedWind * u.windStrength * gust * 10.0 * u.delta;
  }

  if (u.vFieldStrength > 0.001) {
    let field = computeVectorField(pos, u.vFieldType, u.vFieldScale);
    vel += normalize(field + vec3f(0.0001)) * length(field) * u.vFieldStrength * 8.0 * u.delta;
  }

  if (u.wellStrength > 0.001) {
    let toCenter = -pos;
    let d = length(toCenter) + max(0.001, u.wellSoftening);
    vel += (toCenter / max(0.0001, d * d)) * u.wellStrength * u.delta * 2000.0;
    let tangent = cross(normalize(toCenter + vec3f(0.001, 0.0, 0.0)), vec3f(0.0, 1.0, 0.0));
    vel += tangent * u.wellOrbit * u.delta * 50.0;
  }

  if (u.vortexStrength > 0.001) {
    let vortexFlow = computeVortexVelocity(pos, u.vortexTilt);
    vel += normalize(vortexFlow + vec3f(0.0001)) * length(vortexFlow) * u.vortexStrength * 11.0 * u.delta;
  }

  if (u.attractorStrength > 0.001) {
    let attractorFlow = computeAttractorVelocity(pos, u.attractorType, u.attractorScale);
    vel += normalize(attractorFlow + vec3f(0.0001)) * u.attractorStrength * u.delta * 40.0;
  }

  if (u.fluidStrength > 0.001) {
    let fluidFlow = computeFluidVelocity(pos, u.time, u.fluidScale, u.fluidExtForce);
    vel.x += fluidFlow.x * u.fluidInfluence * u.fluidStrength * u.delta * 120.0;
    vel.z += fluidFlow.z * u.fluidInfluence * u.fluidStrength * u.delta * 120.0;
  }

  if (u.boidsSeparation > 0.001 || u.boidsAlignment > 0.001 || u.boidsCohesion > 0.001) {
    let boidsFlow = computeBoidsVelocity(pos, vel, u.time, u.boidsRadius);
    vel += boidsFlow * u.delta * 16.0;
  }

  if (u.nbodyStrength > 0.001) {
    let nbodyFlow = computeNBodyVelocity(pos, u.time, u.nbodyStrength, max(0.5, u.nbodyRepulsion), max(0.1, u.nbodySoftening), max(2.0, u.nbodySampleCount));
    vel += nbodyFlow * u.delta * 500.0;
  }

  if (u.magneticStrength > 0.001) {
    let magneticFlow = computeMagneticVelocity(vel, u.magneticStrength, u.magneticBX, u.magneticBY, u.magneticBZ);
    vel += magneticFlow * u.delta * 40.0;
  }

  if (u.springStrength > 0.001) {
    let spawnPos = initPos[idx].xyz;
    vel += (spawnPos - pos) * u.springStrength * u.delta * 3.0;
  }

  if (u.elasticStrength > 0.001) {
    vel -= pos * u.elasticStrength * u.delta * 2.0;
  }

  if (u.sphPressure > 0.001 || u.sphViscosity > 0.001) {
    let sphFlow = computeSphVelocity(idx, pos, vel, u.texSize, u.sphPressure, u.sphViscosity, u.sphRadius, u.sphRestDensity, u.sphSampleCount, u.sphFlowClampScale, u.sphCohesion);
    vel += sphFlow * u.delta;
  }

  if (u.mouseStrength > 0.001) {
    let mousePos = vec3f(u.mouseX, u.mouseY, u.mouseZ);
    let toMouse = mousePos - pos;
    let md = length(toMouse);
    if (md < u.mouseRadius && md > 0.001) {
      var falloff = 1.0 - md / max(0.001, u.mouseRadius);
      falloff = falloff * falloff;
      let dir = normalize(toMouse);
      if (u.mouseMode < 0.5) {
        vel += dir * falloff * u.mouseStrength * u.delta * 200.0;
      } else if (u.mouseMode < 1.5) {
        vel -= dir * falloff * u.mouseStrength * u.delta * 200.0;
      } else {
        let swirl = cross(dir, vec3f(0.0, 1.0, 0.001));
        vel += normalize(swirl + vec3f(0.0001)) * falloff * u.mouseStrength * u.delta * 150.0;
      }
    }
  }

  if (u.sdfEnabled > 0.5) {
    let sdfHit = computeSdfCollision(pos, u.sdfShape, u.sdfX, u.sdfY, u.sdfZ, u.sdfSize);
    let sn = sdfHit.xyz;
    let sd = sdfHit.w;
    if (sd < 2.0) {
      let vn = dot(vel, sn);
      if (vn < 0.0) {
        vel -= sn * vn * (1.0 + u.sdfBounce);
      }
    }
  }

  let spd = length(vel);
  if (spd > 350.0) { vel *= 350.0 / spd; }
  vel *= (1.0 - 1.1 * u.delta);

  let dist = length(pos);
  if (dist > u.bounceRadius) {
    let n = pos / dist;
    let vn = dot(vel, n);
    if (vn > 0.0) { vel -= n * vn * (1.0 + u.bounce); }
  }
  velOut[idx] = vec4f(vel, 0.0);
}
`,fu=`
struct Uniforms {
  texSize : u32,
  delta   : f32,
  speed   : f32,
  bounceRadius : f32,
  verletEnabled : f32,
  ageEnabled : f32,
  ageMax : f32,
  sdfEnabled : f32,
  sdfShape : f32,
  sdfX : f32,
  sdfY : f32,
  sdfZ : f32,
  sdfSize : f32,
  sdfBounce : f32,
};
@group(0) @binding(0) var<uniform>             u       : Uniforms;
@group(0) @binding(1) var<storage, read>       posIn   : array<vec4f>;
@group(0) @binding(2) var<storage, read>       velIn   : array<vec4f>;
@group(0) @binding(3) var<storage, read_write> posOut  : array<vec4f>;
@group(0) @binding(4) var<storage, read>       prevPos : array<vec4f>;

fn hash1(x: f32) -> f32 {
  return fract(sin(x * 127.1 + 311.7) * 43758.5453);
}

fn sdBox(p: vec3f, b: vec3f) -> f32 {
  let q = abs(p) - b;
  return length(max(q, vec3f(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
}

fn computeSdfCollision(pos: vec3f, sdfShape: f32, sdfX: f32, sdfY: f32, sdfZ: f32, sdfSize: f32) -> vec4f {
  let sc = vec3f(sdfX, sdfY, sdfZ);
  var sd = 0.0;
  var sn = vec3f(0.0, 1.0, 0.0);
  if (sdfShape < 0.5) {
    let dp = pos - sc;
    sd = length(dp) - sdfSize;
    sn = normalize(dp + vec3f(0.0001));
  } else if (sdfShape < 1.5) {
    let dq = pos - sc;
    let aq = abs(dq);
    let dd = aq - vec3f(sdfSize);
    sd = sdBox(dq, vec3f(sdfSize));
    if (max(dd.x, max(dd.y, dd.z)) > 0.0) {
      sn = normalize(max(dd, vec3f(0.0)) * sign(dq) + vec3f(0.0001));
    } else if (dd.x > dd.y && dd.x > dd.z) {
      sn = vec3f(sign(dq.x), 0.0, 0.0);
    } else if (dd.y > dd.z) {
      sn = vec3f(0.0, sign(dq.y), 0.0);
    } else {
      sn = vec3f(0.0, 0.0, sign(dq.z));
    }
  } else if (sdfShape < 2.5) {
    let lp = pos - sc;
    let r2 = sdfSize * 0.35;
    let ringD = length(lp.xz) - sdfSize;
    sd = length(vec2f(ringD, lp.y)) - r2;
    let lxz = length(lp.xz) + 0.001;
    sn = normalize(vec3f(lp.x / lxz * ringD, lp.y, lp.z / lxz * ringD) + vec3f(0.0001));
  } else {
    let yc = clamp(pos.y - sc.y, -sdfSize, sdfSize);
    let dp = vec3f(pos.x - sc.x, pos.y - sc.y - yc, pos.z - sc.z);
    sd = length(dp) - sdfSize * 0.4;
    sn = normalize(dp + vec3f(0.0001));
  }
  return vec4f(sn, sd);
}

fn hash1(x: f32) -> f32 {
  return fract(sin(x * 127.1 + 311.7) * 43758.5453);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let idx = gid.x;
  if (idx >= u.texSize * u.texSize) { return; }
  var pos = posIn[idx].xyz;
  var age = posIn[idx].w;
  let vel = velIn[idx].xyz;
  if (u.verletEnabled > 0.5) {
    let previous = prevPos[idx].xyz;
    pos = pos + (pos - previous) * 0.98 + vel * u.delta * u.speed * 30.0;
  } else {
    pos += vel * u.delta * u.speed * 60.0;
  }
  let dist = length(pos);
  if (dist > u.bounceRadius * 1.05) { pos = normalize(pos) * u.bounceRadius * 1.05; }
  if (u.sdfEnabled > 0.5) {
    let sdfHit = computeSdfCollision(pos, u.sdfShape, u.sdfX, u.sdfY, u.sdfZ, u.sdfSize);
    let sn = sdfHit.xyz;
    let sd = sdfHit.w;
    if (sd < 0.0) {
      pos -= sn * sd;
    }
  }
  if (u.ageEnabled > 0.5) {
    age = age + u.delta;
    if (age > max(0.001, u.ageMax)) {
      let seed = f32(idx) + age * 13.37;
      let r = u.bounceRadius * (0.05 + hash1(seed + 1.0) * 0.9);
      let th = hash1(seed + 2.3) * 6.2831853;
      let phi = acos(clamp(hash1(seed + 4.7) * 2.0 - 1.0, -1.0, 1.0));
      pos = vec3f(
        r * sin(phi) * cos(th),
        r * sin(phi) * sin(th),
        r * cos(phi)
      );
      age = 0.0;
    }
  }
  posOut[idx] = vec4f(pos, age);
}
`;function cu(){return typeof navigator<"u"&&"gpu"in navigator&&!!navigator.gpu}function De(u){u.mapState==="mapped"&&u.unmap()}async function gu(u,t,e){if(!cu())return null;let i;try{if(i=await navigator.gpu.requestAdapter(),!i)return null}catch{return null}const l=await i.requestDevice(),d=u*u*4*4,c={size:d,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST},n=l.createBuffer(c),f=l.createBuffer(c),p=l.createBuffer(c),o=l.createBuffer(c),a=l.createBuffer(c),h=l.createBuffer(c);l.queue.writeBuffer(n,0,t.buffer,t.byteOffset,t.byteLength),l.queue.writeBuffer(a,0,t.buffer,t.byteOffset,t.byteLength),l.queue.writeBuffer(h,0,t.buffer,t.byteOffset,t.byteLength),l.queue.writeBuffer(p,0,e.buffer,e.byteOffset,e.byteLength);const v=l.createBuffer({size:d,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),x=l.createBuffer({size:d,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),M=l.createBuffer({size:256,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),r=l.createBuffer({size:64,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),m=l.createShaderModule({code:du}),g=l.createShaderModule({code:fu}),y=[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}},{binding:3,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:4,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}}],A=[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}},{binding:3,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:4,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}}],R=l.createBindGroupLayout({entries:y}),T=l.createBindGroupLayout({entries:A}),F=l.createComputePipeline({layout:l.createPipelineLayout({bindGroupLayouts:[R]}),compute:{module:m,entryPoint:"main"}}),z=l.createComputePipeline({layout:l.createPipelineLayout({bindGroupLayouts:[T]}),compute:{module:g,entryPoint:"main"}}),B=new Float32Array(new ArrayBuffer(256)),C=new Float32Array(new ArrayBuffer(64));return{device:l,velPipeline:F,posPipeline:z,posABuf:n,posBBuf:f,velABuf:p,velBBuf:o,prevPosBuf:a,initPosBuf:h,velUBuf:M,posUBuf:r,stagingPosBuf:v,stagingVelBuf:x,texSize:u,velUData:B,posUData:C,readbackPending:!1}}function vu(u,t,e,i,l,s,d,c,n,f,p,o,a,h,v,x,M,r,m,g,y,A,R,T,F,z,B,C,J,G,_,W,K,ue,Z,ee,N,ge,Te,Me,ve,me,Ae,Re,Be,de,Ee,Fe,we,I,ne,q,O,he,E,w,V,D,Y,P,k,be,ae,Se,Q){const{device:te,velPipeline:We,posPipeline:Oe,posABuf:Ue,posBBuf:tt,velABuf:ut,velBBuf:ot,prevPosBuf:rt,initPosBuf:wt,velUBuf:nt,posUBuf:at,stagingPosBuf:it,stagingVelBuf:lt,texSize:ke}=u,Ge=ke*ke,je=t?Ue:tt,st=t?tt:Ue,Pt=t?ut:ot,He=t?ot:ut,Ke=pu({pressure:q,viscosity:O,radius:he,restDensity:E}),S=u.velUData;S[1]=e,S[2]=i,S[3]=l,S[4]=s,S[5]=d,S[6]=c,S[7]=n,S[8]=f,S[9]=p,S[10]=o,S[11]=a,S[12]=h,S[13]=v,S[14]=x,S[15]=M,S[16]=r,S[17]=m,S[18]=g,S[19]=y,S[20]=A,S[21]=R,S[22]=T,S[23]=F,S[24]=z,S[25]=B,S[26]=C,S[27]=J,S[28]=G,S[29]=_,S[30]=W,S[31]=K,S[32]=ue,S[33]=Z,S[34]=ee,S[35]=N,S[36]=ge,S[37]=Te,S[38]=Me,S[39]=ve,S[40]=me,S[41]=Ae,S[42]=Re,S[43]=Be,S[44]=de,S[45]=Ee,S[46]=Fe,S[47]=we,S[48]=I,S[49]=ne,S[50]=q,S[51]=O,S[52]=he,S[53]=E,S[54]=Ke.sampleCount,S[55]=Ke.flowClampScale,S[56]=Ke.cohesionStrength,S[57]=Y,S[58]=P,S[59]=k,S[60]=be,S[61]=ae,S[62]=Se,S[63]=Q,new Uint32Array(S.buffer)[0]=ke,te.queue.writeBuffer(nt,0,S);const L=u.posUData;L[1]=e,L[2]=n,L[3]=d,L[4]=w,L[5]=V,L[6]=D,L[7]=Y,L[8]=P,L[9]=k,L[10]=be,L[11]=ae,L[12]=Se,L[13]=Q,new Uint32Array(L.buffer)[0]=ke,te.queue.writeBuffer(at,0,L);const Pe=te.createCommandEncoder(),Ct=te.createBindGroup({layout:We.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:nt}},{binding:1,resource:{buffer:je}},{binding:2,resource:{buffer:Pt}},{binding:3,resource:{buffer:He}},{binding:4,resource:{buffer:wt}}]}),Le=Pe.beginComputePass();Le.setPipeline(We),Le.setBindGroup(0,Ct),Le.dispatchWorkgroups(Math.ceil(Ge/64)),Le.end(),Pe.copyBufferToBuffer(je,0,rt,0,Ge*16);const zt=te.createBindGroup({layout:Oe.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:at}},{binding:1,resource:{buffer:je}},{binding:2,resource:{buffer:He}},{binding:3,resource:{buffer:st}},{binding:4,resource:{buffer:rt}}]}),Ne=Pe.beginComputePass();Ne.setPipeline(Oe),Ne.setBindGroup(0,zt),Ne.dispatchWorkgroups(Math.ceil(Ge/64)),Ne.end(),!u.readbackPending&&it.mapState==="unmapped"&&lt.mapState==="unmapped"&&(Pe.copyBufferToBuffer(st,0,it,0,Ge*16),Pe.copyBufferToBuffer(He,0,lt,0,Ge*16)),te.queue.submit([Pe.finish()])}async function mu(u,t){const e=u.texSize*u.texSize,i=100,l=t??{positions:new Float32Array(e*4),velocities:new Float32Array(e*4)};if(u.readbackPending||u.stagingPosBuf.mapState!=="unmapped"||u.stagingVelBuf.mapState!=="unmapped")return l;u.readbackPending=!0;let s=null,d=!1;const c=Promise.all([u.stagingPosBuf.mapAsync(GPUMapMode.READ,0,e*16),u.stagingVelBuf.mapAsync(GPUMapMode.READ,0,e*16)]).then(()=>{if(d)return De(u.stagingPosBuf),De(u.stagingVelBuf),l;const f=u.stagingPosBuf.getMappedRange(0,e*16),p=u.stagingVelBuf.getMappedRange(0,e*16),o={positions:new Float32Array(f.slice(0)),velocities:new Float32Array(p.slice(0))};return u.stagingPosBuf.unmap(),u.stagingVelBuf.unmap(),o}).catch(()=>(De(u.stagingPosBuf),De(u.stagingVelBuf),l)).finally(()=>{s!==null&&clearTimeout(s),u.readbackPending=!1}),n=new Promise(f=>{s=setTimeout(()=>{d=!0,f(l)},i)});return Promise.race([c,n])}function Qe(u){De(u.stagingPosBuf),De(u.stagingVelBuf),u.posABuf.destroy(),u.posBBuf.destroy(),u.velABuf.destroy(),u.velBBuf.destroy(),u.prevPosBuf.destroy(),u.velUBuf.destroy(),u.posUBuf.destroy(),u.stagingPosBuf.destroy(),u.stagingVelBuf.destroy()}function hu(u){const{mouseNDC:t,camera:e,mouseWorld:i,tempVec:l,tempDir:s}=u;l.set(t.x,t.y,.5).unproject(e),s.copy(l).sub(e.position).normalize(),i.copy(e.position).addScaledVector(s,e.position.length())}function bu(u){const{config:t,prevPosRT:e,blitMat:i,simMesh:l,gl:s,simScene:d,simCamera:c,posTexture:n}=u;!t.gpgpuVerletEnabled||!e||(i.uniforms.uTex.value=n,l.material=i,s.setRenderTarget(e),s.render(d,c))}function Su(u){const{config:t,fluidRTA:e,fluidRTB:i,fluidPingIsA:l,fluidAdvectMat:s,velSimMat:d,simMesh:c,gl:n,simScene:f,simCamera:p,dt:o,time:a}=u;if(t.gpgpuFluidEnabled&&e&&i){const h=l.current?e:i,v=l.current?i:e;s.uniforms.uFluidIn.value=h.texture,s.uniforms.uDelta.value=o,s.uniforms.uFluidDiffuse.value=t.gpgpuFluidDiffuse,s.uniforms.uFluidDecay.value=t.gpgpuFluidDecay,s.uniforms.uFluidStrength.value=t.gpgpuFluidStrength,s.uniforms.uTime.value=a,s.uniforms.uFluidExtForce.value=t.gpgpuFluidExtForce,c.material=s,n.setRenderTarget(v),n.render(f,p),l.current=!l.current;const x=l.current?e:i;d.uniforms.uFluidEnabled.value=!0,d.uniforms.uFluidTex.value=x.texture,d.uniforms.uFluidInfluence.value=t.gpgpuFluidInfluence,d.uniforms.uFluidScale.value=t.gpgpuFluidScale;return}d.uniforms.uFluidEnabled.value=!1}function xu(u){const{useWebGPU:t,config:e,texSize:i,dt:l,time:s,blast:d,gpgpuAudioDrives:c,mouseWorld:n,simMesh:f,gl:p,simScene:o,simCamera:a,posIn:h,posOut:v,velIn:x,velOut:M,velSimMat:r,posSimMat:m,initPosTex:g,prevPosTex:y,webgpuState:A,webgpuPosTex:R,webgpuVelTex:T,webgpuPingIsARef:F,webgpuLastReadbackRef:z,posReadbackRef:B}=u;if(t&&A){vu(A,F.current,l,s,Math.max(-4,Math.min(4,e.gpgpuGravity+c.gravity)),Math.max(0,Math.min(4,e.gpgpuTurbulence+c.turbulence)),e.gpgpuBounceRadius,e.gpgpuBounce,e.gpgpuSpeed,e.gpgpuCurlEnabled?e.gpgpuCurlStrength:0,e.gpgpuCurlEnabled?e.gpgpuCurlScale:0,e.gpgpuWindEnabled?e.gpgpuWindStrength:0,e.gpgpuWindEnabled?e.gpgpuWindX:0,e.gpgpuWindEnabled?e.gpgpuWindY:0,e.gpgpuWindEnabled?e.gpgpuWindZ:0,e.gpgpuWindEnabled?e.gpgpuWindGust:0,e.gpgpuVFieldEnabled?e.gpgpuVFieldType==="dipole"?0:e.gpgpuVFieldType==="saddle"?1:e.gpgpuVFieldType==="spiral"?2:3:0,e.gpgpuVFieldEnabled?e.gpgpuVFieldStrength:0,e.gpgpuVFieldEnabled?e.gpgpuVFieldScale:0,e.gpgpuWellEnabled?e.gpgpuWellStrength:0,e.gpgpuWellEnabled?e.gpgpuWellSoftening:0,e.gpgpuWellEnabled?e.gpgpuWellOrbit:0,e.gpgpuVortexEnabled?e.gpgpuVortexStrength:0,e.gpgpuVortexEnabled?e.gpgpuVortexTilt:0,e.gpgpuAttractorEnabled?e.gpgpuAttractorType==="lorenz"?0:e.gpgpuAttractorType==="rossler"?1:2:0,e.gpgpuAttractorEnabled?e.gpgpuAttractorStrength:0,e.gpgpuAttractorEnabled?e.gpgpuAttractorScale:0,e.gpgpuMouseEnabled?e.gpgpuMouseStrength:0,e.gpgpuMouseEnabled?e.gpgpuMouseRadius:0,e.gpgpuMouseEnabled?e.gpgpuMouseMode==="attract"?0:e.gpgpuMouseMode==="repel"?1:2:0,e.gpgpuMouseEnabled?n.x:0,e.gpgpuMouseEnabled?n.y:0,e.gpgpuMouseEnabled?n.z:0,e.gpgpuFluidEnabled?e.gpgpuFluidInfluence:0,e.gpgpuFluidEnabled?e.gpgpuFluidScale:0,e.gpgpuFluidEnabled?e.gpgpuFluidStrength:0,e.gpgpuFluidEnabled&&e.gpgpuFluidExtForce?1:0,e.gpgpuBoidsEnabled?e.gpgpuBoidsSeparation:0,e.gpgpuBoidsEnabled?e.gpgpuBoidsAlignment:0,e.gpgpuBoidsEnabled?e.gpgpuBoidsCohesion:0,e.gpgpuBoidsEnabled?e.gpgpuBoidsRadius:0,e.gpgpuNBodyEnabled?e.gpgpuNBodyStrength:0,e.gpgpuNBodyEnabled?e.gpgpuNBodyRepulsion:0,e.gpgpuNBodyEnabled?e.gpgpuNBodySoftening:0,e.gpgpuNBodyEnabled?Math.max(2,Math.min(64,e.gpgpuNBodySampleCount)):0,e.gpgpuMagneticEnabled?e.gpgpuMagneticStrength:0,e.gpgpuMagneticEnabled?e.gpgpuMagneticBX:0,e.gpgpuMagneticEnabled?e.gpgpuMagneticBY:0,e.gpgpuMagneticEnabled?e.gpgpuMagneticBZ:0,e.gpgpuSpringEnabled?e.gpgpuSpringStrength:0,e.gpgpuElasticEnabled?e.gpgpuElasticStrength:0,e.gpgpuSphEnabled?e.gpgpuSphPressure:0,e.gpgpuSphEnabled?e.gpgpuSphViscosity:0,e.gpgpuSphEnabled?e.gpgpuSphRadius:0,e.gpgpuSphEnabled?e.gpgpuSphRestDensity:0,e.gpgpuVerletEnabled?1:0,e.gpgpuAgeEnabled?1:0,e.gpgpuAgeEnabled?e.gpgpuAgeMax:0,e.gpgpuSdfEnabled?1:0,e.gpgpuSdfEnabled?e.gpgpuSdfShape==="sphere"?0:e.gpgpuSdfShape==="box"?1:e.gpgpuSdfShape==="torus"?2:3:0,e.gpgpuSdfEnabled?e.gpgpuSdfX:0,e.gpgpuSdfEnabled?e.gpgpuSdfY:0,e.gpgpuSdfEnabled?e.gpgpuSdfZ:0,e.gpgpuSdfEnabled?e.gpgpuSdfSize:0,e.gpgpuSdfEnabled?e.gpgpuSdfBounce:0),F.current=!F.current,R&&T&&mu(A,z.current??void 0).then(({positions:C,velocities:J})=>{z.current={positions:C,velocities:J};const G=R.image.data;G&&(G.set(C),R.needsUpdate=!0);const _=T.image.data;if(_&&(_.set(J),T.needsUpdate=!0),B){const W=B;(!W.current||W.current.length!=C.length)&&(W.current=new Float32Array(C.length)),W.current.set(C)}});return}r.uniforms.uPosTex.value=h.texture,r.uniforms.uVelTex.value=x.texture,r.uniforms.uDelta.value=l,r.uniforms.uTime.value=s,r.uniforms.uGravity.value=Math.max(-4,Math.min(4,e.gpgpuGravity+c.gravity)),r.uniforms.uTurbulence.value=Math.max(0,Math.min(4,e.gpgpuTurbulence+c.turbulence)),r.uniforms.uBounceRadius.value=e.gpgpuBounceRadius,r.uniforms.uBounce.value=e.gpgpuBounce,r.uniforms.uAudioBlast.value=d,r.uniforms.uNBodyEnabled.value=e.gpgpuNBodyEnabled,r.uniforms.uNBodyStrength.value=e.gpgpuNBodyStrength,r.uniforms.uNBodySoftening.value=e.gpgpuNBodySoftening,r.uniforms.uNBodyRepulsion.value=e.gpgpuNBodyRepulsion,r.uniforms.uNBodySamples.value=Math.max(2,Math.min(64,e.gpgpuNBodySampleCount)),r.uniforms.uTexSizeF.value=i,r.uniforms.uCurlEnabled.value=e.gpgpuCurlEnabled,r.uniforms.uCurlStrength.value=e.gpgpuCurlStrength,r.uniforms.uCurlScale.value=e.gpgpuCurlScale,r.uniforms.uBoidsEnabled.value=e.gpgpuBoidsEnabled,r.uniforms.uBoidsSeparation.value=e.gpgpuBoidsSeparation,r.uniforms.uBoidsAlignment.value=e.gpgpuBoidsAlignment,r.uniforms.uBoidsCohesion.value=e.gpgpuBoidsCohesion,r.uniforms.uBoidsRadius.value=e.gpgpuBoidsRadius,r.uniforms.uAttractorEnabled.value=e.gpgpuAttractorEnabled,r.uniforms.uAttractorType.value=e.gpgpuAttractorType==="lorenz"?0:e.gpgpuAttractorType==="rossler"?1:2,r.uniforms.uAttractorStrength.value=e.gpgpuAttractorStrength,r.uniforms.uAttractorScale.value=e.gpgpuAttractorScale,r.uniforms.uVortexEnabled.value=e.gpgpuVortexEnabled,r.uniforms.uVortexStrength.value=e.gpgpuVortexStrength,r.uniforms.uVortexTilt.value=e.gpgpuVortexTilt,r.uniforms.uWindEnabled.value=e.gpgpuWindEnabled,r.uniforms.uWindStrength.value=e.gpgpuWindStrength,r.uniforms.uWindX.value=e.gpgpuWindX,r.uniforms.uWindY.value=e.gpgpuWindY,r.uniforms.uWindZ.value=e.gpgpuWindZ,r.uniforms.uWindGust.value=e.gpgpuWindGust,r.uniforms.uWellEnabled.value=e.gpgpuWellEnabled,r.uniforms.uWellStrength.value=e.gpgpuWellStrength,r.uniforms.uWellSoftening.value=e.gpgpuWellSoftening,r.uniforms.uWellOrbit.value=e.gpgpuWellOrbit,r.uniforms.uElasticEnabled.value=e.gpgpuElasticEnabled,r.uniforms.uElasticStrength.value=e.gpgpuElasticStrength,r.uniforms.uMagneticEnabled.value=e.gpgpuMagneticEnabled,r.uniforms.uMagneticStrength.value=e.gpgpuMagneticStrength,r.uniforms.uMagneticBX.value=e.gpgpuMagneticBX,r.uniforms.uMagneticBY.value=e.gpgpuMagneticBY,r.uniforms.uMagneticBZ.value=e.gpgpuMagneticBZ,r.uniforms.uSphEnabled.value=e.gpgpuSphEnabled,r.uniforms.uSphPressure.value=e.gpgpuSphPressure,r.uniforms.uSphViscosity.value=e.gpgpuSphViscosity,r.uniforms.uSphRadius.value=e.gpgpuSphRadius,r.uniforms.uSphRestDensity.value=e.gpgpuSphRestDensity,r.uniforms.uVFieldEnabled.value=e.gpgpuVFieldEnabled,r.uniforms.uVFieldType.value=e.gpgpuVFieldType==="dipole"?0:e.gpgpuVFieldType==="saddle"?1:e.gpgpuVFieldType==="spiral"?2:3,r.uniforms.uVFieldStrength.value=e.gpgpuVFieldStrength,r.uniforms.uVFieldScale.value=e.gpgpuVFieldScale,r.uniforms.uSpringEnabled.value=e.gpgpuSpringEnabled,r.uniforms.uSpringStrength.value=e.gpgpuSpringStrength,r.uniforms.uInitPosTex.value=g,r.uniforms.uSdfEnabled.value=e.gpgpuSdfEnabled,r.uniforms.uSdfShape.value=e.gpgpuSdfShape==="sphere"?0:e.gpgpuSdfShape==="box"?1:e.gpgpuSdfShape==="torus"?2:3,r.uniforms.uSdfX.value=e.gpgpuSdfX,r.uniforms.uSdfY.value=e.gpgpuSdfY,r.uniforms.uSdfZ.value=e.gpgpuSdfZ,r.uniforms.uSdfSize.value=e.gpgpuSdfSize,r.uniforms.uSdfBounce.value=e.gpgpuSdfBounce,r.uniforms.uMouseEnabled.value=e.gpgpuMouseEnabled,r.uniforms.uMousePos.value.copy(n),r.uniforms.uMouseStrength.value=e.gpgpuMouseStrength,r.uniforms.uMouseRadius.value=e.gpgpuMouseRadius,r.uniforms.uMouseMode.value=e.gpgpuMouseMode==="attract"?0:e.gpgpuMouseMode==="repel"?1:2,f.material=r,p.setRenderTarget(M),p.render(o,a),m.uniforms.uPosTex.value=h.texture,m.uniforms.uVelTex.value=M.texture,m.uniforms.uDelta.value=l,m.uniforms.uSpeed.value=e.gpgpuSpeed,m.uniforms.uBounceRadius.value=e.gpgpuBounceRadius,m.uniforms.uAgeEnabled.value=e.gpgpuAgeEnabled,m.uniforms.uAgeMax.value=e.gpgpuAgeMax,m.uniforms.uVerletEnabled.value=e.gpgpuVerletEnabled,m.uniforms.uPrevPosTex.value=y,m.uniforms.uSdfEnabled.value=e.gpgpuSdfEnabled,m.uniforms.uSdfShape.value=e.gpgpuSdfShape==="sphere"?0:e.gpgpuSdfShape==="box"?1:e.gpgpuSdfShape==="torus"?2:3,m.uniforms.uSdfX.value=e.gpgpuSdfX,m.uniforms.uSdfY.value=e.gpgpuSdfY,m.uniforms.uSdfZ.value=e.gpgpuSdfZ,m.uniforms.uSdfSize.value=e.gpgpuSdfSize,m.uniforms.uSdfBounce.value=e.gpgpuSdfBounce,f.material=m,p.setRenderTarget(v),p.render(o,a)}const U=16,$=64,ze=`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`,yu=`
  precision highp float;
  uniform sampler2D uTex;
  varying vec2 vUv;
  void main() { gl_FragColor = texture2D(uTex, vUv); }
`,Tu=`
  precision highp float;
  uniform sampler2D uPosTex;
  uniform sampler2D uVelTex;
  uniform float uDelta;
  uniform float uTime;
  uniform float uGravity;
  uniform float uTurbulence;
  uniform float uBounceRadius;
  uniform float uBounce;
  uniform float uAudioBlast;
  uniform bool  uNBodyEnabled;
  uniform float uNBodyStrength;
  uniform float uNBodySoftening;
  uniform float uNBodyRepulsion;
  uniform int   uNBodySamples;
  uniform float uTexSizeF;
  uniform bool  uCurlEnabled;
  uniform float uCurlStrength;
  uniform float uCurlScale;
  uniform bool  uBoidsEnabled;
  uniform float uBoidsSeparation;
  uniform float uBoidsAlignment;
  uniform float uBoidsCohesion;
  uniform float uBoidsRadius;
  uniform bool  uAttractorEnabled;
  uniform int   uAttractorType;
  uniform float uAttractorStrength;
  uniform float uAttractorScale;
  uniform bool  uVortexEnabled;
  uniform float uVortexStrength;
  uniform float uVortexTilt;
  uniform bool  uWindEnabled;
  uniform float uWindStrength;
  uniform float uWindX;
  uniform float uWindY;
  uniform float uWindZ;
  uniform float uWindGust;
  uniform bool  uWellEnabled;
  uniform float uWellStrength;
  uniform float uWellSoftening;
  uniform float uWellOrbit;
  uniform bool  uElasticEnabled;
  uniform float uElasticStrength;
  uniform bool  uMagneticEnabled;
  uniform float uMagneticStrength;
  uniform float uMagneticBX;
  uniform float uMagneticBY;
  uniform float uMagneticBZ;
  uniform bool  uSphEnabled;
  uniform float uSphPressure;
  uniform float uSphViscosity;
  uniform float uSphRadius;
  uniform float uSphRestDensity;
  uniform bool  uVFieldEnabled;
  uniform int   uVFieldType;
  uniform float uVFieldStrength;
  uniform float uVFieldScale;
  uniform bool  uSpringEnabled;
  uniform float uSpringStrength;
  uniform sampler2D uInitPosTex;
  uniform bool  uSdfEnabled;
  uniform int   uSdfShape;
  uniform float uSdfX;
  uniform float uSdfY;
  uniform float uSdfZ;
  uniform float uSdfSize;
  uniform float uSdfBounce;
  uniform bool  uMouseEnabled;
  uniform vec3  uMousePos;
  uniform float uMouseStrength;
  uniform float uMouseRadius;
  uniform int   uMouseMode;
  uniform bool  uFluidEnabled;
  uniform sampler2D uFluidTex;
  uniform float uFluidInfluence;
  uniform float uFluidScale;
  varying vec2 vUv;

  vec3 hash3(vec3 p) {
    p = vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }
  float vnoise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); vec3 u = f*f*(3.0-2.0*f);
    return mix(mix(mix(dot(hash3(i),f),dot(hash3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),
                   mix(dot(hash3(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(hash3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
               mix(mix(dot(hash3(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(hash3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),
                   mix(dot(hash3(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(hash3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y));
  }

  // Divergence-free curl noise (12 noise evals)
  vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    vec3 p1 = p + vec3(31.416, 0.0, 0.0);
    vec3 p2 = p + vec3(0.0, 43.982, 0.0);
    float dFz_dy = vnoise(p2 + vec3(0,e,0)) - vnoise(p2 - vec3(0,e,0));
    float dFy_dz = vnoise(p1 + vec3(0,0,e)) - vnoise(p1 - vec3(0,0,e));
    float dFx_dz = vnoise(p  + vec3(0,0,e)) - vnoise(p  - vec3(0,0,e));
    float dFz_dx = vnoise(p2 + vec3(e,0,0)) - vnoise(p2 - vec3(e,0,0));
    float dFy_dx = vnoise(p1 + vec3(e,0,0)) - vnoise(p1 - vec3(e,0,0));
    float dFx_dy = vnoise(p  + vec3(0,e,0)) - vnoise(p  - vec3(0,e,0));
    return vec3(dFz_dy - dFy_dz, dFx_dz - dFz_dx, dFy_dx - dFx_dy) / (2.0 * e);
  }

  void main() {
    vec4 posData = texture2D(uPosTex, vUv);
    vec4 velData = texture2D(uVelTex, vUv);
    vec3 pos = posData.xyz;
    vec3 vel = velData.xyz;

    vel.y -= uGravity * uDelta * 9.8;

    if (uTurbulence > 0.001) {
      float t = uTime * 0.25;
      vec3 np = pos * 0.007;
      vel += vec3(vnoise(np+vec3(t,0,0)),vnoise(np+vec3(0,t+13.7,0)),vnoise(np+vec3(0,0,t+27.4)))
             * uTurbulence * 18.0 * uDelta;
    }

    if (uAudioBlast > 0.001) {
      vec3 dir = length(pos) > 0.001 ? normalize(pos) : vec3(0,1,0);
      vel += dir * uAudioBlast * 14.0 * uDelta;
    }

    // N-Body gravity/repulsion
    if (uNBodyEnabled) {
      vec3 acc = vec3(0.0);
      float stride = uTexSizeF / float(uNBodySamples);
      for (int i = 0; i < 64; i++) {
        if (i >= uNBodySamples) break;
        float si = float(i) * stride;
        vec2 sUv = (vec2(mod(si, uTexSizeF), floor(si / uTexSizeF)) + 0.5) / uTexSizeF;
        vec3 oPos = texture2D(uPosTex, sUv).xyz;
        vec3 diff = oPos - pos;
        float r2 = dot(diff, diff) + uNBodySoftening * uNBodySoftening;
        float r  = sqrt(r2);
        if (r > 0.001) {
          vec3 dir2 = diff / r;
          if (r > uNBodyRepulsion) {
            acc += dir2 / r2;
          } else {
            acc -= dir2 / r2 * 0.5;
          }
        }
      }
      vel += acc * uNBodyStrength * uDelta * 500.0;
    }

    // Curl Noise
    if (uCurlEnabled) {
      vec3 curl = curlNoise(pos * uCurlScale + vec3(uTime * 0.15));
      vel += curl * uCurlStrength * 20.0 * uDelta;
    }

    // Boids
    if (uBoidsEnabled) {
      vec3 sepForce = vec3(0.0);
      vec3 aliForce = vec3(0.0);
      vec3 cohPos   = vec3(0.0);
      int  cohCount = 0;
      float stride = uTexSizeF / float(uNBodySamples);
      for (int i = 0; i < 64; i++) {
        if (i >= uNBodySamples) break;
        float si = float(i) * stride;
        vec2 sUv = (vec2(mod(si, uTexSizeF), floor(si / uTexSizeF)) + 0.5) / uTexSizeF;
        if (length(sUv - vUv) < 1.5 / uTexSizeF) continue;
        vec3 oPos = texture2D(uPosTex, sUv).xyz;
        vec3 oVel = texture2D(uVelTex, sUv).xyz;
        float d = distance(pos, oPos);
        if (d < uBoidsRadius * 0.3 && d > 0.001) sepForce -= normalize(oPos - pos) / max(d, 0.5);
        if (d < uBoidsRadius) { aliForce += oVel; cohPos += oPos; cohCount++; }
      }
      if (cohCount > 0) {
        float inv = 1.0 / float(cohCount);
        vel += normalize(sepForce + vec3(0.0001)) * uBoidsSeparation * uDelta * 150.0;
        vel += normalize(aliForce * inv - vel + vec3(0.0001)) * uBoidsAlignment * uDelta * 60.0;
        vel += normalize(cohPos * inv - pos + vec3(0.0001)) * uBoidsCohesion * uDelta * 60.0;
      }
    }

    // Strange Attractor
    if (uAttractorEnabled) {
      vec3 ap = pos / max(0.1, uAttractorScale);
      vec3 dv;
      if (uAttractorType == 0) { // Lorenz
        dv = vec3(10.0*(ap.y-ap.x), ap.x*(28.0-ap.z)-ap.y, ap.x*ap.y-2.667*ap.z);
      } else if (uAttractorType == 1) { // Rossler
        dv = vec3(-(ap.y+ap.z), ap.x+0.2*ap.y, 0.2+ap.z*(ap.x-5.7));
      } else { // Thomas
        dv = vec3(sin(ap.y)-0.208*ap.x, sin(ap.z)-0.208*ap.y, sin(ap.x)-0.208*ap.z);
      }
      vel += normalize(dv + vec3(0.0001)) * uAttractorStrength * uDelta * 40.0;
    }

    // Vortex
    if (uVortexEnabled) {
      vec3 axis = normalize(vec3(sin(uVortexTilt), cos(uVortexTilt), 0.0));
      vec3 tangent = cross(axis, pos);
      float tLen = length(tangent);
      if (tLen > 0.001) vel += (tangent / tLen) * uVortexStrength * uDelta * 80.0;
    }

    // Wind
    if (uWindEnabled) {
      vec3 gust = vec3(
        vnoise(pos * 0.01 + vec3(uTime * 0.3, 0.0, 0.0)),
        vnoise(pos * 0.01 + vec3(1.7, uTime * 0.25, 0.0)),
        vnoise(pos * 0.01 + vec3(0.0, 3.1, uTime * 0.2))
      ) * uWindGust;
      vel += (normalize(vec3(uWindX, uWindY, uWindZ) + vec3(0.0001)) * uWindStrength + gust) * uDelta * 30.0;
    }

    // Gravity Well
    if (uWellEnabled) {
      vec3 toCenter = -pos;
      float d = length(toCenter) + uWellSoftening;
      vel += (toCenter / (d * d)) * uWellStrength * uDelta * 2000.0;
      vec3 tangent2 = cross(normalize(toCenter + vec3(0.001, 0.0, 0.0)), vec3(0.0, 1.0, 0.0));
      vel += tangent2 * uWellOrbit * uDelta * 50.0;
    }

    // Elastic Spring
    if (uElasticEnabled) {
      vel -= pos * uElasticStrength * uDelta * 2.0;
    }

    // Magnetic / Lorentz
    if (uMagneticEnabled) {
      vec3 B = normalize(vec3(uMagneticBX, uMagneticBY, uMagneticBZ) + vec3(0.0001));
      vel += cross(vel, B) * uMagneticStrength * uDelta * 0.8;
    }

    // SPH Fluid Simulation
    if (uSphEnabled) {
      float density = 0.0;
      vec3 pressureForce = vec3(0.0);
      vec3 viscForce = vec3(0.0);
      float h2 = uSphRadius * uSphRadius;
      float stride = uTexSizeF / float(uNBodySamples);
      for (int i = 0; i < 64; i++) {
        if (i >= uNBodySamples) break;
        float si = float(i) * stride;
        vec2 sUv = (vec2(mod(si, uTexSizeF), floor(si / uTexSizeF)) + 0.5) / uTexSizeF;
        if (length(sUv - vUv) < 1.5 / uTexSizeF) continue;
        vec3 oPos = texture2D(uPosTex, sUv).xyz;
        vec3 oVel = texture2D(uVelTex, sUv).xyz;
        vec3 r = pos - oPos;
        float r2 = dot(r, r);
        if (r2 < h2 && r2 > 0.001) {
          float q = sqrt(r2) / uSphRadius;
          float w = max(0.0, 1.0 - q * q);
          density += w;
          float pressure = uSphPressure * max(0.0, density - uSphRestDensity);
          pressureForce += normalize(r + vec3(0.0001)) * pressure * w;
          viscForce += (oVel - vel) * w * uSphViscosity;
        }
      }
      vel += (pressureForce + viscForce) * uDelta * 15.0;
    }

    // Vector Field
    if (uVFieldEnabled) {
      vec3 p = pos * uVFieldScale;
      float pr = length(p) + 0.001;
      vec3 f;
      if (uVFieldType == 0) { // dipole
        float r3 = pow(pr, 3.0);
        f = vec3(3.0*p.x*p.y, 3.0*p.y*p.y - dot(p,p), 3.0*p.y*p.z) / r3;
      } else if (uVFieldType == 1) { // saddle
        f = vec3(p.x, -p.y, sin(p.z * 3.14159));
      } else if (uVFieldType == 2) { // spiral sink
        f = vec3(-p.x - p.z, p.x - p.y, -p.z * 0.5);
      } else { // source-sink
        f = p / (pr * pr * pr);
      }
      vel += normalize(f + vec3(0.0001)) * uVFieldStrength * uDelta * 30.0;
    }

    // Spring to Spawn Position
    if (uSpringEnabled) {
      vec3 spawnPos = texture2D(uInitPosTex, vUv).xyz;
      vel += (spawnPos - pos) * uSpringStrength * uDelta * 3.0;
    }

    // SDF Collider — velocity reflection
    if (uSdfEnabled) {
      vec3 sc = vec3(uSdfX, uSdfY, uSdfZ);
      float sd; vec3 sn;
      if (uSdfShape == 0) {
        sd = length(pos - sc) - uSdfSize;
        sn = normalize(pos - sc + vec3(0.0001));
      } else if (uSdfShape == 1) {
        vec3 q = abs(pos - sc) - vec3(uSdfSize);
        sd = length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
        vec3 dq = pos - sc; vec3 aq = abs(dq); vec3 dd = aq - vec3(uSdfSize);
        if (max(dd.x, max(dd.y, dd.z)) > 0.0) sn = normalize(max(dd, 0.0) * sign(dq));
        else if (dd.x > dd.y && dd.x > dd.z) sn = vec3(sign(dq.x), 0.0, 0.0);
        else if (dd.y > dd.z) sn = vec3(0.0, sign(dq.y), 0.0);
        else sn = vec3(0.0, 0.0, sign(dq.z));
      } else if (uSdfShape == 2) {
        vec3 lp = pos - sc; float r2 = uSdfSize * 0.35;
        float ringD = length(lp.xz) - uSdfSize;
        sd = length(vec2(ringD, lp.y)) - r2;
        float lxz = length(lp.xz) + 0.001;
        sn = normalize(vec3(lp.x / lxz * ringD, lp.y, lp.z / lxz * ringD));
      } else {
        float yc = clamp(pos.y - sc.y, -uSdfSize, uSdfSize);
        vec3 dp = vec3(pos.x - sc.x, pos.y - sc.y - yc, pos.z - sc.z);
        sd = length(dp) - uSdfSize * 0.4;
        sn = normalize(dp + vec3(0.0001));
      }
      if (sd < 2.0) {
        float vn = dot(vel, sn);
        if (vn < 0.0) vel -= sn * vn * (1.0 + uSdfBounce);
      }
    }

    // Mouse Force
    if (uMouseEnabled) {
      vec3 toMouse = uMousePos - pos;
      float md = length(toMouse);
      if (md < uMouseRadius && md > 0.001) {
        float falloff = (1.0 - md / uMouseRadius);
        falloff *= falloff;
        vec3 dir = normalize(toMouse);
        if (uMouseMode == 0) { // attract
          vel += dir * falloff * uMouseStrength * uDelta * 200.0;
        } else if (uMouseMode == 1) { // repel
          vel -= dir * falloff * uMouseStrength * uDelta * 200.0;
        } else { // swirl
          vec3 swirl = cross(dir, vec3(0.0, 1.0, 0.001));
          vel += normalize(swirl) * falloff * uMouseStrength * uDelta * 150.0;
        }
      }
    }

    // Fluid Advection
    if (uFluidEnabled) {
      vec2 fieldUv = pos.xz / (uBounceRadius * uFluidScale) * 0.5 + 0.5;
      fieldUv = clamp(fieldUv, 0.001, 0.999);
      vec2 fieldVel = texture2D(uFluidTex, fieldUv).xy;
      vel.x += fieldVel.x * uFluidInfluence * uDelta * 300.0;
      vel.z += fieldVel.y * uFluidInfluence * uDelta * 300.0;
    }

    float spd = length(vel);
    if (spd > 350.0) vel *= 350.0 / spd;
    vel *= (1.0 - 1.1 * uDelta);

    float dist = length(pos);
    if (dist > uBounceRadius) {
      vec3 n = pos / dist;
      float vn = dot(vel, n);
      if (vn > 0.0) vel -= n * vn * (1.0 + uBounce);
    }

    gl_FragColor = vec4(vel, 0.0);
  }
`,Mu=`
  precision highp float;
  uniform sampler2D uPosTex;
  uniform sampler2D uVelTex;
  uniform float uDelta;
  uniform float uSpeed;
  uniform float uBounceRadius;
  uniform bool  uAgeEnabled;
  uniform float uAgeMax;
  uniform bool  uVerletEnabled;
  uniform sampler2D uPrevPosTex;
  uniform bool  uSdfEnabled;
  uniform int   uSdfShape;
  uniform float uSdfX;
  uniform float uSdfY;
  uniform float uSdfZ;
  uniform float uSdfSize;
  uniform float uSdfBounce;
  varying vec2 vUv;

  float hash1(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec4 posData = texture2D(uPosTex, vUv);
    vec3 pos = posData.xyz;
    float age = posData.w;
    vec3 vel = texture2D(uVelTex, vUv).xyz;

    if (uVerletEnabled) {
      vec3 prevPos = texture2D(uPrevPosTex, vUv).xyz;
      pos = pos + (pos - prevPos) * 0.98 + vel * uDelta * uSpeed * 30.0;
    } else {
      pos += vel * uDelta * uSpeed * 60.0;
    }

    float dist = length(pos);
    if (dist > uBounceRadius * 1.05) pos = normalize(pos) * uBounceRadius * 1.05;

    // SDF Collider — position push-out
    if (uSdfEnabled) {
      vec3 sc = vec3(uSdfX, uSdfY, uSdfZ);
      float sd; vec3 sn;
      if (uSdfShape == 0) {
        sd = length(pos - sc) - uSdfSize;
        sn = normalize(pos - sc + vec3(0.0001));
      } else if (uSdfShape == 1) {
        vec3 q = abs(pos - sc) - vec3(uSdfSize);
        sd = length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
        vec3 dq = pos - sc; vec3 aq = abs(dq); vec3 dd = aq - vec3(uSdfSize);
        if (max(dd.x, max(dd.y, dd.z)) > 0.0) sn = normalize(max(dd, 0.0) * sign(dq));
        else if (dd.x > dd.y && dd.x > dd.z) sn = vec3(sign(dq.x), 0.0, 0.0);
        else if (dd.y > dd.z) sn = vec3(0.0, sign(dq.y), 0.0);
        else sn = vec3(0.0, 0.0, sign(dq.z));
      } else if (uSdfShape == 2) {
        vec3 lp = pos - sc; float r2 = uSdfSize * 0.35;
        float ringD = length(lp.xz) - uSdfSize;
        sd = length(vec2(ringD, lp.y)) - r2;
        float lxz = length(lp.xz) + 0.001;
        sn = normalize(vec3(lp.x / lxz * ringD, lp.y, lp.z / lxz * ringD));
      } else {
        float yc = clamp(pos.y - sc.y, -uSdfSize, uSdfSize);
        vec3 dp = vec3(pos.x - sc.x, pos.y - sc.y - yc, pos.z - sc.z);
        sd = length(dp) - uSdfSize * 0.4;
        sn = normalize(dp + vec3(0.0001));
      }
      if (sd < 0.0) pos -= sn * sd;
    }

    if (uAgeEnabled) {
      age += uDelta;
      if (age > uAgeMax) {
        float r   = uBounceRadius * (0.05 + hash1(vUv + vec2(age)) * 0.9);
        float th  = hash1(vUv + vec2(1.3)) * 6.2832;
        float phi = acos(2.0 * hash1(vUv + vec2(2.7)) - 1.0);
        pos = vec3(r * sin(phi) * cos(th), r * sin(phi) * sin(th), r * cos(phi));
        age = 0.0;
      }
    }

    gl_FragColor = vec4(pos, age);
  }
`,Au=`
  precision highp float;
  uniform sampler2D uPosTex;
  uniform mat4 uViewMatrix;
  varying vec2 vUv;
  void main() {
    vec3 pos = texture2D(uPosTex, vUv).xyz;
    float viewZ = -(uViewMatrix * vec4(pos, 1.0)).z;
    gl_FragColor = vec4(vUv.x, vUv.y, viewZ, 1.0);
  }
`,Ru=`
  precision highp float;
  uniform sampler2D uSortIn;
  uniform float uTexSizeF;
  uniform float uStep;
  uniform float uStage;
  varying vec2 vUv;
  void main() {
    float fw   = uTexSizeF;
    float ix   = floor(vUv.x * fw);
    float iy   = floor(vUv.y * fw);
    float i    = iy * fw + ix;
    float stepSize   = pow(2.0, uStep);
    float blockSzDir = pow(2.0, uStage + 1.0);
    // Arithmetic XOR: partner index = i XOR stepSize
    float bitInStep = mod(floor(i / stepSize), 2.0);
    float l = i + (bitInStep < 0.5 ? stepSize : -stepSize);
    if (l < 0.0 || l >= fw * fw) { gl_FragColor = texture2D(uSortIn, vUv); return; }
    float lx = mod(l, fw);
    float ly = floor(l / fw);
    vec2 partnerUv = (vec2(lx, ly) + 0.5) / fw;
    vec4 myData      = texture2D(uSortIn, vUv);
    vec4 partnerData = texture2D(uSortIn, partnerUv);
    float myDepth      = myData.z;
    float partnerDepth = partnerData.z;
    // origAsc=true for even blocks. Invert comparison for descending final order (far=0).
    bool origAsc = mod(floor(i / blockSzDir), 2.0) < 0.5;
    bool shouldSwap;
    if (i < l) {
      shouldSwap = origAsc ? (myDepth < partnerDepth) : (myDepth > partnerDepth);
    } else {
      shouldSwap = origAsc ? (myDepth > partnerDepth) : (myDepth < partnerDepth);
    }
    gl_FragColor = shouldSwap ? partnerData : myData;
  }
`,Bu=`
  precision highp float;
  uniform sampler2D uFluidIn;
  uniform float uDelta;
  uniform float uFluidDiffuse;
  uniform float uFluidDecay;
  uniform float uFluidStrength;
  uniform float uTime;
  uniform bool  uFluidExtForce;
  varying vec2 vUv;
  void main() {
    vec2 uv  = vUv;
    vec2 vel = texture2D(uFluidIn, uv).xy;
    float ts = 1.0 / 64.0;
    // Semi-Lagrangian backward trace
    vec2 backPos = uv - vel * uDelta * ts * 80.0;
    vec2 advVel  = texture2D(uFluidIn, backPos).xy;
    // 5-point Laplacian diffusion
    vec2 vL = texture2D(uFluidIn, uv + vec2(-ts, 0.0)).xy;
    vec2 vR = texture2D(uFluidIn, uv + vec2( ts, 0.0)).xy;
    vec2 vB = texture2D(uFluidIn, uv + vec2(0.0,-ts)).xy;
    vec2 vT = texture2D(uFluidIn, uv + vec2(0.0, ts)).xy;
    vec2 lap    = vL + vR + vB + vT - 4.0 * advVel;
    vec2 newVel = advVel + uFluidDiffuse * lap;
    // Exponential decay
    newVel *= 1.0 - uFluidDecay * uDelta * 60.0;
    // External forcing: rotating vortex + periodic perturbation
    if (uFluidExtForce) {
      vec2 c = uv - 0.5;
      float r = length(c) + 0.001;
      vec2 rot = vec2(-c.y, c.x) / (r * r + 0.1);
      newVel += rot * uFluidStrength * uDelta * 2.0;
      float t = uTime * 0.3;
      vec2 perturb = vec2(sin(uv.y * 6.2832 + t), cos(uv.x * 6.2832 - t)) * uFluidStrength * 0.3 * uDelta;
      newVel += perturb;
    }
    gl_FragColor = vec4(newVel, 0.0, 1.0);
  }
`,Eu=`
  precision highp float;
  uniform sampler2D uPosTex;
  uniform sampler2D uVelTex;
  uniform sampler2D uSortTex;
  uniform bool      uSortEnabled;
  uniform float uSize;
  uniform bool  uAgeEnabled;
  uniform float uAgeMax;
  uniform bool  uAgeSizeEnabled;
  uniform float uAgeSizeStart;
  uniform float uAgeSizeEnd;
  attribute vec2 aTexCoord;
  varying float vSpeed;
  varying float vNormAge;
  void main() {
    vec2 particleUv = uSortEnabled ? texture2D(uSortTex, aTexCoord).xy : aTexCoord;
    vec4 posData  = texture2D(uPosTex, particleUv);
    vec3 worldPos = posData.xyz;
    vec3 vel      = texture2D(uVelTex, particleUv).xyz;
    vSpeed   = clamp(length(vel) / 80.0, 0.0, 1.0);
    vNormAge = uAgeEnabled ? clamp(posData.w / max(uAgeMax, 0.001), 0.0, 1.0) : 0.5;
    float sizeMul = uAgeSizeEnabled ? mix(uAgeSizeStart, uAgeSizeEnd, vNormAge) : 1.0;
    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    float dist = -mvPos.z;
    gl_PointSize = max(0.5, uSize * sizeMul * (dist > 0.5 ? min(4.0, 500.0 / dist) : 1.0));
    gl_Position  = projectionMatrix * mvPos;
  }
`,Fu=`
  precision highp float;
  uniform vec3  uColor;
  uniform float uOpacity;
  uniform bool  uVelColorEnabled;
  uniform float uVelColorHueMin;
  uniform float uVelColorHueMax;
  uniform float uVelColorSaturation;
  uniform bool  uAgeEnabled;
  uniform float uAgeFadeIn;
  uniform float uAgeFadeOut;
  uniform bool  uAgeColorEnabled;
  uniform vec3  uAgeColorYoung;
  uniform vec3  uAgeColorOld;
  varying float vSpeed;
  varying float vNormAge;

  vec3 hsv2rgb(float h, float s, float v) {
    vec3 p = abs(fract(vec3(h) + vec3(1.0, 2.0/3.0, 1.0/3.0)) * 6.0 - 3.0);
    return v * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), s);
  }

  void main() {
    vec2 pc = gl_PointCoord - 0.5;
    float d = length(pc);
    if (d > 0.5) discard;

    vec3 col = uColor;
    if (uAgeColorEnabled) {
      col = mix(uAgeColorYoung, uAgeColorOld, vNormAge);
    } else if (uVelColorEnabled) {
      float hue = mix(uVelColorHueMin, uVelColorHueMax, vSpeed) / 360.0;
      col = hsv2rgb(hue, uVelColorSaturation, 1.0);
    }

    float ageFade = 1.0;
    if (uAgeEnabled) {
      ageFade  = smoothstep(0.0, uAgeFadeIn, vNormAge);
      ageFade *= smoothstep(1.0, 1.0 - uAgeFadeOut, vNormAge);
    }

    gl_FragColor = vec4(col, smoothstep(0.5, 0.12, d) * uOpacity * ageFade);
  }
`,wu=`
  precision highp float;
  uniform sampler2D uPosTex;
  uniform sampler2D uVelTex;
  uniform float uSize;
  attribute vec2 aTexCoord;
  varying float vSpeed;
  void main() {
    vec3 worldPos = texture2D(uPosTex, aTexCoord).xyz;
    vec3 vel      = texture2D(uVelTex, aTexCoord).xyz;
    vSpeed = clamp(length(vel) / 80.0, 0.0, 1.0);
    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    float dist = -mvPos.z;
    gl_PointSize = max(0.3, uSize * (dist > 0.5 ? min(4.0, 500.0 / dist) : 1.0));
    gl_Position  = projectionMatrix * mvPos;
  }
`,Pu=`
  precision highp float;
  uniform vec3  uColor;
  uniform float uAlpha;
  uniform float uVelocityScale;
  varying float vSpeed;
  void main() {
    vec2 pc = gl_PointCoord - 0.5;
    float d = length(pc);
    if (d > 0.5) discard;
    float speedMul = mix(1.0, vSpeed, uVelocityScale);
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.15, d) * uAlpha * speedMul);
  }
`,Cu=`
  precision highp float;
  attribute vec2  aTexCoord;
  attribute float aSide;
  attribute float aIsB;
  uniform sampler2D uPosTexA;
  uniform sampler2D uPosTexB;
  uniform float uWidth;
  uniform float uMaxSegLen;
  varying float vAlpha;
  varying float vRibbonU;
  varying float vRibbonV;
  void main() {
    vec3 posA = texture2D(uPosTexA, aTexCoord).xyz;
    vec3 posB = texture2D(uPosTexB, aTexCoord).xyz;
    vec3 pos  = mix(posA, posB, aIsB);
    vRibbonV  = aIsB;
    vRibbonU  = aSide;
    float segLen = length(posB - posA);
    if (segLen > uMaxSegLen) {
      vAlpha = 0.0;
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      return;
    }
    vec3 dir = segLen > 0.001 ? normalize(posB - posA) : vec3(0.0, 1.0, 0.0);
    vec3 toCamera = normalize(cameraPosition - pos);
    vec3 right = cross(dir, toCamera);
    float rLen = length(right);
    right = rLen > 0.001 ? right / rLen : vec3(1.0, 0.0, 0.0);
    pos += right * aSide * uWidth * 0.5;
    vAlpha = 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`,zu=`
  precision highp float;
  uniform vec3  uColor;
  uniform float uAlpha;
  uniform float uTaper;
  varying float vAlpha;
  varying float vRibbonU;
  varying float vRibbonV;
  void main() {
    if (vAlpha < 0.01) discard;
    float edge    = smoothstep(1.0, 0.5, abs(vRibbonU));
    float ageFade = mix(1.0 - uTaper, 1.0, vRibbonV);
    gl_FragColor  = vec4(uColor, uAlpha * edge * ageFade);
  }
`,oe=8,Du=`
  precision highp float;
  attribute vec2  aTexCoord;
  attribute float aTubeSide;
  attribute float aIsB;
  uniform sampler2D uPosTexA;
  uniform sampler2D uPosTexB;
  uniform float uTubeRadius;
  uniform float uMaxSegLen;
  varying float vAlpha;
  varying float vRibbonV;
  const float PI2 = 6.28318530718;
  const float SIDES = ${oe}.0;
  void main() {
    vec3 posA = texture2D(uPosTexA, aTexCoord).xyz;
    vec3 posB = texture2D(uPosTexB, aTexCoord).xyz;
    vec3 pos  = mix(posA, posB, aIsB);
    vRibbonV  = aIsB;
    float segLen = length(posB - posA);
    if (segLen > uMaxSegLen) { vAlpha = 0.0; gl_Position = vec4(2.0,2.0,2.0,1.0); return; }
    vec3 dir = segLen > 0.001 ? normalize(posB - posA) : vec3(0.0, 1.0, 0.0);
    vec3 up    = abs(dir.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 right = normalize(cross(dir, up));
    vec3 up2   = normalize(cross(right, dir));
    float angle = PI2 * aTubeSide / SIDES;
    pos += (right * cos(angle) + up2 * sin(angle)) * uTubeRadius;
    vAlpha = 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`,Vu=`
  precision highp float;
  uniform vec3  uColor;
  uniform float uAlpha;
  uniform float uTaper;
  varying float vAlpha;
  varying float vRibbonV;
  void main() {
    if (vAlpha < 0.01) discard;
    float ageFade = mix(1.0 - uTaper, 1.0, vRibbonV);
    gl_FragColor  = vec4(uColor, uAlpha * ageFade);
  }
`,Uu=`
  precision highp float;
  attribute vec2  aTexCoord;
  attribute float aIsEnd;
  uniform sampler2D uPosTex;
  uniform sampler2D uVelTex;
  uniform float uStreakLength;
  uniform bool  uAgeEnabled;
  uniform float uAgeMax;
  varying float vEndAlpha;
  varying float vNormAge;
  void main() {
    vec4 posData = texture2D(uPosTex, aTexCoord);
    vec3 pos     = posData.xyz;
    vec3 vel     = texture2D(uVelTex, aTexCoord).xyz;
    float spd    = length(vel);
    vEndAlpha    = 1.0 - aIsEnd;
    vNormAge     = uAgeEnabled ? clamp(posData.w / max(uAgeMax, 0.001), 0.0, 1.0) : 0.5;
    vec3 worldPos = pos - normalize(vel + vec3(0.0001)) * aIsEnd * uStreakLength * min(spd * 0.05, 1.0);
    gl_Position   = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
  }
`,Gu=`
  precision highp float;
  uniform vec3  uColor;
  uniform float uOpacity;
  uniform bool  uAgeEnabled;
  uniform float uAgeFadeIn;
  uniform float uAgeFadeOut;
  varying float vEndAlpha;
  varying float vNormAge;
  void main() {
    float ageFade = 1.0;
    if (uAgeEnabled) {
      ageFade  = smoothstep(0.0, uAgeFadeIn, vNormAge);
      ageFade *= smoothstep(1.0, 1.0 - uAgeFadeOut, vNormAge);
    }
    gl_FragColor = vec4(uColor, uOpacity * vEndAlpha * ageFade);
  }
`,Iu=`
  precision highp float;
  attribute vec2 aTexCoord;
  uniform sampler2D uPosTex;
  uniform float uRadius;
  varying vec3 vWorldCenter;
  varying vec3 vQuadPos;
  void main() {
    vec3 center = texture2D(uPosTex, aTexCoord).xyz;
    vWorldCenter = center;
    // Billboard: derive camera axes from cameraPosition
    vec3 toCamera = normalize(cameraPosition - center);
    vec3 up       = abs(toCamera.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 right    = normalize(cross(toCamera, up));
    up            = normalize(cross(right, toCamera));
    vec3 worldPos = center + (right * position.x + up * position.y) * uRadius;
    vQuadPos      = worldPos;
    gl_Position   = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
  }
`,_u=`
  precision highp float;
  uniform vec3  uColor;
  uniform float uRadius;
  uniform float uDensity;
  uniform float uOpacity;
  uniform float uSteps;
  varying vec3 vWorldCenter;
  varying vec3 vQuadPos;
  void main() {
    vec3 rayDir = normalize(vQuadPos - cameraPosition);
    vec3 oc = cameraPosition - vWorldCenter;
    float b    = dot(oc, rayDir);
    float c    = dot(oc, oc) - uRadius * uRadius;
    float disc = b * b - c;
    if (disc < 0.0) discard;
    float sqrtD = sqrt(disc);
    float t0 = max(-b - sqrtD, 0.0);
    float t1 = -b + sqrtD;
    if (t1 < 0.0) discard;
    int nSteps   = int(uSteps);
    float segLen = (t1 - t0) / uSteps;
    float accumulated = 0.0;
    for (int i = 0; i < 32; i++) {
      if (i >= nSteps) break;
      float t   = t0 + (float(i) + 0.5) * segLen;
      vec3 p    = cameraPosition + rayDir * t;
      float d   = length(p - vWorldCenter) / uRadius;
      accumulated += exp(-d * d * 4.0) * segLen;
    }
    float alpha = (1.0 - exp(-accumulated * uDensity)) * uOpacity;
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`,Wu=`
  precision highp float;
  attribute vec2 aTexCoord;
  uniform sampler2D uPosTex;
  uniform sampler2D uVelTex;
  uniform float uGeomScale;
  uniform float uVelocityAlign;
  varying vec3 vNormal;

  mat3 lookRot(vec3 dir) {
    vec3 up = abs(dir.y) < 0.99 ? vec3(0,1,0) : vec3(1,0,0);
    vec3 r  = normalize(cross(dir, up));
    vec3 u  = cross(r, dir);
    return mat3(r, u, dir);
  }

  void main() {
    vec3 instancePos = texture2D(uPosTex, aTexCoord).xyz;
    vec3 vel         = texture2D(uVelTex, aTexCoord).xyz;
    mat3 rot = mat3(1.0);
    if (uVelocityAlign > 0.5) {
      float spd = length(vel);
      if (spd > 0.01) rot = lookRot(vel / spd);
    }
    vec3 local = rot * (position * uGeomScale);
    vNormal = normalize(normalMatrix * rot * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(instancePos + local, 1.0);
  }
`,Ou=`
  precision highp float;
  uniform vec3  uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(vec3(0.5, 1.0, 0.8));
    float diff = max(0.0, dot(N, L)) * 0.7 + 0.3;
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(0.0, dot(N, H)), 24.0) * 0.35;
    gl_FragColor = vec4(uColor * diff + spec, uOpacity);
  }
`;function ku(u,t){const e=b.useMemo(()=>new H({uniforms:{uPosTex:{value:null},uVelTex:{value:null},uColor:{value:new re(u.gpgpuColor)},uSize:{value:u.gpgpuSize},uOpacity:{value:u.gpgpuOpacity},uVelColorEnabled:{value:!1},uVelColorHueMin:{value:200},uVelColorHueMax:{value:360},uVelColorSaturation:{value:.9},uAgeEnabled:{value:!1},uAgeMax:{value:8},uAgeFadeIn:{value:.1},uAgeFadeOut:{value:.2},uAgeColorEnabled:{value:!1},uAgeColorYoung:{value:new re("#00aaff")},uAgeColorOld:{value:new re("#ff4400")},uAgeSizeEnabled:{value:!1},uAgeSizeStart:{value:2},uAgeSizeEnd:{value:.2},uSortTex:{value:null},uSortEnabled:{value:!1}},vertexShader:Eu,fragmentShader:Fu,transparent:!0,depthWrite:!1,blending:ce}),[]),i=b.useMemo(()=>{const d=t*t,c=new _e,n=new Float32Array(d*2);for(let f=0;f<d;f++)n[f*2]=(f%t+.5)/t,n[f*2+1]=(Math.floor(f/t)+.5)/t;return c.setAttribute("position",new X(new Float32Array(d*3),3)),c.setAttribute("aTexCoord",new X(n,2)),c},[t]),l=b.useMemo(()=>{const d=t*t,c=new _e,n=new Float32Array(d*4),f=new Float32Array(d*2),p=new Float32Array(d*6);for(let o=0;o<d;o++){const a=(o%t+.5)/t,h=(Math.floor(o/t)+.5)/t;n[o*4+0]=a,n[o*4+1]=h,n[o*4+2]=a,n[o*4+3]=h,f[o*2+0]=0,f[o*2+1]=1}return c.setAttribute("position",new X(p,3)),c.setAttribute("aTexCoord",new X(n,2)),c.setAttribute("aIsEnd",new X(f,1)),c},[t]),s=b.useMemo(()=>new H({uniforms:{uPosTex:{value:null},uVelTex:{value:null},uColor:{value:new re(u.gpgpuColor)},uOpacity:{value:.6},uStreakLength:{value:15},uAgeEnabled:{value:!1},uAgeMax:{value:8},uAgeFadeIn:{value:.1},uAgeFadeOut:{value:.2}},vertexShader:Uu,fragmentShader:Gu,transparent:!0,depthWrite:!1,blending:ce}),[]);return{drawMat:e,drawGeo:i,streakGeo:l,streakMat:s}}function Lu(u,t){const e=b.useMemo(()=>{if(u.gpgpuGeomMode==="point")return null;const n=t*t,f=new pt;let p;u.gpgpuGeomMode==="cube"?p=new It(1,1,1):u.gpgpuGeomMode==="tetra"?p=new _t(.8):u.gpgpuGeomMode==="icosa"?p=new Wt(.82):p=new Ot(.7),p.index&&f.setIndex(p.index),f.setAttribute("position",p.attributes.position),p.attributes.normal&&f.setAttribute("normal",p.attributes.normal);const o=new Float32Array(n*2);for(let a=0;a<n;a++)o[a*2]=(a%t+.5)/t,o[a*2+1]=(Math.floor(a/t)+.5)/t;return f.setAttribute("aTexCoord",new dt(o,2)),f.instanceCount=n,p.dispose(),f},[t,u.gpgpuGeomMode]),i=b.useMemo(()=>new H({uniforms:{uPosTex:{value:null},uVelTex:{value:null},uColor:{value:new re(u.gpgpuColor)},uOpacity:{value:u.gpgpuOpacity},uGeomScale:{value:u.gpgpuBounceRadius*.02},uVelocityAlign:{value:0}},vertexShader:Wu,fragmentShader:Ou,transparent:!0,depthWrite:!1,blending:ce,side:Xe}),[]),l=b.useMemo(()=>e?new Ve(e,i):null,[e,i]),s=b.useMemo(()=>{const n=t*t,f=new pt,p=new Je(2,2);p.index&&f.setIndex(p.index),f.setAttribute("position",p.attributes.position);const o=new Float32Array(n*2);for(let a=0;a<n;a++)o[a*2]=(a%t+.5)/t,o[a*2+1]=(Math.floor(a/t)+.5)/t;return f.setAttribute("aTexCoord",new dt(o,2)),f.instanceCount=n,p.dispose(),f},[t]),d=b.useMemo(()=>new H({uniforms:{uPosTex:{value:null},uColor:{value:new re(u.gpgpuVolumetricColor)},uRadius:{value:u.gpgpuVolumetricRadius},uDensity:{value:u.gpgpuVolumetricDensity},uOpacity:{value:u.gpgpuVolumetricOpacity},uSteps:{value:u.gpgpuVolumetricSteps}},vertexShader:Iu,fragmentShader:_u,transparent:!0,depthWrite:!1,blending:ce}),[]),c=b.useMemo(()=>{const n=new Ve(s,d);return n.frustumCulled=!1,n},[s,d]);return{instGeo:e,geomMat:i,geomMeshObj:l,volumetricGeo:s,volumetricMat:d,volumetricMeshObj:c}}function Nu({config:u,texSize:t,simScene:e,simGeo:i}){const l=b.useMemo(()=>new H({uniforms:{uPosTex:{value:null},uVelTex:{value:null},uDelta:{value:.016},uTime:{value:0},uGravity:{value:u.gpgpuGravity},uTurbulence:{value:u.gpgpuTurbulence},uBounceRadius:{value:u.gpgpuBounceRadius},uBounce:{value:u.gpgpuBounce},uAudioBlast:{value:0},uNBodyEnabled:{value:!1},uNBodyStrength:{value:1},uNBodySoftening:{value:2},uNBodyRepulsion:{value:5},uNBodySamples:{value:16},uTexSizeF:{value:t},uCurlEnabled:{value:!1},uCurlStrength:{value:1},uCurlScale:{value:.008},uBoidsEnabled:{value:!1},uBoidsSeparation:{value:1},uBoidsAlignment:{value:.5},uBoidsCohesion:{value:.3},uBoidsRadius:{value:30},uAttractorEnabled:{value:!1},uAttractorType:{value:0},uAttractorStrength:{value:1},uAttractorScale:{value:8},uVortexEnabled:{value:!1},uVortexStrength:{value:1},uVortexTilt:{value:0},uWindEnabled:{value:!1},uWindStrength:{value:1},uWindX:{value:1},uWindY:{value:0},uWindZ:{value:0},uWindGust:{value:.3},uWellEnabled:{value:!1},uWellStrength:{value:1},uWellSoftening:{value:10},uWellOrbit:{value:.5},uElasticEnabled:{value:!1},uElasticStrength:{value:.5},uMagneticEnabled:{value:!1},uMagneticStrength:{value:1},uMagneticBX:{value:0},uMagneticBY:{value:1},uMagneticBZ:{value:0},uSphEnabled:{value:!1},uSphPressure:{value:3},uSphViscosity:{value:.5},uSphRadius:{value:40},uSphRestDensity:{value:2},uVFieldEnabled:{value:!1},uVFieldType:{value:2},uVFieldStrength:{value:1},uVFieldScale:{value:.005},uSpringEnabled:{value:!1},uSpringStrength:{value:1},uInitPosTex:{value:null},uSdfEnabled:{value:!1},uSdfShape:{value:0},uSdfX:{value:0},uSdfY:{value:0},uSdfZ:{value:0},uSdfSize:{value:80},uSdfBounce:{value:.5},uMouseEnabled:{value:!1},uMousePos:{value:new pe(0,0,0)},uMouseStrength:{value:2},uMouseRadius:{value:150},uMouseMode:{value:0},uFluidEnabled:{value:!1},uFluidTex:{value:null},uFluidInfluence:{value:.8},uFluidScale:{value:1.5}},vertexShader:ze,fragmentShader:Tu}),[]),s=b.useMemo(()=>new H({uniforms:{uPosTex:{value:null},uVelTex:{value:null},uDelta:{value:.016},uSpeed:{value:u.gpgpuSpeed},uBounceRadius:{value:u.gpgpuBounceRadius},uAgeEnabled:{value:!1},uAgeMax:{value:8},uVerletEnabled:{value:!1},uPrevPosTex:{value:null},uSdfEnabled:{value:!1},uSdfShape:{value:0},uSdfX:{value:0},uSdfY:{value:0},uSdfZ:{value:0},uSdfSize:{value:80},uSdfBounce:{value:.5}},vertexShader:ze,fragmentShader:Mu}),[]),d=b.useMemo(()=>new H({uniforms:{uTex:{value:null}},vertexShader:ze,fragmentShader:yu}),[]),c=b.useMemo(()=>new H({uniforms:{uPosTex:{value:null},uViewMatrix:{value:new kt}},vertexShader:ze,fragmentShader:Au}),[]),n=b.useMemo(()=>new H({uniforms:{uSortIn:{value:null},uTexSizeF:{value:64},uStep:{value:0},uStage:{value:0}},vertexShader:ze,fragmentShader:Ru}),[]),f=b.useMemo(()=>new H({uniforms:{uFluidIn:{value:null},uDelta:{value:.016},uFluidDiffuse:{value:.02},uFluidDecay:{value:.01},uFluidStrength:{value:1},uTime:{value:0},uFluidExtForce:{value:!1}},vertexShader:ze,fragmentShader:Bu}),[]),p=b.useRef(null);return b.useEffect(()=>{const o=new Ve(i,l);return e.add(o),p.current=o,()=>{e.remove(o),p.current=null}},[i,l,e]),{simMeshRef:p,velSimMat:l,posSimMat:s,blitMat:d,sortDepthMat:c,bitonicMat:n,fluidAdvectMat:f}}function qu(u){return new et(u,u,{minFilter:Ze,magFilter:Ze,format:se,type:le,depthBuffer:!1,stencilBuffer:!1})}function Yu(u,t){const e=b.useMemo(()=>Array.from({length:U},()=>qu(t)),[t]),i=b.useMemo(()=>Array.from({length:U},()=>new H({uniforms:{uPosTex:{value:null},uVelTex:{value:null},uColor:{value:new re(u.gpgpuColor)},uSize:{value:u.gpgpuSize},uAlpha:{value:0},uVelocityScale:{value:u.gpgpuTrailVelocityScale}},vertexShader:wu,fragmentShader:Pu,transparent:!0,depthWrite:!1,blending:ce})),[]),l=b.useRef(0),s=b.useMemo(()=>{const f=t*t,p=new _e,o=new Float32Array(f*4*2),a=new Float32Array(f*4),h=new Float32Array(f*4);for(let x=0;x<f;x++){const M=(x%t+.5)/t,r=(Math.floor(x/t)+.5)/t,m=x*4;for(let g=0;g<4;g++)o[(m+g)*2]=M,o[(m+g)*2+1]=r;a[m]=-1,a[m+1]=1,a[m+2]=-1,a[m+3]=1,h[m]=0,h[m+1]=0,h[m+2]=1,h[m+3]=1}const v=new Uint32Array(f*6);for(let x=0;x<f;x++){const M=x*4,r=x*6;v[r]=M,v[r+1]=M+2,v[r+2]=M+1,v[r+3]=M+1,v[r+4]=M+2,v[r+5]=M+3}return p.setAttribute("aTexCoord",new X(o,2)),p.setAttribute("aSide",new X(a,1)),p.setAttribute("aIsB",new X(h,1)),p.setIndex(new X(v,1)),p},[t]),d=b.useMemo(()=>Array.from({length:U-1},()=>new H({uniforms:{uPosTexA:{value:null},uPosTexB:{value:null},uColor:{value:new re(u.gpgpuColor)},uWidth:{value:u.gpgpuRibbonWidth},uAlpha:{value:0},uTaper:{value:u.gpgpuRibbonTaper},uMaxSegLen:{value:u.gpgpuRibbonMaxSegLen}},vertexShader:Cu,fragmentShader:zu,transparent:!0,depthWrite:!1,blending:ce,side:Xe})),[]),c=b.useMemo(()=>{const f=t*t,p=new _e,o=oe*2,a=f*o,h=new Float32Array(a*2),v=new Float32Array(a),x=new Float32Array(a);for(let m=0;m<f;m++){const g=(m%t+.5)/t,y=(Math.floor(m/t)+.5)/t;for(let A=0;A<oe;A++){const R=m*o+A,T=m*o+oe+A;h[R*2]=g,h[R*2+1]=y,h[T*2]=g,h[T*2+1]=y,v[R]=A,x[R]=0,v[T]=A,x[T]=1}}const M=oe*6,r=new Uint32Array(f*M);for(let m=0;m<f;m++){const g=m*o,y=m*M;for(let A=0;A<oe;A++){const R=(A+1)%oe,T=y+A*6;r[T]=g+A,r[T+1]=g+oe+A,r[T+2]=g+R,r[T+3]=g+R,r[T+4]=g+oe+A,r[T+5]=g+oe+R}}return p.setAttribute("aTexCoord",new X(h,2)),p.setAttribute("aTubeSide",new X(v,1)),p.setAttribute("aIsB",new X(x,1)),p.setIndex(new X(r,1)),p},[t]),n=b.useMemo(()=>Array.from({length:U-1},()=>new H({uniforms:{uPosTexA:{value:null},uPosTexB:{value:null},uColor:{value:new re(u.gpgpuColor)},uTubeRadius:{value:u.gpgpuTubeRadius},uAlpha:{value:0},uTaper:{value:.8},uMaxSegLen:{value:u.gpgpuRibbonMaxSegLen}},vertexShader:Du,fragmentShader:Vu,transparent:!0,depthWrite:!1,blending:ce,side:Xe})),[]);return{trailRTs:e,trailMats:i,trailHead:l,ribbonGeo:s,ribbonMats:d,tubeGeo:c,tubeMats:n}}function Xu({config:u,texSize:t,simScene:e,simGeo:i}){const l=Nu({config:u,texSize:t,simScene:e,simGeo:i}),s=ku(u,t),d=Yu(u,t),c=Lu(u,t);return{...l,...s,...d,...c}}function Zu(u){const t=Math.ceil(Math.sqrt(u));let e=1;for(;e<t;)e<<=1;return Math.max(e,2)}function xe(u){return new et(u,u,{minFilter:Ze,magFilter:Ze,format:se,type:le,depthBuffer:!1,stencilBuffer:!1})}function ht(u){const t=new et(u,u,{minFilter:ct,magFilter:ct,format:se,type:le,depthBuffer:!1,stencilBuffer:!1});return t.texture.wrapS=gt,t.texture.wrapT=gt,t}function ju({gl:u,texSize:t,config:e}){const i=b.useRef(null),l=b.useRef(!0),s=b.useRef(null),d=b.useRef(null),c=b.useRef(null),n=b.useRef(null),f=b.useRef(!0),p=b.useRef(null),o=b.useRef(null),a=b.useRef(null),h=b.useRef(null),v=b.useRef(null),x=b.useRef(!0),M=b.useRef(null),r=b.useRef("idle");return b.useEffect(()=>{var Ee,Fe,we,I,ne,q,O,he;i.current&&(i.current.posA.dispose(),i.current.posB.dispose(),i.current.velA.dispose(),i.current.velB.dispose()),(Ee=s.current)==null||Ee.dispose(),(Fe=d.current)==null||Fe.dispose();const m=xe(t),g=xe(t),y=xe(t),A=xe(t),R=xe(t);i.current={posA:m,posB:g,velA:y,velB:A},s.current=R,l.current=!0;const T=t*t,F=new Float32Array(T*4),z=new Float32Array(T*4),B=e.gpgpuBounceRadius,C=e.gpgpuEmitShape;for(let E=0;E<T;E++){const w=Math.random()*Math.PI*2;let V=0,D=0,Y=0;if(C==="disc"){const P=B*Math.sqrt(Math.random());V=P*Math.cos(w),D=0,Y=P*Math.sin(w)}else if(C==="ring"){const P=B*(.85+Math.random()*.15);V=P*Math.cos(w),D=(Math.random()-.5)*B*.08,Y=P*Math.sin(w)}else if(C==="box")V=(Math.random()-.5)*2*B,D=(Math.random()-.5)*2*B,Y=(Math.random()-.5)*2*B;else if(C==="shell"){const P=Math.acos(2*Math.random()-1);V=B*Math.sin(P)*Math.cos(w),D=B*Math.sin(P)*Math.sin(w),Y=B*Math.cos(P)}else if(C==="cone"){const P=Math.random()*B,k=P/B*B;V=k*Math.cos(w),D=P-B*.5,Y=k*Math.sin(w)}else{const P=Math.acos(2*Math.random()-1),k=B*(.1+Math.random()*.9);V=k*Math.sin(P)*Math.cos(w),D=k*Math.sin(P)*Math.sin(w),Y=k*Math.cos(P)}F[E*4]=V,F[E*4+1]=D,F[E*4+2]=Y,F[E*4+3]=1,z[E*4]=(Math.random()-.5)*4,z[E*4+1]=(Math.random()-.5)*4,z[E*4+2]=(Math.random()-.5)*4}const J=new Ce(F.slice(),t,t,se,le);J.needsUpdate=!0,d.current=J;const G=new St,_=new xt(-1,1,1,-1,0,1),W=new Je(2,2),K=new Ce(F,t,t,se,le),ue=new Ce(z,t,t,se,le);K.needsUpdate=!0,ue.needsUpdate=!0;const Z=new ft({map:K}),ee=new Ve(W,Z);G.add(ee),u.setRenderTarget(m),u.render(G,_),u.setRenderTarget(R),u.render(G,_),Z.map=ue,Z.needsUpdate=!0,u.setRenderTarget(y),u.render(G,_),u.setRenderTarget(null),G.remove(ee),K.dispose(),ue.dispose(),Z.dispose(),(we=p.current)==null||we.dispose(),(I=o.current)==null||I.dispose(),p.current=xe(t),o.current=xe(t),(ne=c.current)==null||ne.dispose(),(q=n.current)==null||q.dispose(),c.current=ht($),n.current=ht($),f.current=!0;const N=new Float32Array($*$*4);for(let E=0;E<$*$;E++){const w=E%$/$-.5,V=Math.floor(E/$)/$-.5,D=Math.sqrt(w*w+V*V)+.001;N[E*4+0]=-V/(D*D+.1)*.08,N[E*4+1]=w/(D*D+.1)*.08,N[E*4+2]=0,N[E*4+3]=1}const ge=new Ce(N,$,$,se,le);ge.needsUpdate=!0;const Te=new ft({map:ge}),Me=new Ve(W,Te);G.add(Me),u.setRenderTarget(c.current),u.render(G,_),u.setRenderTarget(n.current),u.render(G,_),u.setRenderTarget(null),G.remove(Me),Te.dispose(),ge.dispose(),W.dispose(),a.current&&(Qe(a.current),a.current=null),(O=h.current)==null||O.dispose(),h.current=null,(he=v.current)==null||he.dispose(),v.current=null,M.current=null;const ve=F.slice(),me=z.slice();M.current={positions:new Float32Array(ve),velocities:new Float32Array(me)};const Ae=e.gpgpuEnabled&&(e.gpgpuExecutionPreference==="webgpu"||e.gpgpuExecutionPreference!=="webgl"&&e.gpgpuWebGPUEnabled),Re=Gt(e),Be=Ae&&Re.canRunRequestedConfig;let de=!1;return Be?(r.current="initializing",gu(t,ve,me).then(E=>{if(de){E&&Qe(E);return}if(a.current=E,x.current=!0,!E){r.current="unavailable";return}r.current="ready";const w=new Ce(new Float32Array(ve),t,t,se,le);w.needsUpdate=!0,h.current=w;const V=new Ce(new Float32Array(me),t,t,se,le);V.needsUpdate=!0,v.current=V}).catch(()=>{de||(a.current=null,r.current="failed")})):Ae?r.current="unavailable":r.current="idle",()=>{var E,w,V,D,Y,P,k,be,ae,Se,Q,te;de=!0,(E=i.current)==null||E.posA.dispose(),(w=i.current)==null||w.posB.dispose(),(V=i.current)==null||V.velA.dispose(),(D=i.current)==null||D.velB.dispose(),i.current=null,(Y=s.current)==null||Y.dispose(),s.current=null,(P=d.current)==null||P.dispose(),d.current=null,(k=p.current)==null||k.dispose(),p.current=null,(be=o.current)==null||be.dispose(),o.current=null,(ae=c.current)==null||ae.dispose(),c.current=null,(Se=n.current)==null||Se.dispose(),n.current=null,a.current&&(Qe(a.current),a.current=null),(Q=h.current)==null||Q.dispose(),h.current=null,(te=v.current)==null||te.dispose(),v.current=null,M.current=null,r.current="idle"}},[t,u,e.gpgpuEmitShape,e.gpgpuBounceRadius,e.gpgpuEnabled,e.gpgpuExecutionPreference,e.gpgpuWebGPUEnabled]),{rtRef:i,pingIsA:l,prevPosRTRef:s,initPosTexRef:d,fluidRTARef:c,fluidRTBRef:n,fluidPingIsA:f,sortRTARef:p,sortRTBRef:o,webgpuStateRef:a,webgpuPosTexRef:h,webgpuVelTexRef:v,webgpuPingIsARef:x,webgpuLastReadbackRef:M,webgpuInitStatusRef:r}}function Hu(u){const{config:t,gl:e,camera:i,simScene:l,simCamera:s,simMesh:d,posTexture:c,texSize:n,sortRTA:f,sortRTB:p,sortDepthMat:o,bitonicMat:a}=u;if(!t.gpgpuSortEnabled||!f||!p)return null;o.uniforms.uPosTex.value=c,o.uniforms.uViewMatrix.value.copy(i.matrixWorldInverse),d.material=o,e.setRenderTarget(f),e.render(l,s);const h=Math.log2(n*n);let v=!0;a.uniforms.uTexSizeF.value=n;for(let x=0;x<h;x++)for(let M=x;M>=0;M--){const r=v?f:p,m=v?p:f;a.uniforms.uSortIn.value=r.texture,a.uniforms.uStep.value=M,a.uniforms.uStage.value=x,d.material=a,e.setRenderTarget(m),e.render(l,s),v=!v}return(v?p:f).texture}function Ku(u){const{config:t,gl:e,simScene:i,simCamera:l,simMesh:s,blitMat:d,trailRTs:c,trailHead:n,posTexture:f}=u;!t.gpgpuTrailEnabled&&!t.gpgpuRibbonEnabled&&!t.gpgpuTubeEnabled||(d.uniforms.uTex.value=f,s.material=d,e.setRenderTarget(c[n.current]),e.render(i,l),n.current=(n.current+1)%U)}function Qu(u){const{config:t,lodSystem:e,texSize:i,velSimMat:l,drawGeo:s,streakGeo:d}=u,c=t.autoLod?e.getEffectiveCount(t.gpgpuCount):t.gpgpuCount,n=Math.min(c,i*i);return t.autoLod&&e.shouldSkipExpensive()&&(l.uniforms.uNBodyEnabled.value=!1,l.uniforms.uSphEnabled.value=!1,l.uniforms.uBoidsEnabled.value=!1),s.setDrawRange(0,n),d.setDrawRange(0,n*2),n}function $u(u){const{config:t,activeCount:e,gpgpuAudioDrives:i,assets:l,posTexture:s,velTexture:d,finalSortTex:c}=u,{drawMat:n,trailRTs:f,trailMats:p,trailHead:o,ribbonMats:a,tubeMats:h,streakMat:v,geomMat:x,volumetricGeo:M,volumetricMat:r}=l;if(n.uniforms.uPosTex.value=s,n.uniforms.uVelTex.value=d,n.uniforms.uColor.value.setStyle(t.gpgpuColor),n.uniforms.uSize.value=Math.max(.001,t.gpgpuSize*(1+i.size)),n.uniforms.uOpacity.value=Math.max(.02,Math.min(1.5,t.gpgpuOpacity+i.opacity*.25)),n.uniforms.uVelColorEnabled.value=t.gpgpuVelColorEnabled,n.uniforms.uVelColorHueMin.value=t.gpgpuVelColorHueMin,n.uniforms.uVelColorHueMax.value=t.gpgpuVelColorHueMax,n.uniforms.uVelColorSaturation.value=t.gpgpuVelColorSaturation,n.uniforms.uAgeEnabled.value=t.gpgpuAgeEnabled,n.uniforms.uAgeMax.value=t.gpgpuAgeMax,n.uniforms.uAgeFadeIn.value=t.gpgpuAgeFadeIn,n.uniforms.uAgeFadeOut.value=t.gpgpuAgeFadeOut,n.uniforms.uAgeColorEnabled.value=t.gpgpuAgeColorEnabled,n.uniforms.uAgeColorYoung.value.setStyle(t.gpgpuAgeColorYoung),n.uniforms.uAgeColorOld.value.setStyle(t.gpgpuAgeColorOld),n.uniforms.uAgeSizeEnabled.value=t.gpgpuAgeSizeEnabled,n.uniforms.uAgeSizeStart.value=t.gpgpuAgeSizeStart,n.uniforms.uAgeSizeEnd.value=t.gpgpuAgeSizeEnd,n.uniforms.uSortEnabled.value=t.gpgpuSortEnabled&&c!==null,n.uniforms.uSortTex.value=c,n.blending=t.gpgpuSortEnabled?Lt:ce,t.gpgpuStreakEnabled&&(v.uniforms.uPosTex.value=s,v.uniforms.uVelTex.value=d,v.uniforms.uColor.value.setStyle(t.gpgpuColor),v.uniforms.uOpacity.value=Math.max(.02,Math.min(1.5,t.gpgpuStreakOpacity+i.opacity*.2)),v.uniforms.uStreakLength.value=t.gpgpuStreakLength,v.uniforms.uAgeEnabled.value=t.gpgpuAgeEnabled,v.uniforms.uAgeMax.value=t.gpgpuAgeMax,v.uniforms.uAgeFadeIn.value=t.gpgpuAgeFadeIn,v.uniforms.uAgeFadeOut.value=t.gpgpuAgeFadeOut),t.gpgpuTrailEnabled){const m=Math.min(U,Math.max(2,Math.round(t.gpgpuTrailLength+i.trailLength)));for(let g=0;g<U;g++){const y=(o.current-1-g+U*2)%U,A=g<m?Math.pow(t.gpgpuTrailFade,g+1)*t.gpgpuOpacity:0;p[g].uniforms.uPosTex.value=f[y].texture,p[g].uniforms.uVelTex.value=d,p[g].uniforms.uColor.value.setStyle(t.gpgpuColor),p[g].uniforms.uSize.value=Math.max(.001,t.gpgpuSize*(1+i.size)),p[g].uniforms.uAlpha.value=A,p[g].uniforms.uVelocityScale.value=t.gpgpuTrailVelocityScale}}if(t.gpgpuRibbonEnabled){const m=Math.min(U-1,Math.max(2,Math.round(t.gpgpuTrailLength+i.trailLength)));for(let g=0;g<U-1;g++){const y=(o.current-1-g+U*2)%U,A=(o.current-2-g+U*2)%U,R=g<m-1?Math.pow(t.gpgpuTrailFade,g+1)*t.gpgpuRibbonOpacity:0;a[g].uniforms.uPosTexA.value=f[A].texture,a[g].uniforms.uPosTexB.value=f[y].texture,a[g].uniforms.uColor.value.setStyle(t.gpgpuColor),a[g].uniforms.uWidth.value=Math.max(.001,t.gpgpuRibbonWidth*(1+i.ribbonWidth)),a[g].uniforms.uAlpha.value=R,a[g].uniforms.uTaper.value=t.gpgpuRibbonTaper,a[g].uniforms.uMaxSegLen.value=t.gpgpuRibbonMaxSegLen}}if(t.gpgpuTubeEnabled){const m=Math.min(U-1,Math.max(2,Math.round(t.gpgpuTrailLength+i.trailLength)));for(let g=0;g<U-1;g++){const y=(o.current-1-g+U*2)%U,A=(o.current-2-g+U*2)%U,R=g<m-1?Math.pow(t.gpgpuTrailFade,g+1)*t.gpgpuTubeOpacity:0;h[g].uniforms.uPosTexA.value=f[A].texture,h[g].uniforms.uPosTexB.value=f[y].texture,h[g].uniforms.uColor.value.setStyle(t.gpgpuColor),h[g].uniforms.uTubeRadius.value=t.gpgpuTubeRadius,h[g].uniforms.uAlpha.value=R,h[g].uniforms.uMaxSegLen.value=t.gpgpuRibbonMaxSegLen}}t.gpgpuGeomMode!=="point"&&(x.uniforms.uPosTex.value=s,x.uniforms.uVelTex.value=d,x.uniforms.uColor.value.setStyle(t.gpgpuColor),x.uniforms.uOpacity.value=Math.max(.02,Math.min(1.5,t.gpgpuOpacity+i.opacity*.25)),x.uniforms.uGeomScale.value=t.gpgpuBounceRadius*.02*t.gpgpuGeomScale,x.uniforms.uVelocityAlign.value=t.gpgpuGeomVelocityAlign?1:0),t.gpgpuVolumetricEnabled&&(M.instanceCount=e,r.uniforms.uPosTex.value=s,r.uniforms.uColor.value.setStyle(t.gpgpuVolumetricColor),r.uniforms.uRadius.value=t.gpgpuVolumetricRadius,r.uniforms.uDensity.value=Math.max(.01,Math.min(5,t.gpgpuVolumetricDensity+i.volumetricDensity*.35)),r.uniforms.uOpacity.value=Math.max(.02,Math.min(1.5,t.gpgpuVolumetricOpacity+i.opacity*.2)),r.uniforms.uSteps.value=t.gpgpuVolumetricSteps)}function Bt({audioRef:u,config:t,isPlaying:e,posReadbackRef:i,posReadbackVersionRef:l}){const{gl:s,camera:d}=Kt(),c=b.useRef(new Nt(0,0)),n=b.useRef(new pe(0,0,0)),f=b.useRef(new pe),p=b.useRef(new pe),o=b.useRef(0),a=b.useRef(0),h=b.useRef(Xt()),v=b.useRef(null),x=b.useRef(null);b.useEffect(()=>{const I=s.domElement,ne=q=>{const O=I.getBoundingClientRect();c.current.x=(q.clientX-O.left)/O.width*2-1,c.current.y=-((q.clientY-O.top)/O.height)*2+1};return I.addEventListener("mousemove",ne),()=>I.removeEventListener("mousemove",ne)},[s.domElement]),b.useEffect(()=>{},[]);const M=b.useMemo(()=>new Jt,[]),r=b.useMemo(()=>Zu(t.gpgpuCount),[t.gpgpuCount]);b.useEffect(()=>()=>{const I=At({renderer:s,stateRef:x,texSize:r,reason:"component unmounted"});v.current=v.current?{...v.current,nativeTransformFeedbackPass:I}:null},[s,r]);const m=b.useMemo(()=>new St,[]),g=b.useMemo(()=>new xt(-1,1,1,-1,0,1),[]),y=b.useMemo(()=>new Je(2,2),[]),A=Xu({config:t,texSize:r,simScene:m,simGeo:y}),{simMeshRef:R,velSimMat:T,posSimMat:F,blitMat:z,sortDepthMat:B,bitonicMat:C,fluidAdvectMat:J,drawGeo:G,streakGeo:_,trailRTs:W,trailHead:K}=A,ue=ju({gl:s,texSize:r,config:t}),{rtRef:Z,pingIsA:ee,prevPosRTRef:N,initPosTexRef:ge,fluidRTARef:Te,fluidRTBRef:Me,fluidPingIsA:ve,sortRTARef:me,sortRTBRef:Ae,webgpuStateRef:Re,webgpuPosTexRef:Be,webgpuVelTexRef:de,webgpuPingIsARef:Ee,webgpuLastReadbackRef:Fe,webgpuInitStatusRef:we}=ue;return Ht("scene:gpgpu-core",t.executionDiagnosticsEnabled,({gl:I},ne)=>{if(!e||!Z.current||!R.current)return;const q=R.current,O=Math.min(ne,.05);a.current+=1,o.current+=O,t.autoLod&&M.update(O);const{isA:he,posIn:E,posOut:w,velIn:V,velOut:D}=iu(Z.current,ee.current),P=au(t,a.current)?i:void 0,k={...u.current,bandA:0,bandB:0},be=Zt(t,k,h.current),ae=jt(be),Se=qt.clamp(lu(t,k)+ae.audioBlast,0,4);hu({mouseNDC:c.current,camera:d,mouseWorld:n.current,tempVec:f.current,tempDir:p.current}),ie("scene:gpgpu-blit-previous","simulation",()=>{bu({config:t,prevPosRT:N.current,blitMat:z,simMesh:q,gl:I,simScene:m,simCamera:g,posTexture:E.texture})}),ie("scene:gpgpu-fluid-advection","simulation",()=>{Su({config:t,fluidRTA:Te.current,fluidRTB:Me.current,fluidPingIsA:ve,fluidAdvectMat:J,velSimMat:T,simMesh:q,gl:I,simScene:m,simCamera:g,dt:O,time:o.current})});const Q=su({config:t,webgpuState:Re.current,webgpuPosTexture:Be.current,webgpuVelTexture:de.current,fallbackPosTexture:w.texture,fallbackVelTexture:D.texture,posReadbackRef:P,webgpuInitStatus:we.current});ie(`scene:gpgpu-simulation-${Q.useWebGPU?"webgpu":"webgl"}`,"simulation",()=>{var Ue;xu({useWebGPU:Q.useWebGPU,config:t,texSize:r,dt:O,time:o.current,blast:Se,gpgpuAudioDrives:ae,mouseWorld:n.current,simMesh:q,gl:I,simScene:m,simCamera:g,posIn:E,posOut:w,velIn:V,velOut:D,velSimMat:T,posSimMat:F,initPosTex:ge.current,prevPosTex:((Ue=N.current)==null?void 0:Ue.texture)??null,webgpuState:Re.current,webgpuPosTex:Be.current,webgpuVelTex:de.current,webgpuPingIsARef:Ee,webgpuLastReadbackRef:Fe,posReadbackRef:P})});const te=ie("scene:gpgpu-native-capture","simulation",()=>uu({renderer:I,texSize:r,sourcePositionTexture:w.texture,sourceVelocityTexture:D.texture,enabled:t.gpgpuEnabled&&!Q.useWebGPU,stateRef:x}));v.current=ou(Q,te);const We=ie("scene:gpgpu-depth-sort","simulation",()=>Hu({config:t,gl:I,camera:d,simScene:m,simCamera:g,simMesh:q,posTexture:w.texture,texSize:r,sortRTA:me.current,sortRTB:Ae.current,sortDepthMat:B,bitonicMat:C}));ie("scene:gpgpu-trail-history","simulation",()=>{Ku({config:t,gl:I,simScene:m,simCamera:g,simMesh:q,blitMat:z,trailRTs:W,trailHead:K,posTexture:w.texture})}),I.setRenderTarget(null),ie("scene:gpgpu-readback","simulation",()=>{ru({routing:Q,gl:I,posOut:w,texSize:r,posReadbackRef:P,posReadbackVersionRef:l})}),ee.current=!he;const Oe=ie("scene:gpgpu-lod-policy","simulation",()=>Qu({config:t,lodSystem:M,texSize:r,velSimMat:T,drawGeo:G,streakGeo:_}));ie("scene:gpgpu-visual-sync","simulation",()=>{$u({config:t,activeCount:Oe,gpgpuAudioDrives:ae,assets:A,posTexture:Q.outputPosTexture,velTexture:D.texture,finalSortTex:We})})}),{assets:A}}const Et=$e.memo(u=>{const t=Bt(u);return j.jsx(Tt,{config:u.config,...t})});Et.displayName="GpgpuSystem";const io=Object.freeze(Object.defineProperty({__proto__:null,GpgpuSystem:Et,GpgpuSystemRender:Tt,useGpgpuSystemRuntime:Bt},Symbol.toStringTag,{value:"Module"})),Ju=6,fe=new pe,bt=new pe,Ie=new pe,qe=new pe,Ye=new pe,Ft=$e.memo(({config:u,posReadbackRef:t,posReadbackVersionRef:e,isPlaying:i})=>{const l=Math.max(4,Math.min(256,u.gpgpuSmoothTubeCount)),s=Math.max(4,Math.min(32,u.gpgpuSmoothTubeHistory)),d=Ju,c=b.useRef([]),n=b.useRef(0),f=b.useRef(0),p=b.useRef(0);b.useEffect(()=>{c.current=Array.from({length:s},()=>new Float32Array(l*3)),n.current=0,f.current=0},[l,s]);const o=b.useMemo(()=>{const v=s*d;return Array.from({length:l},()=>{const x=new Float32Array(v*3),M=new _e;M.setAttribute("position",new X(x,3));const r=[];for(let m=0;m<s-1;m++)for(let g=0;g<d;g++){const y=(g+1)%d,A=m*d+g,R=m*d+y,T=(m+1)*d+g,F=(m+1)*d+y;r.push(A,T,R,R,T,F)}return M.setIndex(r),M.computeBoundingSphere(),M})},[l,s]),a=b.useMemo(()=>new Yt({color:new re(u.gpgpuSmoothTubeColor),opacity:u.gpgpuSmoothTubeOpacity,transparent:u.gpgpuSmoothTubeOpacity<1,depthWrite:!1,side:Xe,roughness:.4,metalness:.2}),[]),h=b.useMemo(()=>o.map(v=>{const x=new Ve(v,a);return x.frustumCulled=!1,x}),[o,a]);return b.useEffect(()=>()=>{o.forEach(v=>v.dispose()),a.dispose()},[o,a]),Qt(()=>{const v=t.current;if(!v||!i)return;a.color.setStyle(u.gpgpuSmoothTubeColor),a.opacity=u.gpgpuSmoothTubeOpacity,a.transparent=u.gpgpuSmoothTubeOpacity<.999;const x=e.current;if(x===p.current)return;p.current=x;const M=c.current[n.current],r=Math.min(l,Math.floor(v.length/4));for(let y=0;y<r;y++)M[y*3]=v[y*4],M[y*3+1]=v[y*4+1],M[y*3+2]=v[y*4+2];if(n.current=(n.current+1)%s,f.current++,f.current<s)return;const m=u.gpgpuSmoothTubeRadius,g=Math.PI*2;for(let y=0;y<l;y++){const R=o[y].attributes.position,T=R.array;for(let F=0;F<s;F++){const z=(n.current+F)%s,B=c.current[z];Ye.set(B[y*3],B[y*3+1],B[y*3+2]);const C=(n.current+F-1+s)%s,J=(n.current+F+1)%s,G=c.current[C<0?C+s:C],_=c.current[J];fe.set(_[y*3]-G[y*3],_[y*3+1]-G[y*3+1],_[y*3+2]-G[y*3+2]);const W=fe.length();W<.001?fe.set(0,1,0):fe.divideScalar(W),bt.set(Math.abs(fe.y)<.99?0:1,Math.abs(fe.y)<.99?1:0,0),Ie.crossVectors(fe,bt).normalize(),qe.crossVectors(Ie,fe).normalize();for(let K=0;K<d;K++){const ue=g*K/d,Z=Math.cos(ue)*m,ee=Math.sin(ue)*m,N=(F*d+K)*3;T[N]=Ye.x+Ie.x*Z+qe.x*ee,T[N+1]=Ye.y+Ie.y*Z+qe.y*ee,T[N+2]=Ye.z+Ie.z*Z+qe.z*ee}}R.needsUpdate=!0}}),j.jsx("group",{children:h.map((v,x)=>j.jsx("primitive",{object:v},x))})});Ft.displayName="GpgpuSmoothTube";const lo=Object.freeze(Object.defineProperty({__proto__:null,GpgpuSmoothTube:Ft},Symbol.toStringTag,{value:"Module"}));export{lo as a,io as s};
