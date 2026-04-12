import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
const ROOT_MODULES = new Set([
  'index.tsx',
  'vite.config.ts',
  'components/AppBodyScene.verify.tsx',
]);
const IGNORE_MODULES = new Set([
  'react-three-fiber.d.ts',
]);
const reportPath = path.join(projectRoot, 'docs', 'archive', 'dead-code-report.json');
const DEV_ONLY_PATTERNS = [
  /^tests\//,
  /^(?:check_|pbd_probe\d*\.|op_candidates\.)/,
  /^docs\/archive\/root-noise-2026-04-10\/probes\//,
  /^scripts\/(?:\.tmp_|tmp_|debug-|check-)/,
];

function toPosix(value) {
  return value.replace(/\\/g, '/');
}

function normalizeSpecifier(specifier) {
  return specifier.replace(/[?#].*$/, '');
}

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
      continue;
    }
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(absolutePath, results);
      continue;
    }
    if (SOURCE_EXTENSIONS.includes(path.extname(entry.name))) {
      results.push(absolutePath);
    }
  }
  return results;
}

function resolveModulePath(basePath) {
  const candidates = path.extname(basePath)
    ? [basePath]
    : [
        ...SOURCE_EXTENSIONS.map((extension) => `${basePath}${extension}`),
        ...SOURCE_EXTENSIONS.map((extension) => path.join(basePath, `index${extension}`)),
      ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return toPosix(path.relative(projectRoot, candidate));
    }
  }
  return null;
}

function resolveImport(fromFile, rawSpecifier) {
  const specifier = normalizeSpecifier(rawSpecifier);
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    return resolveModulePath(path.resolve(path.dirname(fromFile), specifier));
  }
  if (specifier.startsWith('@/')) {
    return resolveModulePath(path.join(projectRoot, specifier.slice(2)));
  }
  return null;
}

function resolveOperationalReference(fromFile, rawReference) {
  const reference = normalizeSpecifier(rawReference.trim());
  if (!reference) return null;
  if (reference.startsWith('./') || reference.startsWith('../') || reference.startsWith('@/')) {
    return resolveImport(fromFile, reference);
  }
  if (/^(?:scripts|components|lib|tests|workers|generated)\//.test(reference)) {
    return resolveModulePath(path.resolve(projectRoot, reference));
  }
  return null;
}

function collectOperationalReferences(fromFile, sourceText) {
  const references = new Set();
  const literalPattern = /['"`]((?:\.{1,2}\/|@\/|scripts\/|components\/|lib\/|tests\/|workers\/|generated\/)[^'\"`\r\n]+\.(?:ts|tsx|js|jsx|mjs))['"`]/g;
  let match;
  while ((match = literalPattern.exec(sourceText)) !== null) {
    const resolved = resolveOperationalReference(fromFile, match[1]);
    if (resolved) references.add(resolved);
  }
  return references;
}

function extractScriptRootModules(packageJson) {
  const scriptRoots = new Set();
  const commandPattern = /(?:node|bash)\s+([\w./-]+\.(?:mjs|js|ts|tsx|sh))/g;
  for (const command of Object.values(packageJson.scripts ?? {})) {
    let match;
    while ((match = commandPattern.exec(command)) !== null) {
      const resolved = match[1].replace(/^\.\//, '');
      if (SOURCE_EXTENSIONS.some((extension) => resolved.endsWith(extension))) {
        scriptRoots.add(toPosix(resolved));
      }
    }
  }
  return scriptRoots;
}

const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const allSourceFiles = walk(projectRoot);
const sourceFileMap = new Map(allSourceFiles.map((absolutePath) => [toPosix(path.relative(projectRoot, absolutePath)), absolutePath]));
const incomingReferences = new Map([...sourceFileMap.keys()].map((relativePath) => [relativePath, new Set()]));
const importPattern = /(?:import|export)\s+(?:[^'"`]*?from\s*)?['"]([^'"`]+)['"]|import\(\s*['"]([^'"`]+)['"]\s*\)/g;

for (const [relativePath, absolutePath] of sourceFileMap.entries()) {
  const sourceText = fs.readFileSync(absolutePath, 'utf8');
  let match;
  while ((match = importPattern.exec(sourceText)) !== null) {
    const specifier = match[1] ?? match[2];
    const resolvedImport = resolveImport(absolutePath, specifier);
    if (resolvedImport && incomingReferences.has(resolvedImport)) {
      incomingReferences.get(resolvedImport).add(relativePath);
    }
  }
  for (const resolvedReference of collectOperationalReferences(absolutePath, sourceText)) {
    if (incomingReferences.has(resolvedReference)) {
      incomingReferences.get(resolvedReference).add(relativePath);
    }
  }
}

const scriptRootModules = extractScriptRootModules(packageJson);
for (const rootModule of scriptRootModules) {
  ROOT_MODULES.add(rootModule);
}

const orphanModules = [];
for (const [relativePath, incomingSet] of incomingReferences.entries()) {
  if (IGNORE_MODULES.has(relativePath)) continue;
  if (ROOT_MODULES.has(relativePath)) continue;
  if (relativePath.endsWith('.d.ts')) continue;
  if (incomingSet.size === 0) {
    orphanModules.push(relativePath);
  }
}

const isBarrelOnlyModule = (relativePath) => {
  const absolutePath = sourceFileMap.get(relativePath);
  if (!absolutePath) return false;
  const sourceText = fs.readFileSync(absolutePath, 'utf8').trim();
  if (!sourceText) return false;
  const body = sourceText.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('//'));
  return body.length > 0 && body.every((line) => /^(export\s+(type\s+)?\*|export\s+\{)/.test(line));
};
const devOnlyCandidates = orphanModules.filter((relativePath) => DEV_ONLY_PATTERNS.some((pattern) => pattern.test(relativePath)));
const barrelOnlyCandidates = orphanModules.filter((relativePath) => isBarrelOnlyModule(relativePath));
const applicationCandidates = orphanModules.filter((relativePath) => !relativePath.startsWith('scripts/') && !devOnlyCandidates.includes(relativePath) && !barrelOnlyCandidates.includes(relativePath));
const report = {
  generatedAt: new Date().toISOString(),
  rootModules: [...ROOT_MODULES].sort(),
  ignoredModules: [...IGNORE_MODULES].sort(),
  orphanModuleCount: orphanModules.length,
  applicationCandidateCount: applicationCandidates.length,
  devOnlyCandidateCount: devOnlyCandidates.length,
  barrelOnlyCandidateCount: barrelOnlyCandidates.length,
  orphanModules: orphanModules.sort(),
  devOnlyCandidates: devOnlyCandidates.sort(),
  barrelOnlyCandidates: barrelOnlyCandidates.sort(),
  applicationCandidates: applicationCandidates.sort(),
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({
  reportPath: toPosix(path.relative(projectRoot, reportPath)),
  orphanModuleCount: report.orphanModuleCount,
  applicationCandidateCount: report.applicationCandidateCount,
  devOnlyCandidateCount: report.devOnlyCandidateCount,
  barrelOnlyCandidateCount: report.barrelOnlyCandidateCount,
  applicationCandidates: report.applicationCandidates,
}, null, 2));
