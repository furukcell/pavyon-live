import test from 'node:test';
import assert from 'node:assert/strict';
import { createLiveMetrics } from './liveMetrics.js';

test('counts accepted comments, likes and gifts and records latest event', () => {
  const metrics = createLiveMetrics();
  metrics.record({ type: 'comment' }, new Date('2026-11-18T10:00:00.000Z'));
  metrics.record({ type: 'like' }, new Date('2026-11-18T10:00:01.000Z'));
  const snapshot = metrics.record({ type: 'gift' }, new Date('2026-11-18T10:00:02.000Z'));
  assert.deepEqual(snapshot, { accepted: 3, comments: 1, likes: 1, gifts: 1, lastEventAt: '2026-11-18T10:00:02.000Z', lastEventType: 'gift' });
});

test('returns isolated snapshots and rejects unsupported event types', () => {
  const metrics = createLiveMetrics();
  const snapshot = metrics.snapshot();
  snapshot.accepted = 99;
  assert.equal(metrics.snapshot().accepted, 0);
  assert.throws(() => metrics.record({ type: 'follow' }), /Unsupported/);
});
