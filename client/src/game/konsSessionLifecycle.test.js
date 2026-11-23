import test from 'node:test';
import assert from 'node:assert/strict';
import { createKonsSessionLifecycle } from './konsSessionLifecycle.js';

function setup(overrides = {}) {
  const owners = new Map([['kons-1', 'viewer-a']]);
  const guest = { id: 'customer-a', activeKons: 'kons-1', action: 'vip' };
  const calls = [];
  const lifecycle = createKonsSessionLifecycle({
    getOwner: id => owners.get(id) ?? null,
    setOwner: (id, value) => value ? owners.set(id, value) : owners.delete(id),
    cancelTimer: id => calls.push(['cancel', id]),
    releaseRules: id => calls.push(['rules', id]),
    getViewer: name => name === 'viewer-a' ? guest : null,
    releaseKons: id => calls.push(['kons', id]),
    releaseGuest: id => calls.push(['guest', id]),
    onReleased: value => calls.push(['released', value.viewer]),
    ...overrides
  });
  return { lifecycle, owners, guest, calls };
}

test('ends a session once and releases both participants', () => {
  const state = setup();
  assert.equal(state.lifecycle.end('kons-1', 'viewer-a'), true);
  assert.equal(state.owners.has('kons-1'), false);
  assert.equal(state.guest.activeKons, null);
  assert.equal(state.guest.action, 'standing');
  assert.deepEqual(state.calls.map(call => call[0]), ['cancel', 'rules', 'kons', 'guest', 'released']);
  assert.equal(state.lifecycle.end('kons-1', 'viewer-a'), false);
});

test('stale timeout cannot end a replacement viewer session', () => {
  const state = setup();
  state.owners.set('kons-1', 'viewer-b');
  assert.equal(state.lifecycle.end('kons-1', 'viewer-a'), false);
  assert.equal(state.owners.get('kons-1'), 'viewer-b');
  assert.deepEqual(state.calls, []);
});

test('cleanup continues when one subsystem throws', () => {
  const state = setup({
    cancelTimer() { throw new Error('timer failure'); },
    releaseRules() { throw new Error('rules failure'); },
    releaseKons() { throw new Error('scene failure'); }
  });
  assert.equal(state.lifecycle.end('kons-1', 'viewer-a'), true);
  assert.equal(state.owners.has('kons-1'), false);
  assert.equal(state.guest.activeKons, null);
  assert.deepEqual(state.calls.map(call => call[0]), ['guest', 'released']);
});

test('missing viewer still releases kons and reservation', () => {
  const state = setup({ getViewer: () => null });
  assert.equal(state.lifecycle.end('kons-1'), true);
  assert.equal(state.owners.has('kons-1'), false);
  assert.deepEqual(state.calls.map(call => call[0]), ['cancel', 'rules', 'kons', 'released']);
});
