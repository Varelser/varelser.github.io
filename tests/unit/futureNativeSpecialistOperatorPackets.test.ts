import assert from 'node:assert/strict';
import {
  buildFutureNativeSpecialistAdapterPacket,
  buildFutureNativeSpecialistComparisonPacket,
  buildFutureNativeSpecialistOperatorPacket,
} from '../../lib/future-native-families/futureNativeSpecialistOperatorPackets';

const TARGET_FAMILY = 'specialist-houdini-native' as const;

export async function main() {
  const operatorPacket = buildFutureNativeSpecialistOperatorPacket(TARGET_FAMILY);
  assert.match(operatorPacket, /FutureNativeSpecialistOperatorPacket/);
  assert.match(operatorPacket, /familyId=specialist-houdini-native/);
  assert.match(operatorPacket, /handshake::provider:houdini-native/);
  assert.match(operatorPacket, /selection::selectedAdapter:surface-volume-primary/);
  assert.match(operatorPacket, /routing::next:n\/a/);

  const adapterPacket = buildFutureNativeSpecialistAdapterPacket(TARGET_FAMILY);
  assert.match(adapterPacket, /FutureNativeSpecialistAdapterPacket/);
  assert.match(adapterPacket, /adapterCount=3/);
  assert.match(adapterPacket, /handshakeCount=4/);
  assert.match(adapterPacket, /adapter::surface-volume-primary::Surface-volume primary adapter/);
  assert.match(adapterPacket, /adapter::particles-fallback::Particles fallback adapter/);

  const comparisonPacket = buildFutureNativeSpecialistComparisonPacket(TARGET_FAMILY);
  assert.match(comparisonPacket, /FutureNativeSpecialistComparisonPacket/);
  assert.match(comparisonPacket, /familyId=specialist-houdini-native/);
  assert.match(comparisonPacket, /defaultAdapterId=surface-volume-primary/);
  assert.match(comparisonPacket, /compare::surface-volume-primary::hybrid:surface-volume-stack::added=none::removed=none/);
  assert.match(comparisonPacket, /compare::particles-fallback::hybrid:particle-fallback-stack::added=particle-fallback,reduced-fidelity,resilient/);
}
