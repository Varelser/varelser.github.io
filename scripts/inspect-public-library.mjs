import path from 'node:path';
import {
  DEFAULT_PUBLIC_LIBRARY_PROVENANCE_PATH,
  createLibrarySummary,
  pathExists,
  readNormalizedLibraryFile,
  readOrCreatePublicLibraryProvenanceFile,
} from './public-library-shared.mjs';

const workspaceRoot = process.cwd();
const targetPath = path.resolve(workspaceRoot, process.argv[2] ?? 'public-library.json');
const provenancePath = path.resolve(workspaceRoot, DEFAULT_PUBLIC_LIBRARY_PROVENANCE_PATH);

async function main() {
  const normalized = await readNormalizedLibraryFile(targetPath);
  const provenance = await readOrCreatePublicLibraryProvenanceFile(provenancePath);
  const canonicalSourcePath = path.resolve(workspaceRoot, provenance.canonicalSourcePath);

  console.log(JSON.stringify({
    ...createLibrarySummary(normalized, path.relative(workspaceRoot, targetPath)),
    provenanceFile: path.relative(workspaceRoot, provenancePath),
    canonicalSourcePath: path.relative(workspaceRoot, canonicalSourcePath),
    canonicalSourceExists: await pathExists(canonicalSourcePath),
    lastSync: provenance.lastSync,
    note: 'This command inspects the bundled public preset seed. It does not mutate the file.',
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
