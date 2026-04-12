import{k as S,j as w,r as D}from"./react-vendor-BLE9nPfI.js";import{c as pe,e as H,r as M}from"./scene-overlay-core-C1hZwqg3.js";import{c as q,ag as ve,ab as z,ac as j,H as ye,D as Me,n as he,h as R,I as ge}from"./three-core-CZYXVIXO.js";import{h as Ae,i as Se,d as Z,j as we}from"./scene-family-surface-BwkC97K9.js";import"./scene-runtime-motion-B_7blSTV.js";import{E as xe,v as Fe}from"./scene-runtime-catalog-DTxoSzGh.js";import"./starter-library-extensions-C1PjFcNY.js";import"./scene-future-native-bridges-9yzG2U64.js";import{a as Te,u as $}from"./r3f-fiber-CBj7iv8R.js";const _e={sliceMul:1,opacityMul:1,opacityAdd:0,densityMul:1,scaleMul:1,driftMul:1,driftAdd:0,glowMul:1,glowAdd:0,anisotropyAdd:0,planeScaleMul:1,depthMul:1,streak:.12,grain:.08,swirl:.12,verticalBias:0,coreTightness:.2,pulseNoise:.16,ember:0,plumeAmount:0,fallAmount:0,mirageAmount:0,staticAmount:0,dustAmount:0,sootAmount:0,runeAmount:0,velvetAmount:0,ledgerAmount:0,edgeFade:.22,blending:"additive"},be={dust_plume:{sliceMul:.78,opacityMul:.86,densityMul:1.3,scaleMul:.88,driftMul:1.42,driftAdd:.08,glowMul:.62,anisotropyAdd:.32,planeScaleMul:.92,streak:.24,grain:.3,swirl:.1,verticalBias:.34,coreTightness:.42,pulseNoise:.12,plumeAmount:.86,dustAmount:.82,edgeFade:.36,blending:"normal"},ashfall:{sliceMul:.68,opacityMul:.72,densityMul:1.42,scaleMul:.92,driftMul:.74,driftAdd:-.12,glowMul:.44,planeScaleMul:.9,streak:.3,grain:.58,swirl:.02,verticalBias:-.86,coreTightness:.34,pulseNoise:.14,fallAmount:.94,dustAmount:.68,edgeFade:.28,blending:"normal"},vapor_canopy:{sliceMul:1.18,opacityMul:.86,densityMul:1.08,scaleMul:1.22,glowMul:.82,anisotropyAdd:.28,planeScaleMul:1.16,depthMul:1.18,streak:.06,grain:.1,swirl:.18,verticalBias:.82,coreTightness:.12,pulseNoise:.2},ember_swarm:{sliceMul:.94,opacityMul:.84,densityMul:.92,driftMul:1.28,driftAdd:.08,glowMul:1.28,glowAdd:.1,planeScaleMul:.94,streak:.18,grain:.3,swirl:.28,verticalBias:.44,coreTightness:.24,pulseNoise:.28,ember:.48},soot_veil:{sliceMul:1.12,opacityMul:.46,densityMul:1.5,scaleMul:.72,driftMul:.34,driftAdd:-.12,glowMul:.32,glowAdd:.01,anisotropyAdd:.02,planeScaleMul:.88,streak:.12,grain:.74,swirl:.06,verticalBias:-.08,coreTightness:.54,pulseNoise:.08,dustAmount:.26,sootAmount:.96,ledgerAmount:.74,edgeFade:.18,blending:"normal"},foam_drift:{sliceMul:1.18,opacityMul:.94,densityMul:1.08,scaleMul:1.34,driftMul:1.76,driftAdd:.22,glowMul:.92,glowAdd:.08,anisotropyAdd:.58,planeScaleMul:1.18,depthMul:1.06,streak:.04,grain:.1,swirl:.34,verticalBias:.3,coreTightness:.08,pulseNoise:.22},charge_veil:{sliceMul:.92,opacityMul:.76,densityMul:1.16,scaleMul:.78,driftMul:1.6,driftAdd:.24,glowMul:1.52,glowAdd:.22,anisotropyAdd:.84,planeScaleMul:.96,streak:.92,grain:.18,swirl:.48,verticalBias:-.22,coreTightness:.42,pulseNoise:.46},prism_smoke:{sliceMul:1.22,opacityMul:.9,densityMul:1.3,scaleMul:1.2,driftMul:.86,driftAdd:.02,glowMul:1.34,glowAdd:.16,anisotropyAdd:.4,planeScaleMul:1.08,depthMul:1.08,streak:.2,grain:.08,swirl:.34,verticalBias:.08,coreTightness:.24,pulseNoise:.26},rune_smoke:{sliceMul:.82,opacityMul:.66,densityMul:1.42,scaleMul:.8,driftMul:.62,driftAdd:-.04,glowMul:.84,glowAdd:.24,anisotropyAdd:.14,planeScaleMul:.94,streak:.28,grain:.42,swirl:.1,verticalBias:.02,coreTightness:.46,pulseNoise:.52,runeAmount:.94,ledgerAmount:.36,edgeFade:.2,blending:"normal"},mirage_smoke:{sliceMul:1.28,opacityMul:.56,densityMul:.78,scaleMul:1.34,driftMul:1.82,driftAdd:.24,glowMul:.7,glowAdd:.06,anisotropyAdd:.72,planeScaleMul:1.26,depthMul:1.24,streak:.06,grain:.04,swirl:.92,verticalBias:.22,coreTightness:.03,pulseNoise:.12,mirageAmount:.94,edgeFade:.18},ion_rain:{sliceMul:.9,opacityMul:.72,opacityAdd:.04,densityMul:1.18,scaleMul:.74,driftMul:1.84,driftAdd:.3,glowMul:1.46,glowAdd:.26,anisotropyAdd:.96,planeScaleMul:.98,depthMul:1.08,streak:1,grain:.18,swirl:.1,verticalBias:-1,coreTightness:.52,pulseNoise:.36},velvet_ash:{sliceMul:1.08,opacityMul:.98,opacityAdd:.04,densityMul:1.42,scaleMul:.9,driftMul:.56,driftAdd:-.02,glowMul:.38,anisotropyAdd:.12,planeScaleMul:1.02,depthMul:.92,streak:.08,grain:.16,swirl:.08,verticalBias:-.18,coreTightness:.8,pulseNoise:.08,sootAmount:.22,velvetAmount:.96,ledgerAmount:.52,edgeFade:.26,blending:"normal"},static_smoke:{sliceMul:1.1,opacityMul:.8,densityMul:1.28,scaleMul:.82,driftMul:.34,glowMul:.24,anisotropyAdd:.06,planeScaleMul:1.04,depthMul:.96,streak:.74,grain:1,swirl:.02,verticalBias:0,coreTightness:.46,pulseNoise:1,staticAmount:.96,dustAmount:.18,edgeFade:.14,blending:"normal"},ember_drift:{sliceMul:.94,opacityMul:.9,densityMul:1.04,scaleMul:1.04,driftMul:1.3,driftAdd:.16,glowMul:1.24,glowAdd:.14,planeScaleMul:.98,streak:.24,grain:.28,swirl:.22,verticalBias:.58,coreTightness:.2,pulseNoise:.34,ember:.74},condense_field:{sliceMul:.86,opacityMul:.82,densityMul:1.52,scaleMul:.84,driftMul:.58,driftAdd:-.04,glowMul:.64,glowAdd:.04,anisotropyAdd:.18,planeScaleMul:.92,depthMul:.88,streak:.1,grain:.22,swirl:.08,verticalBias:-.26,coreTightness:.82,pulseNoise:.1,plumeAmount:.18,dustAmount:.08,velvetAmount:.22,ledgerAmount:.18,edgeFade:.24,blending:"normal"},sublimate_cloud:{sliceMul:1.22,opacityMul:.52,densityMul:.72,scaleMul:1.24,driftMul:1.46,driftAdd:.22,glowMul:.94,glowAdd:.1,anisotropyAdd:.54,planeScaleMul:1.08,depthMul:1.22,streak:.06,grain:.12,swirl:.42,verticalBias:.68,coreTightness:.06,pulseNoise:.2,mirageAmount:.26,staticAmount:.06,dustAmount:.12,edgeFade:.12,blending:"additive"}};function De(e){return{..._e,...be[e]??{}}}function Pe(e){return e-Math.floor(e)}function k(e){return Pe(Math.sin(e*127.13+19.37)*43758.5453123)}function C(e){return k(e)*2-1}function Be(e,a,i,s,p){const v=i>1?a/(i-1)-.5:0,o=i>1?a/(i-1):0,c=a+1,u={x:0,y:0,rotX:0,rotY:0,rotZ:0,scaleX:1,scaleY:1};if(e==="text"||e==="grid"){const l=Math.max(2,Math.round(Math.sqrt(i))),n=a%l-(l-1)*.5,t=Math.floor(a/l)-Math.floor(i/l)*.5;u.x+=n*s*.06,u.y+=t*s*.045,u.scaleY*=.86}else if(e==="ring"||e==="disc"||e==="torus"){const l=o*Math.PI*2+p*.08;u.x+=Math.cos(l)*s*.12,u.y+=Math.sin(l)*s*.06,u.rotZ+=l*.12,u.scaleX*=1.06}else if(e==="spiral"||e==="galaxy"){const l=o*Math.PI*3.6+p*.18,n=s*(.05+o*.16);u.x+=Math.cos(l)*n,u.y+=Math.sin(l*.72)*n*.8,u.rotZ+=l*.18,u.scaleX*=.96,u.scaleY*=1.08}else e==="image"||e==="video"?(u.y+=Math.sin(p*.22+c*.4)*s*.035,u.rotX+=.05+C(c+2.4)*.03,u.scaleX*=1.08,u.scaleY*=.94):e==="cube"||e==="cylinder"||e==="cone"?(u.y+=v*s*.08,u.rotY+=v*.18,u.scaleX*=.9,u.scaleY*=1.14):e==="plane"&&(u.rotX+=.08,u.scaleX*=1.12,u.scaleY*=.82);return u}function J(e,a,i,s,p,v,o,c){const u=s<=1?0:i/(s-1),l=u-.5,n=i*17.13+.37,t=new q(0,0,p),m=new ve(0,0,0),f=new q(1,1,1);if(e==="dust_plume")t.x+=Math.sin(c*.22+n)*o*.04,t.y+=(u*.95-.2)*o*.28,f.set(.62,1.4+u*.55,1);else if(e==="ashfall")t.x+=C(n)*o*.06,t.y-=u*o*.44,m.z=C(n+1.2)*.16,f.set(.3+k(n+2.1)*.14,1.55,1);else if(e==="vapor_canopy"){const r=l*Math.PI*1.25;t.x=Math.sin(r)*o*.32,t.y=o*(.16+Math.cos(r)*.12),m.z=-r*.35,f.set(.84,1.26,1)}else if(e==="ember_swarm"||e==="ember_drift"){const r=c*.18+n*.27+u*Math.PI*2;t.x+=Math.cos(r)*o*.18*(.4+u),t.y+=Math.sin(r*1.3)*o*.12+l*o*.18,m.z=r*.2,f.set(.56,.9+k(n+3.4)*.4,1)}else if(e==="soot_veil"||e==="velvet_ash")t.x+=l*o*.16,t.y-=Math.abs(l)*o*.12+u*o*.08,m.z=l*.2,f.set(.72,1.18+Math.abs(l)*.36,1);else if(e==="foam_drift"){const r=c*.24+n*.22;t.x+=Math.cos(r)*o*.14,t.y+=Math.sin(r*.8)*o*.1,f.set(1.1,.82,1)}else if(e==="charge_veil")t.x+=C(n+3.7)*o*.08,t.y+=l*o*.1,m.z=Math.sin(c*.8+n)*.28,f.set(.42,1.34,1);else if(e==="prism_smoke"){const r=l*Math.PI*1.8;t.x+=Math.sin(r)*o*.24,t.y+=Math.cos(r*.5)*o*.08,m.z=r*.22,f.set(.78,1.08,1)}else if(e==="rune_smoke"||e==="static_smoke"){const r=i%4-1.5,y=Math.floor(i/4)-Math.floor(s/8);t.x=r*o*.12,t.y=y*o*.08,f.set(.54,.54+k(n+2.6)*.32,1)}else if(e==="mirage_smoke")t.x+=l*o*.3,t.y=-o*.12+Math.sin(c*.3+n)*o*.02,m.x=.18,f.set(1.28,.34,1);else if(e==="ion_rain"){const r=i%6-2.5;t.x=r*o*.08+Math.sin(c*.5+n)*o*.02,t.y=-u*o*.28,f.set(.22,1.62,1)}else if(e==="vortex_transport"){const r=c*.28+u*Math.PI*2.4;t.x+=Math.cos(r)*o*.2*(.4+u),t.y+=l*o*.22,m.z=r*.3,f.set(.52,1.22,1)}else if(e==="pressure_cells"){const r=Math.max(2,Math.round(Math.sqrt(s))),y=i%r-(r-1)*.5,P=Math.floor(i/r)-Math.floor(s/r)*.5;t.x=y*o*.14,t.y=P*o*.12,f.set(.62,.62,1)}else e==="condense_field"?(t.x+=l*o*.1,t.y-=Math.abs(l)*o*.16,f.set(.66,.88+(1-Math.abs(l)*1.8)*.38,1)):e==="sublimate_cloud"&&(t.x+=l*o*.12,t.y+=u*o*.24,f.set(1.02+u*.22,.7,1));const d=Be(a,i,s,o,c);return t.x+=d.x,t.y+=d.y,m.x+=d.rotX,m.y+=d.rotY,m.z+=d.rotZ,f.x*=d.scaleX,f.y*=d.scaleY,v>0&&(f.x*=v,f.y*=v),{position:t,rotation:m,scale:f}}const Ee=`
  varying vec2 vUv;
  varying float vSlice;
  void main() {
    vUv = uv;
    vSlice = position.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,ke=`
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uDensity;
  uniform float uScale;
  uniform float uDrift;
  uniform float uAudio;
  uniform float uSliceIndex;
  uniform float uSliceCount;
  uniform float uMaterialStyle;
  uniform float uGlow;
  uniform float uAnisotropy;
  uniform float uStreak;
  uniform float uGrain;
  uniform float uSwirl;
  uniform float uVerticalBias;
  uniform float uCoreTightness;
  uniform float uPulseNoise;
  uniform float uEmber;
  uniform float uPlumeAmount;
  uniform float uFallAmount;
  uniform float uMirageAmount;
  uniform float uStaticAmount;
  uniform float uDustAmount;
  uniform float uSootAmount;
  uniform float uRuneAmount;
  uniform float uVelvetAmount;
  uniform float uLedgerAmount;
  uniform float uEdgeFade;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amp * noise(p);
      p = p * 2.03 + vec2(17.2, 9.4);
      amp *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float radius = length(uv);
    float sliceT = uSliceCount > 1.0 ? uSliceIndex / max(1.0, uSliceCount - 1.0) : 0.0;
    vec2 drift = vec2(uTime * 0.035 * uDrift, -uTime * 0.022 * uDrift + sliceT * 0.37);
    float n1 = fbm(uv * (1.2 + uScale * 0.45) + drift + vec2(sliceT * 1.7, 0.0));
    float n2 = fbm(uv.yx * (2.4 + uScale) - drift * 1.35 + vec2(0.0, sliceT * 2.1));
    float pulseNoise = fbm(uv * (1.8 + uPulseNoise * 2.6) - drift * (0.7 + uPulseNoise) + vec2(0.0, sliceT * 4.3));
    float theta = atan(uv.y, uv.x);
    float swirlWave = sin(theta * (2.0 + uSwirl * 8.0) + radius * (1.6 + uSwirl * 5.0) - uTime * (0.2 + uSwirl * 2.0) + sliceT * 5.0);
    float plumeColumn = smoothstep(1.08, 0.18, abs(uv.x) * (1.0 + uPlumeAmount * 2.8) + max(0.0, -uv.y) * (0.22 + uPlumeAmount * 0.44));
    plumeColumn *= smoothstep(-0.92, 0.52 + uPlumeAmount * 0.34, uv.y + n1 * 0.12);
    float fallLines = pow(abs(sin((uv.x * (10.0 + uFallAmount * 34.0) + drift.y * 3.6) * 3.14159)), mix(5.0, 18.0, clamp(uFallAmount, 0.0, 1.0)));
    float mirageLine = sin((uv.y * (18.0 + uMirageAmount * 44.0) + n1 * 5.0 + uTime * (1.4 + uMirageAmount * 3.2)) + sliceT * 8.0) * 0.5 + 0.5;
    float staticScan = sin((uv.y * (40.0 + uStaticAmount * 120.0) + sliceT * 32.0) + uTime * (4.0 + uStaticAmount * 12.0)) * 0.5 + 0.5;
    float staticBlocks = step(0.58 - uStaticAmount * 0.22, noise(floor((uv + 1.0) * (8.0 + uStaticAmount * 18.0)) + vec2(sliceT * 6.0, floor(uTime * 8.0))));
    float dustField = noise(uv * (12.0 + uDustAmount * 28.0) + vec2(sliceT * 19.0, uTime * 0.18));
    float dustMotes = smoothstep(0.78, 0.97, dustField) * smoothstep(1.08, 0.12, radius);
    float ledgerBands = sin((uv.y * (7.0 + uLedgerAmount * 21.0) + sliceT * 9.0) + n1 * (0.6 + uLedgerAmount * 1.8));
    float ledgerMask = 1.0 - smoothstep(0.22, 0.82 - uLedgerAmount * 0.24, abs(ledgerBands));
    vec2 runeUv = (uv + vec2(n1 * 0.08, n2 * 0.08) + drift * 0.06) * (8.0 + uRuneAmount * 24.0);
    vec2 runeCell = abs(fract(runeUv) - 0.5);
    float runeCross = 1.0 - smoothstep(0.05, 0.18, min(runeCell.x, runeCell.y));
    float runeGate = step(0.46 - uRuneAmount * 0.14, noise(floor(runeUv) + vec2(sliceT * 8.0, floor(uTime * 2.0))));
    float runePattern = runeCross * runeGate;
    float velvetField = smoothstep(0.08, 0.9, fbm(uv * (3.2 + uVelvetAmount * 5.6) - drift * 0.22 + vec2(0.0, sliceT * 2.0)));
    float wisps = smoothstep(0.34, 0.88, mix(n1, n2, 0.45 + uAudio * 0.08));
    wisps = mix(wisps, wisps * (0.84 + swirlWave * 0.16) + pulseNoise * 0.22, clamp(uSwirl * 0.65 + uPulseNoise * 0.25, 0.0, 1.0));
    wisps = mix(wisps, wisps * (0.86 + (mirageLine - 0.5) * 0.24), clamp(uMirageAmount, 0.0, 1.0));
    float coreEdge = mix(0.3, 0.1, clamp(uCoreTightness, 0.0, 1.0));
    float core = smoothstep(1.18, coreEdge, radius + (0.28 - wisps * 0.22));
    float veil = smoothstep(1.35, 0.3, radius) * wisps;
    float band = sin((uv.y + sliceT * 2.5 + uTime * 0.07) * 7.0) * 0.5 + 0.5;
    float forward = pow(max(0.0, 1.0 - radius), 1.2 + uAnisotropy * 2.2);
    float streak = pow(abs(sin((uv.x * (3.0 + uStreak * 12.0) + drift.x * 2.4) * 3.14159 + sliceT * 10.0)), mix(4.0, 18.0, clamp(uStreak, 0.0, 1.0)));
    float grain = noise(uv * (26.0 + uGrain * 44.0) + vec2(sliceT * 31.0, uTime * 0.45));
    float anisotropicLift = mix(1.0, 1.0 + forward * 1.8, clamp(uAnisotropy, 0.0, 2.0));
    float alpha = (core * 0.6 + veil * 0.85) * mix(0.6, 1.0, band * 0.25 + 0.75);
    alpha += streak * uStreak * (0.08 + (1.0 - radius) * 0.18);
    alpha += plumeColumn * uPlumeAmount * 0.22;
    alpha += fallLines * uFallAmount * (0.06 + (1.0 - radius) * 0.12);
    alpha += dustMotes * uDustAmount * 0.16;
    alpha += staticScan * staticBlocks * uStaticAmount * 0.18;
    alpha += ledgerMask * uLedgerAmount * 0.14;
    alpha += runePattern * uRuneAmount * 0.16;
    alpha *= (0.28 + uDensity * 1.35) * (0.78 + uAudio * 0.3) * anisotropicLift;
    alpha *= smoothstep(1.08, 0.12 + uEdgeFade * 0.26, radius);
    alpha *= smoothstep(0.0, 0.18, sliceT + 0.02) * smoothstep(0.0, 0.18, 1.02 - sliceT);
    alpha *= 0.92 + mix(-0.18, 0.2, grain) * uGrain;
    alpha *= mix(1.0, 0.8 + velvetField * 0.24, clamp(uVelvetAmount, 0.0, 1.0));
    alpha *= mix(1.0, 0.84 + ledgerMask * 0.2, clamp(uSootAmount + uLedgerAmount * 0.4, 0.0, 1.0));
    if (uVerticalBias > 0.001) {
      float upward = clamp(0.45 + (uv.y + 1.0) * (0.34 + uVerticalBias * 0.4), 0.06, 1.5);
      alpha *= mix(1.0, upward, min(1.0, uVerticalBias * 0.65));
    } else if (uVerticalBias < -0.001) {
      float downward = clamp(0.45 + (1.0 - (uv.y + 1.0) * 0.5) * (0.5 + abs(uVerticalBias) * 0.7), 0.06, 1.6);
      alpha *= mix(1.0, downward, min(1.0, abs(uVerticalBias) * 0.65));
    }
    if (alpha <= 0.003) discard;
    vec3 color = uColor * (0.55 + wisps * 0.95 + uAudio * 0.1);
    color += uColor * (0.08 + 0.28 * uGlow) * forward;
    color += vec3(1.0, 0.42, 0.12) * (streak * uEmber * 0.18 + pulseNoise * uEmber * 0.08);
    color = mix(color, vec3(dot(color, vec3(0.299, 0.587, 0.114))), clamp(uDustAmount * 0.34 + uFallAmount * 0.18, 0.0, 0.72));
    color += vec3(0.24, 0.42, 0.5) * (mirageLine - 0.5) * uMirageAmount * 0.22;
    color = mix(color, color * (0.42 + ledgerMask * 0.18) + vec3(0.16, 0.12, 0.09) * 0.22, clamp(uSootAmount, 0.0, 1.0));
    color += vec3(0.9, 0.84, 0.72) * ledgerMask * uLedgerAmount * 0.06;
    color += vec3(0.7, 0.9, 1.0) * runePattern * uRuneAmount * (0.08 + uGlow * 0.04);
    color = mix(color, color * (0.68 + velvetField * 0.16) + vec3(dot(color, vec3(0.299, 0.587, 0.114))) * 0.22, clamp(uVelvetAmount, 0.0, 1.0));
    color = mix(color, color * 0.78 + vec3(0.38, 0.48, 0.72) * 0.12, clamp(uStaticAmount * 0.58, 0.0, 0.58));
    color += vec3(0.88, 0.9, 1.0) * staticScan * staticBlocks * uStaticAmount * 0.08;
    if (uMaterialStyle > 0.5 && uMaterialStyle < 1.5) {
      color = mix(color, vec3(0.92, 0.97, 1.0), 0.22 + wisps * 0.08 + uGlow * 0.06);
      color += vec3(0.65, 0.78, 1.0) * forward * (0.1 + uGlow * 0.22);
      alpha *= 0.74;
    } else if (uMaterialStyle > 1.5 && uMaterialStyle < 2.5) {
      float holo = 0.5 + 0.5 * sin((uv.y + sliceT * 1.4) * 90.0 + uTime * 4.0);
      color = mix(color, vec3(0.18, 0.9, 1.0), 0.38);
      color += vec3(0.1, 0.75, 1.0) * holo * (0.18 + uGlow * 0.12);
      alpha *= 0.92 + uGlow * 0.08;
    } else if (uMaterialStyle > 2.5 && uMaterialStyle < 3.5) {
      float metalBand = 0.5 + 0.5 * sin((uv.x - uv.y + sliceT) * 18.0);
      color = mix(vec3(0.2, 0.22, 0.25), vec3(0.95), metalBand * 0.75);
      color *= mix(uColor, vec3(1.0), 0.3);
      color += vec3(1.0) * forward * (0.05 + uGlow * 0.08);
    } else if (uMaterialStyle > 3.5) {
      vec2 cell = fract(vUv * 18.0) - 0.5;
      float dots = 1.0 - smoothstep(0.06, 0.28, length(cell));
      alpha *= mix(0.38, 1.0, dots);
      color *= 0.45 + dots * 0.75;
    } else {
      color += uColor * (wisps * 0.08 + forward * uGlow * 0.14);
    }
    gl_FragColor = vec4(color, alpha * uOpacity);
  }
`;function Ce(e,a){return 140+Math.max(e.layer2RadiusScale,e.layer3RadiusScale)*6.5+a*.45}function Ve(e,a){const{sharedColor:i,fogOpacity:s,fogDensity:p,fogScale:v,fogDrift:o,fogGlow:c,fogAnisotropy:u,materialStyleIndex:l,sliceCount:n,profile:t,audio:m,time:f,sliceIndex:d}=a;e.uniforms.uTime.value=f,e.uniforms.uColor.value.copy(i),e.uniforms.uOpacity.value=Math.min(1.56,Math.max(.04,s*t.opacityMul+t.opacityAdd)),e.uniforms.uDensity.value=Math.min(2,Math.max(.02,p*t.densityMul)),e.uniforms.uScale.value=Math.max(.1,v*t.scaleMul),e.uniforms.uDrift.value=o*t.driftMul+t.driftAdd,e.uniforms.uAudio.value=m,e.uniforms.uSliceIndex.value=d,e.uniforms.uSliceCount.value=n,e.uniforms.uMaterialStyle.value=l,e.uniforms.uGlow.value=Math.min(2,Math.max(0,c*t.glowMul+t.glowAdd)),e.uniforms.uAnisotropy.value=Math.min(2,Math.max(0,u+t.anisotropyAdd)),e.uniforms.uStreak.value=t.streak,e.uniforms.uGrain.value=t.grain,e.uniforms.uSwirl.value=t.swirl,e.uniforms.uVerticalBias.value=t.verticalBias,e.uniforms.uCoreTightness.value=t.coreTightness,e.uniforms.uPulseNoise.value=t.pulseNoise,e.uniforms.uEmber.value=t.ember,e.uniforms.uPlumeAmount.value=t.plumeAmount,e.uniforms.uFallAmount.value=t.fallAmount,e.uniforms.uMirageAmount.value=t.mirageAmount,e.uniforms.uStaticAmount.value=t.staticAmount,e.uniforms.uDustAmount.value=t.dustAmount,e.uniforms.uSootAmount.value=t.sootAmount,e.uniforms.uRuneAmount.value=t.runeAmount,e.uniforms.uVelvetAmount.value=t.velvetAmount,e.uniforms.uLedgerAmount.value=t.ledgerAmount,e.uniforms.uEdgeFade.value=t.edgeFade,e.blending=t.blending==="normal"?z:j}function Ne(e){return new ye({transparent:!0,depthWrite:!1,blending:e.profile.blending==="normal"?z:j,side:Me,uniforms:{uTime:{value:0},uColor:{value:e.sharedColor.clone()},uOpacity:{value:Math.min(1.56,Math.max(.04,e.fogOpacity*e.profile.opacityMul+e.profile.opacityAdd))},uDensity:{value:Math.min(2,Math.max(.02,e.fogDensity*e.profile.densityMul))},uScale:{value:Math.max(.1,e.fogScale*e.profile.scaleMul)},uDrift:{value:e.fogDrift*e.profile.driftMul+e.profile.driftAdd},uAudio:{value:0},uSliceIndex:{value:e.sliceIndex},uSliceCount:{value:e.sliceCount},uMaterialStyle:{value:e.materialStyleIndex},uGlow:{value:Math.min(2,Math.max(0,e.fogGlow*e.profile.glowMul+e.profile.glowAdd))},uAnisotropy:{value:Math.min(2,Math.max(0,e.fogAnisotropy+e.profile.anisotropyAdd))},uStreak:{value:e.profile.streak},uGrain:{value:e.profile.grain},uSwirl:{value:e.profile.swirl},uVerticalBias:{value:e.profile.verticalBias},uCoreTightness:{value:e.profile.coreTightness},uPulseNoise:{value:e.profile.pulseNoise},uEmber:{value:e.profile.ember},uPlumeAmount:{value:e.profile.plumeAmount},uFallAmount:{value:e.profile.fallAmount},uMirageAmount:{value:e.profile.mirageAmount},uStaticAmount:{value:e.profile.staticAmount},uDustAmount:{value:e.profile.dustAmount},uSootAmount:{value:e.profile.sootAmount},uRuneAmount:{value:e.profile.runeAmount},uVelvetAmount:{value:e.profile.velvetAmount},uLedgerAmount:{value:e.profile.ledgerAmount},uEdgeFade:{value:e.profile.edgeFade}},vertexShader:Ee,fragmentShader:ke})}function Le({config:e,layerIndex:a,audioRef:i,isPlaying:s}){const{camera:p}=Te(),v=S.useRef(null),o=S.useRef(pe()),c=S.useRef([]),u=S.useRef([]),l=xe(e,a),n=l.mode,t=l.color,m=H(e,i.current,o.current),f=M(m,"fog.opacity",l.opacity,{additiveScale:.25,clampMin:0,clampMax:1.5}),d=M(m,"fog.density",l.density,{additiveScale:.35,clampMin:.01,clampMax:3}),r=M(m,"fog.depth",l.depth,{additiveScale:l.depth*.3,clampMin:1,clampMax:Math.max(8,l.depth*4)}),y=l.scale,P=M(m,"fog.drift",l.drift,{additiveScale:.25,clampMin:0,clampMax:4}),V=l.slices,N=M(m,"fog.glow",l.glow,{additiveScale:.3,clampMin:0,clampMax:3}),L=M(m,"fog.anisotropy",l.anisotropy,{additiveScale:.18,clampMin:0,clampMax:1.5}),h=l.audioReactive,B=l.materialStyle,F=Z(B),g=l.source,T=S.useMemo(()=>Ae(Se(De(n),g),n,g),[n,g]),U=e.sphereRadius*l.radiusScale,A=Math.max(4,Math.min(48,Math.round(V*T.sliceMul))),X=S.useMemo(()=>{const _=r*T.depthMul;return Array.from({length:A},(G,x)=>{if(A===1)return 0;const O=x/(A-1);return he.lerp(-_*.5,_*.5,O)})},[A,r,T.depthMul]),W=S.useMemo(()=>new R(t),[t]),Y=Ce(e,r);return S.useEffect(()=>{c.current.forEach(_=>_.dispose()),c.current=[]},[A,n,g]),$(({clock:_})=>{if(!v.current)return;v.current.quaternion.copy(p.quaternion);const G=_.getElapsedTime(),x=H(e,i.current,o.current),O=M(x,"fog.opacity",l.opacity,{additiveScale:.25,clampMin:0,clampMax:1.5}),ne=M(x,"fog.density",l.density,{additiveScale:.35,clampMin:.01,clampMax:3}),ce=M(x,"fog.drift",l.drift,{additiveScale:.25,clampMin:0,clampMax:4}),fe=M(x,"fog.glow",l.glow,{additiveScale:.3,clampMin:0,clampMax:3}),me=M(x,"fog.anisotropy",l.anisotropy,{additiveScale:.18,clampMin:0,clampMax:1.5}),de=e.audioEnabled?(i.current.pulse*.65+i.current.bass*.35)*h:0;c.current.forEach((b,E)=>{Ve(b,{sharedColor:W,fogOpacity:O,fogDensity:ne,fogScale:y,fogDrift:ce,fogGlow:fe,fogAnisotropy:me,materialStyleIndex:F,sliceCount:A,profile:T,audio:de,time:G*(s?1:.1),sliceIndex:E})}),u.current.forEach((b,E)=>{if(!b)return;const I=J(n,g,E,A,X[E]??0,Y*T.planeScaleMul,U,G*(s?1:.25));b.position.copy(I.position),b.rotation.copy(I.rotation),b.scale.copy(I.scale)})}),{rootRef:v,materialsRef:c,sliceMeshRefs:u,layerMode:n,layerSource:g,profile:T,sharedColor:W,fogOpacity:f,fogDensity:d,fogDepth:r,fogScale:y,fogDrift:P,fogGlow:N,fogAnisotropy:L,materialStyleIndex:F,sliceCount:A,sliceOffsets:X,planeScale:Y,globalRadius:U}}const Ge=({layerIndex:e,runtime:a})=>{const{rootRef:i,materialsRef:s,sliceMeshRefs:p,layerMode:v,layerSource:o,profile:c,sharedColor:u,fogOpacity:l,fogDensity:n,fogScale:t,fogDrift:m,fogGlow:f,fogAnisotropy:d,materialStyleIndex:r,sliceCount:y,sliceOffsets:P,planeScale:V,globalRadius:N}=a;return w.jsx("group",{ref:i,children:P.map((L,h)=>{const B=s.current[h]??Ne({sharedColor:u,fogOpacity:l,fogDensity:n,fogScale:t,fogDrift:m,fogGlow:f,fogAnisotropy:d,materialStyleIndex:r,sliceCount:y,profile:c,sliceIndex:h});s.current[h]=B;const F=J(v,o,h,y,L,V*c.planeScaleMul,N,0);return w.jsx("mesh",{ref:g=>{p.current[h]=g},position:F.position,rotation:F.rotation,scale:F.scale,material:B,renderOrder:5+h*.01,children:w.jsx("planeGeometry",{args:[1,1,1,1]})},`${e}-${h}`)})})},Oe=e=>{const a=Le(e);return w.jsx(Ge,{layerIndex:e.layerIndex,runtime:a})},Ze=Object.freeze(Object.defineProperty({__proto__:null,VolumeFogSystem:Oe},Symbol.toStringTag,{value:"Module"})),K={swirl:.18,plume:.18,ring:0,cell:0,dissolve:0,ember:0,veil:.2,anisotropy:.24,pulseNoise:.18,shellBias:.1,cavity:.08,tint:"#ffffff"},Q={volume_fog:{veil:.32,anisotropy:.18,tint:"#d8e6ff"},dust_plume:{plume:.86,dissolve:.12,veil:.14,tint:"#d8c9aa"},ashfall:{plume:.2,dissolve:.36,anisotropy:.12,tint:"#c1bcc4"},vapor_canopy:{plume:.42,shellBias:.28,cavity:.12,tint:"#d9f7ff"},ember_swarm:{ember:.82,swirl:.34,tint:"#ffba68"},soot_veil:{veil:.72,dissolve:.24,tint:"#8a8480"},foam_drift:{veil:.42,cavity:.18,plume:.28,tint:"#eaf8ff"},charge_veil:{veil:.48,anisotropy:.62,pulseNoise:.44,tint:"#9ee6ff"},prism_smoke:{swirl:.28,veil:.4,tint:"#ffd8ff"},rune_smoke:{cell:.32,veil:.28,pulseNoise:.38,tint:"#c9d6ff"},mirage_smoke:{dissolve:.2,anisotropy:.54,swirl:.42,tint:"#ffe8c8"},ion_rain:{anisotropy:.82,dissolve:.16,pulseNoise:.46,tint:"#b0dfff"},velvet_ash:{veil:.58,shellBias:.22,tint:"#d6d0da"},static_smoke:{cell:.48,pulseNoise:.88,anisotropy:.12,tint:"#d7ecff"},ember_drift:{ember:.62,swirl:.22,plume:.24,tint:"#ffc47d"},vortex_transport:{swirl:.9,plume:.34,ring:.18,anisotropy:.44,tint:"#c6f0ff"},pressure_cells:{cell:.92,cavity:.2,veil:.12,tint:"#d8efff"},condense_field:{cavity:.22,shellBias:.34,veil:.2,tint:"#dff6ff"},sublimate_cloud:{dissolve:.86,cavity:.4,ring:.18,veil:.24,tint:"#eef8ff"}};function ee(e){switch(e){case"text":return{cell:.18,shellBias:.08,ring:.02,veil:-.04};case"grid":return{cell:.28,shellBias:.12,veil:-.06};case"ring":case"disc":case"torus":return{ring:.38,swirl:.12,shellBias:.1};case"spiral":case"galaxy":return{swirl:.24,plume:.08,anisotropy:.08};case"image":case"video":return{veil:.1,cavity:.08,shellBias:.06};case"cube":case"cylinder":case"cone":return{plume:.12,shellBias:.18,dissolve:.08};case"plane":return{veil:.08,shellBias:.12};default:return{}}}function te(e,a){const i=Fe(e,a);return{mode:i.mode,source:i.source,color:i.color,radiusScale:i.radiusScale,opacity:a===2?e.layer2FogOpacity:e.layer3FogOpacity,density:a===2?e.layer2FogDensity:e.layer3FogDensity,depth:a===2?e.layer2FogDepth:e.layer3FogDepth,scale:a===2?e.layer2FogScale:e.layer3FogScale,drift:a===2?e.layer2FogDrift:e.layer3FogDrift,glow:a===2?e.layer2FogGlow:e.layer3FogGlow,anisotropy:a===2?e.layer2FogAnisotropy:e.layer3FogAnisotropy,audioReactive:a===2?e.layer2FogAudioReactive:e.layer3FogAudioReactive,materialStyle:i.materialStyle}}function oe(e,a){const i={...K,...Q[e]??{}},s=ee(a);return{...i,swirl:i.swirl+(s.swirl??0),plume:i.plume+(s.plume??0),ring:i.ring+(s.ring??0),cell:i.cell+(s.cell??0),dissolve:i.dissolve+(s.dissolve??0),veil:i.veil+(s.veil??0),shellBias:i.shellBias+(s.shellBias??0),cavity:i.cavity+(s.cavity??0),anisotropy:i.anisotropy+(s.anisotropy??0)}}function le(e){return Z(e)}function ie(e,a,i,s,p){return{uTime:{value:0},uColor:{value:i.clone().lerp(s,.26)},uOpacity:{value:e.opacity},uDensity:{value:e.density},uAudio:{value:0},uGlow:{value:e.glow},uSwirl:{value:a.swirl},uPlume:{value:a.plume},uRing:{value:a.ring},uCell:{value:a.cell},uDissolve:{value:a.dissolve},uEmber:{value:a.ember},uVeil:{value:a.veil},uAnisotropy:{value:e.anisotropy+a.anisotropy},uPulseNoise:{value:a.pulseNoise},uShellBias:{value:a.shellBias},uCavity:{value:a.cavity},uMaterialStyle:{value:p}}}const ae=`
  varying vec3 vLocalPos;
  varying vec3 vWorldPos;
  void main() {
    vLocalPos = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`,ue=`
  varying vec3 vLocalPos;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uDensity;
  uniform float uAudio;
  uniform float uGlow;
  uniform float uSwirl;
  uniform float uPlume;
  uniform float uRing;
  uniform float uCell;
  uniform float uDissolve;
  uniform float uEmber;
  uniform float uVeil;
  uniform float uAnisotropy;
  uniform float uPulseNoise;
  uniform float uShellBias;
  uniform float uCavity;
  uniform float uMaterialStyle;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 191.3))) * 43758.5453123);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash(i + vec3(1.0, 1.0, 1.0));
    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);
    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);
    return mix(nxy0, nxy1, f.z);
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      value += noise(p) * amp;
      p = p * 2.03 + vec3(13.4, 8.1, 5.7);
      amp *= 0.5;
    }
    return value;
  }

  float sampleDensity(vec3 p) {
    float radius = length(p);
    float shell = smoothstep(1.18, 0.18 + uShellBias * 0.22, radius);
    float cavity = smoothstep(0.12, 0.42 + uCavity * 0.22, radius);
    float theta = atan(p.y, p.x);
    float ringWave = sin(theta * (4.0 + uRing * 10.0) + p.z * (2.0 + uRing * 6.0));
    float plume = smoothstep(1.1, 0.12, abs(p.x) * (1.0 + uPlume * 2.2) + max(0.0, -p.y) * 0.4);
    float cell = 1.0 - smoothstep(0.18, 0.44, abs(fract((p + 1.0) * (1.8 + uCell * 4.8)) - 0.5).x + abs(fract((p + 1.0) * (1.8 + uCell * 4.8)) - 0.5).y);
    float swirl = sin(theta * (2.0 + uSwirl * 10.0) + radius * (3.0 + uSwirl * 6.0) - uTime * (0.35 + uSwirl * 0.9));
    vec3 drift = vec3(uTime * 0.12, -uTime * 0.07, uTime * 0.05);
    float field = fbm(p * (1.8 + uVeil * 1.2) + drift + vec3(swirl * 0.16, plume * 0.1, ringWave * 0.12));
    float pulse = fbm(p * (2.4 + uPulseNoise * 2.2) - drift * 1.2);
    float dissolve = smoothstep(0.16, 0.86, fbm(p * (2.8 + uDissolve * 4.0) + 3.7));
    float density = shell * (0.42 + field * 0.9);
    density += plume * uPlume * 0.48;
    density += cell * uCell * 0.22;
    density += ringWave * uRing * 0.14;
    density += swirl * uSwirl * 0.12;
    density *= mix(1.0, cavity, 0.35 + uCavity * 0.4);
    density *= 1.0 - dissolve * uDissolve * 0.64;
    density += pulse * uPulseNoise * 0.18;
    return max(0.0, density);
  }

  void main() {
    vec3 camLocal = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
    vec3 rayDir = normalize(vLocalPos - camLocal);
    vec3 pos = vLocalPos;
    float alpha = 0.0;
    vec3 accum = vec3(0.0);
    const int STEPS = 24;
    float stepSize = 0.08;
    for (int i = 0; i < STEPS; i++) {
      if (max(abs(pos.x), max(abs(pos.y), abs(pos.z))) > 1.35) break;
      float d = sampleDensity(pos);
      float localAlpha = d * uDensity * 0.07;
      float ember = smoothstep(0.72, 0.96, fbm(pos * 5.8 + uTime * 0.4)) * uEmber;
      vec3 color = uColor;
      color += vec3(1.0, 0.42, 0.08) * ember * 0.6;
      float forward = pow(max(0.0, dot(normalize(camLocal - pos), rayDir * -1.0)), 1.0 + uAnisotropy * 2.0);
      color += uColor * uGlow * forward * 0.28;
      if (uMaterialStyle > 2.5 && uMaterialStyle < 3.5) {
        color += vec3(0.16, 0.18, 0.22) * forward;
      } else if (uMaterialStyle > 1.5 && uMaterialStyle < 2.5) {
        color += vec3(0.12, 0.06, 0.18) * (0.4 + pulse * 0.6);
      }
      accum += (1.0 - alpha) * color * localAlpha;
      alpha += (1.0 - alpha) * localAlpha;
      pos += rayDir * stepSize;
    }
    alpha *= uOpacity * (0.78 + uAudio * 0.36);
    if (alpha <= 0.003) discard;
    gl_FragColor = vec4(accum, clamp(alpha, 0.0, 1.0));
  }
`;function se(e,a){const{config:i,layerIndex:s,audioRef:p,isPlaying:v}=e,o=D.useMemo(()=>te(i,s),[i,s]),c=D.useMemo(()=>oe(o.mode,o.source),[o.mode,o.source]),u=D.useMemo(()=>new R(o.color),[o.color]),l=D.useMemo(()=>new R(c.tint),[c.tint]),n=D.useMemo(()=>le(o.materialStyle),[o.materialStyle]),t=i.sphereRadius*o.radiusScale*(.9+o.scale*.6),m=t*(.78+o.depth*.42);return $(({clock:f})=>{const d=a.current;if(!d)return;const r=f.getElapsedTime(),y=i.audioEnabled?(p.current.bass*.5+p.current.treble*.25+p.current.pulse*.25)*o.audioReactive:0;d.uniforms.uTime.value=r*(v?1:.2),d.uniforms.uAudio.value=y,d.uniforms.uOpacity.value=o.opacity,d.uniforms.uDensity.value=o.density*(1+y*.18),d.uniforms.uGlow.value=o.glow+y*.1,d.uniforms.uAnisotropy.value=Math.max(0,o.anisotropy+c.anisotropy)}),{settings:o,profile:c,color:u,tint:l,materialStyleIndex:n,scaleBase:t,depthScale:m}}const re=({materialRef:e,settings:a,profile:i,color:s,tint:p,materialStyleIndex:v,scaleBase:o,depthScale:c})=>w.jsxs("mesh",{scale:[o,o,c],renderOrder:3,children:[w.jsx("boxGeometry",{args:[2.4,2.4,2.4,1,1,1]}),w.jsx("shaderMaterial",{ref:e,vertexShader:ae,fragmentShader:ue,transparent:!0,depthWrite:!1,side:ge,blending:we(a.materialStyle)?z:j,uniforms:ie(a,i,s,p,v)})]}),Ie=e=>{const a=D.useRef(null),i=se(e,a);return w.jsx(re,{materialRef:a,...i})},$e=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_VOLUME_PROFILE:K,VOLUMETRIC_FIELD_FRAGMENT_SHADER:ue,VOLUMETRIC_FIELD_VERTEX_SHADER:ae,VOLUME_MODE_PROFILES:Q,VolumetricFieldSystem:Ie,VolumetricFieldSystemRender:re,createVolumetricFieldUniforms:ie,getVolumetricFieldSettings:te,getVolumetricMaterialStyleIndex:le,getVolumetricProfile:oe,getVolumetricSourceAdjustments:ee,useVolumetricFieldRuntime:se},Symbol.toStringTag,{value:"Module"}));export{$e as a,Ze as s};
