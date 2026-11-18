export const GIFT_ACTION_RULES = Object.freeze({
  invite: Object.freeze({ durationMs: 5 * 60_000, requiresKons: true }),
  dance: Object.freeze({ durationMs: 5 * 60_000, requiresKons: true }),
  drink: Object.freeze({ durationMs: 0, requiresKons: false }),
  vip: Object.freeze({ durationMs: 3 * 60_000, requiresKons: true }),
  stage: Object.freeze({ durationMs: 0, requiresKons: false })
});

export const GIFT_ACTIONS = Object.freeze(Object.keys(GIFT_ACTION_RULES));

export function getGiftActionRule(action) {
  if (typeof action !== 'string') return null;
  return GIFT_ACTION_RULES[action.trim().toLowerCase()] || null;
}
