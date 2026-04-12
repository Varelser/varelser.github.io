import assert from 'node:assert/strict';
import {
  buildProjectIntelMacProofIntakePacket,
  buildProjectIntelMacProofOperatorPacket,
  CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT,
  filterProjectIntelMacProofBlockers,
} from '../../lib/projectIntelMacProofCurrent';

export async function main() {
  const dropOnly = filterProjectIntelMacProofBlockers(CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.blockers, 'drop');
  assert.equal(dropOnly.length, 5);
  assert.ok(dropOnly.every((blocker) => blocker.scope === 'drop'));

  const targetOnly = filterProjectIntelMacProofBlockers(CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT.blockers, 'target');
  assert.equal(targetOnly.length, 1);
  assert.equal(targetOnly[0]?.kind, 'browser-executable');

  const operatorPacket = buildProjectIntelMacProofOperatorPacket('target', CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT);
  assert.match(operatorPacket, /ProjectIntelMacProofOperatorPacket/);
  assert.match(operatorPacket, /scope=target/);
  assert.match(operatorPacket, /verdict=ready-for-real-capture/);
  assert.match(operatorPacket, /blocker:target:browser-executable=/);
  assert.doesNotMatch(operatorPacket, /blocker:drop:fixture-json=/);
  assert.match(operatorPacket, /command:oneShotIngest=/);

  const intakePacket = buildProjectIntelMacProofIntakePacket(CURRENT_PROJECT_INTEL_MAC_PROOF_REPORT);
  assert.match(intakePacket, /ProjectIntelMacProofIntakePacket/);
  assert.match(intakePacket, /readyForRealCapture=yes/);
  assert.match(intakePacket, /bundleCountBeforeRun=0/);
  assert.match(intakePacket, /captureScript=exports\/intel-mac-live-browser-proof-drop\/capture-on-intel-mac\.sh/);
}
