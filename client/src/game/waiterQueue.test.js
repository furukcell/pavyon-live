import test from 'node:test';
import assert from 'node:assert/strict';
import { createWaiterQueue } from './waiterQueue.js';

test('serves requests in FIFO order', () => {
  const queue = createWaiterQueue(3);
  assert.equal(queue.enqueue('guest-a'), true);
  assert.equal(queue.enqueue('guest-b'), true);
  assert.equal(queue.dequeue(), 'guest-a');
  assert.equal(queue.dequeue(), 'guest-b');
  assert.equal(queue.dequeue(), null);
});

test('does not queue the same customer twice', () => {
  const queue = createWaiterQueue(3);
  assert.equal(queue.enqueue('guest-a'), true);
  assert.equal(queue.enqueue('guest-a'), 'duplicate');
  assert.equal(queue.size, 1);
  assert.equal(queue.dequeue(), 'guest-a');
  assert.equal(queue.enqueue('guest-a'), true);
});

test('enforces queue capacity without dropping earlier requests', () => {
  const queue = createWaiterQueue(2);
  assert.equal(queue.enqueue('guest-a'), true);
  assert.equal(queue.enqueue('guest-b'), true);
  assert.equal(queue.enqueue('guest-c'), false);
  assert.equal(queue.dequeue(), 'guest-a');
  assert.equal(queue.enqueue('guest-c'), true);
});

test('removes a queued customer and frees the slot', () => {
  const queue = createWaiterQueue(2);
  queue.enqueue('guest-a');
  queue.enqueue('guest-b');
  assert.equal(queue.remove('guest-a'), true);
  assert.equal(queue.remove('guest-a'), false);
  assert.equal(queue.enqueue('guest-c'), true);
  assert.equal(queue.dequeue(), 'guest-b');
  assert.equal(queue.dequeue(), 'guest-c');
});

test('rejects invalid customer identifiers and can clear all requests', () => {
  const queue = createWaiterQueue(2);
  assert.equal(queue.enqueue(''), false);
  assert.equal(queue.enqueue(null), false);
  queue.enqueue('guest-a');
  queue.clear();
  assert.equal(queue.size, 0);
  assert.equal(queue.dequeue(), null);
});

import { createWaiterServiceLedger } from './waiterQueue.js';

test('prevents one customer being served twice at once', () => {
  const ledger = createWaiterServiceLedger();
  assert.equal(ledger.start('waiter-1', 'guest-a'), true);
  assert.equal(ledger.start('waiter-2', 'guest-a'), false);
  assert.equal(ledger.hasCustomer('guest-a'), true);
  assert.equal(ledger.waiterFor('guest-a'), 'waiter-1');
});

test('prevents one waiter serving two customers and releases both sides on finish', () => {
  const ledger = createWaiterServiceLedger();
  assert.equal(ledger.start('waiter-1', 'guest-a'), true);
  assert.equal(ledger.start('waiter-1', 'guest-b'), false);
  assert.equal(ledger.finish('waiter-1'), 'guest-a');
  assert.equal(ledger.hasCustomer('guest-a'), false);
  assert.equal(ledger.start('waiter-2', 'guest-a'), true);
});

test('clears active service assignments', () => {
  const ledger = createWaiterServiceLedger();
  ledger.start('waiter-1', 'guest-a');
  ledger.clear();
  assert.equal(ledger.finish('waiter-1'), null);
  assert.equal(ledger.hasCustomer('guest-a'), false);
});

test('cancels a customer service and releases the waiter for the next request', () => {
  const ledger = createWaiterServiceLedger();
  assert.equal(ledger.start('waiter-1', 'guest-a'), true);
  assert.equal(ledger.cancelCustomer('guest-a'), 'waiter-1');
  assert.equal(ledger.hasCustomer('guest-a'), false);
  assert.equal(ledger.finish('waiter-1'), null);
  assert.equal(ledger.start('waiter-1', 'guest-b'), true);
});

test('returns null when cancelling a customer without an active service', () => {
  const ledger = createWaiterServiceLedger();
  assert.equal(ledger.cancelCustomer('guest-missing'), null);
});


test('rejects invalid waiter and customer identifiers without mutating the ledger', () => {
  const ledger = createWaiterServiceLedger();
  assert.equal(ledger.start('', 'guest-a'), false);
  assert.equal(ledger.start('waiter-1', ''), false);
  assert.equal(ledger.start(null, 'guest-a'), false);
  assert.equal(ledger.start('waiter-1', null), false);
  assert.equal(ledger.finish('waiter-1'), null);
  assert.equal(ledger.hasCustomer('guest-a'), false);
  assert.equal(ledger.waiterFor('guest-a'), null);
});

test('customer cancellation is idempotent and does not release another waiter', () => {
  const ledger = createWaiterServiceLedger();
  assert.equal(ledger.start('waiter-1', 'guest-a'), true);
  assert.equal(ledger.start('waiter-2', 'guest-b'), true);
  assert.equal(ledger.cancelCustomer('guest-a'), 'waiter-1');
  assert.equal(ledger.cancelCustomer('guest-a'), null);
  assert.equal(ledger.waiterFor('guest-b'), 'waiter-2');
  assert.equal(ledger.finish('waiter-2'), 'guest-b');
});


import { createWaiterServiceManager } from './waiterQueue.js';

function createServiceHarness({ waiterIds = ['waiter-1'], duration = 100 } = {}) {
  const queue = createWaiterQueue(10);
  const ledger = createWaiterServiceLedger();
  const actors = new Map();
  const homes = new Map();
  const motions = new Map();
  const moves = [];
  const timers = new Map();
  let timerId = 0;
  for (const id of waiterIds) {
    actors.set(id, { id });
    homes.set(id, { x: 0, z: 0 });
  }
  const manager = createWaiterServiceManager({
    queue,
    ledger,
    getActor: id => actors.get(id),
    getWaiterIds: () => waiterIds,
    getHome: id => homes.get(id),
    findApproach: (_waiter, customer) => ({ x: customer.x ?? 1, z: customer.z ?? 2 }),
    moveTo: (id, x, z) => moves.push({ id, x, z }),
    setMotion: (id, motion) => motions.set(id, motion),
    setTimer: callback => {
      const id = ++timerId;
      timers.set(id, callback);
      return id;
    },
    clearTimer: id => timers.delete(id),
    serviceDuration: duration
  });
  return { manager, queue, ledger, actors, motions, moves, timers };
}

test('service manager assigns a free waiter and advances queued customers FIFO', () => {
  const h = createServiceHarness();
  h.actors.set('guest-a', { id: 'guest-a', x: 1, z: 2 });
  h.actors.set('guest-b', { id: 'guest-b', x: 3, z: 4 });
  h.actors.set('guest-c', { id: 'guest-c' });

  assert.equal(h.manager.request('guest-a'), 'serving');
  assert.equal(h.manager.request('guest-b'), 'queued');
  assert.equal(h.manager.request('guest-c'), 'queued');
  assert.equal(h.manager.request('guest-b'), 'duplicate');
  assert.equal(h.ledger.waiterFor('guest-a'), 'waiter-1');

  const firstTimer = [...h.timers.values()][0];
  firstTimer();
  assert.equal(h.ledger.waiterFor('guest-a'), null);
  assert.equal(h.ledger.waiterFor('guest-b'), 'waiter-1');
  assert.equal(h.queue.dequeue(), 'guest-c');
  assert.equal(h.motions.get('waiter-1'), 'serving');
});

test('removing a queued customer prevents a later service assignment', () => {
  const h = createServiceHarness();
  h.actors.set('guest-a', { id: 'guest-a' });
  h.actors.set('guest-b', { id: 'guest-b' });
  assert.equal(h.manager.request('guest-a'), 'serving');
  assert.equal(h.manager.request('guest-b'), 'queued');
  assert.equal(h.manager.cancelCustomer('guest-b'), null);
  assert.equal(h.queue.size, 0);
  assert.equal(h.ledger.hasCustomer('guest-b'), false);
});

test('cancelling an active customer releases the waiter and starts the next queued guest', () => {
  const h = createServiceHarness();
  h.actors.set('guest-a', { id: 'guest-a' });
  h.actors.set('guest-b', { id: 'guest-b' });
  assert.equal(h.manager.request('guest-a'), 'serving');
  assert.equal(h.manager.request('guest-b'), 'queued');
  assert.equal(h.manager.cancelCustomer('guest-a'), 'waiter-1');
  assert.equal(h.ledger.waiterFor('guest-b'), 'waiter-1');
  assert.equal(h.manager.isBusy('waiter-1'), true);
});

test('stale service timeout cannot finish a newer assignment', () => {
  const h = createServiceHarness();
  h.actors.set('guest-a', { id: 'guest-a' });
  h.actors.set('guest-b', { id: 'guest-b' });
  assert.equal(h.manager.request('guest-a'), 'serving');
  const staleCallback = [...h.timers.values()][0];
  h.manager.cancelCustomer('guest-a');
  assert.equal(h.manager.request('guest-b'), 'serving');

  staleCallback();
  assert.equal(h.ledger.waiterFor('guest-b'), 'waiter-1');
  assert.equal(h.manager.isBusy('waiter-1'), true);
});

test('missing waiter still releases its ledger assignment and timer on finish', () => {
  const h = createServiceHarness();
  h.actors.set('guest-a', { id: 'guest-a' });
  assert.equal(h.manager.request('guest-a'), 'serving');
  h.actors.delete('waiter-1');
  h.manager.finish('waiter-1');
  assert.equal(h.ledger.waiterFor('guest-a'), null);
  assert.equal(h.manager.isBusy('waiter-1'), false);
  assert.equal(h.timers.size, 0);
});

test('dispose clears timers, queue, assignments and busy state', () => {
  const h = createServiceHarness();
  h.actors.set('guest-a', { id: 'guest-a' });
  h.actors.set('guest-b', { id: 'guest-b' });
  h.manager.request('guest-a');
  h.manager.request('guest-b');
  h.manager.dispose();
  assert.equal(h.timers.size, 0);
  assert.equal(h.queue.size, 0);
  assert.equal(h.ledger.hasCustomer('guest-a'), false);
  assert.equal(h.manager.isBusy('waiter-1'), false);
});
