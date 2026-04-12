import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const CONFIG_DIR = path.dirname(fileURLToPath(import.meta.url));

const HTML_PRELOAD_EXCLUSION_PATTERNS = [
  /(^|\/)scene-postfx(?:-(?:vendor|composer|n8ao-vendor))?-/,
  /(^|\/)ui-control-panel-/,
  /(^|\/)ui-diagnostics-/,
  /(^|\/)scene-diagnostics-shared-/,
  /(^|\/)scene-overlay-core-/,
  /(^|\/)scene-particle-core-/,
  /(^|\/)scene-authoring-(?:catalog|coverage|atlas|hybrid|product)-/,
  /(^|\/)scene-runtime-(?:motion|catalog|profiling)-/,
  /(^|\/)scene-motion-shared-/,
  /(^|\/)scene-future-native-specialist-/,
  /(^|\/)scene-future-native-volumetric-/,
  /(^|\/)scene-future-native-pbd-/,
  /(^|\/)scene-future-native-mpm-/,
  /(^|\/)scene-future-native-fracture-/,
  /(^|\/)scene-future-native-bridges-/,
  /(^|\/)scene-future-native-/,
  /(^|\/)scene-families-core-/,
  /(^|\/)scene-family-[^-]+-/,
  /(^|\/)scene-gpgpu-/,
  /(^|\/)scene-depiction-shared-/,
];

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
  const libraryScope = env.VITE_LIBRARY_SCOPE ?? process.env.VITE_LIBRARY_SCOPE ?? 'private';
  const verifyInline = env.VITE_VERIFY_INLINE === '1' || mode === 'verify-inline';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [tailwindcss(), react()],
      define: {
        '__LIBRARY_SCOPE__': JSON.stringify(libraryScope),
      },
      resolve: {
        extensions: ['.mjs', '.mts', '.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          '@': path.resolve(CONFIG_DIR, '.'),
          ...(verifyInline ? { '@/components/AppBodyScene': path.resolve(CONFIG_DIR, 'components/AppBodyScene.verify.tsx') } : {}),
        },
      },
      build: {
        reportCompressedSize: process.env.KALOKAGATHIA_FAST_BUILD === '1' ? false : undefined,
        modulePreload: verifyInline ? undefined : {
          resolveDependencies: (_url, deps) => (
            deps.filter((dep) => !HTML_PRELOAD_EXCLUSION_PATTERNS.some((pattern) => pattern.test(dep)))
          ),
        },
        outDir: process.env.KALOKAGATHIA_OUT_DIR || (verifyInline ? 'dist-verify-inline' : 'dist'),
        chunkSizeWarningLimit: 700,
        cssCodeSplit: verifyInline ? false : undefined,
        assetsInlineLimit: verifyInline ? 100_000_000 : undefined,
        rollupOptions: {
          output: verifyInline ? {
            inlineDynamicImports: true,
            entryFileNames: 'assets/index.js',
            chunkFileNames: 'assets/[name].js',
            assetFileNames: 'assets/[name][extname]',
          } : {
            manualChunks(id) {
              const normalizedId = id.split('\\').join('/');

              if (!normalizedId.includes('/node_modules/')) {
                if (normalizedId.includes('/components/controlPanelGlobalDisplayRenderClasses')
                  || normalizedId.includes('/lib/renderModeRegistry')) {
                  return 'ui-control-panel-render-classes';
                }

                if (normalizedId.includes('/lib/starterLibraryData')) {
                  return 'starter-library-core';
                }

                if (normalizedId.includes('/lib/starterLibraryPresetBase')) {
                  return 'starter-library-base';
                }

                if (normalizedId.includes('/lib/starterLibraryPresetExtension')) {
                  return 'starter-library-extensions';
                }

                if (normalizedId.includes('/lib/starterLibrarySequence')) {
                  return 'starter-library-sequences';
                }

                if (normalizedId.includes('/lib/starterLibraryProductPackAugmentation')) {
                  return 'starter-library-product-packs';
                }

                if (normalizedId.includes('/lib/motionCatalog')
                  || normalizedId.includes('/lib/motionGrouping')
                  || normalizedId.includes('/lib/motionMap')
                  || normalizedId.includes('/lib/temporalProfiles')) {
                  return 'scene-runtime-motion';
                }
                if (normalizedId.includes('/lib/runtimeProfiling')) {
                  return 'scene-runtime-profiling';
                }
                if (normalizedId.includes('/lib/workerCandidateAnalysis')
                  || normalizedId.includes('/lib/futureNativeExecutionAnalysis')
                  || normalizedId.includes('/lib/gpgpuExecutionStatus')
                  || normalizedId.includes('/lib/future-native-families/futureNativeSceneDiagnosticsStore')
                  || normalizedId.includes('/lib/workerExecutionTelemetry')
                  || normalizedId.includes('/lib/useLivePerformanceTelemetry')) {
                  return 'scene-diagnostics-shared';
                }
                if (normalizedId.includes('/lib/sceneRenderRoutingPlans')
                  || normalizedId.includes('/lib/sceneRenderRoutingBranchBuilders')) {
                  return 'scene-runtime-catalog';
                }
                if (normalizedId.includes('/lib/depictionArchitecture')) {
                  return 'scene-depiction-shared';
                }

                if (normalizedId.includes('/lib/depictionCoverage')
                  || normalizedId.includes('/lib/productPackAugmentation')
                  || normalizedId.includes('/lib/productPackScorecards')) {
                  return 'scene-authoring-coverage';
                }

                if (normalizedId.includes('/lib/expressionAtlas')) {
                  return 'scene-authoring-atlas';
                }

                if (normalizedId.includes('/lib/hybridExpression')
                  || normalizedId.includes('/lib/hybridTemporalVariant')
                  || normalizedId.includes('/lib/hybridRuntimeShared')) {
                  return 'scene-authoring-hybrid';
                }

                if (normalizedId.includes('/lib/motionArchitecture')
                  || normalizedId.includes('/lib/productPackLibrary')
                  || normalizedId.includes('/lib/productPackDetail')
                  || normalizedId.includes('/lib/productPackSubfamilies')
                  || normalizedId.includes('/lib/materialMoodBundles')) {
                  return 'scene-authoring-product';
                }

                if (/\/components\/(gpgpu|useGpgpu|sceneGpgpu)/.test(normalizedId)) {
                  return 'scene-gpgpu';
                }

                if (normalizedId.includes('/components/AppScenePostFxN8ao')) {
                  return 'scene-postfx-n8ao';
                }

                if (normalizedId.includes('/components/AppScenePostFx')) {
                  return 'scene-postfx';
                }

                if (/\/components\/scene(Membrane|HybridMembrane)/.test(normalizedId)) {
                  return 'scene-family-membrane';
                }

                if (/\/components\/scene(SurfaceShell|SdfSurfaceShell|SurfacePatch|HybridSurfacePatch|BrushSurface)/.test(normalizedId)) {
                  return 'scene-family-surface';
                }

                if (/\/components\/scene(FiberField|HybridFiberField)/.test(normalizedId)) {
                  return 'scene-family-fiber';
                }

                if (/\/components\/scene(GrowthField|DepositionField)/.test(normalizedId)) {
                  return 'scene-family-growth';
                }

                if (/\/components\/scene(CrystalAggregate|HybridGranularField|CrystalDeposition|ErosionTrail|VoxelLattice)/.test(normalizedId)) {
                  return 'scene-family-material';
                }

                if (/\/components\/sceneReactionDiffusion/.test(normalizedId)) {
                  return 'scene-family-reaction';
                }

                if (/\/components\/scene(VolumeFog|VolumetricField)/.test(normalizedId)) {
                  return 'scene-family-volumetric';
                }

                if (/\/components\/sceneGlyphOutline/.test(normalizedId)) {
                  return 'scene-family-glyph';
                }

                if (/\/components\/scene(MetaballSystem|GpgpuSmoothTube)/.test(normalizedId)) {
                  return 'scene-family-gpgpu-aux';
                }

                if (/\/components\/AppSceneCameraPrimitives\.tsx?$/.test(normalizedId)) {
                  return 'scene-camera-core';
                }

                if (/\/components\/scene(Capture|Overlay)\.tsx?$/.test(normalizedId)) {
                  return 'scene-overlay-core';
                }
                if (/\/components\/sceneParticleSystem/.test(normalizedId)
                  || /\/components\/sceneLineSystem/.test(normalizedId)
                  || /\/components\/sceneShared\.tsx?$/.test(normalizedId)
                  || /\/components\/sceneShaders\.tsx?$/.test(normalizedId)) {
                  return 'scene-particle-core';
                }

                if (/\/components\/sceneMotionEstimator/.test(normalizedId)
                  || /\/components\/sceneMotionMap\.tsx?$/.test(normalizedId)) {
                  return 'scene-motion-shared';
                }

                if (normalizedId.includes('/lib/future-native-families/futureNativeFamiliesSpecialist')
                  || normalizedId.includes('/lib/future-native-families/futureNativeSpecialistFamilyPreview')
                  || normalizedId.includes('/lib/future-native-families/futureNativeFamiliesProjectReport')
                  || normalizedId.includes('/lib/future-native-families/futureNativeFamiliesReleaseReport')
                  || normalizedId.includes('/lib/future-native-families/futureNativeFamiliesReport')
                  || normalizedId.includes('/lib/future-native-families/futureNativeFamilyPreviewArtifact')) {
                  return 'scene-future-native-specialist';
                }

                if (normalizedId.includes('/lib/future-native-families/futureNativeSceneBridgeShared')
                  || normalizedId.includes('/lib/future-native-families/futureNativeSceneBridgeTypes')) {
                  return 'scene-future-native-shared';
                }

                if (normalizedId.includes('/lib/future-native-families/futureNativeSceneBridgeVolumetric')
                  || normalizedId.includes('/lib/future-native-families/futureNativeVolumetric')
                  || normalizedId.includes('/lib/future-native-families/futureNativeSmokeAuthoring')
                  || normalizedId.includes('/lib/future-native-families/starter-runtime/volumetric_')) {
                  return 'scene-future-native-bridges';
                }

                if (normalizedId.includes('/lib/future-native-families/futureNativeSceneBridgeMpm')
                  || normalizedId.includes('/lib/future-native-families/starter-runtime/mpm_')) {
                  return 'scene-future-native-mpm';
                }

                if (normalizedId.includes('/lib/future-native-families/futureNativeSceneBridgePbdInputs')
                  || normalizedId.includes('/lib/future-native-families/futureNativeSceneBridgePbd')
                  || normalizedId.includes('/lib/future-native-families/futureNativeSceneBridgeRope')
                  || normalizedId.includes('/lib/future-native-families/starter-runtime/pbd_')) {
                  return 'scene-future-native-pbd';
                }

                if (normalizedId.includes('/lib/future-native-families/futureNativeSceneBridgeFracture')
                  || normalizedId.includes('/lib/future-native-families/starter-runtime/fracture_')) {
                  return 'scene-future-native-fracture';
                }

                if (normalizedId.includes('/lib/future-native-families/futureNativeSceneBridgeSurface')) {
                  return 'scene-future-native-surface';
                }

                if (normalizedId.includes('/components/sceneFutureNativeSystem')
                  || normalizedId.includes('/lib/future-native-families/futureNativeSceneRendererBridge')
                  || normalizedId.includes('/lib/future-native-families/futureNativeSceneBridgeRuntimeControl')
                  || normalizedId.includes('/lib/future-native-families/futureNativeSceneBridgeRuntimeHelpers')
                  || normalizedId.includes('/lib/future-native-families/futureNativeSceneDiagnosticsStore')
                  || normalizedId.includes('/lib/future-native-families/futureNativeSceneBindingRuntime')) {
                  return 'scene-future-native-bridges';
                }

                if (normalizedId.includes('/components/controlPanelGlobalPresets')) {
                  return 'ui-control-panel-global-presets';
                }

                if (normalizedId.includes('/components/controlPanelGlobalSequence')) {
                  return 'ui-control-panel-global-sequence';
                }

                if (normalizedId.includes('/components/controlPanelGlobalExport')
                  || normalizedId.includes('/components/controlPanelGlobalExportFutureNative')) {
                  return 'ui-control-panel-global-export';
                }

                if (normalizedId.includes('/components/controlPanelGlobalProject')) {
                  return 'ui-control-panel-global-project';
                }

                if (normalizedId.includes('/components/controlPanelProjectIO')
                  || normalizedId.includes('/components/controlPanelProjectIOCompare')
                  || normalizedId.includes('/components/controlPanelProjectIOManifest')
                  || normalizedId.includes('/components/controlPanelProjectIOSnapshot')
                  || normalizedId.includes('/components/controlPanelProjectIOFutureNative')) {
                  return 'ui-control-panel-project-io';
                }

                if (normalizedId.includes('/components/controlPanelGlobalFutureNative')) {
                  return 'ui-control-panel-global-future-native';
                }

                if (normalizedId.includes('/components/controlPanelGlobalDisplay.tsx')) {
                  return 'ui-control-panel-global-display';
                }

                if (normalizedId.includes('/components/controlPanelGlobalDisplayEffects')) {
                  return 'ui-control-panel-global-display-effects';
                }

                if (normalizedId.includes('/components/controlPanelGlobalDisplayPostFxStackBundles')) {
                  return 'ui-control-panel-global-display-postfx-bundles';
                }

                if (normalizedId.includes('/components/controlPanelGlobalDisplayPostFxAdvanced')) {
                  return 'ui-control-panel-global-display-postfx-advanced';
                }

                if (normalizedId.includes('/components/controlPanelGlobalDisplayProductPacks')
                  || normalizedId.includes('/components/useGlobalDisplayProductPacks')
                  || normalizedId.includes('/components/controlPanelGlobalDisplayProductPacksLazy')) {
                  return 'ui-control-panel-global-display-packs';
                }

                if (normalizedId.includes('/components/controlPanelTabsGlobal')) {
                  return 'ui-control-panel-global';
                }

                if (normalizedId.includes('/components/controlPanelTabsLayers')) {
                  return 'ui-control-panel-layers';
                }

                if (normalizedId.includes('/components/controlPanelTabsAudio.tsx')) {
                  return 'ui-control-panel-audio';
                }

                if (normalizedId.includes('/components/controlPanelTabsAudioSynth')) {
                  return 'ui-control-panel-audio-synth';
                }

                if (normalizedId.includes('/components/controlPanelTabsAudioRouteEditor')
                  || normalizedId.includes('/components/controlPanelTabsAudioRouteCard')
                  || normalizedId.includes('/components/controlPanelTabsAudioRouteEditorWorkspace')
                  || normalizedId.includes('/components/controlPanelTabsAudioRouteTransferSection')
                  || normalizedId.includes('/components/controlPanelTabsAudioSequenceTrigger')) {
                  return 'ui-control-panel-audio-route-editor';
                }

                if (normalizedId.includes('/components/AudioLegacySection')
                  || normalizedId.includes('/components/controlPanelTabsAudioLegacySliders')
                  || normalizedId.includes('/components/controlPanelTabsAudioLegacyConflict')
                  || normalizedId.includes('/components/controlPanelTabsAudioLegacy.ts')) {
                  return 'ui-control-panel-audio-legacy';
                }

                if (normalizedId.includes('/components/ControlPanelEntry')) {
                  return 'ui-control-panel-entry';
                }

                if (normalizedId.includes('/components/ControlPanelBody')) {
                  return 'ui-control-panel-body';
                }

                if (normalizedId.includes('/components/ControlPanelConnected')) {
                  return 'ui-control-panel-connected';
                }

                if (normalizedId.includes('/components/useControlPanelState')
                  || normalizedId.includes('/components/useControlPanelConfigHelpers')
                  || normalizedId.includes('/components/useControlPanelLocalState')
                  || normalizedId.includes('/components/useSequenceDrag')) {
                  return 'ui-control-panel-state';
                }

                if (normalizedId.includes('/components/controlPanelChrome')) {
                  return 'ui-control-panel-chrome';
                }

                if (/\/components\/(ControlPanel|controlPanel|useControlPanel)/.test(normalizedId)) {
                  return 'ui-control-panel';
                }

                if (/\/components\/(AppExecutionDiagnosticsOverlay|canvasStreamWidget)/.test(normalizedId)) {
                  return 'ui-diagnostics';
                }

                if (/\/components\/scene[A-Z]/.test(normalizedId)) {
                  return 'scene-families-core';
                }

                return;
              }

              if (normalizedId.includes('/three/examples/jsm/geometries/ConvexGeometry')) {
                return 'scene-family-surface';
              }

              if (normalizedId.includes('/three/')) {
                return 'three-core';
              }

              if (normalizedId.includes('@react-three/fiber')) {
                return 'r3f-fiber';
              }

              if (normalizedId.includes('@react-three/drei')) {
                return 'r3f-drei';
              }

              if (normalizedId.includes('/three-stdlib/objects/MarchingCubes')) {
                return 'scene-family-gpgpu-aux';
              }

              if (normalizedId.includes('three-stdlib')) {
                return 'three-stdlib';
              }

              if (normalizedId.includes('node_modules/n8ao')
                || normalizedId.includes('@react-three/postprocessing/dist/effects/N8AO/')) {
                return 'scene-postfx-n8ao-vendor';
              }

              if (normalizedId.includes('@react-three/postprocessing/dist/EffectComposer')
                || normalizedId.includes('@react-three/postprocessing/dist/Selection')
                || normalizedId.includes('@react-three/postprocessing/dist/util')
                || normalizedId.endsWith('/node_modules/postprocessing/build/index.js')
                || normalizedId.endsWith('/node_modules/postprocessing/build/index.cjs')) {
                return 'scene-postfx-composer';
              }

              if (normalizedId.includes('@react-three/postprocessing') || normalizedId.includes('node_modules/postprocessing')) {
                return 'scene-postfx-vendor';
              }

              if (normalizedId.includes('maath') || normalizedId.includes('react-use-measure') || normalizedId.includes('debounce') || normalizedId.includes('its-fine') || normalizedId.includes('react-reconciler')) {
                return 'r3f-utils';
              }

              if (normalizedId.includes('react') || normalizedId.includes('scheduler') || normalizedId.includes('zustand')) {
                return 'react-vendor';
              }

              if (normalizedId.includes('lucide-react')) {
                return 'ui-vendor';
              }

              return 'vendor';
            },
          },
        },
      }
    };
});
