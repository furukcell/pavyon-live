const HISTORY_LIMIT = 20;

function summarizeEvent(event, at) {
  const summary = {
    type: event.type,
    at: at.toISOString(),
    username: typeof event.username === 'string' ? event.username.slice(0, 24) : null
  };
  if (event.type === 'gift') {
    summary.giftName = typeof event.giftName === 'string' ? event.giftName.slice(0, 48) : null;
    summary.action = typeof event.action === 'string' ? event.action : null;
  }
  if (event.type === 'comment') summary.command = typeof event.comment === 'string' && /^!(gel|dans|masa|sahne|cik)$/i.test(event.comment.trim()) ? event.comment.trim().toLowerCase() : null;
  if (event.type === 'like') summary.count = Math.max(1, Math.min(10000, Number(event.count) || 1));
  return summary;
}

export function createLiveMetrics() {
  const metrics = { accepted: 0, comments: 0, likes: 0, gifts: 0, lastEventAt: null, lastEventType: null };
  const recentEvents = [];
  return {
    record(event, at = new Date()) {
      if (!event || !['comment', 'like', 'gift'].includes(event.type)) throw new Error('Unsupported live event type.');
      metrics.accepted += 1;
      metrics[event.type === 'comment' ? 'comments' : event.type === 'like' ? 'likes' : 'gifts'] += 1;
      metrics.lastEventAt = at.toISOString();
      metrics.lastEventType = event.type;
      recentEvents.unshift(summarizeEvent(event, at));
      if (recentEvents.length > HISTORY_LIMIT) recentEvents.length = HISTORY_LIMIT;
      return this.snapshot();
    },
    snapshot() { return { ...metrics, recentEvents: recentEvents.map(event => ({ ...event })) }; }
  };
}
