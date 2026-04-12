import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getBundleAdvice } from './package-bundle-advice.mjs';

const PREFERRED_ORDER = [
  'full-local-dev',
  'source-only-clean',
  'proof-packet-verify-status',
  'proof-packet-intel-mac-closeout',
  'proof-packet',
  'platform-specific-runtime-bundled',
];

function classifyBundle(manifest, filename) {
  let id = path.basename(filename, '.manifest.json');
  let classId = 'unknown';

  if (manifest.bundleKind === 'proof-packet-verify-status') {
    id = 'proof-packet-verify-status';
    classId = 'verify-status';
  } else if (manifest.bundleKind === 'proof-packet-intel-mac-closeout') {
    id = 'proof-packet-intel-mac-closeout';
    classId = 'intel-mac-closeout';
  } else if (manifest.bundleKind === 'proof-packet') {
    id = 'proof-packet';
    classId = 'proof-combined';
  } else if (manifest.packageClass === 'source-only') {
    id = 'source-only-clean';
    classId = 'source-only';
  } else if (manifest.packageClass === 'full-local-dev') {
    id = 'full-local-dev';
    classId = 'full-local-dev';
  } else if (manifest.packageClass === 'platform-specific-runtime-bundled') {
    id = 'platform-specific-runtime-bundled';
    classId = 'partial-full';
  }

  const advice = getBundleAdvice(id);
  return {
    id,
    classId,
    recommendedUse: advice.recommendedUse,
    requiresBootstrap: advice.requiresBootstrap,
    quickAdvice: {
      audience: advice.audience,
      chooseThisWhen: advice.chooseThisWhen,
      preferInstead: advice.preferInstead,
    },
  };
}

function expectedBundleDescriptors(projectName, stamp) {
  return [
    {
      id: 'full-local-dev',
      classId: 'full-local-dev',
      category: 'resume',
      packageClass: 'full-local-dev',
      bundleKind: null,
      command: 'npm run package:full-zip',
      expectedManifestName: `${projectName}_full-local-dev_${stamp}.manifest.json`,
      expectedArchiveName: `${projectName}_full-local-dev_${stamp}.zip`,
    },
    {
      id: 'source-only-clean',
      classId: 'source-only',
      category: 'resume',
      packageClass: 'source-only',
      bundleKind: null,
      command: 'npm run package:source-only-clean',
      expectedManifestName: `${projectName}_source-only_${stamp}.manifest.json`,
      expectedArchiveName: `${projectName}_source-only_${stamp}.zip`,
    },
    {
      id: 'proof-packet-verify-status',
      classId: 'verify-status',
      category: 'proof',
      packageClass: null,
      bundleKind: 'proof-packet-verify-status',
      command: 'npm run package:proof-packet:verify-status',
      expectedManifestName: `${projectName}_proof-packet-verify-status_${stamp}.manifest.json`,
      expectedArchiveName: `${projectName}_proof-packet-verify-status_${stamp}.zip`,
    },
    {
      id: 'proof-packet-intel-mac-closeout',
      classId: 'intel-mac-closeout',
      category: 'proof',
      packageClass: null,
      bundleKind: 'proof-packet-intel-mac-closeout',
      command: 'npm run package:proof-packet:intel-mac-closeout',
      expectedManifestName: `${projectName}_proof-packet-intel-mac-closeout_${stamp}.manifest.json`,
      expectedArchiveName: `${projectName}_proof-packet-intel-mac-closeout_${stamp}.zip`,
    },
    {
      id: 'proof-packet',
      classId: 'proof-combined',
      category: 'proof',
      packageClass: null,
      bundleKind: 'proof-packet',
      command: 'npm run package:proof-packet',
      expectedManifestName: `${projectName}_proof-packet_${stamp}.manifest.json`,
      expectedArchiveName: `${projectName}_proof-packet_${stamp}.zip`,
    },
    {
      id: 'platform-specific-runtime-bundled',
      classId: 'partial-full',
      category: 'resume',
      packageClass: 'platform-specific-runtime-bundled',
      bundleKind: null,
      command: 'npm run package:full-zip -- --allow-partial',
      expectedManifestName: `${projectName}_platform-specific-runtime-bundled_${stamp}.manifest.json`,
      expectedArchiveName: `${projectName}_platform-specific-runtime-bundled_${stamp}.zip`,
    },
  ];
}

export function collectDistributionIndex(options = {}) {
  const rootDir = options.rootDir ? path.resolve(options.rootDir) : process.cwd();
  const outDir = options.outDir
    ? (path.isAbsolute(options.outDir) ? options.outDir : path.resolve(rootDir, options.outDir))
    : path.resolve(rootDir, '.artifacts');
  const stamp = options.stamp ?? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date());
  const summaryPath = path.resolve(outDir, `distribution-index_${stamp}.json`);
  const summaryMdPath = path.resolve(outDir, `distribution-index_${stamp}.md`);
  fs.mkdirSync(outDir, { recursive: true });

  const projectName = path.basename(rootDir);
  const descriptors = expectedBundleDescriptors(projectName, stamp);
  const fullBundleExists = fs.existsSync(path.resolve(outDir, `${projectName}_full-local-dev_${stamp}.manifest.json`));

  const bundles = descriptors.map((descriptor) => {
    const manifestPath = path.resolve(outDir, descriptor.expectedManifestName);
    if (!fs.existsSync(manifestPath)) {
      const advice = getBundleAdvice(descriptor.id);
      const superseded = descriptor.id === 'platform-specific-runtime-bundled' && fullBundleExists;
      return {
        id: descriptor.id,
        classId: descriptor.classId,
        category: descriptor.category,
        packageClass: descriptor.packageClass,
        bundleKind: descriptor.bundleKind,
        status: superseded ? 'superseded' : 'missing-manifest',
        supersededBy: superseded ? 'full-local-dev' : null,
        archivePath: null,
        archiveSizeBytes: null,
        manifestPath: null,
        requiresBootstrap: advice.requiresBootstrap,
        quickAdvice: {
          audience: advice.audience,
          chooseThisWhen: advice.chooseThisWhen,
          preferInstead: advice.preferInstead,
        },
        recommendedUse: advice.recommendedUse,
        command: descriptor.command,
      };
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const info = classifyBundle(manifest, descriptor.expectedManifestName);
    const archivePath = manifest.archivePath ?? manifest.outputPath ?? null;
    const archiveAbsolutePath = archivePath ? path.resolve(rootDir, archivePath) : null;
    const archiveExists = archiveAbsolutePath ? fs.existsSync(archiveAbsolutePath) : false;
    return {
      id: info.id,
      classId: info.classId,
      category: descriptor.category,
      packageClass: manifest.packageClass ?? descriptor.packageClass,
      bundleKind: manifest.bundleKind ?? descriptor.bundleKind,
      status: archiveExists ? 'available' : 'missing-archive',
      supersededBy: null,
      archivePath,
      archiveSizeBytes: archiveExists ? fs.statSync(archiveAbsolutePath).size : (manifest.archiveSizeBytes ?? manifest.sizeBytes ?? null),
      manifestPath: path.relative(rootDir, manifestPath),
      requiresBootstrap: info.requiresBootstrap || Boolean(manifest.recoveryPlan?.requiresBootstrap),
      quickAdvice: info.quickAdvice,
      recommendedUse: info.recommendedUse,
      command: descriptor.command,
    };
  }).sort((a, b) => PREFERRED_ORDER.indexOf(a.id) - PREFERRED_ORDER.indexOf(b.id));

  const summary = {
    generatedAt: new Date().toISOString(),
    projectName,
    bundleCount: bundles.length,
    availableBundleCount: bundles.filter((entry) => entry.status === 'available').length,
    satisfiedBundleCount: bundles.filter((entry) => entry.status === 'available' || entry.status === 'superseded').length,
    supersededBundleCount: bundles.filter((entry) => entry.status === 'superseded').length,
    unsatisfiedBundleCount: bundles.filter((entry) => entry.status === 'missing-manifest' || entry.status === 'missing-archive').length,
    bundles,
    quickAdvice: {
      immediateResume: bundles.find((entry) => entry.id === 'full-local-dev' && entry.status === 'available')?.archivePath ?? null,
      lightweightHandoff: bundles.find((entry) => entry.id === 'source-only-clean' && entry.status === 'available')?.archivePath ?? null,
      verifyStatusOnly: bundles.find((entry) => entry.id === 'proof-packet-verify-status' && entry.status === 'available')?.archivePath ?? null,
      intelMacCloseoutOnly: bundles.find((entry) => entry.id === 'proof-packet-intel-mac-closeout' && entry.status === 'available')?.archivePath ?? null,
    },
  };

  return { rootDir, outDir, stamp, summaryPath, summaryMdPath, summary };
}

export function generateDistributionIndex(options = {}) {
  const result = collectDistributionIndex(options);
  fs.writeFileSync(result.summaryPath, `${JSON.stringify(result.summary, null, 2)}\n`, 'utf8');
  const markdown = [
    '# Distribution Bundle Index',
    '',
    `- generatedAt: ${result.summary.generatedAt}`,
    `- projectName: ${result.summary.projectName}`,
    `- bundleCount: ${result.summary.bundleCount}`,
    `- availableBundleCount: ${result.summary.availableBundleCount}`,
    `- satisfiedBundleCount: ${result.summary.satisfiedBundleCount}`,
    `- supersededBundleCount: ${result.summary.supersededBundleCount}`,
    `- unsatisfiedBundleCount: ${result.summary.unsatisfiedBundleCount}`,
    '',
    '## quick advice',
    `- immediateResume: ${result.summary.quickAdvice.immediateResume ? `\`${result.summary.quickAdvice.immediateResume}\`` : 'none'}`,
    `- lightweightHandoff: ${result.summary.quickAdvice.lightweightHandoff ? `\`${result.summary.quickAdvice.lightweightHandoff}\`` : 'none'}`,
    `- verifyStatusOnly: ${result.summary.quickAdvice.verifyStatusOnly ? `\`${result.summary.quickAdvice.verifyStatusOnly}\`` : 'none'}`,
    `- intelMacCloseoutOnly: ${result.summary.quickAdvice.intelMacCloseoutOnly ? `\`${result.summary.quickAdvice.intelMacCloseoutOnly}\`` : 'none'}`,
    '',
    '## bundles',
    ...result.summary.bundles.flatMap((entry) => [
      `- ${entry.id}`,
      `  - status: ${entry.status}`,
      `  - category: ${entry.category}`,
      `  - classId: ${entry.classId}`,
      `  - packageClass: ${entry.packageClass ?? 'n/a'}`,
      `  - bundleKind: ${entry.bundleKind ?? 'n/a'}`,
      `  - supersededBy: ${entry.supersededBy ?? 'n/a'}`,
      `  - archivePath: ${entry.archivePath ? `\`${entry.archivePath}\`` : 'missing'}`,
      `  - archiveSizeBytes: ${entry.archiveSizeBytes ?? 'n/a'}`,
      `  - manifestPath: ${entry.manifestPath ? `\`${entry.manifestPath}\`` : 'missing'}`,
      `  - requiresBootstrap: ${entry.requiresBootstrap}`,
      `  - audience: ${entry.quickAdvice.audience}`,
      `  - chooseThisWhen: ${entry.quickAdvice.chooseThisWhen}`,
      `  - preferInstead: ${entry.quickAdvice.preferInstead}`,
      `  - command: ${entry.command}`,
      `  - recommendedUse: ${entry.recommendedUse}`,
    ]),
  ].join('\n');
  fs.writeFileSync(result.summaryMdPath, `${markdown}\n`, 'utf8');
  return result;
}

const currentScriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentScriptPath) {
  const result = generateDistributionIndex();
  console.log(result.summaryPath);
}
