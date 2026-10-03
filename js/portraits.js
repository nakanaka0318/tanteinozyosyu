'use strict';
/* =========================================================
   PORTRAIT : ノワール調の立ち絵（SVG）
   ========================================================= */
const PORTRAIT = (() => {
  const C = {
    kujo: { rim: '#6fd6cc', hair: ['#14131b', '#2a2836'], skin: ['#2c2531', '#4a3e48'], coat: ['#121620', '#26304a'], hairStyle: 'messy', collar: 'high', tie: '#3fb0a8' },
    me: { rim: '#f0b060', hair: ['#2a1a10', '#4a3020'], skin: ['#33292a', '#584640'], coat: ['#1e150e', '#3e2c1c'], hairStyle: 'cap', vest: true, tie: '#d39a3a' },
    genichiro: { rim: '#e6c06a', hair: ['#55555c', '#8a8a92'], skin: ['#2e2526', '#4c3c3a'], coat: ['#1a0b0d', '#3a171b'], hairStyle: 'bald', beard: true, tie: '#c9a45c' },
    masato: { rim: '#e0605e', hair: ['#0c0c10', '#24242c'], skin: ['#2e2628', '#4c3e3e'], coat: ['#14171b', '#2c3238'], hairStyle: 'slick', tie: '#b8323a', loose: true },
    fuyuko: { rim: '#c0a6f0', hair: ['#0e0b14', '#262032'], skin: ['#322a33', '#54464f'], coat: ['#17121f', '#2f2440'], hairStyle: 'bun', glasses: true, brooch: true },
    sanada: { rim: '#d2d6de', hair: ['#4a4a52', '#86868e'], skin: ['#2c2526', '#4a3c3a'], coat: ['#08080b', '#1a1a20'], hairStyle: 'side', mustache: true, bowtie: true },
    todo: { rim: '#b4cf86', hair: ['#14110e', '#2e2820'], skin: ['#2e2627', '#4c3e3b'], coat: ['#18140e', '#3a3022'], hairStyle: 'part', glasses: true, steth: true, mustache: true },
    suzu: { rim: '#f6a2c0', hair: ['#1e130c', '#3e2a1c'], skin: ['#342a2c', '#5a4844'], coat: ['#0e0e12', '#22222a'], hairStyle: 'braids', maid: true },
  };
  let uid = 0;
  const F = 'rgba(244,232,212,.92)';

  function grad(id, [a, b], rim) {
    return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0.25">
      <stop offset="0" stop-color="${a}"/><stop offset="0.72" stop-color="${b}"/><stop offset="0.9" stop-color="${b}"/><stop offset="1" stop-color="${rim}" stop-opacity=".95"/></linearGradient>`;
  }

  function eyes(e) {
    const L = 86, Rr = 114, Y = 114;
    const st = `stroke="${F}" stroke-width="2.4" stroke-linecap="round" fill="none"`;
    const almond = (x, w = 6, h = 3) => `<path d="M${x - w} ${Y} Q${x} ${Y - h * 1.6} ${x + w} ${Y} Q${x} ${Y + h} ${x - w} ${Y}Z" fill="${F}"/><circle cx="${x + 0.5}" cy="${Y - 0.3}" r="1.6" fill="#120e14"/>`;
    let s = '';
    switch (e) {
      case 'smile':
        s += `<path d="M${L - 6} ${Y + 1} Q${L} ${Y - 5} ${L + 6} ${Y + 1}" ${st}/><path d="M${Rr - 6} ${Y + 1} Q${Rr} ${Y - 5} ${Rr + 6} ${Y + 1}" ${st}/>`;
        s += `<path d="M${L - 7} ${Y - 11} Q${L} ${Y - 15} ${L + 7} ${Y - 11}" ${st}/><path d="M${Rr - 7} ${Y - 11} Q${Rr} ${Y - 15} ${Rr + 7} ${Y - 11}" ${st}/>`;
        break;
      case 'angry':
        s += almond(L, 6, 2) + almond(Rr, 6, 2);
        s += `<path d="M${L - 8} ${Y - 14} L${L + 7} ${Y - 8}" ${st}/><path d="M${Rr + 8} ${Y - 14} L${Rr - 7} ${Y - 8}" ${st}/>`;
        break;
      case 'shock':
        s += `<circle cx="${L}" cy="${Y}" r="4.6" fill="none" stroke="${F}" stroke-width="2"/><circle cx="${L}" cy="${Y}" r="1.4" fill="${F}"/>`;
        s += `<circle cx="${Rr}" cy="${Y}" r="4.6" fill="none" stroke="${F}" stroke-width="2"/><circle cx="${Rr}" cy="${Y}" r="1.4" fill="${F}"/>`;
        s += `<path d="M${L - 7} ${Y - 15} Q${L} ${Y - 20} ${L + 7} ${Y - 15}" ${st}/><path d="M${Rr - 7} ${Y - 15} Q${Rr} ${Y - 20} ${Rr + 7} ${Y - 15}" ${st}/>`;
        break;
      case 'sad':
        s += almond(L, 5, 2) + almond(Rr, 5, 2);
        s += `<path d="M${L - 7} ${Y - 9} L${L + 6} ${Y - 14}" ${st}/><path d="M${Rr + 7} ${Y - 9} L${Rr - 6} ${Y - 14}" ${st}/>`;
        break;
      case 'think':
        s += `<path d="M${L - 6} ${Y} L${L + 6} ${Y}" ${st}/>` + almond(Rr);
        s += `<path d="M${L - 7} ${Y - 10} L${L + 7} ${Y - 10}" ${st}/><path d="M${Rr - 7} ${Y - 14} Q${Rr} ${Y - 18} ${Rr + 7} ${Y - 13}" ${st}/>`;
        break;
      case 'serious':
        s += almond(L, 6, 2.4) + almond(Rr, 6, 2.4);
        s += `<path d="M${L - 8} ${Y - 11} L${L + 7} ${Y - 9}" ${st}/><path d="M${Rr + 8} ${Y - 11} L${Rr - 7} ${Y - 9}" ${st}/>`;
        break;
      case 'closed':
        s += `<path d="M${L - 6} ${Y + 1} Q${L} ${Y + 4} ${L + 6} ${Y + 1}" ${st}/><path d="M${Rr - 6} ${Y + 1} Q${Rr} ${Y + 4} ${Rr + 6} ${Y + 1}" ${st}/>`;
        s += `<path d="M${L - 7} ${Y - 10} Q${L} ${Y - 13} ${L + 7} ${Y - 10}" ${st}/><path d="M${Rr - 7} ${Y - 10} Q${Rr} ${Y - 13} ${Rr + 7} ${Y - 10}" ${st}/>`;
        break;
      default:
        s += almond(L) + almond(Rr);
        s += `<path d="M${L - 7} ${Y - 11} Q${L} ${Y - 15} ${L + 7} ${Y - 11}" ${st}/><path d="M${Rr - 7} ${Y - 11} Q${Rr} ${Y - 15} ${Rr + 7} ${Y - 11}" ${st}/>`;
    }
    return s;
  }
  function mouth(e, c) {
    if (c.beard) return '';
    const st = `stroke="${F}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".85"`;
    switch (e) {
      case 'smile': return `<path d="M91 139 Q100 146 109 139" ${st}/>`;
      case 'angry': return `<path d="M92 143 Q100 137 108 143" ${st}/>`;
      case 'shock': return `<ellipse cx="100" cy="142" rx="4" ry="5.5" fill="none" stroke="${F}" stroke-width="2" opacity=".85"/>`;
      case 'sad': return `<path d="M93 143 Q100 139 107 143" ${st}/>`;
      default: return `<path d="M94 141 L106 141" ${st}/>`;
    }
  }

  function hair(c, id) {
    const f = `fill="url(#h${id})"`;
    switch (c.hairStyle) {
      case 'messy': return `
        <path d="M63 150 C54 130 56 112 62 104 L70 128 Z" ${f}/><path d="M137 150 C146 130 144 112 138 104 L130 128 Z" ${f}/>
        <path d="M60 118 C50 72 78 46 104 48 C134 48 156 72 141 120 C139 106 135 98 129 92 C127 101 121 105 116 98 C112 107 104 107 100 96 C94 107 86 105 82 96 C78 105 70 107 66 98 C64 104 62 110 60 118 Z" ${f}/>
        <path d="M70 60 C60 52 52 54 48 62 C58 60 64 64 68 70 Z" ${f}/>`;
      case 'cap': return `
        <path d="M64 96 C59 112 61 128 68 136 L73 104 Z" ${f}/><path d="M136 96 C141 112 139 128 132 136 L127 104 Z" ${f}/>
        <path d="M70 100 L76 112 L82 100 L88 108 L92 98 Z" ${f}/>
        <path d="M60 94 C58 60 142 54 144 92 Z" fill="url(#c${id})"/>
        <path d="M62 92 C82 84 128 82 152 92 C154 100 140 102 100 100 C80 100 64 100 62 92 Z" fill="url(#c${id})"/>
        <path d="M70 70 C90 62 116 62 134 72" stroke="rgba(255,220,170,.18)" stroke-width="2" fill="none"/>
        <circle cx="100" cy="58" r="3" fill="url(#c${id})"/>`;
      case 'bald': return `
        <path d="M62 96 C56 114 60 130 70 138 L72 100 Z" ${f}/><path d="M138 96 C144 114 140 130 130 138 L128 100 Z" ${f}/>
        <path d="M70 128 C70 168 130 168 130 128 C122 150 78 150 70 128 Z" ${f}/>
        <path d="M80 136 C90 130 98 133 100 136 C102 133 110 130 120 136 C110 143 90 143 80 136 Z" ${f}/>
        <path d="M78 82 C90 72 112 72 124 82" stroke="rgba(255,240,200,.08)" stroke-width="3" fill="none"/>`;
      case 'slick': return `
        <path d="M63 112 C56 64 144 58 137 110 C133 88 119 76 99 76 C83 77 70 90 63 112 Z" ${f}/>
        <path d="M66 100 C64 112 64 120 66 128 L70 108 Z" ${f}/><path d="M134 100 C136 112 136 120 134 128 L130 108 Z" ${f}/>`;
      case 'bun': return `
        <circle cx="100" cy="56" r="19" ${f}/>
        <path d="M63 120 C57 70 143 70 137 120 C131 96 115 84 100 84 C85 84 69 96 63 120 Z" ${f}/>
        <path d="M65 108 C59 128 63 144 70 154" stroke="url(#h${id})" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M86 50 L116 62" stroke="${c.rim}" stroke-width="2" opacity=".6"/>`;
      case 'side': return `
        <path d="M63 110 C58 68 142 66 137 108 C131 90 113 80 93 82 C80 84 70 94 63 110 Z" ${f}/>
        <path d="M64 102 C61 114 62 124 66 130 L70 108 Z" ${f}/><path d="M136 100 C139 112 138 122 134 128 L130 106 Z" ${f}/>`;
      case 'part': return `
        <path d="M63 110 C58 64 144 62 137 110 C135 92 127 84 113 82 L111 88 C99 82 79 86 63 110 Z" ${f}/>
        <path d="M64 102 C61 114 62 122 66 128 L70 108 Z" ${f}/><path d="M136 102 C139 114 138 122 134 128 L130 108 Z" ${f}/>`;
      case 'braids': return `
        <path d="M63 114 C59 70 141 70 137 114 C129 92 113 86 100 90 C87 86 71 92 63 114 Z" ${f}/>
        <path d="M64 104 C60 116 61 126 64 132 L70 110 Z" ${f}/><path d="M136 104 C140 116 139 126 136 132 L130 110 Z" ${f}/>
        ${[136, 152, 168, 184].map((y, i) => `<ellipse cx="${62 - i}" cy="${y}" rx="${8 - i}" ry="9" ${f}/><ellipse cx="${138 + i}" cy="${y}" rx="${8 - i}" ry="9" ${f}/>`).join('')}
        <circle cx="60" cy="196" r="4" fill="#e8a0b8"/><circle cx="140" cy="196" r="4" fill="#e8a0b8"/>
        <path d="M66 82 C80 62 120 62 134 82 L130 90 C116 76 84 76 70 90 Z" fill="#e6ded2"/>
        ${[72, 82, 92, 102, 112, 122].map(x => `<circle cx="${x + 4}" cy="${74 - Math.abs(x + 4 - 100) * 0.18}" r="4.2" fill="#f2ece2"/>`).join('')}`;
    }
    return '';
  }

  function body(c, id) {
    const cf = `fill="url(#c${id})"`;
    let s = `<path d="M6 262 C10 214 46 190 100 188 C154 190 190 214 194 262 Z" ${cf}/>`;
    if (c.maid) {
      s += `<path d="M78 196 L122 196 L128 262 L72 262 Z" fill="#d8d0c2" opacity=".85"/>`;
      s += `<path d="M80 190 L100 206 L120 190 L116 186 L100 196 L84 186 Z" fill="#ece6da"/>`;
      s += `<path d="M78 196 L66 262 M122 196 L134 262" stroke="#d8d0c2" stroke-width="5" opacity=".7"/>`;
      s += `<path d="M94 200 L100 206 L106 200 L100 196 Z" fill="${c.rim}"/>`;
      return s;
    }
    if (c.vest) {
      s += `<path d="M78 192 L122 192 L132 262 L68 262 Z" fill="#b7aa92" opacity=".55"/>`;
      s += `<path d="M66 202 L96 262 L58 262 Z" ${cf}/><path d="M134 202 L104 262 L142 262 Z" ${cf}/>`;
      s += `<path d="M90 192 L100 202 L110 192 L106 188 L100 195 L94 188 Z" fill="#e6dccb" opacity=".8"/>`;
      s += `<path d="M93 202 L100 206 L107 202 L107 210 L100 206 L93 210 Z" fill="${c.tie}"/>`;
      s += `<circle cx="100" cy="226" r="2" fill="#c9a45c"/><circle cx="100" cy="240" r="2" fill="#c9a45c"/>`;
      return s;
    }
    s += `<path d="M84 190 L100 236 L116 190 Z" fill="#c8bfae" opacity=".55"/>`;
    s += `<path d="M58 202 L97 262 L84 192 Z" fill="#000" opacity=".25"/><path d="M142 202 L103 262 L116 192 Z" fill="#000" opacity=".18"/>`;
    if (c.bowtie) s += `<path d="M86 194 L100 201 L114 194 L114 208 L100 201 L86 208 Z" fill="#0a0a0c" stroke="${c.rim}" stroke-width=".8" stroke-opacity=".5"/>`;
    else if (c.tie) s += `<path d="M96 196 L104 196 L107 206 L${c.loose ? 106 : 103} 244 L${c.loose ? 99 : 97} 244 L93 206 Z" fill="${c.tie}" ${c.loose ? 'transform="rotate(6 100 200)"' : ''}/>`;
    if (c.collar === 'high') {
      s += `<path d="M54 210 L72 146 L94 196 Z" ${cf}/><path d="M146 210 L128 146 L106 196 Z" ${cf}/>`;
      s += `<path d="M72 146 L94 196" stroke="${c.rim}" stroke-width="1.4" opacity=".5"/><path d="M128 146 L106 196" stroke="${c.rim}" stroke-width="1.4" opacity=".8"/>`;
    }
    if (c.brooch) s += `<circle cx="100" cy="206" r="5" fill="${c.rim}" opacity=".9"/><circle cx="100" cy="206" r="2" fill="#fff" opacity=".7"/>`;
    if (c.steth) s += `<path d="M76 194 C66 226 84 246 100 240 C116 246 134 226 124 194" stroke="#8a9096" stroke-width="3" fill="none"/><circle cx="100" cy="242" r="6" fill="#a8b0b6" stroke="#5a6066" stroke-width="2"/>`;
    return s;
  }

  function svg(name, expr = 'normal') {
    const c = C[name]; if (!c) return '';
    const id = name + (uid++);
    const glasses = c.glasses ? `<g stroke="rgba(236,232,224,.75)" stroke-width="2" fill="rgba(200,220,240,.06)"><circle cx="86" cy="114" r="10"/><circle cx="114" cy="114" r="10"/><path d="M96 113 L104 113" /></g><path d="M80 108 L84 104" stroke="#fff" stroke-width="1.6" opacity=".6"/>` : '';
    const must = (c.mustache && !c.beard) ? `<path d="M84 134 C92 129 98 131 100 134 C102 131 108 129 116 134 C108 140 92 140 84 134 Z" fill="url(#h${id})"/>` : '';
    return `<svg viewBox="0 0 200 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        ${grad('s' + id, c.skin, c.rim)}${grad('h' + id, c.hair, c.rim)}${grad('c' + id, c.coat, c.rim)}
        <radialGradient id="g${id}" cx=".5" cy=".42" r=".55"><stop offset="0" stop-color="${c.rim}" stop-opacity=".32"/><stop offset="1" stop-color="${c.rim}" stop-opacity="0"/></radialGradient>
      </defs>
      <circle cx="100" cy="118" r="104" fill="url(#g${id})"/>
      ${body(c, id)}
      <path d="M83 148 L83 194 L117 194 L117 148 Z" fill="url(#s${id})"/>
      <path d="M83 176 Q100 186 117 176 L117 194 L83 194 Z" fill="#000" opacity=".3"/>
      
      <path d="M65 104 C65 68 135 68 135 104 C135 134 124 154 100 160 C76 154 65 134 65 104 Z" fill="url(#s${id})"/>
      <path d="M100 118 L97 132 L102 133" stroke="rgba(0,0,0,.35)" stroke-width="1.6" fill="none"/>
      ${eyes(expr)}${mouth(expr, c)}${must}
      ${hair(c, id)}
      ${glasses}
    </svg>`;
  }
  return { svg, has: n => !!C[n] };
})();
