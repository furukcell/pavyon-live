import { createHmac, timingSafeEqual } from 'node:crypto';

const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

export function verifyProviderSignature({ rawBody, timestamp, signature, secret, now = Date.now() }) {
  if (!Buffer.isBuffer(rawBody) || !secret || typeof secret !== 'string') return false;
  if (typeof timestamp !== 'string' || !/^\d{10,13}$/.test(timestamp)) return false;
  const timestampMs = timestamp.length === 10 ? Number(timestamp) * 1000 : Number(timestamp);
  if (!Number.isSafeInteger(timestampMs) || Math.abs(now - timestampMs) > MAX_CLOCK_SKEW_MS) return false;
  if (typeof signature !== 'string' || !/^sha256=[a-f0-9]{64}$/i.test(signature)) return false;

  const expected = createHmac('sha256', secret).update(timestamp).update('.').update(rawBody).digest();
  const supplied = Buffer.from(signature.slice(7), 'hex');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function createProviderSignature(rawBody, timestamp, secret) {
  return 'sha256=' + createHmac('sha256', secret).update(String(timestamp)).update('.').update(rawBody).digest('hex');
}
