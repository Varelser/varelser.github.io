import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildCurrentDocTruthSyncReport,
  renderCurrentDocTruthSyncMarkdown,
} from '../lib/currentDocTruthSync';

function getArgValue(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] ?? null : null;
}

export async function main() {
  const repoStatusMarkdownPath = path.resolve(getArgValue('--repo-status-markdown') ?? 'docs/REPO_STATUS_CURRENT.md');
  const repoStatusSourcePath = path.resolve(getArgValue('--repo-status-json') ?? 'docs/archive/repo-status-current.json');
  const executionSurfacesMarkdownPath = path.resolve(getArgValue('--execution-surfaces-markdown') ?? 'docs/EXECUTION_SURFACES_CURRENT.md');
  const executionSurfacesSourcePath = path.resolve(getArgValue('--execution-surfaces-json') ?? 'docs/archive/execution-surfaces-current.json');
  const outputJsonPath = path.resolve(getArgValue('--write-json') ?? 'docs/archive/truth-sync-closeout-current.json');
  const outputMarkdownPath = path.resolve(getArgValue('--write-markdown') ?? 'docs/TRUTH_SYNC_CLOSEOUT_CURRENT.md');

  const report = buildCurrentDocTruthSyncReport({
    repoStatusMarkdown: readFileSync(repoStatusMarkdownPath, 'utf8'),
    repoStatusMarkdownPath: path.relative(process.cwd(), repoStatusMarkdownPath),
    repoStatusSource: JSON.parse(readFileSync(repoStatusSourcePath, 'utf8')),
    repoStatusSourcePath: path.relative(process.cwd(), repoStatusSourcePath),
    executionSurfacesMarkdown: readFileSync(executionSurfacesMarkdownPath, 'utf8'),
    executionSurfacesMarkdownPath: path.relative(process.cwd(), executionSurfacesMarkdownPath),
    executionSurfacesSource: JSON.parse(readFileSync(executionSurfacesSourcePath, 'utf8')),
    executionSurfacesSourcePath: path.relative(process.cwd(), executionSurfacesSourcePath),
  });

  const markdown = renderCurrentDocTruthSyncMarkdown(report);

  mkdirSync(path.dirname(outputJsonPath), { recursive: true });
  mkdirSync(path.dirname(outputMarkdownPath), { recursive: true });
  writeFileSync(outputJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(outputMarkdownPath, markdown);

  console.log(path.relative(process.cwd(), outputJsonPath));
  console.log(path.relative(process.cwd(), outputMarkdownPath));
}
