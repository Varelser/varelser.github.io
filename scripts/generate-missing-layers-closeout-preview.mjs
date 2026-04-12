#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key.startsWith('--')) {
      args[key.slice(2)] = value && !value.startsWith('--') ? value : true;
      if (value && !value.startsWith('--')) i += 1;
    }
  }
  return args;
}

function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`missing required file: ${filePath}`);
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/\s+$/, '');
}

function write(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${text.trimEnd()}\n`);
}

function extractAppendBlock(text) {
  const marker = '## append block draft';
  const idx = text.indexOf(marker);
  if (idx === -1) throw new Error('append block marker not found');
  return text.slice(idx + marker.length).trim();
}

const args = parseArgs(process.argv);
const repo = path.resolve(args.repo || '.');
const overlay = path.resolve(args.overlay || repo);
const genDir = path.join(overlay, 'generated', 'handoff', 'missing-layers');
const patchDir = path.join(genDir, 'truth-sync-patches-2026-04-06');
const previewDir = path.join(genDir, 'closeout-preview-2026-04-06');

const targets = [
  ['CURRENT_STATUS.md', 'CURRENT_STATUS.truth-sync.patch.md'],
  ['REVIEW.md', 'REVIEW.truth-sync.patch.md'],
  ['DOCS_INDEX.md', 'DOCS_INDEX.truth-sync.patch.md'],
];

for (const [target, patchName] of targets) {
  ensureFile(path.join(repo, target));
  ensureFile(path.join(patchDir, patchName));
}

const generated = [];
for (const [target, patchName] of targets) {
  const baseText = read(path.join(repo, target));
  const patchText = read(path.join(patchDir, patchName));
  const appendBlock = extractAppendBlock(patchText);
  const merged = `${baseText}\n\n${appendBlock}`;
  const outPath = path.join(previewDir, target);
  write(outPath, merged);
  generated.push({ target, outPath });
}

const payload = {
  date: '2026-04-06',
  previewFileCount: generated.length,
  targetFiles: generated.map((entry) => entry.target),
  applyMode: 'append-preview-only',
  note: 'base repo は未変更。closeout preview は overlay generated 配下にのみ出力。',
};

const generatedLines = generated
  .map((entry) => {
    const rel = path.relative(overlay, entry.outPath).split(path.sep).join('/');
    return `- ${rel}`;
  })
  .join('\n');
const md = `# closeout preview index\n\n- date: ${payload.date}\n- preview file count: ${payload.previewFileCount}\n- apply mode: ${payload.applyMode}\n- note: ${payload.note}\n\n## generated files\n${generatedLines}\n`;

write(path.join(genDir, 'closeout-preview-index-2026-04-06.json'), JSON.stringify(payload, null, 2));
write(path.join(genDir, 'closeout-preview-index-2026-04-06.md'), md);
console.log(JSON.stringify({ ok: true, previewFileCount: generated.length }, null, 2));
