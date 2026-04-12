import crypto from 'node:crypto';

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function stableJsonStringify(value) {
  const normalize = (input) => {
    if (Array.isArray(input)) return input.map((item) => normalize(item));
    if (input && typeof input === 'object') {
      return Object.fromEntries(Object.entries(input).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, normalize(item)]));
    }
    return input;
  };
  return `${JSON.stringify(normalize(value), null, 2)}\n`;
}

export function createHash(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : stableJsonStringify(value)).digest('hex');
}
