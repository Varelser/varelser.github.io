import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import dgram from 'node:dgram';
import http from 'node:http';
import path from 'node:path';
import type { Duplex } from 'node:stream';
import {
  EXTERNAL_CONTROL_BRIDGE_MODE,
  mapExternalControlOscMessage,
  type ExternalControlOutboundMessage,
} from '../lib/externalControlBridge';
import {
  createExternalControlBridgeProxyStatusSnapshot,
  updateExternalControlBridgeProxyStatusSnapshot,
} from '../lib/externalControlBridgeStatus';
import { parseOscMessagePacket } from '../lib/externalControlOscProxy';

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function getArgValue(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] ?? null : null;
}

function buildWebSocketAccept(key: string) {
  return createHash('sha1')
    .update(`${key}${WS_GUID}`)
    .digest('base64');
}

function encodeWebSocketTextFrame(payload: string) {
  const body = Buffer.from(payload, 'utf8');
  if (body.length < 126) {
    return Buffer.concat([Buffer.from([0x81, body.length]), body]);
  }
  if (body.length < 65536) {
    const header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(body.length, 2);
    return Buffer.concat([header, body]);
  }
  const header = Buffer.alloc(10);
  header[0] = 0x81;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(body.length), 2);
  return Buffer.concat([header, body]);
}

function encodeWebSocketCloseFrame() {
  return Buffer.from([0x88, 0x00]);
}

function encodeWebSocketPongFrame(payload: Buffer) {
  if (payload.length < 126) {
    return Buffer.concat([Buffer.from([0x8a, payload.length]), payload]);
  }
  const header = Buffer.alloc(4);
  header[0] = 0x8a;
  header[1] = 126;
  header.writeUInt16BE(payload.length, 2);
  return Buffer.concat([header, payload]);
}

function extractWebSocketFrames(buffer: Buffer) {
  const messages: Array<{ opcode: number; payload: Buffer }> = [];
  let offset = 0;

  while (offset + 2 <= buffer.length) {
    const firstByte = buffer[offset];
    const secondByte = buffer[offset + 1];
    const opcode = firstByte & 0x0f;
    const masked = (secondByte & 0x80) === 0x80;
    let payloadLength = secondByte & 0x7f;
    let cursor = offset + 2;

    if (payloadLength === 126) {
      if (cursor + 2 > buffer.length) {
        break;
      }
      payloadLength = buffer.readUInt16BE(cursor);
      cursor += 2;
    } else if (payloadLength === 127) {
      if (cursor + 8 > buffer.length) {
        break;
      }
      const bigLength = buffer.readBigUInt64BE(cursor);
      if (bigLength > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error('WebSocket frame too large.');
      }
      payloadLength = Number(bigLength);
      cursor += 8;
    }

    const maskingKeyLength = masked ? 4 : 0;
    if (cursor + maskingKeyLength + payloadLength > buffer.length) {
      break;
    }

    const maskingKey = masked ? buffer.subarray(cursor, cursor + 4) : null;
    cursor += maskingKeyLength;
    const payload = Buffer.from(buffer.subarray(cursor, cursor + payloadLength));
    if (maskingKey) {
      for (let index = 0; index < payload.length; index += 1) {
        payload[index] ^= maskingKey[index % 4];
      }
    }

    messages.push({ opcode, payload });
    offset = cursor + payloadLength;
  }

  return {
    messages,
    remaining: buffer.subarray(offset),
  };
}

export async function main() {
  const host = getArgValue('--host') ?? '127.0.0.1';
  const wsPort = Number(getArgValue('--ws-port') ?? '18181');
  const oscPort = Number(getArgValue('--osc-port') ?? '9124');
  const sessionId = getArgValue('--session-id') ?? undefined;
  const writeStatusJsonPath = path.resolve(getArgValue('--write-status-json') ?? 'docs/archive/external-control-osc-proxy-status.json');

  if (!Number.isFinite(wsPort) || !Number.isFinite(oscPort)) {
    throw new Error('Invalid --ws-port or --osc-port value.');
  }

  const clients = new Set<Duplex>();
  const clientBuffers = new Map<Duplex, Buffer>();
  let statusSnapshot = createExternalControlBridgeProxyStatusSnapshot();

  const writeStatusSnapshot = () => {
    mkdirSync(path.dirname(writeStatusJsonPath), { recursive: true });
    writeFileSync(writeStatusJsonPath, `${JSON.stringify(statusSnapshot, null, 2)}\n`);
  };

  const updateStatusSnapshot = (message?: ExternalControlOutboundMessage) => {
    statusSnapshot = message
      ? updateExternalControlBridgeProxyStatusSnapshot(statusSnapshot, message, clients.size)
      : {
        ...statusSnapshot,
        generatedAt: new Date().toISOString(),
        connectedClientCount: clients.size,
      };
    writeStatusSnapshot();
  };

  writeStatusSnapshot();

  const wsServer = http.createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(`external-control-osc-proxy ok\nmode=${EXTERNAL_CONTROL_BRIDGE_MODE}\nwsPort=${wsPort}\noscPort=${oscPort}\n`);
  });

  wsServer.on('upgrade', (request, socket) => {
    const key = request.headers['sec-websocket-key'];
    if (typeof key !== 'string' || key.length === 0) {
      socket.destroy();
      return;
    }

    const accept = buildWebSocketAccept(key);
    socket.write([
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${accept}`,
      '',
      '',
    ].join('\r\n'));

    clients.add(socket);
    clientBuffers.set(socket, Buffer.alloc(0));
    updateStatusSnapshot();
    console.log(`[external-control-osc-proxy] ws client connected (${clients.size} total)`);

    socket.on('data', (chunk) => {
      const buffered = Buffer.concat([clientBuffers.get(socket) ?? Buffer.alloc(0), chunk]);
      const { messages, remaining } = extractWebSocketFrames(buffered);
      clientBuffers.set(socket, remaining);

      for (const message of messages) {
        if (message.opcode === 0x8) {
          socket.write(encodeWebSocketCloseFrame());
          socket.end();
          return;
        }
        if (message.opcode === 0x9) {
          socket.write(encodeWebSocketPongFrame(message.payload));
          continue;
        }
        if (message.opcode !== 0x1) {
          continue;
        }
        const text = message.payload.toString('utf8');
        try {
          const parsed = JSON.parse(text);
          if (parsed?.type === 'external-control-status' || parsed?.type === 'external-control-error') {
            updateStatusSnapshot(parsed);
            console.log(`[external-control-osc-proxy] browser ${parsed.type}`, JSON.stringify(parsed));
          }
        } catch {
          console.log('[external-control-osc-proxy] browser text', text);
        }
      }
    });

    socket.on('close', () => {
      clients.delete(socket);
      clientBuffers.delete(socket);
      updateStatusSnapshot();
      console.log(`[external-control-osc-proxy] ws client disconnected (${clients.size} total)`);
    });
    socket.on('end', () => {
      clients.delete(socket);
      clientBuffers.delete(socket);
      updateStatusSnapshot();
    });
    socket.on('error', (error) => {
      clients.delete(socket);
      clientBuffers.delete(socket);
      updateStatusSnapshot();
      console.error('[external-control-osc-proxy] ws client error', error);
    });
  });

  const oscServer = dgram.createSocket('udp4');

  oscServer.on('message', (buffer, remote) => {
    const oscMessage = parseOscMessagePacket(buffer);
    if (!oscMessage) {
      console.warn(`[external-control-osc-proxy] ignored invalid OSC packet from ${remote.address}:${remote.port}`);
      return;
    }

    const mapped = mapExternalControlOscMessage({
      address: oscMessage.address,
      args: oscMessage.args,
      sessionId,
    });
    if (!mapped) {
      console.warn(`[external-control-osc-proxy] ignored unmapped OSC address ${oscMessage.address}`);
      return;
    }

    const payload = JSON.stringify(mapped);
    const frame = encodeWebSocketTextFrame(payload);
    for (const client of clients) {
      client.write(frame);
    }
    console.log(`[external-control-osc-proxy] ${oscMessage.address} -> ${mapped.type} (${clients.size} ws clients)`);
  });

  oscServer.on('error', (error) => {
    console.error('[external-control-osc-proxy] osc socket error', error);
  });

  await new Promise<void>((resolve, reject) => {
    wsServer.once('error', reject);
    wsServer.listen(wsPort, host, () => resolve());
  });

  await new Promise<void>((resolve, reject) => {
    oscServer.once('error', reject);
    oscServer.bind(oscPort, host, () => resolve());
  });

  console.log(`[external-control-osc-proxy] ready ws=ws://${host}:${wsPort} osc=udp://${host}:${oscPort} mode=${EXTERNAL_CONTROL_BRIDGE_MODE}${sessionId ? ` session=${sessionId}` : ''} status=${path.relative(process.cwd(), writeStatusJsonPath)}`);
}
