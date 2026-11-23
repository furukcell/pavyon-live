import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionTimers } from './sessionTimers.js';

function createFakeClock() {
  let nextId = 1;
  const pending = new Map();
  return {
    pending,
    setTimeoutFn(callback, delay) {
      const id = nextId++;
      pending.set(id, { callback, delay });
      return id;
    },
    clearTimeoutFn(id) { pending.delete(id); },
    fire(id) {
      const timer = pending.get(id);
      if (!timer) return false;
      pending.delete(id);
      timer.callback();
      return true;
    }
  };
}

test('expires a session once and removes its timer before callback', () => {
  const clock = createFakeClock();
  const timers = createSessionTimers(clock);
  let expired = null;
  assert.equal(timers.start('kons-1', 'viewer-a', 300_000, event => {
    expired = event;
    assert.equal(timers.has('kons-1'), false);
  }), true);
  const id = [...clock.pending.keys()][0];
  assert.equal(clock.pending.get(id).delay, 300_000);
  clock.fire(id);
  assert.deepEqual(expired, { konsId: 'kons-1', viewerId: 'viewer-a' });
  assert.equal(timers.size, 0);
});

test('cancels a viewer session when the viewer leaves', () => {
  const clock = createFakeClock();
  const timers = createSessionTimers(clock);
  let expired = false;
  timers.start('kons-1', 'viewer-a', 300_000, () => { expired = true; });
  assert.equal(timers.cancel('kons-1'), true);
  assert.equal(timers.cancel('kons-1'), false);
  assert.equal(clock.pending.size, 0);
  assert.equal(expired, false);
});

test('replacing a timer prevents the stale session from expiring', () => {
  const clock = createFakeClock();
  const timers = createSessionTimers(clock);
  const expired = [];
  timers.start('kons-1', 'viewer-a', 300_000, event => expired.push(event.viewerId));
  const staleId = [...clock.pending.keys()][0];
  timers.start('kons-1', 'viewer-b', 180_000, event => expired.push(event.viewerId));
  const currentId = [...clock.pending.keys()][0];
  assert.notEqual(staleId, currentId);
  assert.equal(timers.viewerFor('kons-1'), 'viewer-b');
  clock.fire(currentId);
  assert.deepEqual(expired, ['viewer-b']);
  assert.equal(timers.size, 0);
});

test('cancelAll clears every active session timer', () => {
  const clock = createFakeClock();
  const timers = createSessionTimers(clock);
  let expirations = 0;
  timers.start('kons-1', 'viewer-a', 300_000, () => expirations++);
  timers.start('kons-2', 'viewer-b', 180_000, () => expirations++);
  timers.cancelAll();
  assert.equal(timers.size, 0);
  assert.equal(clock.pending.size, 0);
  assert.equal(expirations, 0);
});

test('rejects invalid session timer input', () => {
  const timers = createSessionTimers();
  assert.equal(timers.start('', 'viewer-a', 100, () => {}), false);
  assert.equal(timers.start('kons-1', '', 100, () => {}), false);
  assert.equal(timers.start('kons-1', 'viewer-a', -1, () => {}), false);
  assert.equal(timers.start('kons-1', 'viewer-a', 100, null), false);
  assert.equal(timers.size, 0);
});


test('returns false and leaves no timer when the browser timer API throws', () => {
  const timers = createSessionTimers({
    setTimeoutFn() { throw new Error('timer API unavailable'); },
    clearTimeoutFn() {}
  });
  assert.equal(timers.start('kons-1', 'viewer-a', 300_000, () => {}), false);
  assert.equal(timers.has('kons-1'), false);
  assert.equal(timers.size, 0);
});

test('rejects a timer API that does not return a cancellable handle', () => {
  const timers = createSessionTimers({
    setTimeoutFn() { return undefined; },
    clearTimeoutFn() {}
  });
  assert.equal(timers.start('kons-1', 'viewer-a', 300_000, () => {}), false);
  assert.equal(timers.has('kons-1'), false);
  assert.equal(timers.size, 0);
});

test('failed replacement does not leave the previous viewer session active', () => {
  let shouldThrow = false;
  let nextId = 0;
  const pending = new Map();
  const timers = createSessionTimers({
    setTimeoutFn(callback) {
      if (shouldThrow) throw new Error('timer API unavailable');
      const id = ++nextId;
      pending.set(id, callback);
      return id;
    },
    clearTimeoutFn(id) { pending.delete(id); }
  });
  assert.equal(timers.start('kons-1', 'viewer-a', 300_000, () => {}), true);
  shouldThrow = true;
  assert.equal(timers.start('kons-1', 'viewer-b', 180_000, () => {}), false);
  assert.equal(timers.viewerFor('kons-1'), null);
  assert.equal(timers.size, 0);
  assert.equal(pending.size, 0);
});
