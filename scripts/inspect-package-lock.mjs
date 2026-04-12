import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const lockPath = path.resolve(cwd, 'package-lock.json');
const packageJsonPath = path.resolve(cwd, 'package.json');
const raw = fs.readFileSync(lockPath, 'utf8');
const lock = JSON.parse(raw);
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const packages = lock.packages && typeof lock.packages === 'object' ? lock.packages : {};
const packageEntries = Object.entries(packages);
const dependencyPackages = packageEntries.filter(([key]) => key && key.startsWith('node_modules/'));
const root = packages[''] ?? {};
const rootDeps = Object.keys(root.dependencies ?? {});
const rootDevDeps = Object.keys(root.devDependencies ?? {});
const packageJsonScripts = Object.keys(packageJson.scripts ?? {});

const integrityCount = dependencyPackages.filter(([, value]) => typeof value?.integrity === 'string').length;
const resolvedCount = dependencyPackages.filter(([, value]) => typeof value?.resolved === 'string').length;
const linkCount = dependencyPackages.filter(([, value]) => value?.link === true).length;
const optionalCount = dependencyPackages.filter(([, value]) => value?.optional === true).length;
const devOnlyCount = dependencyPackages.filter(([, value]) => value?.dev === true).length;

const summary = {
  name: lock.name ?? root.name ?? packageJson.name ?? null,
  version: lock.version ?? root.version ?? packageJson.version ?? null,
  lockfileVersion: lock.lockfileVersion ?? null,
  requires: lock.requires ?? null,
  packageEntryCount: packageEntries.length,
  dependencyPackageCount: dependencyPackages.length,
  rootDependencyCount: rootDeps.length,
  rootDevDependencyCount: rootDevDeps.length,
  resolvedCount,
  integrityCount,
  linkCount,
  optionalCount,
  devOnlyCount,
  lockfileRootHasScripts: Object.keys(root.scripts ?? {}).length > 0,
  packageJsonScriptCount: packageJsonScripts.length,
  packageJsonScripts,
  rootDependencies: rootDeps,
  rootDevDependencies: rootDevDeps,
};

console.log(JSON.stringify(summary, null, 2));
