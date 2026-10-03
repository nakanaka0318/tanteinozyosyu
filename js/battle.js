'use strict';
/* =========================================================
   BATTLE : 電脳戦（ターン制）と論戦（証拠提示バトル）
   ========================================================= */
const BATTLE = (() => {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const ENEMY_SVG = {
    watcher: `<svg viewBox="0 0 200 200" class="en-svg"><defs><radialGradient id="wg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff4a5a" stop-opacity=".5"/><stop offset="1" stop-color="#ff4a5a" stop-opacity="0"/></radialGradient></defs>
      <circle cx="100" cy="100" r="96" fill="url(#wg)"/>
      <g class="spin"><circle cx="100" cy="100" r="74" fill="none" stroke="#ff4a5a" stroke-width="3" stroke-dasharray="40 14"/></g>
      <g class="spin rev"><circle cx="100" cy="100" r="60" fill="none" stroke="#3ff0ff" stroke-width="1.5" stroke-dasharray="6 8" opacity=".7"/></g>
      <circle cx="100" cy="100" r="46" fill="#10131c" stroke="#5a6278" stroke-width="3"/>
      <path d="M20 100 L54 100 M146 100 L180 100" stroke="#9aa2b0" stroke-width="5"/><rect x="8" y="90" width="16" height="20" fill="#2a3044"/><rect x="176" y="90" width="16" height="20" fill="#2a3044"/>
      <circle cx="100" cy="100" r="22" fill="#ff4a5a"/><circle cx="100" cy="100" r="10" fill="#fff"/><circle class="blink" cx="100" cy="100" r="30" fill="none" stroke="#ff4a5a" stroke-width="2"/></svg>`,
    kerberos: `<svg viewBox="0 0 260 200" class="en-svg"><defs><radialGradient id="kg" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#ff3a4a" stop-opacity=".45"/><stop offset="1" stop-color="#ff3a4a" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="130" cy="110" rx="128" ry="92" fill="url(#kg)"/>
      <g stroke="#ff5a6a" stroke-width="1.4" fill="rgba(40,6,12,.85)">
        <path d="M70 150 L100 110 L160 110 L190 150 L170 190 L90 190 Z"/>
        <path d="M100 110 L130 150 L160 110 M90 190 L130 150 L170 190" fill="none" opacity=".7"/>
        <g class="head h1"><path d="M30 90 L62 50 L96 70 L88 112 L46 116 Z"/><path d="M46 116 L30 90 L20 120 Z"/><circle cx="70" cy="80" r="5" fill="#ffde5a" stroke="none"/><circle cx="82" cy="86" r="4" fill="#ffde5a" stroke="none"/></g>
        <g class="head h2"><path d="M98 50 L130 10 L162 50 L150 96 L110 96 Z"/><path d="M110 96 L130 120 L150 96" /><circle cx="118" cy="52" r="6" fill="#ffde5a" stroke="none"/><circle cx="142" cy="52" r="6" fill="#ffde5a" stroke="none"/></g>
        <g class="head h3"><path d="M230 90 L198 50 L164 70 L172 112 L214 116 Z"/><path d="M214 116 L230 90 L240 120 Z"/><circle cx="190" cy="80" r="5" fill="#ffde5a" stroke="none"/><circle cx="178" cy="86" r="4" fill="#ffde5a" stroke="none"/></g>
      </g>
      <g stroke="#3ff0ff" stroke-width="1" opacity=".5" fill="none"><path d="M60 196 L200 196"/><path d="M80 192 L180 192"/></g></svg>`,
  };
  const ICON = { me: '◆', muse: '✦' };

  let root = null;
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function build(mode) {
    root = $('battle'); root.innerHTML = ''; root.className = 'bt-' + mode;
    $('toast').classList.add('hidden'); G.hud(false); DLG.close();
    root.append(el('div', 'bt-bg'), el('div', 'bt-scan'));
    const en = el('div', 'bt-enemy');
    en.append(el('div', 'bt-ename'), el('div', 'bt-ehpwrap', '<div class="bt-ehp"><div class="fill"></div><div class="lag"></div></div><span class="bt-ehpn"></span>'), el('div', 'bt-esprite'), el('div', 'bt-intent'));
    root.append(en, el('div', 'bt-msg'));
    const bottom = el('div', 'bt-bottom');
    bottom.append(el('div', 'bt-cmds'), el('div', 'bt-party'));
    root.append(bottom, el('div', 'bt-pops'));
    root.classList.remove('hidden');
  }
  const q = s => root.querySelector(s);
  async function msg(text, ms = 900) {
    const m = q('.bt-msg'); m.innerHTML = richHTML(text); m.classList.remove('pop'); void m.offsetWidth; m.classList.add('pop');
    await sleep(ms);
  }
  function pop(target, text, cls) {
    const host = q('.bt-pops');
    const p = el('div', 'bt-pop ' + (cls || ''), text);
    let r;
    if (target === 'enemy') r = q('.bt-esprite').getBoundingClientRect();
    else { const card = q(`.bt-card[data-id="${target}"]`); r = card ? card.getBoundingClientRect() : q('.bt-party').getBoundingClientRect(); }
    const s = root.getBoundingClientRect();
    p.style.left = ((r.left + r.width / 2 - s.left) / s.width * 100) + '%';
    p.style.top = ((r.top + r.height * 0.35 - s.top) / s.height * 100) + '%';
    host.appendChild(p); setTimeout(() => p.remove(), 1100);
  }
  function hitFx(target, big) {
    const t = target === 'enemy' ? q('.bt-esprite') : q(`.bt-card[data-id="${target}"]`);
    if (t) { t.classList.remove('hit'); void t.offsetWidth; t.classList.add('hit'); }
    if (big) { shake(5, 350, true); flash(target === 'enemy' ? '#bff' : '#f44', 200); }
  }
  function setEnemyHP(cur, max) {
    const f = q('.bt-ehp .fill'), l = q('.bt-ehp .lag');
    const pc = Math.max(0, cur / max * 100);
    f.style.width = pc + '%'; setTimeout(() => { l.style.width = pc + '%'; }, 350);
    q('.bt-ehpn').textContent = `${Math.max(0, Math.ceil(cur))} / ${max}`;
  }
  function menu(items, title) {
    return new Promise(res => {
      const box = q('.bt-cmds'); box.innerHTML = '';
      if (title) box.appendChild(el('div', 'bt-ctitle', title));
      let sel = items.findIndex(i => !i.dis); if (sel < 0) sel = 0;
      const btns = items.map((it, i) => {
        const b = el('button', 'bt-cmd' + (it.dis ? ' dis' : ''), `<span>${it.label}</span>${it.note ? `<small>${it.note}</small>` : ''}`);
        b.onclick = e => { e.stopPropagation(); if (it.dis) { SND.se('wrong'); return; } sel = i; fin(); };
        b.onmouseenter = () => { sel = i; draw(); };
        box.appendChild(b); return b;
      });
      const draw = () => { btns.forEach((b, i) => b.classList.toggle('sel', i === sel)); if (items[sel] && items[sel].help) q('.bt-msg').innerHTML = richHTML(items[sel].help); };
      const fin = () => { popH(h); SND.se('ok'); box.innerHTML = ''; res(items[sel].v); };
      const h = { key: a => {
        if (a === 'up' || a === 'left') { sel = (sel + items.length - 1) % items.length; SND.se('cursor'); draw(); }
        else if (a === 'down' || a === 'right') { sel = (sel + 1) % items.length; SND.se('cursor'); draw(); }
        else if (a === 'ok') { if (items[sel].dis) SND.se('wrong'); else fin(); }
        else if (a === 'cancel') { const back = items.findIndex(i => i.v === 'back'); if (back >= 0) { sel = back; fin(); } }
      } };
      draw(); pushH(h);
    });
  }

  /* ======================= 電脳戦 ======================= */
  async function run(def) {
    const P = STATE.party;
    const E = { name: def.name, hp: def.hp, max: def.hp, turn: 0 };
    let shield = 0, buff = 0, advised = false, museHealCD = 0;
    build('cyber');
    q('.bt-ename').textContent = E.name;
    q('.bt-esprite').innerHTML = ENEMY_SVG[def.sprite];
    setEnemyHP(E.hp, E.max);
    const renderParty = () => {
      const box = q('.bt-party'); box.innerHTML = '';
      [['me', STATE.name, P.me], ['muse', 'MUSE', P.muse]].forEach(([id, nm, m]) => {
        const c = el('div', 'bt-card' + (m.hp <= 0 ? ' ko' : '') + (m.hp > 0 && m.hp <= m.max * 0.3 ? ' danger' : ''));
        c.dataset.id = id;
        c.innerHTML = `<div class="bt-cname">${ICON[id]} ${esc(nm)}</div>
          <div class="bt-bar hp"><div style="width:${Math.max(0, m.hp / m.max * 100)}%"></div></div><div class="bt-num">HP ${Math.max(0, m.hp)} / ${m.max}</div>
          ${m.maxep ? `<div class="bt-bar ep"><div style="width:${m.ep / m.maxep * 100}%"></div></div><div class="bt-num">EP ${m.ep} / ${m.maxep}</div>` : ''}`;
        box.appendChild(c);
      });
      const st = [];
      if (shield) st.push('<span class="bt-st sh">シールド</span>');
      if (buff) st.push(`<span class="bt-st bf">九条の指示 ${buff}</span>`);
      if (st.length) box.appendChild(el('div', 'bt-sts', st.join('')));
    };
    const nextAct = () => def.pattern[E.turn % def.pattern.length];
    const showIntent = () => {
      const i = q('.bt-intent'); const n = nextAct();
      if (advised || n === 'burst') i.innerHTML = { atk: '次の行動：攻撃', charge: '次の行動：充填', burst: '⚠ 次の行動：全体攻撃', heal: '次の行動：自己修復' }[n];
      else i.innerHTML = '';
      i.classList.toggle('warn', n === 'burst');
    };
    SND.bgm(def.bgm || 'c_battle');
    SND.se('glitch'); flash('#3ff0ff', 300);
    renderParty();
    await msg(def.intro || `${E.name} が立ちはだかった！`, 1300);
    let result = null;
    while (!result) {
      renderParty(); showIntent();
      // ---- 助手の行動 ----
      let acted = false;
      while (!acted) {
        const top = await menu([
          { label: 'アタック', v: 'atk', help: '通常攻撃。' },
          { label: 'スキル', v: 'skill', note: `EP ${P.me.ep}`, help: 'EPを使って特殊な処理を行う。' },
          { label: 'アイテム', v: 'item', note: `×${STATE.items.patch}`, dis: STATE.items.patch <= 0, help: '回復パッチを使う。' },
          { label: '九条に相談', v: 'kujo', dis: advised, help: advised ? '（この戦闘ではもう相談した）' : '外部の九条に敵を分析してもらう（1回のみ）。' },
        ], `${STATE.name} の行動`);
        if (top === 'atk') {
          let d = rnd(13, 18) * (buff ? 1.4 : 1); const crit = Math.random() < 0.1; if (crit) d *= 1.6; d = Math.round(d);
          SND.se(crit ? 'crit' : 'hit'); hitFx('enemy', crit); pop('enemy', d, crit ? 'crit' : '');
          E.hp -= d; setEnemyHP(E.hp, E.max);
          await msg(`${STATE.name} のアタック！ ${crit ? '【クリティカル！】 ' : ''}${d} のダメージ。`);
          acted = true;
        } else if (top === 'skill') {
          const sk = await menu([
            { label: 'デコード', v: 'decode', note: 'EP5', dis: P.me.ep < 5, help: '暗号化された防壁を解読して攻撃する。【弱点を突けば大ダメージ】。' },
            { label: 'シールド', v: 'shield', note: 'EP4', dis: P.me.ep < 4, help: '次の敵の攻撃を半減する防壁を張る。' },
            { label: 'リペア', v: 'repair', note: 'EP5', dis: P.me.ep < 5, help: '味方全員のHPを回復する。' },
            { label: '戻る', v: 'back', help: '' },
          ], 'スキル');
          if (sk === 'back') continue;
          if (sk === 'decode') {
            P.me.ep -= 5;
            const weak = def.weak === 'decode';
            let d = Math.round((weak ? rnd(30, 36) : rnd(16, 20)) * (buff ? 1.4 : 1));
            SND.se(weak ? 'crit' : 'zap'); hitFx('enemy', weak); pop('enemy', d, weak ? 'crit' : '');
            E.hp -= d; setEnemyHP(E.hp, E.max);
            await msg(`デコード！ ${weak ? '【弱点を突いた！】 ' : ''}${d} のダメージ。`);
          } else if (sk === 'shield') {
            P.me.ep -= 4; shield = 1; SND.se('shield');
            await msg('シールドを展開した。次の攻撃を半減する。');
          } else if (sk === 'repair') {
            P.me.ep -= 5; SND.se('heal');
            for (const id of ['me', 'muse']) { const m = P[id]; if (m.hp > 0) { const h = Math.min(m.max - m.hp, 30); m.hp += h; pop(id, '+' + h, 'heal'); } }
            renderParty();
            await msg('リペア！ 味方全員のHPが回復した。');
          }
          acted = true;
        } else if (top === 'item') {
          const it = await menu([{ label: '回復パッチ', v: 'patch', note: `×${STATE.items.patch}`, help: `${STATE.name}のHPを50、MUSEのHPを25回復する。` }, { label: '戻る', v: 'back', help: '' }], 'アイテム');
          if (it === 'back') continue;
          STATE.items.patch--; SND.se('heal');
          const a = Math.min(P.me.max - P.me.hp, 50); P.me.hp += a; pop('me', '+' + a, 'heal');
          if (P.muse.hp > 0) { const b = Math.min(P.muse.max - P.muse.hp, 25); P.muse.hp += b; }
          renderParty();
          await msg('回復パッチを使った。');
          acted = true;
        } else if (top === 'kujo') {
          advised = true; buff = 3;
          q('.bt-cmds').innerHTML = '';
          await G.say('kujo', def.advice, 'serious');
          DLG.close();
          await msg('【九条の指示】 攻撃力が上がった！（3ターン）　敵の行動が読めるようになった。', 1300);
          showIntent();
          acted = true;
        }
      }
      renderParty();
      if (E.hp <= 0) { result = 'win'; break; }
      // ---- MUSEの行動 ----
      if (P.muse.hp > 0) {
        await sleep(250);
        const low = ['me', 'muse'].map(id => [id, P[id]]).filter(([, m]) => m.hp > 0 && m.hp < m.max * 0.45).sort((a, b) => a[1].hp / a[1].max - b[1].hp / b[1].max)[0];
        if (low && museHealCD <= 0) {
          const h = Math.min(low[1].max - low[1].hp, 24); low[1].hp += h; museHealCD = 2;
          SND.se('heal'); pop(low[0], '+' + h, 'heal'); renderParty();
          await msg(`MUSE のリカバリ！ ${low[0] === 'me' ? STATE.name : 'MUSE'} のHPが ${h} 回復した。`);
        } else {
          const d = Math.round(rnd(9, 13) * (buff ? 1.4 : 1));
          SND.se('zap'); hitFx('enemy'); pop('enemy', d);
          E.hp -= d; setEnemyHP(E.hp, E.max);
          await msg(`MUSE のプリズム・ショット！ ${d} のダメージ。`);
        }
        museHealCD--;
        if (E.hp <= 0) { result = 'win'; break; }
      }
      // ---- 敵の行動 ----
      await sleep(250);
      const act = nextAct(); E.turn++;
      if (act === 'atk') {
        const tgt = P.muse.hp > 0 && Math.random() < 0.4 ? 'muse' : 'me';
        let d = rnd(def.atk[0], def.atk[1]); if (shield) { d = Math.round(d / 2); shield = 0; }
        P[tgt].hp -= d; SND.se('hurt'); hitFx(tgt, d >= 18); pop(tgt, d, 'dmg');
        renderParty();
        await msg(`${E.name} の攻撃！ ${tgt === 'me' ? STATE.name : 'MUSE'} に ${d} のダメージ。`);
        if (tgt === 'muse' && P.muse.hp <= 0) { P.muse.hp = 0; await msg('MUSE の接続が途切れた……！'); }
      } else if (act === 'charge') {
        SND.se('charge'); q('.bt-esprite').classList.add('charging');
        await msg(`${E.name} は膨大なエネルギーを充填している……！`, 1200);
      } else if (act === 'burst') {
        q('.bt-esprite').classList.remove('charging');
        SND.se('crit'); shake(7, 500, true); flash('#f44', 300);
        for (const id of ['me', 'muse']) { if (P[id].hp <= 0) continue; let d = rnd(def.burst[0], def.burst[1]); if (shield) d = Math.round(d / 2); P[id].hp -= d; pop(id, d, 'dmg'); hitFx(id); if (P[id].hp <= 0) P[id].hp = 0; }
        shield = 0; renderParty();
        await msg(`${E.name} の【${def.burstName || 'オーバーロード'}】！ 全員に大ダメージ！`, 1200);
      } else if (act === 'heal') {
        const h = def.healAmt || 20; E.hp = Math.min(E.max, E.hp + h); setEnemyHP(E.hp, E.max); SND.se('heal'); pop('enemy', '+' + h, 'heal');
        await msg(`${E.name} は自己修復を行った。HPが ${h} 回復。`);
      }
      if (P.me.hp <= 0) { P.me.hp = 0; renderParty(); result = 'lose'; break; }
      P.me.ep = Math.min(P.me.maxep, P.me.ep + 2);
      if (buff) buff--;
    }
    if (result === 'win') {
      q('.bt-esprite').classList.add('dead'); SND.se('victory'); SND.bgm(null);
      await msg(`${E.name} を撃破した！`, 1600);
      P.me.hp = Math.max(P.me.hp, Math.round(P.me.max * 0.6)); P.me.ep = Math.max(P.me.ep, 10);
      P.muse.hp = Math.max(P.muse.hp, Math.round(P.muse.max * 0.6));
      await fade(1, 400); root.classList.add('hidden'); G.hud(true); await fade(0, 400);
      return 'win';
    }
    await msg(`${STATE.name} の意識が、電脳の闇に引きずり込まれていく……`, 1800);
    root.classList.add('hidden');
    await G.gameOver('GAME OVER', 'ダイブ失敗', def.loseText || '強制切断――{N}の意識は、電脳の闇に呑まれた。');
  }

  /* ======================= 機内戦（空の名探偵編） ======================= */
  async function sky(def) {
    const P = STATE.party;
    const E = { name: def.name, hp: def.hp, max: def.hp, turn: 0 };
    let stun = 0, listen = false, decoy = false, guard = false, siestaGuard = false, hinted = !!STATE.flags.caseOpen;
    build('cyber'); root.classList.add('bt-sky');
    q('.bt-ename').textContent = E.name;
    q('.bt-esprite').innerHTML = def.svg;
    setEnemyHP(E.hp, E.max);
    const NM = { me: () => STATE.name, siesta: () => 'シエスタ' };
    const renderParty = () => {
      const box = q('.bt-party'); box.innerHTML = '';
      [['me', P.me], ['siesta', P.siesta]].forEach(([id, m]) => {
        const c = el('div', 'bt-card' + (m.hp <= 0 ? ' ko' : '') + (m.hp > 0 && m.hp <= m.max * 0.3 ? ' danger' : ''));
        c.dataset.id = id;
        c.innerHTML = `<div class="bt-cname">${id === 'me' ? '◆' : '✦'} ${esc(NM[id]())}</div>
          <div class="bt-bar hp"><div style="width:${Math.max(0, m.hp / m.max * 100)}%"></div></div><div class="bt-num">HP ${Math.max(0, m.hp)} / ${m.max}</div>
          ${id === 'me' && STATE.flags.caseOpen ? `<div class="bt-num">残弾 ${STATE.items.ammo} / 6</div>` : ''}`;
        box.appendChild(c);
      });
      const st = [];
      if (stun) st.push(`<span class="bt-st bf">聴覚マヒ ${stun}</span>`);
      if (listen) st.push('<span class="bt-st sh">敵：聴音中</span>');
      if (decoy) st.push('<span class="bt-st sh">おとり</span>');
      if (st.length) box.appendChild(el('div', 'bt-sts', st.join('')));
    };
    const nextAct = () => def.pattern[E.turn % def.pattern.length];
    const showIntent = () => {
      const i = q('.bt-intent'); const n = stun ? 'stun' : nextAct();
      i.innerHTML = 'シエスタの分析：' + { atk: '次は触手の薙ぎ払い', listen: '次は「聴音」――足音で攻撃を読まれる', roar: '⚠ 次は超音波の咆哮（全体攻撃）', stun: '聴覚がマヒしている。今が好機！' }[n];
      i.classList.toggle('warn', n === 'roar');
    };
    const dmgTo = async (id, d, text) => {
      const m = P[id]; if (m.hp <= 0) return;
      if (id === 'me' && guard) d = Math.round(d / 2);
      if (id === 'me' && siestaGuard) { d = Math.round(d * 0.4); }
      m.hp = Math.max(0, m.hp - d); SND.se('hurt'); hitFx(id, d >= 18); pop(id, d, 'dmg'); renderParty();
      await msg(text.replace('#', NM[id]()).replace('$', d));
    };
    const hitEnemy = async (d, text, crit) => {
      SND.se(crit ? 'crit' : 'hit'); hitFx('enemy', crit); pop('enemy', d, crit ? 'crit' : '');
      E.hp -= d; setEnemyHP(E.hp, E.max); await msg(text.replace('$', d));
    };
    SND.bgm(def.bgm || 'c_boss');
    SND.se('glitch'); flash('#b46aff', 300);
    renderParty();
    await msg(def.intro || `${E.name} が襲いかかってきた！`, 1400);
    let result = null;
    while (!result) {
      renderParty(); showIntent();
      guard = false; siestaGuard = false;
      let acted = false;
      while (!acted) {
        const opened = !!STATE.flags.caseOpen;
        const top = await menu([
          { label: 'たたかう', v: 'atk', help: stun ? '素手で殴りかかる。今なら当たる！' : '素手で殴りかかる。……ただし、足音は聴かれている。' },
          opened
            ? { label: '銃を撃つ', v: 'gun', note: `残弾 ${STATE.items.ammo}`, dis: STATE.items.ammo <= 0, help: '【シエスタの銃】。轟音が、狭い機内に反響する。' }
            : { label: 'アタッシュケース', v: 'case', help: hinted ? 'シエスタに教わった番号で、ケースを開ける。' : '空港で押しつけられたケース。ダイヤル錠がかかっている。' },
          { label: '物を投げる', v: 'decoy', help: '機内食のトレーを投げて物音を立てる。次の触手攻撃を、音のほうへ逸らす。' },
          { label: '身を守る', v: 'guard', help: 'このターン、受けるダメージを半減する。' },
          { label: 'ミネラルウォーター', v: 'water', note: `×${STATE.items.water}`, dis: STATE.items.water <= 0, help: `${STATE.name}のHPを40回復する。` },
        ], `${STATE.name} の行動`);
        if (top === 'atk') {
          if (!stun && listen) {
            await msg('足音を聴き取られた！ 拳は空を切った――', 900);
            await dmgTo('me', rnd(8, 12), '触手のカウンター！ # に $ のダメージ。');
          } else if (!stun && Math.random() < 0.65) {
            SND.se('cancel'); await msg('かわされた！ 動きを、音で読まれている……！');
          } else {
            const d = stun ? rnd(14, 19) : rnd(9, 13);
            await hitEnemy(d, `${STATE.name} の攻撃！ $ のダメージ。`);
          }
          acted = true;
        } else if (top === 'case') {
          if (!hinted) { SND.se('wrong'); await msg('ダイヤル錠がかかっている……！ 番号が分からない。', 1100); continue; }
          STATE.flags.caseOpen = true; STATE.items.ammo = 6;
          SND.se('clue'); flash('#fff', 200);
          q('.bt-cmds').innerHTML = '';
          await msg('カチリ。――ケースの中には、一丁の銃が収められていた。', 1600);
          await G.say('siesta', 'それ、私の銃。撃ち方は分かるでしょ？ ……分からなくても、引き金を引けば弾は出るから。', 'smile');
          await G.say('me', 'そういう問題じゃない！！', 'shock'); DLG.close();
          renderParty();
          acted = true;
        } else if (top === 'gun') {
          STATE.items.ammo--;
          SND.se('crit'); shake(8, 500, true); flash('#fff', 250);
          if (stun) {
            await hitEnemy(rnd(34, 42), '銃声！ 【聴覚がマヒした相手には、避けられない】！ $ のダメージ。', true);
          } else {
            if (Math.random() < 0.7) await hitEnemy(rnd(24, 30), '銃声が、狭い機内に反響した！ $ のダメージ。', true);
            else await msg('銃声が機内に反響した！ 弾は、わずかに逸れた――');
            stun = 2; listen = false;
            SND.se('glitch');
            await msg(`${E.name} が耳を押さえてのたうち回る！ 【聴覚マヒ】！`, 1300);
          }
          acted = true;
        } else if (top === 'decoy') {
          decoy = true; SND.se('crash');
          await msg('トレーを放り投げた！ ガシャン――触手が、音のほうへ向く！');
          acted = true;
        } else if (top === 'guard') {
          guard = true; SND.se('shield');
          await msg(`${STATE.name} は身を守っている。`);
          acted = true;
        } else if (top === 'water') {
          STATE.items.water--; SND.se('heal');
          const a = Math.min(P.me.max - P.me.hp, 40); P.me.hp += a; pop('me', '+' + a, 'heal'); renderParty();
          await msg(`ミネラルウォーターを飲んだ。HPが ${a} 回復。`);
          acted = true;
        }
      }
      renderParty();
      if (E.hp <= 0) { result = 'win'; break; }
      // ---- シエスタの行動 ----
      if (!hinted && E.turn >= 1) {
        await sleep(250);
        {
          hinted = true;
          q('.bt-cmds').innerHTML = '';
          await G.say('siesta', '助手。あの耳は、聴こえすぎてる。……なら、聴かせてあげればいい。とびきり大きな音を。', 'serious');
          await G.say('siesta', 'アタッシュケースの番号は【0・7・2・1】。', 'smile');
          await G.say('me', 'なんで知ってるの!?', 'shock');
          await G.say('siesta', '空港で君に持たせたの、私だから。', 'smile');
          await G.say('me', '…………はあ!?', 'shock'); DLG.close();
          await msg('【アタッシュケース】が開けられるようになった！', 1300);
        }
      } else if (P.siesta.hp > 0) {
        await sleep(250);
        if (P.me.hp > 0 && P.me.hp <= P.me.max * 0.35 && !stun) {
          siestaGuard = true; SND.se('shield');
          await msg('シエスタが前に出た！ 「下がって、助手」――次の攻撃から庇う。', 1200);
        } else if (stun || Math.random() < 0.5) {
          await hitEnemy(stun ? rnd(14, 18) : rnd(9, 13), 'シエスタの回し蹴り！ $ のダメージ。');
        } else {
          SND.se('cancel'); await msg('シエスタの蹴り――触手に受け流された。');
        }
        if (E.hp <= 0) { result = 'win'; break; }
      }
      // ---- 敵の行動 ----
      await sleep(250);
      if (stun) {
        stun--; SND.se('glitch');
        await msg(`${E.name} は耳を押さえて苦しんでいる……！`);
      } else {
        const act = nextAct(); E.turn++;
        listen = false;
        if (act === 'atk') {
          if (decoy) { decoy = false; SND.se('whoosh'); await msg('触手が、転がったトレーを叩き潰した！ ――攻撃を逸らした！'); }
          else {
            const tgt = siestaGuard || (P.siesta.hp > 0 && Math.random() < 0.35) ? 'siesta' : 'me';
            await dmgTo(tgt, rnd(def.atk[0], def.atk[1]), `触手の薙ぎ払い！ # に $ のダメージ。`);
          }
        } else if (act === 'listen') {
          listen = true; SND.se('charge'); q('.bt-esprite').classList.add('charging');
          await msg(`${E.name} は耳を澄ませている……（次の「たたかう」は読まれる）`, 1200);
          q('.bt-esprite').classList.remove('charging');
        } else if (act === 'roar') {
          SND.se('crit'); shake(7, 500, true); flash('#b46aff', 300);
          await msg(`${E.name} の【超音波の咆哮】！`, 900);
          for (const id of ['me', 'siesta']) await dmgTo(id, rnd(def.roar[0], def.roar[1]), '# に $ のダメージ。');
        }
      }
      if (P.me.hp <= 0) { P.me.hp = 0; renderParty(); result = 'lose'; break; }
    }
    if (result === 'win') {
      q('.bt-esprite').classList.add('dead'); SND.se('victory'); SND.bgm(null);
      await msg(`${E.name} は、崩れ落ちた――！`, 1800);
      await fade(1, 400); root.classList.add('hidden'); G.hud(true); await fade(0, 400);
      return 'win';
    }
    await msg(`${STATE.name} は、触手に締め上げられ――意識が遠のいていく……`, 1800);
    root.classList.add('hidden');
    await G.gameOver('GAME OVER', '高度一万メートルの闇', def.loseText);
  }

  /* ======================= 論戦 ======================= */
  async function debate(def) {
    build('debate');
    const E = { hp: 100, max: 100 };
    let breath = 1;
    q('.bt-ename').textContent = def.name;
    const face = expr => { q('.bt-esprite').innerHTML = PORTRAIT.svg(def.enemy, expr); };
    face('normal');
    q('.bt-ehpwrap').insertAdjacentHTML('afterbegin', '<span class="bt-elabel">心の防壁</span>');
    setEnemyHP(E.hp, E.max);
    const renderParty = () => {
      const box = q('.bt-party');
      const f = STATE.focus;
      box.innerHTML = `<div class="bt-card focus${f <= 30 ? ' danger' : ''}" data-id="me"><div class="bt-cname">${def.partyName ? sub(def.partyName) : '九条 ＆ ' + esc(STATE.name)}</div>
        <div class="bt-bar hp"><div style="width:${Math.max(0, f)}%"></div></div><div class="bt-num">${def.hpName || '集中力'} ${Math.max(0, f)} / 100</div></div>`;
    };
    renderParty();
    SND.bgm(def.bgm || 'c_debate');
    flash('#fff', 250);
    await msg(def.intro || '論戦開始！', 1200);
    const per = Math.ceil(E.max / def.rounds.length);
    for (let i = 0; i < def.rounds.length; i++) {
      const r = def.rounds[i];
      face(r.face || 'angry');
      q('.bt-esprite').classList.remove('hit'); void q('.bt-esprite').offsetWidth; q('.bt-esprite').classList.add('hit');
      SND.se('present');
      const claim = q('.bt-intent'); claim.className = 'bt-intent claim'; claim.innerHTML = richHTML('「' + r.claim + '」');
      await msg(`${def.short} の反論！`, 700);
      let solved = false;
      while (!solved) {
        renderParty();
        const c = await menu([
          { label: '証拠をつきつける', v: 'present', help: `手帳から、反論を崩す証拠を選ぶ。【間違えると${def.hpName || '集中力'}が大きく減る】。` },
          { label: def.hintLabel || '九条の推理を聞く', v: 'hint', help: `${def.hintHelp || '九条から手がかりをもらう。'}（${def.hpName || '集中力'} -8）` },
          { label: '深呼吸する', v: 'breath', note: `残り${breath}`, dis: breath <= 0, help: `${def.hpName || '集中力'}を20回復する。（1回のみ）` },
        ], '論戦');
        if (c === 'present') {
          const id = await NB.open('present', r.claim.length > 30 ? r.claim.slice(0, 30) + '…' : r.claim);
          if (r.correct.includes(id)) {
            solved = true;
            await cutin(r.cut || '異議あり！', EVIDENCE[id].icon, 1200);
            E.hp -= per; setEnemyHP(E.hp, E.max); face('shock'); hitFx('enemy', true); pop('enemy', per, 'crit');
            SND.se('crit');
            await msg(`${def.short} の防壁に ${per} のダメージ！`, 900);
            claim.innerHTML = '';
            if (r.after) { await r.after(); DLG.close(); }
          } else if (r.alt && r.alt[id]) {
            await G.say(def.hintSpeaker || 'kujo', r.alt[id], 'think'); DLG.close();
          } else {
            SND.se('wrong'); face('smile');
            STATE.focus = Math.max(0, STATE.focus - (def.wrongDmg || 20)); renderParty(); hitFx('me', true); pop('me', def.wrongDmg || 20, 'dmg');
            await msg(`${def.short} の反撃！ 「${r.counter || 'そんなもの、何の証拠にもならないわ'}」`, 1500);
          }
        } else if (c === 'hint') {
          STATE.focus = Math.max(0, STATE.focus - 8); renderParty(); pop('me', 8, 'dmg');
          await G.say(def.hintSpeaker || 'kujo', r.hint, 'think'); DLG.close();
        } else if (c === 'breath') {
          breath--; STATE.focus = Math.min(100, STATE.focus + 20); SND.se('heal'); renderParty(); pop('me', '+20', 'heal');
          await msg(`深呼吸をして、心を落ち着けた。${def.hpName || '集中力'}が20回復。`);
        }
        if (STATE.focus <= 0) {
          await msg('論理が崩れていく……もう、言葉が出てこない。', 1600);
          root.classList.add('hidden');
          await G.gameOver('BAD END', '真相は闇へ', def.loseText);
        }
      }
    }
    face('sad');
    await msg(`${def.short} の心の防壁が崩れ落ちた――！`, 1600);
    await fade(1, 500); root.classList.add('hidden'); G.hud(true); await fade(0, 500);
    return 'win';
  }

  return { run, debate, sky };
})();
