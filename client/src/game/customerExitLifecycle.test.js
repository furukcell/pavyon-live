import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanupCustomerExit } from './customerExitLifecycle.js';

function makeCleanup(overrides = {}) {
  const calls = [];
  const actor = { id: 'viewer-1' };
  const run = name => (...args) => calls.push([name, ...args]);
  const options = {
    customerId: actor.id,
    actor,
    cancelService: run('cancelService'),
    releaseDance: run('releaseDance'),
    releaseVip: run('releaseVip'),
    releaseSeat: run('releaseSeat'),
    detach: run('detach'),
    forget: run('forget'),
    dispose: run('dispose'),
    ...overrides
  };
  return { calls, actor, options };
}

test('departure releases service, both interaction modes, seat and scene actor', () => {
  const { calls, actor, options } = makeCleanup();
  assert.equal(cleanupCustomerExit(options), true);
  assert.deepEqual(calls.map(call => call[0]), [
    'cancelService', 'releaseDance', 'releaseVip', 'releaseSeat',
    'detach', 'forget', 'dispose'
  ]);
  assert.deepEqual(calls.find(call => call[0] === 'releaseSeat'), ['releaseSeat', actor]);
  assert.deepEqual(calls.find(call => call[0] === 'dispose'), ['dispose', actor]);
});

test('cleanup continues after a service or scene subsystem throws', () => {
  const { calls, options } = makeCleanup({
    cancelService: () => { throw new Error('service failure'); },
    releaseDance: () => { calls.push(['releaseDance']); },
    detach: () => { throw new Error('scene failure'); }
  });
  assert.equal(cleanupCustomerExit(options), true);
  assert.deepEqual(calls.map(call => call[0]), [
    'releaseDance', 'releaseVip', 'releaseSeat', 'forget', 'dispose'
  ]);
});

test('missing scene actor still clears queued service and stale pair reservations', () => {
  const { calls, options } = makeCleanup({ actor: null });
  assert.equal(cleanupCustomerExit(options), false);
  assert.deepEqual(calls.map(call => call[0]), [
    'cancelService', 'releaseDance', 'releaseVip'
  ]);
});

test('invalid customer id does not invoke cleanup dependencies', () => {
  const { calls, options } = makeCleanup({ customerId: '' });
  assert.equal(cleanupCustomerExit(options), false);
  assert.equal(calls.length, 0);
});
