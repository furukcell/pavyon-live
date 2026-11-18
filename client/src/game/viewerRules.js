export function normalizeViewerName(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, 20);
}
