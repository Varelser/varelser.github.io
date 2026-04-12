export function cellIndex(x: number, y: number, width: number): number {
  return y * width + x;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function bilerp(field: Float32Array, width: number, height: number, x: number, y: number): number {
  const sx = clamp(x, 0, width - 1);
  const sy = clamp(y, 0, height - 1);
  const x0 = Math.floor(sx);
  const y0 = Math.floor(sy);
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);
  const tx = sx - x0;
  const ty = sy - y0;
  const v00 = field[cellIndex(x0, y0, width)];
  const v10 = field[cellIndex(x1, y0, width)];
  const v01 = field[cellIndex(x0, y1, width)];
  const v11 = field[cellIndex(x1, y1, width)];
  const top = v00 * (1 - tx) + v10 * tx;
  const bottom = v01 * (1 - tx) + v11 * tx;
  return top * (1 - ty) + bottom * ty;
}
