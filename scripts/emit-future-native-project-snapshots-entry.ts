import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildFutureNativeProjectSnapshotReport,
  renderFutureNativeProjectSnapshotMarkdown,
} from '../lib/future-native-families/futureNativeFamiliesProjectReport';

const report = buildFutureNativeProjectSnapshotReport();
const markdown = renderFutureNativeProjectSnapshotMarkdown(report);
const outputDir = path.resolve('tmp/future-native-project-snapshot-report');
mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, 'future-native-project-snapshot-report.json'), JSON.stringify(report, null, 2));
writeFileSync(path.join(outputDir, 'future-native-project-snapshot-report.md'), markdown);
console.log(`Wrote ${outputDir}/future-native-project-snapshot-report.json`);
console.log(`Wrote ${outputDir}/future-native-project-snapshot-report.md`);
