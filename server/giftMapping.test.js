import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGiftKey, parseGiftMapping, resolveGiftAction } from './giftMapping.js';

test('normalizes gift names independent of case, spaces and separators', () => {
  assert.equal(normalizeGiftKey('  Rose-Gift '), 'rosegift');
  assert.equal(normalizeGiftKey('GÜL  ÇİÇEĞİ'), 'gülçiçeği');
});

test('loads explicit aliases and resolves their configured actions', () => {
  const mapping = parseGiftMapping(JSON.stringify({ Rose: 'invite', 'Dance Gift': 'dance', 'VIP-Star': 'vip' }));
  assert.equal(resolveGiftAction('rose', mapping), 'invite');
  assert.equal(resolveGiftAction('DANCE_GIFT', mapping), 'dance');
  assert.equal(resolveGiftAction('vip star', mapping), 'vip');
  assert.equal(resolveGiftAction('unknown', mapping), null);
});

test('rejects malformed maps and unsupported actions', () => {
  assert.throws(() => parseGiftMapping('{broken'));
  assert.throws(() => parseGiftMapping('[]'));
  assert.throws(() => parseGiftMapping(JSON.stringify({ Rose: 'steal' })));
});

test('empty mapping safely leaves gifts unmapped', () => {
  assert.equal(resolveGiftAction('Rose', parseGiftMapping()), null);
});
