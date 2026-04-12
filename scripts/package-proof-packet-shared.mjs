import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { generateDistributionIndex } from './package-distribution-index.mjs';
import { getBundleAdvice } from './package-bundle-advice.mjs';

const archivePrefixes = {
  combined: [
    'intel-mac-live-browser-proof-',
    'verification-suite-report',
    'verification-suite-fast-smoke-',
    'verification-suite-fast-tail-smoke-',
    'verification-suite-latest-run',
  ],
  verifyStatus: [
    'verification-suite-report',
    'verification-suite-fast-smoke-',
    'verification-suite-fast-tail-smoke-',
    'verification-suite-latest-run',
  ],
  intelMacCloseout: [
    'intel-mac-live-browser-proof-',
  ],
};

export const proofPacketProfiles = {
  combined: {
    id: 'combined',
    bundleKind: 'proof-packet',
    fileLabel: 'proof-packet',
    title: 'Proof Packet',
    exactFiles: [
      'CURRENT_STATUS.md',
      'VERIFY_STATUS_2026-04-07.md',
      'VERIFY_STATUS_2026-04-10.md',
      'docs/VERIFY_LEAF_SUITES_2026-04-10.md',
      'docs/PACKAGE_CLASS_POLICY_2026-04-05.md',
      'docs/PACKAGE_HANDOFF_DOCTOR_2026-04-05.md',
      'docs/PACKAGE_DISTRIBUTION_SET_2026-04-10.md',
      'docs/PACKAGE_DISTRIBUTION_INDEX_2026-04-10.md',
      'docs/PACKAGE_PROOF_PACKET_SPLIT_2026-04-10.md',
      'docs/INTEL_MAC_LIVE_BROWSER_PROOF.md',
      'docs/handoff/FUTURE_NATIVE_SOURCE_ONLY_DISTRIBUTION.md',
      'docs/archive/package-integrity-report.json',
      'docs/archive/package-handoff-doctor.json',
      'docs/archive/package-handoff-doctor.partial.json',
      'docs/archive/package-handoff-doctor.source.json',
      'docs/archive/host-runtime-readiness.json',
      'docs/archive/live-browser-readiness.json',
      'docs/archive/dead-code-report.json',
      'docs/archive/closeout-report.json',
      'docs/archive/repo-status-current.json',
      'docs/archive/execution-surfaces-current.json',
      'docs/archive/core-portable-verification.json',
      'docs/archive/core-portable-verification.md',
      'docs/archive/phase5-real-export-readiness-report.json',
      'docs/archive/target-host-intel-mac-closeout.dry-run.json',
      'docs/archive/target-host-intel-mac-closeout.dry-run.md',
      'docs/archive/target-host-runtime-intel-mac.json',
      'docs/archive/target-live-browser-readiness-intel-mac.json',
      'docs/archive/phase-bcde-closeout-scorecard-current.json',
      'docs/archive/ux-closeout-current.json',
      'docs/archive/ux-implementation-boundary-current.json',
      'docs/archive/webgpu-capability-status-current.json',
      'docs/archive/webgpu-execution-mode-matrix-current.json',
    ],
    directoryPaths: ['docs/archive/verification-leaf-suites'],
    archivePrefixKey: 'combined',
    notes: [
      'proof-packet は status / verify / readiness / closeout / proof docs をまとめた軽量 handoff です。',
      'distribution index JSON / MD も同梱し、他 bundle の用途と参照先を proof 単体から追えるようにしています。',
      'source code と node_modules は含みません。',
      '実装再開は full-local-dev または source-only-clean を使い、proof-packet は監査・引き継ぎ参照に使います。',
    ],
  },
  verifyStatus: {
    id: 'verifyStatus',
    bundleKind: 'proof-packet-verify-status',
    fileLabel: 'proof-packet-verify-status',
    title: 'Proof Packet — Verify / Status',
    exactFiles: [
      'CURRENT_STATUS.md',
      'VERIFY_STATUS_2026-04-07.md',
      'VERIFY_STATUS_2026-04-10.md',
      'docs/VERIFY_LEAF_SUITES_2026-04-10.md',
      'docs/PACKAGE_CLASS_POLICY_2026-04-05.md',
      'docs/PACKAGE_HANDOFF_DOCTOR_2026-04-05.md',
      'docs/PACKAGE_DISTRIBUTION_SET_2026-04-10.md',
      'docs/PACKAGE_DISTRIBUTION_INDEX_2026-04-10.md',
      'docs/PACKAGE_PROOF_PACKET_SPLIT_2026-04-10.md',
      'docs/handoff/FUTURE_NATIVE_SOURCE_ONLY_DISTRIBUTION.md',
      'docs/archive/package-integrity-report.json',
      'docs/archive/package-handoff-doctor.json',
      'docs/archive/package-handoff-doctor.partial.json',
      'docs/archive/package-handoff-doctor.source.json',
      'docs/archive/host-runtime-readiness.json',
      'docs/archive/live-browser-readiness.json',
      'docs/archive/dead-code-report.json',
      'docs/archive/repo-status-current.json',
      'docs/archive/execution-surfaces-current.json',
      'docs/archive/core-portable-verification.json',
      'docs/archive/core-portable-verification.md',
      'docs/archive/phase5-real-export-readiness-report.json',
      'docs/archive/ux-implementation-boundary-current.json',
      'docs/archive/webgpu-capability-status-current.json',
      'docs/archive/webgpu-execution-mode-matrix-current.json',
    ],
    directoryPaths: ['docs/archive/verification-leaf-suites'],
    archivePrefixKey: 'verifyStatus',
    notes: [
      'proof-packet-verify-status は verify / status / readiness をまとめた軽量 handoff です。',
      'distribution index JSON / MD を同梱し、verify/status 専用 packet からも他 bundle の用途を確認できます。',
      'Intel Mac closeout 証跡は含まず、実装状態と検証結果の共有に絞ります。',
      'source code と node_modules は含みません。',
    ],
  },
  intelMacCloseout: {
    id: 'intelMacCloseout',
    bundleKind: 'proof-packet-intel-mac-closeout',
    fileLabel: 'proof-packet-intel-mac-closeout',
    title: 'Proof Packet — Intel Mac Closeout',
    exactFiles: [
      'docs/IMPLEMENTATION_PLAN_INTEL_MAC_PROOF_OPERATOR_PACKET_2026-04-09.md',
      'docs/INTEL_MAC_CLOSEOUT_OPERATOR_PACKET_2026-04-06.md',
      'docs/INTEL_MAC_INCOMING_ONE_SHOT_CURRENT.md',
      'docs/INTEL_MAC_LIVE_BROWSER_PROOF.md',
      'docs/INTEL_MAC_LIVE_BROWSER_PROOF_CURRENT.md',
      'docs/TARGET_HOST_INTEL_MAC_ONE_SHOT_CLOSEOUT_2026-04-06.md',
      'docs/TARGET_HOST_INTEL_MAC_READINESS_2026-04-06.md',
      'docs/PACKAGE_DISTRIBUTION_INDEX_2026-04-10.md',
      'docs/PACKAGE_PROOF_PACKET_SPLIT_2026-04-10.md',
      'docs/archive/closeout-report.json',
      'docs/archive/intel-mac-closeout-file-checklist_2026-04-06.json',
      'docs/archive/target-host-intel-mac-closeout.dry-run.json',
      'docs/archive/target-host-intel-mac-closeout.dry-run.md',
      'docs/archive/target-host-runtime-intel-mac.json',
      'docs/archive/target-live-browser-readiness-intel-mac.json',
      'docs/archive/phase-bcde-closeout-scorecard-current.json',
      'docs/archive/ux-closeout-current.json',
    ],
    directoryPaths: [],
    archivePrefixKey: 'intelMacCloseout',
    notes: [
      'proof-packet-intel-mac-closeout は Intel Mac target-host closeout と live-browser proof の証跡だけに絞った handoff です。',
      'distribution index JSON / MD を同梱し、closeout packet 単体からも他 bundle の用途を確認できます。',
      'verify / status 全体は含まず、実機 closeout の確認・採取・引き継ぎに使います。',
      'source code と node_modules は含みません。',
    ],
  },
};

function listArchivePrefixedFiles(rootDir, prefixKey) {
  const prefixes = archivePrefixes[prefixKey] ?? [];
  const archiveDir = path.resolve(rootDir, 'docs/archive');
  if (!fs.existsSync(archiveDir)) return [];
  return fs.readdirSync(archiveDir)
    .filter((name) => prefixes.some((prefix) => name.startsWith(prefix)))
    .map((name) => `docs/archive/${name}`)
    .sort();
}

function uniqueExistingFiles(rootDir, relativePaths) {
  return [...new Set(relativePaths)]
    .filter(Boolean)
    .filter((relativePath) => fs.existsSync(path.resolve(rootDir, relativePath)));
}

function walkFiles(rootDir, relativeDir) {
  const absoluteDir = path.resolve(rootDir, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  const out = [];
  const stack = [absoluteDir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolutePath);
        continue;
      }
      if (!entry.isFile()) continue;
      out.push(path.relative(rootDir, absolutePath));
    }
  }
  return out.sort();
}

function sha256(filePath) {
  return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

export function packageProofPacket(profileId) {
  const profile = proofPacketProfiles[profileId];
  if (!profile) {
    console.error(`[package-proof-packet] unknown profile: ${profileId}`);
    process.exit(2);
  }

  const rootDir = process.cwd();
  const projectName = path.basename(rootDir);
  const outDir = path.resolve(rootDir, '.artifacts');
  const stamp = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date());
  const outputPath = path.resolve(outDir, `${projectName}_${profile.fileLabel}_${stamp}.zip`);
  const manifestPath = path.resolve(outDir, `${projectName}_${profile.fileLabel}_${stamp}.manifest.json`);
  const manifestMdPath = path.resolve(outDir, `${projectName}_${profile.fileLabel}_${stamp}.manifest.md`);

  fs.mkdirSync(outDir, { recursive: true });
  fs.rmSync(outputPath, { force: true });
  fs.rmSync(manifestPath, { force: true });
  fs.rmSync(manifestMdPath, { force: true });

  const distributionIndex = generateDistributionIndex({ rootDir, outDir, stamp });
  const distributionIndexFiles = [
    path.relative(rootDir, distributionIndex.summaryPath),
    path.relative(rootDir, distributionIndex.summaryMdPath),
  ];

  const includedFiles = uniqueExistingFiles(rootDir, [
    ...profile.exactFiles,
    ...distributionIndexFiles,
    ...listArchivePrefixedFiles(rootDir, profile.archivePrefixKey),
    ...profile.directoryPaths.flatMap((relativeDir) => walkFiles(rootDir, relativeDir)),
  ]);

  if (includedFiles.length === 0) {
    console.error(`[package-proof-packet] no proof files found to package for ${profileId}.`);
    process.exit(1);
  }

  const parentDir = path.dirname(rootDir);
  const zipArgs = ['-rq', outputPath, ...includedFiles.map((relativePath) => `${projectName}/${relativePath}`)];
  const zipResult = spawnSync('zip', zipArgs, {
    cwd: parentDir,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 32,
  });
  if ((zipResult.status ?? 1) !== 0) {
    console.error(zipResult.stderr || zipResult.stdout || `${profile.fileLabel} zip packaging failed`);
    process.exit(zipResult.status ?? 1);
  }

  const stat = fs.statSync(outputPath);
  const topLevelBuckets = [...new Set(includedFiles.map((relativePath) => relativePath.split('/').slice(0, 2).join('/')))].sort();
  const quickAdvice = getBundleAdvice(profile.bundleKind);

  const manifest = {
    generatedAt: new Date().toISOString(),
    projectName,
    bundleKind: profile.bundleKind,
    profileId: profile.id,
    archivePath: path.relative(rootDir, outputPath),
    archiveSizeBytes: stat.size,
    archiveSha256: sha256(outputPath),
    includedFileCount: includedFiles.length,
    quickAdvice,
    includedFiles,
    topLevelBuckets,
    distributionIndex: {
      summaryPath: path.relative(rootDir, distributionIndex.summaryPath),
      summaryMdPath: path.relative(rootDir, distributionIndex.summaryMdPath),
      bundleCount: distributionIndex.summary.bundleCount,
    },
    notes: profile.notes,
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  const markdown = [
    `# ${profile.title}`,
    '',
    '## quick advice',
    `- audience: ${manifest.quickAdvice.audience}`,
    `- chooseThisWhen: ${manifest.quickAdvice.chooseThisWhen}`,
    `- preferInstead: ${manifest.quickAdvice.preferInstead}`,
    '',
    `- generatedAt: ${manifest.generatedAt}`,
    `- archivePath: \`${manifest.archivePath}\``,
    `- archiveSizeBytes: ${manifest.archiveSizeBytes}`,
    `- archiveSha256: \`${manifest.archiveSha256}\``,
    `- includedFileCount: ${manifest.includedFileCount}`,
    `- distributionIndex.summaryPath: \`${manifest.distributionIndex.summaryPath}\``,
    `- distributionIndex.summaryMdPath: \`${manifest.distributionIndex.summaryMdPath}\``,
    `- distributionIndex.bundleCount: ${manifest.distributionIndex.bundleCount}`,
    '',
    '## top-level buckets',
    ...manifest.topLevelBuckets.map((entry) => `- \`${entry}\``),
    '',
    '## included files',
    ...manifest.includedFiles.map((entry) => `- \`${entry}\``),
    '',
    '## notes',
    ...manifest.notes.map((entry) => `- ${entry}`),
  ].join('\n');
  fs.writeFileSync(manifestMdPath, `${markdown}\n`, 'utf8');

  console.log(outputPath);
}
