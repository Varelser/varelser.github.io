import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  DEFAULT_PUBLIC_LIBRARY_PROVENANCE_PATH,
  computeFileSha256,
  createDefaultPublicLibrarySourceMeta,
  createLibrarySummary,
  normalizeLibraryPayload,
  pathExists,
  readLibraryFile,
  readOrCreatePublicLibraryProvenanceFile,
  writeCanonicalSourceLibraryFile,
  writePublicLibraryProvenanceFile,
} from './public-library-shared.mjs';

function printUsage() {
  console.log('Usage: npm run bootstrap:public-library-source -- [target-source-json]');
  console.log('If target-source-json is omitted, the command writes to the canonical source path recorded in public-library.provenance.json.');
}

export async function runBootstrapPublicLibrarySourceCli(argv = process.argv.slice(2)) {
  const [targetArg] = argv;
  const workspaceRoot = process.cwd();
  const provenancePath = path.resolve(workspaceRoot, DEFAULT_PUBLIC_LIBRARY_PROVENANCE_PATH);
  const provenance = await readOrCreatePublicLibraryProvenanceFile(provenancePath);
  const bundledTargetPath = path.resolve(workspaceRoot, provenance.bundledTargetPath);
  const targetSourcePath = path.resolve(workspaceRoot, targetArg ?? provenance.canonicalSourcePath);

  if (!(await pathExists(bundledTargetPath))) {
    printUsage();
    throw new Error([
      `Bundled target was not found: ${path.relative(workspaceRoot, bundledTargetPath)}`,
      'Run npm run sync:public-library with an explicit source file first, or restore public-library.json before bootstrapping.',
    ].join('\n'));
  }

  const parsed = await readLibraryFile(bundledTargetPath);
  const payload = normalizeLibraryPayload(parsed);
  const sourceEmbeddedProvenance = createDefaultPublicLibrarySourceMeta({
    sourceKind: 'canonical-bootstrap',
    exportOrigin: 'bootstrap-from-bundled-target',
    exportTool: 'npm run bootstrap:public-library-source',
    exportedAt: new Date().toISOString(),
    notes: [
      'Bootstrapped from the bundled public-library.json target.',
      'Replace this file with a private export when a fresher canonical source is available.',
    ],
  });
  await writeCanonicalSourceLibraryFile(targetSourcePath, payload, sourceEmbeddedProvenance);

  const relativeBundledTargetPath = path.relative(workspaceRoot, bundledTargetPath);
  const relativeTargetSourcePath = path.relative(workspaceRoot, targetSourcePath);
  const updatedProvenance = await writePublicLibraryProvenanceFile(provenancePath, {
    ...provenance,
    bundledTargetPath: relativeBundledTargetPath,
    lastSync: {
      sourcePath: relativeTargetSourcePath,
      targetPath: relativeBundledTargetPath,
      syncedAt: new Date().toISOString(),
      sourceSha256: await computeFileSha256(targetSourcePath),
      targetSha256: await computeFileSha256(bundledTargetPath),
      sourceMatchedCanonical: path.resolve(targetSourcePath) === path.resolve(workspaceRoot, provenance.canonicalSourcePath),
      sourceEmbeddedProvenancePresent: true,
      sourceEmbeddedProvenance,
    },
  });

  console.log(JSON.stringify({
    action: 'bootstrap-public-library-source',
    source: relativeBundledTargetPath,
    targetSourcePath: relativeTargetSourcePath,
    canonicalSourcePath: updatedProvenance.canonicalSourcePath,
    sourceMatchedCanonical: updatedProvenance.lastSync?.sourceMatchedCanonical ?? false,
    sourceEmbeddedProvenancePresent: true,
    provenanceFile: path.relative(workspaceRoot, provenancePath),
    ...createLibrarySummary(payload, relativeTargetSourcePath),
  }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runBootstrapPublicLibrarySourceCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
