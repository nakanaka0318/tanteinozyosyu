'use strict';
/* =========================================================
   PORTRAIT : ノワール調の立ち絵（SVG）
   ========================================================= */
const PORTRAIT = (() => {
  const C = {
    kujo: { rim: '#6fd6cc', hair: ['#14131b', '#2a2836'], skin: ['#e4b392', '#f8d6bc'], coat: ['#121620', '#26304a'], hairStyle: 'messy', collar: 'high', tie: '#3fb0a8' },
    me: { rim: '#f0b060', hair: ['#2a1a10', '#4a3020'], skin: ['#e4b392', '#f8d6bc'], coat: ['#1e150e', '#3e2c1c'], hairStyle: 'cap', vest: true, tie: '#d39a3a' },
    genichiro: { rim: '#e6c06a', hair: ['#55555c', '#8a8a92'], skin: ['#d6a284', '#eec8ac'], coat: ['#1a0b0d', '#3a171b'], hairStyle: 'bald', beard: true, tie: '#c9a45c' },
    masato: { rim: '#e0605e', hair: ['#0c0c10', '#24242c'], skin: ['#d9a47f', '#f0c8a6'], coat: ['#14171b', '#2c3238'], hairStyle: 'slick', tie: '#b8323a', loose: true },
    fuyuko: { rim: '#c0a6f0', hair: ['#0e0b14', '#262032'], skin: ['#ecc0a2', '#fde2cc'], coat: ['#17121f', '#2f2440'], hairStyle: 'bun', glasses: true, brooch: true },
    sanada: { rim: '#d2d6de', hair: ['#4a4a52', '#86868e'], skin: ['#d6a284', '#eec8ac'], coat: ['#08080b', '#1a1a20'], hairStyle: 'side', mustache: true, bowtie: true },
    todo: { rim: '#b4cf86', hair: ['#14110e', '#2e2820'], skin: ['#d6a284', '#eec8ac'], coat: ['#18140e', '#3a3022'], hairStyle: 'part', glasses: true, steth: true, mustache: true },
    mirai: { rim: '#5ef0ff', hair: ['#0c0a12', '#26202e'], skin: ['#ecc0a2', '#fde2cc'], coat: ['#3a3e4c', '#9aa2b8'], hairStyle: 'bobcut', tie: '#3ff0ff', techCollar: '#3ff0ff', earring: '#3ff0ff' },
    kurosu: { rim: '#6dff9a', hair: ['#0c1414', '#203030'], skin: ['#d9a47f', '#f0c8a6'], coat: ['#14161c', '#2c303c'], hairStyle: 'shaggy', hoodie: true, headset: '#6dff9a' },
    amagi: { rim: '#ffcc66', hair: ['#4a4a52', '#9a9aa2'], skin: ['#d6a284', '#eec8ac'], coat: ['#121216', '#2e2e36'], hairStyle: 'slick', tie: '#c9a24a', monocle: '#ff5a5a' },
    noa: { rim: '#ff6ad5', hair: ['#5a1a4a', '#ff8ad8'], skin: ['#ecc0a2', '#fde2cc'], coat: ['#1c1026', '#3a2450'], hairStyle: 'twintail', phones: '#5ef0ff', tie: '#5ef0ff' },
    muse: { rim: '#9ffcff', hair: ['#1a6a8a', '#7fe8ff'], skin: ['#2a5a70', '#8adcf0'], coat: ['#14506a', '#5fd0ec'], hairStyle: 'holo', holo: true, techCollar: '#ffffff' },
    kirishima: { rim: '#a0b8ff', hair: ['#14141a', '#2c2c36'], skin: ['#e4b392', '#f8d6bc'], coat: ['#6a7080', '#d8dde8'], hairStyle: 'part', glasses: true, lab: true, tie: '#5a8aff' },
    houjou: { rim: '#e6c06a', hair: ['#5a5a60', '#9a9aa2'], skin: ['#d6a284', '#eec8ac'], coat: ['#1a120c', '#3e2c1e'], hairStyle: 'bald', mustache: true, tie: '#8a1e22' },
    reika: { rim: '#ff6a7a', hair: ['#14080c', '#3a1820'], skin: ['#ecc0a2', '#fde2cc'], coat: ['#3a0610', '#8a1428'], hairStyle: 'longwave', brooch: true },
    washio: { rim: '#d8c08a', hair: ['#14110e', '#2e2820'], skin: ['#d9a47f', '#f0c8a6'], coat: ['#2e2618', '#6a5a44'], hairStyle: 'part', fedora: '#2e2618', collar: 'high', tie: '#2a3a5a' },
    hiiragi: { rim: '#c8ccd8', hair: ['#4a4a52', '#8a8a92'], skin: ['#d6a284', '#eec8ac'], coat: ['#060608', '#1c1c22'], hairStyle: 'side', bowtie: true },
    hayase: { rim: '#8ab8e8', hair: ['#1e160e', '#4a3a2a'], skin: ['#e4b392', '#f8d6bc'], coat: ['#4a4438', '#b8b0a0'], hairStyle: 'slick', glasses: true, tie: '#2a4a6a' },
    mina: { rim: '#f0a0b0', hair: ['#1e120a', '#3e2a1a'], skin: ['#ecc0a2', '#fde2cc'], coat: ['#0e0e14', '#2a2a3a'], hairStyle: 'bun', maid: true },
    yogarasu: { rim: '#ff3a4a', hair: ['#9a9aa6', '#f4f4fa'], skin: ['#ecc0a2', '#fde2cc'], coat: ['#020204', '#14141c'], hairStyle: 'messy', cape: true, mask: true },
    yogarasu_face: { rim: '#ff3a4a', hair: ['#9a9aa6', '#f4f4fa'], skin: ['#ecc0a2', '#fde2cc'], coat: ['#020204', '#14141c'], hairStyle: 'messy', cape: true, redEyes: true },
    siesta: { cute: true, iris: '#3a78d8', rim: '#8ac4ff', hair: ['#c4cad8', '#fbfcff'], skin: ['#ecc0a2', '#fde2cc'], coat: ['#121a36', '#2c3c6e'], hairStyle: 'siesta', hairclip: '#c8304a', blouse: '#c8304a' },
    ca: { rim: '#f0a080', hair: ['#1a100c', '#3a2a1e'], skin: ['#ecc0a2', '#fde2cc'], coat: ['#121a36', '#24345e'], hairStyle: 'bun', scarf: '#d84a3a' },
    hikawa: { rim: '#a8c0d8', hair: ['#14110e', '#2e2a24'], skin: ['#e4b392', '#f8d6bc'], coat: ['#2a2c32', '#5a5e68'], hairStyle: 'side', glasses: true, tie: '#3a5a7a' },
    hikawa_x: { rim: '#b46aff', hair: ['#14110e', '#2e2a24'], skin: ['#a898b4', '#d8cce0'], coat: ['#1a1620', '#3a3446'], hairStyle: 'side', glasses: true, tie: '#3a5a7a', tentacles: '#b46aff' },
    kuroda: { rim: '#e8c070', hair: ['#0c0c10', '#24242c'], skin: ['#d9a47f', '#f0c8a6'], coat: ['#0e0e12', '#24242c'], hairStyle: 'slick', mustache: true, tie: '#c9a24a' },
    nanase: { rim: '#9ae07a', hair: ['#1e140c', '#3e2a1c'], skin: ['#e4b392', '#f8d6bc'], coat: ['#22301c', '#4a6a3a'], hairStyle: 'shaggy', hoodie: true, phones: '#e8e8e8' },
    kase: { rim: '#ff5a4a', hair: ['#5a0a0a', '#e0402a'], skin: ['#ecc0a2', '#fde2cc'], coat: ['#08080c', '#24242c'], hairStyle: 'longwave', collar: 'high', tie: '#24242c' },
    multigate: { rim: '#f4dca0', hair: ['#c8a050', '#f8e8b0'], skin: ['#ecc0a2', '#fde2cc'], coat: ['#c8c0b0', '#f4f0e6'], hairStyle: 'longwave', brooch: true, collar: 'high' },
    oswald: { rim: '#a8c890', hair: ['#4a3a2a', '#7a6a5a'], skin: ['#d6a284', '#eec8ac'], coat: ['#2a2014', '#5a4a34'], hairStyle: 'side', mustache: true, tie: '#2a4a2a' },
    oswald_x: { rim: '#7ad86a', hair: ['#4a3a2a', '#7a6a5a'], skin: ['#a8a088', '#ccc4a8'], coat: ['#1a140c', '#3a2e20'], hairStyle: 'side', mustache: true, tie: '#2a4a2a', tentacles: '#6a8a3a' },
    harold: { rim: '#e8a060', hair: ['#8a6030', '#c8a060'], skin: ['#e4b392', '#f8d6bc'], coat: ['#5a0a10', '#9a1a20'], hairStyle: 'cap', collar: 'high', tie: '#c9a45c' },
    edgar: { rim: '#d8d8e8', hair: ['#a8a8b0', '#e0e0e8'], skin: ['#d6a284', '#eec8ac'], coat: ['#08080c', '#24242e'], hairStyle: 'bald', tie: '#ffffff', collar: 'high' },
    lily: { rim: '#f0b0c0', hair: ['#5a3a20', '#8a5a3a'], skin: ['#ecc0a2', '#fde2cc'], coat: ['#14141e', '#34344a'], hairStyle: 'bun', maid: true },
    schwarz: { rim: '#f4b860', hair: ['#b8b4ac', '#f0ece4'], skin: ['#d6a284', '#eec8ac'], coat: ['#2a2018', '#5a4a3a'], hairStyle: 'side', beard: true, glasses: true, vest: false, tie: '#c9a45c' },
    exceed: { rim: '#8aff9a', hair: ['#1a1e24', '#3a3e46'], skin: ['#7a8088', '#a8aeb6'], coat: ['#0e1014', '#2a2e36'], hairStyle: 'bald', tentacles: '#3a2a16', collar: 'high', redEyes: true },
    suzu: { rim: '#f6a2c0', hair: ['#1e130c', '#3e2a1c'], skin: ['#ecc0a2', '#fde2cc'], coat: ['#0e0e12', '#22222a'], hairStyle: 'braids', maid: true },
  };
  let uid = 0;
  const F = 'rgba(244,232,212,.92)';

  function grad(id, [a, b], rim) {
    return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0.25">
      <stop offset="0" stop-color="${a}"/><stop offset="0.72" stop-color="${b}"/><stop offset="0.9" stop-color="${b}"/><stop offset="1" stop-color="${rim}" stop-opacity=".95"/></linearGradient>`;
  }

  const INK = '#2e1c18';
  const NECK_DROP = 22;  // 頭を下げて首を短く
  function skinGrad(id, [a, b], rim) {
    return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0.25">
      <stop offset="0" stop-color="${a}"/><stop offset="0.5" stop-color="${b}"/><stop offset="0.86" stop-color="${b}"/><stop offset="1" stop-color="${rim}" stop-opacity=".45"/></linearGradient>`;
  }

  // 通常の目（元のデザイン。線だけ肌色に合わせて濃い色に）
  function eyes(e, c, id) {
    if (c.cute) return cuteEyes(e, c, id);
    const L = 86, Rr = 114, Y = 114, ink = c.ink || INK;
    const st = `stroke="${ink}" stroke-width="2.4" stroke-linecap="round" fill="none"`;
    const almond = (x, w = 6, h = 3) => `<path d="M${x - w} ${Y} Q${x} ${Y - h * 1.6} ${x + w} ${Y} Q${x} ${Y + h} ${x - w} ${Y}Z" fill="${F}" stroke="${ink}" stroke-width=".8"/><circle cx="${x + 0.5}" cy="${Y - 0.3}" r="1.6" fill="#120e14"/>`;
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
        s += `<circle cx="${L}" cy="${Y}" r="4.6" fill="${F}" stroke="${ink}" stroke-width="2"/><circle cx="${L}" cy="${Y}" r="1.4" fill="${ink}"/>`;
        s += `<circle cx="${Rr}" cy="${Y}" r="4.6" fill="${F}" stroke="${ink}" stroke-width="2"/><circle cx="${Rr}" cy="${Y}" r="1.4" fill="${ink}"/>`;
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

  // かわいい目（大きな瞳・ハイライト・まつげ）
  function cuteEyes(e, c, id) {
    const L = 84, Rr = 116, Y = 118, ink = c.ink || '#2a1618';
    const brow = `stroke="${ink}" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".75"`;
    const lid = `stroke="${ink}" stroke-width="3" stroke-linecap="round" fill="none"`;
    const eye = (x, h = 1, side = 1, small = false) => {
      const irx = small ? 3.4 : 5.6, iry = (small ? 4 : 6.8) * h;
      return `<ellipse cx="${x}" cy="${Y - 0.5}" rx="7.8" ry="${7.6 * h}" fill="#fffaf6"/>
        <ellipse cx="${x}" cy="${Y + 0.3}" rx="${irx}" ry="${iry}" fill="url(#i${id})"/>
        <ellipse cx="${x}" cy="${Y + 1}" rx="${irx * 0.48}" ry="${iry * 0.5}" fill="#0e0a14"/>
        <circle cx="${x - 2 * side}" cy="${Y - 3 * h}" r="2.2" fill="#fff"/><circle cx="${x + 2.2 * side}" cy="${Y + 3 * h}" r="1.1" fill="#fff" opacity=".9"/>
        <path d="M${x - 8.8 * side} ${Y - 1.5 * h} Q${x - 1 * side} ${Y - 11.4 * h} ${x + 9 * side} ${Y - 3.6 * h}" ${lid}/>
        <path d="M${x + 8.6 * side} ${Y - 3.8 * h} L${x + 11 * side} ${Y - 6.2 * h}" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
        <path d="M${x - 6 * side} ${Y + 7.2 * h} Q${x} ${Y + 8.2 * h} ${x + 6 * side} ${Y + 6.8 * h}" stroke="${ink}" stroke-width="1" fill="none" opacity=".4"/>`;
    };
    const arcUp = x => `<path d="M${x - 8} ${Y + 1} Q${x} ${Y - 8} ${x + 8} ${Y + 1}" ${lid}/>`;
    const arcDn = x => `<path d="M${x - 7} ${Y - 1} Q${x} ${Y + 4} ${x + 7} ${Y - 1}" ${lid}/><path d="M${x + 6} ${Y - 0.5} L${x + 8.6} ${Y - 2.4}" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/>`;
    const brows = (dy1, dy2) => `<path d="M${L - 8} ${Y - 15 + dy1} Q${L} ${Y - 18 + (dy1 + dy2) / 2} ${L + 7} ${Y - 15 + dy2}" ${brow}/><path d="M${Rr + 8} ${Y - 15 + dy1} Q${Rr} ${Y - 18 + (dy1 + dy2) / 2} ${Rr - 7} ${Y - 15 + dy2}" ${brow}/>`;
    switch (e) {
      case 'smile': return arcUp(L) + arcUp(Rr) + brows(-1, -1);
      case 'closed': return arcDn(L) + arcDn(Rr) + brows(0, 0);
      case 'angry': return eye(L, 0.72, 1) + eye(Rr, 0.72, -1) + brows(-2, 4);
      case 'sad': return eye(L, 0.85, 1) + eye(Rr, 0.85, -1) + brows(3, -3);
      case 'serious': return eye(L, 0.86, 1) + eye(Rr, 0.86, -1) + brows(0, 2);
      case 'shock': return eye(L, 1.08, 1, true) + eye(Rr, 1.08, -1, true) + brows(-4, -4);
      case 'think': return arcDn(L) + eye(Rr, 0.95, -1) + brows(1, 1);
      default: return eye(L, 1, 1) + eye(Rr, 1, -1) + brows(0, 0);
    }
  }
  function mouth(e, c) {
    if (c.beard) return '';
    const ink = c.ink || INK;
    if (c.cute) {
      const st = `stroke="${ink}" stroke-width="1.8" stroke-linecap="round" fill="none"`;
      switch (e) {
        case 'smile': return `<path d="M93 138 Q100 147 107 138 Q100 141 93 138Z" fill="#c8566a"/><path d="M93 138 Q100 147 107 138" ${st}/>`;
        case 'angry': return `<path d="M95 142 Q100 138 105 142" ${st}/>`;
        case 'shock': return `<ellipse cx="100" cy="141" rx="3" ry="4" fill="#a8404e" stroke="${ink}" stroke-width="1.4"/>`;
        case 'sad': return `<path d="M95 142 Q100 139 105 142" ${st}/>`;
        case 'closed': return `<path d="M96 139 Q100 142 104 139" ${st}/>`;
        default: return `<path d="M96 139.5 Q100 141.5 104 139.5" ${st}/>`;
      }
    }
    const st = `stroke="${ink}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".85"`;
    switch (e) {
      case 'smile': return `<path d="M91 139 Q100 146 109 139" ${st}/>`;
      case 'angry': return `<path d="M92 143 Q100 137 108 143" ${st}/>`;
      case 'shock': return `<ellipse cx="100" cy="142" rx="4" ry="5.5" fill="none" stroke="${ink}" stroke-width="2" opacity=".85"/>`;
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
      case 'bobcut': return `
        <path d="M60 140 C52 90 66 60 100 58 C134 60 148 90 140 140 C134 142 130 140 128 136 C132 112 128 96 118 88 C104 96 84 98 72 92 C68 106 68 124 72 136 C68 140 64 142 60 140 Z" ${f}/>
        <path d="M70 92 C86 84 110 82 126 90" stroke="${c.rim}" stroke-width="1.6" opacity=".55" fill="none"/>`;
      case 'shaggy': return `
        <path d="M60 120 C52 76 78 52 102 52 C130 52 152 74 142 122 L136 104 L130 114 L124 96 L116 108 L110 94 L100 106 L92 92 L84 106 L78 94 L70 110 L66 100 Z" ${f}/>
        <path d="M118 66 C126 70 132 78 134 88" stroke="${c.rim}" stroke-width="3" opacity=".7" fill="none"/>`;
      case 'twintail': return `
        <path d="M62 114 C58 68 142 68 138 114 C130 92 116 84 100 86 C84 84 70 92 62 114 Z" ${f}/>
        <path d="M66 82 C40 92 30 140 40 196 C46 170 52 140 66 112 Z" ${f}/><path d="M134 82 C160 92 170 140 160 196 C154 170 148 140 134 112 Z" ${f}/>
        <circle cx="68" cy="80" r="6" fill="${c.tie}"/><circle cx="132" cy="80" r="6" fill="${c.tie}"/>
        <path d="M72 96 L80 104 L86 94 L94 104 L100 92 L106 104 L114 94 L120 104 L128 96" stroke="url(#h${id})" stroke-width="6" fill="none"/>`;
      case 'holo': return `
        <path d="M58 150 C48 90 66 54 100 52 C134 54 152 90 142 150 L134 120 L136 96 C124 84 112 80 100 82 C88 80 76 84 64 96 L66 120 Z" ${f} opacity=".85"/>
        <path d="M64 96 L58 150 M136 96 L142 150 M100 52 L100 82" stroke="#e8fdff" stroke-width="1" opacity=".6"/>
        <path d="M76 70 L100 60 L124 70" stroke="#e8fdff" stroke-width="1.2" fill="none" opacity=".8"/>`;
      case 'siesta': return `
        <path d="M62 102 C48 150 60 196 44 244 C66 232 76 186 72 120 Z" ${f}/><path d="M138 102 C152 150 140 196 156 244 C134 232 124 186 128 120 Z" ${f}/>
        <path d="M60 122 C52 74 76 50 102 50 C130 50 150 74 140 122 C138 106 132 96 126 90 L122 104 L116 90 L108 106 L102 90 L95 104 L90 90 L82 102 L78 94 C70 102 64 110 60 122 Z" ${f}/>
        <path d="M74 74 C88 60 116 58 130 72" stroke="#ffffff" stroke-width="2.4" opacity=".55" fill="none"/>
        <path d="M70 80 C76 72 84 68 92 66" stroke="${c.rim}" stroke-width="1.6" opacity=".5" fill="none"/>`;
      case 'longwave': return `
        <path d="M62 118 C56 72 78 54 102 54 C128 54 146 74 138 118 C130 96 116 86 100 88 C84 86 70 96 62 118 Z" ${f}/>
        <path d="M64 100 C52 140 64 170 52 214 C70 200 74 170 72 120 Z" ${f}/><path d="M136 100 C148 140 136 170 148 214 C130 200 126 170 128 120 Z" ${f}/>
        <path d="M70 80 C90 66 116 66 132 80" stroke="${c.rim}" stroke-width="1.4" opacity=".45" fill="none"/>`;
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
    if (c.blouse) {
      s += `<path d="M66 196 C78 188 90 188 100 200 C110 188 122 188 134 196 L126 218 C114 210 106 208 100 212 C94 208 86 210 74 218 Z" fill="#f4f6fb"/>`;
      s += `<path d="M100 200 L84 194 L82 210 Z" fill="${c.blouse}"/><path d="M100 200 L116 194 L118 210 Z" fill="${c.blouse}"/><circle cx="100" cy="202" r="4" fill="${c.blouse}"/>`;
      s += `<path d="M98 205 L92 226 L98 222 Z" fill="${c.blouse}"/><path d="M102 205 L108 226 L102 222 Z" fill="${c.blouse}"/>`;
      s += `<path d="M100 214 L100 262" stroke="#0e1428" stroke-width="1.4" opacity=".6"/><circle cx="100" cy="236" r="2" fill="#c9a45c"/><circle cx="100" cy="252" r="2" fill="#c9a45c"/>`;
      return s;
    }
    if (c.lab) {
      s += `<path d="M84 190 L100 236 L116 190 Z" fill="#c8cfdc" opacity=".6"/><path d="M96 196 L104 196 L106 206 L102 240 L98 240 L94 206 Z" fill="${c.tie}"/>`;
      s += `<path d="M50 206 L96 262 L70 262 L40 230 Z" fill="#e8ecf4" opacity=".85"/><path d="M150 206 L104 262 L130 262 L160 230 Z" fill="#dfe4ee" opacity=".85"/>`;
      return s;
    }
    if (c.hoodie) {
      s += `<path d="M60 196 C70 176 130 176 140 196 C130 186 70 186 60 196 Z" fill="url(#c${id})"/><path d="M58 200 C64 178 80 172 100 172 C120 172 136 178 142 200" stroke="#3a3e4c" stroke-width="6" fill="none"/>`;
      s += `<path d="M92 196 L90 236 M108 196 L110 236" stroke="#9aa2b0" stroke-width="2"/><circle cx="90" cy="238" r="2.5" fill="${c.rim}"/><circle cx="110" cy="238" r="2.5" fill="${c.rim}"/>`;
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
    if (c.techCollar) s += `<path d="M70 200 L100 214 L130 200" stroke="${c.techCollar}" stroke-width="2.4" fill="none" opacity=".9"/><path d="M60 214 L100 232 L140 214" stroke="${c.techCollar}" stroke-width="1" fill="none" opacity=".5"/>`;
    if (c.cape) {
      s += `<path d="M40 214 C30 170 60 150 78 150 L100 196 L122 150 C140 150 170 170 160 214 L194 262 L6 262 Z" fill="url(#c${id})"/>`;
      s += `<path d="M78 150 L100 196 L122 150" stroke="${c.rim}" stroke-width="1.6" fill="none" opacity=".8"/><circle cx="100" cy="198" r="5" fill="#c8102e"/>`;
    }
    if (c.brooch) s += `<circle cx="100" cy="206" r="5" fill="${c.rim}" opacity=".9"/><circle cx="100" cy="206" r="2" fill="#fff" opacity=".7"/>`;
    if (c.steth) s += `<path d="M76 194 C66 226 84 246 100 240 C116 246 134 226 124 194" stroke="#8a9096" stroke-width="3" fill="none"/><circle cx="100" cy="242" r="6" fill="#a8b0b6" stroke="#5a6066" stroke-width="2"/>`;
    return s;
  }

  function acc(c) {
    let s = '';
    if (c.fedora) s += `<path d="M52 92 C70 86 130 86 148 92 C152 98 138 100 100 98 C62 100 48 98 52 92 Z" fill="${c.fedora}"/><path d="M68 90 C66 62 134 62 132 90 Z" fill="${c.fedora}"/><path d="M68 84 L132 84" stroke="#14110e" stroke-width="5"/>`;
    if (c.mask) s += `<path d="M66 106 C80 98 92 104 100 110 C108 104 120 98 134 106 C136 116 128 124 118 122 C110 120 104 116 100 114 C96 116 90 120 82 122 C72 124 64 116 66 106 Z" fill="#06060a" stroke="${c.rim}" stroke-width="1.4"/><ellipse cx="86" cy="112" rx="5" ry="3" fill="#ff3a4a"/><ellipse cx="114" cy="112" rx="5" ry="3" fill="#ff3a4a"/>`;
    if (c.hairclip) s += `<path d="M120 74 L134 66 L138 76 L126 82 Z" fill="${c.hairclip}"/><circle cx="129" cy="74" r="3" fill="#f6f8ff"/>`;
    if (c.scarf) s += `<path d="M82 192 C92 202 108 202 118 192 L124 200 C112 214 88 214 76 200 Z" fill="${c.scarf}"/><path d="M104 204 L116 228 L106 226 Z" fill="${c.scarf}"/>`;
    if (c.tentacles) s += `<g fill="none" stroke="${c.tentacles}" stroke-width="5" stroke-linecap="round" opacity=".9"><path d="M64 112 C40 100 30 120 14 108 C4 100 8 84 18 82"/><path d="M64 120 C44 126 36 150 16 148"/><path d="M136 112 C160 100 170 120 186 108 C196 100 192 84 182 82"/><path d="M136 120 C156 126 164 150 184 148"/></g><g fill="none" stroke="#2a0a3a" stroke-width="2"><path d="M64 112 C40 100 30 120 14 108"/><path d="M136 112 C160 100 170 120 186 108"/></g>`;
    if (c.redEyes) s += `<circle cx="86" cy="113.5" r="2.4" fill="#ff3a4a"/><circle cx="114" cy="113.5" r="2.4" fill="#ff3a4a"/>`;
    if (c.headset) s += `<path d="M62 112 C58 70 142 70 138 112" stroke="#1a1e26" stroke-width="5" fill="none"/><rect x="56" y="104" width="12" height="20" rx="4" fill="#1a1e26" stroke="${c.headset}" stroke-width="1.5"/><path d="M62 124 C66 140 76 146 88 146" stroke="#1a1e26" stroke-width="3" fill="none"/><circle cx="89" cy="146" r="3" fill="${c.headset}"/>`;
    if (c.phones) s += `<path d="M60 104 C58 60 142 60 140 104" stroke="${c.phones}" stroke-width="4" fill="none" opacity=".9"/><rect x="52" y="98" width="14" height="24" rx="6" fill="#1a1026" stroke="${c.phones}" stroke-width="2"/><rect x="134" y="98" width="14" height="24" rx="6" fill="#1a1026" stroke="${c.phones}" stroke-width="2"/>`;
    if (c.monocle) s += `<circle cx="114" cy="114" r="11" fill="rgba(255,60,60,.18)" stroke="#2a2a30" stroke-width="3"/><circle cx="114" cy="114" r="4" fill="${c.monocle}"/><path d="M125 114 L138 108" stroke="#2a2a30" stroke-width="2"/>`;
    if (c.earring) s += `<rect x="62" y="122" width="3" height="10" fill="${c.earring}"/><rect x="135" y="122" width="3" height="10" fill="${c.earring}"/>`;
    if (c.holo) { s += `<g opacity=".22">`; for (let y = 50; y < 262; y += 6) s += `<rect x="0" y="${y}" width="200" height="1.4" fill="#dffcff"/>`; s += `</g>`; }
    return s;
  }
  function svg(name, expr = 'normal') {
    const c = C[name]; if (!c) return '';
    const id = name + (uid++);
    const glasses = c.glasses ? `<g stroke="#2a2a30" stroke-width="2" fill="rgba(200,220,240,.12)"><circle cx="86" cy="114" r="10"/><circle cx="114" cy="114" r="10"/><path d="M96 113 L104 113" /></g><path d="M80 108 L84 104" stroke="#fff" stroke-width="1.6" opacity=".6"/>` : '';
    const must = (c.mustache && !c.beard) ? `<path d="M84 134 C92 129 98 131 100 134 C102 131 108 129 116 134 C108 140 92 140 84 134 Z" fill="url(#h${id})"/>` : '';
    return `<svg viewBox="0 0 200 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet"${c.holo ? ' class="holo" opacity=".88"' : ''}>
      <defs>
        ${skinGrad('s' + id, c.skin, c.rim)}${grad('h' + id, c.hair, c.rim)}${grad('c' + id, c.coat, c.rim)}
        <linearGradient id="i${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140e18"/><stop offset=".55" stop-color="${c.iris || '#4a3426'}"/><stop offset="1" stop-color="${c.iris || '#4a3426'}" stop-opacity=".75"/></linearGradient>
        <radialGradient id="g${id}" cx=".5" cy=".42" r=".55"><stop offset="0" stop-color="${c.rim}" stop-opacity=".32"/><stop offset="1" stop-color="${c.rim}" stop-opacity="0"/></radialGradient>
      </defs>
      <circle cx="100" cy="118" r="104" fill="url(#g${id})"/>
      ${body(c, id)}
      ${c.cute ? `<path d="M89 150 L88 196 L112 196 L111 150 Z" fill="url(#s${id})"/><path d="M89 150 L111 150 L111 168 Q100 175 89 168 Z" fill="#b8705a" opacity=".32"/>`
      : `<path d="M83 148 L83 194 L117 194 L117 148 Z" fill="url(#s${id})"/><path d="M83 148 L117 148 L117 166 Q100 174 83 166 Z" fill="#a8604a" opacity=".32"/>`}
      
      <g transform="translate(0 ${NECK_DROP})">
      ${c.cute ? `<path d="M64 104 C64 68 136 68 136 104 C136 130 124 151 100 160 C76 151 64 130 64 104 Z" fill="url(#s${id})"/>
      <path d="M100 130 L99 133" stroke="rgba(120,60,50,.45)" stroke-width="1.4" stroke-linecap="round"/>`
      : `<path d="M65 104 C65 68 135 68 135 104 C135 134 124 154 100 160 C76 154 65 134 65 104 Z" fill="url(#s${id})"/>
      <path d="M100 118 L97 132 L102 133" stroke="rgba(110,60,45,.45)" stroke-width="1.6" fill="none"/>`}
      ${eyes(expr, c, id)}${mouth(expr, c)}${must}
      ${hair(c, id)}
      ${glasses}${acc(c)}
      </g>
    </svg>`;
  }
  return { svg, has: n => !!C[n] };
})();
