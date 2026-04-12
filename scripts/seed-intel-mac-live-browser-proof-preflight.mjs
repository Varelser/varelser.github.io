import fs from 'node:fs';
import path from 'node:path';
import { getIntelMacLiveBrowserProofIncomingDir, getIntelMacLiveBrowserProofInputDir } from './intelMacLiveBrowserProofShared.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const sourceDirArg = getArgValue('--source-dir') || 'exports/intel-mac-live-browser-proof-drop';
const sourceDir = path.resolve(rootDir, sourceDirArg);
const incomingDir = getIntelMacLiveBrowserProofIncomingDir(rootDir, sourceDir);
const proofInputDir = getIntelMacLiveBrowserProofInputDir(rootDir, sourceDir);
const logsDir = path.join(proofInputDir, 'logs');
const generatedAt = new Date().toISOString();

fs.mkdirSync(incomingDir, { recursive: true });
fs.mkdirSync(logsDir, { recursive: true });

const bundlePath = path.join(incomingDir, 'intel-mac-proof-preflight-bundle.zip');
if (!fs.existsSync(bundlePath)) {
  fs.writeFileSync(
    bundlePath,
    [
      'preflight placeholder bundle',
      `generatedAt=${generatedAt}`,
      'note=replace this file with the real returned Intel Mac proof bundle',
    ].join('\n') + '\n',
    'utf8',
  );
}

const logPath = path.join(logsDir, 'preflight-seed.log');
const logLines = [
  `[preflight-seed] generatedAt=${generatedAt}`,
  '[preflight-seed] purpose=raise repo-side drop readiness before real Intel Mac capture',
  '[preflight-seed] replace_with=real browser/export/build logs from target host',
];
fs.writeFileSync(logPath, logLines.join('\n') + '\n', 'utf8');

console.log(`[seed-intel-mac-live-browser-proof-preflight] bundle=${path.relative(rootDir, bundlePath)} log=${path.relative(rootDir, logPath)}`);
