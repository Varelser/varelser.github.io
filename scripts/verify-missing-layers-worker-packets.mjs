#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = { repo: process.cwd(), matrix: null, packetsDir: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--matrix') args.matrix = argv[++i];
    else if (arg === '--packets-dir') args.packetsDir = argv[++i];
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(args.repo);
  const matrixPath = path.resolve(args.matrix ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'worker-evidence-matrix-2026-04-06.json'));
  const packetsDir = path.resolve(args.packetsDir ?? path.join(repoRoot, 'generated', 'handoff', 'missing-layers', 'worker-packets-2026-04-06'));
  const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
  const issues = [];

  const expectedPackets = [
    ...matrix.familyPackets.map((packet) => packet.packetId),
    ...matrix.rolePackets.map((packet) => packet.packetId),
  ];

  for (const packetId of expectedPackets) {
    const filePath = path.join(packetsDir, `${packetId.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`);
    if (!fs.existsSync(filePath)) {
      issues.push(`missing packet file: ${packetId}`);
      continue;
    }
    const text = fs.readFileSync(filePath, 'utf8');
    if (!text.includes('## Worker return template')) issues.push(`missing return template heading: ${packetId}`);
    if (!text.includes('## Verify commands')) issues.push(`missing verify commands heading: ${packetId}`);
    if (!text.includes('## Mainline decision points')) issues.push(`missing mainline decision points heading: ${packetId}`);
  }

  if (matrix.summary.familyPackets !== matrix.familyPackets.length) issues.push('familyPackets summary mismatch');
  if (matrix.summary.rolePackets !== matrix.rolePackets.length) issues.push('rolePackets summary mismatch');
  if (matrix.summary.totalPackets !== expectedPackets.length) issues.push('totalPackets summary mismatch');

  const result = {
    ok: issues.length === 0,
    matrixPath,
    packetsDir,
    familyPackets: matrix.familyPackets.length,
    rolePackets: matrix.rolePackets.length,
    totalPackets: expectedPackets.length,
    issues,
  };
  console.log(JSON.stringify(result, null, 2));
  if (issues.length > 0) process.exitCode = 1;
}

main();
