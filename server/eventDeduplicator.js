export function createEventDeduplicator({ ttlMs = 60_000, maxEntries = 5_000 } = {}) {
  if (!Number.isSafeInteger(ttlMs) || ttlMs < 1) throw new Error('ttlMs must be a positive safe integer.');
  if (!Number.isSafeInteger(maxEntries) || maxEntries < 1) throw new Error('maxEntries must be a positive safe integer.');
  const seen = new Map();

  return {
    hasSeen(eventId, now = Date.now()) {
      if (typeof eventId !== 'string' || !eventId) throw new Error('eventId must be a non-empty string.');
      for (const [id, expiresAt] of seen) {
        if (expiresAt <= now) seen.delete(id);
      }
      const expiresAt = seen.get(eventId);
      if (expiresAt !== undefined && expiresAt > now) return true;
      if (seen.size >= maxEntries) {
        const oldestId = seen.keys().next().value;
        if (oldestId !== undefined) seen.delete(oldestId);
      }
      seen.set(eventId, now + ttlMs);
      return false;
    },
    get size() { return seen.size; }
  };
}
