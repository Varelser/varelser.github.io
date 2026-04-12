import type { ParticleConfig } from '../../types';
import { buildFutureNativeFracturePresetPatch } from './futureNativeScenePresetPatchesFracture';
import { buildFutureNativeMpmPresetPatch } from './futureNativeScenePresetPatchesMpm';
import { buildFutureNativePbdClothSoftbodyPresetPatch } from './futureNativeScenePresetPatchesPbdClothSoftbody';
import { buildFutureNativePbdMembranePresetPatch } from './futureNativeScenePresetPatchesPbdMembrane';
import { buildFutureNativePbdRopePresetPatch } from './futureNativeScenePresetPatchesPbdRope';
import { buildFutureNativeVolumetricPresetPatch } from './futureNativeScenePresetPatchesVolumetric';

export function buildFutureNativeScenePresetPatch(id: string, layerIndex: 2 | 3): Partial<ParticleConfig> | null {
  const volumetricPatch = buildFutureNativeVolumetricPresetPatch(id, layerIndex);
  if (volumetricPatch) return volumetricPatch;
  const fracturePatch = buildFutureNativeFracturePresetPatch(id, layerIndex);
  if (fracturePatch) return fracturePatch;
  const mpmPatch = buildFutureNativeMpmPresetPatch(id, layerIndex);
  if (mpmPatch) return mpmPatch;
  const membranePatch = buildFutureNativePbdMembranePresetPatch(id, layerIndex);
  if (membranePatch) return membranePatch;
  const clothSoftbodyPatch = buildFutureNativePbdClothSoftbodyPresetPatch(id, layerIndex);
  if (clothSoftbodyPatch) return clothSoftbodyPatch;
  return buildFutureNativePbdRopePresetPatch(id, layerIndex);
}
