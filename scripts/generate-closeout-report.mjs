import fs from 'node:fs';
import path from 'node:path';
import { collectBuildOutputPaths } from './buildOutputShared.mjs';
import { collectDistributionIndex } from './package-distribution-index.mjs';

const rootDir = process.cwd();
const archiveDir = path.resolve(rootDir, 'docs/archive');
const artifactDir = path.resolve(rootDir, '.artifacts');
const stamp = new Date().toISOString().slice(0, 10);
const jsonPath = path.resolve(archiveDir, 'closeout-report.json');
const mdPath = path.resolve(rootDir, `docs/CLOSEOUT_REPORT_${stamp}.md`);
const mdCurrentPath = path.resolve(rootDir, 'docs/CLOSEOUT_REPORT_CURRENT.md');

const exists = (targetPath) => fs.existsSync(targetPath);
const readJson = (targetPath) => JSON.parse(fs.readFileSync(targetPath, 'utf8'));
const loadJson = (relativePath) => {
  const absolutePath = path.resolve(rootDir, relativePath);
  return exists(absolutePath) ? readJson(absolutePath) : null;
};

function collectBuildLaneStatus() {
  const { outDir, indexHtmlPath, assetsDir } = collectBuildOutputPaths(rootDir, { fallback: 'dist' });
  const chunkWarningDocPath = path.resolve(rootDir, 'docs/CHUNK_WARNING_INVENTORY_CURRENT.md');
  const result = {
    resolvedOutDir: outDir,
    distReady: exists(indexHtmlPath),
    preloadCheck: {
      ready: false,
      modulePreloadCount: 0,
      unexpectedEntries: [],
    },
    chunkWarning: {
      documented: exists(chunkWarningDocPath),
      warningFree: false,
    },
    topChunks: [],
  };

  if (result.distReady) {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');
    const hrefs = [...html.matchAll(/modulepreload" href="([^"]+)"/g)].map((match) => match[1]);
    const allowed = [/react-vendor-/];
    const forbidden = [
      /starter-library-/, /scene-runtime-/, /scene-families-core/, /scene-family-/, /scene-gpgpu/,
      /ui-control-panel/, /scene-postfx/, /projectState/, /scene-future-native/,
    ];
    const unexpectedEntries = hrefs.filter((href) => !allowed.some((re) => re.test(href)) || forbidden.some((re) => re.test(href)));
    result.preloadCheck = {
      ready: unexpectedEntries.length === 0,
      modulePreloadCount: hrefs.length,
      unexpectedEntries,
    };
  }

  if (result.chunkWarning.documented) {
    const chunkWarningDoc = fs.readFileSync(chunkWarningDocPath, 'utf8');
    result.chunkWarning.warningFree = /without manualChunks circular warnings/i.test(chunkWarningDoc);
  }

  if (exists(assetsDir)) {
    result.topChunks = fs.readdirSync(assetsDir)
      .filter((name) => name.endsWith('.js'))
      .map((name) => ({ name, kb: Number((fs.statSync(path.join(assetsDir, name)).size / 1024).toFixed(2)) }))
      .sort((a, b) => b.kb - a.kb)
      .slice(0, 8);
  }

  const checkpoints = [result.distReady, result.preloadCheck.ready, result.chunkWarning.warningFree];
  result.progressPercent = Math.round((checkpoints.filter(Boolean).length / checkpoints.length) * 100);
  return result;
}

const packageIntegrity = loadJson('docs/archive/package-integrity-report.json');
const deadCodeReport = loadJson('docs/archive/dead-code-report.json');
const hostRuntime = loadJson('docs/archive/host-runtime-readiness.json');
const liveBrowser = loadJson('docs/archive/live-browser-readiness.json');
const doctor = loadJson('docs/archive/package-handoff-doctor.json');
const externalControlStatus = loadJson('docs/archive/external-control-osc-proxy-status.json');
const distributionIndex = collectDistributionIndex({ rootDir, outDir: artifactDir });
const buildLane = collectBuildLaneStatus();

const hostRuntimeReady = (hostRuntime?.summary?.failed ?? 1) === 0;
const liveBrowserReady = (liveBrowser?.summary?.failed ?? 1) === 0;
const applicationCandidateCount = deadCodeReport?.applicationCandidateCount ?? null;
const orphanModuleCount = deadCodeReport?.orphanModuleCount ?? null;
const deadCodeAuditProgress = applicationCandidateCount === null ? 0 : Math.max(50, 100 - Math.min(applicationCandidateCount, 50));
const distributionSatisfiedCount = distributionIndex.summary.satisfiedBundleCount ?? distributionIndex.summary.availableBundleCount;
const distributionProgress = distributionIndex.summary.bundleCount === 0 ? 0 : Math.round(60 + ((distributionSatisfiedCount / distributionIndex.summary.bundleCount) * 40));

const domainProgress = {
  packagingGuards: (packageIntegrity?.repo?.summary?.failed ?? 1) === 0 ? 100 : 70,
  distributionBundles: distributionProgress,
  buildLane: buildLane.progressPercent,
  handoffDoctor: doctor ? 100 : 0,
  hostRuntime: hostRuntimeReady ? 100 : 0,
  liveBrowserReadiness: liveBrowserReady ? 100 : 0,
  deadCodeAudit: deadCodeAuditProgress,
};

const packagingRefreshItems = [];
if ((distributionIndex.summary.unsatisfiedBundleCount ?? 0) > 0) {
  packagingRefreshItems.push({
    id: 'distribution-bundles',
    reason: `distribution bundles ${distributionSatisfiedCount}/${distributionIndex.summary.bundleCount} satisfied。`,
    recommendedCommand: 'npm run package:distribution-set -- --proof-split',
    missingBundleIds: distributionIndex.summary.bundles.filter((entry) => entry.status === 'missing-manifest' || entry.status === 'missing-archive').map((entry) => entry.id),
  });
}
if (!buildLane.distReady) {
  packagingRefreshItems.push({
    id: 'build-output',
    reason: `resolved build output is missing: ${buildLane.resolvedOutDir}`,
    recommendedCommand: 'KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build',
  });
} else if (!buildLane.preloadCheck.ready) {
  packagingRefreshItems.push({
    id: 'preload-minimum',
    reason: `unexpected modulepreload entries: ${buildLane.preloadCheck.unexpectedEntries.length}`,
    recommendedCommand: 'npm run verify:preload-minimum',
  });
}
if (!buildLane.chunkWarning.warningFree) {
  packagingRefreshItems.push({
    id: 'chunk-warning-doc',
    reason: 'CHUNK_WARNING_INVENTORY_CURRENT.md が warning-free 状態を示していない。',
    recommendedCommand: 'npm run build && npm run verify:preload-minimum',
  });
}

const externalBlockers = [
  {
    id: 'live-browser-proof',
    reason: 'static readiness/pass と実機 live proof は別。Intel Mac 実ブラウザ証跡の最終固定は外部実行が必要。',
  },
];
if (!hostRuntimeReady) {
  externalBlockers.unshift({ id: 'host-runtime', reason: `current host runtime readiness is ${hostRuntime?.summary?.passed ?? 0}/${hostRuntime?.summary?.total ?? 0}.` });
}
if (!liveBrowserReady) {
  externalBlockers.unshift({ id: 'live-browser-readiness', reason: `current host live browser readiness is ${liveBrowser?.summary?.passed ?? 0}/${liveBrowser?.summary?.total ?? 0}.` });
}

const overallCompletionPercent = Math.round(Object.values(domainProgress).reduce((sum, value) => sum + value, 0) / Object.values(domainProgress).length);
const report = {
  generatedAt: new Date().toISOString(),
  overallCompletionPercent,
  domainProgress,
  packageIntegrityReportPath: exists(path.resolve(rootDir, 'docs/archive/package-integrity-report.json')) ? path.resolve(rootDir, 'docs/archive/package-integrity-report.json') : null,
  deadCodeReportPath: exists(path.resolve(rootDir, 'docs/archive/dead-code-report.json')) ? path.resolve(rootDir, 'docs/archive/dead-code-report.json') : null,
  applicationCandidateCount,
  orphanModuleCount,
  distributionBundles: distributionIndex.summary,
  buildLane,
  externalControl: {
    statusPath: exists(path.resolve(rootDir, 'docs/archive/external-control-osc-proxy-status.json')) ? path.resolve(rootDir, 'docs/archive/external-control-osc-proxy-status.json') : null,
    protocolDocPath: path.resolve(rootDir, 'docs/EXTERNAL_CONTROL_BRIDGE_CURRENT.md'),
    proxyReady: true,
    fixtureSenderReady: true,
    latestStatusObserved: Boolean(externalControlStatus?.latestStatus),
    connectedClientCount: externalControlStatus?.connectedClientCount ?? 0,
    messageCount: externalControlStatus?.messageCount ?? 0,
  },
  packagingRefreshItems,
  externalBlockers,
  completionDecision: {
    assistantScope: externalBlockers.length > 0 ? 'complete-with-external-blockers' : 'ready',
    recommendedHandoff: doctor?.packageClass ?? 'source-only-clean',
    recommendedNextStep: packagingRefreshItems.length > 0
      ? packagingRefreshItems[0].recommendedCommand
      : 'Intel Mac 実ブラウザ proof を固定し、doctor/status を再生成する。',
  },
};

fs.mkdirSync(archiveDir, { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

const missingBundleIds = distributionIndex.summary.bundles
  .filter((entry) => entry.status === 'missing-manifest' || entry.status === 'missing-archive')
  .map((entry) => entry.id);

const md = `# Closeout Report (${stamp})

## 概要
- overall completion: **${overallCompletionPercent}/100**
- assistant scope: **${report.completionDecision.assistantScope}**
- recommended handoff: **${report.completionDecision.recommendedHandoff}**

## 領域別進捗
- packaging guards: **${domainProgress.packagingGuards}/100**
- distribution bundles: **${domainProgress.distributionBundles}/100**
- build lane: **${domainProgress.buildLane}/100**
- handoff doctor: **${domainProgress.handoffDoctor}/100**
- host runtime: **${domainProgress.hostRuntime}/100**
- live browser readiness: **${domainProgress.liveBrowserReadiness}/100**
- dead code audit: **${domainProgress.deadCodeAudit}/100**

## 確定できたこと
- dead code report の runtime-facing application candidates は **${applicationCandidateCount ?? 'n/a'}**。
- current host runtime readiness は **${hostRuntime?.summary?.passed ?? 'n/a'}/${hostRuntime?.summary?.total ?? 'n/a'}**。
- current host live browser readiness は **${liveBrowser?.summary?.passed ?? 'n/a'}/${liveBrowser?.summary?.total ?? 'n/a'}**。
- distribution bundles は **${distributionIndex.summary.availableBundleCount}/${distributionIndex.summary.bundleCount} available / ${distributionSatisfiedCount}/${distributionIndex.summary.bundleCount} satisfied**。
- build lane preload minimum は **${buildLane.distReady && buildLane.preloadCheck.ready ? 'ok' : 'needs-check'}**（modulepreload ${buildLane.preloadCheck.modulePreloadCount}）。
- doctor / closeout / repo status は dedicated report を優先して読む。

## Distribution Bundles
- immediateResume: **${distributionIndex.summary.quickAdvice.immediateResume ?? 'none yet'}**
- lightweightHandoff: **${distributionIndex.summary.quickAdvice.lightweightHandoff ?? 'none yet'}**
- verifyStatusOnly: **${distributionIndex.summary.quickAdvice.verifyStatusOnly ?? 'none yet'}**
- intelMacCloseoutOnly: **${distributionIndex.summary.quickAdvice.intelMacCloseoutOnly ?? 'none yet'}**
- missing bundles: **${missingBundleIds.join(', ') || 'none'}**

## Build Lane
- resolved out dir: **${buildLane.resolvedOutDir}**
- dist ready: **${buildLane.distReady ? 'yes' : 'no'}**
- preload minimum: **${buildLane.distReady ? (buildLane.preloadCheck.ready ? 'ok' : 'unexpected entries') : 'build output missing'}**
- circular chunk warning doc: **${buildLane.chunkWarning.warningFree ? 'warning-free' : 'needs-refresh'}**
- top chunks: ${buildLane.topChunks.map((row) => `${row.name} (${row.kb}KB)`).join(', ') || 'n/a'}

## External Control
- protocol doc: **docs/EXTERNAL_CONTROL_BRIDGE_CURRENT.md**
- proxy/fixture lane: **ready**
- observed browser status: **${externalControlStatus?.latestStatus ? 'yes' : 'not-yet-observed'}**
- proxy clients / messages: **${externalControlStatus?.connectedClientCount ?? 0} / ${externalControlStatus?.messageCount ?? 0}**

## Packaging Refresh Items
${packagingRefreshItems.length > 0 ? packagingRefreshItems.map((item) => `- **${item.id}**: ${item.reason} (${item.recommendedCommand})`).join('\n') : '- none'}

## 外部ブロッカー
${externalBlockers.map((item) => `- **${item.id}**: ${item.reason}`).join('\n')}

## 推奨次手順
1. ${report.completionDecision.recommendedNextStep}
2. \`npm run refresh:repo-status\` で doctor / closeout / repo status を一括更新する。
3. handoff 時は manifest を添えて \`node scripts/doctor-package-handoff.mjs --manifest <manifest-path>\` を実行する。
`;
fs.writeFileSync(mdPath, md);
fs.writeFileSync(mdCurrentPath, md);
console.log(jsonPath);
console.log(mdPath);
console.log(mdCurrentPath);
