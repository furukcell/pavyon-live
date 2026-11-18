const ACTIONS = new Set(['invite', 'dance', 'drink', 'vip', 'stage']);

export function normalizeGiftKey(value) {
  return String(value || '').normalize('NFKC').toLocaleLowerCase('tr-TR').trim().replace(/[\\s_-]+/g, '');
}

export function parseGiftMapping(raw = '{}') {
  let parsed;
  try { parsed = typeof raw === 'string' ? JSON.parse(raw || '{}') : raw; }
  catch { throw new Error('LIVE_GIFT_MAP must be valid JSON.'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('LIVE_GIFT_MAP must be a JSON object.');
  const mapping = new Map();
  for (const [giftName, action] of Object.entries(parsed)) {
    const key = normalizeGiftKey(giftName);
    if (!key || key.length > 80 || !ACTIONS.has(action)) throw new Error(`Invalid gift mapping for "${giftName}".`);
    mapping.set(key, action);
  }
  return mapping;
}

export function resolveGiftAction(giftName, mapping) {
  return mapping instanceof Map ? mapping.get(normalizeGiftKey(giftName)) || null : null;
}
