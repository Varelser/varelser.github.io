import assert from 'node:assert/strict';
import { scheduleDeferredHydration } from '../../lib/scheduleDeferredHydration';

export async function main() {
  const originalWindow = (globalThis as { window?: unknown }).window;
  const timeoutCalls: number[] = [];
  let clearedId: number | null = null;
  let timeoutCallback: (() => void) | null = null;

  (globalThis as { window?: unknown }).window = {
    setTimeout(callback: () => void, delay: number) {
      timeoutCalls.push(delay);
      timeoutCallback = callback;
      return 73;
    },
    clearTimeout(id: number) {
      clearedId = id;
    },
  };

  let invoked = 0;
  const cleanup = scheduleDeferredHydration(() => {
    invoked += 1;
  }, 2400);

  assert.deepEqual(timeoutCalls, [2400]);
  assert.equal(invoked, 0);
  const capturedTimeoutCallback = timeoutCallback as (() => void) | null;
  assert.ok(capturedTimeoutCallback);
  capturedTimeoutCallback();
  assert.equal(invoked, 1);
  cleanup();
  assert.equal(clearedId, 73);

  (globalThis as { window?: unknown }).window = originalWindow;
}
