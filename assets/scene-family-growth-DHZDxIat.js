import{j as O,k as Pe,r as S}from"./react-vendor-BLE9nPfI.js";import{h as de,ac as ne,f as Le,j as ce,c as M,ab as Ae,D as Ce,af as Ee}from"./three-core-CZYXVIXO.js";import"./scene-runtime-motion-B_7blSTV.js";import{u as ke,C as ie,x as _e,D as pe}from"./scene-runtime-catalog-DTxoSzGh.js";import"./starter-library-extensions-C1PjFcNY.js";import"./scene-future-native-bridges-9yzG2U64.js";import{g as fe,c as Te}from"./scene-family-membrane-DgBEUXOF.js";import{e as le}from"./scene-motion-shared-Gctgf-e6.js";import{c as me,e as Me,r as K}from"./scene-overlay-core-C1hZwqg3.js";import{d as he,e as Ve,f as We}from"./scene-family-surface-BwkC97K9.js";import{u as ve}from"./r3f-fiber-CBj7iv8R.js";const Oe={trunkMul:1,branchMul:1,spreadMul:1,startMin:.34,startRange:.42,tangentMix:.65,normalMix:.6,bitangentMix:.35,verticalLift:.06,droop:.04,twigRate:.42,twigMul:.42,twigSpread:.56,jitter:.18,pulseMul:1,bandFreq:.12,tipGlow:.64,gateFreq:.05,alphaMul:1},C={canopy:.18,orbit:0,fracture:0,fan:.12,sweep:.1,ledger:0,terrace:0,column:.18,droop:.08},ze={growth_field:{},growth_grammar:{trunkMul:1.08,branchMul:1.2,spreadMul:1.06,tangentMix:.72,normalMix:.68,bitangentMix:.28,verticalLift:.14,droop:.02,twigRate:.62,twigMul:.56,twigSpread:.72,jitter:.1,pulseMul:1.08,bandFreq:.08,tipGlow:.82,gateFreq:.04,alphaMul:1.04},fracture_grammar:{trunkMul:.92,branchMul:1.28,spreadMul:.84,startMin:.18,startRange:.28,tangentMix:.42,normalMix:.86,bitangentMix:.62,verticalLift:.01,droop:0,twigRate:.22,twigMul:.28,twigSpread:.34,jitter:.08,pulseMul:.88,bandFreq:.22,tipGlow:.46,gateFreq:.14,alphaMul:.92}};function Ue(e,a){return ie(e,a).mode}function je(e){return{...Oe,...ze[e]??{}}}function Ie(e,a){return ie(e,a).source}function Ye(e){switch(e){case"text":return{...C,fracture:.34,ledger:.38,terrace:.24,fan:.06,canopy:.08,column:.08};case"image":case"video":return{...C,canopy:.34,sweep:.28,droop:.12,fan:.2,column:.14};case"ring":case"disc":case"torus":return{...C,orbit:.42,fan:.3,sweep:.14,canopy:.1,column:.06};case"spiral":case"galaxy":return{...C,orbit:.34,sweep:.36,fan:.18,canopy:.16,column:.1};case"grid":case"plane":return{...C,ledger:.28,terrace:.32,fracture:.14,fan:.08,column:.2};case"cube":case"cylinder":case"cone":return{...C,column:.34,fracture:.28,fan:.14,sweep:.08,canopy:.12};case"center":case"random":return{...C,canopy:.22,fan:.18,sweep:.16,droop:.12,column:.16};case"sphere":default:return C}}function ye(e,a){return ie(e,a)}function He(e,a){return a===2?[a,e.layer2Count,e.layer2Source,e.layer2SourceCount,e.layer2SourceSpread,e.layer2Counts,e.layer2MediaLumaMap,e.layer2MediaMapWidth,e.layer2MediaMapHeight,e.layer2MediaThreshold,e.layer2MediaDepth,e.layer2MediaInvert,e.layer2SourcePositions,e.layer2MotionMix,e.layer2Motions,e.layer2Type,e.layer2RadiusScales,e.layer2FlowSpeeds,e.layer2FlowAmps,e.layer2FlowFreqs,e.layer2Sizes,e.layer2GrowthBranches]:[a,e.layer3Count,e.layer3Source,e.layer3SourceCount,e.layer3SourceSpread,e.layer3Counts,e.layer3MediaLumaMap,e.layer3MediaMapWidth,e.layer3MediaMapHeight,e.layer3MediaThreshold,e.layer3MediaDepth,e.layer3MediaInvert,e.layer3SourcePositions,e.layer3MotionMix,e.layer3Motions,e.layer3Type,e.layer3RadiusScales,e.layer3FlowSpeeds,e.layer3FlowAmps,e.layer3FlowFreqs,e.layer3Sizes,e.layer3GrowthBranches]}function qe(e,a){const t=fe(e,a,!1,"aux");if(!t||t.count<4)return null;const p=ye(e,a),u=ke(e,a),i=Math.max(1,Math.min(8,Math.floor(p.branches))),h=Math.max(10,Math.min(u.maxGrowthBaseCount,96,Math.floor(t.count/Math.max(6,i*2)))),s=new Uint32Array(h);for(let f=0;f<h;f+=1)s[f]=Math.min(t.count-1,Math.floor(f/Math.max(1,h-1)*Math.max(0,t.count-1)));return{particleData:t,sampledIndices:s,branchCount:i,maxStrandCount:h*(1+i*3)}}const Xe=`
  attribute float growthMix;
  varying float vGrowthMix;
  varying vec3 vWorldPos;
  void main() {
    vGrowthMix = growthMix;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`,Ne=`
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPulse;
  uniform float uMaterialStyle;
  uniform float uTipGlow;
  uniform float uBarkBands;
  uniform float uGateFreq;
  uniform float uAlphaMul;
  varying float vGrowthMix;
  varying vec3 vWorldPos;
  void main() {
    float tip = smoothstep(0.0, 1.0, vGrowthMix);
    vec3 color = uColor;
    float alpha = uOpacity * uAlphaMul * mix(1.0, 0.14, tip);
    float shimmer = 0.55 + 0.45 * sin(vWorldPos.y * 0.07 + vWorldPos.x * 0.04 + uPulse * 8.0);
    float bark = 0.5 + 0.5 * sin(vWorldPos.y * uBarkBands - vWorldPos.x * uBarkBands * 0.6);
    float gate = step(0.25, fract(vWorldPos.y * uGateFreq + vWorldPos.x * uGateFreq * 0.6));
    color *= 0.48 + shimmer * 0.34 + bark * 0.18;
    color += vec3(1.0) * tip * uTipGlow * (0.08 + uPulse * 0.06);
    alpha *= mix(1.0, 0.72 + gate * 0.28, tip * 0.4);
    if (uMaterialStyle > 0.5 && uMaterialStyle < 1.5) {
      color = mix(color, vec3(0.9, 0.97, 1.0), 0.25);
      alpha *= 0.82;
    } else if (uMaterialStyle > 1.5 && uMaterialStyle < 2.5) {
      color = mix(color, vec3(0.2, 1.0, 0.88), 0.42);
      alpha *= 1.08;
    } else if (uMaterialStyle > 2.5 && uMaterialStyle < 3.5) {
      color = mix(vec3(0.18), vec3(1.0), bark) * mix(uColor, vec3(1.0), 0.42);
    } else if (uMaterialStyle > 3.5) {
      alpha *= mix(0.42, 1.0, gate);
      color *= 0.48 + gate * 0.52;
    }
    gl_FragColor = vec4(color, alpha);
  }
`;function Ze(){return{uColor:{value:new de("#ffffff")},uOpacity:{value:.4},uPulse:{value:0},uMaterialStyle:{value:0},uTipGlow:{value:.64},uBarkBands:{value:.12},uGateFreq:{value:.05},uAlphaMul:{value:1}}}const Je=({lineRef:e,materialRef:a})=>O.jsx("lineSegments",{ref:e,renderOrder:2,children:O.jsx("shaderMaterial",{ref:a,transparent:!0,depthWrite:!1,blending:ne,vertexShader:Xe,fragmentShader:Ne,uniforms:Ze()})}),V=new M,Q=new M,R=new M,E=new M,q=new M,$=new M,re=new M,W=new M,D=new M,b=new M,z=new M,k=new M,Ke=new M(1,0,0),Qe=new M(0,1,0),U=new M,X=new M;function $e(e){return e-Math.floor(e)}function P(e){return $e(Math.sin(e*91.173+17.137)*43758.5453123)}function B(e){return P(e)*2-1}function et({config:e,layerIndex:a,audioRef:t,isPlaying:p,lineRef:u,geometryRef:i,materialRef:h,layout:s}){const f=Pe.useRef(me());ve(({clock:L})=>{const c=u.current,o=h.current;if(!c||!o||!s)return;const v=ye(e,a),G=Me(e,t.current,f.current),d={...v,opacity:K(G,"growth.opacity",v.opacity,{additiveScale:.25,clampMin:0,clampMax:1.5}),length:K(G,"growth.length",v.length,{additiveScale:v.length*.45,clampMin:.01,clampMax:Math.max(.05,v.length*4)}),branches:Math.max(1,Math.round(K(G,"growth.branches",v.branches,{additiveScale:Math.max(1,v.branches*.45),clampMin:1,clampMax:Math.max(2,v.branches*4)}))),spread:K(G,"growth.spread",v.spread,{additiveScale:.35,clampMin:.01,clampMax:3})},r=je(Ue(e,a)),l=Ye(Ie(e,a)),n=e.sphereRadius*d.radiusScale,j=e.audioEnabled?t.current.pulse*e.audioBurstScale:0,N=e.audioEnabled?t.current.bass*e.audioBeatScale:0,I=p?(j+N*.55)*d.audioReactive:0,A=L.getElapsedTime(),Y=s.particleData;if(!Y)return;const Z=Math.max(1,Math.min(s.branchCount,Math.round(d.branches)));if(!i.current){const m=new Le;m.setAttribute("position",new ce(new Float32Array(s.maxStrandCount*2*3),3)),m.setAttribute("growthMix",new ce(new Float32Array(s.maxStrandCount*2),1)),i.current=m,c.geometry=m}const _=i.current,x=_.getAttribute("position"),F=_.getAttribute("growthMix");let T=0;for(let m=0;m<s.sampledIndices.length;m+=1){const ue=s.sampledIndices[m]??0,te=le({config:e,layerIndex:a,particleData:Y,index:ue,globalRadius:n,time:A}),ae=le({config:e,layerIndex:a,particleData:Y,index:ue,globalRadius:n,time:A+.02});V.set(te.x,te.y,te.z),Q.set(ae.x,ae.y,ae.z),R.copy(Q).sub(V),R.lengthSq()<1e-5&&R.set(B(m+.1),B(m+.2),B(m+.3)),R.normalize(),E.crossVectors(R,Math.abs(R.y)>.9?Ke:Qe).normalize(),E.lengthSq()<1e-5&&E.set(1,0,0),q.crossVectors(R,E).normalize(),U.copy(V).setY(0),U.lengthSq()<1e-5&&U.set(1,0,0),U.normalize(),X.set(-U.z,0,U.x).normalize();const se=d.length*r.trunkMul*(1+I*.9+P(m+1.4)*.18);W.copy(Q).addScaledVector(R,se).addScaledVector(E,B(m+2.7)*d.spread*n*(r.jitter*.08+l.fan*.1)).addScaledVector(q,B(m+4.2)*d.spread*n*(r.jitter*.06+l.sweep*.08)).addScaledVector(X,l.orbit*n*.16*Math.sin(A*.55+m*.37)).setY(Q.y+R.y*se+n*(r.verticalLift+l.canopy*.14+l.column*.08)-n*(r.droop+l.droop*.08)*P(m+6.1)+B(m+6.7)*n*r.jitter*.04),l.terrace>0&&(W.y=Math.round(W.y/(n*.08))*(n*.08*(1-l.terrace*.4)));let y=T*2;x.setXYZ(y+0,V.x,V.y,V.z),x.setXYZ(y+1,W.x,W.y,W.z),F.setX(y+0,0),F.setX(y+1,.42),T+=1;for(let J=0;J<Z;J+=1){const g=m*13.731+J*17.123,H=(J/Math.max(1,Z)-.5)*d.spread*r.spreadMul*Math.PI*1.35+B(g+3.7)*.35;if($.copy(R).multiplyScalar(r.tangentMix+l.sweep*.12).addScaledVector(E,Math.sin(H)*(r.normalMix+d.spread*(.6+l.fan*.25))).addScaledVector(q,Math.cos(H)*(r.bitangentMix+d.spread*(.4+l.orbit*.35))).addScaledVector(X,l.orbit*Math.sin(H*1.2+A*.4)).normalize(),D.copy(V).lerp(W,r.startMin+P(g+1.8)*r.startRange),l.ledger>0){const w=n*(.05+l.ledger*.08);D.x=Math.round(D.x/w)*w}const oe=d.length*r.branchMul*(.3+P(g+5.1)*.45)*(1+I*.8+l.canopy*.16);if(b.copy(D).addScaledVector($,oe).addScaledVector(E,B(g+7.3)*n*d.spread*(r.jitter*.12+l.fracture*.08)).addScaledVector(q,B(g+8.9)*n*d.spread*(r.jitter*.08+l.sweep*.08)).addScaledVector(X,l.orbit*n*.08*Math.cos(g+A*.6)).setY(D.y+$.y*oe+n*(r.verticalLift*.4+l.canopy*.08)-n*(r.droop+l.droop*.14)*P(g+9.7)),l.fracture>0){const w=n*(.04+l.fracture*.06);b.x=Math.round(b.x/w)*w,b.z=Math.round(b.z/w)*w}if(l.terrace>0&&(b.y=Math.round(b.y/(n*.06))*(n*.06*(1-l.terrace*.35))),y=T*2,x.setXYZ(y+0,D.x,D.y,D.z),x.setXYZ(y+1,b.x,b.y,b.z),F.setX(y+0,.45),F.setX(y+1,1),T+=1,P(g+12.4)<r.twigRate+l.canopy*.08){re.copy($).multiplyScalar(.62).addScaledVector(E,Math.sin(H*1.7+.8)*(r.twigSpread+l.fan*.18)).addScaledVector(q,Math.cos(H*1.5-.4)*(r.twigSpread*.82+l.sweep*.16)).addScaledVector(X,l.orbit*.18).normalize(),z.copy(D).lerp(b,.4+P(g+13.9)*.38);const w=oe*r.twigMul*(.72+P(g+14.3)*.24+l.column*.12);k.copy(z).addScaledVector(re,w).setY(z.y+re.y*w+n*(r.verticalLift*.18+l.canopy*.04)),l.fracture>.18&&(k.x=Math.round(k.x/(n*.035))*(n*.035),k.z=Math.round(k.z/(n*.035))*(n*.035)),y=T*2,x.setXYZ(y+0,z.x,z.y,z.z),x.setXYZ(y+1,k.x,k.y,k.z),F.setX(y+0,.72),F.setX(y+1,1),T+=1}}}x.needsUpdate=!0,F.needsUpdate=!0,_.setDrawRange(0,T*2),_.computeBoundingSphere();const Be=he(d.materialStyle);o.uniforms.uColor.value.set(d.color),o.uniforms.uOpacity.value=d.opacity,o.uniforms.uPulse.value=(j+N*.25)*r.pulseMul,o.uniforms.uMaterialStyle.value=Be,o.uniforms.uTipGlow.value=r.tipGlow,o.uniforms.uBarkBands.value=r.bandFreq,o.uniforms.uGateFreq.value=r.gateFreq,o.uniforms.uAlphaMul.value=r.alphaMul})}const tt=({config:e,layerIndex:a,audioRef:t,isPlaying:p})=>{const u=S.useRef(null),i=S.useRef(null),h=S.useRef(null),s=S.useMemo(()=>qe(e,a),He(e,a));return S.useEffect(()=>{var f;(f=i.current)==null||f.dispose(),i.current=null},[s==null?void 0:s.maxStrandCount]),S.useEffect(()=>()=>{var f;(f=i.current)==null||f.dispose(),i.current=null},[]),et({config:e,layerIndex:a,audioRef:t,isPlaying:p,lineRef:u,geometryRef:i,materialRef:h,layout:s}),s?O.jsx(Je,{lineRef:u,materialRef:h}):null},ht=Object.freeze(Object.defineProperty({__proto__:null,GrowthFieldSystem:tt},Symbol.toStringTag,{value:"Module"})),at={dotField:0,reliefMul:1,reliefAdd:0,erosionMul:1,erosionAdd:0,bandsMul:1,bandsMin:2,opacityMul:1,opacityAdd:0,scaleMul:1,scaleYMul:1,rotationMul:1,pitchMul:1,dotScale:1,dotSoftness:.5,bandWarp:0,bleedSpread:0,glyphGrid:0,contourMix:0,sootStain:0,runeRetention:0,velvetMatte:0,vaporLift:0,normalBlend:!1},ot={deposition_field:{dotField:.06,reliefMul:1.08,bandsMul:1.06,bandsMin:3,scaleMul:1.02,scaleYMul:.94,dotScale:.88,dotSoftness:.42,bandWarp:.12,contourMix:.08,sootStain:.08,vaporLift:.12},stipple_field:{dotField:.92,reliefMul:.55,bandsMul:1.6,bandsMin:5,opacityMul:.94,scaleMul:.92,scaleYMul:.88,rotationMul:.5,dotScale:1.24,dotSoftness:.34,bandWarp:.22,glyphGrid:.12,sootStain:.1,normalBlend:!0},capillary_sheet:{dotField:.12,reliefMul:1.22,reliefAdd:.04,erosionMul:.82,bandsMul:1.42,bandsMin:5,opacityMul:.96,scaleMul:1.04,scaleYMul:.98,rotationMul:1,pitchMul:1,dotScale:.82,dotSoftness:.58,bandWarp:.22,bleedSpread:.38,glyphGrid:.2,contourMix:.14,sootStain:.08,runeRetention:.18,velvetMatte:.22,vaporLift:.22,normalBlend:!0},percolation_sheet:{dotField:.18,reliefMul:1.28,reliefAdd:.05,erosionMul:.74,erosionAdd:-.02,bandsMul:1.56,bandsMin:6,opacityMul:.98,scaleMul:1.06,scaleYMul:.94,rotationMul:1,pitchMul:1,dotScale:.86,dotSoftness:.62,bandWarp:.34,bleedSpread:.42,glyphGrid:.28,contourMix:.12,sootStain:.06,runeRetention:.14,velvetMatte:.18,vaporLift:.28,normalBlend:!0},ink_bleed:{dotField:.18,reliefMul:.72,erosionMul:1.18,erosionAdd:.06,bandsMul:1.35,bandsMin:3,opacityMul:1.08,scaleMul:1.02,scaleYMul:.92,rotationMul:1.08,pitchMul:1.08,dotScale:.72,dotSoftness:.7,bandWarp:.58,bleedSpread:.92,glyphGrid:.18,contourMix:.1,sootStain:.34,runeRetention:.42,velvetMatte:.48,vaporLift:.54,normalBlend:!0},drift_glyph_dust:{dotField:.82,reliefMul:.5,erosionMul:1.36,erosionAdd:.14,bandsMul:1.82,bandsMin:6,opacityMul:.78,scaleMul:.9,scaleYMul:.84,rotationMul:.9,pitchMul:.94,dotScale:1.18,dotSoftness:.28,bandWarp:.34,bleedSpread:.18,glyphGrid:.76,contourMix:.18,runeRetention:.66,vaporLift:.16,normalBlend:!0},sigil_dust:{dotField:.96,reliefMul:.42,erosionMul:1.48,erosionAdd:.2,bandsMul:2.08,bandsMin:7,opacityMul:.72,scaleMul:.96,scaleYMul:.8,rotationMul:.72,pitchMul:.86,dotScale:1.42,dotSoftness:.18,bandWarp:.46,bleedSpread:.1,glyphGrid:1,contourMix:.32,runeRetention:.88,vaporLift:.12,normalBlend:!0},seep_fracture:{dotField:.14,reliefMul:.86,erosionMul:1.3,erosionAdd:.08,bandsMul:1.42,bandsMin:4,opacityMul:.88,scaleMul:.98,scaleYMul:.9,bandWarp:.64,bleedSpread:.76,contourMix:.14,sootStain:.18,vaporLift:.22,normalBlend:!0}},ee=new M;function Se(e){return{...at,...ot[e]??{}}}const xe=`
  uniform float uTime;
  uniform float uRelief;
  uniform float uErosion;
  uniform float uPulse;
  uniform float uAudioReactive;
  uniform float uBandWarp;
  uniform float uBleedSpread;
  uniform float uGlyphGrid;
  uniform float uContourMix;
  uniform float uSootStain;
  uniform float uRuneRetention;
  uniform float uVelvetMatte;
  uniform float uVaporLift;
  varying vec2 vUv;
  varying float vHeight;
  varying float vSediment;

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
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      value += noise(p) * amp;
      p = p * 2.03 + vec2(17.2, -11.8);
      amp *= 0.5;
    }
    return value;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    vec2 swirl = vec2(sin(uv.y * (6.0 + uBandWarp * 18.0) + uTime * 0.2), cos(uv.x * (7.0 + uBandWarp * 15.0) - uTime * 0.17));
    vec2 flowUv = uv * mix(2.0, 6.5 + uBandWarp * 2.4, uRelief) + vec2(uTime * 0.035, -uTime * 0.02) + swirl * (0.06 + uBandWarp * 0.12);
    float base = fbm(flowUv);
    float cut = fbm(flowUv * (1.8 + uBleedSpread * 0.7) + vec2(4.2, -3.1));
    float ridges = abs(base * 2.0 - 1.0);
    float sediment = smoothstep(0.18, 0.92, ridges);
    float erosion = smoothstep(0.2, 0.85, cut) * uErosion;
    float glyphMask = 0.5 + 0.5 * sin((uv.x + uv.y) * (22.0 + uGlyphGrid * 90.0) + uTime * 0.28);
    glyphMask *= 0.5 + 0.5 * sin((uv.x - uv.y) * (14.0 + uGlyphGrid * 64.0) - uTime * 0.22);
    float contour = 0.5 + 0.5 * sin((uv.y + ridges * 0.18) * (10.0 + uContourMix * 42.0) + uTime * (0.4 + uContourMix * 0.5));
    float bleed = fbm(flowUv * (1.2 + uBleedSpread * 1.8) + vec2(-uTime * 0.03, uTime * 0.05));
    float soot = smoothstep(0.32, 0.92, bleed + sediment * 0.22);
    float rune = glyphMask * (0.6 + 0.4 * contour);
    float velvet = smoothstep(0.12, 0.9, fbm(flowUv * 0.8 + vec2(3.2, -5.4)));
    float vapor = smoothstep(1.1, 0.08, length(uv * vec2(1.0, 0.82))) * (0.6 + contour * 0.4);
    float height = sediment * (1.0 - erosion);
    height += (bleed - 0.5) * uBleedSpread * 0.28;
    height += (glyphMask - 0.5) * uGlyphGrid * 0.18;
    height += (contour - 0.5) * uContourMix * 0.3;
    height += (soot - 0.5) * uSootStain * 0.16;
    height += (rune - 0.5) * uRuneRetention * 0.14;
    height += (velvet - 0.5) * uVelvetMatte * 0.1;
    height += vapor * uVaporLift * 0.18;
    height = clamp(height, 0.0, 1.0);
    sediment = clamp(mix(sediment, sediment * 0.74 + glyphMask * 0.26 + contour * 0.14 + soot * uSootStain * 0.12 + rune * uRuneRetention * 0.12, clamp(uGlyphGrid + uContourMix + uSootStain * 0.3 + uRuneRetention * 0.3, 0.0, 1.0)), 0.0, 1.0);
    float audioLift = uPulse * uAudioReactive * (0.35 + sediment * 0.65 + vapor * uVaporLift * 0.2);
    pos.z += (height - 0.5) * 120.0 * uRelief + (contour - 0.5) * 28.0 * uContourMix + (bleed - 0.5) * 24.0 * uBleedSpread + audioLift * 26.0;
    pos.x += (cut - 0.5) * 22.0 * uErosion + (glyphMask - 0.5) * 16.0 * uGlyphGrid + (rune - 0.5) * 9.0 * uRuneRetention;
    pos.y += (sediment - 0.5) * 18.0 * uRelief + (contour - 0.5) * 12.0 * uContourMix + vapor * uVaporLift * 8.0;
    vHeight = height;
    vSediment = sediment;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`,be=`
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uBands;
  uniform float uPulse;
  uniform float uMaterialStyle;
  uniform float uDotField;
  uniform float uDotScale;
  uniform float uDotSoftness;
  uniform float uBandWarp;
  uniform float uBleedSpread;
  uniform float uGlyphGrid;
  uniform float uContourMix;
  uniform float uSootStain;
  uniform float uRuneRetention;
  uniform float uVelvetMatte;
  uniform float uVaporLift;
  varying vec2 vUv;
  varying float vHeight;
  varying float vSediment;

  void main() {
    float bands = floor(vHeight * max(2.0, uBands)) / max(2.0, uBands - 1.0);
    float cut = smoothstep(0.08, 0.92, bands);
    float contourLines = abs(sin(vUv.y * (10.0 + uContourMix * 54.0) + vHeight * (8.0 + uBandWarp * 10.0) + uPulse * 3.0));
    float contourMask = 1.0 - smoothstep(0.2, 0.82 - uContourMix * 0.28, contourLines);
    float glyphMask = 0.5 + 0.5 * sin((vUv.x + vUv.y) * (18.0 + uGlyphGrid * 82.0));
    glyphMask *= 0.5 + 0.5 * sin((vUv.x - vUv.y) * (12.0 + uGlyphGrid * 58.0));
    float bleedDark = smoothstep(0.24, 0.92, vSediment + uBleedSpread * 0.18);
    float sootMask = smoothstep(0.28, 0.94, vSediment + uSootStain * 0.18 + uBleedSpread * 0.1);
    float runeMask = glyphMask * (0.65 + contourMask * 0.35);
    float velvetMask = smoothstep(0.12, 0.92, vHeight * 0.76 + vSediment * 0.24);
    vec3 color = mix(uColor * 0.4, uColor, cut);
    color *= 0.72 + vSediment * 0.5;
    color = mix(color, color * (0.74 + bleedDark * 0.22), uBleedSpread * 0.7);
    color = mix(color, color * (0.48 + sootMask * 0.18) + vec3(0.12, 0.09, 0.07) * 0.24, clamp(uSootStain, 0.0, 1.0));
    color += vec3(1.0) * uPulse * 0.05;
    color += mix(vec3(0.0), vec3(1.0), contourMask) * uContourMix * 0.1;
    color += vec3(0.72, 0.86, 0.96) * runeMask * uRuneRetention * 0.1;
    color = mix(color, color * (0.8 + velvetMask * 0.12) + vec3(dot(color, vec3(0.299, 0.587, 0.114))) * 0.16, clamp(uVelvetMatte, 0.0, 1.0));
    color *= 0.92 + glyphMask * uGlyphGrid * 0.12;
    float alpha = uOpacity * (0.35 + cut * 0.75 + contourMask * uContourMix * 0.2 + sootMask * uSootStain * 0.1 + runeMask * uRuneRetention * 0.08 + uVaporLift * 0.06);
    if (uDotField > 0.001) {
      vec2 cell = fract(vUv * mix(28.0, 56.0, uDotField) * mix(0.72, 1.48, clamp(uDotScale, 0.0, 1.5))) - 0.5;
      float dotMask = 1.0 - smoothstep(0.08 + uDotSoftness * 0.04, mix(0.36, 0.14, uDotField) + uDotSoftness * 0.08, length(cell));
      alpha *= mix(0.2, 1.0, dotMask);
      color *= 0.56 + dotMask * 0.74;
      color = mix(color, color * (0.82 + glyphMask * 0.26), uGlyphGrid * 0.68);
    }

    if (uMaterialStyle > 0.5 && uMaterialStyle < 1.5) {
      color = mix(color, vec3(0.95, 0.97, 1.0), 0.26);
      alpha *= 0.82;
    } else if (uMaterialStyle > 1.5 && uMaterialStyle < 2.5) {
      float scan = 0.5 + 0.5 * sin(vUv.y * 130.0 + vHeight * 12.0);
      color = mix(color, vec3(0.12, 0.95, 1.0), 0.44) + vec3(0.08, 0.35, 0.42) * scan * 0.18;
      alpha *= 1.04;
    } else if (uMaterialStyle > 2.5 && uMaterialStyle < 3.5) {
      float band = 0.5 + 0.5 * sin(vUv.y * 24.0 + vHeight * 8.0);
      color = mix(vec3(0.15), vec3(1.0), band) * mix(uColor, vec3(1.0), 0.4);
    } else if (uMaterialStyle > 3.5) {
      vec2 cell = fract(vUv * 20.0) - 0.5;
      float dots = 1.0 - smoothstep(0.12, 0.34, length(cell));
      alpha *= mix(0.42, 1.0, dots);
      color *= 0.46 + dots * 0.72;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;function ge(e,a){return _e(e,a)}function we(e,a){const t=fe(e,a,!1,"aux");return!t||t.count===0?null:{particleData:t}}function Re(e){return{uColor:{value:new de(e.color)},uOpacity:{value:e.opacity},uRelief:{value:e.relief},uErosion:{value:e.erosion},uBands:{value:e.bands},uPulse:{value:0},uAudioReactive:{value:e.audioReactive},uTime:{value:0},uMaterialStyle:{value:0},uDotField:{value:0},uDotScale:{value:1},uDotSoftness:{value:.5},uBandWarp:{value:0},uBleedSpread:{value:0},uGlyphGrid:{value:0},uContourMix:{value:0},uSootStain:{value:0},uRuneRetention:{value:0},uVelvetMatte:{value:0},uVaporLift:{value:0}}}function Ge(e){const{group:a,material:t,layout:p,config:u,layerIndex:i,audioFrame:h,audioRouteEvaluation:s,isPlaying:f,time:L}=e,c=pe(u,i),o=Ve(We(Se(c.mode),c.source),c.mode,c.source),v=u.sphereRadius*c.radiusScale,G=p.particleData;if(!G)return;const d=Math.min(28,G.count);ee.set(0,0,0);for(let x=0;x<d;x+=1){const F=Math.floor(x/Math.max(1,d-1)*Math.max(0,G.count-1));ee.add(le({config:u,layerIndex:i,particleData:G,index:F,globalRadius:v,time:L}))}ee.multiplyScalar(1/Math.max(1,d)),a.position.copy(ee).multiplyScalar(.32),a.rotation.x=-Math.PI/2+Math.sin(L*.11+i)*.18*o.pitchMul,a.rotation.z=Math.cos(L*.09+i*.4)*.24*o.rotationMul;const r=Te(s,"depositionField"),l=u.audioEnabled?h.pulse*u.audioBurstScale:0,n=u.audioEnabled?h.bass*u.audioBeatScale:0,j=c.audioReactive+r.relief*.4,N=f?(l+n*.65)*j:0,I=Math.min(1.7,Math.max(.04,c.relief*o.reliefMul+o.reliefAdd+r.relief*.18)),A=Math.min(1.9,Math.max(0,c.erosion*o.erosionMul+o.erosionAdd+r.erosion*.15)),Y=Math.max(o.bandsMin,c.bands*o.bandsMul+r.bands),Z=Math.min(1.3,Math.max(.04,c.opacity*o.opacityMul+o.opacityAdd+r.opacity*.18)),_=v*(1.1+I*.22+N*.08+r.scale*.08)*o.scaleMul;a.scale.set(_,_*(.82+A*.12)*o.scaleYMul,1),t.uniforms.uColor.value.set(c.color),t.uniforms.uOpacity.value=Z,t.uniforms.uRelief.value=I,t.uniforms.uErosion.value=A,t.uniforms.uBands.value=Y,t.uniforms.uPulse.value=l+n*.25,t.uniforms.uAudioReactive.value=j,t.uniforms.uTime.value=L,t.uniforms.uMaterialStyle.value=he(c.materialStyle),t.uniforms.uDotField.value=o.dotField,t.uniforms.uDotScale.value=o.dotScale,t.uniforms.uDotSoftness.value=o.dotSoftness,t.uniforms.uBandWarp.value=o.bandWarp,t.uniforms.uBleedSpread.value=o.bleedSpread,t.uniforms.uGlyphGrid.value=o.glyphGrid,t.uniforms.uContourMix.value=o.contourMix,t.uniforms.uSootStain.value=o.sootStain,t.uniforms.uRuneRetention.value=o.runeRetention,t.uniforms.uVelvetMatte.value=o.velvetMatte,t.uniforms.uVaporLift.value=o.vaporLift,t.wireframe=c.wireframe||r.wireframe>.08,t.blending=o.normalBlend?Ae:ne}function Fe(e,a,t){const{config:p,layerIndex:u,audioRef:i,isPlaying:h}=e,s=S.useRef(me()),f=S.useMemo(()=>we(p,u),ge(p,u));return ve(({clock:L})=>{const c=a.current,o=t.current;if(!c||!o||!f)return;const v=Me(p,i.current,s.current);Ge({group:c,material:o,layout:f,config:p,layerIndex:u,audioFrame:i.current,audioRouteEvaluation:v,isPlaying:h,time:L.getElapsedTime()})}),{layout:f}}const De=({groupRef:e,materialRef:a,geometry:t,config:p,layerIndex:u})=>{const i=pe(p,u);return O.jsx("group",{ref:e,renderOrder:1,children:O.jsx("mesh",{geometry:t,children:O.jsx("shaderMaterial",{ref:a,transparent:!0,depthWrite:!1,side:Ce,blending:ne,vertexShader:xe,fragmentShader:be,uniforms:Re(i)})})})},rt=e=>{const a=S.useRef(null),t=S.useRef(null),p=S.useMemo(()=>new Ee(1,1,72,72),[]);S.useEffect(()=>()=>p.dispose(),[p]);const{layout:u}=Fe(e,a,t);return u?O.jsx(De,{groupRef:a,materialRef:t,geometry:p,config:e.config,layerIndex:e.layerIndex}):null},vt=Object.freeze(Object.defineProperty({__proto__:null,DEPOSITION_FIELD_FRAGMENT_SHADER:be,DEPOSITION_FIELD_VERTEX_SHADER:xe,DepositionFieldSystem:rt,DepositionFieldSystemRender:De,buildDepositionFieldLayout:we,createDepositionFieldUniforms:Re,getDepositionFieldLayoutDeps:ge,getDepositionProfile:Se,updateDepositionFieldScene:Ge,useDepositionFieldRuntime:Fe},Symbol.toStringTag,{value:"Module"}));export{vt as a,ht as s};
