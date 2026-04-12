export type GifFrameInput = {
  rgba: Uint8ClampedArray;
  delayCs: number;
};

type EncodeAnimatedGifOptions = {
  width: number;
  height: number;
  frames: GifFrameInput[];
  transparent?: boolean;
  loopCount?: number;
};

class GifByteWriter {
  private bytes: number[] = [];

  writeByte(value: number) {
    this.bytes.push(value & 0xff);
  }

  writeShort(value: number) {
    this.writeByte(value);
    this.writeByte(value >> 8);
  }

  writeString(value: string) {
    for (let index = 0; index < value.length; index += 1) {
      this.writeByte(value.charCodeAt(index));
    }
  }

  writeBytes(values: ArrayLike<number>) {
    for (let index = 0; index < values.length; index += 1) {
      this.writeByte(values[index] ?? 0);
    }
  }

  toUint8Array() {
    return new Uint8Array(this.bytes);
  }
}

function buildGlobalPalette(transparent: boolean) {
  const palette: number[] = [];
  const steps = [0, 51, 102, 153, 204, 255];

  for (const red of steps) {
    for (const green of steps) {
      for (const blue of steps) {
        palette.push(red, green, blue);
      }
    }
  }

  for (let index = 0; index < 40; index += 1) {
    const value = Math.round((255 * index) / 39);
    palette.push(value, value, value);
  }

  while (palette.length < 256 * 3) {
    palette.push(0, 0, 0);
  }

  if (transparent) {
    const transparentOffset = 255 * 3;
    palette[transparentOffset] = 0;
    palette[transparentOffset + 1] = 0;
    palette[transparentOffset + 2] = 0;
  }

  return new Uint8Array(palette.slice(0, 256 * 3));
}

function quantizeToPalette(rgba: Uint8ClampedArray, transparent: boolean) {
  const indices = new Uint8Array(rgba.length >> 2);

  for (let sourceIndex = 0, targetIndex = 0; sourceIndex < rgba.length; sourceIndex += 4, targetIndex += 1) {
    const alpha = rgba[sourceIndex + 3] ?? 255;
    if (transparent && alpha < 128) {
      indices[targetIndex] = 255;
      continue;
    }

    const redIndex = Math.max(0, Math.min(5, Math.round((rgba[sourceIndex] ?? 0) / 51)));
    const greenIndex = Math.max(0, Math.min(5, Math.round((rgba[sourceIndex + 1] ?? 0) / 51)));
    const blueIndex = Math.max(0, Math.min(5, Math.round((rgba[sourceIndex + 2] ?? 0) / 51)));
    indices[targetIndex] = redIndex * 36 + greenIndex * 6 + blueIndex;
  }

  return indices;
}

function lzwEncodeGifIndices(indices: Uint8Array, minCodeSize: number) {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let nextCode = endCode + 1;
  let codeSize = minCodeSize + 1;
  let bitBuffer = 0;
  let bitCount = 0;
  const output: number[] = [];

  const flushCode = (code: number) => {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      output.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  };

  const resetDictionary = () => {
    nextCode = endCode + 1;
    codeSize = minCodeSize + 1;
  };

  const dictionary = new Map<string, number>();
  const rebuildDictionary = () => {
    dictionary.clear();
    for (let index = 0; index < clearCode; index += 1) {
      dictionary.set(String(index), index);
    }
  };

  rebuildDictionary();
  flushCode(clearCode);

  let phrase = String(indices[0] ?? 0);
  for (let index = 1; index < indices.length; index += 1) {
    const value = indices[index] ?? 0;
    const candidate = `${phrase},${value}`;
    if (dictionary.has(candidate)) {
      phrase = candidate;
      continue;
    }

    flushCode(dictionary.get(phrase) ?? 0);
    if (nextCode < 4096) {
      dictionary.set(candidate, nextCode);
      nextCode += 1;
      if (nextCode === (1 << codeSize) && codeSize < 12) {
        codeSize += 1;
      }
    } else {
      flushCode(clearCode);
      rebuildDictionary();
      resetDictionary();
    }

    phrase = String(value);
  }

  flushCode(dictionary.get(phrase) ?? 0);
  flushCode(endCode);

  if (bitCount > 0) {
    output.push(bitBuffer & 0xff);
  }

  return new Uint8Array(output);
}

function writeGifSubBlocks(writer: GifByteWriter, payload: Uint8Array) {
  for (let offset = 0; offset < payload.length; offset += 255) {
    const blockLength = Math.min(255, payload.length - offset);
    writer.writeByte(blockLength);
    writer.writeBytes(payload.subarray(offset, offset + blockLength));
  }
  writer.writeByte(0);
}

export function encodeAnimatedGif({ width, height, frames, transparent = false, loopCount = 0 }: EncodeAnimatedGifOptions) {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const writer = new GifByteWriter();
  const palette = buildGlobalPalette(transparent);
  const minimumCodeSize = 8;

  writer.writeString('GIF89a');
  writer.writeShort(safeWidth);
  writer.writeShort(safeHeight);
  writer.writeByte(0xf7);
  writer.writeByte(transparent ? 255 : 0);
  writer.writeByte(0);
  writer.writeBytes(palette);

  writer.writeByte(0x21);
  writer.writeByte(0xff);
  writer.writeByte(0x0b);
  writer.writeString('NETSCAPE2.0');
  writer.writeByte(0x03);
  writer.writeByte(0x01);
  writer.writeShort(loopCount);
  writer.writeByte(0x00);

  for (const frame of frames) {
    const indices = quantizeToPalette(frame.rgba, transparent);
    const delayCs = Math.max(1, Math.round(frame.delayCs));
    const encoded = lzwEncodeGifIndices(indices, minimumCodeSize);

    writer.writeByte(0x21);
    writer.writeByte(0xf9);
    writer.writeByte(0x04);
    writer.writeByte(transparent ? 0x01 : 0x00);
    writer.writeShort(delayCs);
    writer.writeByte(transparent ? 255 : 0);
    writer.writeByte(0x00);

    writer.writeByte(0x2c);
    writer.writeShort(0);
    writer.writeShort(0);
    writer.writeShort(safeWidth);
    writer.writeShort(safeHeight);
    writer.writeByte(0x00);
    writer.writeByte(minimumCodeSize);
    writeGifSubBlocks(writer, encoded);
  }

  writer.writeByte(0x3b);

  return new Blob([writer.toUint8Array()], { type: 'image/gif' });
}
