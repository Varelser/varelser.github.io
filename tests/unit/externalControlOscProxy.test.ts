import assert from 'node:assert/strict';
import { encodeOscMessagePacket, parseOscMessagePacket } from '../../lib/externalControlOscProxy';

export async function main() {
  const patchPacket = encodeOscMessagePacket('/kalokagathia/config/patch', ['{"projectSeedValue":4201}', 7]);
  const patchMessage = parseOscMessagePacket(patchPacket);
  assert.equal(patchMessage?.address, '/kalokagathia/config/patch');
  assert.deepEqual(patchMessage?.args, ['{"projectSeedValue":4201}', 7]);

  const presetPacket = encodeOscMessagePacket('/kalokagathia/preset/load', ['preset-a', 'morph']);
  const presetMessage = parseOscMessagePacket(presetPacket);
  assert.equal(presetMessage?.address, '/kalokagathia/preset/load');
  assert.deepEqual(presetMessage?.args, ['preset-a', 'morph']);

  const boolNullPacket = encodeOscMessagePacket('/kalokagathia/sequence/select', [true, false, null]);
  const boolNullMessage = parseOscMessagePacket(boolNullPacket);
  assert.equal(boolNullMessage?.address, '/kalokagathia/sequence/select');
  assert.deepEqual(boolNullMessage?.args, [true, false, null]);

  assert.equal(parseOscMessagePacket(Buffer.from('invalid')), null);
  console.log('externalControlOscProxy ok');
}
