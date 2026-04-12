import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildFutureNativeExpressionCoverageReport,
  renderFutureNativeExpressionCoverageMarkdown,
} from '../lib/future-native-families/futureNativeExpressionCoverage';

const report = buildFutureNativeExpressionCoverageReport();
const markdown = renderFutureNativeExpressionCoverageMarkdown(report);
const outputDir = path.resolve('generated/future-native-expression-coverage');
mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, 'future-native-expression-coverage.json'), JSON.stringify(report, null, 2));
writeFileSync(path.join(outputDir, 'future-native-expression-coverage.md'), markdown);
console.log(`Wrote ${outputDir}/future-native-expression-coverage.json`);
console.log(`Wrote ${outputDir}/future-native-expression-coverage.md`);
