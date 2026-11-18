import './style.css';
import { io } from 'socket.io-client';
import { createGame } from './game/createScene.js';

// In development Vite proxies /socket.io to the local game server.
// In production the Express server serves both the built game and Socket.IO.
const socket = io({ transports: ['websocket', 'polling'], reconnectionAttempts: 5 });
const game = createGame(document.querySelector('#game-canvas'));
const logEl = document.querySelector('#event-log');
const state = {
  viewers: new Map(), likes: 0,
  kons: Object.fromEntries(Array.from({length:10},(_,i)=>['kons-'+(i+1),null])),
  timers: new Map(), lastCommands: new Map()
};
const usernameEl = document.querySelector('#username');
const konsSelect = document.querySelector('#kons-select');
const allowedCommands = new Set(['!gel', '!dans', '!masa', '!sahne']);
const allowedGiftActions = new Set(['invite', 'dance', 'drink', 'vip', 'stage']);

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
  document.querySelector('#kons-count').textContent = `${Object.values(state.kons).filter(value => !value).length} / 10 müsait`;
  document.querySelector('#like-count').textContent = state.likes.toLocaleString('tr-TR');
}
function addViewer(rawName) {
  const name = cleanUsername(rawName);
  if (state.viewers.has(name)) return state.viewers.get(name);
  if (state.viewers.size >= 100) { log('<b>Kapasite dolu:</b> Mekânda 100 izleyici var.'); return null; }
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
  if (now - (state.lastCommands.get(name) || 0) < 1200) return;
  state.lastCommands.set(name, now);
  let guest = state.viewers.get(name);
  if (cmd === '!gel') guest = addViewer(name);
  if (!guest) { log(`<b>@${escapeHtml(name)}</b> önce !gel yazarak mekâna katılmalı.`); return; }
  if (cmd === '!dans') { guest.action='dancing';game.dance(guest.id);log(`<b>@${escapeHtml(name)}</b> dans pistine çıktı.`); }
  else if (cmd === '!masa') { guest.action='seated';game.seat(guest.id);log(`<b>@${escapeHtml(name)}</b> masaya oturdu.`); }
  else if (cmd === '!sahne') { guest.action='stage';game.stage(guest.id);log(`<b>@${escapeHtml(name)}</b> sahneye çıktı.`); }
}
function occupyKons(konsId, name, duration, action) {
  if (!Object.prototype.hasOwnProperty.call(state.kons,konsId)) { log('Geçersiz kons seçimi.'); return false; }
  if (state.kons[konsId]) { log(`<b>${escapeHtml(konsId)}</b> şu anda @${escapeHtml(state.kons[konsId])} ile meşgul.`); return false; }
  state.kons[konsId] = name;
  action();
  updateHud();
  const timer = window.setTimeout(() => {
    if (state.kons[konsId] !== name) return;
    state.kons[konsId] = null;state.timers.delete(konsId);
    game.releaseKons(konsId);
    const guest=state.viewers.get(name);
    if(guest)game.releaseGuest(guest.id);
    updateHud();
    log(`<b>${escapeHtml(konsId)}</b> tekrar müsait. @${escapeHtml(name)} eski yerine döndü.`);
  }, duration);
  state.timers.set(konsId, timer);
  return true;
}
function gift(rawName, type, konsId) {
  const name = cleanUsername(rawName);
  const guest = state.viewers.get(name) || addViewer(name);
  if (!guest) return;
  if (type === 'drink') { game.drink(guest.id);log(`Garson, <b>@${escapeHtml(name)}</b> için servis götürüyor.`);return; }
  if (type === 'stage') { game.show(guest.id);log(`<b>@${escapeHtml(name)}</b> için sahne gösterisi başladı.`);return; }
  const duration = type === 'dance' || type === 'invite' ? 5*60_000 : 3*60_000;
  const actions = {
    invite:()=>{game.konsToTable(konsId,guest.id);log(`<b>${escapeHtml(konsId)}</b>, @${escapeHtml(name)} kullanıcısının masasına gidiyor.`);},
    dance:()=>{game.konsDance(konsId,guest.id);log(`<b>${escapeHtml(konsId)}</b> ve @${escapeHtml(name)} birlikte dans ediyor (5 dk).`);},
    vip:()=>{game.vip(konsId,guest.id);log(`<b>${escapeHtml(konsId)}</b>, @${escapeHtml(name)} ile VIP locaya geçti.`);}
  };
  if (actions[type]) occupyKons(konsId,name,duration,actions[type]);
}
document.querySelector('#send-comment').addEventListener('click', () => {
  const comment = document.querySelector('#comment-input').value.trim();
  if (!comment) return;
  log(`Yorum simülasyonu: <b>@${escapeHtml(username())}</b> → ${escapeHtml(comment)}`);
  command(username(), comment);
  document.querySelector('#comment-input').value = '';
});
document.querySelector('#comment-input').addEventListener('keydown', event => {
  if (event.key === 'Enter') document.querySelector('#send-comment').click();
});
document.querySelectorAll('[data-command]').forEach(button=>button.addEventListener('click',()=>command(username(),button.dataset.command)));
document.querySelectorAll('[data-gift]').forEach(button=>button.addEventListener('click',()=>gift(username(),button.dataset.gift,konsSelect.value)));
document.querySelectorAll('[data-spawn]').forEach(button => {
  button.addEventListener('click', () => {
    const amount = Number(button.dataset.spawn) || 0;
    let added = 0;
    for (let i = 0; i < amount && state.viewers.size < 100; i++) {
      const name = `demo_${String(Date.now()).slice(-5)}_${String(i+1).padStart(2,'0')}`;
      if (!state.viewers.has(name) && addViewer(name)) added++;
    }
    log(`Toplu test: ${added} müşteri eklendi. Kapasite ${state.viewers.size}/100.`);
  });
});
document.querySelector('#like-button').addEventListener('click',()=>{
  state.likes+=1;game.setLikes(state.likes);updateHud();log('Ortak beğeni göstergesi yükseldi.');
});
socket.on('connect',()=>log('<span class="system">Oyun sunucusuna bağlandı.</span>'));
socket.on('disconnect',()=>log('<span class="system">Sunucu bağlantısı kesildi; test paneli çalışmaya devam ediyor.</span>'));
socket.on('live:event',event=>{
  if(!event||typeof event!=='object')return;
  if(event.type==='comment'&&typeof event.username==='string'&&typeof event.comment==='string')command(event.username,event.comment);
  else if(event.type==='like'){state.likes+=Math.max(1,Math.min(10000,Number(event.count)||1));game.setLikes(state.likes);updateHud();}
  else if(event.type==='gift'&&typeof event.username==='string'){
    const action = String(event.action || '').toLowerCase();
    if (allowedGiftActions.has(action)) gift(event.username, action, state.kons[event.konsId] !== undefined ? event.konsId : konsSelect.value);
    else log(`LIVE hediye olayı alındı: <b>@${escapeHtml(event.username)}</b> · tanımlı oyun aksiyonu yok (giftName: ${escapeHtml(event.giftName || 'bilinmiyor')}).`);
  }
});
updateHud();log('Oyun başlatıldı. Test panelinden bir kullanıcıyı mekâna al.');
window.addEventListener('beforeunload',()=>{
  for(const timer of state.timers.values())window.clearTimeout(timer);
  socket.disconnect();game.dispose();
});
