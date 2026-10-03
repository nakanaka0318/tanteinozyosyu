'use strict';
/* =========================================================
   ENGINE : 描画・入力・UI・スクリプト実行
   ========================================================= */
const RS = 3, TS = 16;
let VW = 384, VH = 216;
const CFG_KEY = 'kurosagi_cfg_v1';
let STORY = STORY_KUROSAGI;
const FID = () => (STATE && STATE.follower) || 'kujo';
const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const dirOf = (dx, dy) => dx > 0 ? 'right' : dx < 0 ? 'left' : dy < 0 ? 'up' : 'down';

let STATE = null;
const stage = $('stage'), cv = $('game'), cx = cv.getContext('2d');
cv.width = VW * RS; cv.height = VH * RS;
const lc = document.createElement('canvas'); lc.width = cv.width; lc.height = cv.height;
const lx = lc.getContext('2d');

const CFG = { bgm: 0.7, se: 0.8, amb: 0.4, speed: 1 };
try { Object.assign(CFG, JSON.parse(localStorage.getItem(CFG_KEY) || '{}')); } catch (e) {}
function saveCfg() { try { localStorage.setItem(CFG_KEY, JSON.stringify(CFG)); } catch (e) {} }

const W = {
  mode: 'boot', map: null, mapId: null, P: null, actors: [], cam: { x: 0, y: 0 }, camTarget: null,
  lightning: 0, thunderIn: 9000, spot: null, t: 0, shakeT: 0, shakeP: 0, room: null,
  inputLock: false, busy: false, cinema: false, storm: true, hideHud: false, log: [],
};

function newState(name) {
  return { name, chapter: 0, flags: {}, evidence: [], seenEv: {}, seen: {}, trust: 50, time: '', follow: true, resume: null, map: '1F', x: 19, y: 23, dir: 'up' };
}

/* ======================= resize / touch ======================= */
const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0 && matchMedia('(pointer:coarse)').matches);
function resize() {
  const iw = window.visualViewport ? Math.round(visualViewport.width) : innerWidth;
  const ih = window.visualViewport ? Math.round(visualViewport.height) : innerHeight;
  const portrait = ih > iw * 1.05;
  document.body.classList.toggle('touch', isTouch);
  document.body.classList.toggle('touch-port', isTouch && portrait);
  document.body.classList.toggle('touch-land', isTouch && !portrait);
  stage.classList.toggle('vmode', portrait);
  $('touch').classList.toggle('hidden', !isTouch);
  let w, h;
  if (portrait) {
    const padH = isTouch ? Math.min(210, Math.round(ih * 0.27)) : 0;
    w = iw; h = Math.min(ih - padH, Math.round(w * 2.1));
  } else {
    const side = isTouch ? Math.min(150, Math.round(iw * 0.17)) : 0;
    w = iw - side * 2; h = w * 9 / 16;
    if (h > ih) { h = ih; w = h * 16 / 9; }
  }
  w = Math.floor(w); h = Math.floor(h);
  stage.style.width = w + 'px'; stage.style.height = h + 'px';
  const u = portrait ? w / 52 : w / 100;
  stage.style.setProperty('--u', u + 'px');
  stage.style.fontSize = `calc(var(--u)*${portrait ? 2.0 : (w < 700 ? 2.35 : 2.0)})`;
  // 論理解像度：縦持ちは縦長のビューにする
  const nVW = portrait ? 240 : 384, nVH = portrait ? Math.round(240 * h / w) : 216;
  if (nVW !== VW || nVH !== VH) {
    VW = nVW; VH = nVH;
    cv.width = VW * RS; cv.height = VH * RS; lc.width = cv.width; lc.height = cv.height;
    if (W.map) snapCam();
  }
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 200));
if (window.visualViewport) visualViewport.addEventListener('resize', resize);

/* ======================= input ======================= */
const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  Enter: 'ok', NumpadEnter: 'ok', Space: 'ok', KeyZ: 'ok', Escape: 'cancel', KeyX: 'cancel', Backspace: 'cancel', Tab: 'menu', ShiftLeft: 'dash', ShiftRight: 'dash' };
const held = new Set();
const UIH = [];
function pushH(h) { UIH.push(h); }
function popH(h) { const i = UIH.lastIndexOf(h); if (i >= 0) UIH.splice(i, 1); }
const topH = () => UIH[UIH.length - 1];

addEventListener('keydown', e => {
  if (document.activeElement === $('nm-input')) return;
  const a = KEYMAP[e.code]; if (!a) return;
  e.preventDefault();
  held.add(a);
  if (e.repeat && !['up', 'down', 'left', 'right'].includes(a)) return;
  if (e.repeat && !topH()) return;
  dispatch(a);
});
addEventListener('keyup', e => { const a = KEYMAP[e.code]; if (a) held.delete(a); });
addEventListener('blur', () => held.clear());

function dispatch(a) {
  SND.init();
  const h = topH();
  if (h) { h.key && h.key(a); return; }
  if (W.mode === 'play' && !W.busy) {
    if (a === 'ok') interact();
    else if (a === 'cancel' || a === 'menu') runScript(async () => { await NB.open('menu'); });
  }
}
stage.addEventListener('click', e => {
  SND.init();
  const h = topH();
  if (h && h.tap && !e.target.closest('button') && !e.target.closest('.nb-book') && !e.target.closest('.pk')) h.tap();
});
// touch pad
document.querySelectorAll('#touch button').forEach(b => {
  const k = b.dataset.k;
  const on = e => { e.preventDefault(); SND.init(); b.classList.add('on'); if (['up', 'down', 'left', 'right'].includes(k)) { held.add(k); if (topH()) dispatch(k); } else dispatch(k); };
  const off = e => { e.preventDefault(); b.classList.remove('on'); held.delete(k); };
  b.addEventListener('touchstart', on, { passive: false }); b.addEventListener('touchend', off, { passive: false }); b.addEventListener('touchcancel', off, { passive: false });
  b.addEventListener('mousedown', on); b.addEventListener('mouseup', off); b.addEventListener('mouseleave', off);
});
$('touch').addEventListener('click', e => { if (e.target === $('touch')) { const h = topH(); if (h && h.tap) h.tap(); } });
$('hud-menu').addEventListener('click', e => { e.stopPropagation(); if (!topH() && W.mode === 'play' && !W.busy) runScript(async () => { await NB.open('menu'); }); });
const heldDir = () => ['up', 'down', 'left', 'right'].find(d => held.has(d)) || null;

/* ======================= text helpers ======================= */
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function sub(s) { return String(s).replace(/\{N\}/g, STATE ? STATE.name : '真白'); }
function richHTML(s) { return esc(sub(s)).replace(/【(.+?)】/g, '<span class="kw">$1</span>').replace(/《(.+?)》/g, '<span class="kw">$1</span>').replace(/\n/g, '<br>'); }
function charName(id) { const c = CHARS[id]; if (!c) return id; return typeof c.name === 'function' ? c.name() : c.short || c.name; }
function fullName(id) { const c = CHARS[id]; if (!c) return id; return typeof c.name === 'function' ? c.name() : c.name; }
function shortName(id) { const c = CHARS[id]; if (!c) return id; const s = c.short; return typeof s === 'function' ? s() : s; }

/* ======================= map / actors ======================= */
function mkActor(id, x, y, dir) {
  return { id, x, y, px: x * TS, py: y * TS, dir: dir || 'down', moving: false, fx: x, fy: y, tx: x, ty: y, prog: 0, speed: 1 / 170, path: [], waiters: [], anim: 0, look: ART.LOOKS[id], visible: true };
}
function loadMap(id, x, y, dir) {
  const m = MAPS[id];
  if (!m._r) {
    m.grid = m.rows; m.w = m.rows[0].length; m.h = m.rows.length;
    m._art = m.theme === 'plane' ? SKYART : m.theme === 'hideout' ? ABART : m.theme === 'dream' ? DRART : m.theme ? CYART : ART;
    m._r = m._art.renderMap(m, RS);
  }
  W.map = m; W.mapId = id;
  STATE.map = id;
  W.P = mkActor('me', x, y, dir || 'down');
  W.P.look = ART.LOOKS[m.playerLook || 'me'];
  rebuildActors();
  W.room = null;
  W.camTarget = null;
  snapCam();
}
function rebuildActors() {
  W.actors = [];
  for (const n of STORY.npcs(W.mapId)) W.actors.push(mkActor(n.id, n.x, n.y, n.dir));
  if (STATE.follow && !W.actors.find(a => a.id === FID())) placeFollower();
}
function placeFollower() {
  const P = W.P; const [dx, dy] = DV[P.dir];
  let fx = P.x - dx, fy = P.y - dy;
  if (!walkable(fx, fy) || actorAt(fx, fy)) {
    const alt = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([a, b]) => [P.x + a, P.y + b]).find(([a, b]) => walkable(a, b) && !actorAt(a, b));
    if (alt) [fx, fy] = alt; else [fx, fy] = [P.x, P.y];
  }
  W.actors = W.actors.filter(a => a.id !== FID());
  W.actors.push(mkActor(FID(), fx, fy, P.dir));
}
const tileAt = (x, y) => ART.at(W.map.grid, x, y);
const walkable = (x, y) => x >= 0 && y >= 0 && x < W.map.w && y < W.map.h && W.map._art.WALK.has(tileAt(x, y));
const logical = a => a.moving ? [a.tx, a.ty] : [a.x, a.y];
function actorAt(x, y, except) {
  return W.actors.find(a => a !== except && a.visible && ((a.x === x && a.y === y) || (a.moving && a.tx === x && a.ty === y)));
}
const getActor = id => id === 'me' ? W.P : W.actors.find(a => a.id === id);
function events() { return (STORY.EVENTS[W.mapId] || []).filter(e => !e.when || e.when()); }
function eventAt(x, y) { return events().find(e => e.at.some(([a, b]) => a === x && b === y)); }
const evSolid = e => e.solid === undefined ? !!e.sprite : (typeof e.solid === 'function' ? e.solid() : e.solid);

function stepActor(a, dt) {
  if (!a.moving && a.path.length) startStep(a);
  if (a.moving) {
    a.prog += dt * a.speed; a.anim += dt;
    if (a.prog >= 1) {
      a.x = a.tx; a.y = a.ty; a.moving = false;
      a.px = a.x * TS; a.py = a.y * TS;
      if (a === W.P) onPlayerArrive();
      if (a.path.length) { const over = a.prog - 1; startStep(a); a.prog = over; }
    } else {
      a.px = (a.fx + (a.tx - a.fx) * a.prog) * TS; a.py = (a.fy + (a.ty - a.fy) * a.prog) * TS;
    }
  }
  if (!a.moving && !a.path.length && a.waiters.length) { const w = a.waiters; a.waiters = []; w.forEach(r => r()); }
}
function startStep(a) {
  const [dx, dy] = a.path.shift();
  if (dx === 0 && dy === 0) return;
  a.dir = dirOf(dx, dy); a.fx = a.x; a.fy = a.y; a.tx = a.x + dx; a.ty = a.y + dy; a.moving = true; a.prog = 0;
}

/* ======================= player control ======================= */
function tryMove(d) {
  const P = W.P; P.dir = d;
  const [dx, dy] = DV[d], nx = P.x + dx, ny = P.y + dy;
  const ev = eventAt(nx, ny);
  if (ev && evSolid(ev)) { if (ev.bump) { runScript(ev.bump); } return; }
  if (!walkable(nx, ny)) return;
  const k = STATE.follow ? getActor(FID()) : null;
  const blocker = actorAt(nx, ny, k);
  if (blocker) return;
  const fromX = P.x, fromY = P.y;
  P.speed = held.has('dash') ? 1 / 105 : 1 / 165;
  P.path.push([dx, dy]);
  if (k) {
    const [kx, ky] = logical(k);
    k.speed = P.speed;
    if (Math.abs(kx - fromX) + Math.abs(ky - fromY) === 1) k.path.push([fromX - kx, fromY - ky]);
    else if (!(kx === fromX && ky === fromY)) { k.path = []; k.moving = false; k.x = fromX; k.y = fromY; k.px = fromX * TS; k.py = fromY * TS; }
  }
}
function onPlayerArrive() {
  W.stepN = (W.stepN || 0) + 1;
  if (W.stepN % 2 === 0) SND.se('step');
  const ev = eventAt(W.P.x, W.P.y);
  if (ev && ev.step && !W.busy) runScript(ev.step);
  updateRoom();
  if (STORY.onStep && !W.busy) STORY.onStep(W.P.x, W.P.y);
}
function facing() { const [dx, dy] = DV[W.P.dir]; return [W.P.x + dx, W.P.y + dy]; }
function interactTarget() {
  const [fx, fy] = facing();
  const a = actorAt(fx, fy); if (a) return { type: 'actor', a, x: fx, y: fy };
  const ev = eventAt(fx, fy); if (ev && ev.check) return { type: 'event', ev, x: fx, y: fy };
  const ch = tileAt(fx, fy); if (STORY.FLAVOR[ch]) return { type: 'flavor', ch, x: fx, y: fy };
  return null;
}
function interact() {
  const t = interactTarget(); if (!t) return;
  if (t.type === 'actor') {
    const a = t.a; const [dx, dy] = DV[W.P.dir];
    a.dir = dirOf(-dx, -dy);
    runScript(() => STORY.talk(a.id));
  } else if (t.type === 'event') runScript(t.ev.check);
  else runScript(() => STORY.flavor(t.ch, t.x, t.y));
}

/* ======================= script runner ======================= */
async function runScript(fn) {
  if (W.busy) return;
  W.busy = true; refreshHUD();
  let aborted = false;
  try { await fn(); } catch (e) { if (e && e.abort) aborted = true; else console.error(e); }
  await DLG.close();
  W.busy = false; W.inputLock = true;
  if (aborted) { resetOverlays(); const f = W.afterAbort; W.afterAbort = null; if (f) f(); return; }
  if (STATE) STATE.resume = null;
  refreshHUD();
  if (W.mode === 'play') autosave();
}
function resetOverlays() {
  UIH.length = 0;
  ['notebook', 'choices', 'card', 'cutin', 'timeline', 'chapter', 'mono', 'picker', 'toast', 'battle', 'gameover', 'namebox'].forEach(i => { const e = $(i); if (e) e.classList.add('hidden'); });
  DLG.close(); setCinema(false); stage.classList.remove('flashback'); W.spot = null; W.hideHud = false; W.camTarget = null;
}

/* ======================= camera ======================= */
function camDesired() {
  let tx, ty;
  if (W.camTarget) { tx = W.camTarget[0] * TS + 8; ty = W.camTarget[1] * TS + 8; }
  else { tx = W.P.px + 8; ty = W.P.py + 4; }
  const mw = W.map.w * TS, mh = W.map.h * TS;
  let x = tx - VW / 2, y = ty - VH / 2 - (DLG.visible ? (VH > VW ? VH * 0.16 : 24) : 0);
  x = mw <= VW ? (mw - VW) / 2 : Math.max(0, Math.min(mw - VW, x));
  y = mh <= VH ? (mh - VH) / 2 : Math.max(-30, Math.min(mh - VH + 30, y));
  return [x, y];
}
function snapCam() { const [x, y] = camDesired(); W.cam.x = x; W.cam.y = y; }

/* ======================= main loop ======================= */
let last = performance.now();
function frame(now) {
  const dt = Math.min(50, now - last); last = now; W.t += dt;
  try { update(dt); render(dt); } catch (e) { console.error(e); }
  requestAnimationFrame(frame);
}
function update(dt) {
  DLG.update(dt);
  if (W.lightning > 0) W.lightning = Math.max(0, W.lightning - dt / 380);
  if (W.shakeT > 0) W.shakeT -= dt;
  if (W.mode === 'title' || W.mode === 'home') { titleRenderer().update(dt); return; }
  if (W.mode !== 'play' || !W.map) return;
  if (W.storm && !W.busy && !W.map.theme) {
    W.thunderIn -= dt;
    if (W.thunderIn <= 0) { W.thunderIn = 16000 + Math.random() * 26000; lightning(0.55 + Math.random() * 0.45); }
  }
  if (STORY.tick && !W.busy && !topH()) STORY.tick(dt);
  if (!W.busy && !topH()) {
    if (W.inputLock) { if (!heldDir()) W.inputLock = false; }
    else if (!W.P.moving && !W.P.path.length) { const d = heldDir(); if (d) tryMove(d); }
  }
  stepActor(W.P, dt);
  W.actors.forEach(a => stepActor(a, dt));
  const [x, y] = camDesired();
  const k = 1 - Math.exp(-dt / (W.camTarget ? 260 : 70));
  W.cam.x += (x - W.cam.x) * k; W.cam.y += (y - W.cam.y) * k;
  if (Math.abs(x - W.cam.x) > 400 || Math.abs(y - W.cam.y) > 400) snapCam();
}
function lightning(power = 1) {
  W.lightning = power;
  setTimeout(() => SND.se('thunder', power), 200 + Math.random() * 900);
}

function render(dt) {
  cx.setTransform(1, 0, 0, 1, 0, 0);
  cx.imageSmoothingEnabled = false;
  cx.fillStyle = '#000'; cx.fillRect(0, 0, cv.width, cv.height);
  if (W.mode === 'title' || W.mode === 'home') { titleRenderer().render(cx); return; }
  if (!W.map || W.mode !== 'play') return;
  let sx = 0, sy = 0;
  if (W.shakeT > 0) { sx = (Math.random() - 0.5) * W.shakeP; sy = (Math.random() - 0.5) * W.shakeP; }
  const ox = Math.round((-W.cam.x + sx) * RS) / RS, oy = Math.round((-W.cam.y + sy) * RS) / RS;
  const m = W.map;
  cx.setTransform(RS, 0, 0, RS, 0, 0);
  cx.drawImage(m._r.canvas, ox, oy, m.w * TS, m.h * TS);
  cx.setTransform(RS, 0, 0, RS, ox * RS, oy * RS);
  for (const a of m._r.anims) {
    const x = a.tx * TS, y = a.ty * TS;
    if (x + ox > VW + 16 || x + ox < -32 || y + oy > VH + 32 || y + oy < -32) continue;
    m._art.drawAnim(cx, a, W.t, W.lightning, W.storm);
  }
  // drawables
  const list = [];
  for (const e of events()) if (e.sprite) { const [x, y] = e.at[0]; list.push({ y: y * TS + (e.z || 0), d: () => m._art.drawSprite(cx, e.sprite, x * TS, y * TS, W.t) }); }
  const all = [...W.actors, W.P];
  for (const a of all) if (a.visible) list.push({ y: a.py + 8, d: () => { const fr = a.moving ? [1, 0, 3, 0][Math.floor(a.anim / 115) % 4] : 0; ART.drawChar(cx, a.px, a.py, a.dir, fr, a.look); } });
  list.sort((a, b) => a.y - b.y).forEach(o => o.d());
  if (STORY.overlay) STORY.overlay(cx);
  // lighting
  drawLighting(ox, oy);
  // overlays
  cx.setTransform(RS, 0, 0, RS, ox * RS, oy * RS);
  if (!W.busy && !W.spot) {
    for (const e of events()) if (e.clue && e.clue()) {
      const [x, y] = e.at[0]; const a = 0.5 + 0.5 * Math.sin(W.t * 0.005 + x);
      sparkle(x * TS + 8, y * TS + (e.sprite ? 4 : 2), a);
    }
    const t = interactTarget();
    if (t && !W.P.moving) bubble(t.x * TS + 8, t.y * TS - (t.type === 'actor' ? 14 : 4), t.type === 'actor' ? '…' : '！');
  }
  if (STATE && STATE.chapter >= 4) { cx.setTransform(1, 0, 0, 1, 0, 0); cx.fillStyle = 'rgba(255,190,120,.07)'; cx.fillRect(0, 0, cv.width, cv.height); }
}
function sparkle(x, y, a) {
  cx.save(); cx.globalAlpha = a; cx.fillStyle = '#fff2c8';
  cx.beginPath(); cx.moveTo(x, y - 5); cx.lineTo(x + 1, y - 1); cx.lineTo(x + 5, y); cx.lineTo(x + 1, y + 1); cx.lineTo(x, y + 5); cx.lineTo(x - 1, y + 1); cx.lineTo(x - 5, y); cx.lineTo(x - 1, y - 1); cx.fill();
  cx.globalAlpha = a * 0.4; cx.beginPath(); cx.arc(x, y, 4, 0, 7); cx.fill(); cx.restore();
}
function bubble(x, y, ch) {
  const b = Math.sin(W.t * 0.008) * 1.2;
  cx.save(); cx.translate(x, y + b);
  cx.fillStyle = 'rgba(250,244,228,.95)'; cx.strokeStyle = '#2a1a10'; cx.lineWidth = 0.6;
  cx.beginPath(); cx.roundRect ? cx.roundRect(-6, -9, 12, 9, 3) : cx.rect(-6, -9, 12, 9); cx.fill(); cx.stroke();
  cx.beginPath(); cx.moveTo(-2, 0); cx.lineTo(0, 3); cx.lineTo(2, 0); cx.fill();
  cx.fillStyle = '#8a1e22'; cx.font = 'bold 7px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(ch, 0, -4.2);
  cx.restore();
}
function drawLighting(ox, oy) {
  const m = W.map;
  let dark = W.spot ? 0.86 : m.dark;
  if (STATE.chapter >= 4) dark = 0.08;
  dark *= (1 - W.lightning * 0.72);
  cx.setTransform(1, 0, 0, 1, 0, 0);
  if (dark > 0.01) {
    lx.globalCompositeOperation = 'source-over';
    lx.clearRect(0, 0, lc.width, lc.height);
    lx.fillStyle = `rgba(5,4,12,${dark})`; lx.fillRect(0, 0, lc.width, lc.height);
    lx.globalCompositeOperation = 'destination-out';
    const hole = (wx, wy, r, a = 1) => {
      const sx = (wx + ox) * RS, sy = (wy + oy) * RS, rr = r * RS;
      if (sx < -rr || sy < -rr || sx > lc.width + rr || sy > lc.height + rr) return;
      const g = lx.createRadialGradient(sx, sy, 0, sx, sy, rr);
      g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(0.5, `rgba(0,0,0,${a * 0.65})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      lx.fillStyle = g; lx.beginPath(); lx.arc(sx, sy, rr, 0, 7); lx.fill();
    };
    if (W.spot) {
      const s = getActor(W.spot);
      for (const a of [...W.actors, W.P]) if (a.visible) hole(a.px + 8, a.py + 2, 26, 0.55);
      if (s) hole(s.px + 8, s.py + 2, 70, 1);
    } else {
      for (const l of m._r.lights) {
        if (l.win) { if (W.lightning > 0.05) hole(l.x, l.y + 10, 60 * W.lightning, 0.9); continue; }
        const f = l.flick ? 1 + Math.sin(W.t * 0.011 + l.x) * 0.03 + Math.sin(W.t * 0.027 + l.y) * 0.025 : 1;
        hole(l.x, l.y, l.r * f, 0.95);
      }
      hole(W.P.px + 8, W.P.py + 4, 54, 0.8);
      for (const a of W.actors) if (a.visible) hole(a.px + 8, a.py + 4, 22, 0.45);
    }
    cx.drawImage(lc, 0, 0);
  }
  if (!W.spot && STATE.chapter < 4) {
    cx.globalCompositeOperation = 'lighter';
    for (const l of m._r.lights) {
      if (l.win) continue;
      const sx = (l.x + ox) * RS, sy = (l.y + oy) * RS, rr = l.r * RS * 0.9;
      if (sx < -rr || sy < -rr || sx > cv.width + rr || sy > cv.height + rr) continue;
      const f = l.flick ? 0.85 + Math.sin(W.t * 0.013 + l.x) * 0.15 : 1;
      const g = cx.createRadialGradient(sx, sy, 0, sx, sy, rr);
      g.addColorStop(0, `rgba(${l.col},${l.a * f})`); g.addColorStop(1, `rgba(${l.col},0)`);
      cx.fillStyle = g; cx.beginPath(); cx.arc(sx, sy, rr, 0, 7); cx.fill();
    }
    cx.globalCompositeOperation = 'source-over';
  }
  if (W.lightning > 0.05) { cx.fillStyle = `rgba(200,215,255,${W.lightning * 0.18})`; cx.fillRect(0, 0, cv.width, cv.height); }
}

/* ======================= HUD ======================= */
function updateRoom() {
  if (!W.map) return;
  const r = W.map.rooms.find(r => W.P.x >= r.x1 && W.P.x <= r.x2 && W.P.y >= r.y1 && W.P.y <= r.y2);
  const n = r ? r.name : W.room;
  if (n && n !== W.room) {
    W.room = n; $('hud-place').textContent = n;
    if (!W.busy && W.mode === 'play' && !W.cinema) {
      const el = $('room-label'); el.textContent = n; el.classList.remove('hidden');
      el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    }
  }
}
function refreshHUD() {
  const show = W.mode === 'play' && !W.cinema && !W.hideHud;
  $('hud').classList.toggle('hidden', !show);
  if (!STATE) return;
  $('hud-time').textContent = STATE.time || '';
  $('trust-fill').style.width = Math.max(0, Math.min(100, STATE.trust)) + '%';
  $('hud-trust').classList.toggle('hidden', !!(STORY.hideTrust && STORY.hideTrust()));
  $('hud-focus').querySelector('.lbl').textContent = STORY.focusLabel || '集中';
  const hasF = typeof STATE.focus === 'number';
  $('hud-focus').classList.toggle('hidden', !hasF);
  if (hasF) $('focus-fill').style.width = Math.max(0, Math.min(100, STATE.focus)) + '%';
  const o = STORY.objective();
  $('hud-obj').classList.toggle('hidden', !o);
  $('hud-objtext').textContent = o || '';
  if (!W.room) updateRoom();
}

/* ======================= Dialogue ======================= */
const DLG = {
  el: $('dialog'), nameEl: $('dlg-name'), textEl: $('dlg-text'), visible: false,
  spans: [], idx: 0, acc: 0, typing: false, resolve: null, voice: 1, curL: null, curR: null, h: null,
  show(who, text, expr, opts = {}) {
    return new Promise(res => {
      const narr = !who;
      this.el.classList.remove('hidden', 'ready');
      this.el.classList.toggle('narr', narr);
      this.el.classList.toggle('me', who === 'me');
      this.nameEl.textContent = narr ? '' : charName(who);
      this.textEl.className = opts.big ? 'big' : '';
      this.visible = true;
      this.portrait(who, expr, opts);
      // build spans
      const raw = sub(text);
      let html = '', cls = '', n = 0;
      const chars = [];
      for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        if (ch === '【') { cls = 'kw'; html += `<span class="c kw">【</span>`; chars.push('【'); continue; }
        if (ch === '】') { html += `<span class="c kw">】</span>`; chars.push('】'); cls = ''; continue; }
        if (ch === '《') { cls = 'em'; continue; }
        if (ch === '》') { cls = ''; continue; }
        if (ch === '\n') { html += '<br>'; continue; }
        html += `<span class="c ${cls}">${esc(ch)}</span>`; chars.push(ch); n++;
      }
      this.textEl.innerHTML = html;
      this.spans = [...this.textEl.querySelectorAll('.c')];
      this.chars = chars;
      this.idx = 0; this.acc = 0; this.typing = true; this.resolve = res;
      this.voice = who && CHARS[who] ? CHARS[who].voice : 0.95;
      this.blipN = 0;
      W.log.push({ who: narr ? '' : charName(who), text: raw.replace(/[《》]/g, '') });
      if (W.log.length > 300) W.log.shift();
      if (this.h) popH(this.h);
      this.h = { key: a => { if (a === 'ok' || a === 'cancel') this.advance(); }, tap: () => this.advance() };
      pushH(this.h);
    });
  },
  portrait(who, expr = 'normal', opts) {
    const L = $('portrait-l'), Rr = $('portrait-r');
    if (!who || !PORTRAIT.has(who) || opts.noPortrait) { L.classList.remove('show'); Rr.classList.remove('show'); this.curL = this.curR = null; return; }
    const right = who === 'me';
    const el = right ? Rr : L, other = right ? L : Rr;
    const key = who + ':' + expr;
    if ((right ? this.curR : this.curL) !== key) {
      el.innerHTML = PORTRAIT.svg(who, expr);
      if (right) this.curR = key; else this.curL = key;
    }
    el.classList.add('show'); other.classList.remove('show');
    if (right) this.curL = null; else this.curR = null;
    el.classList.remove('jump', 'tremble'); void el.offsetWidth;
    if (opts.jump || expr === 'shock') el.classList.add('jump');
    if (opts.tremble) el.classList.add('tremble');
  },
  update(dt) {
    if (!this.typing) return;
    const base = 1000 / (36 * [0.6, 1, 1.8][CFG.speed]);
    this.acc += dt;
    while (this.typing && this.acc >= 0) {
      if (this.idx >= this.spans.length) { this.finish(); break; }
      const ch = this.chars[this.idx];
      this.spans[this.idx].classList.add('on'); this.idx++;
      let d = base;
      if ('。！？!?'.includes(ch)) d += 210; else if ('、，'.includes(ch)) d += 80; else if ('…'.includes(ch)) d += 60; else if ('―'.includes(ch)) d += 20;
      if (!' 　。、！？…―「」『』【】'.includes(ch) && (this.blipN++ % 2 === 0)) SND.se('blip', this.voice);
      this.acc -= d;
    }
  },
  finish() { this.typing = false; this.spans.forEach(s => s.classList.add('on')); this.el.classList.add('ready'); },
  advance() {
    if (this.typing) { this.finish(); return; }
    if (this.resolve) { const r = this.resolve; this.resolve = null; if (this.h) { popH(this.h); this.h = null; } r(); }
  },
  async close() {
    if (this.h) { popH(this.h); this.h = null; }
    this.el.classList.add('hidden'); this.visible = false;
    $('portrait-l').classList.remove('show'); $('portrait-r').classList.remove('show');
    this.curL = this.curR = null;
  },
};

/* ======================= Choices ======================= */
function choose(options, prompt) {
  return new Promise(res => {
    const box = $('choices'); box.innerHTML = '';
    if (prompt) { const q = document.createElement('div'); q.className = 'q'; q.textContent = sub(prompt); box.appendChild(q); }
    let sel = 0;
    const btns = options.map((o, i) => {
      const b = document.createElement('button');
      const txt = typeof o === 'string' ? o : o.text;
      b.textContent = sub(txt);
      if (o.done) b.classList.add('done');
      b.addEventListener('click', e => { e.stopPropagation(); pick(i); });
      b.addEventListener('mouseenter', () => { sel = i; draw(); });
      box.appendChild(b); return b;
    });
    const draw = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
    const pick = i => { SND.se('ok'); popH(h); box.classList.add('hidden'); res(i); };
    const h = { key: a => {
      if (a === 'up') { sel = (sel + btns.length - 1) % btns.length; SND.se('cursor'); draw(); }
      else if (a === 'down') { sel = (sel + 1) % btns.length; SND.se('cursor'); draw(); }
      else if (a === 'ok') pick(sel);
    } };
    draw(); box.classList.remove('hidden'); pushH(h);
  });
}

/* ======================= Monologue ======================= */
async function mono(lines) {
  const box = $('mono'), p = $('mono-text');
  DLG.close();
  box.classList.remove('hidden', 'ready');
  for (const line of lines) {
    p.innerHTML = richHTML(line);
    await sleep(60); p.classList.add('on');
    W.log.push({ who: '', text: sub(line) });
    await sleep(900); box.classList.add('ready');
    await new Promise(r => { const h = { key: a => { if (a === 'ok' || a === 'cancel') { popH(h); r(); } }, tap: () => { popH(h); r(); } }; pushH(h); });
    box.classList.remove('ready'); p.classList.remove('on');
    await sleep(700);
  }
  box.classList.add('hidden');
}

/* ======================= Overlays ======================= */
function waitOkOr(maxMs, minMs = 0) {
  return new Promise(r => {
    const t0 = performance.now(); let done = false;
    const fin = () => { if (done) return; done = true; popH(h); clearTimeout(tm); r(); };
    const tryFin = () => { if (performance.now() - t0 >= minMs) fin(); };
    const h = { key: a => { if (a === 'ok' || a === 'cancel') tryFin(); }, tap: tryFin };
    pushH(h);
    const tm = setTimeout(fin, maxMs);
  });
}
function waitOk(minMs = 0) {
  return new Promise(r => {
    const t0 = performance.now();
    const go = () => { if (performance.now() - t0 < minMs) return; popH(h); r(); };
    const h = { key: a => { if (a === 'ok' || a === 'cancel') go(); }, tap: go };
    pushH(h);
  });
}
async function gain(id, kicker) {
  if (!STATE.evidence.includes(id)) STATE.evidence.push(id);
  STATE.flags[id] = true;
  const e = EVIDENCE[id];
  SND.se('clue');
  $('card-kicker').textContent = kicker || (e.icon === 'voice' || e.icon === 'slip' ? '証言を記録' : '証拠品を入手');
  $('card-icon').innerHTML = ART.ICONS[e.icon];
  $('card-name').textContent = e.name;
  $('card-desc').innerHTML = richHTML(e.desc());
  const c = $('card'); c.classList.remove('hidden');
  await waitOk(450);
  SND.se('page');
  c.classList.add('hidden');
  refreshHUD();
}
async function chapterCard(num, title, subt) {
  DLG.close();
  const el = $('chapter');
  $('ch-num').textContent = num; $('ch-title').textContent = title; $('ch-sub').textContent = subt || '';
  el.classList.remove('hidden');
  [...el.children].forEach(c => { c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; });
  SND.se('chime');
  await waitOkOr(5200, 1800);
  el.style.transition = 'opacity .8s'; el.style.opacity = '0';
  await sleep(800);
  el.classList.add('hidden'); el.style.opacity = ''; el.style.transition = '';
}
function toast(html, ms = 7000) {
  const t = $('toast'); t.innerHTML = html; t.classList.remove('hidden');
  t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), ms);
}
async function cutin(text, icon, ms = 1300) {
  const el = $('cutin');
  $('ci-text').textContent = text; $('ci-icon').innerHTML = icon ? ART.ICONS[icon] : '';
  el.classList.remove('hidden');
  [...el.querySelectorAll('*')].forEach(c => { c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; });
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  SND.se('present'); flash('#fff', 180); shake(4, 300);
  await sleep(ms);
  el.classList.add('hidden');
}
async function timeline(marks, zone, range) {
  const box = $('tl-body'); box.innerHTML = '<div class="tl-axis"></div>';
  const vert = VH > VW, P = vert ? 'top' : 'left', SZ = vert ? 'height' : 'width';
  box.classList.toggle('vert', vert);
  const tm = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const t0 = range ? tm(range[0]) : 21 * 60 + 20, t1 = range ? tm(range[1]) : 22 * 60 + 55;
  $('portrait-l').classList.remove('show'); $('portrait-r').classList.remove('show'); DLG.curL = DLG.curR = null;
  const pos = s => { const [h, m] = s.split(':').map(Number); return ((h * 60 + m - t0) / (t1 - t0)) * 100; };
  [].forEach(s => { const d = document.createElement('div'); d.className = 'tl-mark down'; d.style.left = pos(s) + '%'; d.style.animationDelay = '0s'; d.innerHTML = `<div class="dot" style="width:4px;height:4px;box-shadow:none;background:#8a6c34"></div><div class="tm" style="opacity:.6">${s}</div>`; box.appendChild(d); });
  marks.forEach((m, i) => {
    const d = document.createElement('div');
    d.className = 'tl-mark ' + (i % 2 ? 'down' : 'up') + (m.cls ? ' ' + m.cls : '');
    d.style[P] = pos(m.t) + '%'; d.style.animationDelay = (0.3 + i * 0.35) + 's';
    d.innerHTML = `<div class="dot"></div><div class="tm">${m.t}</div><div class="ev">${richHTML(m.text)}</div>`;
    box.appendChild(d);
  });
  if (zone) {
    const z = document.createElement('div'); z.className = 'tl-zone';
    z.style[P] = pos(zone[0]) + '%'; z.style[SZ] = (pos(zone[1]) - pos(zone[0])) + '%';
    z.style.animationDelay = (0.4 + marks.length * 0.35) + 's';
    z.innerHTML = `<span>${zone[2]}</span>`; box.appendChild(z);
  }
  DLG.el.classList.add('hidden');
  $('timeline').classList.remove('hidden'); SND.se('page');
  await waitOk(800 + marks.length * 300);
  $('timeline').classList.add('hidden');
}
function flash(col = '#fff', ms = 300) {
  const f = $('flash'); f.style.transition = 'none'; f.style.background = col; f.style.opacity = '0.85';
  void f.offsetWidth; f.style.transition = `opacity ${ms}ms ease-out`; f.style.opacity = '0';
}
function shake(p = 4, ms = 400, ui = false) {
  W.shakeP = p; W.shakeT = ms;
  if (ui) { stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake'); setTimeout(() => stage.classList.remove('shake'), 400); }
}
function fade(to, ms = 500) {
  const f = $('fade'); f.style.transition = `opacity ${ms}ms`; f.style.opacity = to; return sleep(ms + 20);
}
function setCinema(on) { W.cinema = on; stage.classList.toggle('cinema', on); refreshHUD(); }

/* ======================= person picker ======================= */
function pickPerson(prompt, ids) {
  return new Promise(res => {
    DLG.el.classList.add('hidden');
    $('portrait-l').classList.remove('show'); $('portrait-r').classList.remove('show'); DLG.curL = DLG.curR = null;
    $('pk-prompt').textContent = sub(prompt);
    const row = $('pk-row'); row.innerHTML = ''; row.classList.toggle('many', ids.length > 5);
    let sel = 0;
    const els = ids.map((id, i) => {
      const d = document.createElement('div'); d.className = 'pk';
      d.innerHTML = `<div class="pkimg">${PORTRAIT.svg(id, 'normal')}</div><div class="pkname">${esc(fullName(id))}</div>`;
      d.addEventListener('mouseenter', () => { sel = i; draw(); });
      d.addEventListener('click', e => { e.stopPropagation(); sel = i; draw(); done(); });
      row.appendChild(d); return d;
    });
    const draw = () => els.forEach((e, i) => e.classList.toggle('sel', i === sel));
    const done = () => { SND.se('ok'); popH(h); $('picker').classList.add('hidden'); res(ids[sel]); };
    const h = { key: a => {
      if (a === 'left' || a === 'up') { sel = (sel + ids.length - 1) % ids.length; SND.se('cursor'); draw(); }
      else if (a === 'right' || a === 'down') { sel = (sel + 1) % ids.length; SND.se('cursor'); draw(); }
      else if (a === 'ok') done();
    } };
    draw(); $('picker').classList.remove('hidden'); pushH(h);
  });
}

/* ======================= Notebook ======================= */
const NB = {
  open(mode = 'menu', prompt = '') {
    return new Promise(res => {
      SND.se('page');
      this.mode = mode; this.prompt = prompt; this.res = res;
      this.tabs = mode === 'present' ? ['ev'] : ['ev', 'ppl', 'log', 'set'];
      this.tab = 'ev'; this.sel = 0; this.setSel = 0;
      DLG.el.classList.add('hidden');
      $('notebook').classList.remove('hidden');
      this.h = { key: a => this.key(a) };
      pushH(this.h);
      this.render();
    });
  },
  close(val) {
    popH(this.h); $('notebook').classList.add('hidden');
    if (DLG.visible) DLG.el.classList.remove('hidden');
    SND.se('page');
    this.res(val);
  },
  items() {
    if (this.tab === 'ev') return STATE.evidence.slice();
    if (this.tab === 'ppl') return STORY.people();
    return [];
  },
  key(a) {
    const n = this.items().length;
    if (a === 'cancel' || a === 'menu') { if (this.mode === 'menu') this.close(null); else SND.se('wrong'); return; }
    if (this.tab === 'set') {
      const rows = 6;
      if (a === 'up') { this.setSel = (this.setSel + rows - 1) % rows; SND.se('cursor'); }
      else if (a === 'down') { this.setSel = (this.setSel + 1) % rows; SND.se('cursor'); }
      else if (a === 'left' || a === 'right') {
        const d = a === 'left' ? -1 : 1;
        if (this.setSel === 0) { CFG.bgm = Math.round(Math.max(0, Math.min(1, CFG.bgm + d * 0.1)) * 10) / 10; SND.setVol('bgm', CFG.bgm); }
        else if (this.setSel === 1) { CFG.se = Math.round(Math.max(0, Math.min(1, CFG.se + d * 0.1)) * 10) / 10; SND.setVol('se', CFG.se); SND.se('cursor'); }
        else if (this.setSel === 2) { CFG.amb = Math.round(Math.max(0, Math.min(1, CFG.amb + d * 0.1)) * 10) / 10; SND.setVol('amb', CFG.amb); }
        else if (this.setSel === 3) { CFG.speed = Math.max(0, Math.min(2, CFG.speed + d)); }
        else { this.switchTab(d); return; }
        saveCfg();
      } else if (a === 'ok') this.setAct(this.setSel);
      this.render(); return;
    }
    if (a === 'left') { this.switchTab(-1); return; }
    if (a === 'right') { this.switchTab(1); return; }
    if (a === 'up' && n) { this.sel = (this.sel + n - 1) % n; SND.se('cursor'); this.render(); }
    else if (a === 'down' && n) { this.sel = (this.sel + 1) % n; SND.se('cursor'); this.render(); }
    else if (a === 'ok') {
      if (this.mode === 'present' && n) this.close(this.items()[this.sel]);
    }
  },
  setAct(i) {
    if (i === 4) { this.close(null); setTimeout(() => STORY.hintFromMenu && runScriptQueued(STORY.hint), 50); }
    else if (i === 5) { this.close(null); setTimeout(() => toTitle(), 50); }
  },
  switchTab(d) {
    const i = this.tabs.indexOf(this.tab);
    const ni = (i + d + this.tabs.length) % this.tabs.length;
    if (ni === i) return;
    this.tab = this.tabs[ni]; this.sel = 0; SND.se('cursor'); this.render();
  },
  render() {
    $('nb-prompt').textContent = this.mode === 'present' ? sub(this.prompt) : `${STATE.name}の${STORY.nbName || '手帳'}`;
    const T = { ev: '証拠品', ppl: '人物', log: '記録', set: '設定' };
    $('nb-tabs').innerHTML = this.tabs.map(t => `<button data-t="${t}" class="${t === this.tab ? 'sel' : ''}">${T[t]}</button>`).join('');
    $('nb-tabs').querySelectorAll('button').forEach(b => b.onclick = e => { e.stopPropagation(); this.tab = b.dataset.t; this.sel = 0; SND.se('cursor'); this.render(); });
    const list = $('nb-list'), det = $('nb-detail');
    list.innerHTML = ''; det.innerHTML = '';
    const items = this.items();
    if (this.tab === 'ev' || this.tab === 'ppl') {
      list.style.display = '';
      if (!items.length) list.innerHTML = '<div class="nb-empty">まだ何も記録していない。</div>';
      items.forEach((id, i) => {
        const d = document.createElement('div'); d.className = 'nb-item' + (i === this.sel ? ' sel' : '');
        if (this.tab === 'ev') {
          const e = EVIDENCE[id];
          d.innerHTML = `<div class="ic">${ART.ICONS[e.icon]}</div><span>${esc(e.name)}</span>${STATE.seenEv[id] ? '' : '<span class="new">NEW</span>'}`;
        } else d.innerHTML = `<div class="ic" style="padding:0;overflow:hidden;background:#15121c">${PORTRAIT.svg(id)}</div><span>${esc(charName(id))}</span>`;
        d.onclick = e => {
          e.stopPropagation();
          if (this.sel === i && this.mode === 'present') { this.close(id); return; }
          this.sel = i; SND.se('cursor'); this.render();
        };
        list.appendChild(d);
      });
      const id = items[this.sel];
      if (id && this.tab === 'ev') {
        const e = EVIDENCE[id]; STATE.seenEv[id] = true;
        det.innerHTML = `<div class="big">${ART.ICONS[e.icon]}</div><h3>${esc(e.name)}</h3><div class="sub">${e.icon === 'voice' || e.icon === 'slip' ? '証言' : '証拠品'}</div><p>${richHTML(e.desc())}</p>`;
      } else if (id) {
        const c = CHARS[id];
        det.innerHTML = `<div class="big portrait-box">${PORTRAIT.svg(id)}</div><h3>${esc(charName(id))}</h3><div class="sub">${esc(typeof c.role === "function" ? c.role() : c.role)}</div><p>${richHTML(c.profile())}</p>`;
      }
      const sel = list.querySelector('.sel'); if (sel) sel.scrollIntoView({ block: 'nearest' });
    } else if (this.tab === 'log') {
      list.style.display = 'none';
      det.innerHTML = `<div class="nb-log">${W.log.slice(-120).map(l => `<div>${l.who ? `<b>${esc(l.who)}</b>` : ''}${esc(l.text)}</div>`).join('') || '<div class="nb-empty">記録はまだない。</div>'}</div>`;
      setTimeout(() => { det.scrollTop = det.scrollHeight; }, 0);
    } else if (this.tab === 'set') {
      list.style.display = 'none';
      const bar = v => '■'.repeat(Math.round(v * 10)) + '□'.repeat(10 - Math.round(v * 10));
      const rows = [['BGM 音量', bar(CFG.bgm)], ['効果音 音量', bar(CFG.se)], ['雨音 音量', bar(CFG.amb)], ['文字の速さ', ['ゆっくり', 'ふつう', 'はやい'][CFG.speed]], [(STORY.hintMenu && STORY.hintMenu()) || '九条に相談する（ヒント）', '▶'], ['タイトルへ戻る', '▶']];
      det.innerHTML = `<div class="nb-set">${rows.map((r, i) => `<div class="row ${i === this.setSel ? 'sel' : ''}" data-i="${i}"><span>${r[0]}</span><span class="val">${r[1]}</span></div>`).join('')}</div>
        <div class="note">←→ で値を変更。進行状況は自動で保存されます。</div>`;
      det.querySelectorAll('.row').forEach(r => r.onclick = e => {
        e.stopPropagation(); const i = +r.dataset.i; this.setSel = i;
        if (i <= 3) {
          const k = ['bgm', 'se', 'amb', 'speed'][i], max = i === 3 ? 2 : 1;
          if (CFG[k] >= max) { CFG[k] = 0; if (i < 3) SND.setVol(k, 0); saveCfg(); this.render(); } else this.key('right');
        }
        else this.setAct(i);
      });
    }
    const foot = $('nb-foot');
    if (this.mode === 'present') {
      foot.innerHTML = `<span>↑↓ 選択　Z / Enter で提示</span><button id="nb-present">提示する</button>`;
      $('nb-present').onclick = e => { e.stopPropagation(); const it = this.items(); if (it.length) this.close(it[this.sel]); };
    } else {
      foot.innerHTML = `<span>←→ タブ切替　↑↓ 選択　X / Esc で閉じる</span><button class="close" id="nb-close">閉じる</button>`;
      $('nb-close').onclick = e => { e.stopPropagation(); this.close(null); };
    }
  },
};
let queued = null;
function runScriptQueued(fn) { if (W.busy) { queued = fn; return; } runScript(fn); }

/* ======================= Script API (G) ======================= */
const G = {
  say: (who, text, expr, opts) => DLG.show(who, text, expr, opts),
  narr: (text, opts) => DLG.show(null, text, null, opts),
  choose, mono, gain, toast, cutin, timeline, flash, shake, pickPerson,
  chapter: chapterCard,
  wait: sleep,
  fadeOut: (ms = 500) => fade(1, ms),
  fadeIn: (ms = 500) => fade(0, ms),
  cinema: setCinema,
  se: n => SND.se(n), bgm: n => SND.bgm(n), rain: v => SND.rain(v),
  thunder: (p = 1) => lightning(p),
  flag(k, v) { if (v === undefined) return !!STATE.flags[k]; STATE.flags[k] = v; },
  has: id => STATE.evidence.includes(id),
  trust(d) {
    STATE.trust = Math.max(0, Math.min(100, STATE.trust + d));
    const el = $('trust-delta'); el.textContent = (d > 0 ? '+' : '') + d; el.className = 'delta ' + (d > 0 ? 'up' : 'down');
    clearTimeout(G._td); G._td = setTimeout(() => el.className = 'delta', 1800);
    $('hud').classList.remove('hidden'); refreshHUD();
    if (W.cinema || W.busy) { $('hud').classList.remove('hidden'); clearTimeout(G._th); G._th = setTimeout(refreshHUD, 2000); }
  },
  time(s) { STATE.time = s; refreshHUD(); },
  load(id, x, y, dir) { loadMap(id, x, y, dir); W.mode = 'play'; updateRoom(); refreshHUD(); },
  async warp(id, x, y, dir) { SND.se('door'); await fade(1, 260); loadMap(id, x, y, dir); updateRoom(); await fade(0, 300); },
  place(id, x, y, dir) {
    if (id === 'me') { const P = W.P; Object.assign(P, { x, y, px: x * TS, py: y * TS, tx: x, ty: y, moving: false, path: [], dir: dir || P.dir, visible: true }); updateRoom(); return; }
    let a = W.actors.find(a => a.id === id);
    if (!a) { a = mkActor(id, x, y, dir); W.actors.push(a); }
    else Object.assign(a, { x, y, px: x * TS, py: y * TS, tx: x, ty: y, moving: false, path: [], dir: dir || a.dir, visible: true });
  },
  remove(id) { if (id === 'me') { W.P.visible = false; return; } W.actors = W.actors.filter(a => a.id !== id); },
  clearActors(keepMe = true) { W.actors = []; if (!keepMe) W.P.visible = false; },
  face(id, dir) { const a = getActor(id); if (a) a.dir = dir; },
  walk(id, steps, speed = 1 / 190) {
    const a = getActor(id); if (!a) return Promise.resolve();
    const M = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
    for (const s of steps) if (M[s]) a.path.push(M[s]);
    a.speed = speed;
    return new Promise(r => a.waiters.push(r));
  },
  walkTo(id, x, y, order = 'xy', speed) {
    const a = getActor(id); if (!a) return Promise.resolve();
    const [ax, ay] = logical(a);
    const hx = (x > ax ? 'R' : 'L').repeat(Math.abs(x - ax)), vy = (y > ay ? 'D' : 'U').repeat(Math.abs(y - ay));
    return G.walk(id, order === 'xy' ? hx + vy : vy + hx, speed);
  },
  follow(on) {
    STATE.follow = on;
    if (on) { if (!getActor(FID())) placeFollower(); }
  },
  restore() { rebuildActors(); W.P.visible = true; },
  cam(x, y) { W.camTarget = x === null || x === undefined ? null : [x, y]; },
  snap: () => snapCam(),
  spot(id) { W.spot = id; },
  flashback(on) { stage.classList.toggle('flashback', on); },
  storm(on) { W.storm = on; },
  hud(on) { W.hideHud = !on; refreshHUD(); },
  refresh: refreshHUD,
  getActor,
  async present(prompt, correct, o = {}) {
    let tries = 0;
    const sp = o.speaker || 'kujo';
    const wrongLines = o.wrongLines || ['……違うな。それが今の話の何を証明する？', '{N}くん、落ち着きたまえ。もう一度、よく考えて。', 'ふむ……それは今、関係がなさそうだ。'];
    while (true) {
      const id = await NB.open('present', prompt);
      if (correct.includes(id)) {
        if (tries === 0) G.trust(o.gain || 4);
        await cutin(o.cut || '提示！', EVIDENCE[id].icon, o.cutMs || 1200);
        return id;
      }
      if (o.alt && o.alt[id]) { await G.say(sp, o.alt[id], 'think'); continue; }
      tries++;
      SND.se('wrong'); shake(3, 300, true);
      if (o.penalty) await o.penalty(); else G.trust(-6);
      await G.say(sp, wrongLines[(tries - 1) % wrongLines.length], 'serious');
      if (tries === 2 && o.hint) await G.say(sp, o.hint, 'think');
      if (tries >= 3 && !o.noAuto) {
        await G.say('kujo', '……仕方ない。私が出そう。', 'closed');
        await cutin('提示！', EVIDENCE[correct[0]].icon, 1000);
        return correct[0];
      }
    }
  },
  save: () => autosave(),
  checkpoint, gameOver,
  focus(d) {
    STATE.focus = Math.max(0, Math.min(100, (STATE.focus || 0) + d));
    const el = $('focus-delta'); el.textContent = (d > 0 ? '+' : '') + d; el.className = 'delta ' + (d > 0 ? 'up' : 'down');
    clearTimeout(G._fd); G._fd = setTimeout(() => el.className = 'delta', 1800);
    $('hud').classList.remove('hidden'); refreshHUD();
    if (W.cinema || W.busy) { $('hud').classList.remove('hidden'); clearTimeout(G._th); G._th = setTimeout(refreshHUD, 2000); }
  },
  hum: v => SND.hum(v),
  scene(name) {
    const el = $('scene');
    if (!name) { el.classList.remove('show'); setTimeout(() => { if (!el.classList.contains('show')) el.innerHTML = ''; }, 900); return; }
    el.innerHTML = SCENES[name] || ''; el.className = 'show sc-' + name;
  },
  battle: def => def.kind === 'sky' ? BATTLE.sky(def) : def.kind === 'clock' ? BATTLE.clock(def) : def.kind === 'abyss' ? BATTLE.abyss(def) : def.kind === 'dream' ? BATTLE.dream(def) : BATTLE.run(def),
  debate: def => BATTLE.debate(def),
};

/* ======================= save / load ======================= */
function autosave() {
  if (!STATE || W.mode !== 'play') return;
  STATE.x = W.P.x; STATE.y = W.P.y; STATE.dir = W.P.dir; STATE.map = W.mapId;
  try { localStorage.setItem(EP.saveKey, JSON.stringify(STATE)); } catch (e) {}
}
function hasSave(ep = EP) { try { return !!localStorage.getItem(ep.saveKey); } catch (e) { return false; } }
function clearSave() { try { localStorage.removeItem(EP.saveKey); localStorage.removeItem(EP.saveKey + '_ck'); } catch (e) {} }

/* ======================= Title ======================= */
const TITLE = (() => {
  const drops = Array.from({ length: 260 }, () => ({ x: Math.random() * 400, y: Math.random() * 500, v: 4 + Math.random() * 4, l: 6 + Math.random() * 10 }));
  const clouds = Array.from({ length: 14 }, (_, i) => ({ x: Math.random() * 384 * 1.4, y: 10 + Math.random() * 70, r: 30 + Math.random() * 50, v: 0.004 + Math.random() * 0.008 }));
  let bolt = null, nextBolt = 2500;
  const wins = [];
  // 屋敷のシルエット
  function house(c) {
    c.fillStyle = '#05040a';
    c.beginPath();
    c.moveTo(70, 170); c.lineTo(70, 112); c.lineTo(92, 112); c.lineTo(92, 96); c.lineTo(104, 74); c.lineTo(116, 96); c.lineTo(116, 108);
    c.lineTo(150, 108); c.lineTo(150, 98); c.lineTo(192, 80); c.lineTo(234, 98); c.lineTo(234, 108); c.lineTo(262, 108);
    c.lineTo(262, 88); c.lineTo(268, 88); c.lineTo(268, 100); c.lineTo(280, 100); c.lineTo(280, 64); c.lineTo(294, 46); c.lineTo(308, 64); c.lineTo(308, 112);
    c.lineTo(324, 112); c.lineTo(324, 170); c.closePath(); c.fill();
    R(c, 160, 84, 4, 14); R(c, 220, 84, 4, 14);
    c.fillStyle = '#05040a'; c.fillRect(190, 70, 4, 12); c.beginPath(); c.moveTo(186, 72); c.lineTo(192, 60); c.lineTo(198, 72); c.fill();
  }
  function R(c, x, y, w, h) { c.fillRect(x, y, w, h); }
  for (const [x, y, on] of [[78, 120, 1], [86, 120, 0], [78, 136, 1], [98, 104, 0], [108, 104, 1], [124, 118, 1], [136, 118, 0], [124, 136, 0], [136, 136, 1], [160, 118, 1], [172, 118, 1], [184, 118, 0], [200, 118, 1], [212, 118, 0], [224, 118, 1], [160, 138, 0], [184, 138, 1], [212, 138, 1], [244, 118, 0], [252, 118, 1], [244, 138, 1], [286, 76, 1], [296, 76, 0], [286, 96, 0], [296, 96, 1], [286, 120, 1], [296, 140, 1], [314, 124, 0]]) wins.push({ x, y, on, f: Math.random() * 10 });
  return {
    update(dt) {
      for (const d of drops) { d.y += d.v * dt / 16; d.x -= d.v * 0.25 * dt / 16; if (d.y > VH) { d.y = -10; d.x = Math.random() * (VW + 40); } }
      for (const c of clouds) { c.x -= c.v * dt; if (c.x < -c.r * 2) c.x = 384 + c.r; }
      nextBolt -= dt;
      if (nextBolt <= 0) {
        nextBolt = 6000 + Math.random() * 9000;
        const pts = []; let x = 40 + Math.random() * 300, y = 0;
        while (y < 120) { pts.push([x, y]); x += (Math.random() - 0.5) * 22; y += 6 + Math.random() * 10; }
        bolt = { pts, life: 1 }; W.lightning = 1; setTimeout(() => SND.se('thunder', 0.8), 300);
      }
      if (bolt) { bolt.life -= dt / 300; if (bolt.life <= 0) bolt = null; }
    },
    render(c) {
      c.setTransform(RS, 0, 0, RS, 0, 0);
      const L = W.lightning;
      const g = c.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, `rgb(${6 + L * 80},${5 + L * 80},${14 + L * 110})`); g.addColorStop(0.6, `rgb(${18 + L * 60},${14 + L * 60},${34 + L * 80})`); g.addColorStop(1, '#0a0810');
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
      const mg = c.createRadialGradient(300, 40, 0, 300, 40, 80); mg.addColorStop(0, 'rgba(200,200,230,.18)'); mg.addColorStop(1, 'rgba(200,200,230,0)');
      const sc = VW < 384 ? VW / 300 : 1, sox = (VW - 384 * sc) / 2, soy = VH < 300 ? 0 : VH * 0.6 - 120 * sc;
      c.setTransform(RS * sc, 0, 0, RS * sc, sox * RS, soy * RS);
      c.fillStyle = mg; c.fillRect(0, 0, 384, 216);
      for (const cl of clouds) { c.fillStyle = `rgba(${12 + L * 60},${10 + L * 60},${22 + L * 70},.85)`; c.beginPath(); c.ellipse(cl.x, cl.y, cl.r * 1.6, cl.r * 0.45, 0, 0, 7); c.fill(); }
      if (bolt) {
        c.strokeStyle = `rgba(230,236,255,${bolt.life})`; c.lineWidth = 1.4; c.beginPath();
        bolt.pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
        c.strokeStyle = `rgba(160,180,255,${bolt.life * 0.4})`; c.lineWidth = 4; c.stroke();
      }
      // 海
      c.fillStyle = '#07060e'; c.fillRect(-200, 160, 784, 56 + 400);
      for (let i = 0; i < 30; i++) { const y = 165 + (i * 7) % 50, x = (i * 53 + W.t * 0.01 * (i % 3 + 1)) % (384 + 40) - 20; c.fillStyle = `rgba(120,130,180,${0.05 + L * 0.2})`; c.fillRect(x, y, 14, 1); }
      house(c);
      for (const w of wins) {
        if (!w.on) { c.fillStyle = 'rgba(30,26,40,.9)'; c.fillRect(w.x, w.y, 5, 8); continue; }
        const f = 0.75 + Math.sin(W.t * 0.003 + w.f) * 0.1 + Math.sin(W.t * 0.017 + w.f * 3) * 0.06;
        c.fillStyle = `rgba(255,${180 + f * 40},${90 + f * 30},${f})`; c.fillRect(w.x, w.y, 5, 8);
        const wg = c.createRadialGradient(w.x + 2.5, w.y + 4, 0, w.x + 2.5, w.y + 4, 12); wg.addColorStop(0, `rgba(255,190,100,${0.18 * f})`); wg.addColorStop(1, 'rgba(255,190,100,0)');
        c.fillStyle = wg; c.fillRect(w.x - 12, w.y - 12, 30, 32);
        c.fillStyle = 'rgba(5,4,10,.9)'; c.fillRect(w.x + 2, w.y, 1, 8); c.fillRect(w.x, w.y + 3, 5, 1);
      }
      // 崖
      c.fillStyle = '#030206';
      c.beginPath(); c.moveTo(40, 216); c.lineTo(52, 176); c.lineTo(66, 168); c.lineTo(330, 168); c.lineTo(346, 180); c.lineTo(360, 216); c.fill();
      c.fillRect(-200, 216, 784, 600);
      c.setTransform(RS, 0, 0, RS, 0, 0);
      c.strokeStyle = 'rgba(180,190,230,.35)'; c.lineWidth = 0.7; c.beginPath();
      for (const d of drops) { c.moveTo(d.x, d.y); c.lineTo(d.x - d.l * 0.25, d.y + d.l); } c.stroke();
      if (L > 0.05) { c.fillStyle = `rgba(220,230,255,${L * 0.25})`; c.fillRect(0, 0, VW, VH); }
    },
  };
})();

/* ======================= Episodes / Home / Title ======================= */
const EPISODES = {
  kurosagi: {
    id: 'kurosagi', file: 'FILE.01', name: '黒鷺館編', title: '黒鷺館の殺人', story: () => STORY_KUROSAGI, saveKey: 'kurosagi_save_v1',
    bgm: 'title', rain: 0.8, hum: 0, renderer: () => TITLE, diff: 1,
    blurb: '嵐の夜、岬の洋館で館の主が殺された。名探偵・九条玲司とともに、時計に隠された嘘を暴け。',
    kicker: '― 探偵助手の手記 ―', en: 'THE MURDER AT KUROSAGI MANOR',
    logo: '<span>黒</span><span>鷺</span><span>館</span><span class="no">の</span><span>殺</span><span>人</span>',
  },
  cyber: {
    id: 'cyber', file: 'FILE.02', name: '電脳展編', title: '電脳展の亡霊', story: () => STORY_CYBER, saveKey: 'cyber_save_v1',
    bgm: 'c_title', rain: 0, hum: 0.5, renderer: () => CYTITLE, diff: 3,
    blurb: '黒鷺館の事件から半年。未来型美術館の企画展で、AIの創造主が密室で死んだ。電脳の亡霊の正体とは――。敗北あり・戦闘あり。',
    kicker: '― 探偵助手の手記 FILE.02 ―', en: 'GHOST IN THE EXHIBITION',
    logo: '<span>電</span><span>脳</span><span>展</span><span class="no">の</span><span>亡</span><span>霊</span>',
  },
  thief: {
    id: 'thief', file: 'FILE.03', name: '怪盗と宝玉編', title: '怪盗夜鴉と緋月の宝玉', story: () => STORY_THIEF, saveKey: 'thief_save_v1',
    bgm: 't_title', rain: 0, hum: 0, renderer: () => TTITLE, diff: 3,
    blurb: '怪盗「夜鴉」からの挑戦状。予告の五時間前、探偵は死んだ――。代理探偵となった助手が、師を殺した共犯者を追う。時間制限あり。',
    kicker: '― 探偵助手の手記 FILE.03 ―', en: 'THE PHANTOM CROW AND THE SCARLET MOON',
    logo: '<span>怪</span><span>盗</span><span class="no">と</span><span>宝</span><span>玉</span>',
  },
  sky: {
    id: 'sky', file: 'FILE.04', name: '名探偵シエスタ編', title: '空の名探偵', story: () => STORY_SKY, saveKey: 'sky_save_v1',
    bgm: 's_title', rain: 0, hum: 0.25, renderer: () => STITLE, diff: 3,
    blurb: '一年後。謎のケースを持たされた助手は、高度一万メートルで「この中に探偵はおりませんか」の声を聞く。手を挙げたのは、白髪の《名探偵》。敗北あり・戦闘あり。',
    kicker: '― 探偵助手の手記 FILE.04 ―', en: 'THE DETECTIVE AT TEN THOUSAND METERS',
    logo: '<span>空</span><span class="no">の</span><span>名</span><span>探</span><span>偵</span>',
  },
  tower: {
    id: 'tower', file: 'FILE.05', name: '巫女の祭典編', title: '未来視の時計台', story: () => STORY_TOWER, saveKey: 'tower_save_v1',
    bgm: 'f_title', rain: 0, hum: 0, renderer: () => CTITLE, diff: 3,
    blurb: '一年後、ロンドン。《巫女》の祭典を守る任務で、助手は最悪の未来を“視る”。《聖典》が見せた未来視を手がかりに、運命を書き換えろ。敗北あり・戦闘あり。',
    kicker: '― 探偵助手の手記 FILE.05 ―', en: 'THE CLOCKTOWER OF FORESIGHT',
    logo: '<span>未</span><span>来</span><span>視</span><span class="no">の</span><span>時</span><span>計</span><span>台</span>',
  },
  abyss: {
    id: 'abyss', file: 'FILE.06', name: 'アジト潜入編', title: '世界樹の深淵', story: () => STORY_ABYSS, saveKey: 'abyss_save_v1',
    bgm: 'a_title', rain: 0, hum: 0.2, renderer: () => ATITLE, diff: 3,
    blurb: 'ユグドラシルのアジトへ。浮遊の靴で機械兵の目をかいくぐり、地の底に逆さに生える世界樹のもとへ――。潜入・戦闘・敗北あり。',
    kicker: '― 探偵助手の手記 FILE.06 ―', en: 'THE ABYSS OF YGGDRASIL',
    logo: '<span>世</span><span>界</span><span>樹</span><span class="no">の</span><span>深</span><span>淵</span>',
  },
  train: {
    id: 'train', file: 'FILE.07', name: '復活の狼煙編', title: '復活の狼煙', story: () => STORY_TRAIN, saveKey: 'train_save_v1',
    bgm: 'r_title', rain: 0, hum: 0, renderer: () => RTITLE, diff: 3,
    blurb: '名探偵のいない世界で。巫女のお告げと、名探偵の手紙。そして鳴った一本の電話――。ドイツの夜行列車で、助手はひとりで推理する。長編捜査・論戦・敗北あり。',
    kicker: '― 探偵助手の手記 FILE.07 ―', en: 'THE SIGNAL OF REVIVAL',
    logo: '<span>復</span><span>活</span><span class="no">の</span><span>狼</span><span>煙</span>',
  },
  dream: {
    id: 'dream', file: 'FILE.08', name: '夢幻編', title: '純白の少女', story: () => STORY_DREAM, saveKey: 'dream_save_v1',
    bgm: 'w_title', rain: 0, hum: 0, renderer: () => DTITLE, diff: 3,
    blurb: '《夢幻》の執行者ドロシーの力で、助手は眠れる名探偵の夢の中へ。白の園、時計台、一万メートルの前夜――シエスタの記憶を巡り、悪夢と戦え。戦闘・敗北あり。',
    kicker: '― 探偵助手の手記 FILE.08 ―', en: 'THE GIRL IN PURE WHITE',
    logo: '<span>純</span><span>白</span><span class="no">の</span><span>少</span><span>女</span>',
  },
};
const EP_ORDER = ['kurosagi', 'cyber', 'thief', 'sky', 'tower', 'abyss', 'train', 'dream'];
let EP = EPISODES.kurosagi;
let homeSel = 0;
function titleRenderer() { return (W.mode === 'home' ? EPISODES[EP_ORDER[homeSel]] : EP).renderer(); }
function setEpisode(id) {
  EP = EPISODES[id]; STORY = EP.story();
  stage.classList.toggle('ep-cyber', id === 'cyber');
  stage.classList.toggle('ep-thief', id === 'thief');
  stage.classList.toggle('ep-sky', id === 'sky');
  stage.classList.toggle('ep-tower', id === 'tower');
  stage.classList.toggle('ep-abyss', id === 'abyss');
  stage.classList.toggle('ep-train', id === 'train');
  stage.classList.toggle('ep-dream', id === 'dream');
}
const cleared = id => { try { return !!localStorage.getItem('cleared_' + id); } catch (e) { return false; } };
function epAmbience(ep) { SND.rain(ep.rain); SND.hum(ep.hum); }

function applyTitle() {
  const t = $('title');
  t.querySelector('.tt-kicker').textContent = EP.kicker;
  t.querySelector('.tt-logo').innerHTML = EP.logo;
  t.querySelector('.tt-en').textContent = EP.en;
  t.classList.toggle('cy', EP.id === 'cyber');
  t.classList.toggle('th', EP.id === 'thief');
  t.classList.toggle('sk', EP.id === 'sky');
  t.classList.toggle('tw', EP.id === 'tower');
  t.classList.toggle('ab', EP.id === 'abyss');
  t.classList.toggle('tr', EP.id === 'train');
  t.classList.toggle('dr', EP.id === 'dream');
  [...t.querySelectorAll('.tt-logo span, .tt-kicker, .tt-en')].forEach(e => { e.style.animation = 'none'; void e.offsetWidth; e.style.animation = ''; });
}

function showTitleMenu() {
  const menu = $('tt-menu'); menu.innerHTML = '';
  const items = [['はじめから', newGame], ['つづきから', continueGame, !hasSave()], ['ホームへ戻る', backHome]];
  let sel = hasSave() ? 1 : 0;
  const btns = items.map(([t, fn, dis], i) => {
    const b = document.createElement('button'); b.textContent = t; b.disabled = !!dis;
    if (i === 2) b.classList.add('tt-home');
    b.onclick = e => { e.stopPropagation(); if (!dis) { sel = i; go(); } };
    b.onmouseenter = () => { if (!dis) { sel = i; draw(); } };
    menu.appendChild(b); return b;
  });
  const draw = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
  const go = () => { SND.se(sel === 2 ? 'cancel' : 'ok'); popH(h); items[sel][1](); };
  const h = { key: a => {
    if (a === 'up' || a === 'down') { const n = items.length; let s = sel; do { s = (s + (a === 'up' ? n - 1 : 1)) % n; } while (items[s][2]); sel = s; SND.se('cursor'); draw(); }
    else if (a === 'ok') go();
    else if (a === 'cancel') { sel = 2; draw(); go(); }
  } };
  draw(); pushH(h);
}

function renderHome() {
  const box = $('hm-cards'); box.innerHTML = '';
  EP_ORDER.forEach((id, i) => {
    const e = EPISODES[id];
    const st = e.locked ? '<span class="hm-st lock">LOCKED</span>' : cleared(id) ? '<span class="hm-st clear">CLEAR</span>' : hasSave(e) ? '<span class="hm-st cont">つづきあり</span>' : '<span class="hm-st new">NEW</span>';
    const d = document.createElement('div');
    d.className = `hm-card ${id}` + (e.locked ? ' locked' : '') + (i === homeSel ? ' sel' : '');
    d.innerHTML = `<div class="hm-file">${e.file}</div><div class="hm-name">${e.name}</div><div class="hm-title">${e.title}</div>
      <div class="hm-blurb">${sub(e.blurb)}</div><div class="hm-foot"><span class="hm-diff">${e.locked ? '近日公開' : '難易度 ' + '★'.repeat(e.diff) + '☆'.repeat(3 - e.diff)}</span>${st}</div>`;
    d.onmouseenter = () => { if (homeSel !== i) { homeSel = i; SND.se('cursor'); homeSync(); } };
    d.onclick = ev => { ev.stopPropagation(); homeSel = i; homeSync(); openEpisode(id); };
    box.appendChild(d);
  });
}
function homeSync() {
  [...$('hm-cards').children].forEach((c, i) => c.classList.toggle('sel', i === homeSel));
  const ep = EPISODES[EP_ORDER[homeSel]];
  $('home').classList.toggle('cy', ep.id === 'cyber');
  $('home').classList.toggle('th', ep.id === 'thief');
  $('home').classList.toggle('sk', ep.id === 'sky');
  $('home').classList.toggle('tw', ep.id === 'tower');
  $('home').classList.toggle('ab', ep.id === 'abyss');
  $('home').classList.toggle('tr', ep.id === 'train');
  $('home').classList.toggle('dr', ep.id === 'dream');
  const box = $('hm-cards'), card = box.children[homeSel];
  if (card) {
    try {
      if (stage.classList.contains('vmode')) { const hm = $('home'); hm.scrollTo({ top: Math.max(0, box.offsetTop + card.offsetTop - (hm.clientHeight - card.offsetHeight) / 2), behavior: 'smooth' }); }
      else box.scrollTo({ left: Math.max(0, card.offsetLeft - (box.clientWidth - card.offsetWidth) / 2), behavior: 'smooth' });
    } catch (e) {}
  }
  SND.bgm(ep.bgm); epAmbience(ep);
}
let homeH = null;
function showHome() {
  W.mode = 'home'; W.map = null; refreshHUD();
  stage.classList.remove('ep-cyber', 'ep-thief', 'ep-sky', 'ep-tower', 'ep-abyss', 'ep-train', 'ep-dream', 'dreamy', 'memory', 'nightmare');
  $('title').classList.add('hidden');
  $('home').classList.remove('hidden');
  $('hm-press').classList.add('hidden');
  renderHome(); homeSync();
  if (homeH) popH(homeH);
  homeH = { key: a => {
    if (['left', 'right', 'up', 'down'].includes(a)) { homeSel = (homeSel + (a === 'left' || a === 'up' ? EP_ORDER.length - 1 : 1)) % EP_ORDER.length; SND.se('cursor'); homeSync(); }
    else if (a === 'ok') openEpisode(EP_ORDER[homeSel]);
  } };
  pushH(homeH);
}
async function openEpisode(id) {
  if (EPISODES[id].locked) { SND.se('wrong'); shake(3, 300, true); toast(EPISODES[id].lockMsg || 'この事件ファイルは、まだ開けない。', 3500); return; }
  if (homeH) { popH(homeH); homeH = null; }
  SND.se('ok');
  await fade(1, 350);
  setEpisode(id);
  $('home').classList.add('hidden');
  W.mode = 'title';
  applyTitle();
  $('title').classList.remove('hidden'); $('tt-press').classList.add('hidden');
  SND.bgm(EP.bgm); epAmbience(EP);
  await fade(0, 500);
  showTitleMenu();
}
async function backHome() {
  await fade(1, 350);
  homeSel = EP_ORDER.indexOf(EP.id);
  showHome();
  await fade(0, 500);
}
async function bootHome() {
  UIH.length = 0;
  W.mode = 'home'; W.map = null; refreshHUD();
  $('home').classList.remove('hidden'); renderHome();
  [...$('hm-cards').children].forEach(c => c.classList.add('pre'));
  $('hm-press').classList.remove('hidden');
  $('hm-press').textContent = isTouch ? '画面をタップしてください' : 'クリック または キーを押してください';
  if (isTouch) $('nm-input').closest('.nm-inner').querySelector('.nm-hint').textContent = '６文字まで';
  await fade(0, 1200);
  await new Promise(r => { const h = { key: () => { popH(h); r(); }, tap: () => { popH(h); r(); } }; pushH(h); });
  SND.init(); SND.setVol('bgm', CFG.bgm); SND.setVol('se', CFG.se); SND.setVol('amb', CFG.amb);
  SND.se('ok');
  showHome();
}
async function toTitle() {
  autosave();
  await fade(1, 600);
  W.busy = false; resetOverlays();
  W.mode = 'title'; refreshHUD();
  applyTitle();
  $('title').classList.remove('hidden'); $('tt-press').classList.add('hidden');
  SND.bgm(EP.bgm); epAmbience(EP);
  await fade(0, 800);
  showTitleMenu();
}
function newGame() {
  const box = $('namebox'), inp = $('nm-input');
  box.classList.remove('hidden');
  let last = '真白'; try { last = localStorage.getItem('last_name') || last; } catch (e) {}
  inp.value = last;
  setTimeout(() => { inp.focus(); inp.select(); }, 50);
  const h = { key: () => {} }; pushH(h);
  const done = async () => {
    const name = (inp.value || '').trim().slice(0, 6) || '真白';
    try { localStorage.setItem('last_name', name); } catch (e) {}
    inp.blur(); box.classList.add('hidden'); popH(h);
    SND.se('ok');
    STATE = newState(name);
    if (STORY.initState) STORY.initState(STATE);
    clearSave();
    $('title').style.opacity = '0';
    await fade(1, 900);
    $('title').classList.add('hidden'); $('title').style.opacity = '';
    W.log = [];
    W.mode = 'play';
    const st = STORY.start;
    loadMap(st.map, st.x, st.y, st.dir);
    W.mode = 'blank';
    runScript(STORY.prologue);
  };
  $('nm-ok').onclick = e => { e.stopPropagation(); done(); };
  inp.onkeydown = e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); done(); } };
}
async function continueGame() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(EP.saveKey)); } catch (e) {}
  if (!data) return;
  STATE = Object.assign(newState(data.name), data);
  $('title').style.opacity = '0';
  await fade(1, 800);
  $('title').classList.add('hidden'); $('title').style.opacity = '';
  W.log = [];
  loadMap(STATE.map, STATE.x, STATE.y, STATE.dir);
  W.mode = 'play';
  STORY.onResume();
  updateRoom(); refreshHUD();
  if (STATE.resume && STORY[STATE.resume]) { runScript(STORY[STATE.resume]); return; }
  await fade(0, 700);
}

/* ======================= Checkpoint / Game over ======================= */
function checkpoint(script) {
  if (W.P) { STATE.x = W.P.x; STATE.y = W.P.y; STATE.dir = W.P.dir; STATE.map = W.mapId; }
  STATE.resume = script;
  const ck = { state: JSON.parse(JSON.stringify(STATE)), script };
  W.ckpt = ck;
  try { localStorage.setItem(EP.saveKey + '_ck', JSON.stringify(ck)); localStorage.setItem(EP.saveKey, JSON.stringify(STATE)); } catch (e) {}
}
async function gameOver(kind, head, text) {
  DLG.close();
  SND.bgm(null); SND.se('gameover');
  const el = $('gameover');
  $('go-k').textContent = kind;
  $('go-t').textContent = sub(head);
  $('go-d').innerHTML = richHTML(text);
  el.classList.remove('hidden');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  await sleep(1600);
  const menu = $('go-menu'); menu.innerHTML = '';
  const opts = [['直前からやり直す', 'retry'], ['ホームへ戻る', 'home']];
  let sel = 0;
  const choice = await new Promise(res => {
    const btns = opts.map(([t, v], i) => {
      const b = document.createElement('button'); b.textContent = t;
      b.onclick = e => { e.stopPropagation(); sel = i; fin(); };
      b.onmouseenter = () => { sel = i; draw(); };
      menu.appendChild(b); return b;
    });
    const draw = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
    const fin = () => { popH(h); SND.se('ok'); res(opts[sel][1]); };
    const h = { key: a => { if (a === 'up' || a === 'down' || a === 'left' || a === 'right') { sel = 1 - sel; SND.se('cursor'); draw(); } else if (a === 'ok') fin(); } };
    draw(); pushH(h);
  });
  await fade(1, 700);
  el.classList.add('hidden');
  W.afterAbort = choice === 'retry' ? retryCheckpoint : async () => { await fade(1, 10); W.mode = 'home'; homeSel = EP_ORDER.indexOf(EP.id); showHome(); await fade(0, 600); };
  const err = new Error('abort'); err.abort = true; throw err;
}
async function retryCheckpoint() {
  let ck = W.ckpt;
  if (!ck) { try { ck = JSON.parse(localStorage.getItem(EP.saveKey + '_ck')); } catch (e) {} }
  if (!ck) { showHome(); await fade(0, 500); return; }
  STATE = JSON.parse(JSON.stringify(ck.state));
  W.log = [];
  loadMap(STATE.map, STATE.x, STATE.y, STATE.dir);
  W.mode = 'play';
  STORY.onResume(); updateRoom(); refreshHUD();
  await fade(0, 500);
  runScript(STORY[ck.script]);
}

/* ======================= Result ======================= */
async function showResult() {
  const r = STORY.result();
  const el = $('result');
  el.classList.toggle('cy', EP.id === 'cyber');
  el.classList.toggle('th', EP.id === 'thief');
  el.classList.toggle('sk', EP.id === 'sky');
  el.classList.toggle('tw', EP.id === 'tower');
  el.classList.toggle('ab', EP.id === 'abyss');
  el.classList.toggle('tr', EP.id === 'train');
  el.classList.toggle('dr', EP.id === 'dream');
  el.innerHTML = `<div class="rs-k">${r.label}</div><div class="rs-rank">${r.rank}</div><div class="rs-title">${r.title}</div>
    <div class="rs-stat">${r.stats}</div><div class="rs-next">― ${isTouch ? 'タップ' : 'クリック または キー'}で続ける ―</div>`;
  el.classList.remove('hidden');
  await fade(0, 800);
  SND.se('clue');
  await sleep(2600); await waitOk();
  el.innerHTML = `<div class="credits">${r.credits}</div>`;
  SND.bgm(r.bgm);
  await sleep(30000);
  await waitOkOr(6000);
  UIH.length = 0;
  await fade(1, 1200);
  el.classList.add('hidden');
  clearSave();
  try { localStorage.setItem('cleared_' + EP.id, '1'); } catch (e) {}
  W.mode = 'title';
  applyTitle();
  $('title').classList.remove('hidden'); $('tt-press').classList.add('hidden');
  SND.bgm(EP.bgm); epAmbience(EP);
  await fade(0, 1000);
  showTitleMenu();
}


/* ======================= boot ======================= */
(function makeGrain() {
  const n = document.createElement('canvas'); n.width = n.height = 160;
  const c = n.getContext('2d'); const id = c.createImageData(160, 160);
  for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  c.putImageData(id, 0, 0);
  $('fx-grain').style.backgroundImage = `url(${n.toDataURL()})`;
})();
resize();
requestAnimationFrame(frame);
setInterval(() => { if (queued && !W.busy) { const f = queued; queued = null; runScript(f); } }, 100);
bootHome();
