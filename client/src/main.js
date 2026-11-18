import './style.css';
import { io } from 'socket.io-client';
import { createGame } from './game/createScene.js';
import { createSessionRules } from './game/sessionRules.js';
import { normalizeViewerName } from './game/viewerRules.js';
import { GIFT_ACTIONS, getGiftActionRule } from './game/giftRules.js';

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
const allowedCommands = new Set(['!gel', '!dans', '!masa', '!sahne', '!cik']);
const allowedGiftActions = new Set(GIFT_ACTIONS);
const sessionRules = createSessionRules(Object.keys(state.kons));
const musicAudio = new Audio();
musicAudio.preload = 'metadata';
musicAudio.volume = .65;
const musicState = { tracks: [], favorites: new Set(), category: 'pavyon', currentId: null, objectUrls: [] };
const musicPanel = document.querySelector('#music-panel');
const musicList = document.querySelector('#music-track-list');
const musicNowTitle = document.querySelector('#music-now-title');
const musicNowCategory = document.querySelector('#music-now-category');
function activeMusicTracks() {
  return musicState.tracks.filter(track => musicState.category === 'favorites'
    ? musicState.favorites.has(track.id)
    : track.category === musicState.category);
}
function renderMusicList() {
  musicList.replaceChildren();
  const tracks = activeMusicTracks();
  if (!tracks.length) {
    const empty = document.createElement('p');
    empty.className = 'music-empty';
    empty.textContent = musicState.category === 'favorites'
      ? 'Henüz favori müzik yok.'
      : 'Bu listede henüz müzik yok. Cihazından lisanslı müzik dosyaları ekleyebilirsin.';
    musicList.append(empty);
    return;
  }
  tracks.forEach(track => {
    const row = document.createElement('div');
    row.className = 'music-track' + (track.id === musicState.currentId ? ' playing' : '');
    const play = document.createElement('button');
    play.className = 'music-track-play';
    play.textContent = track.id === musicState.currentId && !musicAudio.paused ? 'Ⅱ' : '▶';
    play.setAttribute('aria-label', track.name + ' çal');
    play.addEventListener('click', () => playMusic(track.id));
    const name = document.createElement('span');
    name.className = 'music-track-name';
    name.textContent = track.name;
    const favorite = document.createElement('button');
    favorite.className = 'music-favorite';
    favorite.textContent = musicState.favorites.has(track.id) ? '★' : '☆';
    favorite.setAttribute('aria-label', 'Favorilere ekle/çıkar');
    favorite.addEventListener('click', () => {
      if (musicState.favorites.has(track.id)) musicState.favorites.delete(track.id);
      else musicState.favorites.add(track.id);
      renderMusicList();
    });
    row.append(play, name, favorite);
    musicList.append(row);
  });
}
function playMusic(id) {
  const track = musicState.tracks.find(item => item.id === id);
  if (!track) return;
  musicState.currentId = id;
  game.setMusicMood(track.category);
  musicAudio.src = track.url;
  musicAudio.play().then(() => {
    musicNowTitle.textContent = track.name;
    musicNowCategory.textContent = track.category === 'ankara' ? 'Ankara Havaları' : 'Pavyon';
    document.querySelector('#music-play').textContent = 'Ⅱ';
    renderMusicList();
  }).catch(() => {
    musicNowTitle.textContent = 'Tarayıcı müziği başlatamadı';
    log('Müzik başlatılamadı. Dosyanın ses formatını kontrol et ve tekrar dene.');
  });
}
function stepMusic(direction) {
  const tracks = activeMusicTracks();
  if (!tracks.length) return;
  let index = tracks.findIndex(track => track.id === musicState.currentId);
  index = index < 0 ? (direction > 0 ? -1 : 0) : index;
  const next = (index + direction + tracks.length) % tracks.length;
  playMusic(tracks[next].id);
}
document.querySelector('#music-toggle').addEventListener('click', () => {
  musicPanel.hidden = !musicPanel.hidden;
  document.querySelector('#music-toggle').setAttribute('aria-expanded', String(!musicPanel.hidden));
});
document.querySelector('#music-close').addEventListener('click', () => {
  musicPanel.hidden = true;
  document.querySelector('#music-toggle').setAttribute('aria-expanded', 'false');
});
document.querySelectorAll('[data-music-category]').forEach(button => button.addEventListener('click', () => {
  musicState.category = button.dataset.musicCategory;
  document.querySelectorAll('[data-music-category]').forEach(item => item.classList.toggle('active', item === button));
  renderMusicList();
}));
document.querySelector('#music-files').addEventListener('change', event => {
  const category = musicState.category === 'ankara' ? 'ankara' : 'pavyon';
  const files = [...(event.target.files || [])].filter(file => file.type.startsWith('audio/'));
  files.forEach(file => {
    const url = URL.createObjectURL(file);
    musicState.objectUrls.push(url);
    musicState.tracks.push({ id: crypto.randomUUID(), name: file.name.replace(/\\.[^.]+$/, ''), category, url });
  });
  renderMusicList();
  if (files.length) log(`${files.length} müzik dosyası ${category === 'ankara' ? 'Ankara Havaları' : 'Pavyon'} listesine eklendi.`);
  event.target.value = '';
});
document.querySelector('#music-play').addEventListener('click', () => {
  if (musicAudio.paused) {
    if (musicState.currentId) musicAudio.play().then(() => { document.querySelector('#music-play').textContent = 'Ⅱ'; }).catch(() => {});
    else stepMusic(1);
  } else {
    musicAudio.pause();
    document.querySelector('#music-play').textContent = '▶';
    renderMusicList();
  }
});
document.querySelector('#music-prev').addEventListener('click', () => stepMusic(-1));
document.querySelector('#music-next').addEventListener('click', () => stepMusic(1));
document.querySelector('#music-volume').addEventListener('input', event => { musicAudio.volume = Number(event.target.value) / 100; });
musicAudio.addEventListener('ended', () => stepMusic(1));


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
  return normalizeViewerName(typeof value === 'string' ? value : '');
}
function username() { return cleanUsername(usernameEl.value); }
function updateHud() {
  document.querySelector('#guest-count').textContent = `${state.viewers.size} / 100`;
  document.querySelector('#kons-count').textContent = `${Object.values(state.kons).filter(value => !value).length} / 10 müsait`;
  document.querySelectorAll('#kons-select option').forEach(option=>{
    const owner=state.kons[option.value];
    option.disabled=Boolean(owner);
    option.textContent=owner?`${option.value.replace('kons-','Kons ')} · @${owner}`:`${option.value.replace('kons-','Kons ')} · Müsait`;
  });
  document.querySelector('#like-count').textContent = state.likes.toLocaleString('tr-TR');
  const tables=game.getTableStatus();
  document.querySelector('#table-status').textContent=tables.map(table=>`${table.id}:${table.occupied}/${table.capacity}`).join(' · ');
}
function addViewer(rawName) {
  const name = cleanUsername(rawName);
  if (!name) { log('Geçersiz kullanıcı adı. Yorum veya izleyici adı boş olamaz.'); return null; }
  if (state.viewers.has(name)) return state.viewers.get(name);
  if (state.viewers.size >= 100) { log('<b>Kapasite dolu:</b> Mekânda 100 izleyici var.'); return null; }
  const guest = { name, id: `viewer-${crypto.randomUUID()}`, action: 'standing' };
  let sceneAdded = false;
  try {
    sceneAdded = game.addCustomer(guest) === true;
  } catch (error) {
    log('Müşteri sahneye eklenirken hata oluştu; giriş iptal edildi.');
    return null;
  }
  if (!sceneAdded) {
    log('Müşteri sahneye eklenemedi; giriş kaydı oluşturulmadı.');
    return null;
  }
  state.viewers.set(name, guest);
  log(`<b>@${escapeHtml(name)}</b> pavyona giriş yaptı.`);
  updateHud();
  return guest;
}
function removeViewer(rawName) {
  const name=cleanUsername(rawName);
  if(!name)return false;
  const guest=state.viewers.get(name);
  if(!guest)return false;
  if(guest.activeKons){
    const konsId=guest.activeKons;
    const timer=state.timers.get(konsId);
    if(timer)window.clearTimeout(timer);
    state.timers.delete(konsId);
    sessionRules.releaseViewer(name);
    state.kons[konsId]=null;
    game.releaseKons(konsId);
  }
  game.removeCustomer(guest.id);
  state.viewers.delete(name);
  state.lastCommands.delete(name);
  updateHud();
  log(`@<b>${escapeHtml(name)}</b> mekândan ayrıldı; masa ve servis rezervasyonları serbest bırakıldı.`);
  return true;
}
function command(rawName, rawCommand) {
  const name = cleanUsername(rawName);
  if (!name) return false;
  const cmd = String(rawCommand || '').trim().toLowerCase();
  if (!allowedCommands.has(cmd)) return;
  const now = Date.now();
  if (now - (state.lastCommands.get(name) || 0) < 1200) return;
  state.lastCommands.set(name, now);
  let guest = state.viewers.get(name);
  if(cmd==='!cik'){if(!removeViewer(name))log(`@<b>${escapeHtml(name)}</b> zaten mekânda değil.`);return;}
  if (cmd === '!gel') guest = addViewer(name);
  if (!guest) { log(`<b>@${escapeHtml(name)}</b> önce !gel yazarak mekâna katılmalı.`); return; }
  if(guest.activeKons){log(`@<b>${escapeHtml(name)}</b> kons etkileşimi sürerken bu komutu kullanamaz.`);return;}
  if (cmd === '!dans') { if(game.dance(guest.id)){guest.action='dancing';log(`<b>@${escapeHtml(name)}</b> dans pistine çıktı.`);} }
  else if (cmd === '!masa') { if(game.seat(guest.id)){guest.action='seated';updateHud();log(`<b>@${escapeHtml(name)}</b> masaya oturdu.`);}else log('Bütün masalar dolu. Bir koltuk boşalınca tekrar dene.'); }
  else if (cmd === '!sahne') { if(game.stage(guest.id)){guest.action='stage';log(`<b>@${escapeHtml(name)}</b> sahneye çıktı.`);} }
}
function occupyKons(konsId, name, duration, action) {
  if (!Object.prototype.hasOwnProperty.call(state.kons,konsId)) { log('Geçersiz kons seçimi.'); return false; }
  if (state.kons[konsId]) { log(`<b>${escapeHtml(konsId)}</b> şu anda @${escapeHtml(state.kons[konsId])} ile meşgul.`); return false; }
  if (!sessionRules.canReserve(konsId, name)) { log(`@<b>${escapeHtml(name)}</b> başka bir kons etkileşiminde veya rezervasyon şu anda uygun değil.`); return false; }
  const guest=state.viewers.get(name);
  if(guest?.activeKons){log(`@<b>${escapeHtml(name)}</b> başka bir kons etkileşiminde. Önce mevcut etkileşimin bitmesini beklemeli.`);return false;}
  // Reserve both sides before mutating the 3D scene; roll back if the scene rejects the action.
  if(!sessionRules.reserve(konsId,name)){log('Kons rezervasyonu alınamadı. Tekrar dene.');return false;}
  let actionStarted=false;
  try {
    actionStarted=action()!==false;
  } catch(error) {
    sessionRules.releaseKons(konsId);
    log('Etkileşim başlatılırken hata oluştu. Rezervasyon serbest bırakıldı.');
    return false;
  }
  if(!actionStarted){
    sessionRules.releaseKons(konsId);
    log('Bu alan şu anda dolu. Biraz sonra tekrar dene.');
    return false;
  }
  state.kons[konsId] = name;
  if(guest)guest.activeKons=konsId;
  updateHud();
  const timer = window.setTimeout(() => {
    if (state.kons[konsId] !== name) return;
    sessionRules.releaseKons(konsId);
    state.kons[konsId] = null;state.timers.delete(konsId);
    game.releaseKons(konsId);
    const activeGuest=state.viewers.get(name);
    if(activeGuest){activeGuest.activeKons=null;activeGuest.action='standing';game.releaseGuest(activeGuest.id);}
    updateHud();
    log(`<b>${escapeHtml(konsId)}</b> tekrar müsait. @${escapeHtml(name)} eski yerine döndü.`);
  }, duration);
  state.timers.set(konsId, timer);
  return true;
}
function gift(rawName, type, konsId) {
  const name = cleanUsername(rawName);
  if (!name) { log('Geçersiz kullanıcı adı nedeniyle hediye aksiyonu uygulanmadı.'); return; }
  const giftRule = getGiftActionRule(type);
  if (!giftRule) {
    log('Tanımlanmamış hediye aksiyonu reddedildi.');
    return;
  }
  const guest = state.viewers.get(name) || addViewer(name);
  if (!guest) return;
  if(guest.activeKons){
    log(`@<b>${escapeHtml(name)}</b> kons etkileşimi devam ederken yeni hediye aksiyonu başlatamaz.`);
    return;
  }
  if (type === 'drink') { const result=game.drink(guest.id);if(result==='serving')log(`Garson, <b>@${escapeHtml(name)}</b> için servis götürüyor.`);else if(result==='queued')log(`@<b>${escapeHtml(name)}</b> servis sırasına alındı. Garson boşalınca içeceği gelecek.`);else if(result==='duplicate')log(`@<b>${escapeHtml(name)}</b> için zaten aktif bir servis veya kuyruk talebi var.`);else log('Servis kapasitesi dolu. Biraz sonra tekrar dene.');return; }
  if (type === 'stage') { game.show(guest.id);log(`<b>@${escapeHtml(name)}</b> için sahne gösterisi başladı.`);return; }
  const duration = giftRule.durationMs;
  const actions = {
    invite:()=>{const ok=game.konsToTable(konsId,guest.id);if(ok)log(`<b>${escapeHtml(konsId)}</b>, @${escapeHtml(name)} kullanıcısının masasına gidiyor.`);return ok;},
    dance:()=>{const ok=game.konsDance(konsId,guest.id);if(ok)log(`<b>${escapeHtml(konsId)}</b> ve @${escapeHtml(name)} birlikte dans ediyor (5 dk).`);return ok;},
    vip:()=>{const ok=game.vip(konsId,guest.id);if(ok)log(`<b>${escapeHtml(konsId)}</b>, @${escapeHtml(name)} ile VIP locaya geçti.`);return ok;}
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
  socket.disconnect();game.dispose();musicAudio.pause();musicState.objectUrls.forEach(url=>URL.revokeObjectURL(url));
});
