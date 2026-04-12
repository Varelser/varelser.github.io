import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';
import { buildFutureNativeSceneBridgeRuntimeKey } from '../../lib/future-native-families/futureNativeSceneRendererBridge';

export async function main() {
  const baseConfig = {
    ...DEFAULT_CONFIG,
    layer2Enabled: true,
    layer2Type: 'cloth_membrane' as const,
    layer2Source: 'plane' as const,
    layer2Count: 9800,
    layer2BaseSize: 0.92,
    layer2RadiusScale: 1.1,
    layer2TemporalStrength: 0.24,
    layer2TemporalSpeed: 0.28,
    layer2Color: '#ffffff',
    particleColor: 'white' as const,
    backgroundColor: 'black' as const,
  };

  const baseKey = buildFutureNativeSceneBridgeRuntimeKey(baseConfig, 2);
  const visualOnlyKey = buildFutureNativeSceneBridgeRuntimeKey({ ...baseConfig, layer2Color: '#00ffff', backgroundColor: 'white' as const }, 2);
  const runtimeChangingKey = buildFutureNativeSceneBridgeRuntimeKey({ ...baseConfig, layer2TemporalStrength: 0.42 }, 2);
  const familyChangingKey = buildFutureNativeSceneBridgeRuntimeKey({ ...baseConfig, layer2Type: 'signal_braid' as const }, 2);

  assert.ok(baseKey);
  assert.equal(visualOnlyKey, baseKey);
  assert.notEqual(runtimeChangingKey, baseKey);
  assert.notEqual(familyChangingKey, baseKey);
}
