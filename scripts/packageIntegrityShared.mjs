import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { getBundleAdvice } from './package-bundle-advice.mjs';

export const REQUIRED_ROOT_PATHS = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'App.tsx',
  'components/controlPanelTabsAudio.tsx',
  'components/controlPanelTabsAudioSynth.tsx',
  'scripts/run-vite.mjs',
  'scripts/verify-phase5.mjs',
  'README.md',
  'CURRENT_STATUS.md',
];

export const CRITICAL_PACKAGE_ALLOWLIST = [
  'react',
  'react-dom',
  'three',
  '@react-three/fiber',
  '@react-three/drei',
  '@react-three/postprocessing',
  'zustand',
  'jszip',
  'typescript',
  'vite',
  'esbuild',
  '@vitejs/plugin-react',
  '@types/node',
  '@types/react',
  '@types/react-dom',
  'playwright',
  'pngjs',
  'tailwindcss',
  '@tailwindcss/vite',
];

export function loadPackageJson(rootDir) {
  const packageJsonPath = path.resolve(rootDir, 'package.json');
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

export function collectCriticalPackageNames(packageJson) {
  const allNames = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ]);
  return CRITICAL_PACKAGE_ALLOWLIST.filter((name) => allNames.has(name));
}

export function buildRepoChecks(rootDir, packageJson) {
  const rootChecks = REQUIRED_ROOT_PATHS.map((relativePath) => ({
    kind: 'root-path',
    target: relativePath,
    ok: fs.existsSync(path.resolve(rootDir, relativePath)),
  }));
  const packageChecks = collectCriticalPackageNames(packageJson).map((name) => ({
    kind: 'node-module',
    target: `node_modules/${name}`,
    ok: fs.existsSync(path.resolve(rootDir, 'node_modules', name)),
  }));
  return [...rootChecks, ...packageChecks];
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error ? String(result.error) : null,
  };
}

export function inspectZipEntries(zipPath) {
  const result = runCommand('unzip', ['-Z1', zipPath]);
  if (result.status !== 0) {
    return {
      ok: false,
      entries: [],
      error: result.stderr.trim() || result.stdout.trim() || result.error || 'zip entry listing failed',
    };
  }
  const entries = result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return { ok: true, entries, error: null };
}

export function verifyZipStructure(zipPath) {
  const result = runCommand('unzip', ['-t', zipPath]);
  return {
    ok: result.status === 0,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
    error: result.error,
  };
}

export function buildZipChecks(zipPath, packageJson) {
  const structure = verifyZipStructure(zipPath);
  const entryInfo = inspectZipEntries(zipPath);
  if (!entryInfo.ok) {
    return {
      zipPath,
      structure,
      rootPrefix: null,
      checks: [],
      entryCount: 0,
      entryError: entryInfo.error,
    };
  }

  const entries = entryInfo.entries;
  const rootPrefix = entries[0]?.split('/')[0] ?? null;
  const set = new Set(entries);
  const withPrefix = (relativePath) => (rootPrefix ? `${rootPrefix}/${relativePath}` : relativePath);

  const rootChecks = REQUIRED_ROOT_PATHS.map((relativePath) => ({
    kind: 'root-path',
    target: relativePath,
    ok: set.has(withPrefix(relativePath)),
  }));
  const packageChecks = collectCriticalPackageNames(packageJson).map((name) => ({
    kind: 'node-module',
    target: `node_modules/${name}`,
    ok: entries.some((entry) => entry === withPrefix(`node_modules/${name}`) || entry.startsWith(withPrefix(`node_modules/${name}/`))),
  }));

  return {
    zipPath,
    structure,
    rootPrefix,
    checks: [...rootChecks, ...packageChecks],
    entryCount: entries.length,
    entryError: null,
  };
}

export function summarizeChecks(checks) {
  const missing = checks.filter((item) => !item.ok);
  return {
    total: checks.length,
    passed: checks.length - missing.length,
    failed: missing.length,
    missingTargets: missing.map((item) => ({ kind: item.kind, target: item.target })),
  };
}

export const CANONICAL_PACKAGE_CLASSES = {
  SOURCE_ONLY: 'source-only',
  FULL_LOCAL_DEV: 'full-local-dev',
  PLATFORM_SPECIFIC_RUNTIME_BUNDLED: 'platform-specific-runtime-bundled',
};

const PACKAGE_CLASS_ALIASES = new Map([
  ['source', CANONICAL_PACKAGE_CLASSES.SOURCE_ONLY],
  ['source-only', CANONICAL_PACKAGE_CLASSES.SOURCE_ONLY],
  ['full', CANONICAL_PACKAGE_CLASSES.FULL_LOCAL_DEV],
  ['full-local-dev', CANONICAL_PACKAGE_CLASSES.FULL_LOCAL_DEV],
  ['partial-full', CANONICAL_PACKAGE_CLASSES.PLATFORM_SPECIFIC_RUNTIME_BUNDLED],
  ['platform-specific', CANONICAL_PACKAGE_CLASSES.PLATFORM_SPECIFIC_RUNTIME_BUNDLED],
  ['platform-specific-runtime-bundled', CANONICAL_PACKAGE_CLASSES.PLATFORM_SPECIFIC_RUNTIME_BUNDLED],
]);

export function normalizePackageClass(packageClass) {
  if (!packageClass) return 'unknown';
  return PACKAGE_CLASS_ALIASES.get(packageClass) ?? packageClass;
}

export function getLegacyPackageClassNames(packageClass) {
  const normalized = normalizePackageClass(packageClass);
  switch (normalized) {
    case CANONICAL_PACKAGE_CLASSES.SOURCE_ONLY:
      return ['source'];
    case CANONICAL_PACKAGE_CLASSES.FULL_LOCAL_DEV:
      return ['full'];
    case CANONICAL_PACKAGE_CLASSES.PLATFORM_SPECIFIC_RUNTIME_BUNDLED:
      return ['partial-full'];
    default:
      return [];
  }
}

export function resolvePackageClass({ excludesNodeModules = false, summary = null }) {
  if (excludesNodeModules) return CANONICAL_PACKAGE_CLASSES.SOURCE_ONLY;
  if (!summary) return 'unknown';
  return summary.failed === 0
    ? CANONICAL_PACKAGE_CLASSES.FULL_LOCAL_DEV
    : CANONICAL_PACKAGE_CLASSES.PLATFORM_SPECIFIC_RUNTIME_BUNDLED;
}

export function describePackageClass(packageClass) {
  switch (normalizePackageClass(packageClass)) {
    case CANONICAL_PACKAGE_CLASSES.FULL_LOCAL_DEV:
      return 'root files・critical node_modules・zip structure が揃った local-dev complete handoff。';
    case CANONICAL_PACKAGE_CLASSES.PLATFORM_SPECIFIC_RUNTIME_BUNDLED:
      return 'zip 構造と root files は揃うが、critical node_modules の一部欠損や host 依存 runtime を含みうる handoff。';
    case CANONICAL_PACKAGE_CLASSES.SOURCE_ONLY:
      return 'node_modules 非同梱の source-only handoff。';
    default:
      return 'package class を判定できなかった handoff。';
  }
}

export function buildRecoveryPlan({ packageClass, repoSummary = null, zipSummary = null }) {
  const normalizedPackageClass = normalizePackageClass(packageClass);
  const summary = zipSummary ?? repoSummary;
  const missingTargets = summary?.missingTargets ?? [];
  const missingNodeModules = missingTargets.filter((item) => item.kind === 'node-module').map((item) => item.target);
  const missingRootPaths = missingTargets.filter((item) => item.kind === 'root-path').map((item) => item.target);
  const requiresBootstrap = normalizedPackageClass === CANONICAL_PACKAGE_CLASSES.SOURCE_ONLY || missingNodeModules.length > 0;
  const recommendedBootstrapCommand = requiresBootstrap ? 'npm run bootstrap:dev' : null;
  const recommendedVerifyCommand = 'npm run verify:package-integrity:strict';
  const recommendedNextCommand = requiresBootstrap
    ? `${recommendedBootstrapCommand} && ${recommendedVerifyCommand}`
    : recommendedVerifyCommand;
  return {
    packageClass: normalizedPackageClass,
    legacyPackageClassNames: getLegacyPackageClassNames(normalizedPackageClass),
    requiresBootstrap,
    missingNodeModules,
    missingRootPaths,
    recommendedBootstrapCommand,
    recommendedVerifyCommand,
    recommendedNextCommand,
    explanation: describePackageClass(normalizedPackageClass),
  };
}

export function buildPackageManifest({
  outputPath,
  manifestPath,
  sizeBytes,
  packageClass,
  repoSummary = null,
  zipSummary = null,
  allowPartial = false,
  excludesNodeModules = false,
  extra = {},
}) {
  const normalizedPackageClass = normalizePackageClass(packageClass);
  const recoveryPlan = buildRecoveryPlan({ packageClass: normalizedPackageClass, repoSummary, zipSummary });
  const quickAdvice = getBundleAdvice(normalizedPackageClass);
  return {
    packagedAt: new Date().toISOString(),
    outputPath,
    manifestPath,
    sizeBytes,
    packageClass: normalizedPackageClass,
    packageClassAliases: getLegacyPackageClassNames(normalizedPackageClass),
    packageClassDescription: describePackageClass(normalizedPackageClass),
    quickAdvice,
    allowPartial,
    excludesNodeModules,
    repoSummary,
    zipSummary,
    recoveryPlan,
    ...extra,
  };
}

export function ensureDirectoryForFile(targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
}

export function writeJson(targetPath, value) {
  ensureDirectoryForFile(targetPath);
  fs.writeFileSync(targetPath, `${JSON.stringify(value, null, 2)}\n`);
}
