import type { RopeExtendedRefinementInput, RopeRefinementState } from "./futureNativeSceneBridgeRopeRefinementTypes";
import type { RopeMetricMap } from "./futureNativeSceneBridgeRopeShared";

export function buildRopeRefinementPhaseOne(
  input: RopeExtendedRefinementInput,
  state: RopeRefinementState,
  metrics: RopeMetricMap,
): void {
  const {
    snapSize,
    lines,
    tensionFieldPoints,
    snapClusterPoints,
    breakClusterPoints,
    looseEndFieldPoints,
    entanglementShellPoints,
    profile,
    resolvers,
  } = input;

  for (let index = 0; index < snapClusterPoints.length; index += 1) {
    const cluster = snapClusterPoints[index];
    const refineA = {
      x: cluster.x - snapSize,
      y: cluster.y + snapSize * 1.5,
      z: cluster.z - snapSize * profile.knotShellClusterZ,
    };
    const refineB = {
      x: cluster.x + snapSize,
      y: cluster.y + snapSize * 1.5,
      z: cluster.z + snapSize * profile.knotShellClusterZ,
    };
    state.snapPhaseFieldPoints.push(refineA, refineB);
    lines.push({ a: cluster, b: refineA });
    lines.push({ a: cluster, b: refineB });
    lines.push({ a: refineA, b: refineB });
    metrics.snapPhaseFieldRefinementCount += 1;
  }

  for (let index = 0; index < entanglementShellPoints.length; index += 1) {
    const shell = entanglementShellPoints[index];
    const clusterA = {
      x: shell.x - snapSize * profile.knotShellClusterX,
      y: shell.y + snapSize * profile.knotShellClusterY,
      z: shell.z - snapSize * profile.knotShellClusterZ,
    };
    const clusterB = {
      x: shell.x + snapSize * profile.knotShellClusterX,
      y: shell.y + snapSize * profile.knotShellClusterY,
      z: shell.z + snapSize * profile.knotShellClusterZ,
    };
    state.knotShellClusterPoints.push(clusterA, clusterB);
    lines.push({ a: shell, b: clusterA });
    lines.push({ a: shell, b: clusterB });
    lines.push({ a: clusterA, b: clusterB });
    metrics.knotShellClusterCount += 1;
  }

  for (let index = 0; index < looseEndFieldPoints.length; index += 2) {
    const left = looseEndFieldPoints[index];
    const right = looseEndFieldPoints[index + 1];
    if (!left || !right) continue;
    const swirl = {
      x: (left.x + right.x) * 0.5,
      y: Math.min(left.y, right.y) - snapSize * profile.looseEndTurbulenceY,
      z: (left.z + right.z) * 0.5,
    };
    state.looseEndTurbulencePoints.push(swirl);
    lines.push({ a: left, b: swirl });
    lines.push({ a: right, b: swirl });
    metrics.looseEndTurbulenceLayerCount += 1;
  }

  for (let index = 0; index < state.snapPhaseFieldPoints.length; index += 2) {
    const shellA = state.snapPhaseFieldPoints[index];
    const shellB = state.snapPhaseFieldPoints[index + 1];
    if (!shellA || !shellB) continue;
    const shellPeak = {
      x: (shellA.x + shellB.x) * 0.5,
      y: Math.max(shellA.y, shellB.y) + snapSize * profile.snapPhaseShellY,
      z: (shellA.z + shellB.z) * 0.5,
    };
    state.snapPhaseShellPoints.push(shellPeak);
    lines.push({ a: shellA, b: shellPeak });
    lines.push({ a: shellB, b: shellPeak });
    metrics.snapPhaseShellSplitCount += 1;
  }

  for (let index = 0; index < tensionFieldPoints.length - 2; index += 3) {
    const a = tensionFieldPoints[index];
    const b = tensionFieldPoints[index + 1];
    const c = tensionFieldPoints[index + 2];
    const refine = {
      x: (a.x + c.x) * 0.5,
      y: (a.y + b.y + c.y) / 3 + snapSize * profile.tensionFieldBraidY,
      z: (a.z + c.z) * 0.5,
    };
    state.tensionFieldBraidPoints.push(refine);
    lines.push({ a, b: refine });
    lines.push({ a: c, b: refine });
    lines.push({ a: b, b: refine });
    metrics.tensionFieldBraidRefinementCount += 1;
  }

  for (let index = 0; index < state.snapPhaseShellPoints.length; index += 1) {
    const shellPeak = state.snapPhaseShellPoints[index];
    const refine = {
      x: shellPeak.x,
      y: shellPeak.y + snapSize * profile.breakShellRefinementY,
      z:
        shellPeak.z +
        ((index % 2 === 0 ? 1 : -1) * snapSize * profile.breakShellRefinementZ),
    };
    state.breakShellRefinementPoints.push(refine);
    lines.push({ a: shellPeak, b: refine });
    metrics.breakShellRefinementCount += 1;
  }

  for (let index = 0; index < state.looseEndTurbulencePoints.length; index += 1) {
    const swirl = state.looseEndTurbulencePoints[index];
    const splitA = {
      x: swirl.x - snapSize * profile.entanglementSplitX,
      y: swirl.y - snapSize * profile.entanglementSplitY,
      z: swirl.z + snapSize * profile.entanglementSplitZ,
    };
    const splitB = {
      x: swirl.x + snapSize * profile.entanglementSplitX,
      y: swirl.y - snapSize * profile.entanglementSplitY,
      z: swirl.z - snapSize * profile.entanglementSplitZ,
    };
    state.entanglementTurbulenceSplitPoints.push(splitA, splitB);
    lines.push({ a: swirl, b: splitA });
    lines.push({ a: swirl, b: splitB });
    lines.push({ a: splitA, b: splitB });
    metrics.entanglementTurbulenceSplitCount += 1;
  }

  for (let index = 0; index < state.knotShellClusterPoints.length; index += 2) {
    const clusterA = state.knotShellClusterPoints[index];
    const clusterB = state.knotShellClusterPoints[index + 1];
    if (!clusterA || !clusterB) continue;
    const refine = {
      x: (clusterA.x + clusterB.x) * 0.5,
      y: Math.max(clusterA.y, clusterB.y) + snapSize * profile.knotTurbulenceY,
      z:
        (clusterA.z + clusterB.z) * 0.5 +
        ((index / 2) % 2 === 0 ? 1 : -1) * snapSize * profile.knotTurbulenceZ,
    };
    state.knotTurbulenceRefinementPoints.push(refine);
    lines.push({ a: clusterA, b: refine });
    lines.push({ a: clusterB, b: refine });
    metrics.knotTurbulenceRefinementCount += 1;
  }

  for (let index = 0; index < breakClusterPoints.length - 1; index += 2) {
    const breakA = breakClusterPoints[index];
    const breakB = breakClusterPoints[index + 1];
    if (!breakA || !breakB) continue;
    const split = {
      x: (breakA.x + breakB.x) * 0.5,
      y: (breakA.y + breakB.y) * 0.5 + snapSize * profile.breakFieldBraidY,
      z:
        (breakA.z + breakB.z) * 0.5 +
        ((index / 2) % 2 === 0 ? 1 : -1) * snapSize * profile.breakFieldBraidZ,
    };
    state.breakFieldBraidSplitPoints.push(split);
    lines.push({ a: breakA, b: split });
    lines.push({ a: breakB, b: split });
    lines.push({
      a: split,
      b:
        tensionFieldPoints[
          Math.min(index, Math.max(0, tensionFieldPoints.length - 1))
        ] ?? split,
    });
    metrics.breakFieldBraidSplitCount += 1;
  }

  for (let index = 0; index < entanglementShellPoints.length; index += 1) {
    const shell = entanglementShellPoints[index];
    const field = resolvers.resolveShellField(index, state) ?? shell;
    const coupling = {
      x: (shell.x + field.x) * 0.5,
      y: (shell.y + field.y) * 0.5 + snapSize * profile.shellFieldCouplingY,
      z: (shell.z + field.z) * 0.5,
    };
    state.shellFieldCouplingPoints.push(coupling);
    lines.push({ a: shell, b: coupling });
    lines.push({ a: field, b: coupling });
    metrics.shellFieldCouplingCount += 1;
  }
}
