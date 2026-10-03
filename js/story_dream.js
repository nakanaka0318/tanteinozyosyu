'use strict';
/* =========================================================
   STORY_DREAM : 純白の少女 ― シナリオ
   ========================================================= */
const STORY_DREAM = (() => {
  const f = () => STATE.flags;
  const ch = () => STATE.chapter;
  const has = id => STATE.evidence.includes(id);
  const M = (t, e, o) => G.say('me', t, e, o);
  const N = (t, o) => G.narr(t, o);
  const X = (w, t, e, o) => G.say(w, t, e, o);
  const D = (t, e, o) => G.say('dorothy', '（ドロシーの声）' + t, e, o);
  const touch = () => document.body.classList.contains('touch');

  const MEM = { 1: ['d_number', 'd_window', 'd_chart'], 2: ['d_oath', 'd_title', 'd_tuning'], 3: ['d_file', 'd_rain', 'd_contract'] };
  const memCount = c => (MEM[c] || []).filter(has).length;

  // 夢の見た目
  function look(mode) {
    stage.classList.toggle('dreamy', mode === 'dream' || mode === 'memory' || mode === 'nightmare');
    stage.classList.toggle('memory', mode === 'memory');
    stage.classList.toggle('nightmare', mode === 'nightmare');
  }
  const lookFor = () => {
    const c = ch();
    if (c === 1 || c === 5) return f().nm ? 'nightmare' : 'dream';
    if (c === 2 || c === 3) return f().nm ? 'nightmare' : 'memory';
    if (c === 4) return 'nightmare';
    return 'real';
  };

  /* ------------------------------------------------------------------ */
  function initState(S0) {
    S0.map = 'HP'; S0.x = 6; S0.y = 6; S0.dir = 'up';
    S0.follower = 'dorothy'; S0.follow = false; S0.time = '';
    S0.party = { me: { hp: 100, max: 100 } };
    S0.items = { drop: 3 };
    S0.evidence = ['z_key', 'z_musket', 'z_shoes', 'z_mirror', 'z_fifth', 'z_letter'];
    Object.assign(S0.flags, { named: true, revealed: true, heartTold: true, letterRead: true, dorothyKnown: true, dorothyRevealed: true });
  }

  function npcs(id) {
    const L = [], c = STATE.chapter;
    const add = (i, x, y, d) => L.push({ id: i, x, y, dir: d });
    if (id === 'HP' && c === 0) { add('dorothy', 8, 5, 'left'); add('schwarz', 3, 3, 'down'); add('multigate', 10, 3, 'down'); add('kase', 11, 5, 'left'); }
    if (id === 'D1' && c === 1 && !f().nm) add('siesta_child', 8, 3, 'down');
    if (id === 'CT' && c === 2 && !f().nm) { add('kase_y', 8, 12, 'down'); add('multigate', 13, 3, 'down'); add('siesta_teen', 13, 5, 'up'); add('schwarz', 4, 6, 'down'); }
    if (id === 'HT' && c === 3 && !f().nm) add('siesta', 14, 6, 'down');
    if (id === 'D7' && c === 5) add('siesta', 11, 4, 'down');
    return L;
  }

  function objective() {
    const c = ch();
    if (c === 0) return 'ドロシーに声をかけ、シエスタの夢へ';
    if (c >= 1 && c <= 3) {
      const n = memCount(c);
      if (n < 3) return `記憶のかけらを集める（${n} / 3）`;
      if (c === 1) return '白い少女のもとへ戻る（寝室）';
      return '';
    }
    if (c === 5) return 'シエスタのもとへ';
    return '';
  }

  const FLAVOR = {
    b: ['ベッド。'], Q: ['白い台。'], M: ['計器。規則正しく、何かの鼓動を記録している。'], Z: ['窓。'], E: ['白い扉。'],
    F: ['白い花が、風に揺れている。'], T: ['白い花をつけた大きな木。'], W: ['どこまでも青い空。'],
    X: ['戸棚。'], L: ['ランプ。'], P: ['観葉植物。'], S: ['ソファ。'], t: ['小さなテーブル。'], h: ['椅子。'], B: ['本棚。'], w: ['クローゼット。'], d: ['机。'],
    K: ['柱時計。'], G: ['天球儀。'], A: ['甲冑。'], V: ['空の台座。'],
    a: ['座席。'], p: ['テーブル。'], C: ['ギャレー。'], R: ['カーテン。'],
  };
  async function flavor(c, x, y) {
    const m = W.mapId;
    if (m === 'D1') {
      if (c === 'b') { await N('真っ白なベッド。シーツには、皺ひとつない。……誰も、ここで眠っていない。'); return; }
      if (c === 'Z') { await N('窓。……よく見ると、ガラスの向こうの青空は、壁に描かれた絵だった。'); return; }
      if (c === 'E') { await N('白い扉。取っ手がない。……外へは、出られない。'); return; }
    }
    if (m === 'HP' && c === 'Z') { await N('壁に、シュバルツさんの書いた機械の図面が貼られている。'); return; }
    if (m === 'HP' && c === 'W') { await N('窓の外は、ロンドンの夜。'); return; }
    const L = FLAVOR[c]; if (!L) return;
    for (const l of L) await N(l);
  }

  /* ------------------------------------------------------------------
     序章 夢を渡る者
     ------------------------------------------------------------------ */
  async function prologue() {
    STATE.chapter = 0;
    G.storm(false); G.rain(0); G.hum(0); G.bgm(null); look('real');
    await G.mono([
      'ヴュルツブルクの駅で、あの子に会ってから一週間。',
      'その夜、私は夢を見た。',
    ]);
    G.scene('dream');
    G.bgm('r_dream');
    await G.wait(800);
    await N('薄紫の空。足元には、雲のような、柔らかい地面。');
    await X('dorothy', 'こんばんは、{N}。約束どおり、来たよ。', 'smile');
    await M('ドロシー……！ ここは、私の夢……？', 'shock');
    await X('dorothy', 'うん。わたしの力は、ひとの夢に入ること。それから――', 'smile');
    await X('dorothy', '手をつないだひとを、もうひとり、連れていくこと。', 'serious');
    await M('じゃあ……！', 'shock');
    await X('dorothy', 'あなたを、あの子の夢に連れていける。', 'smile');
    await X('dorothy', '覚悟は、できた？', 'serious');
    await M('……とっくに。', 'serious');
    await X('dorothy', 'ふふ。じゃあ、起きたら会いにいくね。……あの子が眠ってる場所で。', 'smile');
    G.scene(null);
    await G.fadeOut(1200);
    G.load('HP', 6, 6, 'up');
    G.cinema(true); G.clearActors();
    G.place('dorothy', 8, 5, 'left'); G.place('schwarz', 3, 3, 'down'); G.place('multigate', 10, 3, 'down'); G.place('kase', 11, 5, 'left');
    G.cam(6.5, 4); G.snap();
    G.bgm('w_explore');
    await G.fadeIn(1200);
    await N('ロンドン、セント・ベアトリス病院。地下の特別病棟。');
    await N('白いスリープカプセルの中で、シエスタは眠っていた。二ヶ月前と、何ひとつ変わらない顔で。');
    await X('schwarz', '……カプセルは、体の時間を限りなく遅くする。俺に作れるのは、ここまでだ。', 'closed');
    await X('multigate', 'ドロシー。……本当に、できるのね。', 'serious');
    await X('dorothy', 'うん。ただし、決まりごとがあるの。よく聞いてね、{N}。', 'serious');
    await X('dorothy', 'ひとつ。夢は、眠っているひとの記憶でできてる。あの子の夢なら、あの子の思い出の中を歩くことになる。', 'serious');
    await X('dorothy', 'ふたつ。夢の中で、あなたの心が折れたら――もう戻れない。', 'serious');
    await X('dorothy', 'みっつ。連れて帰れるのは、あの子自身が「起きたい」って思った時だけ。', 'serious');
    await X('dorothy', 'よっつ。夢の中では、あなたが信じているものが、そのまま力になる。', 'smile');
    await G.gain('d_rule', '夢の掟を記録');
    await X('kase', '……それと、もう一つ。シエスタの夢の底には、ユグドラシルが巣食ってる。', 'serious');
    await X('kase', 'あいつの心臓には、奴らの“種”が入ってるからな。……悪夢と、戦うことになるぞ。', 'serious');
    await M('加瀬さん……知ってたんですか、心臓のこと。', 'shock');
    await X('kase', '十年前に、あいつを拾ったのは私だ。', 'closed');
    await X('schwarz', '……お前の手元にある道具は、夢の中でも使える。銃も、手鏡も、靴も。', 'serious');
    await X('dorothy', '準備ができたら、声をかけて。', 'smile');
    G.cam(null); G.cinema(false);
    G.clearActors(); G.restore();
    G.toast(touch()
      ? '<b>移動</b>：十字ボタン　<b>調べる・話す</b>：Aボタン　<b>手帳</b>：Bボタン<br>迷ったら手帳の<b>ヒント</b>を見よう。'
      : '<b>移動</b>：矢印キー / WASD　<b>調べる・話す</b>：Z / Enter　<b>手帳</b>：X / Esc<br>迷ったら手帳の<b>ヒント</b>を見よう。', 7000);
  }

  async function talkDorothy() {
    if (ch() !== 0) return;
    await X('dorothy', '行く？', 'smile');
    const r = await G.choose(['シエスタの夢へ行く', 'もう少しだけ待って']);
    if (r !== 0) { await X('dorothy', 'うん。……あの子は、どこにも行かないよ。', 'smile'); return; }
    G.cinema(true);
    await N('カプセルの隣の簡易ベッドに、横になる。');
    await X('dorothy', '目を閉じて。わたしの手を、離さないでね。', 'smile');
    await X('multigate', '{N}さん。……いってらっしゃい。', 'smile');
    await X('kase', '連れて帰ってこい。……あのバカを。', 'serious');
    await M('はい。', 'serious');
    await G.fadeOut(1600);
    G.scene('capsule');
    await G.fadeIn(900);
    SND.se('dive');
    await N('意識が、白い光の中へ、ゆっくりと沈んでいく――。');
    await D('……いくよ。');
    await G.fadeOut(1200);
    G.scene(null);
    G.cinema(false);
    await ch1();
  }
  async function talkPeople(id) {
    const L = {
      schwarz: ['……シエスタの靴は、夢の中でも浮く。あいつがそう信じていたからな。', '五つ目は、俺が作ったものじゃない。……直しただけだ。'],
      multigate: ['私の未来視には、まだ「その先」が見えません。……だから、あなたが作って。', 'あの子の夢には、きっと、あの子の一番古い記憶から入ることになるわ。'],
      kase: ['……行くなら、さっさと行け。顔が怖いぞ。', '私が拾った時、あいつには名前がなかった。……それだけ覚えておけ。'],
    }[id];
    const k = 'pp_' + id, i = f()[k] || 0; f()[k] = i + 1;
    await X(id, L[i % L.length], 'serious');
  }
  async function examCapsule() {
    await N('ガラス越しのシエスタは、少しだけ笑っているように見えた。');
    if (!f().capsuleSeen) { f().capsuleSeen = true; await M('（……迎えに行くよ、シエスタ）', 'serious'); }
  }

  /* ------------------------------------------------------------------
     第一章 白の園
     ------------------------------------------------------------------ */
  async function ch1() {
    STATE.chapter = 1; f().nm = false;
    await G.chapter('第一章', '白の園', '― シエスタの夢・いちばん古い記憶 ―');
    G.load('D1', 12, 8, 'up');
    look('dream');
    G.cinema(true); G.clearActors(); G.restore();
    G.cam(12, 6); G.snap();
    G.bgm('w_explore');
    await G.fadeIn(1200);
    await N('目を開けると、そこは真っ白な廊下だった。');
    await N('壁も、床も、天井も白い。音がない。匂いもない。');
    await M('（ここが……シエスタの夢？）', 'think');
    await D('ここは、あの子のいちばん古い記憶。……気をつけて。ここ、とても冷たい。');
    await N('どこかから、小さな歌声が聞こえた。');
    G.cam(null); G.cinema(false);
    G.checkpoint('resume1');
    G.toast('<b>記憶のかけら</b>（白く光る結晶）を調べると、思い出が手帳に記録されます。', 5000);
  }
  async function resume1() { look('dream'); G.cinema(false); G.clearActors(); G.restore(); G.bgm('w_explore'); await G.fadeIn(500); }

  async function talkChild() {
    const n = memCount(1);
    if (!f().childMet) {
      f().childMet = true;
      G.cinema(true);
      await N('寝室の隅で、小さな女の子がひとり、膝を抱えて座っていた。');
      await N('白い髪。白い服。……青い瞳。');
      await M('（シエスタ……？ ううん、こんなに小さい……）', 'shock');
      await X('siesta_child', '……だれ？ 白い服じゃないひと、はじめて見た。', 'think');
      await M('私は、{N}。あなたの……友だち、かな。', 'smile');
      await X('siesta_child', 'ともだち。……しらない言葉。', 'think');
      await M('名前を、教えてくれる？', 'smile');
      await X('siesta_child', 'なまえ？ ……わたしは、No.9。', 'closed');
      await M('（番号……）', 'sad');
      await X('siesta_child', 'もうすぐ、白い大人の人たちが来る時間。……あなた、見つかったら、怒られるよ。', 'sad');
      G.cinema(false);
      return;
    }
    if (n < 3) {
      const L = ['ここにはね、前はほかの子もいたの。……みんな、いなくなっちゃった。', '窓の向こう、見た？ お日さま。……本物は、見たことないけど。', '胸がね、ときどき、とくとくって、すごく速くなるの。'];
      await X('siesta_child', L[n % L.length], 'think');
      return;
    }
    // 悪夢へ
    G.checkpoint('nm1');
    await nightmare1();
  }

  async function kakera(id, scene) {
    if (has(id)) { await N('光の消えた、記憶のかけら。'); return; }
    SND.se('clue');
    G.flash('#ffffff', 300);
    await scene();
    await G.gain(id, '記憶のかけら');
    await afterKakera();
  }
  async function afterKakera() {
    const c = ch();
    if (memCount(c) < 3) return;
    if (c === 1) { await D('ぜんぶ、見つけたね。……あの子のところへ、戻ってあげて。'); return; }
    if (c === 2) { G.checkpoint('nm2'); await nightmare2(); return; }
    if (c === 3) { G.checkpoint('nm3'); await nightmare3(); }
  }

  const mem1 = {
    number: () => kakera('d_number', async () => {
      await N('ベッドの名札に、触れた。――記憶が、流れ込んでくる。');
      await N('九つ並んだベッド。ひとつ、またひとつと、空になっていく。');
      await N('最後に残ったベッドの名札は、「No.9」。');
      await X('siesta_child', '（記憶）……No.7も、No.8も、帰ってこなかった。次は、わたしの番。', 'closed');
      await M('（ここで、何が……）', 'sad');
    }),
    window: () => kakera('d_window', async () => {
      await N('大きな窓。その向こうの青空と太陽に、手を伸ばす。……指先が、冷たい壁に触れた。');
      await N('窓の外の景色は、描かれた絵だった。');
      await X('siesta_child', '（記憶）ねえ、いつか、ここから出られたら――', 'smile');
      await X('siesta_child', '（記憶）本物のお日さまの下で、お昼寝したいな。ぽかぽかの、お昼寝。', 'smile');
      await M('（……お昼寝）', 'sad', { tremble: true });
    }),
    chart: () => kakera('d_chart', async () => {
      await N('処置室の台の上に、一冊の記録が開かれていた。');
      await N('「被験体No.9。心臓を《樹核》――世界樹の種子核に置換。適合。九例中、唯一の生存」');
      await N('「樹核は、宿主が死を迎えても停止しない」');
      await M('（シエスタの心臓は……ユグドラシルに、埋め込まれたものだったんだ）', 'shock');
      await D('……あの子とユグドラシルの因縁は、ここから始まったんだね。');
    }),
  };

  async function nightmare1() {
    f().nm = true;
    G.cinema(true);
    look('nightmare');
    G.bgm(null);
    SND.se('sting'); G.shake(4, 600, true);
    G.clearActors();
    G.place('siesta_child', 8, 3, 'down'); G.place('me', 8, 5, 'up');
    G.cam(7, 4); G.snap();
    await N('――照明が、赤く染まった。');
    await X('siesta_child', '……来た。', 'shock');
    G.place('shadow', 5, 5, 'right');
    await X('shadow', '時間だよ、No.9。処置の時間だ。', 'smile');
    await X('shadow', '……おや。お客様かな。夢の中に、異物が紛れ込んだか。', 'angry');
    await M('この子に、触らないで。', 'angry');
    await X('shadow', 'それは番号だ。名前などない。No.9は、我々の“器”だよ。', 'smile');
    await X('siesta_child', '……いや。いや……！', 'sad', { tremble: true });
    await M('（シエスタ……この子を、悪夢の中に置いていかない！）', 'serious');
    G.cinema(false);
    await fight1();
  }
  async function fight1() {
    if (W.mapId !== 'D1') G.load('D1', 8, 5, 'up');
    STATE.chapter = 1; f().nm = true; look('nightmare');
    STATE.party.me.hp = STATE.party.me.max; STATE.items.drop = Math.max(STATE.items.drop || 0, 3);
    await G.battle({
      kind: 'dream', name: '白衣の影', svg: SHADOW_SVG, hp: 150, gun: [14, 20],
      atk: [9, 13], big: [22, 28], pattern: ['atk', 'wave', 'charge', 'big', 'atk', 'charge', 'big'],
      acts: { atk: '注射針の一閃', wave: '白い霧（回避しにくい）', big: '⚠ 処置の時間（大技）' },
      intro: '悪夢・白衣の影が立ちはだかった！',
      shell: '白衣の影は、光の差さないこの部屋の闇に溶けている……攻撃が届かない！',
      loseText: '白い霧が、{N}の心を塗りつぶしていく。\n「番号を呼ばれたら、返事をしなさい」――少女の夢の底で、声だけが響き続けた。',
      phases: [
        { prompt: '白衣の影が恐れているものは？', correct: ['d_window'], intent: '影は闇に溶けていて、攻撃が届かない……！', cut: '光を！',
          hint: 'この施設には、一度も本物の光が差さなかった。……あの子が、ずっと欲しがってたもの。',
          alt: { d_chart: 'それは、あの子が“されたこと”。影が“怖がるもの”は？' },
          after: async () => {
            await M('この部屋には、本物の光が一度も差さなかった。……だから、あなたは光が怖い！', 'serious');
            await M('シエスタの手鏡――夢の中なら、描かれたお日さまだって、本物になる！', 'serious');
            SND.se('clue'); G.flash('#fff8e0', 600);
            await X('shadow', 'ぐ……ああっ、光が……！', 'shock');
          } },
        { prompt: '少女を縛る“鎖”を断ち切るには？', correct: ['d_number'], intent: '影が実体を得た！ 銃で弱らせて、少女を縛る鎖を断ち切れ！', cut: '番号なんかじゃない！',
          hint: 'あの子は、ずっと“何”で呼ばれてた？',
          alt: { d_window: 'それは、もう使った。今度は、あの子を縛ってるものを。' },
          after: async () => {
            await M('この子は、No.9なんかじゃない！', 'angry');
            await X('shadow', 'では何だ。名前のない器に、何と呼びかける？', 'angry');
            await N('窓の向こうの、描かれた太陽。ぽかぽかの、お昼寝。');
            await M('――シエスタ！', 'serious');
            f().childNamed = true;
            await X('siesta_child', '……シエスタ……？', 'shock');
          } },
      ],
    });
    await after1();
  }
  async function after1() {
    look('dream');
    G.bgm('w_love');
    G.cinema(true);
    G.clearActors();
    G.place('siesta_child', 8, 3, 'down'); G.place('me', 8, 4, 'up');
    G.cam(8, 3.5); G.snap();
    await N('白衣の影は、光の粒になって消えていった。照明が、元の白に戻る。');
    await X('siesta_child', 'シエスタ。……ねえ、それ、どういう意味？', 'think');
    await M('お昼寝、って意味。……お日さまの下で、ぽかぽかの、お昼寝。', 'smile');
    await X('siesta_child', 'お昼寝。……ふふ。', 'smile');
    await X('siesta_child', 'いい名前。……もらっても、いい？', 'smile');
    await M('うん。……あなたのだよ。ずっと前から。', 'sad', { tremble: true });
    await X('siesta_child', 'ありがとう、ともだち。', 'smile');
    await N('少女が笑った瞬間、白い部屋が、光の中に溶けていった。');
    await D('……{N}。今の、たぶん、あの子にとってすごく大事な記憶になったよ。');
    await D('次の記憶へ行こう。もっと深く。');
    await G.fadeOut(1400);
    G.cinema(false);
    await ch2();
  }

  /* ------------------------------------------------------------------
     第二章 名探偵の誓い
     ------------------------------------------------------------------ */
  async function ch2() {
    STATE.chapter = 2; f().nm = false;
    await G.chapter('第二章', '名探偵の誓い', '― 十年前・時計台 ―');
    G.load('CT', 9, 14, 'up');
    look('memory');
    G.cinema(true); G.clearActors(); G.restore();
    G.cam(9, 13); G.snap();
    G.bgm('w_explore');
    await G.fadeIn(1200);
    await N('鐘の音。……ロンドンの、時計台。');
    await N('けれど、少しだけ景色が古い。壁の時計の針は、十年前の日付を指していた。');
    await D('白の園から逃げ出して、二年後の記憶。あの子が、《調律者》になった日。');
    await D('ここにいる人たちには、あなたは見えないよ。……ただ、一人を除いて。');
    G.cam(null); G.cinema(false);
    G.checkpoint('resume2');
  }
  async function resume2() { look('memory'); G.cinema(false); G.clearActors(); G.restore(); G.bgm('w_explore'); await G.fadeIn(500); }

  const mem2 = {
    oath: () => kakera('d_oath', async () => {
      await N('かけらに触れると、入口ホールに、雨の音が満ちた。');
      await X('kase_y', '（記憶）白の園は、燃え落ちた。生き残ったのは、お前一人だ。', 'serious');
      await X('siesta_teen', '（記憶）……知ってる。', 'closed');
      await X('kase_y', '（記憶）お前の胸の中には、まだ奴らの“種”が入ってる。……どうする。逃げるか、隠れるか。', 'serious');
      await X('siesta_teen', '（記憶）どっちもしない。', 'serious');
      await X('siesta_teen', '（記憶）私の心臓には、あいつらの種が入ってる。だから、私が終わらせる。', 'serious');
      await X('siesta_teen', '（記憶）ユグドラシルの種を、この世界から一粒残らず消す。', 'serious');
      await M('（十三歳で……）', 'sad');
    }),
    title: () => kakera('d_title', async () => {
      await N('祭儀の間。若い巫女が、聖典を開いていた。');
      await X('multigate', '（記憶）あなたの役目が、視えました。', 'serious');
      await X('multigate', '（記憶）あなたは《名探偵》。隠された真実を暴く者。', 'serious');
      await X('siesta_teen', '（記憶）名探偵。……悪くない。', 'smile');
      await X('multigate', '（記憶）それから――いつか、ひとりの助手に出会う人。', 'smile');
      await X('siesta_teen', '（記憶）助手？ ……いらない。一人で十分。', 'closed');
      await N('その時。十三歳のシエスタが、ふっと、こちらを振り向いた。');
      await X('siesta_teen', '……？', 'think');
      await M('（目が、合った……？）', 'shock');
      await X('siesta_teen', '……ううん。気のせい、かな。', 'think');
      await X('siesta_teen', '……でも、もし本当に来るなら。紅茶を淹れるのが上手な人がいい。', 'smile');
      await M('（……ずっと淹れてたよ、あなたの紅茶）', 'sad', { tremble: true });
    }),
    tuning: () => kakera('d_tuning', async () => {
      await N('機械室。作業台の上に、少女の胸の図面が広げられていた。');
      await X('schwarz', '（記憶）樹核を止めることはできん。止めれば、お前も死ぬ。', 'serious');
      await X('schwarz', '（記憶）だが、眠らせることはできる。……持ち主が死を迎えても、心臓は眠るだけだ。', 'serious');
      await X('siesta_teen', '（記憶）眠るだけ。……じゃあ、それ、私の五つ目の道具ってことにしよう。', 'smile');
      await X('schwarz', '（記憶）……道具じゃない。お前の心臓だ。', 'closed');
      await M('（五つ目の道具……「これは、ひみつ」って、そういうことだったんだ）', 'sad');
    }),
  };

  async function nightmare2() {
    f().nm = true;
    G.cinema(true);
    look('nightmare');
    G.bgm(null);
    SND.se('sting'); G.shake(6, 900, true);
    await N('――鐘が、狂ったように鳴り始めた。');
    await N('時計台の床を突き破って、太い根が這い上がってくる。脈打つ根の中心に、赤い心臓のようなものが見えた。');
    await X('rootheart', '帰っておいで、No.9。', 'smile');
    await X('rootheart', 'お前の心臓は、我らのもの。お前の居場所は、世界樹の中だ。', 'smile');
    await D('あれは、あの子の心臓の中の《樹核》が見せる悪夢……！ あの子を、ユグドラシルに引き戻そうとしてる！');
    await M('させない……！', 'angry');
    G.cinema(false);
    await fight2();
  }
  async function fight2() {
    if (W.mapId !== 'CT') G.load('CT', 9, 14, 'up');
    STATE.chapter = 2; f().nm = true; look('nightmare');
    STATE.party.me.hp = STATE.party.me.max; STATE.items.drop = Math.max(STATE.items.drop || 0, 3);
    await G.battle({
      kind: 'dream', name: '樹核の悪夢', svg: ROOTHEART_SVG, hp: 180, gun: [14, 20],
      atk: [10, 14], big: [24, 30], pattern: ['atk', 'charge', 'big', 'wave', 'atk', 'charge', 'big'],
      acts: { atk: '根の鞭', wave: '鐘の轟き（回避しにくい）', big: '⚠ 世界樹への誘い（大技）' },
      intro: '悪夢・樹核の悪夢が立ちはだかった！',
      shell: '根の囁きが、心に絡みつく……攻撃が、根に呑み込まれる！',
      loseText: '根が、{N}を包みこんだ。\n「帰っておいで」――世界樹の声だけが、時計台の鐘の中で響き続けた。',
      phases: [
        { prompt: '根の囁きを断ち切るものは？', correct: ['d_oath'], intent: '根の囁きが、攻撃を呑み込んでいる……！', cut: '誓いを！',
          hint: '十三歳のあの子は、逃げも隠れもしなかった。……何て言ってた？',
          alt: { d_tuning: 'それは、心臓を“鎮める”方法。まずは、囁きに負けない“心”を。', d_title: 'いい線。でも、あの子が自分で決めた“言葉”があったはず。' },
          after: async () => {
            await M('シエスタは、帰らない。あの子は、自分で決めたんだ！', 'serious');
            await M('「ユグドラシルの種を、この世界から一粒残らず消す」――それが、名探偵の誓いだ！', 'angry');
            SND.se('crit'); G.flash('#ffffff', 400);
            await X('rootheart', 'ぐ……小娘の、戯言を……！', 'angry');
          } },
        { prompt: '暴れる樹核を、鎮める方法は？', correct: ['d_tuning'], intent: '囁きは断った！ 銃で根を削り、暴れる樹核を鎮めろ！', cut: '眠れ！',
          hint: 'あの子の心臓に、技工士さんが施した細工。',
          alt: { d_chart: 'それは、樹核が“埋め込まれた”記録。鎮める方法は？' },
          after: async () => {
            await M('シュバルツさんの調律――樹核は止められない。でも、眠らせることはできる！', 'serious');
            await M('眠れ。……あの子の心臓として、静かに！', 'angry');
            SND.se('crit'); G.shake(8, 700, true);
          } },
      ],
    });
    await after2();
  }
  async function after2() {
    look('memory');
    G.bgm('w_love');
    G.cinema(true);
    await N('根が、ゆっくりと床に沈んでいく。赤い心臓の光が、穏やかな鼓動に変わった。');
    await N('とくん。……とくん。');
    await M('（シエスタの、心臓の音……）', 'sad');
    await X('siesta_teen', '（記憶）……ねえ。そこに、誰かいるの？', 'think');
    await M('…………。', 'closed');
    await X('siesta_teen', '（記憶）……変なの。なんだか、懐かしい気がする。', 'smile');
    await D('……次の記憶は、あなたも知ってる時間に近いよ。');
    await G.fadeOut(1400);
    G.cinema(false);
    await ch3();
  }

  /* ------------------------------------------------------------------
     第三章 一万メートルの前夜
     ------------------------------------------------------------------ */
  async function ch3() {
    STATE.chapter = 3; f().nm = false;
    await G.chapter('第三章', '一万メートルの前夜', '― 一年前・ロンドン ―');
    G.load('HT', 7, 8, 'up');
    look('memory');
    G.cinema(true); G.clearActors(); G.restore();
    G.cam(8, 5); G.snap();
    G.bgm('w_explore');
    await G.fadeIn(1200);
    await N('ロンドンのホテルの一室。机に向かう、白い髪の後ろ姿。');
    await N('――シエスタだ。私の知っている、シエスタ。');
    await D('あの飛行機に乗る、少し前の記憶。……あの子、誰かのことを、ずっと考えてる。');
    G.cam(null); G.cinema(false);
    G.checkpoint('resume3');
  }
  async function resume3() { look('memory'); G.cinema(false); G.clearActors(); G.restore(); G.bgm('w_explore'); await G.fadeIn(500); }

  const mem3 = {
    file: () => kakera('d_file', async () => {
      await N('机の上に、見覚えのあるファイルが積まれていた。――九条探偵事務所の、事件記録。');
      await X('siesta', '（記憶）九条玲司。……すごい探偵だった。', 'serious');
      await X('siesta', '（記憶）でも、私が気になるのは、こっち。余白の書き込み。', 'think');
      await X('siesta', '（記憶）几帳面な字。現場の見取り図、証言の矛盾、紅茶の好み。……全部、探偵のために書いてある。', 'smile');
      await X('siesta', '（記憶）この人は、どんな事件でも、ちゃんと探偵の隣に立ってた。', 'smile');
      await M('（それ……私の、手帳の写し……）', 'shock');
    }),
    rain: () => kakera('d_rain', async () => {
      await N('窓辺に、一枚の写真が置かれていた。雨の中、閉じた事務所の前に立つ、私の姿。');
      await X('siesta', '（記憶）今朝も、来てた。傘もささないで、郵便受けを確かめて、帰っていった。', 'sad');
      await X('siesta', '（記憶）毎朝。……もう、依頼なんて来ないのに。', 'sad');
      await X('siesta', '（記憶）まだ、助手をやめられないんだね。', 'closed');
      await M('（見られてた……あの頃の、一番みっともない私を）', 'sad', { tremble: true });
    }),
    contract: () => kakera('d_contract', async () => {
      await N('床に、何十枚もの紙が散らばっていた。「探偵助手契約書」。');
      await N('署名欄には、私の名前――を真似した字が、少しずつ上手になりながら、何十回も。');
      await X('siesta', '（記憶）……よし。だいぶ似てきた。', 'smile');
      await X('siesta', '（記憶）黒服の彼には、ケースを渡してもらう手はずになってる。あとは、同じ便の隣の席を取るだけ。', 'serious');
      await N('シエスタは、最後の一枚に、小さく何かを書き足した。');
      await X('siesta', '（記憶）……巻き込んで、ごめんね。', 'sad');
      await X('siesta', '（記憶）私の戦いに、あの人を連れていっていいのかな。……あの人を、また独りにするかもしれないのに。', 'sad');
      await M('（シエスタ……）', 'sad');
    }),
  };

  async function nightmare3() {
    f().nm = true;
    G.cinema(true);
    look('nightmare');
    G.bgm(null);
    SND.se('chime');
    await N('――ポーン、と。どこかで、聞き覚えのある音が鳴った。');
    await G.fadeOut(900);
    STATE.chapter = 4;
    await G.chapter('第四章', '再戦', '― 高度一万メートルの悪夢 ―');
    G.load('PL', 29, 4, 'down');
    G.clearActors();
    G.place('me', 29, 4, 'down');
    G.cam(29, 5); G.snap();
    G.hum(0.45);
    await G.fadeIn(900);
    await X('ca', '（機内放送）お客様にお知らせいたします。', 'serious');
    await X('ca', '（機内放送）――この中に、探偵はおりませんか。', 'serious');
    await N('AS-201便。けれど、客席には誰もいない。窓の外は、赤黒い闇。');
    await N('通路の奥で、何かが蠢いた。');
    SND.se('glitch'); G.flash('#b46aff', 400); G.shake(6, 800, true);
    await X('highseed', 'ひさしいなァ……名探偵の、助手。', 'smile', { tremble: true });
    await M('あなたは……氷室さんが飲んだ、あの《種》……！', 'shock');
    await X('highseed', 'あれは、ただの欠片だ。我こそは母株――《ハイシード》。', 'smile');
    await X('highseed', 'この娘はなァ、ずっと悔やんでいる。お前を、自分の戦いに巻き込んだことを。', 'smile');
    await X('highseed', 'その後悔が、我の根を太らせる。この娘は、もう目覚めたくないのだ。……お前を、二度と傷つけぬためになァ！', 'angry');
    await M('…………っ。', 'closed');
    await D('{N}！ あれが、あの子を夢に縛りつけてる、最後の悪夢！');
    await M('……あの夜の、再戦ってわけだね。', 'serious');
    G.checkpoint('fight3');
    await fight3();
  }
  async function fight3() {
    if (W.mapId !== 'PL') { G.load('PL', 29, 4, 'down'); G.clearActors(); G.place('me', 29, 4, 'down'); }
    STATE.chapter = 4; f().nm = true; look('nightmare');
    G.cinema(true); G.hum(0.45);
    STATE.party.me.hp = STATE.party.me.max; STATE.items.drop = Math.max(STATE.items.drop || 0, 3);
    await G.battle({
      kind: 'dream', name: 'ハイシード', svg: HIGHSEED_SVG, hp: 240, gun: [15, 21],
      atk: [11, 15], big: [26, 32], pattern: ['atk', 'wave', 'charge', 'big', 'atk', 'atk', 'charge', 'big'],
      acts: { atk: '触手の薙ぎ払い', wave: '超音波（回避しにくい）', big: '⚠ 後悔の奔流（大技）' },
      intro: '最後の悪夢・ハイシードが襲いかかってきた！ ――あの夜の、再戦！',
      shell: 'ハイシードは、あらゆる音を聴き取っている……引き金を引く前に、かわされる！',
      finalIntent: '殻は砕けた！ ――引き金を引け、助手！',
      loseText: '触手が、{N}を締め上げた。\n「この娘は、もう目覚めたくないのだ」――母株の笑い声だけが、空っぽの機内に響き続けた。',
      phases: [
        { prompt: 'ハイシードの“耳”を封じるものは？', correct: ['z_musket'], intent: '異常な聴覚で、すべての攻撃を読まれている……！', cut: 'あの夜と同じだ！',
          hint: 'あの夜。高度一万メートルで、あなたは何で聴覚をマヒさせた？',
          alt: { z_mirror: '光じゃない。あれは“耳”の化け物。……あの夜、轟音を響かせたのは？', d_contract: 'それは、もっと後。まずは、耳を封じないと。' },
          after: async () => {
            await M('あの夜、私はシエスタの銃で、あなたの欠片を撃った。……狭い機内に、轟音を響かせて！', 'serious');
            SND.se('crit'); G.shake(8, 600, true); G.flash('#ffffff', 300);
            await N('天井に向けて、引き金を引く。銃声が、空っぽの機内に何重にも反響した。');
            await X('highseed', 'ぎ、あ、ああああ……耳が……！', 'shock', { tremble: true });
          } },
        { prompt: 'シエスタを縛る“後悔”を晴らすものは？', correct: ['d_contract'], intent: '聴覚はマヒした！ 銃で弱らせ、あの子の後悔を晴らせ！', cut: '私が選んだ！',
          hint: 'あの子が「巻き込んで、ごめんね」って書いたもの。……あなたの答えを、そこに。',
          alt: { d_rain: 'あの頃のあなたを、あの子は見てた。……でも、後悔を晴らすのは、“今の”あなたの答え。', d_file: 'いい線。でも、あの子が謝ってた“紙”があったはず。' },
          after: async () => {
            await M('シエスタは、私を巻き込んだって謝ってた。偽物のサインまで練習して。', 'serious');
            await M('――でも、もう偽物はいらない。', 'serious');
            await N('記憶のかけらの契約書に、ペンを走らせる。今度は、私自身の字で。');
            SND.se('page');
            await M('私が選んだんだ。あの人の助手でいることを！ 巻き込まれたんじゃない。自分で、ここまで来た！', 'angry');
            await G.say('siesta', '（どこか遠くから）……助手……？', 'shock');
            await X('highseed', 'や、やめろ……根が、枯れる……！', 'shock', { tremble: true });
          } },
      ],
    });
    await after3();
  }
  async function after3() {
    G.hum(0);
    look('dream');
    G.bgm(null);
    G.cinema(true);
    await N('最後の銃声の残響が消えると、ハイシードは、乾いた種の殻のように崩れ落ちた。');
    await N('赤黒い窓の外が、白く、白く、晴れていく。');
    await D('……{N}。道が、開いたよ。');
    await D('いちばん深いところ。あの子は、そこにいる。');
    await G.fadeOut(1600);
    G.cinema(false);
    await ch5();
  }

  /* ------------------------------------------------------------------
     第五章 純白の少女
     ------------------------------------------------------------------ */
  async function ch5() {
    STATE.chapter = 5; f().nm = false;
    await G.chapter('第五章', '純白の少女', '― 夢のいちばん深いところ ―');
    G.load('D7', 11, 7, 'up');
    look('dream');
    G.cinema(true); G.clearActors(); G.restore();
    G.cam(11, 5); G.snap();
    G.bgm('w_love');
    await G.fadeIn(1600);
    await N('本物の、お日さまの光。');
    await N('どこまでも続く、白い花の丘。そのまんなかに、白い花をつけた大きな木。');
    await N('木の根もとで、白い髪の女の子が、ぽかぽかの日なたで、眠っていた。');
    await M('……シエスタ。', 'sad', { tremble: true });
    G.cam(null); G.cinema(false);
    G.checkpoint('resume5');
  }
  async function resume5() { look('dream'); G.cinema(false); G.clearActors(); G.restore(); G.bgm('w_love'); await G.fadeIn(500); }

  async function reunion() {
    if (f().confessed) return;
    G.cinema(true);
    G.clearActors();
    G.place('siesta', 11, 4, 'down'); G.place('me', 11, 5, 'up');
    G.cam(11, 4); G.snap();
    G.scene('garden');
    await N('となりに、そっと座る。');
    await N('白い髪が、風に揺れて、私の肩に乗った。');
    await X('siesta', '……ん。', 'closed');
    await X('siesta', '……この枕、ちょっと硬い。', 'closed');
    await M('……っ、枕じゃ、ないです。', 'sad', { tremble: true });
    await X('siesta', '…………。', 'shock');
    await X('siesta', '……助手？', 'shock');
    await M('うん。', 'smile');
    await X('siesta', 'どうして……ここは、私の夢の中だよ？', 'shock');
    await M('迎えに来たんだよ。……あなたの手紙、読んだから。', 'smile');
    await X('siesta', '…………そっか。読んじゃったか。', 'closed');
    await X('siesta', '白の園も、時計台も、あの前の晩のことも。……見たんだね、全部。', 'sad');
    await M('うん。名前のなかった女の子にも、会ったよ。', 'smile');
    await X('siesta', '……そっか。あの名前、夢の中で誰かがくれた気がしてた。', 'smile');
    await X('siesta', '君、だったんだ。', 'smile');
    await N('シエスタは、空を見上げた。');
    await X('siesta', 'ねえ、助手。ここ、すごくいいところでしょ。お日さまがあって、お昼寝し放題。', 'smile');
    await X('siesta', '……起きたら、またユグドラシルと戦わなきゃいけない。君は、また傷つく。私のせいで。', 'sad');
    await X('siesta', 'だから、私はここにいようと思ってた。君は、私がいなくても、ちゃんと生きていける人だから。', 'closed');
    await M('……無理だよ。', 'sad', { tremble: true });
    await X('siesta', '…………。', 'shock');
    await M('毎朝、閉じた事務所の前に立ってた私を、見てたでしょ。', 'sad');
    await M('あなたがいなくなってからの二ヶ月、私は、ずっとあれだった。', 'sad', { tremble: true });
    await M('ちゃんと生きていける人なんかじゃない。……あなたの隣じゃないと、だめなんだ。', 'sad', { tremble: true });
    await X('siesta', '……助手。', 'sad');
    await X('siesta', '……ずるいなあ。そんなこと言われたら、起きたくなっちゃう。', 'smile');
    await N('シエスタは、少しだけ迷うように目を伏せて――それから、まっすぐに私を見た。');
    G.bgm('w_ending');
    await X('siesta', '……好きだよ、助手。', 'smile');
    await X('siesta', '飛行機で会う、ずっと前から。雨の中の君の写真を見た、あの朝から。', 'smile');
    await X('siesta', '君のことが、ずっと好きだった。', 'smile');
    const r = await G.choose(['私も、ずっと好きだった', '……知ってた。名探偵の助手だからね']);
    if (r === 0) {
      await M('私も。……ずっと、好きだった。', 'sad', { tremble: true });
      await M('紅茶の好みも、寝起きの悪さも、全部覚えてるくらい。', 'smile');
      await X('siesta', '……ふふ。知ってる。名探偵だからね。', 'smile');
    } else {
      await M('……知ってた。名探偵の助手だからね。', 'smile');
      await X('siesta', '……それ、私の台詞。', 'shock');
      await M('私も、ずっと好きだったよ。……知ってたでしょ？', 'smile');
      await X('siesta', '……うん。知ってた。', 'smile');
    }
    f().confessed = true;
    await N('白い花びらが、二人のまわりを舞った。');
    await X('siesta', 'ねえ、助手。起きたら、最初に紅茶を淹れてくれる？', 'smile');
    await M('ミルク多めで、砂糖は二つ。', 'smile');
    await X('siesta', '正解。', 'smile');
    await X('siesta', '……じゃあ、起きようか。一緒に。', 'smile');
    await N('シエスタが、私の手を取った。');
    await D('……おかえり、名探偵さん。帰り道は、こっちだよ。');
    SND.se('shield'); G.flash('#ffffff', 900);
    await G.fadeOut(2200);
    G.scene(null);
    G.cinema(false);
    await ending();
  }

  /* ------------------------------------------------------------------
     終章 おはよう
     ------------------------------------------------------------------ */
  async function ending() {
    STATE.chapter = 6; look('real');
    G.bgm(null);
    await G.chapter('終章', 'おはよう', '');
    G.cinema(true); G.clearActors();
    G.scene('awaken');
    await G.wait(600);
    await G.fadeIn(2200);
    G.bgm('w_ending');
    await N('――消毒液の匂い。窓から差しこむ、朝の光。');
    await N('目を開けると、ドロシーが、私の手を握ったまま微笑んでいた。');
    await X('dorothy', 'おはよう、{N}。……ほら、となり。', 'smile');
    SND.se('door');
    await N('しゅう、と小さな音を立てて、スリープカプセルのガラスが開いた。');
    await N('白い睫毛が、震える。');
    SND.se('heart');
    await G.wait(800);
    await X('siesta', '……おはよう、助手。', 'closed');
    await X('siesta', '朝だよ。……事件だよ。', 'smile');
    await M('……っ、事件なんか、ないよ……！', 'sad', { tremble: true });
    await N('気がついたら、私はカプセルに駆け寄って、シエスタを抱きしめていた。');
    await M('おかえり……おかえり、シエスタ……！', 'sad', { tremble: true });
    await X('siesta', 'ただいま。……苦しいよ、助手。', 'smile');
    await X('siesta', 'あと、おなかすいた。紅茶と、クッキー。', 'smile');
    await M('部屋のクッキーなら、賞味期限切れてたよ。', 'sad');
    await X('siesta', '知ってる。君、食べたでしょ。', 'smile');
    await M('なんで知ってるの!?', 'shock');
    await X('siesta', '名探偵だからね。', 'smile');
    await X('kase', '……まったく。人騒がせなやつだ。', 'smile');
    await X('multigate', 'おかえりなさい、シエスタ。……やっと、「その先」が視えたわ。', 'smile');
    await X('schwarz', '……心臓は、また動き出した。眠りは、もう要らんようだな。', 'closed');
    await X('siesta', 'みんな、ありがとう。……ドロシーも。', 'smile');
    await X('dorothy', 'ふふ。いい夢だったよ。……ふたりとも。', 'smile');
    await N('シエスタは、窓の外の朝日に目を細めて、それから、私の手を握った。');
    await X('siesta', 'さて。ユグドラシルの種は、まだこの世界に残ってる。', 'serious');
    await X('siesta', '名探偵の仕事は、まだ終わってない。……ついてきてくれる？ 助手。', 'smile');
    await M('当たり前でしょ。……契約書、今度はちゃんと自分でサインするから。', 'smile');
    await X('siesta', 'ふふ。――じゃあ、まずは紅茶から。', 'smile');
    G.scene(null);
    await G.fadeOut(2000);
    G.bgm(null);
    await G.mono([
      '名探偵は、目を覚ました。',
      '純白の少女が夢の中で待っていたのは、たぶん――\n自分の名前を呼んでくれる、誰かだった。',
      'そして私は、もう一度、名探偵の助手になった。\n今度は、自分の意思で。',
      '探偵助手 {N} の手記より　FILE.08',
    ]);
    W.mode = 'blank';
    G.cinema(false);
    await showResult();
  }

  /* ------------------------------------------------------------------
     ヒント
     ------------------------------------------------------------------ */
  async function hint() {
    const c = ch();
    if (c === 0) { await M('（準備ができたら、ドロシーに声をかけよう）', 'think'); return; }
    if (c >= 1 && c <= 3) {
      const where = {
        d_number: '寝室のいちばん奥のベッド', d_window: '観察室の窓の近く', d_chart: '処置室',
        d_oath: '入口ホールの加瀬さんのそば', d_title: '祭儀の間（二階の真ん中）', d_tuning: '機械室（二階の西）',
        d_file: 'シエスタの机', d_rain: '部屋の窓辺（北西）', d_contract: 'ソファのそば',
      };
      const L = MEM[c].filter(id => !has(id)).map(id => where[id]);
      if (L.length) await D(`記憶のかけらは……${L.join('、')}。白く光ってるはず。`);
      else if (c === 1) await D('ぜんぶ集まった。寝室の、あの子のところへ。');
      return;
    }
    if (c === 5) { await D('あの子は、木の下。……行ってあげて。'); return; }
    await D('大丈夫。あなたなら、できる。');
  }

  /* ------------------------------------------------------------------
     イベント
     ------------------------------------------------------------------ */
  const KK = (c, id) => () => ch() === c && !f().nm && !has(id);
  const EVENTS = {
    HP: [
      { at: [[6, 4]], sprite: 'capsule', solid: true, when: () => ch() === 0 || ch() === 6, check: examCapsule },
      { at: [[7, 4]], solid: true, when: () => ch() === 0 || ch() === 6, check: examCapsule },
    ],
    D1: [
      { at: [[7, 4]], sprite: 'kakera', when: KK(1, 'd_number'), check: mem1.number, clue: KK(1, 'd_number') },
      { at: [[14, 2]], sprite: 'kakera', solid: true, when: KK(1, 'd_window'), check: mem1.window, clue: KK(1, 'd_window') },
      { at: [[21, 2]], sprite: 'kakera', solid: true, when: KK(1, 'd_chart'), check: mem1.chart, clue: KK(1, 'd_chart') },
    ],
    CT: [
      { at: [[10, 13]], sprite: 'kakera', solid: true, when: KK(2, 'd_oath'), check: mem2.oath, clue: KK(2, 'd_oath') },
      { at: [[17, 3]], sprite: 'kakera', solid: true, when: KK(2, 'd_title'), check: mem2.title, clue: KK(2, 'd_title') },
      { at: [[6, 6]], sprite: 'kakera', solid: true, when: KK(2, 'd_tuning'), check: mem2.tuning, clue: KK(2, 'd_tuning') },
    ],
    HT: [
      { at: [[13, 7]], sprite: 'files', when: () => ch() === 3 && !f().nm, check: mem3.file, clue: KK(3, 'd_file') },
      { at: [[2, 3]], sprite: 'kakera', solid: true, when: KK(3, 'd_rain'), check: mem3.rain, clue: KK(3, 'd_rain') },
      { at: [[9, 6]], sprite: 'kakera', solid: true, when: KK(3, 'd_contract'), check: mem3.contract, clue: KK(3, 'd_contract') },
    ],
  };

  const TALK = {
    dorothy: talkDorothy,
    schwarz: () => talkPeople('schwarz'), multigate: () => (ch() === 0 ? talkPeople('multigate') : X('multigate', '（記憶）……あなたの未来が、少しだけ視えた気がする。', 'think')),
    kase: () => talkPeople('kase'),
    siesta_child: talkChild,
    kase_y: async () => { await X('kase_y', '（記憶）……妙だな。誰かに見られてる気がする。', 'think'); },
    siesta_teen: async () => { await X('siesta_teen', '（記憶）……名探偵、か。', 'think'); },
    siesta: async () => {
      if (ch() === 5) return reunion();
      if (ch() === 3) { await N('シエスタは、こちらに気づかない。……記憶の中の彼女は、ペンを走らせ続けている。'); }
    },
  };
  // 時計台の機械室のシュバルツ（記憶）
  const talkSchwarzMemory = async () => { await X('schwarz', '（記憶）……むやみに触るな。精密な作業だ。', 'closed'); };
  const talk = id => {
    if (id === 'schwarz' && ch() === 2) return talkSchwarzMemory();
    return TALK[id] ? TALK[id]() : Promise.resolve();
  };

  function onResume() {
    W.storm = false;
    SND.rain(0); SND.hum(0);
    look(lookFor());
    SND.bgm(STATE.chapter === 5 ? 'w_love' : 'w_explore');
  }

  return {
    npcs, objective, FLAVOR, flavor, EVENTS, talk,
    prologue, hint, onResume, hintFromMenu: true, initState,
    resume1, resume2, resume3, resume5,
    nm1: fight1, nm2: fight2, fight3,
    hintMenu: () => 'ドロシーの声を聞く（ヒント）',
    hideTrust: () => true,
    focusLabel: '心',
    nbName: '手帳',
    start: { map: 'HP', x: 6, y: 6, dir: 'up' },
    people: () => {
      const c = STATE.chapter;
      const L = ['siesta', 'dorothy', 'schwarz', 'multigate', 'kase'];
      if (c >= 1) L.push('siesta_child', 'shadow');
      if (c >= 2) L.push('siesta_teen', 'kase_y', 'rootheart');
      if (c >= 4) L.push('highseed');
      return L;
    },
    evidenceIds: () => D_EVIDENCE_ORDER,
    result() {
      const hp = STATE.party.me.hp, mem = [1, 2, 3].reduce((a, c) => a + memCount(c), 0);
      const score = Math.round(hp * 0.6 + mem / 9 * 40);
      const [rank, title] = score >= 85 ? ['S', '名探偵を起こした助手'] : score >= 65 ? ['A', '夢を渡った助手'] : score >= 45 ? ['B', '名探偵の助手'] : ['C', '寝ぼけた助手'];
      return {
        label: '名探偵の助手としての記録', rank, title,
        stats: `最後の戦いのあとの心　${hp} / 100<br>集めた記憶のかけら　${mem} / 9<br>手帳の記録　${STATE.evidence.length} / ${D_EVIDENCE_ORDER.length}`,
        credits: `<h2>純白の少女</h2><p style="color:#e8d8ff">― 探偵助手の手記 FILE.08 ―</p>
          <h4>《名探偵》</h4><p>シエスタ</p><h4>探偵助手</h4><p>${esc(STATE.name)}</p>
          <h4>《夢幻》の執行者</h4><p>ドロシー</p>
          <h4>《巫女》</h4><p>マルチルゲート</p><h4>《技工士》</h4><p>シュバルツ</p><h4>《執行者》</h4><p>加瀬 風靡</p>
          <h4>悪夢</h4><p>白衣の影</p><p>樹核の悪夢</p><p>ハイシード</p>
          <h4>in memory of</h4><p>九条 玲司</p>
          <h4>シナリオ・プログラム・グラフィック・音楽</h4><p>すべてブラウザ上で生成</p>
          <h4>Special Thanks</h4><p>最後まで遊んでくれたあなた</p><div class="end">おはよう、名探偵。</div>`,
        bgm: 'w_ending',
      };
    },
  };
})();
