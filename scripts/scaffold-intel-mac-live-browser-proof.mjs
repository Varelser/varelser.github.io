import fs from 'node:fs';
import path from 'node:path';
import {
  getProofInputDir,
  getProofNotesPath,
  getRealExportFixtureDir,
} from './liveBrowserReadinessShared.mjs';

const rootDir = process.cwd();
const proofInputDir = getProofInputDir(rootDir);
const proofNotesPath = getProofNotesPath(rootDir);
const realExportDir = getRealExportFixtureDir(rootDir);
const handoffDocPath = path.resolve(rootDir, 'docs/INTEL_MAC_LIVE_BROWSER_PROOF_CAPTURE_2026-04-06.md');
const archivePlanPath = path.resolve(rootDir, 'docs/archive/intel-mac-live-browser-proof-plan.json');

fs.mkdirSync(proofInputDir, { recursive: true });
fs.mkdirSync(realExportDir, { recursive: true });

if (!fs.existsSync(proofNotesPath)) {
  fs.writeFileSync(
    proofNotesPath,
    [
      '# Intel Mac Real Export Capture Notes',
      '',
      '- host: darwin/x64 (Intel Mac)',
      '- browser executable path:',
      '- npm command log location:',
      '- build log location:',
      '- verify-project-state log location:',
      '- verify-phase5 log location:',
      '- exported fixture file name:',
      '- export timestamp:',
      '- notes:',
      '',
      '## Required follow-up',
      '1. Place at least one browser-exported JSON at fixtures/project-state/real-export/kalokagathia-project-<slug>.json',
      '2. Run npm run generate:phase5-real-export-manifest',
      '3. Run npm run generate:phase5-real-export-readiness-report',
      '4. Run npm run generate:phase5-proof-intake',
      '5. Run npm run inspect:intel-mac-live-browser-readiness',
      '',
    ].join('\n'),
    'utf8',
  );
}

const handoffDoc = `# Intel Mac Live Browser Proof Capture (2026-04-06)\n\n## 目的\n- Intel Mac 実機で Playwright Chromium と real-export fixture を固定する。\n- その結果を repo 常設の readiness / proof intake / handoff doctor に反映する。\n\n## 事前条件\n- host: darwin/x64 (Intel Mac)\n- node_modules 同梱 bundle を展開済み\n\n## 実行順\n1. \`npm install --include=optional\`\n2. \`npx playwright install chromium\`\n3. 実 UI から project export を 1 本以上保存し、\`fixtures/project-state/real-export/kalokagathia-project-<slug>.json\` に置く\n4. \`npm run generate:phase5-real-export-manifest\`\n5. \`npm run generate:phase5-real-export-readiness-report\`\n6. proof logs を \`docs/archive/phase5-proof-input/\` に置く\n7. \`npm run generate:phase5-proof-intake\`\n8. \`npm run inspect:intel-mac-live-browser-readiness\`\n9. \`node scripts/doctor-package-handoff.mjs --write docs/archive/package-handoff-doctor.json\`\n\n## 保存先\n- fixture: \`fixtures/project-state/real-export/\`\n- manifest: \`fixtures/project-state/real-export/manifest.json\`\n- readiness: \`docs/archive/phase5-real-export-readiness-report.json\`\n- proof intake: \`docs/archive/phase5-proof-intake.json\`\n- notes template: \`docs/archive/phase5-proof-input/real-export-capture-notes.md\`\n\n## 完了条件\n- Intel Mac live browser readiness が **5 / 5 ok**\n- handoff doctor の Intel Mac live browser readiness が ready\n`;
fs.writeFileSync(handoffDocPath, handoffDoc, 'utf8');

const plan = {
  generatedAt: new Date().toISOString(),
  targetHost: { platform: 'darwin', arch: 'x64' },
  scaffolded: {
    proofInputDir: path.relative(rootDir, proofInputDir),
    proofNotesPath: path.relative(rootDir, proofNotesPath),
    realExportDir: path.relative(rootDir, realExportDir),
    handoffDocPath: path.relative(rootDir, handoffDocPath),
  },
  remaining: [
    'install-playwright-chromium-on-intel-mac',
    'capture-real-export-json',
    'collect-proof-logs',
    'regenerate-readiness-and-handoff',
  ],
};
fs.writeFileSync(archivePlanPath, JSON.stringify(plan, null, 2) + '\n', 'utf8');

console.log(`[scaffold-intel-mac-live-browser-proof] wrote ${path.relative(rootDir, proofNotesPath)}`);
console.log(`[scaffold-intel-mac-live-browser-proof] wrote ${path.relative(rootDir, handoffDocPath)}`);
console.log(`[scaffold-intel-mac-live-browser-proof] fixture dir ready: ${path.relative(rootDir, realExportDir)}`);
