import{r as h,j as R,k as Pt}from"./react-vendor-BLE9nPfI.js";import{f as Rt,ad as _t,ae as Ue,h as ve,c as re,n as me,ab as Le,ac as ie,D as ke,af as Ne,j as Bt,a7 as qt,G as Ft}from"./three-core-CZYXVIXO.js";import{g as Te,r as Pe}from"./scene-family-membrane-DgBEUXOF.js";import{w as Re,u as Ze,x as Xe,y as Ct,m as $e,z as De,A as Lt,v as Tt}from"./scene-runtime-catalog-DTxoSzGh.js";import{e as pe}from"./scene-motion-shared-Gctgf-e6.js";import"./scene-runtime-motion-B_7blSTV.js";import"./starter-library-extensions-C1PjFcNY.js";import"./scene-future-native-bridges-9yzG2U64.js";import{c as _e,e as Be}from"./scene-overlay-core-C1hZwqg3.js";import{u as Ae}from"./r3f-fiber-CBj7iv8R.js";import{g as Dt,a as zt}from"./scene-authoring-hybrid-B0hyb-BL.js";class Et extends Rt{constructor(r=[]){super();const e=[],t=[],m=new _t().setFromPoints(r).faces;for(let n=0;n<m.length;n++){const s=m[n];let M=s.edge;do{const b=M.head().point;e.push(b.x,b.y,b.z),t.push(s.normal.x,s.normal.y,s.normal.z),M=M.next}while(M!==s.edge)}this.setAttribute("position",new Ue(e,3)),this.setAttribute("normal",new Ue(t,3))}}function ze(a,r){return r===2?a.layer2Source:a.layer3Source}function Ve(a){return Math.max(0,a)}function l(a){return Math.min(1,Math.max(0,a))}function $a(a,r){const e={...a};switch(r){case"text":e.planarBias+=.22,e.radialBias+=.08,e.gateFreq+=.26,e.gateThreshold+=.08,e.budgetMul*=.96,e.widthMul*=.92,e.shimmerMul*=1.08,e.flickerMul*=1.04,e.hueShiftAdd+=.01;break;case"grid":e.searchMul*=.94,e.planarBias+=.34,e.radialBias=Ve(e.radialBias-.04),e.gateFreq+=.18,e.gateThreshold+=.04,e.widthMul*=.9,e.softnessMul*=.92,e.flickerMul*=.94;break;case"ring":e.searchMul*=1.08,e.planarBias=Ve(e.planarBias-.08),e.radialBias+=.34,e.glowMul*=1.08,e.alphaMul*=1.02,e.pulseMul*=1.08;break;case"cylinder":e.searchMul*=1.06,e.budgetMul*=1.04,e.radialBias+=.16,e.shimmerMul*=1.06,e.widthMul*=.96;break;case"plane":e.searchMul*=.94,e.planarBias+=.38,e.budgetMul*=.94,e.opacityMul*=.94,e.softnessMul*=1.08;break;case"image":e.planarBias+=.24,e.dropout=Math.min(.32,e.dropout+.03),e.alphaMul*=.96,e.shimmerMul*=.98;break;case"video":e.glowMul*=1.08,e.pulseMul*=1.12,e.flickerMul*=1.16;break;case"sphere":e.searchMul*=1.04,e.budgetMul*=1.04,e.radialBias+=.14;break}return e}function Ia(a,r){const e={...a};switch(r){case"text":e.lengthBase*=.92,e.planarPull+=.18,e.quantize+=.18,e.bandMix+=.1,e.gateAmount+=.24,e.alphaMul*=.94;break;case"grid":e.lengthBase*=.96,e.tangentStretch*=.9,e.planarPull+=.24,e.quantize+=.22,e.bandFrequency*=1.24,e.bandMix+=.12,e.shimmerScale*=.96;break;case"ring":e.verticalBias+=.04,e.radialLift+=.22,e.radialPull+=.06,e.curtainAmount+=.08,e.waveAmplitude+=.08,e.waveFrequency*=1.08,e.glow*=1.06;break;case"cylinder":e.lengthBase*=1.08,e.tangentStretch*=1.16,e.braidAmount+=.12,e.shimmerScale*=1.04;break;case"plane":e.lengthBase*=.94,e.planarPull+=.28,e.curtainAmount+=.04,e.alphaMul*=.95;break;case"image":e.planarPull+=.1,e.seedBias+=.08,e.bandMix+=.06,e.charAmount+=.04;break;case"video":e.waveAmplitude+=.06,e.phaseSpeed*=1.12,e.glow*=1.05,e.pulseMix*=1.08;break;case"sphere":e.verticalBias+=.06,e.radialLift+=.14;break}return e.quantize=Math.min(.68,e.quantize),e.bandMix=Math.min(.88,e.bandMix),e.gateAmount=Math.min(.92,e.gateAmount),e}function Ja(a,r,e){const t={...a};switch(`${e}:${r}`){case"text:shell_script":t.planarBias+=.22,t.gateFreq+=.28,t.gateThreshold+=.1,t.widthMul*=.88,t.opacityMul*=.92,t.shimmerMul*=.96;break;case"text:ink_bleed":t.planarBias+=.14,t.dropout=Math.min(.36,t.dropout+.08),t.softnessMul*=1.12,t.glowMul*=.9,t.flickerMul*=.9;break;case"text:drift_glyph_dust":t.dropout=Math.min(.38,t.dropout+.08),t.softnessMul*=1.08,t.alphaMul*=.9,t.glowMul*=.94;break;case"text:glyph_weave":t.budgetMul*=1.12,t.planarBias+=.2,t.gateFreq+=.2,t.gateThreshold+=.06,t.widthMul*=.92,t.shimmerMul*=1.12,t.flickerMul*=.96;break;case"text:rune_smoke":t.searchMul*=.94,t.planarBias+=.12,t.gateFreq+=.18,t.widthMul*=.9,t.glowMul*=1.08;break;case"grid:static_lace":t.planarBias+=.18,t.gateFreq+=.24,t.gateThreshold+=.08,t.widthMul*=.88,t.flickerMul*=1.16;break;case"grid:mesh_weave":t.planarBias+=.14,t.widthMul*=.9,t.softnessMul*=.94,t.flickerMul*=.92;break;case"ring:eclipse_halo":t.radialBias+=.22,t.glowMul*=1.12,t.pulseMul*=1.08;break;case"ring:spectral_mesh":t.searchMul*=1.06,t.shimmerMul*=1.12,t.widthMul*=.92;break;case"ring:signal_braid":t.radialBias+=.16,t.pulseMul*=1.12,t.flickerMul*=1.08;break;case"plane:soot_veil":t.planarBias+=.18,t.opacityMul*=.92,t.softnessMul*=1.08;break;case"plane:ink_bleed":t.planarBias+=.16,t.gateThreshold+=.05,t.softnessMul*=1.06;break}return t}function Ka(a,r,e){const t={...a};switch(`${e}:${r}`){case"text:glyph_weave":t.planarPull+=.26,t.quantize+=.18,t.bandMix+=.08,t.gateAmount+=.24,t.alphaMul*=.94,t.shimmerScale*=.96;break;case"text:shell_script":t.planarPull+=.14,t.bandMix+=.1,t.gateAmount+=.22,t.alphaMul*=.92;break;case"grid:static_lace":t.quantize+=.18,t.bandFrequency*=1.12,t.bandMix+=.1,t.gateAmount+=.08,t.shimmerScale*=.94;break;case"grid:mesh_weave":t.planarPull+=.14,t.quantize+=.1,t.bandMix+=.08;break;case"ring:spectral_mesh":t.radialLift+=.12,t.waveAmplitude+=.08,t.prismAmount+=.08;break;case"ring:signal_braid":t.radialLift+=.14,t.braidAmount+=.12,t.pulseMix*=1.08;break;case"plane:cinder_web":t.planarPull+=.12,t.charAmount+=.12,t.alphaMul*=.94;break}return t.quantize=Math.min(.74,t.quantize),t.bandMix=Math.min(.92,t.bandMix),t.gateAmount=Math.min(.96,t.gateAmount),t}function Wt(a,r,e){const t={...a};switch(`${e}:${r}`){case"text:shell_script":t.scriptWarp+=.22,t.scanScale*=1.18,t.etchStrength+=.24,t.bandStrength+=.12,t.grainStrength+=.04,t.blendMode="normal";break;case"text:mirror_skin":t.grainStrength+=.08,t.etchStrength+=.08,t.lacquerAmount+=.04;break;case"grid:calcified_skin":t.quantize+=.18,t.bandStrength+=.22,t.grainStrength+=.16,t.haloSpread*=.82,t.haloSharpness+=.08,t.blendMode="normal";break;case"grid:residue_skin":t.droop+=.06,t.grainStrength+=.16,t.flowAmount+=.08,t.blendMode="normal";break;case"ring:eclipse_halo":t.diskAmount+=.14,t.haloSharpness+=.16,t.centerDarkness+=.1;break;case"ring:halo_bloom":t.haloSpread+=.12,t.bloomAmount+=.14,t.auraAmount+=.06;break;case"ring:aura_shell":t.auraAmount+=.14,t.haloSpread+=.08,t.diskAmount+=.04;break;case"plane:resin_shell":t.lacquerAmount+=.14,t.flowAmount+=.14,t.grainStrength+=.06,t.blendMode="normal";break;case"plane:ink_bleed":t.grainStrength+=.08,t.droop+=.06,t.blendMode="normal";break}return t.quantize=Math.min(.6,Math.max(0,t.quantize)),t.haloSharpness=l(t.haloSharpness),t.auraAmount=l(t.auraAmount),t.diskAmount=l(t.diskAmount),t.lacquerAmount=l(t.lacquerAmount),t.flowAmount=l(t.flowAmount),t}function jt(a,r){const e={...a};switch(r){case"text":e.scaleX*=1.04,e.scaleY*=.84,e.scaleZ*=1.08,e.scriptWarp+=.18,e.scanScale*=1.22,e.bandStrength+=.14,e.etchStrength+=.22,e.opacityMul*=.96,e.blendMode="normal";break;case"grid":e.scaleY*=.9,e.quantize+=.14,e.scanScale*=1.1,e.bandStrength+=.18,e.grainStrength+=.12,e.haloSharpness+=.08,e.opacityMul*=.95,e.blendMode="normal";break;case"ring":e.radialLift+=.08,e.ringLift+=.18,e.haloSpread+=.22,e.haloSharpness+=.18,e.equatorBias+=.12,e.diskAmount+=.12,e.auraAmount+=.08,e.bloomAmount+=.08,e.centerDarkness+=.06;break;case"cylinder":e.scaleX*=.96,e.scaleZ*=1.14,e.scriptWarp+=.06,e.flowAmount+=.08,e.lacquerAmount+=.08;break;case"plane":e.scaleX*=1.08,e.scaleY*=.78,e.scaleZ*=1.08,e.droop+=.08,e.bandStrength+=.12,e.grainStrength+=.08,e.haloSpread*=.88,e.blendMode="normal";break;case"image":e.grainStrength+=.12,e.poreAmount+=.08,e.bloomAmount+=.06,e.lacquerAmount+=.04;break;case"video":e.auraAmount+=.12,e.bloomAmount+=.12,e.scanScale*=1.18,e.bandStrength+=.08;break;case"sphere":e.scaleX*=1.04,e.scaleY*=1.04,e.scaleZ*=1.04,e.auraAmount+=.08,e.radialLift+=.06;break}return e.quantize=Math.min(.52,Math.max(0,e.quantize)),e.poreAmount=l(e.poreAmount),e.sporeAmount=l(e.sporeAmount),e.bloomAmount=l(e.bloomAmount),e.centerDarkness=l(e.centerDarkness),e.auraAmount=l(e.auraAmount),e.diskAmount=l(e.diskAmount),e.lacquerAmount=l(e.lacquerAmount),e.flowAmount=l(e.flowAmount),e}function Qa(a,r,e){const t={...a};switch(`${e}:${r}`){case"text:rune_smoke":t.runeAmount+=.22,t.ledgerAmount+=.14,t.coreTightness+=.12,t.scaleMul*=.94,t.blending="normal";break;case"text:static_smoke":t.staticAmount+=.12,t.runeAmount+=.08,t.ledgerAmount+=.08,t.scaleMul*=.9,t.blending="normal";break;case"text:soot_veil":t.sootAmount+=.12,t.ledgerAmount+=.12,t.glowMul*=.94,t.blending="normal";break;case"grid:static_smoke":t.staticAmount+=.24,t.ledgerAmount+=.14,t.grain+=.1,t.scaleMul*=.92,t.edgeFade=Math.max(.08,t.edgeFade-.05),t.blending="normal";break;case"grid:soot_veil":t.sootAmount+=.12,t.velvetAmount+=.06,t.blending="normal";break;case"ring:dust_plume":t.plumeAmount+=.12,t.dustAmount+=.12,t.edgeFade+=.06;break;case"ring:mirage_smoke":t.mirageAmount+=.16,t.swirl+=.08,t.glowMul*=1.06;break;case"ring:eclipse_halo":t.coreTightness+=.1,t.mirageAmount+=.08,t.edgeFade+=.04;break;case"plane:soot_veil":t.sootAmount+=.18,t.ledgerAmount+=.14,t.velvetAmount+=.08,t.blending="normal";break;case"plane:velvet_ash":t.velvetAmount+=.18,t.coreTightness+=.08,t.blending="normal";break}return t.coreTightness=l(t.coreTightness),t.plumeAmount=l(t.plumeAmount),t.mirageAmount=l(t.mirageAmount),t.staticAmount=l(t.staticAmount),t.dustAmount=l(t.dustAmount),t.sootAmount=l(t.sootAmount),t.runeAmount=l(t.runeAmount),t.velvetAmount=l(t.velvetAmount),t.ledgerAmount=l(t.ledgerAmount),t}function er(a,r){const e={...a};switch(r){case"text":e.runeAmount+=.28,e.ledgerAmount+=.22,e.coreTightness+=.12,e.scaleMul*=.88,e.planeScaleMul*=.9,e.glowMul*=1.06,e.blending="normal";break;case"grid":e.ledgerAmount+=.32,e.staticAmount+=.22,e.densityMul*=1.08,e.scaleMul*=.92,e.planeScaleMul*=.94,e.grain+=.08,e.coreTightness+=.12,e.edgeFade-=.04,e.blending="normal";break;case"ring":e.glowMul*=1.12,e.anisotropyAdd+=.12,e.depthMul*=1.08,e.swirl+=.12,e.mirageAmount+=.16,e.plumeAmount+=.08,e.edgeFade+=.06;break;case"cylinder":e.streak+=.14,e.anisotropyAdd+=.18,e.driftMul*=1.06,e.scaleMul*=.96,e.depthMul*=1.04;break;case"plane":e.ledgerAmount+=.28,e.sootAmount+=.08,e.velvetAmount+=.1,e.densityMul*=1.1,e.scaleMul*=.88,e.verticalBias-=.08,e.edgeFade-=.04,e.blending="normal";break;case"image":e.mirageAmount+=.12,e.grain+=.06,e.edgeFade+=.04;break;case"video":e.runeAmount+=.08,e.pulseNoise+=.14,e.mirageAmount+=.14,e.staticAmount+=.12,e.glowMul*=1.08;break;case"sphere":e.plumeAmount+=.1,e.scaleMul*=1.04,e.depthMul*=1.04,e.verticalBias+=.06;break}return e.coreTightness=l(e.coreTightness),e.pulseNoise=Math.min(1.2,Math.max(0,e.pulseNoise)),e.plumeAmount=l(e.plumeAmount),e.fallAmount=l(e.fallAmount),e.mirageAmount=l(e.mirageAmount),e.staticAmount=l(e.staticAmount),e.dustAmount=l(e.dustAmount),e.sootAmount=l(e.sootAmount),e.runeAmount=l(e.runeAmount),e.velvetAmount=l(e.velvetAmount),e.ledgerAmount=l(e.ledgerAmount),e.edgeFade=Math.min(.48,Math.max(.08,e.edgeFade)),e}function tr(a,r,e){const t={...a};switch(`${e}:${r}`){case"text:ink_bleed":t.glyphGrid+=.14,t.runeRetention+=.16,t.bleedSpread+=.12,t.velvetMatte+=.08,t.normalBlend=!0;break;case"text:drift_glyph_dust":t.glyphGrid+=.16,t.runeRetention+=.16,t.opacityMul*=.92,t.vaporLift+=.08,t.normalBlend=!0;break;case"grid:stipple_field":t.bandsMul*=1.08,t.bandWarp+=.22,t.glyphGrid+=.14,t.contourMix+=.14,t.sootStain+=.08,t.velvetMatte+=.06,t.normalBlend=!0;break;case"grid:deposition_field":t.bandsMul*=1.1,t.bandWarp+=.14,t.contourMix+=.08,t.normalBlend=!0;break;case"ring:ink_bleed":t.contourMix+=.12,t.vaporLift+=.12,t.rotationMul*=1.06;break;case"ring:contour_echo":t.contourMix+=.14,t.opacityMul*=.96;break;case"plane:ink_bleed":t.sootStain+=.14,t.velvetMatte+=.14,t.bleedSpread+=.12,t.normalBlend=!0;break;case"plane:deposition_field":t.sootStain+=.1,t.velvetMatte+=.08,t.bandWarp+=.08,t.normalBlend=!0;break}return t.bandWarp=l(t.bandWarp),t.bleedSpread=l(t.bleedSpread),t.glyphGrid=l(t.glyphGrid),t.contourMix=l(t.contourMix),t.sootStain=l(t.sootStain),t.runeRetention=l(t.runeRetention),t.velvetMatte=l(t.velvetMatte),t.vaporLift=l(t.vaporLift),t}function ar(a,r){const e={...a};switch(r){case"text":e.glyphGrid+=.22,e.runeRetention+=.22,e.contourMix+=.18,e.bandWarp+=.08,e.scaleMul*=.96,e.scaleYMul*=.86,e.dotSoftness*=1.04,e.normalBlend=!0;break;case"grid":e.glyphGrid+=.16,e.contourMix+=.12,e.bandWarp+=.16,e.bandsMul*=1.08,e.bandsMin=Math.max(e.bandsMin,4),e.dotField=Math.min(1,e.dotField+.06),e.scaleYMul*=.9,e.normalBlend=!0;break;case"ring":e.contourMix+=.2,e.bleedSpread+=.1,e.vaporLift+=.18,e.rotationMul*=1.08,e.pitchMul*=.92,e.opacityMul*=.96;break;case"plane":e.sootStain+=.12,e.velvetMatte+=.14,e.bleedSpread+=.12,e.scaleMul*=1.02,e.scaleYMul*=.94,e.normalBlend=!0;break;case"cylinder":e.rotationMul*=1.12,e.pitchMul*=1.08,e.glyphGrid+=.08,e.bandWarp+=.12;break;case"image":e.bleedSpread+=.14,e.contourMix+=.08,e.dotSoftness*=1.08,e.scaleMul*=1.04;break;case"video":e.vaporLift+=.18,e.bleedSpread+=.1,e.rotationMul*=1.04,e.opacityMul*=.98;break;case"sphere":e.contourMix+=.08,e.vaporLift+=.08,e.scaleMul*=1.06;break}return e.bandWarp=l(e.bandWarp),e.bleedSpread=l(e.bleedSpread),e.glyphGrid=l(e.glyphGrid),e.contourMix=l(e.contourMix),e.sootStain=l(e.sootStain),e.runeRetention=l(e.runeRetention),e.velvetMatte=l(e.velvetMatte),e.vaporLift=l(e.vaporLift),e}function rr(a,r){const e={...a};switch(r){case"text":e.copies+=1,e.spread+=.08,e.quantize+=.16,e.gateFreq+=.18,e.gateThreshold+=.06,e.widthMul*=.96,e.motionMul*=.9,e.tintMix+=.08,e.blendMode="normal";break;case"grid":e.spread+=.06,e.jitter*=.84,e.shear+=.08,e.quantize+=.24,e.gateFreq+=.14,e.gateThreshold+=.08,e.widthMul*=.94,e.shimmerMul*=.94,e.blendMode="normal";break;case"ring":e.spread+=.12,e.drift+=.08,e.shimmerMul*=1.08,e.tintMix+=.06;break;case"plane":e.spread+=.1,e.jitter+=.04,e.opacityMul*=.94,e.widthMul*=1.06,e.blendMode="normal";break}return e.quantize=l(e.quantize),e.gateThreshold=Math.min(.8,Math.max(0,e.gateThreshold)),e.tintMix=l(e.tintMix),e}function or(a,r,e){const t={...a};switch(`${e}:${r}`){case"text:contour_echo":t.copies+=1,t.spread+=.18,t.quantize+=.12,t.widthMul*=1.08,t.motionMul*=.82,t.tintMix+=.06,t.blendMode="normal";break;case"text:shell_script":t.spread+=.08,t.shear+=.1,t.quantize+=.1,t.gateFreq+=.22,t.gateThreshold+=.08,t.opacityMul*=.9,t.blendMode="normal";break;case"text:glyph_weave":t.copies+=1,t.spread+=.12,t.quantize+=.14,t.shimmerMul*=1.08,t.tintMix+=.12,t.blendMode="normal";break;case"text:ink_bleed":t.spread+=.14,t.jitter+=.08,t.zJitter+=.08,t.opacityMul*=.92,t.widthMul*=1.08,t.blendMode="normal";break;case"text:drift_glyph_dust":t.dropout+=.06,t.jitter+=.06,t.gateThreshold+=.08,t.widthMul*=.92,t.motionMul*=1.06,t.blendMode="normal";break;case"grid:contour_echo":t.spread+=.08,t.quantize+=.16,t.widthMul*=1.06,t.motionMul*=.86,t.blendMode="normal";break;case"grid:standing_interference":t.shear+=.14,t.gateFreq+=.12,t.gateThreshold+=.06,t.zJitter+=.06,t.blendMode="normal";break;case"grid:tremor_lattice":t.jitter+=.08,t.zJitter+=.08,t.gateFreq+=.1,t.quantize+=.08,t.blendMode="normal";break}return t.dropout=l(t.dropout),t.quantize=l(t.quantize),t.gateThreshold=Math.min(.86,Math.max(0,t.gateThreshold)),t.tintMix=l(t.tintMix),t}function Ot(a,r){const e={...a};switch(r){case"text":e.rippleMul*=.88,e.contourBands+=.12,e.contourSharpness+=.14,e.plateMix+=.18,e.echoMix+=.04,e.planarPull+=.16,e.rotationMul*=.84,e.blendMode="normal";break;case"grid":e.rippleMul*=.94,e.contourBands+=.18,e.contourSharpness+=.1,e.plateMix+=.12,e.echoMix+=.1,e.shearMix+=.18,e.planarPull+=.12,e.opacityMul*=.95,e.blendMode="normal";break;case"ring":e.echoMix+=.22,e.fresnelAdd+=.12,e.rotationMul*=1.08;break;case"plane":e.plateMix+=.12,e.planarPull+=.2,e.contourSharpness+=.08,e.blendMode="normal";break}return e.contourBands=l(e.contourBands),e.contourSharpness=l(e.contourSharpness),e.plateMix=l(e.plateMix),e.echoMix=l(e.echoMix),e.shearMix=l(e.shearMix),e.planarPull=l(e.planarPull),e}function Ht(a,r,e){const t={...a};switch(`${e}:${r}`){case"text:surface_patch":t.plateMix+=.14,t.planarPull+=.1,t.rotationMul*=.9,t.blendMode="normal";break;case"text:contour_echo":t.contourBands+=.18,t.contourSharpness+=.16,t.plateMix+=.18,t.echoMix+=.08,t.planarPull+=.18,t.rotationMul*=.74,t.blendMode="normal";break;case"text:standing_interference":t.shearMix+=.1,t.echoMix+=.08,t.planarPull+=.08,t.blendMode="normal";break;case"grid:contour_echo":t.contourBands+=.12,t.contourSharpness+=.12,t.plateMix+=.12,t.shearMix+=.08,t.planarPull+=.12,t.rotationMul*=.86,t.blendMode="normal";break;case"grid:standing_interference":t.echoMix+=.12,t.shearMix+=.18,t.planarPull+=.06,t.rotationMul*=1.04,t.blendMode="normal";break;case"grid:tremor_lattice":t.rippleMul*=1.08,t.contourBands+=.08,t.shearMix+=.14,t.planarPull+=.08,t.rotationMul*=1.08,t.blendMode="normal";break;case"ring:echo_rings":t.echoMix+=.16,t.fresnelAdd+=.08,t.rotationMul*=1.12;break}return t.contourBands=l(t.contourBands),t.contourSharpness=l(t.contourSharpness),t.plateMix=l(t.plateMix),t.echoMix=l(t.echoMix),t.shearMix=l(t.shearMix),t.planarPull=l(t.planarPull),t}const q={jitterMul:1,opacityMul:1,opacityAdd:0,fresnelAdd:0,wireframe:null,wireOpacity:.28,scaleX:1,scaleY:1,scaleZ:1,radialLift:0,ringLift:0,spikeStrength:0,quantize:0,droop:0,mirrorWarp:0,scriptWarp:0,ridgeAmount:0,ridgeFreq:3.2,seamAmount:0,petalAmount:0,frostAmount:0,crownAmount:0,riftAmount:0,creaseAmount:0,scanScale:.16,bandStrength:.18,grainStrength:.08,haloSpread:.14,haloSharpness:.18,edgeTint:.18,etchStrength:.08,equatorBias:0,poreAmount:0,sporeAmount:0,bloomAmount:0,centerDarkness:0,auraAmount:0,diskAmount:0,lacquerAmount:0,flowAmount:0,blendMode:"additive"},Ut={aura_shell:{crownAmount:.48,creaseAmount:.08,jitterMul:.5,opacityMul:.86,fresnelAdd:.24,scaleX:1.08,scaleY:.92,scaleZ:1.08,radialLift:.08,ridgeAmount:.14,ridgeFreq:4.2,petalAmount:.22,haloSpread:.7,haloSharpness:.42,scanScale:.28,edgeTint:.52,bloomAmount:.34,auraAmount:.92,diskAmount:.12,wireframe:!1},halo_bloom:{crownAmount:.34,creaseAmount:.12,jitterMul:.72,opacityMul:1.22,fresnelAdd:.34,scaleX:1.16,scaleY:.74,scaleZ:1.16,radialLift:.1,ringLift:.2,ridgeAmount:.08,ridgeFreq:6,petalAmount:.36,haloSpread:1.08,haloSharpness:.94,edgeTint:.96,bloomAmount:.92,equatorBias:.18,centerDarkness:.24,wireframe:!1},mirror_skin:{riftAmount:.22,creaseAmount:.2,jitterMul:.34,opacityMul:.86,fresnelAdd:.22,scaleX:1.22,scaleY:.92,scaleZ:.76,mirrorWarp:.18,seamAmount:.78,ridgeAmount:.12,ridgeFreq:2,scanScale:.84,bandStrength:.66,grainStrength:.04,haloSpread:.24,haloSharpness:.16,edgeTint:.54,etchStrength:.22,wireframe:!1},membrane_pollen:{crownAmount:.14,riftAmount:.08,jitterMul:.54,opacityMul:1.08,fresnelAdd:.28,scaleX:1.04,scaleY:.96,scaleZ:1.04,spikeStrength:.1,ridgeAmount:.18,ridgeFreq:7,petalAmount:.12,scanScale:.36,bandStrength:.32,grainStrength:.28,haloSpread:.42,haloSharpness:.28,edgeTint:.42,poreAmount:.78,sporeAmount:.24,bloomAmount:.16,equatorBias:.04,blendMode:"normal"},spore_halo:{crownAmount:.26,riftAmount:.12,jitterMul:.72,opacityMul:1.06,fresnelAdd:.36,radialLift:.06,ringLift:.16,ridgeAmount:.16,ridgeFreq:8,petalAmount:.18,scanScale:.24,bandStrength:.26,grainStrength:.38,haloSpread:.94,haloSharpness:.82,edgeTint:.76,sporeAmount:.84,bloomAmount:.42,equatorBias:.1,centerDarkness:.18,wireframe:!1},calcified_skin:{riftAmount:.28,creaseAmount:.32,jitterMul:.16,opacityMul:.82,fresnelAdd:.08,wireframe:!0,wireOpacity:.48,quantize:.17,ridgeAmount:.48,ridgeFreq:5,seamAmount:.22,frostAmount:.14,scanScale:.12,bandStrength:.14,grainStrength:.56,haloSpread:.16,haloSharpness:.18,edgeTint:.12,etchStrength:.04},residue_skin:{riftAmount:.18,creaseAmount:.22,jitterMul:.22,opacityMul:.62,fresnelAdd:.1,wireframe:!0,wireOpacity:.34,quantize:.08,droop:.18,seamAmount:.34,ridgeAmount:.2,ridgeFreq:2.4,scanScale:.22,bandStrength:.3,grainStrength:.42,haloSpread:.12,haloSharpness:.12,edgeTint:.12,etchStrength:.12},shell_script:{creaseAmount:.44,riftAmount:.12,jitterMul:.24,opacityMul:.88,fresnelAdd:.28,wireframe:!0,wireOpacity:.24,scaleX:1.12,scaleY:.9,scaleZ:1.16,radialLift:.02,scriptWarp:.28,ridgeAmount:.26,ridgeFreq:9,seamAmount:.48,scanScale:1.08,bandStrength:1.02,grainStrength:.1,haloSpread:.26,haloSharpness:.24,edgeTint:.46,etchStrength:.96,blendMode:"normal"},eclipse_halo:{crownAmount:.12,creaseAmount:.2,jitterMul:.16,opacityMul:.9,fresnelAdd:.46,wireframe:!1,scaleX:1.26,scaleY:.5,scaleZ:1.26,radialLift:.02,ringLift:.3,petalAmount:.18,ridgeAmount:.12,ridgeFreq:6,scanScale:.16,bandStrength:.28,haloSpread:1.08,haloSharpness:1,edgeTint:1,etchStrength:.04,equatorBias:.2,bloomAmount:.3,centerDarkness:.72,diskAmount:.94},resin_shell:{crownAmount:.08,creaseAmount:.14,jitterMul:.1,opacityMul:1.02,opacityAdd:.04,fresnelAdd:.14,wireframe:!1,scaleX:1.08,scaleY:.88,scaleZ:1.1,droop:.16,ridgeAmount:.1,ridgeFreq:3,scanScale:.1,bandStrength:.16,grainStrength:.03,haloSpread:.08,haloSharpness:.1,edgeTint:.18,etchStrength:.02,lacquerAmount:.92,flowAmount:.48,blendMode:"normal"},freeze_skin:{riftAmount:.16,creaseAmount:.24,jitterMul:.08,opacityMul:.9,opacityAdd:-.02,fresnelAdd:.34,wireframe:!1,scaleX:1.04,scaleY:.94,scaleZ:1.04,radialLift:.02,ringLift:.08,quantize:.14,ridgeAmount:.34,ridgeFreq:7,seamAmount:.18,frostAmount:.92,scanScale:.08,bandStrength:.24,grainStrength:.16,haloSpread:.22,haloSharpness:.74,edgeTint:.62,etchStrength:.18,poreAmount:.04,sporeAmount:.02,bloomAmount:.1,centerDarkness:.06,diskAmount:.18,blendMode:"normal"}},Vt=`
  varying vec3 vNormalView;
  varying vec3 vWorldPos;
  void main() {
    vNormalView = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`,Gt=`
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPulse;
  uniform float uFresnel;
  uniform float uMaterialStyle;
  uniform float uScanScale;
  uniform float uBandStrength;
  uniform float uGrainStrength;
  uniform float uHaloSpread;
  uniform float uHaloSharpness;
  uniform float uEdgeTint;
  uniform float uEtchStrength;
  uniform float uPoreAmount;
  uniform float uSporeAmount;
  uniform float uBloomAmount;
  uniform float uCenterDarkness;
  uniform float uAuraAmount;
  uniform float uDiskAmount;
  uniform float uLacquerAmount;
  uniform float uFlowAmount;
  uniform float uRidgeAmount;
  uniform float uSeamAmount;
  uniform float uFrostAmount;
  uniform float uCrownAmount;
  uniform float uRiftAmount;
  uniform float uCreaseAmount;
  varying vec3 vNormalView;
  varying vec3 vWorldPos;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }

  void main() {
    vec3 n = normalize(vNormalView);
    float facing = clamp(abs(n.z), 0.0, 1.0);
    float fresnel = pow(clamp(1.0 - facing, 0.0, 1.0), mix(1.2, 4.8, clamp(uFresnel, 0.0, 1.0)));
    float scan = 0.5 + 0.5 * sin(vWorldPos.y * (0.06 + uScanScale * 0.18) + vWorldPos.x * (0.03 + uBandStrength * 0.09) + uPulse * (4.0 + uEtchStrength * 3.6));
    float etch = 0.5 + 0.5 * sin((vWorldPos.x * 0.08 + vWorldPos.z * 0.06) * (2.0 + uBandStrength * 4.6) + vWorldPos.y * (0.03 + uEtchStrength * 0.12));
    vec3 dir = normalize(vWorldPos + vec3(1e-5));
    float equator = 1.0 - abs(dir.y);
    float halo = pow(clamp(1.0 - facing, 0.0, 1.0), 0.85 + uHaloSpread * 4.25);
    float ring = pow(clamp(equator, 0.0, 1.0), 1.1 + uHaloSharpness * 4.6);
    float bloom = smoothstep(0.18, 0.92, equator) * (0.45 + 0.55 * scan);
    float grain = hash(floor(vWorldPos * 0.24));
    float poreCell = hash(floor(vWorldPos * (0.12 + uPoreAmount * 0.26)) + vec3(7.0, 19.0, 31.0));
    float poreMask = (1.0 - smoothstep(0.46, 0.78, poreCell)) * uPoreAmount * ring;
    float sporeCell = hash(floor(vWorldPos * (0.08 + uSporeAmount * 0.22)) + vec3(17.0, 29.0, 11.0));
    float sporeMask = smoothstep(0.72, 0.96, sporeCell) * (0.2 + ring * 0.8) * uSporeAmount;
    float centerShade = facing * (1.0 - ring) * uCenterDarkness;
    float auraGlow = pow(clamp(1.0 - facing, 0.0, 1.0), 0.48 + uAuraAmount * 2.2) * (0.35 + 0.65 * scan);
    float diskMask = mix(1.0, smoothstep(0.08, 0.96, ring), clamp(uDiskAmount, 0.0, 1.0));
    float lacquerSpec = pow(max(0.0, dot(normalize(vec3(0.34, 0.72, 0.58)), n)), 4.0 + uLacquerAmount * 22.0);
    float flowWave = 0.5 + 0.5 * sin(vWorldPos.y * (0.1 + uFlowAmount * 0.28) - vWorldPos.z * 0.08 + uPulse * (2.8 + uFlowAmount * 2.2));
    float azimuth = atan(vWorldPos.z, vWorldPos.x);
    float ridgeWave = 0.5 + 0.5 * sin(azimuth * (3.0 + uRidgeAmount * 9.0) + vWorldPos.y * 0.04 + uPulse * 2.4);
    float seamMask = 1.0 - smoothstep(0.08, 0.34 + uSeamAmount * 0.26, abs(sin(azimuth * 0.5)));
    float frostNoise = hash(floor(vWorldPos * (0.12 + uFrostAmount * 0.34)) + vec3(23.0, 5.0, 17.0));
    float frostMask = smoothstep(0.58, 0.94, frostNoise) * (0.24 + ring * 0.76) * uFrostAmount;
    vec3 base = uColor * (0.16 + facing * 0.46 + scan * 0.1 + etch * uEtchStrength * 0.16 + bloom * uBloomAmount * 0.08 + auraGlow * uAuraAmount * 0.1 + lacquerSpec * uLacquerAmount * 0.12);
    base *= 0.92 + mix(-0.16, 0.18, grain) * uGrainStrength;
    base *= 1.0 - centerShade * (0.52 + uDiskAmount * 0.2);
    base *= 1.0 - poreMask * 0.24;
    base = mix(base, base * (0.88 + flowWave * 0.2), uFlowAmount * 0.55);
    base = mix(base, base * (0.84 + ridgeWave * 0.28), uRidgeAmount * 0.46);
    base = mix(base, mix(base, vec3(1.0), 0.22 + ridgeWave * 0.18), frostMask * 0.72);
    vec3 edgeColor = mix(uColor, vec3(1.0), 0.18 + uEdgeTint * 0.36 + sporeMask * 0.2 + uBloomAmount * 0.08 + uAuraAmount * 0.12 + uLacquerAmount * 0.08 + frostMask * 0.22);
    vec3 edge = edgeColor * (fresnel * (0.82 + uPulse * 1.28) + halo * (0.18 + uHaloSpread * 0.64) + ring * uBloomAmount * (0.38 + uDiskAmount * 0.24) + sporeMask * 0.22 + auraGlow * uAuraAmount * 0.54 + lacquerSpec * uLacquerAmount * 0.28 + seamMask * uSeamAmount * 0.24 + frostMask * 0.18);
    float alpha = uOpacity * clamp((0.16 + facing * 0.4 + fresnel * 0.58 + halo * 0.28 + etch * uEtchStrength * 0.1 + ring * uBloomAmount * 0.14 + ridgeWave * uRidgeAmount * 0.12) * mix(1.0, diskMask, 0.42 * uDiskAmount) + auraGlow * uAuraAmount * 0.2 + lacquerSpec * uLacquerAmount * 0.08, 0.0, 1.0);
    alpha *= clamp(1.0 - poreMask * 0.42 + sporeMask * 0.12 - centerShade * (0.28 + uDiskAmount * 0.12) + flowWave * uFlowAmount * 0.06 + seamMask * uSeamAmount * 0.08 + frostMask * 0.1, 0.05, 1.2);
    if (uMaterialStyle > 0.5 && uMaterialStyle < 1.5) {
      base = mix(base, vec3(1.0), 0.12 + fresnel * 0.18);
      edge += vec3(0.12, 0.18, 0.26) * 0.28;
      alpha *= 0.78;
    } else if (uMaterialStyle > 1.5 && uMaterialStyle < 2.5) {
      float holo = 0.5 + 0.5 * sin(vWorldPos.y * 0.12 + uPulse * 10.0 + uScanScale * 6.0);
      base = mix(base, vec3(0.3, 0.92, 1.0), 0.42);
      edge += vec3(0.1, 0.8, 1.0) * holo * 0.28;
    } else if (uMaterialStyle > 2.5 && uMaterialStyle < 3.5) {
      float band = 0.5 + 0.5 * sin(vWorldPos.y * 0.06 - vWorldPos.x * (0.04 + uBandStrength * 0.05));
      base = mix(vec3(0.16, 0.17, 0.2), vec3(0.95), band * 0.8);
      base *= mix(uColor, vec3(1.0), 0.4);
    } else if (uMaterialStyle > 3.5) {
      vec2 dotsUv = fract(vWorldPos.xy * 0.06) - 0.5;
      float dots = 1.0 - smoothstep(0.08, 0.28, length(dotsUv));
      alpha *= mix(0.42, 1.0, dots);
      base *= 0.5 + dots * 0.7;
    }
    gl_FragColor = vec4(base + edge, alpha);
  }
`;function Yt(a,r){return $e(a,r)}function Nt(a){return{...q,...Ut[a]??{}}}function Zt(a){switch(a){case"text":return{ledger:.86,canopy:.08,ring:.04,orbit:.06,column:.18,fracture:.42,veil:.1,bloom:.04,lacquer:.04};case"grid":return{ledger:.64,canopy:.08,ring:.06,orbit:.04,column:.28,fracture:.34,veil:.08,bloom:.04,lacquer:.04};case"ring":case"disc":case"torus":return{ledger:.04,canopy:.08,ring:.84,orbit:.52,column:.04,fracture:.08,veil:.12,bloom:.24,lacquer:.08};case"spiral":case"galaxy":return{ledger:.06,canopy:.12,ring:.24,orbit:.82,column:.08,fracture:.12,veil:.28,bloom:.18,lacquer:.06};case"image":case"video":return{ledger:.08,canopy:.58,ring:.1,orbit:.14,column:.08,fracture:.1,veil:.34,bloom:.46,lacquer:.14};case"plane":return{ledger:.34,canopy:.26,ring:.08,orbit:.08,column:.12,fracture:.18,veil:.18,bloom:.12,lacquer:.08};case"cube":case"cylinder":case"cone":return{ledger:.16,canopy:.12,ring:.04,orbit:.06,column:.82,fracture:.56,veil:.1,bloom:.08,lacquer:.12};case"sphere":case"center":case"random":default:return{ledger:.08,canopy:.18,ring:.12,orbit:.08,column:.12,fracture:.08,veil:.12,bloom:.24,lacquer:.08}}}function Xt(a,r){const e=Re(a,r);return Xe(a,r,[e.pointBudget])}function $t(a,r){const e=Te(a,r,!1,"aux");if(!e||e.count<12)return null;const t=Re(a,r).pointBudget,u=Ze(a,r),m=Math.max(12,Math.min(e.count,u.maxHullPoints,Math.floor(t))),n=new Uint32Array(m);for(let s=0;s<m;s+=1)n[s]=Math.min(e.count-1,Math.floor(s/Math.max(1,m-1)*Math.max(0,e.count-1)));return{particleData:e,sampledIndices:n,usedCount:m}}function It(a,r){const e=Yt(a,r),t=Ct(a,r);return Wt(jt(Nt(e),t),e,t)}function Jt(a){const r=new Et(a);return r.computeVertexNormals(),r.computeBoundingSphere(),r}function Kt(a,r){const e=Re(a,r);return{uColor:{value:new ve(e.color)},uOpacity:{value:e.opacity},uPulse:{value:0},uFresnel:{value:e.fresnel},uMaterialStyle:{value:0},uScanScale:{value:q.scanScale},uBandStrength:{value:q.bandStrength},uGrainStrength:{value:q.grainStrength},uHaloSpread:{value:q.haloSpread},uHaloSharpness:{value:q.haloSharpness},uEdgeTint:{value:q.edgeTint},uEtchStrength:{value:q.etchStrength},uPoreAmount:{value:q.poreAmount},uSporeAmount:{value:q.sporeAmount},uBloomAmount:{value:q.bloomAmount},uCenterDarkness:{value:q.centerDarkness},uAuraAmount:{value:q.auraAmount},uDiskAmount:{value:q.diskAmount},uLacquerAmount:{value:q.lacquerAmount},uFlowAmount:{value:q.flowAmount},uRidgeAmount:{value:q.ridgeAmount},uSeamAmount:{value:q.seamAmount},uFrostAmount:{value:q.frostAmount},uCrownAmount:{value:q.crownAmount},uRiftAmount:{value:q.riftAmount},uCreaseAmount:{value:q.creaseAmount}}}function Qt(a){switch(a){case"glass":return 1;case"hologram":return 2;case"chrome":return 3;case"halftone":return 4;case"ink":return 5;case"paper":return 6;case"stipple":return 7;default:return 0}}function Ee(a){switch(a){case"ink":case"stipple":return 4;case"paper":return 0;default:return Qt(a)}}function nr(){return[{label:"Classic",val:"classic"},{label:"Glass",val:"glass"},{label:"Hologram",val:"hologram"},{label:"Chrome",val:"chrome"},{label:"Halftone",val:"halftone"},{label:"Ink",val:"ink"},{label:"Paper",val:"paper"},{label:"Stipple",val:"stipple"}]}function ur(a){return a==="halftone"||a==="ink"||a==="stipple"}const c=new re,C=new re,Ge=new re;function ea({config:a,layerIndex:r,audioRef:e,isPlaying:t,layout:u,shellProfile:m,sourceProfile:n,shellMaterialRef:s,wireMaterialRef:M,shellMeshRef:b,wireMeshRef:A}){const g=h.useRef(0),f=h.useRef([]),w=h.useRef(null),_=h.useRef(_e());h.useEffect(()=>()=>{var L;(L=w.current)==null||L.dispose(),w.current=null},[]),Ae(({clock:L})=>{var ue;const d=s.current,v=M.current,U=b.current,T=A.current;if(!u||!d||!v||!U||!T)return;const o=m,S=n,D=Re(a,r),k=Be(a,e.current,_.current),z=Pe(k,"shell"),p=u.particleData;if(!p)return;const i=a.sphereRadius*D.radiusScale,I=D.jitter*o.jitterMul,Y=a.audioEnabled?e.current.pulse*a.audioBurstScale:0,P=a.audioEnabled?e.current.bass*a.audioBeatScale:0,J=D.audioReactive+z.displacement*.55,x=Math.max(.18,1-z.sliceDepth*.3),B=L.getElapsedTime(),oe=u.usedCount;for(;f.current.length<oe;)f.current.push(new re);for(let F=0;F<oe;F+=1){const de=u.sampledIndices[F]??0,ge=pe({config:a,layerIndex:r,particleData:p,index:de,globalRadius:i,time:B}),Se=F*.37+B*.8;C.set(Math.sin(Se),Math.cos(Se*1.13),Math.sin(Se*.71)),C.multiplyScalar(i*I*(.35+Y*J*.9)),c.copy(ge).add(C),c.x*=o.scaleX,c.y*=o.scaleY,c.z*=o.scaleZ;const ce=Math.max(1e-5,c.length());C.copy(c).multiplyScalar(1/ce);const V=1-Math.min(1,Math.abs(C.y)),$=Math.atan2(C.z,C.x),O=Math.sin(C.x*(2.8+o.bandStrength*4.2)+C.z*(2.1+o.scanScale*3.4)+B*(.45+o.etchStrength*1.7)+F*.09),j=Math.sin($*Math.max(1,o.ridgeFreq)+C.y*(1.6+o.bandStrength*2.4)+B*(.28+o.ridgeAmount*.72)),G=Math.cos($*(4+o.petalAmount*6)-B*.22+V*2.4),ee=1-Math.min(1,Math.abs(Math.sin($*.5))),W=Math.pow(Math.max(0,V),1.1+o.haloSharpness*3.8),te=.5+.5*Math.sin(F*1.91+B*.82+C.x*4.2+C.z*3.1),We=o.poreAmount>0?Math.max(0,te-.58)*o.poreAmount*W:0,Fe=o.auraAmount*(.02+W*.1+(.5+.5*O)*.04),Ce=o.diskAmount*W*(.03+te*.07),be=i*(o.radialLift*V+o.ringLift*Math.pow(V,2.2)+o.equatorBias*W+o.spikeStrength*Math.max(0,O)*(.35+V*.65)+o.ridgeAmount*j*(.02+V*.08)+o.petalAmount*G*(.015+W*.06)+o.frostAmount*Math.max(0,j)*W*.05+o.crownAmount*Math.max(0,C.y)*(.03+W*.03)+o.riftAmount*-Math.pow(ee,1.6)*(.01+V*.04)+o.bloomAmount*W*(.02+te*.05)+o.sporeAmount*(te-.5)*W*.06+S.canopy*Math.max(0,C.y)*(.015+V*.05)+S.ring*W*(.018+Math.max(0,j)*.028)+S.bloom*(te-.35)*W*.05+Fe+Ce-We*.06);if(be!==0&&c.addScaledVector(C,be),o.mirrorWarp>0&&(c.x=Math.sign(c.x||1)*Math.pow(Math.abs(c.x),Math.max(.72,.95-o.mirrorWarp*.25)),c.z*=1-o.mirrorWarp*.24+V*o.mirrorWarp*.18),o.seamAmount>0&&(c.addScaledVector(C,-i*o.seamAmount*.06*ee),c.y+=i*o.seamAmount*.03*(ee-.35)),o.creaseAmount>0&&(c.x+=Math.sin($*(5+o.creaseAmount*7)+B*.34)*i*o.creaseAmount*.02,c.z+=Math.cos($*(4+o.creaseAmount*6)-B*.29)*i*o.creaseAmount*.02),S.ledger>0){const E=Math.sin(c.y*(.22+S.ledger*.16)+$*(.42+S.ledger*.64)+B*.12);c.x+=E*i*S.ledger*.012,c.z-=E*i*S.ledger*.01;const he=Math.max(i*.045,1e-4);c.y=me.lerp(c.y,Math.round(c.y/he)*he,Math.min(.16,S.ledger*.1))}if(S.column>0){const E=1-V;c.y*=1+S.column*.08,c.x*=1-S.column*.035*E,c.z*=1-S.column*.035*E}if(c.z*=x,S.orbit>0){const E=S.orbit*(.1+W*.14)*Math.sin(B*.34+$*.52+F*.01),he=Math.cos(E),ye=Math.sin(E),xe=c.x,we=c.z;c.x=xe*he-we*ye,c.z=xe*ye+we*he}if(S.fracture>0){const E=Math.sign(Math.sin($*(3+S.fracture*5)+B*.18));c.addScaledVector(C,i*S.fracture*.01*E),c.y+=E*i*S.fracture*.008*(.3+V)}if(S.veil>0&&(c.y+=Math.sin(c.x*.06+B*.46+F*.03)*i*S.veil*.018),o.scriptWarp>0&&c.addScaledVector(C,i*o.scriptWarp*.04*Math.sin(c.y*.18+c.x*.07+B*.7+F*.2)),o.diskAmount>0&&(c.y*=1-o.diskAmount*(.18+W*.22),c.x*=1+o.diskAmount*(.04+W*.06),c.z*=1+o.diskAmount*(.04+W*.06)),o.auraAmount>0&&c.addScaledVector(C,i*o.auraAmount*.025*Math.sin(B*.72+F*.13+V*2)),o.centerDarkness>0&&(c.y*=1-o.centerDarkness*.08*V),(o.droop>0||o.flowAmount>0)&&(c.y-=i*(o.droop*.12*(.55+Math.max(0,-C.y))+o.flowAmount*.05*(.5+te)),c.x+=Math.sin(c.y*.12+F*.08+B*.6)*i*o.flowAmount*.018),(o.lacquerAmount>0||S.lacquer>0)&&(Ge.copy(C).multiplyScalar(ce*(1+W*(.04+S.lacquer*.02))),c.lerp(Ge,o.lacquerAmount*.08+S.lacquer*.04),c.multiplyScalar(1-o.lacquerAmount*.018+te*o.flowAmount*.004+S.lacquer*.002)),o.frostAmount>0&&(c.x+=j*i*o.frostAmount*.012,c.z+=G*i*o.frostAmount*.012),o.quantize>0){const E=Math.max(.06,i*o.quantize*.045);c.set(Math.round(c.x/E)*E,Math.round(c.y/E)*E,Math.round(c.z/E)*E)}J>0&&t&&c.multiplyScalar(1+(Y+P*.45)*J*.08),f.current[F].copy(c)}if(g.current%4===0){const F=Jt(f.current.slice(0,oe));(ue=w.current)==null||ue.dispose(),w.current=F,U.geometry=F,T.geometry=F}g.current+=1;const ne=D.opacity,Z=D.fresnel,Me=D.wireframe,N=Math.min(1.48,Math.max(.04,ne*o.opacityMul+o.opacityAdd+z.opacity*.32)),X=Math.min(2,Math.max(0,Z+o.fresnelAdd+Y*o.haloSpread*.08+z.relief*.5)),H=(o.wireframe??Me)||z.wireframe>.08,K=D.color,se=D.materialStyle,Q=Ee(se);d.uniforms.uColor.value.set(K),d.uniforms.uOpacity.value=N,d.uniforms.uPulse.value=(Y+P*.3)*(1+z.relief*.25),d.uniforms.uFresnel.value=X,d.uniforms.uMaterialStyle.value=Q,d.uniforms.uScanScale.value=o.scanScale,d.uniforms.uBandStrength.value=o.bandStrength,d.uniforms.uGrainStrength.value=o.grainStrength,d.uniforms.uHaloSpread.value=o.haloSpread+z.relief*.16,d.uniforms.uHaloSharpness.value=o.haloSharpness,d.uniforms.uEdgeTint.value=o.edgeTint,d.uniforms.uEtchStrength.value=o.etchStrength+z.relief*.18,d.uniforms.uPoreAmount.value=o.poreAmount,d.uniforms.uSporeAmount.value=o.sporeAmount,d.uniforms.uBloomAmount.value=o.bloomAmount,d.uniforms.uCenterDarkness.value=o.centerDarkness,d.uniforms.uAuraAmount.value=o.auraAmount,d.uniforms.uDiskAmount.value=o.diskAmount,d.uniforms.uLacquerAmount.value=o.lacquerAmount,d.uniforms.uFlowAmount.value=o.flowAmount,d.uniforms.uRidgeAmount.value=o.ridgeAmount+z.relief*.12,d.uniforms.uSeamAmount.value=o.seamAmount,d.uniforms.uFrostAmount.value=o.frostAmount,d.uniforms.uCrownAmount.value=o.crownAmount,d.uniforms.uRiftAmount.value=o.riftAmount,d.uniforms.uCreaseAmount.value=o.creaseAmount,d.blending=o.blendMode==="normal"?Le:ie,v.color.set(K),v.opacity=Math.min(1,Math.max(.02,N*o.wireOpacity+z.wireframe*.4)),v.visible=H})}function ta({config:a,layerIndex:r,shellMaterialRef:e,wireMaterialRef:t,shellMeshRef:u,wireMeshRef:m}){return R.jsxs("group",{children:[R.jsx("mesh",{ref:u,renderOrder:1,children:R.jsx("shaderMaterial",{ref:e,vertexShader:Vt,fragmentShader:Gt,transparent:!0,depthWrite:!1,side:ke,blending:ie,uniforms:Kt(a,r)})}),R.jsx("mesh",{ref:m,renderOrder:2,children:R.jsx("meshBasicMaterial",{ref:t,transparent:!0,depthWrite:!1,wireframe:!0,toneMapped:!1,opacity:.28,color:r===2?a.layer2Color:a.layer3Color})})]})}const aa=({config:a,layerIndex:r,audioRef:e,isPlaying:t})=>{const u=h.useRef(null),m=h.useRef(null),n=h.useRef(null),s=h.useRef(null),M=h.useMemo(()=>$t(a,r),Xt(a,r)),b=ze(a,r),A=h.useMemo(()=>It(a,r),[a,r]),g=h.useMemo(()=>Zt(b),[b]);return ea({config:a,layerIndex:r,audioRef:e,isPlaying:t,layout:M,shellProfile:A,sourceProfile:g,shellMaterialRef:u,wireMaterialRef:m,shellMeshRef:n,wireMeshRef:s}),M?R.jsx(ta,{config:a,layerIndex:r,shellMaterialRef:u,wireMaterialRef:m,shellMeshRef:n,wireMeshRef:s}):null},lr=Object.freeze(Object.defineProperty({__proto__:null,SurfaceShellSystem:aa},Symbol.toStringTag,{value:"Module"})),ra=`
  varying vec3 vNormalView;
  varying vec3 vWorldPos;
  varying vec2 vUvCoord;
  void main() {
    vUvCoord = uv;
    vNormalView = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`,oa=`
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPulse;
  uniform float uFresnel;
  uniform float uMaterialStyle;
  uniform float uContourBands;
  uniform float uContourSharpness;
  uniform float uPlateMix;
  uniform float uEchoMix;
  uniform float uShearMix;
  uniform float uRingAmount;
  uniform float uInterferenceAmount;
  uniform float uTremorAmount;
  uniform float uTerraceAmount;
  uniform float uCellAmount;
  uniform float uCreaseAmount;
  uniform float uSpokeAmount;
  varying vec3 vNormalView;
  varying vec3 vWorldPos;
  varying vec2 vUvCoord;

  void main() {
    vec3 n = normalize(vNormalView);
    float facing = clamp(abs(n.z), 0.0, 1.0);
    float fresnel = pow(clamp(1.0 - facing, 0.0, 1.0), mix(1.1, 5.2, clamp(uFresnel, 0.0, 1.0)));
    float grid = 0.5 + 0.5 * sin(vUvCoord.x * (24.0 + uContourBands * 18.0) + vUvCoord.y * (14.0 + uShearMix * 24.0) + uPulse * 8.0);
    float contour = abs(sin(vUvCoord.y * (10.0 + uContourBands * 54.0) + vUvCoord.x * (4.0 + uEchoMix * 20.0) + vWorldPos.y * 0.02));
    float contourMask = 1.0 - smoothstep(0.18, 0.82 - uContourSharpness * 0.34, contour);
    float echo = 0.5 + 0.5 * sin(length(vUvCoord - 0.5) * (12.0 + uEchoMix * 42.0) - uPulse * (3.0 + uEchoMix * 4.0));
    float rings = 0.5 + 0.5 * sin(length(vUvCoord - 0.5) * (18.0 + uRingAmount * 64.0) - uPulse * (4.0 + uRingAmount * 5.0));
    float interference = 0.5 + 0.5 * sin(vUvCoord.x * (22.0 + uInterferenceAmount * 42.0) + uPulse * 4.0) * sin(vUvCoord.y * (18.0 + uInterferenceAmount * 36.0) - uPulse * 3.0);
    float cellGrid = abs(fract(vUvCoord.x * (6.0 + uCellAmount * 14.0)) - 0.5) + abs(fract(vUvCoord.y * (6.0 + uCellAmount * 14.0)) - 0.5);
    float cellMask = 1.0 - smoothstep(0.14, 0.34, cellGrid);
    float terrace = smoothstep(0.15, 0.92, contour) * uTerraceAmount;
    vec3 base = uColor * (0.2 + facing * 0.5 + grid * 0.08);
    base = mix(base, mix(uColor * 0.42, uColor, contourMask), uPlateMix * 0.82);
    base = mix(base, base * (0.82 + rings * 0.28), uRingAmount * 0.48);
    base = mix(base, base * (0.78 + interference * 0.34), uInterferenceAmount * 0.52);
    base = mix(base, mix(base, vec3(1.0), 0.12), cellMask * uCellAmount * 0.54);
    base *= 1.0 - terrace * 0.18;
    base += vec3(1.0) * contourMask * uContourSharpness * 0.05;
    vec3 edge = mix(uColor, vec3(1.0), 0.36) * fresnel * (0.8 + uPulse * 1.2);
    edge += mix(uColor, vec3(1.0), 0.2) * echo * uEchoMix * 0.18;
    edge += mix(uColor, vec3(1.0), 0.28) * rings * uRingAmount * 0.14;
    edge += vec3(1.0) * interference * uInterferenceAmount * 0.08;
    edge += vec3(1.0) * cellMask * uCellAmount * 0.05;
    float alpha = uOpacity * clamp(0.2 + facing * 0.45 + fresnel * 0.8 + contourMask * uPlateMix * 0.18 + rings * uRingAmount * 0.08 + interference * uInterferenceAmount * 0.08, 0.0, 1.0);
    alpha *= clamp(1.0 - terrace * 0.16 + cellMask * uCellAmount * 0.08, 0.05, 1.2);

    if (uMaterialStyle > 0.5 && uMaterialStyle < 1.5) {
      base = mix(base, vec3(1.0), 0.15 + fresnel * 0.2);
      alpha *= 0.78;
    } else if (uMaterialStyle > 1.5 && uMaterialStyle < 2.5) {
      float scan = 0.5 + 0.5 * sin(vWorldPos.y * 0.1 + uPulse * 9.0);
      base = mix(base, vec3(0.25, 0.92, 1.0), 0.44);
      edge += vec3(0.08, 0.84, 1.0) * scan * 0.25;
    } else if (uMaterialStyle > 2.5 && uMaterialStyle < 3.5) {
      float band = 0.5 + 0.5 * sin(vWorldPos.y * 0.08 - vWorldPos.x * 0.05);
      base = mix(vec3(0.16, 0.17, 0.2), vec3(0.95), band * 0.82);
      base *= mix(uColor, vec3(1.0), 0.42);
    } else if (uMaterialStyle > 3.5) {
      vec2 dotsUv = fract(vUvCoord * 18.0) - 0.5;
      float dots = 1.0 - smoothstep(0.1, 0.28, length(dotsUv));
      alpha *= mix(0.42, 1.0, dots);
      base *= 0.48 + dots * 0.72;
    }

    gl_FragColor = vec4(base + edge, alpha);
  }
`;function na(a,r){return De(a,r).mode}function qe(a,r){return De(a,r)}const ua={rippleMul:1,opacityMul:1,opacityAdd:0,fresnelAdd:0,contourBands:.18,contourSharpness:.18,plateMix:.08,echoMix:.08,shearMix:0,planarPull:0,ringAmount:0,interferenceAmount:0,tremorAmount:0,terraceAmount:0,warpAmount:0,cellAmount:0,creaseAmount:0,edgeLift:0,spokeAmount:0,driftAmount:0,rotationMul:1,blendMode:"additive"},la={surface_patch:{rippleMul:.9,contourBands:.18,contourSharpness:.18,plateMix:.16,echoMix:.08,planarPull:.12,warpAmount:.08,edgeLift:.08},contour_echo:{rippleMul:.82,opacityMul:.92,fresnelAdd:.22,contourBands:.94,contourSharpness:.84,plateMix:.72,echoMix:.48,shearMix:.08,planarPull:.38,ringAmount:.24,terraceAmount:.82,warpAmount:.18,creaseAmount:.22,edgeLift:.28,rotationMul:.7},echo_rings:{rippleMul:1.2,opacityMul:.84,fresnelAdd:.36,contourBands:.86,contourSharpness:.62,plateMix:.26,echoMix:.92,shearMix:.06,planarPull:.18,ringAmount:.96,terraceAmount:.18,warpAmount:.1,edgeLift:.16,spokeAmount:.56,rotationMul:1.12},standing_interference:{rippleMul:1.08,opacityMul:.88,fresnelAdd:.28,contourBands:.78,contourSharpness:.78,plateMix:.22,echoMix:.72,shearMix:.34,planarPull:.14,interferenceAmount:.96,warpAmount:.22,cellAmount:.14,creaseAmount:.16,driftAmount:.44,rotationMul:1.04},tremor_lattice:{rippleMul:1.26,opacityMul:.86,fresnelAdd:.18,contourBands:.58,contourSharpness:.66,plateMix:.38,echoMix:.44,shearMix:.26,planarPull:.28,tremorAmount:.94,cellAmount:.82,terraceAmount:.24,warpAmount:.34,creaseAmount:.26,edgeLift:.1,driftAmount:.24,rotationMul:1.08}};function ia(a){return{...ua,...la[a]??{}}}function sa(a){switch(a){case"text":return{ledger:.9,canopy:.06,ring:.04,sweep:.08,column:.16,blob:.04,fracture:.42,veil:.08};case"grid":return{ledger:.72,canopy:.08,ring:.06,sweep:.08,column:.24,blob:.04,fracture:.3,veil:.06};case"ring":case"disc":case"torus":return{ledger:.04,canopy:.08,ring:.86,sweep:.28,column:.06,blob:.08,fracture:.08,veil:.12};case"spiral":case"galaxy":return{ledger:.06,canopy:.1,ring:.22,sweep:.84,column:.08,blob:.08,fracture:.12,veil:.18};case"image":case"video":return{ledger:.08,canopy:.62,ring:.12,sweep:.18,column:.08,blob:.46,fracture:.1,veil:.34};case"plane":return{ledger:.34,canopy:.34,ring:.08,sweep:.12,column:.12,blob:.12,fracture:.16,veil:.18};case"cube":case"cylinder":case"cone":return{ledger:.12,canopy:.14,ring:.04,sweep:.08,column:.82,blob:.08,fracture:.56,veil:.08};case"sphere":case"center":case"random":default:return{ledger:.08,canopy:.18,ring:.12,sweep:.1,column:.1,blob:.24,fracture:.08,veil:.12}}}function ca(a,r){return r===2?[r,a.layer2Count,a.layer2Source,a.layer2SourceCount,a.layer2SourceSpread,a.layer2Counts,a.layer2MediaLumaMap,a.layer2MediaMapWidth,a.layer2MediaMapHeight,a.layer2MediaThreshold,a.layer2MediaDepth,a.layer2MediaInvert,a.layer2SourcePositions,a.layer2MotionMix,a.layer2Motions,a.layer2Type,a.layer2RadiusScales,a.layer2FlowSpeeds,a.layer2FlowAmps,a.layer2FlowFreqs,a.layer2Sizes,a.layer2PatchResolution]:[r,a.layer3Count,a.layer3Source,a.layer3SourceCount,a.layer3SourceSpread,a.layer3Counts,a.layer3MediaLumaMap,a.layer3MediaMapWidth,a.layer3MediaMapHeight,a.layer3MediaThreshold,a.layer3MediaDepth,a.layer3MediaInvert,a.layer3SourcePositions,a.layer3MotionMix,a.layer3Motions,a.layer3Type,a.layer3RadiusScales,a.layer3FlowSpeeds,a.layer3FlowAmps,a.layer3FlowFreqs,a.layer3Sizes,a.layer3PatchResolution]}function ma(a,r){const e=Te(a,r,!1,"aux");if(!e||e.count<16)return null;const{resolution:t}=qe(a,r),u=Ze(a,r),m=Math.max(8,Math.min(64,u.maxPatchResolution,Math.floor(t))),n=m*m,s=new Uint32Array(n);for(let M=0;M<n;M+=1)s[M]=Math.min(e.count-1,Math.floor(M/Math.max(1,n-1)*Math.max(0,e.count-1)));return{particleData:e,sampledIndices:s,resolution:m,vertexCount:n}}function da(a,r){const e=qe(a,r);return{uColor:{value:new ve(e.color)},uOpacity:{value:e.opacity},uPulse:{value:0},uFresnel:{value:e.fresnel},uMaterialStyle:{value:0},uContourBands:{value:.18},uContourSharpness:{value:.18},uPlateMix:{value:.08},uEchoMix:{value:.08},uShearMix:{value:0},uRingAmount:{value:0},uInterferenceAmount:{value:0},uTremorAmount:{value:0},uTerraceAmount:{value:0},uCellAmount:{value:0},uCreaseAmount:{value:0},uSpokeAmount:{value:0}}}function ha({config:a,layerIndex:r,meshRef:e,wireMeshRef:t,materialRef:u,wireMaterialRef:m}){return R.jsxs("group",{children:[R.jsx("mesh",{ref:e,renderOrder:1,children:R.jsx("shaderMaterial",{ref:u,vertexShader:ra,fragmentShader:oa,transparent:!0,depthWrite:!1,side:ke,blending:ie,uniforms:da(a,r)})}),R.jsx("mesh",{ref:t,renderOrder:2,children:R.jsx("meshBasicMaterial",{ref:m,transparent:!0,depthWrite:!1,wireframe:!0,toneMapped:!1,opacity:.2,color:qe(a,r).color})})]})}const Ye=new re,y=new re,fe=new re;function fa({config:a,layerIndex:r,audioRef:e,isPlaying:t,layout:u,patchProfile:m,sourceProfile:n,meshRef:s,wireMeshRef:M,materialRef:b,wireMaterialRef:A,geometryRef:g}){const f=h.useRef(null),w=h.useRef(_e());h.useEffect(()=>{var _;(_=g.current)==null||_.dispose(),g.current=null,f.current=null},[g,u==null?void 0:u.resolution]),h.useEffect(()=>()=>{var _;(_=g.current)==null||_.dispose(),g.current=null},[g]),Ae(({clock:_})=>{const L=s.current,d=M.current,v=b.current,U=A.current;if(!L||!d||!v||!U||!u)return;const T=qe(a,r),o=m,S=Be(a,e.current,w.current),D=Pe(S,"patch"),k=n,z=u.particleData;if(!z)return;const p=a.sphereRadius*(r===2?a.layer2RadiusScale:a.layer3RadiusScale),i=a.audioEnabled?e.current.pulse*a.audioBurstScale:0,I=a.audioEnabled?e.current.bass*a.audioBeatScale:0,Y=T.audioReactive+D.displacement*.6,P=t?(i+I*.5)*Y:0,J=Math.max(.18,1-D.sliceDepth*.32),x=_.getElapsedTime();g.current||(g.current=new Ne(p*2,p*2,u.resolution-1,u.resolution-1),L.geometry=g.current,d.geometry=g.current,f.current=new Float32Array(u.vertexCount*3));const B=g.current,oe=B.getAttribute("position"),ne=B.getAttribute("normal"),Z=f.current??new Float32Array(u.vertexCount*3);f.current=Z;for(let N=0;N<u.resolution;N+=1)for(let X=0;X<u.resolution;X+=1){const H=N*u.resolution+X,K=u.sampledIndices[H]??0,se=pe({config:a,layerIndex:r,particleData:z,index:K,globalRadius:p,time:x});y.set(se.x,se.y,se.z);let Q=1;if(X>0){const le=u.sampledIndices[H-1]??K;fe.copy(pe({config:a,layerIndex:r,particleData:z,index:le,globalRadius:p,time:x})),y.addScaledVector(fe,.45),Q+=.45}if(N>0){const le=u.sampledIndices[H-u.resolution]??K;fe.copy(pe({config:a,layerIndex:r,particleData:z,index:le,globalRadius:p,time:x})),y.addScaledVector(fe,.45),Q+=.45}if(X>0&&N>0){const le=u.sampledIndices[H-u.resolution-1]??K;fe.copy(pe({config:a,layerIndex:r,particleData:z,index:le,globalRadius:p,time:x})),y.addScaledVector(fe,.2),Q+=.2}y.multiplyScalar(1/Q);const ue=T.relax,F=Z[H*3+0],de=Z[H*3+1],ge=Z[H*3+2];(H>0||F!==0||de!==0||ge!==0)&&(y.x=me.lerp(y.x,F,ue),y.y=me.lerp(y.y,de,ue),y.z=me.lerp(y.z,ge,ue));const ce=r===2?a.layer2Type:a.layer3Type,V=ce==="contour_echo"?.02:ce==="echo_rings"?.032:ce==="standing_interference"?.026:ce==="tremor_lattice"?.034:.012,$=Math.sin(X/Math.max(1,u.resolution-1)*Math.PI*2+x*1.1+N*.08)*p*V*o.rippleMul*P,O=X/Math.max(1,u.resolution-1)-.5,j=N/Math.max(1,u.resolution-1)-.5,G=Math.sqrt(O*O+j*j),ee=Math.atan2(j,O),W=Math.sin(G*Math.PI*(4+o.contourBands*10)+x*(.35+o.echoMix*.55)+(O-j)*o.shearMix*10)*p*.04*o.contourSharpness*(.4+P),te=Math.sin(G*Math.PI*(6+o.ringAmount*18)-x*(.8+o.echoMix*.9))*p*.045*o.ringAmount,Fe=Math.sin((O+j)*(8+o.interferenceAmount*14)+x*.82)*Math.cos((O-j)*(7+o.interferenceAmount*12)-x*.66)*p*.04*o.interferenceAmount*(.45+P),Ce=Math.sin(O*Math.PI*(6+o.cellAmount*10)),be=Math.sin(j*Math.PI*(6+o.cellAmount*10)),E=Ce*be*p*.026*o.cellAmount,ye=Math.sin(ee*(4+o.cellAmount*3)+x*(2.4+o.tremorAmount*1.8)+G*18)*p*.028*o.tremorAmount*(.5+P),xe=Math.sin((O-j)*Math.PI*(3+o.creaseAmount*6)+x*.34)*p*.024*o.creaseAmount,we=Math.max(0,G-.22)*p*.16*o.edgeLift,At=Math.cos(ee*(4+o.spokeAmount*10)-x*.26)*p*.024*o.spokeAmount*(.2+G),gt=Math.sin((O+j)*(4+o.driftAmount*8)+x*(.52+o.driftAmount*.6))*p*.026*o.driftAmount,St=(o.terraceAmount>0?Math.round((G+W/Math.max(p,1e-4))*(4+o.terraceAmount*8))/(4+o.terraceAmount*8)-G:0)*p*.26*o.terraceAmount,je=Math.sin((O+.5)*(12+k.ledger*18)+x*.22)*p*.018*k.ledger,bt=Math.max(0,j+.2)*p*.08*k.canopy,Oe=Math.sin(G*Math.PI*(4+k.ring*12)-x*.44)*p*.024*k.ring,He=Math.sin(ee*(2+k.sweep*4)+G*(8+k.sweep*10)-x*.6)*p*.024*k.sweep,yt=(1-Math.min(1,Math.abs(O)*1.8))*p*.03*k.column,xt=Math.exp(-G*6)*p*.06*k.blob,wt=Math.sign(Math.sin((O-j)*(10+k.fracture*14)+x*.18))*p*.016*k.fracture*(.2+G),kt=Math.sin((O+j)*(5+k.veil*8)+x*.4)*p*.014*k.veil;if(Ye.copy(y).normalize(),y.addScaledVector(Ye,$+W+te+Fe+E+ye+xe+we+At+gt+St+je+bt+Oe+yt+xt),o.warpAmount>0&&(y.x+=Math.sin(ee*(2+o.warpAmount*5)+x*.42)*p*o.warpAmount*.06,y.y+=Math.cos(ee*(3+o.warpAmount*4)-x*.36)*p*o.warpAmount*.05,y.z+=Math.sin((O-j)*(8+o.warpAmount*14)+x*.58)*p*o.warpAmount*.04*J),y.x+=He*.6+wt*.45,y.y+=kt+He*.18,y.z+=(Oe*.42-je*.28)*J,k.ledger>0){const le=Math.max(p*.05,1e-4);y.y=me.lerp(y.y,Math.round(y.y/le)*le,Math.min(.16,k.ledger*.1))}o.planarPull>0&&(y.z*=1-o.planarPull*.22),y.z*=J,Z[H*3+0]=y.x,Z[H*3+1]=y.y,Z[H*3+2]=y.z,oe.setXYZ(H,y.x,y.y,y.z)}oe.needsUpdate=!0,B.computeVertexNormals(),ne.needsUpdate=!0,B.computeBoundingSphere();const Me=Ee(T.materialStyle);v.uniforms.uColor.value.set(T.color),v.uniforms.uOpacity.value=Math.min(1.3,Math.max(.04,T.opacity*o.opacityMul+o.opacityAdd+D.opacity*.3)),v.uniforms.uPulse.value=(i+I*.25)*(1+D.relief*.28),v.uniforms.uFresnel.value=Math.min(2,Math.max(0,T.fresnel+o.fresnelAdd+D.relief*.55)),v.uniforms.uMaterialStyle.value=Me,v.uniforms.uContourBands.value=o.contourBands,v.uniforms.uContourSharpness.value=o.contourSharpness+D.relief*.4,v.uniforms.uPlateMix.value=o.plateMix,v.uniforms.uEchoMix.value=o.echoMix,v.uniforms.uShearMix.value=o.shearMix,v.uniforms.uRingAmount.value=o.ringAmount+D.relief*.2,v.uniforms.uInterferenceAmount.value=o.interferenceAmount,v.uniforms.uTremorAmount.value=o.tremorAmount,v.uniforms.uTerraceAmount.value=o.terraceAmount,v.uniforms.uCellAmount.value=o.cellAmount,v.uniforms.uCreaseAmount.value=o.creaseAmount,v.uniforms.uSpokeAmount.value=o.spokeAmount,v.blending=o.blendMode==="normal"?Le:ie,L.rotation.z=Math.sin(x*.1+r)*.08*o.rotationMul+k.sweep*.06,L.rotation.x=k.canopy*.08-k.column*.04,d.rotation.copy(L.rotation),U.color.set(T.color),U.opacity=Math.min(1,Math.max(.02,T.opacity*.9+D.wireframe*.42)),U.visible=T.wireframe||D.wireframe>.08})}const pa=({config:a,layerIndex:r,audioRef:e,isPlaying:t})=>{const u=h.useRef(null),m=h.useRef(null),n=h.useRef(null),s=h.useRef(null),M=h.useRef(null),b=h.useMemo(()=>ma(a,r),ca(a,r)),A=na(a,r),g=ze(a,r),f=h.useMemo(()=>Ht(Ot(ia(A),g),A,g),[A,g]),w=h.useMemo(()=>sa(g),[g]);return fa({config:a,layerIndex:r,audioRef:e,isPlaying:t,layout:b,patchProfile:f,sourceProfile:w,meshRef:u,wireMeshRef:m,materialRef:n,wireMaterialRef:s,geometryRef:M}),b?R.jsx(ha,{config:a,layerIndex:r,meshRef:u,wireMeshRef:m,materialRef:n,wireMaterialRef:s}):null},ir=Object.freeze(Object.defineProperty({__proto__:null,SurfacePatchSystem:pa},Symbol.toStringTag,{value:"Module"})),ae={spiralAmount:0,advectAmount:0,meltAmount:0,evaporateAmount:0,curlAmount:0,fanAmount:0,curtainAmount:0,widthMul:1,heightMul:1,alphaMul:1,trailShearAdd:0,rotYAdd:0,rotZAdd:0};function Ma(a){return a-Math.floor(a)}function va(a){return Ma(Math.sin(a*91.173+17.137)*43758.5453123)}function Aa(a){return va(a)*2-1}const ga={groupRotX:.24,groupRotY:.28,groupRotZ:.18,jitterMul:1,ribbonDrift:1,smearDrift:1,zStretch:1,pulseMul:1,widthBase:.6,widthMix:.6,heightBase:.48,heightMix:.42,squashBase:.8,squashOsc:.08,baseScale:.9,rotXMul:1,rotYMul:1,rotZMul:1,trailShear:.18,edgeSoftness:.88,streakFreq:120,tearFreq:36,bandFreq:24,bleedWarp:.14,veilCurve:.16,alphaMul:1,additive:!0,spiralAmount:0,advectAmount:0,meltAmount:0,evaporateAmount:0,curlAmount:0,fanAmount:0,curtainAmount:0},Sa={brush_surface:{spiralAmount:.08,fanAmount:.12,widthBase:.66,widthMix:.72,heightBase:.52,heightMix:.44,trailShear:.24,edgeSoftness:.9,streakFreq:118,tearFreq:34,bandFreq:26,bleedWarp:.18,alphaMul:1.02},ribbon_veil:{curlAmount:.24,curtainAmount:.62,jitterMul:.42,ribbonDrift:1.9,smearDrift:.82,zStretch:1.82,pulseMul:1.18,widthBase:.94,widthMix:1.1,heightBase:.18,heightMix:.2,squashBase:.42,squashOsc:.04,baseScale:.94,rotYMul:1.9,rotZMul:.82,trailShear:.34,edgeSoftness:.96,streakFreq:92,tearFreq:20,bandFreq:18,bleedWarp:.08,veilCurve:.54,alphaMul:.94,additive:!0},mist_ribbon:{evaporateAmount:.32,curlAmount:.18,curtainAmount:.86,jitterMul:.34,ribbonDrift:2.16,smearDrift:1.18,zStretch:1.92,pulseMul:.88,widthBase:1.12,widthMix:1.24,heightBase:.12,heightMix:.15,squashBase:.4,squashOsc:.03,baseScale:.98,rotYMul:1.54,rotZMul:.72,trailShear:.42,edgeSoftness:1.08,streakFreq:72,tearFreq:12,bandFreq:12,bleedWarp:.05,veilCurve:.76,alphaMul:.82,additive:!0},liquid_smear:{meltAmount:.38,advectAmount:.16,jitterMul:.74,ribbonDrift:.86,smearDrift:1.46,zStretch:.92,pulseMul:1.08,widthBase:.72,widthMix:.8,heightBase:.5,heightMix:.54,squashBase:.88,squashOsc:.1,baseScale:.84,rotXMul:1.18,rotYMul:.88,rotZMul:.58,trailShear:.22,edgeSoftness:.86,streakFreq:132,tearFreq:42,bandFreq:28,bleedWarp:.24,veilCurve:.1,alphaMul:1.08,additive:!1},paint_daubs:{meltAmount:.16,fanAmount:.08,jitterMul:.92,ribbonDrift:.7,smearDrift:.82,zStretch:.72,pulseMul:.9,widthBase:.54,widthMix:.46,heightBase:.56,heightMix:.42,squashBase:.94,squashOsc:.06,baseScale:.74,rotXMul:.84,rotYMul:.68,rotZMul:.54,trailShear:.14,edgeSoftness:.8,streakFreq:144,tearFreq:48,bandFreq:32,bleedWarp:.28,veilCurve:.06,alphaMul:1.1,additive:!1}};function ba(a){return{...ga,...Sa[a]??{}}}function ya(a){switch(a){case"text":return{...ae,fanAmount:.12,curlAmount:.08,curtainAmount:.08,widthMul:.92,alphaMul:.94,trailShearAdd:.1,rotZAdd:.08};case"image":return{...ae,curtainAmount:.12,fanAmount:.1,widthMul:1.04,heightMul:.96,alphaMul:.98,trailShearAdd:.04};case"video":return{...ae,curtainAmount:.18,evaporateAmount:.1,curlAmount:.08,widthMul:1.06,heightMul:.94,alphaMul:.96,rotYAdd:.06};case"ring":case"disc":case"torus":return{...ae,spiralAmount:.22,fanAmount:.18,curlAmount:.08,widthMul:1.02,rotYAdd:.12};case"spiral":case"galaxy":return{...ae,spiralAmount:.3,advectAmount:.12,curlAmount:.14,fanAmount:.08,rotYAdd:.16,rotZAdd:.06};case"grid":case"plane":return{...ae,advectAmount:.18,fanAmount:.08,widthMul:1.08,heightMul:.92,alphaMul:.96,trailShearAdd:.14};case"cube":case"cylinder":case"cone":return{...ae,meltAmount:.14,curtainAmount:.08,fanAmount:.12,heightMul:1.04,trailShearAdd:.08,rotZAdd:.12};case"center":case"random":return{...ae,curtainAmount:.08,fanAmount:.1,widthMul:.98,heightMul:1.02};case"sphere":default:return ae}}function xa(a,r){const e=ya(r);return{...a,spiralAmount:a.spiralAmount+e.spiralAmount,advectAmount:a.advectAmount+e.advectAmount,meltAmount:a.meltAmount+e.meltAmount,evaporateAmount:a.evaporateAmount+e.evaporateAmount,curlAmount:a.curlAmount+e.curlAmount,fanAmount:a.fanAmount+e.fanAmount,curtainAmount:a.curtainAmount+e.curtainAmount,widthBase:a.widthBase*e.widthMul,widthMix:a.widthMix*e.widthMul,heightBase:a.heightBase*e.heightMul,heightMix:a.heightMix*e.heightMul,alphaMul:a.alphaMul*e.alphaMul,trailShear:a.trailShear+e.trailShearAdd,groupRotY:a.groupRotY+e.rotYAdd,groupRotZ:a.groupRotZ+e.rotZAdd}}function wa(a){return Ee(a)}const ka=`
  attribute float layerMix;
  varying vec2 vUv;
  varying float vLayerMix;
  varying float vBrushNoise;
  uniform float uTime;
  uniform float uJitter;
  uniform float uPulse;
  uniform float uTrailShear;

  void main() {
    vUv = uv;
    vLayerMix = layerMix;
    vec3 transformed = position;
    float wave = sin((position.x + layerMix * 0.5) * 5.0 + uTime * 0.8) * 0.08;
    float noise = sin(dot(position.xy + vec2(layerMix * 1.3, uTime * 0.12), vec2(14.73, 9.17))) * 0.5 + 0.5;
    transformed.x += (uv.y - 0.5) * uTrailShear * mix(0.35, 1.0, layerMix);
    transformed.y += wave + (noise - 0.5) * uJitter * 0.02;
    transformed.z += sin((position.y + layerMix) * 4.0 + uTime * 0.7) * 0.05 + uPulse * 0.02;
    vBrushNoise = noise;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`,Pa=`
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uJitter;
  uniform float uPulse;
  uniform float uAudioReactive;
  uniform float uVeilCurve;
  uniform float uBleedWarp;
  uniform float uEdgeSoftness;
  uniform float uStreakFreq;
  uniform float uTearFreq;
  uniform float uBandFreq;
  uniform float uAlphaMul;
  uniform float uMaterialStyle;
  varying vec2 vUv;
  varying float vLayerMix;
  varying float vBrushNoise;

  float brushMask(vec2 uv) {
    vec2 p = uv * 2.0 - 1.0;
    float curve = mix(1.0, 0.42 + uv.y * 1.25, clamp(uVeilCurve, 0.0, 1.0));
    float ellipse = 1.0 - smoothstep(0.45, 0.45 + uEdgeSoftness * 0.72, length(vec2(p.x * 0.78, p.y * (1.18 + curve * 0.12))));
    float streak = 0.5 + 0.5 * sin(uv.y * uStreakFreq + uv.x * 21.0 + vLayerMix * 11.0 + vBrushNoise * 8.0);
    float torn = 0.5 + 0.5 * sin(uv.x * uTearFreq - uv.y * (uTearFreq * 0.5) + vBrushNoise * 10.0);
    float bleed = 0.5 + 0.5 * sin((uv.x + uv.y) * (18.0 + uBleedWarp * 24.0) + vBrushNoise * 16.0);
    return ellipse * mix(0.45, 1.0, streak * torn) * mix(0.8, 1.14, bleed);
  }

  void main() {
    float mask = brushMask(vUv);
    if (mask < 0.02) discard;
    vec3 color = uColor;
    float alpha = uOpacity * uAlphaMul * mask * mix(0.95, 0.28, vLayerMix);
    float edge = smoothstep(0.15, 0.95, mask);
    float band = 0.5 + 0.5 * sin(vUv.x * uBandFreq + vUv.y * (uBandFreq * 0.72) + vLayerMix * 5.0 + vBrushNoise * 4.0);
    color *= 0.52 + edge * 0.48 + vBrushNoise * 0.18;
    color = mix(color, color * (0.82 + band * 0.26), 0.32 + uBleedWarp * 0.3);
    color += vec3(1.0) * uPulse * 0.05;

    if (uMaterialStyle > 0.5 && uMaterialStyle < 1.5) {
      color = mix(color, vec3(0.92, 0.97, 1.0), 0.22);
      alpha *= 0.82;
    } else if (uMaterialStyle > 1.5 && uMaterialStyle < 2.5) {
      float scan = 0.5 + 0.5 * sin(vUv.y * 140.0 + uPulse * 10.0 + vLayerMix * 8.0);
      color = mix(color, vec3(0.18, 0.95, 1.0), 0.48);
      color += vec3(0.1, 0.55, 0.7) * scan * 0.12;
      alpha *= 1.05;
    } else if (uMaterialStyle > 2.5 && uMaterialStyle < 3.5) {
      color = mix(vec3(0.16), vec3(1.0), band) * mix(uColor, vec3(1.0), 0.38);
    } else if (uMaterialStyle > 3.5) {
      vec2 cell = fract(vUv * 18.0) - 0.5;
      float dots = 1.0 - smoothstep(0.14, 0.34, length(cell));
      alpha *= mix(0.38, 1.0, dots);
      color *= 0.44 + dots * 0.72;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;function Ra(a,r){return $e(a,r)}function _a(a,r){return Xe(a,r)}function Ba(a,r){const e=Lt(a,r);return{opacity:e.opacity,layers:e.layers,scale:e.scale,jitter:e.jitter,audioReactive:e.audioReactive,color:e.color,materialStyle:e.materialStyle,source:e.source}}function qa(a){const r=Math.max(2,Math.min(20,Math.floor(a)));return Array.from({length:r},(e,t)=>({key:`brush-${t}`,mix:r<=1?0:t/(r-1),seed:t*1.173+.37,rotX:(t-r/2)*.032,rotY:Math.sin(t*.7)*.18,rotZ:Math.cos(t*1.3)*.22,zOffset:(t-(r-1)/2)*5.5,geometry:(()=>{const u=new Ne(1,1,24,24),m=u.attributes.position.count,n=new Float32Array(m);return n.fill(r<=1?0:t/(r-1)),u.setAttribute("layerMix",new Bt(n,1)),u})()}))}function Fa(a){a.forEach(r=>r.geometry.dispose())}function Ca(a){const{group:r,materialRefs:e,config:t,layerIndex:u,particleData:m,brushProfile:n,settings:s,planes:M,audioRef:b,audioRouteStateRef:A,isPlaying:g,time:f}=a;if(m.count===0)return;const w=t.sphereRadius*(u===2?t.layer2RadiusScale:t.layer3RadiusScale),_=Be(t,b.current,A.current),L=Pe(_,"brush"),d=t.audioEnabled?b.current.pulse*t.audioBurstScale:0,v=t.audioEnabled?b.current.bass*t.audioBeatScale:0,U=s.audioReactive+L.displacement*.6,T=g?(d+v*.65)*U:0,o=L.opacity*.28,S=L.relief*.34,D=Math.max(.2,1-L.sliceDepth*.35),k=Math.min(18,m.count),z=new re;for(let i=0;i<k;i+=1){const I=Math.floor(i/Math.max(1,k-1)*Math.max(0,m.count-1)),Y=pe({config:t,layerIndex:u,particleData:m,index:I,globalRadius:w,time:f});z.add(Y)}z.multiplyScalar(1/Math.max(1,k)),r.position.copy(z.multiplyScalar(.35)),r.rotation.x=Math.sin(f*.19+u*.7)*n.groupRotX,r.rotation.y=Math.cos(f*.17+u*1.1)*n.groupRotY,r.rotation.z=Math.sin(f*.11+u*.4)*n.groupRotZ;const p=w*n.baseScale*s.scale*(1+T*.18);M.forEach((i,I)=>{const Y=r.children[I],P=e.current[I];if(!Y||!P)return;const J=(d*(.35+i.mix*.65)+v*.18)*n.pulseMul,x=n.jitterMul,B=n.ribbonDrift*(1+i.mix*.18),oe=n.smearDrift*(1+(1-i.mix)*.08),ne=f*(.24+n.spiralAmount*.42)+i.seed*5,Z=(i.mix-.5)*w*(.3+n.curtainAmount*.9),Me=n.advectAmount*w*.18*Math.sin(f*.46+i.seed*3+i.mix*2.4),N=Math.cos(ne)*w*.12*n.spiralAmount*(.35+i.mix),X=Math.sin(ne*1.18)*w*.08*n.spiralAmount*(.3+i.mix),H=n.meltAmount*w*(.05+i.mix*.16)*(.45+.55*Math.sin(f*.31+i.seed*4)),K=n.evaporateAmount*w*(.04+i.mix*.12)*(.55+.45*Math.cos(f*.27+i.seed*2.2)),se=Aa(i.seed*9)*w*.12*n.fanAmount*(.4+i.mix),Q=Math.sin(f*.28+i.seed*6)*n.curlAmount*.42;Y.position.set(Math.sin(f*.43+i.seed*7)*s.jitter*10*x*B+N+Me+se,Math.cos(f*.38+i.seed*5)*s.jitter*10*x*oe+Z-H+K+X,i.zOffset*n.zStretch*D+Math.sin(f*.34+i.seed*3)*s.jitter*8*x+Math.cos(ne)*w*.06*n.advectAmount),Y.rotation.set(i.rotX+Math.sin(f*.3+i.seed)*s.jitter*.15*x*n.rotXMul+n.curtainAmount*.18+Q*.4,i.rotY+Math.cos(f*.27+i.seed*2)*s.jitter*.18*n.rotYMul+n.advectAmount*.32+Math.sin(ne)*n.spiralAmount*.26,i.rotZ+Math.sin(f*.22+i.seed*3)*s.jitter*.2*n.rotZMul+Q);const ue=n.squashBase+Math.sin(f*.31+i.seed*4)*n.squashOsc,F=n.widthBase+i.mix*n.widthMix+n.evaporateAmount*.18+n.fanAmount*(i.mix-.5)*.12,de=ue*(n.heightBase+i.mix*n.heightMix+n.meltAmount*.12-n.evaporateAmount*.1+n.curtainAmount*.12);Y.scale.set(p*F,p*de,1),P.blending=n.additive?ie:Le,P.uniforms.uColor.value.set(s.color),P.uniforms.uOpacity.value=me.clamp(s.opacity+o,.04,1.3),P.uniforms.uTime.value=f,P.uniforms.uJitter.value=s.jitter,P.uniforms.uPulse.value=J*(1+S*.45),P.uniforms.uAudioReactive.value=U,P.uniforms.uTrailShear.value=n.trailShear+S*.18,P.uniforms.uVeilCurve.value=n.veilCurve+S*.12,P.uniforms.uBleedWarp.value=n.bleedWarp+S*.18,P.uniforms.uEdgeSoftness.value=n.edgeSoftness+S*.08,P.uniforms.uStreakFreq.value=n.streakFreq,P.uniforms.uTearFreq.value=n.tearFreq,P.uniforms.uBandFreq.value=n.bandFreq,P.uniforms.uAlphaMul.value=n.alphaMul,P.uniforms.uMaterialStyle.value=wa(s.materialStyle)})}function La(a){const{planes:r,materialRefs:e,settings:t}=a;return r.map((u,m)=>R.jsx("mesh",{geometry:u.geometry,children:R.jsx("shaderMaterial",{ref:n=>{n&&(e.current[m]=n)},transparent:!0,depthWrite:!1,side:ke,blending:ie,vertexShader:ka,fragmentShader:Pa,uniforms:{uColor:{value:new ve(t.color)},uOpacity:{value:t.opacity},uTime:{value:0},uJitter:{value:t.jitter},uPulse:{value:0},uAudioReactive:{value:t.audioReactive},uTrailShear:{value:.18},uVeilCurve:{value:.16},uBleedWarp:{value:.14},uEdgeSoftness:{value:.88},uStreakFreq:{value:120},uTearFreq:{value:36},uBandFreq:{value:24},uAlphaMul:{value:1},uMaterialStyle:{value:0}}})},u.key))}const Ta=({config:a,layerIndex:r,audioRef:e,isPlaying:t})=>{const u=h.useRef(null),m=h.useRef([]),n=Ba(a,r),s=Ra(a,r),M=ze(a,r),b=h.useMemo(()=>xa(ba(s),M),[s,M]),A=h.useMemo(()=>Te(a,r,!1,"aux"),_a(a,r)),g=h.useMemo(()=>qa(n.layers),[n.layers]),f=h.useRef(_e());return Pt.useEffect(()=>()=>{Fa(g)},[g]),Ae(({clock:w})=>{const _=u.current;!_||!A||A.count===0||Ca({group:_,materialRefs:m,config:a,layerIndex:r,particleData:A,brushProfile:b,settings:n,planes:g,audioRef:e,audioRouteStateRef:f,isPlaying:t,time:w.getElapsedTime()})}),!A||A.count===0?null:R.jsx("group",{ref:u,renderOrder:1,children:La({planes:g,materialRefs:m,settings:n})})},sr=Object.freeze(Object.defineProperty({__proto__:null,BrushSurfaceSystem:Ta},Symbol.toStringTag,{value:"Module"})),Ie={ring:.08,fracture:.1,bloom:.14,veil:.12,cavity:.08,lacquer:.16,orbit:.1,thickness:.12,tint:"#dfe8ff"},Je={surface_shell:{lacquer:.18,tint:"#dfe8ff"},aura_shell:{bloom:.52,veil:.22,tint:"#bfe2ff"},halo_bloom:{bloom:.78,ring:.34,tint:"#ffe3f6"},spore_halo:{bloom:.66,cavity:.22,tint:"#dfffcf"},eclipse_halo:{ring:.48,cavity:.38,veil:.18,tint:"#f1f4ff"},mirror_skin:{lacquer:.64,ring:.18,tint:"#f0f5ff"},calcified_skin:{fracture:.62,cavity:.2,tint:"#f1eadc"},freeze_skin:{fracture:.48,veil:.24,tint:"#d8f2ff"},residue_skin:{fracture:.38,cavity:.3,tint:"#d7d2cb"},shell_script:{fracture:.28,orbit:.26,tint:"#d8d8ff"},resin_shell:{lacquer:.72,bloom:.18,tint:"#ffd7b5"}};function Ke(a,r){const e=Tt(a,r);return{mode:e.mode,source:e.source,color:e.color,radiusScale:e.radiusScale,opacity:r===2?a.layer2SheetOpacity:a.layer3SheetOpacity,glow:r===2?a.layer2FlowAmplitude:a.layer3FlowAmplitude,shellGlow:r===2?a.layer2FlowAmplitude:a.layer3FlowAmplitude,shellFresnel:r===2?a.layer2HullFresnel:a.layer3HullFresnel}}function Qe(a){switch(a){case"text":case"grid":return{fracture:.16,ring:.04,bloom:-.04};case"ring":case"disc":case"torus":return{ring:.34,orbit:.22,cavity:.06};case"spiral":case"galaxy":return{orbit:.28,veil:.08,bloom:.06};case"image":case"video":return{bloom:.18,veil:.12,lacquer:.06};case"cube":case"cylinder":case"cone":return{fracture:.12,cavity:.12,ring:-.02};case"plane":return{veil:.1,bloom:.08};default:return{}}}function et(a,r){const e={...Ie,...Je[a]??{}},t=Qe(r);return{ring:Math.max(0,e.ring+(t.ring??0)),fracture:Math.max(0,e.fracture+(t.fracture??0)),bloom:Math.max(0,e.bloom+(t.bloom??0)),veil:Math.max(0,e.veil+(t.veil??0)),cavity:Math.max(0,e.cavity+(t.cavity??0)),lacquer:Math.max(0,e.lacquer+(t.lacquer??0)),orbit:Math.max(0,e.orbit+(t.orbit??0)),thickness:e.thickness,tint:e.tint}}function tt(a,r){return{uTime:{value:0},uColor:{value:new ve(a.color||r.tint)},uOpacity:{value:Math.max(.08,a.opacity??.55)},uAudio:{value:0},uRing:{value:r.ring},uFracture:{value:r.fracture},uBloom:{value:r.bloom},uVeil:{value:r.veil},uCavity:{value:r.cavity},uLacquer:{value:r.lacquer},uOrbit:{value:r.orbit},uThickness:{value:r.thickness},uGlow:{value:Math.max(0,a.shellGlow??a.glow??0)},uFresnel:{value:Math.max(.1,a.shellFresnel??.5)},uLocalCamera:{value:new re(0,0,2)}}}const at=`
  varying vec3 vLocalPos;
  varying vec3 vViewDir;
  uniform vec3 uLocalCamera;
  void main() {
    vLocalPos = position;
    vViewDir = normalize(position - uLocalCamera);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`,rt=`
  varying vec3 vLocalPos;
  varying vec3 vViewDir;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uAudio;
  uniform float uRing;
  uniform float uFracture;
  uniform float uBloom;
  uniform float uVeil;
  uniform float uCavity;
  uniform float uLacquer;
  uniform float uOrbit;
  uniform float uThickness;
  uniform float uGlow;
  uniform float uFresnel;

  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 191.3))) * 43758.5453123); }
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash(i + vec3(0.0));
    float n100 = hash(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash(i + vec3(1.0));
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
      p = p * 2.02 + vec3(13.4, 7.1, 5.3);
      amp *= 0.5;
    }
    return value;
  }
  float sdfShell(vec3 p) {
    float radius = length(p);
    float theta = atan(p.y, p.x);
    float orbit = sin(theta * (3.0 + uOrbit * 10.0) + p.z * (2.0 + uOrbit * 6.0) - uTime * (0.22 + uOrbit * 0.4));
    float ring = sin(theta * (4.0 + uRing * 12.0));
    float fracture = fbm(p * (3.2 + uFracture * 2.8) + 2.8) * uFracture;
    float bloom = smoothstep(0.55, -0.15, p.y) * uBloom;
    float veil = fbm(p * (1.8 + uVeil * 1.2) + vec3(0.0, uTime * 0.08, 0.0)) * uVeil;
    float cavity = smoothstep(0.14, 0.42 + uCavity * 0.2, radius) * uCavity;
    float shellRadius = 0.62 + ring * 0.03 + orbit * 0.04 + bloom * 0.05 + veil * 0.04 - fracture * 0.08;
    float thickness = 0.08 + uThickness * 0.12 + fracture * 0.03;
    return abs(radius - shellRadius) - thickness + cavity * 0.06;
  }
  vec3 estimateNormal(vec3 p) {
    float e = 0.004;
    return normalize(vec3(
      sdfShell(p + vec3(e, 0.0, 0.0)) - sdfShell(p - vec3(e, 0.0, 0.0)),
      sdfShell(p + vec3(0.0, e, 0.0)) - sdfShell(p - vec3(0.0, e, 0.0)),
      sdfShell(p + vec3(0.0, 0.0, e)) - sdfShell(p - vec3(0.0, 0.0, e))
    ));
  }
  void main() {
    vec3 ro = vLocalPos;
    vec3 rd = normalize(vViewDir);
    float t = 0.0;
    float hit = -1.0;
    vec3 p = ro;
    for (int i = 0; i < 48; i++) {
      p = ro + rd * t;
      float d = sdfShell(p);
      if (d < 0.003) { hit = t; break; }
      t += clamp(d * 0.85, 0.01, 0.08);
      if (t > 2.6) break;
    }
    if (hit < 0.0) discard;
    vec3 normal = estimateNormal(p);
    vec3 lightDir = normalize(vec3(0.45, 0.7, 0.55));
    float diffuse = max(dot(normal, lightDir), 0.0);
    float fresnel = pow(1.0 - max(dot(normalize(-rd), normal), 0.0), 2.0 + uFresnel * 4.0);
    float lacquer = pow(max(dot(reflect(-lightDir, normal), normalize(-rd)), 0.0), 8.0 + uLacquer * 32.0) * (0.18 + uLacquer * 0.72);
    float glow = fresnel * (0.2 + uGlow * 0.8) + uAudio * 0.12;
    vec3 color = uColor * (0.28 + diffuse * 0.72);
    color += vec3(1.0) * lacquer;
    color += uColor * glow;
    float alpha = clamp(uOpacity * (0.42 + fresnel * 0.5 + diffuse * 0.2), 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;function ot(a,r){const{config:e,layerIndex:t,audioRef:u,isPlaying:m}=a,n=h.useMemo(()=>Ke(e,t),[e,t]),s=h.useMemo(()=>et(n.mode,n.source),[n.mode,n.source]),M=h.useMemo(()=>tt(n,s),[n,s]),b=h.useMemo(()=>e.sphereRadius*Math.max(.5,n.radiusScale??1)*1.2,[e.sphereRadius,n.radiusScale]);return Ae(({clock:A,camera:g})=>{var d,v,U;const f=((d=u.current)==null?void 0:d.bass)??0,w=((v=u.current)==null?void 0:v.treble)??0,_=((U=u.current)==null?void 0:U.pulse)??0,L=m?f*.55+w*.25+_*.2:0;if(M.uTime.value=A.getElapsedTime(),M.uAudio.value=L,r.current){r.current.rotation.y+=.0018+s.orbit*.003+L*.0012,r.current.rotation.x=Math.sin(A.getElapsedTime()*.17)*.16+s.veil*.18;const T=new qt().copy(r.current.matrixWorld).invert();M.uLocalCamera.value.copy(g.position).applyMatrix4(T)}}),{uniforms:M,radius:b}}const nt=({meshRef:a,radius:r,uniforms:e})=>R.jsxs("mesh",{ref:a,renderOrder:3,children:[R.jsx("boxGeometry",{args:[r*2,r*2,r*2]}),R.jsx("shaderMaterial",{uniforms:e,vertexShader:at,fragmentShader:rt,transparent:!0,depthWrite:!1,side:Ft,blending:ie})]}),Da=a=>{const r=h.useRef(null),{uniforms:e,radius:t}=ot(a,r);return R.jsx(nt,{meshRef:r,radius:t,uniforms:e})},cr=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_SHELL_PROFILE:Ie,SDF_SURFACE_SHELL_FRAGMENT_SHADER:rt,SDF_SURFACE_SHELL_VERTEX_SHADER:at,SHELL_MODE_PROFILES:Je,SdfSurfaceShellSystem:Da,SdfSurfaceShellSystemRender:nt,createSdfSurfaceShellUniforms:tt,getSdfSurfaceShellProfile:et,getSdfSurfaceShellSettings:Ke,getSdfSurfaceShellSourceAdjustments:Qe,useSdfSurfaceShellRuntime:ot},Symbol.toStringTag,{value:"Module"})),ut={ring:.12,interference:.16,tremor:.12,contour:.16,crease:.12,drift:.18,veil:.12,glow:.18,tint:"#e8efff"},lt={surface_patch:{contour:.18,crease:.12,tint:"#dde8ff"},contour_echo:{contour:.76,crease:.28,drift:.12,tint:"#f5e6d8"},echo_rings:{ring:.88,contour:.22,drift:.14,tint:"#d8e8ff"},standing_interference:{interference:.92,crease:.18,veil:.18,tint:"#f0dfff"},tremor_lattice:{tremor:.84,crease:.22,contour:.18,tint:"#dff5ff"}};function it(a,r){const e=De(a,r);return{mode:e.mode,source:e.source,color:e.color,radiusScale:e.radiusScale,opacity:r===2?a.layer2SheetOpacity:a.layer3SheetOpacity,audioReactive:e.audioReactive}}function st(a,r){const e=zt(r),t={...ut,...lt[a]??{}},u={ring:Math.max(0,t.ring+e.ring),interference:Math.max(0,t.interference+e.sweep*.3),tremor:Math.max(0,t.tremor+e.fracture*.2),contour:Math.max(0,t.contour+e.column*.18),crease:Math.max(0,t.crease+e.fracture*.3),drift:Math.max(0,t.drift+e.sweep*.3),veil:Math.max(0,t.veil+e.veil),glow:Math.max(0,t.glow+e.canopy*.25),tint:t.tint};return{influence:e,profile:u}}function ct(a,r,e){return{uTime:{value:0},uAudio:{value:0},uColor:{value:new ve(a.color||r.tint)},uOpacity:{value:Math.max(.08,a.opacity??.55)},uAudioReactive:{value:Math.max(0,a.audioReactive??0)},uRing:{value:r.ring},uInterference:{value:r.interference},uTremor:{value:r.tremor},uContour:{value:r.contour},uCrease:{value:r.crease},uDrift:{value:r.drift},uVeil:{value:r.veil},uGlow:{value:r.glow},uSourceRing:{value:e.ring},uSourceSweep:{value:e.sweep},uSourceColumn:{value:e.column},uSourceCanopy:{value:e.canopy},uSourceFracture:{value:e.fracture},uSourceBlob:{value:e.blob}}}function mt(a,r,e,t){a.uColor.value.set(r.color||e.tint),a.uOpacity.value=Math.max(.08,r.opacity??.55),a.uAudioReactive.value=Math.max(0,r.audioReactive??0),a.uRing.value=e.ring,a.uInterference.value=e.interference,a.uTremor.value=e.tremor,a.uContour.value=e.contour,a.uCrease.value=e.crease,a.uDrift.value=e.drift,a.uVeil.value=e.veil,a.uGlow.value=e.glow,a.uSourceRing.value=t.ring,a.uSourceSweep.value=t.sweep,a.uSourceColumn.value=t.column,a.uSourceCanopy.value=t.canopy,a.uSourceFracture.value=t.fracture,a.uSourceBlob.value=t.blob}function dt(a,r){return a.sphereRadius*Math.max(.55,r.radiusScale??1)*1.55}function ht(a,r){return Dt(a,r)}const ft=`
  varying vec2 vUv;
  varying float vHeight;
  uniform float uTime;
  uniform float uAudio;
  uniform float uAudioReactive;
  uniform float uRing;
  uniform float uInterference;
  uniform float uTremor;
  uniform float uContour;
  uniform float uCrease;
  uniform float uDrift;
  uniform float uVeil;
  uniform float uSourceRing;
  uniform float uSourceSweep;
  uniform float uSourceColumn;
  uniform float uSourceCanopy;
  uniform float uSourceFracture;
  uniform float uSourceBlob;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    vec2 p = uv * 2.0 - 1.0;
    float radius = length(p);
    float angle = atan(p.y, p.x);
    float rings = sin(radius * (10.0 + uRing * 22.0 + uSourceRing * 12.0) - uTime * (0.5 + uDrift));
    float interference = sin((p.x + p.y) * (6.0 + uInterference * 10.0) + uTime * 0.7) * cos((p.x - p.y) * (6.0 + uInterference * 10.0) - uTime * 0.4);
    float tremor = sin(p.x * (14.0 + uTremor * 14.0) + uTime * (1.8 + uTremor * 2.8)) * sin(p.y * (14.0 + uTremor * 14.0) - uTime * (1.2 + uTremor * 2.2));
    float contour = floor((radius + noise(p * (4.0 + uContour * 5.0)) * 0.14) * (4.0 + uContour * 8.0)) / (4.0 + uContour * 8.0);
    float crease = pow(abs(sin(angle * (3.0 + uCrease * 9.0) + uTime * 0.25)), 2.0);
    float sweep = sin(angle * (2.0 + uSourceSweep * 8.0) + radius * 6.0 - uTime * (0.5 + uDrift * 0.8));
    float column = (1.0 - smoothstep(0.0, 1.0, abs(p.x))) * uSourceColumn;
    float canopy = smoothstep(1.0, -0.1, p.y) * uSourceCanopy;
    float blob = (1.0 - smoothstep(0.0, 1.2, length(p - vec2(0.2, -0.15)))) * uSourceBlob;
    float fracture = noise(p * (8.0 + uSourceFracture * 12.0) + uTime * 0.08) * uSourceFracture;
    float height = rings * uRing * 0.12 + interference * uInterference * 0.1 + tremor * uTremor * 0.08;
    height += contour * uContour * 0.22 + crease * uCrease * 0.14 + sweep * uDrift * 0.08;
    height += column * 0.12 + canopy * 0.08 + blob * 0.14 - fracture * 0.1;
    height *= 1.0 + (uAudio * (0.24 + uAudioReactive * 0.18));
    pos.z += height;
    pos.x += sin(p.y * 3.14159) * uVeil * 0.05;
    pos.y += sin(p.x * 3.14159) * uVeil * 0.05;
    vHeight = height;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`,pt=`
  varying vec2 vUv;
  varying float vHeight;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uGlow;
  uniform float uVeil;
  uniform float uAudio;
  uniform float uAudioReactive;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float edge = 1.0 - smoothstep(0.72, 1.08, length(p));
    float highlight = smoothstep(0.02, 0.2, vHeight + 0.14);
    vec3 color = uColor * (0.44 + highlight * 0.66);
    color += uColor * uGlow * (0.08 + uAudio * 0.16);
    color += vec3(1.0) * uVeil * edge * 0.08;
    float alpha = clamp(uOpacity * edge * (0.48 + highlight * 0.4 + uVeil * 0.14), 0.0, 1.0);
    if (alpha <= 0.01) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;function Mt(a,r){const{config:e,layerIndex:t,audioRef:u,isPlaying:m}=a,n=h.useRef(_e()),s=h.useMemo(()=>it(e,t),[e,t]),{influence:M,profile:b}=h.useMemo(()=>st(s.mode,s.source),[s.mode,s.source]),A=h.useMemo(()=>ct(s,b,M),[M,b,s]);return h.useEffect(()=>{mt(A,s,b,M)},[M,b,s,A]),Ae(({clock:g})=>{const f=g.getElapsedTime(),w=Be(e,u.current,n.current),_=Pe(w,"patch"),L=ht(u,m),d=Math.max(0,_.displacement),v=Math.max(0,_.relief),U=_.opacity,T=_.sliceDepth,o=Math.max(0,_.wireframe);A.uTime.value=f,A.uAudio.value=L*(1+d*.45),A.uAudioReactive.value=Math.max(0,s.audioReactive+d*.6),A.uOpacity.value=me.clamp(Math.max(.08,s.opacity??.55)+U*.24,.04,1.35),A.uContour.value=b.contour+v*.18,A.uCrease.value=b.crease+v*.16+o*.1,A.uGlow.value=b.glow+v*.2+o*.16,A.uDrift.value=Math.max(0,b.drift+T*.1),A.uVeil.value=Math.max(0,b.veil+T*.08),r.current&&(r.current.rotation.x=M.tiltX+v*.08,r.current.rotation.y=M.tiltY+Math.sin(f*.18)*(.05+b.drift*.06)+T*.04)}),{uniforms:A,size:dt(e,s)}}const vt=({meshRef:a,size:r,uniforms:e})=>R.jsxs("mesh",{ref:a,renderOrder:3,children:[R.jsx("planeGeometry",{args:[r,r,96,96]}),R.jsx("shaderMaterial",{uniforms:e,vertexShader:ft,fragmentShader:pt,transparent:!0,depthWrite:!1,side:ke,blending:ie})]}),za=a=>{const r=h.useRef(null),e=Mt(a,r);return R.jsx(vt,{meshRef:r,...e})},mr=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_PATCH_PROFILE:ut,HYBRID_SURFACE_PATCH_FRAGMENT_SHADER:pt,HYBRID_SURFACE_PATCH_VERTEX_SHADER:ft,HybridSurfacePatchSystem:za,HybridSurfacePatchSystemRender:vt,PATCH_MODE_PROFILES:lt,createHybridSurfacePatchUniforms:ct,getHybridSurfacePatchAudioDrive:ht,getHybridSurfacePatchProfile:st,getHybridSurfacePatchSettings:it,getHybridSurfacePatchSize:dt,syncHybridSurfacePatchUniforms:mt,useHybridSurfacePatchRuntime:Mt},Symbol.toStringTag,{value:"Module"}));export{$a as a,Ka as b,Ia as c,Ee as d,tr as e,ar as f,nr as g,Qa as h,er as i,ur as j,or as k,rr as l,ir as m,sr as n,cr as o,mr as p,lr as s,Ja as w};
