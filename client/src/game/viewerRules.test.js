import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeViewerName } from './viewerRules.js';

test('trims and preserves Turkish letters, digits, underscores and hyphens', () => {
  assert.equal(normalizeViewerName('  Çağrı_01-TR  '), 'Çağrı_01-TR');
});

test('removes unsupported characters and limits usernames to 20 characters', () => {
  assert.equal(normalizeViewerName('faruk! @live'), 'faruklive');
  assert.equal(normalizeViewerName('a'.repeat(25)), 'a'.repeat(20));
});

test('does not turn missing or invalid identities into a shared guest account', () => {
  for (const value of ['', '   ', '!!!', null, undefined, 42]) {
    assert.equal(normalizeViewerName(value), '');
  }
});
