'use strict';
/* =========================================================
   アジト潜入編：キャラクター・アジトのタイル・タイトル背景・一枚絵
   map.theme = 'hideout'
   ========================================================= */
Object.assign(ART.LOOKS, {
  schwarz: { skin: '#e0b48e', hair: '#e8e4dc', coat: '#5a4a3a', coatD: '#40342a', shirt: '#2a2a30', tie: '#c9a45c', pants: '#2a2622', shoes: '#141008', style: 'side', beard: '#e8e4dc', long: true, glasses: true },
  mech: { skin: '#9aa0aa', hair: '#3a3e48', coat: '#4a4e58', coatD: '#2e323a', shirt: '#6a6e78', tie: '#ff3a3a', pants: '#3a3e48', shoes: '#14161c', style: 'bald', visor: '#ff3a3a' },
});
['mech1', 'mech2', 'mech3', 'mech4', 'mech5', 'mech6', 'mech7', 'mechx'].forEach(k => { ART.LOOKS[k] = ART.LOOKS.mech; });
ART.LOOKS.exceed = { skin: '#8a9098', hair: '#2a1e10', coat: '#1a1e24', coatD: '#0e1014', shirt: '#3a3e46', tie: '#8aff9a', pants: '#14161a', shoes: '#0a0a0a', style: 'messy', visor: '#8aff9a', long: true };

const ABART = (() => {
  const T = 16;
  const WALK = new Set(['.', ',', 'D', '_']);
  const WALL = new Set(['#', 'W', 'E']);
  const FLOOR = new Set(['.', ',', '_']);
  const hsh = ART.hsh, at = ART.at;
  const isWall = ch => WALL.has(ch);
  function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function ell(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
  function floorOf(g, x, y) {
    for (let d = 1; d < 8; d++) for (const [xx, yy] of [[x - d, y], [x + d, y], [x, y + d], [x, y - d]]) { const ch = g[yy] && g[yy][xx]; if (ch && FLOOR.has(ch)) return ch; }
    return '.';
  }
  function floor(c, ch, x, y, tx, ty, g) {
    if (ch === ',') {
      R(c, x, y, T, T, '#120a0e');
      c.fillStyle = 'rgba(255,40,60,.22)'; c.fillRect(x, y + 7, T, 1); c.fillRect(x + 7, y, 1, T);
      R(c, x + 7, y + 7, 2, 2, 'rgba(255,60,80,.6)');
    } else if (ch === '_') {
      R(c, x, y, T, T, '#1a1c22'); if ((tx + ty) % 2) R(c, x + 3, y + 3, 10, 10, '#20232a');
    } else {
      R(c, x, y, T, T, '#2c3038'); R(c, x, y, T, 1, '#3c4048'); R(c, x, y, 1, T, '#3c4048');
      R(c, x + 2, y + 2, 1, 1, '#5a5e68'); R(c, x + 13, y + 2, 1, 1, '#5a5e68'); R(c, x + 2, y + 13, 1, 1, '#5a5e68'); R(c, x + 13, y + 13, 1, 1, '#5a5e68');
      const n = (dx, dy) => at(g, tx + dx, ty + dy) === ',';
      const hz = (hx, hy, w, h) => { for (let i = 0; i < Math.max(w, h); i += 4) { R(c, hx + (w > h ? i : 0), hy + (h > w ? i : 0), w > h ? 2 : w, h > w ? 2 : h, '#e8c040'); } };
      if (n(0, -1)) hz(x, y, T, 2); if (n(0, 1)) hz(x, y + 14, T, 2); if (n(-1, 0)) hz(x, y, 2, T); if (n(1, 0)) hz(x + 14, y, 2, T);
    }
  }
  function wallFace(c, x, y, tx) {
    R(c, x, y, T, T, '#1e2128'); R(c, x, y, T, 2, '#30343c'); R(c, x, y + 13, T, 3, '#14161a');
    R(c, x + 2, y + 4, 12, 2, '#3a3e48'); R(c, x + 2, y + 8, 12, 2, '#3a3e48');
    if (tx % 4 === 0) R(c, x + 6, y + 3, 4, 8, '#2a2e36');
  }
  function wallTop(c, x, y, tx, ty, g) {
    R(c, x, y, T, T, '#07080b');
    const e = '#2a2e36';
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
        if (ch === 'E') { R(c, x, y, T, T, '#0e1418'); R(c, x + 2, y + 2, 12, 12, '#cfe0ec'); R(c, x + 2, y + 2, 12, 2, '#ffffff'); L(x + 8, y + 8, 50, '200,230,255', 0.3); continue; }
        if (face) { wallFace(c, x, y, tx); if (ch === 'W') { R(c, x + 6, y + 4, 4, 3, '#4a0a10'); anims.push({ type: 'warn', tx, ty }); } }
        else wallTop(c, x, y, tx, ty, g);
        continue;
      }
      const fl = FLOOR.has(ch) ? ch : ch === 'D' ? '.' : floorOf(g, tx, ty);
      floor(c, fl, x, y, tx, ty, g);
      if (ch === ',') anims.push({ type: 'laser', tx, ty });
      switch (ch) {
        case 'D': R(c, x, y, T, T, '#3a3e48'); R(c, x + 7, y, 2, T, '#14161a'); R(c, x + 2, y + 6, 3, 4, '#e8c040'); R(c, x + 11, y + 6, 3, 4, '#e8c040'); break;
        case 'R': {
          c.strokeStyle = '#3a2a16'; c.lineWidth = 3;
          for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x + hsh(tx, ty, i) * 16, y); c.quadraticCurveTo(x + 8, y + 8 + i, x + hsh(tx, ty, i + 5) * 16, y + 16); c.stroke(); }
          c.strokeStyle = 'rgba(120,220,100,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 3, y); c.quadraticCurveTo(x + 9, y + 8, x + 5, y + 16); c.stroke();
          L(x + 8, y + 8, 22, '120,220,100', 0.08);
          break;
        }
        case 'C': R(c, x + 1, y + 2, 14, 13, '#4a3e2a'); R(c, x + 1, y + 2, 14, 2, '#6a5a3e'); R(c, x + 2, y + 8, 12, 1, '#2a2216'); R(c, x + 7, y + 3, 2, 11, '#2a2216'); break;
        case 'T': R(c, x + 2, y + 1, 12, 14, '#1a1e26'); R(c, x + 3, y + 2, 10, 7, '#06141a'); anims.push({ type: 'term', tx, ty }); L(x + 8, y + 6, 26, '80,220,255', 0.18); break;
        case 'M': R(c, x + 2, y - 4, 12, 19, '#30343c'); R(c, x + 4, y - 2, 8, 10, 'rgba(120,220,255,.18)'); R(c, x + 6, y, 4, 6, '#14161a'); R(c, x + 2, y + 13, 12, 2, '#14161a'); break;
        case 'L': R(c, x + 6, y - 6, 4, 20, '#30343c'); R(c, x + 5, y - 8, 6, 3, '#ffe8b0'); L(x + 8, y - 6, 60, '255,230,180', 0.22, true); break;
        case 'P': R(c, x + 1, y, 4, T, '#4a4e58'); R(c, x + 6, y, 4, T, '#3a3e48'); R(c, x + 11, y, 4, T, '#4a4e58'); R(c, x, y + 6, T, 2, '#2a2e36'); break;
      }
    }
    if (map.extraLights) map.extraLights.forEach(l => L(l.x * T + 8, l.y * T + 8, l.r, l.col, l.a || 0.2, l.flick));
    return { canvas: cv, lights, anims };
  }
  function drawAnim(c, a, t) {
    const x = a.tx * T, y = a.ty * T;
    if (a.type === 'laser') {
      const p = (Math.sin(t * 0.004 + a.tx * 0.7 + a.ty) + 1) / 2;
      c.fillStyle = `rgba(255,40,70,${0.06 + p * 0.12})`; c.fillRect(x, y, T, T);
    } else if (a.type === 'term') {
      for (let i = 0; i < 3; i++) R(c, x + 4, y + 3 + i * 2, 3 + ((Math.sin(t * 0.005 + i * 2 + a.tx) + 1) * 3 | 0), 1, 'rgba(80,220,255,.85)');
    } else if (a.type === 'warn') {
      if (Math.sin(t * 0.006 + a.tx) > 0.3) { R(c, x + 6, y + 4, 4, 3, '#ff3a3a'); c.fillStyle = 'rgba(255,40,40,.12)'; c.fillRect(x - 8, y + 8, 32, 12); }
    }
  }
  function drawSprite(c, kind, px, py, t) {
    const x = Math.round(px), y = Math.round(py);
    if (kind === 'brokenmech') {
      ell(c, x + 8, y + 14, 9, 2.5, 'rgba(0,0,0,.4)');
      R(c, x + 1, y + 6, 14, 8, '#4a4e58'); R(c, x + 3, y + 3, 7, 5, '#5a5e68'); R(c, x + 4, y + 5, 5, 1, Math.sin(t * 0.01) > 0 ? '#ff3a3a' : '#3a0a0a');
      R(c, x + 12, y + 10, 4, 2, '#2a2e36'); R(c, x - 2, y + 11, 4, 2, '#2a2e36');
      if (Math.sin(t * 0.02) > 0.8) R(c, x + 10, y + 4, 1, 1, '#ffe080');
    } else if (kind === 'note') {
      R(c, x + 3, y + 5, 10, 8, '#e8e0d0'); for (let i = 0; i < 3; i++) R(c, x + 5, y + 7 + i * 2, 6, 1, '#6a6458');
      c.strokeStyle = '#0a0a10'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x + 10, y + 12); c.quadraticCurveTo(x + 13, y + 6, x + 15, y + 3); c.stroke();
    } else if (kind === 'rubble') {
      ell(c, x + 8, y + 14, 9, 2.5, 'rgba(0,0,0,.45)');
      R(c, x + 1, y + 7, 7, 7, '#4a443a'); R(c, x + 7, y + 4, 8, 10, '#5a5244'); R(c, x + 4, y + 2, 6, 6, '#6a6252'); R(c, x + 7, y + 4, 8, 1, '#7a7262');
      R(c, x + 2, y + 13, 3, 1, '#2a241c'); R(c, x + 11, y + 12, 3, 2, '#2a241c');
    } else ART.drawSprite(c, kind, px, py, t);
  }
  return { T, WALK, WALL, FLOOR, renderMap, drawAnim, drawSprite };
})();

/* ---------------- タイトル背景：逆さの世界樹 ---------------- */
const ATITLE = (() => {
  const SW = 384, SH = 216;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const motes = Array.from({ length: 60 }, () => ({ x: rnd(0, SW), y: rnd(0, SH), v: rnd(0.004, 0.012), p: rnd(0, 6) }));
  const roots = Array.from({ length: 14 }, (_, i) => ({ x: 120 + i * 11 + rnd(-6, 6), len: rnd(60, 150), sw: rnd(-40, 40) }));
  return {
    update(dt) { for (const m of motes) { m.y -= m.v * dt; if (m.y < -4) { m.y = SH + 4; m.x = rnd(0, SW); } } },
    render(c) {
      c.setTransform(RS, 0, 0, RS, 0, 0);
      const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#060a08'); g.addColorStop(1, '#020304');
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
      const sc = VW < 384 ? VW / 300 : 1, sox = (VW - SW * sc) / 2, soy = VH < 300 ? 0 : VH * 0.6 - 120 * sc;
      c.setTransform(RS * sc, 0, 0, RS * sc, sox * RS, soy * RS);
      // 天井から逆さに生える大樹
      c.fillStyle = '#0c0a06'; c.fillRect(0, 0, SW, 22);
      c.strokeStyle = '#1e160c'; c.lineCap = 'round';
      c.lineWidth = 26; c.beginPath(); c.moveTo(192, 0); c.lineTo(192, 70); c.stroke();
      for (const r of roots) { c.lineWidth = 3; c.beginPath(); c.moveTo(192, 40); c.quadraticCurveTo(r.x, r.len * 0.6, r.x + r.sw, r.len); c.stroke(); }
      const pulse = 0.5 + Math.sin(W.t * 0.003) * 0.3;
      const cg = c.createRadialGradient(192, 92, 2, 192, 92, 40); cg.addColorStop(0, `rgba(140,255,150,${pulse})`); cg.addColorStop(1, 'rgba(140,255,150,0)');
      c.fillStyle = cg; c.beginPath(); c.arc(192, 92, 40, 0, 7); c.fill();
      c.fillStyle = '#d8ffd8'; c.beginPath(); c.arc(192, 92, 4, 0, 7); c.fill();
      for (const m of motes) { c.fillStyle = `rgba(140,255,150,${0.3 + Math.sin(W.t * 0.003 + m.p) * 0.25})`; c.fillRect(m.x, m.y, 1, 1); }
      // 機械兵のシルエット
      c.fillStyle = '#020303';
      [[40, 170], [80, 176], [300, 172], [340, 168]].forEach(([mx, my]) => { c.fillRect(mx - 4, my - 22, 8, 22); c.beginPath(); c.arc(mx, my - 26, 5, 0, 7); c.fill(); c.fillStyle = '#ff3a3a'; c.fillRect(mx - 3, my - 27, 6, 1.5); c.fillStyle = '#020303'; });
      c.fillRect(0, SH - 18, SW, 18);
      c.setTransform(RS, 0, 0, RS, 0, 0);
    },
  };
})();

/* ---------------- 一枚絵（SVG） ---------------- */
Object.assign(SCENES, {
  workshop: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect width="1600" height="900" fill="#1a140e"/>
    <rect x="0" y="0" width="1600" height="560" fill="#241a10"/>
    ${Array.from({ length: 7 }, (_, i) => `<circle cx="${180 + i * 210}" cy="${200 + (i % 2) * 60}" r="${60 + (i % 3) * 18}" fill="none" stroke="#5a4428" stroke-width="16" stroke-dasharray="14 10"/>`).join('')}
    <rect x="200" y="560" width="1200" height="40" fill="#3a2a18"/><rect x="230" y="600" width="24" height="300" fill="#2a1e10"/><rect x="1346" y="600" width="24" height="300" fill="#2a1e10"/>
    <g fill="#c9a45c"><rect x="420" y="520" width="80" height="40" rx="6"/><rect x="600" y="500" width="22" height="60"/><circle cx="820" cy="530" r="26"/><rect x="980" y="520" width="90" height="36" rx="8"/></g>
    <circle cx="1180" cy="520" r="40" fill="#f4ecd4" opacity=".9"/><path d="M1150 500 L1210 500 L1210 540 L1150 540 Z" fill="none" stroke="#c9a45c" stroke-width="4"/>
    <circle cx="800" cy="120" r="200" fill="rgba(255,200,120,.12)"/>
  </svg>`,
  yggdrasil: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><radialGradient id="syCore" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#eaffea"/><stop offset=".3" stop-color="#8aff9a"/><stop offset="1" stop-color="#8aff9a" stop-opacity="0"/></radialGradient>
      <linearGradient id="syBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0e08"/><stop offset="1" stop-color="#010201"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#syBg)"/>
    <rect x="0" y="0" width="1600" height="90" fill="#0e0c08"/>
    <path d="M700 0 L900 0 L860 260 C840 340 820 420 800 470 C780 420 760 340 740 260 Z" fill="#1e160c"/>
    <g stroke="#1e160c" stroke-linecap="round" fill="none">
      ${Array.from({ length: 16 }, (_, i) => { const x = 140 + i * 88; return `<path d="M800 ${180 + (i % 4) * 40} C${(800 + x) / 2} ${300 + (i % 3) * 60} ${x} ${420 + (i % 5) * 50} ${x + (i % 2 ? 40 : -40)} ${640 + (i % 4) * 50}" stroke-width="${10 + (i % 3) * 4}"/>`; }).join('')}
    </g>
    <circle cx="800" cy="520" r="200" fill="url(#syCore)" opacity=".7"/>
    <circle cx="800" cy="520" r="28" fill="#f0fff0"/>
    <rect x="0" y="780" width="1600" height="120" fill="#030403"/>
  </svg>`,
  collapse: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect width="1600" height="900" fill="#0a0806"/>
    ${Array.from({ length: 30 }, (_, i) => `<rect class="sc-rain" x="${(i * 211) % 1600}" y="${(i * 97) % 700}" width="${30 + (i % 4) * 20}" height="${20 + (i % 3) * 16}" fill="#2a241c" transform="rotate(${(i * 37) % 60 - 30} ${(i * 211) % 1600} ${(i * 97) % 700})"/>`).join('')}
    <circle cx="800" cy="450" r="400" fill="rgba(255,120,60,.12)"/>
  </svg>`,
  snowfield: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="ssSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2a44"/><stop offset=".6" stop-color="#6a84a4"/><stop offset="1" stop-color="#c8d6e4"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#ssSky)"/>
    <g opacity=".45" stroke="#9affd8" stroke-width="5" fill="none"><path d="M0 120 C400 70 800 170 1600 90"/></g>
    <path d="M0 400 L300 300 L520 360 L760 280 L1000 360 L1260 310 L1600 400 L1600 900 L0 900 Z" fill="#e8eef6"/>
    <path d="M1100 340 L1180 300 L1260 340 Z" fill="#3a3a44" opacity=".5"/>
    <g transform="translate(0 -200)">
      <ellipse cx="760" cy="790" rx="230" ry="26" fill="#c8d4e2"/>
      <g fill="#0a0c12"><path d="M600 770 C640 735 720 728 780 742 L840 770 Z"/><circle cx="860" cy="750" r="22"/></g>
      <path d="M840 752 C900 760 940 790 960 800" stroke="#f4f6fb" stroke-width="16" fill="none" stroke-linecap="round"/>
      <g fill="#14161e"><path d="M560 790 C560 720 600 670 640 660 L660 790 Z"/><circle cx="636" cy="640" r="24"/><path d="M640 690 C700 700 760 730 800 750" stroke="#14161e" stroke-width="16" fill="none" stroke-linecap="round"/></g>
    </g>
    <g fill="#ffffff" class="sc-rain">${Array.from({ length: 80 }, (_, i) => `<circle cx="${(i * 137) % 1600}" cy="${(i * 71) % 900}" r="${2 + (i % 3)}"/>`).join('')}</g>
  </svg>`,
  hospital: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect width="1600" height="900" fill="#dfe6ea"/>
    <rect x="900" y="120" width="460" height="380" fill="#bcd4e6"/><path d="M1130 120 L1130 500 M900 310 L1360 310" stroke="#eef2f4" stroke-width="14"/>
    <rect x="200" y="560" width="900" height="120" fill="#f4f6f8"/><rect x="200" y="540" width="200" height="60" rx="20" fill="#ffffff"/>
    <rect x="200" y="680" width="900" height="40" fill="#a8b4bc"/>
    <rect x="1220" y="520" width="12" height="260" fill="#a8b4bc"/><rect x="1180" y="500" width="90" height="60" rx="8" fill="#e8f0f4" stroke="#a8b4bc" stroke-width="4"/>
    <rect x="0" y="780" width="1600" height="120" fill="#c8d0d6"/>
  </svg>`,
});

/* ---------------- 戦闘：エクシード ---------------- */
const EXCEED_SVG = `<svg viewBox="0 0 260 240" class="en-svg"><defs><radialGradient id="exg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8aff9a" stop-opacity=".4"/><stop offset="1" stop-color="#8aff9a" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="130" cy="120" rx="128" ry="116" fill="url(#exg)"/>
  <g class="tent tl" stroke="#2a1e10" stroke-width="12" fill="none" stroke-linecap="round"><path d="M100 60 C70 20 40 30 14 6"/><path d="M96 120 C50 110 30 150 6 160"/></g>
  <g class="tent tr" stroke="#2a1e10" stroke-width="12" fill="none" stroke-linecap="round"><path d="M160 60 C190 20 220 30 246 6"/><path d="M164 120 C210 110 230 150 254 160"/></g>
  <path d="M70 240 C76 180 100 150 130 148 C160 150 184 180 190 240 Z" fill="#1a1e24"/>
  <g stroke="#4a5058" stroke-width="3"><path d="M96 170 L164 170 M100 190 L160 190 M104 210 L156 210"/></g>
  <path d="M96 92 C96 56 164 56 164 92 C164 126 152 144 130 148 C108 144 96 126 96 92 Z" fill="#3a3e46"/>
  <path d="M104 92 L156 92 L150 100 L110 100 Z" fill="#8aff9a" class="blink"/>
  <path d="M130 30 L138 54 L122 54 Z" fill="#2a1e10"/><path d="M110 40 L118 60 L104 58 Z" fill="#2a1e10"/><path d="M150 40 L156 58 L142 60 Z" fill="#2a1e10"/>
  <circle cx="130" cy="176" r="10" fill="#8aff9a" opacity=".7"/>
  <g class="wave" fill="none" stroke="#8aff9a" stroke-width="1.5" opacity=".5"><circle cx="130" cy="110" r="70"/><circle cx="130" cy="110" r="90"/></g>
</svg>`;
