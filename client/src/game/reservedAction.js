// Makes a game action transactional with its logical reservation. Scene actions
// can fail after partially allocating a pair slot, so rollback is explicit.
export function runReservedAction({ reserve, start, rollback, release }) {
  if (!reserve()) return { ok: false, reason: 'reserve' };

  let started = false;
  try {
    started = start() !== false;
  } catch {
    started = false;
  }

  if (started) return { ok: true };

  try { rollback(); } catch {}
  try { release(); } catch {}
  return { ok: false, reason: 'start' };
}
