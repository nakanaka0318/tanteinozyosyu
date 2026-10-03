'use strict';
/* =========================================================
   怪盗と宝玉編：スプライト・タイトル背景・一枚絵
   ========================================================= */
Object.assign(ART.LOOKS, {
  houjou: { skin: '#dcb090', hair: '#c8c8cc', coat: '#3a2a1e', coatD: '#2a1e14', shirt: '#efe8d8', tie: '#8a1e22', pants: '#2a1e14', shoes: '#100a06', style: 'bald', mustache: '#bdbdc2', long: true },
  reika: { skin: '#f2ccaa', hair: '#2a1418', coat: '#8a1428', coatD: '#6a0e1e', shirt: '#f4e0e4', tie: '#e8c070', pants: '#6a0e1e', shoes: '#1a0a0e', dress: true, style: 'long' },
  washio: { skin: '#d8a888', hair: '#2a2420', coat: '#6a5a44', coatD: '#4e4230', shirt: '#dcd6c8', tie: '#2a3a5a', pants: '#2a2a30', shoes: '#141210', long: true, style: 'side', cap: '#3a3226' },
  hiiragi: { skin: '#e0b896', hair: '#8a8a92', coat: '#14141a', coatD: '#0a0a0e', shirt: '#ffffff', tie: '#5a1a2a', pants: '#14141a', shoes: '#050505', style: 'side', long: true },
  hayase: { skin: '#eac4a0', hair: '#4a3a2a', coat: '#b8b0a0', coatD: '#8a8476', shirt: '#f0ece4', tie: '#2a4a6a', pants: '#6a645a', shoes: '#2a2016', glasses: true, style: 'slick' },
  mina: { skin: '#f2cdac', hair: '#3a2418', coat: '#2a2a3a', coatD: '#1c1c28', shirt: '#f4f0e8', tie: '#8a1e22', pants: '#2a2a3a', shoes: '#111111', dress: true, apron: '#ebe6dc', headdress: '#f8f4ec', style: 'bun' },
  yogarasu: { skin: '#e8d8d0', hair: '#e8e8f0', coat: '#0a0a10', coatD: '#000000', shirt: '#2a0a14', tie: '#c8102e', pants: '#0a0a10', shoes: '#000000', long: true, style: 'messy', visor: '#14141a' },
});

/* ---------------- タイトル背景：緋色の月 ---------------- */
const TTITLE = (() => {
  const SW = 384, SH = 216;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const stars = Array.from({ length: 90 }, () => ({ x: rnd(0, SW), y: rnd(0, 140), s: Math.random() < 0.15 ? 1.4 : 0.7, p: rnd(0, 6) }));
  const crows = Array.from({ length: 9 }, () => ({ x: rnd(-40, SW), y: rnd(20, 110), v: rnd(0.012, 0.03), f: rnd(0, 6), s: rnd(0.7, 1.4) }));
  const bld = []; let x = -10;
  while (x < SW + 10) { const w = rnd(16, 34), h = rnd(30, 90); bld.push({ x, w, h, seed: rnd(0, 99) }); x += w + rnd(0, 4); }
  function crow(c, cx, cy, s, f) {
    const w = Math.sin(f) * 3 * s;
    c.strokeStyle = '#05030a'; c.lineWidth = 1.4 * s; c.beginPath();
    c.moveTo(cx - 7 * s, cy - w); c.quadraticCurveTo(cx - 3 * s, cy - 2 * s - w * 0.3, cx, cy); c.quadraticCurveTo(cx + 3 * s, cy - 2 * s - w * 0.3, cx + 7 * s, cy - w); c.stroke();
  }
  return {
    update(dt) {
      for (const k of crows) { k.x += k.v * dt; k.f += dt * 0.012; if (k.x > SW + 30) { k.x = -30; k.y = rnd(20, 110); } }
    },
    render(c) {
      c.setTransform(RS, 0, 0, RS, 0, 0);
      const g = c.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, '#04040c'); g.addColorStop(0.55, '#140a1c'); g.addColorStop(1, '#2a0a14');
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
      const sc = VW < 384 ? VW / 300 : 1, sox = (VW - SW * sc) / 2, soy = VH < 300 ? 0 : VH * 0.6 - 120 * sc;
      c.setTransform(RS * sc, 0, 0, RS * sc, sox * RS, soy * RS);
      for (const s of stars) { c.fillStyle = `rgba(255,240,230,${0.35 + Math.sin(W.t * 0.002 + s.p) * 0.3})`; c.fillRect(s.x, s.y, s.s, s.s); }
      // 緋色の月
      const mx = 250, my = 70, mr = 46;
      const halo = c.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 2.6); halo.addColorStop(0, 'rgba(220,40,60,.45)'); halo.addColorStop(1, 'rgba(220,40,60,0)');
      c.fillStyle = halo; c.beginPath(); c.arc(mx, my, mr * 2.6, 0, 7); c.fill();
      const mg = c.createRadialGradient(mx - 14, my - 14, 4, mx, my, mr); mg.addColorStop(0, '#ff8a7a'); mg.addColorStop(0.6, '#d0283a'); mg.addColorStop(1, '#7a0e1e');
      c.fillStyle = mg; c.beginPath(); c.arc(mx, my, mr, 0, 7); c.fill();
      c.fillStyle = 'rgba(90,10,20,.35)'; [[mx + 12, my - 8, 8], [mx - 16, my + 12, 6], [mx + 6, my + 20, 4]].forEach(([a, b, r]) => { c.beginPath(); c.arc(a, b, r, 0, 7); c.fill(); });
      // 雲
      c.fillStyle = 'rgba(10,6,16,.75)';
      for (let i = 0; i < 4; i++) { const cx = ((W.t * 0.004 + i * 110) % 520) - 70; c.beginPath(); c.ellipse(cx, 95 + i * 9, 60, 6, 0, 0, 7); c.fill(); }
      // 街並み
      for (const b of bld) {
        c.fillStyle = '#07040c'; c.fillRect(b.x, SH - b.h, b.w, b.h);
        for (let yy = SH - b.h + 5; yy < SH - 6; yy += 6) for (let xx = b.x + 3; xx < b.x + b.w - 3; xx += 5) if (Math.sin(b.seed + xx * 2.3 + yy * 1.3) > 0.62) { c.fillStyle = 'rgba(255,200,120,.75)'; c.fillRect(xx, yy, 2, 3); }
      }
      // ホテルの尖塔
      c.fillStyle = '#05030a';
      c.beginPath(); c.moveTo(232, SH); c.lineTo(232, 120); c.lineTo(240, 112); c.lineTo(244, 74); c.lineTo(248, 112); c.lineTo(256, 120); c.lineTo(256, SH); c.fill();
      for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(255,210,140,.8)'; c.fillRect(238 + (i % 2) * 8, 128 + i * 12, 3, 4); }
      // 怪盗のシルエット
      const fl = Math.sin(W.t * 0.004) * 2;
      c.fillStyle = '#000';
      c.beginPath(); c.moveTo(244, 74); c.lineTo(241, 66); c.lineTo(240, 58); c.lineTo(237, 56 + fl); c.lineTo(230 - fl, 66 + fl); c.lineTo(239, 62); c.lineTo(241, 74); c.fill();
      c.beginPath(); c.arc(243.5, 54, 2.6, 0, 7); c.fill();
      c.beginPath(); c.moveTo(240, 52); c.lineTo(247, 52); c.lineTo(246, 50); c.lineTo(241, 50); c.fill();
      for (const k of crows) crow(c, k.x, k.y, k.s, k.f);
      c.setTransform(RS, 0, 0, RS, 0, 0);
      const vg = c.createLinearGradient(0, VH * 0.75, 0, VH); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)');
      c.fillStyle = vg; c.fillRect(0, 0, VW, VH);
    },
  };
})();

/* ---------------- 一枚絵（SVG） ---------------- */
const SCENES = {
  moon: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="smSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03030a"/><stop offset=".6" stop-color="#1a0814"/><stop offset="1" stop-color="#3a0a16"/></linearGradient>
      <radialGradient id="smMoon" cx=".42" cy=".38" r=".6"><stop offset="0" stop-color="#ff9a86"/><stop offset=".55" stop-color="#d0283a"/><stop offset="1" stop-color="#6a0a18"/></radialGradient>
      <radialGradient id="smHalo" cx=".5" cy=".5" r=".5"><stop offset=".45" stop-color="#e02a40" stop-opacity=".55"/><stop offset="1" stop-color="#e02a40" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#smSky)"/>
    <g fill="#fff" opacity=".6">${Array.from({ length: 70 }, (_, i) => `<circle cx="${(i * 233) % 1600}" cy="${(i * 97) % 520}" r="${i % 7 === 0 ? 2 : 1}"/>`).join('')}</g>
    <circle cx="800" cy="380" r="520" fill="url(#smHalo)"/>
    <circle class="sc-moon" cx="800" cy="380" r="300" fill="url(#smMoon)"/>
    <g fill="#6a0a18" opacity=".35"><circle cx="880" cy="320" r="46"/><circle cx="700" cy="460" r="34"/><circle cx="860" cy="500" r="22"/></g>
    <g class="sc-cloud" fill="#0a0410" opacity=".8"><ellipse cx="300" cy="560" rx="380" ry="34"/><ellipse cx="1350" cy="520" rx="420" ry="30"/></g>
    <path d="M0 900 L0 760 L1600 760 L1600 900 Z" fill="#030206"/>
    <g stroke="#1a1420" stroke-width="6"><path d="M0 760 L1600 760"/>${Array.from({ length: 33 }, (_, i) => `<path d="M${i * 50} 760 L${i * 50} 712"/>`).join('')}<path d="M0 712 L1600 712"/></g>
    <g class="sc-thief" fill="#000">
      <path class="sc-cape" d="M800 470 C760 520 700 600 640 700 C700 690 740 700 790 720 L800 560 L810 720 C860 700 900 690 960 700 C900 600 840 520 800 470 Z"/>
      <path d="M776 520 L770 712 L790 712 L800 600 L810 712 L830 712 L824 520 Z"/>
      <circle cx="800" cy="446" r="26"/>
      <path d="M760 432 L840 432 L834 420 L818 418 L812 400 L788 400 L782 418 L766 420 Z"/>
      <path d="M770 452 L830 452 L826 460 L774 460 Z" fill="#c8102e"/>
    </g>
    <g class="sc-crows" fill="none" stroke="#05030a" stroke-width="6" stroke-linecap="round">
      <path d="M430 300 q30 -24 54 0 q24 -24 54 0"/><path d="M1120 250 q26 -20 46 0 q20 -20 46 0"/><path d="M1220 340 q20 -16 36 0 q16 -16 36 0"/><path d="M360 380 q18 -14 32 0 q14 -14 32 0"/>
    </g>
  </svg>`,
  funeral: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="sfSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2e36"/><stop offset="1" stop-color="#5a5e66"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#sfSky)"/>
    <path d="M0 640 C300 600 600 620 900 600 C1200 585 1400 610 1600 600 L1600 900 L0 900 Z" fill="#2a2e30"/>
    <g fill="#1a1c20">
      <path d="M180 640 L180 520 Q220 480 260 520 L260 640 Z"/><path d="M1320 630 L1320 540 Q1350 510 1380 540 L1380 630 Z"/><path d="M1480 620 L1480 560 Q1500 540 1520 560 L1520 620 Z"/>
      <path d="M720 690 L720 470 Q800 400 880 470 L880 690 Z"/>
    </g>
    <g fill="#c8ccd2" opacity=".8"><rect x="770" y="520" width="60" height="6"/><rect x="796" y="494" width="8" height="60"/></g>
    <g fill="#0a0a0c">
      ${[[340, 690, 1], [470, 700, 1.1], [600, 705, .95], [1010, 700, 1.05], [1140, 695, 1], [1260, 688, .9]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-70 -150 Q0 -230 70 -150 Z"/><rect x="-3" y="-150" width="6" height="70"/><path d="M-24 -84 L24 -84 L30 60 L-30 60 Z"/><circle cx="0" cy="-100" r="18"/></g>`).join('')}
      <g transform="translate(800 760)"><path d="M-80 -170 Q0 -260 80 -170 Z" fill="#14141a"/><rect x="-3" y="-170" width="6" height="80"/><path d="M-26 -92 L26 -92 L32 70 L-32 70 Z"/><circle cx="0" cy="-108" r="20"/><path d="M-18 -126 L18 -126 L16 -116 L-16 -116 Z" fill="#6a4a2c"/></g>
    </g>
    <g class="sc-rain" stroke="rgba(220,230,240,.35)" stroke-width="2">${Array.from({ length: 120 }, (_, i) => `<path d="M${(i * 137) % 1700 - 50} ${(i * 71) % 900} l-12 40"/>`).join('')}</g>
    <rect width="1600" height="900" fill="#000" opacity=".15"/>
  </svg>`,
  plane: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="spSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2a5a"/><stop offset=".55" stop-color="#d86a6a"/><stop offset="1" stop-color="#ffb860"/></linearGradient>
      <radialGradient id="spSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2c8"/><stop offset=".4" stop-color="#ffc870" stop-opacity=".8"/><stop offset="1" stop-color="#ffc870" stop-opacity="0"/></radialGradient></defs>
    <rect width="1600" height="900" fill="url(#spSky)"/>
    <circle cx="1100" cy="700" r="300" fill="url(#spSun)"/>
    <g fill="#2a1a2a" opacity=".55"><ellipse cx="300" cy="300" rx="260" ry="20"/><ellipse cx="1300" cy="240" rx="320" ry="18"/></g>
    <path d="M0 760 L1600 760 L1600 900 L0 900 Z" fill="#141018"/>
    <g fill="#ffd27a">${Array.from({ length: 20 }, (_, i) => `<rect x="${i * 85}" y="780" width="22" height="4"/>`).join('')}</g>
    <path class="sc-trail" d="M200 720 C500 640 760 520 980 400" stroke="rgba(255,255,255,.45)" stroke-width="5" fill="none" stroke-dasharray="8 10"/>
    <g class="sc-plane" transform="translate(1000 390) rotate(-24)" fill="#0c0a12">
      <path d="M-120 -8 L100 -12 Q130 -10 136 0 Q130 10 100 12 L-120 8 Z"/>
      <path d="M-10 -10 L-60 -90 L-30 -90 L40 -10 Z"/><path d="M-10 10 L-60 90 L-30 90 L40 10 Z"/>
      <path d="M-110 -8 L-140 -50 L-122 -50 L-88 -8 Z"/>
    </g>
  </svg>`,
};
