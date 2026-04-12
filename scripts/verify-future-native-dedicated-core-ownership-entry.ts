import { buildFutureNativeDedicatedCoreOwnershipReport } from '../lib/future-native-families/futureNativeDedicatedCoreOwnershipReport';

const report = buildFutureNativeDedicatedCoreOwnershipReport();
const incomplete = report.families.filter(
  (family) =>
    family.routeCount <= 0 ||
    family.configOwnerId.length === 0 ||
    family.stateOwnerId.length === 0 ||
    family.kernelFacadeId.length === 0 ||
    family.sharedKernelBaseId.length === 0 ||
    family.ownedKernelModuleId.length === 0 ||
    !family.fullyOwnedKernel ||
    family.routes.some((route) => route.runtimeFacadeId.length === 0 || route.routeSignature.length === 0 || !route.fullyOwnedKernel),
);

console.log(JSON.stringify(report.summary, null, 2));
if (incomplete.length > 0) {
  throw new Error(`Future-native dedicated core ownership incomplete: ${incomplete.map((family) => family.familyId).join(', ')}`);
}
