'use strict';
/* =========================================================
   STORY : 黒鷺館の殺人 ― シナリオ
   ========================================================= */
const STORY = (() => {
  const f = () => STATE.flags;
  const ch = () => STATE.chapter;
  const has = id => STATE.evidence.includes(id);
  const K = (t, e, o) => G.say('kujo', t, e, o);
  const M = (t, e, o) => G.say('me', t, e, o);
  const N = (t, o) => G.narr(t, o);
  const X = (w, t, e, o) => G.say(w, t, e, o);

  const STUDY = ['blood', 'weapon', 'vase', 'fire', 'draft'];
  const studyCount = () => STUDY.filter(has).length;
  const ALL = ['masato', 'fuyuko', 'prescription', 'suzu', 'ice', 'todoAlibi', 'slip', 'bag'];
  const allDone = () => ALL.every(has);
  const testimonies = () => ['masato', 'fuyuko', 'suzu', 'todoAlibi'].filter(has).length;

  /* ------------------------------------------------------------------
     NPC配置（進行状況から決まる）
     ------------------------------------------------------------------ */
  function npcs(id) {
    const L = [], fl = STATE.flags, c = STATE.chapter;
    const add = (i, x, y, d) => L.push({ id: i, x, y, dir: d });
    if (id === '1F') {
      if (c === 0) add('sanada', 19, 20, 'down');
      if (c === 1 && !fl.crash) add('kujo', 33, 12, 'up');
      if (c === 1 && fl.investigating) add('sanada', 29, 10, 'left');
      if (c === 2) {
        add('sanada', 22, 14, 'down'); add('suzu', 6, 5, 'down'); add('fuyuko', 17, 3, 'down'); add('todo', 33, 12, 'down');
        if (fl.detStay) add('kujo', 32, 12, 'right');
      }
    }
    if (id === '2F') { if (c === 2) add('masato', 4, 4, 'down'); }
    return L;
  }

  /* ------------------------------------------------------------------
     目的表示
     ------------------------------------------------------------------ */
  function objective() {
    const c = ch(), fl = f();
    if (c === 0) return fl.dinner ? '' : '食堂へ向かう（ホールの左手の扉）';
    if (c === 1) {
      if (!fl.crash) return 'サロンにいる九条と話す';
      if (fl.investigating) { const n = studyCount(); return n < 5 ? `書斎を調べる（${n} / 5）` : '書斎を出て、廊下へ'; }
      return '';
    }
    if (c === 2) {
      if (fl.detStay && !has('bag')) return fl.gotKey ? '二階・藤堂の客室を調べる' : 'ホールの真田から客室の鍵を借りる';
      if (fl.detStay) return 'サロンの九条に報告する';
      const t = testimonies();
      if (t < 4) return `関係者から話を聞く（${t} / 4）` + (fl.iceHint && !has('ice') ? '／氷冷蔵庫を調べる' : '');
      if (fl.iceHint && !has('ice')) return '厨房の氷冷蔵庫を調べる';
      if (!has('prescription')) return '図書室の冬子に「十年前のこと」を聞く';
      if (!has('slip')) return 'サロンの藤堂にもう一度話を聞く';
      return '九条に話しかける';
    }
    return '';
  }

  /* ------------------------------------------------------------------
     汎用の「調べる」テキスト
     ------------------------------------------------------------------ */
  const FLAVOR = {
    B: ['本棚には、革装丁の本がぎっしりと並んでいる。時計工学、天文学、それに推理小説まで。'],
    W: ['窓の外は真っ暗だ。叩きつけるような雨が、硝子を伝って流れ落ちていく。'],
    P: ['よく手入れされた観葉植物だ。'],
    L: ['背の高いランプが、柔らかな光を落としている。'],
    K: ['大きな柱時計が、重々しく時を刻んでいる。'],
    X: ['ガラス棚に、懐中時計や置時計が整然と並んでいる。', 'どれも寸分違わず、同じ時刻を指していた。'],
    A: ['西洋の甲冑だ。……中に誰か入っていたりは、しないと思う。'],
    S: ['深紅のビロードが張られた長椅子。'],
    T: ['白いクロスの掛かった長い食卓。銀の燭台で、蝋燭の炎が揺れている。'],
    h: ['食卓の椅子だ。背もたれに、黒い鷺の紋章が彫られている。'],
    p: ['黒いグランドピアノ。蓋の上に、楽譜が一冊置かれている。'],
    k: ['チェス盤。白と黒の駒が、勝負の途中で止まったままだ。'],
    C: ['よく磨かれた調理台。'],
    O: ['鉄製の竈。熾火が、まだ赤く燻っている。'],
    Q: ['使い込まれた作業台。包丁や鋸が、きちんと壁に掛けられている。'],
    I: ['木製の氷冷蔵庫。上段に氷を入れ、その冷気で食材を冷やす仕組みだ。'],
    G: ['古びた地球儀。'],
    d: ['重厚な書き物机。'],
    b: ['清潔に整えられた寝台。'],
    w: ['大きな衣装棚。'],
    F: ['暖炉の火が、ぱちぱちと音を立てている。'],
    Z: ['古い油絵が掛かっている。荒れた海と、岬に立つ館の絵だ。'],
    E: ['玄関の大扉。'],
    t: ['小さな丸テーブル。ランプが置かれている。'],
    V: ['大理石の台座。'],
    U: ['階段だ。'],
  };
  async function flavor(c, x, y) {
    const fl = f();
    if (c === 'E') {
      await N('玄関の大扉。外では、嵐が唸りを上げている。');
      if (ch() < 4) await K('橋が落ちた今、外へ出るのは自殺行為だよ。朝を待つしかない。');
      return;
    }
    if (c === 'K' && W.mapId === '1F' && x === 15) {
      await N('玄関ホールの柱時計。重々しい振り子の音が、ホール中に響いている。');
      if (ch() === 0) await K('見事な柱時計だ。鷺沼氏は、時計商として財を成したと聞く。', 'smile');
      if (ch() === 2) await K('真田さんが言っていた『十回の鐘』は、この時計だね。', 'think');
      return;
    }
    if (c === 'K' && x === 38) {
      await N('書斎の柱時計。振り子が静かに揺れている。');
      await N('針は、正確に今の時刻を指していた。……この部屋の時計は、どれも狂っていない。');
      return;
    }
    if (c === 'k' && ch() === 2) {
      await N('チェス盤。藤堂医師と九条さんの勝負は、途中で止まったままだ。');
      await K('私の負けが濃厚だった。……先生は、チェスがお上手だ。時間の使い方が、ね。', 'think');
      return;
    }
    if (c === 'F' && W.mapId === '1F' && y === 11) { await N('サロンの暖炉。程よい火加減で、部屋を暖めている。'); return; }
    const L = FLAVOR[c]; if (!L) return;
    for (const l of L) await N(l);
    if (c === 'X' && ch() >= 1) await K('『一秒の狂いも許さん』、か。', 'think');
    if (c === 'W' && fl.dinner && ch() < 4 && Math.random() < 0.4) await K('嵐は、まだしばらく止みそうにないな。');
  }

  /* ------------------------------------------------------------------
     序章
     ------------------------------------------------------------------ */
  async function prologue() {
    STATE.chapter = 0; STATE.time = '19:40';
    G.storm(true); G.rain(1); G.bgm(null);
    await G.mono([
      '嵐の夜だった。',
      '切り立った岬の突端に建つ洋館――【黒鷺館】。',
      '私、{N}は、探偵・九条玲司の助手として、その館を訪れていた。',
      '館の主、鷺沼源一郎から届いた、一通の招待状に導かれて。',
    ]);
    G.load('1F', 19, 23, 'up');
    G.place('kujo', 20, 23, 'up');
    G.cinema(true);
    G.cam(19.5, 21);
    await G.fadeIn(1400);
    G.thunder(1);
    await G.wait(1200);
    G.bgm('mansion');
    await X('sanada', 'ようこそお越しくださいました、九条様。それに、お連れの方も。');
    await X('sanada', '執事の真田と申します。この嵐の中、さぞお疲れでございましょう。');
    await K('ひどい雨でしたね。岬へ渡る橋が、今にも流されそうだった。');
    await X('sanada', '……はい。先ほどラジオで、川が増水して橋が通行止めになったと。', 'sad');
    await X('sanada', 'おまけに、電話もこの嵐で不通でございます。');
    await K('なるほど。つまり今夜、この館は陸の孤島というわけだ。', 'smile');
    await M('（……九条さん、なんだか楽しそうだ。いつものことだけど。）', 'think');
    await X('sanada', '旦那様と皆様が、食堂でお待ちです。どうぞ、ホールの左手の扉から。');
    G.face('kujo', 'left'); G.face('me', 'right');
    await K('{N}くん。招待状は持っているね？');
    await M('はい、ここに。');
    await G.gain('invite', '証拠品を確認');
    await K('『明朝、十年前の罪を明らかにする。立会人を願いたい』……穏やかではない文面だ。', 'think');
    await K('十年前の罪。告発されるのは誰で、なぜ探偵を立ち会わせるのか。……実に興味深い。', 'smile');
    await M('九条さん、くれぐれも失礼のないようにしてくださいね。', 'serious');
    await K('善処しよう。', 'closed');
    G.cam(null); G.cinema(false);
    G.toast(document.body.classList.contains('touch')
      ? '<b>移動</b>：十字ボタン<br><b>調べる・話す・決定</b>：Aボタン（会話は画面タップでも送れます）<br><b>手帳を開く</b>：Bボタン'
      : '<b>移動</b>：矢印キー / WASD（Shiftで早歩き）<br><b>調べる・話す・決定</b>：Z / Enter / Space<br><b>手帳を開く</b>：X / Esc（右下のボタンでも可）', 9000);
  }

  async function dinner() {
    f().dinner = true;
    await G.fadeOut(600);
    G.cinema(true);
    G.clearActors();
    G.place('genichiro', 2, 15, 'right');
    G.place('kujo', 3, 14, 'down'); G.place('me', 4, 14, 'down'); G.place('fuyuko', 7, 14, 'down');
    G.place('masato', 3, 17, 'up'); G.place('todo', 5, 17, 'up');
    G.place('sanada', 11, 13, 'left'); G.place('suzu', 11, 18, 'left');
    G.cam(6, 15.5); G.snap();
    G.time('19:50');
    await G.fadeIn(900);
    await N('食堂には、館の住人と客人たちが顔を揃えていた。');
    await X('genichiro', 'よく来てくれた、九条君。嵐の中、すまなかったな。', 'smile');
    await K('お招きいただき光栄です、鷺沼さん。素晴らしい館だ。', 'smile');
    await K('……時計の音が、どの部屋からも聞こえる。');
    await X('genichiro', 'はっはっ。時計は儂の人生そのものだよ。', 'smile');
    await X('genichiro', '一秒の狂いも許さん。それが儂の流儀でな。');
    await X('genichiro', '皆を紹介しよう。息子の雅人だ。');
    await X('masato', '……どうも。探偵とはね。親父も随分と大げさなことをする。', 'angry');
    await X('genichiro', '秘書の白瀬冬子君。もう五年、儂の仕事を支えてくれている。');
    await X('fuyuko', '白瀬です。……お噂は、かねがね。');
    await X('genichiro', 'そして、主治医の藤堂先生。妻の代から、もう二十年近く世話になっておる。');
    await X('todo', '藤堂です。いやはや、高名な名探偵とご一緒できるとは。今夜は退屈せずに済みそうですな。', 'smile');
    await X('genichiro', 'あとは執事の真田と、女中のすずだ。');
    await X('suzu', 'よ、よろしくお願いいたしますっ……！', 'shock');
    await N('食事は和やかに進んだ。――少なくとも、表向きは。');
    G.bgm(null);
    await G.wait(600);
    await X('genichiro', '……さて。皆に、話しておかねばならんことがある。', 'serious');
    G.bgm('tension');
    await X('genichiro', '明朝、弁護士がこの館に来る。そして九条君の立ち会いのもと――');
    await X('genichiro', '儂は、ある者の【罪】を告発する。', 'serious');
    await X('masato', 'は……？ 何の話だよ、親父。', 'shock');
    await X('genichiro', '十年前。静江が――儂の妻が死んだ。病死ということになっておる。');
    await X('genichiro', 'だが、そうではなかった。儂はようやく、その証拠を手に入れたのだ。', 'angry');
    await X('fuyuko', '……旦那様。', 'sad');
    await X('todo', '源一郎さん、それは……。奥様のことは、私も手を尽くしましたが……。', 'sad');
    await X('genichiro', '先生を責めとるのではない。……今は、まだ何も言うまい。全ては明日だ。');
    await X('genichiro', '該当する者よ。今夜のうちに、己の罪と向き合っておくことだ。', 'serious');
    await N('誰も、言葉を発しなかった。');
    G.thunder(0.7);
    await N('窓を叩く雨の音と、無数の時計が刻む音だけが、食堂を満たしていた。');
    await X('genichiro', '……真田。二十二時に、書斎へ紅茶を頼む。');
    await X('sanada', 'かしこまりました。');
    await G.fadeOut(1000);
    G.bgm(null);
    await G.mono(['――それが、私たちが聞いた、鷺沼源一郎の最後の言葉となった。']);
    await ch1();
  }

  /* ------------------------------------------------------------------
     第一章
     ------------------------------------------------------------------ */
  async function ch1() {
    STATE.chapter = 1; G.follow(false);
    G.cinema(false);
    await G.chapter('第一章', '時計の止まる夜', '― 二十二時十分 ―');
    G.load('1F', 31, 15, 'up');
    G.time('22:10');
    G.bgm('mansion');
    await G.fadeIn(800);
    await N('夕食の後。私と九条さんは、サロンで夜を過ごしていた。');
    await N('九条さんは暖炉の前に立ったまま、さっきから一言も喋らない。');
  }

  async function ch1Talk() {
    await K('……{N}くん。今夜の夕食、君はどう見た？', 'think');
    const c = await G.choose(['皆さん、ひどく動揺していました', '雅人さんが怪しいと思います', '藤堂先生の様子が気になりました']);
    if (c === 0) { await K('そうだね。だが、動揺にも種類がある。驚き、怒り、そして――恐れ。'); await K('あの食卓には、その全部があった。', 'think'); }
    else if (c === 1) { await K('父親に金の無心をしていた、という噂は聞いている。', 'think'); await K('だが、怪しく見えるものほど疑ってかかるべきだよ。本当の犯人というのは、たいてい怪しく見えないものだ。'); }
    else { G.trust(5); await K('ほう。……良い目をしている。', 'smile'); await K('奥様の話が出た時、彼は真っ先に弁明した。誰も、彼を責めてなどいなかったのにね。', 'think'); }
    await K('告発される『誰か』は、今夜眠れぬ夜を過ごすだろう。……あるいは、眠らずに何かを企むか。', 'serious');
    await M('縁起でもないこと、言わないでください。', 'sad');
    await K('探偵というのは、縁起の悪い職業なのさ。', 'smile');
    // 藤堂、来訪
    G.cinema(true);
    await G.fadeOut(300);
    G.place('me', 32, 13, 'up'); G.place('kujo', 33, 12, 'down');
    G.cam(32, 13); G.snap();
    await G.fadeIn(300);
    G.se('door');
    G.place('todo', 29, 11, 'down');
    G.face('me', 'left'); G.face('kujo', 'left');
    await G.walk('todo', 'DRR');
    G.face('todo', 'right');
    await X('todo', 'おや、九条さん。まだ起きておられましたか。', 'smile');
    await K('先生こそ。今夜は眠れそうにありませんか。');
    await X('todo', 'はは、年寄りは夜が長くてね。……源一郎さんの、あんな話を聞いた後では、なおさらです。', 'sad');
    await X('todo', 'どうです、気晴らしに一局。チェスの心得は？', 'smile');
    await K('嗜む程度には。', 'smile');
    await G.fadeOut(700);
    G.place('todo', 32, 16, 'right'); G.place('kujo', 34, 16, 'left'); G.place('me', 33, 17, 'up');
    G.cam(33, 16); G.snap();
    G.time('22:38');
    await G.fadeIn(700);
    await N('それから、三十分ほど。二人の勝負は、静かに続いていた。');
    await N('私はその横で、駒の動きをぼんやりと眺めていた。');
    await X('todo', '……ところで、今は何時ですかな。');
    await K('十時三十八分です。', 'think');
    await K('……先生、先ほどから随分と時刻を気にされますね。');
    await X('todo', 'はは、職業病でしてな。脈を取るにも、時計は欠かせんのです。', 'smile');
    G.se('gavel');
    await X('todo', '――チェック。', 'smile');
    await K('……ふむ。', 'think');
    await G.wait(700);
    G.time('22:40');
    await X('todo', 'おや、もう十時四十分ですか。そろそろ、お開きに――');
    G.bgm(null);
    G.se('crash'); G.shake(7, 700, true); G.flash('#fff', 500);
    f().vaseBroken = true; f().crash = true;
    await N('――ガシャアァンッ！！', { big: true });
    G.face('me', 'up'); G.face('kujo', 'up'); G.face('todo', 'up');
    await M('な、何の音……！？', 'shock');
    await X('todo', 'い、今のは……！？', 'shock');
    await K('書斎の方角だ。{N}くん、来たまえ！', 'serious');
    await G.walk('kujo', 'U', 1 / 110);
    await G.fadeOut(400);
    await discovery();
  }

  async function discovery() {
    G.time('22:42');
    f().trayPlaced = true;
    G.clearActors();
    G.place('todo', 30, 6, 'up'); G.place('kujo', 28, 5, 'right'); G.place('me', 27, 6, 'right');
    G.place('sanada', 27, 4, 'right'); G.place('masato', 26, 5, 'right'); G.place('fuyuko', 26, 7, 'right'); G.place('suzu', 27, 7, 'right');
    G.cam(29, 5); G.snap();
    G.bgm('tension');
    await G.fadeIn(500);
    await N('書斎の扉を開けた瞬間、むせ返るような熱気が、私たちを包んだ。');
    await N('暖炉の炎が赤々と燃える部屋の中央。鷺沼源一郎が、うつ伏せに倒れていた。');
    await X('suzu', 'ひっ……！ だ、旦那様っ……！', 'shock', { tremble: true });
    await X('masato', '親父……！？ おい、嘘だろ……！', 'shock');
    await X('todo', 'どいてください！ 私が診ます！', 'serious');
    await N('藤堂医師が、源一郎の首筋に指を当てる。長い、長い沈黙。');
    await X('todo', '……駄目だ。亡くなっている。', 'sad');
    await X('todo', 'まだ温かい。……おそらく、ほんの【数分前】でしょう。さっきの物音の時に……。', 'sad');
    await X('fuyuko', 'そんな……旦那様……。', 'sad');
    await X('masato', '誰がやったんだ……！ 誰が親父を！！', 'angry');
    await K('――皆さん、落ち着いて。', 'serious');
    await K('この部屋から出てください。何にも、手を触れずに。');
    await X('masato', 'なんだと？ なんであんたが仕切ってるんだ！', 'angry');
    await K('橋は落ち、電話も通じない。警察が来られるのは、早くても明日の朝だ。');
    await K('それまでの間、犯人が証拠を消していくのを――黙って見ているおつもりですか？', 'serious');
    await X('masato', '……っ。', 'angry');
    await X('sanada', '……九条様の、おっしゃる通りに。皆様、ひとまずサロンへ。', 'sad');
    await X('sanada', '私は廊下に控えております。どなたも、書斎には近づけません。');
    await G.fadeOut(600);
    G.clearActors();
    f().investigating = true;
    G.place('me', 28, 6, 'up');
    G.follow(true); G.place('kujo', 28, 7, 'up');
    G.place('sanada', 29, 10, 'left');
    G.cam(null); G.snap();
    G.bgm('investigate');
    await G.fadeIn(600);
    await K('……さて。', 'serious');
    await K('{N}くん。仕事の時間だ。');
    await M('……はい。', 'serious');
    await K('私の目は二つしかない。君の目も貸してくれ。気になるものは何でも調べて、私に見せるんだ。');
    G.cinema(false);
    G.toast(`調べたい物の前で <b>${document.body.classList.contains('touch') ? 'Aボタン' : 'Z / Enter / Space'}</b>。<br>【✦ 光っている場所】は手がかりの可能性があります。`, 8000);
  }

  async function afterStudy() {
    G.refresh();
    if (studyCount() === 5 && !f().studyDone) {
      f().studyDone = true;
      await K('……この部屋で見るべきものは、あらかた見た。', 'think');
      await K('廊下に出よう。真田さんにも、確かめたいことがある。');
    }
  }
  async function examBody() {
    if (ch() !== 1 || has('blood')) { await N('源一郎の遺体。後頭部の血は、黒く乾きかけている。'); return; }
    await N('うつ伏せに倒れた、源一郎の遺体。後頭部に、深い傷がある。');
    await K('後頭部を一撃。背後から、不意を突かれたな。', 'serious');
    await K('……{N}くん、この血を見たまえ。');
    await M('血……ですか？ うっ……。', 'sad');
    await K('傷口の血も、絨毯に染みた血も――もう、黒く乾きかけている。', 'think');
    await K('流れてから数分の血ではない。……いや、結論を急ぐのはよそう。');
    await G.gain('blood');
    await K('ん……？ 上着の内側に、何か。', 'think');
    await N('九条さんが遺体の上着のボタンを外し、内ポケットの奥から何かを取り出した。');
    await K('懐中時計だ。ガラスが割れている。針は――【十時四十分】で止まっている。');
    await M('十時四十分……！ さっきの物音の時刻と同じです！', 'shock');
    await K('そう見えるね。だが、【竜頭】が引き出されたままだ。', 'think');
    await M('りゅうず……？');
    await K('針を合わせるための、つまみのことさ。こいつを引き出すと、針が止まる。');
    await K('倒れた拍子に、こんなものが都合よく引き出されるとは思えないな。');
    await K('{N}くん。この懐中時計のことは、誰にも言ってはいけない。', 'serious');
    await K('我々二人だけの秘密だ。');
    await M('え？ でも……。');
    await K('――いいね？', 'serious');
    await M('……わかりました。', 'serious');
    await G.gain('watch');
    await afterStudy();
  }
  async function examWeapon() {
    if (has('weapon')) { await N('血の付いたブロンズの置時計。凶器だ。'); return; }
    await N('遺体のそばに、ブロンズ製の置時計が転がっている。');
    await N('その角には、べっとりと血がこびりついていた。');
    await K('これが凶器か。時計商が時計で殴り殺されるとは……皮肉な話だ。', 'serious');
    await K('表面がきれいに拭われている。指紋は期待できないな。', 'think');
    await G.gain('weapon');
    await afterStudy();
  }
  async function examVase() {
    if (has('vase')) { await N('割れた花瓶。周りの絨毯は、まだ濡れている。'); return; }
    await N('暖炉脇の台座の下で、花瓶が粉々に割れている。');
    await M('さっきの大きな音は、これが落ちた音でしょうか。');
    await K('おそらくね。犯人と揉み合った拍子に――と考えるのが自然だが。', 'think');
    await K('{N}くん、足元を。');
    await N('絨毯が、ぐっしょりと濡れていた。');
    await M('花瓶の水がこぼれたんですね。');
    await K('挿してあったのは【ドライフラワー】だ。乾いた花を、水に挿す者はいない。');
    await M('あ……。じゃあ、この水はどこから……？', 'shock');
    await K('良い疑問だ。覚えておきたまえ。', 'smile');
    await G.gain('vase');
    await afterStudy();
  }
  async function examFire() {
    if (has('fire')) { await N('暖炉の炎が、ごうごうと燃えている。部屋は、まるで夏のように暑い。'); return; }
    await N('暖炉には、薪がこれでもかとくべられている。');
    await N('部屋の中はまるで夏のように暑く、じっとしていても汗が滲んでくる。');
    await K('嵐とはいえ、秋の夜に、ここまで火を焚くかね？', 'think');
    await M('旦那様が、寒がりだったんでしょうか。');
    await K('どうかな。……少なくとも、誰かがこの部屋を『暖めたかった』ことは確かだ。');
    await G.gain('fire');
    await afterStudy();
  }
  async function examDesk() {
    if (has('draft')) { await N('源一郎の机。書きかけの手紙が置かれている。'); return; }
    await N('机の上に、書きかけの手紙が残されている。');
    await N('『十年前、静江の命を奪ったのは、病ではない。あの夜の【処方】は――』');
    await N('文章は、そこで途切れていた。');
    await K('明朝の告発のための、下書きだろう。肝心の名前は書かれていないが……。', 'think');
    await K('『処方』か。……覚えておこう。');
    await G.gain('draft');
    await afterStudy();
  }
  async function examTray() {
    await N('扉の脇の小卓に、紅茶の盆が置かれている。カップの中身は、すっかり冷え切っていた。');
  }

  async function trayScene() {
    G.cinema(true);
    G.face('me', 'left');
    await K('真田さん。この紅茶は？');
    G.face('sanada', 'left');
    await X('sanada', '……旦那様にお申し付けいただいた紅茶でございます。【二十二時ちょうど】に、お持ちいたしました。', 'sad');
    await X('sanada', 'ですが、扉をノックしても、お返事がなく……。');
    await K('それで、扉の外に？');
    await X('sanada', 'はい。旦那様はお仕事に集中されている時、お声がけを嫌われます。お返事がない時は、扉の外に置いておくのが決まりでございました。');
    await X('sanada', 'あの時……私が扉を開けていれば……。', 'sad');
    await N('ティーカップに、そっと触れてみる。紅茶は、氷のように冷え切っていた。');
    await G.gain('tea');
    await K('二十二時ちょうど。間違いありませんね？');
    await X('sanada', 'ホールの柱時計が、十回鐘を打ちましたので。間違いございません。');
    await X('sanada', 'それに……旦那様は、あれほど暖炉を焚かれる方ではございませんでした。', 'think');
    // 小推理
    G.face('me', 'up');
    await K('{N}くん。ここで一度、頭を整理しておこう。', 'think');
    await K('藤堂先生は、旦那様は『亡くなって数分』だと言った。つまり、あの十時四十分の物音の時に殺された、と。');
    await K('だが我々は、それと【矛盾するもの】を見たはずだ。……示してくれるかい？');
    const id = await G.present('「死後数分」と矛盾する証拠は？', ['blood', 'tea'], { hint: '遺体そのものを、よく思い出したまえ。あるいは――たった今見つけたものでもいい。', gain: 5 });
    if (id === 'blood') await K('その通り。数分前に流れた血が、あれほど乾いているはずがない。', 'smile');
    else await K('そうだ。二十二時の時点で、旦那様はもう、ノックに答えられなかった……。', 'smile');
    await K('では、もう一つ。あの書斎は、なぜあれほど暑かったと思う？');
    const c = await G.choose(['旦那様が寒がりだったから', '遺体を温かく保ち、死亡時刻をごまかすため', '何かを燃やして、処分するため']);
    if (c === 1) {
      G.trust(5);
      await K('私もそう考える。冷え切った遺体を前にして、『数分前』とは言えないからね。', 'smile');
      await K('……もっとも、理由はそれだけではないかもしれないが。', 'think');
    } else {
      G.trust(-5);
      if (c === 0) await K('真田さんの話を聞いたろう。旦那様は、普段あれほど火を焚かなかった。', 'serious');
      else await K('暖炉の灰に、燃えかすは見当たらなかったよ。', 'serious');
      await K('考えてみたまえ。温かい遺体を見て、藤堂先生は何と言った？ ……そう、『亡くなって数分』だ。');
      await K('部屋を暑くしておけば、遺体はなかなか冷えない。死亡時刻をごまかせる、というわけさ。', 'think');
    }
    await K('十時四十分の物音。乾いた血。冷めた紅茶。……この事件、見かけ通りではない。', 'serious');
    await K('関係者全員から、話を聞く必要がある。――行こう、{N}くん。');
    await ch2();
  }

  /* ------------------------------------------------------------------
     第二章
     ------------------------------------------------------------------ */
  async function ch2() {
    await G.fadeOut(700);
    G.cinema(false);
    STATE.chapter = 2;
    await G.chapter('第二章', '証言', '― 二十三時十分 ―');
    G.time('23:10');
    G.load('1F', 27, 10, 'down');
    G.bgm('investigate');
    await G.fadeIn(700);
    await K('皆には、それぞれの場所で待機してもらった。一人ずつ、話を聞いて回ろう。');
    await K('雅人氏は二階の自室。白瀬さんは図書室。藤堂先生はサロン。すずさんは厨房で、真田さんはホールにいる。');
    await K('話を聞く時は、私も一緒だ。だが――君にしか聞き出せない話も、きっとあるだろう。', 'smile');
    await K('頼りにしているよ、{N}くん。');
    G.toast(`<b>手帳</b>（${document.body.classList.contains('touch') ? 'Bボタン' : 'X / Esc'}）で、集めた証拠品や人物を確認できます。<br>迷ったら、後ろにいる<b>九条に話しかけて</b>みましょう。`, 8500);
  }

  async function talkSanada() {
    const c = ch(), fl = f();
    if (c === 0) { await X('sanada', '食堂は、ホールの左手の扉の先でございます。皆様、もうお揃いでございますよ。'); return; }
    if (c === 1) { await X('sanada', 'どなたも、書斎には近づけません。……どうか、旦那様の無念を。', 'sad'); return; }
    if (fl.detStay && !fl.gotKey) {
      await M('真田さん。藤堂先生の客室の鍵を、お借りできませんか。', 'serious');
      await X('sanada', '藤堂先生の……？', 'shock');
      await N('真田は一瞬、私の目をじっと見つめた。');
      await X('sanada', '……九条様のお考えあってのこと、なのでございますね。', 'serious');
      await X('sanada', 'かしこまりました。こちらが合鍵でございます。');
      fl.gotKey = true;
      G.se('clue');
      G.toast('<b>客室の合鍵</b>を受け取った。', 3500);
      await X('sanada', 'どうか……旦那様の無念を、晴らしてくださいませ。', 'sad');
      return;
    }
    if (fl.gotKey && !has('bag')) { await X('sanada', '藤堂先生の客室は、二階の真ん中のお部屋でございます。どうか、お気をつけて。'); return; }
    if (!fl.sanadaTalked) {
      fl.sanadaTalked = true;
      await X('sanada', '九条様、{N}様。……何なりと、お申し付けください。');
      await K('真田さんは、事件の夜はどちらに？');
      await X('sanada', '九時半から十時前までは、配膳室で銀器を磨いておりました。十時に旦那様に紅茶をお持ちし、その後はすずと厨房に。');
      await X('sanada', '十時四十分のあの音を聞いた時も、すずと一緒でございました。');
      await K('十年前――奥様が亡くなった時のことを、伺っても？', 'think');
      await X('sanada', '……奥様は心臓を患っておられて、ある晩、急に……。', 'sad');
      await X('sanada', '旦那様の悲しみようは、見ていられませんでした。それ以来、取り憑かれたように時計を集めるようになられて……。');
      await X('sanada', '『時計は嘘をつかん』。それが、旦那様の口癖でございました。', 'closed');
      return;
    }
    await X('sanada', '館のことでしたら、何なりとお尋ねください。');
    const k = await G.choose(['旦那様の時計について', '奥様の主治医について', 'いえ、大丈夫です']);
    if (k === 0) {
      await X('sanada', '旦那様は毎朝、館中の時計の針を、ご自分の手で合わせておられました。もちろん、肌身離さぬ懐中時計も。');
      await X('sanada', '一秒の狂いもない――それが、旦那様の誇りでございました。');
    } else if (k === 1) {
      await X('sanada', '藤堂先生でございます。奥様が亡くなられた晩も、先生が往診に。', 'think');
      await X('sanada', '……あの晩の先生は、どこか、ご様子がおかしかったような気も。いえ、余計なことを申しました。', 'sad');
    }
  }

  async function talkSuzu() {
    if (has('suzu')) {
      await X('suzu', 'あの……{N}様。さっきは、ありがとうございました。', 'smile');
      if (!has('ice')) await X('suzu', '氷冷蔵庫は、そこの奥でございます。');
      return;
    }
    if (!f().suzuMet) {
      f().suzuMet = true;
      await N('すずは、厨房の隅で膝を抱えて震えていた。');
      await K('すずさん。少し、話を聞かせてもらえるかな。');
      await X('suzu', 'ひっ……！ わ、私、何も知りません……何も、見てません……！', 'shock', { tremble: true });
      await K('何も見ていない人は、そうは言わないものだ。――何を見た？', 'serious');
      await X('suzu', 'う、うう……っ。', 'sad', { tremble: true });
      await N('すずは、ますます縮こまってしまった。……九条さんは、こういう時、少しも容赦がない。');
      const c = await G.choose(['九条さん、ここは私に任せてください', '（黙って、九条さんに任せる）']);
      if (c === 0) { G.trust(3); await K('……ふむ。では、お手並み拝見といこう。', 'smile'); }
      else {
        await K('すずさん。答えたまえ。', 'serious');
        await X('suzu', 'ごめんなさい、ごめんなさい……っ！', 'sad', { tremble: true });
        await N('……これでは、話にならない。');
        await K('……{N}くん。どうやら、君の出番のようだ。', 'closed');
      }
    } else {
      await X('suzu', '……っ。', 'sad');
    }
    while (true) {
      const c = await G.choose([
        '「見たことを全部話して。隠すと、疑われるよ」',
        '「怖かったね。大丈夫、私たちが必ず守るから」',
        '「犯人を知ってるなら、早く教えて！」',
      ], 'すずに、何と声をかけよう？');
      if (c === 1) break;
      G.trust(-3); SND.se('wrong');
      await X('suzu', 'ひぅ……っ。', 'sad', { tremble: true });
      await N('すずは、また俯いてしまった。……言い方を、変えたほうが良さそうだ。');
    }
    G.trust(5);
    await X('suzu', '……ほんと、ですか……？', 'sad');
    await M('うん。九条さんは怖いけど、すごい探偵なんだ。きっと、犯人を見つけてくれる。', 'smile');
    await K('……『怖い』は余計だ。', 'closed');
    await X('suzu', 'ふふ……っ。', 'smile');
    await N('すずは涙を拭うと、ぽつり、ぽつりと話し始めた。');
    await X('suzu', '……九時五十分くらい、でした。二階に寝具をお運びした帰りに、廊下を通って……。');
    await X('suzu', '廊下の奥の、書斎の前に、誰かが立っていたんです。暗くて、お顔は見えませんでした。', 'sad');
    await X('suzu', 'でも……手に、【黒い鞄】を提げていました。四角くて、大きな……。');
    await K('黒い鞄、か。', 'think');
    await X('suzu', 'その方は、そのまま書斎に入っていかれました。旦那様のお客様だと思って、私、そのまま厨房に……。');
    await X('suzu', 'あの時、誰かにお知らせしていたら……旦那様は……。', 'sad');
    await M('すずちゃんのせいじゃないよ。', 'sad');
    await G.gain('suzu');
    await K('ところで、すずさん。今夜、厨房で何か変わったことは？');
    await X('suzu', '変わったこと……あ、そういえば。', 'think');
    await X('suzu', 'お夕食の後、九時に、お酒用の氷を氷冷蔵庫に用意しておいたんです。大きな塊で。');
    await X('suzu', 'でも、食堂の片付けを終えて九時二十分に戻ったら、氷が半分くらい、なくなっていて……。');
    await X('suzu', 'どなたかが、お酒にお使いになったのかなって……。');
    await K('…………。', 'closed');
    await K('{N}くん。氷冷蔵庫を見ておこう。');
    f().iceHint = true;
  }
  async function examIcebox() {
    if (ch() !== 2) { await N('木製の氷冷蔵庫。上段に氷を入れ、その冷気で食材を冷やす仕組みだ。'); return; }
    if (has('ice')) { await N('氷冷蔵庫の氷塊は、大きく切り取られたままだ。'); return; }
    if (!f().iceHint) {
      await N('木製の氷冷蔵庫。上段に氷を入れ、その冷気で食材を冷やす仕組みだ。');
      await K('……後で、すずさんにも話を聞いてみよう。', 'think');
      return;
    }
    G.se('ice');
    await N('氷冷蔵庫の扉を開ける。ひやりとした冷気が、頬を撫でた。');
    await N('中の氷塊は、まるで鋸で切り取られたように、大きく欠けていた。');
    await K('酒に使うにしては、ずいぶん大きく切り取ったものだ。', 'think');
    await K('二十一時から二十分間、厨房は無人だった。……誰でも、氷を持ち出せたわけだ。');
    await M('氷……。九条さん、まさか、書斎の濡れた絨毯って……！', 'shock');
    await K('ふふ。冴えてきたね、{N}くん。', 'smile');
    await G.gain('ice');
  }

  async function talkFuyuko() {
    if (!f().fuyukoMet) {
      f().fuyukoMet = true;
      await N('冬子は、図書室の窓辺に立ち、外の闇を見つめていた。');
      await X('fuyuko', '……九条さん。それに、{N}さん。', 'sad');
      await X('fuyuko', '私に、何かお聞きになりたいことが？');
    } else await X('fuyuko', '……まだ、何か？');
    while (true) {
      const c = await G.choose([
        { text: '事件の夜の行動について', done: has('fuyuko') },
        { text: '源一郎氏との関係について', done: f().fuyukoSecret },
        { text: '十年前のことについて', done: has('prescription') },
        '話を終える',
      ]);
      if (c === 3) break;
      if (c === 0) await fuyukoNight(); else if (c === 1) await fuyukoRel(); else await fuyuko10();
    }
  }
  async function fuyukoNight() {
    if (has('fuyuko')) { await X('fuyuko', '九時四十分頃に口論が終わって、その十分ほど後に、重い足音が書斎へ……。そして、鈍い音が一度。'); return; }
    await X('fuyuko', '夕食の後は、ずっとこの図書室で、旦那様のお仕事の書類を整理していました。');
    await X('fuyuko', '書斎とは、壁一枚隔てただけですから……九時半過ぎに、雅人さんと旦那様が言い争う声が聞こえました。');
    await X('fuyuko', '九時四十分頃に、扉が乱暴に閉まる音がして、静かになって……。');
    await X('fuyuko', 'それから十分ほどして、廊下を誰かが通りました。ゆっくりとした、重い足音でした。', 'think');
    await K('その足音は、どこへ？');
    await X('fuyuko', '書斎の扉の開く音がしました。少しして……鈍い音が、一度。本でも落ちたのかと……。', 'sad');
    await X('fuyuko', '……あれが、もしかしたら……。', 'sad');
    await K('足音の主に、心当たりは？');
    await X('fuyuko', 'わかりません……。ただ、雅人さんの足音とは違った気がします。あの方は、もっと乱暴に歩きますから。');
    await G.gain('fuyuko');
  }
  async function fuyukoRel() {
    if (f().fuyukoSecret) { await X('fuyuko', '……父は、明日、私を娘として認めてくださるはずでした。', 'sad'); return; }
    await X('fuyuko', '秘書として、五年お仕えしました。……それだけです。');
    await K('それだけ、ですか。', 'think');
    await K('あなたの目元は、旦那様によく似ていらっしゃる。', 'smile');
    await X('fuyuko', '……！', 'shock');
    await N('冬子の肩が、小さく震えた。');
    await X('fuyuko', '……ご存知、だったのですね。', 'sad');
    await X('fuyuko', '私は……旦那様の、娘です。母は、昔この館に勤めていた女中でした。');
    await X('fuyuko', '旦那様は、ずっと私のことを気にかけてくださって……五年前、秘書として呼んでくださったんです。');
    await X('fuyuko', '明日、正式に私を認知すると、そうおっしゃっていたのに……。', 'sad');
    await M('冬子さん……。', 'sad');
    f().fuyukoSecret = true;
    await X('fuyuko', '……私に動機があると、お思いですか？ 遺産のために、と。', 'serious');
    await K('いいえ。明日認知される方が、今夜父親を殺す理由はない。', 'closed');
    await X('fuyuko', '……ありがとうございます。', 'sad');
  }
  async function fuyuko10() {
    if (has('prescription')) { await X('fuyuko', '処方箋の写しは、旦那様から託されたものです。……どうか、役立ててください。'); return; }
    if (!f().fuyukoSecret) {
      await X('fuyuko', '……それは、鷺沼家の問題です。一介の秘書の私が、申し上げることでは。', 'serious');
      await N('冬子は、それきり口を閉ざしてしまった。');
      await K('（……彼女自身について、もう少し知る必要がありそうだね。）', 'think');
      return;
    }
    await X('fuyuko', '十年前……静江奥様のこと、ですね。', 'sad');
    await X('fuyuko', '奥様は心臓を患っておられました。主治医は……当時から、藤堂先生です。');
    await X('fuyuko', '三ヶ月前、旦那様から古い書類を探すよう頼まれました。奥様の、最後のお薬の処方箋です。');
    await X('fuyuko', '旦那様は写しを一部、私に預けていかれました。『儂に何かあったら、これを九条君に渡せ』と。', 'think');
    await N('冬子は、震える手で一枚の紙を差し出した。');
    await G.gain('prescription');
    await K('……心臓の薬が、通常の十倍。そして処方医の署名は……。', 'think');
    await K('――なるほど。', 'closed');
    await M('九条さん、これって……！', 'shock');
    await K('まだだ、{N}くん。まだ、ピースが足りない。', 'serious');
  }

  async function talkMasato() {
    if (has('masato')) { await X('masato', 'まだ何かあるのかよ。……一人にしてくれ。', 'sad'); return; }
    await N('雅人は、ウイスキーの瓶を片手に、寝台に腰を沈めていた。');
    await X('masato', '……なんだよ。探偵さんか。俺を疑ってるんだろ。', 'angry');
    await K('事件の前後、どこで何をしていたか。お聞かせ願えますか。');
    await X('masato', '……ずっとこの部屋で飲んでたよ。一人でな。アリバイなんかねぇ。');
    await K('ずっと、ですか？', 'think');
    await X('masato', '…………。');
    const c = await G.choose(['正直に話してください。お父様のためにも', '隠すと、ますます疑われますよ', '（黙って、待つ）']);
    if (c === 0) { G.trust(3); await X('masato', '……親父のため、か。……ちっ。', 'sad'); }
    else if (c === 1) await X('masato', '脅しかよ。……わかったよ。', 'angry');
    else await N('沈黙に耐えかねたように、雅人が口を開いた。');
    await X('masato', '……九時半頃、書斎に行った。金の話だ。借金があってな。親父に、頭を下げに行ったんだよ。');
    await X('masato', '結果はご覧の通りさ。『お前にやる金など一銭もない、出て行け』だとよ。', 'angry');
    await X('masato', '十分くらい怒鳴り合って、【九時四十分頃】に書斎を出た。それからは、ここで飲んでた。');
    await K('その時、お父上は？');
    await X('masato', 'ピンピンしてたさ。俺の背中に、『出て行け』って怒鳴ってたんだからな。');
    await X('masato', '……明日の告発ってのも、俺の借金のことだと思ってたんだ。だから、正直……。', 'sad');
    await X('masato', '……俺は殺してない。親父とは喧嘩ばかりだったが……殺すわけ、ないだろ。', 'sad');
    f().masatoTalked = true;
    await G.gain('masato');
    await K('ご協力、感謝します。');
  }

  async function talkTodo() {
    const fl = f();
    if (fl.detStay) {
      await X('todo', '九条さんと、少しお話をしておったところです。……何か？', 'smile');
      await K('{N}くん。……頼んだ用事は、済んだのかい？', 'smile');
      return;
    }
    if (!has('todoAlibi')) {
      await X('todo', 'やあ、九条さん。……ひどい夜になってしまいましたな。', 'sad');
      await K('先生にも、お話を伺いたい。夕食の後、サロンにいらっしゃるまでは？');
      await X('todo', '二階の客室で、本を読んでおりました。九時四十五分頃から、十時十分頃まででしたかな。');
      await X('todo', 'それからサロンに下りて、あなたと一局。……ご存知の通りです。');
      await X('todo', '十時四十分、私は九条さん、あなたの目の前にいた。あなた方こそが、私の証人ですよ。', 'smile');
      await K('ええ。よく存じていますとも。', 'smile');
      await X('todo', '犯人は……言いにくいが、雅人君ではないかね。金に困っていたと聞くし、あの通り激しい気性だ。', 'think');
      await G.gain('todoAlibi');
      return;
    }
    if (has('suzu') && has('ice') && !has('slip')) {
      await K('先生。もう一つ、医師としてのご意見を伺いたいのですが。');
      await X('todo', '何なりと。');
      await K('実は、現場には犯行時刻を示すものが、何一つ残っていなかった。そこで先生の診立てが、唯一の手がかりになるのですが……。', 'think');
      await X('todo', '何一つ？ いや、そんなはずは――', 'shock');
      await X('todo', '源一郎さんの【懐中時計】が、十時四十分で止まっていたでしょう。あれこそ何よりの証拠では――', 'serious');
      G.bgm(null); G.se('sting'); G.flash('#fff', 250);
      await N('――！');
      await N('懐中時計。九条さんが遺体の内ポケットの奥から見つけ、誰にも明かさなかったもの。');
      await N('九条さんは、表情一つ変えなかった。けれど、その目が一瞬だけ、私を見た。');
      await K('……なるほど。参考になりました、先生。', 'closed');
      await X('todo', '……？ ええ。お役に立てたなら。', 'smile');
      await G.gain('slip');
      G.bgm('investigate');
      await N('九条さんが、私の耳元に顔を寄せた。');
      await K('（{N}くん。……先生は、私がここで引き留めておく）', 'serious');
      await K('（その間に、先生の客室を調べてきてくれ。鍵は、ホールの真田さんが持っているはずだ）');
      await K('（――頼んだよ）', 'smile');
      fl.detStay = true; G.follow(false);
      G.refresh();
      return;
    }
    if (has('slip')) { await X('todo', '……私の顔に、何かついておりますかな？', 'smile'); return; }
    await X('todo', '何か分かりましたかな？ 私にできることがあれば、何でも言ってください。', 'smile');
  }

  async function examBag() {
    if (has('bag')) { await N('黒い往診鞄。内側が、じっとりと湿っている。'); return; }
    await N('机の脇に、黒い革の往診鞄が置かれている。');
    await N('四角くて、大きな――すずちゃんが見たという鞄と、同じ形だ。');
    await N('留め金を外し、中を覗いてみる。');
    await N('……冷たい。');
    await N('鞄の内張りがじっとりと湿り、底には、まだ冷たい水が溜まっていた。');
    await M('（雨に濡れたなら、濡れるのは外側のはず。内側だけが、こんなに……）', 'think');
    await M('（まるで、何か冷たいものを入れて運んだみたいに……）', 'shock');
    await G.gain('bag');
    await M('（早く、九条さんに知らせないと！）', 'serious');
  }

  async function detStayTalk() {
    if (!has('bag')) {
      await K('先生のことは任せたまえ。', 'smile');
      await K(f().gotKey ? '客室は二階の、真ん中の部屋だ。急いでくれ。' : '客室の鍵は、ホールの真田さんが持っているはずだ。');
      return;
    }
    await K('……戻ったか。どうだった？');
    await M('（小声で）往診鞄の内側が、湿っていました。底に、冷たい水が……。', 'serious');
    await K('――そうか。', 'closed');
    f().detStay = false; G.follow(true);
    if (!allDone()) {
      await K('ご苦労だった。……だが、まだ話を聞いていない人が残っている。全ての証言を揃えてからだ。');
      G.refresh();
      return;
    }
    await toCh3();
  }

  async function toCh3() {
    await K('ご苦労だった、{N}くん。', 'smile');
    await K('……これで、全ての時計の針が揃った。', 'serious');
    await K('真田さんに頼んで、館の全員をサロンに集めてもらおう。');
    await K('――謎解きの時間だ。', 'smile');
    await ch3();
  }

  async function hint() {
    const c = ch(), fl = f();
    if (c === 0) { await K('まずは館の主に挨拶だ。食堂は、ホールの左手の扉だよ。'); return; }
    if (c === 1) {
      if (!fl.crash) { await ch1Talk(); return; }
      const left = [];
      if (!has('blood')) left.push('遺体'); if (!has('weapon')) left.push('凶器'); if (!has('vase')) left.push('割れた花瓶');
      if (!has('fire')) left.push('暖炉'); if (!has('draft')) left.push('机の上');
      if (left.length) await K(`まだ見ていないものがあるね。${left.join('、')}……光っている所を、よく見てみたまえ。`, 'think');
      else await K('この部屋はもう十分だ。廊下へ出よう。');
      return;
    }
    if (c === 2) {
      if (fl.detStay) {
        if (!has('bag')) await K(fl.gotKey ? '（藤堂先生の客室は、二階の真ん中だ。私はサロンで先生を引き留めておく）' : '（客室の鍵は、ホールの真田さんが持っているはずだ）', 'serious');
        else await M('（早く、サロンの九条さんに報告しよう。）', 'serious');
        return;
      }
      if (allDone()) { await toCh3(); return; }
      const need = [['masato', '雅人氏（二階の自室）'], ['fuyuko', '白瀬さん（図書室）'], ['suzu', 'すずさん（厨房）'], ['todoAlibi', '藤堂先生（サロン）']].filter(([i]) => !has(i)).map(x => x[1]);
      let said = false;
      if (need.length) { await K(`まだ話を聞いていないのは、${need.join('、')}だね。`, 'think'); said = true; }
      if (fl.iceHint && !has('ice')) { await K('厨房の氷冷蔵庫も、確かめておこう。すずさんの話が気になる。', 'think'); said = true; }
      if (has('fuyuko') && !has('prescription')) { await K('白瀬さんは、まだ何か隠している。彼女自身のこと、そして十年前のこと……もう一度、聞いてみる価値はある。', 'think'); said = true; }
      if (!said && !has('slip')) {
        if (has('suzu') && has('ice')) { await K('……{N}くん。もう一度、藤堂先生と話をしよう。', 'think'); await K('少し、試してみたいことがあるんだ。', 'smile'); }
        else await K('焦らなくていい。一つずつ、確かめていこう。');
      } else if (!said) await K('……あと少しだ。');
      if (Math.random() < 0.35) {
        const muse = ['時計は嘘をつかない。嘘をつくのは、いつだって人間だ。', '十時四十分……あまりに出来すぎていると思わないかい？', '黒い鞄。濡れた絨毯。消えた氷。……点と点は、いずれ線になる。'];
        await K(muse[Math.floor(Math.random() * muse.length)], 'think');
      }
    }
  }

  /* ------------------------------------------------------------------
     最終章：推理
     ------------------------------------------------------------------ */
  function salonSetup() {
    G.clearActors();
    G.place('todo', 34, 14, 'down'); G.place('masato', 32, 14, 'down'); G.place('fuyuko', 36, 15, 'left');
    G.place('sanada', 37, 17, 'left'); G.place('suzu', 37, 18, 'left');
    G.place('kujo', 32, 18, 'up'); G.place('me', 31, 19, 'up');
    G.cam(33.5, 16.5); G.snap();
  }
  async function T(who, text, e, o) { G.spot(who); return G.say(who, text, e, o); }

  async function ch3() {
    await G.fadeOut(900);
    G.cinema(true); G.follow(false);
    STATE.chapter = 3;
    G.bgm(null);
    await G.chapter('最終章', '時計は嘘をつかない', '― 午前零時 ―');
    G.load('1F', 31, 19, 'up');
    G.cinema(true);
    salonSetup();
    G.time('00:00');
    G.bgm('tension');
    await G.fadeIn(900);
    await N('午前零時。サロンに、館の全員が集められた。');
    await T('masato', 'こんな夜中に呼び集めて、何のつもりだ。', 'angry');
    await T('kujo', 'お集まりいただいたのは、他でもない。', 'serious');
    await T('kujo', '――鷺沼源一郎氏を殺害した犯人が、分かりました。', 'serious');
    await T('suzu', 'えっ……！', 'shock');
    await T('fuyuko', '本当、ですか……？', 'shock');
    await T('todo', 'ほう……。それは是非、伺いたいですな。', 'smile');
    await T('kujo', 'では、始めましょう。{N}くん、手帳の準備を。');
    await T('me', 'はい！', 'serious');
    G.bgm('deduction');
    G.toast('<b>推理パート</b>：九条の求めに応じて、手帳から証拠品を提示しよう。', 6000);

    // --- 1. 犯行時刻 ---
    await T('kujo', 'まず、犯行時刻です。');
    await T('kujo', '十時四十分、我々は書斎からの物音を聞いた。駆けつけると旦那様が倒れていて、藤堂先生は『亡くなって数分』と診立てられた。');
    await T('kujo', '誰もがこう考えた。犯行は十時四十分だ、と。');
    await T('kujo', '――しかし、それは誤りです。', 'serious');
    await T('masato', '誤り……？', 'shock');
    await T('kujo', '{N}くん。旦那様が『数分前』に亡くなったのではないことを示す証拠を。');
    await G.present('「死後数分」を否定する、遺体の証拠は？', ['blood'], { alt: { tea: 'それも大事な証拠だ。だが、まずは遺体そのものが語る声を聞こう。' }, hint: '遺体の傷口を思い出したまえ。駆けつけた時、それはどんな状態だった？' });
    await T('kujo', '傷口の血は、我々が駆けつけた時には既に黒く乾きかけていた。流れて数分の血では、あり得ない。');
    await T('todo', '暖炉の熱で、乾きが早まったのでしょう。あの部屋は異常に暑かった。', 'smile');
    await T('kujo', 'なるほど、暖炉の熱。……では先生、遺体が温かかったのも、暖炉の熱のせいかもしれませんね？', 'smile');
    await T('todo', '……っ。', 'serious');
    await T('kujo', 'では、旦那様はいつ亡くなったのか。それを示す証拠が、もう一つあります。');
    await G.present('旦那様がもっと前に亡くなっていたことを示す証拠は？', ['tea'], { hint: '二十二時に、書斎の扉の前で何があった？' });
    await T('kujo', '二十二時ちょうど。真田さんは書斎に紅茶を運び、扉をノックした。しかし、返事はなかった。');
    await T('sanada', '……はい。あの時、既に旦那様は……。', 'sad');
    await T('kujo', 'では逆に、旦那様が【確実に生きていた】最後の時刻は？');
    await G.present('旦那様が生きていた最後の時刻を示す証言は？', ['masato', 'fuyuko'], { hint: '書斎で、旦那様と言い争った人物がいたね。' });
    await T('kujo', '九時四十分。旦那様は雅人氏と口論し、『出て行け』と怒鳴った。白瀬さんも、その声を聞いている。');
    await T('masato', 'あ、ああ。その通りだ。', 'shock');
    await G.timeline([
      { t: '21:40', text: '源一郎、生存\n（雅人と口論）' },
      { t: '21:50', text: '書斎へ向かう足音', cls: 'key' },
      { t: '22:00', text: '紅茶を届ける\n返事なし' },
      { t: '22:40', text: '書斎で物音\n（偽りの犯行時刻）', cls: 'bad' },
    ], ['21:40', '22:00', '真の犯行時刻']);
    await T('kujo', '犯行は、九時四十分から十時までの二十分間。これが、真の犯行時刻です。', 'serious');

    // --- 2. 物音のトリック ---
    await T('todo', '待ってください。では、十時四十分のあの物音は何だったと？ 誰もいない部屋で、物が勝手に落ちたとでも？', 'angry');
    await T('kujo', 'その通りです、先生。物が『勝手に』落ちた。――そう、仕組まれていた。', 'smile');
    await T('kujo', '{N}くん。仕掛けの痕跡を。');
    await G.present('十時四十分の物音の正体を示す証拠は？', ['vase'], { hint: '書斎に、あるはずのない水があったね。' });
    await T('kujo', '割れた花瓶の周りの、濡れた絨毯。挿してあったのはドライフラワー。水など、入っていなかった。');
    await T('kujo', 'では、あの水はどこから来たのか。……答えは、【氷】です。');
    await T('fuyuko', '氷……？', 'shock');
    await T('kujo', '犯人は台座の上の花瓶を傾け、その下に氷の塊を噛ませた。氷が溶ければ、花瓶は支えを失って落ちる。');
    await T('kujo', '時限装置ですよ。それも、溶けてしまえば水しか残らない、極めて上等な。', 'smile');
    await T('kujo', 'そして、その氷の出所は――');
    await G.present('仕掛けに使われた氷の出所は？', ['ice'], { hint: 'すずさんの話を思い出したまえ。厨房で、何が消えていた？' });
    await T('suzu', 'あ……私の用意した、氷……。', 'shock');
    await T('kujo', '九時から二十分間、無人だった厨房。犯人はそこで、氷を切り出したのです。');
    await T('kujo', 'さらに犯人は、氷が予定通りの時刻に溶けるよう、もう一つ細工をしています。');
    await G.present('氷の溶ける速さを早めた細工は？', ['fire'], { hint: 'あの書斎は、なぜあれほど暑かった？' });
    await T('kujo', '書斎の暖炉です。薪を山ほどくべたのは、遺体を温かく保って死亡時刻をごまかすため。');
    await T('kujo', 'そして、氷を早く溶かし、物音の時刻を調節するためだった。', 'serious');

    // --- 3. 犯人の指名 ---
    await T('kujo', 'こう考えれば、犯人の狙いは明らかです。');
    await T('kujo', '十時四十分を犯行時刻に見せかけ、その時刻に、完璧なアリバイを作ること。');
    await T('kujo', '十時四十分。この館で、最も揺るぎないアリバイを持っていた人物は――誰です？', 'serious');
    let tries = 0;
    while (true) {
      const who = await G.pickPerson('十時四十分に、最も確かなアリバイを持っていたのは？', ['masato', 'fuyuko', 'sanada', 'suzu', 'todo']);
      if (who === 'todo') break;
      tries++; SND.se('wrong'); G.shake(3, 300, true); G.trust(-6);
      if (who === 'masato') await T('kujo', '雅人氏は、一人で自室にいた。アリバイがないのだよ。', 'serious');
      else if (who === 'fuyuko') await T('kujo', '白瀬さんも、図書室で一人だった。', 'serious');
      else await T('kujo', '真田さんとすずさんは、互いのアリバイを証言できる。だが……もっと『確かな』証人がいた人物がいるだろう？', 'think');
      if (tries >= 2) await T('kujo', '思い出したまえ。十時四十分、【私たちの目の前】にいたのは誰だった？', 'think');
    }
    if (!tries) G.trust(5);
    G.bgm(null);
    await G.cutin('犯人は――', null, 1100);
    G.spot('todo'); G.se('sting'); G.shake(5, 600, true);
    await T('kujo', '藤堂恭介先生。――あなたです。', 'serious');
    await N('サロンが、水を打ったように静まり返った。');
    await T('todo', '…………。', 'closed');
    await T('todo', '……ははは。これは驚いた。私が？', 'smile');
    await T('todo', '九条さん、お忘れか。十時四十分、私はあなたとチェスを指していた。あなた自身が、私の証人ですよ。', 'smile');
    await T('kujo', 'ええ。だからこそ、です。');
    await T('kujo', 'あなたは私を――探偵を、アリバイの証人に選んだ。これ以上確かな証人は、いませんからね。');
    await T('kujo', 'チェスの間、あなたは何度も時刻を尋ねた。そして十時四十分、まるで待っていたかのように、音が鳴った。');
    await T('kujo', '我々の記憶に、『十時四十分』を刻みつけるために。', 'serious');
    G.bgm('deduction');
    await T('todo', '馬鹿馬鹿しい！ 私は九時四十五分から十時十分まで、二階の客室で本を読んでいたのだ！', 'angry');
    await T('kujo', '本当にそうでしょうか。その時刻、書斎へ向かう人物を【見た者】がいます。');
    await G.present('藤堂の証言を崩す、目撃証言は？', ['suzu'], { alt: { fuyuko: '白瀬さんが聞いたのは足音だけだ。もっと、はっきりと姿を見た証言があったはずだよ。' }, hint: '九時五十分、廊下にいたのは誰だった？' });
    await T('suzu', 'は、はい……。九時五十分頃、黒い鞄を提げた方が、書斎に……。', 'sad', { tremble: true });
    await T('todo', '黒い鞄！？ そんなもの、どこにでもある！ それが私の鞄だという証拠が、どこにある！', 'angry');
    await T('kujo', '{N}くん。');
    await G.present('黒い鞄が、藤堂の鞄であることを示す証拠は？', ['bag'], { hint: '君が、二階で見つけてきたものだよ。' });
    await T('kujo', '先生の往診鞄です。内張りが湿り、底には冷たい水が溜まっていた。');
    await T('kujo', '雨に濡れたのなら、濡れるのは外側だ。内側だけが冷たく湿っている理由は、一つ。', 'serious');
    await T('kujo', '――【氷を入れて運んだ】からです。');
    await T('todo', 'ぐ……っ。そ、それは……。', 'shock', { tremble: true });
    await T('todo', 'だ、だが動機は！ 私が源一郎さんを殺して、何の得がある！ 二十年来の友人だぞ！', 'angry');
    await G.present('藤堂の動機を示す証拠は？', ['prescription'], { alt: { draft: 'その手紙には、名前がなかった。名前が記されたものが、他にあったはずだ。' }, hint: '十年前。静江夫人の死に関わるものだ。' });
    await T('kujo', '十年前、静江夫人に出された処方箋の写しです。心臓の薬が、通常の十倍。署名は――藤堂恭介。');
    await T('fuyuko', '旦那様は……ずっと、それを調べていらしたんです。先生のことを、最後まで信じたいと……。', 'sad');
    await T('kujo', '静江夫人は、病で亡くなったのではない。あなたの処方の誤りで亡くなった。そしてあなたは、それを十年間隠し続けた。', 'serious');
    await T('kujo', '明朝、旦那様はそれを告発するつもりだった。……あなたには、それを止める理由があった。');
    await T('todo', '…………。', 'closed');
    await T('todo', '……全て、推測だ。', 'serious');
    await T('todo', '氷も、鞄も、処方箋も。状況証拠ばかりではないか！ 私が手を下したという証拠など、どこにもない……！', 'angry');
    await T('kujo', '――いいえ。証拠なら、あります。', 'serious');
    await T('kujo', '先生。あなたは、ご自身の口で語ってくださった。');
    await T('kujo', '{N}くん。――とどめだ。', 'smile');
    await G.present('藤堂が犯人であることを示す、決定的な証拠は？', ['slip'], { alt: { watch: '惜しい。時計そのものではない。その時計について、【誰が何を言ったか】だ。' }, hint: '我々二人しか知らないはずのことを、口にした人物がいたね。', cut: 'これが証拠だ！', cutMs: 1700, gain: 8 });
    await T('kujo', '先生は、こうおっしゃいましたね。『源一郎さんの懐中時計が、十時四十分で止まっていた』と。');
    await T('todo', 'そ、それがどうした。現場で見たのだ。遺体を診た時に……！', 'shock');
    await T('kujo', 'あの懐中時計は、上着の内ポケットの奥にあった。ボタンを外さねば、決して見えない場所です。');
    await T('kujo', 'あなたが遺体を診た時、触れたのは首筋だけ。私はずっと、あなたの手元を見ていた。');
    await T('kujo', 'そして私は、懐中時計のことを誰にも話していない。知っているのは、私と{N}くんだけだ。');
    await T('kujo', 'では、なぜあなたは知っていたのか。');
    G.se('heart');
    await T('kujo', '答えは一つ。【あなた自身が】、あの時計の針を十時四十分に合わせ、竜頭を引いて止めたからだ。', 'serious');
    G.se('strike'); G.shake(8, 700, true); G.flash('#fff', 400);
    await T('todo', 'あ……ああ……。', 'shock', { tremble: true });
    G.bgm(null);
    await T('kujo', 'あの夜、何が起きたのか。――全てを、お話ししましょう。', 'closed');
    await reenact();

    // --- 告白 ---
    f().solved = true;
    G.bgm('truth');
    await N('長い沈黙の後。藤堂が、がくりと膝をついた。');
    await T('todo', '……十年前の、あの晩。私は、酒を飲んでいた。', 'sad');
    await T('todo', '急患の報せに、酔いの残る手で処方箋を書いた。……桁を、一つ間違えた。', 'sad');
    await T('todo', '気づいた時には、もう遅かった。静江さんは……。', 'closed');
    await T('todo', '怖かった。全てを失うのが。医師の地位も、病院も、私を頼ってくれる患者たちも……。', 'sad');
    await T('todo', 'だから、隠した。十年間、源一郎さんの隣で、友人の顔をして……。', 'sad');
    await T('todo', '三ヶ月前、彼が古い処方箋を探していると知った。……もう、終わりだと思った。', 'closed');
    await T('todo', '明日には、全てが明るみに出る。だから……今夜しか、なかったんだ……！', 'sad', { tremble: true });
    await T('masato', 'てめぇ……っ！ 親父を、お袋を……！！', 'angry', { tremble: true });
    await T('kujo', '雅人さん。', 'serious');
    await T('masato', '……っ、くそ……っ！', 'sad');
    await T('kujo', '……藤堂先生。あなたは、守るべきものがあったと言った。', 'closed');
    await T('kujo', 'だが、あなたが守ったのは、病院でも患者でもない。――自分の名前だけだ。', 'serious');
    await T('kujo', 'そのために二人の命を奪い、二十年の友情を踏みにじった。', 'serious');
    await T('kujo', '時計は嘘をつかない。嘘をつくのは、いつだって人間です。', 'closed');
    await T('todo', '…………。', 'closed');
    G.spot(null);
    await N('藤堂は顔を覆い、それきり、二度と口を開かなかった。');
    G.rain(0.4);
    await N('窓の外で、雨音が、少しずつ弱まっていった。');
    await epilogue();
  }

  async function reenact() {
    await G.fadeOut(700);
    G.spot(null); G.flashback(true);
    const fl = f();
    fl.vaseBroken = false; fl.trayPlaced = false; fl.bodyHidden = true;
    G.clearActors(false);
    const SP = 1 / 230;
    // 1. 厨房
    G.place('todo', 8, 3, 'up'); G.cam(6, 5); G.snap();
    G.bgm('tension');
    await G.fadeIn(700);
    await N('――午後九時。厨房。');
    await K('夕食の片付けで、厨房が空になった、わずか二十分。', 'serious');
    G.se('ice');
    await K('あなたはその隙に氷冷蔵庫から氷を切り出し、往診鞄に詰めた。');
    await G.walkTo('todo', 5, 3, 'xy', SP); await G.walkTo('todo', 5, 9, 'yx', SP);
    G.remove('todo');
    // 2. 廊下
    await G.fadeOut(400);
    G.place('suzu', 19, 10, 'right'); G.place('todo', 21, 9, 'right'); G.cam(24, 9); G.snap();
    await G.fadeIn(400);
    await N('――午後九時五十分。一階廊下。');
    await K('そしてあなたは、鞄を提げて書斎へ向かった。');
    await G.walkTo('todo', 27, 9, 'xy', SP);
    G.face('todo', 'up');
    await K('その後ろ姿を、すずさんが見ていた。');
    G.se('door');
    await G.walk('todo', 'UU', SP);
    G.remove('todo');
    // 3. 書斎
    await G.fadeOut(400);
    G.remove('suzu');
    G.place('genichiro', 30, 5, 'up'); G.place('todo', 27, 7, 'up'); G.cam(30, 4); G.snap();
    await G.fadeIn(400);
    await N('――書斎。');
    await K('旦那様は、長年の主治医であるあなたに、背を向けた。……何一つ、疑うことなく。', 'closed');
    await G.walk('todo', 'RRR', SP); await G.walk('todo', 'U', SP);
    G.face('todo', 'up');
    await G.wait(400);
    G.flash('#900', 600); G.se('strike'); G.shake(6, 500, true);
    G.remove('genichiro'); fl.bodyHidden = false;
    await G.wait(900);
    await K('凶器は、机の上の置時計。……一撃だった。', 'closed');
    await K('あなたは旦那様の懐中時計の針を十時四十分に合わせ、竜頭を引いて止めた。');
    await G.walk('todo', 'RRUUU', SP);
    G.face('todo', 'up'); G.se('ice');
    await K('台座の花瓶を傾け、その下に氷を噛ませた。溶ければ落ちる――時限装置の完成だ。');
    await G.walk('todo', 'LLU', SP);
    G.face('todo', 'up');
    await K('仕上げに、暖炉へ薪を山ほどくべた。遺体を温め、氷を早く溶かすために。');
    await G.walk('todo', 'DLLLDDDDD', SP);
    G.remove('todo');
    await K('そして客室に戻り、何食わぬ顔でサロンに下りてきた。――私と、チェスを指すために。', 'serious');
    // 4. 二十二時
    await G.fadeOut(400);
    G.place('sanada', 21, 9, 'right'); G.cam(25, 8); G.snap();
    await G.fadeIn(400);
    await N('――午後十時。');
    await G.walkTo('sanada', 27, 9, 'xy', SP);
    G.face('sanada', 'up');
    await K('真田さんは紅茶を運び、扉をノックした。');
    G.se('knock');
    await G.wait(1300);
    fl.trayPlaced = true;
    await K('……返事は、なかった。', 'closed');
    await G.walk('sanada', 'DLLLLL', SP);
    G.remove('sanada');
    // 5. 二十二時四十分
    await G.fadeOut(400);
    G.cam(31, 3); G.snap();
    await G.fadeIn(400);
    await N('――午後十時四十分。');
    await G.wait(900);
    fl.vaseBroken = true;
    G.se('crash'); G.shake(6, 500, true); G.flash('#fff', 300);
    await G.wait(600);
    await K('溶けた氷が、花瓶を落とし――あなたの『アリバイ』が、完成した。', 'serious');
    await G.fadeOut(900);
    G.flashback(false);
    W.P.visible = true;
    salonSetup();
    G.spot('todo');
    await G.fadeIn(800);
  }

  /* ------------------------------------------------------------------
     終章
     ------------------------------------------------------------------ */
  async function epilogue() {
    await G.fadeOut(1400);
    G.spot(null); G.storm(false); G.rain(0); G.bgm(null);
    STATE.chapter = 4;
    f().bodyHidden = true;
    await G.chapter('終章', '夜明け', '');
    G.load('1F', 19, 22, 'up');
    G.cinema(true);
    G.clearActors();
    G.place('kujo', 20, 22, 'up');
    G.place('sanada', 19, 20, 'down'); G.place('fuyuko', 17, 20, 'down'); G.place('masato', 16, 21, 'right'); G.place('suzu', 21, 20, 'down');
    G.cam(19, 20.5); G.snap();
    G.time('06:12');
    G.bgm('ending');
    await G.fadeIn(1600);
    await N('翌朝。嵐は嘘のように過ぎ去り、雲間から朝日が差し込んでいた。');
    await N('水の引いた橋を渡って警察が到着し、藤堂恭介は連行されていった。');
    await X('sanada', '九条様、{N}様。……本当に、ありがとうございました。', 'sad');
    await X('fuyuko', '旦那様の……いえ、父の無念を晴らしてくださって、感謝いたします。', 'smile');
    await X('fuyuko', '雅人さんとも、これからのことを話してみます。……たった二人の、家族ですから。', 'smile');
    await X('masato', '……ふん。', 'closed');
    await X('masato', '……親父の仇、取ってくれて。……ありがとな、探偵さん。それに、助手さんも。', 'sad');
    await X('suzu', '{N}様！ あの……また、いらしてくださいね！', 'smile');
    await K('ええ。……いつか、穏やかな季節に。', 'smile');
    await K('行こうか、{N}くん。');
    await G.fadeOut(900);
    G.clearActors();
    G.place('me', 19, 24, 'down'); G.place('kujo', 20, 24, 'down');
    G.cam(19.5, 22); G.snap();
    await G.fadeIn(900);
    await M('九条さん。一つ、聞いてもいいですか。');
    G.face('kujo', 'left'); G.face('me', 'right');
    await K('なんだい。');
    await M('懐中時計のこと。どうして、誰にも言うなって言ったんですか？', 'think');
    await M('最初から、藤堂先生を疑っていたんですか？');
    await K('疑っていた、というほどではないさ。ただ……', 'think');
    await K('十時四十分。あまりに出来すぎていた。まるで誰かが、その時刻を我々に見せたがっているようにね。');
    await K('時刻を偽りたい者がいるなら、偽りの時計の存在を知っている者こそが犯人だ。……だから、伏せた。', 'smile');
    await M('……最初から、罠を張っていたんですね。', 'shock');
    await K('それに――君がいた。');
    await M('え？', 'shock');
    if (STATE.trust >= 72) {
      await K('すずさんの証言も、往診鞄も。私一人では辿り着けなかった。', 'smile');
      await K('……君がいてくれて、助かったよ。{N}くん。', 'smile');
    } else {
      await K('君がいたから、私は推理に集中できた。……まあ、もう少し精進は必要だがね。', 'smile');
    }
    await M('……！ はい！', 'smile');
    await K('さあ、帰ろう。腹が減った。朝食は君の奢りだ。', 'smile');
    await M('ええっ、なんでですか！？', 'shock');
    await G.fadeOut(1400);
    await G.mono([
      '――こうして、黒鷺館の長い夜は終わった。',
      '時計は嘘をつかない。嘘をつくのは、いつだって人間だ。',
      'そして、その嘘を暴くのが探偵という仕事なのだと――\nあの人の背中は、教えてくれた。',
      '探偵助手 {N} の手記より',
    ]);
    W.mode = 'blank';
    G.cinema(false);
    await showResult();
  }

  /* ------------------------------------------------------------------
     イベント定義
     ------------------------------------------------------------------ */
  const notYet = async () => { await K('屋敷の探索は後にしよう。まずは館の主に挨拶だ。食堂はホールの左手だよ。'); };
  const EVENTS = {
    '1F': [
      { at: [[19, 11], [20, 11], [26, 16], [24, 12], [25, 12]], when: () => ch() === 0, solid: true, bump: notYet },
      { at: [[13, 16]], when: () => ch() === 0 && !f().dinner, step: dinner },
      { at: [[29, 11], [26, 16]], when: () => ch() === 1 && !f().crash, solid: true, bump: async () => { await M('（今夜は、九条さんのそばにいよう。）', 'think'); } },
      { at: [[24, 12], [25, 12]], when: () => ch() === 2, step: async () => { await G.warp('2F', 27, 8, 'left'); } },
      { at: [[27, 8]], when: () => ch() === 1 && f().investigating && studyCount() < 5, solid: true, bump: async () => { await K('待ちたまえ。この部屋は、まだ多くを語っていない。', 'serious'); } },
      { at: [[27, 9]], when: () => ch() === 1 && f().investigating && studyCount() >= 5, step: trayScene },
      { at: [[27, 8]], when: () => ch() === 2, solid: true, bump: async () => { await K('現場はもう十分に見た。今は、証言を集めよう。'); } },
      // 書斎
      { at: [[30, 5], [31, 5]], sprite: 'body', when: () => ch() >= 1 && ch() < 4 && f().crash && !f().bodyHidden, check: examBody, clue: () => ch() === 1 && !has('blood') },
      { at: [[29, 6]], sprite: 'weapon', when: () => ch() >= 1 && ch() < 4 && f().crash && !f().bodyHidden, check: examWeapon, clue: () => ch() === 1 && !has('weapon') },
      { at: [[32, 3]], sprite: 'shards', when: () => f().vaseBroken && ch() < 4, check: examVase, clue: () => ch() === 1 && !has('vase') },
      { at: [[32, 2]], sprite: 'vase', z: 2, when: () => !f().vaseBroken, solid: true },
      { at: [[32, 2]], when: () => !!f().vaseBroken, check: examVase },
      { at: [[29, 1], [30, 1]], when: () => ch() >= 1 && f().crash, check: examFire, clue: () => ch() === 1 && f().investigating && !has('fire') },
      { at: [[29, 4], [30, 4]], when: () => ch() >= 1 && f().crash, check: examDesk, clue: () => ch() === 1 && f().investigating && !has('draft') },
      { at: [[26, 9]], sprite: 'tray', when: () => f().trayPlaced && ch() < 4, check: examTray },
      // 厨房
      { at: [[8, 2]], check: examIcebox, clue: () => ch() === 2 && f().iceHint && !has('ice') },
    ],
    '2F': [
      { at: [[28, 8], [28, 9]], step: async () => { await G.warp('1F', 24, 13, 'down'); } },
      { at: [[12, 7]], when: () => !f().gotKey, solid: true, bump: async () => {
        await N('藤堂の客室だ。鍵がかかっている。');
        if (f().detStay) await M('（ホールの真田さんに、合鍵を借りよう。）', 'think');
        else await K('他人の客室だ。勝手に入るわけにはいかないよ。');
      } },
      { at: [[14, 3]], sprite: 'bag', when: () => ch() === 2, check: examBag, clue: () => f().gotKey && !has('bag') },
      { at: [[2, 5]], sprite: 'bottles', check: async () => { await N('空になったウイスキーの瓶が、床に転がっている。'); } },
      { at: [[15, 2]], check: async () => {
        await N('机の上に、医学書と、読みかけの小説が一冊。');
        await N('栞は、最初の数ページに挟まったままだ。');
        if (ch() === 2 && !STATE.flags.detStay) await K('……『本を読んでいた』、か。', 'think');
        else await M('（……先生は本当に、ここで本を読んでいたんだろうか。）', 'think');
      } },
      { at: [[17, 2], [17, 3]], check: async () => { await N('私たちに用意された客室の寝台。'); await K('今夜は、どうやら使う暇がなさそうだ。', 'smile'); } },
      { at: [[1, 2], [1, 3]], check: async () => { await N('雅人の寝台。シーツが乱れたままだ。'); } },
      { at: [[7, 2]], check: async () => { await N('机の上に、督促状の束が無造作に積まれている。'); await K('……借金の額は、相当なものだね。', 'think'); } },
    ],
  };

  const TALK = {
    kujo: async () => {
      if (ch() === 1 && !f().crash) return ch1Talk();
      if (ch() === 2 && f().detStay) return detStayTalk();
      return hint();
    },
    sanada: talkSanada, suzu: talkSuzu, fuyuko: talkFuyuko, masato: talkMasato, todo: talkTodo,
  };

  function onResume() {
    W.storm = STATE.chapter < 4;
    SND.rain(STATE.chapter < 4 ? 1 : 0);
    if (STATE.chapter === 2 || (STATE.chapter === 1 && STATE.flags.investigating)) SND.bgm('investigate');
    else SND.bgm('mansion');
  }

  return {
    npcs, objective, FLAVOR, flavor, EVENTS, talk: id => (TALK[id] ? TALK[id]() : Promise.resolve()),
    prologue, hint, onResume, hintFromMenu: true,
  };
})();
