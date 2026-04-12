import type { MpmGranularNormalizedConfig } from './mpm_granularSchema';
import type { MpmGranularGridState, MpmGranularGridCell } from './mpm_granularShared';

export function createGridState(config: MpmGranularNormalizedConfig): MpmGranularGridState {
  const resolution = Math.max(8, config.cellResolution);
  const minX = -config.wallHalfWidth;
  const maxX = config.wallHalfWidth;
  const minY = config.floorY;
  const maxY = Math.max(config.floorY + 0.2, config.floorY + config.spawnHeight + 1.6);
  const cellWidth = (maxX - minX) / resolution;
  const cellHeight = (maxY - minY) / resolution;
  const cells: MpmGranularGridCell[] = [];
  for (let row = 0; row < resolution; row += 1) {
    for (let col = 0; col < resolution; col += 1) {
      cells.push({
        x: minX + (col + 0.5) * cellWidth,
        y: minY + (row + 0.5) * cellHeight,
        mass: 0,
        vx: 0,
        vy: 0,
        occupancy: 0,
        density: 0,
      });
    }
  }
  return { resolution, minX, maxX, minY, maxY, cellWidth, cellHeight, cells, totalMass: 0, occupiedCells: 0, maxCellMass: 0, transferResidual: 0 };
}

export function resetGridState(grid: MpmGranularGridState): void {
  grid.totalMass = 0;
  grid.occupiedCells = 0;
  grid.maxCellMass = 0;
  grid.transferResidual = 0;
  for (const cell of grid.cells) {
    cell.mass = 0;
    cell.vx = 0;
    cell.vy = 0;
    cell.occupancy = 0;
    cell.density = 0;
  }
}

export function getGridColRow(grid: MpmGranularGridState, x: number, y: number): { col: number; row: number } {
  const col = Math.max(0, Math.min(grid.resolution - 1, Math.floor((x - grid.minX) / grid.cellWidth)));
  const row = Math.max(0, Math.min(grid.resolution - 1, Math.floor((y - grid.minY) / grid.cellHeight)));
  return { col, row };
}

export function getGridIndex(grid: MpmGranularGridState, col: number, row: number): number {
  return row * grid.resolution + col;
}

export function getCellVelocity(grid: MpmGranularGridState, col: number, row: number): { vx: number; vy: number } {
  const safeCol = Math.max(0, Math.min(grid.resolution - 1, col));
  const safeRow = Math.max(0, Math.min(grid.resolution - 1, row));
  const cell = grid.cells[getGridIndex(grid, safeCol, safeRow)];
  return { vx: cell.vx, vy: cell.vy };
}
