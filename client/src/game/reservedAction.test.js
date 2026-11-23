import test from 'node:test';
import assert from 'node:assert/strict';
import { runReservedAction } from './reservedAction.js';

test('successful action keeps its reservation and does not run rollback', () => {
  const calls = [];
  const result = runReservedAction({
    reserve: () => { calls.push('reserve'); return true; },
    start: () => { calls.push('start'); return true; },
    rollback: () => calls.push('rollback'),
    release: () => calls.push('release')
  });
  assert.deepEqual(result, { ok: true });
  assert.deepEqual(calls, ['reserve', 'start']);
});

test('failed action rolls back scene state and releases logical reservation', () => {
  const calls = [];
  const result = runReservedAction({
    reserve: () => { calls.push('reserve'); return true; },
    start: () => { calls.push('start'); return false; },
    rollback: () => calls.push('rollback'),
    release: () => calls.push('release')
  });
  assert.deepEqual(result, { ok: false, reason: 'start' });
  assert.deepEqual(calls, ['reserve', 'start', 'rollback', 'release']);
});

test('thrown scene action follows the same rollback path', () => {
  const calls = [];
  const result = runReservedAction({
    reserve: () => true,
    start: () => { throw new Error('partial scene mutation'); },
    rollback: () => { calls.push('rollback'); throw new Error('rollback issue'); },
    release: () => calls.push('release')
  });
  assert.deepEqual(result, { ok: false, reason: 'start' });
  assert.deepEqual(calls, ['rollback', 'release']);
});

test('reservation rejection never starts or releases another owner', () => {
  const calls = [];
  const result = runReservedAction({
    reserve: () => false,
    start: () => calls.push('start'),
    rollback: () => calls.push('rollback'),
    release: () => calls.push('release')
  });
  assert.deepEqual(result, { ok: false, reason: 'reserve' });
  assert.deepEqual(calls, []);
});
