import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const moduleCache = new Map();
const projectRoot = process.cwd();
const nodeRequire = createRequire(import.meta.url);
const transpileCacheDir = path.join(projectRoot, 'node_modules', '.cache', 'run-ts-entry');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resolveLocalPath(specifier, parentPath) {
  const base = path.resolve(path.dirname(parentPath), specifier);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.mjs`,
    `${base}.cjs`,
    `${base}.json`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
    path.join(base, 'index.mjs'),
    path.join(base, 'index.cjs'),
    path.join(base, 'index.json'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  throw new Error(`Cannot resolve ${specifier} from ${parentPath}`);
}

function transpileTsModule(source, fileName) {
  return ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
    fileName,
    reportDiagnostics: false,
  }).outputText;
}

function getTranspileCachePath(modulePath) {
  const stats = fs.statSync(modulePath);
  const cacheKey = createHash('sha1')
    .update(modulePath)
    .update('\0')
    .update(String(stats.mtimeMs))
    .update('\0')
    .update(String(stats.size))
    .update('\0')
    .update(ts.version)
    .digest('hex');
  return path.join(transpileCacheDir, `${cacheKey}.cjs`);
}

function loadTranspiledCode(modulePath) {
  const cachePath = getTranspileCachePath(modulePath);
  try {
    return fs.readFileSync(cachePath, 'utf8');
  } catch {
    const source = fs.readFileSync(modulePath, 'utf8');
    const transpiled = transpileTsModule(source, modulePath);
    try {
      ensureDir(path.dirname(cachePath));
      fs.writeFileSync(cachePath, transpiled, 'utf8');
    } catch {
      // fall through with in-memory transpiled code when cache writes are unavailable
    }
    return transpiled;
  }
}

function requireOrImport(specifier, parentPath) {
  if (specifier.startsWith('.')) {
    const resolved = resolveLocalPath(specifier, parentPath);
    if (resolved.endsWith('.ts') || resolved.endsWith('.tsx')) return requireTsModule(resolved);
    if (resolved.endsWith('.json')) return JSON.parse(fs.readFileSync(resolved, 'utf8'));
    if (resolved.endsWith('.mjs')) throw new Error(`Relative .mjs import is not supported in run-ts-entry: ${specifier}`);
    if (resolved.endsWith('.cjs')) return nodeRequire(resolved);
    return nodeRequire(resolved);
  }
  if (specifier.startsWith('node:')) return nodeRequire(specifier);
  return nodeRequire(specifier);
}

function requireTsModule(modulePath) {
  const resolvedPath = path.resolve(projectRoot, modulePath);
  if (moduleCache.has(resolvedPath)) return moduleCache.get(resolvedPath).exports;
  const transpiled = loadTranspiledCode(resolvedPath);
  const module = { exports: {} };
  moduleCache.set(resolvedPath, module);
  const localRequire = (specifier) => requireOrImport(specifier, resolvedPath);
  const wrapped = new Function('require', 'module', 'exports', '__filename', '__dirname', transpiled);
  wrapped(localRequire, module, module.exports, resolvedPath, path.dirname(resolvedPath));
  return module.exports;
}

async function runTsEntry(entryPath, forwardedArgs = []) {
  const resolvedEntry = path.resolve(projectRoot, entryPath);
  const originalArgv = process.argv.slice();
  process.argv = [process.execPath, resolvedEntry, ...forwardedArgs];
  try {
    const exports = requireTsModule(resolvedEntry);
    if (exports && typeof exports.main === 'function') {
      await exports.main();
    }
  } finally {
    process.argv = originalArgv;
  }
}

const entryPath = process.argv[2];
if (!entryPath) {
  console.error('Usage: node scripts/run-ts-entry.mjs <entry.ts> [args...]');
  process.exit(1);
}

await runTsEntry(entryPath, process.argv.slice(3));

const exitCode = process.exitCode ?? 0;
setImmediate(() => process.exit(exitCode));
