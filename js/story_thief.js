'use strict';
/* =========================================================
   STORY_THIEF : 怪盗夜鴉と緋月の宝玉 ― シナリオ
   ========================================================= */
const STORY_THIEF = (() => {
  const f = () => STATE.flags;
  const ch = () => STATE.chapter;
  const has = id => STATE.evidence.includes(id);
  const K = (t, e, o) => G.say('kujo', t, e, o);
  const M = (t, e, o) => G.say('me', t, e, o);
  const N = (t, o) => G.narr(t, o);
  const X = (w, t, e, o) => G.say(w, t, e, o);
  const touch = () => document.body.classList.contains('touch');

  /* ---------------- 時間システム（第三章） ---------------- */
  const START = 19 * 60 + 30, DEAD = 23 * 60;
  const REQ = ['t_body', 't_msg', 't_plan', 't_test', 't_washio', 't_hiiragi', 't_mina', 't_reika', 't_print', 't_pot', 't_gloves'];
  const reqCount = () => REQ.filter(has).length;
  const allDone = () => reqCount() >= REQ.length;
  const tnow = () => f().tm || START;
  const fmt = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const leftMin = () => Math.max(0, DEAD - tnow());
  const leftStr = () => { const l = leftMin(); return `${Math.floor(l / 60)}時間${String(l % 60).padStart(2, '0')}分`; };

  async function ask(min, label) {
    const r = await G.choose([`${label}（${min}分）`, 'やめておく'], `残り時間　${leftStr()}`);
    return r === 0;
  }
  async function spend(min) {
    const before = tnow(), now = before + min;
    f().tm = now; G.time(fmt(now));
    G.toast(`<b>${fmt(before)} → ${fmt(now)}</b>　残り ${leftStr()}`, 2600);
    if (now >= DEAD) { await timeUp(); return; }
    if (before < 22 * 60 && now >= 22 * 60) {
      SND.se('blip');
      await N('無線機から、鷲尾警部の声が響いた。');
      await X('washio', '（無線）二十二時だ。あと一時間だぞ、代理探偵。', 'serious');
    } else if (before < 22 * 60 + 30 && now >= 22 * 60 + 30) {
      SND.se('blip');
      await X('washio', '（無線）あと三十分。……間に合わなきゃ、俺は全員を宴会場に集める。いいな。', 'angry');
    }
  }
  async function timeUp() {
    if (allDone()) {
      G.time('23:00');
      await N('――二十三時。時間だ。');
      await M('（……間に合った。全部、揃ってる）', 'serious');
      await finale();
      return;
    }
    G.time('23:00');
    SND.se('strike'); G.shake(3, 500);
    await N('ロビーの大時計が、二十三時を告げた。');
    await X('washio', '（無線）時間切れだ。……全員、宴会場に集めろ。宝玉の警備に回る。', 'closed');
    await G.gameOver('TIME UP', '二十三時の鐘', '真相に届かないまま、時間が尽きた。\n午前零時――闇の中で宝玉は消え、九条玲司を殺した者の名も、誰にも知られないまま夜に溶けた。');
  }
  async function checkDone() {
    if (ch() !== 3 || !allDone() || f().doneMsg) return;
    f().doneMsg = true;
    SND.se('chime');
    await G.mono(['――揃った。', '計画書。毒。印刷記録。差し替えられた封筒。\nばらばらだった欠片が、一本の糸で繋がっていく。', '（九条さん。……分かりました）']);
    G.toast('<b>手がかりが揃った</b>：警備本部の<b>鷲尾警部</b>に報告しよう。', 6000);
  }

  /* ------------------------------------------------------------------ */
  function initState(S) {
    S.map = 'O1'; S.x = 7; S.y = 7; S.dir = 'up';
    S.follower = 'kujo'; S.time = '15:00';
  }

  function npcs(id) {
    const L = [], fl = STATE.flags, c = STATE.chapter;
    const add = (i, x, y, d) => L.push({ id: i, x, y, dir: d });
    if (id === 'H1') {
      if (c === 1) {
        add('mina', 12, 12, 'down'); add('hiiragi', 4, 4, 'down');
        if (!fl.briefing) add('washio', 12, 5, 'down');
        add('houjou', 26, 14, 'left'); add('reika', 22, 12, 'down'); add('hayase', 25, 13, 'left');
      }
      if (c === 3) {
        add('mina', 12, 12, 'down'); add('hiiragi', 4, 4, 'down'); add('washio', 12, 5, 'down');
        add('houjou', 26, 14, 'left'); add('hayase', 24, 15, 'up');
      }
    }
    if (id === 'H12' && c === 3) add('reika', 15, 5, 'down');
    return L;
  }

  function objective() {
    const c = ch(), fl = f();
    if (c === 0) return fl.accepted ? '事務所を出て、ホテル・アストレアへ' : '';
    if (c === 1) {
      if (fl.briefing) return '';
      const n = ['houjou', 'reika', 'hayase', 'washio'].filter(k => fl['met_' + k]).length;
      return n < 4 ? `関係者に挨拶する（${n} / 4）` : '警備本部の鷲尾警部のもとへ';
    }
    if (c === 3) return allDone() ? '警備本部の鷲尾警部に報告する' : `代理探偵：手がかり ${reqCount()} / ${REQ.length}　残り ${leftStr()}`;
    if (c === 5 && fl.office && !fl.deskDone) return '九条の机へ';
    return '';
  }

  const FLAVOR = {
    B: ['本棚。ぎっしりと詰まった事件ファイルと推理小説。'],
    W: ['窓。夜の街の灯りが滲んで見える。'],
    K: ['柱時計。黒鷺館の事件のあと、九条さんが骨董屋で衝動買いしてきたものだ。'],
    S: ['ソファ。'], t: ['ローテーブル。'], h: ['椅子。'], P: ['観葉植物。'], L: ['ランプ。柔らかな光が揺れている。'],
    Z: ['額縁に入った新聞記事。「名探偵 九条玲司、黒鷺館の謎を解く」。'],
    C: ['カウンター。'], O: ['業務用のコンロ。'], I: ['大きな冷蔵庫。'], Q: ['調理台。'],
    T: ['白いクロスのかかった円卓。'], V: ['展示台。'], b: ['ベッド。'], w: ['クローゼット。'],
    d: ['机。'], U: ['階段。'],
  };
  async function flavor(c, x, y) {
    if (W.mapId === 'O1') {
      if (c === 'K') {
        await N('柱時計。黒鷺館の事件のあと、九条さんが骨董屋で衝動買いしてきたものだ。');
        if (ch() === 0 && f().accepted && !f().wound) { f().wound = true; SND.se('chime'); await N('ねじを巻くと、振り子が、こち、こち、と動き出した。'); }
        if (ch() === 5) await N('――誰も巻かなくなった振り子は、とうに止まっていた。');
        return;
      }
      if (c === 'B' && ch() < 5) { await N('事件ファイルの棚。「黒鷺館」「電脳展」……背表紙の字は、全部私が書いた。'); return; }
    }
    if (W.mapId !== 'O1' && c === 'Z') { await N('額縁に入った、開業当時のホテルの写真。'); return; }
    if (W.mapId === 'HR' && c === 'P') {
      await N('手入れの行き届いた鉢植え。名札には「柊」の字。');
      if (ch() >= 3) await N('薔薇、ラベンダー、それに――紫色の花。');
      return;
    }
    if (W.mapId === 'H1' && c === 'd' && x <= 6) {
      await N('支配人室の端末。パスワードでロックされている。');
      if (ch() === 3 && has('t_print')) await M('（16時10分。この端末から、計画書が印刷された……）', 'think');
      return;
    }
    if (W.mapId === 'H12' && c === 'b' && x === 1) { await N('ベッド。昨夜、九条さんが「枕が硬い」と文句を言っていた。'); return; }
    const L = FLAVOR[c]; if (!L) return;
    for (const l of L) await N(l);
  }

  /* ------------------------------------------------------------------
     序章
     ------------------------------------------------------------------ */
  async function prologue() {
    STATE.chapter = 0; STATE.time = '15:00';
    G.storm(false); G.rain(0); G.hum(0); G.bgm(null);
    await G.mono([
      '黒鷺館、そして電脳展。\nふたつの事件から、季節がひとつ巡った。',
      '九条探偵事務所の午後は、相変わらず静かだった。',
      '――あの手紙が届くまでは。',
    ]);
    G.load('O1', 7, 7, 'up');
    G.cinema(true); G.clearActors();
    G.place('kujo', 6, 3, 'down'); G.place('houjou', 7, 5, 'up');
    G.place('me', 8, 7, 'up');
    G.cam(7, 5); G.snap();
    await G.fadeIn(1300);
    G.bgm('t_explore');
    await X('houjou', '突然お邪魔して申し訳ない。宝条銀二郎と申します。宝石商を営んでおります。', 'serious');
    await K('宝条堂の会長ですね。存じています。……それで、ご用件は。', 'think');
    await X('houjou', 'これを。三日前、私の屋敷に届いたものです。');
    SND.se('page');
    await N('差し出されたのは、黒い封筒だった。封蝋には、翼を広げた鴉の紋章。');
    await K('…………。', 'think');
    await N('九条さんは指先をぺろりと舐めて、便箋をめくった。');
    await M('（また指を舐めてる……。何度言っても直らないんだから）', 'think');
    await G.gain('t_letter', '証拠品を入手');
    await K('“怪盗 夜鴉”。ここ数年、世界中で宝石を盗み続けている男だ。', 'serious');
    await K('予告状と黒い羽根を残し、狙った獲物は決して逃さない。……そして、誰も素顔を知らない。', 'serious');
    await M('怪盗……！ 本当にいるんですね、そういう人。', 'shock');
    await X('houjou', '狙われているのは、宝条家の家宝『緋月』。百年前、先々代が手に入れた紅玉です。', 'serious');
    await X('houjou', '三日後――ホテル・アストレアで開かれる慈善オークションに出品することになっておりまして。', 'sad');
    await X('houjou', '警察にも届けました。ですが、夜鴉は名指しで、九条先生をお呼びだ。', 'sad');
    await K('ご丁寧に。……挑戦状、というわけだ。', 'smile');
    const r = await G.choose(['引き受けましょう、九条さん！', '……危なくないですか？']);
    if (r === 0) { await M('引き受けましょう、九条さん！ 怪盗なんかに負けられません！', 'smile'); await K('珍しく乗り気だね、{N}くん。', 'smile'); G.trust(3); }
    else { await M('……危なくないですか？ 名指しなんて、まるで罠みたいで。', 'think'); await K('良い勘だ。罠だろうね。', 'serious'); await K('だが、招かれた以上は行くさ。怪盗の顔を拝む機会など、そうはない。', 'smile'); G.trust(2); }
    await K('お引き受けします、宝条さん。予告の前日から、ホテルに詰めましょう。', 'serious');
    await X('houjou', 'ありがとうございます……！ ホテルの者には、話を通しておきます。', 'smile');
    await G.fadeOut(600);
    G.remove('houjou');
    G.place('kujo', 6, 3, 'down'); G.place('me', 7, 6, 'up');
    await G.fadeIn(600);
    await K('{N}くん、支度を。今夜からホテル泊まりだ。', 'smile');
    await M('今夜から!? ……着替え、持ってこなきゃ。', 'shock');
    await K('私は先に下で待っている。……ああ、それと。', 'think');
    await K('事務所の戸締まりを頼む。柱時計も巻いておいてくれ。', 'closed');
    f().accepted = true;
    G.clearActors();
    G.follow(true);
    G.cam(null); G.cinema(false);
    G.toast(touch()
      ? '<b>移動</b>：十字ボタン　<b>調べる・話す</b>：Aボタン　<b>手帳</b>：Bボタン<br>今回は<b>時間制限</b>と<b>敗北</b>があります。'
      : '<b>移動</b>：矢印キー / WASD　<b>調べる・話す</b>：Z / Enter　<b>手帳</b>：X / Esc<br>今回は<b>時間制限</b>と<b>敗北</b>があります。', 9000);
  }

  async function examOfficeDesk() {
    if (ch() === 5) return lastDesk();
    await N('九条さんの机。読みかけの推理小説と、空になった角砂糖の瓶。');
    if (!f().deskSeen) {
      f().deskSeen = true;
      await N('机の隅に、私と九条さんが写った写真が立てかけてある。電脳展のあとに、ノアさんが撮ってくれたものだ。');
      await M('（九条さん、この写真だけは笑ってないんだよな……）', 'smile');
    }
  }
  async function leaveOffice() {
    if (ch() !== 0 || !f().accepted) return;
    await N('事務所の明かりを消して、扉に鍵をかけた。');
    await ch1();
  }

  /* ------------------------------------------------------------------
     第一章 前夜
     ------------------------------------------------------------------ */
  async function ch1() {
    await G.fadeOut(800);
    G.bgm(null);
    STATE.chapter = 1; STATE.follow = true;
    await G.chapter('第一章', '前夜', '― 予告前日　二十時 ―');
    G.load('H1', 9, 17, 'up');
    G.cinema(true); G.clearActors();
    G.place('me', 9, 17, 'up'); G.place('kujo', 10, 17, 'up');
    G.place('hiiragi', 9, 14, 'down'); G.place('mina', 11, 14, 'down');
    G.cam(9.5, 15.5); G.snap();
    G.time('20:00');
    await G.fadeIn(900);
    G.bgm('t_explore');
    await N('ホテル・アストレア。港を見下ろす、古い格式のホテルだ。');
    await X('hiiragi', 'ようこそお越しくださいました。支配人の柊でございます。', 'smile');
    await X('hiiragi', '宝条様より伺っております。九条様と、助手の{N}様ですね。', 'smile');
    await X('mina', 'い、いらっしゃいませっ！ フロント担当の藍沢ミナですっ！', 'smile');
    SND.se('crash');
    await N('ミナさんが勢いよくお辞儀をした拍子に、カウンターのベルが床に転がった。');
    await X('mina', 'あああっ、すみません、すみません！', 'shock');
    await X('hiiragi', '……失礼いたしました。藍沢、お二人のお部屋は十二階の1201号室だ。', 'closed');
    await K('お気遣いなく。……支配人、今夜の関係者は？', 'think');
    await X('hiiragi', '宝条様とお嬢様、それに鑑定士の早瀬様が宴会場「緋月の間」に。警視庁の鷲尾警部は、警備本部にいらっしゃいます。', 'smile');
    await X('hiiragi', '私は支配人室におりますので、何なりと。', 'smile');
    await K('では、挨拶回りといこう。{N}くん。', 'smile');
    G.clearActors(); G.restore();
    G.cam(null); G.cinema(false);
    G.toast('関係者に<b>挨拶</b>して回ろう。宴会場は<b>ロビーの東</b>、警備本部は<b>北の廊下の先</b>。', 6000);
  }

  async function talkHoujou() {
    if (ch() === 3) {
      await X('houjou', '{N}さん……。九条先生は、私の依頼のせいで……。', 'sad');
      await X('houjou', '宝玉など、もうどうでもいい。どうか、先生の仇を……。', 'sad');
      return;
    }
    if (!f().met_houjou) {
      f().met_houjou = true;
      await X('houjou', '九条先生、{N}さん。来てくださいましたか。', 'smile');
      await X('houjou', 'あちらが『緋月』です。……どうです、美しいでしょう。', 'smile');
      await N('宴会場の中央、ガラスケースの中で、深紅の宝玉が月のように輝いていた。');
      await K('なるほど。怪盗が欲しがるわけだ。', 'think');
      await X('houjou', '明日の18時半に、早瀬さんに最終鑑定をしていただきます。オークションの前の、決まりごとでしてね。');
      return;
    }
    await X('houjou', '明日の夜さえ越えれば……。どうか、よろしくお願いします。', 'serious');
  }
  async function talkReika() {
    if (ch() === 3) return talkReika3();
    if (!f().met_reika) {
      f().met_reika = true;
      await X('reika', '……あなたが、父が呼んだ探偵？', 'angry');
      await X('reika', '宝条麗華。宝飾デザイナーよ。言っておくけど、私は反対だったの。', 'angry');
      await X('reika', '警察に探偵に、物々しいったら。お客様が怖がるわ。', 'angry');
      await K('怪盗は、物々しさなど気にしてくれませんよ、お嬢さん。', 'closed');
      await X('reika', '……っ、失礼な人ね！', 'angry');
      await M('（九条さん……初対面の人を怒らせる天才だよね……）', 'sad');
      return;
    }
    await X('reika', 'まだ何か？ 探偵さんの助手って、暇なのね。', 'angry');
  }
  async function talkHayase() {
    if (ch() === 3) return talkHayase3();
    if (!f().met_hayase) {
      f().met_hayase = true;
      await X('hayase', 'こんばんは。鑑定士の早瀬透です。明日、『緋月』の鑑定を担当します。', 'smile');
      await X('hayase', 'お噂はかねがね。黒鷺館の事件、本で読みましたよ。', 'smile');
      await M('本!? ……あ、九条さんが勝手に出した、私の手記のことですか？', 'shock');
      await X('hayase', 'ええ。助手の方の文章がとても良かった。', 'smile');
      await N('早瀬さんは、鑑定用の小さな鞄を軽く叩いてみせた。');
      await X('hayase', '試薬も一式持ってきています。宝石の鑑定用ですが、ちょっとした化学検査ならこれで十分。', 'smile');
      await K('……早瀬さん。どこかで、お会いしたことは？', 'think');
      await X('hayase', 'いいえ、初めてですよ。', 'smile');
      await K('そうですか。……失礼。', 'think');
      return;
    }
    await X('hayase', '怪盗、か。……ちょっとロマンがありますよね。不謹慎かな。', 'smile');
  }
  async function talkMina() {
    if (ch() === 3) return talkMina3();
    if (!f().met_mina) {
      f().met_mina = true;
      await X('mina', 'あっ、九条様、{N}様！ さっきはすみませんでした……。', 'sad');
      await X('mina', 'わたし、フロントとルームサービスをやってます。何かあったら、なんでも言ってくださいね！', 'smile');
      await X('mina', 'あ、支配人を探すなら、夜はたいてい屋上の庭園ですよ。お花の手入れが趣味なんです。', 'smile');
      return;
    }
    await X('mina', 'お部屋のコーヒー、ミルクとお砂糖はいくつお持ちしましょう？', 'smile');
    await K('砂糖を五つ。', 'smile');
    await X('mina', 'い、五つ……！？', 'shock');
  }
  async function talkHiiragi() {
    if (ch() === 3) return talkHiiragi3();
    await X('hiiragi', '何かございましたか、{N}様。', 'smile');
    if (!f().met_hiiragi) {
      f().met_hiiragi = true;
      await X('hiiragi', 'このホテルも、建って六十年になります。古いばかりで、お恥ずかしい。', 'smile');
      await X('hiiragi', '……ですが、私にとっては家のようなものです。どうか、何事もなく明日を越えられますよう。', 'serious');
    }
  }
  async function talkWashio() {
    if (ch() === 3) return talkWashio3();
    if (!f().met_washio) {
      f().met_washio = true;
      await X('washio', '来たか、九条。……そっちが例の助手か。', 'serious');
      await X('washio', '警視庁捜査三課の鷲尾だ。夜鴉を追って、もう五年になる。', 'serious');
      await K('ご無沙汰しています、警部。相変わらず眉間の皺が深い。', 'smile');
      await X('washio', 'お前のせいで二本増えたんだよ。', 'angry');
    }
    const n = ['houjou', 'reika', 'hayase'].filter(k => f()['met_' + k]).length;
    if (n < 3) { await X('washio', '挨拶が済んだら、ここに戻ってこい。明日の作戦会議をやる。', 'serious'); return; }
    await briefing();
  }

  async function briefing() {
    f().briefing = true;
    await G.fadeOut(600);
    G.cinema(true); G.clearActors();
    G.place('washio', 12, 3, 'down'); G.place('hiiragi', 16, 4, 'left');
    G.place('kujo', 13, 5, 'up'); G.place('me', 12, 5, 'up');
    G.cam(13.5, 4); G.snap(); G.time('21:00');
    await G.fadeIn(700);
    G.bgm('tension');
    await N('警備本部。机の上に、ホテルの見取り図が広げられた。');
    await X('washio', '予告は明日の午前零時。宝玉は宴会場のケースから動かさん。', 'serious');
    await X('washio', '23時以降、宴会場には関係者だけを残して、部下二十人で囲む。蟻一匹通さねえ。', 'serious');
    await X('hiiragi', '警備計画書の最終版は、明日の夕方、私が警備本部のプリンターで印刷いたします。', 'smile');
    await X('hiiragi', '17時40分にフロントへ預けておきますので――', 'smile');
    await X('washio', 'それは俺が受け取って、18時に九条の部屋へ直接届ける。……ホテルの人間を疑うわけじゃないがな。', 'serious');
    await X('hiiragi', 'いえ、当然のご用心です。', 'closed');
    SND.se('page');
    await N('九条さんは指先を舐めながら、仮の計画書をぱらぱらとめくっている。');
    await X('washio', '……おい九条。その癖、やめろって言っただろうが。', 'angry');
    await K('考えごとをする時の癖でね。指が乾くと、頭も乾く。', 'smile');
    await M('（私も百回くらい言ってるんですけどね……）', 'sad');
    await G.gain('t_habit', '記憶に残った');
    await K('――警部。明日、ひとつ確かめたいことがあります。', 'serious');
    await X('washio', 'あん？ なんだ。', 'think');
    await K('まだ言えません。……確証がないものでね。', 'closed');
    await X('washio', 'ちっ、いつもそれだ。', 'angry');
    await X('hiiragi', '九条様、お疲れでしょう。よろしければ、屋上の庭園で夜風にでも。', 'smile');
    await K('ありがたい。案内していただけますか。', 'smile');
    await rooftopNight();
  }

  async function rooftopNight() {
    await G.fadeOut(700);
    G.load('HR', 10, 7, 'up');
    G.cinema(true); G.clearActors();
    G.place('hiiragi', 8, 6, 'right'); G.place('kujo', 10, 6, 'left'); G.place('me', 10, 7, 'up');
    G.cam(9.5, 6); G.snap(); G.time('21:40');
    G.bgm('t_title');
    await G.fadeIn(900);
    await N('屋上庭園。港の灯りの上に、少し欠けた月が浮かんでいた。');
    await X('hiiragi', '私の、ささやかな趣味でして。', 'smile');
    await M('きれい……。全部、支配人さんが育ててるんですか？', 'smile');
    await X('hiiragi', 'ええ。……ああ、その紫の花には、触れませんように。', 'serious');
    await K('トリカブトですね。', 'think');
    await X('hiiragi', 'さすがは九条様。美しい花には、毒がある――と申します。', 'smile');
    await K('根には猛毒がある。……管理には、くれぐれもお気をつけて。', 'serious');
    await X('hiiragi', '…………。ええ、心得ております。', 'closed');
    SND.se('whoosh');
    await N('ばさり、と羽音がした。');
    await N('一羽の鴉が月を横切り、黒い羽根が一枚、九条さんの足元に落ちた。');
    await K('……縁起でもない。', 'think');
    await G.fadeOut(900);
    await suiteNight();
  }

  async function suiteNight() {
    G.load('H12', 6, 6, 'up');
    G.cinema(true); G.clearActors();
    G.place('kujo', 6, 3, 'up'); G.place('me', 6, 6, 'up');
    G.cam(6, 4.5); G.snap(); G.time('23:30');
    G.bgm('truth');
    await G.fadeIn(900);
    await N('1201号室。九条さんは、窓の外の夜景をじっと見下ろしていた。');
    await M('九条さん。眠れないんですか？', 'think');
    await K('{N}くん。……気づいたか？', 'serious');
    await M('え？', 'shock');
    await K('今夜会った人間の中に――夜鴉の“目”がある。', 'serious');
    await M('この中に、怪盗の仲間が……！？', 'shock');
    await K('確証はない。だから明日、確かめる。', 'closed');
    await G.walk('kujo', 'D'); G.face('kujo', 'down');
    await K('……君と組んで、もう何年になるかな。', 'smile');
    const r = await G.choose(['九条さんの助手で、よかったです', '……お給料、上げてください']);
    if (r === 0) { await M('九条さんの助手で、よかったです。……急にどうしたんですか？', 'smile'); await K('いや。たまには、言われてみたかっただけさ。', 'smile'); G.trust(4); }
    else { await M('……その前に、お給料上げてください。', 'think'); await K('はは。考えておこう。……来年あたりにね。', 'smile'); G.trust(3); }
    await K('{N}くん。もし、私に何かあったら――', 'serious');
    await M('…………。', 'think');
    await K('……いや。なんでもない。忘れてくれ。', 'closed');
    await K('おやすみ。明日は長い一日になる。', 'smile');
    await G.fadeOut(1400);
    G.bgm(null);
    await G.mono(['それが、九条さんと交わした、最後の「おやすみ」だった。']);
    await ch2();
  }

  /* ------------------------------------------------------------------
     第二章 午後七時の死
     ------------------------------------------------------------------ */
  async function ch2() {
    STATE.chapter = 2; G.follow(false);
    await G.chapter('第二章', '午後七時の死', '― 予告当日 ―');
    G.load('H12', 7, 7, 'up');
    G.cinema(true); G.clearActors();
    G.place('kujo', 5, 6, 'down'); G.place('me', 7, 7, 'left');
    G.cam(6, 5.5); G.snap(); G.time('17:45');
    await G.fadeIn(900);
    G.bgm('t_explore');
    await N('予告当日。夕方の1201号室。');
    await K('18時に、鷲尾警部が計画書の最終版を届けてくれる。私はそれを頭に叩き込む。', 'serious');
    await K('君は18時半からの、宝玉の最終鑑定に立ち会ってくれ。', 'serious');
    await M('私一人で、ですか？', 'shock');
    await K('ああ。宝玉から目を離すな。……特に、鑑定士の手元からだ。', 'serious');
    await M('早瀬さんの……？', 'think');
    await K('それと。鑑定が終わったら、ここに戻ってきてくれ。話しておきたいことがある。', 'closed');
    await M('……はい！ すぐに戻ります。', 'smile');
    await K('行っておいで、{N}くん。', 'smile');
    await G.fadeOut(900);

    // 鑑定
    G.load('H1', 24, 16, 'up');
    G.cinema(true); G.clearActors();
    G.place('hayase', 23, 14, 'right'); G.place('houjou', 26, 14, 'left'); G.place('me', 24, 16, 'up');
    G.cam(24, 14.5); G.snap(); G.time('18:30');
    await G.fadeIn(900);
    await N('18時30分。宴会場「緋月の間」。');
    await X('hayase', 'では、拝見します。', 'serious');
    await N('白い手袋をはめた早瀬さんが、ケースから『緋月』を取り出し、ルーペを当てた。');
    await N('長い指が、宝玉の上で滑らかに動く。');
    await M('（目を離すな……。九条さん、どういう意味だったんだろう）', 'think');
    await X('hayase', '……間違いありません。本物の『緋月』です。', 'smile');
    await X('houjou', 'ああ、よかった……。', 'smile');
    SND.se('ok');
    await N('宝玉は、再びガラスケースに収められた。');
    await X('hayase', '{N}さん。九条さんって、どんな人ですか？', 'smile');
    await M('え？ ええと……口が悪くて、甘いものが好きで、人の気持ちが分からなくて。', 'think');
    await M('……でも、すごい人です。', 'smile');
    await X('hayase', 'ふふ。いい相棒ですね。', 'smile');
    G.time('18:50');
    await N('18時50分。');
    await M('あ、そろそろ戻らなきゃ。九条さんに報告しないと。', 'smile');
    await G.fadeOut(700);

    // 発見
    G.load('H12', 5, 9, 'up');
    G.cinema(true); G.clearActors();
    G.place('me', 5, 9, 'up');
    G.cam(5.5, 7); G.snap(); G.time('18:55');
    G.bgm(null);
    f().dead = true;
    await G.fadeIn(600);
    SND.se('knock');
    await M('九条さん、戻りましたー。鑑定、本物でしたよ。', 'smile');
    await N('……返事がない。');
    await G.walk('me', 'U');
    await G.walk('me', 'U');
    G.cam(5.5, 6);
    SND.se('sting'); G.shake(5, 500, true);
    await M('――九条さん！！', 'shock');
    G.bgm('tension');
    await N('九条さんが、床に倒れていた。');
    await N('周りには、計画書のページが散らばっている。');
    await M('九条さん、九条さん！ しっかりしてください！！', 'shock', { tremble: true });
    await X('kujo', '……{N}、くん……', 'closed', { tremble: true });
    await X('kujo', '……すまない……', 'sad', { tremble: true });
    await X('kujo', '……あとは……君が……', 'closed', { tremble: true });
    await N('伸ばされた指先が、私の手に触れて――', { });
    await N('――ぱたりと、落ちた。');
    SND.se('heart');
    await G.fadeOut(2000);
    G.bgm(null);
    await G.mono(['十八時五十五分。', '九条玲司は、死んだ。']);

    // 代理探偵
    G.load('H1', 24, 17, 'up');
    G.cinema(true); G.clearActors();
    G.place('washio', 24, 14, 'down'); G.place('houjou', 26, 14, 'left'); G.place('reika', 22, 14, 'right');
    G.place('hiiragi', 22, 16, 'right'); G.place('mina', 27, 16, 'left'); G.place('hayase', 23, 16, 'up');
    G.place('me', 24, 17, 'up');
    G.cam(24, 15.5); G.snap(); G.time('19:20');
    await G.fadeIn(1200);
    G.bgm('tension');
    await N('19時20分。関係者全員が、宴会場に集められた。');
    await X('washio', '……毒だ。外傷はない。即効性の神経毒だろう。', 'closed');
    await X('washio', 'ホテルは封鎖した。予告の零時まで、誰一人ここから出さん。', 'angry');
    await X('reika', 'そんな……人が死んでるのよ!? 怪盗どころじゃないでしょう！', 'shock');
    await X('washio', '本庁は、宝玉の警備を優先しろと言ってきた。……くそったれが。', 'angry');
    await X('washio', 'いいか。俺は23時になったら、全員をこの部屋に集めて宝玉の警備に回る。', 'serious');
    await X('washio', 'それまでに――九条を殺した奴を挙げる。', 'serious');
    await X('houjou', '{N}さん。', 'sad');
    await X('houjou', '九条先生は、あなたのことを「最高の相棒だ」と仰っていた。', 'sad');
    await X('houjou', 'どうか……先生の代わりに、犯人を見つけてはいただけませんか。', 'sad');
    await X('reika', 'ちょっと、お父様！ 助手なんかに何ができるのよ！', 'angry');
    await X('hayase', '僕は手伝いますよ。鑑定用の試薬なら、毒物の簡易検査くらいはできる。', 'serious');
    await X('washio', '……どうする、助手。', 'serious');
    const r = await G.choose(['……やります。九条さんの代わりに', '……私には、無理です']);
    if (r === 1) {
      await M('……私には、無理です。私は、九条さんの助手で……探偵じゃ……', 'sad', { tremble: true });
      await N('その時、耳の奥で、あの声が聞こえた気がした。');
      G.flashback(true);
      await X('kujo', '……あとは……君が……', 'closed');
      G.flashback(false);
      await M('…………。', 'closed');
    }
    await M('……やります。', 'serious');
    await M('九条さんを殺した犯人は――私が、見つけます。', 'serious');
    await X('washio', '……いい顔だ。23時だぞ。それまでに挙げてみせろ、代理探偵。', 'serious');
    await G.fadeOut(1000);
    await ch3();
  }

  /* ------------------------------------------------------------------
     第三章 代理探偵
     ------------------------------------------------------------------ */
  async function ch3() {
    STATE.chapter = 3; STATE.follow = false; f().tm = START;
    G.bgm(null);
    await G.chapter('第三章', '代理探偵', '― 残り三時間半 ―');
    G.load('H12', 5, 7, 'up');
    G.clearActors(); G.restore();
    G.time(fmt(START));
    G.checkpoint('investigate');
    await investigate();
  }
  async function investigate() {
    G.cinema(false); G.cam(null);
    G.bgm('t_clock');
    await G.fadeIn(800);
    if (tnow() === START && !reqCount()) {
      await N('19時30分。1201号室。');
      await N('九条さんは、さっきと同じ場所に横たわっている。');
      await M('（泣くのは、あとだ。……九条さんなら、まず現場を見る）', 'serious');
    }
    G.toast('<b>代理探偵</b>：調べる・話を聞くたびに<b>時間が進みます</b>。<br><b>23:00</b>までに手がかりを揃えよう。迷ったら手帳の設定から<b>九条の言葉</b>を思い出せます。', 9000);
  }

  // ---- 1201号室 ----
  async function examBody() {
    if (has('t_body')) { await N('九条さんは、眠っているみたいだった。'); return; }
    if (!(await ask(10, '遺体を調べる'))) return;
    await N('九条さんの遺体を、震える手で調べた。');
    await N('外傷はない。唇が紫色に変わって……右手の指先が、痺れたように強張っている。');
    await M('（指先……？ なんで、指先だけ……）', 'think');
    await G.gain('t_body', '証拠品を入手');
    await spend(10); await checkDone();
  }
  async function examNote() {
    if (has('t_msg')) { await N('九条さんの手帳。最後のページの「ゆび」の字が、目に焼きついて離れない。'); return; }
    if (!(await ask(10, '手帳を調べる'))) return;
    await N('九条さんの手帳が、床に落ちていた。');
    await N('最後のページに、ひどく震えた字で、何か書かれている。');
    SND.se('sting');
    await N('「ゆび」');
    await M('……ゆび。指……？ 九条さん、何を伝えようとしたの……？', 'think');
    await G.gain('t_msg', '証拠品を入手');
    await spend(10); await checkDone();
  }
  async function examPlan() {
    if (has('t_plan')) { await N('警備計画書。ページの右下の角だけが、波打っている。'); return; }
    if (!(await ask(10, '計画書を調べる'))) return;
    await N('床に散らばった、警備計画書のページを拾い集めた。');
    await N('……妙だ。どのページも、右下の角だけが湿って、わずかに波打っている。');
    await G.gain('t_plan', '証拠品を入手');
    SND.se('page');
    await N('ページをめくると――間から、何かが滑り落ちた。');
    SND.se('sting'); G.shake(3, 400);
    await N('黒い、鴉の羽根。');
    await M('夜鴉の……！ どうして、計画書の間に……！？', 'shock');
    await G.gain('t_feather', '証拠品を入手');
    await spend(10); await checkDone();
  }
  async function examCoffee() {
    if (f().coffeeSeen) { await N('飲みかけのコーヒー。すっかり冷めている。'); return; }
    if (!(await ask(10, 'テーブルを調べる'))) return;
    f().coffeeSeen = true;
    await N('テーブルの上に、飲みかけのコーヒー。カップの縁に、角砂糖の包み紙が五つ。');
    await N('伝票には「18:20　1201号室　コーヒー　担当：藍沢」。');
    await M('（毒を入れるなら、普通はここだよね……。誰かに調べてもらえれば）', 'think');
    await spend(10); await checkDone();
  }

  // ---- 1202 麗華 ----
  async function talkReika3() {
    if (has('t_reika')) { await X('reika', '……もう、話すことはないわ。', 'sad'); return; }
    await X('reika', '……何よ。私を疑いに来たの？', 'angry');
    if (!(await ask(15, '話を聞く'))) { await X('reika', '用がないなら出ていって。', 'angry'); return; }
    await M('麗華さん。……事件の前、九条さんの部屋に行きませんでしたか？', 'serious');
    await X('reika', '…………。', 'closed');
    await X('reika', '……行ったわよ。18時40分。昨日のことを、謝りに。', 'sad');
    await X('reika', 'あの人、私の言うことなんか聞いてなくて。書類を読みながら、指を舐めてページをめくってたわ。', 'sad');
    await X('reika', 'それで、笑いながら言ったの。『このページ、やけに苦いな』って。', 'sad');
    await X('reika', '……それが最後。私が部屋を出た時は、元気だったのよ。本当に……！', 'sad', { tremble: true });
    await G.gain('t_reika', '証言を記録');
    await spend(15); await checkDone();
  }

  // ---- 屋上 ----
  async function examPot() {
    if (has('t_pot')) { await N('掘り返されたトリカブトの鉢。'); return; }
    if (!(await ask(10, '鉢植えを調べる'))) return;
    await N('昨夜、柊さんが見せてくれた紫色の花――トリカブトの鉢。');
    await N('その根元の土が、最近掘り返されたように柔らかい。根の一部が、切り取られている。');
    await M('（根には、猛毒がある……九条さん自身が、そう言ってた）', 'serious');
    await G.gain('t_pot', '証拠品を入手');
    await spend(10); await checkDone();
  }
  async function examGloves() {
    if (has('t_gloves')) { await N('庭の道具箱。「支配人 柊　私物」の札。'); return; }
    if (!(await ask(10, '道具箱を調べる'))) return;
    await N('鉄製の道具箱。蓋に「支配人 柊　私物」と札がかかっている。');
    await N('剪定ばさみ、移植ごて、肥料の袋――その底に、何か丸めて押し込まれていた。');
    SND.se('sting');
    await N('薬品用のゴム手袋。指先に、緑色の汁がこびりつき、鼻を刺す苦い匂いがする。');
    await G.gain('t_gloves', '証拠品を入手');
    await spend(10); await checkDone();
  }

  // ---- 一階 ----
  async function talkHayase3() {
    if (has('t_test')) { await X('hayase', '{N}さん。……あなたは、いい探偵になりますよ。', 'smile'); return; }
    if (!has('t_plan') || !f().coffeeSeen) {
      await X('hayase', '{N}さん。調べたいものがあれば持ってきてください。毒物の簡易検査なら、ここでできます。', 'serious');
      await X('hayase', '……毒を盛るなら、普通は飲み物か、口に入るもの――ですかね。', 'think');
      return;
    }
    await X('hayase', 'コーヒーと……計画書？ なるほど。検査してみましょう。', 'serious');
    if (!(await ask(15, '毒物検査を頼む'))) return;
    await N('早瀬さんは鞄から試薬の小瓶を並べ、手際よく検査を進めた。');
    await X('hayase', 'まず、コーヒー。……陰性です。毒は入っていない。', 'serious');
    await M('え……！？', 'shock');
    await X('hayase', '次に、計画書。……ページの角。ここです。', 'serious');
    SND.se('sting'); G.shake(3, 400);
    await X('hayase', '陽性。植物性の神経毒が、ページの右下の角にだけ塗られています。', 'serious');
    await G.gain('t_test', '検査結果を記録');
    await M('（ページの角に、毒……。それに九条さんの、あの癖……！）', 'shock');
    await X('hayase', '……面白い。犯人は、九条さんのことをよく知っていたようですね。', 'smile');
    await spend(15); await checkDone();
  }
  async function talkWashio3() {
    if (allDone()) return reportWashio();
    if (has('t_washio')) { await X('washio', '時間がねえぞ。足で稼げ、代理探偵。', 'serious'); return; }
    await X('washio', '……どうした。何か掴んだか。', 'serious');
    if (!(await ask(15, '計画書の受け渡しについて聞く'))) return;
    await M('警部。18時に、計画書を九条さんに届けたんですよね。', 'serious');
    await X('washio', 'ああ。17時55分にフロントで封筒を受け取って、18時ちょうどに九条に渡した。', 'serious');
    await X('washio', '封は閉じたままだった。九条はその場で封を切って、すぐ読み始めたよ。……指を舐めながらな。', 'closed');
    await X('washio', '俺が届けた紙で、あいつが……。くそっ。', 'angry');
    await G.gain('t_washio', '証言を記録');
    await spend(15); await checkDone();
  }
  async function talkHiiragi3() {
    if (has('t_hiiragi')) { await X('hiiragi', '……他に、何か。', 'closed'); return; }
    await X('hiiragi', '{N}様。……この度は、なんとお詫び申し上げればよいか。', 'sad');
    if (!(await ask(15, '計画書について聞く'))) return;
    await M('柊さん。警備計画書を用意したのは、柊さんですよね。', 'serious');
    await X('hiiragi', 'はい。17時30分に、警備本部のプリンターで印刷いたしました。', 'serious');
    await X('hiiragi', 'それを封筒に入れ、17時40分にフロントへ預けました。', 'serious');
    await X('hiiragi', 'それ以降、私は一切、あの封筒には触れておりません。', 'closed');
    await G.gain('t_hiiragi', '証言を記録');
    await spend(15); await checkDone();
  }
  async function examPrinter() {
    if (ch() !== 3) { await N('警備本部のプリンター。'); return; }
    if (has('t_print')) { await N('印刷記録。「16:10　端末：支配人室」の一行。'); return; }
    if (!has('t_hiiragi')) { await N('警備本部のプリンター。履歴を確認できるようだ。'); await M('（今、調べる理由はない……かな）', 'think'); return; }
    await M('（柊さんは、17時30分にここで印刷したって言ってた。……念のため）', 'think');
    if (!(await ask(10, '印刷記録を確認する'))) return;
    SND.se('blip');
    await N('プリンターのパネルを操作して、今日の印刷履歴を呼び出した。');
    await N('「17:30　警備計画書（最終版）　端末：警備本部」');
    SND.se('sting'); G.shake(3, 400);
    await N('「16:10　警備計画書（最終版）　端末：支配人室」');
    await M('……同じ書類が、一時間以上前にも印刷されてる……？', 'shock');
    await G.gain('t_print', '証拠品を入手');
    await spend(10); await checkDone();
  }
  async function talkMina3() {
    if (has('t_mina') && f().mina_coffee && f().mina_odd) { await X('mina', '九条様……砂糖、五つって……。', 'sad', { tremble: true }); return; }
    await X('mina', '{N}様……。わ、わたし、何でも話します……！', 'sad');
    while (true) {
      const opts = [
        { text: 'コーヒーを運んだ時のこと（10分）', done: !!f().mina_coffee },
        { text: '計画書の封筒のこと（10分）', done: has('t_mina') },
        { text: '怪しい人を見なかったか（10分）', done: !!f().mina_odd },
        { text: 'やめておく' },
      ];
      const r = await G.choose(opts, `何を聞く？　残り時間 ${leftStr()}`);
      if (r === 3) return;
      if (r === 0) {
        f().mina_coffee = true;
        await X('mina', '18時20分に、コーヒーをお持ちしました。九条様は書類を読みながら、「ありがとう」って……。', 'sad');
        await X('mina', 'お砂糖、本当に五つ入れてらして。わたし、思わず笑っちゃって……。', 'sad', { tremble: true });
        await X('mina', 'わ、わたし、毒なんか入れてません！ 本当です！', 'shock');
        await spend(10);
      } else if (r === 1) {
        if (has('t_mina')) { await X('mina', 'さっきお話しした通りです。支配人が、差し替えだって……。', 'think'); continue; }
        await X('mina', '封筒……ですか？ 17時40分に、支配人がフロントに預けていかれて……。', 'think');
        await X('mina', 'あっ。そういえば、17時50分ごろ、支配人がもう一度戻ってこられたんです。', 'think');
        await X('mina', '『差し替えだ』とおっしゃって、封筒を入れ替えていかれました。', 'serious');
        await G.gain('t_mina', '証言を記録');
        await M('（柊さんは、17時40分以降は「一切触れていない」って……）', 'shock');
        await spend(10);
      } else {
        f().mina_odd = true;
        await X('mina', '怪しい人……。そういえば、早瀬様が18時半前に、エレベーターで十二階に……。', 'think');
        await X('mina', 'あ、でも、すぐに宴会場に向かわれてました。鑑定のお時間でしたし……。', 'think');
        await spend(10);
      }
      if (ch() !== 3) return;
      await checkDone();
    }
  }
  async function examKitchen() {
    if (ch() !== 3) { await N('厨房。料理人たちが、明日の晩餐会の仕込みをしている。'); return; }
    if (f().kitchen) { await N('ルームサービスの伝票の束。'); return; }
    if (!(await ask(10, '厨房を調べる'))) return;
    f().kitchen = true;
    await N('厨房のルームサービス伝票を確かめた。');
    await N('「18:20　1201号室　コーヒー　担当：藍沢」……ほかに、九条さんの部屋への注文はない。');
    await N('コーヒーの豆も、砂糖も、ほかの客室と同じものだ。');
    await spend(10); await checkDone();
  }
  async function examPedestal() {
    if (f().stolen) { await N('空っぽのガラスケース。黒い羽根が一枚、残されている。'); return; }
    await N('ガラスケースの中で、『緋月』が深紅に輝いている。');
    if (ch() === 3) await M('（予告の零時まで、あと少し……。でも今は、九条さんの事件だ）', 'serious');
  }
  async function counterMina() {
    if (ch() === 1 || ch() === 3) return TALK.mina();
  }

  async function reportWashio() {
    await X('washio', '……顔つきが変わったな。分かったのか。', 'serious');
    const r = await G.choose(['はい。全員を宴会場に集めてください', 'もう少し調べる']);
    if (r === 1) { await X('washio', '急げよ。23時は待っちゃくれねえ。', 'serious'); return; }
    await M('はい。……全員を、宴会場に集めてください。', 'serious');
    await X('washio', '上等だ。', 'serious');
    await finale();
  }

  /* ------------------------------------------------------------------
     第四章 告発
     ------------------------------------------------------------------ */
  function hallSetup() {
    G.clearActors();
    G.place('washio', 23, 13, 'down'); G.place('houjou', 25, 13, 'down');
    G.place('reika', 27, 14, 'left'); G.place('hayase', 27, 16, 'left');
    G.place('hiiragi', 21, 14, 'right'); G.place('mina', 21, 17, 'right');
    G.place('me', 24, 17, 'up');
    G.cam(24, 15); G.snap();
  }
  async function T(who, text, e, o) { G.spot(who); return G.say(who, text, e, o); }
  const resolvePenalty = async () => {
    G.focus(-15);
    if (STATE.focus <= 0) await G.gameOver('BAD END', '折れた心', '言葉が、出てこなくなった。\n「やっぱり助手には無理だったのよ」――誰かの声を最後に、告発は打ち切られた。\n午前零時、宝玉は消え、九条玲司を殺した犯人は、闇に紛れたままになった。');
  };
  const WRONG = ['（違う……これじゃない。落ち着いて……）', '（九条さんなら、どう考える……？　もう一度、手帳を）', '（……違う。この証拠は、今の話と繋がらない）'];
  const P = (prompt, ids, o = {}) => G.present(prompt, ids, Object.assign({ penalty: resolvePenalty, noAuto: true, speaker: 'me', wrongLines: WRONG, gain: 0, cut: '提示！' }, o));

  async function finale() {
    STATE.chapter = 4; STATE.follow = false;
    STATE.focus = 100;
    f().finalTm = tnow();
    G.bgm(null);
    await G.fadeOut(900);
    if (!f().finaleSeen) { f().finaleSeen = true; await G.chapter('第四章', '告発', '― 午前零時の一時間前 ―'); }
    G.load('H1', 24, 17, 'up');
    G.cinema(true);
    hallSetup();
    G.time('23:00');
    G.checkpoint('finale');
    G.bgm('tension');
    await G.fadeIn(900);
    await N('23時。宴会場「緋月の間」に、全員が集められた。');
    await T('washio', '……聞かせてもらおうか、代理探偵。', 'serious');
    await T('reika', '本当に分かったっていうの？ 助手のあなたに？', 'angry');
    G.spot(null);
    await M('（九条さん。……見ていてください）', 'closed');
    G.toast('<b>第四章</b>：証拠を間違えると<b>決意</b>が減ります。0になると<b>敗北</b>です。', 6500);
    G.refresh(); $('hud').classList.remove('hidden'); setTimeout(G.refresh, 4000);
    G.bgm('deduction');

    await T('me', '九条さんは、毒で殺されました。誰もが、コーヒーに毒が入っていたと思った。', 'serious');
    await T('mina', 'わ、わたしじゃありません……！', 'shock');
    await T('me', 'はい。ミナさんじゃない。毒は、コーヒーには入っていなかった。', 'serious');
    await P('毒が仕込まれていた場所を示す証拠は？', ['t_test'], { hint: '（早瀬さんにしてもらった検査。陽性だったのは……？）', alt: { t_plan: '（計画書が怪しいのは分かってる。でも、「毒があった」とはっきり示すものは……？）' } });
    await T('me', '毒は、警備計画書のページの角に塗られていたんです。', 'serious');
    await T('reika', 'ページの角……？ そんなところに毒を塗って、どうやって……。', 'think');
    await P('犯人が利用した、九条さんの“習慣”とは？', ['t_habit'], { hint: '（作戦会議の夜、鷲尾警部が九条さんを叱っていた……）', alt: { t_reika: '（麗華さんが見た光景……その意味を示す、もっと根っこの手がかりがある）', t_msg: '（「ゆび」が指すもの。それは九条さんの、いつもの……）' } });
    await T('me', '九条さんには、書類をめくる時に指を舐める癖がありました。', 'serious');
    await T('me', 'ページをめくるたびに、指先についた毒を、自分で口に運んでいたんです。', 'serious');
    await T('reika', '……「このページ、やけに苦いな」……。あの時、もう……！', 'shock');
    await T('me', '九条さんが最後に遺した言葉――「ゆび」。それは、そのことを伝えようとしていたんです。', 'sad');
    await T('washio', '……っ。俺は何度も、その癖をやめろと……。', 'closed');

    await T('me', 'では、毒はいつ、誰が塗ったのか。', 'serious');
    await T('me', '計画書は、18時に鷲尾警部から九条さんへ、封を閉じたまま渡されています。', 'serious');
    await T('me', 'つまり毒は、届く前から塗られていた。', 'serious');
    await G.timeline([
      { t: '16:10', text: '？？？', cls: 'bad' },
      { t: '17:30', text: '計画書を印刷\n（警備本部）' },
      { t: '17:40', text: '封筒を\nフロントへ' },
      { t: '17:50', text: '？？？', cls: 'key' },
      { t: '18:00', text: '鷲尾が\n九条に手渡す' },
      { t: '18:55', text: '九条、死亡', cls: 'bad' },
    ], ['17:40', '18:00', '封筒はフロントに'], ['16:00', '19:05']);
    await P('封筒がフロントにあった間に、何があった？', ['t_mina'], { hint: '（フロントにいたのは、ミナさん。彼女は封筒について、何て言っていた？）', alt: { t_washio: '（警部が受け取る「前」のことだ。フロントで、何かがあったはず）', t_hiiragi: '（柊さんは「触れていない」と言った。それを崩す証言は……？）' } });
    await T('me', '17時50分。封筒は、フロントで「差し替え」られていました。', 'serious');
    await T('mina', 'は、はい……。「差し替えだ」っておっしゃって……。', 'sad');
    await T('me', 'ミナさん。封筒を差し替えたのは、誰でしたか？', 'serious');
    await T('mina', 'それは……', 'sad');
    G.spot(null);
    await M('（……ここで間違えたら、全部終わる。九条さん――）', 'closed');
    const who = await G.pickPerson('九条玲司を殺害した犯人は？', ['hiiragi', 'mina', 'reika', 'washio', 'hayase', 'houjou']);
    if (who !== 'hiiragi') {
      const nm = { mina: 'ミナ', reika: '麗華', washio: '鷲尾', hayase: '早瀬', houjou: '宝条' }[who];
      await T('me', `犯人は……${nm}さんです！`, 'serious');
      await T('washio', '……おい。本気で言ってるのか。', 'angry');
      SND.se('wrong');
      await G.gameOver('BAD END', '誤った告発', `${nm}が拘束され、宴会場が騒然としたその隙に――\n午前零時、宝玉『緋月』は闇に消えた。\n九条玲司を殺した者の名は、誰にも知られないまま、夜に溶けた。`);
    }
    await G.cutin('犯人は――', null, 1100);
    G.spot('hiiragi'); SND.se('sting'); G.shake(5, 600, true);
    await T('me', '柊宗一さん。……あなたです。', 'serious');
    await T('hiiragi', '…………。', 'closed');
    await T('hiiragi', '{N}様。誤植を見つけて、差し替えただけでございますよ。', 'smile');
    await T('hiiragi', 'このホテルの支配人として、申し上げます。……言いがかりは、おやめいただきたい。', 'serious');

    await G.debate({
      enemy: 'hiiragi', name: '柊 宗一', short: '柊',
      intro: '告発開始！ 柊の“心の防壁”を崩せ！',
      partyName: '代理探偵 {N}', hpName: '決意', hintLabel: '九条の言葉を思い出す', hintHelp: '九条ならどう考えたか、思い出す。', hintSpeaker: 'me',
      bgm: 'deduction', wrongDmg: 20,
      loseText: '言葉が、続かなかった。\n柊は静かに一礼して宴会場を去り――午前零時、宝玉は闇に消えた。\n九条玲司の死は、「怪盗事件に巻き込まれた不幸な事故」として処理された。',
      rounds: [
        { claim: '差し替えたのは、誤植を直しただけです！ 中身は、17時30分に刷ったものと同じですよ！', correct: ['t_print'],
          alt: { t_hiiragi: '（柊さん自身の証言……それを、“記録”で崩せないか？）' },
          hint: '（17時30分より前に、同じ書類が刷られていなかった……？）', counter: '印刷の記録など、何の意味も――！', face: 'serious',
          after: async () => {
            await M('警備本部のプリンターの記録です。同じ計画書が、16時10分に“支配人室の端末”から印刷されていた。', 'serious');
            await M('あなたは毒を塗った計画書を、あらかじめ用意していた。17時50分の差し替えは、誤植の修正なんかじゃない。毒の計画書との、すり替えだった！', 'serious');
            await X('hiiragi', '……っ。', 'shock');
          } },
        { claim: '毒、毒と仰いますが……私がどこで、そのようなものを手に入れると？', correct: ['t_pot'],
          hint: '（昨夜、屋上で柊さん自身が見せてくれた花は……？）', counter: '毒など、見たこともございません！',
          after: async () => {
            await M('屋上庭園の、トリカブト。昨夜、あなた自身が「美しい花には毒がある」と言った花です。', 'serious');
            await M('その根元が、最近掘り返されていた。……根の一部が、切り取られていました。', 'serious');
          } },
        { claim: '庭には、誰でも出入りできます！ 私が掘ったという証拠など、どこにもない！', correct: ['t_gloves'],
          alt: { t_pot: '（鉢そのものじゃない。掘った“手”を示すものが、屋上にあった）' },
          hint: '（屋上で見つけた、持ち主の名前が書かれた箱。その中身は？）', counter: '言いがかりです！',
          after: async () => {
            await M('屋上の道具箱の底に、ゴム手袋が押し込まれていました。指先には、トリカブトの汁。', 'serious');
            await M('その道具箱には、こう書いてある。――「支配人 柊　私物」。', 'serious');
            await X('hiiragi', '…………。', 'closed');
          } },
        { claim: '仮に……仮に私だとして！ なぜ私が、九条様を殺さねばならないのです！', correct: ['t_feather'], cut: 'これが答えです！',
          alt: { t_letter: '（予告状そのものじゃない。この事件の“現場”に、あの印が残っていた……）' },
          hint: '（計画書のページの間に挟まっていた、あれは誰の印……？）', counter: '理由など、ございません！',
          after: async () => {
            await M('この黒い羽根は、計画書のページの間に挟まっていました。', 'serious');
            await M('計画書を用意できたのは、あなただけ。……あなたは、怪盗・夜鴉の仲間です。', 'serious');
            await M('九条さんを消すために、夜鴉と手を組んだ。そうですね、柊さん……！', 'angry');
          } },
      ],
    });

    // 告白
    f().solved = true;
    G.bgm('truth');
    G.spot('hiiragi');
    await N('長い沈黙のあと、柊さんは、ゆっくりと白い手袋を外した。');
    await T('hiiragi', '……このホテルは、三年前から、もう立ち行かなくなっておりました。', 'sad');
    await T('hiiragi', '六十年の歴史も、従業員の暮らしも、すべて手放すしかなかった。……そこへ、あの方が現れたのです。', 'sad');
    await T('hiiragi', '借金はすべて肩代わりする。条件はひとつだけ。', 'closed');
    await T('hiiragi', '――「あの探偵を、予告の夜まで生かしておくな」と。', 'closed');
    await T('me', '……そんな理由で、九条さんを……！', 'angry', { tremble: true });
    await T('hiiragi', '昨夜、九条様は屋上で、トリカブトに目を留められた。……あの方は、全てお見通しだったのかもしれません。', 'sad');
    await T('washio', '夜鴉は誰だ！ 言え、柊！', 'angry');
    await T('hiiragi', '存じません。顔も、名も。……ただ、あの方はいつも、すぐ近くにいる。そう仰っていた。', 'closed');
    await T('hiiragi', '{N}様。', 'smile');
    await T('hiiragi', 'あなたは、立派な探偵でした。……九条様に、お詫びしてまいります。', 'smile');
    G.spot(null);
    await N('柊さんの手の中に、小さな瓶が光った。');
    await M('――待っ……！', 'shock');
    G.bgm(null);
    await G.fadeOut(300);
    SND.se('crash');
    await G.wait(900);
    await G.mono(['柊宗一は、隠し持っていた小瓶の中身を、一息に呷った。', '鷲尾警部が駆け寄った時には、もう――。', '九条さんの仇を、取ったはずだった。\nなのに胸に残ったのは、冷たい、空っぽの穴だけだった。']);
    await heist();
  }

  /* ------------------------------------------------------------------
     午前零時
     ------------------------------------------------------------------ */
  async function heist() {
    G.load('H1', 24, 17, 'up');
    G.cinema(true); G.clearActors();
    G.place('washio', 23, 14, 'down'); G.place('houjou', 25, 14, 'down'); G.place('reika', 27, 15, 'left');
    G.place('hayase', 26, 16, 'up'); G.place('mina', 22, 16, 'right'); G.place('me', 24, 17, 'up');
    G.cam(24, 15); G.snap();
    G.time('23:58');
    await G.fadeIn(1000);
    G.bgm('t_clock');
    await N('23時58分。');
    await T('washio', 'あと二分だ。全員、宝玉から目を離すな！', 'serious');
    await T('houjou', '……九条先生。', 'sad');
    await T('hayase', '……{N}さん。顔色が悪いですよ。', 'think');
    await T('me', '……大丈夫です。', 'closed');
    G.spot(null);
    G.time('00:00');
    SND.se('strike');
    await N('ロビーの大時計が、零時を打ち始めた。');
    G.bgm(null);
    G.scene('black');
    SND.se('glitch');
    await N('――闇。');
    await N('一斉に、全ての照明が落ちた。');
    await T('washio', '停電だと!? 予備電源はどうした！', 'angry');
    SND.se('whoosh');
    await N('羽音。ガラスの擦れる、かすかな音。');
    await T('reika', 'きゃあっ！', 'shock');
    f().stolen = true;
    G.remove('hayase');
    await G.wait(600);
    SND.se('crash');
    G.cam(24, 14);
    G.scene(null);
    await G.wait(700);
    SND.se('sting'); G.shake(6, 700, true);
    await N('灯りが戻った時――');
    await N('ガラスケースの中は、空っぽだった。');
    G.bgm('tension');
    await T('houjou', '『緋月』が……！ 『緋月』がない……！！', 'shock');
    await T('washio', '馬鹿な……！ 誰も動いてねえはずだ！', 'angry');
    await N('空のケースの中には、黒い羽根と、一枚のカードが残されていた。');
    await N('『予告通り、緋月は頂戴した。――怪盗 夜鴉』');
    await T('mina', 'あ、あの……！ 早瀬様が、いません……！', 'shock');
    G.spot(null);
    await M('（早瀬さん……？）', 'think');
    G.flashback(true);
    await X('kujo', '宝玉から目を離すな。……特に、鑑定士の手元からだ。', 'serious');
    G.flashback(false);
    await M('――――っ！', 'shock');
    await M('屋上……！', 'serious');
    await G.fadeOut(500);
    await rooftop();
  }

  async function rooftop() {
    G.load('HR', 12, 9, 'up');
    G.cinema(true); G.clearActors();
    G.place('me', 12, 9, 'up');
    G.cam(12, 6); G.snap();
    G.time('00:04');
    G.rain(0);
    await G.fadeIn(500);
    G.bgm('t_title');
    await N('屋上庭園。風が、強い。');
    G.scene('moon');
    await G.wait(1600);
    await N('赤い月を背に、黒い外套の人影が、手すりの上に立っていた。');
    await X('yogarasu', 'やあ、代理探偵くん。思ったより早かったね。', 'smile');
    await M('その声……早瀬さん……！', 'shock');
    await X('yogarasu', '“早瀬透”は、二年前に作った名前さ。鑑定士の資格も、経歴も、全部ね。', 'smile');
    await X('yogarasu', '本物の『緋月』は、18時半の鑑定の時にもう頂いていた。君の目の前で、ね。', 'smile');
    await M('……っ！', 'shock');
    await X('yogarasu', 'さっき闇の中で消したのは、ただのガラス玉だよ。……良い演出だったろう？', 'smile');
    await M('柊さんを使って……九条さんを殺させたんですね！', 'angry');
    await X('yogarasu', '名探偵は厄介だからね。昨夜、彼は僕の“指”を見ていた。……あれは鑑定士の指じゃない、と気づいていたかもしれない。', 'serious');
    await X('yogarasu', '支配人は、よく働いてくれたよ。最後まで、ね。', 'smile');
    await M('許さない……！ 絶対に、許さない！！', 'angry', { tremble: true });
    await X('yogarasu', 'いい目だ。……そうだね、名乗っておこうか。君は、僕を少しだけ楽しませてくれたから。', 'smile');
    SND.se('whoosh');
    await N('人影は、仮面に手をかけた。');
    G.flash('#ff2040', 300);
    f().revealed = true;
    await X('yogarasu_face', '鴉城 零（あじろ れい）。……それが、僕の名前だ。', 'smile');
    await N('月明かりに晒されたのは――白い髪と、血のように赤い瞳。');
    await X('yogarasu_face', '次に会う時は、君が本物の探偵になっているといいね。', 'smile');
    await X('yogarasu_face', '――さよなら、{N}くん。', 'smile');
    SND.se('whoosh'); G.shake(4, 600);
    await N('外套が翻り、人影は、夜の底へと身を投げた。');
    await M('待って――！！', 'shock');
    await N('手すりに駆け寄った時、そこにはもう、何もなかった。');
    await N('無数の黒い羽根が、赤い月の下を舞っているだけだった。');
    G.scene(null);
    await G.fadeOut(1600);
    G.bgm(null);
    await epilogue();
  }

  /* ------------------------------------------------------------------
     終章 喪失
     ------------------------------------------------------------------ */
  async function epilogue() {
    STATE.chapter = 5;
    G.storm(false);
    await G.chapter('終章', '喪失', '');
    G.load('O1', 7, 8, 'up');
    G.cinema(true); G.clearActors();
    G.cam(7, 5); G.snap();
    G.scene('funeral');
    G.rain(0.25);
    G.bgm('t_sad');
    await G.fadeIn(1500);
    await N('三日後。九条玲司の葬儀は、冷たい雨の中で行われた。');
    await N('参列者は少なかった。黒鷺館の人たちも、電脳展の人たちも、遠くから花を送ってくれた。');
    await X('washio', '……夜鴉――鴉城零。国際手配した。', 'closed');
    await X('washio', 'だが、奴の足取りはどこにもねえ。早瀬透なんて人間は、最初からいなかった。', 'closed');
    await M('…………。', 'closed');
    await X('washio', '{N}。九条は、お前のことを「自慢の相棒だ」と言ってた。', 'sad');
    await X('washio', 'あいつが他人を褒めるのを聞いたのは、あれが最初で、最後だ。', 'sad');
    await M('……九条さんは、そういうこと、本人には絶対言わないんです。', 'sad', { tremble: true });
    await N('雨は、夜になっても止まなかった。');
    G.scene(null);
    await G.fadeOut(1400);
    G.rain(0);
    G.place('me', 7, 8, 'up');
    G.cam(null); G.cinema(false);
    f().office = true;
    await G.fadeIn(1400);
    await N('九条探偵事務所。');
    await N('主のいない部屋は、こんなにも広かっただろうか。');
  }
  async function lastDesk() {
    if (f().deskDone) return;
    f().deskDone = true;
    G.cinema(true);
    await N('九条さんの机。読みかけの推理小説が、あの日のまま伏せてある。');
    await N('角砂糖の瓶。電脳展のあとに撮った写真。');
    await N('写真の中の九条さんは、やっぱり、笑っていなかった。');
    await M('……九条さん。', 'sad');
    await M('私、探偵なんかじゃなかった。犯人を見つけても……九条さんは、帰ってこない。', 'sad', { tremble: true });
    await M('怪盗も、宝玉も……全部、持っていかれちゃいました。', 'sad', { tremble: true });
    await N('答える声は、ない。');
    await N('止まった柱時計の音だけが――いや、もう、その音すらしなかった。');
    await G.fadeOut(2000);
    G.bgm(null);
    await G.mono([
      '私は、事務所の扉に「休業」の札を下げた。',
      '手帳は、白いページのまま。\nあの夜から、私は一行も書けなくなった。',
      '探偵助手 {N} の手記より　FILE.03',
    ]);
    G.scene('plane');
    SND.hum(0.5);
    await G.wait(1200);
    await G.mono(['――一年後。']);
    await G.fadeIn(800);
    await G.wait(2600);
    await N('私は、ある事件に巻き込まれ――海外へ向かう飛行機の中にいた。');
    await N('窓の外、雲の海の上を、一枚の黒い羽根が流れていった気がした。');
    await G.fadeOut(1400);
    G.scene(null); SND.hum(0);
    await G.mono(['FILE.04 へ続く']);
    W.mode = 'blank';
    G.cinema(false);
    await showResult();
  }

  /* ------------------------------------------------------------------
     ヒント
     ------------------------------------------------------------------ */
  async function hint() {
    const c = ch(), fl = f();
    if (c === 0) { await K('事務所を出よう。扉は南だ。', 'think'); return; }
    if (c === 1) {
      const need = [['houjou', '宝条氏（宴会場）'], ['reika', '麗華嬢（宴会場）'], ['hayase', '鑑定士の早瀬さん（宴会場）'], ['washio', '鷲尾警部（警備本部）']].filter(([k]) => !fl['met_' + k]).map(x => x[1]);
      if (need.length) await K(`まだ挨拶していないのは、${need.join('、')}だ。`, 'think');
      else await K('皆に挨拶は済んだ。警備本部の鷲尾警部のところへ行こう。', 'serious');
      return;
    }
    if (c === 3) {
      G.flashback(true);
      const L = [];
      if (!has('t_body') || !has('t_msg') || !has('t_plan') || !fl.coffeeSeen) L.push('まず現場だ。1201号室には、まだ語られていないものがある。遺体、手帳、計画書、テーブルの上。');
      else if (!has('t_test')) L.push('毒がどこにあったか、確かめる術があるはずだ。鑑定士は試薬を持っていると言っていたね。');
      if (!has('t_washio')) L.push('計画書は、誰の手を経て私に届いた？ 届けた本人に聞くといい。');
      if (!has('t_hiiragi')) L.push('計画書を用意した者がいる。支配人室を訪ねてみたまえ。');
      else if (!has('t_print')) L.push('証言は記録で裏を取れ。警備本部のプリンターを調べてみるんだ。');
      if (!has('t_mina')) L.push('封筒はしばらくフロントにあった。フロントの彼女に、封筒のことを聞いてごらん。');
      if (!has('t_reika')) L.push('私が倒れる前に、部屋を訪ねた者がいたかもしれない。十二階の1202号室だ。');
      if (!has('t_pot') || !has('t_gloves')) L.push('毒には出どころがある。昨夜、屋上で見た花を覚えているかい？ 十二階の東の階段から行ける。');
      if (!L.length) L.push('……揃ったようだね。警備本部の鷲尾警部に報告するんだ。');
      await N('目を閉じると、九条さんの声が聞こえる気がした。');
      await X('kujo', L[0], 'think');
      if (L[1]) await X('kujo', L[1], 'think');
      await X('kujo', '……時間は限られている。無駄足は踏むな、{N}くん。', 'serious');
      G.flashback(false);
      return;
    }
    if (c === 5) { await N('九条さんの机が、静かにそこにある。'); return; }
  }

  /* ------------------------------------------------------------------
     移動
     ------------------------------------------------------------------ */
  const notNow = async () => { await N('エレベーター。'); await M('（今は、一階での用事を済ませよう）', 'think'); };
  async function elevUp() { if (ch() !== 3) return notNow(); await G.warp('H12', 2, 10, 'right'); await spend(5); }
  async function elevDown() { if (ch() !== 3) return notNow(); await G.warp('H1', 2, 9, 'right'); await spend(5); }
  async function toRoof() { if (ch() !== 3) return; await G.warp('HR', 2, 11, 'right'); await spend(5); }
  async function fromRoof() { if (ch() !== 3) return; await G.warp('H12', 25, 9, 'left'); await spend(5); }

  /* ------------------------------------------------------------------
     イベント
     ------------------------------------------------------------------ */
  const C3 = () => ch() === 3;
  const EVENTS = {
    O1: [
      { at: [[5, 4], [6, 4]], check: examOfficeDesk, clue: () => ch() === 5 && f().office && !f().deskDone },
      { at: [[6, 8], [7, 8]], when: () => ch() === 0 && f().accepted, step: leaveOffice },
      { at: [[6, 9], [7, 9]], check: async () => { if (ch() === 0 && f().accepted) return leaveOffice(); await N('事務所の扉。'); } },
    ],
    H1: [
      { at: [[2, 10], [3, 10]], solid: () => !C3(), bump: elevUp, step: elevUp, check: elevUp },
      { at: [[24, 13]], sprite: 'jewel', when: () => !f().stolen, check: examPedestal },
      { at: [[24, 13]], sprite: 'emptycase', when: () => f().stolen, check: examPedestal },
      { at: [[11, 13], [12, 13], [13, 13]], check: counterMina },
      { at: [[14, 2], [15, 2]], check: examPrinter, clue: () => C3() && has('t_hiiragi') && !has('t_print') },
      { at: [[23, 2], [24, 2]], check: examKitchen },
    ],
    H12: [
      { at: [[5, 6], [6, 6]], sprite: 'kujo_body', when: () => f().dead && ch() <= 3, check: examBody, clue: () => C3() && !has('t_body') },
      { at: [[4, 6]], sprite: 'notebook', when: () => f().dead && ch() <= 3, check: examNote, clue: () => C3() && !has('t_msg') },
      { at: [[7, 6]], sprite: 'plan', when: () => f().dead && ch() <= 3, check: examPlan, clue: () => C3() && !has('t_plan') },
      { at: [[8, 5]], when: C3, check: examCoffee, clue: () => C3() && !f().coffeeSeen },
      { at: [[23, 8]], when: C3, solid: true, bump: async () => { await N('1203号室。早瀬さんの部屋だ。鍵がかかっている。'); }, check: async () => { await N('1203号室。早瀬さんの部屋だ。鍵がかかっている。'); } },
      { at: [[2, 11], [3, 11]], solid: () => !C3(), bump: elevDown, step: elevDown, check: elevDown },
      { at: [[26, 9], [26, 10]], solid: () => !C3(), bump: async () => { await N('屋上への階段。'); }, step: toRoof },
    ],
    HR: [
      { at: [[1, 11]], step: fromRoof },
      { at: [[9, 6]], sprite: 'pot', check: examPot, clue: () => C3() && !has('t_pot') },
      { at: [[20, 3]], sprite: 'toolbox', check: examGloves, clue: () => C3() && !has('t_gloves') },
    ],
  };

  const TALK = {
    kujo: async () => hint(),
    houjou: talkHoujou, reika: talkReika, hayase: talkHayase, mina: talkMina, hiiragi: talkHiiragi, washio: talkWashio,
  };

  function onResume() {
    W.storm = false;
    SND.rain(0); SND.hum(0);
    const c = STATE.chapter;
    SND.bgm(c === 3 ? 't_clock' : c === 5 ? 't_sad' : 't_explore');
  }

  return {
    npcs, objective, FLAVOR, flavor, EVENTS, talk: id => (TALK[id] ? TALK[id]() : Promise.resolve()),
    prologue, hint, onResume, hintFromMenu: true, initState,
    investigate, finale,
    hintMenu: () => STATE && STATE.chapter >= 2 ? '九条の言葉を思い出す（ヒント）' : null,
    hideTrust: () => STATE && STATE.chapter >= 2,
    focusLabel: '決意',
    nbName: '手帳',
    start: { map: 'O1', x: 7, y: 7, dir: 'up' },
    people: () => {
      const c = STATE.chapter;
      if (c === 0) return ['kujo', 'houjou', 'yogarasu'];
      const L = ['kujo', 'houjou', 'reika', 'hayase', 'hiiragi', 'mina', 'washio', 'yogarasu'];
      return L;
    },
    evidenceIds: () => T_EVIDENCE_ORDER,
    result() {
      const fo = STATE.focus || 0, fin = STATE.flags.finalTm || DEAD, rem = Math.max(0, DEAD - fin);
      const score = Math.round(fo * 0.6 + Math.min(40, rem));
      const [rank, title] = score >= 90 ? ['S', '九条玲司の後継者'] : score >= 72 ? ['A', '代理探偵'] : score >= 50 ? ['B', '探偵助手'] : ['C', '涙の代理探偵'];
      return {
        label: '代理探偵としての記録', rank, title,
        stats: `告発を始めた時刻　${fmt(fin)}<br>最後の決意　${fo} / 100<br>集めた証拠・証言　${STATE.evidence.length} / ${T_EVIDENCE_ORDER.length}`,
        credits: `<h2>怪盗夜鴉と緋月の宝玉</h2><p style="color:#e88a8a">― 探偵助手の手記 FILE.03 ―</p>
          <h4>探偵</h4><p>九条 玲司</p><h4>代理探偵</h4><p>${esc(STATE.name)}</p>
          <h4>ホテル・アストレアの人々</h4><p>宝条 銀二郎</p><p>宝条 麗華</p><p>柊 宗一</p><p>藍沢 ミナ</p><p>鷲尾 剛</p>
          <h4>怪盗</h4><p>夜鴉 ― 鴉城 零</p>
          <h4>シナリオ・プログラム・グラフィック・音楽</h4><p>すべてブラウザ上で生成</p>
          <h4>Special Thanks</h4><p>最後まで遊んでくれたあなた</p><div class="end">FILE.04 へ続く</div>`,
        bgm: 't_sad',
      };
    },
  };
})();
