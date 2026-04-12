import assert from 'node:assert/strict';
import {
  buildCurrentDocTruthSyncReport,
  renderCurrentDocTruthSyncMarkdown,
} from '../../lib/currentDocTruthSync';

export async function main() {
  const repoStatusMarkdown = `# Repo Status Current (2026-04-11)

## Verify / status
- package integrity: **30/30**
- host runtime: **2/2**
- live browser readiness: **6/6**

## Dead code
- orphan modules: **126**
- runtime-facing application candidates: **0**
- dev-only candidates: **11**
- barrel-only candidates: **3**
`;

  const executionSurfacesMarkdown = `# Execution Surfaces Current

## 2. 状態文書の同期
- refreshed artifacts: **13**

## 3. 実機証跡の固定
- Intel Mac drop intake: **6/11**
- Intel Mac target readiness: **5/6**
- proof blockers: **6**

## 4. 仕上げ UX の closeout
- audio legacy final closeout: **ready**
- audio legacy packet status: **proof-required**
- future-native families: **22**
- future-native independent families: **22**
`;

  const report = buildCurrentDocTruthSyncReport({
    repoStatusMarkdown,
    repoStatusMarkdownPath: 'docs/REPO_STATUS_CURRENT.md',
    repoStatusSourcePath: 'docs/archive/repo-status-current.json',
    repoStatusSource: {
      generatedAt: '2026-04-11T00:00:00.000Z',
      packageIntegrity: { passed: 30, total: 30 },
      hostRuntime: { passed: 2, total: 2 },
      liveBrowserReadiness: { passed: 6, total: 6 },
      deadCode: {
        orphanModuleCount: 126,
        applicationCandidateCount: 0,
        devOnlyCandidateCount: 11,
        barrelOnlyCandidateCount: 3,
      },
    },
    executionSurfacesMarkdown,
    executionSurfacesMarkdownPath: 'docs/EXECUTION_SURFACES_CURRENT.md',
    executionSurfacesSourcePath: 'docs/archive/execution-surfaces-current.json',
    executionSurfacesSource: {
      statusSyncArtifacts: new Array(13).fill('artifact'),
      realMachineProof: {
        blockers: new Array(6).fill('blocker'),
        status: {
          dropPassed: 6,
          dropTotal: 11,
          targetPassed: 5,
          targetTotal: 6,
        },
      },
      implementedVisibility: {
        audio: {
          legacyFinalCloseout: { ready: 'ready' },
          closeoutPacket: { status: 'proof-required' },
        },
        futureNative: {
          expressionCoverage: {
            totalFamilies: 22,
            independentCount: 22,
          },
        },
      },
    },
  });

  assert.equal(report.summary.mismatchCount, 0);
  assert.equal(report.summary.ok, true);
  assert.equal(report.files.repoStatusCurrent.mismatchCount, 0);
  assert.equal(report.files.executionSurfacesCurrent.mismatchCount, 0);

  const mismatchReport = buildCurrentDocTruthSyncReport({
    repoStatusMarkdown: repoStatusMarkdown.replace('30/30', '29/30'),
    repoStatusMarkdownPath: 'docs/REPO_STATUS_CURRENT.md',
    repoStatusSourcePath: 'docs/archive/repo-status-current.json',
    repoStatusSource: {
      generatedAt: '2026-04-11T00:00:00.000Z',
      packageIntegrity: { passed: 30, total: 30 },
      hostRuntime: { passed: 2, total: 2 },
      liveBrowserReadiness: { passed: 6, total: 6 },
      deadCode: {
        orphanModuleCount: 126,
        applicationCandidateCount: 0,
        devOnlyCandidateCount: 11,
        barrelOnlyCandidateCount: 3,
      },
    },
    executionSurfacesMarkdown,
    executionSurfacesMarkdownPath: 'docs/EXECUTION_SURFACES_CURRENT.md',
    executionSurfacesSourcePath: 'docs/archive/execution-surfaces-current.json',
    executionSurfacesSource: {
      statusSyncArtifacts: new Array(13).fill('artifact'),
      realMachineProof: {
        blockers: new Array(6).fill('blocker'),
        status: {
          dropPassed: 6,
          dropTotal: 11,
          targetPassed: 5,
          targetTotal: 6,
        },
      },
      implementedVisibility: {
        audio: {
          legacyFinalCloseout: { ready: 'ready' },
          closeoutPacket: { status: 'proof-required' },
        },
        futureNative: {
          expressionCoverage: {
            totalFamilies: 22,
            independentCount: 22,
          },
        },
      },
    },
  });

  assert.equal(mismatchReport.summary.ok, false);
  assert.equal(mismatchReport.summary.mismatchCount, 1);
  assert.equal(mismatchReport.files.repoStatusCurrent.mismatchCount, 1);
  assert.equal(mismatchReport.files.repoStatusCurrent.checks.find((check) => check.id === 'repo-package-integrity')?.ok, false);

  const markdown = renderCurrentDocTruthSyncMarkdown(mismatchReport);
  assert.match(markdown, /mismatch-detected/);
  assert.match(markdown, /package integrity: markdown \*\*29\/30\*\* \/ source \*\*30\/30\*\*/);

  console.log('currentDocTruthSync ok');
}
