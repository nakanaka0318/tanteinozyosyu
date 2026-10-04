'use strict';
/* =========================================================
   いつもの探偵編：キャラクター・スプライト・タイトル背景・一枚絵
   ========================================================= */
Object.assign(ART.LOOKS, {
  akari: { skin: '#f6dcc8', hair: '#7a4030', coat: '#f4a0c0', coatD: '#d880a0', shirt: '#ffffff', tie: '#ffd0e0', pants: '#f4a0c0', shoes: '#ffffff', dress: true, long: true, style: 'long' },
  sora: { skin: '#f6dcc8', hair: '#2a2a3a', coat: '#7ab0f0', coatD: '#5a90d0', shirt: '#ffffff', tie: '#d8e8ff', pants: '#7ab0f0', shoes: '#ffffff', dress: true, style: 'twin' },
  manabe: { skin: '#ecc4a4', hair: '#1a1410', coat: '#2a2e3a', coatD: '#1c2028', shirt: '#e8e8ec', tie: '#3a5a8a', pants: '#2a2e3a', shoes: '#111', glasses: true, style: 'side' },
  mido: { skin: '#e0b494', hair: '#141210', coat: '#4a2a5a', coatD: '#341c40', shirt: '#14121a', tie: '#c9a45c', pants: '#1a1420', shoes: '#0a0a0a', glasses: true, style: 'slick', long: true },
  haibara: { skin: '#e8c0a0', hair: '#2a2018', coat: '#1a1a1e', coatD: '#101012', shirt: '#2a2a30', tie: '#2a2a30', pants: '#2a2a30', shoes: '#111', style: 'short', cap: '#1a1a1e' },
  okochi: { skin: '#ecc4a4', hair: '#1a1410', coat: '#ff7ab0', coatD: '#e05a90', shirt: '#ffffff', tie: '#ff7ab0', pants: '#3a3a4a', shoes: '#ffffff', glasses: true, style: 'short' },
});

(() => {
  const base = ART.drawSprite;
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  ART.drawSprite = function (c, kind, px, py, t) {
    const x = Math.round(px), y = Math.round(py);
    switch (kind) {
      case 'notebook': R(c, x + 3, y + 5, 10, 8, '#f4a0c0'); R(c, x + 4, y + 6, 8, 6, '#fff4f8'); R(c, x + 5, y + 7, 6, 1, '#c88aa0'); R(c, x + 5, y + 9, 5, 1, '#c88aa0'); break;
      case 'mark': R(c, x + 4, y + 7, 8, 2, '#ffe04a'); R(c, x + 7, y + 4, 2, 8, '#ffe04a'); R(c, x + 6, y + 6, 4, 4, 'rgba(255,224,74,.35)'); break;
      case 'fallen': {
        c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(x + 8, y + 13, 10, 3, 0, 0, 7); c.fill();
        R(c, x + 1, y + 5, 14, 8, '#2a2a30'); R(c, x + 2, y + 6, 12, 6, '#3a3a44'); c.fillStyle = '#e8e4c0'; c.beginPath(); c.arc(x + 8, y + 9, 3, 0, 7); c.fill();
        R(c, x - 2, y + 3, 4, 1, '#8a8a90'); R(c, x + 14, y + 2, 5, 1, '#8a8a90');
        for (let i = 0; i < 4; i++) R(c, x + 2 + i * 4, y + 14, 2, 1, '#c8e8ff');
        break;
      }
      case 'receiver': R(c, x + 5, y + 7, 6, 5, '#e8e8ec'); R(c, x + 6, y + 8, 4, 1, '#3a3a44'); R(c, x + 10, y + 4, 1, 3, '#8a8a90'); R(c, x + 6, y + 10, 1, 1, Math.sin(t * 0.01) > 0 ? '#ff4a5a' : '#5a1a1a'); break;
      case 'bin': R(c, x + 4, y + 5, 8, 9, '#3a3e48'); R(c, x + 3, y + 4, 10, 2, '#5a5e68'); R(c, x + 6, y + 3, 4, 2, '#e8e8ec'); break;
      case 'cdbook': R(c, x + 3, y + 6, 10, 8, '#7ab0f0'); R(c, x + 4, y + 7, 8, 6, '#f4a0c0'); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x + 8, y + 10, 2, 0, 7); c.fill(); break;
      case 'mail': R(c, x + 3, y + 6, 10, 7, '#f4ecd8'); R(c, x + 3, y + 6, 10, 1, '#c8b890'); R(c, x + 7, y + 8, 2, 2, '#c8304a'); break;
      default: base.call(this, c, kind, px, py, t);
    }
  };
})();

/* ---------------- タイトル背景：ペンライトの海 ---------------- */
const ITITLE = (() => {
  const SW = 384, SH = 216;
  const COLS = ['#ff4fd8', '#3ff0ff', '#ffc94a', '#ff7ab0', '#7ab0f0'];
  const lights = Array.from({ length: 140 }, (_, i) => ({ x: (i * 37) % SW + (i % 3), y: 150 + (i * 13) % 60, c: COLS[i % COLS.length], p: i * 0.7 }));
  return {
    update() {},
    render(c) {
      c.setTransform(RS, 0, 0, RS, 0, 0);
      const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#0a0614'); g.addColorStop(1, '#1a0a24');
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
      const sc = VW < 384 ? VW / 300 : 1, sox = (VW - SW * sc) / 2, soy = VH < 300 ? 0 : VH * 0.6 - 120 * sc;
      c.setTransform(RS * sc, 0, 0, RS * sc, sox * RS, soy * RS);
      // スポットライト
      for (let i = 0; i < 4; i++) {
        const a = Math.sin(W.t * 0.0008 + i * 1.7) * 0.35;
        c.save(); c.translate(60 + i * 88, -10); c.rotate(a);
        const sg = c.createLinearGradient(0, 0, 0, 180); sg.addColorStop(0, 'rgba(255,240,250,.35)'); sg.addColorStop(1, 'rgba(255,240,250,0)');
        c.fillStyle = sg; c.beginPath(); c.moveTo(-4, 0); c.lineTo(4, 0); c.lineTo(36, 180); c.lineTo(-36, 180); c.fill(); c.restore();
      }
      // ステージ
      c.fillStyle = '#14101c'; c.fillRect(70, 120, 244, 18); c.fillStyle = '#ff4fd8'; c.fillRect(70, 120, 244, 1);
      c.fillStyle = '#f4a0c0'; c.fillRect(188, 104, 8, 16); c.fillStyle = '#7a4030'; c.fillRect(188, 100, 8, 5);
      // ペンライト
      for (const l of lights) {
        const sw = Math.sin(W.t * 0.006 + l.p) * 3;
        c.strokeStyle = l.c; c.lineWidth = 1.4; c.globalAlpha = 0.85;
        c.beginPath(); c.moveTo(l.x, l.y); c.lineTo(l.x + sw, l.y - 8); c.stroke();
      }
      c.globalAlpha = 1;
      c.setTransform(RS, 0, 0, RS, 0, 0);
    },
  };
})();

/* ---------------- 一枚絵（SVG） ---------------- */
Object.assign(SCENES, {
  live: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><radialGradient id="slvS" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="#3a1a4a"/><stop offset="1" stop-color="#06040c"/></radialGradient></defs>
    <rect width="1600" height="900" fill="url(#slvS)"/>
    ${Array.from({ length: 6 }, (_, i) => `<path d="M${200 + i * 240} 0 L${150 + i * 240} 520 L${350 + i * 240} 520 Z" fill="rgba(255,230,250,.08)"/>`).join('')}
    <g transform="translate(0 -40)">
      <rect x="200" y="380" width="1200" height="60" fill="#1a1024"/><rect x="200" y="380" width="1200" height="4" fill="#ff4fd8"/>
      <g transform="translate(800 300)"><ellipse cx="0" cy="70" rx="40" ry="10" fill="rgba(0,0,0,.4)"/><path d="M-30 70 L-24 0 L24 0 L30 70 Z" fill="#f4a0c0"/><rect x="-18" y="-40" width="36" height="44" rx="6" fill="#ffffff"/><circle cx="0" cy="-62" r="22" fill="#f6dcc8"/><path d="M-26 -60 C-26 -96 26 -96 26 -60 L26 -20 L18 -40 L-18 -40 L-26 -20 Z" fill="#7a4030"/></g>
      ${Array.from({ length: 220 }, (_, i) => `<line x1="${(i * 73) % 1600}" y1="${520 + (i * 31) % 380}" x2="${(i * 73) % 1600 + ((i % 5) - 2) * 6}" y2="${490 + (i * 31) % 380}" stroke="${['#ff4fd8', '#3ff0ff', '#ffc94a', '#ff7ab0', '#7ab0f0'][i % 5]}" stroke-width="6" stroke-linecap="round" opacity=".85"/>`).join('')}
    </g>
  </svg>`,
  blackout: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect width="1600" height="900" fill="#020204"/>
    <g transform="translate(0 -60)">
      <line x1="800" y1="0" x2="800" y2="330" stroke="#3a3a44" stroke-width="4" stroke-dasharray="14 10"/>
      <g transform="translate(800 380) rotate(8)"><rect x="-70" y="-40" width="140" height="80" rx="8" fill="#2a2a30"/><circle cx="0" cy="0" r="28" fill="#e8e4c0" opacity=".25"/></g>
      ${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 233) % 1600}" cy="${560 + (i * 41) % 300}" r="3" fill="${['#ff4fd8', '#3ff0ff', '#ffc94a'][i % 3]}" opacity=".35"/>`).join('')}
    </g>
  </svg>`,
  encore: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect width="1600" height="900" fill="#08060e"/>
    <path d="M760 0 L840 0 L1000 520 L600 520 Z" fill="rgba(255,244,250,.18)"/>
    <g transform="translate(0 -40)">
      <ellipse cx="800" cy="440" rx="200" ry="30" fill="rgba(255,244,250,.2)"/>
      <g transform="translate(800 360)"><path d="M-30 70 L-24 0 L24 0 L30 70 Z" fill="#f4a0c0"/><rect x="-18" y="-40" width="36" height="44" rx="6" fill="#ffffff"/><circle cx="0" cy="-62" r="22" fill="#f6dcc8"/><path d="M-26 -60 C-26 -96 26 -96 26 -60 L26 -20 L18 -40 L-18 -40 L-26 -20 Z" fill="#7a4030"/></g>
      ${Array.from({ length: 60 }, (_, i) => `<line x1="${(i * 97) % 1600}" y1="${600 + (i * 37) % 280}" x2="${(i * 97) % 1600}" y2="${570 + (i * 37) % 280}" stroke="#ffc0e0" stroke-width="6" stroke-linecap="round" opacity=".7"/>`).join('')}
    </g>
  </svg>`,
});
