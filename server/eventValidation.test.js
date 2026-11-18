import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDevEvent } from './eventValidation.js';

test('normalizes valid Turkish comment and trims fields', () => {
  assert.deepEqual(normalizeDevEvent({ type: 'comment', username: '  Çağrı_1! ', comment: ' !dans ' }), {
    ok: true, event: { type: 'comment', username: 'Çağrı_1', comment: '!dans' }
  });
});
test('rejects unsupported event types and malformed bodies', () => {
  assert.equal(normalizeDevEvent(null).ok, false);
  assert.equal(normalizeDevEvent({ type: 'follow', username: 'a' }).ok, false);
});
test('rejects empty or overlong usernames and comments', () => {
  assert.equal(normalizeDevEvent({ type: 'comment', username: '!!!', comment: 'hi' }).ok, false);
  assert.equal(normalizeDevEvent({ type: 'comment', username: 'a', comment: ' ' }).ok, false);
  assert.equal(normalizeDevEvent({ type: 'comment', username: 'a', comment: 'x'.repeat(201) }).ok, false);
});
test('accepts bounded integer like counts only', () => {
  assert.equal(normalizeDevEvent({ type: 'like', username: 'a', count: 10 }).ok, true);
  for (const count of [0, -1, 1.5, 10001, 'not-a-number']) assert.equal(normalizeDevEvent({ type: 'like', username: 'a', count }).ok, false);
});
test('validates gift action, gift name and kons id', () => {
  assert.equal(normalizeDevEvent({ type: 'gift', username: 'a', giftName: 'Rose', action: 'dance', konsId: 'kons-2' }).ok, true);
  assert.equal(normalizeDevEvent({ type: 'gift', username: 'a', giftName: 'Rose', action: 'hack' }).ok, false);
  assert.equal(normalizeDevEvent({ type: 'gift', username: 'a', giftName: 'Rose', konsId: 'kons-99' }).ok, false);
  assert.equal(normalizeDevEvent({ type: 'gift', username: 'a', giftName: '' }).ok, false);
});
test('validates optional idempotency key', () => {
  assert.equal(normalizeDevEvent({ type: 'like', username: 'a', count: 1, eventId: 'evt-1' }).ok, true);
  assert.equal(normalizeDevEvent({ type: 'like', username: 'a', count: 1, eventId: ' ' }).ok, false);
});
