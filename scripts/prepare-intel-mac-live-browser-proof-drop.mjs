import { execFileSync } from 'node:child_process';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const sourceDirIndex = args.indexOf('--source-dir');
const sourceDirArg = sourceDirIndex >= 0 ? args[sourceDirIndex + 1] ?? 'exports/intel-mac-live-browser-proof-drop' : 'exports/intel-mac-live-browser-proof-drop';

const run = (label, commandArgs) => {
  execFileSync(process.execPath, commandArgs, { cwd: rootDir, stdio: 'inherit' });
  return label;
};

run('scaffold', ['scripts/scaffold-intel-mac-live-browser-proof-drop.mjs', '--source-dir', sourceDirArg]);
run('capture-kit', ['scripts/emit-intel-mac-live-browser-proof-capture-kit.mjs', '--source-dir', sourceDirArg, '--write', 'docs/archive/intel-mac-live-browser-proof-capture-kit.json']);
run('seed-preflight', ['scripts/seed-intel-mac-live-browser-proof-preflight.mjs', '--source-dir', sourceDirArg]);
run('verify-drop', ['scripts/verify-intel-mac-live-browser-proof-drop.mjs', '--source-dir', sourceDirArg, '--write', 'docs/archive/intel-mac-live-browser-proof-drop-check.json']);
run('status-report', ['scripts/generate-intel-mac-live-browser-proof-status-report.mjs', '--write-json', 'docs/archive/intel-mac-live-browser-proof-status.json', '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-status.md']);
run('blocker-report', ['scripts/generate-intel-mac-live-browser-proof-blocker-report.mjs', '--write-json', 'docs/archive/intel-mac-live-browser-proof-blockers.json', '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-blockers.md']);
run('operator-packet', ['scripts/emit-intel-mac-live-browser-proof-operator-packet.mjs', '--source-dir', sourceDirArg, '--skip-prereqs', '--write-json', 'docs/archive/intel-mac-live-browser-proof-operator-packet.json', '--write-markdown', 'docs/archive/intel-mac-live-browser-proof-operator-packet.md']);

console.log(`[prepare-intel-mac-live-browser-proof-drop] ready: ${sourceDirArg}`);
