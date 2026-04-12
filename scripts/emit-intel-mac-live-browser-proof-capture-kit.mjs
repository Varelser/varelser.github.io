import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
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
const hasFlag = (flag) => args.includes(flag);

const sourceDirArg = getArgValue('--source-dir') || 'exports/intel-mac-live-browser-proof-drop';
const sourceDir = path.resolve(rootDir, sourceDirArg);
const writePath = path.resolve(rootDir, getArgValue('--write') || 'docs/archive/intel-mac-live-browser-proof-capture-kit.json');
const skipScaffold = hasFlag('--skip-scaffold');

if (!skipScaffold) {
  execFileSync(process.execPath, ['scripts/scaffold-intel-mac-live-browser-proof-drop.mjs', '--source-dir', sourceDirArg], {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

const fixtureDir = getIntelMacLiveBrowserProofFixtureDir(rootDir, sourceDir);
const proofInputDir = getIntelMacLiveBrowserProofInputDir(rootDir, sourceDir);
const notesPath = getIntelMacLiveBrowserProofNotesPath(rootDir, sourceDir);
const proofSummaryPath = getIntelMacLiveBrowserProofSummaryPath(rootDir, sourceDir);
const incomingDir = getIntelMacLiveBrowserProofIncomingDir(rootDir, sourceDir);
const screenshotsDir = path.join(proofInputDir, 'screenshots');
const logsDir = path.join(proofInputDir, 'logs');
const evidenceManifestPath = path.join(proofInputDir, 'evidence-manifest.json');
const bundleName = 'kalokagathia-intel-mac-live-browser-proof-<slug>.zip';

for (const dir of [fixtureDir, proofInputDir, screenshotsDir, logsDir, incomingDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const rel = (absolutePath) => path.relative(sourceDir, absolutePath).replace(/\\/g, '/');
const captureScriptPath = path.join(sourceDir, 'capture-on-intel-mac.sh');
const stageScriptPath = path.join(sourceDir, 'stage-artifacts-on-intel-mac.sh');
const packageScriptPath = path.join(sourceDir, 'package-proof-bundle.sh');
const hostFinalizeScriptPath = path.join(sourceDir, 'finalize-on-host.sh');

const captureScript = `#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="\${1:-$PWD}"
PROJECT_SLUG="\${2:-kalokagathia-proof}"
BROWSER_EXECUTABLE_PATH="\${3:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
DROP_DIR="\${4:-$PWD}"
shift 4 || true

REAL_EXPORT_DIR="$DROP_DIR/real-export"
PROOF_INPUT_DIR="$DROP_DIR/phase5-proof-input"
SCREENSHOT_DIR="$PROOF_INPUT_DIR/screenshots"
LOG_DIR="$PROOF_INPUT_DIR/logs"
mkdir -p "$REAL_EXPORT_DIR" "$SCREENSHOT_DIR" "$LOG_DIR"

cd "$REPO_DIR"
echo "[capture-on-intel-mac] repo=$REPO_DIR slug=$PROJECT_SLUG browser=$BROWSER_EXECUTABLE_PATH"
node scripts/run-intel-mac-live-browser-proof-pipeline.mjs --source-dir "$DROP_DIR" --browser-executable-path "$BROWSER_EXECUTABLE_PATH" 2>&1 | tee "$LOG_DIR/pipeline.log"

if [ -f "fixtures/project-state/real-export/manifest.json" ]; then
  cp "fixtures/project-state/real-export/manifest.json" "$REAL_EXPORT_DIR/manifest.json"
fi

echo "[capture-on-intel-mac] export the project JSON from the real browser UI, then stage the files"
echo "[capture-on-intel-mac] example: ./stage-artifacts-on-intel-mac.sh $REPO_DIR $DROP_DIR --slug $PROJECT_SLUG --browser-executable-path '$BROWSER_EXECUTABLE_PATH' --real-export ~/Downloads/kalokagathia-project-$PROJECT_SLUG.json --screenshot ~/Desktop/export-overview.png --log $LOG_DIR/pipeline.log"

if [ "$#" -gt 0 ]; then
  "$DROP_DIR/stage-artifacts-on-intel-mac.sh" "$REPO_DIR" "$DROP_DIR" --slug "$PROJECT_SLUG" --browser-executable-path "$BROWSER_EXECUTABLE_PATH" "$@"
fi

echo "[capture-on-intel-mac] done. review: $DROP_DIR/phase5-proof-input/real-export-proof.json"
`;

const stageScript = `#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="\${1:-$PWD}"
DROP_DIR="\${2:-$PWD}"
shift 2 || true

cd "$REPO_DIR"
node scripts/stage-intel-mac-live-browser-proof-artifacts.mjs --source-dir "$DROP_DIR" "$@"
node scripts/verify-intel-mac-live-browser-proof-drop.mjs --source-dir "$DROP_DIR" --write "$REPO_DIR/docs/archive/intel-mac-live-browser-proof-drop-check.json"

echo "[stage-artifacts-on-intel-mac] staged real export / screenshots / logs into $DROP_DIR"
`;

const packageScript = `#!/usr/bin/env bash
set -euo pipefail

DROP_DIR="\${1:-$PWD}"
PROJECT_SLUG="\${2:-kalokagathia-proof}"
OUT_DIR="$DROP_DIR/incoming"
OUT_PATH="$OUT_DIR/kalokagathia-intel-mac-live-browser-proof-\${PROJECT_SLUG}.zip"
mkdir -p "$OUT_DIR"
cd "$DROP_DIR"
zip -qr "$OUT_PATH" real-export phase5-proof-input capture-metadata.json README.md capture-on-intel-mac.sh stage-artifacts-on-intel-mac.sh finalize-on-host.sh package-proof-bundle.sh
zip -T "$OUT_PATH"
echo "[package-proof-bundle] wrote $OUT_PATH"
`;

const finalizeScript = `#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="\${1:-$PWD}"
DROP_DIR="\${2:-${sourceDirArg}}"
BROWSER_EXECUTABLE_PATH="\${3:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

cd "$REPO_DIR"
node scripts/run-intel-mac-live-browser-proof-host-ingest.mjs --source-dir "$DROP_DIR" --browser-executable-path "$BROWSER_EXECUTABLE_PATH" --write docs/archive/intel-mac-live-browser-proof-host-ingest.json

echo "[finalize-on-host] extract/finalize/doctor/status regenerated"
`;

fs.writeFileSync(captureScriptPath, captureScript, 'utf8');
fs.writeFileSync(stageScriptPath, stageScript, 'utf8');
fs.writeFileSync(packageScriptPath, packageScript, 'utf8');
fs.writeFileSync(hostFinalizeScriptPath, finalizeScript, 'utf8');
for (const filePath of [captureScriptPath, stageScriptPath, packageScriptPath, hostFinalizeScriptPath]) {
  fs.chmodSync(filePath, 0o755);
}

const readme = [
  '# Intel Mac Live Browser Proof Drop',
  '',
  'このフォルダは Intel Mac 実機で採取した browser proof を、repo 本体へ取り込む前の一時受け渡し用です。',
  '',
  '## 同梱スクリプト',
  `- \`${rel(captureScriptPath)}\` — Intel Mac 実機で pipeline / readiness を先に走らせる`,
  `- \`${rel(stageScriptPath)}\` — real-export JSON / screenshots / logs を drop へ正規配置し、summary を captured 状態まで組み立てる`,
  `- \`${rel(packageScriptPath)}\` — drop 内容を bundle zip へ固める`,
  `- \`${rel(hostFinalizeScriptPath)}\` — host 側で bundle extract / finalize / doctor / status を 1 回で再生成する`,
  '',
  '## Intel Mac 実機での最短手順',
  '1. このフォルダごと Intel Mac 実機へ渡す',
  '2. Intel Mac 実機で pipeline / readiness を先に走らせる',
  '   - `./capture-on-intel-mac.sh /path/to/repo <slug> /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome $PWD`',
  '3. 実ブラウザ UI から project export を保存し、screenshots / logs のパスが揃ったら staging を実行',
  '   - `./stage-artifacts-on-intel-mac.sh /path/to/repo $PWD --slug <slug> --browser-executable-path /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --real-export ~/Downloads/kalokagathia-project-<slug>.json --screenshot ~/Desktop/export-overview.png --log $PWD/phase5-proof-input/logs/pipeline.log`',
  '4. 問題なければ bundle を作る',
  '   - `./package-proof-bundle.sh $PWD <slug>`',
  '5. host 側 repo に戻して 1 回で ingest + finalize',
  `   - \`./finalize-on-host.sh /path/to/repo ${sourceDirArg} /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome\``,
  '',
  '## 必須成果物',
  `- \`${rel(path.join(fixtureDir, 'kalokagathia-project-<slug>.json'))}\``,
  `- \`${rel(proofSummaryPath)}\``,
  `- \`${rel(notesPath)}\``,
  `- \`${rel(path.join(logsDir, '<build|verify|console>.log'))}\``,
  `- \`${rel(evidenceManifestPath)}\``,
  `- 任意だが推奨: \`${rel(path.join(screenshotsDir, 'export-overview.png'))}\``,
  '',
  '## bundle 代替',
  `個別ファイルの代わりに、\`${rel(path.join(incomingDir, bundleName))}\` を 1 本置いて ingest できます。`,
  '',
].join('\n');
fs.writeFileSync(path.join(sourceDir, 'README.md'), readme, 'utf8');

const report = {
  generatedAt: new Date().toISOString(),
  sourceDir: path.relative(rootDir, sourceDir),
  outputs: {
    captureScript: path.relative(rootDir, captureScriptPath),
    stageScript: path.relative(rootDir, stageScriptPath),
    packageScript: path.relative(rootDir, packageScriptPath),
    finalizeScript: path.relative(rootDir, hostFinalizeScriptPath),
    readme: path.relative(rootDir, path.join(sourceDir, 'README.md')),
    notes: path.relative(rootDir, notesPath),
    summary: path.relative(rootDir, proofSummaryPath),
    evidenceManifest: path.relative(rootDir, evidenceManifestPath),
  },
  nextAction: 'run capture-on-intel-mac.sh, then stage-artifacts-on-intel-mac.sh, then package-proof-bundle.sh and finalize-on-host.sh',
};
fs.mkdirSync(path.dirname(writePath), { recursive: true });
fs.writeFileSync(writePath, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(`[emit-intel-mac-live-browser-proof-capture-kit] wrote ${path.relative(rootDir, writePath)}`);
