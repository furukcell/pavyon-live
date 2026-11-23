// Keep customer departure cleanup best-effort: one broken scene/service
// subsystem must not strand queue entries, seats, or interaction reservations.
export function cleanupCustomerExit({
  customerId,
  actor,
  cancelService,
  releaseDance,
  releaseVip,
  releaseSeat,
  detach,
  forget,
  dispose
}) {
  function safely(run) {
    try { run(); } catch {}
  }

  if (typeof customerId !== 'string' || !customerId) return false;

  safely(() => cancelService(customerId));
  safely(() => releaseDance(customerId));
  safely(() => releaseVip(customerId));

  if (!actor) return false;

  safely(() => releaseSeat(actor));
  safely(() => detach(actor));
  safely(() => forget(customerId));
  safely(() => dispose(actor));
  return true;
}
