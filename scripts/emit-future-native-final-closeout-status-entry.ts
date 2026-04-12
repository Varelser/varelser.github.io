import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildFutureNativeFinalCloseoutStatus,
  renderFutureNativeFinalCloseoutStatusMarkdown,
} from '../lib/future-native-families/futureNativeFinalCloseoutStatus';

const status = buildFutureNativeFinalCloseoutStatus();
const markdown = renderFutureNativeFinalCloseoutStatusMarkdown(status);
const outputDir = path.resolve('generated/future-native-final-closeout-status');
mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, 'future-native-final-closeout-status.json'), JSON.stringify(status, null, 2));
writeFileSync(path.join(outputDir, 'future-native-final-closeout-status.md'), markdown);
writeFileSync(path.resolve('docs/FUTURE_NATIVE_FINAL_CLOSEOUT_REMAINING_2026-04-08.md'), markdown);
console.log(`Wrote ${outputDir}/future-native-final-closeout-status.json`);
console.log(`Wrote ${outputDir}/future-native-final-closeout-status.md`);
console.log('Wrote docs/FUTURE_NATIVE_FINAL_CLOSEOUT_REMAINING_2026-04-08.md');
