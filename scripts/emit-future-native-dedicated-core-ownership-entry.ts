import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildFutureNativeDedicatedCoreOwnershipReport,
  renderFutureNativeDedicatedCoreOwnershipMarkdown,
} from '../lib/future-native-families/futureNativeDedicatedCoreOwnershipReport';

const report = buildFutureNativeDedicatedCoreOwnershipReport();
const markdown = renderFutureNativeDedicatedCoreOwnershipMarkdown(report);
const outputDir = path.resolve('generated/future-native-dedicated-core-ownership');
mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, 'future-native-dedicated-core-ownership.json'), JSON.stringify(report, null, 2));
writeFileSync(path.join(outputDir, 'future-native-dedicated-core-ownership.md'), markdown);
console.log(`Wrote ${outputDir}/future-native-dedicated-core-ownership.json`);
console.log(`Wrote ${outputDir}/future-native-dedicated-core-ownership.md`);
