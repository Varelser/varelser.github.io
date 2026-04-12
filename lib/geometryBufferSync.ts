import { BufferAttribute, BufferGeometry } from 'three';

export function syncFloat32GeometryAttribute(
  geometry: BufferGeometry,
  name: string,
  data: Float32Array,
  itemSize: number,
) {
  const existing = geometry.getAttribute(name);
  if (existing && existing.itemSize === itemSize && existing.array === data) {
    existing.needsUpdate = true;
    return existing;
  }
  if (
    existing
    && existing.itemSize === itemSize
    && existing.array instanceof Float32Array
    && existing.array.length === data.length
  ) {
    existing.array.set(data);
    existing.needsUpdate = true;
    return existing;
  }

  const attribute = new BufferAttribute(data, itemSize);
  geometry.setAttribute(name, attribute);
  return attribute;
}

export function syncGeometryIndex(
  geometry: BufferGeometry,
  data: Uint16Array | Uint32Array,
) {
  const existing = geometry.getIndex();
  if (existing && existing.array === data) {
    existing.needsUpdate = true;
    return existing;
  }
  if (
    existing
    && ((existing.array instanceof Uint16Array && data instanceof Uint16Array)
      || (existing.array instanceof Uint32Array && data instanceof Uint32Array))
    && existing.array.length === data.length
  ) {
    existing.array.set(data);
    existing.needsUpdate = true;
    return existing;
  }

  const attribute = new BufferAttribute(data, 1);
  geometry.setIndex(attribute);
  return attribute;
}
