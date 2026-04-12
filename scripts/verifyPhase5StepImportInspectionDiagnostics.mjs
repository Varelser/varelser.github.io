import { readFileSync } from 'node:fs';
import path from 'node:path';
import { assert } from './verifyPhase5Shared.mjs';

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function inspectProjectDataTextFast(text) {
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return {
      parsed: null,
      errorCode: 'invalid-json',
      message: 'Invalid project JSON syntax.',
    };
  }

  if (!isPlainObject(payload)
    || !Array.isArray(payload.presets)
    || !Array.isArray(payload.presetSequence)
    || !isPlainObject(payload.schema)
    || !isPlainObject(payload.serialization)
    || !Array.isArray(payload.serialization.layers)
    || !isPlainObject(payload.manifest)
    || !Array.isArray(payload.manifest.execution)) {
    return {
      parsed: null,
      errorCode: 'invalid-project-payload',
      message: 'JSON parsed, but this file is not a supported project export.',
    };
  }

  return {
    parsed: payload,
    errorCode: null,
    message: null,
  };
}

const invalidJson = inspectProjectDataTextFast('{');
assert(invalidJson.errorCode === 'invalid-json', '[import-inspection] invalid JSON did not report syntax error');
assert(invalidJson.message === 'Invalid project JSON syntax.', '[import-inspection] invalid JSON message mismatch');

const unsupportedPayload = inspectProjectDataTextFast(JSON.stringify({ foo: 'bar' }));
assert(unsupportedPayload.errorCode === 'invalid-project-payload', '[import-inspection] unsupported payload did not report project payload error');
assert(unsupportedPayload.message === 'JSON parsed, but this file is not a supported project export.', '[import-inspection] unsupported payload message mismatch');

const validPayloadText = readFileSync(path.resolve(process.cwd(), 'fixtures/project-state/phase5-native-rich.json'), 'utf8');
const validPayload = inspectProjectDataTextFast(validPayloadText);
assert(validPayload.parsed, '[import-inspection] valid project payload was not parsed');
assert(validPayload.errorCode === null, '[import-inspection] valid project payload reported error');

console.log(JSON.stringify({
  id: 'import-inspection-diagnostics',
  checks: [
    'invalid-json-detected',
    'unsupported-project-payload-detected',
    'valid-project-payload-accepted',
  ],
}, null, 2));
