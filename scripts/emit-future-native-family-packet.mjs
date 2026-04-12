import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const cache = new Map();

function resolveTsPath(specifier, parentPath) {
  if (!specifier.startsWith('.')) {
    throw new Error(`Only relative imports are supported in emit-future-native-family-packet.mjs, got: ${specifier}`);
  }
  const base = path.resolve(path.dirname(parentPath), specifier);
  const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  throw new Error(`Cannot resolve ${specifier} from ${parentPath}`);
}

function requireTs(modulePath) {
  const resolved = path.resolve(modulePath);
  if (cache.has(resolved)) return cache.get(resolved).exports;
  const source = fs.readFileSync(resolved, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    fileName: resolved,
  }).outputText;
  const module = { exports: {} };
  cache.set(resolved, module);
  const localRequire = (specifier) => {
    if (specifier.startsWith('.')) {
      return requireTs(resolveTsPath(specifier, resolved));
    }
    return require(specifier);
  };
  const fn = new Function('require', 'module', 'exports', '__filename', '__dirname', transpiled);
  fn(localRequire, module, module.exports, resolved, path.dirname(resolved));
  return module.exports;
}

const id = process.argv[2];
if (!id) {
  console.error('Usage: node scripts/emit-future-native-family-packet.mjs <family-id>');
  process.exit(1);
}

const cliModule = requireTs(path.join(root, 'lib/future-native-families/futureNativeFamiliesPacketCli.ts'));
const packet = cliModule.emitPacket(id);
const outDir = path.join(root, 'tmp', 'future-native-family-packets');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `${id}.md`);
fs.writeFileSync(outPath, packet, 'utf8');
console.log(`Wrote ${outPath}`);
