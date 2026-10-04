'use strict';
/* =========================================================
   STORY_TRAIN : 復活の狼煙 ― シナリオ
   ========================================================= */
const STORY_TRAIN = (() => {
  const f = () => STATE.flags;
  const ch = () => STATE.chapter;
  const has = id => STATE.evidence.includes(id);
  const M = (t, e, o) => G.say('me', t, e, o);
  const N = (t, o) => G.narr(t, o);
  const X = (w, t, e, o) => G.say(w, t, e, o);
  const touch = () => document.body.classList.contains('touch');

  const PHASE_A = ['r_klaus', 'r_ida', 'r_case', 'r_gas', 'r_otto', 'r_brake', 'r_milo', 'r_glove'];
  const PHASE_B = ['r_anne', 'r_franz', 'r_mirror', 'r_trunk', 'r_violin'];
  const cA = () => PHASE_A.filter(has).length;
  const cB = () => PHASE_B.filter(has).length;

  /* ------------------------------------------------------------------ */
  function initState(S0) {
    S0.map = 'CT'; S0.x = 24; S0.y = 6; S0.dir = 'up';
    S0.follower = 'hanna'; S0.follow = false; S0.time = '';
    S0.party = { me: { hp: 100, max: 100 } };
    S0.items = {};
    S0.evidence = ['z_fifth', 'z_letter'];
    S0.flags.named = true; S0.flags.revealed = true; S0.flags.heartTold = true;
  }

  const TRAIN_NPCS = [
    ['anneliese', 2, 3, 'down'], ['franz', 6, 3, 'down'], ['ida', 10, 3, 'down'],
    ['hanna', 4, 7, 'right'], ['milo', 15, 3, 'down'], ['klaus', 20, 7, 'left'],
    ['otto', 27, 3, 'down'], ['dorothy', 33, 7, 'up'],
  ];
  function npcs(id) {
    const L = [], c = STATE.chapter;
    const add = (i, x, y, d) => L.push({ id: i, x, y, dir: d });
    if (id === 'CT' && c === 0) { add('multigate', 24, 3, 'down'); add('schwarz', 4, 6, 'down'); }
    if (id === 'TR' && (c === 3 || c === 4)) TRAIN_NPCS.forEach(([i, x, y, d]) => add(i, x, y, d));
    return L;
  }

  function objective() {
    const c = ch();
    if (c === 0) return f().tools ? '' : '機械室を訪ねる（時計台・西の部屋）';
    if (c === 1) return 'シエスタの机を調べる';
    if (c === 3) return cA() < PHASE_A.length ? `現場を調べ、話を聞く（${cA()} / ${PHASE_A.length}）` : '';
    if (c === 4) return cB() < PHASE_B.length ? `真相に迫る（${cB()} / ${PHASE_B.length}）` : '';
    return '';
  }

  /* ---------------- 調べる（地形） ---------------- */
  const FLAVOR = {
    // 時計台・部屋
    K: ['大きな柱時計。振り子が、規則正しく時を刻んでいる。'],
    X: ['戸棚。'], G: ['真鍮の天球儀。'], A: ['古い甲冑。'], V: ['空っぽの台座。祭典の夜、ここに聖典が置かれていた。'],
    h: ['椅子。'], B: ['本棚。'], t: ['小さなテーブル。'], S: ['ソファ。'], P: ['観葉植物。'], L: ['ランプ。'],
    Z: ['壁に何か貼ってある。'], w: ['クローゼット。'], d: ['机。'],
    // 列車
    a: ['3号車の座席。背もたれに、白いレースのカバーがかかっている。'],
    b: ['座席。'], p: ['テーブル。'], C: ['棚。'], R: ['ギャレーと客席を仕切るカーテン。'],
    W: ['窓。'],
  };
  async function flavor(c, x, y) {
    const m = W.mapId;
    if (m === 'SR') {
      const L = {
        b: 'シエスタのベッド。枕が三つある。……寝ることへの情熱だけは、本物だった。',
        B: '本棚。推理小説と、紅茶の本と……なぜか、枕の通販カタログ。',
        w: 'クローゼット。いつもの青い服が、同じように何着も並んでいる。',
        S: 'ソファ。シエスタはよくここで、私の膝を勝手に枕にして眠っていた。',
        P: '観葉植物。……枯れかけている。少しだけ、水をやった。',
        L: 'スタンドライト。',
        W: '窓の外は、ロンドンのいつもの曇り空。',
        Z: 'コルクボード。事件の新聞の切り抜きと――私の寝顔の写真。……いつ撮ったの。',
      };
      if (c === 't') {
        if (f().letterRead) { await N('クッキーの缶。賞味期限は、二ヶ月前に切れていた。'); await N('……ひとつだけ、食べた。少し、しょっぱかった。'); }
        else await N('テーブルの上に、クッキーの缶。シエスタの、夜中のおやつだ。');
        return;
      }
      if (L[c]) { await N(L[c]); return; }
    }
    if (m === 'TR') {
      if (c === 'W') { await N('窓の外は、ヴュルツブルク駅のホーム。警官が、列車の周りを見張っている。'); return; }
      if (c === 'b') { await N(x <= 11 ? '寝台。シーツが乱れたままだ。' : '食堂車の座席。赤いビロード張り。'); return; }
      if (c === 'p') { await N(x <= 11 ? '個室の小さなテーブル。水差しとグラスが置いてある。' : '食堂車のテーブル。白いクロスの上に、小さなランプ。'); return; }
      if (c === 'C') { await N(x <= 23 ? 'ギャレーの棚。グラスと食器が、揺れないように固定されている。' : '荷物棚。木箱やスーツケースが積まれている。'); return; }
      if (c === 'K') { await N('荷物用のカート。'); return; }
    }
    if (m === 'CT') {
      if (c === 'Z') { await N('壁に、時計台の古い設計図が貼られている。'); return; }
      if (c === 'W') { await N('窓の外に、ロンドンの街並みが広がっている。'); return; }
    }
    const L = FLAVOR[c]; if (!L) return;
    for (const l of L) await N(l);
  }

  /* ------------------------------------------------------------------
     序章 巫女のお告げ
     ------------------------------------------------------------------ */
  async function prologue() {
    STATE.chapter = 0;
    G.storm(false); G.rain(0); G.hum(0); G.bgm(null);
    await G.mono([
      'シエスタがいなくなって、二ヶ月が過ぎた。',
      '折れた骨は繋がった。歩けるようになり、走れるようにもなった。\n……心のほうは、まだどこも繋がっていない。',
      'それでも私は、あの人の最後の言葉に従うことにした。\n――「巫女を頼って」。',
    ]);
    G.load('CT', 24, 6, 'up');
    G.cinema(true); G.clearActors();
    G.place('multigate', 24, 3, 'down'); G.place('me', 24, 6, 'up');
    G.cam(24, 4.5); G.snap();
    G.bgm('t_sad');
    await G.fadeIn(1200);
    await N('ロンドン、時計台。巫女の控室には、あの祭典の夜と同じ、白い花の匂いがしていた。');
    await X('multigate', '……来ると思っていました、{N}さん。', 'serious');
    await M('マルチルゲートさん。……シエスタが、あなたを頼れって。', 'serious');
    await X('multigate', 'ええ。知っています。あの子が、眠りについたことも。', 'closed');
    await X('multigate', '……ごめんなさい。私の未来視でも、あの雪の日は変えられなかった。', 'sad');
    await M('…………。', 'closed');
    await M('教えてください。私は、何をすればいいんですか。', 'serious');
    await X('multigate', '見えたものを、そのまま伝えます。私の未来視は、いつも断片だから。', 'serious');
    await N('巫女は目を閉じた。白い指先が、聖典の頁の上で、かすかに震える。');
    SND.se('chime'); G.flash('#fff4c8', 300);
    await X('multigate', '――ひとつ。「シエスタの言葉を思い出せ」。', 'serious');
    await X('multigate', 'ふたつ。「電子のお告げが大切」。', 'serious');
    await M('シエスタの言葉……電子の、お告げ？', 'think');
    await X('multigate', '意味までは分かりません。でも、あなたなら辿り着けるはず。', 'smile');
    await G.gain('r_oracle', 'お告げを記録');
    await X('multigate', 'それから――時計台の機械室で、もう一人、あなたを待っている人がいます。', 'smile');
    await M('待っている人？', 'think');
    await X('multigate', '行けば分かります。……いってらっしゃい。', 'smile');
    G.cam(null); G.cinema(false);
    G.clearActors(); G.restore();
    G.bgm('r_explore');
    G.toast(touch()
      ? '<b>移動</b>：十字ボタン　<b>調べる・話す</b>：Aボタン　<b>手帳</b>：Bボタン<br>迷ったら手帳の<b>ヒント</b>を見よう。'
      : '<b>移動</b>：矢印キー / WASD　<b>調べる・話す</b>：Z / Enter　<b>手帳</b>：X / Esc<br>迷ったら手帳の<b>ヒント</b>を見よう。', 7000);
  }

  async function talkMultigate() {
    if (f().tools) { await X('multigate', '「シエスタの言葉を思い出せ」。……答えは、もうあなたの手の中にあるはず。', 'smile'); return; }
    await X('multigate', '機械室は、西の部屋です。……あの人、少し無愛想だけれど。', 'smile');
  }

  async function talkSchwarz() {
    if (f().tools) { await X('schwarz', '……行け。', 'closed'); return; }
    G.cinema(true);
    await X('schwarz', '……来たか。', 'serious');
    await M('シュバルツさん!? どうして、ここに……。', 'shock');
    await X('schwarz', '修理を頼まれていた。……あいつにな。', 'closed');
    SND.se('page');
    await N('作業台の上に、見覚えのある道具が並んでいた。');
    await X('schwarz', 'マスケット銃。銃身を替えた。', 'serious');
    await G.gain('z_musket', '魔法道具を受け取った');
    await X('schwarz', '手鏡。割れていたが、録画の機構は生きている。', 'serious');
    await G.gain('z_mirror', '魔法道具を受け取った');
    await M('（あの雪の日も……ずっと、回ってたんだ）', 'sad');
    await X('schwarz', 'マスターキー。歯が一本欠けていた。', 'serious');
    await G.gain('z_key', '魔法道具を受け取った');
    await X('schwarz', '靴。片方の浮力が落ちていた。今は、両方とも浮く。', 'serious');
    await G.gain('z_shoes', '魔法道具を受け取った');
    await M('……これ、全部、私に？', 'shock');
    await X('schwarz', '修理代は前払いでもらっている。届け先は、お前だと。', 'closed');
    await X('schwarz', 'あいつは言っていた。「助手が来たら、全部渡して。あの子は、きっと使い方を間違えないから」', 'serious');
    await M('……っ。', 'sad', { tremble: true });
    await X('schwarz', '……五つ目は、俺にも直せん。', 'closed');
    await M('分かってます。', 'closed');
    f().tools = true;
    await M('（「シエスタの言葉を思い出せ」……あの人の、言葉）', 'think');
    await G.present('思い出せ――シエスタが残した言葉は？', ['z_letter'], {
      speaker: 'me', noAuto: true, penalty: async () => {}, cut: '思い出した！',
      wrongLines: ['（……違う。これじゃない）', '（もっと前。あの人が「いつか」と言ったもの――）'],
      alt: {
        z_fifth: '（「巫女を頼って」……それは、もう果たした。他に、あの人が残した言葉は――）',
        z_key: '（マスターキー……そう、これでしか開かないものがあった。あの人は、何て言ってた？）',
      },
      hint: '（「いつか、必要になったら開けて」――）',
    });
    await M('「いつか、必要になったら開けて」――あの鉄の箱！ マスターキーでしか開かない、手紙！', 'shock');
    await X('schwarz', '……行け。', 'closed');
    await G.fadeOut(1000);
    G.cinema(false);
    await ch1();
  }

  /* ------------------------------------------------------------------
     第一章 名探偵の手紙
     ------------------------------------------------------------------ */
  async function ch1() {
    STATE.chapter = 1;
    G.bgm(null);
    await G.chapter('第一章', '名探偵の手紙', '― シエスタの部屋 ―');
    G.load('SR', 5, 7, 'up');
    G.cinema(true); G.clearActors();
    G.cam(5.5, 5); G.snap();
    await G.fadeIn(1000);
    G.bgm('t_sad');
    await N('ロンドンの、二人で暮らしていたフラット。');
    await N('シエスタの部屋の扉は、あの日から、ずっと閉じたままだった。');
    SND.se('door');
    await N('マスターキーを差し込むと――かちり、と、拍子抜けするほど軽い音がした。');
    await M('（……ただいま、って言ったら、怒るかな）', 'sad');
    G.cam(null); G.cinema(false);
  }

  async function letter() {
    if (f().letterRead) { await N('空になった鉄の箱。手紙は、手帳に挟んである。'); return; }
    G.cinema(true);
    await N('机の上に、小さな鉄の箱が置かれていた。');
    await N('マスターキーを差し込む。……かちり。');
    SND.se('page');
    G.scene('letter');
    G.bgm('r_letter');
    await N('中には、白い封筒が一通。見慣れた、少し丸い字。\n「助手へ」');
    await X('siesta', 'やあ、助手。元気？', 'smile');
    await M('……元気なわけ、ないでしょ。', 'sad');
    await X('siesta', '――って、言ってるでしょ、今。分かるよ。名探偵だからね。', 'smile');
    await M('…………。', 'sad');
    await X('siesta', 'これを君が読んでるってことは、私はもう、眠りについたってことだね。', 'closed');
    await X('siesta', '先に謝っておく。ごめんね。……あと、ちゃんとご飯食べてる？ 君、放っておくとパンの耳しか食べないから。', 'smile');
    await M('誰のせいだと……思って……。', 'sad', { tremble: true });
    await X('siesta', '心臓のこと。六十年で目を覚ますって言ったよね。あれは嘘じゃない。でも、本当のことを全部は言ってない。', 'serious');
    await X('siesta', '眠っている間も、体は歳をとる。六十年後に目を覚ましても、その時の私は、もうおばあちゃん。', 'closed');
    await X('siesta', '事件も追えない。紅茶も自分で淹れられない。……君に、膝枕もしてあげられない。', 'sad');
    await M('……頼んでないよ、そんなの。', 'sad', { tremble: true });
    await X('siesta', 'きっと、何もできない。', 'closed');
    await N('紙の上に、ぽたりと染みができた。……私の涙だった。');
    await X('siesta', 'でもね、助手。悲しい話は、ここまで。', 'smile');
    await X('siesta', '私には、まだ止まらない心臓がある。世界を調律する《調律者》たちがいる。それから――', 'serious');
    await X('siesta', '君がいる。', 'smile');
    await M('…………っ。', 'sad', { tremble: true });
    await X('siesta', '《夢幻》の調律者を探して。夢を司る人。', 'serious');
    await X('siesta', 'その人に会えれば――きっと、私を夢の中から引っ張り出せると思う。', 'serious');
    await M('《夢幻》の……調律者。', 'think');
    await X('siesta', '……ただ、ごめん。私、その人に会ったことがないんだ。顔も、名前も知らない。', 'sad');
    await X('siesta', 'だから、そこは巫女のお告げ頼みになっちゃうけど……。', 'closed');
    await X('siesta', '大丈夫。君なら見つけられる。だって君は、名探偵の助手だから。', 'smile');
    await X('siesta', 'じゃあね、助手。――またね。', 'smile');
    await N('最後の一行の下に、小さな追伸があった。');
    await X('siesta', '追伸。私の部屋のクッキー、食べていいよ。賞味期限は、たぶん切れてるけど。', 'smile');
    await M('……最後まで、ほんとに……あなたって人は……。', 'sad', { tremble: true });
    await N('手紙を胸に抱いて、私はしばらく、声を殺して泣いた。');
    f().letterRead = true;
    G.toast('手帳の<b>シエスタの手紙</b>が更新された。', 3500);
    await M('……《夢幻》の調律者。', 'serious');
    await M('見つけるよ、シエスタ。絶対に。', 'serious');
    G.scene(null);
    await G.wait(600);
    await ch2();
  }

  /* ------------------------------------------------------------------
     第二章 電子のお告げ
     ------------------------------------------------------------------ */
  async function ch2() {
    STATE.chapter = 2;
    G.bgm(null);
    SND.se('chime'); await G.wait(500); SND.se('chime');
    await N('――ポケットの中で、携帯電話が鳴った。');
    await N('画面には、「九条探偵事務所」。日本の事務所の電話を、ずっとこの携帯に転送したままだった。');
    await M('……はい。九条探偵事務所です。', 'think');
    await X('klaus', '（電話）もしもし……英語で、失礼します。こちらは、ドイツ鉄道の夜行列車《ノルトシュテルン号》の車掌、クラウス・ヴェーバーと申します。', 'serious');
    await X('klaus', '（電話）昨夜、列車の中で事件が起きました。……死人は出ていません。けが人もいません。', 'serious');
    await X('klaus', '（電話）ですが、1号車の乗客が全員、夜中に眠らされ――ある女性の、宝石が消えたのです。', 'sad');
    await M('（……今は、それどころじゃない。《夢幻》の調律者を探さないと）', 'closed');
    await M('すみません。今は、ちょっと……。', 'sad');
    await X('klaus', '（電話）……そう、ですか。いえ、無理を言いました。', 'sad');
    await X('klaus', '（電話）ただ……数年前、白い髪の探偵さんが、この列車の事件を解決してくださったことがありまして。', 'think');
    await M('え……？', 'shock');
    await X('klaus', '（電話）別れ際に、この番号を教えてくださったんです。「困ったら、ここに電話して。私の助手が、なんとかしてくれるから」と。', 'smile');
    SND.se('sting');
    await M('（シエスタ……！）', 'shock');
    await G.gain('r_call', '証言を記録');
    await M('（電話。電子の――）', 'think');
    await G.present('……待って。この電話は、もしかして――', ['r_oracle'], {
      speaker: 'me', noAuto: true, penalty: async () => {}, cut: 'ひらめいた！',
      wrongLines: ['（……違う。もっと、最近聞いた言葉）', '（時計台で、巫女が言っていた――）'],
      alt: { z_letter: '（手紙……それも大事。でも、「電話」に繋がる言葉が、もう一つあったはず）' },
      hint: '（「電子のお告げが大切」……）',
    });
    await M('「電子のお告げが大切」――。', 'serious');
    await M('（電話は、電子の声。もしこれが、巫女の言っていたお告げなら……）', 'think');
    await M('（この事件の先に、《夢幻》の調律者へ続く道が、あるのかもしれない）', 'serious');
    await M('……クラウスさん。行きます。今から、そちらへ。', 'serious');
    await X('klaus', '（電話）本当ですか!? ありがとうございます……！ 列車は、ヴュルツブルク駅に足止めされています。', 'smile');
    await G.fadeOut(1200);
    G.cinema(false);
    await travel();
  }

  async function travel() {
    STATE.chapter = 3;
    await G.mono(['翌朝。ロンドンから、フランクフルトへ。', 'そこから鉄道で一時間。\n――私は、二ヶ月ぶりに「事件」へ向かっていた。']);
    await G.chapter('第三章', 'ノルトシュテルン号', '― ヴュルツブルク駅・停車中 ―');
    G.cinema(true); G.clearActors();
    G.scene('station');
    G.time('09:10');
    G.bgm('r_explore');
    await G.fadeIn(1000);
    await N('ドイツ、ヴュルツブルク駅。四両編成の古い夜行列車が、ホームの端で静かに煙を吐いていた。');
    await X('klaus', 'ようこそ……！ あなたが、あの探偵さんの助手さんですね。', 'smile');
    await M('{N}です。……あの、探偵本人は、今――', 'sad');
    await X('klaus', 'ええ、ええ。来られない事情がおありなのでしょう。それでも、来てくださった。', 'smile');
    await N('白い髭の車掌さんは、帽子をとって深々と頭を下げた。');
    G.scene(null);
    await G.fadeOut(600);
    await boardTrain();
  }

  async function boardTrain() {
    W.trainStill = true;
    G.load('TR', 18, 5, 'up');
    G.cinema(true); G.clearActors();
    G.place('me', 18, 5, 'up'); G.place('hanna', 18, 3, 'down'); G.place('klaus', 20, 5, 'left'); G.place('milo', 15, 3, 'down');
    G.cam(18, 4); G.snap();
    G.hum(0.15);
    await G.fadeIn(800);
    await N('2号車・食堂車。');
    await X('hanna', 'ドイツ連邦警察、鉄道警察隊のハンナ・ケラー。……あなたが、車掌の呼んだ「日本の探偵」？', 'serious');
    await M('探偵の、助手です。', 'serious');
    await X('hanna', '助手？ 探偵本人は？', 'think');
    await M('……今は、眠っています。', 'closed');
    await X('hanna', 'は？ ……冗談でしょう。', 'angry');
    await X('klaus', 'ケラー巡査、どうか。この方は、あの探偵さんの助手なのです。', 'serious');
    await X('hanna', '…………はあ。いいわ。どうせ、こっちも手詰まりだもの。', 'closed');
    await X('hanna', '状況を説明する。被害者はイーダ・ブラウン。1号車・個室Cの乗客で、宝石商の運び屋。', 'serious');
    await X('hanna', '昨夜、鍵つきのケースから、ダイヤが七粒消えた。死人もけが人もなし。ただ――', 'serious');
    await X('hanna', '1号車の乗客は全員、【夜中の記憶が途切れてる】。気がついたら朝だった、って。', 'think');
    await X('hanna', '列車は【14時】に出発させる。それまでに何も出なければ、乗客は全員解放。ダイヤは闇の中。……いいわね？', 'serious');
    await M('はい。', 'serious');
    await M('（シエスタ。……見てて）', 'serious');
    G.cam(null); G.cinema(false);
    G.clearActors(); G.restore();
    G.toast('<b>捜査開始</b>：乗客・乗務員から話を聞き、現場を調べよう。<br>1号車＝寝台車（西）／2号車＝食堂車／3号車＝座席車／4号車＝荷物車（東）', 7000);
  }

  /* ------------------------------------------------------------------
     第三章 捜査（前半）
     ------------------------------------------------------------------ */
  async function talkHanna() {
    if (ch() === 3) {
      if (cA() < 3) { await X('hanna', 'まずは被害者と、車掌の話。それから現場。……時間はないわよ。', 'serious'); return; }
      await X('hanna', '甘い匂い、ねえ。ガスでも撒いたっていうの？ 映画じゃあるまいし。', 'think');
      return;
    }
    if (ch() === 4) {
      if (!has('r_trunk')) { await X('hanna', '4号車？ 鍵がないなら、開けようがないでしょう。……え、開けられる？ 何それ。', 'shock'); return; }
      await X('hanna', 'それで？ 犯人の目星は、ついたの？', 'serious');
      return;
    }
    await X('hanna', '……ふん。', 'closed');
  }

  async function talkKlaus() {
    if (ch() === 3 && !has('r_klaus')) {
      await X('klaus', '昨夜のことですね。何でもお話しします。', 'serious');
      await X('klaus', '1時30分、突然、非常ブレーキがかかりました。私は先頭の乗務員室から、ブレーキのある3号車へ向かったのです。', 'serious');
      await X('klaus', '途中、1号車の三つの個室をノックしましたが……どなたも、返事をなさいませんでした。', 'think');
      await M('三つとも、ですか？', 'think');
      await X('klaus', 'ええ。夜中ですから、お休みなのだろうと。……今思えば、あの時にはもう、皆さん眠らされていたのですね。', 'sad');
      await X('klaus', 'それと、もう一つ。【4号車・荷物車の鍵が、昨夜から見当たらない】のです。いつも乗務員室に掛けてあるのですが……。', 'think');
      await G.gain('r_klaus', '証言を記録');
      await X('klaus', 'そういえば、3号車のお客様は、オットーさんお一人のはずなのですが……。', 'think');
      await X('klaus', 'あの女の子は……ええと、切符は確か……。……おや？ 確かに、拝見したような……。', 'think');
      await M('（……？）', 'think');
      await checkA();
      return;
    }
    if (ch() === 4) { await X('klaus', 'あの白い髪の探偵さんも、こうやって列車の中を歩き回っておられました。……懐かしい。', 'smile'); return; }
    await X('klaus', '4号車の鍵……いったい、どこへ消えたのでしょう。', 'think');
  }

  async function talkIda() {
    if (ch() === 3 && !has('r_ida')) {
      await X('ida', '……日本の探偵さん？ お願い、ダイヤを取り戻して。あれがなかったら、私、もうこの仕事を続けられない。', 'sad');
      await X('ida', 'ダイヤは七粒。アントワープの《ブラウシュタイン商会》から、ハンブルクの顧客に届けるはずだった。', 'serious');
      await X('ida', 'ケースには鍵をかけて、その鍵は【首から下げて】寝ていたの。', 'serious');
      await X('ida', '1時20分ごろだったと思う。【甘い匂い】がして……それきり。気がついたら朝で、ケースは開いていて、ダイヤだけがなかった。', 'sad');
      await X('ida', '鍵は……【ちゃんと首に戻ってた】。気味が悪いでしょう？', 'shock');
      await X('ida', 'それと……眠っている間、変な夢を見たの。', 'think');
      await X('ida', 'ウサギのぬいぐるみを抱いた女の子が、枕元で言うのよ。「もう少し、寝てていいよ」って。', 'think');
      await G.gain('r_ida', '証言を記録');
      await checkA();
      return;
    }
    if (ch() === 4) { await X('ida', 'ブラウシュタイン商会は、昔から恨まれやすい会社なの。……強引な買い付けで有名だったから。', 'sad'); return; }
    await X('ida', '……あの夢の女の子、どこかで見た気がするのよね。', 'think');
  }

  async function examCase() {
    if (has('r_case')) { await N('イーダさんのケース。中のビロードに、七つのくぼみ。'); return; }
    if (ch() !== 3) return;
    await N('個室Cの、宝石用の小さなケース。蓋が開いたままになっている。');
    await N('鍵穴の周りに、こじ開けたような傷はない。……正規の鍵で開けられている。');
    await N('中のビロードには、小さなくぼみが七つ。そのどれもが、空っぽだった。');
    await M('（首から下げていた鍵を、眠っている間に使われた……。犯人は、イーダさんの個室に入ってる）', 'think');
    await G.gain('r_case', '証拠品を入手');
    await checkA();
  }

  async function examVent() {
    if (has('r_gas')) { await N('1号車の通気口。ボンベは、もう取り外してある。'); return; }
    if (!has('r_ida') && !has('r_otto')) { await N('天井近くの通気口。1号車の空気は、ここから流れてくるらしい。'); return; }
    await N('天井近くの通気口。1号車の空気は、ここから廊下と個室に流れていく。');
    await M('（「甘い匂い」……。1号車の全員が、同時に眠らされた。だったら、匂いの出どころは――）', 'think');
    await M('（でも、天井が高すぎて手が届かない）', 'think');
    const r = await G.choose(['浮遊の靴を使う', 'やめておく']);
    if (r !== 0) return;
    SND.se('shield'); G.flash('#cfe8ff', 250);
    await N('シエスタの靴を履いて、床を軽く蹴る。体が、ふわりと浮き上がった。');
    await M('（……シエスタ。借りるね）', 'serious');
    await N('通気口の格子の奥に、手のひらほどの小さなボンベが押し込まれていた。');
    await N('医療用の、吸入麻酔ガス。キッチンタイマーが巻きつけてあり、針は【1時20分】で止まっている。');
    SND.se('sting');
    await M('（時限式……！ 犯人は、このガスで1号車ごと眠らせたんだ）', 'shock');
    await G.gain('r_gas', '証拠品を入手');
    await checkA();
  }

  async function talkOtto() {
    if (ch() === 3 && !has('r_otto')) {
      await X('otto', '探偵？ ふん、日本の若いのか。……まあいい、座れ。', 'serious');
      await X('otto', 'ブレーキを引いたのは、【わしだ】。', 'angry');
      await M('えっ。', 'shock');
      await X('otto', '1時半ごろ、前の車両から、甘ったるい匂いが流れてきおった。四十年、炭鉱でガス漏れを見てきたわしには分かる。あれは危ない匂いじゃ。', 'serious');
      await X('otto', 'だから引いた。文句があるなら言ってみい。', 'angry');
      await X('otto', 'それから、デッキの窓を開けて外を見とった。火でも出とらんかとな。', 'think');
      await X('otto', 'そしたら、【誰かがわしの後ろを通って、4号車に入っていった】。鍵を開けとったから、てっきり車掌だと思ったんじゃが……。', 'think');
      await M('（クラウスさんは、「4号車の鍵が見当たらない」って……）', 'shock');
      await G.gain('r_otto', '証言を記録');
      await X('otto', 'そういや、あの後ろの嬢ちゃんは一晩中起きとったぞ。わしがブレーキを引いた時も、「もう少し寝かせてあげればいいのに」なんて言いおった。', 'think');
      await checkA();
      return;
    }
    await X('otto', '孫が、ハンブルクで待っとるんじゃ。……早く出してくれんかのう。', 'sad');
  }

  async function examBrake() {
    if (has('r_brake')) { await N('非常ブレーキのレバー。記録では、作動は1時30分。'); return; }
    if (ch() !== 3) return;
    await N('3号車の後方。赤い非常ブレーキのレバーが、下まで引き下ろされたままになっている。');
    await N('横の記録装置に、作動時刻が残っていた。【1時30分】。');
    await M('（ガスが出たのが1時20分。その十分後に、ブレーキ……）', 'think');
    await G.gain('r_brake', '証拠品を入手');
    await checkA();
  }

  async function talkMilo() {
    if (ch() === 3 && !has('r_milo')) {
      await X('milo', '給仕のミロです。昨夜のことなら、覚えている限りお話しします。', 'serious');
      await X('milo', '最後のお客様は、1号車のフランツ様でした。0時55分に、お部屋へ戻られました。', 'serious');
      await X('milo', 'その時、【ワインレッドのスカーフ】を巻いておられて。……それと、「夜中に誰か、ここを通るのかな」と聞かれました。', 'think');
      await M('夜中に、誰かが通るか……？', 'think');
      await X('milo', 'それから、1時32分。列車が止まったあと、ギャレーから顔を出したら――', 'shock');
      await X('milo', '【口元を黒いマスクで覆った人影】が、1号車のほうから後ろへ、早足で通り過ぎていきました。', 'shock');
      await X('milo', '暗くて、顔は見えませんでした。でも首に、【ワインレッドのスカーフ】が見えたんです。', 'serious');
      await G.gain('r_milo', '証言を記録');
      await checkA();
      return;
    }
    if (ch() >= 3 && f().dorothyKnown && !f().miloDoro) {
      f().miloDoro = true;
      await X('milo', '3号車の女の子、ですか？ ……いえ、食堂車には一度もいらしていません。夕食も、朝食も。', 'think');
      await X('milo', 'あれ？ そういえば、ご乗車の時もお見かけしなかったような……。', 'think');
      return;
    }
    await X('milo', 'コーヒーでもいかがですか？ ……お代はけっこうです。', 'smile');
  }

  async function examTrash() {
    if (has('r_glove')) { await N('食堂車のくず入れ。'); return; }
    if (ch() !== 3) return;
    await N('食堂車の隅の、くず入れ。紙ナプキンの奥に、何か白いものが押し込まれている。');
    await N('薄い白手袋だ。鼻を近づけると……かすかに、甘い匂いがした。');
    await N('指先に、琥珀色の細かい粉がついている。');
    await M('（これ……松脂だ。ヴァイオリンの弓に塗る、ロジン）', 'think');
    await G.gain('r_glove', '証拠品を入手');
    await checkA();
  }

  async function talkAnne() {
    if (ch() === 3) { await X('anneliese', 'ごめんなさい……まだ、頭がぼんやりするの。少しだけ、休ませて。', 'sad'); return; }
    if (ch() === 4 && !has('r_anne')) {
      await X('anneliese', '……日本の探偵さん？ アンネリーゼ・フォーゲルよ。', 'serious');
      await M('食堂車のくず入れに、ロジンのついた手袋が捨てられていました。', 'serious');
      await X('anneliese', 'ロジン？ 私のケースにも入っているけれど……私、演奏の時に手袋なんてしないわ。弦の感触が分からなくなるもの。', 'think');
      await X('anneliese', 'この子に触れていいのは、私と――フランツだけ。', 'smile');
      await M('フランツさん？', 'think');
      await X('anneliese', '私のマネージャー。昔は、【ヴァイオリン職人】だったの。腕のいい職人だったけれど、工房が潰れてしまって……。', 'sad');
      await X('anneliese', 'それからずっと、私の楽器の面倒を見てくれてる。この子の音は、半分は彼が作ったようなものよ。', 'smile');
      await X('anneliese', '昨夜は1時ごろ眠って……甘い匂いのあとは、何も覚えていないわ。', 'closed');
      await G.gain('r_anne', '証言を記録');
      await checkB();
      return;
    }
    await X('anneliese', 'この子は《モルゲンシュテルン》。明けの明星って意味よ。二百年前に作られたの。', 'smile');
  }

  async function talkFranz() {
    if (ch() === 3) { await X('franz', 'アンネリーゼは疲れています。話なら、後にしてもらえますか。', 'serious'); return; }
    if (ch() === 4 && !has('r_franz')) {
      await X('franz', 'フランツ・ベルガー。アンネリーゼのマネージャーです。……探偵さん、でしたか。', 'smile');
      await M('昨夜のことを、聞かせてください。', 'serious');
      await X('franz', '0時55分に食堂車を出て、【1時には、この個室で眠っていました】。', 'serious');
      await X('franz', 'あのガスで、私も朝まで目が覚めませんでした。いやはや、恐ろしい。', 'sad');
      await M('食堂車で、ワインレッドのスカーフを巻いていたそうですね。', 'serious');
      await X('franz', 'スカーフ？ ああ……部屋に置いて寝ましたよ。それが何か？', 'smile');
      await N('棚の上の鞄に、フランツさんはさりげなく自分のコートをかけた。');
      await N('――胸ポケットの中で、シエスタの手鏡が、こつんと鳴った気がした。');
      await G.gain('r_franz', '証言を記録');
      await checkB();
      return;
    }
    await X('franz', '14時には、列車が出るのでしょう？ ……それまで、お付き合いしますよ。', 'smile');
  }

  /* ---------------- ドロシー（伏線） ---------------- */
  async function talkDorothy() {
    const n = f().doroTalk || 0; f().doroTalk = n + 1;
    if (n === 0) {
      await X('dorothy', '……ん。こんにちは、{N}。', 'smile');
      await M('こんにちは。……え？ どうして、私の名前を？', 'shock');
      await X('dorothy', 'ん？ ……さっき、車掌さんが呼んでたでしょ？', 'think');
      await M('（……クラウスさんは、私のことを「助手さん」としか呼んでない）', 'think');
      await X('dorothy', 'わたしはドロシー。この子はハーゼ。ウサギのハーゼ。', 'smile');
      f().dorothyKnown = true;
      return;
    }
    if (n === 1) {
      await X('dorothy', 'ゆうべ？ ずっと起きてたよ。わたし、夜は眠らないの。', 'smile');
      await X('dorothy', 'みんなの夢を見るのに、忙しいから。', 'smile');
      await M('（……眠らないのに、夢を見る？）', 'think');
      return;
    }
    if (n === 2) {
      await X('dorothy', '1号車のひとたち、いい夢見てたよ。甘い匂いの、ふかふかの夢。', 'smile');
      await X('dorothy', '……ひとりだけ、【真っ黒な夢】のひとがいたけど。', 'serious');
      await M('真っ黒な夢……？', 'think');
      await X('dorothy', 'ふふ。ただの夢の話。', 'smile');
      return;
    }
    if (n === 3) {
      await X('dorothy', 'ねえ。白い髪の女の子がね、すごく、すごく深いところで眠ってる夢を、ときどき見るの。', 'closed');
      await X('dorothy', '……ずっと、誰かを待ってる夢。', 'sad');
      await M('――え？', 'shock');
      await X('dorothy', 'すう……。', 'closed');
      await M('（……寝た？ いや、寝たふり……？）', 'think');
      return;
    }
    await X('dorothy', 'すう……すう……。', 'closed');
    await N('ウサギのぬいぐるみが、こちらを見ている気がした。');
  }

  async function checkA() {
    if (ch() !== 3 || cA() < PHASE_A.length) return;
    G.cinema(true);
    G.time('11:40');
    await M('（……整理しよう）', 'serious');
    await M('（1時20分、通気口の時限式ガスで、1号車の全員が眠らされた）', 'think');
    await M('（犯人はイーダさんの鍵でケースを開け、ダイヤを奪った。そして鍵を首に戻した）', 'think');
    await M('（1時30分、匂いに気づいたオットーさんがブレーキを引いた。……これは犯人にとって、予想外だったはず）', 'think');
    await M('（1時32分、マスクの人影が後ろへ。消えた鍵で、4号車へ）', 'think');
    await M('（それから――ロジンのついた手袋）', 'serious');
    await M('（ロジン……ヴァイオリン。1号車・個室Aの乗客は、ヴァイオリニストだった）', 'serious');
    await G.fadeOut(800);
    STATE.chapter = 4;
    await G.chapter('第四章', '魂の柱', '― 残り、二時間二十分 ―');
    G.cinema(true);
    await G.fadeIn(800);
    await X('hanna', 'アンネリーゼ・フォーゲルに話を聞く？ ……世界的なヴァイオリニストよ。下手なことを言えば、国際問題になる。', 'serious');
    await M('分かってます。でも、聞かなきゃいけない。', 'serious');
    await X('hanna', '…………。好きにしなさい。', 'closed');
    G.cinema(false);
    G.checkpoint('phaseB');
    G.toast('<b>第四章</b>：1号車の乗客と、閉ざされた4号車を調べよう。', 5000);
  }

  async function phaseB() {
    STATE.chapter = 4; STATE.follow = false; W.trainStill = true;
    G.cinema(false); G.cam(null);
    G.clearActors(); G.restore();
    G.bgm('r_explore'); G.hum(0.15);
    await G.fadeIn(500);
  }

  /* ------------------------------------------------------------------
     第四章 魂の柱
     ------------------------------------------------------------------ */
  async function mirrorReplay() {
    G.cinema(true);
    await M('（フランツさんが、鞄を隠した……？）', 'think');
    await M('（シエスタは言っていた。「この手鏡は、ずっと録画が回ってるカメラみたいなもの」）', 'think');
    await N('手鏡を取り出し、縁を、シエスタがやっていたように三回なぞる。');
    SND.se('glitch');
    G.flashback(true);
    G.clearActors();
    G.place('me', 6, 4, 'up'); G.place('franz', 6, 3, 'down');
    G.cam(6, 3.5); G.snap();
    await N('――鏡の中で、さっきの会話が繰り返される。');
    await X('franz', '……1時には、この個室で眠っていました。', 'smile');
    await N('フランツさんの肩越し。コートをかけられる直前の、棚の上の鞄。');
    await N('その口から、【S字に曲がった細い金属の棒】が覗いていた。');
    G.flashback(false);
    G.clearActors(); G.restore();
    G.place('me', 2, 4, 'up');
    G.cam(null);
    await M('（なんだろう、これ。……楽器の道具？）', 'think');
    await N('私は手鏡を持って、アンネリーゼさんの個室を訪ねた。');
    await X('anneliese', 'これ……【魂柱立て】よ。', 'shock');
    await X('anneliese', 'ヴァイオリンの中にはね、表板と裏板を支える小さな木の柱が立っているの。“魂柱”っていうのよ。', 'serious');
    await X('anneliese', 'それを、f字孔から入れて動かすための道具。【職人しか使わない】わ。演奏家は、まず持ち歩かない。', 'think');
    await X('anneliese', 'フランツ、まだこんなものを持ち歩いていたのね……。', 'sad');
    await G.gain('r_mirror', '記録を入手');
    G.cinema(false);
  }

  async function car4Door() {
    if (f().car4) return;
    if (ch() === 3) {
      await N('4号車・荷物車への扉。鍵がかかっている。');
      if (has('r_klaus')) await M('（クラウスさんの鍵は、昨夜から消えたまま……。今は、他の手がかりを先に集めよう）', 'think');
      return;
    }
    if (ch() !== 4) return;
    await N('4号車・荷物車への扉。鍵がかかっている。');
    await M('（オットーさんが見た人影は、ここに入っていった。消えた鍵を使って）', 'think');
    const r = await G.choose(['マスターキーを使う', 'やめておく']);
    if (r !== 0) return;
    SND.se('door');
    await N('鍵穴にマスターキーを差し込む。……かちり。');
    await M('（この世の扉の八割は開く、だっけ。……本当に、便利）', 'smile');
    f().car4 = true;
    G.toast('<b>4号車</b>に入れるようになった。', 2500);
  }

  async function examTrunk() {
    if (has('r_trunk')) { await N('フランツのトランク。中身は、ハンナさんに見せてある。'); return; }
    await N('荷物車の奥。革のトランクに、名札が下がっている。「F. Berger」。');
    await M('（フランツさんの荷物……）', 'think');
    const r = await G.choose(['マスターキーで開ける', 'やめておく']);
    if (r !== 0) return;
    SND.se('door');
    await N('トランクの中には、着替えと楽譜。その下に――');
    SND.se('sting'); G.shake(3, 400);
    await N('【黒い防毒マスク】。それから、ボンベ二本用の箱。……【一本ぶんが、空になっている】。');
    await N('箱の隅に、真鍮の鍵が一本。札には「Wagen 4」――【4号車の鍵】。');
    await M('（クラウスさんの、消えた鍵……！）', 'shock');
    await G.gain('r_trunk', '証拠品を入手');
    await checkB();
  }

  async function examViolin() {
    if (has('r_violin')) { await N('アンネリーゼさんの《モルゲンシュテルン》。f字孔の奥に、黒い包みが見える。'); return; }
    if (ch() !== 4 || !has('r_mirror')) { await N('ヴァイオリンケース。中には、飴色に光るヴァイオリンが収められている。'); return; }
    await M('（魂柱を動かす道具。……職人が、昨夜、それを使ったとしたら）', 'think');
    await M('アンネリーゼさん。そのヴァイオリンの中を、見せてもらえませんか。', 'serious');
    await X('anneliese', 'この子の、中を……？', 'shock');
    await X('anneliese', '…………いいわ。でも、絶対に傷つけないで。', 'serious');
    await N('ランプの光を手鏡で受けて、f字孔の奥へ。');
    await N('細い光の筋が、楽器の内側を照らし出す。');
    await X('anneliese', '……魂柱が、ずれてる。昨日のリハーサルの時は、こんなじゃなかったわ。', 'shock');
    SND.se('sting');
    await N('その陰に――黒い布の小さな包みが、松脂で貼りつけられていた。');
    await M('（……あった）', 'shock');
    await M('（でも、今ここで取り出したら、犯人は「アンネリーゼさんが自分で隠した」と言い逃れるかもしれない）', 'think');
    await M('（これは、最後の一手に取っておこう）', 'serious');
    await G.gain('r_violin', '証拠品を入手');
    await checkB();
  }

  async function checkB() {
    if (ch() !== 4) return;
    if (has('r_anne') && has('r_franz') && !has('r_mirror')) await mirrorReplay();
    if (cB() < PHASE_B.length) return;
    G.cinema(true);
    G.time('13:10');
    await M('（――繋がった）', 'serious');
    await M('（シエスタ。……今の私でも、届くかな）', 'closed');
    await N('時計の針は、13時10分。出発まで、あと五十分。');
    await M('ハンナさん。関係者を、食堂車に集めてください。', 'serious');
    await X('hanna', '……本気？', 'think');
    await M('はい。', 'serious');
    G.cinema(false);
    await finale();
  }

  /* ------------------------------------------------------------------
     第五章 終着駅の推理
     ------------------------------------------------------------------ */
  function diningSetup() {
    G.clearActors();
    G.place('anneliese', 14, 3, 'down'); G.place('franz', 16, 3, 'down'); G.place('ida', 18, 3, 'down');
    G.place('otto', 20, 3, 'down'); G.place('milo', 22, 3, 'down');
    G.place('klaus', 14, 5, 'up'); G.place('hanna', 16, 5, 'up'); G.place('me', 18, 5, 'up'); G.place('dorothy', 22, 5, 'up');
    G.cam(18, 4); G.snap();
  }
  async function T(who, text, e, o) { G.spot(who); return G.say(who, text, e, o); }
  const penalty = async () => {
    G.focus(-15);
    if (STATE.focus <= 0) await G.gameOver('BAD END', '時間切れ', '言葉は空回りし、ハンナは首を振った。\n14時、ノルトシュテルン号は乗客を乗せたまま、ヴュルツブルク駅を出ていった。\n七粒のダイヤも――「電子のお告げ」の意味も、霧の向こうに消えた。');
  };
  const WRONG = ['……それが、何の証明になるの？', '探偵ごっこなら、よそでやってくれる？', '落ち着いて。手帳を、よく見なさい。'];
  const P = (prompt, ids, o = {}) => G.present(prompt, ids, Object.assign({ penalty, noAuto: true, speaker: 'hanna', wrongLines: WRONG }, o));

  async function finale() {
    STATE.chapter = 5; STATE.follow = false; W.trainStill = true;
    STATE.focus = 100;
    G.bgm(null);
    await G.fadeOut(900);
    if (!f().finaleSeen) { f().finaleSeen = true; await G.chapter('第五章', '終着駅の推理', '― 出発まで、あと五十分 ―'); }
    G.load('TR', 18, 5, 'up');
    G.cinema(true);
    diningSetup();
    G.time('13:10');
    G.checkpoint('finale');
    G.bgm('tension');
    await G.fadeIn(900);
    await N('2号車・食堂車。乗客と乗務員が、全員集められた。');
    await T('otto', 'なんじゃ、こんな狭いところに集めおって。', 'angry');
    await T('hanna', '日本の探偵助手が、何か言いたいそうよ。……五十分だけ、付き合ってあげて。', 'serious');
    await T('me', '昨夜、この列車で起きたことを、順番に説明します。', 'serious');
    await N('手帳を開く。――九条さんの隣で。シエスタの隣で。何度も、こうしてきた。');
    await N('隣には、誰もいない。……それでも。');
    G.bgm('deduction');
    G.toast('<b>第五章</b>：証拠を間違えると<b>集中</b>が減ります。0になると<b>敗北</b>です。', 6500);
    G.refresh(); $('hud').classList.remove('hidden'); setTimeout(G.refresh, 4000);

    await T('franz', '眠らされた、という話でしたね。……ただの、車内の空調の故障では？', 'smile');
    await P('1号車の全員を眠らせたものは？', ['r_gas'], { hint: '甘い匂いの出どころ。天井の近く。', alt: { r_ida: '甘い匂いがした、のは分かったわ。その匂いの“出どころ”は？', r_otto: '匂いがしたのは分かった。で、どこから？' } });
    await T('me', '1号車の通気口に、時限式のガスボンベが仕掛けられていました。タイマーは、1時20分。', 'serious');
    await T('hanna', '……本当に、ガスだったの。', 'shock');
    await T('me', 'ガスは通気口から廊下と個室に流れ、1号車の全員を眠らせた。犯人は、イーダさんの首の鍵でケースを開け、ダイヤを奪いました。', 'serious');
    await T('ida', '……っ。', 'sad');
    await T('hanna', 'じゃあ、1時30分の非常ブレーキは？ 犯人が逃げるために、列車を止めたんじゃないの？', 'think');
    await P('非常ブレーキを引いたのは、誰？', ['r_otto'], { hint: '「わしだ」と言った人がいたはず。', alt: { r_brake: 'それは、ブレーキが“引かれた”証拠。“誰が”引いたのか、は？' } });
    await T('otto', '……わしじゃ。甘い匂いがしたから、ガス漏れだと思ってな。', 'serious');
    await T('me', 'ブレーキは、犯人の計画にはなかった。でも、そのおかげで、目撃者が生まれたんです。', 'serious');
    await T('me', 'ブレーキのあと、オットーさんの後ろを、誰かが通って4号車に入っていった。', 'serious');
    await T('hanna', '4号車？ あそこは鍵が――', 'think');
    await P('犯人が、施錠された4号車に入れた理由は？', ['r_klaus'], { hint: '車掌さんが、乗務員室から“なくしたもの”。', alt: { r_trunk: 'その鍵が“どこで見つかったか”は、まだ早い。まずは、鍵が“消えていた”ことを。' } });
    await T('klaus', '……私の鍵。昨夜から、見当たらなかった。', 'shock');
    await T('me', '犯人は、事前にクラウスさんの鍵を盗んでいた。ガスで1号車を眠らせ、ダイヤを奪い、マスクとボンベを4号車に隠しに行った。', 'serious');
    await G.timeline([
      { t: '00:55', text: '食堂車を\n出る', cls: 'key' },
      { t: '01:20', text: 'ガス\n（1号車）', cls: 'bad' },
      { t: '01:30', text: '非常\nブレーキ' },
      { t: '01:32', text: 'マスクの\n人影', cls: 'key' },
      { t: '02:00', text: '盗難\n発覚' },
    ], ['01:20', '01:32', 'ダイヤを奪う'], ['00:50', '02:05']);
    await T('hanna', '……で？ そのマスクの人影は、誰なの。', 'serious');
    G.spot(null);
    await M('（答えは、もう手帳の中にある）', 'serious');
    const who = await G.pickPerson('昨夜、1号車を眠らせ、ダイヤを奪ったのは？', ['anneliese', 'franz', 'klaus', 'milo', 'otto', 'ida', 'dorothy']);
    if (who !== 'franz') {
      const nm = shortName(who);
      await T('me', `……${nm}さん、です。`, 'serious');
      if (who === 'dorothy') {
        await T('dorothy', 'ふふ。はずれ。', 'smile');
        await T('dorothy', 'わたしは、ずっと夢を見てただけ。……ざんねん、{N}。', 'closed');
      } else await T('hanna', '…………根拠は？', 'angry');
      SND.se('wrong');
      await G.gameOver('BAD END', '誤った告発', `${nm}が取り調べを受けている間に、14時の発車ベルが鳴った。\n本当の犯人は、何食わぬ顔で列車に揺られ――\n七粒のダイヤは、国境の向こうへ消えた。`);
    }
    await G.cutin('犯人は――', null, 1100);
    G.spot('franz'); SND.se('sting'); G.shake(5, 600, true);
    await T('me', 'フランツ・ベルガーさん。……あなたです。', 'serious');
    await T('anneliese', '……フランツ？', 'shock');
    await T('franz', '……ははは。何を言い出すかと思えば。', 'smile');

    G.checkpoint('debate');
    await debate();
  }

  async function debate() {
    if (STATE.chapter !== 5) STATE.chapter = 5;
    W.trainStill = true;
    if (W.mapId !== 'TR') G.load('TR', 18, 5, 'up');
    G.cinema(true);
    diningSetup();
    if (STATE.focus === undefined || STATE.focus <= 0) STATE.focus = 100;
    await G.fadeIn(300);
    await G.debate({
      enemy: 'franz', name: 'フランツ・ベルガー', short: 'フランツ',
      intro: '論戦開始！ フランツの“心の防壁”を崩せ！',
      partyName: '{N}', hpName: '集中', hintLabel: '手帳を見返す', hintHelp: '手帳を見返して、手がかりを探す。', hintSpeaker: 'me',
      bgm: 'deduction', wrongDmg: 20,
      loseText: '言葉が続かなかった。\nフランツは穏やかに微笑んで席に戻り――14時、列車は何事もなかったように走り出した。',
      rounds: [
        { claim: '私は1時には個室で眠っていた！ 皆と同じように、ガスでね！', correct: ['r_milo'],
          alt: { r_franz: '（それは彼自身の言葉。それを崩す“誰か”の目撃は？）', r_otto: '（オットーさんは、人影の顔も服も見ていない。“特徴”を見た人は？）' },
          hint: '（1時32分。ギャレーから顔を出した人がいた）', counter: '見間違いだろう！',
          after: async () => {
            await M('1時32分。列車が止まった直後、ミロさんが見ています。口元をマスクで覆った人影が、1号車から後ろへ向かうのを。', 'serious');
            await X('milo', 'は、はい。首に……ワインレッドのスカーフが。夕食の時、フランツ様が巻いておられたのと、同じ色でした。', 'shock');
          } },
        { claim: 'スカーフなど、どこにでもある！ それに、その手袋のロジン――あれはヴァイオリニストのもの、アンネリーゼのものだろう！', correct: ['r_mirror'],
          alt: { r_anne: '（アンネリーゼさんは手袋をしない。……じゃあ、あの手袋で“楽器に触った”のは？）', r_glove: '（ロジンは、楽器に触れた手につく。楽器に触れていいのは、二人だけ――）' },
          hint: '（シエスタの手鏡は、ずっと回っていた）', counter: '彼女を疑うのが筋だ！',
          after: async () => {
            await M('シエスタの手鏡には、録画機能があります。あなたの個室で話を聞いた時、鞄の中に、これが映っていました。', 'serious');
            await M('魂柱立て。ヴァイオリン職人しか使わない道具です。', 'serious');
            await X('anneliese', '……フランツ。あなた、昔の道具はもう全部捨てたって……。', 'shock');
          } },
        { claim: '私が職人だったから、何だというんだ！ 私がガスを使った証拠が、どこにある！', correct: ['r_trunk'],
          alt: { r_gas: '（ガス缶はある。それと“対になるもの”の持ち主は？）', r_klaus: '（消えた鍵――それが、いま“どこにあるか”）' },
          hint: '（4号車。名札のついた、革のトランク）', counter: '言いがかりだ！',
          after: async () => {
            await M('4号車の、あなたのトランクの中。防毒マスクと、ボンベ二本用の箱――一本ぶんが空でした。', 'serious');
            await M('それから、クラウスさんの、消えた4号車の鍵も。', 'serious');
            await X('klaus', '……私の鍵が、なぜ、あなたの荷物に。', 'shock');
          } },
        { claim: 'ではダイヤはどこだ！ 私の体でも荷物でも、好きなだけ調べるがいい！ 出てくるものか！', correct: ['r_violin'], cut: 'これが答えだ！',
          alt: { r_case: '（ケースは空。ダイヤは今、国境を越えても誰も中を開けない場所に――）' },
          hint: '（魂柱立て。f字孔。……“魂”の陰）', counter: '馬鹿馬鹿しい！',
          after: async () => {
            await M('ええ、あなたの荷物からは出てきません。', 'serious');
            await M('ダイヤは――アンネリーゼさんのヴァイオリン、《モルゲンシュテルン》の中です。', 'serious');
            await M('魂柱の陰に、松脂で貼りつけて。手袋のロジンは、その時についたものです。', 'serious');
            await X('franz', '…………っ。', 'shock');
          } },
      ],
    });
    f().solved = true;
    await afterDebate();
  }

  async function afterDebate() {
    G.bgm('truth');
    G.spot('anneliese');
    await N('アンネリーゼさんは、黙って弦を緩め、f字孔に細い針金を差し入れた。');
    await N('ころん、と。黒い布の包みが、テーブルの上に落ちた。');
    SND.se('ice');
    await N('包みを開くと――七粒のダイヤが、窓からの光を受けて、星のように瞬いた。');
    await T('ida', '……私の、ダイヤ……！', 'shock');
    await T('anneliese', '……フランツ。あなたが、教えてくれたのよ。', 'sad');
    await T('anneliese', '「この子の中には、魂柱という“魂”が立っている。だから、大事にしなさい」って。', 'sad');
    await T('franz', '…………。', 'closed');
    await T('franz', '二十年前。ブラウシュタイン商会は、私の工房の土地を、借金のかたに買い叩いた。', 'sad');
    await T('franz', '父の代から続いた工房だった。……七粒のダイヤくらい、返してもらっても、罰は当たらないと思った。', 'sad');
    await T('franz', '国境を越える時、名器の中を開ける税関吏はいない。……世界でいちばん安全な金庫だと、思ったんだがね。', 'closed');
    await T('franz', 'まさか、魂柱の位置まで見抜かれるとは。', 'smile');
    await T('hanna', 'フランツ・ベルガー。窃盗と傷害の容疑で、身柄を拘束します。', 'serious');
    SND.se('gavel');
    await N('ハンナさんが、静かに手錠をかけた。');
    await T('anneliese', '……待っているわ、フランツ。この子の調整は、あなたにしか頼めないもの。', 'sad');
    await T('franz', '……ああ。', 'closed');
    G.spot(null);
    await G.fadeOut(1400);
    await epilogue();
  }

  /* ------------------------------------------------------------------
     終章 夢幻
     ------------------------------------------------------------------ */
  async function epilogue() {
    STATE.chapter = 6; W.trainStill = false;
    G.hum(0);
    await G.chapter('終章', '夢幻', '');
    G.cinema(true); G.clearActors();
    G.scene('station');
    G.time('14:00');
    G.bgm('r_ending');
    await G.fadeIn(1500);
    await N('14時。ヴュルツブルク駅のホームに、発車のベルが鳴り響いた。');
    await X('hanna', '……正直、探偵なんて胡散臭い人種だと思ってた。', 'closed');
    await X('hanna', '訂正するわ。少なくとも、あなたの探偵は、いい助手を持ってる。', 'smile');
    await M('……ありがとうございます。', 'smile');
    await X('klaus', '助手さん。あの白い髪の探偵さんに、よろしくお伝えください。', 'smile');
    await M('…………。', 'closed');
    await M('はい。必ず。……今は眠ってますけど、必ず、起こしますから。', 'smile');
    await N('ノルトシュテルン号は、白い煙を空に残して、北へ走り去っていった。');
    await N('まるで、狼煙のように。');
    await N('ホームに残ったのは、私と――');
    await X('dorothy', 'おつかれさま。いい推理だったね、探偵助手さん。', 'smile');
    await M('ドロシー……？ あなた、列車に乗らなかったの？', 'shock');
    await X('dorothy', 'うん。わたし、最初から、あの列車に用はなかったから。', 'smile');
    await X('dorothy', '用があったのは――あなた。', 'serious');
    await M('え……。', 'shock');
    await X('dorothy', 'ねえ、{N}。どうして、わたしがあなたの名前を知ってたと思う？', 'smile');
    await X('dorothy', '……白い髪の女の子の夢の中で、何度も、何度も聞いたから。', 'closed');
    SND.se('sting');
    await M('――――っ!!', 'shock');
    G.scene('dream');
    G.bgm('r_dream');
    f().dorothyKnown = true; f().dorothyRevealed = true;
    await X('dorothy', 'わたしはドロシー。《夢幻》の調律者。', 'serious');
    await X('dorothy', 'ひとの夢を、渡り歩く者。', 'smile');
    await M('（《夢幻》の、調律者……！ シエスタの手紙の――）', 'shock');
    await X('dorothy', 'ゆうべは、1号車のみんなの夢を少しだけ覗いたの。ごめんね、癖なの。', 'smile');
    await X('dorothy', 'ひとりだけ真っ黒な夢のひとがいたから、気になって残ってたんだ。……そしたら、あなたが来た。', 'smile');
    await M('（イーダさんの夢の中の、ウサギを抱いた女の子。名簿にない乗客。一晩中、眠らなかった少女――）', 'think');
    await M('（全部、この子だった）', 'serious');
    await X('dorothy', 'あの子はね、すごく深いところで眠ってる。……ずっと、ずっと、誰かを待ってる夢。', 'sad');
    await M('シエスタを……シエスタを、起こせるの!?', 'shock', { tremble: true });
    await X('dorothy', 'たぶん、ね。', 'smile');
    await X('dorothy', 'でも、今日はだめ。', 'serious');
    await M('どうして……！', 'angry');
    await X('dorothy', '夢の扉を開けるには、準備がいるの。それに――', 'serious');
    await X('dorothy', 'あの子の夢に入るってことは、あの子の“いちばん深いところ”に触れるってこと。あなたに、その覚悟があるのか、まだ分からない。', 'serious');
    await M('…………。', 'closed');
    await X('dorothy', 'だから、また会いにいくね。', 'smile');
    await X('dorothy', '今度は――あなたの夢の中で。', 'smile');
    SND.se('whoosh'); G.flash('#e8d8ff', 600);
    await N('瞬きをした、その一瞬で。');
    G.scene('station');
    await N('少女の姿は、ホームのどこにもなかった。');
    await N('足元に、白いウサギの毛が一本だけ、ふわりと落ちていた。');
    await M('（「電子のお告げが大切」）', 'think');
    await M('（あの電話がなかったら、私はここに来なかった。……マルチルゲートさんの未来視は、正しかった）', 'serious');
    await M('（そして、シエスタ。あなたは、何年も前に、もうこの番号を渡してたんだね）', 'smile');
    await M('……待ってて、シエスタ。', 'serious');
    G.scene(null);
    await G.fadeOut(1600);
    G.bgm(null);
    await G.mono([
      'あの雪の日から止まっていた私の時間が、もう一度、動き出した。',
      'これは、名探偵を取り戻すための――\n狼煙だ。',
      '探偵助手 {N} の手記より　FILE.07',
    ]);
    await G.mono(['FILE.08 へ続く']);
    W.mode = 'blank';
    G.cinema(false);
    await showResult();
  }

  /* ------------------------------------------------------------------
     ヒント
     ------------------------------------------------------------------ */
  async function hint() {
    const c = ch();
    if (c === 0) { await M(f().tools ? '（シエスタの言葉……）' : '（マルチルゲートさんは、機械室で誰かが待ってるって言ってた。時計台の、西の部屋だ）', 'think'); return; }
    if (c === 1) { await M('（シエスタの机。……部屋の左側だ）', 'think'); return; }
    if (c === 3) {
      const L = [];
      if (!has('r_ida')) L.push('被害者のイーダさん（1号車・個室C）');
      if (!has('r_case')) L.push('イーダさんのケース（個室C）');
      if (!has('r_klaus')) L.push('車掌のクラウスさん（食堂車）');
      if (!has('r_milo')) L.push('給仕のミロさん（食堂車のギャレー）');
      if (!has('r_glove')) L.push('食堂車のくず入れ');
      if (!has('r_otto')) L.push('3号車のおじいさん');
      if (!has('r_brake')) L.push('3号車の非常ブレーキ');
      if (!has('r_gas')) L.push(has('r_ida') || has('r_otto') ? '甘い匂いの出どころ（1号車の廊下、天井の通気口）' : '……「匂い」について、誰かが何か知っているかも');
      await M(`（まだ調べていないのは――${L.slice(0, 3).join('、')}）`, 'think');
      return;
    }
    if (c === 4) {
      const L = [];
      if (!has('r_anne')) L.push('ヴァイオリニストのアンネリーゼさん（1号車・個室A）');
      if (!has('r_franz')) L.push('マネージャーのフランツさん（1号車・個室B）');
      if (!has('r_trunk')) L.push(f().car4 ? '4号車の奥のトランク' : '4号車の扉（マスターキーなら開くかも）');
      if (has('r_mirror') && !has('r_violin')) L.push('アンネリーゼさんのヴァイオリン（手鏡で中を照らせば……）');
      await M(L.length ? `（次は――${L.slice(0, 2).join('、')}）` : '（……揃った）', 'think');
      return;
    }
    await M('（落ち着いて。手帳の中に、答えはある）', 'serious');
  }

  /* ------------------------------------------------------------------
     イベント
     ------------------------------------------------------------------ */
  const INV = () => ch() === 3 || ch() === 4;
  const EVENTS = {
    SR: [
      { at: [[1, 6], [2, 6]], check: letter, clue: () => ch() === 1 && !f().letterRead },
    ],
    TR: [
      { at: [[3, 4]], sprite: 'violin', solid: true, when: INV, check: examViolin, clue: () => ch() === 4 && has('r_mirror') && !has('r_violin') },
      { at: [[9, 4]], sprite: 'acase', solid: true, when: INV, check: examCase, clue: () => ch() === 3 && !has('r_case') },
      { at: [[8, 5]], sprite: 'vent', when: INV, check: examVent, clue: () => ch() === 3 && !has('r_gas') && (has('r_ida') || has('r_otto')) },
      { at: [[22, 3]], sprite: 'trash', solid: true, when: INV, check: examTrash, clue: () => ch() === 3 && !has('r_glove') },
      { at: [[35, 2]], sprite: 'brake', solid: true, when: INV, check: examBrake, clue: () => ch() === 3 && !has('r_brake') },
      { at: [[36, 6], [36, 7]], solid: () => !f().car4, bump: car4Door, check: car4Door, clue: () => ch() === 4 && !f().car4 },
      { at: [[42, 6]], sprite: 'metalcase', solid: true, when: () => ch() === 4, check: examTrunk, clue: () => ch() === 4 && !has('r_trunk') },
    ],
  };

  const TALK = {
    multigate: talkMultigate, schwarz: talkSchwarz,
    hanna: talkHanna, klaus: talkKlaus, ida: talkIda, otto: talkOtto, milo: talkMilo,
    anneliese: talkAnne, franz: talkFranz, dorothy: talkDorothy,
  };

  function onResume() {
    W.storm = false;
    W.trainStill = STATE.chapter >= 3 && STATE.chapter <= 5;
    SND.rain(0);
    SND.hum(W.trainStill ? 0.15 : 0);
    SND.bgm(STATE.chapter >= 6 ? 'r_ending' : STATE.chapter === 1 ? 't_sad' : 'r_explore');
  }

  return {
    npcs, objective, FLAVOR, flavor, EVENTS, talk: id => (TALK[id] ? TALK[id]() : Promise.resolve()),
    prologue, hint, onResume, hintFromMenu: true, initState,
    phaseB, finale, debate,
    hintMenu: () => '手帳を見返す（ヒント）',
    hideTrust: () => true,
    focusLabel: '集中',
    nbName: '手帳',
    start: { map: 'CT', x: 24, y: 6, dir: 'up' },
    people: () => {
      const c = STATE.chapter;
      const L = ['siesta', 'multigate', 'schwarz'];
      if (c >= 2) L.push('klaus');
      if (c >= 3) L.push('hanna', 'ida', 'anneliese', 'franz', 'milo', 'otto', 'dorothy');
      return L;
    },
    evidenceIds: () => R_EVIDENCE_ORDER,
    result() {
      const fo = STATE.focus || 0;
      const n = STATE.evidence.length, all = R_EVIDENCE_ORDER.length;
      const talks = Math.min(4, f().doroTalk || 0);
      const score = Math.round(fo * 0.8 + talks * 5);
      const [rank, title] = score >= 90 ? ['S', '夢を渡る助手'] : score >= 72 ? ['A', '名探偵の助手'] : score >= 50 ? ['B', 'ひとりきりの助手'] : ['C', '助手（休職中）'];
      return {
        label: '探偵助手としての評価', rank, title,
        stats: `最終集中力　${fo} / 100<br>ドロシーとの会話　${talks} / 4<br>集めた証拠・記録　${n} / ${all}`,
        credits: `<h2>復活の狼煙</h2><p style="color:#c8a8ff">― 探偵助手の手記 FILE.07 ―</p>
          <h4>探偵助手</h4><p>${esc(STATE.name)}</p>
          <h4>《巫女》</h4><p>マルチルゲート</p><h4>《技工士》</h4><p>シュバルツ</p>
          <h4>ノルトシュテルン号の人々</h4><p>クラウス・ヴェーバー</p><p>ハンナ・ケラー</p><p>イーダ・ブラウン</p><p>アンネリーゼ・フォーゲル</p><p>フランツ・ベルガー</p><p>ミロ・ハーン</p><p>オットー・シュミット</p>
          <h4>《夢幻》の調律者</h4><p>ドロシー</p>
          <h4>眠れる《名探偵》</h4><p>シエスタ</p>
          <h4>シナリオ・プログラム・グラフィック・音楽</h4><p>すべてブラウザ上で生成</p>
          <h4>Special Thanks</h4><p>最後まで遊んでくれたあなた</p><div class="end">FILE.08 へ続く</div>`,
        bgm: 'r_ending',
      };
    },
  };
})();
