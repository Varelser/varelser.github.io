import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';
import { buildComparePreviewConfig } from '../../components/AppComparePreview';

export async function main() {
  const baseConfig = {
    ...DEFAULT_CONFIG,
    renderQuality: 'cinematic' as const,
    autoLod: false,
    postBloomEnabled: true,
    postChromaticAberrationEnabled: true,
    postBrightnessContrastEnabled: true,
    postDofEnabled: true,
    postNoiseEnabled: true,
    postVignetteEnabled: true,
    postN8aoEnabled: true,
    layer2Type: 'growth_field' as const,
    layer3Type: 'pressure_cells' as const,
  };

  const previewConfig = buildComparePreviewConfig(baseConfig);

  assert.equal(previewConfig.renderQuality, 'draft');
  assert.equal(previewConfig.autoLod, true);
  assert.equal(previewConfig.postBloomEnabled, false);
  assert.equal(previewConfig.postChromaticAberrationEnabled, false);
  assert.equal(previewConfig.postBrightnessContrastEnabled, false);
  assert.equal(previewConfig.postDofEnabled, false);
  assert.equal(previewConfig.postNoiseEnabled, false);
  assert.equal(previewConfig.postVignetteEnabled, false);
  assert.equal(previewConfig.postN8aoEnabled, false);
  assert.equal(previewConfig.layer2Type, baseConfig.layer2Type);
  assert.equal(previewConfig.layer3Type, baseConfig.layer3Type);
}
