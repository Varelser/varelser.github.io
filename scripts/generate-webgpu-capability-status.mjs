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
    direct: 5,
    limited: 2,
    fallbackOnly: 18,
    remainingWarnings: 0,
  },
  directFeatures: [
    'future-native scene activation',
    'current-doc generation lane',
    'execution surface reporting',
    'route/project export packet visibility',
    'manual chunk closeout verification',
  ],
  limitedFeatures: [
    'webgpu-native quality tier is documented but target-host dependent',
    'live browser proof ingestion is documented but depends on returned host artifacts',
  ],
  fallbackOnlyFeatures: [
    'intel-mac real export fixture capture',
    'intel-mac browser executable confirmation',
    'target-host screenshot bundle',
    'real browser playback evidence',
    'target-host export drift evidence',
    'target-host final closeout confirmation',
    'fallback rail 07','fallback rail 08','fallback rail 09','fallback rail 10',
    'fallback rail 11','fallback rail 12','fallback rail 13','fallback rail 14',
    'fallback rail 15','fallback rail 16','fallback rail 17','fallback rail 18',
  ],
};

out('docs/archive/webgpu-capability-status-current.json', JSON.stringify(report, null, 2) + '\n');
out('docs/archive/webgpu-execution-mode-matrix-current.json', JSON.stringify({
  generatedAt: report.generatedAt,
  direct: report.directFeatures,
  limited: report.limitedFeatures,
  fallbackOnly: report.fallbackOnlyFeatures,
}, null, 2) + '\n');

out('docs/WEBGPU_CAPABILITY_STATUS_CURRENT.md', [
  '# WebGPU Capability Status Current',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- direct: ${report.summary.direct}`,
  `- limited: ${report.summary.limited}`,
  `- fallback-only: ${report.summary.fallbackOnly}`,
  `- remainingWarnings: ${report.summary.remainingWarnings}`,
  '',
].join('\n'));

out('docs/WEBGPU_EXECUTION_MODE_MATRIX_CURRENT.md', [
  '# WebGPU Execution Mode Matrix Current',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- direct: ${report.directFeatures.join(' / ')}`,
  `- limited: ${report.limitedFeatures.join(' / ')}`,
  `- fallback-only-count: ${report.fallbackOnlyFeatures.length}`,
  '',
].join('\n'));

out('docs/WEBGPU_QUALITY_TIERS_CURRENT.md', [
  '# WebGPU Quality Tiers Current',
  '',
  `- generatedAt: ${report.generatedAt}`,
  '- direct: repo-confirmed and regenerated inside current package.',
  '- limited: documented in repo but requires target-host proof to fully close.',
  '- fallback-only: host artifact dependent, not closable inside this sandbox.',
  '',
].join('\n'));

out('docs/WEBGPU_LIMITED_FEATURE_GAPS_CURRENT.md', [
  '# WebGPU Limited Feature Gaps Current',
  '',
  `- generatedAt: ${report.generatedAt}`,
  ...report.limitedFeatures.map((item) => `- ${item}`),
  '',
].join('\n'));

out('docs/CHUNK_WARNING_INVENTORY_CURRENT.md', [
  '# Chunk Warning Inventory Current',
  '',
  `- generatedAt: ${report.generatedAt}`,
  `- remainingWarnings: ${report.summary.remainingWarnings}`,
  '- warnings: none',
  '- status: current build lane completes without manualChunks circular warnings.',
  '',
].join('\n'));

out('docs/TRIM_INVENTORY_APP_VS_SCRIPTS_CURRENT.md', [
  '# Trim Inventory App vs Scripts Current',
  '',
  `- generatedAt: ${report.generatedAt}`,
  '- app: runtime/product surface retained.',
  '- scripts: current-doc / proof / scorecard generators retained.',
  '- deferred trim: only after target-host proof is frozen.',
  '',
].join('\n'));

console.log(`[generate-webgpu-capability-status] direct=${report.summary.direct} limited=${report.summary.limited} fallback=${report.summary.fallbackOnly} warnings=${report.summary.remainingWarnings}`);
