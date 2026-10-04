'use strict';
/* =========================================================
   STORY_IDOL : いつもの探偵 ― シナリオ
   ========================================================= */
const STORY_IDOL = (() => {
  const f = () => STATE.flags;
  const ch = () => STATE.chapter;
  const has = id => STATE.evidence.includes(id);
  const S = (t, e, o) => G.say('siesta', t, e, o);
  const M = (t, e, o) => G.say('me', t, e, o);
  const N = (t, o) => G.narr(t, o);
  const X = (w, t, e, o) => G.say(w, t, e, o);
  const touch = () => document.body.classList.contains('touch');

  const PHASE_A = ['i_akari', 'i_manabe', 'i_mido', 'i_cue', 'i_marks', 'i_notebook', 'i_sora', 'i_okochi'];
  const PHASE_B = ['i_light', 'i_receiver', 'i_remote', 'i_confetti', 'i_booklet'];
  const cA = () => PHASE_A.filter(has).length;
  const cB = () => PHASE_B.filter(has).length;

  /* ------------------------------------------------------------------ */
  function initState(S0) {
    S0.map = 'O1'; S0.x = 7; S0.y = 8; S0.dir = 'down';
    S0.follower = 'siesta'; S0.follow = false; S0.time = '08:00';
    S0.party = { me: { hp: 100, max: 100 } };
    S0.items = {};
    S0.evidence = [];
    Object.assign(S0.flags, { named: true, revealed: true, heartTold: true });
  }

  const IV_NPCS = [
    ['akari', 4, 3, 'down'], ['sora', 8, 3, 'down'], ['haibara', 31, 3, 'left'],
    ['mido', 31, 11, 'left'], ['manabe', 6, 7, 'down'], ['okochi', 20, 11, 'up'],
  ];
  function npcs(id) {
    const L = [], c = STATE.chapter;
    const add = (i, x, y, d) => L.push({ id: i, x, y, dir: d });
    if (id === 'O1' && c === 0) add('siesta', 6, 6, 'left');
    if (id === 'IV' && (c === 1 || c === 2)) {
      IV_NPCS.forEach(([i, x, y, d]) => add(i, x, y, d));
      if (c === 2) { L.find(n => n.id === 'manabe').x = 2; L.find(n => n.id === 'manabe').y = 3; }
    }
    return L;
  }

  function objective() {
    const c = ch();
    if (c === 0) return f().mail ? (f().woke ? '' : 'シエスタを起こす') : '郵便受けを確かめる（事務所の入口）';
    if (c === 1) return cA() < PHASE_A.length ? `開演前に、関係者と現場を調べる（${cA()} / ${PHASE_A.length}）` : '';
    if (c === 2) return cB() < PHASE_B.length ? `警察が来る前に、真相の手がかりを集める（${cB()} / ${PHASE_B.length}）` : '';
    return '';
  }

  const FLAVOR = {
    // 事務所
    B: ['本棚。九条さんの事件記録と、シエスタの推理小説が、仲良く並んでいる。'], K: ['柱時計。'], h: ['九条さんの椅子。……今は、シエスタの昼寝用。'], d: ['事務所の机。'],
    S: ['ソファ。'], t: ['テーブル。'], P: ['観葉植物。'], L: ['ライト。'], W: ['窓。'], Z: ['額縁。'],
    // ホール
    N: ['ネオンサイン。「STELLARIUM ― GRADUATION LIVE」'], X: ['ステージ背面の大型スクリーン。'], M: ['操作卓。'], R: ['機材ラック。'],
    T: ['化粧台。'], C: ['受付カウンター。'], V: ['自動販売機。'],
  };
  async function flavor(c, x, y) {
    if (W.mapId === 'O1' && c === 'S' && ch() === 0) { await N('シエスタの定位置。クッションが三つ、なぜか全部シエスタの形にへこんでいる。'); return; }
    if (W.mapId === 'IV' && c === 'S') { await N(x <= 6 ? '楽屋のソファ。衣装の羽根が一枚、落ちている。……白い羽根だ。' : 'ソファ。'); return; }
    const L = FLAVOR[c]; if (!L) return;
    for (const l of L) await N(l);
  }

  /* ------------------------------------------------------------------
     序章 いつもの朝
     ------------------------------------------------------------------ */
  async function prologue() {
    STATE.chapter = 0;
    G.storm(false); G.rain(0); G.hum(0); G.bgm(null);
    await G.mono([
      'シエスタが目を覚まして、一ヶ月。',
      '私たちは東京に戻り、閉じていた九条探偵事務所の扉を、もう一度開けた。',
    ]);
    G.load('O1', 7, 8, 'down');
    G.cinema(true); G.clearActors(); G.restore();
    G.place('me', 7, 8, 'down');
    G.cam(7, 6); G.snap();
    G.time('08:00');
    G.bgm('i_daily');
    await G.fadeIn(1200);
    await N('朝八時。九条探偵事務所。');
    await N('ソファの上では、白い髪の名探偵が、毛布にくるまって丸くなっていた。');
    await X('siesta', '……すう……。', 'closed');
    await M('（……毎朝これだ）', 'sad');
    await N('私の朝は、いつも同じことから始まる。');
    G.cam(null); G.cinema(false);
    G.toast(touch()
      ? '<b>移動</b>：十字ボタン　<b>調べる・話す</b>：Aボタン　<b>手帳</b>：Bボタン'
      : '<b>移動</b>：矢印キー / WASD　<b>調べる・話す</b>：Z / Enter　<b>手帳</b>：X / Esc', 6000);
  }

  async function mailbox() {
    if (ch() !== 0) return;
    if (f().mail) { await N('郵便受け。もう空っぽだ。'); return; }
    f().mail = true;
    SND.se('door');
    await N('事務所の郵便受けを開ける。');
    await N('あの頃は、毎朝ここを確かめて、空っぽなのを見て帰っていた。');
    SND.se('page');
    await N('――今朝は、手紙が三通。');
    await N('一通目。電気料金の請求書。……シエスタが一日中つけっぱなしにしている、こたつのせいだ。');
    await N('二通目。薄紫の絵はがき。ウサギの絵の下に、丸い字で「いい夢を。――ドロシー」。');
    await N('三通目。「九条探偵事務所 御中」。……仕事の依頼の、予約の手紙だった。');
    await M('（郵便受けに、ちゃんと手紙が届く。……それだけで、ちょっと泣きそうになる）', 'smile');
    await M('さて。……名探偵を起こさないと。', 'serious');
  }

  async function wakeSiesta() {
    if (!f().mail) { await X('siesta', '……むにゃ……あと五分……。', 'closed'); await M('（先に、郵便受けを見てこよう）', 'think'); return; }
    if (f().woke) return;
    f().woke = true;
    G.cinema(true);
    await M('シエスタ。朝だよ。', 'serious');
    await X('siesta', '……あと五分。', 'closed');
    await M('五分前にも聞いた。', 'angry');
    await X('siesta', 'じゃあ、あと五年。', 'closed');
    await M('単位が増えた!?', 'shock');
    await X('siesta', '……六十年寝る予定だったんだから、五年くらい誤差でしょ。', 'smile');
    await M('その冗談、笑えないからやめて！！', 'angry');
    await X('siesta', 'ふふ。……おはよう、助手。', 'smile');
    await N('シエスタは毛布から顔を出して、ふにゃりと笑った。胸の奥で、あの心臓が、静かに動いている。');
    await X('siesta', '今日はね、私が紅茶を淹れてあげる。リハビリの一環。', 'smile');
    await M('え。……大丈夫？', 'think');
    await N('五分後。');
    await N('差し出されたカップの中身は、紅茶と呼ぶには、あまりにも黒かった。');
    await M('……これ、何杯分の茶葉を入れたの。', 'sad');
    await X('siesta', '名探偵は、細かいことは気にしない。', 'smile');
    await M('（……苦い。けど、なんだか、すごくおいしい気がした）', 'smile');
    await X('siesta', 'ねえ、助手。事務所の看板、ずっと「九条探偵事務所」のままだね。', 'think');
    await M('……変える？ シエスタの名前に。', 'think');
    await X('siesta', 'ううん。このままがいい。ここは、九条さんと君の場所だから。私は、居候の名探偵。', 'smile');
    await M('居候が一番えらそうなんだけど。', 'sad');
    SND.se('knock');
    await N('――こん、こん。');
    await N('扉を叩く音。予約の手紙の主だ。');
    G.clearActors();
    G.place('siesta', 6, 6, 'down'); G.place('me', 7, 6, 'down'); G.place('manabe', 7, 8, 'up');
    G.cam(7, 6); G.snap();
    await X('manabe', '突然すみません。芸能事務所スターダスト・プロの、真鍋と申します。', 'serious');
    await X('manabe', '《ステラリウム》というアイドルグループの、星乃あかりのマネージャーをしております。', 'serious');
    await X('manabe', '今夜、あかりの卒業ライブがあるんです。そこに――こんなものが。', 'sad');
    SND.se('sting');
    await N('机の上に置かれたのは、黒い羽根が添えられた、一枚の紙だった。');
    await G.gain('i_letter', '証拠品を入手');
    await M('夜鴉……!? でも、あの怪盗は――', 'shock');
    await X('siesta', '……今は、世界樹の底。こんなところに、予告状なんて出せない。', 'serious');
    await X('siesta', 'それに、本物の夜鴉なら「頂く」なんて書かない。「拝借する」って書く。', 'think');
    await M('（そこ……？）', 'sad');
    await X('manabe', '警察にも相談しましたが、いたずらだろうと。……でも、あかりが、どうしても探偵さんに頼みたいと言って。', 'sad');
    await X('siesta', '引き受けます。', 'smile');
    await X('siesta', 'ただし――今回の探偵は、こっち。', 'smile');
    await N('シエスタの指が、まっすぐ私を指していた。');
    await M('……え？ 私？', 'shock');
    await X('siesta', '君は、ずっと探偵の隣にいた。九条さんの隣で、私の隣で。……そろそろ、自分の足で真ん中に立ってみて。', 'serious');
    await X('siesta', '今日だけは、私が助手。君が探偵。', 'smile');
    await X('siesta', '言っておくけど、この事件、難しいよ。……名探偵の、最後の試験。', 'serious');
    await M('…………。', 'closed');
    await M('……分かった。やってみる。', 'serious');
    await X('siesta', 'よろしくね、探偵さん。', 'smile');
    await G.fadeOut(1200);
    G.cinema(false);
    await ch1();
  }

  /* ------------------------------------------------------------------
     第一章 予告状
     ------------------------------------------------------------------ */
  async function ch1() {
    STATE.chapter = 1;
    await G.chapter('第一章', '予告状', '― 東京シリウスホール・開演二時間前 ―');
    G.load('IV', 17, 8, 'up');
    G.cinema(true); G.clearActors();
    G.place('me', 17, 8, 'up'); G.place('siesta', 16, 8, 'up'); G.place('manabe', 18, 7, 'down');
    G.cam(17, 7); G.snap();
    G.time('17:00');
    G.bgm('i_daily');
    await G.fadeIn(900);
    await N('東京シリウスホール。開演は19時。客席はまだ空っぽで、スタッフが慌ただしく走り回っている。');
    await X('manabe', '開演まで二時間です。あかりは楽屋A、メンバーは楽屋B。照明は灰原さん、プロデューサーの御堂さんはPA席にいます。', 'serious');
    await X('siesta', '探偵さん、指示をどうぞ。', 'smile');
    await M('……その呼び方、慣れない。', 'sad');
    await X('siesta', '私は助手だから、答えは言わないよ。荷物持ちと、紅茶係と、たまに場所の案内くらい。', 'smile');
    await M('（いつもと逆。……しっかりしないと）', 'serious');
    G.cam(null); G.cinema(false);
    STATE.follow = true; G.follow(true);
    G.clearActors(); G.restore();
    G.toast('<b>第一章</b>：開演前に、関係者と現場を調べよう。<br><b>この事件は難しい。</b>証言と証拠を、一字一句よく読もう。', 7000);
  }

  async function talkAkari() {
    if (ch() === 1 && !has('i_akari')) {
      G.cinema(true);
      await N('楽屋A。鏡の前に、ピンクの衣装を着た少女が座っていた。');
      await X('akari', 'あ……探偵さん、ですよね。来てくれて、ありがとうございます。', 'smile');
      await X('akari', '星乃あかりです。……今日で、アイドルを卒業します。', 'smile');
      await M('予告状のことは、聞いています。怖くないですか？', 'serious');
      await X('akari', '……怖いです。でも、ライブはやります。', 'serious');
      await X('akari', '最後の歌だけは、絶対に歌わなきゃいけないの。', 'serious');
      await M('最後の歌？', 'think');
      await X('akari', '今日初めて歌う新曲です。「星の終わりに」。……私にとって、いちばん大事な歌。', 'smile');
      await X('akari', '探偵さんにお願いしたいって言ったのは、私なんです。空の上の事件を解決した人たちだって、聞いたから。', 'smile');
      await G.gain('i_akari', '証言を記録');
      G.cinema(false);
      await checkA();
      return;
    }
    if (ch() === 1) { await X('akari', '探偵さん。……今日のライブ、ちゃんと見ててくださいね。', 'smile'); return; }
    if (ch() === 2) { await X('akari', '……大丈夫です。半歩、下がってたから。……私、大丈夫です。', 'sad', { tremble: true }); return; }
  }
  async function talkManabe() {
    if (ch() === 1 && !has('i_manabe')) {
      await X('manabe', '予告状のことですか？', 'serious');
      await X('manabe', '三日前、事務所の郵便受けに入っていました。切手も消印もありません。誰かが、直接入れたんです。', 'serious');
      await X('manabe', '探偵を頼もうと言い出したのは、あかりでした。それも、九条探偵事務所を名指しで。', 'think');
      await G.gain('i_manabe', '証言を記録');
      await checkA();
      return;
    }
    if (ch() === 2) { await X('manabe', 'あかり……よかった、本当によかった……。', 'sad', { tremble: true }); return; }
    await X('manabe', '何かあれば、すぐに呼んでください。', 'serious');
  }
  async function talkMido() {
    if (ch() === 1 && !has('i_mido')) {
      await X('mido', '探偵？ ……ああ、真鍋が勝手に呼んだやつか。', 'angry');
      await X('mido', '予告状など、どうせファンのいたずらだ。むしろ話題作りにちょうどいい。ライブは予定通りだ。', 'smile');
      await M('演出について、聞かせてください。', 'serious');
      await X('mido', 'ふん。最後の曲「星の終わりに」。ブリッジで一度、会場を真っ暗にする。', 'smile');
      await X('mido', 'そして最後のサビ。あかりをセンターの0番に立たせて、暗転明けにスポットを当てる。最高の演出だろう？', 'smile');
      await X('mido', '昨日、私が決めた。あの子の最後に、ふさわしい舞台をな。', 'smile');
      await G.gain('i_mido', '証言を記録');
      await checkA();
      return;
    }
    if (ch() === 2) { await X('mido', '事故だ！ いや、夜鴉だ！ 予告状の通りじゃないか！ 早く警察を――', 'angry'); return; }
    await X('mido', '忙しいんだ。用がないなら出ていけ。', 'angry');
  }
  async function talkHaibara() {
    if (ch() === 1 && !has('i_cue')) {
      await X('haibara', '……照明の灰原です。', 'closed');
      await M('今日の照明の段取りを、見せてもらえますか。', 'serious');
      await X('haibara', '……これが、キューシートです。', 'serious');
      await N('灰原さんが差し出した紙の、最終曲の欄に、手書きの書き足しがあった。');
      await X('haibara', '最後の曲のブリッジで、6秒間の暗転。……昨日、御堂さんの指示で追加しました。', 'think');
      await X('haibara', '正直、危ないとは言いました。暗転中は、ステージの上が何も見えない。でも、「演出だ」の一点張りで。', 'sad');
      await G.gain('i_cue', '証拠品を入手');
      await checkA();
      return;
    }
    if (ch() === 2) {
      if (!has('i_receiver')) { await X('haibara', '……7番サスが、落ちるはずがない。セーフティワイヤーは、俺が毎回確かめてる。', 'angry'); return; }
      if (!has('i_confetti')) {
        await M('灰原さん。これ、見覚えはありますか。', 'serious');
        await N('7番サスの吊り具に貼られていた受信機を見せる。「CONFETTI-RX 02」。');
        await X('haibara', '……銀テープの、キャノンの受信機だ。2号機の。……なんで、こんなところに。', 'shock');
        await X('haibara', '銀テープのリモコンは、御堂さんが「最後は私が押す」と言って、本番中ずっと自分で持ってた。誰にも触らせなかった。', 'think');
        await X('haibara', '……なのに、最後の銀テープは、出なかった。', 'serious');
        await G.gain('i_confetti', '証言を記録');
        await checkB();
        return;
      }
      await X('haibara', '……俺の照明で、人が死ぬところだった。', 'closed');
      return;
    }
    await X('haibara', '……準備があるので。', 'closed');
  }
  async function talkSora() {
    if (ch() === 1 && !has('i_sora')) {
      await X('sora', '探偵さん？ あかりちゃんのこと、守ってくれるんですか？', 'shock');
      await X('sora', '……あかりちゃんは、研究生のころから、ずっとノートに歌詞を書いてたんです。休憩中も、移動のバスでも。', 'smile');
      await X('sora', 'でも、出来上がった曲は、ぜんぶ御堂さんの名前で出てる。……そういうものなんだって、あかりちゃんは笑ってたけど。', 'sad');
      await X('sora', 'あ、それと……三日前の夜、事務所に忘れ物を取りに行ったら、あかりちゃんがひとりで残ってたの。', 'think');
      await X('sora', '事務所のプリンターの前で。……何してたんだろう。', 'think');
      await G.gain('i_sora', '証言を記録');
      await checkA();
      return;
    }
    if (ch() === 2) { await X('sora', 'あかりちゃん……！ よかった……！', 'sad', { tremble: true }); return; }
    await X('sora', '明日から、私がセンター。……全然、実感ないです。', 'sad');
  }
  async function talkOkochi() {
    if (ch() === 1 && !has('i_okochi')) {
      await N('開場前の客席に、ピンクの法被を着た男性がひとり。');
      await M('すみません、まだ開場前ですよ。', 'serious');
      await X('okochi', 'ボクは関係者！ ……の、知り合いの、知り合いだ！', 'angry');
      await X('okochi', 'ボクは「黒羽」！ あかりちゃんのファン歴三年、この三年で手紙を三百通書いた！ もちろん全部、手書きさ！', 'smile');
      await N('男性の鞄で、黒い羽根のキーホルダーが揺れていた。');
      await X('siesta', '……黒い羽根。', 'think');
      await G.gain('i_okochi', '証言を記録');
      await checkA();
      return;
    }
    if (ch() === 2) { await X('okochi', 'ボ、ボクじゃない！ ボクはずっと、最前列でペンライト振ってた！ みんな見てたはずだ！', 'shock'); return; }
    await X('okochi', 'あかりちゃんの卒業……ボクは、最後まで見届けるぞ……！', 'sad');
  }

  async function examNotebook() {
    if (has('i_notebook')) { await N('あかりの歌詞ノート。'); return; }
    if (ch() !== 1 && ch() !== 2) return;
    await N('楽屋のテーブルに、ピンクの表紙のノートが置かれていた。');
    await M('（人のノートを勝手に見るのは……）', 'think');
    await X('siesta', '探偵さんが迷ってる間に、助手が開けておきました。', 'smile');
    await M('いつもと同じじゃない！！', 'angry');
    await N('中身は、手書きの歌詞だった。最後の頁に、今夜歌う新曲「星の終わりに」。');
    await N('「最後の歌が終わる前に　あなたに本当のことを言うよ」');
    await N('前のほうの頁には、グループのヒット曲の下書き。日付は、三年前。');
    await G.gain('i_notebook', '証拠品を入手');
    if (ch() === 1) await checkA(); else await checkB();
  }
  async function examMark() {
    if (has('i_marks')) { await N('センターの0番のバミリ。真上には、7番サス。'); return; }
    if (ch() !== 1) return;
    await N('ステージの床に、立ち位置の目印のテープ――バミリが貼られている。');
    await N('最終曲のあかりの位置は、センターの「0番」。新しく貼り直されたばかりだ。');
    await N('すぐ横に、剥がされたテープの跡。元は「3番」が、あかりの位置だったらしい。');
    await N('見上げると、0番の真上に、大きな照明が吊られていた。');
    await X('haibara', '（照明ブースから）7番サス。重さ四十キロ。……落ちたら、ただじゃ済まない。', 'serious');
    await G.gain('i_marks', '証拠品を入手');
    await checkA();
  }
  async function examBooklet() {
    if (has('i_booklet')) { await N('《ステラリウム》のアルバムの歌詞カード。'); return; }
    await N('ラウンジのカウンターに、《ステラリウム》のアルバムが置かれていた。');
    await N('歌詞カードを開く。収録曲は、ぜんぶ同じ表記だった。「作詞・作曲：御堂礼二」。');
    if (has('i_notebook')) await M('（……あかりさんのノートに、三年前の下書きがあった曲も）', 'think');
    await G.gain('i_booklet', '証拠品を入手');
    if (ch() === 2) await checkB();
  }

  async function checkA() {
    if (ch() !== 1 || cA() < PHASE_A.length) return;
    G.cinema(true);
    G.time('18:55');
    await X('siesta', '――開演五分前。探偵さん、どう？', 'serious');
    await M('……何かが、引っかかってる。でも、まだ形にならない。', 'think');
    await X('siesta', 'うん。それでいい。……ライブ、見に行こう。何か起きるなら、そこで起きる。', 'serious');
    G.cinema(false);
    await live();
  }

  /* ------------------------------------------------------------------
     第二章 卒業ライブ
     ------------------------------------------------------------------ */
  async function live() {
    STATE.chapter = 2;
    G.bgm(null);
    await G.fadeOut(900);
    await G.chapter('第二章', '卒業ライブ', '― 19:00 開演 ―');
    G.cinema(true);
    G.scene('live');
    G.time('19:00');
    G.bgm('i_idol');
    await G.fadeIn(1200);
    await N('客席を埋め尽くす、ペンライトの海。');
    await N('ピンク、水色、金色。三千本の光が、あかりの名前を呼んでいた。');
    await X('akari', 'みんなーっ！ 今日は、来てくれてありがとう！', 'smile');
    await N('一曲、また一曲。あかりは、この三年間の全部を歌にして、ステージを駆け回った。');
    await X('siesta', '……いい歌だね。', 'smile');
    await M('うん。', 'smile');
    G.time('20:40');
    await X('akari', '次が、最後の曲です。……今日はじめて歌う、新曲。', 'serious');
    await X('akari', '歌い終わったら、みんなに伝えたいことがあります。最後まで、聴いてください。', 'serious');
    await X('akari', '――「星の終わりに」。', 'smile');
    await N('静かなピアノ。あかりの声が、ホールの天井まで、まっすぐ伸びていく。');
    await N('そして、ブリッジ――。');
    G.bgm(null);
    G.scene('blackout');
    SND.se('crash'); G.shake(10, 900, true);
    await N('会場が、真っ暗になった。予定通りの、6秒間の暗転。');
    await N('――その暗闇の中で、何かが、ステージに叩きつけられる音がした。');
    SND.se('crit'); G.shake(8, 700, true);
    await N('悲鳴。どよめき。ペンライトの光が、波のように揺れる。');
    G.scene(null);
    await G.fadeOut(400);
    G.load('IV', 19, 7, 'up');
    G.clearActors();
    G.place('akari', 19, 5, 'up'); G.place('me', 18, 7, 'up'); G.place('siesta', 20, 7, 'up');
    G.place('mido', 25, 7, 'left'); G.place('manabe', 14, 7, 'right'); G.place('haibara', 24, 5, 'left');
    G.cam(19, 5); G.snap();
    G.time('20:41');
    G.bgm('tension');
    await G.fadeIn(600);
    await N('照明が戻ったステージの、センター。0番のバミリの上に――7番サスが、落ちていた。');
    await N('あかりは、その半歩後ろで、へたりこんでいた。');
    await M('あかりさん！！', 'shock');
    await X('akari', '……だい、じょうぶ……です。当たって、ない……。', 'sad', { tremble: true });
    await X('manabe', 'あかり！！', 'shock');
    await X('mido', 'じ、事故だ！ いや、夜鴉だ！ 予告状の通りじゃないか！', 'angry');
    await X('siesta', '……加瀬さんに連絡した。四十分で来るって。それまで、誰もホールから出さないように。', 'serious');
    await X('siesta', '――探偵さん。四十分あれば、足りるよね？', 'serious');
    await M('……足りなくても、足りさせる。', 'serious');
    G.time('20:50');
    G.cam(null); G.cinema(false);
    G.clearActors(); G.restore();
    G.checkpoint('phaseB');
    G.toast('<b>第二章</b>：加瀬が来る前に、真相の手がかりを集めよう。', 5000);
  }
  async function phaseB() {
    STATE.chapter = 2; STATE.follow = true;
    G.cinema(false); G.cam(null);
    G.clearActors(); G.restore();
    G.bgm('tension');
    await G.fadeIn(500);
  }

  async function examLight() {
    if (has('i_light')) { await N('落下した7番サス。セーフティワイヤーは、真っすぐ切られている。'); return; }
    await N('0番のバミリの上に落ちた、7番サス。床の板が、大きくへこんでいる。');
    await N('落下を防ぐはずのセーフティワイヤーの先端を、拾い上げる。');
    await N('切り口が、真っすぐだ。擦り切れたんじゃない。……ニッパーで、切られている。');
    await N('照明を吊っていた吊り具の電磁ロックが、外れていた。');
    await M('（事故じゃない。誰かが、落とした）', 'serious');
    await G.gain('i_light', '証拠品を入手');
    await checkB();
  }
  async function examReceiver() {
    if (has('i_receiver')) { await N('吊り具の受信機。「CONFETTI-RX 02」。'); return; }
    if (!has('i_light')) { await N('照明の残骸の横に、何か小さな機械が転がっている。'); await M('（先に、落ちた照明そのものを調べよう）', 'think'); return; }
    await N('吊り具に、小さな受信機がテープで留められていた。これが、電磁ロックを外したらしい。');
    await N('ラベルには「CONFETTI-RX 02」。');
    await X('siesta', '……コンフェッティ。銀テープのことだね。', 'think');
    await G.gain('i_receiver', '証拠品を入手');
    await checkB();
  }
  async function examBin() {
    if (has('i_remote')) { await N('PA席のくず入れ。'); return; }
    if (ch() !== 2) { await N('くず入れ。紙コップが捨てられている。'); return; }
    await N('PA・関係者席のくず入れ。紙コップの下に、小さなリモコンが押し込まれていた。');
    await N('ラベルは「CONFETTI-TX」。ボタンが一つ、押し込まれたままになっている。');
    await G.gain('i_remote', '証拠品を入手');
    await checkB();
  }

  async function checkB() {
    if (ch() !== 2 || cB() < PHASE_B.length) return;
    G.cinema(true);
    G.time('21:20');
    await X('siesta', '……加瀬さん、もうすぐ着くって。', 'serious');
    await M('シエスタ。……関係者を、ステージに集めて。', 'serious');
    await X('siesta', '了解。――探偵さん。', 'smile');
    G.cinema(false);
    await finale();
  }

  /* ------------------------------------------------------------------
     第三章 いつもの探偵
     ------------------------------------------------------------------ */
  function stageSetup() {
    G.clearActors();
    G.place('akari', 13, 3, 'down'); G.place('sora', 15, 3, 'down'); G.place('manabe', 17, 3, 'down');
    G.place('okochi', 21, 3, 'down'); G.place('haibara', 23, 3, 'down'); G.place('mido', 25, 3, 'down');
    G.place('siesta', 17, 5, 'up'); G.place('me', 19, 5, 'up');
    G.cam(19, 4); G.snap();
  }
  async function T(who, text, e, o) { G.spot(who); return G.say(who, text, e, o); }
  const penalty = async () => {
    G.focus(-20);
    if (STATE.focus <= 0) await G.gameOver('BAD END', '探偵、失格', '推理は崩れ、ホールにはざわめきだけが残った。\n「夜鴉の予告状による事故」――事件はそう片付けられ、あかりの最後の歌は、永遠に歌われなかった。');
  };
  const WRONG = ['……探偵さん。それ、本当に今の話に合ってる？', '違うよ。……落ち着いて、手帳を一行ずつ読んで。', 'ううん。助手として言えるのは、それじゃないってことだけ。'];
  const P = (prompt, ids, o = {}) => G.present(prompt, ids, Object.assign({ penalty, noAuto: true, speaker: 'siesta', wrongLines: WRONG }, o));

  async function finale() {
    STATE.chapter = 3; STATE.follow = false;
    STATE.focus = 100;
    G.bgm(null);
    await G.fadeOut(900);
    if (!f().finaleSeen) { f().finaleSeen = true; await G.chapter('第三章', 'いつもの探偵', '― 21:25 ステージ ―'); }
    G.load('IV', 19, 5, 'up');
    G.cinema(true);
    stageSetup();
    G.time('21:25');
    G.checkpoint('finale');
    G.bgm('tension');
    await G.fadeIn(900);
    await N('照明の落ちたステージの上に、関係者が集められた。');
    await T('mido', 'こんなところに集めて、何のつもりだ。事故の後始末で忙しいんだ。', 'angry');
    await T('siesta', '探偵さんから、お話があります。……助手は、黙って聞いてるね。', 'smile');
    await T('me', '……今夜、このステージで起きたことを説明します。', 'serious');
    await N('いつもなら、ここで隣の探偵が口を開く。九条さんが。シエスタが。');
    await N('今日、口を開くのは――私だ。');
    G.bgm('deduction');
    G.toast('<b>第三章</b>：証拠を間違えると<b>集中</b>が大きく減ります（-20）。0になると<b>敗北</b>です。<br>助手のヒントは、ほとんどありません。', 7000);
    G.refresh(); $('hud').classList.remove('hidden'); setTimeout(G.refresh, 4000);

    await T('mido', '事故だよ、事故。古い照明が、たまたま落ちた。それだけのことだ。', 'angry');
    await P('7番サスの落下が、事故ではないと示す証拠は？', ['i_light'], { hint: '落ちた照明を、支えていたはずのもの。', alt: { i_receiver: 'それは“どうやって”落としたか。まずは、事故じゃないことを。' } });
    await T('me', '落下防止のセーフティワイヤーが、ニッパーで切られていました。擦り切れたんじゃない。誰かが、切ったんです。', 'serious');
    await T('haibara', '……やっぱり。俺は、毎回ワイヤーを確かめてた。', 'angry');
    await T('sora', 'でも……暗転の6秒間に、たまたま落ちたなんて……。', 'shock');
    await P('暗闇の中で落とせると、犯人が前もって知っていた理由は？', ['i_cue'], { hint: '「6秒間」は、いつ決まった？', alt: { i_mido: 'その人の言葉にも、ある。でも、まず“記録”として残っているものを。' } });
    await T('me', '最後の曲のブリッジの、6秒間の暗転。キューシートに、昨日書き足されたものです。', 'serious');
    await T('me', '暗闇の中なら、誰が何をしても見えない。照明が落ちる瞬間も、誰にも見られない。', 'serious');
    await P('照明が、ちょうど「あかりさんの真上」にあった理由は？', ['i_marks'], { hint: 'ステージの床。……剥がされたテープ。', alt: { i_cue: 'それは“暗くなった”理由。“真上”だった理由は？' } });
    await T('me', '最後のサビのあかりさんの立ち位置は、3番から0番に貼り替えられていました。0番の真上が、7番サスです。', 'serious');
    await G.timeline([
      { t: '三日前', text: '予告状が\n届く', cls: 'key' },
      { t: '昨日', text: '暗転と\n立ち位置を変更', cls: 'key' },
      { t: '20:40', text: '最終曲' },
      { t: '20:41', text: '暗転\n照明落下', cls: 'bad' },
      { t: '20:41', text: 'あかりは\n半歩後ろに' },
    ], ['昨日', '20:41', '準備された罠'], ['三日前', '20:45']);
    await T('mido', 'そ、それがどうした！ 全部、夜鴉の仕業だろう！ 予告状の通りに！', 'angry');
    await T('siesta', '……探偵さん。その予告状も、解かないとね。', 'serious');
    G.spot(null);
    await M('（予告状を書いたのは、誰か。――あの一文を、私はどこかで読んでいる）', 'think');
    const w = await G.pickPerson('予告状を書いたのは？', ['akari', 'okochi', 'sora', 'manabe', 'mido', 'haibara']);
    if (w !== 'akari') {
      const nm = shortName(w);
      await T('me', `……予告状を書いたのは、${nm}さんです。`, 'serious');
      await T('siesta', '…………探偵さん。', 'closed');
      SND.se('wrong');
      await G.gameOver('BAD END', '誤った推理', `${nm}への疑いで、場は混乱した。\nその隙に、本当の犯人は証拠を始末し――\n「夜鴉の予告状」は、誰にも解かれないまま、事件は闇に消えた。`);
    }
    await G.cutin('予告状を書いたのは――', null, 1100);
    G.spot('akari'); SND.se('sting'); G.shake(5, 600, true);
    await T('me', '……あかりさん。あなたですね。', 'serious');
    await T('akari', '…………。', 'shock');
    await T('manabe', 'な……!? あかりが、自分で!?', 'shock');
    await P('予告状を、あかりさんが書いたと示す証拠は？', ['i_notebook'], { hint: '予告状の一文と、同じ言葉が書かれていたもの。', alt: { i_sora: 'プリンターの前にいた。……それだけじゃ、まだ“書いた”とは言えない。', i_akari: 'あの子が探偵を呼んだ。……でも、決め手は“言葉”そのもの。' } });
    await T('me', '予告状の「最後の歌が終わる前に」。……これは、まだ誰にも発表されていない新曲の歌詞です。', 'serious');
    await T('me', 'この言葉を知っているのは、あの歌を書いた人だけ。――あなたのノートに、同じ一文がありました。', 'serious');
    f().letterSolved = true;
    await T('akari', '……はい。私が、書きました。', 'sad');
    await T('akari', '一週間前、聞いちゃったんです。御堂さんが、電話で話してるのを。', 'sad');
    await T('akari', '「最後のMCは、絶対にさせない。照明でも何でも使ってな」って。', 'sad', { tremble: true });
    await T('akari', '証拠なんて、何もない。警察に言っても、誰も信じてくれない。……だから、予告状を書いたんです。', 'sad');
    await T('akari', '探偵さんが来てくれたら、何かが変わるかもしれないって。', 'sad');
    await T('akari', '……暗転の時、半歩下がったのは、怖かったから。それだけです。', 'sad', { tremble: true });
    G.spot(null);
    await M('（予告状は、助けを呼ぶための声だった。……なら、照明を落としたのは）', 'serious');
    const who = await G.pickPerson('7番サスを落としたのは？', ['akari', 'sora', 'manabe', 'mido', 'haibara', 'okochi']);
    if (who !== 'mido') {
      const nm = shortName(who);
      await T('me', `……${nm}さん、あなたです。`, 'serious');
      await T('siesta', '…………。', 'closed');
      SND.se('wrong');
      await G.gameOver('BAD END', '誤った告発', `${nm}が取り押さえられ、本当の犯人は、そっと胸を撫で下ろした。\n星乃あかりの最後の歌は――誰の名前で、世に出るのだろう。`);
    }
    await G.cutin('犯人は――', null, 1100);
    G.spot('mido'); SND.se('sting'); G.shake(5, 600, true);
    await T('me', '御堂礼二さん。……照明を落としたのは、あなたです。', 'serious');
    await T('mido', '……くだらん。小娘の妄想と、探偵ごっこか。', 'smile');
    G.checkpoint('debate');
    await debate();
  }

  async function debate() {
    if (STATE.chapter !== 3) STATE.chapter = 3;
    if (W.mapId !== 'IV') G.load('IV', 19, 5, 'up');
    G.cinema(true);
    stageSetup();
    if (STATE.focus === undefined || STATE.focus <= 0) STATE.focus = 100;
    f().letterSolved = true;
    await G.fadeIn(300);
    await G.debate({
      enemy: 'mido', name: '御堂 礼二', short: '御堂',
      intro: '論戦開始！ 御堂の“心の防壁”を崩せ！ ――探偵として、最後まで。',
      partyName: '{N} ＆ シエスタ', hpName: '集中', hintLabel: '助手に聞く', hintHelp: 'シエスタから、ほんの少しだけヒントをもらう。', hintSpeaker: 'siesta',
      bgm: 'deduction', wrongDmg: 25,
      loseText: '言葉が続かなかった。\n御堂は鼻で笑い、「事故」の後始末を始めた。\nあかりの最後の歌は、誰にも届かないまま――。',
      rounds: [
        { claim: '暗転も立ち位置も、現場のスタッフが決めたことだ！ 偶然が重なっただけだ！', correct: ['i_mido'],
          alt: { i_cue: '（暗転を足したのが誰かは、書いてある。でも“立ち位置”まで決めたのは？ ……本人が、言ってた）', i_marks: '（貼り替えられたのは分かってる。“誰が”貼り替えさせたのか、を）' },
          hint: '暗転と、立ち位置。……両方を「昨日、私が決めた」と言った人がいたね。', counter: '言いがかりだ！',
          after: async () => {
            await M('開演前、あなた自身が言いました。「暗転明けに、あかりを0番に立たせる。昨日、私が決めた」と。', 'serious');
            await M('暗転を足したのも、あかりさんを照明の真下に動かしたのも、あなたです。', 'serious');
          } },
        { claim: '演出を決めたのは私だ。だが、照明を落とす手段などない！ 暗闇の中、誰でもできたことだろう！', correct: ['i_receiver'],
          alt: { i_light: '（ワイヤーは切られてた。……でも、それだけじゃ落ちない。ロックを外したのは？）', i_remote: '（リモコンの話は、もう少しあと。まずは、照明の“側”に何があったか）' },
          hint: '吊り具に、何が貼りついてた？', counter: '証拠がない！',
          after: async () => {
            await M('7番サスの吊り具に、受信機が留められていました。ラベルは「CONFETTI-RX 02」。', 'serious');
            await M('銀テープのキャノンの受信機です。……キャノンのリモコンを押せば、照明が落ちるように細工されていた。', 'serious');
          } },
        { claim: '銀テープのリモコン？ そんなもの、くず入れに捨ててあったんだろう！ 誰でも触れたはずだ！', correct: ['i_confetti'],
          alt: { i_remote: '（そう、リモコンは捨てられてた。問題は、捨てられる前に“誰が”持っていたか）' },
          hint: '本番中、そのリモコンを誰にも触らせなかった人がいたはず。', counter: '誰でも触れた！',
          after: async () => {
            await M('灰原さんが証言しています。銀テープのリモコンは、本番中ずっと、あなたが自分で持っていたと。誰にも触らせなかったと。', 'serious');
            await X('haibara', '……ああ。御堂さんが、離さなかった。', 'angry');
            await M('そして、最後の銀テープは出なかった。――あなたがボタンを押した時、落ちたのは銀テープじゃなく、照明だったからです。', 'serious');
          } },
        { claim: 'なぜ私があかりを狙う！ あの子を見つけ、育てたのは私だ！ 恩人だぞ！', correct: ['i_booklet'],
          alt: { i_notebook: '（ノートは、あかりさんが書いた証拠。……それが“誰の名前で”世に出ていたか）', i_sora: '（いい線。でも、ソラさんの言葉より、確かな“記録”があるはず）' },
          hint: 'あの子の歌は、誰の名前で売られていた？', counter: '動機などない！', cut: 'これが答えだ！',
          after: async () => {
            await M('《ステラリウム》のアルバム。収録曲は全部「作詞・作曲：御堂礼二」。', 'serious');
            await M('でも、あかりさんのノートには、三年前の日付で、そのヒット曲の下書きが残っていました。', 'serious');
            await M('あの歌を書いていたのは、あかりさんです。あなたはそれを、ずっと自分の名前で出していた。', 'angry');
            await M('卒業ライブの最後のMCで、あかりさんがそれを話す――あなたは、それだけは止めたかった。', 'serious');
            await X('akari', '……「最後の歌が終わる前に、本当のことを言う」。……あれは、そういう歌だったの。', 'sad');
          } },
      ],
    });
    f().solved = true;
    await afterDebate();
  }

  async function afterDebate() {
    G.bgm('truth');
    G.spot('mido');
    await N('御堂は、しばらく黙っていた。');
    await T('mido', '……三年前。オーディションに、ノートを抱えてやってきた子がいた。', 'closed');
    await T('mido', '歌は下手だった。だが、ノートの中の言葉は――本物だった。', 'closed');
    await T('mido', '私には、もう何も書けなかった。だから、借りた。……借りたまま、返せなくなった。', 'sad');
    await T('mido', '最後のMCで全部ばらされたら、私の三十年は終わる。……それだけが、怖かった。', 'sad');
    await T('akari', '……御堂さん。私、あなたに見つけてもらえたこと、本当に感謝してたんです。', 'sad');
    await T('akari', 'だから、名前なんて、本当はどうでもよかった。……ただ、最後の一曲だけは、自分の歌だって言いたかった。', 'sad', { tremble: true });
    G.spot(null);
    SND.se('door');
    G.place('kase', 21, 5, 'left');
    await T('kase', '……警察だ。待たせたな。', 'serious');
    await T('kase', '話は、扉の外で聞かせてもらった。御堂礼二。傷害未遂の容疑で、身柄を預かる。', 'serious');
    SND.se('gavel');
    await N('加瀬さんが、静かに手錠をかけた。');
    await T('kase', '……で。今日の推理は、名探偵じゃなくて、そっちか。', 'think');
    await T('siesta', 'うん。今日の私は、助手。', 'smile');
    await T('kase', 'ふん。……悪くなかったぞ、探偵。', 'smile');
    await G.fadeOut(1400);
    await ending();
  }

  /* ------------------------------------------------------------------
     終章 最後の歌
     ------------------------------------------------------------------ */
  async function ending() {
    STATE.chapter = 4;
    await G.chapter('終章', '最後の歌', '');
    G.cinema(true); G.clearActors();
    G.scene('encore');
    G.time('21:50');
    G.bgm('i_ending');
    await G.fadeIn(1500);
    await N('21時50分。まだ客席に残っていたファンの前に、あかりがもう一度、ひとりで立った。');
    await N('照明は、スポットがひとつだけ。音響は、ピアノ一台だけ。');
    await X('akari', '……みんな、ごめんね。最後の曲、途中で止まっちゃった。', 'smile');
    await X('akari', 'だから、もう一度だけ、歌わせてください。', 'smile');
    await X('akari', 'この歌は――私が書いた歌です。', 'serious');
    await N('客席が、一瞬だけ静まりかえって。それから、ペンライトの海が、ゆっくりと揺れはじめた。');
    await X('akari', '「最後の歌が終わる前に　あなたに本当のことを言うよ」', 'smile');
    await N('最前列で、ピンクの法被の大河内さんが、ぼろぼろ泣いていた。');
    await X('siesta', '……いい歌だね、探偵さん。', 'smile');
    await M('うん。……本当に。', 'smile');
    G.scene(null);
    await G.fadeOut(1500);
    // 翌朝
    G.load('O1', 7, 6, 'up');
    G.clearActors();
    G.place('siesta', 6, 6, 'right'); G.place('me', 7, 6, 'left');
    G.cam(7, 6); G.snap();
    G.time('08:00');
    G.bgm('i_daily');
    await G.fadeIn(1200);
    await N('翌朝。九条探偵事務所。');
    await X('siesta', 'はい、紅茶。……今日は、茶葉を三杯にしてみた。', 'smile');
    await M('昨日は何杯だったの。', 'sad');
    await X('siesta', '七杯。', 'smile');
    await M('……少しずつ、上手になってるね。', 'smile');
    await X('siesta', 'ねえ、探偵さん。', 'smile');
    await M('もう、その呼び方はいいよ。', 'sad');
    await X('siesta', 'ううん。……合格だよ。', 'serious');
    await X('siesta', '昨日の君は、ちゃんと探偵だった。誰の隣でもなく、真ん中に立ってた。', 'smile');
    await M('…………。', 'closed');
    await M('……でもさ。やっぱり私は、あなたの隣がいい。', 'smile');
    await X('siesta', 'ふふ。知ってる。', 'smile');
    await X('siesta', 'じゃあ、こうしよう。名探偵とその助手。どっちがどっちかは――', 'smile');
    await X('siesta', 'その日の気分で決める。', 'smile');
    await M('適当すぎる!!', 'angry');
    SND.se('knock');
    await N('――こん、こん。');
    await X('siesta', 'ほら、次の依頼。行こう、助手。……それとも、探偵さん？', 'smile');
    await M('……どっちでもいいよ。あなたと一緒なら。', 'smile');
    await G.fadeOut(1800);
    G.bgm(null);
    await G.mono([
      '九条探偵事務所の郵便受けには、今日も手紙が届く。',
      'ソファでは名探偵が昼寝をして、私は紅茶を淹れる。\n――それが、私たちの「いつもの探偵」。',
      '探偵助手 {N} の手記より　FILE.09',
    ]);
    W.mode = 'blank';
    G.cinema(false);
    await showResult();
  }

  /* ------------------------------------------------------------------
     ヒント（今回は、助手のシエスタは場所しか教えてくれない）
     ------------------------------------------------------------------ */
  async function hint() {
    const c = ch();
    if (c === 0) { await M(f().mail ? '（シエスタを起こそう。……ソファの上だ）' : '（まずは、郵便受け。事務所の入口だ）', 'think'); return; }
    if (c === 1) {
      const where = {
        i_akari: '楽屋A', i_notebook: '楽屋Aのテーブル', i_sora: '楽屋B', i_manabe: '舞台裏通路',
        i_cue: '照明ブース', i_marks: 'ステージの真ん中', i_mido: 'PA・関係者席', i_okochi: '客席',
      };
      const L = PHASE_A.filter(id => !has(id)).map(id => where[id]);
      await S(`探偵さん、まだ行ってない場所は……${[...new Set(L)].slice(0, 3).join('、')}。……私が言えるのは、ここまで。`, 'smile');
      return;
    }
    if (c === 2) {
      const where = { i_light: 'ステージのセンター', i_receiver: '落ちた照明のそば', i_remote: 'PA席のくず入れ', i_confetti: '照明ブース（見せたいものがあるなら）', i_booklet: '関係者ラウンジのカウンター' };
      const L = PHASE_B.filter(id => !has(id)).map(id => where[id]);
      await S(`残りは……${L.slice(0, 2).join('、')}。……がんばって、探偵さん。`, 'smile');
      return;
    }
    await S('今日の私は助手。答えは、探偵さんの手帳の中。', 'smile');
  }

  /* ------------------------------------------------------------------
     イベント
     ------------------------------------------------------------------ */
  const EVENTS = {
    O1: [
      { at: [[6, 9], [7, 9]], check: mailbox, clue: () => ch() === 0 && !f().mail },
    ],
    IV: [
      { at: [[3, 2]], sprite: 'notebook', when: () => ch() === 1 || ch() === 2, check: examNotebook, clue: () => ch() === 1 && !has('i_notebook') },
      { at: [[19, 4]], sprite: 'mark', solid: true, when: () => ch() === 1, check: examMark, clue: () => ch() === 1 && !has('i_marks') },
      { at: [[19, 4]], sprite: 'fallen', solid: true, when: () => ch() >= 2, check: examLight, clue: () => ch() === 2 && !has('i_light') },
      { at: [[20, 4]], sprite: 'receiver', solid: true, when: () => ch() === 2 && !has('i_receiver'), check: examReceiver, clue: () => ch() === 2 && has('i_light') && !has('i_receiver') },
      { at: [[32, 12]], sprite: 'bin', solid: true, when: () => ch() === 1 || ch() === 2, check: examBin, clue: () => ch() === 2 && !has('i_remote') },
      { at: [[1, 13]], sprite: 'cdbook', when: () => ch() === 1 || ch() === 2, check: examBooklet, clue: () => ch() === 2 && !has('i_booklet') },
    ],
  };

  const TALK = {
    siesta: async () => { if (ch() === 0) return wakeSiesta(); return hint(); },
    akari: talkAkari, manabe: talkManabe, mido: talkMido, haibara: talkHaibara, sora: talkSora, okochi: talkOkochi,
  };

  function onResume() {
    W.storm = false;
    SND.rain(0); SND.hum(0);
    SND.bgm(STATE.chapter === 2 || STATE.chapter === 3 ? 'tension' : 'i_daily');
  }

  return {
    npcs, objective, FLAVOR, flavor, EVENTS, talk: id => (TALK[id] ? TALK[id]() : Promise.resolve()),
    prologue, hint, onResume, hintFromMenu: true, initState,
    phaseB, finale, debate,
    hintMenu: () => '助手に聞く（ヒント）',
    hideTrust: () => true,
    focusLabel: '集中',
    nbName: '手帳',
    start: { map: 'O1', x: 7, y: 8, dir: 'down' },
    people: () => {
      const c = STATE.chapter;
      const L = ['siesta'];
      if (c >= 0 && f().woke) L.push('manabe');
      if (c >= 1) L.push('akari', 'sora', 'mido', 'haibara', 'okochi');
      if (c >= 3) L.push('kase');
      return L;
    },
    evidenceIds: () => I_EVIDENCE_ORDER,
    result() {
      const fo = STATE.focus || 0;
      const [rank, title] = fo >= 90 ? ['S', 'いつもの探偵'] : fo >= 70 ? ['A', '一人前の探偵'] : fo >= 45 ? ['B', '探偵見習い'] : ['C', 'やっぱり助手'];
      return {
        label: '探偵としての評価', rank, title,
        stats: `最終集中力　${fo} / 100<br>集めた証拠・証言　${STATE.evidence.length} / ${I_EVIDENCE_ORDER.length}`,
        credits: `<h2>いつもの探偵</h2><p style="color:#ff9ad0">― 探偵助手の手記 FILE.09 ―</p>
          <h4>探偵</h4><p>${esc(STATE.name)}</p><h4>助手（今日だけ）</h4><p>シエスタ</p>
          <h4>《ステラリウム》</h4><p>星乃 あかり</p><p>月島 ソラ</p>
          <h4>シリウスホールの人々</h4><p>真鍋 恭介</p><p>御堂 礼二</p><p>灰原 タクミ</p><p>大河内 守</p>
          <h4>《執行者》</h4><p>加瀬 風靡</p>
          <h4>in memory of</h4><p>九条 玲司</p>
          <h4>シナリオ・プログラム・グラフィック・音楽</h4><p>すべてブラウザ上で生成</p>
          <h4>Special Thanks</h4><p>最後まで遊んでくれたあなた</p><div class="end">名探偵とその助手の事件簿は、今日も続く。</div>`,
        bgm: 'i_ending',
      };
    },
  };
})();
