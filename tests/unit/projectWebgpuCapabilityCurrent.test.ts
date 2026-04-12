import assert from 'node:assert/strict';
import {
  buildProjectWebgpuCapabilityPacket,
  CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT,
  filterProjectWebgpuCapabilityBuckets,
  getProjectWebgpuCapabilityBuckets,
} from '../../lib/projectWebgpuCapabilityCurrent';

export async function main() {
  const buckets = getProjectWebgpuCapabilityBuckets(CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT);
  assert.equal(buckets.length, 3);
  assert.equal(buckets[0].mode, 'direct');
  assert.equal(buckets[1].mode, 'limited');
  assert.equal(buckets[2].mode, 'fallback-only');

  const limitedOnly = filterProjectWebgpuCapabilityBuckets(buckets, 'limited');
  assert.equal(limitedOnly.length, 1);
  assert.equal(limitedOnly[0].count, 2);
  assert.match(limitedOnly[0].nextAction, /target-host confirmation/);

  const packet = buildProjectWebgpuCapabilityPacket('fallback-only', CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT);
  assert.match(packet, /ProjectWebgpuCapabilityPacket/);
  assert.match(packet, /mode=fallback-only/);
  assert.match(packet, /fallbackOnly=18/);
  assert.match(packet, /intel-mac real export fixture capture/);
}
