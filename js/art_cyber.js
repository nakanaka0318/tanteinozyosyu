'use strict';
/* =========================================================
   CYART : 電脳展編のタイル・家具・スプライト・タイトル
   map.theme = 'cyber'（美術館） / 'grid'（電脳空間）
   ========================================================= */
const CYART = (() => {
  const T = 16;
  const WALK = new Set(['.', ',', '=', '_', ':', 'D', 'k', 'g', 'G']);
  const WALL = new Set(['#', 'N', 'Z', 'W', 'E']);
  const FLOOR = new Set(['.', ',', '=', '_', ':', 'k']);
  const hsh = ART.hsh;
  const at = ART.at;
  const isWall = ch => WALL.has(ch);
  function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function circ(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
  function ell(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
  const NEON = { cyan: '#3ff0ff', pink: '#ff4fd8', violet: '#a86bff', green: '#5dff9a', gold: '#ffc94a', white: '#e8f4ff', red: '#ff4a5a', blue: '#4a8cff' };
  const rgb = hex => { const n = parseInt(hex.slice(1), 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; };

  function floorOf(g, x, y) {
    for (let d = 1; d < 8; d++) for (const [xx, yy] of [[x - d, y], [x + d, y], [x, y + d], [x, y - d]]) { const ch = g[yy] && g[yy][xx]; if (ch && FLOOR.has(ch)) return ch; }
    return '.';
  }

  /* ---------------- floors ---------------- */
  function floor(c, ch, x, y, tx, ty, g, grid, neon) {
    if (grid) {
      R(c, x, y, T, T, '#03050b');
      c.fillStyle = 'rgba(63,240,255,.22)'; c.fillRect(x, y, T, 1); c.fillRect(x, y, 1, T);
      c.fillStyle = 'rgba(63,240,255,.07)'; c.fillRect(x + 8, y, 1, T); c.fillRect(x, y + 8, T, 1);
      if (hsh(tx, ty, 4) > 0.82) R(c, x + 3 + ((hsh(tx, ty) * 9) | 0), y + 4 + ((hsh(tx, ty, 2) * 8) | 0), 1, 1, 'rgba(63,240,255,.6)');
      if (ch === '=') { R(c, x, y + 6, T, 4, 'rgba(63,240,255,.10)'); R(c, x, y + 7, T, 1, 'rgba(63,240,255,.35)'); }
      return;
    }
    if (ch === '.') {
      R(c, x, y, T, T, '#10121c');
      R(c, x, y, T, 1, '#181c2a'); R(c, x, y, 1, T, '#181c2a'); R(c, x + 8, y + 8, 8, 8, '#0e1019');
      if (hsh(tx, ty) > 0.7) R(c, x + 2, y + 3, 5, 1, 'rgba(120,160,255,.08)');
    } else if (ch === ',') {
      R(c, x, y, T, T, '#1a0f2c');
      R(c, x + 7, y + 7, 2, 2, 'rgba(255,79,216,.35)'); R(c, x + 3, y + 3, 1, 1, 'rgba(255,79,216,.2)'); R(c, x + 12, y + 12, 1, 1, 'rgba(255,79,216,.2)');
      const e = 'rgba(255,79,216,.75)';
      if (at(g, tx, ty - 1) !== ',') R(c, x, y + 1, T, 1, e);
      if (at(g, tx, ty + 1) !== ',') R(c, x, y + 14, T, 1, e);
      if (at(g, tx - 1, ty) !== ',') R(c, x + 1, y, 1, T, e);
      if (at(g, tx + 1, ty) !== ',') R(c, x + 14, y, 1, T, e);
    } else if (ch === '=') {
      R(c, x, y, T, T, '#0b0d16');
      R(c, x, y, T, 1, '#141a2a');
      if (at(g, tx, ty - 1) !== '=') R(c, x, y + 1, T, 1, `rgba(${rgb(neon)},.45)`);
      if (at(g, tx, ty + 1) !== '=') R(c, x, y + 14, T, 1, `rgba(${rgb(neon)},.45)`);
    } else if (ch === '_') {
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { R(c, x + i * 8, y + j * 8, 8, 8, (i + j + tx + ty) % 2 ? '#262c3e' : '#2e3549'); R(c, x + i * 8, y + j * 8, 8, 1, 'rgba(255,255,255,.05)'); }
      if (hsh(tx, ty, 3) > 0.6) R(c, x + 4, y + 2, 1, 10, 'rgba(160,200,255,.06)');
    } else if (ch === ':') {
      R(c, x, y, T, T, '#151922');
      for (let i = 0; i < T; i += 2) R(c, x, y + i, T, 1, '#0c0e14');
      R(c, x, y, 1, T, '#1f2430');
    } else if (ch === 'k') {
      R(c, x, y, T, T, '#181226');
      for (let i = 0; i < T; i += 4) R(c, x + i, y, 1, T, '#1e1830');
      if (at(g, tx, ty + 1) !== 'k') { R(c, x, y + 13, T, 3, '#0e0a16'); R(c, x, y + 13, T, 1, NEON.gold); }
    }
  }

  /* ---------------- walls ---------------- */
  function wallFace(c, x, y, neon, tx, grid) {
    if (grid) {
      R(c, x, y, T, T, '#060a16');
      R(c, x + 1, y + 1, 14, 14, '#08101e'); c.fillStyle = 'rgba(63,240,255,.5)'; c.fillRect(x, y + 15, T, 1);
      c.fillStyle = 'rgba(63,240,255,.18)';
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if (hsh(tx, i, j) > 0.5) c.fillRect(x + 2 + i * 3, y + 3 + j * 4, 2, 1);
      return;
    }
    R(c, x, y, T, T, '#121624');
    R(c, x + (tx % 2 ? 0 : 8), y + 2, 1, 11, '#1b2134');
    R(c, x, y, T, 2, '#262e44'); R(c, x, y + 2, T, 1, '#0a0c14');
    R(c, x, y + 13, T, 3, '#0a0c14'); R(c, x, y + 13, T, 1, neon);
    if (tx % 3 === 0) R(c, x + 3, y + 6, 1, 1, NEON.green);
  }
  function wallTop(c, x, y, tx, ty, g, grid) {
    R(c, x, y, T, T, grid ? '#03050b' : '#06070c');
    const e = grid ? 'rgba(63,240,255,.35)' : '#1a2034';
    if (!isWall(at(g, tx - 1, ty))) R(c, x, y, 1, T, e);
    if (!isWall(at(g, tx + 1, ty))) R(c, x + 15, y, 1, T, e);
    if (!isWall(at(g, tx, ty - 1)) && g[ty - 1]) R(c, x, y, T, 1, e);
  }

  /* ---------------- furniture ---------------- */
  function rack(c, x, y) {
    R(c, x + 1, y - 10, 14, 26, '#0a0c12'); R(c, x + 1, y - 10, 14, 1, '#2a3248');
    R(c, x + 2, y - 8, 12, 22, '#11141e');
    for (let i = 0; i < 6; i++) R(c, x + 2, y - 8 + i * 4, 12, 1, '#1c2232');
    R(c, x + 1, y + 15, 14, 1, '#000');
  }
  function holoBase(c, x, y) { ell(c, x + 8, y + 12, 6, 3, '#1a2234'); ell(c, x + 8, y + 11, 5, 2, '#2a3a54'); ell(c, x + 8, y + 11, 4, 1.4, 'rgba(63,240,255,.8)'); }
  function consoleDesk(c, x, y, tx, ty, g) {
    const left = at(g, tx + 1, ty) === 'M', right = at(g, tx - 1, ty) === 'M';
    R(c, x, y + 4, T, 10, '#1a1e2a'); R(c, x, y + 4, T, 1, '#3a4258'); R(c, x, y + 13, T, 3, '#0c0e16');
    R(c, x + (right ? 0 : 2), y - 6, right && left ? 16 : 14, 9, '#0c0f18');
    R(c, x + (right ? 0 : 3), y - 5, right && left ? 16 : 12, 7, '#06222e');
    R(c, x + 4, y + 7, 8, 2, '#2a3044');
  }
  function counter(c, x, y, tx, ty, g) {
    R(c, x, y - 1, T, 15, '#262c3e'); R(c, x, y - 2, T, 4, '#d0d6e2'); R(c, x, y + 1, T, 1, NEON.cyan);
    R(c, x, y + 14, T, 2, '#0c0e16');
  }
  function sofa(c, x, y, tx, ty, g) {
    const lf = at(g, tx - 1, ty) === 'S', rt = at(g, tx + 1, ty) === 'S';
    R(c, x, y - 1, T, 7, '#24163a'); R(c, x, y + 6, T, 8, '#33204e'); R(c, x, y + 6, T, 1, NEON.pink);
    R(c, x, y + 14, T, 2, '#0e0818');
    if (!lf) R(c, x, y, 3, 14, '#2a1a44'); if (!rt) R(c, x + 13, y, 3, 14, '#2a1a44');
  }
  function roundTable(c, x, y) { R(c, x + 7, y + 8, 2, 7, '#3a4258'); ell(c, x + 8, y + 7, 6, 3.5, '#c8d0e0'); ell(c, x + 8, y + 7, 6, 3.5, 'rgba(63,240,255,.15)'); R(c, x + 6, y + 5, 2, 2, NEON.pink); }
  function plant(c, x, y, tx, ty) {
    R(c, x + 4, y + 9, 8, 6, '#d8dee8'); R(c, x + 4, y + 9, 8, 1, NEON.cyan);
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.42, len = 6 + hsh(tx, ty, i) * 5;
      c.strokeStyle = i % 2 ? '#0e3a40' : '#145058'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 8, y + 9); c.lineTo(x + 8 + Math.cos(a) * len, y + 9 + Math.sin(a) * len); c.stroke();
      R(c, x + 8 + Math.cos(a) * len, y + 9 + Math.sin(a) * len, 1, 1, NEON.cyan);
    }
  }
  function pillar(c, x, y, col) { ell(c, x + 8, y + 14, 4, 1.5, '#000'); R(c, x + 6, y - 10, 4, 24, '#1a1e2a'); R(c, x + 7, y - 9, 2, 22, col); R(c, x + 5, y - 11, 6, 2, '#2a3044'); }
  function caseBox(c, x, y, tx) {
    R(c, x + 2, y + 6, 12, 9, '#1a1e2a'); R(c, x + 2, y + 6, 12, 1, '#3a4258');
    R(c, x + 3, y - 4, 10, 10, 'rgba(120,200,255,.12)'); c.strokeStyle = 'rgba(160,220,255,.5)'; c.lineWidth = 0.6; c.strokeRect(x + 3.5, y - 3.5, 9, 10);
    R(c, x + 6, y + 1, 4, 3, tx % 2 ? NEON.gold : NEON.cyan); R(c, x + 7, y + 2, 2, 1, '#fff');
  }
  function robot(c, x, y) {
    ell(c, x + 8, y + 14, 5, 1.5, '#000'); R(c, x + 4, y + 13, 8, 2, '#2a3044');
    R(c, x + 5, y + 4, 6, 9, '#c8ced8'); R(c, x + 5, y + 4, 2, 9, '#e8ecf2'); R(c, x + 3, y + 5, 2, 6, '#9aa2b0'); R(c, x + 11, y + 5, 2, 6, '#9aa2b0');
    R(c, x + 5, y - 3, 6, 6, '#d8dde6'); R(c, x + 6, y - 1, 4, 1, NEON.cyan); R(c, x + 7, y - 5, 2, 2, '#9aa2b0');
    R(c, x + 7, y + 7, 2, 2, NEON.cyan);
  }
  function vending(c, x, y) { R(c, x + 1, y - 10, 14, 26, '#1a1a2a'); R(c, x + 2, y - 8, 12, 12, '#bfe6ff'); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R(c, x + 3 + i * 4, y - 7 + j * 4, 2, 3, ['#ff4fd8', '#3ff0ff', '#ffc94a'][(i + j) % 3]); R(c, x + 3, y + 7, 10, 3, '#0a0a14'); R(c, x + 1, y + 15, 14, 1, '#000'); }
  function pod(c, x, y) {
    ell(c, x + 8, y + 14, 7, 2, '#000');
    R(c, x + 2, y - 6, 12, 20, '#d0d6e2'); R(c, x + 2, y - 6, 12, 1, '#ffffff'); R(c, x + 2, y + 12, 12, 2, '#9aa2b0');
    ell(c, x + 8, y + 1, 5, 6, '#0a2030'); R(c, x + 2, y + 9, 12, 1, NEON.cyan);
  }
  function bigScreen(c, x, y, tx, ty, g) {
    R(c, x, y - 10, T, 22, '#08090e'); R(c, x, y - 10, T, 1, '#2a3248');
    R(c, x + (at(g, tx - 1, ty) === 'X' ? 0 : 1), y - 8, T - (at(g, tx + 1, ty) === 'X' ? 0 : 1) - (at(g, tx - 1, ty) === 'X' ? 0 : 1), 17, '#0a1024');
    R(c, x, y + 12, T, 4, '#0c0e16');
  }
  function shelf(c, x, y, tx) { R(c, x + 1, y - 8, 14, 24, '#141824'); for (let i = 0; i < 4; i++) { R(c, x + 2, y - 6 + i * 5, 12, 1, '#2a3248'); for (let k = 0; k < 3; k++) if (hsh(tx, i, k) > 0.3) R(c, x + 3 + k * 4, y - 9 + i * 5, 3, 3, hsh(tx, k, i) > 0.5 ? 'rgba(63,240,255,.6)' : 'rgba(168,107,255,.6)'); } }
  function whiteTable(c, x, y, tx, ty, g) { const dn = at(g, tx, ty + 1) === 'T'; R(c, x, y + 1, T, 12, '#cfd5e2'); R(c, x, y + 1, T, 1, '#ffffff'); if (!dn) { R(c, x, y + 12, T, 3, '#8a92a4'); R(c, x, y + 13, T, 1, NEON.cyan); } }
  function chair(c, x, y) { R(c, x + 4, y + 3, 8, 9, '#d8dde6'); R(c, x + 4, y - 1, 8, 5, '#b8c0cc'); R(c, x + 4, y + 12, 2, 3, '#555'); R(c, x + 10, y + 12, 2, 3, '#555'); }
  function core(c, x, y, tx, ty, g) { const left = at(g, tx + 1, ty) === 'X'; R(c, x, y + 10, T, 6, '#0a1424'); R(c, x, y + 10, T, 1, NEON.cyan); if (left) { ell(c, x + 16, y + 13, 14, 3, 'rgba(63,240,255,.25)'); } }
  function gridPillar(c, x, y) { ell(c, x + 8, y + 14, 5, 2, 'rgba(63,240,255,.25)'); R(c, x + 5, y - 10, 6, 24, 'rgba(63,240,255,.12)'); R(c, x + 7, y - 10, 2, 24, 'rgba(63,240,255,.55)'); R(c, x + 4, y - 12, 8, 2, 'rgba(63,240,255,.8)'); }

  /* ---------------- render ---------------- */
  function renderMap(map, RS) {
    const g = map.grid, W = map.w, H = map.h, grid = map.theme === 'grid';
    const cv = document.createElement('canvas'); cv.width = W * T * RS; cv.height = H * T * RS;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.scale(RS, RS);
    const lights = [], anims = [];
    const neonAt = (tx, ty) => { for (const r of map.rooms) if (tx >= r.x1 - 1 && tx <= r.x2 + 1 && ty >= r.y1 - 1 && ty <= r.y2 + 1) return NEON[r.neon || 'cyan']; return NEON.cyan; };
    const L = (x, y, r, col, a, flick) => lights.push({ x, y, r, col: rgb(col), a, flick });
    for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
      const ch = at(g, tx, ty), x = tx * T, y = ty * T;
      const neon = neonAt(tx, ty);
      if (isWall(ch)) {
        const face = ty + 1 < H && !isWall(at(g, tx, ty + 1));
        if (face || ch !== '#') wallFace(c, x, y, neon, tx, grid); else wallTop(c, x, y, tx, ty, g, grid);
        if (ch === 'N') { R(c, x + 2, y + 3, 12, 8, '#0a0a12'); anims.push({ type: 'neon', tx, ty, col: tx % 2 ? NEON.pink : NEON.cyan }); L(x + 8, y + 12, 34, tx % 2 ? NEON.pink : NEON.cyan, 0.2, true); }
        else if (ch === 'Z') { R(c, x + 1, y + 2, 14, 10, '#05060a'); anims.push({ type: 'screen', tx, ty }); L(x + 8, y + 12, 30, NEON.blue, 0.15); }
        else if (ch === 'W') { R(c, x, y + 1, T, 12, 'rgba(40,120,180,.25)'); R(c, x + 3, y + 2, 1, 10, 'rgba(200,240,255,.2)'); }
        else if (ch === 'E') { R(c, x, y, T, T, '#1a1a1e'); for (let i = -16; i < 16; i += 6) { c.fillStyle = '#c9a43a'; c.beginPath(); c.moveTo(x + i, y + 16); c.lineTo(x + i + 3, y + 16); c.lineTo(x + i + 19, y); c.lineTo(x + i + 16, y); c.fill(); } R(c, x, y, T, 2, '#000'); }
        continue;
      }
      let fl = ch;
      if (!FLOOR.has(ch)) fl = ch === 'D' || ch === 'g' || ch === 'G' ? (FLOOR.has(at(g, tx, ty + 1)) ? at(g, tx, ty + 1) : FLOOR.has(at(g, tx, ty - 1)) ? at(g, tx, ty - 1) : floorOf(g, tx, ty)) : floorOf(g, tx, ty);
      floor(c, fl, x, y, tx, ty, g, grid, neon);
      if (FLOOR.has(ch) && ch === '=' && grid) anims.push({ type: 'flow', tx, ty });
      switch (ch) {
        case 'D': {
          const vert = isWall(at(g, tx, ty - 1)) && isWall(at(g, tx, ty + 1));
          if (vert) { R(c, x, y, T, 2, '#1a2034'); R(c, x, y + 14, T, 2, '#1a2034'); R(c, x, y + 1, T, 1, neon); R(c, x, y + 14, T, 1, neon); }
          else { R(c, x, y, 2, T, '#1a2034'); R(c, x + 14, y, 2, T, '#1a2034'); R(c, x + 1, y, 1, T, neon); R(c, x + 14, y, 1, T, neon); R(c, x + 2, y, 12, 3, 'rgba(0,0,0,.5)'); }
          break;
        }
        case 'g': R(c, x + 1, y + 2, 3, 13, '#2a3044'); R(c, x + 12, y + 2, 3, 13, '#2a3044'); R(c, x + 2, y + 3, 1, 10, NEON.green); R(c, x + 13, y + 3, 1, 10, NEON.green); break;
        case 'G': anims.push({ type: 'portal', tx, ty }); L(x + 8, y + 8, 50, NEON.cyan, 0.3, true); break;
        case 'R': rack(c, x, y); anims.push({ type: 'leds', tx, ty }); break;
        case 'H': holoBase(c, x, y); anims.push({ type: 'holo', tx, ty }); L(x + 8, y + 2, 40, NEON.cyan, 0.2, true); break;
        case 'M': consoleDesk(c, x, y, tx, ty, g); anims.push({ type: 'term', tx, ty }); L(x + 8, y - 2, 28, NEON.cyan, 0.12); break;
        case 'C': counter(c, x, y, tx, ty, g); break;
        case 'S': sofa(c, x, y, tx, ty, g); break;
        case 't': roundTable(c, x, y); L(x + 8, y + 6, 26, NEON.pink, 0.14); break;
        case 'P': if (grid) { gridPillar(c, x, y); L(x + 8, y, 36, NEON.cyan, 0.15); } else plant(c, x, y, tx, ty); break;
        case 'L': pillar(c, x, y, tx % 2 ? NEON.pink : NEON.cyan); L(x + 8, y, 58, tx % 2 ? NEON.pink : NEON.cyan, 0.24, true); break;
        case 'J': caseBox(c, x, y, tx); L(x + 8, y + 2, 24, NEON.gold, 0.15); break;
        case 'Y': robot(c, x, y); break;
        case 'V': vending(c, x, y); L(x + 8, y - 2, 40, NEON.white, 0.18); break;
        case 'Q': pod(c, x, y); anims.push({ type: 'pod', tx, ty }); L(x + 8, y + 2, 34, NEON.cyan, 0.18, true); break;
        case 'X': if (grid) { core(c, x, y, tx, ty, g); if (at(g, tx + 1, ty) === 'X') { anims.push({ type: 'core', tx, ty }); L(x + 16, y + 2, 90, NEON.cyan, 0.32, true); } } else { bigScreen(c, x, y, tx, ty, g); anims.push({ type: 'stage', tx, ty }); L(x + 8, y, 40, NEON.violet, 0.16); } break;
        case 'B': shelf(c, x, y, tx); break;
        case 'T': whiteTable(c, x, y, tx, ty, g); break;
        case 'h': chair(c, x, y); break;
      }
    }
    if (map.extraLights) map.extraLights.forEach(l => L(l.x * T + 8, l.y * T + 8, l.r, NEON[l.col] || l.col, l.a || 0.2, l.flick));
    return { canvas: cv, lights, anims };
  }

  /* ---------------- animation ---------------- */
  function drawAnim(c, a, t) {
    const x = a.tx * T, y = a.ty * T;
    switch (a.type) {
      case 'neon': {
        const on = Math.sin(t * 0.02 + a.tx) > -0.92;
        c.fillStyle = on ? a.col : 'rgba(80,80,90,.6)';
        c.fillRect(x + 3, y + 5, 2, 4); c.fillRect(x + 5, y + 5, 3, 1); c.fillRect(x + 9, y + 4, 1, 6); c.fillRect(x + 11, y + 6, 2, 1); c.fillRect(x + 12, y + 5, 1, 4);
        if (on) { c.globalAlpha = 0.25; c.fillStyle = a.col; c.fillRect(x + 2, y + 3, 12, 8); c.globalAlpha = 1; }
        break;
      }
      case 'screen': {
        R(c, x + 1, y + 2, 14, 10, '#06101e');
        for (let i = 0; i < 4; i++) { const w = 4 + ((Math.sin(t * 0.003 + i + a.tx) + 1) * 4) | 0; R(c, x + 2, y + 3 + i * 2, w, 1, i % 2 ? '#3ff0ff' : '#a86bff'); }
        break;
      }
      case 'leds': for (let i = 0; i < 6; i++) for (let k = 0; k < 3; k++) { const on = Math.sin(t * 0.01 * (k + 1) + i * 1.7 + a.tx * 3) > 0.2; R(c, x + 3 + k * 2, y - 7 + i * 4, 1, 1, on ? (k === 2 ? '#ff4a5a' : '#5dff9a') : '#1a2a20'); } break;
      case 'holo': {
        const b = Math.sin(t * 0.004 + a.tx) * 1.5;
        c.fillStyle = 'rgba(63,240,255,.12)'; c.beginPath(); c.moveTo(x + 4, y + 11); c.lineTo(x + 12, y + 11); c.lineTo(x + 14, y - 8); c.lineTo(x + 2, y - 8); c.fill();
        c.strokeStyle = 'rgba(63,240,255,.85)'; c.lineWidth = 0.8;
        const r = 4, cx = x + 8, cy = y - 2 + b, ang = t * 0.002 + a.tx;
        c.beginPath(); for (let i = 0; i <= 6; i++) { const q = ang + i * Math.PI / 3; const px = cx + Math.cos(q) * r, py = cy + Math.sin(q) * r * 0.6; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
        c.beginPath(); c.moveTo(cx, cy - 5); c.lineTo(cx, cy + 4); c.stroke();
        break;
      }
      case 'term': for (let i = 0; i < 3; i++) R(c, x + 4, y - 4 + i * 2, 3 + ((Math.sin(t * 0.005 + i * 2 + a.tx) + 1) * 3 | 0), 1, 'rgba(63,240,255,.8)'); break;
      case 'pod': { const g = 0.4 + Math.sin(t * 0.004 + a.tx) * 0.3; c.globalAlpha = g; ell(c, x + 8, y + 1, 4, 5, '#3ff0ff'); c.globalAlpha = 1; break; }
      case 'stage': { const h = (Math.sin(t * 0.003 + a.tx * 0.7) + 1) * 6; R(c, x + 1, y + 8 - h, 14, h + 1, 'rgba(168,107,255,.35)'); R(c, x + 1, y - 6 + ((t * 0.02 + a.tx * 3) % 14), 14, 1, 'rgba(63,240,255,.5)'); break; }
      case 'flow': { const p = ((t * 0.03 + a.tx * 4) % 16); R(c, x + p, y + 7, 3, 1, 'rgba(160,250,255,.9)'); break; }
      case 'portal': {
        for (let i = 0; i < 3; i++) { c.strokeStyle = `rgba(63,240,255,${0.7 - i * 0.2})`; c.lineWidth = 1; c.beginPath(); c.ellipse(x + 8, y + 9, 6 - i + Math.sin(t * 0.005 + i) * 1, 3 - i * 0.5, 0, 0, 7); c.stroke(); }
        R(c, x + 7, y + 1 - ((t * 0.02) % 6), 2, 1, '#bff');
        break;
      }
      case 'core': {
        const b = Math.sin(t * 0.003) * 2, cx = x + 16, cy = y + 2 + b;
        c.fillStyle = 'rgba(63,240,255,.18)'; c.beginPath(); c.arc(cx, cy, 13, 0, 7); c.fill();
        c.fillStyle = '#9ffcff'; c.beginPath(); c.moveTo(cx, cy - 12); c.lineTo(cx + 7, cy); c.lineTo(cx, cy + 10); c.lineTo(cx - 7, cy); c.fill();
        c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(cx, cy - 7); c.lineTo(cx + 3, cy); c.lineTo(cx, cy + 5); c.lineTo(cx - 3, cy); c.fill();
        c.strokeStyle = 'rgba(63,240,255,.6)'; c.lineWidth = 0.7; c.beginPath(); c.ellipse(cx, cy, 12, 4, t * 0.001, 0, 7); c.stroke();
        break;
      }
    }
  }

  /* ---------------- sprites ---------------- */
  function drawSprite(c, kind, px, py, t) {
    const x = Math.round(px), y = Math.round(py);
    switch (kind) {
      case 'c_body': {
        ell(c, x + 10, y + 13, 12, 3, 'rgba(0,0,0,.4)');
        R(c, x + 4, y + 6, 13, 7, '#e8ecf2'); R(c, x + 4, y + 12, 13, 1, '#b8c0cc'); R(c, x + 8, y + 7, 2, 5, '#3a4a6a');
        R(c, x + 16, y + 7, 7, 2, '#2a2e3a'); R(c, x + 16, y + 10, 7, 2, '#2a2e3a'); R(c, x + 22, y + 7, 2, 5, '#111');
        R(c, x - 3, y + 6, 7, 7, '#c8b8b0'); R(c, x - 3, y + 6, 7, 3, '#2a2a32'); R(c, x - 1, y + 9, 3, 1, '#8aa0c8');
        R(c, x + 2, y + 13, 3, 1, '#c8b8b0');
        break;
      }
      case 'frost': {
        c.fillStyle = 'rgba(200,240,255,.35)'; c.beginPath(); c.ellipse(x + 8, y + 9, 8, 5, 0, 0, 7); c.fill();
        for (let i = 0; i < 6; i++) R(c, x + 2 + ((hsh(i, 3) * 12) | 0), y + 5 + ((hsh(i, 7) * 8) | 0), 2, 1, '#e8fbff');
        R(c, x + 6, y - 2, 4, 6, '#3a4258'); R(c, x + 5, y + 3, 6, 2, '#5a6278'); R(c, x + 7, y + 4, 2, 2, '#000');
        if (Math.sin(t * 0.004) > 0.5) R(c, x + 10, y + 7, 1, 1, '#fff');
        break;
      }
      case 'tablet': R(c, x + 4, y + 7, 9, 6, '#1a1e2a'); R(c, x + 5, y + 8, 7, 4, (Math.sin(t * 0.005) > 0 ? '#3ff0ff' : '#2ab0c8')); break;
      case 'drone': {
        const b = Math.sin(t * 0.006) * 1.5;
        ell(c, x + 8, y + 14, 4, 1.2, 'rgba(0,0,0,.35)');
        R(c, x + 4, y + 2 + b, 8, 4, '#2a2e3a'); R(c, x + 6, y + 3 + b, 4, 2, '#ff4fd8');
        R(c, x + 1, y + 1 + b, 4, 1, '#9aa2b0'); R(c, x + 11, y + 1 + b, 4, 1, '#9aa2b0');
        if (Math.sin(t * 0.01) > 0) R(c, x + 7, y + 6 + b, 2, 1, '#ff4a5a');
        break;
      }
      case 'node': case 'node_done': {
        const b = Math.sin(t * 0.004 + px) * 1.5, done = kind === 'node_done', col = done ? '120,140,160' : '63,240,255';
        ell(c, x + 8, y + 14, 5, 2, `rgba(${col},.25)`);
        c.fillStyle = `rgba(${col},${done ? 0.25 : 0.35})`; c.fillRect(x + 3, y - 2 + b, 10, 10);
        c.strokeStyle = `rgba(${col},.9)`; c.lineWidth = 0.8; c.strokeRect(x + 3.5, y - 1.5 + b, 9, 9);
        c.beginPath(); c.moveTo(x + 3.5, y - 1.5 + b); c.lineTo(x + 6, y - 4 + b); c.lineTo(x + 15, y - 4 + b); c.lineTo(x + 12.5, y - 1.5 + b); c.moveTo(x + 15, y - 4 + b); c.lineTo(x + 15, y + 5 + b); c.lineTo(x + 12.5, y + 7.5 + b); c.stroke();
        if (!done) R(c, x + 7, y + 2 + b, 2, 2, '#fff');
        break;
      }
      case 'patch': { const b = Math.sin(t * 0.006 + px) * 1; R(c, x + 5, y + 4 + b, 6, 6, '#5dff9a'); R(c, x + 7, y + 5 + b, 2, 4, '#fff'); R(c, x + 6, y + 6 + b, 4, 2, '#fff'); ell(c, x + 8, y + 13, 4, 1.5, 'rgba(93,255,154,.3)'); break; }
      case 'watcher': {
        const b = Math.sin(t * 0.005) * 2;
        ell(c, x + 8, y + 15, 6, 1.6, 'rgba(255,74,90,.3)');
        c.fillStyle = '#1a1e2a'; c.beginPath(); c.arc(x + 8, y + 2 + b, 7, 0, 7); c.fill();
        c.strokeStyle = '#ff4a5a'; c.lineWidth = 1; c.beginPath(); c.arc(x + 8, y + 2 + b, 7, 0, 7); c.stroke();
        circ(c, x + 8, y + 2 + b, 3, '#ff4a5a'); circ(c, x + 8, y + 2 + b, 1.2, '#fff');
        R(c, x - 1, y + 1 + b, 3, 1, '#9aa2b0'); R(c, x + 14, y + 1 + b, 3, 1, '#9aa2b0');
        break;
      }
      case 'kerberos': {
        const b = Math.sin(t * 0.004) * 1.5;
        ell(c, x + 8, y + 15, 12, 2.5, 'rgba(255,74,90,.35)');
        c.strokeStyle = '#ff4a5a'; c.lineWidth = 1;
        [[-6, -4], [8, -9], [22, -4]].forEach(([dx, dy], i) => {
          const hx = x + dx, hy = y + dy + b + (i === 1 ? 0 : 2);
          c.fillStyle = '#14080c'; c.beginPath(); c.moveTo(hx - 5, hy); c.lineTo(hx, hy - 6); c.lineTo(hx + 5, hy); c.lineTo(hx, hy + 5); c.closePath(); c.fill(); c.stroke();
          R(c, hx - 2, hy - 1, 1, 1, '#ffde5a'); R(c, hx + 1, hy - 1, 1, 1, '#ffde5a');
        });
        c.fillStyle = 'rgba(255,74,90,.25)'; c.fillRect(x - 6, y + 2 + b, 28, 10); c.strokeRect(x - 6, y + 2 + b, 28, 10);
        break;
      }
      case 'firewall': {
        for (let i = 0; i < 4; i++) { const a = 0.35 + Math.sin(t * 0.008 + i) * 0.2; c.fillStyle = `rgba(255,60,80,${a})`; c.fillRect(x, y + i * 4, T, 2); }
        c.strokeStyle = 'rgba(255,120,130,.9)'; c.lineWidth = 0.7;
        for (let i = 0; i < 3; i++) { c.beginPath(); const hx = x + 3 + i * 5, hy = y + 6; for (let k = 0; k <= 6; k++) { const q = k * Math.PI / 3; const px2 = hx + Math.cos(q) * 2.5, py2 = hy + Math.sin(q) * 2.5; k ? c.lineTo(px2, py2) : c.moveTo(px2, py2); } c.stroke(); }
        break;
      }
      default: ART.drawSprite(c, kind, px, py, t);
    }
  }

  /* ---------------- character looks ---------------- */
  Object.assign(ART.LOOKS, {
    mirai: { skin: '#f0cfb4', hair: '#15121c', coat: '#d6dbe6', coatD: '#a8b0c2', shirt: '#1a1c26', tie: '#3ff0ff', pants: '#1a1c26', shoes: '#0a0a10', style: 'bob', neon: '#3ff0ff', long: true },
    kurosu: { skin: '#e2b996', hair: '#1a2a2a', coat: '#262a34', coatD: '#1a1d26', shirt: '#3a3f4c', tie: '#5dff9a', pants: '#1c1e26', shoes: '#111111', style: 'hood', phones: '#5dff9a' },
    amagi: { skin: '#ddb18f', hair: '#a8a8b0', coat: '#2a2a30', coatD: '#1c1c22', shirt: '#e6e2d8', tie: '#c9a24a', pants: '#22222a', shoes: '#0c0c0c', style: 'slick', visor: '#ff5a5a' },
    noa: { skin: '#f6d2b8', hair: '#ff8ad8', coat: '#2a1838', coatD: '#1c1026', shirt: '#ffffff', tie: '#5ef0ff', pants: '#1c1026', shoes: '#ff5ab8', dress: true, style: 'twin', phones: '#5ef0ff' },
    muse: { skin: '#bff6ff', hair: '#7fe8ff', coat: '#3fc8e8', coatD: '#2a9ab8', shirt: '#e0fcff', tie: '#ffffff', pants: '#3fb8d8', shoes: '#99ffff', dress: true, style: 'long', holo: true },
    kirishima: { skin: '#e0b896', hair: '#2a2a32', coat: '#e8ecf2', coatD: '#b8c0cc', shirt: '#3a4a6a', tie: '#5a8aff', pants: '#2a2e3a', shoes: '#111111', long: true, glasses: true, style: 'side' },
    me_dive: { skin: '#cfe8ff', hair: '#2a5a8a', coat: '#1a3a5a', coatD: '#12283e', shirt: '#bff6ff', tie: '#3ff0ff', pants: '#12283e', shoes: '#3ff0ff', cap: '#1e4a70', style: 'short', neon: '#3ff0ff' },
    kujo_c: Object.assign({}, ART.LOOKS.kujo),
  });

  return { T, WALK, WALL, FLOOR, renderMap, drawAnim, drawSprite, NEON };
})();

/* =========================================================
   CYTITLE : ネオン都市のタイトル背景
   ========================================================= */
const CYTITLE = (() => {
  const SW = 384, SH = 216;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const towers = [];
  let x = -10;
  while (x < SW + 20) { const w = rnd(14, 34), h = rnd(50, 150); towers.push({ x, w, h, seed: Math.random() * 100, far: false }); x += w + rnd(2, 8); }
  const far = Array.from({ length: 30 }, (_, i) => ({ x: i * 14 - 10, w: rnd(10, 16), h: rnd(16, 52) }));
  const cars = Array.from({ length: 10 }, () => ({ x: rnd(0, SW), y: rnd(30, 120), v: rnd(0.02, 0.06) * (Math.random() < 0.5 ? -1 : 1), col: Math.random() < 0.5 ? '#ff4fd8' : '#3ff0ff' }));
  const drops = Array.from({ length: 140 }, () => ({ x: rnd(0, 400), y: rnd(0, 500), v: rnd(5, 8), l: rnd(4, 9) }));
  let glitch = 0, nextG = 3000;
  return {
    update(dt) {
      for (const c of cars) { c.x += c.v * dt; if (c.x > SW + 20) c.x = -20; if (c.x < -20) c.x = SW + 20; }
      for (const d of drops) { d.y += d.v * dt / 16; d.x -= d.v * 0.15 * dt / 16; if (d.y > VH) { d.y = -10; d.x = Math.random() * (VW + 40); } }
      nextG -= dt; if (nextG < 0) { nextG = rnd(2500, 6000); glitch = 1; }
      glitch = Math.max(0, glitch - dt / 260);
    },
    render(c) {
      c.setTransform(RS, 0, 0, RS, 0, 0);
      const g = c.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, '#05030e'); g.addColorStop(0.55, '#1c0a2e'); g.addColorStop(0.8, '#3a0e3e'); g.addColorStop(1, '#0a0614');
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
      const sc = VW < 384 ? VW / 300 : 1, sox = (VW - SW * sc) / 2, soy = VH < 300 ? 0 : VH * 0.62 - 130 * sc;
      c.setTransform(RS * sc, 0, 0, RS * sc, sox * RS, soy * RS);
      // 太陽（シンセウェーブ）
      const sg = c.createLinearGradient(0, 70, 0, 150); sg.addColorStop(0, '#ff4fd8'); sg.addColorStop(1, '#ffb04a');
      c.fillStyle = sg; c.beginPath(); c.arc(192, 120, 42, Math.PI, 0); c.fill();
      c.fillStyle = '#1c0a2e'; for (let i = 0; i < 6; i++) c.fillRect(150, 92 + i * 5, 84, 1 + i * 0.5);
      // 遠景ビル
      c.fillStyle = '#140a24'; for (const f of far) c.fillRect(f.x, 150 - f.h, f.w, f.h);
      // 中央タワー（美術館）
      c.fillStyle = '#0a0614'; c.beginPath(); c.moveTo(176, 150); c.lineTo(182, 30); c.lineTo(202, 30); c.lineTo(208, 150); c.fill();
      c.strokeStyle = '#3ff0ff'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(182, 30); c.lineTo(176, 150); c.moveTo(202, 30); c.lineTo(208, 150); c.stroke();
      const rot = W.t * 0.001;
      c.strokeStyle = 'rgba(63,240,255,.7)'; c.beginPath(); c.ellipse(192, 52, 26, 6, 0, rot % (Math.PI * 2), rot % (Math.PI * 2) + Math.PI * 1.4); c.stroke();
      c.strokeStyle = 'rgba(255,79,216,.6)'; c.beginPath(); c.ellipse(192, 70, 32, 7, 0, -rot, -rot + Math.PI * 1.2); c.stroke();
      c.fillStyle = '#ff4fd8'; c.fillRect(191, 22, 2, 8);
      // 近景ビル
      for (const t of towers) {
        if (t.x > 170 && t.x < 210) continue;
        c.fillStyle = '#07040f'; c.fillRect(t.x, 216 - t.h, t.w, t.h);
        for (let yy = 216 - t.h + 4; yy < 210; yy += 5) for (let xx = t.x + 2; xx < t.x + t.w - 2; xx += 4) {
          const v = Math.sin(t.seed + xx * 3.1 + yy * 1.7);
          if (v > 0.55) { c.fillStyle = v > 0.85 ? '#ff4fd8' : v > 0.7 ? '#3ff0ff' : 'rgba(255,200,120,.7)'; c.fillRect(xx, yy, 2, 2); }
        }
        if (t.seed % 7 < 1.2) { c.fillStyle = Math.sin(W.t * 0.01 + t.seed) > -0.8 ? '#ff4fd8' : '#40102e'; c.fillRect(t.x + 2, 216 - t.h + 6, 2, 16); }
      }
      for (const car of cars) { c.fillStyle = car.col; c.fillRect(car.x, car.y, 3, 1); c.globalAlpha = 0.3; c.fillRect(car.x - car.v * 200, car.y, car.v * 200, 1); c.globalAlpha = 1; }
      // 地面グリッド
      c.fillStyle = '#05020a'; c.fillRect(-200, 196, 784, 400);
      c.strokeStyle = 'rgba(255,79,216,.35)'; c.lineWidth = 0.6; c.beginPath();
      for (let i = -12; i <= 12; i++) { c.moveTo(192 + i * 8, 196); c.lineTo(192 + i * 60, 260); }
      const off = (W.t * 0.02) % 10;
      for (let k = 0; k < 8; k++) { const yy = 196 + Math.pow(k + off / 10, 1.6) * 3; c.moveTo(-200, yy); c.lineTo(584, yy); }
      c.stroke();
      c.setTransform(RS, 0, 0, RS, 0, 0);
      c.strokeStyle = 'rgba(160,200,255,.25)'; c.lineWidth = 0.6; c.beginPath();
      for (const d of drops) { c.moveTo(d.x, d.y); c.lineTo(d.x - d.l * 0.15, d.y + d.l); } c.stroke();
      if (glitch > 0) {
        c.setTransform(1, 0, 0, 1, 0, 0);
        for (let i = 0; i < 6; i++) { const yy = Math.random() * VH, h = Math.random() * 6 + 1; c.drawImage(c.canvas, 0, yy * RS, VW * RS, h * RS, (Math.random() - 0.5) * 16 * glitch * RS, yy * RS, VW * RS, h * RS); }
        c.setTransform(RS, 0, 0, RS, 0, 0);
        c.fillStyle = `rgba(63,240,255,${glitch * 0.08})`; c.fillRect(0, 0, VW, VH);
      }
      c.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < VH; i += 2) c.fillRect(0, i, VW, 0.5);
    },
  };
})();
