export function createKonsSessionLifecycle({
  getOwner,
  setOwner,
  cancelTimer,
  releaseRules,
  getViewer,
  releaseKons,
  releaseGuest,
  onReleased = () => {}
}) {
  function safely(run) {
    try { run(); } catch {}
  }

  function end(konsId, expectedViewer = null) {
    const viewer = getOwner(konsId);
    if (typeof viewer !== 'string' || !viewer) return false;
    if (expectedViewer !== null && viewer !== expectedViewer) return false;

    // Clear authoritative ownership first: stale/repeated end events
    // must never release a later session on the same kons.
    setOwner(konsId, null);
    safely(() => cancelTimer(konsId));
    safely(() => releaseRules(konsId));

    const guest = getViewer(viewer);
    if (guest?.activeKons === konsId) {
      guest.activeKons = null;
      guest.action = 'standing';
    }

    safely(() => releaseKons(konsId));
    if (guest) safely(() => releaseGuest(guest.id));
    safely(() => onReleased({ konsId, viewer, guest }));
    return true;
  }

  return { end };
}
