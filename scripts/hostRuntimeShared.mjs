import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const LINUX_GLIBC = 'gnu';
const LINUX_MUSL = 'musl';

function detectLinuxLibc() {
  if (process.platform !== 'linux') return null;
  const report = typeof process.report?.getReport === 'function' ? process.report.getReport() : null;
  const glibcVersion = report?.header?.glibcVersionRuntime || report?.header?.glibcVersionCompiler || null;
  return glibcVersion ? LINUX_GLIBC : LINUX_MUSL;
}

export function getHostDescriptor() {
  const platform = process.platform;
  const arch = process.arch;
  const libc = detectLinuxLibc();
  return { platform, arch, libc };
}

function formatHost(host) {
  if (host.platform === 'linux') return `${host.platform}/${host.arch}/${host.libc || LINUX_GLIBC}`;
  return `${host.platform}/${host.arch}`;
}

export function formatHostDescriptor(host = getHostDescriptor()) {
  return formatHost(host);
}

export function getRollupNativePackageName(host = getHostDescriptor()) {
  const { platform, arch, libc } = host;
  if (platform === 'linux') return `@rollup/rollup-linux-${arch}-${libc || LINUX_GLIBC}`;
  if (platform === 'darwin') return `@rollup/rollup-darwin-${arch}`;
  if (platform === 'win32') return `@rollup/rollup-win32-${arch}-msvc`;
  if (platform === 'android') return arch === 'arm' ? '@rollup/rollup-android-arm-eabi' : `@rollup/rollup-android-${arch}`;
  return null;
}

export function getEsbuildNativePackageName(host = getHostDescriptor()) {
  const { platform, arch } = host;
  if (platform === 'linux' || platform === 'darwin') return `@esbuild/${platform}-${arch}`;
  if (platform === 'win32') return `@esbuild/win32-${arch}`;
  if (platform === 'android') return `@esbuild/android-${arch}`;
  return null;
}

export function readPlaywrightBrowsersMetadata(rootDir) {
  try {
    const browsersPath = path.resolve(rootDir, 'node_modules/playwright-core/browsers.json');
    if (!fs.existsSync(browsersPath)) return null;
    return JSON.parse(fs.readFileSync(browsersPath, 'utf8'));
  } catch {
    return null;
  }
}

export function getPlaywrightChromiumRevision(rootDir) {
  const metadata = readPlaywrightBrowsersMetadata(rootDir);
  return metadata?.browsers?.find((item) => item.name === 'chromium')?.revision ?? null;
}

export function getDefaultPlaywrightCacheBase(host = getHostDescriptor(), homeDir = '~') {
  if (host.platform === 'darwin') return path.posix.join(homeDir, 'Library', 'Caches', 'ms-playwright');
  if (host.platform === 'linux') return path.posix.join(homeDir, '.cache', 'ms-playwright');
  if (host.platform === 'win32') return `${homeDir}\\AppData\\Local\\ms-playwright`;
  return path.posix.join(homeDir, '.cache', 'ms-playwright');
}

export function getExpectedPlaywrightExecutableLabel(rootDir, host = getHostDescriptor(), homeDir = '~') {
  const revision = getPlaywrightChromiumRevision(rootDir);
  if (!revision) return null;
  const baseDir = getDefaultPlaywrightCacheBase(host, homeDir);
  if (host.platform === 'linux' && host.arch === 'x64') {
    return path.posix.join(baseDir, `chromium-${revision}`, 'chrome-linux64', 'chrome');
  }
  if (host.platform === 'darwin' && host.arch === 'x64') {
    return path.posix.join(baseDir, `chromium-${revision}`, 'chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
  }
  if (host.platform === 'darwin' && host.arch === 'arm64') {
    return path.posix.join(baseDir, `chromium-${revision}`, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
  }
  if (host.platform === 'win32' && host.arch === 'x64') {
    return `${baseDir}\\chromium-${revision}\\chrome-win\\chrome.exe`;
  }
  return path.posix.join(baseDir, `chromium-${revision}`);
}


function expandHomePath(filePath, homeDir = '~') {
  if (!filePath) return filePath;
  if (filePath === '~') return homeDir;
  if (filePath.startsWith('~/')) return path.join(homeDir, filePath.slice(2));
  return filePath;
}

export function getCandidatePlaywrightExecutablePaths(rootDir, host = getHostDescriptor(), homeDir = '~', overridePath = null) {
  const candidates = [];
  const add = (value, source) => {
    if (!value) return;
    const expanded = expandHomePath(value, homeDir);
    if (!candidates.find((item) => item.path === expanded)) {
      candidates.push({ path: expanded, source });
    }
  };
  if (overridePath) add(overridePath, 'override');
  const labelPath = getExpectedPlaywrightExecutableLabel(rootDir, host, homeDir);
  if (labelPath) add(labelPath, 'label');
  const currentHost = getHostDescriptor();
  if (host.platform === currentHost.platform && host.arch === currentHost.arch && (host.platform !== 'linux' || (host.libc || LINUX_GLIBC) === (currentHost.libc || LINUX_GLIBC))) {
    add(getExpectedPlaywrightExecutablePath(rootDir), 'playwright-module');
  }
  if (host.platform === 'darwin' && host.arch === 'x64') {
    add('~/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'user-applications');
    add('/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'system-applications');
    add('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'system-google-chrome');
  }
  if (host.platform === 'linux' && host.arch === 'x64') {
    add('/usr/bin/google-chrome', 'system-google-chrome');
    add('/usr/bin/chromium-browser', 'system-chromium-browser');
    add('/usr/bin/chromium', 'system-chromium');
  }
  return candidates;
}

export function resolvePlaywrightExecutable(rootDir, host = getHostDescriptor(), homeDir = '~', overridePath = null) {
  const candidates = getCandidatePlaywrightExecutablePaths(rootDir, host, homeDir, overridePath);
  const resolved = candidates.find((item) => fs.existsSync(item.path)) || null;
  return {
    resolvedPath: resolved?.path || null,
    resolvedSource: resolved?.source || null,
    candidates,
  };
}
export function getExpectedPlaywrightExecutablePath(rootDir) {
  try {
    const playwrightModulePath = path.resolve(rootDir, 'node_modules/playwright');
    const { chromium } = require(playwrightModulePath);
    return chromium.executablePath();
  } catch {
    return null;
  }
}

export function buildHostRuntimeChecks(rootDir, packageJson, host = getHostDescriptor()) {
  const dependencyNames = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
    ...Object.keys(packageJson.optionalDependencies ?? {}),
  ]);
  const checks = [];

  if (dependencyNames.has('vite') || dependencyNames.has('rollup')) {
    const pkg = getRollupNativePackageName(host);
    if (pkg) {
      checks.push({
        kind: 'native-node-module',
        target: `node_modules/${pkg}`,
        ok: fs.existsSync(path.resolve(rootDir, 'node_modules', pkg)),
        runtime: 'rollup',
        host: formatHost(host),
      });
    }
  }

  if (dependencyNames.has('esbuild')) {
    const pkg = getEsbuildNativePackageName(host);
    if (pkg) {
      checks.push({
        kind: 'native-node-module',
        target: `node_modules/${pkg}`,
        ok: fs.existsSync(path.resolve(rootDir, 'node_modules', pkg)),
        runtime: 'esbuild',
        host: formatHost(host),
      });
    }
  }



  return { host, checks };
}

export function summarizeHostRuntimeChecks(checks) {
  const missing = checks.filter((item) => !item.ok);
  return {
    total: checks.length,
    passed: checks.length - missing.length,
    failed: missing.length,
    missingTargets: missing.map((item) => ({
      kind: item.kind,
      target: item.target,
      runtime: item.runtime ?? null,
      host: item.host ?? null,
      executablePath: item.executablePath ?? null,
    })),
  };
}

export function printHostRuntimeSummary(prefix, host, summary) {
  console.log(`${prefix} host=${formatHost(host)} ${summary.passed}/${summary.total} ok`);
  if (summary.failed > 0) {
    console.log(`${prefix} missing on current host:`);
    for (const item of summary.missingTargets) {
      const runtime = item.runtime ? `${item.runtime}: ` : '';
      console.log(`- ${runtime}${item.target}`);
    }
  }
}
