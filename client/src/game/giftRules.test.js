import test from 'node:test';
import assert from 'node:assert/strict';
import { GIFT_ACTIONS, getGiftActionRule } from './giftRules.js';

test('exposes only the five supported gift actions', () => {
  assert.deepEqual([...GIFT_ACTIONS].sort(), ['dance', 'drink', 'invite', 'stage', 'vip']);
});

test('assigns five-minute durations to invite and dance', () => {
  assert.equal(getGiftActionRule('invite').durationMs, 300_000);
  assert.equal(getGiftActionRule('dance').durationMs, 300_000);
});

test('assigns a three-minute duration to VIP', () => {
  assert.equal(getGiftActionRule('vip').durationMs, 180_000);
});

test('marks drink and stage as immediate actions without kons reservation', () => {
  for (const action of ['drink', 'stage']) {
    const rule = getGiftActionRule(action);
    assert.equal(rule.durationMs, 0);
    assert.equal(rule.requiresKons, false);
  }
});

test('requires kons reservation only for hosted interactions', () => {
  for (const action of ['invite', 'dance', 'vip']) {
    assert.equal(getGiftActionRule(action).requiresKons, true);
  }
});

test('rejects unknown, empty and non-string actions', () => {
  assert.equal(getGiftActionRule('unknown'), null);
  assert.equal(getGiftActionRule(''), null);
  assert.equal(getGiftActionRule(null), null);
  assert.equal(getGiftActionRule({}), null);
});
