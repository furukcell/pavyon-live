import test from 'node:test';
import assert from 'node:assert/strict';
import { createEventDeduplicator } from './eventDeduplicator.js';

test('event deduplicator accepts first event and rejects its replay', () => {
  const dedupe = createEventDeduplicator();
  assert.equal(dedupe.hasSeen('event-1', 100), false);
  assert.equal(dedupe.hasSeen('event-1', 101), true);
  assert.equal(dedupe.size, 1);
});

test('event deduplicator expires ids at the TTL boundary', () => {
  const dedupe = createEventDeduplicator({ ttlMs: 60 });
  assert.equal(dedupe.hasSeen('event-1', 100), false);
  assert.equal(dedupe.hasSeen('event-1', 159), true);
  assert.equal(dedupe.hasSeen('event-1', 160), false);
});

test('event deduplicator prunes expired ids and bounds memory with oldest-first eviction', () => {
  const dedupe = createEventDeduplicator({ ttlMs: 100, maxEntries: 2 });
  assert.equal(dedupe.hasSeen('event-1', 0), false);
  assert.equal(dedupe.hasSeen('event-2', 1), false);
  assert.equal(dedupe.hasSeen('event-3', 2), false);
  assert.equal(dedupe.size, 2);
  assert.equal(dedupe.hasSeen('event-1', 3), false);
  assert.equal(dedupe.hasSeen('event-3', 4), true);
  assert.equal(dedupe.size, 2);
});

test('event deduplicator validates its limits and event ids', () => {
  assert.throws(() => createEventDeduplicator({ ttlMs: 0 }), /ttlMs/);
  assert.throws(() => createEventDeduplicator({ maxEntries: 0 }), /maxEntries/);
  const dedupe = createEventDeduplicator();
  assert.throws(() => dedupe.hasSeen(''), /eventId/);
});
