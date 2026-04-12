export const futureNativeFullyOwnedKernelFamilyIds = [
  'mpm-viscoplastic',
  'mpm-snow',
  'mpm-mud',
  'mpm-paste',
  'fracture-crack-propagation',
  'fracture-debris-generation',
] as const;

export type FutureNativeFullyOwnedKernelFamilyId = (typeof futureNativeFullyOwnedKernelFamilyIds)[number];

export interface FutureNativeOwnedKernelMetadata {
  familyId: FutureNativeFullyOwnedKernelFamilyId;
  group: 'mpm' | 'fracture';
  configOwnerId: string;
  stateOwnerId: string;
  kernelFacadeId: string;
  sharedKernelBaseId: string;
  ownedKernelModuleId: string;
  runtimeFacadeId: string;
  fullyOwnedKernel: true;
}

export const futureNativeOwnedKernelMetadataByFamily: Record<FutureNativeFullyOwnedKernelFamilyId, FutureNativeOwnedKernelMetadata> = {
  'mpm-viscoplastic': {
    familyId: 'mpm-viscoplastic', group: 'mpm', configOwnerId: 'config-owner:mpm-viscoplastic', stateOwnerId: 'state-owner:mpm-viscoplastic', kernelFacadeId: 'kernel-facade:mpm-viscoplastic', sharedKernelBaseId: 'shared-kernel:mpm-granular', ownedKernelModuleId: 'owned-kernel:mpm-viscoplastic', runtimeFacadeId: 'owned-kernel-runtime:mpm-viscoplastic', fullyOwnedKernel: true,
  },
  'mpm-snow': {
    familyId: 'mpm-snow', group: 'mpm', configOwnerId: 'config-owner:mpm-snow', stateOwnerId: 'state-owner:mpm-snow', kernelFacadeId: 'kernel-facade:mpm-snow', sharedKernelBaseId: 'shared-kernel:mpm-granular', ownedKernelModuleId: 'owned-kernel:mpm-snow', runtimeFacadeId: 'owned-kernel-runtime:mpm-snow', fullyOwnedKernel: true,
  },
  'mpm-mud': {
    familyId: 'mpm-mud', group: 'mpm', configOwnerId: 'config-owner:mpm-mud', stateOwnerId: 'state-owner:mpm-mud', kernelFacadeId: 'kernel-facade:mpm-mud', sharedKernelBaseId: 'shared-kernel:mpm-granular', ownedKernelModuleId: 'owned-kernel:mpm-mud', runtimeFacadeId: 'owned-kernel-runtime:mpm-mud', fullyOwnedKernel: true,
  },
  'mpm-paste': {
    familyId: 'mpm-paste', group: 'mpm', configOwnerId: 'config-owner:mpm-paste', stateOwnerId: 'state-owner:mpm-paste', kernelFacadeId: 'kernel-facade:mpm-paste', sharedKernelBaseId: 'shared-kernel:mpm-granular', ownedKernelModuleId: 'owned-kernel:mpm-paste', runtimeFacadeId: 'owned-kernel-runtime:mpm-paste', fullyOwnedKernel: true,
  },
  'fracture-crack-propagation': {
    familyId: 'fracture-crack-propagation', group: 'fracture', configOwnerId: 'config-owner:fracture-crack-propagation', stateOwnerId: 'state-owner:fracture-crack-propagation', kernelFacadeId: 'kernel-facade:fracture-crack-propagation', sharedKernelBaseId: 'shared-kernel:fracture-lattice', ownedKernelModuleId: 'owned-kernel:fracture-crack-propagation', runtimeFacadeId: 'owned-kernel-runtime:fracture-crack-propagation', fullyOwnedKernel: true,
  },
  'fracture-debris-generation': {
    familyId: 'fracture-debris-generation', group: 'fracture', configOwnerId: 'config-owner:fracture-debris-generation', stateOwnerId: 'state-owner:fracture-debris-generation', kernelFacadeId: 'kernel-facade:fracture-debris-generation', sharedKernelBaseId: 'shared-kernel:fracture-lattice', ownedKernelModuleId: 'owned-kernel:fracture-debris-generation', runtimeFacadeId: 'owned-kernel-runtime:fracture-debris-generation', fullyOwnedKernel: true,
  },
};

export function getFutureNativeOwnedKernelMetadata(familyId: string): FutureNativeOwnedKernelMetadata | null {
  return futureNativeOwnedKernelMetadataByFamily[familyId as FutureNativeFullyOwnedKernelFamilyId] ?? null;
}
