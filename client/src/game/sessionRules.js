export function createSessionRules(konsIds) {
  const validKons = new Set(konsIds);
  const konsOwners = new Map();
  const viewerSessions = new Map();

  return {
    canReserve(konsId, viewerId) {
      return typeof viewerId === 'string' && viewerId.length > 0
        && validKons.has(konsId)
        && !konsOwners.has(konsId)
        && !viewerSessions.has(viewerId);
    },
    reserve(konsId, viewerId) {
      if (!this.canReserve(konsId, viewerId)) return false;
      konsOwners.set(konsId, viewerId);
      viewerSessions.set(viewerId, konsId);
      return true;
    },
    releaseKons(konsId) {
      const viewerId = konsOwners.get(konsId);
      if (viewerId === undefined) return null;
      konsOwners.delete(konsId);
      viewerSessions.delete(viewerId);
      return viewerId;
    },
    releaseViewer(viewerId) {
      const konsId = viewerSessions.get(viewerId);
      if (konsId === undefined) return null;
      viewerSessions.delete(viewerId);
      konsOwners.delete(konsId);
      return konsId;
    },
    ownerOf(konsId) {
      return konsOwners.get(konsId) ?? null;
    },
    konsFor(viewerId) {
      return viewerSessions.get(viewerId) ?? null;
    },
    snapshot() {
      return Object.fromEntries(konsOwners);
    }
  };
}
