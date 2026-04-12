import { futureNativeFamilySpecs } from './futureNativeFamiliesRegistry';
import {
  listFutureNativeFamiliesByProgress,
  listFutureNativeIntegrationReadyCandidates,
  summarizeFutureNativeFamilyProgress,
} from './futureNativeFamiliesProgress';
import { buildFutureNativeFamilyAiPacket } from './futureNativeFamiliesAiPackets';

export interface FutureNativeFamilyReport {
  generatedAtIso: string;
  summary: ReturnType<typeof summarizeFutureNativeFamilyProgress>;
  topProgressFamilies: Array<{ id: string; progressPercent: number; currentStage: string }>;
  integrationReadyCandidates: Array<{ id: string; progressPercent: number; nextTargets: readonly string[] }>;
  familyPackets: Array<{ id: string; title: string; progressPercent: number; aiPacket: string }>;
}

export function buildFutureNativeFamilyReport(): FutureNativeFamilyReport {
  const progress = listFutureNativeFamiliesByProgress();
  const candidates = listFutureNativeIntegrationReadyCandidates();
  return {
    generatedAtIso: new Date().toISOString(),
    summary: summarizeFutureNativeFamilyProgress(),
    topProgressFamilies: progress.slice(0, 8).map((entry) => ({
      id: entry.id,
      progressPercent: entry.progressPercent,
      currentStage: entry.currentStage,
    })),
    integrationReadyCandidates: candidates.map((entry) => ({
      id: entry.id,
      progressPercent: entry.progressPercent,
      nextTargets: entry.nextTargets,
    })),
    familyPackets: futureNativeFamilySpecs.map((family) => ({
      id: family.id,
      title: family.title,
      progressPercent: progress.find((entry) => entry.id === family.id)?.progressPercent ?? 0,
      aiPacket: buildFutureNativeFamilyAiPacket(family.id),
    })),
  };
}

export function renderFutureNativeFamilyReportMarkdown(): string {
  const report = buildFutureNativeFamilyReport();
  const lines: string[] = [];
  lines.push('# Future Native Families Progress Report');
  lines.push('');
  lines.push(`Generated: ${report.generatedAtIso}`);
  lines.push('');
  lines.push('## Summary');
  lines.push(`- Total families: ${report.summary.totalFamilies}`);
  lines.push(`- Native starter families: ${report.summary.nativeStarterFamilies}`);
  lines.push(`- Verification-ready families: ${report.summary.verificationReadyFamilies}`);
  lines.push(`- Average progress: ${report.summary.averageProgressPercent.toFixed(1)}%`);
  lines.push(`- First-wave average: ${report.summary.firstWaveAverage.toFixed(1)}%`);
  lines.push('');
  lines.push('## Group averages');
  for (const [group, value] of Object.entries(report.summary.byGroupAverage)) {
    lines.push(`- ${group}: ${value.toFixed(1)}%`);
  }
  lines.push('');
  lines.push('## Integration-ready candidates');
  for (const candidate of report.integrationReadyCandidates) {
    lines.push(`### ${candidate.id} (${candidate.progressPercent}%)`);
    for (const target of candidate.nextTargets) {
      lines.push(`- ${target}`);
    }
  }
  lines.push('');
  lines.push('## Family packets');
  for (const packet of report.familyPackets) {
    lines.push(`### ${packet.title} (${packet.id}) — ${packet.progressPercent}%`);
    lines.push('```text');
    lines.push(packet.aiPacket.trimEnd());
    lines.push('```');
    lines.push('');
  }
  return lines.join('\n');
}
