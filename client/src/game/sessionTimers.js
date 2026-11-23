export function createSessionTimers({
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout
} = {}) {
  const timers = new Map();

  function cancel(konsId) {
    const timer = timers.get(konsId);
    if (timer === undefined) return false;
    // Remove the registry entry first: even if the host timer API throws,
    // its eventual callback becomes stale and cannot expire this session.
    timers.delete(konsId);
    try { clearTimeoutFn(timer.handle); } catch {}
    return true;
  }

  function start(konsId, viewerId, durationMs, onExpire) {
    if (typeof konsId !== 'string' || !konsId
      || typeof viewerId !== 'string' || !viewerId
      || !Number.isFinite(durationMs) || durationMs < 0
      || typeof onExpire !== 'function') return false;

    cancel(konsId);
    const entry = { handle: null, viewerId };
    try {
      entry.handle = setTimeoutFn(() => {
        if (timers.get(konsId) !== entry) return;
        timers.delete(konsId);
        onExpire({ konsId, viewerId });
      }, durationMs);
    } catch {
      return false;
    }
    if (entry.handle === undefined || entry.handle === null) return false;
    timers.set(konsId, entry);
    return true;
  }

  function cancelAll() {
    for (const konsId of [...timers.keys()]) cancel(konsId);
  }

  return {
    start,
    cancel,
    cancelAll,
    has: konsId => timers.has(konsId),
    viewerFor: konsId => timers.get(konsId)?.viewerId ?? null,
    get size() { return timers.size; }
  };
}
