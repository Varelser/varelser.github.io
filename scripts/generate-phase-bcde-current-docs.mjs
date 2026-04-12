import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const fast = args.includes('--fast');
const steps = fast
  ? [
      ['intel-mac-current-docs', ['scripts/generate-intel-mac-current-docs.mjs']],
      ['ux-closeout-docs', ['scripts/generate-ux-closeout-docs.mjs']],
      ['webgpu-capability-status', ['scripts/generate-webgpu-capability-status.mjs']],
      ['phase-bcde-closeout-scorecard', ['scripts/generate-phase-bcde-closeout-scorecard.mjs']],
    ]
  : [
      ['intel-status', ['scripts/generate-intel-mac-live-browser-proof-status-report.mjs']],
      ['intel-blockers', ['scripts/generate-intel-mac-live-browser-proof-blocker-report.mjs']],
      ['intel-projection', ['scripts/generate-intel-mac-live-browser-proof-projection-report.mjs']],
      ['intel-remediation', ['scripts/generate-intel-mac-live-browser-proof-remediation-report.mjs']],
      ['intel-audit', ['scripts/generate-intel-mac-live-browser-proof-readiness-audit.mjs']],
      ['intel-verdict', ['scripts/generate-intel-mac-live-browser-proof-closeout-verdict.mjs']],
      ['execution-surfaces', ['scripts/generate-execution-surfaces-report.mjs']],
      ['intel-mac-current-docs', ['scripts/generate-intel-mac-current-docs.mjs']],
      ['ux-closeout-docs', ['scripts/generate-ux-closeout-docs.mjs']],
      ['webgpu-capability-status', ['scripts/generate-webgpu-capability-status.mjs']],
      ['phase-bcde-closeout-scorecard', ['scripts/generate-phase-bcde-closeout-scorecard.mjs']],
    ];
for (const [label, commandArgs] of steps) {
  const result = spawnSync(process.execPath, commandArgs, { stdio: 'inherit' });
  if ((result.status ?? 1) !== 0) {
    console.error(`[generate-phase-bcde-current-docs] failed: ${label}`);
    process.exit(result.status ?? 1);
  }
}
console.log(`[generate-phase-bcde-current-docs] mode=${fast ? 'fast' : 'full'} steps=${steps.length}`);
