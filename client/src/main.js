import './style.css';
import { io } from 'socket.io-client';
import { createGame } from './game/createScene.js';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const socket = io(SERVER_URL, { transports: ['websocket', 'polling'], reconnectionAttempts: 5 });
const game = createGame(document.querySelector('#game-canvas'));
const logEl = document.querySelector('#event-log');
const state = {
  viewers: new Map(),
  likes: 0,
  kons: { 'kons-1': null, 'kons-2': null, 'kons-3': null },
  timers: new Map(),
  lastCommands: new Map()
};
const usernameEl = document.querySelector('#username');
const konsSelect = document.querySelector('#kons-select');
const allowedCommands = new Set(['!gel', '!dans', '!masa', '!sahne']);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}
function log(message) {
  logEl.querySelector('.empty')?.remove();
  const p = document.createElement('p');
  p.innerHTML = message;
  logEl.prepend(p);
  while (logEl.children.length > 30) logEl.lastElementChild.remove();
}
function cleanUsername(value) {
  return String(value || '').trim().replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, 20) || 'misafir';
}
function username() { return cleanUsername(usernameEl.value); }
function updateHud() {
  document.querySelector('#guest-count').textContent = `${state.viewers.size} / 100`;
  const free = Object.values(state.kons).filter(value => !value).length;
  document.querySelector('#kons-count').textContent = `${free} müsait`;
  document.querySelector('#like-count').textContent = state.likes.toLocaleString('tr-TR');
}
function addViewer(rawName) {
  const name = cleanUsername(rawName);
  if (state.viewers.has(name)) return state.viewers.get(name);
  if (state.viewers.size >= 100) {
    log('<b>Kapasite dolu:</b> Mekânda 100 izleyici var.');
    return null;
  }
  const guest = { name, id: `viewer-${crypto.randomUUID()}`, action: 'standing' };
  state.viewers.set(name, guest);
  game.addCustomer(guest);
  log(`<b>@${escapeHtml(name)}</b> pavyona giriş yaptı.`);
  updateHud();
  return guest;
}
function command(rawName, rawCommand) {
  const name = cleanUsername(rawName);
  const cmd = String(rawCommand || '').trim().toLowerCase();
  if (!allowedCommands.has(cmd)) return;
  const now = Date.now();
  const last = state.lastCommands.get(name) || 0;
  if (now - last < 1200) return;
  state.lastCommands.set(name, now);

  let guest = state.viewers.get(name);
  if (cmd === '!gel') guest = addViewer(name);
  if (!guest) {
    log(`<b>@${escapeHtml(name)}</b> önce !gel yazarak mekâna katılmalı.`);
    return;
  }
  if (cmd === '!dans') {
    guest.action = 'dancing'; game.dance(guest.id);
    log(`<b>@${escapeHtml(name)}</b> dans pistine çıktı.`);
  } else if (cmd === '!masa') {
    guest.action = 'seated'; game.seat(guest.id);
    log(`<b>@${escapeHtml(name)}</b> masaya oturdu.`);
  } else if (cmd === '!sahne') {
    guest.action = 'stage'; game.stage(guest.id);
    log(`<b>@${escapeHtml(name)}</b> sahneye çıktı.`);
  }
}
function occupyKons(konsId, name, duration, action) {
  if (state.kons[konsId]) {
    log(`<b>${escapeHtml(konsId)}</b> şu anda @${escapeHtml(state.kons[konsId])} ile meşgul.`);
    return false;
  }
  state.kons[konsId] = name;
  const previousTimer = state.timers.get(konsId);
  if (previousTimer) window.clearTimeout(previousTimer);
  updateHud();
  action();
  const timer = window.setTimeout(() => {
    if (state.kons[konsId] !== name) return;
    state.kons[konsId] = null;
    state.timers.delete(konsId);
    game.releaseKons(konsId);
    updateHud();
    log(`<b>${escapeHtml(konsId)}</b> tekrar müsait.`);
  }, duration);
  state.timers.set(konsId, timer);
  return true;
}
function gift(rawName, type, konsId) {
  const name = cleanUsername(rawName);
  const guest = state.viewers.get(name) || addViewer(name);
  if (!guest) return;
  if (type === 'drink') {
    game.drink(guest.id);
    log(`Garson, <b>@${escapeHtml(name)}</b> için servis götürüyor.`);
    return;
  }
  if (type === 'stage') {
    game.show(guest.id);
    log(`<b>@${escapeHtml(name)}</b> için sahne gösterisi başladı.`);
    return;
  }
  const duration = type === 'dance' ? 5 * 60_000 : type === 'invite' ? 5 * 60_000 : 3 * 60_000;
  const action = {
    invite: () => { game.konsToTable(konsId, guest.id); log(`<b>${escapeHtml(konsId)}</b>, @${escapeHtml(name)} kullanıcısının masasına gidiyor.`); },
    dance: () => { game.konsDance(konsId, guest.id); log(`<b>${escapeHtml(konsId)}</b> ve @${escapeHtml(name)} birlikte dans ediyor (5 dk).`); },
    vip: () => { game.vip(konsId, guest.id); log(`<b>${escapeHtml(konsId)}</b>, @${escapeHtml(name)} ile VIP locaya geçti.`); }
  }[type];
  if (action) occupyKons(konsId, name, duration, action);
}
document.querySelectorAll('[data-command]').forEach(button => {
  button.addEventListener('click', () => command(username(), button.dataset.command));
});
document.querySelectorAll('[data-gift]').forEach(button => {
  button.addEventListener('click', () => gift(username(), button.dataset.gift, konsSelect.value));
});
document.querySelector('#like-button').addEventListener('click', () => {
  state.likes += 1;
  game.setLikes(state.likes);
  updateHud();
  log('Ortak beğeni göstergesi yükseldi.');
});
socket.on('connect', () => log('<span class="system">Oyun sunucusuna bağlandı.</span>'));
socket.on('disconnect', () => log('<span class="system">Sunucu bağlantısı kesildi; yerel test paneli çalışmaya devam ediyor.</span>'));
socket.on('live:event', event => {
  if (!event || typeof event !== 'object') return;
  if (event.type === 'comment' && typeof event.username === 'string' && typeof event.comment === 'string') {
    command(event.username, event.comment);
  } else if (event.type === 'like') {
    state.likes += Math.max(1, Math.min(10000, Number(event.count) || 1));
    game.setLikes(state.likes);
    updateHud();
  } else if (event.type === 'gift' && typeof event.username === 'string') {
    log(`LIVE hediye olayı alındı: <b>@${escapeHtml(event.username)}</b> · hediye eşleştirmesi henüz yapılandırılmadı.`);
  }
});
updateHud();
log('Oyun başlatıldı. Test panelinden bir kullanıcıyı mekâna al.');
window.addEventListener('beforeunload', () => {
  for (const timer of state.timers.values()) window.clearTimeout(timer);
  socket.disconnect();
  game.dispose();
});
