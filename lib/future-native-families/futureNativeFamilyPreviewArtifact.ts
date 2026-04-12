import { listFutureNativeMpmFamilyPreviews } from './futureNativeMpmFamilyPreview';
import { listFutureNativeFractureFamilyPreviews } from './futureNativeFractureFamilyPreview';
import { listFutureNativePbdFamilyPreviews } from './futureNativePbdFamilyPreview';
import { buildFutureNativeMpmDedicatedSurfaceReport } from './futureNativeMpmDedicatedSurfaceReport';
import { buildFutureNativeFractureDedicatedSurfaceReport } from './futureNativeFractureDedicatedSurfaceReport';
import { listFutureNativeVolumetricFamilyPreviews } from './futureNativeVolumetricFamilyPreview';
import { listFutureNativeSpecialistFamilyPreviews, type FutureNativeSpecialistFamilyPreview } from './futureNativeSpecialistFamilyPreview';

export function listFutureNativeFamilyPreviewArtifact(args: { specialistEntries?: FutureNativeSpecialistFamilyPreview[] } = {}) {
  const mpmDedicated = buildFutureNativeMpmDedicatedSurfaceReport();
  const fractureDedicated = buildFutureNativeFractureDedicatedSurfaceReport();
  return {
    generatedAt: new Date().toISOString(),
    mpm: listFutureNativeMpmFamilyPreviews(),
    mpmDedicated: mpmDedicated.families,
    fracture: listFutureNativeFractureFamilyPreviews(),
    fractureDedicated: fractureDedicated.families,
    pbd: listFutureNativePbdFamilyPreviews(),
    volumetric: listFutureNativeVolumetricFamilyPreviews(),
    specialist: args.specialistEntries ?? listFutureNativeSpecialistFamilyPreviews(),
  };
}

type BasicPreview = { familyId: string; routeCount: number; presetCount: number; previewSignature: string | string[] };
type MpmDedicatedPreview = { familyId: string; routeCount: number; presetCount: number; coverageLabel: string | null; averageWarmFrameCount: number; maxWarmFrameCount: number; previewSignature: string };
type FractureDedicatedPreview = { familyId: string; routeCount: number; presetCount: number; coverageLabel: string | null; averageBrokenBondCount: number; averageDebrisCount: number; maxCrackFrontRadius: number; previewSignature: string };

function renderBasicGroup(title: string, entries: BasicPreview[]) {
  return [
    `## ${title}`,
    ...entries.map((entry) => {
      const signature = Array.isArray(entry.previewSignature) ? entry.previewSignature.join(' | ') : entry.previewSignature;
      return `- ${entry.familyId}: routes=${entry.routeCount} presets=${entry.presetCount} signature=${signature}`;
    }),
    '',
  ].join('\n');
}

function renderMpmDedicatedGroup(entries: MpmDedicatedPreview[]) {
  return [
    '## MPM Dedicated Shared-Core',
    ...entries.map((entry) => `- ${entry.familyId}: routes=${entry.routeCount} presets=${entry.presetCount} coverage=${entry.coverageLabel ?? 'none'} avgWarm=${entry.averageWarmFrameCount} maxWarm=${entry.maxWarmFrameCount} signature=${entry.previewSignature}`),
    '',
  ].join('\n');
}


function renderFractureDedicatedGroup(entries: FractureDedicatedPreview[]) {
  return [
    '## Fracture Dedicated Shared-Core',
    ...entries.map((entry) => `- ${entry.familyId}: routes=${entry.routeCount} presets=${entry.presetCount} coverage=${entry.coverageLabel ?? 'none'} avgBroken=${entry.averageBrokenBondCount} avgDebris=${entry.averageDebrisCount} maxFront=${entry.maxCrackFrontRadius} signature=${entry.previewSignature}`),
    '',
  ].join('\n');
}

function renderSpecialistGroup(
  entries: ReturnType<typeof listFutureNativeSpecialistFamilyPreviews>,
) {
  return [
    '## Specialist',
    ...entries.map(
      (entry) =>
        `- ${entry.familyId}: route=${entry.routeId} adapter=${entry.selectedAdapterId} target=${entry.executionTarget} preview=${entry.previewSignature} comparison=${entry.comparisonSignature}`,
    ),
    '',
  ].join('\n');
}

export function renderFutureNativeFamilyPreviewArtifactMarkdown(payload = listFutureNativeFamilyPreviewArtifact()) {
  return [
    '# Future-Native Family Preview Artifact',
    '',
    `- generatedAt: ${payload.generatedAt}`,
    `- mpmFamilyCount: ${payload.mpm.length}`,
    `- fractureFamilyCount: ${payload.fracture.length}`,
    `- mpmDedicatedFamilyCount: ${payload.mpmDedicated.length}`,
    `- fractureDedicatedFamilyCount: ${payload.fractureDedicated.length}`,
    `- pbdFamilyCount: ${payload.pbd.length}`,
    `- volumetricFamilyCount: ${payload.volumetric.length}`,
    `- specialistFamilyCount: ${payload.specialist.length}`,
    '',
    renderBasicGroup('MPM', payload.mpm),
    renderMpmDedicatedGroup(payload.mpmDedicated),
    renderBasicGroup('Fracture', payload.fracture),
    renderFractureDedicatedGroup(payload.fractureDedicated),
    renderBasicGroup('PBD', payload.pbd),
    renderBasicGroup('Volumetric', payload.volumetric),
    renderSpecialistGroup(payload.specialist),
  ].join('\n');
}