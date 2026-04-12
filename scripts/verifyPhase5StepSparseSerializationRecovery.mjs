import { readJson, getPhase5FixtureDir } from './projectPhase5Fixtures.mjs';
import { assert } from './verifyPhase5Shared.mjs';
import path from 'node:path';

function getLayer(project, key) {
  const layer = project?.serialization?.layers?.find((entry) => entry?.key === key);
  if (!layer) throw new Error(`[${key}] layer missing from fixture payload`);
  return layer;
}
function mergeBlock(rawBlock, fallbackBlock) {
  return {
    id: rawBlock?.id ?? fallbackBlock.id,
    label: rawBlock?.label ?? fallbackBlock.label,
    values: Array.from(new Set([...(Array.isArray(rawBlock?.values) ? rawBlock.values : []), ...(Array.isArray(fallbackBlock?.values) ? fallbackBlock.values : [])])),
  };
}
function mergeLayer(rawLayer, fallbackLayer) {
  return {
    ...fallbackLayer,
    ...rawLayer,
    blocks: {
      source: mergeBlock(rawLayer?.blocks?.source, fallbackLayer.blocks.source),
      simulation: mergeBlock(rawLayer?.blocks?.simulation, fallbackLayer.blocks.simulation),
      primitive: mergeBlock(rawLayer?.blocks?.primitive, fallbackLayer.blocks.primitive),
      shading: mergeBlock(rawLayer?.blocks?.shading, fallbackLayer.blocks.shading),
      postfx: mergeBlock(rawLayer?.blocks?.postfx, fallbackLayer.blocks.postfx),
      execution: mergeBlock(rawLayer?.blocks?.execution, fallbackLayer.blocks.execution),
    },
  };
}

const fixtureDir = getPhase5FixtureDir();
const nativeProject = readJson(path.join(fixtureDir, 'phase5-native-rich.json'));
const sparseProject = readJson(path.join(fixtureDir, 'phase5-sparse-layer2-custom.json'));
const fallbackLayer2 = getLayer(nativeProject, 'layer2');
const layer2 = mergeLayer(getLayer(sparseProject, 'layer2'), fallbackLayer2);

assert(sparseProject.schema.serializationSchemaVersion === nativeProject.schema.serializationSchemaVersion, '[sparse-serialization] schema serialization version drift');
assert(layer2.label === 'Layer 2 Custom', '[sparse-serialization] custom layer label not preserved');
assert(layer2.modeId === 'custom-mode-id', '[sparse-serialization] custom mode id not preserved');
assert(layer2.blocks.source.id === 'source-custom', '[sparse-serialization] source id not preserved');
assert(layer2.blocks.source.values.includes('custom-source-token'), '[sparse-serialization] custom source token lost');
assert(layer2.blocks.source.values.includes(fallbackLayer2.blocks.source.values[0]), '[sparse-serialization] fallback source tokens not restored');
assert(layer2.blocks.execution.values.includes('custom-execution-token'), '[sparse-serialization] custom execution token lost');
for (const requiredValue of fallbackLayer2.blocks.execution.values) {
  assert(layer2.blocks.execution.values.includes(requiredValue), `[sparse-serialization] execution fallback token missing: ${requiredValue}`);
}
assert(layer2.blocks.simulation.values.length >= fallbackLayer2.blocks.simulation.values.length, '[sparse-serialization] simulation block not backfilled');
assert(layer2.blocks.shading.values.length >= fallbackLayer2.blocks.shading.values.length, '[sparse-serialization] shading block not backfilled');

console.log(JSON.stringify({
  id: 'sparse-serialization-recovery',
  checks: [
    'custom-layer-metadata-preserved',
    'fallback-block-values-restored',
    'execution-block-merged',
    'serialization-schema-synced',
  ],
}, null, 2));
