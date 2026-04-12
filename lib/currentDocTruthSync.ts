type RatioSummary = { passed?: number | null; total?: number | null } | null | undefined;

export interface CurrentDocTruthSyncCheck {
  id: string;
  label: string;
  markdownValue: string | null;
  sourceValue: string;
  ok: boolean;
}

export interface CurrentDocTruthSyncFileReport {
  markdownPath: string;
  jsonPath: string;
  mismatchCount: number;
  checks: CurrentDocTruthSyncCheck[];
}

export interface CurrentDocTruthSyncReport {
  generatedAt: string;
  summary: {
    fileCount: number;
    totalCheckCount: number;
    mismatchCount: number;
    ok: boolean;
  };
  files: {
    repoStatusCurrent: CurrentDocTruthSyncFileReport;
    executionSurfacesCurrent: CurrentDocTruthSyncFileReport;
  };
}

function formatDisplayValue(value: string | null) {
  return value ?? 'missing';
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function extractMarkdownStrongValue(markdown: string, label: string) {
  const pattern = new RegExp(`^-\\s+${escapeRegExp(label)}:\\s+\\*\\*(.+?)\\*\\*$`, 'mu');
  const match = markdown.match(pattern);
  return match?.[1]?.trim() ?? null;
}

function toRatio(value: RatioSummary) {
  return `${value?.passed ?? 'n/a'}/${value?.total ?? 'n/a'}`;
}

function createCheck(id: string, label: string, markdownValue: string | null, sourceValue: string): CurrentDocTruthSyncCheck {
  return {
    id,
    label,
    markdownValue,
    sourceValue,
    ok: markdownValue === sourceValue,
  };
}

type RepoStatusSource = {
  generatedAt?: string;
  packageIntegrity?: RatioSummary;
  hostRuntime?: RatioSummary;
  liveBrowserReadiness?: RatioSummary;
  deadCode?: {
    orphanModuleCount?: number | null;
    applicationCandidateCount?: number | null;
    devOnlyCandidateCount?: number | null;
    barrelOnlyCandidateCount?: number | null;
  } | null;
};

type ExecutionSurfacesSource = {
  statusSyncArtifacts?: unknown[];
  realMachineProof?: {
    blockers?: unknown[];
    status?: {
      dropPassed?: number | null;
      dropTotal?: number | null;
      targetPassed?: number | null;
      targetTotal?: number | null;
    } | null;
  } | null;
  implementedVisibility?: {
    audio?: {
      legacyFinalCloseout?: { ready?: string | null } | null;
      closeoutPacket?: { status?: string | null } | null;
    } | null;
    futureNative?: {
      expressionCoverage?: {
        totalFamilies?: number | null;
        independentCount?: number | null;
      } | null;
    } | null;
  } | null;
};

export function buildCurrentDocTruthSyncReport(args: {
  executionSurfacesMarkdown: string;
  executionSurfacesMarkdownPath: string;
  executionSurfacesSource: ExecutionSurfacesSource;
  executionSurfacesSourcePath: string;
  repoStatusMarkdown: string;
  repoStatusMarkdownPath: string;
  repoStatusSource: RepoStatusSource;
  repoStatusSourcePath: string;
}): CurrentDocTruthSyncReport {
  const repoChecks: CurrentDocTruthSyncCheck[] = [
    createCheck(
      'repo-status-date',
      '# Repo Status Current',
      args.repoStatusMarkdown.match(/^# Repo Status Current \((.+?)\)$/mu)?.[1]?.trim() ?? null,
      String(args.repoStatusSource.generatedAt ?? '').slice(0, 10),
    ),
    createCheck('repo-package-integrity', 'package integrity', extractMarkdownStrongValue(args.repoStatusMarkdown, 'package integrity'), toRatio(args.repoStatusSource.packageIntegrity)),
    createCheck('repo-host-runtime', 'host runtime', extractMarkdownStrongValue(args.repoStatusMarkdown, 'host runtime'), toRatio(args.repoStatusSource.hostRuntime)),
    createCheck('repo-live-browser', 'live browser readiness', extractMarkdownStrongValue(args.repoStatusMarkdown, 'live browser readiness'), toRatio(args.repoStatusSource.liveBrowserReadiness)),
    createCheck('repo-orphan-modules', 'orphan modules', extractMarkdownStrongValue(args.repoStatusMarkdown, 'orphan modules'), String(args.repoStatusSource.deadCode?.orphanModuleCount ?? 'n/a')),
    createCheck('repo-app-candidates', 'runtime-facing application candidates', extractMarkdownStrongValue(args.repoStatusMarkdown, 'runtime-facing application candidates'), String(args.repoStatusSource.deadCode?.applicationCandidateCount ?? 'n/a')),
    createCheck('repo-dev-only', 'dev-only candidates', extractMarkdownStrongValue(args.repoStatusMarkdown, 'dev-only candidates'), String(args.repoStatusSource.deadCode?.devOnlyCandidateCount ?? 'n/a')),
    createCheck('repo-barrel-only', 'barrel-only candidates', extractMarkdownStrongValue(args.repoStatusMarkdown, 'barrel-only candidates'), String(args.repoStatusSource.deadCode?.barrelOnlyCandidateCount ?? 'n/a')),
  ];

  const executionChecks: CurrentDocTruthSyncCheck[] = [
    createCheck('execution-refreshed-artifacts', 'refreshed artifacts', extractMarkdownStrongValue(args.executionSurfacesMarkdown, 'refreshed artifacts'), String(args.executionSurfacesSource.statusSyncArtifacts?.length ?? 0)),
    createCheck(
      'execution-audio-closeout-ready',
      'audio legacy final closeout',
      extractMarkdownStrongValue(args.executionSurfacesMarkdown, 'audio legacy final closeout'),
      String(args.executionSurfacesSource.implementedVisibility?.audio?.legacyFinalCloseout?.ready ?? 'n/a'),
    ),
    createCheck(
      'execution-audio-packet-status',
      'audio legacy packet status',
      extractMarkdownStrongValue(args.executionSurfacesMarkdown, 'audio legacy packet status'),
      String(args.executionSurfacesSource.implementedVisibility?.audio?.closeoutPacket?.status ?? 'n/a'),
    ),
    createCheck(
      'execution-future-native-families',
      'future-native families',
      extractMarkdownStrongValue(args.executionSurfacesMarkdown, 'future-native families'),
      String(args.executionSurfacesSource.implementedVisibility?.futureNative?.expressionCoverage?.totalFamilies ?? 'n/a'),
    ),
    createCheck(
      'execution-future-native-independent',
      'future-native independent families',
      extractMarkdownStrongValue(args.executionSurfacesMarkdown, 'future-native independent families'),
      String(args.executionSurfacesSource.implementedVisibility?.futureNative?.expressionCoverage?.independentCount ?? 'n/a'),
    ),
    createCheck(
      'execution-intel-drop',
      'Intel Mac drop intake',
      extractMarkdownStrongValue(args.executionSurfacesMarkdown, 'Intel Mac drop intake'),
      `${args.executionSurfacesSource.realMachineProof?.status?.dropPassed ?? 'n/a'}/${args.executionSurfacesSource.realMachineProof?.status?.dropTotal ?? 'n/a'}`,
    ),
    createCheck(
      'execution-intel-target',
      'Intel Mac target readiness',
      extractMarkdownStrongValue(args.executionSurfacesMarkdown, 'Intel Mac target readiness'),
      `${args.executionSurfacesSource.realMachineProof?.status?.targetPassed ?? 'n/a'}/${args.executionSurfacesSource.realMachineProof?.status?.targetTotal ?? 'n/a'}`,
    ),
    createCheck(
      'execution-proof-blockers',
      'proof blockers',
      extractMarkdownStrongValue(args.executionSurfacesMarkdown, 'proof blockers'),
      String(args.executionSurfacesSource.realMachineProof?.blockers?.length ?? 0),
    ),
  ];

  const repoStatusCurrent: CurrentDocTruthSyncFileReport = {
    markdownPath: args.repoStatusMarkdownPath,
    jsonPath: args.repoStatusSourcePath,
    mismatchCount: repoChecks.filter((check) => !check.ok).length,
    checks: repoChecks,
  };

  const executionSurfacesCurrent: CurrentDocTruthSyncFileReport = {
    markdownPath: args.executionSurfacesMarkdownPath,
    jsonPath: args.executionSurfacesSourcePath,
    mismatchCount: executionChecks.filter((check) => !check.ok).length,
    checks: executionChecks,
  };

  const totalCheckCount = repoChecks.length + executionChecks.length;
  const mismatchCount = repoStatusCurrent.mismatchCount + executionSurfacesCurrent.mismatchCount;

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      fileCount: 2,
      totalCheckCount,
      mismatchCount,
      ok: mismatchCount === 0,
    },
    files: {
      repoStatusCurrent,
      executionSurfacesCurrent,
    },
  };
}

export function renderCurrentDocTruthSyncMarkdown(report: CurrentDocTruthSyncReport): string {
  const stamp = report.generatedAt.slice(0, 10);
  const renderFileSection = (title: string, fileReport: CurrentDocTruthSyncFileReport) => {
    const mismatches = fileReport.checks.filter((check) => !check.ok);
    const matchedCount = fileReport.checks.length - mismatches.length;

    return [
      `## ${title}`,
      `- markdown: \`${fileReport.markdownPath}\``,
      `- source json: \`${fileReport.jsonPath}\``,
      `- matched checks: **${matchedCount}/${fileReport.checks.length}**`,
      `- mismatch count: **${fileReport.mismatchCount}**`,
      mismatches.length === 0
        ? '- mismatches: none'
        : mismatches.map((check) => `- ${check.label}: markdown **${formatDisplayValue(check.markdownValue)}** / source **${check.sourceValue}**`).join('\n'),
    ].join('\n');
  };

  return `# Truth Sync Closeout Current (${stamp})

## Summary
- file count: **${report.summary.fileCount}**
- total checks: **${report.summary.totalCheckCount}**
- mismatch count: **${report.summary.mismatchCount}**
- overall status: **${report.summary.ok ? 'ok' : 'mismatch-detected'}**

${renderFileSection('Repo Status Current', report.files.repoStatusCurrent)}

${renderFileSection('Execution Surfaces Current', report.files.executionSurfacesCurrent)}
`;
}
