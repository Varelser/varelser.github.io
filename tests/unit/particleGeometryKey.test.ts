import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';
import { buildParticleGeometryKey } from '../../components/sceneParticleSystemShared';

export async function main() {
  const baseConfig = {
    ...DEFAULT_CONFIG,
    layer2Enabled: true,
    layer2Source: 'text' as const,
    layer2Type: 'glyph_weave' as const,
    layer2MediaLumaMap: [0.1, 0.5, 0.9, 0.2],
    layer2MediaMapWidth: 2,
    layer2MediaMapHeight: 2,
    layer2MediaThreshold: 0.45,
    layer2MediaDepth: 0.65,
    layer2MediaInvert: false,
    renderQuality: 'balanced' as const,
  };

  const baseKey = buildParticleGeometryKey(baseConfig, 2, false, 'aux');
  const visualOnlyKey = buildParticleGeometryKey({ ...baseConfig, layer2Color: '#ff0000' }, 2, false, 'aux');
  const thresholdKey = buildParticleGeometryKey({ ...baseConfig, layer2MediaThreshold: 0.6 }, 2, false, 'aux');
  const mediaMapKey = buildParticleGeometryKey({ ...baseConfig, layer2MediaLumaMap: [0.1, 0.7, 0.9, 0.2] }, 2, false, 'aux');
  const renderQualityKey = buildParticleGeometryKey({ ...baseConfig, renderQuality: 'draft' }, 2, false, 'aux');

  assert.equal(visualOnlyKey, baseKey);
  assert.notEqual(thresholdKey, baseKey);
  assert.notEqual(mediaMapKey, baseKey);
  assert.notEqual(renderQualityKey, baseKey);
}
