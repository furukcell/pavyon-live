import './style.css';
import { createGame } from './game/createScene.js';

const socket = window.io?.();
const game = createGame(document.querySelector('#game-canvas'));
const logEl = document.querySelector('#event-log');
const state = { viewers: new Map(), likes: 0, kons: { 'kons-1': null, 'kons-2': null, 'kons-3': null } };
const usernameEl = document.querySelector('#username');
const konsSelect = document.querySelector('#kons-select');

function log(message) {
  const empty = logEl.querySelector('.empty');
  if (empty) empty.remove();
  const p = document.createElement('p');
  p.innerHTML = message;
  logEl.prepend(p);
  while (logEl.children.length > 30) logEl.lastElementChild.remove();
}
function username() {
  return usernameEl.value.trim().replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, 20) || 'misafir';
}
function updateHud() {
  document.querySelector('#guest-count').textContent = `${state.viewers.size} / 100`;
  const free = Object.values(state.kons).filter(v => !v).length;
  document.querySelector('#kons-count').textContent = `${free} müsait`;
  document.querySelector('#like-count').textContent = state.likes.toLocaleString('tr-TR');
}
function addViewer(name) {
  if (state.viewers.has(name)) return state.viewers.get(name);
  if (state.viewers.size >= 100) { log('<b>Kapasite dolu:</b> Mekânda 100 izleyici var.'); return null; }
  const guest = { name, id: `viewer-${crypto.randomUUID()}`, action: 'standing' };
  state.viewers.set(name, guest);
  game.addCustomer(guest);
  log(`<b>@${name}</b> pavyona giriş yaptı.`);
  updateHud();
  return guest;
}
function command(name, cmd) {
  let guest = state.viewers.get(name);
  if (cmd === '!gel') guest = addViewer(name);
  if (!guest) { log(`<b>@${name}</b> önce !gel yazarak mekâna katılmalı.`); return; }
  if (cmd === '!dans') { guest.action = 'dancing'; game.dance(guest.id); log(`<b>@${name}</b> dans pistine çıktı.`); }
  if (cmd === '!masa') { guest.action = 'seated'; game.seat(guest.id); log(`<b>@${name}</b> masaya oturdu.`); }
  if (cmd === '!sahne') { guest.action = 'stage'; game.stage(guest.id); log(`<b>@${name}</b> sahne isteği oluşturdu.`); }
}
function gift(name, type, konsId) {
  const guest = state.viewers.get(name) || addViewer(name);
  if (!guest) return;
  if (type === 'drink') { game.drink(guest.id); log(`Garson, <b>@${name}</b> için servis götürüyor.`); return; }
  if (type === 'stage') { game.show(guest.id); log(`<b>@${name}</b> için sahne gösterisi başladı.`); return; }
  const occupiedBy = state.kons[konsId];
  if (occupiedBy) { log(`<b>${konsId}</b> şu anda @${occupiedBy} ile meşgul.`); return; }
  state.kons[konsId] = name;
  updateHud();
  if (type === 'invite') { game.konsToTable(konsId, guest.id); log(`<b>${konsId}</b>, @${name} kullanıcısının masasına gidiyor.`); }
  if (type === 'dance') { game.konsDance(konsId, guest.id); log(`<b>${konsId}</b> ve @${name} birlikte dans ediyor.`); }
  if (type === 'vip') { game.vip(konsId, guest.id); log(`<b>${konsId}</b>, @${name} ile VIP locaya geçti.`); }
  window.setTimeout(() => { if (state.kons[konsId] === name) state.kons[konsId] = null; updateHud(); log(`<b>${konsId}</b> tekrar müsait.`); }, type === 'dance' ? 5 * 60_000 : 60_000);
}
document.querySelectorAll('[data-command]').forEach(btn => btn.addEventListener('click', () => command(username(), btn.dataset.command)));
document.querySelectorAll('[data-gift]').forEach(btn => btn.addEventListener('click', () => gift(username(), btn.dataset.gift, konsSelect.value)));
document.querySelector('#like-button').addEventListener('click', () => {
  state.likes += 1; game.setLikes(state.likes); updateHud(); log('Ortak beğeni göstergesi yükseldi.');
});
socket?.on('live:event', event => {
  if (!event || typeof event !== 'object') return;
  if (event.type === 'comment' && typeof event.username === 'string' && typeof event.comment === 'string') {
    const cmd = event.comment.trim().toLowerCase();
    if (['!gel','!dans','!masa','!sahne'].includes(cmd)) command(event.username, cmd);
  }
  if (event.type === 'like') { state.likes += Math.max(1, Number(event.count) || 1); game.setLikes(state.likes); updateHud(); }
  if (event.type === 'gift' && typeof event.username === 'string') {
    log(`LIVE hediye olayı alındı: <b>@${event.username}</b> · adaptör eşleştirmesi bekleniyor.`);
  }
});
updateHud();
log('Oyun başlatıldı. Test panelinden bir kullanıcıyı mekâna al.');
window.addEventListener('beforeunload', () => game.dispose());
