import { DEFAULT_CONFIG } from '../lib/appStateConfig';
import { buildPostFxStackPatch, POST_FX_STACK_BUNDLES } from '../lib/postFxLibrary';
import { getOrderedActivePostFxStageIds } from '../lib/postFxStack';
import { getMaterialStyleIndex, getShaderMaterialStyleIndex, getMaterialStyleUiOptions } from '../lib/materialStyle';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const ambientRelief = buildPostFxStackPatch('post-stack-ambient-relief');
const stack = { ...DEFAULT_CONFIG, ...ambientRelief };
const ordered = getOrderedActivePostFxStageIds(stack);
assert(ordered.includes('n8ao'), 'Expected N8AO stage to be active in ambient relief stack');
assert(POST_FX_STACK_BUNDLES.some((bundle) => bundle.id === 'post-stack-ambient-relief'), 'Ambient relief stack missing');
assert(getMaterialStyleIndex('ink') === 5, 'Ink style index mismatch');
assert(getMaterialStyleIndex('paper') === 6, 'Paper style index mismatch');
assert(getMaterialStyleIndex('stipple') === 7, 'Stipple style index mismatch');
assert(getShaderMaterialStyleIndex('ink') === 4, 'Ink shader style fallback mismatch');
assert(getShaderMaterialStyleIndex('paper') === 0, 'Paper shader style fallback mismatch');
assert(getShaderMaterialStyleIndex('stipple') === 4, 'Stipple shader style fallback mismatch');
const uiOptions = getMaterialStyleUiOptions().map((item) => item.val);
assert(uiOptions.includes('ink') && uiOptions.includes('paper') && uiOptions.includes('stipple'), 'Material style UI options missing new styles');
console.log('verify-n8ao-material-style-entry: ok');
