import fs from 'node:fs';
import path from 'node:path';
import { collectBuildOutputPaths } from './buildOutputShared.mjs';
import { collectDistributionIndex } from './package-distribution-index.mjs';

const rootDir = process.cwd();
const archiveDir = path.resolve(rootDir, 'docs/archive');
const outJson = path.resolve(archiveDir, 'repo-status-current.json');
const outMd = path.resolve(rootDir, 'docs/REPO_STATUS_CURRENT.md');
const stamp = new Date().toISOString().slice(0, 10);
const exists = (targetPath) => fs.existsSync(targetPath);
const readJson = (targetPath) => JSON.parse(fs.readFileSync(targetPath, 'utf8'));
const loadJson = (relativePath) => {
  const absolutePath = path.resolve(rootDir, relativePath);
  return exists(absolutePath) ? readJson(absolutePath) : null;
};

const packageIntegrity = loadJson('docs/archive/package-integrity-report.json');
const hostRuntime = loadJson('docs/archive/host-runtime-readiness.json');
const liveBrowser = loadJson('docs/archive/live-browser-readiness.json');
const deadCode = loadJson('docs/archive/dead-code-report.json');
const doctor = loadJson('docs/archive/package-handoff-doctor.json');
const closeout = loadJson('docs/archive/closeout-report.json');
const distributionSummary = collectDistributionIndex({ rootDir, outDir: path.resolve(rootDir, '.artifacts') }).summary;
const { outDir, indexHtmlPath, assetsDir } = collectBuildOutputPaths(rootDir, { fallback: 'dist' });

const topChunks = exists(assetsDir)
  ? fs.readdirSync(assetsDir)
      .filter((name) => name.endsWith('.js'))
      .map((name) => ({ name, kb: Number((fs.statSync(path.join(assetsDir, name)).size / 1024).toFixed(2)) }))
      .sort((a, b) => b.kb - a.kb)
      .slice(0, 8)
  : [];
const preloadEntries = exists(indexHtmlPath)
  ? [...fs.readFileSync(indexHtmlPath, 'utf8').matchAll(/modulepreload" href="([^"]+)"/g)].map((match) => match[1])
  : [];
const unexpectedPreloads = preloadEntries.filter((href) => !/react-vendor-/.test(href) || /(starter-library-|scene-runtime-|scene-families-core|scene-family-|scene-gpgpu|ui-control-panel|scene-postfx|projectState|scene-future-native)/.test(href));

const report = {
  generatedAt: new Date().toISOString(),
  packageIntegrity: packageIntegrity?.repo?.summary ?? null,
  hostRuntime: hostRuntime?.summary ?? null,
  liveBrowserReadiness: liveBrowser?.summary ?? null,
  doctor: doctor ? {
    effectiveStatus: doctor.effectiveStatus,
    packageClass: doctor.packageClass,
    distributionBundles: doctor.distributionBundles ?? null,
  } : null,
  closeout: closeout ? {
    overallCompletionPercent: closeout.overallCompletionPercent,
    recommendedHandoff: closeout.completionDecision?.recommendedHandoff ?? null,
    recommendedNextStep: closeout.completionDecision?.recommendedNextStep ?? null,
  } : null,
  distributionBundles: {
    availableBundleCount: distributionSummary.availableBundleCount,
    satisfiedBundleCount: distributionSummary.satisfiedBundleCount ?? distributionSummary.availableBundleCount,
    supersededBundleCount: distributionSummary.supersededBundleCount ?? 0,
    bundleCount: distributionSummary.bundleCount,
    quickAdvice: distributionSummary.quickAdvice,
    missingBundleIds: distributionSummary.bundles.filter((entry) => entry.status === 'missing-manifest' || entry.status === 'missing-archive').map((entry) => entry.id),
  },
  buildLane: {
    resolvedOutDir: outDir,
    distReady: exists(indexHtmlPath),
    modulePreloadCount: preloadEntries.length,
    unexpectedPreloadCount: unexpectedPreloads.length,
    unexpectedPreloads,
    topChunks,
  },
  deadCode: {
    orphanModuleCount: deadCode?.orphanModuleCount ?? null,
    applicationCandidateCount: deadCode?.applicationCandidateCount ?? null,
    devOnlyCandidateCount: deadCode?.devOnlyCandidateCount ?? null,
    barrelOnlyCandidateCount: deadCode?.barrelOnlyCandidateCount ?? null,
  },
};

fs.mkdirSync(archiveDir, { recursive: true });
fs.writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`);

const md = `# Repo Status Current (${stamp})

## Verify / status
- package integrity: **${report.packageIntegrity?.passed ?? 'n/a'}/${report.packageIntegrity?.total ?? 'n/a'}**
- host runtime: **${report.hostRuntime?.passed ?? 'n/a'}/${report.hostRuntime?.total ?? 'n/a'}**
- live browser readiness: **${report.liveBrowserReadiness?.passed ?? 'n/a'}/${report.liveBrowserReadiness?.total ?? 'n/a'}**
- doctor effective status: **${report.doctor?.effectiveStatus ?? 'n/a'}**
- closeout completion: **${report.closeout?.overallCompletionPercent ?? 'n/a'}**

## Distribution bundles
- available: **${report.distributionBundles.availableBundleCount}/${report.distributionBundles.bundleCount}**
- satisfied: **${report.distributionBundles.satisfiedBundleCount}/${report.distributionBundles.bundleCount}**
- superseded: **${report.distributionBundles.supersededBundleCount}**
- immediateResume: **${report.distributionBundles.quickAdvice.immediateResume ?? 'none yet'}**
- lightweightHandoff: **${report.distributionBundles.quickAdvice.lightweightHandoff ?? 'none yet'}**
- verifyStatusOnly: **${report.distributionBundles.quickAdvice.verifyStatusOnly ?? 'none yet'}**
- intelMacCloseoutOnly: **${report.distributionBundles.quickAdvice.intelMacCloseoutOnly ?? 'none yet'}**
- missing bundle ids: **${report.distributionBundles.missingBundleIds.join(', ') || 'none'}**

## Build lane
- resolved out dir: **${report.buildLane.resolvedOutDir}**
- dist ready: **${report.buildLane.distReady ? 'yes' : 'no'}**
- modulepreload count: **${report.buildLane.modulePreloadCount}**
- unexpected preloads: **${report.buildLane.unexpectedPreloadCount}**
${topChunks.length > 0 ? topChunks.map((row) => `- ${row.name}: **${row.kb} KB**`).join('\n') : '- top chunks: n/a'}

## Dead code
- orphan modules: **${report.deadCode.orphanModuleCount ?? 'n/a'}**
- runtime-facing application candidates: **${report.deadCode.applicationCandidateCount ?? 'n/a'}**
- dev-only candidates: **${report.deadCode.devOnlyCandidateCount ?? 'n/a'}**
- barrel-only candidates: **${report.deadCode.barrelOnlyCandidateCount ?? 'n/a'}**
`;
fs.writeFileSync(outMd, md);
console.log(outJson);
console.log(outMd);
