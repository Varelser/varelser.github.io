#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function parseArgs(argv) {
  const args = { repo: '.', overlay: '.', outDir: 'generated/handoff/missing-layers/closeout-apply-ready-patches-2026-04-06' };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--overlay') args.overlay = argv[++i];
    else if (arg === '--out-dir') args.outDir = argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv);
const repoRoot = path.resolve(args.repo);
const overlayRoot = path.resolve(args.overlay);
const previewDir = path.join(overlayRoot, 'generated/handoff/missing-layers/closeout-preview-2026-04-06');
const outDir = path.join(overlayRoot, args.outDir);
fs.mkdirSync(outDir, { recursive: true });

const targets = ['CURRENT_STATUS.md', 'REVIEW.md', 'DOCS_INDEX.md'];
const result = { createdAt: '2026-04-06', targetRoot: 'kalokagathia/', patchCount: 0, targets: [] };

for (const target of targets) {
  const fromFile = path.join(repoRoot, target);
  const toFile = path.join(previewDir, target);
  const patchFile = path.join(outDir, target.replace(/\.md$/, '.patch'));
  const replacementFile = path.join(outDir, target);
  const diff = spawnSync('diff', ['-u', '--label', `a/${target}`, '--label', `b/${target}`, fromFile, toFile], { encoding: 'utf8' });
  const diffText = diff.status === 1 ? diff.stdout : diff.stdout;
  fs.writeFileSync(patchFile, diffText.endsWith('
') ? diffText : `${diffText}
`);
  fs.copyFileSync(toFile, replacementFile);
  result.targets.push({
    target,
    patchFile: path.relative(overlayRoot, patchFile).replaceAll('\', '/'),
    replacementFile: path.relative(overlayRoot, replacementFile).replaceAll('\', '/'),
    lineCount: fs.readFileSync(toFile, 'utf8').split(/?
/).length - 1,
    bytes: fs.statSync(toFile).size,
  });
}

result.patchCount = result.targets.length;
const indexJson = path.join(overlayRoot, 'generated/handoff/missing-layers/closeout-apply-ready-patch-index-2026-04-06.json');
const indexMd = path.join(overlayRoot, 'generated/handoff/missing-layers/closeout-apply-ready-patch-index-2026-04-06.md');
fs.writeFileSync(indexJson, JSON.stringify(result, null, 2));
const md = [
  '# closeout apply-ready patch index',
  '',
  '- createdAt: 2026-04-06',
  `- patchCount: ${result.patchCount}`,
  '',
  '## targets',
  ...result.targets.flatMap((item) => [
    `- ${item.target}`,
    `  - patch: ${item.patchFile}`,
    `  - replacement: ${item.replacementFile}`,
    `  - lines: ${item.lineCount}`,
    `  - bytes: ${item.bytes}`,
  ]),
  '',
].join('
');
fs.writeFileSync(indexMd, md);
console.log(JSON.stringify({ ok: true, patchCount: result.patchCount, indexJson, indexMd }, null, 2));
