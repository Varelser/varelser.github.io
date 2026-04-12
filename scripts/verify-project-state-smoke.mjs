import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

const targets = [
  {
    file: 'lib/projectState.ts',
    requiredSnippets: [
      "export { buildProjectData } from './projectStateData';",
      "export { loadProjectData, parseProjectData, saveProjectData } from './projectStateStorage';",
    ],
  },
  {
    file: 'lib/projectStateData.ts',
    requiredSnippets: ['export function buildProjectData'],
  },
  {
    file: 'lib/projectStateStorage.ts',
    requiredSnippets: ['export function parseProjectData'],
  },
  {
    file: 'lib/projectExecutionRouting.ts',
    requiredSnippets: ['export function buildProjectExecutionRoutingMap'],
  },
  {
    file: 'lib/projectSerializationSnapshot.ts',
    requiredSnippets: ['export function buildProjectSerializationSnapshot'],
  },
  {
    file: 'scripts/verify-project-state-entry.ts',
    requiredSnippets: ['buildProjectData', 'parseProjectData', 'buildProjectExecutionRoutingMap', 'buildProjectSerializationSnapshot'],
  },
];

const summary = targets.map((target) => {
  const absolutePath = path.resolve(rootDir, target.file);
  if (!fs.existsSync(absolutePath)) {
    return { file: target.file, passed: false, reason: 'missing-file', matched: [] };
  }

  const source = fs.readFileSync(absolutePath, 'utf8');
  const matched = target.requiredSnippets.filter((snippet) => source.includes(snippet));
  return {
    file: target.file,
    passed: matched.length === target.requiredSnippets.length,
    requiredCount: target.requiredSnippets.length,
    matchedCount: matched.length,
    matched,
    missing: target.requiredSnippets.filter((snippet) => !matched.includes(snippet)),
  };
});

const passed = summary.every((entry) => entry.passed);
console.log(JSON.stringify({
  passed,
  verificationTier: 'source-contract-smoke',
  verifiedFileCount: summary.length,
  summary,
}, null, 2));

if (!passed) process.exitCode = 1;
