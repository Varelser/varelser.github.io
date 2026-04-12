import dgram from 'node:dgram';
import { encodeOscMessagePacket } from '../lib/externalControlOscProxy';
import { EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX } from '../lib/externalControlBridge';

function getArgValue(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] ?? null : null;
}

const OSC_FIXTURES = {
  handshake: { address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/handshake`, args: [] },
  randomize: { address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/randomize`, args: [] },
  replaySeed: { address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/seed/replay`, args: [] },
  audioStart: { address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/audio/start`, args: [] },
  audioStop: { address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/audio/stop`, args: [] },
  sequenceStart: { address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/sequence/start`, args: [] },
  sequenceStop: { address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/sequence/stop`, args: [] },
  queueVideo: { address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/queue/enqueue-video-webm`, args: [] },
  queuePng: { address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/queue/enqueue-png-sequence`, args: [] },
  queueStart: { address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/queue/start`, args: [] },
  queueCancel: { address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/queue/cancel`, args: [] },
  queueClear: { address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/export/queue/clear`, args: [] },
  presetMorph: {
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/preset/load`,
    args: ['future-native-mpm-granular-sand-fall', 'morph'],
  },
  presetInstant: {
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/preset/load`,
    args: ['future-native-pbd-cloth-drape', 'instant'],
  },
  sequenceSelect: {
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/sequence/select`,
    args: ['seq-a'],
  },
  sequenceClear: {
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/sequence/select`,
    args: [null],
  },
  patchSeed4201: {
    address: `${EXTERNAL_CONTROL_OSC_ADDRESS_PREFIX}/config/patch`,
    args: ['{"projectSeedValue":4201}'],
  },
} as const;

export async function main() {
  const host = getArgValue('--host') ?? '127.0.0.1';
  const port = Number(getArgValue('--port') ?? '9124');
  const fixtureName = getArgValue('--fixture') ?? 'handshake';

  if (!Number.isFinite(port)) {
    throw new Error('Invalid --port value.');
  }
  if (!(fixtureName in OSC_FIXTURES)) {
    throw new Error(`Unknown fixture: ${fixtureName}`);
  }

  const fixture = OSC_FIXTURES[fixtureName as keyof typeof OSC_FIXTURES];
  const packet = encodeOscMessagePacket(fixture.address, [...fixture.args]);
  const socket = dgram.createSocket('udp4');

  await new Promise<void>((resolve, reject) => {
    socket.send(packet, port, host, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  socket.close();
  console.log(JSON.stringify({
    host,
    port,
    fixture: fixtureName,
    address: fixture.address,
    args: fixture.args,
    bytes: packet.length,
  }, null, 2));
}
