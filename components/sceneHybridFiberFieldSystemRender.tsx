import React from 'react';
import { BufferGeometry, ColorRepresentation, LineSegments } from 'three';

export const HybridFiberFieldSystemRender: React.FC<{
  lineRef: React.RefObject<LineSegments | null>;
  geometry: BufferGeometry;
  color: ColorRepresentation;
  opacity: number;
}> = ({ lineRef, geometry, color, opacity }) => (
  <lineSegments ref={lineRef as React.Ref<LineSegments>} geometry={geometry} renderOrder={4}>
    <lineBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
  </lineSegments>
);
