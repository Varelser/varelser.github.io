import{j as h,k as p}from"./react-vendor-BLE9nPfI.js";import{n as l,a8 as D,g as z,F as O,a9 as j,p as E,S as q,O as W,H as X,d as I,D as N,h as K,z as V,af as H}from"./three-core-CZYXVIXO.js";import{c as $,e as Q}from"./scene-overlay-core-C1hZwqg3.js";import{d as J}from"./scene-family-membrane-DgBEUXOF.js";import{u as U}from"./scene-camera-core-CDiBRaJK.js";import{a as Z,u as ee}from"./r3f-fiber-CBj7iv8R.js";import"./scene-families-core-DllM_mmM.js";import"./scene-runtime-motion-B_7blSTV.js";import"./scene-runtime-catalog-DTxoSzGh.js";import"./starter-library-extensions-C1PjFcNY.js";import"./starter-library-base-D5tlM7PL.js";import"./scene-future-native-bridges-9yzG2U64.js";import"./scene-future-native-shared-BK28yLVk.js";import"./scene-future-native-surface-BlNhnT6V.js";import"./scene-future-native-pbd-YsVGzRFj.js";import"./scene-future-native-mpm-CkNMAFic.js";import"./scene-future-native-fracture-DJ_qF_cm.js";import"./scene-runtime-profiling-CKBHAYLi.js";import"./scene-diagnostics-shared-BTUuNOas.js";import"./scene-depiction-shared-E7rotpSP.js";import"./scene-authoring-product-xeySrTgr.js";import"./scene-motion-shared-Gctgf-e6.js";import"./scene-authoring-hybrid-B0hyb-BL.js";import"./scene-authoring-atlas-oRKE06q4.js";import"./vendor-U6SZz42y.js";import"./r3f-utils-DIKWfahs.js";function te(e,s){const o=e*.5;switch(s){case"disc":return{rotation:[0,0,0],geometry:h.jsx("circleGeometry",{args:[o*.92,128]})};case"ring":return{rotation:[0,0,0],geometry:h.jsx("ringGeometry",{args:[o*.38,o*.94,128,16]})};case"torus":return{rotation:[Math.PI/2,0,0],geometry:h.jsx("torusGeometry",{args:[o*.68,o*.18,72,160]})};case"cylinder":return{rotation:[Math.PI/2,0,0],geometry:h.jsx("cylinderGeometry",{args:[o*.54,o*.48,e*.9,96,1,!0]})};case"cone":return{rotation:[Math.PI/2,0,0],geometry:h.jsx("coneGeometry",{args:[o*.58,e*.94,96,1,!0]})};case"cube":return{rotation:[.18,.44,.08],geometry:h.jsx("boxGeometry",{args:[e*.76,e*.76,e*.76,48,48,48]})};case"spiral":case"galaxy":return{rotation:[.22,.48,0],geometry:h.jsx("sphereGeometry",{args:[o*.78,96,64]})};default:return{rotation:[0,0,0],geometry:h.jsx("planeGeometry",{args:[e,e,96,96]})}}}function oe(e,s,o){const t=e*.5;return s==="biofilm_skin"?{rotation:[.24,.42,0],geometry:h.jsx("sphereGeometry",{args:[t*.82,112,72]})}:s==="cellular_front"?{rotation:[Math.PI/2,0,0],geometry:h.jsx("cylinderGeometry",{args:[t*.6,t*.46,e*.94,128,1,!0]})}:s==="corrosion_front"?{rotation:[Math.PI/2,0,0],geometry:h.jsx("torusGeometry",{args:[t*.7,t*.2,80,192]})}:te(e,o)}const re=({displayMaterial:e,planeSize:s,zOffset:o,mode:t,source:A})=>{const c=oe(s,t,A);return h.jsxs("mesh",{position:[0,0,o],rotation:c.rotation,renderOrder:3,children:[c.geometry,h.jsx("primitive",{object:e,attach:"material"})]})},ae={reaction_diffusion:{diffusionA:1,diffusionB:.5,reactionBoost:1,poolMix:.26,colonyBands:.32,cellScale:1,contourTightness:1,heightGain:.28,ridgeGain:.48,pitGain:.12,wetness:.12,scarStrength:.08,bulge:.2,rimPinch:.16,shear:.04,curl:.12,depthBands:.22,frontBias:.1,seedRing:.2,seedSweep:.1,seedBlob:.14},cellular_front:{feedAdd:.006,killAdd:-.002,dtMul:1.04,warpMul:1.18,flowAniso:1.12,diffusionA:.96,diffusionB:.46,reactionBoost:1.08,poolMix:.18,colonyBands:.48,cellScale:1.08,contourTightness:1.18,hueShift:.02,lightnessShift:.02,opacityMul:1.06,heightGain:.42,ridgeGain:.72,pitGain:.08,wetness:.14,scarStrength:.14,bulge:.16,rimPinch:.08,shear:.22,tiltX:.08,tiltY:-.04,curl:.16,depthBands:.34,frontBias:.42,seedSweep:.42,seedColumn:.16,seedTerrace:.12},corrosion_front:{feedAdd:-.003,killAdd:-.006,dtMul:1.08,warpMul:1.26,flowAniso:.94,diffusionA:1.08,diffusionB:.44,reactionBoost:1.16,poolMix:.14,colonyBands:.56,cellScale:.92,contourTightness:1.34,hueShift:-.02,lightnessShift:-.06,opacityMul:.98,heightGain:.18,ridgeGain:.34,pitGain:.56,wetness:.08,scarStrength:.42,bulge:.08,rimPinch:.34,shear:.12,tiltX:-.06,tiltY:.08,curl:.24,depthBands:.42,frontBias:.28,seedRing:.32,seedLedger:.08,seedSweep:.18,seedTerrace:.24},biofilm_skin:{feedAdd:-.004,killAdd:-.007,dtMul:.94,warpMul:.78,flowAniso:.7,diffusionA:.88,diffusionB:.58,reactionBoost:.92,poolMix:.72,colonyBands:.82,cellScale:1.64,contourTightness:1.24,hueShift:.05,lightnessShift:.08,opacityMul:1.08,heightGain:.46,ridgeGain:.26,pitGain:.12,wetness:.62,scarStrength:.16,bulge:.34,rimPinch:.18,shear:.06,tiltX:.04,tiltY:.04,curl:.1,depthBands:.28,frontBias:.12,seedRing:.14,seedCanopy:.34,seedBlob:.34}},se={feedAdd:0,killAdd:0,dtMul:1,warpMul:1,flowAniso:1,diffusionA:1,diffusionB:.5,reactionBoost:1,poolMix:.28,colonyBands:.34,cellScale:1,contourTightness:1,hueShift:0,lightnessShift:0,opacityMul:1,heightGain:.22,ridgeGain:.42,pitGain:.18,wetness:.18,scarStrength:.12,bulge:.18,rimPinch:.12,shear:.04,tiltX:0,tiltY:0,curl:.08,depthBands:.18,frontBias:.08,seedRing:.18,seedLedger:0,seedSweep:.12,seedCanopy:.08,seedColumn:0,seedTerrace:0,seedBlob:.12},b={bulgeAdd:0,rimPinchAdd:0,shearAdd:0,tiltXAdd:0,tiltYAdd:0,curlAdd:0,depthBandsAdd:0,frontBiasAdd:0,seedRingAdd:0,seedLedgerAdd:0,seedSweepAdd:0,seedCanopyAdd:0,seedColumnAdd:0,seedTerraceAdd:0,seedBlobAdd:0,hueShiftAdd:0,lightnessShiftAdd:0,opacityMul:1};function ie(e,s){return s===2?{color:e.layer2Color,spread:e.layer2SourceSpread,feed:e.layer2ReactionFeed,kill:e.layer2ReactionKill,scale:e.layer2ReactionScale,warp:e.layer2ReactionWarp,opacity:e.layer2ReactionOpacity,audioReactive:e.layer2ReactionAudioReactive}:{color:e.layer3Color,spread:e.layer3SourceSpread,feed:e.layer3ReactionFeed,kill:e.layer3ReactionKill,scale:e.layer3ReactionScale,warp:e.layer3ReactionWarp,opacity:e.layer3ReactionOpacity,audioReactive:e.layer3ReactionAudioReactive}}function ne(e){return{...se,...ae[e]??{}}}function le(e,s){return s===2?e.layer2Type:e.layer3Type}function ce(e,s){return s===2?e.layer2Source:e.layer3Source}function de(e){switch(e){case"text":return{...b,shearAdd:.16,tiltYAdd:.04,depthBandsAdd:.18,frontBiasAdd:.1,seedLedgerAdd:.72,seedTerraceAdd:.18,hueShiftAdd:.01,opacityMul:.98};case"grid":return{...b,rimPinchAdd:.08,shearAdd:.12,depthBandsAdd:.2,seedLedgerAdd:.26,seedColumnAdd:.16,seedTerraceAdd:.32,opacityMul:.99};case"plane":return{...b,bulgeAdd:.04,shearAdd:.08,depthBandsAdd:.12,seedTerraceAdd:.2,seedCanopyAdd:.12,lightnessShiftAdd:.02};case"ring":case"disc":case"torus":return{...b,rimPinchAdd:.14,curlAdd:.1,frontBiasAdd:.06,seedRingAdd:.52,seedSweepAdd:.14,hueShiftAdd:.01};case"spiral":case"galaxy":return{...b,shearAdd:.12,curlAdd:.22,tiltXAdd:.06,frontBiasAdd:.08,seedSweepAdd:.44,seedRingAdd:.18,lightnessShiftAdd:.02};case"image":case"video":return{...b,bulgeAdd:.08,tiltXAdd:.04,curlAdd:.06,seedBlobAdd:.42,seedCanopyAdd:.22,lightnessShiftAdd:.03,opacityMul:1.02};case"cube":case"cylinder":case"cone":return{...b,rimPinchAdd:.08,shearAdd:.1,tiltYAdd:.06,depthBandsAdd:.12,seedColumnAdd:.44,seedTerraceAdd:.12,opacityMul:.98};case"center":case"sphere":return{...b,bulgeAdd:.1,seedBlobAdd:.18,lightnessShiftAdd:.02};default:return b}}function ue(e,s){const o=de(s);return{...e,bulge:e.bulge+o.bulgeAdd,rimPinch:e.rimPinch+o.rimPinchAdd,shear:e.shear+o.shearAdd,tiltX:e.tiltX+o.tiltXAdd,tiltY:e.tiltY+o.tiltYAdd,curl:e.curl+o.curlAdd,depthBands:e.depthBands+o.depthBandsAdd,frontBias:e.frontBias+o.frontBiasAdd,seedRing:e.seedRing+o.seedRingAdd,seedLedger:e.seedLedger+o.seedLedgerAdd,seedSweep:e.seedSweep+o.seedSweepAdd,seedCanopy:e.seedCanopy+o.seedCanopyAdd,seedColumn:e.seedColumn+o.seedColumnAdd,seedTerrace:e.seedTerrace+o.seedTerraceAdd,seedBlob:e.seedBlob+o.seedBlobAdd,hueShift:e.hueShift+o.hueShiftAdd,lightnessShift:e.lightnessShift+o.lightnessShiftAdd,opacityMul:e.opacityMul*o.opacityMul}}function fe(e,s,o){const t={...e};switch(`${o}:${s}`){case"text:cellular_front":t.shear+=.08,t.depthBands+=.12,t.frontBias+=.12,t.seedLedger+=.18,t.seedTerrace+=.08;break;case"text:corrosion_front":t.rimPinch+=.08,t.seedLedger+=.14,t.seedTerrace+=.14,t.lightnessShift-=.02;break;case"grid:reaction_diffusion":t.depthBands+=.12,t.seedTerrace+=.16,t.seedColumn+=.08;break;case"ring:corrosion_front":case"torus:corrosion_front":t.rimPinch+=.12,t.curl+=.08,t.seedRing+=.18;break;case"disc:biofilm_skin":case"ring:biofilm_skin":t.bulge+=.12,t.seedRing+=.14,t.seedCanopy+=.1;break;case"spiral:cellular_front":case"galaxy:cellular_front":t.curl+=.1,t.shear+=.08,t.seedSweep+=.18;break;case"image:biofilm_skin":case"video:biofilm_skin":t.bulge+=.1,t.seedBlob+=.16,t.seedCanopy+=.12;break;case"plane:corrosion_front":t.shear+=.06,t.seedTerrace+=.16,t.frontBias+=.08;break;case"cylinder:cellular_front":case"cone:cellular_front":t.seedColumn+=.16,t.frontBias+=.1,t.tiltY+=.04;break}return t.bulge=l.clamp(t.bulge,0,.72),t.rimPinch=l.clamp(t.rimPinch,0,.72),t.shear=l.clamp(t.shear,-.6,.6),t.tiltX=l.clamp(t.tiltX,-.5,.5),t.tiltY=l.clamp(t.tiltY,-.5,.5),t.curl=l.clamp(t.curl,-.8,.8),t.depthBands=l.clamp(t.depthBands,0,.9),t.frontBias=l.clamp(t.frontBias,-.2,.7),t.seedRing=l.clamp(t.seedRing,0,1),t.seedLedger=l.clamp(t.seedLedger,0,1),t.seedSweep=l.clamp(t.seedSweep,0,1),t.seedCanopy=l.clamp(t.seedCanopy,0,1),t.seedColumn=l.clamp(t.seedColumn,0,1),t.seedTerrace=l.clamp(t.seedTerrace,0,1),t.seedBlob=l.clamp(t.seedBlob,0,1),t}function me(e,s){return fe(ue(ne(e),s),e,s)}function pe(e){return e-Math.floor(e)}function Y(e,s,o){const t=l.clamp((o-e)/(s-e),0,1);return t*t*(3-2*t)}function he(e,s,o,t){const A=new Float32Array(e*e*4),c=s==="biofilm_skin",B=s==="cellular_front",R=s==="corrosion_front";for(let v=0;v<e;v+=1)for(let r=0;r<e;r+=1){const g=(v*e+r)*4,n=r/e-.5,d=v/e-.5,i=Math.sqrt(n*n+d*d),a=Math.atan2(d,n),M=pe(Math.sin((r+1)*12.9898+(v+1)*78.233)*43758.5453123);let f=Math.exp(-i*18)+.55*Math.exp(-Math.pow(i-.18,2)*480)*(.6+.4*Math.sin(a*6));if(c){const C=.58+.42*Math.sin((n*5.2+d*3.6)*9)*Math.cos((d*5.8-n*3.2)*7),T=Math.exp(-Math.pow(i-.24,2)*220),S=.5+.5*Math.sin(a*8+i*28);f=Math.max(0,C*.42+T*(.6+S*.4)+Math.exp(-i*7)*.32+(M-.5)*.08)}else if(R){const C=.5+.5*Math.sin((n*6-d*4.8)*11)*Math.cos((d*5.4+n*2.7)*9),T=Math.exp(-Math.pow(i-.22,2)*180),S=.5+.5*Math.sin(a*10+i*22);f=Math.max(0,C*.34+T*(.45+S*.35)+Math.exp(-i*5.5)*.18+(M-.5)*.1)}const w=Math.exp(-Math.pow(i-(.18+t.seedRing*.18),2)*(180+t.seedRing*180)),P=(.5+.5*Math.sin((d+n*.1)*(18+t.seedLedger*56)))*t.seedLedger,u=(.5+.5*Math.sin(a*(4+t.seedSweep*8)+i*(12+t.seedSweep*18)))*t.seedSweep,_=Y(.42,-.48,d+Math.sin(n*8)*.08)*t.seedCanopy,G=Y(.32,.02,Math.abs(n+Math.sin(d*10)*.04))*t.seedColumn,y=(.5+.5*Math.sin(d*(8+t.seedTerrace*16)+Math.floor(n*8)*.4))*t.seedTerrace,k=(.5+.5*Math.sin((n*7+d*5)*6)*Math.cos((d*6-n*3)*5))*t.seedBlob,x=B?Y(-.5,.6,n+d*.15+u*.18):0,L=w*.24+P*.18+u*.2+_*.18+G*.18+y*.16+k*.18;o==="text"&&(f+=P*.24+y*.18),(o==="grid"||o==="plane")&&(f+=y*.24+G*.12),(o==="ring"||o==="disc"||o==="torus")&&(f+=w*.26+u*.12),(o==="spiral"||o==="galaxy")&&(f+=u*.28+w*.1),(o==="image"||o==="video")&&(f+=k*.24+_*.14),(o==="cube"||o==="cylinder"||o==="cone")&&(f+=G*.24+y*.1),B&&(f+=x*.2);const F=l.clamp(f+L+(M-.5)*(c?.05:.08),0,1);A[g+0]=1,A[g+1]=F,A[g+2]=0,A[g+3]=1}const m=new D(A,e,e,z,O);return m.needsUpdate=!0,m.wrapS=m.wrapT=j,m.minFilter=m.magFilter=E,m}const ve=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,ge=`
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D previousTexture;
  uniform vec2 texel;
  uniform float feed;
  uniform float kill;
  uniform float dA;
  uniform float dB;
  uniform float dt;
  uniform float time;
  uniform float warp;
  uniform float pulse;
  uniform float flowAniso;
  uniform float reactionBoost;

  vec2 sampleAB(vec2 uv) {
    return texture2D(previousTexture, uv).xy;
  }

  void main() {
    vec2 uv = vUv;
    vec2 flow = vec2(
      sin((uv.y + time * 0.05) * 12.0) * 0.5 + cos((uv.x - time * 0.03) * 9.0),
      cos((uv.x + time * 0.04) * 11.0) * 0.5 - sin((uv.y + time * 0.02) * 13.0)
    ) * texel * warp * (0.8 + pulse * 0.6);
    flow.x *= mix(1.0, 0.62, clamp(flowAniso, 0.0, 1.0));
    flow.y *= mix(1.0, 1.28, clamp(flowAniso, 0.0, 1.0));

    vec2 center = sampleAB(uv + flow);
    vec2 north = sampleAB(uv + vec2(0.0, texel.y) + flow);
    vec2 south = sampleAB(uv - vec2(0.0, texel.y) + flow);
    vec2 east = sampleAB(uv + vec2(texel.x, 0.0) + flow);
    vec2 west = sampleAB(uv - vec2(texel.x, 0.0) + flow);
    vec2 ne = sampleAB(uv + vec2(texel.x, texel.y) + flow);
    vec2 nw = sampleAB(uv + vec2(-texel.x, texel.y) + flow);
    vec2 se = sampleAB(uv + vec2(texel.x, -texel.y) + flow);
    vec2 sw = sampleAB(uv + vec2(-texel.x, -texel.y) + flow);

    vec2 lap = (north + south + east + west) * 0.2 + (ne + nw + se + sw) * 0.05 - center;
    float A = center.x;
    float B = center.y;
    float reaction = A * B * B * reactionBoost;
    float audioFeed = pulse * 0.006;
    float nextA = A + (dA * lap.x - reaction + (feed + audioFeed) * (1.0 - A)) * dt;
    float nextB = B + (dB * lap.y + reaction - (kill + feed + audioFeed * 0.35) * B) * dt;
    nextA = clamp(nextA, 0.0, 1.0);
    nextB = clamp(nextB, 0.0, 1.0);
    gl_FragColor = vec4(nextA, nextB, 0.0, 1.0);
  }
`,ye=`
  varying vec2 vUv;
  varying vec3 vWorld;
  varying vec3 vNormalDir;
  uniform float bulge;
  uniform float rimPinch;
  uniform float shear;
  uniform float tiltX;
  uniform float tiltY;
  uniform float curl;
  uniform float depthBands;
  uniform float frontBias;
  uniform float sourceOrbit;
  uniform float sourceLedger;
  uniform float sourceCanopy;
  uniform float sourceColumn;

  void main() {
    vUv = uv;
    vec3 pos = position;
    vec2 centered = uv - 0.5;
    vec2 ab = texture2D(reactionTexture, uv).xy;
    float radius = length(centered);
    float angle = atan(centered.y, centered.x);
    float front = smoothstep(-0.46, 0.62, centered.x + frontBias * 0.28 + centered.y * 0.08);
    float ring = smoothstep(0.12, 0.48, radius) * (1.0 - smoothstep(0.5, 0.72, radius));
    float canopy = smoothstep(0.88, -0.24, uv.y) * sourceCanopy;
    float ledger = sin((centered.y + centered.x * 0.1) * (10.0 + sourceLedger * 42.0)) * sourceLedger;
    float orbit = sin(angle * (3.0 + sourceOrbit * 4.0) + radius * (12.0 + sourceOrbit * 16.0)) * sourceOrbit;
    float column = smoothstep(0.34, 0.02, abs(centered.x + sin(centered.y * 12.0) * 0.04)) * sourceColumn;
    float bands = sin((centered.y - centered.x * 0.35 + front * 0.22) * (8.0 + depthBands * 18.0));
    float pattern = clamp(ab.y - ab.x * 0.35 + 0.5, 0.0, 1.0);
    float contour = smoothstep(0.18, 0.18 + 0.54 / max(0.2, contourTightness), pattern) - smoothstep(0.62, 0.96, pattern);
    float pool = smoothstep(0.54, 0.96, pattern);
    float ridges = contour * (0.45 + bands * 0.55) * ridgeGain;
    float pits = (1.0 - pool) * pitGain * (0.4 + ring * 0.6);
    float scars = abs(sin((centered.x - centered.y * 0.3) * 26.0 + orbit * 2.4)) * scarStrength * (0.2 + front * 0.8);
    float wetLift = pool * wetness * (0.35 + canopy * 0.65);
    float reactionHeight = (pattern - 0.5) * heightGain * 56.0 + ridges * 32.0 - pits * 24.0 + wetLift * 18.0 - scars * 10.0;

    pos.z += (1.0 - radius * 1.7) * bulge * 90.0;
    pos.z -= ring * rimPinch * 44.0;
    pos.z += bands * depthBands * 12.0;
    pos.z += reactionHeight;
    pos.z += orbit * 10.0 + canopy * 16.0 + column * 12.0 + ledger * 7.0;
    pos.x += centered.y * shear * 52.0 + orbit * 6.0 + ledger * 5.0 + scars * 4.0;
    pos.y += centered.x * curl * 46.0 + canopy * 14.0 + front * frontBias * 10.0 + wetLift * 6.0;

    float cosX = cos(tiltX);
    float sinX = sin(tiltX);
    vec2 yz = mat2(cosX, -sinX, sinX, cosX) * vec2(pos.y, pos.z);
    pos.y = yz.x;
    pos.z = yz.y;

    float cosY = cos(tiltY);
    float sinY = sin(tiltY);
    vec2 xz = mat2(cosY, sinY, -sinY, cosY) * vec2(pos.x, pos.z);
    pos.x = xz.x;
    pos.z = xz.y;

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vWorld = world.xyz;
    vNormalDir = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`,xe=`
  precision highp float;
  varying vec2 vUv;
  varying vec3 vWorld;
  varying vec3 vNormalDir;
  uniform sampler2D reactionTexture;
  uniform vec3 baseColor;
  uniform float opacity;
  uniform float time;
  uniform float audioReactive;
  uniform float pulse;
  uniform float poolMix;
  uniform float colonyBands;
  uniform float cellScale;
  uniform float contourTightness;
  uniform float hueShift;
  uniform float lightnessShift;
  uniform float ridgeGain;
  uniform float pitGain;
  uniform float wetness;
  uniform float scarStrength;

  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0., -1./3., 2./3., -1.);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6. * d + e)), d / (q.x + e), q.x);
  }

  vec3 hsv2rgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + vec3(0., 1./3., 2./3.)) * 6. - 3.);
    return c.z * mix(vec3(1.), clamp(p - 1., 0., 1.), c.y);
  }

  void main() {
    vec2 ab = texture2D(reactionTexture, vUv).xy;
    float cell = 0.5 + 0.5 * sin((vUv.x + vUv.y) * 24.0 * cellScale + time * 0.08);
    float pattern = clamp(ab.y - ab.x * 0.35 + 0.5, 0.0, 1.0);
    float contour = smoothstep(0.2, 0.2 + 0.6 / contourTightness, pattern) - smoothstep(0.62, 0.98, pattern);
    float pool = smoothstep(0.52, 0.96, pattern + cell * poolMix * 0.22);
    float bands = 0.5 + 0.5 * sin((vUv.y - vUv.x * 0.4 + time * 0.02) * 36.0 * colonyBands);
    float shimmer = sin((vUv.x + vUv.y + time * 0.08) * 48.0) * 0.5 + 0.5;
    float pits = smoothstep(0.04, 0.42 + pitGain * 0.3, 1.0 - pattern) * pitGain;
    float scars = abs(sin((vUv.x - vUv.y * 0.3 + time * 0.01) * 42.0)) * scarStrength * (0.2 + bands * 0.8);
    float wetMask = pool * wetness;
    float edge = pow(1.0 - abs(dot(normalize(cameraPosition - vWorld), normalize(vNormalDir))), 2.2);
    vec3 accent = mix(baseColor * 0.3, vec3(1.0), contour * (0.46 + ridgeGain * 0.28) + shimmer * 0.18 + pulse * audioReactive * 0.25);
    vec3 color = mix(baseColor * 0.08, accent, smoothstep(0.08, 0.92, pattern));
    color = mix(color, color * (0.76 + bands * 0.36), colonyBands * 0.4);
    color = mix(color, color + vec3(0.12, 0.18, 0.06) * pool, poolMix * 0.5);
    color = mix(color, color * (0.68 + pits * 0.34) + vec3(0.04, 0.025, 0.015) * pits, pitGain * 0.58);
    color = mix(color, color + vec3(0.08, 0.12, 0.14) * wetMask + vec3(1.0) * wetMask * edge * 0.12, wetness * 0.62);
    color = mix(color, color * (0.82 + scars * 0.18), scarStrength * 0.45);
    vec3 hsv = rgb2hsv(clamp(color, 0.0, 1.0));
    hsv.x = fract(hsv.x + hueShift);
    hsv.z = clamp(hsv.z + lightnessShift, 0.0, 1.0);
    color = hsv2rgb(hsv);
    float alpha = clamp(opacity * (0.24 + contour * (1.02 + ridgeGain * 0.3) + edge * (0.46 + wetness * 0.18) + pool * poolMix * 0.2 - pits * 0.12), 0.0, 1.0);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;function Ae({config:e,layerIndex:s,audioRef:o,isPlaying:t}){const{gl:c}=Z(),B=U(256),R=U(256),m=le(e,s),v=ce(e,s),r=p.useMemo(()=>me(m,v),[m,v]),g=p.useMemo(()=>he(256,m,v,r),[m,r,v]),n=p.useMemo(()=>new q,[]),d=p.useMemo(()=>new W(-1,1,1,-1,0,1),[]),i=p.useMemo(()=>new X({uniforms:{previousTexture:{value:g},texel:{value:new I(1/256,1/256)},feed:{value:.037},kill:{value:.062},dA:{value:1},dB:{value:.5},dt:{value:1},time:{value:0},warp:{value:.3},pulse:{value:0},flowAniso:{value:1},reactionBoost:{value:1}},vertexShader:ve,fragmentShader:ge}),[g]),a=p.useMemo(()=>new X({uniforms:{reactionTexture:{value:B.texture},baseColor:{value:new K("#ffffff")},opacity:{value:.8},time:{value:0},audioReactive:{value:.35},pulse:{value:0},poolMix:{value:.28},colonyBands:{value:.34},cellScale:{value:1},contourTightness:{value:1},hueShift:{value:0},lightnessShift:{value:0},heightGain:{value:.22},ridgeGain:{value:.42},pitGain:{value:.18},wetness:{value:.18},scarStrength:{value:.12},bulge:{value:.18},rimPinch:{value:.12},shear:{value:.04},tiltX:{value:0},tiltY:{value:0},curl:{value:.08},depthBands:{value:.18},frontBias:{value:.08},sourceOrbit:{value:0},sourceLedger:{value:0},sourceCanopy:{value:0},sourceColumn:{value:0}},transparent:!0,depthWrite:!1,side:N,vertexShader:ye,fragmentShader:xe}),[B.texture]),M=p.useMemo(()=>{const y=new V(new H(2,2),i);return n.add(y),y},[i,n]),f=p.useRef(!1),w=p.useRef({current:B,next:R}),P=p.useRef($()),u=ie(e,s);p.useEffect(()=>{f.current=!1},[g,m,v]),p.useEffect(()=>{if(f.current)return;const y=c.getRenderTarget();c.setRenderTarget(B),c.clear(),i.uniforms.previousTexture.value=g,c.render(n,d),c.setRenderTarget(R),c.clear(),i.uniforms.previousTexture.value=B.texture,c.render(n,d),c.setRenderTarget(y),w.current={current:B,next:R},f.current=!0},[c,m,B,R,g,d,i,n,v]),p.useEffect(()=>{a.uniforms.baseColor.value.set(u.color),a.uniforms.opacity.value=u.opacity*r.opacityMul,a.uniforms.audioReactive.value=u.audioReactive,a.uniforms.poolMix.value=r.poolMix,a.uniforms.colonyBands.value=r.colonyBands,a.uniforms.cellScale.value=r.cellScale,a.uniforms.contourTightness.value=r.contourTightness,a.uniforms.hueShift.value=r.hueShift,a.uniforms.lightnessShift.value=r.lightnessShift,a.uniforms.heightGain.value=r.heightGain,a.uniforms.ridgeGain.value=r.ridgeGain,a.uniforms.pitGain.value=r.pitGain,a.uniforms.wetness.value=r.wetness,a.uniforms.scarStrength.value=r.scarStrength,a.uniforms.bulge.value=r.bulge,a.uniforms.rimPinch.value=r.rimPinch,a.uniforms.shear.value=r.shear,a.uniforms.tiltX.value=r.tiltX,a.uniforms.tiltY.value=r.tiltY,a.uniforms.curl.value=r.curl,a.uniforms.depthBands.value=r.depthBands,a.uniforms.frontBias.value=r.frontBias,a.uniforms.sourceOrbit.value=l.clamp(r.seedRing*.72+r.seedSweep*.34,0,1),a.uniforms.sourceLedger.value=l.clamp(r.seedLedger,0,1),a.uniforms.sourceCanopy.value=l.clamp(r.seedCanopy*.86+r.seedBlob*.24,0,1),a.uniforms.sourceColumn.value=l.clamp(r.seedColumn*.92+r.seedTerrace*.18,0,1)},[a,u.audioReactive,u.color,u.opacity,r]),ee(({clock:y})=>{if(!f.current)return;const k=Q(e,o.current,P.current),x=J(k,"reactionField"),L=e.audioEnabled?o.current.pulse*e.audioBurstScale+o.current.bass*e.audioBeatScale*.5:0;i.uniforms.feed.value=u.feed+r.feedAdd+x.feed,i.uniforms.kill.value=u.kill+r.killAdd+x.kill,i.uniforms.dA.value=r.diffusionA,i.uniforms.dB.value=r.diffusionB,i.uniforms.dt.value=r.dtMul,i.uniforms.warp.value=Math.max(0,(u.warp+x.warp*.4)*r.warpMul),i.uniforms.flowAniso.value=r.flowAniso,i.uniforms.reactionBoost.value=r.reactionBoost,i.uniforms.time.value=y.elapsedTime,i.uniforms.pulse.value=L*(u.audioReactive+x.relief*.35),a.uniforms.time.value=y.elapsedTime,a.uniforms.pulse.value=L,a.uniforms.opacity.value=l.clamp(u.opacity*r.opacityMul+x.opacity*.25,.04,1.35),a.uniforms.heightGain.value=r.heightGain+x.relief*.08,a.uniforms.ridgeGain.value=r.ridgeGain+x.relief*.12,a.uniforms.pitGain.value=r.pitGain+x.relief*.08,a.uniforms.bulge.value=r.bulge+x.relief*.08,a.uniforms.depthBands.value=r.depthBands+x.relief*.12;const F=t?2:1,C=c.getRenderTarget();for(let T=0;T<F;T+=1){const S=w.current;i.uniforms.previousTexture.value=S.current.texture,c.setRenderTarget(S.next),c.render(n,d),w.current={current:S.next,next:S.current}}c.setRenderTarget(C),a.uniforms.reactionTexture.value=w.current.current.texture}),p.useEffect(()=>()=>{n.remove(M),M.geometry.dispose(),i.dispose(),a.dispose(),g.dispose()},[a,g,i,M,n]);const _=Math.max(e.sphereRadius*1.55,u.spread*1.45,180)*Math.max(.6,u.scale),G=e.sphereRadius*(s===2?-.58:.58);return{displayMaterial:a,planeSize:_,zOffset:G,mode:m,source:v}}const Ke=e=>{const{displayMaterial:s,planeSize:o,zOffset:t,mode:A,source:c}=Ae(e);return h.jsx(re,{displayMaterial:s,planeSize:o,zOffset:t,mode:A,source:c})};export{Ke as ReactionDiffusionSystem};
