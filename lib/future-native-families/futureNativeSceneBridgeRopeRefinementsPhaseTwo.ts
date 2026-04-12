import type { RopeExtendedRefinementInput, RopeRefinementState } from "./futureNativeSceneBridgeRopeRefinementTypes";
import type { RopeMetricMap } from "./futureNativeSceneBridgeRopeShared";

export function buildRopeRefinementPhaseTwo(
  input: RopeExtendedRefinementInput,
  state: RopeRefinementState,
  metrics: RopeMetricMap,
): void {
  const { snapSize, lines, breakClusterPoints, looseEndFieldPoints, entanglementShellPoints, profile } = input;

  for (
    let index = 0;
    index < state.looseEndTurbulencePoints.length && index < breakClusterPoints.length;
    index += 1
  ) {
    const wake = state.looseEndTurbulencePoints[index];
    const breakPoint = breakClusterPoints[index];
    const splitA = {
      x: wake.x - snapSize * profile.looseEndWakeX,
      y: wake.y - snapSize * profile.looseEndWakeY,
      z: wake.z + snapSize * profile.looseEndWakeZ,
    };
    const splitB = {
      x: wake.x + snapSize * profile.looseEndWakeX,
      y: wake.y - snapSize * profile.looseEndWakeY,
      z: wake.z - snapSize * profile.looseEndWakeZ,
    };
    state.looseEndWakeSplitPoints.push(splitA, splitB);
    lines.push({ a: wake, b: splitA });
    lines.push({ a: wake, b: splitB });
    lines.push({ a: splitA, b: breakPoint });
    lines.push({ a: splitB, b: breakPoint });
    metrics.looseEndWakeSplitCount += 1;
  }

  for (
    let index = 0;
    index < state.knotTurbulenceRefinementPoints.length &&
    index < state.looseEndWakeSplitPoints.length;
    index += 1
  ) {
    const knotWake = state.knotTurbulenceRefinementPoints[index];
    const wake = state.looseEndWakeSplitPoints[index];
    const cluster = {
      x: (knotWake.x + wake.x) * 0.5,
      y: Math.max(knotWake.y, wake.y) + snapSize * profile.knotWakeY,
      z: (knotWake.z + wake.z) * 0.5,
    };
    state.knotWakeClusterPoints.push(cluster);
    lines.push({ a: knotWake, b: cluster });
    lines.push({ a: wake, b: cluster });
    metrics.knotWakeClusterCount += 1;
  }

  for (
    let index = 0;
    index < state.breakShellRefinementPoints.length &&
    index < state.shellFieldCouplingPoints.length;
    index += 1
  ) {
    const shellRefine = state.breakShellRefinementPoints[index];
    const fieldCoupling = state.shellFieldCouplingPoints[index];
    const split = {
      x: (shellRefine.x + fieldCoupling.x) * 0.5,
      y: (shellRefine.y + fieldCoupling.y) * 0.5 + snapSize * profile.breakShellFieldY,
      z: (shellRefine.z + fieldCoupling.z) * 0.5,
    };
    state.breakShellFieldSplitPoints.push(split);
    lines.push({ a: shellRefine, b: split });
    lines.push({ a: fieldCoupling, b: split });
    metrics.breakShellFieldSplitCount += 1;
  }

  for (
    let index = 0;
    index < entanglementShellPoints.length &&
    index < state.looseEndWakeSplitPoints.length;
    index += 1
  ) {
    const shell = entanglementShellPoints[index];
    const wake = state.looseEndWakeSplitPoints[index];
    const braid = {
      x: (shell.x + wake.x) * 0.5,
      y: Math.max(shell.y, wake.y) + snapSize * profile.shellWakeBraidY,
      z:
        (shell.z + wake.z) * 0.5 +
        ((index % 2) * 2 - 1) * snapSize * profile.shellWakeBraidZ,
    };
    state.shellWakeBraidRefinementPoints.push(braid);
    lines.push({ a: shell, b: braid });
    lines.push({ a: wake, b: braid });
    metrics.shellWakeBraidRefinementCount += 1;
  }

  for (
    let index = 0;
    index < state.breakFieldBraidSplitPoints.length &&
    index < state.looseEndTurbulencePoints.length;
    index += 1
  ) {
    const breakField = state.breakFieldBraidSplitPoints[index];
    const turbulence = state.looseEndTurbulencePoints[index];
    const cluster = {
      x: (breakField.x + turbulence.x) * 0.5,
      y: (breakField.y + turbulence.y) * 0.5 + snapSize * profile.breakFieldTurbulenceY,
      z: (breakField.z + turbulence.z) * 0.5,
    };
    state.breakFieldTurbulenceClusterPoints.push(cluster);
    lines.push({ a: breakField, b: cluster });
    lines.push({ a: turbulence, b: cluster });
    metrics.breakFieldTurbulenceClusterCount += 1;
  }

  for (
    let index = 0;
    index < state.knotShellClusterPoints.length &&
    index < state.looseEndWakeSplitPoints.length;
    index += 1
  ) {
    const knotShell = state.knotShellClusterPoints[index];
    const wake = state.looseEndWakeSplitPoints[index];
    const refine = {
      x: (knotShell.x + wake.x) * 0.5,
      y: Math.max(knotShell.y, wake.y) + snapSize * profile.knotShellWakeY,
      z:
        (knotShell.z + wake.z) * 0.5 +
        ((index % 2) * 2 - 1) * snapSize * profile.knotShellWakeZ,
    };
    state.knotShellWakeRefinementPoints.push(refine);
    lines.push({ a: knotShell, b: refine });
    lines.push({ a: wake, b: refine });
    metrics.knotShellWakeRefinementCount += 1;
  }

  for (
    let index = 0;
    index < state.breakFieldBraidSplitPoints.length &&
    index < entanglementShellPoints.length;
    index += 1
  ) {
    const breakField = state.breakFieldBraidSplitPoints[index];
    const shell = entanglementShellPoints[index];
    const cluster = {
      x: (breakField.x + shell.x) * 0.5,
      y: (breakField.y + shell.y) * 0.5 + snapSize * profile.breakFieldShellY,
      z: (breakField.z + shell.z) * 0.5,
    };
    state.breakFieldShellClusterPoints.push(cluster);
    lines.push({ a: breakField, b: cluster });
    lines.push({ a: shell, b: cluster });
    metrics.breakFieldShellClusterCount += 1;
  }

  for (
    let index = 0;
    index < entanglementShellPoints.length &&
    index < state.looseEndTurbulencePoints.length;
    index += 1
  ) {
    const shell = entanglementShellPoints[index];
    const turbulence = state.looseEndTurbulencePoints[index];
    const refine = {
      x: (shell.x + turbulence.x) * 0.5,
      y: Math.max(shell.y, turbulence.y) + snapSize * profile.wakeShellTurbulenceY,
      z:
        (shell.z + turbulence.z) * 0.5 +
        ((index % 2) * 2 - 1) * snapSize * profile.wakeShellTurbulenceZ,
    };
    state.wakeShellTurbulenceRefinementPoints.push(refine);
    lines.push({ a: shell, b: refine });
    lines.push({ a: turbulence, b: refine });
    metrics.wakeShellTurbulenceRefinementCount += 1;
  }

  for (
    let index = 0;
    index < state.breakFieldBraidSplitPoints.length &&
    index < state.looseEndWakeSplitPoints.length;
    index += 1
  ) {
    const breakField = state.breakFieldBraidSplitPoints[index];
    const wake = state.looseEndWakeSplitPoints[index];
    const cluster = {
      x: (breakField.x + wake.x) * 0.5,
      y: (breakField.y + wake.y) * 0.5 + snapSize * profile.breakFieldWakeY,
      z: (breakField.z + wake.z) * 0.5,
    };
    state.breakFieldWakeClusterPoints.push(cluster);
    lines.push({ a: breakField, b: cluster });
    lines.push({ a: wake, b: cluster });
    metrics.breakFieldWakeClusterCount += 1;
  }

  for (
    let index = 0;
    index < state.knotWakeClusterPoints.length &&
    index < entanglementShellPoints.length;
    index += 1
  ) {
    const knotWake = state.knotWakeClusterPoints[index];
    const shell = entanglementShellPoints[index];
    const refine = {
      x: (knotWake.x + shell.x) * 0.5,
      y: Math.max(knotWake.y, shell.y) + snapSize * profile.knotWakeShellY,
      z:
        (knotWake.z + shell.z) * 0.5 +
        ((index % 2) * 2 - 1) * snapSize * profile.knotWakeShellZ,
    };
    state.knotWakeShellRefinementPoints.push(refine);
    lines.push({ a: knotWake, b: refine });
    lines.push({ a: shell, b: refine });
    metrics.knotWakeShellRefinementCount += 1;
  }

  for (
    let index = 0;
    index < state.breakFieldWakeClusterPoints.length &&
    index < state.looseEndTurbulencePoints.length;
    index += 1
  ) {
    const wakeCluster = state.breakFieldWakeClusterPoints[index];
    const turbulence = state.looseEndTurbulencePoints[index];
    const split = {
      x: (wakeCluster.x + turbulence.x) * 0.5,
      y:
        (wakeCluster.y + turbulence.y) * 0.5 +
        snapSize * profile.breakFieldWakeTurbulenceY,
      z: (wakeCluster.z + turbulence.z) * 0.5,
    };
    state.breakFieldWakeTurbulenceSplitPoints.push(split);
    lines.push({ a: wakeCluster, b: split });
    lines.push({ a: turbulence, b: split });
    metrics.breakFieldWakeTurbulenceSplitCount += 1;
  }
}
