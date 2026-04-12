import assert from 'node:assert/strict';
import { normalizeConfig } from '../../lib/appStateConfig';
import { isHydrationPlaceholderConfig } from '../../lib/initialConfigHydration';

export async function main() {
  assert.equal(isHydrationPlaceholderConfig(normalizeConfig({})), true);
  assert.equal(isHydrationPlaceholderConfig(normalizeConfig({
    layer2Type: 'curl',
    layer2Count: 28000,
    layer3Enabled: true,
  })), false);
}
