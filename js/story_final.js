'use strict';
/* =========================================================
   STORY_FINAL : 聖典の儀式 ― シナリオ（最終章）
   ========================================================= */
const STORY_FINAL = (() => {
  const f = () => STATE.flags;
  const ch = () => STATE.chapter;
  const has = id => STATE.evidence.includes(id);
  const S = (t, e, o) => G.say('siesta', t, e, o);
  const M = (t, e, o) => G.say('me', t, e, o);
  const N = (t, o) => G.narr(t, o);
  const X = (w, t, e, o) => G.say(w, t, e, o);
  const touch = () => document.body.classList.contains('touch');

  const INV = ['k_seating', 'k_bruno', 'k_nagi', 'k_keylog', 'k_shinomiya', 'k_record', 'k_barrier', 'k_blueprint', 'k_irving'];
  const cI = () => INV.filter(has).length;
  const night = on => stage.classList.toggle('nightpark', on);

  const REAL_LABELS = {
    hp: 'HP', stat: '見抜いた弱点', deduce: '推理する', deduceHelp: '手帳から、敵を追い詰める手がかりを示す。【間違えると反撃を受ける】。',
    drop: '回復薬', dropHelp: 'HPを40回復する。', hint: 'シエスタに聞く', hintHelp: '隣の名探偵に、ひとこと聞く。（ターンを消費しない）', hintSpeaker: 'siesta',
    ripple: '敵がひるんだ――今なら、次の推理が届く！', tooStrong: 'まだ敵の勢いが強すぎる……！ 銃で、もう少し削らないと。', allDone: '弱点は、全部暴いた。あとは――撃ち抜くだけ！',
    wrong: '……違う。その手がかりでは、何も変わらない！', cut: '見えた！', hintBroken: 'もう、守りは崩れてる。……撃って、助手！', hintStrong: 'まだ勢いが強い。銃で削ろう。',
    hintDefault: '手帳を見て。……答えは、もう集めてある。', crack: 'の守りが、崩れた！', broken: 'の守りが砕け散った！ ――とどめを！',
    loseHead: '敗北', sink: 'の意識が、遠のいていく……', flash: '#ff2040',
  };

  /* ------------------------------------------------------------------ */
  function initState(S0) {
    S0.map = 'O1'; S0.x = 7; S0.y = 6; S0.dir = 'up';
    S0.follower = 'siesta'; S0.follow = false; S0.time = '';
    S0.party = { me: { hp: 100, max: 100 } };
    S0.items = { drop: 3 };
    S0.evidence = ['k_report'];
    Object.assign(S0.flags, { named: true, revealed: true, heartTold: true, dorothyKnown: true, dorothyRevealed: true });
  }

  const FH_NPCS = [
    ['bruno', 11, 12, 'down'], ['irving', 16, 12, 'left'], ['nagi', 21, 3, 'down'], ['shinomiya', 17, 3, 'left'],
    ['kase', 6, 8, 'down'], ['schwarz', 26, 5, 'left'], ['multigate', 24, 2, 'down'], ['dorothy', 24, 12, 'down'],
  ];
  function npcs(id) {
    const L = [], c = STATE.chapter;
    const add = (i, x, y, d) => L.push({ id: i, x, y, dir: d });
    if (id === 'FH' && c === 3) FH_NPCS.forEach(([i, x, y, d]) => add(i, x, y, d));
    if (id === 'O1' && c === 2 && !f().leftOffice) add('siesta', 6, 6, 'down');
    return L;
  }

  function objective() {
    const c = ch();
    if (c === 2) return W.mapId === 'O1' ? '公園へ向かう（事務所の出口）' : '公園の奥へ';
    if (c === 3) return cI() < INV.length ? `儀式までに、怪盗の手と裏切り者を推理する（${cI()} / ${INV.length}）` : '';
    return '';
  }

  const FLAVOR = {
    B: ['古い書物の棚。連邦三百年の記録が並んでいる。'], d: ['机。'], X: ['書類棚。'], L: ['燭台。'], Z: ['連邦の紋章が掲げられている。'], W: ['窓。'],
    h: ['椅子。'], T: ['円卓。'], A: ['古い甲冑。'], V: ['聖火台。'], S: ['ソファ。'], P: ['観葉植物。'], t: ['小さなテーブル。'],
    F: ['夜露に濡れた花。'],
  };
  async function flavor(c, x, y) {
    if (W.mapId === 'PK' && c === 'T') { await N('大きな桜の木。……花は、もう散っている。'); return; }
    if (W.mapId === 'PK' && c === 'W') { await N('雲のない夜空。月が、やけに赤い。'); return; }
    const L = FLAVOR[c]; if (!L) return;
    for (const l of L) await N(l);
  }

  /* ------------------------------------------------------------------
     序章 一年後
     ------------------------------------------------------------------ */
  async function prologue() {
    STATE.chapter = 0;
    G.storm(false); G.rain(0); G.hum(0); G.bgm(null); night(false);
    await G.mono([
      'あの卒業ライブの夜から、一年。',
      '世界樹の主を失ったユグドラシルは、それでも消えなかった。\n《種》を飲んだ者たち――シードフォロワーが、世界のあちこちで暴れ続けていた。',
      '私とシエスタは、その一体一体を、探して、追って、止めてきた。',
    ]);
    G.load('O1', 7, 6, 'up');
    G.cinema(true); G.clearActors();
    G.scene('moon');
    G.bgm('s_battle');
    await G.fadeIn(1000);
    await N('深夜の、ビルの屋上。赤い月の下で、耳から触手を生やした男が吠えた。');
    await X('siesta', '今夜の一体。――助手、いつもの。', 'serious');
    await M('了解。耳を潰して、根から切り離す。', 'serious');
    G.scene(null);
    await G.battle({
      kind: 'dream', name: 'シードフォロワー', svg: SEED_SVG, hp: 120, gun: [16, 22],
      atk: [8, 12], big: [18, 22], pattern: ['atk', 'charge', 'big', 'atk', 'wave'],
      acts: { atk: '触手の薙ぎ払い', wave: '超音波（回避しにくい）', big: '⚠ 触手の乱打（大技）' },
      labels: REAL_LABELS, bgm: 's_battle',
      allies: [{ dmg: [8, 12], text: 'シエスタのマスケット銃！' }],
      intro: 'シードフォロワーが襲いかかってきた！',
      shell: '異常な聴覚で、動きを読まれている……！ まず「推理する」で弱点を突け！',
      loseText: '触手が{N}を締め上げた。\n名探偵と助手の、ありふれた夜は――ここで終わった。',
      phases: [
        { prompt: 'シードフォロワーの弱点は？', correct: ['k_report'], intent: '音で、こちらの動きをすべて読まれている……！', cut: '轟音を！',
          hint: 'この一年で、何十体も倒してきた。……報告書、書いたでしょ？',
          after: async () => {
            await M('シエスタ、同時に！', 'serious');
            SND.se('crit'); G.shake(8, 600, true); G.flash('#ffffff', 300);
            await X('siesta', '（二丁の銃声が、夜空に重なって響く）', 'serious');
          } },
      ],
    });
    G.cinema(true);
    G.bgm(null);
    await N('崩れ落ちた男の耳から、触手が枯れ枝のように剥がれていった。');
    await X('siesta', 'おつかれ、助手。……今週、四体目。', 'smile');
    await M('最近、多すぎない？', 'sad');
    await X('siesta', 'うん。……何かの前触れみたいに。', 'serious');
    SND.se('chime');
    await N('――携帯が鳴った。画面には「加瀬風靡」。');
    await X('kase', '（電話）名探偵と助手。明日の朝、調律者連邦の本部に来い。……全員、呼び出しだ。', 'serious');
    await G.fadeOut(1200);
    G.cinema(false);
    await ch1();
  }

  /* ------------------------------------------------------------------
     第一章 調律者連邦
     ------------------------------------------------------------------ */
  async function ch1() {
    STATE.chapter = 1;
    await G.chapter('第一章', '調律者連邦', '― 東京・連邦本部 ―');
    G.load('FH', 13, 6, 'up');
    G.cinema(true); G.clearActors();
    G.scene('council');
    G.time('10:00');
    G.bgm('z_council');
    await G.fadeIn(1200);
    await N('東京の地下深く。《調律者連邦》の本部、円卓の間。');
    await N('そこには、世界の裏側で均衡を保つ者たちが集まっていた。');
    G.scene(null);
    G.place('irving', 10, 2, 'down'); G.place('bruno', 12, 2, 'down'); G.place('nagi', 14, 2, 'down'); G.place('kase', 16, 2, 'down');
    G.place('shinomiya', 17, 4, 'left'); G.place('multigate', 8, 4, 'right');
    G.place('schwarz', 10, 6, 'up'); G.place('dorothy', 12, 6, 'up'); G.place('siesta', 14, 6, 'up'); G.place('me', 16, 6, 'up');
    G.cam(12.5, 4); G.snap();
    await X('irving', '連邦政府のアーヴィングだ。……《名探偵》とその助手か。噂は聞いている。', 'serious');
    await X('bruno', '《情報屋》のブルーノじゃ。ほっほ、ずいぶん若い助手さんだのう。', 'smile');
    await X('nagi', '……《暗殺者》。ナギ。', 'closed');
    await X('shinomiya', '連邦本部・書記官の篠宮です。本日の議事を進行いたします。', 'serious');
    await X('shinomiya', '本日お集まりいただいたのは、ひと月後に行われる「聖典の儀式」についてです。', 'serious');
    await X('multigate', '……私から説明します。', 'serious');
    await X('multigate', '《聖典》は、未来を記した書。世界の危機を、調律者たちに知らせるためのもの。', 'serious');
    await X('multigate', 'その役目を終えた聖典を、巫女の手で燃やす。――そうすれば、その後三百年、世界を脅かすものは現れない。', 'serious');
    await X('multigate', 'それが、「聖典の儀式」です。', 'serious');
    await X('shinomiya', '儀式は巫女様が執り行い、ほぼすべての《調律者》と、連邦政府の方々が立ち会います。', 'serious');
    await X('irving', '三百年の平和、か。……私は今でも、燃やすのは惜しいと思っているがね。', 'think');
    await X('kase', '……それで。わざわざ全員を集めた、本当の理由は？', 'serious');
    await X('shinomiya', '……こちらです。三日前、本部に届きました。', 'sad');
    SND.se('sting');
    await N('円卓の上に置かれたのは、黒い羽根の添えられた一枚の紙だった。');
    await G.gain('k_notice', '証拠品を入手');
    await M('《怪盗》R……！', 'shock');
    await X('bruno', '鴉城零。かつての《調律者》、《怪盗》じゃ。盗むべきものを盗む者――だったはずの男よ。', 'serious');
    await X('siesta', '……世界樹の奥へ消えた、あの怪盗。', 'serious');
    await M('（九条さんの死を仕組んだ男。……世界樹の底で、まだ生きていた）', 'angry');
    await X('kase', 'ユグドラシルの、最後のフォロワーってわけか。', 'serious');
    await X('shinomiya', 'それから、儀式までの間、燃やす聖典をどなたが預かるか、ですが――', 'serious');
    await X('multigate', '持ち主に。……{N}さん、あなたの聖典を。', 'serious');
    await X('schwarz', '……解析は終わった。返す。', 'closed');
    SND.se('page');
    await N('シュバルツさんが差し出したのは、一年以上前、時計台で私に未来を見せた、あの本だった。');
    await G.gain('k_kanon', '証拠品を入手');
    await X('schwarz', 'もう、力は残っていない。ただの古い本だ。……だが、燃やせば意味がある。', 'serious');
    await X('siesta', '式次第、私が配るね。書記官さん、貸して。', 'smile');
    await X('shinomiya', 'え？ あ、はい……。', 'shock');
    await N('シエスタは、刷り上がった式次第を受け取ると、なぜか一枚ずつ丁寧に、席に置いていった。');
    await G.gain('k_ritual', '証拠品を入手');
    await X('irving', '――では、ひと月後。この本部の祭壇の間で、儀式を執り行う。散会だ。', 'serious');
    await G.fadeOut(1200);
    await ch2();
  }

  /* ------------------------------------------------------------------
     第二章 前夜
     ------------------------------------------------------------------ */
  async function ch2() {
    STATE.chapter = 2;
    await G.chapter('第二章', '前夜', '― 儀式の前の夜 ―');
    G.load('O1', 7, 6, 'up');
    G.cinema(true); G.clearActors(); G.restore();
    G.place('me', 7, 6, 'left');
    G.cam(7, 6); G.snap();
    G.time('23:40');
    G.bgm('t_sad');
    await G.fadeIn(1200);
    await N('ひと月が過ぎ、儀式の前夜。九条探偵事務所。');
    await X('siesta', '……すう……。', 'closed');
    await N('シエスタは、ソファで先に眠ってしまった。');
    await M('（明日で、ユグドラシルとの戦いが終わる……のかな）', 'think');
    SND.se('chime');
    await N('――携帯が震えた。知らない番号からのメッセージ。');
    await N('「近くの公園へ来い。聖典を持って。ひとりで。――R」');
    await M('…………。', 'serious');
    await M('（シエスタを起こす？ ……ううん。“ひとりで”って書いてある）', 'think');
    await N('眠るシエスタの寝顔を見て、そっと上着をかけた。');
    G.cam(null); G.cinema(false);
    G.checkpoint('resume2');
  }
  async function resume2() { G.cinema(false); G.clearActors(); G.restore(); G.bgm('t_sad'); await G.fadeIn(500); }

  async function leaveOffice() {
    if (ch() !== 2 || W.mapId !== 'O1') return;
    f().leftOffice = true;
    await G.fadeOut(700);
    G.load('PK', 10, 7, 'up');
    night(true);
    G.clearActors();
    G.bgm(null);
    await G.fadeIn(800);
    await N('真夜中の公園。散った桜の木の下に、誰もいないベンチ。');
    G.checkpoint('park');
  }
  async function park() {
    STATE.chapter = 2; night(true);
    if (W.mapId !== 'PK') G.load('PK', 10, 7, 'up');
    G.clearActors();
    G.bgm(null);
    await G.fadeIn(500);
  }

  async function meetRaven() {
    if (f().parkDone) return;
    G.cinema(true);
    G.clearActors();
    G.place('me', 9, 5, 'up');
    G.place('yogarasu_x', 9, 3, 'down');
    G.cam(9, 4); G.snap();
    SND.se('whoosh'); G.flash('#ff2040', 300);
    G.bgm('t_title');
    await N('桜の木の影から、黒い外套の男が現れた。');
    await X('yogarasu_x', 'やあ。久しぶりだね、{N}くん。……いや、もう“探偵”と呼ぶべきかな。', 'smile');
    await N('白い髪。赤い瞳。――そして、その耳から、黒い触手がゆらりと伸びていた。');
    await M('鴉城……零……！', 'angry');
    await X('yogarasu_x', 'そう怖い顔をしないで。今夜は、取引に来たんだ。', 'smile');
    await X('yogarasu_x', '曰く――聖典を渡せば、あの予告状のことは起こらない。', 'serious');
    await X('yogarasu_x', '誰も傷つかない。君の大事な名探偵もね。悪くない取引だろう？', 'smile');
    await X('yogarasu_x', 'それに、明日の聖火は桜の薪で焚くんだろう？ 風流だね。……あんな美しい火で、あの本を燃やすのは惜しい。', 'smile');
    await G.gain('k_parkwords', '証言を記録');
    await M('（……桜の薪？）', 'think');
    const r = await G.choose(['聖典を渡す', '渡さない']);
    if (r === 0) {
      await M('……これで、誰も傷つかないなら。', 'sad');
      await N('差し出した聖典を、触手がやさしく受け取った。');
      await X('yogarasu_x', 'ありがとう。……君は、優しいね。', 'smile');
      await X('yogarasu_x', 'でも、“あの予告状のことは起こらない”と言っただけさ。――もっと酷いことが起きないとは、言っていない。', 'smile');
      SND.se('sting'); G.flash('#ff2040', 500); G.shake(6, 800, true);
      await G.gameOver('GAME OVER', '奪われた聖典', '翌日、儀式は行われなかった。\n聖典を取り込んだ怪盗は、世界樹の残り火をもう一度燃え上がらせ――\n三百年の平和は、始まる前に終わった。');
      return;
    }
    await M('渡さない。', 'serious');
    await M('あなたの言葉は、信じない。……九条さんを殺させた人の言葉なんて。', 'angry');
    await X('yogarasu_x', '……そうか。', 'closed');
    await X('yogarasu_x', 'なら、明日。儀式の最期に、会おう。', 'smile');
    SND.se('whoosh'); G.flash('#000000', 400);
    G.remove('yogarasu_x');
    await N('瞬きをした、その一瞬で。');
    await N('男の姿は、気がついたら、どこにもなかった。足元に、黒い羽根が一枚だけ。');
    f().parkDone = true;
    await M('（……桜の薪。あの人は、どうしてそんなことを知ってたんだろう）', 'think');
    await G.fadeOut(1400);
    G.cinema(false);
    night(false);
    await ch3();
  }

  /* ------------------------------------------------------------------
     第三章 裏切り者（推理パート）
     ------------------------------------------------------------------ */
  async function ch3() {
    STATE.chapter = 3; STATE.follow = true;
    await G.chapter('第三章', '裏切り者', '― 儀式の朝・連邦本部 ―');
    G.load('FH', 13, 8, 'up');
    G.cinema(true); G.clearActors(); G.restore();
    G.place('me', 13, 8, 'up'); G.place('siesta', 14, 8, 'up');
    G.cam(13, 7); G.snap();
    G.time('09:00');
    G.bgm('z_council');
    await G.fadeIn(1000);
    await X('siesta', '…………。', 'angry');
    await M('……ごめん。勝手にひとりで行って。', 'sad');
    await X('siesta', '次やったら、一週間口きかない。', 'angry');
    await M('（重い……）', 'sad');
    await X('siesta', 'それで。怪盗は、何て言ってたの。……一字一句、全部。', 'serious');
    await N('昨夜のことを、全部話した。取引のこと。そして――桜の薪のこと。');
    await X('siesta', '……桜。', 'serious');
    await X('siesta', 'ふふ。引っかかった。', 'smile');
    await M('え？', 'shock');
    await X('siesta', '会議の日、私が式次第を配ったでしょ。あれね、席ごとに、薪の種類だけ書き換えておいたの。', 'smile');
    await X('siesta', '名探偵のくせ。……誰かが漏らしたら、どの席の紙か分かるように。', 'smile');
    await G.gain('k_canary', '証拠品を入手');
    await X('siesta', '怪盗に情報を流した裏切り者が、この本部の中にいる。それから、怪盗は今夜、どこから、どうやって来るのか。', 'serious');
    await X('siesta', '――儀式は今夜21時。それまでに、全部推理して。今日も探偵は、君。', 'serious');
    await M('……シエスタは？', 'think');
    await X('siesta', '私は名探偵。だから、君の推理を一番近くで聞く。', 'smile');
    G.cam(null); G.cinema(false);
    G.clearActors(); G.restore();
    G.checkpoint('resume3');
    G.toast('<b>第三章（最難関）</b>：裏切り者と、怪盗の侵入経路を推理しよう。<br>証言は<b>一字一句</b>が手がかり。推理を間違えると集中が<b>25</b>減ります。', 8000);
  }
  async function resume3() { STATE.follow = true; G.cinema(false); G.clearActors(); G.restore(); G.bgm('z_council'); await G.fadeIn(500); }

  async function talkBruno() {
    if (ch() !== 3) return;
    if (!has('k_bruno')) {
      await X('bruno', 'おや、助手さん。……いや、今日は探偵さんかね。', 'smile');
      await M('会議の日の、席のことを聞かせてください。', 'serious');
      await X('bruno', '席？ ほっほ、それなら。会議の直前に、席を替わってもらったのじゃよ。', 'smile');
      await X('bruno', '4番は窓際でな。老いた腰には冷えるんじゃ。わしは暖房の近い2番に移った。', 'smile');
      await X('bruno', '代わりに4番には、ナギ嬢が座った。あの子は寒さなど気にせんからのう。', 'smile');
      await G.gain('k_bruno', '証言を記録');
      await checkInv();
      return;
    }
    await X('bruno', '情報屋の勘じゃが……裏切り者というのは、一番“見えないところ”におるものよ。', 'think');
  }
  async function talkNagi() {
    if (ch() !== 3) return;
    if (!has('k_bruno')) { await X('nagi', '……。', 'closed'); await N('ナギは、こちらを見ようともしない。'); return; }
    if (!has('k_nagi')) {
      await M('会議の日、ブルーノさんと席を替わって、4番に座ったそうですね。', 'serious');
      await X('nagi', '……。', 'closed');
      await X('nagi', '……紙は、読まない。覚えたいことは、聞けば覚える。', 'serious');
      await X('nagi', '4番の式次第は、机の上に置いたまま、部屋を出た。', 'serious');
      await G.gain('k_nagi', '証言を記録');
      await checkInv();
      return;
    }
    await X('nagi', '……今夜。怪盗が来るなら、私が刺す。', 'serious');
  }
  async function talkShinomiya() {
    if (ch() !== 3) return;
    if (!has('k_shinomiya')) {
      await X('shinomiya', '探偵さん。儀式の準備で、少し立て込んでいまして……。', 'serious');
      await M('会議のあと、残った書類はどうなりましたか。', 'serious');
      await X('shinomiya', '置き忘れの書類は、すべて私が回収して、読まずにシュレッダーにかけました。', 'serious');
      await X('shinomiya', '書類の管理は、書記官の仕事ですから。', 'smile');
      await G.gain('k_shinomiya', '証言を記録');
      await checkInv();
      return;
    }
    await X('shinomiya', '……今夜の儀式、無事に終わるといいですね。', 'sad');
  }
  async function talkIrving() {
    if (ch() !== 3) return;
    if (!has('k_irving')) {
      await X('irving', '探偵か。……ふん、私を疑っているのだろう？', 'angry');
      await X('irving', '聖典を燃やす？ 馬鹿げている。あれほどの力を、灰にするなど。', 'angry');
      await X('irving', '……だが、決めたのは連邦だ。私は従うよ。', 'serious');
      await X('irving', '会議のあとは、すぐに本部を出た。運転手が証人だ。', 'serious');
      await G.gain('k_irving', '証言を記録');
      await checkInv();
      return;
    }
    await X('irving', '三百年の平和、か。……せいぜい、見届けさせてもらうよ。', 'think');
  }
  async function talkSchwarz() {
    if (ch() !== 3) return;
    if (!has('k_barrier')) {
      await X('schwarz', '……結界か。', 'closed');
      await X('schwarz', '今夜21時、祭壇の間の壁と天井を、結界で覆う。シードフォロワーは、通り抜けられん。', 'serious');
      await X('schwarz', '床の下は岩盤だ。そこには、張っていない。', 'serious');
      await G.gain('k_barrier', '証言を記録');
      await checkInv();
      return;
    }
    await X('schwarz', '……結界は、俺の仕事だ。抜かりはない。', 'closed');
  }
  async function talkKase() {
    if (ch() !== 3) return;
    await X('kase', '連邦の連中は、誰も信用ならん。……私と、お前たち以外はな。', 'serious');
  }
  async function talkMultigate() {
    if (ch() !== 3) return;
    await X('multigate', '私の未来視には、今夜の儀式の“その先”が、まだ視えません。……{N}さん。あなたが、作って。', 'serious');
  }
  async function talkDorothy() {
    if (ch() !== 3) return;
    await X('dorothy', 'ゆうべ、この本部のひとたちの夢を、少しだけ覗いたの。', 'think');
    await X('dorothy', 'ひとりだけ、白い部屋の夢を見てるひとがいたよ。……ちいさな子どもたちが、いっぱいいる部屋。', 'serious');
  }

  async function examSeating() {
    if (has('k_seating')) { await N('円卓の上の、公式の座席表。'); return; }
    await N('円卓の上に、会議の日の座席表が残されていた。書記官・篠宮さんの字だ。');
    await G.gain('k_seating', '証拠品を入手');
    await checkInv();
  }
  async function examKeylog() {
    if (has('k_keylog')) { await N('警備室の入退室記録。'); return; }
    await N('警備室の机に、各部屋の入退室記録が綴じられていた。会議の日の、円卓の間の頁をめくる。');
    await G.gain('k_keylog', '証拠品を入手');
    await checkInv();
  }
  async function examRecord() {
    if (has('k_record')) { await N('人事記録の棚。'); return; }
    await N('記録庫の棚に、連邦職員の人事記録が並んでいる。');
    await N('「篠宮透子」の頁が、ほかより少しだけ擦り切れていた。');
    await G.gain('k_record', '証拠品を入手');
    await checkInv();
  }
  async function examBlueprint() {
    if (has('k_blueprint')) { await N('旧地下水路の図面。'); return; }
    await N('記録庫の机の引き出しの奥に、黄ばんだ図面が丸めて押し込まれていた。百年前の、本部の設計図だ。');
    await G.gain('k_blueprint', '証拠品を入手');
    await checkInv();
  }

  async function checkInv() {
    if (ch() !== 3 || cI() < INV.length) return;
    G.cinema(true);
    G.time('18:00');
    await X('siesta', '――18時。探偵さん、推理は固まった？', 'serious');
    await M('……うん。円卓の間に、みんなを集めて。', 'serious');
    G.cinema(false);
    await deduce();
  }

  function councilSetup() {
    G.clearActors();
    G.place('irving', 10, 2, 'down'); G.place('bruno', 12, 2, 'down'); G.place('nagi', 14, 2, 'down'); G.place('kase', 16, 2, 'down');
    G.place('shinomiya', 17, 4, 'left'); G.place('multigate', 8, 4, 'right');
    G.place('schwarz', 10, 6, 'up'); G.place('dorothy', 12, 6, 'up'); G.place('siesta', 14, 6, 'up'); G.place('me', 16, 6, 'up');
    G.cam(12.5, 4); G.snap();
  }
  async function T(who, text, e, o) { G.spot(who); return G.say(who, text, e, o); }
  const penalty = async () => {
    G.focus(-25);
    if (STATE.focus <= 0) await G.gameOver('BAD END', '推理、崩れる', '推理は崩れ、円卓の間には疑心暗鬼だけが残った。\nその夜――怪盗は、誰にも読まれていない道から現れ、\n聖典の儀式は、悪夢に変わった。');
  };
  const WRONG = ['……探偵さん。違う。', '落ち着いて。証言は、一字一句が大事。', '……それじゃない。'];
  const P = (prompt, ids, o = {}) => G.present(prompt, ids, Object.assign({ penalty, noAuto: true, speaker: 'siesta', wrongLines: WRONG }, o));
  async function plan(q, opts, correct, why, wrongLine) {
    while (true) {
      const r = await G.choose(opts, q);
      if (r === correct) { await M(why, 'serious'); return; }
      SND.se('wrong'); G.shake(3, 300, true);
      await penalty();
      await T('siesta', wrongLine, 'serious');
    }
  }

  async function deduce() {
    STATE.chapter = 3; STATE.follow = false;
    STATE.focus = 100;
    G.bgm(null);
    await G.fadeOut(900);
    G.load('FH', 16, 6, 'up');
    G.cinema(true);
    councilSetup();
    G.time('18:10');
    G.checkpoint('deduce');
    G.bgm('tension');
    await G.fadeIn(900);
    await N('円卓の間。儀式の三時間前、全員が集められた。');
    await T('irving', '探偵。……今さら何の用だ。', 'angry');
    await T('me', '今夜、怪盗がどう攻めてくるか。それから――この中にいる、裏切り者について話します。', 'serious');
    await T('bruno', 'ほう……裏切り者、とな。', 'shock');
    G.bgm('deduction');
    G.toast('<b>最難関</b>：証拠を間違えると<b>集中が25</b>減ります。0になると<b>敗北</b>。', 6500);
    G.refresh(); $('hud').classList.remove('hidden'); setTimeout(G.refresh, 4000);

    await T('kase', 'まずは怪盗だ。あいつは、いつ来る？', 'serious');
    await P('怪盗が現れる時刻を示す証拠は？', ['k_ritual'], { hint: '予告状の「その最期」。……儀式の“最期”は、何時？', alt: { k_notice: '予告状は「最期に」と言ってる。その“最期”が何時なのか、が書いてあるものは？' } });
    await T('me', '予告状は「儀式の最期に」と言っています。式次第では、21時30分――巫女様が聖典を聖火に投じる瞬間です。', 'serious');
    await T('schwarz', 'だが、21時から祭壇の間は結界に覆われる。シードフォロワーは入れん。', 'serious');
    await P('結界を越えて、怪盗が祭壇に辿り着く道は？', ['k_blueprint'], { hint: '結界のない場所。……そこに、道はあった？', alt: { k_barrier: '床の下に結界がないのは分かった。でも、岩盤なら通れない。……“道”があるとしたら？' } });
    await T('me', '記録庫に、百年前の図面がありました。祭壇の間の真下を、今の設計図にはない旧地下水路が通っています。', 'serious');
    await T('me', '結界は壁と天井だけ。怪盗は、水路から床を破って現れます。', 'serious');
    await T('schwarz', '……床の下か。くそ、俺の見落としだ。', 'angry');
    await T('irving', '待て。そんな古い図面のことなど、怪盗が知るはずがない！', 'angry');
    await T('me', '……知っていたんです。ここの内情を、怪盗に教えた人がいるから。', 'serious');
    await P('怪盗が、連邦の内情を知っていた証拠は？', ['k_parkwords'], { hint: '昨夜、公園で。……あの人は、何を知ってた？' });
    await T('me', '昨夜、公園で怪盗は言いました。「明日の聖火は、桜の薪で焚くんだろう？」と。', 'serious');
    await T('bruno', '薪？ 式次第に書いてあったのう。……ん？ わしの紙は、確か“樫”じゃったが。', 'think');
    await P('薪の種類から、漏らした紙を突き止める仕掛けは？', ['k_canary'], { hint: '式次第を配ったのは、誰だった？' });
    await T('siesta', 'うん。私が配った式次第は、席ごとに薪の種類だけ違う。“桜”は、4番の席の紙。', 'smile');
    await T('irving', 'なら簡単だ。座席表の4番は――ブルーノ。お前だ！', 'angry');
    await T('bruno', 'な、なんと!?', 'shock');
    await P('4番の席に座っていたのが、座席表と違う証拠は？', ['k_bruno'], { hint: '座席表は“予定”。……実際に、誰がどこに座った？', alt: { k_seating: 'それは、書記官が作った“予定”の座席表。実際は？' } });
    await T('me', 'ブルーノさんは会議の直前、4番から2番に移っています。代わりに4番に座ったのは、ナギさんです。', 'serious');
    await T('nagi', '……。', 'closed');
    await T('irving', 'ならば、裏切り者は暗殺者か！', 'angry');
    await P('4番の“桜”の式次第が、ナギの手元に残らなかった証拠は？', ['k_nagi'], { hint: 'ナギは、紙をどうした？' });
    await T('me', 'ナギさんは、式次第を読まずに、机の上に置いたまま部屋を出ています。', 'serious');
    await T('me', 'つまり、“桜”の紙は、会議のあとも円卓の間に残っていた。……それを読めたのは、誰か。', 'serious');
    G.spot(null);
    const who = await G.pickPerson('置き去りの“桜”の式次第を読めたのは？', ['irving', 'bruno', 'nagi', 'kase', 'shinomiya', 'schwarz']);
    if (who !== 'shinomiya') {
      const nm = shortName(who);
      await T('me', `……${nm}さんです。`, 'serious');
      await T('siesta', '…………。', 'closed');
      SND.se('wrong');
      await G.gameOver('BAD END', '誤った告発', `${nm}への疑いで、連邦は割れた。\n本当の裏切り者は、何食わぬ顔で今夜の段取りを怪盗に伝え――\n聖典の儀式は、悪夢に変わった。`);
    }
    await G.cutin('裏切り者は――', null, 1100);
    G.spot('shinomiya'); SND.se('sting'); G.shake(5, 600, true);
    await T('me', '篠宮さん。……あなたです。', 'serious');
    await T('shinomiya', '……え？', 'shock');
    await P('篠宮だけが“桜”の紙を読めた証拠は？', ['k_keylog'], { hint: '会議のあと、円卓の間に入ったのは？', alt: { k_shinomiya: '本人は「読まずに捨てた」と言ってる。……“読めた”のが彼女だけ、という記録は？' } });
    await T('me', '会議のあと、円卓の間は施錠されました。翌朝まで入ったのは、置き忘れの書類を回収した、あなただけです。', 'serious');
    await T('shinomiya', 'わ、私は、読まずにシュレッダーに――', 'shock');
    await T('kase', '……読まずに捨てた紙の中身が、なぜ怪盗に伝わる。', 'serious');
    await T('shinomiya', 'そ、そんなの……私が、怪盗と通じる理由なんて……！', 'angry');
    await P('篠宮が、怪盗と通じる理由は？', ['k_record'], { hint: 'その人の“前の仕事”は？', alt: { k_irving: 'その人は本部を出てた。……今、話してるのは篠宮さんのこと。' } });
    await T('me', 'あなたの前の職場は、白の園。十二年前、子どもたちの世話をしていた研究員です。', 'serious');
    await T('siesta', '……白の園。', 'shock');
    f().traitor = true;
    G.bgm('truth');
    await T('shinomiya', '…………。', 'closed');
    await T('shinomiya', '……そう。私は、あの子たちの“お世話係”だった。', 'sad');
    await T('shinomiya', 'No.8――ミオちゃんには、お兄さんがいた。適合しないと捨てられた、白い髪の男の子。……零くん。', 'sad');
    await T('shinomiya', 'あの子はずっと、世界樹の中で妹が生きてると信じて、探し続けてる。', 'sad');
    await T('shinomiya', '聖典が燃えたら、世界樹は三百年眠る。……ミオちゃんの“名残”も、二度と見つからなくなる。', 'sad', { tremble: true });
    await T('shinomiya', 'だから、手伝った。……あの子を、止められなかった。', 'sad', { tremble: true });
    await T('me', '…………。', 'closed');
    await T('shinomiya', '……本当は、ずっと言えなかったことがあるの。', 'sad');
    await T('shinomiya', 'ミオちゃんは、処置の前に、私に言ったの。', 'sad');
    await T('shinomiya', '「お兄ちゃんに、もう探さないでって伝えて。……わたしのことは忘れて、生きて」って。', 'sad', { tremble: true });
    await G.gain('k_mio', '証言を記録');
    await T('shinomiya', '十二年。……私には、それを伝える勇気がなかった。', 'sad');
    await T('siesta', '……探偵さん。最後の仕事。', 'serious');
    await T('siesta', '今夜、怪盗を“追い込む準備”。……配置を決めて。', 'serious');
    G.spot(null);
    await plan('旧地下水路の出口――怪盗の退路を塞ぐのは？', ['加瀬とナギ（戦闘に長けた二人）', 'ブルーノとアーヴィング卿', 'シュバルツひとり'], 0,
      '水路の出口には、加瀬さんとナギさん。追い詰めた怪盗が逃げ帰る道を、戦える二人で塞ぎます。', '……退路を塞ぐのは、怪盗と“戦える”人じゃないと。');
    await plan('現れた怪盗の、異常な聴覚を封じる手は？', ['祭壇の灯りを全部消す', '名探偵と助手の、マスケット銃の同時射撃', '結界をもっと強くする'], 1,
      '報告書の通り、シードフォロワーは至近距離の轟音で麻痺します。シエスタと私で、同時に撃ちます。', '……報告書、思い出して。あいつらは“何”に弱い？');
    await plan('世界樹の根からの再生を断つには？', ['巫女様に祈ってもらう', '先に聖典を燃やしてしまう', 'シュバルツが、水路の根を焼き切る'], 2,
      '図面にあった、水路の壁の根。怪盗はあれと繋がっているはずです。シュバルツさんに、焼き切ってもらいます。', '……再生は、根と繋がってる限り続く。その“根”は、どこにあった？');
    await T('kase', '……いいだろう。乗った。', 'smile');
    await T('nagi', '……了解。', 'serious');
    await T('schwarz', '根か。……焼き切ってやる。', 'serious');
    await T('irving', '…………見事だ、探偵。', 'serious');
    await T('siesta', '――合格。……さあ、今夜で終わらせよう。', 'smile');
    await G.fadeOut(1400);
    G.cinema(false);
    await ch4();
  }

  /* ------------------------------------------------------------------
     第四章 聖典の儀式
     ------------------------------------------------------------------ */
  function altarSetup() {
    G.clearActors();
    G.place('multigate', 24, 3, 'down'); G.place('siesta', 23, 5, 'up'); G.place('me', 25, 5, 'up');
    G.place('schwarz', 21, 5, 'right'); G.place('dorothy', 27, 5, 'left'); G.place('irving', 22, 6, 'up'); G.place('bruno', 26, 6, 'up');
    G.cam(24, 4); G.snap();
  }
  async function ch4() {
    STATE.chapter = 4;
    await G.chapter('第四章', '聖典の儀式', '― 21:00 祭壇の間 ―');
    G.load('FH', 25, 5, 'up');
    G.cinema(true);
    G.scene('ritual');
    G.time('21:00');
    G.bgm('z_council');
    await G.fadeIn(1500);
    await N('21時。祭壇の間。');
    await N('壁と天井を、シュバルツさんの結界が淡く覆っている。聖火台では、薪が静かに燃えていた。');
    await X('multigate', 'これより、聖典の儀式を執り行います。', 'serious');
    await N('調律者たちの宣誓。三百年の平和への祈り。……時計の針が、ゆっくりと21時30分へ近づいていく。');
    await M('（来る。……必ず、来る）', 'serious');
    G.time('21:30');
    await X('multigate', '――聖典を、聖火へ。', 'serious');
    await N('巫女の手から、聖典が炎へ――。');
    G.scene(null);
    altarSetup();
    G.bgm(null);
    SND.se('crash'); G.shake(12, 1200, true); G.flash('#ff2040', 400);
    await N('その瞬間。祭壇の床が、下から突き破られた。');
    G.place('yogarasu_x', 24, 4, 'down');
    SND.se('glitch');
    await X('yogarasu_x', 'やあ。……儀式の最期に、悪夢を見せに来たよ。', 'smile', { tremble: true });
    await N('黒い触手が、何本も、何本も床下から這い上がってくる。その根元は、地下の水路の奥へと続いていた。');
    await X('yogarasu_x', 'その本は燃やさせない。……ミオが、まだあの木の中にいるんだ。', 'angry');
    await X('siesta', '――今だよ、探偵さん。', 'serious');
    await M('全員、配置通りに！', 'serious');
    G.checkpoint('fight');
    await fight();
  }
  async function fight() {
    STATE.chapter = 4;
    if (W.mapId !== 'FH') G.load('FH', 25, 5, 'up');
    G.cinema(true); altarSetup(); G.place('yogarasu_x', 24, 4, 'down');
    STATE.party.me.hp = STATE.party.me.max; STATE.items.drop = Math.max(STATE.items.drop || 0, 3);
    await G.fadeIn(300);
    await G.battle({
      kind: 'dream', name: '《怪盗》鴉城零', svg: RAVEN_SVG, hp: 330, gun: [16, 22],
      atk: [12, 16], big: [28, 34], pattern: ['atk', 'wave', 'charge', 'big', 'atk', 'atk', 'charge', 'big'],
      acts: { atk: '触手の刺突', wave: '黒い羽根の嵐（回避しにくい）', big: '⚠ 夜鴉の悪夢（大技）' },
      labels: Object.assign({}, REAL_LABELS, { flash: '#ff2040' }), bgm: 'z_battle',
      allies: [{ dmg: [9, 13], text: 'シエスタのマスケット銃！' }, { dmg: [8, 12], text: '巫女の祈りの光！' }, { dmg: [7, 11], text: 'ドロシーの夢の霧が、触手を惑わす！' }],
      intro: '最後のシードフォロワー、《怪盗》鴉城零――！',
      shell: '異常な聴覚で、こちらの動きをすべて読まれている！ まずは「推理する」で弱点を突け！',
      finalIntent: '守りは崩れた！ ――引き金を引け、探偵！',
      loseText: '触手が、祭壇の間を覆いつくした。\n聖典は炎から引きずり出され、儀式は悪夢に変わった。',
      phases: [
        { prompt: '怪盗の“耳”を封じるには？', correct: ['k_report'], intent: '触手の耳が、あらゆる音を拾っている……！', cut: '轟音を！',
          hint: '準備の時に決めたよね。……私と君の、二丁の銃。',
          alt: { k_parkwords: 'それは昨夜の言葉。今必要なのは、あいつらの“弱点”。' },
          after: async () => {
            await M('シエスタ！ 同時に！', 'serious');
            SND.se('crit'); G.shake(10, 700, true); G.flash('#ffffff', 400);
            await X('siesta', '（二つの銃声が、祭壇の間に重なって轟く）', 'serious');
            await X('yogarasu_x', 'ぐ、あ……耳、が……！', 'shock', { tremble: true });
          } },
        { prompt: '傷の再生を、止めるには？', correct: ['k_blueprint'], intent: '傷が、根から流れ込む力で塞がっていく……！', cut: '根を断て！',
          hint: '再生は、根と繋がってる限り続く。……その根は、どこを通ってた？',
          alt: { k_report: 'そう、根と繋がってる限り再生する。……その根が“どこ”にあるか、を。', k_barrier: '結界の話じゃない。床の下の、“道”の話。' },
          after: async () => {
            await M('シュバルツさん！ 水路の根を！', 'serious');
            await X('schwarz', '――焼き切る！', 'angry');
            SND.se('crit'); G.shake(8, 700, true); G.flash('#ffb060', 500);
            await N('床下の水路で、炎が走った。触手の根元が、黒く焼け落ちる。');
            await X('kase', '（床下から）退路は塞いだ。もう逃げられんぞ、怪盗！', 'serious');
          } },
        { prompt: '怪盗を、ここまで動かしてきたもの。……それを止める言葉は？', correct: ['k_mio'], intent: 'それでも怪盗は止まらない。……あの人を動かしているものは、何？', cut: '届け……！',
          hint: '篠宮さんが、十二年言えなかった言葉。',
          alt: { k_kanon: '本を守っても、あの人は止まらない。……あの人が本当に探してるものは？', k_record: '篠宮さんは、その言葉を預かってた。……その“言葉”を。' },
          after: async () => {
            await M('鴉城零！ ミオさんから、伝言がある！', 'serious');
            await X('yogarasu_x', '……何……？', 'shock');
            await M('「お兄ちゃんに、もう探さないでって伝えて。……わたしのことは忘れて、生きて」', 'sad', { tremble: true });
            await X('yogarasu_x', '…………っ。', 'shock', { tremble: true });
            await X('shinomiya', '（扉の外から）……ごめんなさい、零くん。十二年も……ごめんなさい……！', 'sad', { tremble: true });
            await N('触手の動きが、止まった。');
          } },
      ],
    });
    f().ravenDead = true;
    await afterFight();
  }

  async function afterFight() {
    G.cinema(true);
    altarSetup();
    G.place('yogarasu_x', 24, 4, 'down');
    G.bgm('t_sad');
    await N('最後の銃声の残響が消えた時、鴉城零は、祭壇の上に膝をついていた。');
    await N('触手は枯れ枝のように崩れ落ち、胸から、黒い血が静かに広がっていく。');
    await X('yogarasu_x', '……ああ。そうか。', 'closed');
    await X('yogarasu_x', 'ミオは……とっくに、行っちゃってたんだね。', 'smile');
    await M('…………。', 'closed');
    await X('yogarasu_x', '{N}くん。……九条玲司を殺させた僕を、君は、撃てた。', 'smile');
    await X('yogarasu_x', '言っただろう？ 次に会う時は、君が本物の探偵になっているといいって。', 'smile');
    await X('yogarasu_x', '……なってたね。', 'smile');
    await M('……あなたを、許したわけじゃない。', 'sad', { tremble: true });
    await X('yogarasu_x', 'それでいい。……許さなくて、いいんだ。', 'closed');
    await X('yogarasu_x', 'じゃあ、行くよ。……ミオに、会いに。', 'smile');
    G.scene('farewell');
    await N('白い髪の怪盗は、目を閉じた。');
    await N('それきり、もう、動かなかった。');
    await G.wait(800);
    await X('kase', '……《怪盗》鴉城零。死亡を、確認した。', 'closed');
    await X('siesta', '……おやすみ、怪盗。', 'closed');
    G.scene('ritual');
    G.bgm('z_ending');
    await X('multigate', '……儀式を、続けます。', 'serious');
    await N('巫女の手から、聖典が、今度こそ炎の中へ落ちた。');
    await N('ページが一枚、また一枚とめくれて、燃えていく。');
    await N('最後の一枚が燃え尽きる直前――聖典が、一度だけ、光った。');
    await N('映ったのは、未来。……ソファで昼寝をする白い髪の少女と、紅茶を淹れる誰かの、なんでもない午後。');
    await M('（……最後に見せてくれたのが、それなんだ）', 'smile');
    await X('multigate', '――これにて、聖典の儀式を終えます。三百年の平和が、訪れますように。', 'smile');
    G.scene(null);
    await G.fadeOut(2000);
    await epilogue();
  }

  /* ------------------------------------------------------------------
     終章 いつもの日常
     ------------------------------------------------------------------ */
  async function epilogue() {
    STATE.chapter = 5;
    await G.chapter('終章', 'いつもの日常', '');
    G.load('O1', 7, 6, 'left');
    G.cinema(true); G.clearActors();
    G.place('siesta', 6, 6, 'right'); G.place('me', 7, 6, 'left');
    G.cam(7, 6); G.snap();
    G.time('15:00');
    G.bgm('i_daily');
    await G.fadeIn(1500);
    await N('儀式から、一週間。九条探偵事務所。');
    await N('世界は、何事もなかったように回っている。シードフォロワーの報せは、あの夜から一度も届いていない。');
    await X('siesta', '……ねえ、助手。紅茶。', 'closed');
    await M('はいはい。ミルク多めで、砂糖は二つ。', 'smile');
    await X('siesta', '正解。', 'smile');
    await N('カップを受け取って、シエスタは窓の外を眺めた。午後の光が、白い髪に溶けている。');
    await X('siesta', '……三百年、か。私たち、その頃にはもう、いないね。', 'think');
    await M('いないね。', 'smile');
    await X('siesta', 'じゃあ、それまでは、ずっとこうしてよう。事件を解いて、紅茶を飲んで、昼寝して。', 'smile');
    await M('最後の、絶対いらないよね。', 'sad');
    await X('siesta', 'いちばん大事。', 'smile');
    await N('郵便受けで、ことり、と音がした。');
    await X('siesta', 'ほら。……事件だよ、助手。', 'smile');
    await M('……朝から寝てた人が言う？', 'sad');
    await X('siesta', '名探偵だからね。', 'smile');
    await N('私は手帳を開いて、新しい頁に、今日の日付を書いた。');
    await G.fadeOut(2000);
    G.bgm(null);
    await G.mono([
      '九条さん。',
      'あなたがいなくなって、名探偵に出会って、名探偵を失って、名探偵を取り戻して。',
      '私は今も、探偵の隣にいます。\nときどき、探偵の真ん中にも。',
      'この手帳は、たぶん、まだまだ終わりません。',
      '探偵助手 {N} の手記より　FILE.10　―― 完 ――',
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
    if (c === 2) { await M(W.mapId === 'O1' ? '（公園へ行こう。事務所の出口から）' : '（桜の木の下に、誰かがいる気がする）', 'think'); return; }
    if (c === 3) {
      const where = {
        k_seating: '円卓の間の円卓', k_bruno: 'ロビーのブルーノさん', k_nagi: '祭壇の間のナギさん（……誰かの証言を持っていけば、話してくれるかも）',
        k_keylog: '警備室の机', k_shinomiya: '円卓の間の篠宮さん', k_record: '記録庫の書類棚', k_barrier: '祭壇の間のシュバルツさん',
        k_blueprint: '記録庫の机', k_irving: 'ロビーのアーヴィング卿',
      };
      const L = INV.filter(id => !has(id)).map(id => where[id]);
      await S(`まだなのは……${L.slice(0, 2).join('、')}。……それ以上は、言わない。`, 'smile');
      return;
    }
    await S('……助手。私は、ここにいるよ。', 'smile');
  }

  /* ------------------------------------------------------------------
     イベント
     ------------------------------------------------------------------ */
  const EVENTS = {
    O1: [
      { at: [[6, 9], [7, 9]], check: () => leaveOffice(), clue: () => ch() === 2 && W.mapId === 'O1' },
      { at: [[6, 8], [7, 8]], when: () => ch() === 2, step: () => leaveOffice() },
    ],
    PK: [
      { at: Array.from({ length: 20 }, (_, i) => [i + 1, 4]), when: () => ch() === 2 && !f().parkDone, step: () => meetRaven() },
      { at: [[8, 3]], when: () => ch() === 2 && !f().parkDone, check: () => meetRaven(), clue: () => ch() === 2 && !f().parkDone },
    ],
    FH: [
      { at: [[12, 4], [13, 4]], sprite: 'papers', when: () => ch() === 3, check: examSeating, clue: () => ch() === 3 && !has('k_seating') },
      { at: [[5, 11], [6, 11]], when: () => ch() === 3, check: examKeylog, clue: () => ch() === 3 && !has('k_keylog') },
      { at: [[6, 5]], when: () => ch() === 3, check: examRecord, clue: () => ch() === 3 && !has('k_record') },
      { at: [[2, 4], [3, 4]], when: () => ch() === 3, check: examBlueprint, clue: () => ch() === 3 && !has('k_blueprint') },
      { at: [[24, 4]], sprite: 'brazier', solid: true, when: () => ch() >= 3 },
    ],
  };
  // スプライトは1マスごと
  EVENTS.FH = EVENTS.FH.flatMap(e => e.sprite && e.at.length > 1 ? e.at.map((p, i) => Object.assign({}, e, { at: [p], sprite: i === 0 ? e.sprite : undefined })) : [e]);

  const TALK = {
    siesta: async () => hint(),
    bruno: talkBruno, nagi: talkNagi, shinomiya: talkShinomiya, irving: talkIrving, schwarz: talkSchwarz,
    kase: talkKase, multigate: talkMultigate, dorothy: talkDorothy,
  };

  function onResume() {
    W.storm = false;
    SND.rain(0); SND.hum(0);
    night(STATE.chapter === 2 && STATE.map === 'PK');
    SND.bgm(STATE.chapter === 2 ? 't_sad' : STATE.chapter === 5 ? 'i_daily' : 'z_council');
  }

  return {
    npcs, objective, FLAVOR, flavor, EVENTS, talk: id => (TALK[id] ? TALK[id]() : Promise.resolve()),
    prologue, hint, onResume, hintFromMenu: true, initState,
    resume2, park, resume3, deduce, fight,
    hintMenu: () => 'シエスタに聞く（ヒント）',
    hideTrust: () => true,
    focusLabel: '集中',
    nbName: '手帳',
    start: { map: 'O1', x: 7, y: 6, dir: 'up' },
    people: () => {
      const c = STATE.chapter;
      const L = ['siesta', 'kase'];
      if (c >= 1) L.push('multigate', 'schwarz', 'dorothy', 'irving', 'bruno', 'nagi', 'shinomiya');
      if (c >= 2) L.push('yogarasu_x');
      return L;
    },
    evidenceIds: () => K_EVIDENCE_ORDER,
    result() {
      const fo = STATE.focus || 0, hp = STATE.party.me.hp;
      const score = Math.round(fo * 0.7 + hp * 0.3);
      const [rank, title] = score >= 85 ? ['S', '名探偵の、相棒'] : score >= 65 ? ['A', '本物の探偵'] : score >= 45 ? ['B', '名探偵の助手'] : ['C', 'まだまだ助手'];
      return {
        label: '探偵助手の、最後の記録', rank, title,
        stats: `最終集中力　${fo} / 100<br>最後の戦いのあとのHP　${hp} / 100<br>集めた証拠・証言　${STATE.evidence.length} / ${K_EVIDENCE_ORDER.length}`,
        credits: `<h2>聖典の儀式</h2><p style="color:#ffb060">― 探偵助手の手記 FILE.10 ―</p>
          <h4>探偵助手</h4><p>${esc(STATE.name)}</p><h4>《名探偵》</h4><p>シエスタ</p>
          <h4>《調律者》</h4><p>《巫女》マルチルゲート</p><p>《技工士》シュバルツ</p><p>《執行者》加瀬 風靡</p><p>《夢幻》ドロシー</p><p>《情報屋》ブルーノ・ベルモンド</p><p>《暗殺者》ナギ</p>
          <h4>連邦</h4><p>アーヴィング卿</p><p>篠宮 透子</p>
          <h4>《怪盗》</h4><p>鴉城 零</p>
          <h4>in memory of</h4><p>九条 玲司</p><p>鴉城 ミオ</p>
          <h4>シナリオ・プログラム・グラフィック・音楽</h4><p>すべてブラウザ上で生成</p>
          <h4>Special Thanks</h4><p>FILE.01 から最後まで、遊んでくれたあなた</p><div class="end">―― 探偵助手の事件簿　完 ――</div>`,
        bgm: 'z_ending',
      };
    },
  };
})();
