export function createWaiterQueue(limit = 30) {
  const items = [];
  const queued = new Set();

  return {
    enqueue(customerId) {
      if (typeof customerId !== 'string' || !customerId) return false;
      if (queued.has(customerId)) return 'duplicate';
      if (items.length >= limit) return false;
      items.push(customerId);
      queued.add(customerId);
      return true;
    },
    dequeue() {
      const customerId = items.shift() ?? null;
      if (customerId) queued.delete(customerId);
      return customerId;
    },
    remove(customerId) {
      if (!queued.has(customerId)) return false;
      const index = items.indexOf(customerId);
      if (index >= 0) items.splice(index, 1);
      queued.delete(customerId);
      return true;
    },
    has(customerId) {
      return queued.has(customerId);
    },
    get size() {
      return items.length;
    },
    clear() {
      items.length = 0;
      queued.clear();
    }
  };
}
