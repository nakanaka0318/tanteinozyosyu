'use strict';
/* =========================================================
   純白の少女編：キャラクター・夢のタイル・タイトル背景・一枚絵・悪夢
   map.theme = 'dream'
   ========================================================= */
Object.assign(ART.LOOKS, {
  siesta_child: { skin: '#f6dcc8', hair: '#f4f6fc', coat: '#e8eaf2', coatD: '#c8ccd8', shirt: '#ffffff', tie: '#c8ccd8', pants: '#e8eaf2', shoes: '#c8ccd8', dress: true, long: true, style: 'long', child: true },
  siesta_teen: { skin: '#f6dcc8', hair: '#eceef6', coat: '#3a3e58', coatD: '#2a2c40', shirt: '#f4f6fa', tie: '#c8304a', pants: '#3a3e58', shoes: '#1a1424', dress: true, long: true, style: 'long', child: true },
  kase_y: { skin: '#f0c8a8', hair: '#c8302a', coat: '#1a1a20', coatD: '#0e0e12', shirt: '#e8e4dc', tie: '#1a1a20', pants: '#1a1a20', shoes: '#0a0a0a', long: true, style: 'long' },
  shadow: { skin: '#c8c4d0', hair: '#14121a', coat: '#f0f0f4', coatD: '#c8c8d0', shirt: '#14121a', tie: '#c8302a', pants: '#2a2830', shoes: '#0a0a0a', style: 'slick', long: true, glasses: true },
});

(() => {
  // 子どもの姿は少し小さく描く
  const base = ART.drawChar;
  ART.drawChar = function (c, px, py, dir, frame, L, opts) {
    if (!L || !L.child) return base.call(this, c, px, py, dir, frame, L, opts);
    const fx = Math.round(px) + 8, fy = Math.round(py) + 16;
    c.save(); c.translate(fx, fy); c.scale(0.8, 0.8); c.translate(-fx, -fy);
    base.call(this, c, px, py, dir, frame, L, opts);
    c.restore();
  };
  // 病室のスリープカプセル・記憶のかけら
  const sp = ART.drawSprite;
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const draw = function (c, kind, px, py, t) {
    const x = Math.round(px), y = Math.round(py);
    if (kind === 'capsule') {
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x + 16, y + 15, 17, 3, 0, 0, 7); c.fill();
      R(c, x, y + 2, 32, 12, '#c8ccd8'); R(c, x, y + 2, 32, 2, '#e8ecf4'); R(c, x, y + 12, 32, 2, '#8a8e98');
      const g = 0.35 + Math.sin(t * 0.003) * 0.12;
      c.fillStyle = `rgba(150,210,255,${g})`; c.fillRect(x + 3, y + 3, 26, 8);
      R(c, x + 5, y + 5, 5, 4, '#f4f6fc'); R(c, x + 10, y + 6, 15, 3, '#2c3c6e'); R(c, x + 7, y + 6, 2, 2, '#f6dcc8');
      R(c, x + 28, y + 4, 2, 2, Math.sin(t * 0.004) > 0 ? '#6dff9a' : '#2a6a3a');
    } else if (kind === 'kakera') {
      const b = Math.sin(t * 0.004 + x) * 1.5;
      c.fillStyle = 'rgba(200,180,255,.25)'; c.beginPath(); c.arc(x + 8, y + 7 + b, 7, 0, 7); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x + 8, y + 2 + b); c.lineTo(x + 12, y + 7 + b); c.lineTo(x + 8, y + 12 + b); c.lineTo(x + 4, y + 7 + b); c.fill();
      R(c, x + 7, y + 5 + b, 2, 2, '#c8a8ff');
    } else if (kind === 'files') {
      R(c, x + 2, y + 6, 12, 8, '#d8d0b8'); R(c, x + 3, y + 4, 11, 8, '#f0e8d0'); for (let i = 0; i < 3; i++) R(c, x + 5, y + 6 + i * 2, 7, 1, '#8a7a62');
    } else return false;
    return true;
  };
  ART.drawSprite = function (c, kind, px, py, t) { if (!draw(c, kind, px, py, t)) sp.call(this, c, kind, px, py, t); };
  const ssp = SKYART.drawSprite;
  SKYART.drawSprite = function (c, kind, px, py, t) { if (!draw(c, kind, px, py, t)) ssp.call(this, c, kind, px, py, t); };
})();

const DRART = (() => {
  const T = 16;
  const WALK = new Set(['.', ',', 'D', '_']);
  const WALL = new Set(['#', 'W', 'Z', 'E']);
  const FLOOR = new Set(['.', ',', '_']);
  const hsh = ART.hsh, at = ART.at;
  const isWall = ch => WALL.has(ch);
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const ell = (c, x, y, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); };
  function floorOf(g, x, y) {
    for (let d = 1; d < 8; d++) for (const [xx, yy] of [[x - d, y], [x + d, y], [x, y + d], [x, y - d]]) { const ch = g[yy] && g[yy][xx]; if (ch && FLOOR.has(ch)) return ch; }
    return '.';
  }
  function floor(c, ch, x, y, tx, ty) {
    if (ch === ',') {
      R(c, x, y, T, T, '#dfe6d8');
      if (hsh(tx, ty, 1) > 0.5) R(c, x + 3, y + 9, 1, 3, '#b8c8a8');
      if (hsh(tx, ty, 2) > 0.55) { const fx = x + 2 + Math.floor(hsh(tx, ty, 3) * 11), fy = y + 2 + Math.floor(hsh(tx, ty, 4) * 11); R(c, fx, fy, 2, 2, '#ffffff'); R(c, fx + 1, fy + 1, 1, 1, '#f0d070'); }
      if (hsh(tx, ty, 5) > 0.8) R(c, x + 10, y + 4, 2, 2, '#e8d8ff');
    } else {
      R(c, x, y, T, T, '#dedbe8'); R(c, x, y, T, 1, '#c8c4d8'); R(c, x, y, 1, T, '#c8c4d8');
      if ((tx + ty) % 2 === 0) R(c, x + 7, y + 7, 2, 2, '#d2cee2');
    }
  }
  function wallFace(c, x, y, tx, ch) {
    if (ch === 'W') {
      // 空（または、光のさす窓）
      const g = c.createLinearGradient(0, y, 0, y + T); g.addColorStop(0, '#a8c8f0'); g.addColorStop(1, '#e8f0ff');
      c.fillStyle = g; c.fillRect(x, y, T, T);
      if (tx % 3 === 0) { ell(c, x + 8, y + 6, 6, 2.5, 'rgba(255,255,255,.8)'); }
      return;
    }
    R(c, x, y, T, T, '#f0eef8'); R(c, x, y + 12, T, 4, '#b8b2cc'); R(c, x, y, T, 2, '#ffffff');
    if (ch === 'Z') { R(c, x + 1, y + 2, 14, 10, '#fff4d0'); R(c, x + 1, y + 2, 14, 1, '#ffffff'); R(c, x + 7, y + 2, 1, 10, '#e8d8a8'); R(c, x + 1, y + 7, 14, 1, '#e8d8a8'); }
    else if (ch === 'E') { R(c, x + 2, y, 12, 14, '#ffffff'); R(c, x + 7, y, 2, 14, '#e8e4f0'); }
    else if (tx % 4 === 1) R(c, x + 6, y + 4, 4, 6, '#e4e0ee');
  }
  function wallTop(c, x, y, tx, ty, g) {
    R(c, x, y, T, T, '#8a84a8');
    const e = '#6e6890';
    if (!isWall(at(g, tx - 1, ty))) R(c, x, y, 2, T, e);
    if (!isWall(at(g, tx + 1, ty))) R(c, x + 14, y, 2, T, e);
    if (!isWall(at(g, tx, ty - 1)) && g[ty - 1]) R(c, x, y, T, 2, e);
  }
  function renderMap(map, RS) {
    const g = map.grid, Wd = map.w, H = map.h;
    const cv = document.createElement('canvas'); cv.width = Wd * T * RS; cv.height = H * T * RS;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.scale(RS, RS);
    const lights = [], anims = [];
    const L = (x, y, r, col, a, flick) => lights.push({ x, y, r, col, a, flick });
    for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < Wd; tx++) {
      const ch = at(g, tx, ty), x = tx * T, y = ty * T;
      if (isWall(ch)) {
        const face = ty + 1 < H && !isWall(at(g, tx, ty + 1));
        if (face || ch === 'W') { wallFace(c, x, y, tx, ch); if (ch === 'Z' || ch === 'W') L(x + 8, y + 14, 30, '255,244,200', ch === 'W' ? 0.1 : 0.05); if (ch === 'E') L(x + 8, y + 8, 40, '255,255,255', 0.3); }
        else wallTop(c, x, y, tx, ty, g);
        continue;
      }
      const fl = FLOOR.has(ch) ? ch : floorOf(g, tx, ty);
      floor(c, fl, x, y, tx, ty);
      switch (ch) {
        case 'D': R(c, x + 1, y, 14, T, '#f8f8fc'); R(c, x + 7, y, 2, T, '#dcd8ea'); break;
        case 'b': R(c, x + 1, y + 1, 14, 14, '#c8ccd8'); R(c, x + 2, y + 2, 12, 12, '#ffffff'); R(c, x + 3, y + 3, 10, 3, '#eef0f8'); R(c, x + 2, y + 9, 12, 1, '#e0e2ec'); break;
        case 'Q': R(c, x + 1, y + 4, 14, 9, '#d8dce8'); R(c, x + 1, y + 4, 14, 2, '#ffffff'); R(c, x + 2, y + 13, 2, 3, '#a8acb8'); R(c, x + 12, y + 13, 2, 3, '#a8acb8'); break;
        case 'M': R(c, x + 2, y + 1, 12, 13, '#b8bcc8'); R(c, x + 3, y + 2, 10, 7, '#0e1a24'); anims.push({ type: 'ekg', tx, ty }); L(x + 8, y + 5, 22, '120,255,180', 0.12); break;
        case 'F': ell(c, x + 8, y + 10, 7, 5, '#c8d8b8'); for (let i = 0; i < 5; i++) R(c, x + 3 + Math.floor(hsh(tx, ty, i) * 10), y + 6 + Math.floor(hsh(tx, ty, i + 9) * 6), 2, 2, i % 2 ? '#ffffff' : '#f4e0ff'); break;
        case 'T': {
          ell(c, x + 8, y + 15, 10, 3, 'rgba(120,110,150,.25)');
          R(c, x + 6, y + 2, 4, 13, '#e8e0d8');
          ell(c, x + 8, y - 6, 14, 10, '#ffffff'); ell(c, x + 2, y - 2, 8, 6, '#f8f4ff'); ell(c, x + 14, y - 2, 8, 6, '#f8f4ff');
          L(x + 8, y - 4, 70, '255,250,230', 0.25);
          break;
        }
        case 'L': R(c, x + 7, y - 4, 2, 18, '#c8ccd8'); ell(c, x + 8, y - 5, 4, 3, '#fffbe8'); L(x + 8, y - 5, 50, '255,246,220', 0.2); break;
      }
    }
    if (map.extraLights) map.extraLights.forEach(l => L(l.x * T + 8, l.y * T + 8, l.r, l.col, l.a || 0.2, l.flick));
    return { canvas: cv, lights, anims };
  }
  function drawAnim(c, a, t) {
    const x = a.tx * T, y = a.ty * T;
    if (a.type === 'ekg') {
      const p = (t * 0.02 + a.tx * 7) % 10;
      for (let i = 0; i < 10; i++) R(c, x + 3 + i, y + 5 + (Math.abs(i - p) < 1 ? -2 : 0), 1, 1, 'rgba(120,255,180,.9)');
    }
  }
  return { T, WALK, WALL, FLOOR, renderMap, drawAnim, drawSprite: (c, k, px, py, t) => ART.drawSprite(c, k, px, py, t) };
})();

/* ---------------- タイトル背景：白い花と眠る少女 ---------------- */
const DTITLE = (() => {
  const SW = 384, SH = 216;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const petals = Array.from({ length: 46 }, () => ({ x: rnd(0, SW), y: rnd(0, SH), v: rnd(0.006, 0.016), w: rnd(0, 6), s: rnd(1, 2.2) }));
  return {
    update(dt) { for (const p of petals) { p.y += p.v * dt; p.x += Math.sin(p.y * 0.04 + p.w) * 0.3; if (p.y > SH + 4) { p.y = -4; p.x = rnd(0, SW); } } },
    render(c) {
      c.setTransform(RS, 0, 0, RS, 0, 0);
      const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#1e1a38'); g.addColorStop(0.55, '#4a3e78'); g.addColorStop(1, '#8a7cb0');
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
      const sc = VW < 384 ? VW / 300 : 1, sox = (VW - SW * sc) / 2, soy = VH < 300 ? 0 : VH * 0.6 - 120 * sc;
      c.setTransform(RS * sc, 0, 0, RS * sc, sox * RS, soy * RS);
      const glow = c.createRadialGradient(192, 120, 4, 192, 120, 120); glow.addColorStop(0, 'rgba(255,250,235,.55)'); glow.addColorStop(1, 'rgba(255,250,235,0)');
      c.fillStyle = glow; c.fillRect(0, 0, SW, SH);
      // 白い木
      c.fillStyle = '#f4f0fa'; c.fillRect(188, 110, 8, 60);
      for (const [dx, dy, r] of [[0, 96, 34], [-26, 108, 22], [26, 108, 22], [-12, 84, 20], [14, 84, 20]]) { c.beginPath(); c.arc(192 + dx, dy, r, 0, 7); c.fill(); }
      // 花畑
      c.fillStyle = '#a89ec8'; c.beginPath(); c.moveTo(0, 176); c.quadraticCurveTo(192, 160, SW, 176); c.lineTo(SW, SH); c.lineTo(0, SH); c.fill();
      for (let i = 0; i < 70; i++) { c.fillStyle = i % 3 ? '#ffffff' : '#f0dcff'; c.fillRect((i * 53) % SW, 172 + ((i * 29) % 40), 2, 2); }
      // 眠る少女
      c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(178, 170, 9, 3, 0, 0, 7); c.fill();
      c.fillStyle = '#2c3c6e'; c.fillRect(184, 168, 16, 4); c.fillStyle = '#f6dcc8'; c.fillRect(181, 168, 3, 3);
      for (const p of petals) { c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.ellipse(p.x, p.y, p.s, p.s * 0.6, p.w + W.t * 0.001, 0, 7); c.fill(); }
      c.setTransform(RS, 0, 0, RS, 0, 0);
    },
  };
})();

/* ---------------- 一枚絵（SVG） ---------------- */
Object.assign(SCENES, {
  capsule: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><radialGradient id="scpG" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#2a3a5a"/><stop offset="1" stop-color="#05070e"/></radialGradient>
      <linearGradient id="scpGl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe4ff" stop-opacity=".55"/><stop offset="1" stop-color="#6aa8e8" stop-opacity=".25"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#scpG)"/>
    <g transform="translate(0 -60)">
      <ellipse cx="800" cy="560" rx="520" ry="60" fill="rgba(120,190,255,.15)"/>
      <rect x="360" y="380" width="880" height="170" rx="80" fill="#c8ccd8"/>
      <rect x="380" y="372" width="840" height="120" rx="60" fill="url(#scpGl)" stroke="#e8f4ff" stroke-width="4"/>
      <ellipse cx="520" cy="430" rx="70" ry="44" fill="#f4f6fc"/>
      <ellipse cx="560" cy="436" rx="34" ry="30" fill="#f6dcc8"/>
      <path d="M520 420 C540 400 590 404 600 430 C580 418 548 418 520 430Z" fill="#ffffff"/>
      <rect x="590" y="420" width="520" height="40" rx="18" fill="#2c3c6e"/>
      <path d="M546 444 Q556 448 566 444" stroke="#7a5a50" stroke-width="3" fill="none"/>
      <circle cx="1180" cy="520" r="10" fill="#6dff9a"/>
    </g>
  </svg>`,
  garden: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="sgdS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ac4f0"/><stop offset=".7" stop-color="#e8f2ff"/><stop offset="1" stop-color="#fffaf0"/></linearGradient>
      <radialGradient id="sgdSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe8"/><stop offset="1" stop-color="#fffbe8" stop-opacity="0"/></radialGradient></defs>
    <rect width="1600" height="900" fill="url(#sgdS)"/>
    <circle cx="1200" cy="160" r="260" fill="url(#sgdSun)"/>
    <g class="sc-cloud"><ellipse cx="300" cy="150" rx="160" ry="36" fill="#ffffff" opacity=".85"/><ellipse cx="760" cy="110" rx="120" ry="28" fill="#ffffff" opacity=".7"/></g>
    <g transform="translate(0 -70)">
      <rect x="780" y="300" width="40" height="300" fill="#efe8e0"/>
      <circle cx="800" cy="260" r="170" fill="#ffffff"/><circle cx="660" cy="320" r="100" fill="#fbf8ff"/><circle cx="940" cy="320" r="100" fill="#fbf8ff"/>
      <path d="M0 640 C400 590 1200 600 1600 650 L1600 900 L0 900 Z" fill="#eef2e6"/>
      ${Array.from({ length: 140 }, (_, i) => `<circle cx="${(i * 97) % 1600}" cy="${640 + ((i * 53) % 220)}" r="${3 + (i % 4)}" fill="${i % 3 ? '#ffffff' : '#f0dcff'}"/>`).join('')}
      <g transform="translate(760 610)"><ellipse cx="-30" cy="0" rx="40" ry="16" fill="#ffffff"/><circle cx="-6" cy="-4" r="14" fill="#f6dcc8"/><rect x="6" y="-10" width="110" height="20" rx="9" fill="#2c3c6e"/></g>
    </g>
  </svg>`,
  whiteroom: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect width="1600" height="900" fill="#f4f2fa"/>
    <path d="M0 640 L1600 640 L1600 900 L0 900 Z" fill="#e4e0ee"/>
    ${Array.from({ length: 9 }, (_, i) => `<g transform="translate(${110 + i * 165} 520)"><rect width="130" height="70" fill="#ffffff" stroke="#d4d0e2" stroke-width="3"/><rect x="10" y="-30" width="34" height="22" fill="#ffffff" stroke="#d4d0e2" stroke-width="2"/><text x="27" y="-14" font-size="14" text-anchor="middle" fill="#8a86a0">No.${i + 1}</text></g>`).join('')}
    <g transform="translate(1430 470)"><ellipse cx="0" cy="40" rx="30" ry="40" fill="#e8eaf2"/><circle cx="0" cy="-10" r="22" fill="#f6dcc8"/><path d="M-24 -10 C-24 -40 24 -40 24 -10 L24 30 L-24 30Z" fill="#f4f6fc"/><circle cx="0" cy="-4" r="16" fill="#f6dcc8"/></g>
  </svg>`,
  awaken: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="sawW" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6dc"/><stop offset="1" stop-color="#f0d8b0"/></linearGradient></defs>
    <rect width="1600" height="900" fill="#e8e4ec"/>
    <rect x="980" y="80" width="460" height="400" fill="url(#sawW)"/><rect x="1200" y="80" width="12" height="400" fill="#c8c0b0"/><rect x="980" y="272" width="460" height="12" fill="#c8c0b0"/>
    <path d="M980 480 L560 900 L1300 900 L1440 480 Z" fill="rgba(255,240,200,.35)"/>
    <g transform="translate(0 -40)">
      <rect x="260" y="500" width="820" height="150" rx="70" fill="#c8ccd8"/>
      <path d="M280 500 C300 380 1040 380 1060 500" fill="none" stroke="#e8f4ff" stroke-width="6" opacity=".6" transform="rotate(-14 280 500)"/>
      <ellipse cx="420" cy="540" rx="70" ry="40" fill="#f4f6fc"/><circle cx="452" cy="546" r="30" fill="#f6dcc8"/>
      <rect x="480" y="530" width="460" height="36" rx="16" fill="#2c3c6e"/>
      <path d="M442 548 Q452 554 462 548" stroke="#7a5a50" stroke-width="3" fill="none"/>
    </g>
  </svg>`,
});

/* ---------------- 悪夢（敵） ---------------- */
const SHADOW_SVG = `<svg viewBox="0 0 240 220" class="en-svg"><defs><radialGradient id="shdG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff3a4a" stop-opacity=".35"/><stop offset="1" stop-color="#ff3a4a" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="120" cy="110" rx="118" ry="104" fill="url(#shdG)"/>
  <path d="M50 220 C56 150 84 128 120 126 C156 128 184 150 190 220 Z" fill="#f0f0f4"/>
  <path d="M112 128 L120 220 L128 128 Z" fill="#14121a"/>
  <path d="M84 70 C84 30 156 30 156 70 C156 104 142 124 120 126 C98 124 84 104 84 70 Z" fill="#18161e"/>
  <g stroke="#e8e8f0" stroke-width="3" fill="rgba(255,60,80,.25)"><circle cx="106" cy="76" r="10"/><circle cx="134" cy="76" r="10"/><path d="M116 76 L124 76"/></g>
  <circle cx="106" cy="76" r="3" fill="#ff3a4a"/><circle cx="134" cy="76" r="3" fill="#ff3a4a"/>
  <g class="tent tr"><rect x="186" y="120" width="10" height="56" rx="3" fill="#dfe6f0"/><rect x="189" y="100" width="4" height="20" fill="#a8b0c0"/><rect x="183" y="170" width="16" height="6" fill="#8a90a0"/></g>
</svg>`;
const ROOTHEART_SVG = `<svg viewBox="0 0 240 220" class="en-svg"><defs><radialGradient id="rhG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8aff9a" stop-opacity=".45"/><stop offset="1" stop-color="#8aff9a" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="120" cy="110" rx="118" ry="104" fill="url(#rhG)"/>
  <g class="tent tl" fill="none" stroke="#3a2a16" stroke-width="8" stroke-linecap="round"><path d="M100 110 C60 90 50 40 14 30"/><path d="M96 130 C50 140 40 190 10 200"/></g>
  <g class="tent tr" fill="none" stroke="#3a2a16" stroke-width="8" stroke-linecap="round"><path d="M140 110 C180 90 190 40 226 30"/><path d="M144 130 C190 140 200 190 230 200"/></g>
  <path d="M120 170 C70 130 70 80 98 72 C110 68 118 76 120 84 C122 76 130 68 142 72 C170 80 170 130 120 170 Z" fill="#c8304a"/>
  <path d="M120 170 C96 150 84 120 92 96" stroke="#ff8a9a" stroke-width="3" fill="none"/>
  <g fill="none" stroke="#5a4a2a" stroke-width="5"><path d="M86 90 C110 110 130 100 156 120"/><path d="M84 124 C104 112 140 132 152 100"/></g>
  <circle cx="120" cy="116" r="8" fill="#8aff9a"/>
</svg>`;
const HIGHSEED_SVG = `<svg viewBox="0 0 240 220" class="en-svg"><defs><radialGradient id="hsG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#b46aff" stop-opacity=".55"/><stop offset="1" stop-color="#b46aff" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="120" cy="110" rx="118" ry="104" fill="url(#hsG)"/>
  <g class="tent tl" fill="none" stroke="#2a0a3a" stroke-width="10" stroke-linecap="round"><path d="M90 90 C50 50 30 100 8 60"/><path d="M86 120 C40 120 30 170 6 160"/><path d="M96 150 C70 180 60 200 40 218"/></g>
  <g class="tent tr" fill="none" stroke="#2a0a3a" stroke-width="10" stroke-linecap="round"><path d="M150 90 C190 50 210 100 232 60"/><path d="M154 120 C200 120 210 170 234 160"/><path d="M144 150 C170 180 180 200 200 218"/></g>
  <g fill="none" stroke="#e0b0ff" stroke-width="2" opacity=".8" class="tent tl"><path d="M90 90 C50 50 30 100 8 60"/></g>
  <ellipse cx="120" cy="112" rx="50" ry="64" fill="#2a1a3a"/>
  <path d="M120 48 C100 70 100 150 120 176 C140 150 140 70 120 48 Z" fill="#4a2a6a"/>
  <ellipse cx="120" cy="100" rx="22" ry="14" fill="#e0b0ff"/><ellipse cx="120" cy="100" rx="7" ry="12" fill="#1a0a24"/>
  <circle cx="98" cy="134" r="4" fill="#e0b0ff"/><circle cx="142" cy="134" r="4" fill="#e0b0ff"/><circle cx="120" cy="146" r="3" fill="#e0b0ff"/>
</svg>`;
