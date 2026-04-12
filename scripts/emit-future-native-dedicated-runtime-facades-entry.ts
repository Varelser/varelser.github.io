import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildFutureNativeDedicatedRuntimeFacadeReport,
  renderFutureNativeDedicatedRuntimeFacadeMarkdown,
} from '../lib/future-native-families/futureNativeDedicatedRuntimeFacadeReport';

const report = buildFutureNativeDedicatedRuntimeFacadeReport();
const markdown = renderFutureNativeDedicatedRuntimeFacadeMarkdown(report);
const outputDir = path.resolve('generated/future-native-dedicated-runtime-facades');
mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, 'future-native-dedicated-runtime-facades.json'), JSON.stringify(report, null, 2));
writeFileSync(path.join(outputDir, 'future-native-dedicated-runtime-facades.md'), markdown);
console.log(`Wrote ${outputDir}/future-native-dedicated-runtime-facades.json`);
console.log(`Wrote ${outputDir}/future-native-dedicated-runtime-facades.md`);
