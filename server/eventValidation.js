const ALLOWED_TYPES = new Set(['comment', 'like', 'gift']);
const ALLOWED_GIFT_ACTIONS = new Set(['invite', 'dance', 'drink', 'vip', 'stage']);
const KONS_IDS = new Set(Array.from({ length: 10 }, (_, index) => `kons-${index + 1}`));

function cleanUsername(value) {
  return String(value || '').trim().replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, 20);
}

export function normalizeDevEvent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, error: 'Event body must be an object.' };
  if (!ALLOWED_TYPES.has(input.type)) return { ok: false, error: 'Unsupported event type.' };
  const username = cleanUsername(input.username);
  if (!username) return { ok: false, error: 'A valid username is required.' };

  const event = { type: input.type, username };
  if (input.eventId !== undefined) {
    if (typeof input.eventId !== 'string' || !input.eventId.trim() || input.eventId.length > 128) return { ok: false, error: 'eventId must be a non-empty string up to 128 characters.' };
    event.eventId = input.eventId.trim();
  }
  if (input.type === 'comment') {
    if (typeof input.comment !== 'string') return { ok: false, error: 'Comment text is required.' };
    const comment = input.comment.trim();
    if (!comment || comment.length > 200) return { ok: false, error: 'Comment must contain 1–200 characters.' };
    event.comment = comment;
  }
  if (input.type === 'like') {
    const count = Number(input.count);
    if (!Number.isSafeInteger(count) || count < 1 || count > 10000) return { ok: false, error: 'Like count must be an integer from 1 to 10000.' };
    event.count = count;
  }
  if (input.type === 'gift') {
    if (typeof input.giftName !== 'string' || !input.giftName.trim() || input.giftName.length > 80) return { ok: false, error: 'Gift name must contain 1–80 characters.' };
    event.giftName = input.giftName.trim();
    if (input.action !== undefined) {
      if (typeof input.action !== 'string' || !ALLOWED_GIFT_ACTIONS.has(input.action.toLowerCase())) return { ok: false, error: 'Unsupported gift action.' };
      event.action = input.action.toLowerCase();
    }
    if (input.konsId !== undefined) {
      if (typeof input.konsId !== 'string' || !KONS_IDS.has(input.konsId)) return { ok: false, error: 'Invalid konsId.' };
      event.konsId = input.konsId;
    }
  }
  return { ok: true, event };
}
