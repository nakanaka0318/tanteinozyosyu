'use strict';
/* =========================================================
   ART : タイル・家具・キャラクター・証拠アイコンの描画
   ========================================================= */
const ART = (() => {
  const T = 16;
  const WALK = new Set(['.', ',', ':', '_', '=', 'D', 'U']);
  const WALL = new Set(['#', 'W', 'F', 'Z', 'E']);
  const FLOOR = new Set(['.', ',', ':', '_', '=']);

  function hsh(x, y, s = 0) {
    let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function circ(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
  function ell(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }

  const at = (g, x, y) => (g[y] && g[y][x]) || '#';
  const isWall = ch => WALL.has(ch);

  function floorOf(g, x, y) {
    for (let d = 1; d < 8; d++) {
      for (const [xx, yy] of [[x - d, y], [x + d, y], [x, y + d], [x, y - d]]) {
        const ch = g[yy] && g[yy][xx];
        if (ch && FLOOR.has(ch)) return ch;
      }
    }
    return '.';
  }

  /* ---------------- floors ---------------- */
  function drawFloor(c, ch, x, y, tx, ty, g) {
    if (ch === '.') {
      R(c, x, y, T, T, '#3b2619');
      for (let r = 0; r < 4; r++) {
        const yy = y + r * 4;
        R(c, x, yy, T, 1, '#2b1b11');
        const off = Math.floor(hsh(tx, ty * 4 + r, 3) * 16);
        R(c, x + off, yy, 1, 4, '#2b1b11');
        if (hsh(tx, ty, r) > 0.45) R(c, x + Math.floor(hsh(tx, ty, r + 9) * 11), yy + 2, 4, 1, '#47301f');
        if (hsh(tx, ty, r + 20) > 0.8) R(c, x + Math.floor(hsh(tx, ty, r + 30) * 13), yy + 1, 2, 1, '#523825');
      }
    } else if (ch === ',') {
      R(c, x, y, T, T, '#4a1519');
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const cx = x + 4 + i * 8, cy = y + 4 + j * 8;
        R(c, cx - 1, cy, 3, 1, '#5e1f24'); R(c, cx, cy - 1, 1, 3, '#5e1f24');
      }
      R(c, x + 8, y + 8, 1, 1, '#7a5a2a');
      const up = at(g, tx, ty - 1) !== ',', dn = at(g, tx, ty + 1) !== ',', lf = at(g, tx - 1, ty) !== ',', rt = at(g, tx + 1, ty) !== ',';
      if (up) { R(c, x, y + 1, T, 1, '#9a7638'); R(c, x, y + 3, T, 1, '#6a4a22'); }
      if (dn) { R(c, x, y + 14, T, 1, '#9a7638'); R(c, x, y + 12, T, 1, '#6a4a22'); }
      if (lf) { R(c, x + 1, y, 1, T, '#9a7638'); R(c, x + 3, y, 1, T, '#6a4a22'); }
      if (rt) { R(c, x + 14, y, 1, T, '#9a7638'); R(c, x + 12, y, 1, T, '#6a4a22'); }
    } else if (ch === '=') {
      R(c, x, y, T, T, '#1b2f27');
      if ((tx + ty) % 2 === 0) { R(c, x + 7, y + 7, 2, 2, '#3d5a3a'); }
      R(c, x + ((tx * 5) % 16), y + 4, 1, 1, '#2a4436');
      if (at(g, tx, ty - 1) !== '=') { R(c, x, y + 1, T, 1, '#8a6c34'); R(c, x, y + 3, T, 1, '#2a4436'); }
      if (at(g, tx, ty + 1) !== '=') { R(c, x, y + 14, T, 1, '#8a6c34'); R(c, x, y + 12, T, 1, '#2a4436'); }
    } else if (ch === '_') {
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        R(c, x + i * 8, y + j * 8, 8, 8, ((i + j + tx + ty) % 2) ? '#5f5a52' : '#8a8478');
      }
      if (hsh(tx, ty, 1) > 0.5) { c.strokeStyle = 'rgba(220,214,200,.18)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(x + 2, y + 3 + hsh(tx, ty, 2) * 8); c.lineTo(x + 14, y + 6 + hsh(tx, ty, 4) * 8); c.stroke(); }
    } else if (ch === ':') {
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) R(c, x + i * 8, y + j * 8, 8, 8, ((i + j) % 2) ? '#423f39' : '#6e695e');
      R(c, x, y, T, 1, 'rgba(0,0,0,.15)');
    }
  }

  /* ---------------- walls ---------------- */
  const PAPER = {
    crimson: { base: '#3a1b23', stripe: '#43222b', dot: '#55303a' },
    green: { base: '#1c2e29', stripe: '#223630', dot: '#2f4a40' },
    navy: { base: '#1c2034', stripe: '#22283e', dot: '#30385a' },
    cream: { base: '#4a4232', stripe: '#52493a', dot: '#5e5440' },
    plum: { base: '#2c1d33', stripe: '#34233c', dot: '#44304e' },
  };
  function wallFace(c, x, y, p, tx) {
    R(c, x, y, T, T, p.base);
    for (let i = 0; i < T; i += 4) R(c, x + i, y + 3, 1, 8, p.stripe);
    if (tx % 2 === 0) R(c, x + 2, y + 6, 1, 1, p.dot);
    R(c, x, y, T, 2, '#5a3d22'); R(c, x, y + 2, T, 1, '#24160c');
    R(c, x, y + 11, T, 5, '#2a1a10'); R(c, x, y + 11, T, 1, '#6a4a2a');
    R(c, x + 2, y + 12, 12, 3, '#22150c'); R(c, x + 2, y + 12, 12, 1, '#1a1008');
    R(c, x, y + 15, T, 1, '#120a05');
  }
  function wallTop(c, x, y, tx, ty, g) {
    R(c, x, y, T, T, '#0c0a10');
    const e = '#2e2434';
    if (!isWall(at(g, tx - 1, ty))) R(c, x, y, 2, T, e);
    if (!isWall(at(g, tx + 1, ty))) R(c, x + 14, y, 2, T, e);
    if (!isWall(at(g, tx, ty - 1)) && g[ty - 1]) R(c, x, y, T, 2, e);
  }

  /* ---------------- furniture ---------------- */
  const BOOKS = ['#6e2424', '#24425e', '#55522a', '#2e5234', '#6a4626', '#8a7a52', '#46284f', '#7a3a1a', '#2a2a3a'];
  function bookshelf(c, x, y, tx, ty) {
    R(c, x, y - 9, T, 25, '#2e1c10'); R(c, x + 1, y - 8, 14, 23, '#160d07');
    for (let s = 0; s < 4; s++) {
      const sy = y - 8 + s * 6;
      let bx = x + 1;
      let k = 0;
      while (bx < x + 15) {
        const w = 1 + Math.floor(hsh(tx, ty * 7 + s, k) * 2);
        const h = 3 + Math.floor(hsh(tx, ty + s, k + 3) * 3);
        if (hsh(tx, s, k + 11) > 0.12) R(c, bx, sy + 5 - h, Math.min(w, x + 15 - bx), h, BOOKS[Math.floor(hsh(tx, ty + s, k + 5) * BOOKS.length)]);
        bx += w; k++;
      }
      R(c, x + 1, sy + 5, 14, 1, '#4a2e18');
    }
    R(c, x, y - 9, T, 1, '#5a3a20'); R(c, x, y + 15, T, 1, '#0a0604');
  }
  function diningTable(c, x, y, tx, ty, g) {
    const up = at(g, tx, ty - 1) === 'T', dn = at(g, tx, ty + 1) === 'T', lf = at(g, tx - 1, ty) === 'T', rt = at(g, tx + 1, ty) === 'T';
    R(c, x, y, T, T, '#d4ccbb');
    R(c, x + (lf ? 0 : 1), y + (up ? 0 : 1), T - (lf ? 0 : 1) - (rt ? 0 : 1), T - (up ? 0 : 1), '#e3dccd');
    if (!dn) { R(c, x, y + 12, T, 4, '#b4ac9a'); R(c, x, y + 15, T, 1, '#6a6458'); }
    if (!up) R(c, x, y, T, 1, '#f2ede2');
    if ((tx % 3 === 1) && up) { // candelabra
      R(c, x + 6, y - 2, 4, 2, '#c9a45c'); R(c, x + 7, y - 7, 2, 6, '#b8934a'); R(c, x + 4, y - 6, 8, 1, '#c9a45c');
      R(c, x + 4, y - 9, 1, 3, '#efe6d0'); R(c, x + 7, y - 10, 2, 3, '#efe6d0'); R(c, x + 11, y - 9, 1, 3, '#efe6d0');
    } else if (up || dn) {
      ell(c, x + 8, y + 7, 3.5, 2.5, '#fbf8f0'); ell(c, x + 8, y + 7, 2, 1.3, '#d8d2c4');
      R(c, x + 3, y + 5, 1, 5, '#b8b8b8'); R(c, x + 12, y + 5, 1, 5, '#b8b8b8');
    }
  }
  function workTable(c, x, y, tx, ty, g) {
    const dn = at(g, tx, ty + 1) === 'Q', up = at(g, tx, ty - 1) === 'Q';
    R(c, x, y + (up ? 0 : 1), T, T - (up ? 0 : 1), '#7a5832');
    for (let i = 0; i < 4; i++) R(c, x, y + 2 + i * 4, T, 1, '#6a4a28');
    if (!dn) { R(c, x, y + 12, T, 4, '#4a321c'); R(c, x + 1, y + 15, 2, 1, '#2a1a0e'); R(c, x + 13, y + 15, 2, 1, '#2a1a0e'); }
    if (tx % 2 === 0 && !up) { ell(c, x + 8, y + 6, 4, 2.5, '#b8b4a8'); R(c, x + 5, y + 5, 6, 1, '#d8d4c8'); }
  }
  function chair(c, x, y, tx, ty, g) {
    const tblBelow = at(g, tx, ty + 1) === 'T', tblAbove = at(g, tx, ty - 1) === 'T';
    if (tblAbove) {
      R(c, x + 3, y + 1, 10, 8, '#6a1e24'); R(c, x + 3, y + 1, 10, 1, '#8a2a30');
      R(c, x + 2, y + 9, 12, 5, '#3a2212'); R(c, x + 3, y + 10, 10, 3, '#4a2c18');
    } else {
      R(c, x + 2, y - 3, 12, 6, '#3a2212'); R(c, x + 3, y - 2, 10, 4, '#4a2c18');
      R(c, x + 3, y + 3, 10, 9, '#6a1e24'); R(c, x + 3, y + 3, 10, 1, '#8a2a30');
      R(c, x + 3, y + 12, 2, 3, '#2a180c'); R(c, x + 11, y + 12, 2, 3, '#2a180c');
    }
  }
  function sofa(c, x, y, tx, ty, g) {
    const lf = at(g, tx - 1, ty) === 'S', rt = at(g, tx + 1, ty) === 'S';
    R(c, x, y - 2, T, 8, '#4e1620'); R(c, x, y - 2, T, 1, '#6e2430');
    R(c, x, y + 6, T, 8, '#6a1f2b'); R(c, x, y + 6, T, 1, '#8a3040');
    R(c, x, y + 14, T, 2, '#2a0a10');
    if (!lf) { R(c, x, y - 1, 3, 15, '#5a1a24'); R(c, x, y - 1, 3, 1, '#7a2a36'); }
    if (!rt) { R(c, x + 13, y - 1, 3, 15, '#5a1a24'); R(c, x + 13, y - 1, 3, 1, '#7a2a36'); }
    if (lf) R(c, x, y + 7, 1, 6, '#4e1620');
    R(c, x + 7, y + 1, 1, 1, '#c9a45c');
  }
  function smallTable(c, x, y) {
    R(c, x + 7, y + 8, 2, 7, '#2a180c'); R(c, x + 4, y + 14, 8, 2, '#2a180c');
    ell(c, x + 8, y + 7, 6, 4, '#5a3a22'); ell(c, x + 8, y + 6, 6, 3.5, '#6e4a2c');
    R(c, x + 7, y - 1, 2, 7, '#c9a45c');
    c.fillStyle = '#e8c878'; c.beginPath(); c.moveTo(x + 4, y + 0); c.lineTo(x + 12, y + 0); c.lineTo(x + 10, y - 5); c.lineTo(x + 6, y - 5); c.fill();
    R(c, x + 4, y, 8, 1, '#b8903a');
  }
  function chessTable(c, x, y) {
    R(c, x + 2, y + 12, 2, 4, '#2a180c'); R(c, x + 12, y + 12, 2, 4, '#2a180c');
    R(c, x + 1, y + 2, 14, 11, '#4a2c18'); R(c, x + 1, y + 12, 14, 2, '#2e1a0c');
    for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) R(c, x + 2 + i * 2, y + 3 + j * 2, 2, 2, ((i + j) % 2) ? '#1a1410' : '#d8ccb0');
    R(c, x + 4, y + 2, 1, 2, '#f0e8d8'); R(c, x + 9, y + 6, 1, 2, '#f0e8d8'); R(c, x + 6, y + 8, 1, 2, '#111'); R(c, x + 11, y + 10, 1, 2, '#111'); R(c, x + 3, y + 9, 1, 2, '#111');
  }
  function pianoT(c, x, y, tx, ty, g) {
    const left = at(g, tx + 1, ty) === 'p';
    R(c, x, y - 6, T, 20, '#0e0e12'); R(c, x, y - 6, T, 1, '#3a3a44');
    R(c, x + (left ? 2 : 0), y - 4, left ? 14 : 12, 7, '#1c1c24');
    R(c, x + (left ? 4 : 2), y - 3, 3, 1, '#4a4a58');
    R(c, x, y + 9, T, 4, '#ece6d6');
    for (let i = 0; i < 8; i++) R(c, x + i * 2, y + 9, 1, 4, i % 2 ? '#bab4a4' : '#ece6d6');
    for (let i = 1; i < 8; i += 2) if (i !== 5) R(c, x + i * 2 - 1, y + 9, 1, 2, '#111');
    R(c, x, y + 13, T, 3, '#08080a');
    if (left) { R(c, x + 3, y + 14, 2, 2, '#2a2a30'); }
  }
  function grandClock(c, x, y) {
    R(c, x + 3, y - 12, 10, 28, '#3a200f'); R(c, x + 3, y - 12, 10, 1, '#6a4020');
    R(c, x + 2, y - 13, 12, 3, '#4a2a14'); R(c, x + 5, y - 15, 6, 2, '#4a2a14');
    circ(c, x + 8, y - 5, 4, '#c9a45c'); circ(c, x + 8, y - 5, 3.2, '#ece4cc');
    R(c, x + 8, y - 8, 1, 3, '#1a1008'); R(c, x + 8, y - 5, 2, 1, '#1a1008');
    R(c, x + 5, y + 1, 6, 11, '#160c06'); R(c, x + 5, y + 1, 6, 1, '#6a4020');
    R(c, x + 3, y + 14, 10, 2, '#1e1008');
  }
  function cabinet(c, x, y, tx) {
    R(c, x + 1, y - 9, 14, 25, '#3a200f'); R(c, x + 2, y - 8, 12, 21, '#1a2228');
    for (let s = 0; s < 3; s++) {
      const sy = y - 8 + s * 7;
      R(c, x + 2, sy + 6, 12, 1, '#4a2a14');
      for (let k = 0; k < 2; k++) { const cx = x + 5 + k * 6, cy = sy + 3; circ(c, cx, cy, 2.2, k % 2 ? '#c9a45c' : '#a8a8b0'); circ(c, cx, cy, 1.4, '#e8e2d0'); R(c, cx, cy - 1, 1, 1, '#222'); }
    }
    c.fillStyle = 'rgba(160,200,230,.12)'; c.fillRect(x + 2, y - 8, 4, 21);
    R(c, x + 1, y + 13, 14, 3, '#2a160a');
  }
  function plant(c, x, y, tx, ty) {
    R(c, x + 4, y + 9, 8, 6, '#6a3a24'); R(c, x + 3, y + 9, 10, 2, '#8a4a2e'); R(c, x + 5, y + 15, 6, 1, '#3a1e10');
    const L = ['#1f4a2a', '#2a5e34', '#18381f', '#33703c'];
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.38 + (hsh(tx, ty, i) - 0.5) * 0.3, len = 7 + hsh(tx, ty, i + 9) * 5;
      c.strokeStyle = L[i % 4]; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x + 8, y + 9); c.quadraticCurveTo(x + 8 + Math.cos(a) * len * 0.5, y + 9 + Math.sin(a) * len * 0.9, x + 8 + Math.cos(a) * len, y + 9 + Math.sin(a) * len); c.stroke();
    }
  }
  function lamp(c, x, y) {
    ell(c, x + 8, y + 14, 4, 1.5, '#1a1008'); R(c, x + 7, y - 2, 2, 16, '#8a6a32');
    c.fillStyle = '#e8c070'; c.beginPath(); c.moveTo(x + 3, y - 2); c.lineTo(x + 13, y - 2); c.lineTo(x + 10, y - 10); c.lineTo(x + 6, y - 10); c.fill();
    R(c, x + 3, y - 3, 10, 1, '#c8983a'); R(c, x + 6, y - 10, 4, 1, '#fff0c0');
  }
  function desk(c, x, y, tx, ty, g) {
    const left = at(g, tx + 1, ty) === 'd';
    R(c, x, y - 1, T, 13, '#4e2e18'); R(c, x, y - 1, T, 1, '#7a4a28');
    R(c, x + (left ? 2 : 0), y + 1, left ? 14 : 14, 8, '#23402c');
    R(c, x, y + 12, T, 4, '#2e1a0c');
    R(c, x + (left ? 2 : 0), y + 12, 12, 3, '#3a2212'); R(c, x + 7, y + 13, 2, 1, '#c9a45c');
    if (left) {
      R(c, x + 3, y - 4, 2, 6, '#c9a45c'); c.fillStyle = '#2a6a42'; c.beginPath(); c.ellipse(x + 6, y - 5, 5, 2.4, 0, Math.PI, 0); c.fill(); R(c, x + 1, y - 5, 10, 1, '#3a8a5a');
      R(c, x + 9, y + 2, 6, 5, '#ece4d0'); R(c, x + 10, y + 3, 4, 1, '#8a8070'); R(c, x + 10, y + 5, 3, 1, '#8a8070');
    } else {
      R(c, x + 2, y + 2, 7, 6, '#efe8d6'); R(c, x + 3, y + 3, 5, 1, '#5a5048'); R(c, x + 3, y + 5, 4, 1, '#5a5048');
      R(c, x + 11, y + 3, 3, 3, '#111'); R(c, x + 12, y + 1, 1, 3, '#e8e8e8');
    }
  }
  function counter(c, x, y, tx, ty, g) {
    R(c, x, y - 2, T, 18, '#4e3a26'); R(c, x, y - 2, T, 5, '#9a8a6e'); R(c, x, y - 2, T, 1, '#c8b896');
    R(c, x + 1, y + 5, 6, 9, '#5a4430'); R(c, x + 9, y + 5, 6, 9, '#5a4430');
    R(c, x + 6, y + 9, 1, 1, '#c9a45c'); R(c, x + 9, y + 9, 1, 1, '#c9a45c');
    if (hsh(tx, ty, 2) > 0.5) { R(c, x + 3, y - 4, 4, 3, '#b8b0a0'); R(c, x + 4, y - 5, 2, 1, '#888'); }
    else { ell(c, x + 10, y - 1, 3, 1.5, '#c0c4c8'); }
  }
  function stove(c, x, y, tx, ty, g) {
    const left = at(g, tx + 1, ty) === 'O';
    R(c, x, y - 3, T, 19, '#1c1c20'); R(c, x, y - 3, T, 1, '#4a4a54');
    circ(c, x + 8, y + 1, 4, '#0a0a0c'); circ(c, x + 8, y + 1, 2.5, '#2a2a30');
    R(c, x + 2, y + 7, 12, 6, '#0a0606'); R(c, x + 3, y + 10, 10, 2, '#a83a10'); R(c, x + 4, y + 9, 8, 1, '#e86a20');
    for (let i = 0; i < 4; i++) R(c, x + 3 + i * 3, y + 7, 1, 6, '#2a2a30');
    if (left) { R(c, x + 12, y - 9, 6, 7, '#2a2a30'); }
  }
  function icebox(c, x, y) {
    R(c, x + 1, y - 8, 14, 24, '#6e4e2c'); R(c, x + 1, y - 8, 14, 1, '#9a7448');
    R(c, x + 2, y - 7, 12, 9, '#7e5a34'); R(c, x + 2, y + 3, 12, 11, '#7e5a34');
    R(c, x + 2, y + 2, 12, 1, '#3e2814');
    R(c, x + 11, y - 3, 2, 3, '#d8b860'); R(c, x + 11, y + 7, 2, 3, '#d8b860');
    R(c, x + 2, y - 6, 1, 2, '#b8b8c0'); R(c, x + 2, y + 4, 1, 2, '#b8b8c0');
    R(c, x + 1, y + 15, 14, 1, '#2a180a');
  }
  function pedestal(c, x, y) {
    R(c, x + 4, y + 2, 8, 13, '#a8a298'); R(c, x + 4, y + 2, 2, 13, '#c8c2b8'); R(c, x + 10, y + 2, 2, 13, '#827c72');
    R(c, x + 2, y, 12, 3, '#d0cabe'); R(c, x + 2, y + 2, 12, 1, '#8a847a'); R(c, x + 3, y + 14, 10, 2, '#7a746a');
  }
  function armor(c, x, y) {
    R(c, x + 3, y + 13, 10, 3, '#3a3a40');
    R(c, x + 5, y + 6, 6, 8, '#8a8c94'); R(c, x + 5, y + 6, 2, 8, '#b4b6be');
    R(c, x + 3, y - 2, 10, 9, '#9a9ca4'); R(c, x + 3, y - 2, 3, 9, '#c4c6ce'); R(c, x + 6, y + 1, 4, 1, '#3a3a40');
    R(c, x + 5, y - 9, 6, 7, '#a4a6ae'); R(c, x + 5, y - 9, 2, 7, '#cfd1d8'); R(c, x + 6, y - 6, 4, 1, '#1a1a20');
    R(c, x + 7, y - 12, 2, 3, '#8a1e22');
    R(c, x + 13, y - 14, 1, 28, '#5a4a3a'); R(c, x + 12, y - 16, 3, 3, '#c8c8d0');
  }
  function globe(c, x, y) {
    R(c, x + 7, y + 8, 2, 6, '#4a2a14'); R(c, x + 4, y + 13, 8, 2, '#3a200f');
    circ(c, x + 8, y + 3, 5.5, '#2a4a6a'); c.fillStyle = '#6a7a3a'; c.beginPath(); c.ellipse(x + 7, y + 2, 2.4, 3.4, 0.4, 0, 7); c.fill();
    c.strokeStyle = '#c9a45c'; c.lineWidth = 0.8; c.beginPath(); c.arc(x + 8, y + 3, 6.5, Math.PI * 0.7, Math.PI * 2.1); c.stroke();
  }
  function bed(c, x, y, tx, ty, g) {
    const head = at(g, tx, ty + 1) === 'b';
    if (head) {
      R(c, x, y - 4, T, 6, '#3a200f'); R(c, x, y - 4, T, 1, '#6a4020');
      R(c, x + 1, y + 2, 14, 14, '#e4dccb'); R(c, x + 2, y + 3, 12, 6, '#f4efe4'); R(c, x + 2, y + 8, 12, 1, '#c8c0ae');
      R(c, x + 1, y + 12, 14, 4, '#3a4a6e'); R(c, x + 1, y + 12, 14, 1, '#56688e');
    } else {
      R(c, x + 1, y, 14, 13, '#3a4a6e'); R(c, x + 1, y + 5, 14, 1, '#2e3c5a'); R(c, x + 1, y + 9, 14, 1, '#2e3c5a');
      R(c, x, y + 13, T, 3, '#3a200f');
    }
  }
  function wardrobe(c, x, y) {
    R(c, x + 1, y - 10, 14, 26, '#3e2412'); R(c, x + 1, y - 10, 14, 1, '#6a4020');
    R(c, x + 2, y - 8, 5, 21, '#4a2c16'); R(c, x + 9, y - 8, 5, 21, '#4a2c16');
    R(c, x + 7, y + 1, 1, 2, '#c9a45c'); R(c, x + 8, y + 1, 1, 2, '#c9a45c');
    R(c, x + 1, y + 14, 14, 2, '#1e1008');
  }
  function stairs(c, x, y, tx, ty, g) {
    R(c, x, y, T, T, '#3a2418');
    for (let i = 0; i < 4; i++) { R(c, x, y + i * 4, T, 1, '#5a3a24'); R(c, x, y + i * 4 + 3, T, 1, '#1e120a'); }
    R(c, x + 4, y, 8, T, 'rgba(120,20,30,.65)');
    if (at(g, tx - 1, ty) !== 'U') R(c, x, y - 4, 2, 20, '#2a1a10');
    if (at(g, tx + 1, ty) !== 'U') R(c, x + 14, y - 4, 2, 20, '#2a1a10');
  }

  /* ---------------- main static map render ---------------- */
  function renderMap(map, RS) {
    const g = map.grid, W = map.w, H = map.h;
    const cv = document.createElement('canvas');
    cv.width = W * T * RS; cv.height = H * T * RS;
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    c.scale(RS, RS);
    const lights = [], anims = [];
    const paperAt = (tx, ty) => {
      // 壁紙は、その壁の「下」にある部屋で決まる
      for (const r of map.rooms) if (tx >= r.x1 && tx <= r.x2 && ty + 1 >= r.y1 && ty + 1 <= r.y2) return PAPER[r.paper || map.paper];
      return PAPER[map.paper];
    };
    for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
      const ch = at(g, tx, ty), x = tx * T, y = ty * T;
      if (isWall(ch)) {
        const below = at(g, tx, ty + 1);
        const face = ty + 1 < H && !isWall(below);
        if (face || ch === 'W' || ch === 'F' || ch === 'Z') wallFace(c, x, y, paperAt(tx, ty), tx); else wallTop(c, x, y, tx, ty, g);
        if (ch === 'W') {
          R(c, x + 3, y + 2, 10, 9, '#3a2414'); R(c, x + 4, y + 3, 8, 7, '#0e1424');
          R(c, x + 1, y + 2, 3, 10, '#5a1a22'); R(c, x + 12, y + 2, 3, 10, '#5a1a22');
          R(c, x + 2, y + 2, 1, 10, '#6e222c'); R(c, x + 13, y + 2, 1, 10, '#6e222c');
          R(c, x + 1, y + 1, 14, 1, '#8a6a32');
          anims.push({ type: 'win', tx, ty });
          lights.push({ x: x + 8, y: y + 10, r: 22, col: '120,150,220', a: 0.05, win: true });
        } else if (ch === 'F') {
          const left = at(g, tx + 1, ty) === 'F';
          R(c, x, y + 2, T, 14, '#6a645c'); R(c, x, y + 2, T, 1, '#8a847a');
          for (let i = 0; i < 3; i++) R(c, x, y + 6 + i * 4, T, 1, '#57514a');
          R(c, x + (left ? 5 : 0), y + 7, 11, 9, '#0c0606');
          R(c, x + (left ? 5 : 0), y + 7, 11, 1, '#2a2420');
          R(c, x - (left ? 1 : 0), y + 1, T + 1, 2, '#9a948a');
          if (left) { R(c, x + 8, y - 1, 2, 2, '#c9a45c'); }
          else { R(c, x + 5, y - 1, 3, 2, '#b8b8c0'); }
          R(c, x + (left ? 5 : 0), y + 14, 11, 2, '#2a2420');
          anims.push({ type: 'fire', tx, ty, left });
          if (left) lights.push({ x: x + 16, y: y + 16, r: 92, col: '255,140,60', a: 0.22, flick: true });
        } else if (ch === 'Z') {
          R(c, x + 3, y + 2, 10, 8, '#b8933a'); R(c, x + 4, y + 3, 8, 6, hsh(tx, ty) > 0.5 ? '#2a3a2a' : '#3a2a22');
          R(c, x + 4, y + 6, 8, 3, hsh(tx, ty, 2) > 0.5 ? '#4a5a3a' : '#5a3a2a'); circ(c, x + 9, y + 5, 1, '#d8c890');
        } else if (ch === 'E') {
          R(c, x, y, T, T, '#0c0a10');
          R(c, x, y, T, 6, '#2a1a10'); R(c, x, y, T, 1, '#5a3a20');
          R(c, x + (at(g, tx + 1, ty) === 'E' ? 13 : 1), y + 1, 2, 4, '#c9a45c');
        }
        continue;
      }
      // floor under
      let fl = ch;
      if (!FLOOR.has(ch)) {
        if (ch === 'D') {
          const vert = isWall(at(g, tx, ty - 1)) && isWall(at(g, tx, ty + 1));
          if (vert) { const l = at(g, tx - 1, ty), r = at(g, tx + 1, ty); fl = FLOOR.has(r) ? r : FLOOR.has(l) ? l : '.'; }
          else { const b = at(g, tx, ty + 1), a = at(g, tx, ty - 1); fl = FLOOR.has(b) ? b : FLOOR.has(a) ? a : '.'; }
        } else fl = floorOf(g, tx, ty);
      }
      drawFloor(c, fl, x, y, tx, ty, g);
      switch (ch) {
        case 'D': {
          const vert = isWall(at(g, tx, ty - 1)) && isWall(at(g, tx, ty + 1));
          if (vert) { R(c, x, y, T, 2, '#3a2212'); R(c, x, y + 14, T, 2, '#3a2212'); R(c, x + 7, y + 2, 2, 12, 'rgba(0,0,0,.25)'); }
          else { R(c, x, y, 2, T, '#4a2c16'); R(c, x + 14, y, 2, T, '#4a2c16'); R(c, x + 2, y, 12, 4, 'rgba(0,0,0,.45)'); R(c, x + 2, y + 14, 12, 2, '#5a3a20'); }
          break;
        }
        case 'U': stairs(c, x, y, tx, ty, g); break;
        case 'B': bookshelf(c, x, y, tx, ty); break;
        case 'T': diningTable(c, x, y, tx, ty, g); if (tx % 3 === 1 && at(g, tx, ty - 1) === 'T') lights.push({ x: x + 8, y: y - 8, r: 44, col: '255,190,110', a: 0.16, flick: true }); break;
        case 'Q': workTable(c, x, y, tx, ty, g); break;
        case 'h': chair(c, x, y, tx, ty, g); break;
        case 'S': sofa(c, x, y, tx, ty, g); break;
        case 't': smallTable(c, x, y); lights.push({ x: x + 8, y: y - 2, r: 46, col: '255,200,120', a: 0.18 }); break;
        case 'k': chessTable(c, x, y); break;
        case 'p': pianoT(c, x, y, tx, ty, g); break;
        case 'K': grandClock(c, x, y); anims.push({ type: 'pend', tx, ty }); break;
        case 'X': cabinet(c, x, y, tx); break;
        case 'P': plant(c, x, y, tx, ty); break;
        case 'L': lamp(c, x, y); lights.push({ x: x + 8, y: y - 6, r: 64, col: '255,196,110', a: 0.2, flick: true }); break;
        case 'd': desk(c, x, y, tx, ty, g); if (at(g, tx + 1, ty) === 'd') lights.push({ x: x + 6, y: y - 2, r: 50, col: '220,255,200', a: 0.12 }); break;
        case 'C': counter(c, x, y, tx, ty, g); break;
        case 'O': stove(c, x, y, tx, ty, g); lights.push({ x: x + 8, y: y + 10, r: 34, col: '255,90,30', a: 0.2, flick: true }); break;
        case 'I': icebox(c, x, y); break;
        case 'V': pedestal(c, x, y); break;
        case 'A': armor(c, x, y); break;
        case 'G': globe(c, x, y); break;
        case 'b': bed(c, x, y, tx, ty, g); break;
        case 'w': wardrobe(c, x, y); break;
      }
    }
    return { canvas: cv, lights, anims };
  }

  /* ---------------- animated overlays ---------------- */
  function drawAnim(c, a, t, lightning, storm = true) {
    const x = a.tx * T, y = a.ty * T;
    if (a.type === 'win' && !storm) {
      R(c, x + 4, y + 3, 8, 7, '#9ab8d8'); R(c, x + 4, y + 3, 8, 2, '#c8dcf0'); R(c, x + 5, y + 6, 2, 1, '#e8f0f8');
      R(c, x + 7, y + 3, 1, 7, '#3a2414'); R(c, x + 4, y + 6, 8, 1, '#3a2414');
    } else if (a.type === 'win') {
      const fl = lightning > 0.05;
      R(c, x + 4, y + 3, 8, 7, fl ? `rgba(220,230,255,${0.4 + lightning * 0.6})` : '#0e1424');
      if (!fl) {
        for (let i = 0; i < 4; i++) {
          const sx = x + 4 + ((i * 3 + a.tx) % 8), sy = y + 3 + ((t * 0.02 + i * 2.3 + a.tx) % 7);
          R(c, sx, sy, 1, 2, 'rgba(140,170,220,.5)');
        }
      }
      R(c, x + 7, y + 3, 1, 7, '#3a2414'); R(c, x + 4, y + 6, 8, 1, '#3a2414');
    } else if (a.type === 'fire') {
      const ox = x + (a.left ? 5 : 0), w = 11;
      for (let i = 0; i < 7; i++) {
        const fx = ox + 1 + ((i * 1.6 + (a.left ? 0 : 5)) % w);
        const h = 3 + Math.abs(Math.sin(t * 0.009 + i * 1.7 + a.tx)) * 5;
        R(c, fx, y + 15 - h, 2, h, i % 3 === 0 ? '#ffd27a' : '#ff7a2a');
      }
      R(c, ox, y + 14, w, 1, '#ffb050'); R(c, ox + 2, y + 15, w - 4, 1, '#3a1a0a');
    } else if (a.type === 'pend') {
      const sw = Math.sin(t * 0.0042) * 2.2;
      R(c, x + 5, y + 1, 6, 11, '#160c06');
      c.strokeStyle = '#b8933a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x + 8, y + 2); c.lineTo(x + 8 + sw, y + 9); c.stroke();
      circ(c, x + 8 + sw, y + 9.5, 1.6, '#d8b860');
    }
  }

  /* ---------------- characters ---------------- */
  const LOOKS = {
    kujo: { skin: '#e2b896', hair: '#17161e', coat: '#2a3450', coatD: '#1b2236', shirt: '#dcd6c8', tie: '#3fb0a8', pants: '#20212a', shoes: '#0e0e12', long: true, style: 'messy' },
    me: { skin: '#eac29c', hair: '#5a3a22', coat: '#7a5634', coatD: '#5a3e24', shirt: '#ebe5d6', tie: '#d39a3a', pants: '#3a3a42', shoes: '#2a1a12', cap: '#6a4a2c', style: 'short' },
    genichiro: { skin: '#d8ad8a', hair: '#cfcfd4', coat: '#4e1e24', coatD: '#381418', shirt: '#e0dace', tie: '#c9a45c', pants: '#2a1a1c', shoes: '#120a08', beard: '#dcdce0', style: 'bald', long: true },
    masato: { skin: '#e0b48e', hair: '#111116', coat: '#4f5862', coatD: '#3a424a', shirt: '#e8e4dc', tie: '#b8323a', pants: '#2e333a', shoes: '#111', style: 'slick' },
    fuyuko: { skin: '#f0cbaa', hair: '#1a1420', coat: '#4b3a63', coatD: '#36294a', shirt: '#e8e0f0', tie: '#c8b0e8', pants: '#2a2038', shoes: '#140e1a', dress: true, glasses: true, style: 'bun' },
    sanada: { skin: '#dcb090', hair: '#b4b4ba', coat: '#16161c', coatD: '#0c0c10', shirt: '#eeeeea', tie: '#0a0a0a', pants: '#16161c', shoes: '#050505', mustache: '#9a9aa0', style: 'side', long: true },
    todo: { skin: '#dfb08c', hair: '#2e2620', coat: '#6a5a40', coatD: '#4e4230', shirt: '#e6e2d6', tie: '#3e5e3c', pants: '#3a3226', shoes: '#1a120a', glasses: true, style: 'side', mustache: '#2e2620' },
    suzu: { skin: '#f2cdac', hair: '#6a4630', coat: '#23232c', coatD: '#16161c', shirt: '#f4f0e8', tie: '#e8a0b8', pants: '#23232c', shoes: '#111', dress: true, apron: '#ebe6dc', headdress: '#f8f4ec', style: 'braids' },
  };

  function drawChar(c, px, py, dir, frame, L, opts = {}) {
    // px,py = タイル左上（ワールド座標）。スプライトは16x24で上に8px はみ出す
    const x = Math.round(px), y = Math.round(py) - 8;
    ell(c, x + 8, y + 23, 6, 2, 'rgba(0,0,0,.4)');
    const walking = frame === 1 || frame === 3;
    const bob = walking ? 1 : 0;
    const st = frame === 1 ? 1 : frame === 3 ? -1 : 0;
    c.save();
    if (L.holo) c.globalAlpha = 0.62 + Math.sin(performance.now() * 0.006) * 0.08;
    if (dir === 'left') { c.translate(x * 2 + 16, 0); c.scale(-1, 1); }
    const side = dir === 'left' || dir === 'right';
    const by = y + bob;
    if (side) drawSide(c, x, by, st, L); else drawFront(c, x, by, st, L, dir === 'up');
    if (L.holo) { c.globalAlpha = 0.25; for (let i = 0; i < 24; i += 3) R(c, x + 1, by + i, 14, 1, '#bff8ff'); }
    if (L.neon) { c.globalAlpha = 0.9; R(c, x + 3, by + 17, 10, 1, L.neon); }
    c.restore();
  }

  function legs(c, x, y, st, L) {
    const lU = st === 1 ? 1 : 0, rU = st === -1 ? 1 : 0;
    R(c, x + 5, y + 18 - lU, 2, 4, L.pants); R(c, x + 9, y + 18 - rU, 2, 4, L.pants);
    R(c, x + 4, y + 22 - lU, 3, 1, L.shoes); R(c, x + 9, y + 22 - rU, 3, 1, L.shoes);
  }
  function drawFront(c, x, y, st, L, back) {
    legs(c, x, y, st, L);
    // body
    R(c, x + 3, y + 10, 10, 8, L.coat);
    if (L.long) { R(c, x + 3, y + 17, 4, 3, L.coat); R(c, x + 9, y + 17, 4, 3, L.coat); }
    if (L.dress) { R(c, x + 2, y + 15, 12, 6, L.coat); R(c, x + 2, y + 20, 12, 1, L.coatD); }
    R(c, x + 3, y + 10, 1, 8, L.coatD); R(c, x + 12, y + 10, 1, 8, L.coatD);
    if (!back) {
      if (L.apron) { R(c, x + 5, y + 12, 6, 8, L.apron); R(c, x + 5, y + 10, 1, 2, L.apron); R(c, x + 10, y + 10, 1, 2, L.apron); }
      else {
        R(c, x + 6, y + 10, 4, 2, L.shirt); R(c, x + 7, y + 12, 2, 1, L.shirt);
        R(c, x + 7, y + 11, 2, 4, L.tie);
      }
      if (L.long) R(c, x + 7, y + 16, 2, 4, L.coatD);
    } else {
      R(c, x + 7, y + 11, 2, 6, L.coatD);
      if (L.apron) R(c, x + 4, y + 14, 8, 1, L.apron);
    }
    // arms
    const aL = st === 1 ? -1 : st === -1 ? 1 : 0;
    R(c, x + 1, y + 11 + aL, 2, 6, L.coatD); R(c, x + 13, y + 11 - aL, 2, 6, L.coatD);
    R(c, x + 1, y + 17 + aL, 2, 1, L.skin); R(c, x + 13, y + 17 - aL, 2, 1, L.skin);
    // head
    R(c, x + 4, y + 2, 8, 8, L.skin);
    R(c, x + 4, y + 9, 8, 1, shade(L.skin));
    if (!back) {
      if (L.glasses) { R(c, x + 5, y + 5, 3, 2, '#c8d0d8'); R(c, x + 8, y + 5, 3, 2, '#c8d0d8'); }
      R(c, x + 6, y + 5, 1, 2, '#1a1418'); R(c, x + 9, y + 5, 1, 2, '#1a1418');
      if (L.mustache) R(c, x + 6, y + 8, 4, 1, L.mustache);
      if (L.beard) { R(c, x + 5, y + 7, 6, 3, L.beard); R(c, x + 6, y + 10, 4, 1, L.beard); R(c, x + 7, y + 8, 2, 1, shade(L.skin)); }
    }
    hairFront(c, x, y, L, back);
  }
  function hairFront(c, x, y, L, back) {
    const h = L.hair, s = L.style;
    if (back) {
      if (s === 'bald') { R(c, x + 3, y + 4, 2, 5, h); R(c, x + 11, y + 4, 2, 5, h); R(c, x + 4, y + 6, 8, 3, h); }
      else { R(c, x + 3, y + 1, 10, 9, h); R(c, x + 4, y + 0, 8, 1, h); }
      if (s === 'bun') { R(c, x + 6, y - 2, 4, 3, h); }
      if (s === 'braids') { R(c, x + 3, y + 9, 2, 5, h); R(c, x + 11, y + 9, 2, 5, h); }
      if (s === 'twin') { R(c, x + 1, y + 3, 2, 8, h); R(c, x + 13, y + 3, 2, 8, h); }
      if (s === 'long') { R(c, x + 3, y + 9, 10, 4, h); }
      if (s === 'hood') { R(c, x + 2, y + 0, 12, 10, L.coat); }
    } else {
      if (s === 'messy') { R(c, x + 3, y + 0, 10, 3, h); R(c, x + 3, y + 3, 1, 5, h); R(c, x + 12, y + 3, 1, 4, h); R(c, x + 4, y + 3, 2, 1, h); R(c, x + 7, y + 3, 1, 2, h); R(c, x + 10, y + 3, 2, 1, h); R(c, x + 2, y + 1, 1, 2, h); R(c, x + 13, y + 2, 1, 1, h); }
      else if (s === 'short') { R(c, x + 4, y + 1, 8, 2, h); R(c, x + 3, y + 2, 1, 6, h); R(c, x + 12, y + 2, 1, 6, h); R(c, x + 4, y + 3, 3, 1, h); }
      else if (s === 'bald') { R(c, x + 3, y + 4, 1, 4, h); R(c, x + 12, y + 4, 1, 4, h); R(c, x + 6, y + 2, 4, 1, shade(L.skin, 0.92)); }
      else if (s === 'slick') { R(c, x + 4, y + 0, 8, 3, h); R(c, x + 3, y + 2, 1, 4, h); R(c, x + 12, y + 2, 1, 4, h); R(c, x + 6, y + 1, 3, 1, '#3a3a44'); }
      else if (s === 'bun') { R(c, x + 4, y + 1, 8, 2, h); R(c, x + 6, y - 2, 4, 3, h); R(c, x + 3, y + 2, 1, 7, h); R(c, x + 12, y + 2, 1, 7, h); }
      else if (s === 'side') { R(c, x + 4, y + 0, 8, 3, h); R(c, x + 3, y + 2, 1, 4, h); R(c, x + 12, y + 2, 1, 3, h); R(c, x + 9, y + 1, 1, 1, shade(h, 1.4)); }
      else if (s === 'bob') { R(c, x + 3, y + 0, 10, 3, h); R(c, x + 3, y + 3, 2, 6, h); R(c, x + 11, y + 3, 2, 6, h); R(c, x + 5, y + 3, 6, 1, h); }
      else if (s === 'twin') { R(c, x + 4, y + 0, 8, 3, h); R(c, x + 3, y + 2, 1, 5, h); R(c, x + 12, y + 2, 1, 5, h); R(c, x + 1, y + 2, 2, 9, h); R(c, x + 13, y + 2, 2, 9, h); R(c, x + 1, y + 2, 2, 1, L.tie); R(c, x + 13, y + 2, 2, 1, L.tie); }
      else if (s === 'long') { R(c, x + 3, y + 0, 10, 3, h); R(c, x + 3, y + 3, 2, 10, h); R(c, x + 11, y + 3, 2, 10, h); R(c, x + 6, y + 3, 4, 1, h); }
      else if (s === 'hood') { R(c, x + 2, y - 1, 12, 4, L.coat); R(c, x + 2, y + 3, 2, 7, L.coat); R(c, x + 12, y + 3, 2, 7, L.coat); R(c, x + 4, y + 3, 8, 1, h); R(c, x + 5, y + 4, 2, 1, h); }
      else if (s === 'braids') { R(c, x + 4, y + 1, 8, 2, h); R(c, x + 3, y + 2, 1, 6, h); R(c, x + 12, y + 2, 1, 6, h); R(c, x + 2, y + 8, 2, 6, h); R(c, x + 12, y + 8, 2, 6, h); R(c, x + 2, y + 13, 2, 1, L.tie); R(c, x + 12, y + 13, 2, 1, L.tie); }
    }
    if (L.visor && !back) { R(c, x + 4, y + 5, 8, 2, L.visor); }
    if (L.phones) { R(c, x + 2, y + 4, 2, 4, L.phones); R(c, x + 12, y + 4, 2, 4, L.phones); R(c, x + 3, y - 1, 10, 1, L.phones); }
    if (L.cap) { R(c, x + 3, y - 1, 10, 3, L.cap); R(c, x + 4, y - 2, 8, 1, L.cap); if (!back) R(c, x + 3, y + 2, 10, 1, shade(L.cap)); R(c, x + 7, y - 2, 2, 1, shade(L.cap, 1.3)); }
    if (L.headdress) { R(c, x + 4, y + 0, 8, 2, L.headdress); R(c, x + 5, y - 1, 1, 1, L.headdress); R(c, x + 8, y - 1, 1, 1, L.headdress); R(c, x + 10, y - 1, 1, 1, L.headdress); }
  }
  function drawSide(c, x, y, st, L) {
    // 右向き基準
    const f = st === 1 ? 2 : st === -1 ? -2 : 0;
    R(c, x + 7 - f, y + 18, 2, 4, shade(L.pants)); R(c, x + 6 - f, y + 22, 3, 1, L.shoes);
    R(c, x + 7 + f, y + 18, 2, 4, L.pants); R(c, x + 7 + f, y + 22, 3, 1, L.shoes);
    R(c, x + 5, y + 10, 7, 8, L.coat);
    if (L.long) R(c, x + 5, y + 17, 7, 3, L.coat);
    if (L.dress) { R(c, x + 4, y + 15, 9, 6, L.coat); R(c, x + 4, y + 20, 9, 1, L.coatD); }
    if (L.apron) R(c, x + 10, y + 12, 2, 8, L.apron); else R(c, x + 10, y + 10, 2, 3, L.shirt);
    const a = st === 1 ? 1 : st === -1 ? -1 : 0;
    R(c, x + 7 + a, y + 11, 3, 6, L.coatD); R(c, x + 7 + a, y + 17, 3, 1, L.skin);
    R(c, x + 5, y + 2, 7, 8, L.skin);
    R(c, x + 12, y + 6, 1, 1, L.skin);
    if (L.glasses) R(c, x + 9, y + 5, 3, 2, '#c8d0d8');
    R(c, x + 10, y + 5, 1, 2, '#1a1418');
    if (L.mustache) R(c, x + 10, y + 8, 2, 1, L.mustache);
    if (L.beard) { R(c, x + 8, y + 7, 4, 3, L.beard); }
    const h = L.hair, s = L.style;
    if (s === 'bald') { R(c, x + 5, y + 4, 2, 4, h); }
    else { R(c, x + 4, y + 1, 8, 2, h); R(c, x + 4, y + 2, 3, 6, h); if (s === 'messy') { R(c, x + 3, y + 1, 1, 6, h); R(c, x + 11, y + 3, 1, 1, h); } }
    if (s === 'bun') R(c, x + 2, y + 1, 3, 4, h);
    if (s === 'braids') R(c, x + 4, y + 8, 2, 6, h);
    if (s === 'twin') R(c, x + 2, y + 2, 2, 9, h);
    if (s === 'long' || s === 'bob') R(c, x + 4, y + 8, 3, s === 'long' ? 5 : 1, h);
    if (s === 'hood') { R(c, x + 3, y - 1, 9, 3, L.coat); R(c, x + 3, y + 2, 4, 8, L.coat); }
    if (L.visor) R(c, x + 9, y + 5, 3, 2, L.visor);
    if (L.phones) R(c, x + 5, y + 4, 2, 4, L.phones);
    if (L.cap) { R(c, x + 4, y - 1, 8, 3, L.cap); R(c, x + 11, y + 2, 3, 1, shade(L.cap)); }
    if (L.headdress) R(c, x + 6, y + 0, 5, 2, L.headdress);
  }
  function shade(hex, k = 0.75) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, ((n >> 16) & 255) * k) | 0, g = Math.min(255, ((n >> 8) & 255) * k) | 0, b = Math.min(255, (n & 255) * k) | 0;
    return `rgb(${r},${g},${b})`;
  }

  /* ---------------- event sprites ---------------- */
  function drawSprite(c, kind, px, py, t) {
    const x = Math.round(px), y = Math.round(py);
    if (kind === 'body') {
      const L = LOOKS.genichiro;
      ell(c, x + 2, y + 10, 9, 4, '#2a0608'); ell(c, x - 1, y + 9, 5, 3, '#3a0a0e');
      ell(c, x + 10, y + 13, 12, 3, 'rgba(0,0,0,.4)');
      R(c, x + 4, y + 6, 13, 7, L.coat); R(c, x + 4, y + 12, 13, 1, L.coatD);
      R(c, x + 16, y + 7, 7, 2, L.pants); R(c, x + 16, y + 10, 7, 2, L.pants); R(c, x + 22, y + 7, 2, 2, L.shoes); R(c, x + 22, y + 10, 2, 2, L.shoes);
      R(c, x + 6, y + 4, 6, 2, L.coatD); R(c, x + 6, y + 13, 5, 2, L.coatD); R(c, x + 4, y + 4, 2, 2, L.skin); R(c, x + 4, y + 14, 2, 1, L.skin);
      R(c, x - 3, y + 6, 7, 7, L.skin); R(c, x - 3, y + 6, 7, 7, L.hair); R(c, x - 2, y + 7, 5, 4, shade(L.skin, 0.9));
      R(c, x - 1, y + 8, 2, 2, '#4a0a0e');
    } else if (kind === 'weapon') {
      ell(c, x + 8, y + 12, 6, 2, 'rgba(0,0,0,.4)');
      R(c, x + 3, y + 5, 10, 8, '#7a5a2a'); R(c, x + 3, y + 5, 10, 1, '#b8903a'); R(c, x + 2, y + 12, 12, 2, '#5a4020');
      circ(c, x + 8, y + 8.5, 2.8, '#e8dcc0'); R(c, x + 8, y + 7, 1, 2, '#222');
      R(c, x + 2, y + 4, 3, 3, '#5a0a10'); R(c, x + 11, y + 13, 3, 1, '#4a0a0e');
    } else if (kind === 'shards') {
      ell(c, x + 8, y + 9, 8, 5, 'rgba(20,30,50,.45)'); ell(c, x + 6, y + 10, 5, 3, 'rgba(120,160,220,.18)');
      const P = [[3, 6], [9, 5], [12, 9], [5, 11], [10, 12], [7, 8]];
      P.forEach(([a, b], i) => { c.fillStyle = i % 2 ? '#cfd6e0' : '#9aa8c0'; c.beginPath(); c.moveTo(x + a, y + b); c.lineTo(x + a + 3, y + b + 1); c.lineTo(x + a + 1, y + b + 3); c.fill(); });
      R(c, x + 2, y + 3, 1, 5, '#8a6a3a'); R(c, x + 1, y + 2, 3, 2, '#b8803a'); R(c, x + 12, y + 5, 1, 4, '#8a6a3a'); R(c, x + 11, y + 4, 3, 2, '#a85a4a');
      if (Math.sin(t * 0.004) > 0.6) R(c, x + 6, y + 9, 1, 1, '#fff');
    } else if (kind === 'vase') {
      c.fillStyle = '#9aa8c0'; c.beginPath(); c.moveTo(x + 5, y - 9); c.lineTo(x + 11, y - 9); c.lineTo(x + 12, y - 2); c.lineTo(x + 10, y + 1); c.lineTo(x + 6, y + 1); c.lineTo(x + 4, y - 2); c.fill();
      R(c, x + 6, y - 7, 1, 6, '#cfd6e0');
      R(c, x + 6, y - 15, 1, 6, '#8a6a3a'); R(c, x + 9, y - 14, 1, 5, '#8a6a3a'); R(c, x + 5, y - 16, 3, 2, '#b8803a'); R(c, x + 8, y - 15, 3, 2, '#a85a4a');
    } else if (kind === 'tray') {
      R(c, x + 7, y + 7, 2, 8, '#2a180c'); R(c, x + 4, y + 14, 8, 2, '#2a180c');
      ell(c, x + 8, y + 6, 7, 4, '#4e2e18'); ell(c, x + 8, y + 5, 6, 3, '#c8ccd2'); ell(c, x + 8, y + 5, 5, 2.3, '#a8acb4');
      ell(c, x + 6, y + 4, 2, 1.3, '#f4f0e8'); ell(c, x + 6, y + 4, 1.2, 0.8, '#8a4a20'); R(c, x + 10, y + 2, 2, 3, '#f4f0e8');
    } else if (kind === 'bag') {
      ell(c, x + 8, y + 14, 7, 2, 'rgba(0,0,0,.4)');
      R(c, x + 2, y + 6, 12, 8, '#141016'); R(c, x + 2, y + 6, 12, 1, '#3a3440'); R(c, x + 3, y + 5, 10, 2, '#1e1a22');
      c.strokeStyle = '#2a2430'; c.lineWidth = 1.4; c.beginPath(); c.arc(x + 8, y + 5, 3.5, Math.PI, 0); c.stroke();
      R(c, x + 7, y + 7, 2, 2, '#c9a45c');
    } else if (kind === 'bottles') {
      R(c, x + 3, y + 4, 3, 8, '#5a3a14'); R(c, x + 4, y + 1, 1, 3, '#5a3a14'); R(c, x + 3, y + 7, 3, 2, '#d8c8a0');
      c.save(); c.translate(x + 10, y + 11); c.rotate(1.3); R(c, -1, -4, 3, 8, '#2a5a2a'); R(c, 0, -7, 1, 3, '#2a5a2a'); c.restore();
      ell(c, x + 11, y + 13, 3, 1, 'rgba(160,110,40,.5)');
    }
  }

  /* ---------------- evidence icons (SVG) ---------------- */
  const S = 'stroke="#e8cf8f" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  const ICONS = {
    letter: `<svg viewBox="0 0 64 64"><rect x="8" y="16" width="48" height="34" rx="2" ${S}/><path d="M8 18l24 18 24-18" ${S}/><circle cx="32" cy="40" r="5" fill="#8a1e22"/></svg>`,
    drop: `<svg viewBox="0 0 64 64"><path d="M32 8C26 20 16 30 16 40a16 16 0 0 0 32 0c0-10-10-20-16-32z" fill="#5a0e14" stroke="#e8cf8f" stroke-width="2.4"/><path d="M24 40a8 8 0 0 0 6 8" stroke="#c86a6a" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    watch: `<svg viewBox="0 0 64 64"><circle cx="32" cy="36" r="20" ${S}/><circle cx="32" cy="36" r="16" stroke="#e8cf8f" stroke-width="1" fill="none" opacity=".5"/><path d="M32 16v-6M28 10h8" ${S}/><path d="M32 36l-8-4M32 36v-13" stroke="#f3e6c6" stroke-width="2.6" stroke-linecap="round"/><path d="M38 22l4 8-6 4 8 6" stroke="#9ab" stroke-width="1.4" fill="none"/><circle cx="32" cy="36" r="2" fill="#e8cf8f"/></svg>`,
    clock: `<svg viewBox="0 0 64 64"><path d="M14 52V26a18 18 0 0 1 36 0v26z" ${S}/><path d="M10 52h44" ${S}/><circle cx="32" cy="28" r="10" ${S}/><path d="M32 28v-6M32 28l5 3" ${S}/><path d="M46 44c3 2 4 6 2 8" stroke="#a8323a" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    vase: `<svg viewBox="0 0 64 64"><path d="M14 46l8-6 4 8M30 44l6-8 6 10M44 42l8 4-4 6" ${S}/><path d="M24 30c-2-8 2-14 8-14s10 6 8 14" stroke="#e8cf8f" stroke-width="2" stroke-dasharray="3 3" fill="none"/><ellipse cx="32" cy="52" rx="22" ry="5" fill="#2a4a7a" opacity=".7"/><path d="M20 22v-8M30 18v-8M40 22v-8" stroke="#b8803a" stroke-width="2"/></svg>`,
    fire: `<svg viewBox="0 0 64 64"><path d="M32 8c4 10 14 14 14 28a14 14 0 0 1-28 0c0-8 6-10 6-18 4 4 4 8 8 10 0-8-2-14 0-20z" fill="#7a2a0a" stroke="#ffb050" stroke-width="2.4" stroke-linejoin="round"/><path d="M32 30c3 4 6 6 6 10a6 6 0 0 1-12 0c0-4 4-6 6-10z" fill="#ffd27a"/><path d="M12 56h40" ${S}/></svg>`,
    doc: `<svg viewBox="0 0 64 64"><path d="M16 8h24l10 10v38H16z" ${S}/><path d="M40 8v10h10" ${S}/><path d="M22 28h20M22 35h20M22 42h12" stroke="#e8cf8f" stroke-width="2" opacity=".7"/><path d="M36 48l8-6" stroke="#a8323a" stroke-width="2.4"/></svg>`,
    rx: `<svg viewBox="0 0 64 64"><path d="M14 8h36v48H14z" ${S}/><text x="20" y="34" font-family="serif" font-size="20" font-style="italic" fill="#e8cf8f">Rx</text><path d="M20 42h24M20 48h16" stroke="#e8cf8f" stroke-width="2" opacity=".7"/><circle cx="44" cy="20" r="5" stroke="#a8323a" stroke-width="2" fill="none"/></svg>`,
    tea: `<svg viewBox="0 0 64 64"><path d="M14 26h30v8a15 15 0 0 1-30 0z" ${S}/><path d="M44 28h4a6 6 0 0 1 0 12h-5" ${S}/><path d="M8 52h48" ${S}/><path d="M24 12v8M30 10v8M36 12v8" stroke="#8ac8ff" stroke-width="2" stroke-dasharray="2 3"/></svg>`,
    ice: `<svg viewBox="0 0 64 64"><path d="M14 24l18-10 18 10v20L32 54 14 44z" fill="rgba(140,200,255,.15)" stroke="#bfe4ff" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 24l18 10 18-10M32 34v20" stroke="#bfe4ff" stroke-width="2" fill="none"/><path d="M22 14l4-6M44 12l-2-6" stroke="#e8cf8f" stroke-width="2"/></svg>`,
    bag: `<svg viewBox="0 0 64 64"><path d="M10 26h44v26H10z" fill="#1a1420" stroke="#e8cf8f" stroke-width="2.4"/><path d="M24 26v-6a8 8 0 0 1 16 0v6" ${S}/><path d="M10 34h44" stroke="#e8cf8f" stroke-width="1.4" opacity=".5"/><rect x="29" y="30" width="6" height="7" fill="#e8cf8f"/><path d="M18 46c2 3 4 3 6 0M38 48c2 3 4 3 6 0" stroke="#8ac8ff" stroke-width="2" fill="none"/></svg>`,
    voice: `<svg viewBox="0 0 64 64"><path d="M10 14h44v28H30l-12 10v-10h-8z" ${S}/><path d="M22 24v6M28 24v6M38 24v6M44 24v6" stroke="#e8cf8f" stroke-width="2.6" stroke-linecap="round"/></svg>`,
    slip: `<svg viewBox="0 0 64 64"><path d="M10 14h44v28H30l-12 10v-10h-8z" fill="rgba(168,50,58,.25)" stroke="#ff8a8a" stroke-width="2.4" stroke-linejoin="round"/><circle cx="32" cy="28" r="8" stroke="#e8cf8f" stroke-width="2" fill="none"/><path d="M32 28l-4-2M32 28v-5" stroke="#e8cf8f" stroke-width="2"/><path d="M50 8l4 4M54 8l-4 4" stroke="#ff8a8a" stroke-width="2"/></svg>`,
    key: `<svg viewBox="0 0 64 64"><circle cx="20" cy="32" r="10" ${S}/><path d="M30 32h26M46 32v8M52 32v6" ${S}/></svg>`,
  };

  return { T, WALK, WALL, FLOOR, hsh, renderMap, drawAnim, drawChar, drawSprite, LOOKS, ICONS, at, isWall };
})();
