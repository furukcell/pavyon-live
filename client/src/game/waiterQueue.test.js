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
