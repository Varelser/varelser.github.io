import type { ProjectAudioLegacyCloseoutSummary } from '../types';

export interface ProjectAudioLegacyTargetHostProofPacket {
  status: 'required' | 'blocked' | 'not-needed';
  runnerCommand: string;
  refreshCommand: string;
  proofArtifacts: string[];
  docs: string[];
  notes: string[];
}

const RUNNER_COMMAND = './RUN_TARGET_HOST_INTEL_MAC_CLOSEOUT.command';
const REFRESH_COMMAND = 'npm run run:target-host:intel-mac:closeout:refresh';
const PROOF_ARTIFACTS = [
  'docs/archive/target-host-intel-mac-closeout.json',
  'docs/archive/target-host-intel-mac-closeout.md',
  'docs/archive/target-host-intel-mac-closeout-logs/vite-live-server.log',
];
const DOC_PATHS = [
  'docs/TARGET_HOST_INTEL_MAC_ONE_SHOT_CLOSEOUT_2026-04-06.md',
  'RUN_TARGET_HOST_INTEL_MAC_CLOSEOUT.command',
];

export function buildProjectAudioLegacyTargetHostProofPacket(
  closeoutSummary: ProjectAudioLegacyCloseoutSummary,
): ProjectAudioLegacyTargetHostProofPacket {
  if (!closeoutSummary.requiresTargetHostProof) {
    return {
      status: 'not-needed',
      runnerCommand: RUNNER_COMMAND,
      refreshCommand: REFRESH_COMMAND,
      proofArtifacts: PROOF_ARTIFACTS,
      docs: DOC_PATHS,
      notes: [
        'Target-host proof is not the active blocker for this closeout state.',
        `Closeout status is ${closeoutSummary.status}; follow the current next-step label first.`,
      ],
    };
  }

  if (closeoutSummary.status !== 'ready') {
    return {
      status: 'blocked',
      runnerCommand: RUNNER_COMMAND,
      refreshCommand: REFRESH_COMMAND,
      proofArtifacts: PROOF_ARTIFACTS,
      docs: DOC_PATHS,
      notes: [
        'Target-host proof exists but is still blocked by unresolved current or stored legacy cleanup.',
        `Keep ${closeoutSummary.recommendedVisibilityMode} as the intended final mode and clear review / blocked items first.`,
      ],
    };
  }

  return {
    status: 'required',
    runnerCommand: RUNNER_COMMAND,
    refreshCommand: REFRESH_COMMAND,
    proofArtifacts: PROOF_ARTIFACTS,
    docs: DOC_PATHS,
    notes: [
      `Keep ${closeoutSummary.recommendedVisibilityMode} active while collecting proof.`,
      'Archive the generated JSON and markdown proof files together with the Vite live server log.',
      'Treat Linux sandbox runs as syntax-only; only the Intel Mac target host closes the proof requirement.',
    ],
  };
}

export function formatProjectAudioLegacyTargetHostProofPacket(
  packet: ProjectAudioLegacyTargetHostProofPacket,
  closeoutSummary: ProjectAudioLegacyCloseoutSummary,
): string {
  return [
    `status=${packet.status}`,
    `closeoutStatus=${closeoutSummary.status}`,
    `currentMode=${closeoutSummary.currentVisibilityMode}`,
    `recommendedMode=${closeoutSummary.recommendedVisibilityMode}`,
    `modeDrift=${closeoutSummary.modeDrift ? 'yes' : 'no'}`,
    `requiresTargetHostProof=${closeoutSummary.requiresTargetHostProof ? 'yes' : 'no'}`,
    `runner=${packet.runnerCommand}`,
    `refresh=${packet.refreshCommand}`,
    `proofArtifacts=${packet.proofArtifacts.join(' | ')}`,
    `docs=${packet.docs.join(' | ')}`,
    `notes=${packet.notes.join(' | ')}`,
    `next=${closeoutSummary.nextStepLabel}`,
  ].join('\n');
}
