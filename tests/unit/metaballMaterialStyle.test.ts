import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';
import { buildMetaballMaterialStyleState } from '../../components/sceneMetaballSystemShared';

export async function main() {
  const baseConfig = {
    ...DEFAULT_CONFIG,
    gpgpuMetaballEnabled: true,
    gpgpuMetaballColor: '#88aaff',
    gpgpuMetaballOpacity: 0.82,
    gpgpuMetaballMetalness: 0.44,
    gpgpuMetaballRoughness: 0.36,
    gpgpuMetaballWireframe: false,
  };

  const classicState = buildMetaballMaterialStyleState({
    ...baseConfig,
    gpgpuMetaballStyle: 'classic',
  });
  const glassState = buildMetaballMaterialStyleState({
    ...baseConfig,
    gpgpuMetaballStyle: 'glass',
  });
  const hologramState = buildMetaballMaterialStyleState({
    ...baseConfig,
    gpgpuMetaballStyle: 'hologram',
  });
  const chromeState = buildMetaballMaterialStyleState({
    ...baseConfig,
    gpgpuMetaballStyle: 'chrome',
  });
  const halftoneState = buildMetaballMaterialStyleState({
    ...baseConfig,
    gpgpuMetaballStyle: 'halftone',
  });

  assert.equal(classicState.metalness, baseConfig.gpgpuMetaballMetalness);
  assert.equal(classicState.roughness, baseConfig.gpgpuMetaballRoughness);
  assert.equal(glassState.transparent, true);
  assert.ok(glassState.roughness < classicState.roughness);
  assert.equal(hologramState.depthWrite, false);
  assert.ok(hologramState.emissiveIntensity > classicState.emissiveIntensity);
  assert.ok(chromeState.metalness > classicState.metalness);
  assert.ok(chromeState.roughness < classicState.roughness);
  assert.equal(halftoneState.flatShading, true);
  assert.ok(halftoneState.roughness > classicState.roughness);
}
