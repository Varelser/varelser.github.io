import { runVerificationSteps } from './verifyPhase5Runtime';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { assert } from './verifyPhase5Shared';

function readFixture(fileName: string) {
  const fixtureDir = path.resolve(process.cwd(), 'fixtures/project-state');
  return JSON.parse(readFileSync(path.join(fixtureDir, fileName), 'utf8')) as any;
}
function getLayer(project: any, key: string) {
  const layer = project?.serialization?.layers?.find((entry: any) => entry?.key === key);
  if (!layer) throw new Error(`[${key}] layer missing from fixture payload`);
  return layer;
}
function verifySparseSerializationRecoveryLight() {
  const project = readFixture('phase5-native-rich.json');
  const parsed = readFixture('phase5-sparse-layer2-custom.json');
  const layer2 = getLayer(parsed, 'layer2');
  const fallbackLayer2 = getLayer(project, 'layer2');
  assert(parsed.schema.serializationSchemaVersion === project.schema.serializationSchemaVersion, '[sparse-serialization] schema serialization version drift');
  assert(layer2.label === 'Layer 2 Custom', '[sparse-serialization] custom layer label not preserved');
  assert(layer2.modeId === 'custom-mode-id', '[sparse-serialization] custom mode id not preserved');
  assert(layer2.blocks.source.id === 'source-custom', '[sparse-serialization] source id not preserved');
  assert(layer2.blocks.source.values.includes('custom-source-token'), '[sparse-serialization] custom source token lost');
  assert(layer2.blocks.source.values.includes(fallbackLayer2.blocks.source.values[0]), '[sparse-serialization] fallback source tokens not restored');
  assert(layer2.blocks.execution.values.includes('custom-execution-token'), '[sparse-serialization] custom execution token lost');
  for (const requiredValue of fallbackLayer2.blocks.execution.values) assert(layer2.blocks.execution.values.includes(requiredValue), `[sparse-serialization] execution fallback token missing: ${requiredValue}`);
  assert(layer2.blocks.simulation.values.length >= fallbackLayer2.blocks.simulation.values.length, '[sparse-serialization] simulation block not backfilled');
  assert(layer2.blocks.shading.values.length >= fallbackLayer2.blocks.shading.values.length, '[sparse-serialization] shading block not backfilled');
  return { id: 'sparse-serialization-recovery', checks: ['custom-layer-metadata-preserved','fallback-block-values-restored','execution-block-merged','serialization-schema-synced'] };
}
export async function main() { console.log(JSON.stringify(runVerificationSteps('sparse-serialization-recovery', 'verify-phase5', [{ id: 'sparse-serialization-recovery', run: verifySparseSerializationRecoveryLight }]), null, 2)); }
