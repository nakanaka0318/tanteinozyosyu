'use strict';
/* =========================================================
   空の名探偵編：機内タイル・キャラクター・タイトル背景・一枚絵
   map.theme = 'plane'
   ========================================================= */
Object.assign(ART.LOOKS, {
  siesta: { skin: '#f6dcc8', hair: '#eceef6', coat: '#2c3c6e', coatD: '#1e2a52', shirt: '#f4f6fa', tie: '#c8304a', pants: '#2c3c6e', shoes: '#1a1424', dress: true, long: true, style: 'long' },
  ca: { skin: '#f0cfb2', hair: '#2a1a14', coat: '#24345e', coatD: '#18244a', shirt: '#f4f2ee', tie: '#d84a3a', pants: '#24345e', shoes: '#0e0e14', dress: true, style: 'bun' },
  hikawa: { skin: '#e4bc9a', hair: '#24201c', coat: '#5a5e68', coatD: '#40444c', shirt: '#e8eaee', tie: '#3a5a7a', pants: '#2e3036', shoes: '#111', glasses: true, style: 'side' },
  kuroda: { skin: '#d8a888', hair: '#141210', coat: '#1c1c22', coatD: '#101014', shirt: '#f0ece4', tie: '#c9a24a', pants: '#1c1c22', shoes: '#0a0a0a', style: 'slick', mustache: '#141210', long: true },
  nanase: { skin: '#f2cdac', hair: '#3a2a1e', coat: '#5a7a4a', coatD: '#44603a', shirt: '#e8e4d8', tie: '#e8e4d8', pants: '#3a4a5a', shoes: '#e8e8e8', style: 'hood' },
  kase: { skin: '#f0c8a8', hair: '#c8302a', coat: '#1a1a20', coatD: '#0e0e12', shirt: '#e8e4dc', tie: '#1a1a20', pants: '#1a1a20', shoes: '#0a0a0a', long: true, style: 'long' },
  pax1: { skin: '#e8c0a0', hair: '#8a8a8e', coat: '#6a4a3a', coatD: '#4e362a', shirt: '#e8e0d0', tie: '#6a4a3a', pants: '#3a3a40', shoes: '#1a1a1a', style: 'bald' },
  pax2: { skin: '#f2d0b4', hair: '#5a3a22', coat: '#a85a6a', coatD: '#86465a', shirt: '#f4ece8', tie: '#a85a6a', pants: '#3a2a30', shoes: '#2a1a1a', dress: true, style: 'bob' },
  pax3: { skin: '#d8b090', hair: '#1a1a1a', coat: '#3a4a3a', coatD: '#2a3a2a', shirt: '#dcdcd0', tie: '#3a4a3a', pants: '#2a2a2a', shoes: '#111', style: 'short' },
  pax4: { skin: '#f4d8c0', hair: '#d8b060', coat: '#4a6a9a', coatD: '#3a5480', shirt: '#f0f0f0', tie: '#4a6a9a', pants: '#2a3446', shoes: '#222', style: 'twin', dress: true },
  pax5: { skin: '#e0b896', hair: '#4a4a52', coat: '#7a7a6a', coatD: '#5e5e50', shirt: '#e6e2d6', tie: '#7a3a2a', pants: '#3a3a34', shoes: '#1a1a14', glasses: true, style: 'side' },
});

const SKYART = (() => {
  const T = 16;
  const WALK = new Set([',', '.', '_', 'D']);
  const WALL = new Set(['#', 'W', 'X']);
  const FLOOR = new Set([',', '.', '_']);
  const hsh = ART.hsh, at = ART.at;
  const isWall = ch => WALL.has(ch);
  function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function ell(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
  function floorOf(g, x, y) {
    for (let d = 1; d < 8; d++) for (const [xx, yy] of [[x - d, y], [x + d, y], [x, y + d], [x, y - d]]) { const ch = g[yy] && g[yy][xx]; if (ch && FLOOR.has(ch)) return ch; }
    return ',';
  }

  function floor(c, ch, x, y, tx, ty) {
    if (TRAIN && ch === ',') {
      R(c, x, y, T, T, '#3a1e26');
      if ((tx + ty) % 2 === 0) { R(c, x + 3, y + 3, 2, 2, '#4a2832'); R(c, x + 11, y + 11, 2, 2, '#4a2832'); }
      else R(c, x + 7, y + 7, 2, 2, '#5a3a2a');
      return;
    }
    if (TRAIN && ch === '.') {
      R(c, x, y, T, T, '#5a4230');
      for (let i = 0; i < 4; i++) R(c, x, y + i * 4 + 3, T, 1, '#4a3424');
      R(c, x + ((tx * 5 + ty * 3) % 12), y + 1, 1, 2, '#6a5038');
      return;
    }
    if (ch === ',') {
      R(c, x, y, T, T, '#232a44');
      if ((tx + ty) % 2 === 0) { R(c, x + 3, y + 3, 2, 2, '#2c3554'); R(c, x + 11, y + 11, 2, 2, '#2c3554'); }
      else { R(c, x + 7, y + 7, 2, 2, '#3a3050'); }
      if (hsh(tx, ty, 4) > 0.7) R(c, x + Math.floor(hsh(tx, ty, 5) * 14), y + Math.floor(hsh(tx, ty, 6) * 14), 1, 1, '#36406a');
    } else if (ch === '.') {
      R(c, x, y, T, T, '#4a4c54');
      for (let i = 0; i < T; i += 4) for (let j = 0; j < T; j += 4) R(c, x + i + 1, y + j + 1, 1, 1, '#5a5c66');
      R(c, x, y, T, 1, 'rgba(0,0,0,.12)');
    } else if (ch === '_') {
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) R(c, x + i * 8, y + j * 8, 8, 8, (i + j) % 2 ? '#b4b8c0' : '#c8ccd4');
    }
  }
  let TRAIN = false;
  function wallFace(c, x, y, tx, win) {
    if (TRAIN) {
      R(c, x, y, T, T, '#6a3a2a'); R(c, x, y, T, 3, '#4a2618'); R(c, x, y + 13, T, 3, '#3a1c10'); R(c, x, y + 12, T, 1, '#c9a45c');
      if (win) { R(c, x + 2, y + 4, 12, 7, '#2a1a12'); R(c, x + 3, y + 5, 10, 5, '#0a1022'); }
      else R(c, x + 6, y + 5, 4, 5, '#5a3020');
      return;
    }
    R(c, x, y, T, T, '#c9ccd4');
    R(c, x, y, T, 3, '#9a9ea8'); R(c, x, y + 3, T, 1, '#e2e4ea');
    R(c, x, y + 13, T, 3, '#8a8e98'); R(c, x, y + 13, T, 1, '#6a6e78');
    if (win) {
      ell(c, x + 8, y + 8, 4.5, 4, '#7a7e88'); ell(c, x + 8, y + 8, 3.6, 3.2, '#0a1022');
    } else R(c, x + 7, y + 5, 2, 6, '#b4b8c2');
  }
  function wallTop(c, x, y, tx, ty, g) {
    R(c, x, y, T, T, '#0a0c14');
    const e = '#4a4e5a';
    if (!isWall(at(g, tx - 1, ty))) R(c, x, y, 2, T, e);
    if (!isWall(at(g, tx + 1, ty))) R(c, x + 14, y, 2, T, e);
    if (!isWall(at(g, tx, ty - 1)) && g[ty - 1]) R(c, x, y, T, 2, e);
  }
  function seat(c, x, y, tx, ty, biz) {
    ell(c, x + 9, y + 15, 7, 1.5, 'rgba(0,0,0,.35)');
    const back = biz ? '#5a3a2c' : '#22305c', cush = biz ? '#7a5240' : '#33467e', arm = biz ? '#3a2a22' : '#6a6e7a';
    R(c, x + 1, y + 1, 5, 14, back); R(c, x + 1, y + 1, 5, 1, biz ? '#8a6450' : '#3a4c86');
    R(c, x + 2, y + 4, 3, 8, biz ? '#e8e0d4' : '#d8dce8');
    R(c, x + 6, y + 3, 8, 10, cush); R(c, x + 6, y + 3, 8, 1, biz ? '#9a6a52' : '#4a5c96');
    R(c, x + 5, y + 1, 10, 2, arm); R(c, x + 5, y + 13, 10, 2, arm);
    if (biz) { R(c, x + 13, y + 4, 2, 8, '#3a2a22'); }
    else if (hsh(tx, ty, 2) > 0.8) R(c, x + 9, y + 6, 3, 4, '#c8b88a');
  }
  function bizConsole(c, x, y) {
    R(c, x + 1, y + 3, 14, 11, '#3a2a22'); R(c, x + 1, y + 3, 14, 2, '#6a4a38'); R(c, x + 3, y + 7, 4, 3, '#1a1410');
    ell(c, x + 11, y + 7, 2, 2, '#f4dca0');
  }
  function galley(c, x, y, tx, ty, g) {
    R(c, x, y - 4, T, 20, '#9ca0aa'); R(c, x, y - 4, T, 2, '#c8ccd4'); R(c, x, y + 14, T, 2, '#5a5e68');
    R(c, x + 2, y, 5, 5, '#7a7e88'); R(c, x + 9, y, 5, 5, '#7a7e88'); R(c, x + 3, y + 2, 3, 1, '#c8ccd4'); R(c, x + 10, y + 2, 3, 1, '#c8ccd4');
    R(c, x + 2, y + 7, 12, 5, '#868a94'); R(c, x + 7, y + 9, 2, 1, '#2a2e36');
    if (hsh(tx, ty, 1) > 0.5) R(c, x + 12, y - 2, 2, 1, '#5dff9a');
  }
  function oven(c, x, y) {
    R(c, x, y - 4, T, 20, '#7a7e88'); R(c, x + 2, y - 2, 12, 7, '#2a2e36'); R(c, x + 3, y - 1, 10, 5, '#1a1e26'); R(c, x + 2, y + 7, 12, 7, '#2a2e36');
    R(c, x + 12, y + 8, 1, 1, '#ff5a3a');
  }
  function cart(c, x, y) {
    ell(c, x + 8, y + 15, 7, 1.5, 'rgba(0,0,0,.35)');
    R(c, x + 2, y + 1, 12, 14, '#a8acb6'); R(c, x + 2, y + 1, 12, 2, '#d8dce4'); R(c, x + 3, y + 5, 10, 1, '#7a7e88'); R(c, x + 3, y + 9, 10, 1, '#7a7e88');
    R(c, x + 6, y + 3, 4, 1, '#c8302a');
  }
  function toilet(c, x, y) {
    R(c, x + 1, y + 2, 6, 12, '#d8dce4'); ell(c, x + 10, y + 8, 5, 4, '#eef0f4'); ell(c, x + 10, y + 8, 3, 2.4, '#9ab0c8');
    R(c, x + 1, y + 2, 6, 1, '#f4f6f8');
  }
  function sink(c, x, y) {
    R(c, x + 1, y + 1, 14, 10, '#d8dce4'); ell(c, x + 8, y + 6, 5, 3, '#a8b8cc'); R(c, x + 7, y + 1, 2, 3, '#8a8e98');
    R(c, x + 1, y + 11, 14, 3, '#9a9ea8');
  }
  function curtain(c, x, y, tx, ty) {
    for (let i = 0; i < 4; i++) R(c, x + 4 + (i % 2), y + i * 4, 8, 4, i % 2 ? '#2a3a6a' : '#344a80');
    R(c, x + 3, y, 10, 1, '#c9a45c');
  }

  function renderMap(map, RS) {
    const g = map.grid, Wd = map.w, H = map.h;
    const cv = document.createElement('canvas'); cv.width = Wd * T * RS; cv.height = H * T * RS;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.scale(RS, RS);
    const lights = [], anims = [];
    const L = (x, y, r, col, a, flick) => lights.push({ x, y, r, col, a, flick });
    TRAIN = !!map.train;
    for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < Wd; tx++) {
      const ch = at(g, tx, ty), x = tx * T, y = ty * T;
      if (isWall(ch)) {
        const face = ty + 1 < H && !isWall(at(g, tx, ty + 1));
        if (ch === 'X') {
          R(c, x, y, T, T, '#5a5e68'); R(c, x + 1, y, 14, T, '#7a7e88'); R(c, x + 1, y, 14, 1, '#9a9ea8');
          if (at(g, tx, ty - 1) !== 'X') { R(c, x + 4, y + 4, 6, 7, '#1a1e26'); anims.push({ type: 'keypad', tx, ty }); }
          continue;
        }
        if (face) { wallFace(c, x, y, tx, ch === 'W'); if (ch === 'W') { anims.push({ type: 'win', tx, ty, train: TRAIN }); L(x + 8, y + 12, 20, '120,150,220', 0.06); } }
        else if (ch === 'W' && ty === H - 1) {
          R(c, x, y, T, T, '#0a0c14'); R(c, x, y, T, 3, '#9a9ea8'); R(c, x, y + 3, T, 1, '#5a5e68');
        } else wallTop(c, x, y, tx, ty, g);
        continue;
      }
      let fl = ch;
      if (!FLOOR.has(ch)) {
        if (ch === 'D') { const l = at(g, tx - 1, ty), r = at(g, tx + 1, ty), u = at(g, tx, ty - 1), d = at(g, tx, ty + 1); fl = [r, l, d, u].find(k => FLOOR.has(k)) || ','; }
        else fl = floorOf(g, tx, ty);
      }
      floor(c, fl, x, y, tx, ty);
      switch (ch) {
        case 'D': {
          const vert = isWall(at(g, tx, ty - 1)) && isWall(at(g, tx, ty + 1));
          if (vert) { R(c, x, y, T, 2, '#8a8e98'); R(c, x, y + 14, T, 2, '#8a8e98'); R(c, x + 6, y + 2, 1, 12, 'rgba(0,0,0,.25)'); R(c, x + 11, y + 6, 2, 3, '#c8302a'); }
          else { R(c, x, y, 2, T, '#8a8e98'); R(c, x + 14, y, 2, T, '#8a8e98'); R(c, x + 2, y, 12, 3, 'rgba(0,0,0,.4)'); }
          break;
        }
        case 'a': seat(c, x, y, tx, ty, false); if (ty === 3 || ty === 8) L(x + 8, y + 4, 22, '255,214,150', 0.08); break;
        case 'b': seat(c, x, y, tx, ty, true); L(x + 8, y + 4, 30, '255,206,140', 0.14); break;
        case 'p': bizConsole(c, x, y); L(x + 11, y + 7, 26, '255,214,150', 0.16, true); break;
        case 'C':
          if (TRAIN && fl === '.') { R(c, x + 1, y + 3, 14, 12, '#8a6a42'); R(c, x + 1, y + 3, 14, 2, '#a8865a'); R(c, x + 1, y + 8, 14, 1, '#5a4228'); R(c, x + 3, y + 5, 1, 9, '#5a4228'); R(c, x + 12, y + 5, 1, 9, '#5a4228'); break; }
          galley(c, x, y, tx, ty, g); L(x + 8, y, 30, '220,230,255', 0.12); break;
        case 'I': oven(c, x, y); break;
        case 'K':
          if (TRAIN) { const cols = ['#6a2a2a', '#2a3a5a', '#4a5a3a', '#7a5a2a'], k = (tx + ty) % 4; R(c, x + 2, y + 8, 12, 7, cols[k]); R(c, x + 2, y + 8, 12, 1, 'rgba(255,255,255,.25)'); R(c, x + 6, y + 6, 4, 2, '#2a1a10'); R(c, x + 3, y + 2, 10, 6, cols[(k + 2) % 4]); R(c, x + 7, y + 1, 2, 1, '#2a1a10'); break; }
          cart(c, x, y); break;
        case 'T': toilet(c, x, y); L(x + 8, y + 8, 30, '230,240,255', 0.2); break;
        case 'S': sink(c, x, y); break;
        case 'R': curtain(c, x, y, tx, ty); break;
      }
    }
    // 通路の天井灯
    for (let tx = 2; tx < Wd - 1; tx += 3) for (const ty of [4, 7]) if (WALK.has(at(g, tx, ty))) L(tx * T + 8, ty * T + 8, 40, '170,190,255', 0.07);
    if (map.extraLights) map.extraLights.forEach(l => L(l.x * T + 8, l.y * T + 8, l.r, l.col, l.a || 0.2, l.flick));
    return { canvas: cv, lights, anims };
  }

  function drawAnim(c, a, t) {
    const x = a.tx * T, y = a.ty * T;
    if (a.type === 'win' && a.train && W.trainStill) {
      R(c, x + 3, y + 5, 10, 5, '#a8b4c4'); R(c, x + 3, y + 8, 10, 2, '#6a6e78'); R(c, x + 3, y + 8, 10, 1, '#e8c040');
      if (a.tx % 5 === 0) R(c, x + 8, y + 5, 1, 3, '#3a3e48');
    } else if (a.type === 'win' && a.train) {
      R(c, x + 3, y + 5, 10, 5, '#0a1022');
      const p = ((t * 0.05 + a.tx * 37) % 40) - 10;
      c.fillStyle = 'rgba(30,50,40,.9)'; c.fillRect(Math.max(x + 3, x + 13 - p), y + 7, Math.min(4, Math.max(0, p)), 3);
      if (Math.sin(t * 0.002 + a.tx * 2.3) > 0.85) R(c, x + 6, y + 6, 1, 1, '#ffe8b0');
    } else if (a.type === 'win') {
      ell(c, x + 8, y + 8, 3.6, 3.2, '#0a1226');
      c.save(); c.beginPath(); c.ellipse(x + 8, y + 8, 3.6, 3.2, 0, 0, 7); c.clip();
      const p = ((t * 0.012 + a.tx * 37) % 40) - 10;
      c.fillStyle = 'rgba(120,140,190,.45)'; c.fillRect(x + 16 - p, y + 9, 6, 2);
      if (Math.sin(t * 0.001 + a.tx * 3.1) > 0.7) R(c, x + 6, y + 6, 1, 1, '#e8f0ff');
      c.restore();
      R(c, x + 6, y + 6, 1, 1, 'rgba(255,255,255,.25)');
    } else if (a.type === 'keypad') {
      const on = Math.sin(t * 0.004) > 0;
      R(c, x + 5, y + 5, 1, 1, on ? '#5dff9a' : '#1a3a2a'); R(c, x + 7, y + 5, 1, 1, '#c8302a');
      for (let i = 0; i < 3; i++) R(c, x + 5 + i * 2, y + 8, 1, 1, '#8a8e98');
    }
  }

  function drawSprite(c, kind, px, py, t) {
    const x = Math.round(px), y = Math.round(py);
    switch (kind) {
      case 'mbody': {
        const L = { skin: '#e2b896', hair: '#2a2420', coat: '#3a3e48', coatD: '#2a2e36', pants: '#2a2c34', shoes: '#111' };
        ell(c, x + 8, y + 13, 10, 3, 'rgba(0,0,0,.35)');
        R(c, x + 2, y + 3, 7, 11, L.coat); R(c, x + 4, y + 4, 2, 7, '#c8cad0');
        R(c, x + 9, y + 4, 2, 9, L.pants); R(c, x + 12, y + 4, 2, 9, L.pants); R(c, x + 9, y + 13, 2, 2, L.shoes); R(c, x + 12, y + 13, 2, 2, L.shoes);
        R(c, x + 2, y - 3, 7, 6, L.skin); R(c, x + 2, y - 3, 7, 2, L.hair); R(c, x + 3, y + 1, 5, 1, '#8a6a9a');
        R(c, x + 0, y + 8, 2, 4, L.skin);
        break;
      }
      case 'acase': {
        ell(c, x + 8, y + 14, 7, 2, 'rgba(0,0,0,.4)');
        R(c, x + 2, y + 6, 12, 8, '#a8acb6'); R(c, x + 2, y + 6, 12, 1, '#e0e4ec'); R(c, x + 2, y + 10, 12, 1, '#7a7e88');
        R(c, x + 6, y + 4, 4, 2, '#4a4e58'); R(c, x + 4, y + 8, 2, 2, '#c9a45c'); R(c, x + 10, y + 8, 2, 2, '#c9a45c');
        break;
      }
      case 'metalcase': {
        R(c, x + 2, y + 5, 12, 7, '#7a7e88'); R(c, x + 3, y + 6, 10, 5, '#2a2e36'); R(c, x + 5, y + 7, 6, 2, '#1a1e26');
        R(c, x + 6, y + 7, 4, 1, '#3a6a8a'); R(c, x + 2, y + 5, 12, 1, '#c8ccd4');
        break;
      }
      case 'medbag': {
        ell(c, x + 8, y + 14, 7, 2, 'rgba(0,0,0,.4)');
        R(c, x + 2, y + 6, 12, 8, '#3a2418'); R(c, x + 2, y + 6, 12, 1, '#6a4a32'); R(c, x + 4, y + 4, 8, 2, '#2a1a10');
        R(c, x + 7, y + 8, 2, 4, '#e8e8e8'); R(c, x + 6, y + 9, 4, 2, '#e8e8e8');
        break;
      }
      case 'trash': {
        R(c, x + 4, y + 4, 8, 10, '#8a8e98'); R(c, x + 4, y + 4, 8, 2, '#a8acb6'); R(c, x + 6, y + 2, 4, 2, '#6a6e78');
        break;
      }
      default: ART.drawSprite(c, kind, px, py, t);
    }
  }

  return { T, WALK, WALL, FLOOR, renderMap, drawAnim, drawSprite };
})();

/* ---------------- タイトル背景：夜間飛行 ---------------- */
const STITLE = (() => {
  const SW = 384, SH = 216;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const stars = Array.from({ length: 120 }, () => ({ x: rnd(0, SW), y: rnd(0, 130), s: Math.random() < 0.12 ? 1.4 : 0.7, p: rnd(0, 6) }));
  const clouds = Array.from({ length: 16 }, (_, i) => ({ x: rnd(-60, SW + 60), y: 140 + (i % 4) * 16 + rnd(-4, 4), r: rnd(30, 70), v: 0.006 + (i % 4) * 0.006 }));
  let px = -60;
  return {
    update(dt) {
      for (const k of clouds) { k.x -= k.v * dt; if (k.x < -k.r * 2) k.x = SW + k.r; }
      px += dt * 0.012; if (px > SW + 80) px = -80;
    },
    render(c) {
      c.setTransform(RS, 0, 0, RS, 0, 0);
      const g = c.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, '#040814'); g.addColorStop(0.55, '#0e1a3a'); g.addColorStop(1, '#2a3a6a');
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
      const sc = VW < 384 ? VW / 300 : 1, sox = (VW - SW * sc) / 2, soy = VH < 300 ? 0 : VH * 0.6 - 120 * sc;
      c.setTransform(RS * sc, 0, 0, RS * sc, sox * RS, soy * RS);
      for (const s of stars) { c.fillStyle = `rgba(230,240,255,${0.35 + Math.sin(W.t * 0.002 + s.p) * 0.3})`; c.fillRect(s.x, s.y, s.s, s.s); }
      // 月
      const mx = 318, my = 44, mr = 20;
      const halo = c.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 3); halo.addColorStop(0, 'rgba(200,220,255,.35)'); halo.addColorStop(1, 'rgba(200,220,255,0)');
      c.fillStyle = halo; c.beginPath(); c.arc(mx, my, mr * 3, 0, 7); c.fill();
      c.fillStyle = '#eef2ff'; c.beginPath(); c.arc(mx, my, mr, 0, 7); c.fill();
      c.fillStyle = 'rgba(160,180,220,.35)'; [[mx - 6, my - 4, 5], [mx + 7, my + 6, 4], [mx + 2, my - 10, 2.5]].forEach(([a, b, r]) => { c.beginPath(); c.arc(a, b, r, 0, 7); c.fill(); });
      // 飛行機
      const py = 124 + Math.sin(W.t * 0.0012) * 2;
      c.strokeStyle = 'rgba(220,230,255,.25)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(px - 160, py + 6); c.lineTo(px - 14, py + 1); c.stroke();
      c.fillStyle = '#05070e';
      c.beginPath(); c.moveTo(px - 18, py); c.lineTo(px + 18, py - 1); c.quadraticCurveTo(px + 24, py, px + 18, py + 2); c.lineTo(px - 18, py + 2); c.fill();
      c.beginPath(); c.moveTo(px - 2, py); c.lineTo(px - 10, py - 9); c.lineTo(px - 6, py - 9); c.lineTo(px + 6, py); c.fill();
      c.beginPath(); c.moveTo(px - 2, py + 2); c.lineTo(px - 8, py + 8); c.lineTo(px - 4, py + 8); c.lineTo(px + 6, py + 2); c.fill();
      c.beginPath(); c.moveTo(px - 16, py); c.lineTo(px - 21, py - 7); c.lineTo(px - 18, py - 7); c.lineTo(px - 12, py); c.fill();
      if (Math.sin(W.t * 0.008) > 0.6) { c.fillStyle = '#ff4a5a'; c.fillRect(px - 9, py - 9, 1.5, 1.5); }
      if (Math.sin(W.t * 0.008 + 2) > 0.6) { c.fillStyle = '#5dff9a'; c.fillRect(px - 7, py + 8, 1.5, 1.5); }
      // 雲海
      for (const k of clouds) {
        const cg = c.createRadialGradient(k.x, k.y, 2, k.x, k.y, k.r); cg.addColorStop(0, 'rgba(160,180,230,.5)'); cg.addColorStop(1, 'rgba(60,80,140,0)');
        c.fillStyle = cg; c.beginPath(); c.ellipse(k.x, k.y, k.r, k.r * 0.35, 0, 0, 7); c.fill();
      }
      c.fillStyle = 'rgba(30,44,90,.9)'; c.fillRect(0, 196, SW, 40);
      c.setTransform(RS, 0, 0, RS, 0, 0);
      const vg = c.createLinearGradient(0, VH * 0.75, 0, VH); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)');
      c.fillStyle = vg; c.fillRect(0, 0, VW, VH);
    },
  };
})();

/* ---------------- 一枚絵（SVG） ---------------- */
Object.assign(SCENES, {
  airport: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="saSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1430"/><stop offset=".7" stop-color="#2a3a6a"/><stop offset="1" stop-color="#d88a5a"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#saSky)"/>
    <g transform="translate(0 -170)">
    <g fill="#0c1020">${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 190 - 20}" y="0" width="14" height="900"/>`).join('')}<rect x="0" y="0" width="1600" height="40"/></g>
    <g fill="#05070e"><path d="M300 640 L900 610 Q960 615 900 640 L300 650 Z"/><path d="M560 625 L460 520 L500 520 L700 625 Z"/><path d="M330 640 L290 560 L320 560 L380 640 Z"/></g>
    <rect x="0" y="660" width="1600" height="420" fill="#141826"/>
    <g fill="rgba(255,220,150,.75)">${Array.from({ length: 30 }, (_, i) => `<rect x="${i * 56}" y="680" width="20" height="3"/>`).join('')}</g>
    <g fill="#020308">
      <path d="M1050 1080 L1060 560 Q1090 520 1120 560 L1130 1080 Z"/><circle cx="1090" cy="520" r="34"/>
      <path d="M1124 640 L1200 700 L1200 720 L1124 680 Z"/>
      <rect x="1196" y="690" width="90" height="62" rx="6" fill="#8a8e98"/><rect x="1230" y="680" width="22" height="12" fill="#4a4e58"/>
      <path d="M760 1080 L770 600 Q800 560 830 600 L840 1080 Z" fill="#14182a"/><circle cx="800" cy="560" r="32" fill="#14182a"/>
    </g>
    </g>
    <rect width="1600" height="900" fill="#000" opacity=".12"/>
  </svg>`,
  haneda: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="shSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2a5a"/><stop offset=".6" stop-color="#e8a07a"/><stop offset="1" stop-color="#ffd8a0"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#shSky)"/>
    <g transform="translate(0 -150)">
    <circle cx="1240" cy="640" r="120" fill="#fff0c8" opacity=".8"/>
    <rect x="0" y="640" width="1600" height="420" fill="#1a1c26"/>
    <g fill="#ffe8b0">${Array.from({ length: 24 }, (_, i) => `<rect x="${i * 70}" y="700" width="34" height="5"/>`).join('')}</g>
    <g fill="#0a0c14"><path d="M120 640 L760 610 Q830 615 760 646 L120 656 Z"/><path d="M420 628 L300 520 L350 520 L560 628 Z"/><path d="M150 644 L100 556 L136 556 L210 644 Z"/></g>
    <g><rect x="980" y="600" width="170" height="60" rx="8" fill="#e8e8ec"/><rect x="980" y="620" width="170" height="10" fill="#1a1a20"/><rect x="1020" y="584" width="40" height="18" fill="#c8302a" class="sc-siren"/><rect x="1060" y="584" width="40" height="18" fill="#3a6aff" class="sc-siren2"/>
      <circle cx="1010" cy="664" r="16" fill="#111"/><circle cx="1120" cy="664" r="16" fill="#111"/></g>
    <g fill="#05060a"><path d="M900 1060 L908 640 Q930 610 952 640 L960 1060 Z"/><circle cx="930" cy="612" r="24"/><path d="M908 610 Q930 560 960 600 L970 680 Q950 640 930 640 Z" fill="#8a1a14"/></g>
    </g>
  </svg>`,
  london: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="slSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1e2e"/><stop offset=".7" stop-color="#5a5a72"/><stop offset="1" stop-color="#9a8a8a"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#slSky)"/>
    <g fill="#0a0a12">
      <rect x="980" y="180" width="110" height="560"/><path d="M970 180 L1035 60 L1100 180 Z"/><rect x="1028" y="20" width="14" height="50"/>
      <circle cx="1035" cy="260" r="40" fill="#e8dcb0"/><circle cx="1035" cy="260" r="34" fill="#f4ecd0"/>
      <path d="M1035 260 L1035 236 M1035 260 L1052 266" stroke="#0a0a12" stroke-width="4"/>
      <rect x="0" y="600" width="1600" height="300"/>
      ${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 70 + 60}" y="${540 - (i % 3) * 30}" width="40" height="${100 + (i % 3) * 30}"/>`).join('')}
      <rect x="1140" y="420" width="420" height="220"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${1150 + i * 52} 420 L${1170 + i * 52} 380 L${1190 + i * 52} 420 Z"/>`).join('')}
    </g>
    <path d="M0 760 C400 740 800 780 1600 750 L1600 900 L0 900 Z" fill="#2a3040" opacity=".9"/>
    <g class="sc-rain" stroke="rgba(220,230,240,.25)" stroke-width="2">${Array.from({ length: 90 }, (_, i) => `<path d="M${(i * 173) % 1700 - 50} ${(i * 97) % 900} l-10 36"/>`).join('')}</g>
  </svg>`,
});

/* ---------------- 戦闘：シード適合体 ---------------- */
const SEED_SVG = `<svg viewBox="0 0 240 220" class="en-svg"><defs><radialGradient id="sdg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#7a3aff" stop-opacity=".45"/><stop offset="1" stop-color="#7a3aff" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="120" cy="110" rx="118" ry="104" fill="url(#sdg)"/>
  <g class="tent tl" fill="none" stroke="#2a0a3a" stroke-width="9" stroke-linecap="round"><path d="M92 82 C60 60 40 90 18 70 C6 60 10 40 22 36"/><path d="M92 92 C56 96 40 130 14 124"/></g>
  <g class="tent tr" fill="none" stroke="#2a0a3a" stroke-width="9" stroke-linecap="round"><path d="M148 82 C180 60 200 90 222 70 C234 60 230 40 218 36"/><path d="M148 92 C184 96 200 130 226 124"/></g>
  <g fill="none" stroke="#b46aff" stroke-width="2" opacity=".8" class="tent tl"><path d="M92 82 C60 60 40 90 18 70"/></g>
  <g fill="none" stroke="#b46aff" stroke-width="2" opacity=".8" class="tent tr"><path d="M148 82 C180 60 200 90 222 70"/></g>
  <path d="M60 220 C64 170 90 150 120 148 C150 150 176 170 180 220 Z" fill="#14101c"/>
  <path d="M104 150 L120 186 L136 150 Z" fill="#c8cad0" opacity=".7"/>
  <path d="M90 92 C90 60 150 60 150 92 C150 122 140 140 120 144 C100 140 90 122 90 92 Z" fill="#2a2430"/>
  <path d="M88 84 C88 56 152 56 152 84 C140 70 100 70 88 84 Z" fill="#14100e"/>
  <g stroke="rgba(236,232,224,.7)" stroke-width="2" fill="rgba(180,106,255,.2)"><circle cx="108" cy="96" r="8"/><circle cx="132" cy="96" r="8"/><path d="M116 95 L124 95"/></g>
  <circle cx="108" cy="96" r="2.6" fill="#e0b0ff"/><circle cx="132" cy="96" r="2.6" fill="#e0b0ff"/>
  <path d="M108 122 Q120 130 132 122" stroke="#e0b0ff" stroke-width="2" fill="none"/>
  <g class="wave" fill="none" stroke="#b46aff" stroke-width="1.5" opacity=".6"><circle cx="120" cy="100" r="60"/><circle cx="120" cy="100" r="80"/></g>
</svg>`;
