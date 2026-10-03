'use strict';
/* =========================================================
   復活の狼煙編：キャラクター・スプライト・タイトル背景・一枚絵
   ========================================================= */
Object.assign(ART.LOOKS, {
  anneliese: { skin: '#f6dcc8', hair: '#e8c870', coat: '#8a1a2a', coatD: '#6a1020', shirt: '#f4e8e0', tie: '#c9a45c', pants: '#6a1020', shoes: '#1a0a0e', dress: true, long: true, style: 'long' },
  franz: { skin: '#e0b48e', hair: '#3a2a1e', coat: '#2a2e3a', coatD: '#1c202a', shirt: '#e8e4dc', tie: '#6a2a3a', pants: '#2a2e3a', shoes: '#111', style: 'slick', mustache: '#3a2a1e', long: true },
  klaus: { skin: '#e4b896', hair: '#a8a8ae', coat: '#1a2a4a', coatD: '#101c34', shirt: '#e8e4dc', tie: '#c9a45c', pants: '#1a2a4a', shoes: '#0a0a0a', style: 'side', cap: '#1a2a4a', mustache: '#a8a8ae' },
  hanna: { skin: '#f0c8a8', hair: '#c89a5a', coat: '#3a4a3a', coatD: '#2a382a', shirt: '#e8e4dc', tie: '#1a2a1a', pants: '#2a382a', shoes: '#111', style: 'bun', cap: '#2a382a' },
  milo: { skin: '#e8c0a0', hair: '#2a1e14', coat: '#f0ece4', coatD: '#d0c8bc', shirt: '#ffffff', tie: '#1a1a1a', pants: '#1a1a1a', shoes: '#0a0a0a', style: 'short' },
  otto: { skin: '#dcb090', hair: '#d8d8dc', coat: '#5a4a3a', coatD: '#40342a', shirt: '#d8d0c0', tie: '#3a5a3a', pants: '#3a3226', shoes: '#1a120a', style: 'bald', beard: '#d8d8dc', cap: '#3a3226' },
  ida: { skin: '#f2cdac', hair: '#1a1416', coat: '#8a7a5a', coatD: '#6a5c44', shirt: '#e8e4dc', tie: '#1a1a1a', pants: '#2a2622', shoes: '#111', style: 'bob' },
  dorothy: { skin: '#f8e0d4', hair: '#c8b0e8', coat: '#f4f0fa', coatD: '#d8d0e8', shirt: '#ffffff', tie: '#a888d8', pants: '#e8e0f4', shoes: '#a888d8', dress: true, long: true, style: 'twin' },
});

(() => {
  const base = SKYART.drawSprite;
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  SKYART.drawSprite = function (c, kind, px, py, t) {
    const x = Math.round(px), y = Math.round(py);
    if (kind === 'violin') {
      R(c, x + 1, y + 6, 14, 7, '#2a1a12'); R(c, x + 1, y + 6, 14, 1, '#4a3020');
      c.fillStyle = '#a8501e'; c.beginPath(); c.ellipse(x + 6, y + 9.5, 4, 2.6, 0, 0, 7); c.fill();
      R(c, x + 9, y + 9, 5, 1, '#3a1a0a'); R(c, x + 4, y + 9, 1, 1, '#1a0a04'); R(c, x + 7, y + 9, 1, 1, '#1a0a04');
    } else if (kind === 'vent') {
      R(c, x + 3, y + 2, 10, 6, '#7a7e88'); for (let i = 0; i < 3; i++) R(c, x + 4, y + 3 + i * 2, 8, 1, '#3a3e48');
    } else if (kind === 'brake') {
      R(c, x + 6, y + 2, 4, 10, '#c8302a'); R(c, x + 5, y + 10, 6, 3, '#e8e0d0'); R(c, x + 7, y + 4, 2, 2, '#fff');
    } else base.call(this, c, kind, px, py, t);
  };
})();

/* ---------------- タイトル背景：狼煙と夜行列車 ---------------- */
const RTITLE = (() => {
  const SW = 384, SH = 216;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const stars = Array.from({ length: 90 }, () => ({ x: rnd(0, SW), y: rnd(0, 120), p: rnd(0, 6) }));
  const puffs = [];
  let tx = -200;
  return {
    update(dt) {
      tx += dt * 0.03; if (tx > SW + 60) tx = -220;
      if (Math.random() < dt / 120) puffs.push({ x: 300 + rnd(-1.5, 1.5), y: 132, r: 1.6, a: 0.42 });
      for (const p of puffs) { p.y -= dt * 0.014; p.x += dt * 0.004 + Math.sin(p.y * 0.08) * 0.05; p.r = Math.min(9, p.r + dt * 0.0026); p.a -= dt * 0.00008; }
      while (puffs.length && puffs[0].a <= 0) puffs.shift();
    },
    render(c) {
      c.setTransform(RS, 0, 0, RS, 0, 0);
      const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#060814'); g.addColorStop(0.7, '#1a1a30'); g.addColorStop(1, '#3a2a30');
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
      const sc = VW < 384 ? VW / 300 : 1, sox = (VW - SW * sc) / 2, soy = VH < 300 ? 0 : VH * 0.6 - 120 * sc;
      c.setTransform(RS * sc, 0, 0, RS * sc, sox * RS, soy * RS);
      for (const s of stars) { c.fillStyle = `rgba(230,236,255,${0.3 + Math.sin(W.t * 0.002 + s.p) * 0.25})`; c.fillRect(s.x, s.y, 0.8, 0.8); }
      // 山並み
      c.fillStyle = '#0c0c18'; c.beginPath(); c.moveTo(0, 150); for (let x = 0; x <= SW; x += 24) c.lineTo(x, 130 + Math.sin(x * 0.05) * 14); c.lineTo(SW, SH); c.lineTo(0, SH); c.fill();
      // 狼煙
      for (const p of puffs) { c.fillStyle = `rgba(220,214,230,${Math.max(0, p.a)})`; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); }
      c.fillStyle = '#ffb060'; c.beginPath(); c.arc(300, 136, 2.5 + Math.sin(W.t * 0.02) * 0.6, 0, 7); c.fill();
      // 鉄橋と列車
      c.fillStyle = '#05060c'; c.fillRect(0, 168, SW, 4);
      for (let x = 0; x < SW; x += 16) { c.beginPath(); c.moveTo(x, 172); c.lineTo(x + 8, 192); c.lineTo(x + 16, 172); c.strokeStyle = '#05060c'; c.lineWidth = 1.5; c.stroke(); }
      for (let i = 0; i < 6; i++) {
        const cx = tx - i * 34;
        c.fillStyle = '#0a0a14'; c.fillRect(cx, 152, 32, 16);
        for (let w = 0; w < 4; w++) { c.fillStyle = 'rgba(255,214,140,.85)'; c.fillRect(cx + 3 + w * 7, 156, 4, 4); }
      }
      c.fillStyle = '#0a0a14'; c.beginPath(); c.moveTo(tx + 32, 152); c.lineTo(tx + 42, 160); c.lineTo(tx + 42, 168); c.lineTo(tx + 32, 168); c.fill();
      c.fillStyle = '#fff4c8'; c.fillRect(tx + 40, 161, 2, 2);
      c.fillStyle = '#04050a'; c.fillRect(0, 192, SW, 30);
      c.setTransform(RS, 0, 0, RS, 0, 0);
    },
  };
})();

/* ---------------- 一枚絵（SVG） ---------------- */
Object.assign(SCENES, {
  letter: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect width="1600" height="900" fill="#1a1410"/>
    <circle cx="800" cy="360" r="420" fill="rgba(255,214,150,.14)"/>
    <g transform="translate(800 330) rotate(-3)">
      <rect x="-300" y="-230" width="600" height="420" fill="#f4ecd8"/>
      ${Array.from({ length: 11 }, (_, i) => `<rect x="-250" y="${-180 + i * 34}" width="${360 + ((i * 53) % 120)}" height="5" fill="#8a7a62" opacity=".55"/>`).join('')}
      <path d="M120 150 C150 130 190 160 230 140" stroke="#3a6ad8" stroke-width="5" fill="none"/>
    </g>
    <rect x="560" y="600" width="480" height="160" fill="#4a4e58"/><rect x="560" y="600" width="480" height="20" fill="#6a6e78"/><rect x="780" y="660" width="40" height="40" fill="#c9a45c"/>
  </svg>`,
  dream: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><radialGradient id="sdrBg" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#e8d8ff"/><stop offset=".5" stop-color="#8a6ac8"/><stop offset="1" stop-color="#1a1030"/></radialGradient></defs>
    <rect width="1600" height="900" fill="url(#sdrBg)"/>
    ${Array.from({ length: 50 }, (_, i) => `<circle cx="${(i * 197) % 1600}" cy="${(i * 113) % 900}" r="${2 + (i % 4)}" fill="#ffffff" opacity="${0.3 + (i % 5) * 0.12}"/>`).join('')}
    ${Array.from({ length: 6 }, (_, i) => `<circle cx="${300 + i * 220}" cy="${200 + (i % 2) * 380}" r="${40 + (i % 3) * 20}" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/>`).join('')}
    <g transform="translate(800 520)"><ellipse cx="0" cy="40" rx="70" ry="60" fill="#ffffff"/><circle cx="0" cy="-30" r="44" fill="#ffffff"/>
      <ellipse cx="-18" cy="-100" rx="12" ry="44" fill="#ffffff"/><ellipse cx="18" cy="-104" rx="12" ry="46" fill="#ffffff"/>
      <circle cx="-14" cy="-34" r="5" fill="#a888d8"/><circle cx="14" cy="-34" r="5" fill="#a888d8"/></g>
    <path d="M0 760 C400 700 1200 820 1600 740 L1600 900 L0 900 Z" fill="rgba(255,255,255,.18)"/>
  </svg>`,
  station: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="sstSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ab0c8"/><stop offset="1" stop-color="#e8e4dc"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#sstSky)"/>
    <path d="M0 120 L800 20 L1600 120 L1600 160 L0 160 Z" fill="#3a3e48"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 200 + 60}" y="140" width="14" height="500" fill="#4a4e58"/>`).join('')}
    <rect x="0" y="360" width="1600" height="260" fill="#6a2a20"/><rect x="0" y="360" width="1600" height="30" fill="#4a1a14"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 140 + 20}" y="420" width="100" height="70" fill="#2a2e3a"/>`).join('')}
    <rect x="0" y="600" width="1600" height="300" fill="#8a8478"/><rect x="0" y="600" width="1600" height="16" fill="#e8c040"/>
  </svg>`,
});
