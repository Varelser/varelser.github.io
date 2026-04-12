import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const registrySourcePath = path.join(projectRoot, 'scripts', 'verify-entry-registry.mjs');

function parseRegistry(source: string): Record<string, string> {
  const match = source.match(/Object\.freeze\(\{([\s\S]*?)\n\}\)/);
  assert(match, 'verify registry object literal missing');
  const entries = Array.from(match[1].matchAll(/'([^']+)': '([^']+)'/g));
  return Object.fromEntries(entries.map((entry) => [entry[1], entry[2]]));
}

export async function main() {
  const registrySource = fs.readFileSync(registrySourcePath, 'utf8');
  const registry = parseRegistry(registrySource);
  const ids = Object.keys(registry);

  assert.equal(ids.length, 39, 'verify registry size drifted');
  assert.equal(new Set(ids).size, ids.length, 'verify registry ids must be unique');
  assert(registrySource.includes("args: ['scripts/run-registered-verify-entry.mjs', id]"), 'registry helper args drifted');

  for (const [id, entryPath] of Object.entries(registry)) {
    const wrapperPath = path.join(projectRoot, 'scripts', `${id}.mjs`);
    const resolvedEntryPath = path.join(projectRoot, entryPath);
    assert.equal(fs.existsSync(wrapperPath), true, `wrapper missing for ${id}`);
    assert.equal(fs.existsSync(resolvedEntryPath), true, `entry missing for ${id}`);

    const wrapperSource = fs.readFileSync(wrapperPath, 'utf8');
    assert(wrapperSource.includes("runRegisteredVerifyEntry(import.meta.url"), `wrapper did not delegate to registry runner: ${id}`);
  }
}
