# AUDIO_REACTIVE_COVERAGE_MATRIX

## 目的

この文書は、**今この repo で何が live で、何が予約帯域か**を後続 AI が即座に判断するための coverage 正本です。

## 現在のカバレッジ

- live systems: 13
- live targets: 155
- preset packs: 14
- feature keys available in route source: 23
- route editor: first-pass live
- alias targets included in count: surface / crystal / voxel / reaction / deposition / overlay / camera / sequence

## live systems

補足:
- 以下の live target 一覧は **base target** を中心に記載する。
- 上部の live target 数 136 には、`overlay.*` や `brush.*` などの **family alias target** も含む。


### 1. particle
live targets: 19

- particle.bassMotion
- particle.trebleMotion
- particle.bandAMotion
- particle.bandBMotion
- particle.bassSize
- particle.trebleSize
- particle.bandASize
- particle.bandBSize
- particle.bassAlpha
- particle.trebleAlpha
- particle.bandAAlpha
- particle.bandBAlpha
- particle.pulse
- particle.morph
- particle.shatter
- particle.twist
- particle.bend
- particle.warp
- postfx.hueShift

runtime:
- `components/sceneParticleSystemRuntimeAudio.ts`
- `components/sceneParticleSystemRuntime.ts`

### 2. line
live targets: 8

- line.opacity
- line.width
- line.connectDistance
- line.shimmer
- line.flickerSpeed
- line.velocityGlow
- line.velocityAlpha
- line.burstPulse

runtime:
- `components/sceneLineSystemRuntime.ts`
- `components/sceneLineSystemShared.ts`

### 3. fog
live targets: 6

- fog.density
- fog.opacity
- fog.glow
- fog.drift
- fog.anisotropy
- fog.depth

runtime:
- `components/sceneVolumeFogSystemRuntime.ts`

### 4. growth
live targets: 4

- growth.opacity
- growth.length
- growth.branches
- growth.spread

runtime:
- `components/sceneGrowthFieldSystemRuntime.ts`

注意:
- branch 数は `layout.maxStrandCount` を超えて増やせない。
- つまり route は **事前に確保した ceiling の範囲内** で枝数を増減する。

### 5. camera
live targets: 4

- camera.shake
- camera.orbitSpeed
- camera.fov
- camera.dolly

runtime:
- `components/AppSceneCameraRig.tsx`

### 6. screen overlay
live targets: 9

- screen.scanlineIntensity
- screen.noiseIntensity
- screen.vignetteIntensity
- screen.pulseIntensity
- screen.pulseSpeed
- screen.interferenceIntensity
- screen.persistenceIntensity
- screen.splitIntensity
- screen.sweepIntensity

runtime:
- `components/sceneOverlay.tsx`

### 7. surface
live targets: 5

- surface.displacement
- surface.opacity
- surface.relief
- surface.wireframe
- surface.sliceDepth

runtime:
- `components/sceneBrushSurfaceSystemRuntime.ts`
- `components/sceneSurfacePatchSystemRuntime.ts`
- `components/sceneMembraneSystemRuntime.ts`
- `components/sceneSurfaceShellSystemRuntime.ts`
- `lib/audioReactiveTargetSets.ts`

注意:
- `surface.wireframe` は wireframe を持つ runtime でのみ可視化される。brush surface はこの target を無視する。
- `surface.sliceDepth` は共通語彙として live だが、runtime ごとに「厚み圧縮」「Z 深度圧縮」「slice 的 flattening」の意味合いが少し異なる。

### 8. crystal
live targets: 5

- crystal.opacity
- crystal.scale
- crystal.spread
- crystal.wireframe
- crystal.glow

runtime:
- `components/sceneCrystalAggregateSystem.tsx`
- `components/sceneCrystalAggregateSystemRuntime.ts`
- `lib/audioReactiveTargetSets.ts`

### 9. voxel
live targets: 5

- voxel.opacity
- voxel.scale
- voxel.snap
- voxel.jitter
- voxel.wireframe

runtime:
- `components/sceneVoxelLatticeSystem.tsx`
- `lib/audioReactiveTargetSets.ts`

### 10. reaction
live targets: 5

- reaction.opacity
- reaction.warp
- reaction.feed
- reaction.kill
- reaction.relief

runtime:
- `components/sceneReactionDiffusionSystemRuntime.ts`
- `lib/audioReactiveTargetSets.ts`

注意:
- `reaction.feed` / `reaction.kill` は小さいオフセットとして扱う。過大にすると模様が急崩壊する。

### 11. deposition
live targets: 6

- deposition.opacity
- deposition.relief
- deposition.erosion
- deposition.bands
- deposition.scale
- deposition.wireframe

runtime:
- `components/sceneDepositionFieldSystem.tsx`
- `components/sceneCrystalDepositionSystem.tsx`
- `lib/audioReactiveTargetSets.ts`

注意:
- `deposition.bands` は段数の追加オフセットであり、極端に増やすと縞が過密になる。
- `deposition.wireframe` は plane と crystal の両方に効く first-pass 実装。

### 12. sequence
live targets: 3

- sequence.stepAdvance
- sequence.crossfade
- sequence.randomizeSeed
- sequence.seedMutation

runtime:
- `lib/useSequenceAudioTriggers.ts`
- `App.tsx`

注意:
- `sequence.randomizeSeed` / `sequence.seedMutation` は専用 seed mutation helper を短時間 morph で注入する。
- mutation 強度と scope は Audio タブから調整できる。
- `sequence.stepAdvance` と `sequence.crossfade` は rising-edge trigger + cooldown で発火する。

## preset packs

- particle-spectrum
- line-weave
- fog-breath
- growth-pulse
- camera-impulse
- screen-glitch
- surface-relief
- crystal-bloom
- voxel-grid
- reaction-pulse
- deposition-etch
- sequence-gates

実装:
- `lib/audioReactivePresets.ts`
- `components/controlPanelTabsAudio.tsx`

## 予約帯域

現時点の大きい予約帯域は、sequence ではなく

- route editor drag sort / bulk edit
- legacy slider 縮退

です。

## 今回の意味

今回の pass で、音反応は

- particle / line / fog / growth / camera / screen overlay / surface

だけでなく、**crystal / voxel / reaction / deposition family** と **sequence trigger runtime** まで first-pass live になった。

つまり今後の拡張は、「新しい system をゼロから考える」よりも、**既存 route evaluator と capability registry に target を足し、target set helper で family 単位に束ねる**方向で進めるのが正しい。

## 追加メモ

- sequence targets は live かつ threshold / cooldown configurable。
- route transfer は Audio タブから JSON bundle として扱える。


## 2026-04-01 v7

- Sequence Trigger State: live
- Surface family-specific drive resolve: brush / patch / membrane / shell live
- Deposition family-specific drive resolve: depositionField / crystalDeposition live
