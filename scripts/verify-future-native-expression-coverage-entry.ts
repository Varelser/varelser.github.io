import { buildFutureNativeExpressionCoverageReport } from '../lib/future-native-families/futureNativeExpressionCoverage';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const report = buildFutureNativeExpressionCoverageReport();

assert(report.summary.stageMismatchCount === 0, `stage mismatches remain: ${report.summary.familiesWithStageMismatch.join(', ')}`);
assert(report.summary.familiesMissingUniqueRuntimeMarker.length === 0, `missing unique runtime markers: ${report.summary.familiesMissingUniqueRuntimeMarker.join(', ')}`);
assert(report.summary.surfaceThinCount === 0, `surface-thin families remain: ${report.families.filter((entry) => entry.closure === 'surface-thin').map((entry) => entry.familyId).join(', ')}`);
assert(report.summary.derivedOnSubstrateCount === 0, `raw derived-on-substrate families remain: ${report.families.filter((entry) => entry.closure === 'derived-on-substrate').map((entry) => entry.familyId).join(', ')}`);

console.log(JSON.stringify({
  ok: true,
  summary: report.summary,
}, null, 2));
