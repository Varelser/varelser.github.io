import { buildFutureNativeDedicatedRuntimeFacadeReport } from '../lib/future-native-families/futureNativeDedicatedRuntimeFacadeReport';

const report = buildFutureNativeDedicatedRuntimeFacadeReport();
const incomplete = report.families.filter(
  (family) =>
    family.routeCount <= 0 ||
    family.averageRuntimeStateKeyCount <= 0 ||
    family.routes.some((route) => route.runtimeFacadeId.length === 0 || route.warmFrameCount <= 0 || route.runtimeConfigKeyCount <= 0),
);

console.log(JSON.stringify(report.summary, null, 2));

if (incomplete.length > 0) {
  throw new Error(`Future-native dedicated runtime facades incomplete: ${incomplete.map((family) => family.familyId).join(', ')}`);
}
