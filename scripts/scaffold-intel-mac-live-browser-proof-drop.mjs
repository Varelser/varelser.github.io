import fs from 'node:fs';
import path from 'node:path';
import {
  getIntelMacLiveBrowserProofFixtureDir,
  getIntelMacLiveBrowserProofIncomingDir,
  getIntelMacLiveBrowserProofInputDir,
  getIntelMacLiveBrowserProofNotesPath,
  getIntelMacLiveBrowserProofSummaryPath,
} from './intelMacLiveBrowserProofShared.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};

const sourceDirArg = getArgValue('--source-dir') || 'exports/intel-mac-live-browser-proof-drop';
const sourceDir = path.resolve(rootDir, sourceDirArg);
const fixtureDir = getIntelMacLiveBrowserProofFixtureDir(rootDir, sourceDir);
const proofInputDir = getIntelMacLiveBrowserProofInputDir(rootDir, sourceDir);
const screenshotDir = path.join(proofInputDir, 'screenshots');
const logDir = path.join(proofInputDir, 'logs');
const incomingDir = getIntelMacLiveBrowserProofIncomingDir(rootDir, sourceDir);
const metadataPath = path.join(sourceDir, 'capture-metadata.json');
const readmePath = path.join(sourceDir, 'README.md');
const notesPath = getIntelMacLiveBrowserProofNotesPath(rootDir, sourceDir);
const proofSummaryPath = getIntelMacLiveBrowserProofSummaryPath(rootDir, sourceDir);

fs.mkdirSync(sourceDir, { recursive: true });
fs.mkdirSync(fixtureDir, { recursive: true });
fs.mkdirSync(proofInputDir, { recursive: true });
fs.mkdirSync(screenshotDir, { recursive: true });
fs.mkdirSync(logDir, { recursive: true });
fs.mkdirSync(incomingDir, { recursive: true });

const metadata = {
  generatedAt: new Date().toISOString(),
  targetHost: { platform: 'darwin', arch: 'x64' },
  sourceDir: path.relative(rootDir, sourceDir),
  expected: {
    fixturePattern: 'real-export/kalokagathia-project-<slug>.json',
    optionalManifest: 'real-export/manifest.json',
    proofNotes: 'phase5-proof-input/real-export-capture-notes.md',
    proofSummary: 'phase5-proof-input/real-export-proof.json',
    recommendedLogs: [
      'phase5-proof-input/logs/build.log',
      'phase5-proof-input/logs/verify-project-state.log',
      'phase5-proof-input/logs/verify-phase5.log',
      'phase5-proof-input/logs/browser-console.log',
    ],
    recommendedScreenshots: [
      'phase5-proof-input/screenshots/export-overview.png',
      'phase5-proof-input/screenshots/export-detail.png',
    ],
    browserExecutablePath: '/Users/<you>/Library/Caches/ms-playwright/chromium-*/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
    incomingBundle: 'incoming/kalokagathia-intel-mac-live-browser-proof-<slug>.zip',
  },
};
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n', 'utf8');

const relativeSourceDir = path.relative(rootDir, sourceDir).replace(/\\/g, '/');
const readme = `# Intel Mac Live Browser Proof Drop

このフォルダは Intel Mac 実機で採取した browser proof を、repo 本体へ取り込む前の一時受け渡し用です。

## 入れるもの
- \`real-export/kalokagathia-project-<slug>.json\` を 1 本以上
- 任意で \`real-export/manifest.json\`
- \`phase5-proof-input/real-export-capture-notes.md\`
- \`phase5-proof-input/real-export-proof.json\`
- 推奨: \`phase5-proof-input/screenshots/*.png\`
- 推奨: \`phase5-proof-input/logs/*.log\` / \`*.txt\` / \`*.json\`
- 代替: \`incoming/kalokagathia-intel-mac-live-browser-proof-<slug>.zip\` を 1 本置いて pipeline 側で自動展開

## 最短手順
1. \`npm run scaffold:intel-mac-live-browser-proof-drop\`
2. Intel Mac 実機で export JSON / screenshots / logs をこの drop へ入れる
3. \`npm run draft:intel-mac-live-browser-proof-summary -- --source-dir ${relativeSourceDir}\`
4. \`npm run verify:intel-mac-live-browser-proof-drop -- --source-dir ${relativeSourceDir}\`
5. \`npm run run:intel-mac-live-browser-proof-pipeline -- --source-dir ${relativeSourceDir} --browser-executable-path /actual/path/to/Chromium\`

## 取り込み例
\`npm run ingest:intel-mac-live-browser-proof -- --source-dir ${relativeSourceDir} --browser-executable-path /actual/path/to/Chromium\`

## 完了後に再生成されるもの
- \`fixtures/project-state/real-export/manifest.json\`
- \`docs/archive/phase5-real-export-readiness-report.json\`
- \`docs/archive/phase5-proof-intake.json\`
- \`docs/archive/target-live-browser-readiness-intel-mac.json\`
- \`docs/archive/package-handoff-doctor.json\`
`;
fs.writeFileSync(readmePath, readme, 'utf8');

if (!fs.existsSync(notesPath)) {
  fs.writeFileSync(notesPath, [
    '# Intel Mac Real Export Capture Notes',
    '',
    '- host: darwin/x64 (Intel Mac)',
    '- browser executable path:',
    '- browser version:',
    '- export timestamp:',
    '- source project state slug:',
    '- notes:',
    '  - export executed from Procedural Mode / real browser',
    '  - screenshots -> phase5-proof-input/screenshots/*.png',
    '  - structured logs -> phase5-proof-input/logs/*.log',
    '',
  ].join('\n'), 'utf8');
}

if (!fs.existsSync(proofSummaryPath)) {
  fs.writeFileSync(proofSummaryPath, JSON.stringify({
    status: 'pending',
    capture: {
      hostPlatform: 'darwin',
      hostArch: 'x64',
      capturedAt: '',
      sourceProjectSlug: '',
    },
    browser: {
      name: 'Chromium',
      executablePath: '',
      version: '',
    },
    artifacts: {
      exports: [],
      screenshots: [],
      logs: [],
    },
    notes: '- export executed from Procedural Mode / real browser\n- attach at least one screenshot and one structured log',
    captureMetadata: {
      targetHost: metadata.targetHost,
      generatedAt: metadata.generatedAt,
    },
  }, null, 2) + '\n', 'utf8');
}

console.log(`[scaffold-intel-mac-live-browser-proof-drop] ready: ${path.relative(rootDir, sourceDir)}`);
