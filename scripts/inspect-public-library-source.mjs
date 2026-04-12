import path from 'node:path';
import {
  DEFAULT_PUBLIC_LIBRARY_PROVENANCE_PATH,
  createPublicLibrarySourceSummary,
  extractPublicLibrarySourceMeta,
  pathExists,
  readLibraryFile,
  readOrCreatePublicLibraryProvenanceFile,
} from './public-library-shared.mjs';

const workspaceRoot = process.cwd();
const provenancePath = path.resolve(workspaceRoot, process.argv[2] ?? DEFAULT_PUBLIC_LIBRARY_PROVENANCE_PATH);

async function main() {
  const provenance = await readOrCreatePublicLibraryProvenanceFile(provenancePath);
  const canonicalSourcePath = path.resolve(workspaceRoot, provenance.canonicalSourcePath);
  const bundledTargetPath = path.resolve(workspaceRoot, provenance.bundledTargetPath);
  const canonicalSourceExists = await pathExists(canonicalSourcePath);
  const bundledTargetExists = await pathExists(bundledTargetPath);
  const canonicalSourceParsed = canonicalSourceExists ? await readLibraryFile(canonicalSourcePath) : null;
  const sourceEmbeddedProvenance = canonicalSourceParsed ? extractPublicLibrarySourceMeta(canonicalSourceParsed) : null;

  console.log(JSON.stringify({
    ...createPublicLibrarySourceSummary(provenance, workspaceRoot, { provenancePath }),
    canonicalSourceExists,
    bundledTargetExists,
    canonicalSourceEmbeddedProvenancePresent: sourceEmbeddedProvenance !== null,
    canonicalSourceEmbeddedProvenance: sourceEmbeddedProvenance,
    note: 'This command inspects the fixed canonical source location for public-library sync. It does not mutate any file.',
    recommendedActionWhenMissing: provenance.canonicalSourceBootstrapPolicy === 'bootstrap-from-bundled-target'
      ? 'Run npm run bootstrap:public-library-source to seed the canonical source from the bundled target.'
      : 'Copy the private export JSON into the canonical source path manually.',
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
