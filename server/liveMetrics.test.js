import test from 'node:test';
import assert from 'node:assert/strict';
import { createLiveMetrics } from './liveMetrics.js';

test('counts accepted comments, likes and gifts and records latest event', () => {
  const metrics = createLiveMetrics();
  metrics.record({ type: 'comment' }, new Date('2026-11-18T10:00:00.000Z'));
  metrics.record({ type: 'like' }, new Date('2026-11-18T10:00:01.000Z'));
  const snapshot = metrics.record({ type: 'gift' }, new Date('2026-11-18T10:00:02.000Z'));
  assert.equal(snapshot.accepted, 3);
  assert.equal(snapshot.comments, 1);
  assert.equal(snapshot.likes, 1);
  assert.equal(snapshot.gifts, 1);
  assert.equal(snapshot.lastEventAt, '2026-11-18T10:00:02.000Z');
  assert.equal(snapshot.lastEventType, 'gift');
  assert.equal(snapshot.recentEvents.length, 3);
});

test('keeps only the newest 20 summarized events and omits free-form comment text', () => {
  const metrics = createLiveMetrics();
  for (let i = 0; i < 25; i += 1) {
    metrics.record({ type: 'comment', username: 'viewer', comment: i === 24 ? '!gel' : 'private message text' }, new Date(1763460000000 + i));
  }
  const history = metrics.snapshot().recentEvents;
  assert.equal(history.length, 20);
  assert.equal(history[0].command, '!gel');
  assert.equal(history[1].command, null);
  assert.equal(Object.hasOwn(history[1], 'comment'), false);
});

test('returns isolated snapshots and rejects unsupported event types', () => {
  const metrics = createLiveMetrics();
  const snapshot = metrics.snapshot();
  snapshot.accepted = 99;
  snapshot.recentEvents.push({ type: 'fake' });
  assert.equal(metrics.snapshot().accepted, 0);
  assert.deepEqual(metrics.snapshot().recentEvents, []);
  assert.throws(() => metrics.record({ type: 'follow' }), /Unsupported/);
});
