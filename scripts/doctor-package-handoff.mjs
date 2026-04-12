import fs from 'node:fs';
import path from 'node:path';
import {
  buildRecoveryPlan,
  describePackageClass,
  getLegacyPackageClassNames,
  normalizePackageClass,
  resolvePackageClass,
  writeJson,
} from './packageIntegrityShared.mjs';
import { formatHostDescriptor } from './hostRuntimeShared.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? '' : '';
};
const manifestArg = getArgValue('--manifest');
const writeArg = getArgValue('--write');
const reportArg = getArgValue('--report');
const defaultReportPath = path.resolve(rootDir, 'docs/archive/package-integrity-report.json');
const defaultBrowserReportPath = path.resolve(rootDir, 'docs/archive/live-browser-readiness.json');
const defaultHostRuntimeReportPath = path.resolve(rootDir, 'docs/archive/host-runtime-readiness.json');
const defaultIntelMacRuntimeReportPath = path.resolve(rootDir, 'docs/archive/target-host-runtime-intel-mac.json');
const defaultIntelMacBrowserReportPath = path.resolve(rootDir, 'docs/archive/target-live-browser-readiness-intel-mac.json');

let manifest = null;
if (manifestArg) {
  const manifestPath = path.resolve(rootDir, manifestArg);
  if (!fs.existsSync(manifestPath)) {
    console.error(`[doctor-package-handoff] manifest not found: ${manifestPath}`);
    process.exit(1);
  }
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

const resolvedReportPath = reportArg
  ? path.resolve(rootDir, reportArg)
  : (fs.existsSync(defaultReportPath) ? defaultReportPath : null);
const report = resolvedReportPath && fs.existsSync(resolvedReportPath)
  ? JSON.parse(fs.readFileSync(resolvedReportPath, 'utf8'))
  : null;
const browserRuntime = fs.existsSync(defaultBrowserReportPath)
  ? JSON.parse(fs.readFileSync(defaultBrowserReportPath, 'utf8'))
  : null;
const dedicatedHostRuntime = fs.existsSync(defaultHostRuntimeReportPath)
  ? JSON.parse(fs.readFileSync(defaultHostRuntimeReportPath, 'utf8'))
  : null;
const intelMacRuntime = fs.existsSync(defaultIntelMacRuntimeReportPath)
  ? JSON.parse(fs.readFileSync(defaultIntelMacRuntimeReportPath, 'utf8'))
  : null;
const intelMacBrowser = fs.existsSync(defaultIntelMacBrowserReportPath)
  ? JSON.parse(fs.readFileSync(defaultIntelMacBrowserReportPath, 'utf8'))
  : null;

if (!manifest && !report) {
  console.error('[doctor-package-handoff] package integrity report or manifest is required.');
  process.exit(1);
}

const inferredClass = normalizePackageClass(manifest?.packageClass
  ?? resolvePackageClass({
    excludesNodeModules: false,
    summary: report?.zip?.summary ?? report?.repo?.summary ?? null,
  }));
const summary = manifest?.zipSummary
  ?? manifest?.repoSummary
  ?? report?.zip?.summary
  ?? report?.repo?.summary
  ?? null;
const hostRuntime = dedicatedHostRuntime ?? report?.hostRuntime ?? null;
const recoveryPlan = manifest?.recoveryPlan ?? buildRecoveryPlan({
  packageClass: inferredClass,
  repoSummary: manifest?.repoSummary ?? report?.repo?.summary ?? null,
  zipSummary: manifest?.zipSummary ?? report?.zip?.summary ?? null,
});
const hostRuntimeReady = (hostRuntime?.summary?.failed ?? 0) === 0;
const liveBrowserReady = (browserRuntime?.summary?.failed ?? 0) === 0;
const effectiveStatus = !hostRuntimeReady
  ? 'host-runtime-mismatch'
  : !liveBrowserReady
    ? 'live-browser-blocked'
    : 'ready';

const doctorReport = {
  generatedAt: new Date().toISOString(),
  packageClass: inferredClass,
  legacyPackageClassNames: getLegacyPackageClassNames(inferredClass),
  description: describePackageClass(inferredClass),
  sourceManifest: manifestArg ? path.resolve(rootDir, manifestArg) : null,
  integrityReportPath: resolvedReportPath,
  summary,
  recoveryPlan,
  effectiveStatus,
  hostRuntime: hostRuntime ? {
    host: hostRuntime.host,
    hostLabel: formatHostDescriptor(hostRuntime.host),
    summary: hostRuntime.summary,
    ready: hostRuntimeReady,
  } : null,
  liveBrowserReadiness: browserRuntime ? {
    host: browserRuntime.host,
    hostLabel: browserRuntime.hostLabel ?? formatHostDescriptor(browserRuntime.host),
    summary: browserRuntime.summary,
    ready: liveBrowserReady,
  } : null,
  targetProfiles: intelMacRuntime || intelMacBrowser ? {
    intelMacX64: {
      runtime: intelMacRuntime ? {
        host: intelMacRuntime.targetHost,
        hostLabel: intelMacRuntime.targetHostLabel ?? formatHostDescriptor(intelMacRuntime.targetHost),
        summary: intelMacRuntime.summary,
        ready: (intelMacRuntime.summary?.failed ?? 0) === 0,
      } : null,
      liveBrowserReadiness: intelMacBrowser ? {
        host: intelMacBrowser.targetHost,
        hostLabel: intelMacBrowser.targetHostLabel ?? formatHostDescriptor(intelMacBrowser.targetHost),
        summary: intelMacBrowser.summary,
        ready: (intelMacBrowser.summary?.failed ?? 0) === 0,
      } : null,
    },
  } : null,
};

console.log(`[doctor-package-handoff] class=${doctorReport.packageClass}`);
if (doctorReport.legacyPackageClassNames.length > 0) {
  console.log(`[doctor-package-handoff] legacy aliases=${doctorReport.legacyPackageClassNames.join(', ')}`);
}
console.log(`[doctor-package-handoff] ${doctorReport.description}`);
console.log(`[doctor-package-handoff] next: ${doctorReport.recoveryPlan.recommendedNextCommand}`);
console.log(`[doctor-package-handoff] effective-status=${doctorReport.effectiveStatus}`);
if (doctorReport.hostRuntime) {
  console.log(`[doctor-package-handoff] host-runtime ${doctorReport.hostRuntime.summary.passed}/${doctorReport.hostRuntime.summary.total} ok on ${doctorReport.hostRuntime.hostLabel}`);
}
if (doctorReport.liveBrowserReadiness) {
  console.log(`[doctor-package-handoff] live-browser ${doctorReport.liveBrowserReadiness.summary.passed}/${doctorReport.liveBrowserReadiness.summary.total} ok on ${doctorReport.liveBrowserReadiness.hostLabel}`);
}
if (doctorReport.targetProfiles?.intelMacX64?.runtime) {
  const runtime = doctorReport.targetProfiles.intelMacX64.runtime;
  console.log(`[doctor-package-handoff] intel-mac runtime ${runtime.summary.passed}/${runtime.summary.total} ok on ${runtime.hostLabel}`);
}
if (doctorReport.targetProfiles?.intelMacX64?.liveBrowserReadiness) {
  const browser = doctorReport.targetProfiles.intelMacX64.liveBrowserReadiness;
  console.log(`[doctor-package-handoff] intel-mac live-browser ${browser.summary.passed}/${browser.summary.total} ok on ${browser.hostLabel}`);
}
if (doctorReport.recoveryPlan.missingNodeModules.length > 0) {
  console.log('[doctor-package-handoff] missing node_modules:');
  for (const target of doctorReport.recoveryPlan.missingNodeModules) console.log(`- ${target}`);
}
if (doctorReport.recoveryPlan.missingRootPaths.length > 0) {
  console.log('[doctor-package-handoff] missing root paths:');
  for (const target of doctorReport.recoveryPlan.missingRootPaths) console.log(`- ${target}`);
}

if (writeArg) {
  writeJson(path.resolve(rootDir, writeArg), doctorReport);
}

if (doctorReport.hostRuntime && !doctorReport.hostRuntime.ready) {
  console.log('[doctor-package-handoff] current host is not runtime-ready for build/live verification.');
  console.log('- run npm run verify:host-runtime');
}
if (doctorReport.liveBrowserReadiness && !doctorReport.liveBrowserReadiness.ready) {
  console.log('[doctor-package-handoff] live browser proof is still blocked on this host.');
  console.log('- run npm run verify:live-browser-readiness');
}
