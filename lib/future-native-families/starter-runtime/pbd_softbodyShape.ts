import type { PbdSoftbodyRuntimeState } from './pbd_softbodyTypes';
import { polygonArea } from './pbd_softbodyTypes';

export function applyShapeMatching(runtime: PbdSoftbodyRuntimeState): void {
  const strength = runtime.config.clusterStiffness * 0.022;
  if (strength <= 0) return;
  let cx = 0;
  let cy = 0;
  for (const particle of runtime.particles) {
    cx += particle.x;
    cy += particle.y;
  }
  cx /= runtime.particles.length;
  cy /= runtime.particles.length;
  for (const particle of runtime.particles) {
    if (particle.pinned) continue;
    const targetX = cx + particle.restOffsetX;
    const targetY = cy + particle.restOffsetY;
    particle.x += (targetX - particle.x) * strength;
    particle.y += (targetY - particle.y) * strength;
  }
}

export function applyVolumeConstraints(runtime: PbdSoftbodyRuntimeState): number {
  let maxError = 0;
  const strength = runtime.config.volumePreservation * 0.012;
  if (strength <= 0) return maxError;
  for (const cell of runtime.cells) {
    const points = cell.indices.map((index) => runtime.particles[index]);
    const area = Math.abs(polygonArea(points));
    const areaError = cell.restArea - area;
    maxError = Math.max(maxError, Math.abs(areaError) / Math.max(1e-6, cell.restArea));
    if (Math.abs(areaError) < 1e-6) continue;
    let cx = 0;
    let cy = 0;
    let weight = 0;
    for (const point of points) {
      cx += point.x;
      cy += point.y;
      weight += point.pinned ? 0 : 1;
    }
    if (weight <= 0) continue;
    cx /= points.length;
    cy /= points.length;
    const scale = (areaError / Math.max(1e-6, cell.restArea)) * strength;
    for (const point of points) {
      if (point.pinned) continue;
      const dx = point.x - cx;
      const dy = point.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      point.x += (dx / dist) * scale;
      point.y += (dy / dist) * scale;
    }
  }
  return maxError;
}
