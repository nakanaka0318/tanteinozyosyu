'use strict';
/* =========================================================
   聖典の儀式編：キャラクター・スプライト・タイトル背景・一枚絵
   ========================================================= */
Object.assign(ART.LOOKS, {
  bruno: { skin: '#e0b494', hair: '#d8d8dc', coat: '#5a4030', coatD: '#40301e', shirt: '#e8e0d0', tie: '#8a2a2a', pants: '#3a2e22', shoes: '#1a120a', style: 'bald', beard: '#d8d8dc', glasses: true, long: true },
  nagi: { skin: '#f0c8a8', hair: '#0e0b10', coat: '#14141a', coatD: '#0a0a0e', shirt: '#2a2a30', tie: '#8a1a2a', pants: '#14141a', shoes: '#0a0a0a', style: 'bob' },
  irving: { skin: '#f0d0b4', hair: '#e8c870', coat: '#e8e4dc', coatD: '#c8c4bc', shirt: '#2a2a30', tie: '#3a5a8a', pants: '#d8d4cc', shoes: '#3a2a1a', style: 'slick', long: true },
  shinomiya: { skin: '#f0c8a8', hair: '#3a2a20', coat: '#5a5e68', coatD: '#40444c', shirt: '#e8e8ec', tie: '#2a3a5a', pants: '#40444c', shoes: '#111', glasses: true, style: 'bun' },
});
ART.LOOKS.yogarasu_x = Object.assign({}, ART.LOOKS.yogarasu, { coat: '#1a0a10', tie: '#ff2040', visor: '#ff2040' });

(() => {
  const base = ART.drawSprite;
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  ART.drawSprite = function (c, kind, px, py, t) {
    const x = Math.round(px), y = Math.round(py);
    if (kind === 'brazier') {
      R(c, x + 3, y + 8, 10, 6, '#3a2a1a'); R(c, x + 2, y + 7, 12, 2, '#c9a45c');
      const f = Math.sin(t * 0.02) * 1.5;
      c.fillStyle = '#ff8a2a'; c.beginPath(); c.moveTo(x + 4, y + 8); c.quadraticCurveTo(x + 8, y - 4 + f, x + 12, y + 8); c.fill();
      c.fillStyle = '#ffe080'; c.beginPath(); c.moveTo(x + 6, y + 8); c.quadraticCurveTo(x + 8, y + 1 - f, x + 10, y + 8); c.fill();
    } else if (kind === 'papers') {
      R(c, x + 3, y + 6, 10, 7, '#f4ecd8'); R(c, x + 5, y + 4, 9, 7, '#ffffff'); for (let i = 0; i < 3; i++) R(c, x + 6, y + 6 + i * 2, 6, 1, '#8a7a62');
    } else base.call(this, c, kind, px, py, t);
  };
})();

/* ---------------- タイトル背景：燃える聖典 ---------------- */
const KTITLE = (() => {
  const SW = 384, SH = 216;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const embers = Array.from({ length: 70 }, () => ({ x: rnd(150, 234), y: rnd(60, 170), v: rnd(0.008, 0.02), p: rnd(0, 6) }));
  return {
    update(dt) { for (const e of embers) { e.y -= e.v * dt; e.x += Math.sin(e.y * 0.05 + e.p) * 0.2; if (e.y < 0) { e.y = rnd(140, 170); e.x = rnd(170, 214); } } },
    render(c) {
      c.setTransform(RS, 0, 0, RS, 0, 0);
      const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#060408'); g.addColorStop(1, '#1a0c06');
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
      const sc = VW < 384 ? VW / 300 : 1, sox = (VW - SW * sc) / 2, soy = VH < 300 ? 0 : VH * 0.6 - 120 * sc;
      c.setTransform(RS * sc, 0, 0, RS * sc, sox * RS, soy * RS);
      const glow = c.createRadialGradient(192, 150, 4, 192, 150, 120); glow.addColorStop(0, 'rgba(255,150,60,.45)'); glow.addColorStop(1, 'rgba(255,150,60,0)');
      c.fillStyle = glow; c.fillRect(0, 0, SW, SH);
      // 円卓の柱
      for (let i = 0; i < 6; i++) { c.fillStyle = '#120a08'; c.fillRect(30 + i * 64, 20, 10, 170); }
      // 聖火台
      c.fillStyle = '#2a1a10'; c.fillRect(176, 168, 32, 14); c.fillStyle = '#c9a45c'; c.fillRect(172, 166, 40, 3);
      const f = Math.sin(W.t * 0.01) * 3;
      c.fillStyle = '#ff7a2a'; c.beginPath(); c.moveTo(178, 166); c.quadraticCurveTo(192, 120 + f, 206, 166); c.fill();
      c.fillStyle = '#ffe080'; c.beginPath(); c.moveTo(184, 166); c.quadraticCurveTo(192, 138 - f, 200, 166); c.fill();
      // 聖典
      c.fillStyle = '#e8dcc0'; c.fillRect(185, 150, 14, 10); c.fillStyle = '#8a1a1a'; c.fillRect(191, 150, 2, 10);
      for (const e of embers) { c.fillStyle = `rgba(255,${180 + (e.p * 10 | 0)},90,${0.4 + Math.sin(W.t * 0.004 + e.p) * 0.3})`; c.fillRect(e.x, e.y, 1, 1); }
      c.setTransform(RS, 0, 0, RS, 0, 0);
    },
  };
})();

/* ---------------- 一枚絵（SVG） ---------------- */
Object.assign(SCENES, {
  council: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><radialGradient id="scoL" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#3a2a1a"/><stop offset="1" stop-color="#08060a"/></radialGradient></defs>
    <rect width="1600" height="900" fill="url(#scoL)"/>
    ${Array.from({ length: 7 }, (_, i) => `<rect x="${120 + i * 220}" y="0" width="36" height="560" fill="#140c08"/>`).join('')}
    <g transform="translate(0 -60)">
      <ellipse cx="800" cy="520" rx="520" ry="120" fill="#4a2e1a"/><ellipse cx="800" cy="510" rx="500" ry="108" fill="#6a4426"/>
      <circle cx="800" cy="500" r="40" fill="#c9a45c" opacity=".5"/>
      ${Array.from({ length: 10 }, (_, i) => { const a = i / 10 * Math.PI * 2; return `<g transform="translate(${800 + Math.cos(a) * 560} ${520 + Math.sin(a) * 140})"><rect x="-26" y="-90" width="52" height="90" rx="10" fill="#1a1014"/><circle cx="0" cy="-104" r="18" fill="#1a1014"/></g>`; }).join('')}
    </g>
  </svg>`,
  ritual: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><radialGradient id="sriF" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#ffb060" stop-opacity=".7"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient></defs>
    <rect width="1600" height="900" fill="#0a0604"/>
    <circle cx="800" cy="460" r="420" fill="url(#sriF)"/>
    <g transform="translate(0 -60)">
      <rect x="700" y="440" width="200" height="70" fill="#2a1a10"/><rect x="680" y="430" width="240" height="14" fill="#c9a45c"/>
      <path d="M720 430 C760 300 790 340 800 220 C810 340 840 300 880 430 Z" fill="#ff7a2a"/>
      <path d="M760 430 C780 350 795 370 800 300 C805 370 820 350 840 430 Z" fill="#ffe080"/>
      <g transform="translate(800 400) rotate(-6)"><rect x="-50" y="-34" width="100" height="68" fill="#e8dcc0"/><rect x="-3" y="-34" width="6" height="68" fill="#8a1a1a"/></g>
      ${Array.from({ length: 40 }, (_, i) => `<circle cx="${640 + (i * 47) % 320}" cy="${120 + (i * 61) % 300}" r="${2 + i % 3}" fill="#ffd080" opacity="${0.3 + (i % 4) * 0.15}"/>`).join('')}
    </g>
  </svg>`,
  farewell: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect width="1600" height="900" fill="#08060a"/>
    <path d="M0 640 C400 600 1200 620 1600 640 L1600 900 L0 900 Z" fill="#14100e"/>
    <g transform="translate(0 -40)">
      <g transform="translate(800 520)"><ellipse cx="0" cy="40" rx="140" ry="20" fill="rgba(0,0,0,.5)"/>
        <path d="M-120 30 C-60 0 60 0 120 30 L100 40 L-100 40 Z" fill="#0a0a10"/>
        <circle cx="-110" cy="20" r="18" fill="#e8d8d0"/><path d="M-128 14 C-128 -6 -92 -6 -92 14 Z" fill="#e8e8f0"/></g>
      ${Array.from({ length: 50 }, (_, i) => `<path d="M${(i * 131) % 1600} ${(i * 71) % 600} q6 -10 12 0 q-6 6 -12 0z" fill="#1a1a22" opacity=".7"/>`).join('')}
      ${Array.from({ length: 30 }, (_, i) => `<circle cx="${700 + (i * 53) % 200}" cy="${200 + (i * 37) % 300}" r="2" fill="#ffffff" opacity=".5"/>`).join('')}
    </g>
  </svg>`,
});

const RAVEN_SVG = `<svg viewBox="0 0 240 220" class="en-svg"><defs><radialGradient id="rvG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff2040" stop-opacity=".4"/><stop offset="1" stop-color="#ff2040" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="120" cy="110" rx="118" ry="104" fill="url(#rvG)"/>
  <g class="tent tl" fill="none" stroke="#2a0610" stroke-width="9" stroke-linecap="round"><path d="M96 100 C56 70 40 110 12 84"/><path d="M92 130 C52 140 40 180 14 176"/></g>
  <g class="tent tr" fill="none" stroke="#2a0610" stroke-width="9" stroke-linecap="round"><path d="M144 100 C184 70 200 110 228 84"/><path d="M148 130 C188 140 200 180 226 176"/></g>
  <g fill="none" stroke="#ff4060" stroke-width="2" opacity=".7" class="tent tl"><path d="M96 100 C56 70 40 110 12 84"/></g>
  <path d="M40 220 C50 160 86 136 120 134 C154 136 190 160 200 220 Z" fill="#06060a"/>
  <path d="M30 220 C20 170 40 140 70 130 L120 160 L170 130 C200 140 220 170 210 220 Z" fill="#0e0e14" opacity=".9"/>
  <path d="M120 140 L112 220 L128 220 Z" fill="#c8102e"/>
  <path d="M88 82 C88 46 152 46 152 82 C152 114 140 132 120 134 C100 132 88 114 88 82 Z" fill="#ecdcd4"/>
  <path d="M84 80 C80 40 160 40 156 80 C146 60 132 56 120 62 C108 56 94 60 84 80 Z" fill="#f0f0f8"/>
  <path d="M104 88 L116 90" stroke="#2a1a1a" stroke-width="3"/><path d="M136 88 L124 90" stroke="#2a1a1a" stroke-width="3"/>
  <circle cx="110" cy="94" r="3" fill="#ff2040"/><circle cx="130" cy="94" r="3" fill="#ff2040"/>
  <path d="M110 116 Q120 112 130 116" stroke="#8a2a2a" stroke-width="2" fill="none"/>
</svg>`;
