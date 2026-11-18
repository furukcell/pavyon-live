export function createLiveMetrics() {
  const metrics = { accepted: 0, comments: 0, likes: 0, gifts: 0, lastEventAt: null, lastEventType: null };
  return {
    record(event, at = new Date()) {
      if (!event || !['comment', 'like', 'gift'].includes(event.type)) throw new Error('Unsupported live event type.');
      metrics.accepted += 1;
      metrics[event.type === 'comment' ? 'comments' : event.type === 'like' ? 'likes' : 'gifts'] += 1;
      metrics.lastEventAt = at.toISOString();
      metrics.lastEventType = event.type;
      return this.snapshot();
    },
    snapshot() { return { ...metrics }; }
  };
}
