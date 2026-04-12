import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildFutureNativeIntegrationSnapshotJson, renderFutureNativeSharedIntegrationMarkdown } from '../lib/future-native-families/futureNativeFamiliesIntegration';

const payload = buildFutureNativeIntegrationSnapshotJson();
const markdown = renderFutureNativeSharedIntegrationMarkdown(payload.firstWave);
const outputDir = path.resolve('tmp/future-native-integration-report');
mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, 'future-native-integration-report.json'), JSON.stringify(payload, null, 2));
writeFileSync(path.join(outputDir, 'future-native-integration-report.md'), markdown);
console.log(`Wrote ${outputDir}/future-native-integration-report.json`);
console.log(`Wrote ${outputDir}/future-native-integration-report.md`);
