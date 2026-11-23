import test from 'node:test';
import assert from 'node:assert/strict';
import { removeViewerLifecycle } from './removeViewerLifecycle.js';

function setup(overrides = {}) {
  const calls = [];
  const guest = { id: 'viewer-1', activeKons: 'kons-2' };
  const options = {
    guest, name: 'viewer_a',
    endKons: (...args) => calls.push(['endKons', ...args]),
    removeCustomer: (...args) => calls.push(['removeCustomer', ...args]),
    deleteViewer: (...args) => calls.push(['deleteViewer', ...args]),
    deleteLastCommand: (...args) => calls.push(['deleteLastCommand', ...args]),
    updateHud: () => calls.push(['updateHud']),
    onCleanupError: () => calls.push(['cleanupError']),
    ...overrides
  };
  return { calls, guest, options };
}

test('viewer removal closes kons, scene actor and authoritative state', () => {
  const { calls, guest, options } = setup();
  assert.equal(removeViewerLifecycle(options), true);
  assert.deepEqual(calls, [
    ['endKons', 'kons-2', 'viewer_a'],
    ['removeCustomer', guest.id],
    ['deleteViewer', 'viewer_a'],
    ['deleteLastCommand', 'viewer_a'],
    ['updateHud']
  ]);
});

test('scene removal failure still clears viewer state and refreshes HUD', () => {
  const { calls, options } = setup({
    removeCustomer: () => { calls.push(['removeCustomer']); throw new Error('scene disposal'); }
  });
  assert.equal(removeViewerLifecycle(options), false);
  assert.deepEqual(calls.map(call => call[0]), [
    'endKons', 'removeCustomer', 'cleanupError',
    'deleteViewer', 'deleteLastCommand', 'updateHud'
  ]);
});

test('kons cleanup failure does not prevent scene and state removal', () => {
  const { calls, options } = setup({
    endKons: () => { calls.push(['endKons']); throw new Error('timer cleanup'); }
  });
  assert.equal(removeViewerLifecycle(options), false);
  assert.deepEqual(calls.map(call => call[0]), [
    'endKons', 'cleanupError', 'removeCustomer',
    'deleteViewer', 'deleteLastCommand', 'updateHud'
  ]);
});

test('viewer without active kons is removed without calling kons lifecycle', () => {
  const { calls, options } = setup({ guest: { id: 'viewer-2' } });
  assert.equal(removeViewerLifecycle(options), true);
  assert.equal(calls.some(call => call[0] === 'endKons'), false);
});

test('missing viewer is a no-op', () => {
  const { calls, options } = setup({ guest: null });
  assert.equal(removeViewerLifecycle(options), false);
  assert.deepEqual(calls, []);
});
