import type { ProceduralSystemId } from './proceduralModeRegistry';
import { lazyNamedComponent } from './lazySceneComponent';
import {
  createSceneSystemContract,
  type FutureNativeSceneSystemContract,
  type LayerSceneSystemComponentProps,
  type ProceduralSceneSystemContract,
} from './sceneSystemContract';

const MembraneSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneMembraneSystem'), 'MembraneSystem');
const SurfaceShellSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneSurfaceShellSystem'), 'SurfaceShellSystem');
const SurfacePatchSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneSurfacePatchSystem'), 'SurfacePatchSystem');
const BrushSurfaceSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneBrushSurfaceSystem'), 'BrushSurfaceSystem');
const FiberFieldSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneFiberFieldSystem'), 'FiberFieldSystem');
const GrowthFieldSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneGrowthFieldSystem'), 'GrowthFieldSystem');
const DepositionFieldSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneDepositionFieldSystem'), 'DepositionFieldSystem');
const ReactionDiffusionSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneReactionDiffusionSystem'), 'ReactionDiffusionSystem');
const VolumeFogSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneVolumeFogSystem'), 'VolumeFogSystem');
const CrystalAggregateSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneCrystalAggregateSystem'), 'CrystalAggregateSystem');
const VoxelLatticeSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneVoxelLatticeSystem'), 'VoxelLatticeSystem');
const CrystalDepositionSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneCrystalDepositionSystem'), 'CrystalDepositionSystem');
const ErosionTrailSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneErosionTrailSystem'), 'ErosionTrailSystem');
const HybridMembraneSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneHybridMembraneSystem'), 'HybridMembraneSystem');
const SdfSurfaceShellSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneSdfSurfaceShellSystem'), 'SdfSurfaceShellSystem');
const HybridSurfacePatchSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneHybridSurfacePatchSystem'), 'HybridSurfacePatchSystem');
const HybridFiberFieldSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneHybridFiberFieldSystem'), 'HybridFiberFieldSystem');
const VolumetricFieldSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneVolumetricFieldSystem'), 'VolumetricFieldSystem');
const HybridGranularFieldSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneHybridGranularFieldSystem'), 'HybridGranularFieldSystem');
const SceneFutureNativeSystem = lazyNamedComponent<LayerSceneSystemComponentProps>(() => import('../components/sceneFutureNativeSystem'), 'SceneFutureNativeSystem');

export const PROCEDURAL_SCENE_SYSTEM_CONTRACTS = {
  membrane: createSceneSystemContract({ id: 'membrane', label: 'Membrane System', category: 'procedural-surface', activationKind: 'procedural', support: 'experimental', performanceClass: 'medium', manifestFeatures: ['procedural:membrane', 'surface:sheet'], sceneBranches: ['procedural:membrane'], component: MembraneSystem }),
  'surface-shell': createSceneSystemContract({ id: 'surface-shell', label: 'Surface Shell System', category: 'procedural-surface', activationKind: 'procedural', support: 'experimental', performanceClass: 'medium', manifestFeatures: ['procedural:surface-shell', 'surface:hull'], sceneBranches: ['procedural:surface-shell'], component: SurfaceShellSystem }),
  'surface-patch': createSceneSystemContract({ id: 'surface-patch', label: 'Surface Patch System', category: 'procedural-surface', activationKind: 'procedural', support: 'experimental', performanceClass: 'medium', manifestFeatures: ['procedural:surface-patch', 'surface:patch'], sceneBranches: ['procedural:surface-patch'], component: SurfacePatchSystem }),
  'brush-surface': createSceneSystemContract({ id: 'brush-surface', label: 'Brush Surface System', category: 'procedural-surface', activationKind: 'procedural', support: 'experimental', performanceClass: 'medium', manifestFeatures: ['procedural:brush-surface', 'surface:brush'], sceneBranches: ['procedural:brush-surface'], component: BrushSurfaceSystem }),
  'fiber-field': createSceneSystemContract({ id: 'fiber-field', label: 'Fiber Field System', category: 'procedural-surface', activationKind: 'procedural', support: 'experimental', performanceClass: 'medium', manifestFeatures: ['procedural:fiber-field', 'lines:fiber'], sceneBranches: ['procedural:fiber-field'], component: FiberFieldSystem }),
  'growth-field': createSceneSystemContract({ id: 'growth-field', label: 'Growth Field System', category: 'procedural-surface', activationKind: 'procedural', support: 'experimental', performanceClass: 'medium', manifestFeatures: ['procedural:growth-field', 'lines:growth'], sceneBranches: ['procedural:growth-field'], component: GrowthFieldSystem }),
  'deposition-field': createSceneSystemContract({ id: 'deposition-field', label: 'Deposition Field System', category: 'procedural-surface', activationKind: 'procedural', support: 'experimental', performanceClass: 'medium', manifestFeatures: ['procedural:deposition-field', 'surface:deposition'], sceneBranches: ['procedural:deposition-field'], component: DepositionFieldSystem }),
  'reaction-diffusion': createSceneSystemContract({ id: 'reaction-diffusion', label: 'Reaction Diffusion System', category: 'procedural-surface', activationKind: 'procedural', support: 'experimental', performanceClass: 'medium', manifestFeatures: ['procedural:reaction-diffusion', 'surface:reaction'], sceneBranches: ['procedural:reaction-diffusion'], component: ReactionDiffusionSystem }),
  'volume-fog': createSceneSystemContract({ id: 'volume-fog', label: 'Volume Fog System', category: 'procedural-surface', activationKind: 'procedural', support: 'heavy', performanceClass: 'heavy', manifestFeatures: ['procedural:volume-fog', 'volume:fog'], sceneBranches: ['procedural:volume-fog'], component: VolumeFogSystem }),
  'crystal-aggregate': createSceneSystemContract({ id: 'crystal-aggregate', label: 'Crystal Aggregate System', category: 'procedural-surface', activationKind: 'procedural', support: 'experimental', performanceClass: 'heavy', manifestFeatures: ['procedural:crystal-aggregate', 'instanced-solids:crystal'], sceneBranches: ['procedural:crystal-aggregate'], component: CrystalAggregateSystem }),
  'voxel-lattice': createSceneSystemContract({ id: 'voxel-lattice', label: 'Voxel Lattice System', category: 'procedural-surface', activationKind: 'procedural', support: 'experimental', performanceClass: 'heavy', manifestFeatures: ['procedural:voxel-lattice', 'instanced-solids:voxel'], sceneBranches: ['procedural:voxel-lattice'], component: VoxelLatticeSystem }),
  'crystal-deposition': createSceneSystemContract({ id: 'crystal-deposition', label: 'Crystal Deposition System', category: 'procedural-surface', activationKind: 'procedural', support: 'experimental', performanceClass: 'heavy', manifestFeatures: ['procedural:crystal-deposition', 'instanced-solids:crystal-deposition'], sceneBranches: ['procedural:crystal-deposition'], component: CrystalDepositionSystem }),
  'erosion-trail': createSceneSystemContract({ id: 'erosion-trail', label: 'Erosion Trail System', category: 'procedural-surface', activationKind: 'procedural', support: 'experimental', performanceClass: 'medium', manifestFeatures: ['procedural:erosion-trail', 'lines:erosion'], sceneBranches: ['procedural:erosion-trail'], component: ErosionTrailSystem }),
} as const satisfies Record<ProceduralSystemId, ProceduralSceneSystemContract>;

export const HYBRID_SCENE_SYSTEM_CONTRACTS = {
  membrane: createSceneSystemContract({ id: 'membrane', label: 'Hybrid Membrane System', category: 'hybrid-surface', activationKind: 'hybrid', support: 'experimental', performanceClass: 'medium', manifestFeatures: ['hybrid:membrane'], sceneBranches: ['hybrid:membrane'], component: HybridMembraneSystem }),
  'surface-shell': createSceneSystemContract({ id: 'surface-shell', label: 'SDF Surface Shell System', category: 'hybrid-surface', activationKind: 'hybrid', support: 'experimental', performanceClass: 'medium', manifestFeatures: ['hybrid:surface-shell', 'hybrid:sdf-surface-shell'], sceneBranches: ['hybrid:surface-shell'], component: SdfSurfaceShellSystem }),
  'surface-patch': createSceneSystemContract({ id: 'surface-patch', label: 'Hybrid Surface Patch System', category: 'hybrid-surface', activationKind: 'hybrid', support: 'experimental', performanceClass: 'medium', manifestFeatures: ['hybrid:surface-patch'], sceneBranches: ['hybrid:surface-patch'], component: HybridSurfacePatchSystem }),
  'fiber-field': createSceneSystemContract({ id: 'fiber-field', label: 'Hybrid Fiber Field System', category: 'hybrid-surface', activationKind: 'hybrid', support: 'experimental', performanceClass: 'medium', manifestFeatures: ['hybrid:fiber-field'], sceneBranches: ['hybrid:fiber-field'], component: HybridFiberFieldSystem }),
  'growth-field': PROCEDURAL_SCENE_SYSTEM_CONTRACTS['growth-field'],
  'deposition-field': PROCEDURAL_SCENE_SYSTEM_CONTRACTS['deposition-field'],
  'reaction-diffusion': PROCEDURAL_SCENE_SYSTEM_CONTRACTS['reaction-diffusion'],
  'volume-fog': createSceneSystemContract({ id: 'volume-fog', label: 'Volumetric Field System', category: 'hybrid-surface', activationKind: 'hybrid', support: 'heavy', performanceClass: 'heavy', manifestFeatures: ['hybrid:volume-fog', 'future-native:volumetric'], sceneBranches: ['hybrid:volume-fog'], component: VolumetricFieldSystem }),
  'crystal-aggregate': createSceneSystemContract({ id: 'crystal-aggregate', label: 'Hybrid Granular Field System', category: 'hybrid-surface', activationKind: 'hybrid', support: 'experimental', performanceClass: 'heavy', manifestFeatures: ['hybrid:crystal-aggregate', 'hybrid:granular'], sceneBranches: ['hybrid:crystal-aggregate'], component: HybridGranularFieldSystem }),
  'voxel-lattice': PROCEDURAL_SCENE_SYSTEM_CONTRACTS['voxel-lattice'],
  'crystal-deposition': PROCEDURAL_SCENE_SYSTEM_CONTRACTS['crystal-deposition'],
  'erosion-trail': PROCEDURAL_SCENE_SYSTEM_CONTRACTS['erosion-trail'],
  'brush-surface': PROCEDURAL_SCENE_SYSTEM_CONTRACTS['brush-surface'],
} as const satisfies Record<ProceduralSystemId, ProceduralSceneSystemContract>;

export const FUTURE_NATIVE_SCENE_SYSTEM_CONTRACT = createSceneSystemContract({ id: 'future-native-bridge', label: 'Future Native Scene Bridge', category: 'future-native', activationKind: 'future-native', support: 'experimental', performanceClass: 'heavy', manifestFeatures: ['future-native:bridge'], sceneBranches: ['future-native-renderer'], component: SceneFutureNativeSystem }) as FutureNativeSceneSystemContract;

export function getProceduralSceneSystemContract(systemId: ProceduralSystemId | null | undefined) {
  return systemId ? PROCEDURAL_SCENE_SYSTEM_CONTRACTS[systemId] ?? null : null;
}

export function getHybridSceneSystemContract(systemId: ProceduralSystemId | null | undefined) {
  return systemId ? HYBRID_SCENE_SYSTEM_CONTRACTS[systemId] ?? null : null;
}

export function getFutureNativeSceneSystemContract() {
  return FUTURE_NATIVE_SCENE_SYSTEM_CONTRACT;
}
