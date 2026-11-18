import test from 'node:test';
import assert from 'node:assert/strict';
import { createProviderSignature, verifyProviderSignature } from './providerWebhook.js';

const secret = 'test-secret-with-enough-entropy';
const now = 1_800_000_000_000;
const rawBody = Buffer.from(JSON.stringify({ type: 'like', username: 'test', count: 3, eventId: 'evt-1' }));

test('accepts a valid timestamped provider signature', () => {
  const timestamp = String(now);
  const signature = createProviderSignature(rawBody, timestamp, secret);
  assert.equal(verifyProviderSignature({ rawBody, timestamp, signature, secret, now }), true);
});

test('rejects modified body and modified signature', () => {
  const timestamp = String(now);
  const signature = createProviderSignature(rawBody, timestamp, secret);
  assert.equal(verifyProviderSignature({ rawBody: Buffer.from('tampered'), timestamp, signature, secret, now }), false);
  assert.equal(verifyProviderSignature({ rawBody, timestamp, signature: 'sha256=' + '0'.repeat(64), secret, now }), false);
});

test('rejects stale timestamps and malformed headers', () => {
  const timestamp = String(now - 5 * 60 * 1000 - 1);
  const signature = createProviderSignature(rawBody, timestamp, secret);
  assert.equal(verifyProviderSignature({ rawBody, timestamp, signature, secret, now }), false);
  assert.equal(verifyProviderSignature({ rawBody, timestamp: 'yesterday', signature, secret, now }), false);
  assert.equal(verifyProviderSignature({ rawBody, timestamp: String(now), signature, secret: '', now }), false);
});

test('accepts unix-second timestamps within clock skew', () => {
  const timestamp = String(Math.floor(now / 1000));
  const signature = createProviderSignature(rawBody, timestamp, secret);
  assert.equal(verifyProviderSignature({ rawBody, timestamp, signature, secret, now }), true);
});
