import { buildFutureNativeFamilyImplementationPacket } from './futureNativeFamiliesImplementationPackets';
import type { FutureNativeFamilyId } from './futureNativeFamiliesTypes';

export function emitPacket(id: FutureNativeFamilyId): string {
  const packet = buildFutureNativeFamilyImplementationPacket(id);
  const starterFiles = packet.starterRuntime.files.map((file) => `- ${file.path} — ${file.purpose}`).join('\n');
  const acceptance = packet.acceptance.mustPass.map((item) => `- ${item}`).join('\n');
  const checks = packet.verification.checks.map((item) => `- ${item}`).join('\n');
  return [
    `# ${packet.entry.id}`,
    '',
    `Group: ${packet.entry.group}`,
    `Stage: ${packet.entry.stage}`,
    `Verification: ${packet.verification.id}`,
    '',
    '## Acceptance',
    acceptance,
    '',
    '## Verification checks',
    checks,
    '',
    '## Starter files',
    starterFiles,
    '',
    '## AI packet',
    packet.aiPacket,
  ].join('\n');
}
