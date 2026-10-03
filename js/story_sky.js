'use strict';
/* =========================================================
   STORY_SKY : 空の名探偵 ― シナリオ
   ========================================================= */
const STORY_SKY = (() => {
  const f = () => STATE.flags;
  const ch = () => STATE.chapter;
  const has = id => STATE.evidence.includes(id);
  const S = (t, e, o) => G.say('siesta', t, e, o);
  const M = (t, e, o) => G.say('me', t, e, o);
  const N = (t, o) => G.narr(t, o);
  const X = (w, t, e, o) => G.say(w, t, e, o);
  const touch = () => document.body.classList.contains('touch');

  const SCENE1 = ['s_body', 's_lock', 's_ca', 's_hikawa'];
  const ASK = ['s_nanase', 's_kuroda', 's_metal', 's_sheet', 's_medbag'];
  const c1 = () => SCENE1.filter(has).length;
  const c2 = () => ASK.filter(has).length;

  /* ------------------------------------------------------------------ */
  function initState(S0) {
    S0.map = 'PL'; S0.x = 29; S0.y = 4; S0.dir = 'down';
    S0.follower = 'siesta'; S0.follow = false; S0.time = '21:30';
    S0.party = { me: { hp: 90, max: 90 }, siesta: { hp: 100, max: 100 } };
    S0.items = { water: 2, ammo: 0 };
    S0.evidence = [];
  }

  const PAX = [['pax1', 8, 3], ['pax2', 10, 8], ['pax3', 14, 8], ['pax4', 20, 6], ['pax5', 32, 8]];
  function npcs(id) {
    const L = [], c = STATE.chapter;
    const add = (i, x, y, d) => L.push({ id: i, x, y, dir: d });
    if (id !== 'PL') return L;
    if (c >= 1 && c <= 2) {
      PAX.forEach(([i, x, y]) => add(i, x, y, 'right'));
      add('kuroda', 26, 3, 'right'); add('nanase', 12, 5, 'right');
      add('ca', 4, 5, 'down');
      if (c === 1) add('hikawa', 5, 9, 'up'); else add('hikawa', 16, 5, 'right');
    }
    return L;
  }

  function objective() {
    const c = ch();
    if (c === 1) return c1() < 4 ? `化粧室Bの現場を調べる（${c1()} / 4）` : '';
    if (c === 2) return c2() < 5 ? `乗客から話を聞き、手がかりを集める（${c2()} / 5）` : '';
    return '';
  }

  const FLAVOR = {
    a: ['エコノミークラスの座席。乗客の多くは、毛布にくるまって眠っている。'],
    b: ['ビジネスクラスのシート。フルフラットになるらしい。'],
    p: ['サイドテーブル。小さな読書灯が灯っている。'],
    C: ['ギャレーの収納。機内食のトレーがぎっしり詰まっている。'],
    I: ['オーブン。ほんのりと、パンの焼ける匂いがする。'],
    K: ['カート。飲み物とスナックが載っている。'],
    T: ['便器。……特に変わったところはない。'],
    S: ['洗面台。'],
    R: ['クラスを仕切るカーテン。'],
    W: ['小さな窓。外は真っ暗だ。高度一万メートル――どこにも逃げ場はない。'],
    X: ['コックピットの扉。暗証番号式のロックがかかっている。'],
  };
  async function flavor(c, x, y) {
    if (c === 'S' && x === 1 && y === 3) { await N('化粧室Aの洗面台。今は使用禁止になっている。'); return; }
    if (c === 'b' && x === 29 && y === 5) {
      await N('私の座席。足元に、例の銀色のアタッシュケースが置いてある。');
      if (!f().caseOpen) await M('（結局、中身は何なんだろう……ダイヤル錠、四桁か）', 'think');
      return;
    }
    if (c === 'b' && x === 29 && y === 6) { await N('シエスタの座席。毛布がきっちり畳まれ、その上に紅茶の空き缶が三本並んでいる。'); await M('（いつの間に三本も……）', 'sad'); return; }
    if (c === 'W' && ch() >= 1) { await N('窓の外は、星も見えない闇。高度一万メートル――犯人も、私たちも、どこにも逃げられない。'); return; }
    const L = FLAVOR[c]; if (!L) return;
    for (const l of L) await N(l);
  }

  /* ------------------------------------------------------------------
     序章
     ------------------------------------------------------------------ */
  async function prologue() {
    STATE.chapter = 0; STATE.time = '19:40';
    G.storm(false); G.rain(0); G.hum(0); G.bgm(null);
    await G.mono([
      '九条さんがいなくなって、一年が過ぎた。',
      '事務所は閉めたまま。手帳は白いまま。\n私はもう、探偵助手ではなかった。',
      '――あの日、あの空港で、あのケースを押しつけられるまでは。',
    ]);
    G.load('PL', 29, 4, 'down');
    G.cinema(true); G.clearActors();
    G.scene('airport');
    await G.fadeIn(1200);
    G.bgm('s_explore');
    await N('羽田空港、国際線ターミナル。');
    await N('行き先はロンドン。九条さんが、いつか行ってみたいと言っていた街だ。\n……理由なんて、それくらいしかなかった。');
    await N('搭乗口へ向かう途中、黒いサングラスの男が、すっと私の前に立った。');
    await N('「これを、持っていてくれ」');
    SND.se('page');
    await N('押しつけられたのは、銀色のアタッシュケース。');
    await M('え？ ちょっと――', 'shock');
    await N('「中身は見るな。必要な時が来れば、分かる」');
    await N('男はそれだけ言うと、人混みの中へ消えていった。');
    await M('……え、ええ!? これ、どうしろっていうの!?', 'shock');
    await G.gain('s_case', '持ち物');
    await M('（警察に届けるべき……だよね。でも、もう搭乗時刻だし……）', 'think');
    await N('なぜだか、そのケースを手放す気にはなれなかった。');
    G.scene(null);
    await G.fadeOut(900);
    await seatScene();
  }

  async function seatScene() {
    G.load('PL', 29, 5, 'down');
    G.cinema(true); G.clearActors();
    PAX.forEach(([i, x, y]) => G.place(i, x, y, 'right'));
    G.place('kuroda', 26, 3, 'right'); G.place('nanase', 12, 5, 'right'); G.place('hikawa', 16, 5, 'right');
    G.place('me', 29, 5, 'down'); G.place('siesta', 29, 6, 'right');
    G.cam(29, 5.5); G.snap();
    G.time('21:30');
    G.hum(0.45);
    await G.fadeIn(1200);
    await N('21時30分。ロンドン行き AS-201便。');
    await N('ポイントを全部使って取った、分不相応なビジネスクラスの席。');
    await N('右隣の席では、白い髪の少女が眠っていた。');
    await M('（……きれいな子。人形みたい）', 'think');
    await X('siesta', '……すう……。', 'closed');
    SND.se('whoosh'); G.shake(2, 400);
    await N('機体が小さく揺れた拍子に、少女の頭が、こてん、と私の肩に乗った。');
    await M('（えっ）', 'shock');
    await X('siesta', '……ん。', 'closed');
    await X('siesta', '……この枕、ちょっと硬い。', 'closed');
    await M('枕じゃないです！！', 'angry');
    await X('siesta', '……おはよう。', 'smile');
    await M('お、おはようございます……？ いや、今、夜ですけど。', 'sad');
    await X('siesta', '寝て起きたら朝。それが私のルール。', 'smile');
    await M('（変な子だ……）', 'think');
    await X('siesta', 'ねえ。紅茶、もらってきてくれる？ ミルクは多めで、砂糖は二つ。', 'smile');
    await M('なんで私が!? 客室乗務員さんを呼べばいいでしょ！', 'shock');
    await X('siesta', 'だって君、そういうの得意そうな顔してる。', 'smile');
    await M('どういう顔!?', 'angry');
    await X('siesta', '誰かの世話を焼くのに慣れてる顔。……違った？', 'think');
    await M('…………。', 'closed');
    await N('一瞬、言葉に詰まった。');
    await X('siesta', '――それと。そのケース、大事にしてね。', 'smile');
    await M('え？', 'shock');
    await X('siesta', 'なんでもない。おやすみ。', 'closed');
    await M('ちょっと!? 今の何!? ねえ！', 'shock');
    await X('siesta', '……すう……。', 'closed');
    await M('（……寝た。秒で寝た）', 'sad');
    await G.fadeOut(1200);
    await ch1();
  }

  /* ------------------------------------------------------------------
     第一章 この中に探偵は
     ------------------------------------------------------------------ */
  async function ch1() {
    STATE.chapter = 1;
    await G.chapter('第一章', 'この中に探偵は', '― 高度一万メートル ―');
    G.time('22:50');
    G.cinema(true);
    G.cam(29, 5.5); G.snap();
    await G.fadeIn(900);
    G.bgm(null);
    SND.se('chime');
    await X('ca', '（機内放送）お客様にお知らせいたします。お客様の中に、お医者様はいらっしゃいませんか。', 'serious');
    await N('機内がざわめいた。後方の席で、眼鏡の男性が立ち上がるのが見えた。');
    await M('（急病人……？）', 'think');
    G.time('22:58');
    await G.wait(800);
    SND.se('chime');
    G.bgm('tension');
    await X('ca', '（機内放送）……重ねて、お客様にお知らせいたします。', 'serious');
    await X('ca', '――この中に、探偵はおりませんか。', 'serious');
    SND.se('sting');
    await M('（……探偵）', 'closed');
    await N('その言葉は、一年経っても塞がらない傷口に、まっすぐ刺さった。');
    await N('私は、膝の上で手を握りしめた。');
    await X('siesta', 'はい。', 'serious');
    await N('隣の少女が、すっと手を挙げていた。――私の手首を、しっかり掴んだまま。');
    await M('ちょっ……!? なんで私の手まで挙げてるの!?', 'shock');
    await X('siesta', '名探偵と、その助手です。', 'smile');
    await M('助手!? 誰が!?', 'shock');
    await X('siesta', '君が。', 'smile');
    await M('私はもう、探偵助手なんかじゃ――', 'angry');
    await X('siesta', '元・探偵助手、でしょ。知ってる。', 'serious');
    await M('…………え？', 'shock');
    await X('siesta', '名探偵だからね。', 'smile');
    f().named = true;
    await X('siesta', 'シエスタ。それが私の名前。よろしくね、助手。', 'smile');
    await M('よろしくしない！！', 'angry');
    await G.fadeOut(700);

    // 現場
    G.clearActors();
    G.place('me', 5, 7, 'left'); G.place('siesta', 5, 6, 'left');
    G.place('ca', 4, 5, 'down'); G.place('hikawa', 5, 9, 'up');
    G.cam(4, 6.5); G.snap();
    G.time('23:02');
    await G.fadeIn(800);
    await X('ca', 'チーフパーサーの早乙女です。……こちらへ。', 'serious');
    await N('後方の化粧室Bの前。扉の隙間から、床に倒れた男性の足が見えた。');
    await X('hikawa', '医師の氷室だ。残念だが……もう亡くなっている。おそらく心臓発作だろう。', 'closed');
    await X('ca', '槙村透吾様。エコノミークラス、12列目のお客様です。', 'sad');
    await X('ca', '心臓発作なら、と思ったのですが……機長が、念のため、と。', 'serious');
    await X('siesta', '正しい判断。心臓発作の顔じゃないもの、あれ。', 'serious');
    await X('hikawa', '……何？ 君のような子どもに、何が分かる。', 'angry');
    await X('siesta', '名探偵に年齢は関係ないよ。ね、助手。', 'smile');
    await M('私に振らないで……。', 'sad');
    await X('siesta', 'さ、調べよう。君は現場。私は――', 'serious');
    await X('siesta', 'ギャレーのクッキーを調べる。', 'smile');
    await M('仕事して!!', 'angry');
    G.cam(null); G.cinema(false);
    STATE.follow = true; G.follow(true);
    G.clearActors(); G.restore();
    G.toast(touch()
      ? '<b>移動</b>：十字ボタン　<b>調べる・話す</b>：Aボタン　<b>手帳</b>：Bボタン<br>迷ったら、ついてくる<b>シエスタに話しかけ</b>よう。'
      : '<b>移動</b>：矢印キー / WASD　<b>調べる・話す</b>：Z / Enter　<b>手帳</b>：X / Esc<br>迷ったら、ついてくる<b>シエスタに話しかけ</b>よう。', 8000);
  }

  async function examBody() {
    if (has('s_body')) { await N('槙村さんの遺体。唇と指先が、青紫色に変わっている。'); return; }
    await N('化粧室の床に、スーツ姿の男性が倒れていた。');
    await N('外傷はない。……でも、瞳孔が針の先みたいに小さく縮んでいて、唇と指先が青紫色に変わっている。');
    await M('（九条さんに、何度も教わった……これは、心臓発作じゃない）', 'serious');
    await M('（毒だ）', 'serious');
    await G.gain('s_body', '証拠品を入手');
    await afterScene();
  }
  async function examLock() {
    if (has('s_lock')) { await N('化粧室Bの扉。内側から鍵がかかっていた。'); return; }
    await N('化粧室Bの扉。鍵は、内側からかけるスライド式だ。');
    await X('ca', '22時50分、ノックしてもお返事がなくて……。外から非常用の解錠をしました。鍵は、確かに内側からかかっていました。', 'serious');
    await M('（中には槙村さんだけ。犯人は、外にいた……）', 'think');
    await G.gain('s_lock', '証拠品を入手');
    await afterScene();
  }
  async function talkCa() {
    if (ch() === 1 && !has('s_ca')) {
      await X('ca', '何でもお聞きください。', 'serious');
      await M('槙村さんの様子で、何か覚えていることはありますか？', 'serious');
      await X('ca', '22時12分ごろ、槙村様に呼ばれて、お水をお持ちしました。お薬を飲むから、と。', 'serious');
      await X('ca', '22時30分に、化粧室に入られて……それきり、出てこられなくて。', 'sad');
      await X('ca', '22時50分に解錠して、すぐにお医者様をお呼びしました。', 'serious');
      await X('ca', '……そういえば、氷室様は真っ先に槙村様の上着のポケットを探っていらっしゃいました。「持病の薬を探している」と。', 'think');
      await G.gain('s_ca', '証言を記録');
      await afterScene();
      return;
    }
    await X('ca', '機長は、このまま飛行を続けるか判断しかねているようです。……どうか、お願いします。', 'serious');
  }
  async function talkHikawa() {
    if (ch() === 1 && !has('s_hikawa')) {
      await X('hikawa', '何だね。私は医師として、遺体を診ただけだ。', 'serious');
      await M('槙村さんとは、お知り合いですか？', 'serious');
      await X('hikawa', 'まさか。あの男とは、話したこともない。たまたま同じ便に乗り合わせただけだ。', 'closed');
      await X('hikawa', '死因はおそらく心臓発作だろう。探偵ごっこは、ほどほどにしたまえ。', 'angry');
      await G.gain('s_hikawa', '証言を記録');
      await afterScene();
      return;
    }
    if (ch() === 2) { await X('hikawa', '……まだ何か用か。学会の資料を読みたいんだがね。', 'angry'); return; }
    await X('hikawa', '話すことは、もうない。', 'closed');
  }
  async function afterScene() {
    if (ch() !== 1 || c1() < 4) return;
    await G.fadeOut(600);
    G.cinema(true);
    await G.fadeIn(500);
    await X('siesta', 'おつかれ、助手。', 'smile');
    await M('……シエスタ。クッキー、食べてたでしょ。口の端についてる。', 'sad');
    await X('siesta', 'これは証拠品。', 'smile');
    await M('食べちゃったら証拠にならないでしょ！', 'angry');
    await X('siesta', 'それで、現場はどうだった？', 'serious');
    await M('……毒。それも、化粧室の外で盛られてる。鍵は内側からかかってた。', 'serious');
    await X('siesta', 'うん。――合格。', 'smile');
    await M('え？', 'shock');
    await X('siesta', 'やっぱり君、ちゃんと探偵助手の目をしてる。', 'smile');
    await M('…………。', 'closed');
    await X('siesta', 'じゃあ次は聞き込み。槙村さんの席と、その周りの乗客。それから――', 'serious');
    await X('siesta', '彼の持ち物は、まだ全部見てないよね。化粧室の中も、もう一度。', 'think');
    G.cinema(false);
    await ch2();
  }

  /* ------------------------------------------------------------------
     第二章 機内捜査
     ------------------------------------------------------------------ */
  async function ch2() {
    STATE.chapter = 2;
    G.time('23:20');
    G.clearActors(); G.restore();
    G.bgm('s_explore');
    G.toast('<b>聞き込み開始</b>：乗客と、槙村の持ち物を調べよう。', 5000);
  }
  async function talkNanase() {
    if (ch() === 1) { await X('nanase', 'え、探偵さん？ ……な、何かあったんですか？', 'shock'); await X('siesta', '助手。現場が先。', 'serious'); return; }
    if (has('s_nanase')) { await X('nanase', '僕、怖くて眠れないです……。', 'sad'); return; }
    await X('nanase', 'あ、さっきの探偵さん……。槙村さんって、そこの席の人ですよね。', 'sad');
    await M('はい。何か、気づいたことはありませんか？', 'serious');
    await X('nanase', 'えっと……22時10分ごろかな。あのお医者さん――氷室さんが、槙村さんの席に来て。', 'think');
    await X('nanase', 'カプセルを渡してました。「酔い止めです、よく効きますよ」って。', 'think');
    await X('nanase', '槙村さん、ちょっと顔色悪かったから、親切な人だなあって思ったんですけど……。', 'sad');
    await G.gain('s_nanase', '証言を記録');
    await M('（氷室さんは、「話したこともない」って言ってた……）', 'shock');
    await checkDone();
  }
  async function talkKuroda() {
    if (ch() === 1) { await X('kuroda', 'なんだ、騒々しい。俺は寝てるんだ。', 'angry'); return; }
    if (has('s_kuroda')) { await X('kuroda', '俺じゃないと言ってるだろう！', 'angry'); return; }
    await X('kuroda', '……なんだ、探偵だと？ ガキが二人で探偵ごっこか。', 'angry');
    await X('siesta', 'ガキじゃなくて、名探偵と助手。', 'smile');
    await M('（そこは訂正するんだ……）', 'sad');
    await X('kuroda', 'ふん。……槙村のことなら、知ってるさ。あいつの研究には、俺が金を出してた。', 'serious');
    await X('kuroda', '搭乗前に揉めたのは確かだ。研究の成果を独り占めしようとしやがったからな。だが、殺しちゃいねえ。', 'angry');
    await X('kuroda', 'あいつ、金属のケースを肌身離さず持ってた。「世界がひっくり返る“種”だ」とか言ってな。', 'think');
    await G.gain('s_kuroda', '証言を記録');
    await checkDone();
  }
  async function examMetal() {
    if (ch() === 1) { await N('12列目の座席に、金属のケースが置いてある。'); await X('siesta', 'あとで見よう。まずは現場。', 'serious'); return; }
    if (has('s_metal')) { await N('空っぽの金属ケース。小瓶の形のくぼみ。'); return; }
    await N('槙村さんの座席に、保冷機能つきの金属ケースが置かれていた。');
    await N('留め金は開いていて、中は空っぽ。緩衝材に、小瓶の形のくぼみが残っている。');
    await N('ラベルには「Y-SEED ／ 取扱厳重注意」。');
    await X('siesta', '…………。', 'serious');
    await M('シエスタ？ 何か知ってるの？', 'think');
    await X('siesta', 'ううん。……ちょっと、嫌な名前だなって思っただけ。', 'closed');
    await G.gain('s_metal', '証拠品を入手');
    await checkDone();
  }
  async function examTrash() {
    if (ch() === 1) { await N('化粧室Bの洗面台。下に、小さなくず入れがある。'); return; }
    if (has('s_sheet')) { await N('くず入れ。もう何も入っていない。'); return; }
    await N('洗面台の下の、小さなくず入れ。ペーパータオルをかき分けると――');
    SND.se('sting');
    await N('底に、銀色の包装片が落ちていた。カプセル一錠分の、PTPシートの切れ端だ。');
    await N('印字は「徐放性カプセル（医療用）」。ロット K-0713。');
    await M('徐放性……。飲んでから、ゆっくり溶けるカプセルだ。', 'think');
    await X('siesta', '酔い止めにしては、ずいぶん物騒な薬だね。', 'serious');
    await G.gain('s_sheet', '証拠品を入手');
    await checkDone();
  }
  async function examMedbag() {
    if (ch() === 1) { await N('座席に、使い込まれた革の医療鞄が置いてある。'); return; }
    if (has('s_medbag')) { await N('氷室の医療鞄。'); return; }
    if (!has('s_sheet')) {
      await N('氷室さんの医療鞄が、隣の空席に置いてある。');
      await M('（……勝手に開けるわけには、いかないよね）', 'think');
      await X('siesta', '開ける理由が見つかったら、開ければいいよ。', 'smile');
      return;
    }
    await M('（ロット K-0713……。もし、この鞄の中に同じものがあったら）', 'serious');
    await X('siesta', '開けよう。', 'smile');
    await M('いやいやいや、勝手に開けたら――', 'shock');
    await X('siesta', 'もう開けた。', 'smile');
    await M('早い！！', 'angry');
    await N('医療鞄の中に、徐放性カプセルのシートがあった。ロットは――K-0713。');
    SND.se('sting'); G.shake(3, 400);
    await N('シートの端の一錠分だけが、はさみで切り取られている。');
    await G.gain('s_medbag', '証拠品を入手');
    await checkDone();
  }
  async function checkDone() {
    if (ch() !== 2 || c2() < 5) return;
    G.cinema(true);
    await X('siesta', '――揃ったね。', 'serious');
    await M('うん。……もう、分かった気がする。', 'serious');
    await X('siesta', 'じゃあ、始めようか。名探偵の時間。', 'smile');
    await X('siesta', '早乙女さんに頼んで、関係者を後方ギャレーに集めてもらおう。', 'serious');
    G.cinema(false);
    await finale();
  }

  async function talkPax(id) {
    const L = {
      pax1: ['……わしはもう眠い。年寄りは、事件より睡眠が大事じゃ。', 'zzz……'],
      pax2: ['こわいわね……。到着まで、あと何時間かしら。', 'さっきの白い髪のお嬢さん、あなたのお友達？ 素敵ね。'],
      pax3: ['明日の朝イチで会議なんですよ……勘弁してほしい。', '探偵？ 本当に？ ……ドラマみたいだ。'],
      pax4: ['ねえ、あのお姉ちゃん、たんていなの？ かっこいい！', 'ママがね、寝なさいって。'],
      pax5: ['医師の氷室君か。学会で何度か見かけたよ。……最近は、妙な研究に手を出していると噂だがね。', 'ロンドンの学会は明後日だ。間に合うといいが。'],
    }[id];
    if (!L) return;
    const k = 'pax_' + id; const i = f()[k] || 0; f()[k] = i + 1;
    await X(id, L[i % L.length], 'think');
  }

  /* ------------------------------------------------------------------
     第三章 名探偵
     ------------------------------------------------------------------ */
  function galleySetup() {
    G.clearActors();
    G.place('siesta', 6, 4, 'right'); G.place('me', 6, 7, 'right');
    G.place('hikawa', 10, 4, 'left'); G.place('kuroda', 12, 4, 'left');
    G.place('ca', 9, 7, 'left'); G.place('nanase', 11, 7, 'left');
    G.cam(8.5, 5.5); G.snap();
  }
  async function T(who, text, e, o) { G.spot(who); return G.say(who, text, e, o); }
  const penalty = async () => {
    G.focus(-15);
    if (STATE.focus <= 0) await G.gameOver('BAD END', '名探偵の助手、失格', '推理は空回りし、氷室は「探偵ごっこ」を笑って席に戻った。\n着陸後、彼は人混みに紛れて姿を消し――《シード》の行方は、誰にも分からなくなった。');
  };
  const WRONG = ['……助手。それ、今の話に関係ある？', 'はずれ。もう一回。……眠いなら、あとで膝枕してあげるけど。', 'うーん、惜しくない。全然惜しくない。'];
  const P = (prompt, ids, o = {}) => G.present(prompt, ids, Object.assign({ penalty, noAuto: true, speaker: 'siesta', wrongLines: WRONG }, o));

  async function finale() {
    STATE.chapter = 3; STATE.follow = false;
    STATE.focus = 100;
    G.bgm(null);
    await G.fadeOut(900);
    if (!f().finaleSeen) { f().finaleSeen = true; await G.chapter('第三章', '名探偵', '― 午前零時 ―'); }
    G.load('PL', 6, 7, 'right');
    G.cinema(true);
    galleySetup();
    G.time('00:00');
    G.checkpoint('finale');
    G.bgm('tension');
    await G.fadeIn(900);
    await N('後方ギャレー。関係者が集められた。');
    await T('kuroda', 'こんな夜中に、何のつもりだ。', 'angry');
    await T('siesta', 'この機内で、殺人が起きました。犯人は――この中にいます。', 'serious');
    await T('nanase', 'えっ……！', 'shock');
    await T('siesta', 'まあ、ここは空の上だから。犯人がいるとしたら、この中しかないんだけど。', 'smile');
    await T('me', '（それはそうだけど、今言う!?）', 'sad');
    await T('siesta', '助手。手帳を。', 'serious');
    await T('me', '……はい。', 'serious');
    G.bgm('deduction');
    G.toast('<b>第三章</b>：証拠を間違えると<b>集中</b>が減ります。0になると<b>敗北</b>です。', 6500);
    G.refresh(); $('hud').classList.remove('hidden'); setTimeout(G.refresh, 4000);

    await T('hikawa', '殺人だと？ 馬鹿な。あれは心臓発作だ。私が診たんだぞ。', 'angry');
    await P('槙村の死因が、心臓発作ではないと示す証拠は？', ['s_body'], { hint: '助手が最初に見たもの。あの顔、あの指先。' });
    await T('siesta', '縮んだ瞳孔。青紫色の唇と指先。……典型的な、神経毒の症状。お医者さんなら、気づかないはずがないよね。', 'serious');
    await T('hikawa', '……っ。見落としただけだ。', 'closed');
    await T('siesta', 'それに、化粧室には内側から鍵がかかっていた。犯人は中にいなかった。', 'serious');
    await T('siesta', 'だったら、毒はいつ飲まされたのか。', 'think');
    await P('槙村が「薬」を飲んだ時刻が分かる証拠は？', ['s_ca'], { hint: '22時12分。客室乗務員さんは、彼に何を持っていった？', alt: { s_nanase: 'それは「渡された」時。飲んだのは、その少しあと。' } });
    await T('siesta', '22時12分。早乙女さんが持ってきた水で、彼は薬を飲んだ。', 'serious');
    await T('siesta', 'でも、彼が倒れたのは化粧室の中。そこには20分以上の間がある。', 'think');
    await P('毒がすぐに効かなかった「仕掛け」を示す証拠は？', ['s_sheet'], { hint: '化粧室のくず入れ。印字された、薬の種類。', alt: { s_medbag: '方向は合ってる。でも先に、槙村さんの「手元」にあったものを。' } });
    await T('siesta', '徐放性カプセル。飲んでから、ゆっくり溶ける。', 'serious');
    await T('siesta', '中身を毒に詰め替えておけば――毒が回るのは、犯人がとっくに席に戻ったあと。', 'serious');
    await G.timeline([
      { t: '22:10', text: 'カプセルを\n受け取る', cls: 'key' },
      { t: '22:12', text: '水で飲む' },
      { t: '22:30', text: '化粧室へ\n（施錠）' },
      { t: '22:50', text: '解錠・発見', cls: 'bad' },
      { t: '22:52', text: '医師が診察\nポケットを探る' },
    ], ['22:12', '22:30', 'カプセルが溶けるまで'], ['22:00', '23:00']);
    await T('siesta', 'さて、助手。22時10分、彼にカプセルを渡したのは――誰？', 'serious');
    G.spot(null);
    await M('（……答えは、もう手帳の中にある）', 'serious');
    const who = await G.pickPerson('槙村にカプセルを渡したのは？', ['hikawa', 'kuroda', 'nanase', 'ca']);
    if (who !== 'hikawa') {
      const nm = { kuroda: '黒田', nanase: '七瀬', ca: '早乙女' }[who];
      await T('me', `……${nm}さん、です。`, 'serious');
      await T('siesta', '…………助手。', 'closed');
      SND.se('wrong');
      await G.gameOver('BAD END', '誤った告発', `${nm}が取り押さえられ、機内が騒然としたその隙に――\n本当の犯人は、悠々と席に戻った。\n《シード》の小瓶は、彼の内ポケットに収まったまま、ロンドンの霧の中へ消えた。`);
    }
    await G.cutin('犯人は――', null, 1100);
    G.spot('hikawa'); SND.se('sting'); G.shake(5, 600, true);
    await T('me', '氷室さん。……あなたです。', 'serious');
    await T('siesta', 'うん。私も同じ答え。', 'smile');
    await T('hikawa', '……ふん。子どもの探偵ごっこに、付き合っていられるか。', 'angry');

    await G.debate({
      enemy: 'hikawa', name: '氷室 慧', short: '氷室',
      intro: '論戦開始！ 氷室の“心の防壁”を崩せ！',
      partyName: 'シエスタ ＆ {N}', hpName: '集中', hintLabel: 'シエスタに聞く', hintHelp: 'シエスタからヒントをもらう。', hintSpeaker: 'siesta',
      bgm: 'deduction', wrongDmg: 20,
      loseText: '言葉が続かなかった。\n氷室は鼻で笑って席に戻り――着陸後、人混みに紛れて姿を消した。\n《シード》の行方は、誰にも分からない。',
      rounds: [
        { claim: 'あの男とは、話したこともない！ カプセルなど知らん！', correct: ['s_nanase'],
          alt: { s_hikawa: 'それは彼自身の言葉。それを崩す“誰か”の証言は？' },
          hint: '通路を挟んだ席に、誰が座ってた？', counter: '見間違いだ！',
          after: async () => {
            await M('七瀬さんが見ていました。22時10分、あなたが槙村さんにカプセルを渡すところを。「酔い止めです、よく効きますよ」って。', 'serious');
            await X('nanase', 'は、はい……確かに、見ました。', 'shock');
          } },
        { claim: 'そんな包装片、誰が持っていてもおかしくない！ 私の物だという証拠はあるのか！', correct: ['s_medbag'],
          alt: { s_sheet: 'その包装片と“同じもの”が、どこにあった？' },
          hint: '……あの鞄、もう開けちゃったよね？', counter: '証拠などない！',
          after: async () => {
            await M('あなたの医療鞄の中に、同じロット K-0713 のシートがありました。端の一錠分だけ、はさみで切り取られて。', 'serious');
            await X('hikawa', '勝手に人の鞄を……！', 'angry');
            await X('siesta', '開けたのは私。文句は名探偵にどうぞ。', 'smile');
          } },
        { claim: '仮に私が渡したとして……見ず知らずの男を殺す理由が、どこにある！', correct: ['s_metal'],
          alt: { s_kuroda: 'いい線。でも、彼が運んでいた“もの”が、今どうなっているかを。' },
          hint: '槙村さんが、肌身離さず運んでいたもの。それは今、どこ？', counter: '理由などない！',
          after: async () => {
            await M('槙村さんの金属ケースは、空っぽでした。ラベルには「Y-SEED」。', 'serious');
            await X('siesta', 'あなたの目的は、それ。槙村さんが運んでいた《種》。', 'serious');
          } },
        { claim: 'ポケットを探ったのは、持病の薬を探しただけだ！ 医師として当然だろう！', correct: ['s_ca'], cut: 'これが答えだ！',
          hint: '発見の直後。早乙女さんは、彼の何を見ていた？', counter: '言いがかりだ！',
          after: async () => {
            await M('早乙女さんが見ていました。遺体を見つけた直後、あなたが真っ先に、槙村さんの上着のポケットを探るのを。', 'serious');
            await M('探していたのは薬じゃない。――ケースから移された、《種》の小瓶だ。', 'angry');
            await X('siesta', 'それ、まだ持ってるでしょ。……右の内ポケット。', 'serious');
          } },
      ],
    });

    // 変貌
    f().solved = true;
    G.bgm(null);
    G.spot('hikawa');
    await N('長い沈黙のあと、氷室は――笑った。');
    await T('hikawa', '……ふ、ふふ。ははは。さすがは《名探偵》だ。', 'smile');
    await N('氷室の手の中で、小さな硝子の小瓶が、紫色に光った。');
    await T('hikawa', '《ユグドラシルのシード》。人を、人ではないものへと造り変える“種”だ。', 'smile');
    await T('hikawa', '槙村はこれを、世界のためだのと抜かして公表しようとした。愚かな男だ。', 'angry');
    await T('siesta', '――助手、下がって！', 'shock');
    SND.se('glitch'); G.flash('#b46aff', 400); G.shake(6, 800, true);
    await N('止める間もなかった。氷室は小瓶の中身を、一息に飲み干した。');
    G.bgm('tension');
    await N('氷室の体が、びくん、と跳ねた。');
    SND.se('crit'); G.shake(8, 900, true);
    await N('耳の奥から――ぬるりと、黒い触手のようなものが這い出してくる。');
    G.spot('hikawa_x');
    await T('hikawa_x', 'ああ……聴こえる……聴こえるぞ……！', 'smile', { tremble: true });
    await T('hikawa_x', 'お前たちの鼓動も、呼吸も、瞬きの音さえも……！', 'angry', { tremble: true });
    await T('nanase', 'う、うわああああっ！！', 'shock');
    await T('ca', '皆様、前方へ！ 前方へお下がりください！', 'shock');
    G.spot(null);
    await M('な、なにあれ……人間じゃない……！', 'shock');
    await X('siesta', '助手。戦える？', 'serious');
    await M('戦えるわけないでしょ!!', 'shock');
    await X('siesta', '大丈夫。君には、そのケースがある。', 'smile');
    await M('ケース……？ これ、開かないんだけど!?', 'shock');
    G.checkpoint('fight');
    await fight();
  }

  async function fight() {
    G.cinema(true);
    if (STATE.chapter !== 3) STATE.chapter = 3;
    if (W.mapId !== 'PL') G.load('PL', 6, 7, 'right');
    galleySetup(); G.remove('kuroda'); G.remove('nanase'); G.remove('ca');
    await G.fadeIn(300);
    await G.battle({
      kind: 'sky', name: '氷室 慧《シード適合体》', svg: SEED_SVG, hp: 210,
      atk: [13, 19], roar: [14, 20], pattern: ['atk', 'listen', 'atk', 'roar', 'atk', 'listen', 'atk', 'roar'],
      bgm: 's_battle', intro: '氷室が襲いかかってきた！ ――あらゆる音を聴き取る、異常な聴覚！',
      loseText: '触手が、{N}の体を締め上げた。\n高度一万メートルの密室で、名探偵の声が遠ざかっていく――。',
    });
    f().hpLeft = Math.round(STATE.party.me.hp / STATE.party.me.max * 100);
    await afterFight();
  }

  async function afterFight() {
    G.bgm('truth');
    await N('最後の銃声の残響が消えると――');
    await N('氷室の耳から伸びていた触手は、枯れ枝のように萎れ、崩れ落ちた。');
    await X('hikawa', '……聴こえ……ない……。何も……。', 'closed');
    await N('氷室は、その場に崩れ落ちた。息は、ある。');
    await X('siesta', 'おつかれさま、助手。', 'smile');
    await M('…………。', 'closed');
    await N('手が、震えていた。シエスタの銃は、思っていたよりずっと重かった。');
    await M('……ねえ。なんで、私なの。', 'sad');
    await M('なんで、私にこのケースを持たせたの。なんで、私の前の探偵のことまで知ってたの。', 'sad');
    await X('siesta', '…………。', 'closed');
    await X('siesta', '九条玲司。……すごい探偵だった。会ったことはないけど、仕事ぶりは知ってる。', 'serious');
    await X('siesta', 'その人の隣には、いつも同じ助手がいた。', 'smile');
    await M('…………。', 'sad');
    await X('siesta', '君はさ、まだ探偵助手をやめてないよ。', 'smile');
    await X('siesta', 'だってさっき、「探偵はおりませんか」って聞こえた時。私が手を挙げるより先に、君の手、ちょっとだけ動いてた。', 'smile');
    await M('……っ。', 'shock');
    await N('言い返す言葉が、見つからなかった。');
    SND.se('chime');
    await X('ca', '（機内放送）機長より、お知らせいたします。当機は機内で発生した事態を受け、羽田空港へ引き返します。', 'serious');
    await X('siesta', '……あ、ロンドンの紅茶。', 'sad');
    await M('今それ!?', 'angry');
    await G.fadeOut(1400);
    await epilogue();
  }

  /* ------------------------------------------------------------------
     終章
     ------------------------------------------------------------------ */
  async function epilogue() {
    STATE.chapter = 4;
    G.hum(0);
    await G.chapter('終章', '名探偵の助手', '');
    G.cinema(true); G.clearActors();
    G.scene('haneda');
    G.time('05:40');
    G.bgm('s_ending');
    await G.fadeIn(1500);
    await N('早朝の羽田空港。滑走路の向こうで、空が白み始めていた。');
    await N('パトカーの赤い光の中から、赤い髪の女性が歩いてきた。');
    await X('kase', '警察だ。……《執行者》、加瀬風靡。', 'serious');
    await X('kase', 'そいつが、例の“種”を飲んだ男か。', 'serious');
    await N('手錠をかけられた氷室は、虚ろな目のまま、ただ黙ってパトカーに乗せられていった。');
    await X('kase', 'また厄介ごとに首を突っ込んだな、名探偵。', 'angry');
    await X('siesta', '今回は、助手がいたから楽だった。', 'smile');
    await X('kase', '助手？', 'think');
    await N('加瀬さんの鋭い目が、私に向けられた。');
    await X('kase', '……あんたが、この女の新しい助手か。', 'serious');
    await M('ち、違います！ 私は巻き込まれただけで――', 'shock');
    await X('kase', 'ご愁傷様。こいつに目をつけられたら、もう逃げられない。', 'smile');
    await M('ご愁傷様って言った!? 今、警察の人がご愁傷様って言った!?', 'angry');
    await X('kase', 'じゃあな。……次は、もう少し静かな事件にしてくれ。', 'closed');
    await N('加瀬さんは、背を向けて去っていった。');
    await X('siesta', 'というわけで。', 'smile');
    await X('siesta', '今日から君は、正式に私の助手。', 'smile');
    await M('勝手に決めないで！！', 'angry');
    await X('siesta', '前の探偵の助手で、今は私の助手。……つまり、助手の助手？', 'think');
    await M('意味が分からない！ 助手が渋滞してる！', 'angry');
    await X('siesta', '異論は認めない。契約書も、もう作っておいたから。', 'smile');
    await M('いつの間に!? っていうか、このサイン私の字じゃない！', 'shock');
    await X('siesta', 'よく似てるでしょ。練習したんだ。', 'smile');
    await M('犯罪だよ!!', 'angry');
    await N('……でも。');
    await N('朝日の中で、白い髪を風になびかせて笑う彼女を見ていたら――');
    await N('なぜだか、少しだけ、泣きそうになった。');
    await X('siesta', '行こう、助手。次の事件が、私たちを待ってる。', 'smile');
    await M('……はいはい。分かりましたよ、名探偵。', 'smile');
    G.scene(null);
    await G.fadeOut(1400);
    await G.mono([
      'こうして私は、もう一度、探偵助手になった。',
      '九条さん。\n新しい探偵は、ちょっと――いや、だいぶ変な人です。',
      'でも、たぶん。\n私はまた、この手帳を書けると思います。',
      '探偵助手 {N} の手記より　FILE.04',
    ]);
    G.scene('london');
    await G.wait(1000);
    await G.mono(['――そして、一年後。']);
    await G.fadeIn(900);
    await G.wait(2200);
    await N('イギリス、ロンドン。');
    await N('名探偵と私に課せられた次の任務は、《巫女》マルチルゲートの祭典を守ること――。');
    await G.fadeOut(1400);
    G.scene(null);
    await G.mono(['FILE.05 へ続く']);
    W.mode = 'blank';
    G.cinema(false);
    await showResult();
  }

  /* ------------------------------------------------------------------
     ヒント
     ------------------------------------------------------------------ */
  async function hint() {
    const c = ch();
    if (c === 1) {
      const L = [];
      if (!has('s_body')) L.push('化粧室Bの中の遺体');
      if (!has('s_lock')) L.push('化粧室Bの扉の鍵');
      if (!has('s_ca')) L.push('乗務員の早乙女さんの話');
      if (!has('s_hikawa')) L.push('お医者さんの話');
      await S(`まだ見てないのは、${L.join('、')}。……私はクッキーを見てるから、よろしく。`, 'smile');
      await M('（手伝う気ゼロだ……）', 'sad');
      return;
    }
    if (c === 2) {
      const L = [];
      if (!has('s_nanase')) L.push('槙村さんの通路向かいの席の子（12列目の中央）');
      if (!has('s_kuroda')) L.push('ビジネスクラスの、偉そうなおじさん');
      if (!has('s_metal')) L.push('槙村さんの座席（12列目の窓側）');
      if (!has('s_sheet')) L.push('化粧室Bの洗面台の、くず入れ');
      if (!has('s_medbag')) L.push(has('s_sheet') ? 'お医者さんの席の隣に置いてある鞄' : '……それと、包装片を見つけたら、ある人の鞄');
      await S(`残りは、${L.slice(0, 2).join('、それから')}。`, 'think');
      if (Math.random() < 0.5) { await S('あと、紅茶。', 'smile'); await M('それは自分で頼んで！', 'angry'); }
      return;
    }
    await S('今は、目の前のことに集中して。', 'serious');
  }

  /* ------------------------------------------------------------------
     イベント
     ------------------------------------------------------------------ */
  const INV = () => ch() >= 1 && ch() <= 2;
  const EVENTS = {
    PL: [
      { at: [[2, 9]], sprite: 'mbody', when: () => ch() >= 1 && ch() <= 3, check: examBody, clue: () => ch() === 1 && !has('s_body') },
      { at: [[3, 8]], when: INV, check: examLock, clue: () => ch() === 1 && !has('s_lock') },
      { at: [[1, 8]], when: INV, check: examTrash, clue: () => ch() === 2 && !has('s_sheet') },
      { at: [[3, 3]], when: INV, check: async () => { await N('化粧室A。「使用禁止」の札が下がっている。'); } },
      { at: [[12, 3]], sprite: 'metalcase', when: INV, check: examMetal, clue: () => ch() === 2 && !has('s_metal') },
      { at: [[18, 5]], sprite: 'medbag', when: INV, check: examMedbag, clue: () => ch() === 2 && has('s_sheet') && !has('s_medbag') },
      { at: [[29, 5]], sprite: 'acase', when: () => ch() >= 1 && ch() <= 2, check: () => flavor('b', 29, 5) },
    ],
  };

  const TALK = {
    siesta: async () => hint(),
    ca: talkCa, hikawa: talkHikawa, nanase: talkNanase, kuroda: talkKuroda,
    pax1: () => talkPax('pax1'), pax2: () => talkPax('pax2'), pax3: () => talkPax('pax3'), pax4: () => talkPax('pax4'), pax5: () => talkPax('pax5'),
  };

  function onResume() {
    W.storm = false;
    SND.rain(0);
    SND.hum(STATE.chapter <= 3 ? 0.45 : 0);
    SND.bgm(STATE.chapter >= 4 ? 's_ending' : 's_explore');
  }

  return {
    npcs, objective, FLAVOR, flavor, EVENTS, talk: id => (TALK[id] ? TALK[id]() : Promise.resolve()),
    prologue, hint, onResume, hintFromMenu: true, initState,
    finale, fight,
    hintMenu: () => 'シエスタに聞く（ヒント）',
    hideTrust: () => true,
    focusLabel: '集中',
    nbName: '手帳',
    start: { map: 'PL', x: 29, y: 4, dir: 'down' },
    people: () => {
      const L = ['siesta', 'ca', 'hikawa', 'makimura', 'nanase', 'kuroda'];
      if (STATE.chapter >= 4) L.push('kase');
      return STATE.chapter >= 1 ? L : ['siesta'];
    },
    evidenceIds: () => S_EVIDENCE_ORDER,
    result() {
      const fo = STATE.focus || 0, hp = STATE.flags.hpLeft || 0;
      const score = Math.round(fo * 0.7 + hp * 0.3);
      const [rank, title] = score >= 88 ? ['S', '名探偵の右腕'] : score >= 70 ? ['A', 'シエスタの助手'] : score >= 50 ? ['B', '巻き込まれ体質'] : ['C', '助手（仮）'];
      return {
        label: '名探偵の助手としての評価', rank, title,
        stats: `最終集中力　${fo} / 100<br>戦闘後の残りHP　${hp}%<br>集めた証拠・証言　${STATE.evidence.length} / ${S_EVIDENCE_ORDER.length}`,
        credits: `<h2>空の名探偵</h2><p style="color:#9ac8ff">― 探偵助手の手記 FILE.04 ―</p>
          <h4>《名探偵》</h4><p>シエスタ</p><h4>探偵助手</h4><p>${esc(STATE.name)}</p>
          <h4>AS-201便の人々</h4><p>早乙女 リサ</p><p>氷室 慧</p><p>黒田 剛造</p><p>七瀬 ユウ</p><p>槙村 透吾</p>
          <h4>《執行者》</h4><p>加瀬 風靡</p>
          <h4>in memory of</h4><p>九条 玲司</p>
          <h4>シナリオ・プログラム・グラフィック・音楽</h4><p>すべてブラウザ上で生成</p>
          <h4>Special Thanks</h4><p>最後まで遊んでくれたあなた</p><div class="end">FILE.05 へ続く</div>`,
        bgm: 's_ending',
      };
    },
  };
})();
