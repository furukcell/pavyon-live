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
    if (!waiter || !customer) return false;
    if (!ledger.start(waiterId, customerId)) return false;

    busy.add(waiterId);
    try {
      setMotion(waiterId, 'serving');
      const approach = findApproach(waiter, customer);
      if (!approach || !Number.isFinite(approach.x) || !Number.isFinite(approach.z)) {
        throw new Error('No valid waiter approach position');
      }
      moveTo(waiterId, approach.x, approach.z);

      let timer;
      timer = setTimer(() => {
        if (timers.get(waiterId) !== timer) return;
        timers.delete(waiterId);
        finish(waiterId);
      }, serviceDuration);
      if (timer === undefined || timer === null) {
        throw new Error('Waiter service timer could not be created');
      }
      timers.set(waiterId, timer);
      return true;
    } catch {
      clearWaiterTimer(waiterId);
      ledger.cancelCustomer(customerId);
      busy.delete(waiterId);
      const home = getHome(waiterId);
      if (home) {
        try { moveTo(waiterId, home.x, home.z); } catch {}
      }
      try { setMotion(waiterId, 'idle'); } catch {}
      return false;
    }
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


// Reserves interaction positions as owner/guest pairs. Either participant can
// release the reservation, preventing abandoned dance/VIP slots after exits.
export function createPairSlotManager(slots) {
  const byOwner = new Map();
  const ownerByGuest = new Map();

  function release(participantId) {
    const ownerId = byOwner.has(participantId)
      ? participantId
      : ownerByGuest.get(participantId);
    if (!ownerId) return null;
    const pair = byOwner.get(ownerId);
    byOwner.delete(ownerId);
    ownerByGuest.delete(pair.guestId);
    return { ownerId, guestId: pair.guestId, slot: pair.slot };
  }

  return {
    reserve(ownerId, guestId) {
      if (typeof ownerId !== 'string' || !ownerId ||
          typeof guestId !== 'string' || !guestId || ownerId === guestId) return null;
      if (byOwner.has(ownerId) || ownerByGuest.has(ownerId) ||
          byOwner.has(guestId) || ownerByGuest.has(guestId)) return null;
      const occupied = new Set([...byOwner.values()].map(pair => pair.slot));
      const slot = slots.find(candidate => !occupied.has(candidate));
      if (!slot) return null;
      byOwner.set(ownerId, { guestId, slot });
      ownerByGuest.set(guestId, ownerId);
      return slot;
    },
    release,
    forOwner(ownerId) {
      const pair = byOwner.get(ownerId);
      return pair ? { ownerId, guestId: pair.guestId, slot: pair.slot } : null;
    },
    forGuest(guestId) {
      const ownerId = ownerByGuest.get(guestId);
      return ownerId ? this.forOwner(ownerId) : null;
    },
    clear() {
      byOwner.clear();
      ownerByGuest.clear();
    },
    get size() {
      return byOwner.size;
    }
  };
}


// Shares participant exclusivity across dance and VIP, not just within each
// individual slot pool.
export function createInteractionReservationManager({ danceSlots, vipSlots }) {
  const dance = createPairSlotManager(danceSlots);
  const vip = createPairSlotManager(vipSlots);

  function isReserved(manager, participantId) {
    return Boolean(manager.forOwner(participantId) || manager.forGuest(participantId));
  }

  return {
    reserveDance(ownerId, guestId) {
      if (isReserved(vip, ownerId) || isReserved(vip, guestId)) return null;
      return dance.reserve(ownerId, guestId);
    },
    reserveVip(ownerId, guestId) {
      if (isReserved(dance, ownerId) || isReserved(dance, guestId)) return null;
      return vip.reserve(ownerId, guestId);
    },
    releaseDance: participantId => dance.release(participantId),
    releaseVip: participantId => vip.release(participantId),
    clear() {
      dance.clear();
      vip.clear();
    },
    get danceCount() { return dance.size; },
    get vipCount() { return vip.size; }
  };
}
