import assert from 'node:assert/strict';
import { FUTURE_NATIVE_SCENE_SYSTEM_CONTRACT, HYBRID_SCENE_SYSTEM_CONTRACTS, PROCEDURAL_SCENE_SYSTEM_CONTRACTS } from '../lib/sceneSystemRegistry';
import { PROCEDURAL_SYSTEM_MODE_IDS } from '../lib/proceduralModeRegistry';

export async function main() {
  const proceduralIds = Object.keys(PROCEDURAL_SYSTEM_MODE_IDS).sort();
  const proceduralContracts = Object.keys(PROCEDURAL_SCENE_SYSTEM_CONTRACTS).sort();
  const hybridContracts = Object.keys(HYBRID_SCENE_SYSTEM_CONTRACTS).sort();

  assert.deepEqual(proceduralContracts, proceduralIds, 'procedural scene contracts must cover all procedural system ids');
  assert.deepEqual(hybridContracts, proceduralIds, 'hybrid scene contracts must cover all procedural system ids');

  for (const [systemId, contract] of Object.entries(PROCEDURAL_SCENE_SYSTEM_CONTRACTS)) {
    assert.equal(contract.id, systemId, `procedural contract id mismatch for ${systemId}`);
    assert.equal(contract.activationKind, 'procedural', `procedural activationKind mismatch for ${systemId}`);
    assert.ok(contract.manifestFeatures.length > 0, `manifest features missing for ${systemId}`);
    assert.ok(contract.sceneBranches.length > 0, `scene branches missing for ${systemId}`);
    assert.equal(typeof contract.component, 'object', `lazy component missing for ${systemId}`);
  }

  for (const [systemId, contract] of Object.entries(HYBRID_SCENE_SYSTEM_CONTRACTS)) {
    assert.equal(contract.id, systemId, `hybrid contract id mismatch for ${systemId}`);
    assert.ok(contract.manifestFeatures.length > 0, `hybrid manifest features missing for ${systemId}`);
    assert.ok(contract.sceneBranches.length > 0, `hybrid scene branches missing for ${systemId}`);
    assert.equal(typeof contract.component, 'object', `hybrid lazy component missing for ${systemId}`);
  }

  assert.equal(FUTURE_NATIVE_SCENE_SYSTEM_CONTRACT.id, 'future-native-bridge');
  assert.equal(FUTURE_NATIVE_SCENE_SYSTEM_CONTRACT.activationKind, 'future-native');
  assert.ok(FUTURE_NATIVE_SCENE_SYSTEM_CONTRACT.manifestFeatures.includes('future-native:bridge'));

  console.log(JSON.stringify({
    ok: true,
    proceduralContractCount: proceduralContracts.length,
    hybridContractCount: hybridContracts.length,
    futureNativeContractId: FUTURE_NATIVE_SCENE_SYSTEM_CONTRACT.id,
  }, null, 2));
}
