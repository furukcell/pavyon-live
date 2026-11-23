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


// Coordinates the queue, active-service ledger and timeout lifecycle. All
// browser/game dependencies are injected so the scheduling rules stay testable.
export function createWaiterServiceManager({
  queue,
  ledger,
  getActor,
  getWaiterIds,
  getHome,
  findApproach,
  moveTo,
  setMotion,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
  serviceDuration = 4500
}) {
  const busy = new Set();
  const timers = new Map();

  function clearWaiterTimer(waiterId) {
    const timer = timers.get(waiterId);
    if (timer !== undefined) {
      clearTimer(timer);
      timers.delete(waiterId);
    }
  }

  function start(waiterId, customerId) {
    const waiter = getActor(waiterId);
    const customer = getActor(customerId);
    if (!waiter || !customer) {
      finish(waiterId);
      return false;
    }
    if (!ledger.start(waiterId, customerId)) return false;

    busy.add(waiterId);
    setMotion(waiterId, 'serving');
    const approach = findApproach(waiter, customer);
    moveTo(waiterId, approach.x, approach.z);

    let timer;
    timer = setTimer(() => {
      if (timers.get(waiterId) !== timer) return;
      timers.delete(waiterId);
      finish(waiterId);
    }, serviceDuration);
    timers.set(waiterId, timer);
    return true;
  }

  function finish(waiterId) {
    ledger.finish(waiterId);
    clearWaiterTimer(waiterId);
    busy.delete(waiterId);

    const waiter = getActor(waiterId);
    if (!waiter) return;

    let nextCustomerId = null;
    while (queue.size && !nextCustomerId) {
      const candidate = queue.dequeue();
      if (getActor(candidate)) nextCustomerId = candidate;
    }
    if (nextCustomerId && start(waiterId, nextCustomerId)) return;

    const home = getHome(waiterId);
    if (home) moveTo(waiterId, home.x, home.z);
    setMotion(waiterId, 'idle');
  }

  function request(customerId) {
    if (!getActor(customerId)) return false;
    if (ledger.hasCustomer(customerId) || queue.has(customerId)) return 'duplicate';

    const waiterId = [...getWaiterIds()].find(id => !busy.has(id));
    if (!waiterId) {
      const result = queue.enqueue(customerId);
      return result === true ? 'queued' : result === 'duplicate' ? 'duplicate' : false;
    }
    return start(waiterId, customerId) ? 'serving' : false;
  }

  function cancelCustomer(customerId) {
    queue.remove(customerId);
    const waiterId = ledger.cancelCustomer(customerId);
    if (waiterId) finish(waiterId);
    return waiterId;
  }

  function dispose() {
    timers.forEach(timer => clearTimer(timer));
    timers.clear();
    busy.clear();
    queue.clear();
    ledger.clear();
  }

  return { request, finish, cancelCustomer, dispose, isBusy: id => busy.has(id) };
}
