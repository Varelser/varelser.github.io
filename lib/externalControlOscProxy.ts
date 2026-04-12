export interface ParsedOscMessage {
  address: string;
  args: Array<string | number | boolean | null>;
}

export type OscScalarValue = string | number | boolean | null;

function padToFourBytes(offset: number) {
  return (offset + 3) & ~3;
}

function readOscString(buffer: Buffer, startOffset: number) {
  const endOffset = buffer.indexOf(0, startOffset);
  if (endOffset < 0) {
    return null;
  }
  return {
    value: buffer.toString('utf8', startOffset, endOffset),
    nextOffset: padToFourBytes(endOffset + 1),
  };
}

export function parseOscMessagePacket(buffer: Buffer): ParsedOscMessage | null {
  const addressResult = readOscString(buffer, 0);
  if (!addressResult || !addressResult.value.startsWith('/')) {
    return null;
  }

  const typeTagResult = readOscString(buffer, addressResult.nextOffset);
  if (!typeTagResult || !typeTagResult.value.startsWith(',')) {
    return null;
  }

  let offset = typeTagResult.nextOffset;
  const args: Array<string | number | boolean | null> = [];

  for (const typeTag of typeTagResult.value.slice(1)) {
    if (typeTag === 's') {
      const stringResult = readOscString(buffer, offset);
      if (!stringResult) {
        return null;
      }
      args.push(stringResult.value);
      offset = stringResult.nextOffset;
      continue;
    }

    if (typeTag === 'i') {
      if (offset + 4 > buffer.length) {
        return null;
      }
      args.push(buffer.readInt32BE(offset));
      offset += 4;
      continue;
    }

    if (typeTag === 'f') {
      if (offset + 4 > buffer.length) {
        return null;
      }
      args.push(buffer.readFloatBE(offset));
      offset += 4;
      continue;
    }

    if (typeTag === 'T') {
      args.push(true);
      continue;
    }

    if (typeTag === 'F') {
      args.push(false);
      continue;
    }

    if (typeTag === 'N') {
      args.push(null);
      continue;
    }

    return null;
  }

  return {
    address: addressResult.value,
    args,
  };
}

function padOscBuffer(value: Buffer) {
  const paddedLength = (value.length + 1 + 3) & ~3;
  const output = Buffer.alloc(paddedLength);
  value.copy(output);
  return output;
}

export function encodeOscMessagePacket(address: string, args: OscScalarValue[] = []) {
  const typeTags = [','];
  const chunks: Buffer[] = [padOscBuffer(Buffer.from(address, 'utf8'))];

  for (const arg of args) {
    if (typeof arg === 'string') {
      typeTags.push('s');
      chunks.push(padOscBuffer(Buffer.from(arg, 'utf8')));
      continue;
    }
    if (typeof arg === 'number' && Number.isInteger(arg)) {
      typeTags.push('i');
      const chunk = Buffer.alloc(4);
      chunk.writeInt32BE(arg, 0);
      chunks.push(chunk);
      continue;
    }
    if (typeof arg === 'number') {
      typeTags.push('f');
      const chunk = Buffer.alloc(4);
      chunk.writeFloatBE(arg, 0);
      chunks.push(chunk);
      continue;
    }
    if (arg === true) {
      typeTags.push('T');
      continue;
    }
    if (arg === false) {
      typeTags.push('F');
      continue;
    }
    typeTags.push('N');
  }

  chunks.splice(1, 0, padOscBuffer(Buffer.from(typeTags.join(''), 'utf8')));
  return Buffer.concat(chunks);
}
