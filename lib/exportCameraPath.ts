import type { CameraPathSlot, CameraRigApi } from "../types/cameraPath";

export type ExportCameraPathPlan = {
  enabled: boolean;
  slots: CameraPathSlot[];
};

export function getExportCameraPathPoses(plan: ExportCameraPathPlan | null | undefined, exportMode: "current" | "sequence") {
  if (!plan?.enabled || exportMode !== "current") {
    return [];
  }
  return plan.slots
    .filter((slot): slot is NonNullable<CameraPathSlot> => slot !== null)
    .map((slot) => slot.pose);
}

export function getExportCameraPathSlotCount(plan: ExportCameraPathPlan | null | undefined) {
  return getExportCameraPathPoses(plan, "current").length;
}

export function startExportCameraPathPlayback(args: {
  rigApi: CameraRigApi | null | undefined;
  plan: ExportCameraPathPlan | null | undefined;
  exportMode: "current" | "sequence";
  durationSeconds: number;
}) {
  const poses = getExportCameraPathPoses(args.plan, args.exportMode);
  if (!args.rigApi || poses.length < 2) {
    return false;
  }
  return args.rigApi.playSequence(poses, {
    durationSeconds: Math.max(0.5, args.durationSeconds),
    loop: false,
  });
}
