import type { RopeExtendedRefinementInput, RopeRefinementState } from "./futureNativeSceneBridgeRopeRefinementTypes";
import type { RopeMetricMap } from "./futureNativeSceneBridgeRopeShared";

export function buildRopeRefinementPhaseThree(
  input: RopeExtendedRefinementInput,
  state: RopeRefinementState,
  metrics: RopeMetricMap,
): void {
  const { snapSize, lines, profile, resolvers } = input;

  for (
    let index = 0;
    index < state.wakeShellTurbulenceRefinementPoints.length;
    index += 1
  ) {
    const wakeShell = state.wakeShellTurbulenceRefinementPoints[index];
    const field = resolvers.resolveShellWakeField(index, state);
    if (!field) continue;
    const refine = {
      x: (wakeShell.x + field.x) * 0.5,
      y: Math.max(wakeShell.y, field.y) + snapSize * profile.shellWakeFieldY,
      z:
        (wakeShell.z + field.z) * 0.5 +
        ((index % 2) * 2 - 1) * snapSize * profile.shellWakeFieldZ,
    };
    state.shellWakeFieldRefinementPoints.push(refine);
    lines.push({ a: wakeShell, b: refine });
    lines.push({ a: field, b: refine });
    metrics.shellWakeFieldRefinementCount += 1;
  }

  for (let index = 0; index < state.breakFieldWakeClusterPoints.length; index += 1) {
    const wakeCluster = state.breakFieldWakeClusterPoints[index];
    const shell = resolvers.resolveBreakFieldWakeShellSource(index, state);
    if (!shell) continue;
    const cluster = {
      x: (wakeCluster.x + shell.x) * 0.5,
      y: (wakeCluster.y + shell.y) * 0.5 + snapSize * profile.breakFieldWakeShellY,
      z: (wakeCluster.z + shell.z) * 0.5,
    };
    state.breakFieldWakeShellClusterPoints.push(cluster);
    lines.push({ a: wakeCluster, b: cluster });
    lines.push({ a: shell, b: cluster });
    metrics.breakFieldWakeShellClusterCount += 1;
  }

  for (let index = 0; index < state.knotShellWakeRefinementPoints.length; index += 1) {
    const knotShellWake = state.knotShellWakeRefinementPoints[index];
    const shellWakeField = resolvers.resolveKnotShellWakeFieldSource(index, state);
    if (!shellWakeField) continue;
    const refine = {
      x: (knotShellWake.x + shellWakeField.x) * 0.5,
      y:
        Math.max(knotShellWake.y, shellWakeField.y) +
        snapSize * profile.knotShellWakeFieldY,
      z:
        (knotShellWake.z + shellWakeField.z) * 0.5 +
        ((index % 2) * 2 - 1) * snapSize * profile.knotShellWakeFieldZ,
    };
    state.knotShellWakeFieldRefinementPoints.push(refine);
    lines.push({ a: knotShellWake, b: refine });
    lines.push({ a: shellWakeField, b: refine });
    metrics.knotShellWakeFieldRefinementCount += 1;
  }

  for (let index = 0; index < state.breakFieldWakeShellClusterPoints.length; index += 1) {
    const wakeShellCluster = state.breakFieldWakeShellClusterPoints[index];
    const wakeShellTurbulence = resolvers.resolveWakeShellTurbulenceSource(index, state);
    if (!wakeShellTurbulence) continue;
    const split = {
      x: (wakeShellCluster.x + wakeShellTurbulence.x) * 0.5,
      y:
        (wakeShellCluster.y + wakeShellTurbulence.y) * 0.5 +
        snapSize * profile.breakFieldWakeShellTurbulenceY,
      z: (wakeShellCluster.z + wakeShellTurbulence.z) * 0.5,
    };
    state.breakFieldWakeShellTurbulenceSplitPoints.push(split);
    lines.push({ a: wakeShellCluster, b: split });
    lines.push({ a: wakeShellTurbulence, b: split });
    metrics.breakFieldWakeShellTurbulenceSplitCount += 1;
  }

  for (let index = 0; index < state.shellWakeFieldRefinementPoints.length; index += 1) {
    const shellWakeField = state.shellWakeFieldRefinementPoints[index];
    const braid = resolvers.resolveShellWakeFieldBraidSource(index, state);
    if (!braid) continue;
    const refine = {
      x: (shellWakeField.x + braid.x) * 0.5,
      y:
        Math.max(shellWakeField.y, braid.y) +
        snapSize * profile.shellWakeFieldBraidY,
      z:
        (shellWakeField.z + braid.z) * 0.5 +
        ((index % 2) * 2 - 1) * snapSize * profile.shellWakeFieldBraidZ,
    };
    state.shellWakeFieldBraidRefinementPoints.push(refine);
    lines.push({ a: shellWakeField, b: refine });
    lines.push({ a: braid, b: refine });
    metrics.shellWakeFieldBraidRefinementCount += 1;
  }

  for (let index = 0; index < state.breakFieldWakeShellClusterPoints.length; index += 1) {
    const wakeShell = state.breakFieldWakeShellClusterPoints[index];
    const field = resolvers.resolveBreakFieldWakeShellFieldSource(index, state);
    if (!field) continue;
    const cluster = {
      x: (wakeShell.x + field.x) * 0.5,
      y:
        (wakeShell.y + field.y) * 0.5 +
        snapSize * profile.breakFieldWakeShellFieldY,
      z: (wakeShell.z + field.z) * 0.5,
    };
    state.breakFieldWakeShellFieldClusterPoints.push(cluster);
    lines.push({ a: wakeShell, b: cluster });
    lines.push({ a: field, b: cluster });
    metrics.breakFieldWakeShellFieldClusterCount += 1;
  }

  for (let index = 0; index < state.knotShellWakeFieldRefinementPoints.length; index += 1) {
    const knotShellWakeField = state.knotShellWakeFieldRefinementPoints[index];
    const shellWakeFieldBraid =
      resolvers.resolveKnotShellWakeFieldBraidSource(index, state);
    if (!shellWakeFieldBraid) continue;
    const refine = {
      x: (knotShellWakeField.x + shellWakeFieldBraid.x) * 0.5,
      y:
        Math.max(knotShellWakeField.y, shellWakeFieldBraid.y) +
        snapSize * profile.knotShellWakeFieldBraidY,
      z:
        (knotShellWakeField.z + shellWakeFieldBraid.z) * 0.5 +
        ((index % 2) * 2 - 1) * snapSize * profile.knotShellWakeFieldBraidZ,
    };
    state.knotShellWakeFieldBraidRefinementPoints.push(refine);
    lines.push({ a: knotShellWakeField, b: refine });
    lines.push({ a: shellWakeFieldBraid, b: refine });
    metrics.knotShellWakeFieldBraidRefinementCount += 1;
  }

  for (
    let index = 0;
    index < state.breakFieldWakeShellFieldClusterPoints.length;
    index += 1
  ) {
    const fieldCluster = state.breakFieldWakeShellFieldClusterPoints[index];
    const turbulence =
      resolvers.resolveBreakFieldWakeShellFieldTurbulenceSource(index, state);
    if (!turbulence) continue;
    const cluster = {
      x: (fieldCluster.x + turbulence.x) * 0.5,
      y:
        (fieldCluster.y + turbulence.y) * 0.5 +
        snapSize * profile.breakFieldWakeShellFieldTurbulenceY,
      z: (fieldCluster.z + turbulence.z) * 0.5,
    };
    state.breakFieldWakeShellFieldTurbulenceClusterPoints.push(cluster);
    lines.push({ a: fieldCluster, b: cluster });
    lines.push({ a: turbulence, b: cluster });
    metrics.breakFieldWakeShellFieldTurbulenceClusterCount += 1;
  }

  for (
    let index = 0;
    index < state.shellWakeFieldBraidRefinementPoints.length &&
    index < state.wakeShellTurbulenceRefinementPoints.length;
    index += 1
  ) {
    const braidField = state.shellWakeFieldBraidRefinementPoints[index];
    const turbulence = state.wakeShellTurbulenceRefinementPoints[index];
    const refine = {
      x: (braidField.x + turbulence.x) * 0.5,
      y:
        Math.max(braidField.y, turbulence.y) +
        snapSize * profile.shellWakeFieldBraidTurbulenceY,
      z:
        (braidField.z + turbulence.z) * 0.5 +
        ((index % 2) * 2 - 1) * snapSize * profile.shellWakeFieldBraidTurbulenceZ,
    };
    state.shellWakeFieldBraidTurbulenceRefinementPoints.push(refine);
    lines.push({ a: braidField, b: refine });
    lines.push({ a: turbulence, b: refine });
    metrics.shellWakeFieldBraidTurbulenceRefinementCount += 1;
  }

  for (
    let index = 0;
    index < state.breakFieldWakeShellFieldTurbulenceClusterPoints.length &&
    index < state.breakFieldWakeShellTurbulenceSplitPoints.length;
    index += 1
  ) {
    const cluster = state.breakFieldWakeShellFieldTurbulenceClusterPoints[index];
    const splitBase = state.breakFieldWakeShellTurbulenceSplitPoints[index];
    const split = {
      x: (cluster.x + splitBase.x) * 0.5,
      y:
        (cluster.y + splitBase.y) * 0.5 +
        snapSize * profile.breakFieldWakeShellFieldTurbulenceSplitY,
      z: (cluster.z + splitBase.z) * 0.5,
    };
    state.breakFieldWakeShellFieldTurbulenceSplitPoints.push(split);
    lines.push({ a: cluster, b: split });
    lines.push({ a: splitBase, b: split });
    metrics.breakFieldWakeShellFieldTurbulenceSplitCount += 1;
  }

  for (
    let index = 0;
    index < state.knotShellWakeFieldBraidRefinementPoints.length &&
    index < state.shellWakeFieldBraidTurbulenceRefinementPoints.length;
    index += 1
  ) {
    const braid = state.knotShellWakeFieldBraidRefinementPoints[index];
    const turbulence = state.shellWakeFieldBraidTurbulenceRefinementPoints[index];
    const refine = {
      x: (braid.x + turbulence.x) * 0.5,
      y:
        Math.max(braid.y, turbulence.y) +
        snapSize * profile.knotShellWakeFieldBraidTurbulenceY,
      z:
        (braid.z + turbulence.z) * 0.5 +
        ((index % 2) * 2 - 1) * snapSize * profile.knotShellWakeFieldBraidTurbulenceZ,
    };
    state.knotShellWakeFieldBraidTurbulenceRefinementPoints.push(refine);
    lines.push({ a: braid, b: refine });
    lines.push({ a: turbulence, b: refine });
    metrics.knotShellWakeFieldBraidTurbulenceRefinementCount += 1;
  }

  for (
    let index = 0;
    index < state.breakFieldWakeShellFieldTurbulenceSplitPoints.length &&
    index < state.breakFieldWakeShellFieldClusterPoints.length;
    index += 1
  ) {
    const split = state.breakFieldWakeShellFieldTurbulenceSplitPoints[index];
    const field = state.breakFieldWakeShellFieldClusterPoints[index];
    const cluster = {
      x: (split.x + field.x) * 0.5,
      y:
        (split.y + field.y) * 0.5 +
        snapSize * profile.breakFieldWakeShellFieldTurbulenceFieldY,
      z: (split.z + field.z) * 0.5,
    };
    state.breakFieldWakeShellFieldTurbulenceFieldClusterPoints.push(cluster);
    lines.push({ a: split, b: cluster });
    lines.push({ a: field, b: cluster });
    metrics.breakFieldWakeShellFieldTurbulenceFieldClusterCount += 1;
  }
}
