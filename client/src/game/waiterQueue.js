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

export function createWaiterServiceLedger() {
  const waiterByCustomer = new Map();
  const customerByWaiter = new Map();

  return {
    start(waiterId, customerId) {
      if (typeof waiterId !== 'string' || !waiterId || typeof customerId !== 'string' || !customerId) return false;
      if (waiterByCustomer.has(customerId) || customerByWaiter.has(waiterId)) return false;
      waiterByCustomer.set(customerId, waiterId);
      customerByWaiter.set(waiterId, customerId);
      return true;
    },
    finish(waiterId) {
      const customerId = customerByWaiter.get(waiterId) ?? null;
      if (customerId === null) return null;
      customerByWaiter.delete(waiterId);
      waiterByCustomer.delete(customerId);
      return customerId;
    },
    hasCustomer(customerId) {
      return waiterByCustomer.has(customerId);
    },
    waiterFor(customerId) {
      return waiterByCustomer.get(customerId) ?? null;
    },
    cancelCustomer(customerId) {
      const waiterId = waiterByCustomer.get(customerId) ?? null;
      if (waiterId === null) return null;
      waiterByCustomer.delete(customerId);
      customerByWaiter.delete(waiterId);
      return waiterId;
    },
    clear() {
      waiterByCustomer.clear();
      customerByWaiter.clear();
    }
  };
}
