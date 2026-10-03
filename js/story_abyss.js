'use strict';
/* =========================================================
   STORY_ABYSS : 世界樹の深淵 ― シナリオ
   ========================================================= */
const STORY_ABYSS = (() => {
  const f = () => STATE.flags;
  const ch = () => STATE.chapter;
  const has = id => STATE.evidence.includes(id);
  const S = (t, e, o) => G.say('siesta', t, e, o);
  const M = (t, e, o) => G.say('me', t, e, o);
  const N = (t, o) => G.narr(t, o);
  const X = (w, t, e, o) => G.say(w, t, e, o);
  const touch = () => document.body.classList.contains('touch');

  const CLUES = ['z_log', 'z_light', 'z_graft'];
  const clueCount = () => CLUES.filter(has).length;

  /* ---------------- 潜入：機械兵と警報床 ---------------- */
  const SENTRIES = [
    { id: 'mech1', x: 11, y: 16, dirs: ['right', 'down', 'left', 'up'], period: 2000 },
    { id: 'mech2', x: 24, y: 16, dirs: ['left', 'up', 'right', 'down'], period: 1800 },
    { id: 'mech3', x: 22, y: 10, dirs: ['left', 'down', 'right', 'up'], period: 2000 },
    { id: 'mech4', x: 9, y: 10, dirs: ['right', 'up', 'left', 'down'], period: 2200 },
    { id: 'mech5', x: 11, y: 4, dirs: ['right', 'down', 'left', 'up'], period: 1700 },
    { id: 'mech6', x: 17, y: 5, dirs: ['up', 'right', 'down', 'left'], period: 1900 },
    { id: 'mech7', x: 25, y: 3, dirs: ['left', 'down', 'right', 'up'], period: 1600 },
  ];
  const SIGHT = 4;
  const DV2 = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const sentryState = {};
  function sightTiles(s) {
    const a = G.getActor(s.id); if (!a) return [];
    const [dx, dy] = DV2[a.dir] || [0, 1];
    const out = [];
    for (let k = 1; k <= SIGHT; k++) { const x = s.x + dx * k, y = s.y + dy * k; if (!walkable(x, y)) break; out.push([x, y]); }
    return out;
  }
  const sneaking = () => ch() === 2 && W.mapId === 'AB' && W.mode === 'play';
  function tick(dt) {
    if (W.mapId === 'ESC' && ch() === 4) {
      W.rumble = (W.rumble || 0) + dt;
      if (W.rumble > 2600) { W.rumble = 0; G.shake(2 + Math.random() * 2, 400); if (Math.random() < 0.5) SND.se('thunder', 0.4); }
      return;
    }
    if (!sneaking() || W.caught) return;
    for (const s of SENTRIES) {
      const st = sentryState[s.id] || (sentryState[s.id] = { t: Math.random() * 600, i: 0 });
      st.t += dt;
      if (st.t >= s.period) { st.t = 0; st.i = (st.i + 1) % s.dirs.length; const a = G.getActor(s.id); if (a) a.dir = s.dirs[st.i]; }
    }
    const P = W.P, px = P.moving ? P.tx : P.x, py = P.moving ? P.ty : P.y;
    for (const s of SENTRIES) if (sightTiles(s).some(([x, y]) => x === px && y === py)) { caughtNow('sight'); return; }
  }
  function overlay(c) {
    if (!sneaking()) return;
    const pulse = 0.18 + Math.sin(W.t * 0.008) * 0.06;
    for (const s of SENTRIES) {
      const tiles = sightTiles(s);
      tiles.forEach(([x, y], i) => {
        c.fillStyle = `rgba(255,214,60,${(pulse + 0.12) * (1 - i * 0.14)})`; c.fillRect(x * TS, y * TS, TS, TS);
        c.strokeStyle = `rgba(255,240,150,${0.55 - i * 0.1})`; c.lineWidth = 1; c.strokeRect(x * TS + 0.5, y * TS + 0.5, TS - 1, TS - 1);
      });
    }
  }
  function onStep(x, y) {
    if (!sneaking() || W.caught) return;
    const t = ART.at(W.map.grid, x, y);
    if (t === ',') {
      STATE.focus = (STATE.focus === undefined ? 100 : STATE.focus) - 16;
      if (STATE.focus < 0) { STATE.focus = 0; G.refresh(); caughtNow('floor'); return; }
      if (STATE.focus <= 32) SND.se('blip');
    } else if (STATE.focus !== 100) { STATE.focus = 100; SND.se('heal'); }
    G.refresh();
    const zone = y >= 14 ? 1 : y >= 8 ? 2 : y >= 2 ? 3 : 3;
    if (zone > (f().zone || 1)) {
      f().zone = zone;
      G.checkpoint('sneak');
      G.toast(`<b>${zone === 2 ? '第二区画' : '第三区画'}</b>に到達。（ここからやり直せます）`, 3000);
    }
  }
  function caughtNow(why) {
    if (W.caught) return;
    W.caught = true;
    runScript(async () => {
      SND.se('sting'); G.flash('#ff2040', 400); G.shake(5, 500, true);
      if (why === 'floor') await N('浮遊の力が尽き――つま先が、警報床に触れた。');
      else await N('機械兵の赤い視線が、こちらを捉えた――！');
      SND.se('glitch');
      await N('けたたましい警報が、アジト中に鳴り響く。');
      await G.gameOver('GAME OVER', '発見', '四方から機械兵が殺到した。\n名探偵と助手は、世界樹の根に辿り着く前に捕らえられた。');
    });
  }
  async function sneak() {
    W.caught = false;
    STATE.chapter = 2; STATE.follow = true;
    if (STATE.focus === undefined || STATE.focus < 100) STATE.focus = 100;
    G.cinema(false); G.cam(null);
    G.clearActors(); G.restore();
    for (const s of SENTRIES) { const a = G.getActor(s.id); if (a) a.dir = s.dirs[0]; sentryState[s.id] = { t: 0, i: 0 }; }
    G.bgm('a_sneak');
    G.refresh();
    await G.fadeIn(500);
    G.toast('<b>赤い警報床</b>の上は浮遊で進む（<b>浮遊</b>ゲージを消費）。灰色の足場で回復。<br>機械兵の<b>黄色く光る視線</b>に入ると見つかります。', 7000);
  }

  /* ------------------------------------------------------------------ */
  function initState(S0) {
    S0.map = 'WS'; S0.x = 8; S0.y = 5; S0.dir = 'up';
    S0.follower = 'siesta'; S0.follow = false; S0.time = '';
    S0.party = { me: { hp: 90, max: 90 }, siesta: { hp: 110, max: 110 } };
    S0.items = { potion: 2 };
    S0.flags.named = true; S0.flags.revealed = true;
  }

  function npcs(id) {
    const L = [], c = STATE.chapter;
    const add = (i, x, y, d) => L.push({ id: i, x, y, dir: d });
    if (id === 'AB' && c === 2) for (const s of SENTRIES) add(s.id, s.x, s.y, s.dirs[0]);
    return L;
  }

  function objective() {
    if (ch() === 2) return clueCount() < 3 ? `最深部を目指す（エクシードの手がかり ${clueCount()} / 3）` : '最深部の扉へ（北東）';
    if (ch() === 4 && W.mapId === 'ESC') return 'シエスタを抱えて、外へ（東）';
    return '';
  }

  const FLAVOR = {
    R: ['壁と床を突き破って、太い根が這っている。脈打つように、かすかに光っている。'],
    C: ['資材のコンテナ。'], P: ['配管の束。低く唸っている。'], M: ['機械兵の格納ポッド。'], L: ['照明の柱。'],
    W: ['金属の壁。赤い警告灯が明滅している。'], E: ['外へ続く、搬入口。'],
    B: ['工具と設計図がぎっしり詰まった棚。'], X: ['部品棚。'], G: ['作りかけの天球儀。'], Q: ['作業台。'], K: ['柱時計。'], h: ['椅子。'], Z: ['設計図が貼られている。'],
  };
  async function flavor(c) { const L = FLAVOR[c]; if (!L) return; for (const l of L) await N(l); }

  /* ------------------------------------------------------------------
     序章 技工士の工房
     ------------------------------------------------------------------ */
  async function prologue() {
    STATE.chapter = 0;
    G.storm(false); G.rain(0); G.hum(0); G.bgm(null);
    await G.mono(['時計台の夜から、数日。', 'ユグドラシルの“根”の在処を知った私たちは、ある人物のもとを訪れていた。']);
    G.load('WS', 8, 5, 'up');
    G.cinema(true); G.clearActors();
    G.place('schwarz', 8, 3, 'down'); G.place('siesta', 7, 5, 'up'); G.place('me', 9, 5, 'up');
    G.cam(8.5, 4); G.snap();
    G.bgm('s_explore');
    await G.fadeIn(1100);
    await N('ロンドンの裏路地。歯車と油の匂いが充満する、小さな工房。');
    await X('schwarz', '……来たか、《名探偵》。', 'serious');
    await X('siesta', 'やあ、シュバルツ。久しぶり。', 'smile');
    await X('siesta', '助手、紹介するね。《技工士》シュバルツ。《調律者》のひとりで、私の道具を作ってくれた人。', 'smile');
    await X('schwarz', '……で、今日は何だ。', 'closed');
    await X('siesta', '道具の修理、五つ。それと――解析を一つ、お願いしたいの。', 'serious');
    SND.se('page');
    await N('シエスタが、作業台の上に道具を並べていく。');
    // ① マスターキー
    await X('siesta', 'まずはこれ。マスターキー。この世の扉の八割は、これで開くんだ。', 'smile');
    await G.gain('z_key', '魔法道具');
    await M('八割!? ……ちょっと待って。それってもしかして――', 'shock');
    G.flashback(true);
    G.load('O1', 4, 6, 'down');
    G.clearActors(); G.place('me', 4, 6, 'down'); G.place('siesta', 6, 8, 'up');
    G.cam(5, 6); G.snap();
    await N('――九条探偵事務所。鍵をかけて、ソファで眠っていたはずの朝。');
    await X('siesta', 'おはよう、助手。朝だよ。事件だよ。', 'smile');
    await M('ぎゃあああ!? な、なんで入ってこれるの!? 鍵かけたよね!?', 'shock');
    G.flashback(false);
    G.load('WS', 9, 5, 'up');
    G.clearActors(); G.place('schwarz', 8, 3, 'down'); G.place('siesta', 7, 5, 'up'); G.place('me', 9, 5, 'up');
    G.cam(8.5, 4); G.snap();
    await M('あれ、これの仕業だったの……！', 'angry');
    await X('siesta', 'ふふ。便利でしょ。', 'smile');
    // ② マスケット
    await X('siesta', '二つ目。マスケット銃。飛行機でも、時計台でも、ずいぶん働いてもらったね。', 'serious');
    await G.gain('z_musket', '魔法道具');
    // ③ 靴
    await X('siesta', '三つ目は、この靴。履くと、宙に浮けるんだ。', 'smile');
    await G.gain('z_shoes', '魔法道具');
    await M('浮く……？ あ。去年の雪山のロッジの密室！ 屋根の上の天窓から入ってたのって……！', 'shock');
    await X('siesta', '正解。足跡がつかないから、密室のできあがり。', 'smile');
    await M('探偵が密室を作らないで！！', 'angry');
    // ④ 手鏡
    await X('siesta', '四つ目。手鏡。これ、実はずーっと録画が回ってるカメラみたいなものなんだ。', 'smile');
    await G.gain('z_mirror', '魔法道具');
    await M('ずっと録画……？ じゃあ、今までのことも全部……？', 'think');
    await X('siesta', 'うん。君の寝言も、ばっちり。', 'smile');
    await M('消して!! 今すぐ!!', 'angry');
    await X('siesta', 'まあ、普段は前髪を直すのにしか使ってないけど。', 'smile');
    await X('schwarz', '……宝の持ち腐れだ。', 'closed');
    // ⑤ 五つ目
    await X('siesta', 'それから、五つ目。', 'serious');
    await N('シエスタは、何も並べなかった。ただ、自分の胸に、そっと手を当てただけだった。');
    await M('五つ目は……？', 'think');
    await X('siesta', 'これは、ひみつ。', 'smile');
    await G.gain('z_fifth', '魔法道具');
    await X('schwarz', '…………。', 'closed');
    await N('シュバルツさんが、一瞬だけ、痛ましいものを見るような目をした気がした。');
    // 聖典
    await X('siesta', 'それと、解析してほしいのはこっち。助手の《聖典》。', 'serious');
    await X('schwarz', '……ほう。持ち主によって力を変える、あれか。', 'think');
    await X('schwarz', '小僧――いや、嬢ちゃんか？ どっちでもいい。こいつは、持ち主に“見るべきもの”を見せる。', 'serious');
    await X('schwarz', 'だが、使い方を誤れば、持ち主の心を削る。……しばらく預かるぞ。', 'serious');
    await M('え、でも……。', 'sad');
    await X('siesta', '大丈夫。今度は、私がいるから。', 'smile');
    await N('こうして《聖典》は、シュバルツさんの工房に預けられることになった。');
    await G.fadeOut(1000);
    await ch1();
  }

  /* ------------------------------------------------------------------
     第一章 前夜
     ------------------------------------------------------------------ */
  async function ch1() {
    STATE.chapter = 1;
    await G.chapter('第一章', '前夜', '― アジト潜入の前日 ―');
    G.load('HT', 9, 6, 'up');
    G.cinema(true); G.clearActors();
    G.place('siesta', 7, 4, 'down'); G.place('me', 9, 6, 'up');
    G.cam(8, 5); G.snap();
    G.time('23:00');
    G.bgm('truth');
    await G.fadeIn(1000);
    await N('潜入前夜。ロンドンの、私の部屋。');
    await X('siesta', 'というわけで、今夜はやけ酒です。', 'smile');
    SND.se('ok');
    await N('シエスタが、どん、と瓶をテーブルに置いた。');
    await M('……シエスタ。それ、ノンアルコールのスパークリングワインって書いてあるけど。', 'think');
    await X('siesta', '気分の問題。雰囲気で酔うの。', 'smile');
    await M('やけ酒の意味、分かってる？', 'sad');
    await X('siesta', 'かんぱーい。', 'smile');
    await M('……かんぱい。', 'smile');
    await N('グラスが、小さく鳴った。');
    await X('siesta', 'そうだ、助手。君の机の引き出しに、手紙を入れておいたから。', 'serious');
    await M('手紙？', 'think');
    await X('siesta', '鉄の小箱に入れて、鍵をかけておいた。マスターキーでしか開かないやつ。', 'serious');
    await G.gain('z_letter', '預かりもの');
    await M('マスターキーでしか開かないって……それ、シエスタしか開けられないじゃん。', 'think');
    await X('siesta', 'そうだね。いつか、必要になったら開けて。', 'smile');
    await M('（どういう意味だろう……）', 'think');
    await X('siesta', 'それより、助手。君に大事なことを教えてあげる。', 'serious');
    await M('……な、なに？', 'serious');
    await X('siesta', 'その一。私、ロンドンの地下鉄で三回迷子になったことがある。', 'serious');
    await M('知らないよ！ 大事なことって言ったよね!?', 'angry');
    await X('siesta', 'その二。実は猫舌。紅茶は、いれてから三分待ってから飲んでる。', 'serious');
    await M('それは知ってた。毎朝、湯気をじっと睨んでるもんね。', 'sad');
    await X('siesta', 'その三。マスケット銃に名前をつけてる。……ジョン。', 'closed');
    await M('ジョン!? 銃に!?', 'shock');
    await X('siesta', 'ふふ。どれも、いらない情報だったね。', 'smile');
    await M('全部いらなかった！', 'angry');
    await N('二人で笑った。いつもの夜みたいに。');
    await N('――いつもの夜みたいに、笑っていたかった。');
    await X('siesta', '……ねえ、助手。明日は、きっと大変になる。', 'serious');
    await X('siesta', 'でも大丈夫。私は名探偵で、君は私の助手だから。', 'smile');
    await G.fadeOut(1400);
    G.bgm(null);
    await G.mono(['翌日。北の果て、凍てつく海の孤島。', '打ち捨てられた種子研究所の地下に――ユグドラシルのアジトはあった。']);
    await ch2();
  }

  /* ------------------------------------------------------------------
     第二章 潜入
     ------------------------------------------------------------------ */
  async function ch2() {
    STATE.chapter = 2; STATE.follow = true; f().zone = 1; G.time('');
    await G.chapter('第二章', '潜入', '― ユグドラシルのアジト ―');
    G.load('AB', 2, 18, 'up');
    G.cinema(true); G.clearActors(); G.restore();
    G.place('me', 2, 18, 'up'); G.place('siesta', 3, 18, 'up');
    G.cam(4, 16); G.snap();
    STATE.focus = 100;
    await G.fadeIn(900);
    await N('搬入口から、アジトの中へ。赤い光の格子が、床一面に走っていた。');
    await X('siesta', '警報床だね。足をつけたら、一発でばれる。', 'serious');
    await X('siesta', 'だから――はい、これ。', 'smile');
    SND.se('clue');
    await N('シエスタが指を鳴らすと、私の靴が、ふわりと淡く光った。');
    await X('siesta', 'あの靴、片方だけ貸してあげる。私とお揃い。警報床の上は、浮いて進もう。', 'smile');
    await M('片方で浮けるの!?', 'shock');
    await X('siesta', '気合い。……ただし、浮いていられるのは短い間だけ。灰色の足場で休めば、また浮ける。', 'serious');
    await X('siesta', 'それと、あの機械兵。目の光が照らしてる場所には、絶対に入らないこと。', 'serious');
    await X('siesta', '……それから、エクシードの弱点の手がかりも探そう。正面から戦って勝てる相手じゃない。', 'serious');
    G.checkpoint('sneak');
    await sneak();
  }

  async function clueLog() {
    if (has('z_log')) { await N('端末の画面には、研究ログが表示されたままだ。'); return; }
    SND.se('blip');
    await N('壁際の端末。画面に、研究ログが残っている。');
    await N('「統括個体エクシードは、世界樹ユグドラシルと根で接続されている。接続が保たれる限り、損傷は即座に修復される」');
    await G.gain('z_log', '手がかり');
    await X('siesta', '根で繋がってる限り、不死身……か。', 'think');
  }
  async function clueLight() {
    if (has('z_light')) { await N('壊れた機械兵。もう動かない。'); return; }
    await N('壁にもたれて倒れた、壊れかけの機械兵。赤い目が、弱々しく明滅している。');
    SND.se('glitch');
    await N('「警告……統括個体ハ……深層ニテ生成……強イ光ヘノ耐性ヲ……持タナイ……」');
    await G.gain('z_light', '手がかり');
    await X('siesta', '光に弱い。……覚えておこう。', 'serious');
  }
  async function clueGraft() {
    if (has('z_graft')) { await N('黒い羽根でとめられたメモ。'); return; }
    await N('壁に、メモが一枚。黒い羽根で留められている。');
    await N('「あの化け物の核は胸じゃない。背中の“接ぎ木”だ。――R」');
    await G.gain('z_graft', '手がかり');
    await M('黒い羽根……怪盗の……！', 'shock');
    await X('siesta', '……鴉城零。どうして私たちに、こんなものを。', 'serious');
  }
  async function bossDoor() {
    if (clueCount() < 3) { await X('siesta', '待って。まだ手がかりが足りない。エクシードと戦うなら、弱点を全部掴んでから。', 'serious'); return; }
    await ch3();
  }

  /* ------------------------------------------------------------------
     第三章 世界樹の深淵
     ------------------------------------------------------------------ */
  async function ch3() {
    STATE.chapter = 3; STATE.follow = false; STATE.focus = undefined;
    await G.fadeOut(700);
    await G.chapter('第三章', '世界樹の深淵', '');
    G.load('YG', 8, 9, 'up');
    G.cinema(true); G.clearActors();
    G.place('me', 8, 9, 'up'); G.place('siesta', 9, 9, 'up');
    G.place('exceed', 8, 4, 'down'); G.place('yogarasu', 11, 5, 'left');
    G.cam(8.5, 5.5); G.snap();
    G.scene('yggdrasil');
    G.bgm('tension');
    await G.fadeIn(1200);
    await N('最深部。');
    await N('そこには――天井から逆さまに、地の底へ向かって伸びる、巨大な樹があった。');
    await M('……木が、逆さに……。', 'shock');
    await X('siesta', '《ユグドラシル》。世界樹の名前を騙る、シードの母体。', 'serious');
    G.scene(null);
    await G.wait(500);
    await X('yogarasu_face', 'やあ。久しぶりだね、代理探偵くん。……今は、名探偵の助手だったかな。', 'smile');
    await M('鴉城、零……！', 'angry');
    await X('yogarasu_face', 'あのメモ、役に立っただろう？', 'smile');
    await X('siesta', '……どういうつもり？ ユグドラシルの側にいるくせに。', 'serious');
    await X('yogarasu_face', 'さあね。それより――ほら、主役のお出ましだ。', 'smile');
    SND.se('glitch'); G.shake(6, 800, true);
    await N('根の奥から、機械と樹がねじれ合ったような人影が、ゆっくりと立ち上がった。');
    await X('exceed', '……侵入者。《名探偵》。ここまで辿り着くとは。', 'serious');
    await X('exceed', '我はエクシード。世界樹の意志を束ねる者。……ここで、根の養分となれ。', 'angry');
    await X('siesta', '助手。……集めた手がかり、全部使うよ。', 'serious');
    await M('うん……！', 'serious');
    G.checkpoint('fight');
    await fight();
  }
  async function fight() {
    G.cinema(true);
    if (W.mapId !== 'YG') { G.load('YG', 8, 9, 'up'); }
    STATE.chapter = 3;
    G.clearActors(); G.place('me', 8, 9, 'up'); G.place('siesta', 9, 9, 'up'); G.place('exceed', 8, 4, 'down'); G.place('yogarasu', 11, 5, 'left');
    G.cam(8.5, 5.5); G.snap();
    STATE.party.me.hp = STATE.party.me.max; STATE.party.siesta.hp = STATE.party.siesta.max; STATE.items.potion = 2;
    await G.fadeIn(300);
    await G.battle({
      kind: 'abyss', name: 'エクシード', svg: EXCEED_SVG, hp: 360,
      atk: [12, 17], crush: [20, 26], pattern: ['lash', 'sap', 'lash', 'charge', 'crush'], bgm: 's_battle',
      intro: 'ユグドラシルの統括者、エクシードが立ちはだかった！',
      winText: 'エクシードの動きが止まった――封印の時だ！',
      loseText: '根が、名探偵と助手を呑み込んだ。\n世界樹の深淵に、二人の声は二度と届かなかった。',
      phases: [
        { prompt: '再生の源を断つ手がかりは？', correct: ['z_log'], intent: '傷が瞬く間に塞がっていく……再生の源を断たなければ！', cut: '根を断て！',
          after: async () => {
            await G.say('me', 'シエスタ！ あいつは世界樹と根で繋がってる！ 繋がってる限り、傷が治るんだ！', 'serious');
            await G.say('siesta', '了解。――ジョン、出番だよ。', 'smile');
            SND.se('crit'); shake(6, 500, true);
            await G.say('siesta', '（宙に浮かび上がり、マスケット銃で根を撃ち抜く）', 'serious');
          } },
        { prompt: '硬い外殻を崩す弱点は？', correct: ['z_light'], alt: {}, intent: '根は断った！ だが、外殻が硬すぎて攻撃が通らない……！', cut: '光を！',
          after: async () => {
            await G.say('me', '光だ！ あいつは深層で生まれたから、強い光に耐えられない！', 'serious');
            await G.say('siesta', 'なら――前髪を直す以外の使い道、見せてあげる。', 'smile');
            SND.se('clue'); flash('#ffffff', 600);
            await G.say('siesta', '（手鏡が照明の光を集め、エクシードの目を焼く）', 'serious');
          } },
        { prompt: 'エクシードの核は、どこにある？', correct: ['z_graft'], intent: '動きが鈍った！ 今なら核を狙える……！', cut: '核はそこだ！',
          after: async () => {
            await G.say('me', '核は胸じゃない！ 背中の“接ぎ木”だ！', 'serious');
            await G.say('siesta', '背中、ね。――上から行くよ！', 'serious');
            SND.se('crit'); shake(8, 700, true); flash('#8aff9a', 500);
            await G.say('siesta', '（靴で宙を蹴って背後へ回り、接ぎ木を撃ち抜く）', 'serious');
          } },
      ],
    });
    await aftermath();
  }

  /* ------------------------------------------------------------------
     第四章 崩壊
     ------------------------------------------------------------------ */
  async function aftermath() {
    f().sealed = true;
    G.bgm(null);
    G.cinema(true);
    G.clearActors(); G.place('me', 8, 8, 'up'); G.place('siesta', 9, 8, 'up'); G.place('exceed', 8, 4, 'down'); G.place('yogarasu', 11, 5, 'left');
    G.cam(8.5, 5.5); G.snap();
    await N('シエスタが、エクシードの胸に手をかざした。');
    SND.se('clue'); G.flash('#ffffff', 800);
    await N('白い光が、統括者の体を縫い留めていく。根が、ひとつ、またひとつと、動きを止めた。');
    await X('siesta', '……封印、完了。', 'serious');
    G.remove('exceed');
    await N('エクシードは、世界樹の幹の中へ、沈むように消えていった。');
    G.bgm('truth');
    await X('yogarasu_face', 'お見事。……さすがは、九条玲司の後継者だ。', 'smile');
    await M('鴉城零。……あなたは、何がしたいの。九条さんを殺させて、ユグドラシルに手を貸して。', 'angry');
    await X('yogarasu_face', '……。', 'closed');
    await X('yogarasu_face', '俺はユグドラシルを守りたかったんじゃない。', 'serious');
    await X('yogarasu_face', 'あの木の中に眠る、ある一人を救うために奴らの力を借りていたんだ。', 'serious');
    await X('yogarasu_face', 'だから俺が奪っていたのは金でも宝でもない――あいつらが隠している“未来”そのものさ。', 'smile');
    await M('ある、一人……？', 'shock');
    await X('siesta', '……木の中に、眠る……？', 'think');
    await N('――その時。');
    G.place('mechx', 9, 9, 'up');
    SND.se('crit'); G.shake(8, 600, true); G.flash('#c8102e', 400);
    await N('シエスタの背後。倒れていたはずの機械兵の刃が――');
    await N('シエスタの体を、貫いていた。');
    await M('――シエスタ！！', 'shock', { tremble: true });
    await X('siesta', '……っ、……あ、は……油断、した……ね……。', 'sad', { tremble: true });
    G.remove('mechx');
    SND.se('crash'); SND.se('thunder'); G.shake(9, 1400, true);
    await N('同時に、世界樹が軋んだ。天井から、岩と根が崩れ落ちてくる。');
    await X('yogarasu_face', '……主を失って、樹が暴れ出したか。', 'serious');
    await X('yogarasu_face', '俺は行くよ。――“あいつ”は、まだこの奥にいる。', 'serious');
    G.remove('yogarasu');
    await N('鴉城零は、崩れゆく世界樹の、さらに深淵へと身を投げた。');
    await M('シエスタ、しっかりして！ 今、外に連れて行くから！', 'shock', { tremble: true });
    await N('私はシエスタを背負って、走り出した。');
    await G.fadeOut(800);
    await escape();
  }

  async function escape() {
    STATE.chapter = 4; STATE.follow = false;
    G.load('ESC', 1, 4, 'right');
    G.clearActors();
    G.cam(null); G.cinema(false);
    G.bgm('s_battle');
    G.checkpoint('escape');
    await G.fadeIn(600);
    await X('siesta', '……じょしゅ……おもく、ない……？', 'sad');
    await M('全然！ だから喋らないで！', 'angry');
    G.toast('<b>崩落する通路</b>：シエスタを背負って、<b>東の出口</b>まで走れ！', 5000);
  }
  async function rubble(k, x) {
    if (f()[k]) return;
    f()[k] = true;
    SND.se('crash'); G.shake(7, 700, true);
    await N('天井が崩れ落ち、道を塞いだ――！');
    if (k === 'r3') await X('siesta', '……右……じゃなくて、左……かも……。', 'sad');
  }
  async function exitOut() {
    await G.fadeOut(1000);
    await ending();
  }

  /* ------------------------------------------------------------------
     終章
     ------------------------------------------------------------------ */
  async function ending() {
    STATE.chapter = 5; f().heartTold = true;
    G.bgm(null);
    G.cinema(true); G.clearActors();
    G.scene('snowfield');
    await G.chapter('終章', '白い朝', '');
    G.bgm('t_sad');
    await G.fadeIn(1500);
    await N('外は、一面の雪だった。');
    await N('崩れ落ちたアジトを背に、私はシエスタを雪の上に横たえた。');
    await M('シエスタ……ねえ、シエスタ……！ 今、助けを――', 'sad', { tremble: true });
    await X('siesta', '……いいよ、助手。……自分のことは、自分が一番、分かるから。', 'closed');
    await X('siesta', '……五つ目の道具、教えてあげる。', 'smile');
    await X('siesta', '私の、心臓。', 'smile');
    await M('……え……？', 'shock');
    await X('siesta', '私の心臓はね、私が死んでも、死なないの。……眠りにつくだけ。', 'smile');
    await X('siesta', '六十年もすれば……また、目を覚ますんだって。', 'smile');
    await M('六十年って……そんなの……！', 'sad', { tremble: true });
    await X('siesta', 'でも君はこんなに待てないよね。私のこと好きすぎるから。', 'smile');
    await M('……っ、こんな時に、なに言って……！', 'sad', { tremble: true });
    await X('siesta', 'ふふ。……顔、真っ赤。', 'smile');
    await X('siesta', '……巫女を頼って。', 'serious');
    await X('siesta', 'あの子なら、きっと……君に、道を……。', 'closed');
    await N('白い指が、私の頬に触れて――');
    await N('ゆっくりと、雪の上に落ちた。');
    SND.se('heart');
    await G.wait(900);
    await M('……シエスタ……？', 'shock');
    await M('…………っ、あああああああ――！！', 'sad', { tremble: true });
    await G.fadeOut(2600);
    G.scene(null);
    G.bgm(null);
    await G.mono(['《名探偵》シエスタは、死んだ。', 'そして私も、雪の中で、意識を手放した。']);
    // 病院
    G.scene('hospital');
    await G.wait(800);
    await G.fadeIn(2000);
    G.bgm('t_sad');
    await N('――白い天井。消毒液の匂い。');
    await N('目を覚ますと、私は病院のベッドの上にいた。');
    await M('……シエスタ……。', 'sad');
    await N('答える声は、なかった。');
    await N('窓の外では、ロンドンの空が、何事もなかったように晴れていた。');
    await G.fadeOut(2000);
    G.scene(null);
    G.bgm(null);
    await G.mono([
      '探偵がいなくなるのは、これで二度目だった。',
      'それでも、あの人は言った。\n「巫女を頼って」と。',
      '探偵助手 {N} の手記より　FILE.06',
    ]);
    await G.mono(['FILE.07 へ続く']);
    W.mode = 'blank';
    G.cinema(false);
    await showResult();
  }

  /* ------------------------------------------------------------------
     ヒント
     ------------------------------------------------------------------ */
  async function hint() {
    const c = ch();
    if (c === 2) {
      const L = [];
      if (!has('z_log')) L.push('第一区画の端末');
      if (!has('z_light')) L.push('第二区画に倒れてる機械兵');
      if (!has('z_graft')) L.push('第三区画の壁');
      await S(L.length ? `手がかりは、${L.join('、')}にありそう。` : '手がかりは揃った。最深部の扉は、北東の奥。', 'serious');
      await S('赤い床の上は浮いて進む。浮遊ゲージが尽きる前に、灰色の足場へ。機械兵の黄色い視線には入らないで。', 'serious');
      return;
    }
    if (c === 4) { await N('シエスタは、浅い息を繰り返している。……急がないと。'); return; }
    await S('大丈夫。私がいる。', 'smile');
  }

  /* ------------------------------------------------------------------
     イベント
     ------------------------------------------------------------------ */
  const EVENTS = {
    AB: [
      { at: [[25, 14]], check: clueLog, clue: () => ch() === 2 && !has('z_log') },
      { at: [[16, 10]], sprite: 'brokenmech', check: clueLight, clue: () => ch() === 2 && !has('z_light') },
      { at: [[18, 2]], sprite: 'note', check: clueGraft, clue: () => ch() === 2 && !has('z_graft') },
      { at: [[30, 1], [31, 1]], solid: () => clueCount() < 3, bump: bossDoor, step: bossDoor, check: bossDoor, clue: () => ch() === 2 && clueCount() >= 3 },
    ],
    ESC: [
      { at: [[6, 2], [6, 3], [6, 4], [6, 5], [6, 6]], step: () => rubble('r1') },
      { at: [[9, 4], [9, 3]], sprite: 'rubble', when: () => f().r1 },
      { at: [[13, 2], [13, 3], [13, 4], [13, 5], [13, 6]], step: () => rubble('r2') },
      { at: [[16, 4], [16, 5], [16, 6]], sprite: 'rubble', when: () => f().r2 },
      { at: [[19, 2], [19, 3], [19, 4], [19, 5], [19, 6]], step: () => rubble('r3') },
      { at: [[22, 4], [22, 3], [22, 2]], sprite: 'rubble', when: () => f().r3 },
      { at: [[28, 2], [28, 3], [28, 4], [28, 5], [28, 6]], step: exitOut },
    ],
  };
  // 個別の瓦礫スプライト（1イベント1マスで描画される）
  EVENTS.ESC = EVENTS.ESC.flatMap(e => e.sprite && e.at.length > 1 ? e.at.map(p => Object.assign({}, e, { at: [p] })) : [e]);

  const TALK = { siesta: async () => hint() };
  for (const s of SENTRIES) TALK[s.id] = async () => caughtNow('sight');

  function onResume() {
    W.storm = false; W.caught = false;
    SND.rain(0); SND.hum(0);
    SND.bgm(STATE.chapter === 2 ? 'a_sneak' : STATE.chapter === 4 ? 's_battle' : 's_explore');
  }

  return {
    npcs, objective, FLAVOR, flavor, EVENTS, talk: id => (TALK[id] ? TALK[id]() : Promise.resolve()),
    prologue, hint, onResume, hintFromMenu: true, initState,
    sneak, fight, escape,
    tick, overlay, onStep,
    hintMenu: () => 'シエスタに聞く（ヒント）',
    hideTrust: () => true,
    get focusLabel() { return STATE && STATE.chapter === 2 ? '浮遊' : '集中'; },
    nbName: '手帳',
    start: { map: 'WS', x: 8, y: 5, dir: 'up' },
    people: () => {
      const L = ['siesta', 'schwarz'];
      if (STATE.chapter >= 2) L.push('mech');
      if (STATE.chapter >= 3) L.push('exceed', 'yogarasu');
      return L;
    },
    evidenceIds: () => Z_EVIDENCE_ORDER,
    result() {
      const clues = clueCount(), hp = Math.round((STATE.party.me.hp + STATE.party.siesta.hp) / (STATE.party.me.max + STATE.party.siesta.max) * 100);
      const score = Math.round(clues / 3 * 50 + hp * 0.5);
      const [rank, title] = score >= 85 ? ['S', '名探偵の、最後の助手'] : score >= 70 ? ['A', '深淵を越えた助手'] : score >= 50 ? ['B', '名探偵の助手'] : ['C', '雪の中の助手'];
      return {
        label: '名探偵の助手としての記録', rank, title,
        stats: `集めた手がかり　${clues} / 3<br>封印後の残りHP　${hp}%<br>集めた道具・記録　${STATE.evidence.length} / ${Z_EVIDENCE_ORDER.length}`,
        credits: `<h2>世界樹の深淵</h2><p style="color:#8aff9a">― 探偵助手の手記 FILE.06 ―</p>
          <h4>《名探偵》</h4><p>シエスタ</p><h4>探偵助手</h4><p>${esc(STATE.name)}</p>
          <h4>《技工士》</h4><p>シュバルツ</p>
          <h4>《怪盗》</h4><p>鴉城 零</p>
          <h4>ユグドラシル</h4><p>エクシード</p>
          <h4>in memory of</h4><p>シエスタ</p><p>九条 玲司</p>
          <h4>シナリオ・プログラム・グラフィック・音楽</h4><p>すべてブラウザ上で生成</p>
          <h4>Special Thanks</h4><p>最後まで遊んでくれたあなた</p><div class="end">FILE.07 へ続く</div>`,
        bgm: 't_sad',
      };
    },
  };
})();
