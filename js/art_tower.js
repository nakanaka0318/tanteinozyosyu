'use strict';
/* =========================================================
   巫女の祭典編：キャラクター・スプライト・タイトル背景・一枚絵
   ========================================================= */
Object.assign(ART.LOOKS, {
  multigate: { skin: '#f6dcc8', hair: '#f0d890', coat: '#f2eee6', coatD: '#d6cfc0', shirt: '#ffffff', tie: '#c9a45c', pants: '#e8e2d6', shoes: '#c9a45c', dress: true, long: true, style: 'long' },
  oswald: { skin: '#e2b896', hair: '#6a5a4a', coat: '#4a3a2a', coatD: '#34281c', shirt: '#d8d0c0', tie: '#2a4a2a', pants: '#2e2a24', shoes: '#141008', style: 'side', mustache: '#5a4a3a', long: true },
  harold: { skin: '#e8c0a0', hair: '#c8a060', coat: '#8a1a1e', coatD: '#6a1014', shirt: '#e8e0d0', tie: '#c9a45c', pants: '#1a1a22', shoes: '#0a0a0a', style: 'short', cap: '#14141a' },
  edgar: { skin: '#e4bc9c', hair: '#d8d8dc', coat: '#1a1a22', coatD: '#0e0e14', shirt: '#ffffff', tie: '#ffffff', pants: '#1a1a22', shoes: '#0a0a0a', style: 'bald', long: true },
  lily: { skin: '#f4d4bc', hair: '#8a5a3a', coat: '#3a3a52', coatD: '#2a2a3e', shirt: '#f4f0e8', tie: '#c9a45c', pants: '#3a3a52', shoes: '#111', dress: true, apron: '#ebe6dc', headdress: '#f8f4ec', style: 'bob' },
});

/* マップ用の追加スプライト（ARTに差し込む） */
(() => {
  const base = ART.drawSprite;
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  ART.drawSprite = function (c, kind, px, py, t) {
    const x = Math.round(px), y = Math.round(py);
    if (kind === 'rootcore') {
      const p = 0.5 + Math.sin(t * 0.006) * 0.3;
      c.fillStyle = `rgba(120,220,90,${0.15 + p * 0.2})`; c.beginPath(); c.arc(x + 8, y + 6, 13, 0, 7); c.fill();
      c.strokeStyle = '#3a2a14'; c.lineWidth = 2.2;
      [[-8, 14], [24, 12], [-4, -6], [20, -8], [8, 18]].forEach(([dx, dy], i) => { c.beginPath(); c.moveTo(x + 8, y + 6); c.quadraticCurveTo(x + 8 + dx * 0.4 + Math.sin(t * 0.003 + i) * 2, y + 6 + dy * 0.6, x + dx, y + dy); c.stroke(); });
      c.fillStyle = '#4a3418'; c.beginPath(); c.arc(x + 8, y + 6, 6, 0, 7); c.fill();
      c.fillStyle = `rgba(150,255,110,${p})`; c.beginPath(); c.arc(x + 8, y + 6, 3, 0, 7); c.fill();
    } else if (kind === 'deadroot') {
      c.strokeStyle = '#2a2018'; c.lineWidth = 1.6;
      [[-6, 14], [22, 12], [8, 16]].forEach(([dx, dy]) => { c.beginPath(); c.moveTo(x + 8, y + 8); c.lineTo(x + dx, y + dy); c.stroke(); });
      c.fillStyle = '#2a2018'; c.beginPath(); c.arc(x + 8, y + 8, 4, 0, 7); c.fill();
    } else if (kind === 'phone') {
      R(c, x + 4, y + 6, 8, 7, '#1a1a22'); R(c, x + 5, y + 7, 6, 3, '#5a8aff'); R(c, x + 7, y + 11, 2, 1, '#8a8a92');
    } else if (kind === 'teaset') {
      R(c, x + 2, y + 10, 12, 2, '#d8d0c0'); c.fillStyle = '#f4f0e8'; c.beginPath(); c.arc(x + 6, y + 8, 3, 0, 7); c.fill(); c.beginPath(); c.arc(x + 11, y + 9, 2, 0, 7); c.fill();
      R(c, x + 5, y + 7, 2, 1, '#8a4a20');
    } else base.call(this, c, kind, px, py, t);
  };
})();

/* ---------------- タイトル背景：霧の時計台 ---------------- */
const CTITLE = (() => {
  const SW = 384, SH = 216;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const stars = Array.from({ length: 70 }, () => ({ x: rnd(0, SW), y: rnd(0, 110), s: Math.random() < 0.12 ? 1.4 : 0.7, p: rnd(0, 6) }));
  const fog = Array.from({ length: 10 }, (_, i) => ({ x: rnd(-80, SW), y: 150 + (i % 5) * 12, r: rnd(50, 90), v: 0.004 + (i % 3) * 0.004 }));
  return {
    update(dt) { for (const k of fog) { k.x += k.v * dt; if (k.x > SW + k.r) k.x = -k.r * 2; } },
    render(c) {
      c.setTransform(RS, 0, 0, RS, 0, 0);
      const g = c.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, '#05070e'); g.addColorStop(0.6, '#141a2a'); g.addColorStop(1, '#2a2a36');
      c.fillStyle = g; c.fillRect(0, 0, VW, VH);
      const sc = VW < 384 ? VW / 300 : 1, sox = (VW - SW * sc) / 2, soy = VH < 300 ? 0 : VH * 0.6 - 120 * sc;
      c.setTransform(RS * sc, 0, 0, RS * sc, sox * RS, soy * RS);
      for (const s of stars) { c.fillStyle = `rgba(230,236,255,${0.3 + Math.sin(W.t * 0.002 + s.p) * 0.25})`; c.fillRect(s.x, s.y, s.s, s.s); }
      // 月
      c.fillStyle = 'rgba(230,226,200,.12)'; c.beginPath(); c.arc(70, 40, 40, 0, 7); c.fill();
      c.fillStyle = '#ece6cc'; c.beginPath(); c.arc(70, 40, 15, 0, 7); c.fill();
      // 街並み
      c.fillStyle = '#080a12';
      for (let i = 0; i < 22; i++) { const bx = i * 19 - 6, bh = 26 + ((i * 37) % 30); c.fillRect(bx, SH - bh, 17, bh); if (i % 3 === 0) { c.beginPath(); c.moveTo(bx, SH - bh); c.lineTo(bx + 8, SH - bh - 10); c.lineTo(bx + 17, SH - bh); c.fill(); } }
      // 時計台
      const tx = 270;
      c.fillStyle = '#05060c';
      c.fillRect(tx - 14, 60, 28, SH - 60);
      c.beginPath(); c.moveTo(tx - 16, 60); c.lineTo(tx, 18); c.lineTo(tx + 16, 60); c.fill();
      c.fillRect(tx - 1, 6, 2, 14);
      c.fillRect(tx - 17, 58, 34, 4); c.fillRect(tx - 17, 100, 34, 3);
      // 時計の文字盤
      const cy = 80, glow = 0.55 + Math.sin(W.t * 0.002) * 0.1;
      const hg = c.createRadialGradient(tx, cy, 2, tx, cy, 34); hg.addColorStop(0, `rgba(255,214,140,${glow * 0.6})`); hg.addColorStop(1, 'rgba(255,214,140,0)');
      c.fillStyle = hg; c.beginPath(); c.arc(tx, cy, 34, 0, 7); c.fill();
      c.fillStyle = `rgba(255,226,170,${glow + 0.3})`; c.beginPath(); c.arc(tx, cy, 11, 0, 7); c.fill();
      c.strokeStyle = '#3a2a14'; c.lineWidth = 1;
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.moveTo(tx + Math.cos(a) * 9, cy + Math.sin(a) * 9); c.lineTo(tx + Math.cos(a) * 10.5, cy + Math.sin(a) * 10.5); c.stroke(); }
      const ma = W.t * 0.0004, ha = ma / 12;
      c.lineWidth = 1.2; c.beginPath(); c.moveTo(tx, cy); c.lineTo(tx + Math.sin(ma) * 8, cy - Math.cos(ma) * 8); c.stroke();
      c.lineWidth = 1.6; c.beginPath(); c.moveTo(tx, cy); c.lineTo(tx + Math.sin(ha + 5.9) * 5, cy - Math.cos(ha + 5.9) * 5); c.stroke();
      for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(255,210,140,.7)'; c.fillRect(tx - 8 + (i % 2) * 13, 112 + Math.floor(i / 2) * 22, 3, 6); }
      // 霧
      for (const k of fog) { const fg = c.createRadialGradient(k.x, k.y, 2, k.x, k.y, k.r); fg.addColorStop(0, 'rgba(150,160,190,.28)'); fg.addColorStop(1, 'rgba(150,160,190,0)'); c.fillStyle = fg; c.beginPath(); c.ellipse(k.x, k.y, k.r, k.r * 0.4, 0, 0, 7); c.fill(); }
      c.setTransform(RS, 0, 0, RS, 0, 0);
      const vg = c.createLinearGradient(0, VH * 0.75, 0, VH); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
      c.fillStyle = vg; c.fillRect(0, 0, VW, VH);
    },
  };
})();

/* ---------------- 一枚絵（SVG） ---------------- */
Object.assign(SCENES, {
  world: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="swSky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4c27a"/><stop offset=".5" stop-color="#e88a6a"/><stop offset="1" stop-color="#4a5a9a"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#swSky)"/>
    <circle cx="1240" cy="220" r="110" fill="#fff4d0" opacity=".7"/>
    <g fill="#2a1e2e" opacity=".9">
      <path d="M80 640 L260 380 L440 640 Z"/><path d="M320 640 L440 470 L560 640 Z"/>
      <rect x="640" y="380" width="20" height="260"/><path d="M600 640 L650 300 L700 640 Z" opacity=".8"/><path d="M630 440 L670 440 L680 470 L620 470 Z"/>
      <path d="M820 640 L820 520 Q880 470 940 520 L940 640 Z"/><rect x="872" y="440" width="16" height="40"/><circle cx="880" cy="436" r="10"/>
      <path d="M1040 640 L1100 560 L1160 600 L1220 520 L1300 640 Z"/>
      <path d="M1360 640 L1380 470 L1392 470 L1412 640 Z"/><path d="M1340 480 Q1386 430 1432 480 Z"/>
    </g>
    <rect x="0" y="640" width="1600" height="260" fill="#1a1424"/>
    <path d="M140 760 C500 700 900 820 1460 720" stroke="#f4dca0" stroke-width="4" stroke-dasharray="14 16" fill="none" opacity=".6"/>
    <g transform="translate(1440 700) rotate(-12)" fill="#f4dca0"><path d="M-40 -4 L40 -6 Q52 0 40 6 L-40 4 Z"/><path d="M-6 -4 L-24 -30 L-14 -30 L10 -4 Z"/><path d="M-6 4 L-24 30 L-14 30 L10 4 Z"/></g>
  </svg>`,
  tuners: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><radialGradient id="stGlobe" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#5a7ac8"/><stop offset="1" stop-color="#0a1230"/></radialGradient>
      <radialGradient id="stBg" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#1a2240"/><stop offset="1" stop-color="#03040a"/></radialGradient></defs>
    <rect width="1600" height="900" fill="url(#stBg)"/>
    <circle cx="800" cy="440" r="170" fill="url(#stGlobe)"/>
    <g stroke="rgba(160,200,255,.35)" fill="none"><ellipse cx="800" cy="440" rx="170" ry="60"/><ellipse cx="800" cy="440" rx="60" ry="170"/><circle cx="800" cy="440" r="170"/></g>
    <circle cx="800" cy="440" r="320" fill="none" stroke="rgba(201,164,92,.45)" stroke-width="2" stroke-dasharray="4 10"/>
    ${Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2 - Math.PI / 2, x = 800 + Math.cos(a) * 320, y = 440 + Math.sin(a) * 320; const lit = [0, 4, 8].includes(i); return `<g transform="translate(${x} ${y})"><circle r="44" fill="${lit ? 'rgba(255,220,150,.25)' : 'rgba(120,140,190,.12)'}"/><circle cy="-12" r="12" fill="${lit ? '#f4dca0' : '#3a4262'}"/><path d="M-20 26 Q0 -2 20 26 Z" fill="${lit ? '#f4dca0' : '#3a4262'}"/></g>`; }).join('')}
  </svg>`,
  kujo: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="skWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2418"/><stop offset="1" stop-color="#14100a"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#skWall)"/>
    <rect x="980" y="120" width="360" height="300" fill="#4a5a6a" opacity=".5"/><path d="M1160 120 L1160 420 M980 270 L1340 270" stroke="#14100a" stroke-width="10"/>
    <g fill="#0a0806"><rect x="200" y="560" width="700" height="40"/><rect x="230" y="600" width="20" height="200"/><rect x="850" y="600" width="20" height="200"/></g>
    <g fill="#0c0a08">
      <path d="M560 560 L580 330 Q620 290 660 330 L680 560 Z"/><circle cx="620" cy="290" r="38"/>
      <path d="M584 300 Q600 250 640 254 Q676 262 660 300 Q640 276 600 290 Z"/>
      <path d="M680 420 L760 470 L752 486 L676 448 Z"/>
    </g>
    <text x="620" y="760" text-anchor="middle" fill="rgba(240,220,170,.6)" font-size="40" letter-spacing="14" font-family="serif">先代《名探偵》</text>
  </svg>`,
  seed: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect width="1600" height="900" fill="#05080a"/>
    <g stroke="#2a3a1a" stroke-width="14" fill="none" stroke-linecap="round" opacity=".9">
      <path d="M800 520 C700 640 520 660 300 860"/><path d="M800 520 C900 660 1100 680 1320 880"/><path d="M800 520 C780 700 820 780 760 900"/>
      <path d="M800 520 C620 560 420 520 120 600"/><path d="M800 520 C980 560 1200 520 1500 590"/>
    </g>
    <circle cx="800" cy="420" r="220" fill="rgba(120,255,140,.08)"/>
    <rect x="760" y="300" width="80" height="200" rx="18" fill="rgba(180,230,200,.18)" stroke="rgba(200,255,220,.6)" stroke-width="4"/>
    <rect x="770" y="280" width="60" height="30" rx="6" fill="#4a5a52"/>
    <circle cx="800" cy="430" r="32" fill="#8aff9a" opacity=".85"/><circle cx="800" cy="430" r="14" fill="#eaffea"/>
  </svg>`,
  tower: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="stwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0e1c"/><stop offset="1" stop-color="#3a3a4a"/></linearGradient>
      <radialGradient id="stwFace" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff0c0"/><stop offset=".7" stop-color="#f4c870"/><stop offset="1" stop-color="#f4c870" stop-opacity="0"/></radialGradient></defs>
    <rect width="1600" height="900" fill="url(#stwSky)"/>
    <g fill="#04050a"><rect x="700" y="260" width="200" height="640"/><path d="M690 260 L800 40 L910 260 Z"/><rect x="796" y="0" width="8" height="60"/>
      <rect x="0" y="700" width="1600" height="200"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 130 - 40}" y="${600 + (i % 3) * 30}" width="110" height="300"/>`).join('')}</g>
    <circle cx="800" cy="360" r="120" fill="url(#stwFace)" opacity=".5"/>
    <circle cx="800" cy="360" r="64" fill="#fff0c8"/>
    <path d="M800 360 L800 310 M800 360 L836 372" stroke="#2a1a0a" stroke-width="8" stroke-linecap="round"/>
    <g fill="rgba(170,180,210,.25)"><ellipse cx="300" cy="680" rx="420" ry="40"/><ellipse cx="1300" cy="700" rx="460" ry="44"/></g>
  </svg>`,
  vision_end: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><radialGradient id="sveBg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#5a0a10"/><stop offset="1" stop-color="#050102"/></radialGradient></defs>
    <rect width="1600" height="900" fill="url(#sveBg)"/>
    <g opacity=".85"><circle cx="800" cy="300" r="190" fill="none" stroke="#2a0606" stroke-width="22"/><path d="M800 300 L800 150 M800 300 L700 360" stroke="#2a0606" stroke-width="14"/>
      <path d="M640 180 L760 290 L700 330 Z" fill="#050102"/></g>
    <g stroke="#1a0a04" stroke-width="18" fill="none" stroke-linecap="round"><path d="M800 900 C780 700 840 600 800 420"/><path d="M800 640 C700 600 600 640 520 560"/><path d="M800 600 C900 560 1000 600 1080 520"/></g>
    <g fill="#050102"><path d="M520 760 C560 720 680 720 720 760 L720 790 L520 790 Z"/><circle cx="500" cy="760" r="26"/><path d="M470 750 C430 800 420 840 400 860" stroke="#e8eef8" stroke-width="10" fill="none" opacity=".7"/>
      <path d="M900 770 C940 735 1050 735 1090 770 L1090 795 L900 795 Z"/><circle cx="1110" cy="770" r="24"/><path d="M1130 770 C1170 800 1190 830 1210 860" stroke="#f0d890" stroke-width="10" fill="none" opacity=".7"/></g>
    <g fill="#c8102e" opacity=".55"><ellipse cx="620" cy="800" rx="150" ry="18"/><ellipse cx="1000" cy="805" rx="140" ry="16"/></g>
  </svg>`,
  scripture: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><radialGradient id="sscL" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#fff4d0"/><stop offset="1" stop-color="#b89a5a"/></radialGradient></defs>
    <rect width="1600" height="900" fill="url(#sscL)"/>
    ${Array.from({ length: 24 }, (_, i) => { const a = i / 24 * Math.PI * 2; return `<path d="M800 450 L${800 + Math.cos(a) * 1200} ${450 + Math.sin(a) * 1200}" stroke="rgba(255,255,255,.35)" stroke-width="${i % 2 ? 6 : 14}"/>`; }).join('')}
    <g transform="translate(800 450)"><path d="M-120 -80 L0 -60 L120 -80 L120 80 L0 100 L-120 80 Z" fill="#f4ecd4" stroke="#c9a45c" stroke-width="6"/><path d="M0 -60 L0 100" stroke="#c9a45c" stroke-width="4"/>
      <circle cx="0" cy="10" r="24" fill="none" stroke="#c9a45c" stroke-width="4"/><path d="M0 -14 L0 34 M-24 10 L24 10" stroke="#c9a45c" stroke-width="3"/></g>
  </svg>`,
  hideout: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="shoSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1426"/><stop offset=".6" stop-color="#2a4a6a"/><stop offset="1" stop-color="#8ab0c8"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#shoSky)"/>
    <g opacity=".5" stroke="#8affc8" stroke-width="6" fill="none"><path d="M0 200 C300 140 600 260 900 180 C1200 110 1400 200 1600 150"/><path d="M0 250 C300 200 700 310 1000 230 C1300 160 1500 240 1600 210" stroke="#8ac8ff"/></g>
    <path d="M300 640 L520 470 L640 520 L820 400 L1000 520 L1180 480 L1340 640 Z" fill="#e8f0f8"/>
    <path d="M300 640 L520 470 L560 560 L420 640 Z" fill="#b8c8d8"/>
    <rect x="760" y="520" width="120" height="70" fill="#1a2230"/><rect x="800" y="550" width="40" height="40" fill="#0a0e16"/>
    <rect x="0" y="640" width="1600" height="260" fill="#0e1a2a"/>
    <g fill="#c8d8e8" opacity=".5"><path d="M100 700 L220 690 L260 710 L120 720 Z"/><path d="M1260 720 L1420 706 L1480 730 L1300 740 Z"/></g>
  </svg>`,
});

/* ---------------- 戦闘：根の眷属 ---------------- */
const ROOT_SVG = `<svg viewBox="0 0 240 220" class="en-svg"><defs><radialGradient id="rtg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#6aff7a" stop-opacity=".35"/><stop offset="1" stop-color="#6aff7a" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="120" cy="110" rx="118" ry="104" fill="url(#rtg)"/>
  <g class="tent tl" fill="none" stroke="#3a2a14" stroke-width="10" stroke-linecap="round"><path d="M86 130 C50 120 30 150 8 140"/><path d="M90 160 C60 180 50 200 20 214"/><path d="M96 70 C70 40 50 50 30 20"/></g>
  <g class="tent tr" fill="none" stroke="#3a2a14" stroke-width="10" stroke-linecap="round"><path d="M154 130 C190 120 210 150 232 140"/><path d="M150 160 C180 180 190 200 220 214"/><path d="M144 70 C170 40 190 50 210 20"/></g>
  <g fill="none" stroke="#7ad86a" stroke-width="2" opacity=".7" class="tent tl"><path d="M86 130 C50 120 30 150 8 140"/></g>
  <g fill="none" stroke="#7ad86a" stroke-width="2" opacity=".7" class="tent tr"><path d="M154 130 C190 120 210 150 232 140"/></g>
  <path d="M60 220 C64 170 90 150 120 148 C150 150 176 170 180 220 Z" fill="#2a2014"/>
  <path d="M90 92 C90 60 150 60 150 92 C150 122 140 140 120 144 C100 140 90 122 90 92 Z" fill="#4a3e30"/>
  <path d="M88 84 C88 56 152 56 152 84 C140 70 100 70 88 84 Z" fill="#5a4a3a"/>
  <path d="M96 100 L112 106 M144 100 L128 106" stroke="#2a1a0a" stroke-width="2"/>
  <circle cx="108" cy="98" r="3" fill="#8aff7a"/><circle cx="132" cy="98" r="3" fill="#8aff7a"/>
  <path d="M106 124 Q120 118 134 124" stroke="#1a1008" stroke-width="2" fill="none"/>
  <g class="wave" fill="none" stroke="#7ad86a" stroke-width="1.5" opacity=".5"><circle cx="120" cy="100" r="60"/><circle cx="120" cy="100" r="80"/></g>
</svg>`;
