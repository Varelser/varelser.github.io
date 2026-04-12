import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const out = (relativePath, content) => {
  const absolutePath = path.resolve(rootDir, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, 'utf8');
};

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    done: 5,
    deferred: 0,
    hostProofRequired: 1,
  },
  items: [
    {
      id: 'audio-bulk-edit-route-editor-slider-retirement',
      status: 'done',
      implementationBoundary: 'repo-complete',
      notes: 'Audio bulk edit / route editor / slider retirement surface is implemented and closed in repo.',
    },
    {
      id: 'shortcut-undo-redo-formal-contract',
      status: 'done',
      implementationBoundary: 'repo-complete',
      notes: 'Route editor scoped undo/redo is implemented with Cmd/Ctrl+Z, Shift+Cmd/Ctrl+Z, and Ctrl+Y.',
    },
    {
      id: 'legacy-hard-retirement',
      status: 'done',
      implementationBoundary: 'repo-complete',
      notes: 'Safe legacy slider retirement finalized while preserving compatibility import fields.',
    },
    {
      id: 'legacy-controls-inventory',
      status: 'done',
      implementationBoundary: 'repo-complete',
      notes: 'Legacy control inventory is intentionally retained as read-only documentation and migration context.',
    },
    {
      id: 'canonical-closeout-report',
      status: 'done',
      implementationBoundary: 'repo-complete',
      notes: 'Canonical closeout report is covered by current docs + scorecard sync.',
    },
    {
      id: 'intel-mac-host-proof',
      status: 'host-proof-required',
      implementationBoundary: 'target-host',
      notes: 'Real browser/export proof must still be captured on Intel Mac target host.',
    },
  ],
  shortcutBoundary: {
    scope: 'audio route editor only',
    supported: ['Cmd/Ctrl+Z', 'Shift+Cmd/Ctrl+Z', 'Ctrl+Y'],
    coveredOperations: [
      'bulk edit',
      'reorder',
      'import append/replace',
      'preset pack apply',
      'clear',
      'legacy->routes sync',
    ],
    excluded: [
      'global preset timeline',
      'non-route editor panels',
      'target-host proof operations',
    ],
  },
};

out('docs/archive/ux-closeout-current.json', JSON.stringify(report, null, 2) + '\n');
out('docs/archive/ux-implementation-boundary-current.json', JSON.stringify({
  generatedAt: report.generatedAt,
  repoComplete: 5,
  deferred: 0,
  hostProofRequired: 1,
  repoCompleteIds: report.items.filter((item) => item.implementationBoundary === 'repo-complete').map((item) => item.id),
  hostProofRequiredIds: report.items.filter((item) => item.implementationBoundary === 'target-host').map((item) => item.id),
}, null, 2) + '\n');

out('docs/UX_LEGACY_CONTROL_INVENTORY_CURRENT.md', [
  '# UX Legacy Control Inventory Current',
  '',
  `- generatedAt: ${report.generatedAt}`,
  '- retired-safe sliders are normalized to `0` during closeout.',
  '- compatibility import fields are retained for recovery / migration only.',
  '- route-editor-first workflow is the canonical replacement surface.',
  '',
].join('\n'));

out('docs/UX_SHORTCUT_UNDO_BOUNDARY_CURRENT.md', [
  '# UX Shortcut / Undo Boundary Current',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- scope: ${report.shortcutBoundary.scope}`,
  `- supported: ${report.shortcutBoundary.supported.join(' / ')}`,
  `- coveredOperations: ${report.shortcutBoundary.coveredOperations.join(' / ')}`,
  `- excluded: ${report.shortcutBoundary.excluded.join(' / ')}`,
  '',
].join('\n'));

out('docs/UX_IMPLEMENTATION_BOUNDARY_CURRENT.md', [
  '# UX Implementation Boundary Current',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- repo-complete: ${report.summary.done}`,
  `- deferred: ${report.summary.deferred}`,
  `- host-proof-required: ${report.summary.hostProofRequired}`,
  '',
  ...report.items.map((item) => `- ${item.id}: ${item.implementationBoundary} / ${item.status} / ${item.notes}`),
  '',
].join('\n'));

out('docs/UX_CLOSEOUT_MATRIX_CURRENT.md', [
  '# UX Closeout Matrix Current',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- done: ${report.summary.done}`,
  `- deferred: ${report.summary.deferred}`,
  `- host-proof-required: ${report.summary.hostProofRequired}`,
  '',
  ...report.items.map((item) => `- ${item.id}: ${item.status}`),
  '',
].join('\n'));

console.log(`[generate-ux-closeout-docs] done=${report.summary.done} deferred=${report.summary.deferred} hostProof=${report.summary.hostProofRequired}`);
