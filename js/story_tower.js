'use strict';
/* =========================================================
   STORY_TOWER : 未来視の時計台 ― シナリオ
   ========================================================= */
const STORY_TOWER = (() => {
  const f = () => STATE.flags;
  const ch = () => STATE.chapter;
  const has = id => STATE.evidence.includes(id);
  const S = (t, e, o) => G.say('siesta', t, e, o);
  const M = (t, e, o) => G.say('me', t, e, o);
  const N = (t, o) => G.narr(t, o);
  const X = (w, t, e, o) => G.say(w, t, e, o);
  const touch = () => document.body.classList.contains('touch');

  const GREET = ['harold', 'edgar', 'lily', 'oswald', 'multigate'];
  const greeted = () => GREET.filter(k => f()['g_' + k]).length;

  /* ------------------------------------------------------------------ */
  function initState(S0) {
    S0.map = 'HT'; S0.x = 10; S0.y = 6; S0.dir = 'left';
    S0.follower = 'siesta'; S0.follow = false; S0.time = '20:00';
    S0.party = { me: { hp: 90, max: 90 }, siesta: { hp: 110, max: 110 } };
    S0.items = { tonic: 2 };
    S0.flags.named = true;
  }

  function npcs(id) {
    const L = [], c = STATE.chapter, fl = STATE.flags;
    const add = (i, x, y, d) => L.push({ id: i, x, y, dir: d });
    if (id === 'CT' && (c === 2 || c === 3)) {
      add('harold', 9, 13, 'down'); add('edgar', 15, 6, 'down'); add('lily', 24, 3, 'left'); add('multigate', 21, 5, 'down');
      if (!(c === 3 && fl.exposed)) add('oswald', 5, 9, 'down');
    }
    return L;
  }

  function objective() {
    const c = ch(), fl = f();
    if (c === 2) return greeted() < 5 ? `祭典の関係者に挨拶する（${greeted()} / 5）` : '';
    if (c === 3) {
      if (!fl.planned) return '';
      if (!has('f_key')) return '機械室の合鍵を手に入れる（巫女の控室のリリィ）';
      if (!fl.coreDown) return '零時の前に、機械室の《根》を断つ';
    }
    return '';
  }

  const FLAVOR = {
    K: ['柱時計。どれも寸分違わず、同じ時を刻んでいる。'], X: ['工具棚。油の匂いがする。'], G: ['巨大な歯車の組み上げ台。ゆっくりと回っている。'],
    A: ['古い甲冑。祭典の飾りらしい。'], V: ['予言の祭壇。白い布と、金の燭台。'], h: ['祭典の参列席。'], B: ['古書の棚。'],
    S: ['ソファ。'], t: ['テーブル。'], L: ['ランプ。'], P: ['観葉植物。'], b: ['ベッド。'], w: ['クローゼット。'], d: ['書き物机。'],
    W: ['窓の外に、ロンドンの夜景が広がっている。'], Z: ['古い肖像画。'], F: ['暖炉。ぱちぱちと薪がはぜている。'], E: ['東門。夜風が吹き込んでくる。'],
  };
  async function flavor(c, x, y) {
    if (W.mapId === 'CT' && c === 'E' && y >= 13) { await N('東門。祭典の夜は、衛兵が交代で見張っている。'); if (ch() === 3) await M('（23時40分――ここで、爆発が起きる）', 'serious'); return; }
    const L = FLAVOR[c]; if (!L) return;
    for (const l of L) await N(l);
  }

  /* ------------------------------------------------------------------
     序章
     ------------------------------------------------------------------ */
  async function prologue() {
    STATE.chapter = 0; STATE.time = '20:00';
    G.storm(false); G.rain(0); G.hum(0); G.bgm(null);
    G.load('HT', 10, 6, 'left');
    G.cinema(true); G.clearActors();
    G.scene('world');
    G.bgm('s_explore');
    await G.fadeIn(1200);
    await N('あの空の上の事件から、一年。');
    await N('私は、白い髪の名探偵――シエスタの助手として、世界中を飛び回っていた。');
    await N('砂漠の遺跡で消えた石像。雪山のロッジの密室。南の島の、しゃべるオウムの遺言状。');
    await N('どれも、シエスタは鼻歌まじりで解いてしまった。……そして、だいたい私が酷い目に遭った。');
    G.scene(null);
    await G.wait(900);
    G.place('siesta', 7, 4, 'down'); G.place('me', 10, 6, 'left');
    G.cam(8, 5); G.snap();
    await N('イギリス、ロンドン。滞在中のホテルの一室。');
    await X('siesta', '助手ー。紅茶、まだ？', 'smile');
    await M('今いれてるでしょ！ ミルク多めで、砂糖二つ。分かってるから。', 'angry');
    await X('siesta', 'さすが。一年で、私の好みは完璧に覚えたね。', 'smile');
    await M('覚えさせられたの！！', 'angry');
    await X('siesta', 'ねえ、明日はどこ行こうか。大英博物館で、ミイラと睨めっこ大会とか。', 'smile');
    await M('一人でやって。', 'sad');
    SND.se('chime');
    await N('――その時、シエスタの携帯電話が鳴った。');
    await X('siesta', '……はい。', 'serious');
    await N('いつもの気の抜けた声じゃない。');
    await X('siesta', '……ええ。分かってる。……時計台。一週間後、零時。', 'serious');
    await X('siesta', '……了解。《名探偵》として、引き受けます。', 'closed');
    await N('電話の相手が誰なのか、シエスタは最後まで口にしなかった。');
    await M('……シエスタ？', 'think');
    await X('siesta', '助手。紅茶、置いて。', 'serious');
    await X('siesta', '――大事な話がある。', 'serious');
    await G.fadeOut(900);
    await ch1();
  }

  /* ------------------------------------------------------------------
     第一章 調律者
     ------------------------------------------------------------------ */
  async function memory(scene, lines) {
    G.flashback(true); G.scene(scene);
    await G.wait(700);
    for (const l of lines) await (typeof l === 'string' ? N(l) : X(l[0], l[1], l[2]));
    G.scene(null); G.flashback(false);
    await G.wait(500);
  }
  async function ch1() {
    STATE.chapter = 1;
    await G.chapter('第一章', '調律者', '― 祭典の一週間前 ―');
    G.load('HT', 10, 6, 'left');
    G.cinema(true); G.clearActors();
    G.place('siesta', 7, 4, 'down'); G.place('me', 9, 6, 'up');
    G.cam(8, 5); G.snap();
    G.time('20:30');
    G.bgm('truth');
    await G.fadeIn(900);
    await N('シエスタは窓辺に立ったまま、ロンドンの夜景を見下ろしていた。');
    await X('siesta', '助手。この世界にはね、表に出ない“守り手”たちがいるの。', 'serious');
    // ①
    await memory('tuners', [
      ['siesta', '《調律者》。強大な力を持つ、十二人。', 'serious'],
      ['siesta', '終末のパンデミック。第三次世界大戦。……世界を壊しかねない“脅威”を、人知れず止めてきた人たち。', 'serious'],
    ]);
    await M('……世界の、守り手？ そんな話、急にされても――', 'shock');
    // ②
    await X('siesta', '君は、もう何人かに会ってるよ。', 'smile');
    await X('siesta', 'たとえば私。《名探偵》。……いろいろ便利な道具を六つ持ってる。マスケット銃とか、ね。', 'smile');
    await memory('haneda', [
      '――羽田空港。赤い髪の女性が、パトカーの光の中に立っていた。',
      ['siesta', '加瀬風靡は《執行者》。人間離れした身体能力を持ってる。', 'serious'],
    ]);
    await memory('tower', [
      ['siesta', 'そして、これから会う人。マルチルゲート――《巫女》。世界の脅威を、予言する力を持つ子。', 'serious'],
    ]);
    // ③
    await X('siesta', 'それから。……君には、言わなきゃいけないことがある。', 'closed');
    await memory('kujo', [
      ['siesta', '先代の《名探偵》は――九条玲司。', 'serious'],
      '――九条さんの背中が、見えた気がした。',
    ]);
    await M('…………九条さん、が……？', 'shock', { tremble: true });
    await X('siesta', 'あの人は、ただの私立探偵じゃなかった。世界の脅威と戦う、《調律者》のひとりだった。', 'serious');
    await memory('moon', [
      ['siesta', 'あのホテルに現れた《怪盗》、鴉城零。……彼も、かつては《調律者》だった。', 'serious'],
      ['siesta', '世界の脅威と戦う側から、裏切って――今は、世界の敵。', 'serious'],
    ]);
    await M('……だから、九条さんは狙われた……。', 'sad');
    // ④
    await X('siesta', 'そして今、私たち《調律者》が最も警戒している脅威が――', 'serious');
    await memory('seed', [
      ['siesta', '《ユグドラシルのシード》。', 'serious'],
      '――飛行機の中。触手を生やした医師の、あの異様な姿がよみがえる。',
      ['siesta', '人を、人ではないものへ造り変える種。それを広めている組織がいる。', 'serious'],
    ]);
    // ⑤
    await X('siesta', '一週間後。時計台で、《巫女》の祭典が開かれる。', 'serious');
    await X('siesta', 'そこに、シードを持つ者が必ず襲撃に来る。巫女自身の予言だよ。', 'serious');
    await G.gain('f_mission', '任務');
    await X('siesta', '私たちの任務は――巫女を護衛すること。', 'serious');
    const r = await G.choose(['……怖くないの？', '私に、何ができるの？']);
    if (r === 0) { await M('……怖くないの？ 九条さんだって……。', 'sad'); }
    else { await M('……私に、何ができるの？ 九条さんだって、守れなかったのに。', 'sad'); }
    // ⑥
    G.bgm('s_ending');
    await N('シエスタは振り返って、私の目をまっすぐに見た。');
    await X('siesta', '助手。', 'smile');
    await X('siesta', '私は死なないよ。君のことも、死なせない。', 'smile');
    await X('siesta', '……九条玲司みたいな最期は、もう誰にも迎えさせない。', 'serious');
    await N('いつもの気楽な声だった。けれど、その奥には、何かを決めた人の響きがあった。');
    // ⑦
    await X('siesta', 'だから、これを持ってて。', 'smile');
    SND.se('clue');
    await N('手渡されたのは、手のひらほどの、古びた小さな本だった。');
    await G.gain('f_scripture', '託されたもの');
    await X('siesta', '《聖典》。持ち主によって、宿る力が変わるんだって。', 'smile');
    await M('力……？ 何が起きるの？', 'think');
    await X('siesta', 'さあ？ 何も起きないかも。まあ、お守りみたいなものだよ。', 'smile');
    await M('適当すぎない!?', 'angry');
    await X('siesta', 'ふふ。……でも、肌身離さず持っててね。約束。', 'smile');
    await G.fadeOut(1200);
    G.bgm(null);
    await G.mono(['それから、一週間。', '――祭典の夜が、来た。']);
    await ch2();
  }

  /* ------------------------------------------------------------------
     第二章 時計台の夜（未来視）
     ------------------------------------------------------------------ */
  async function ch2() {
    STATE.chapter = 2; STATE.follow = true;
    await G.chapter('第二章', '時計台の夜', '― 祭典当日 ―');
    G.load('CT', 9, 15, 'up');
    G.cinema(true); G.clearActors();
    G.place('me', 9, 15, 'up'); G.place('siesta', 10, 15, 'up'); G.place('harold', 9, 13, 'down');
    G.cam(9.5, 14); G.snap();
    G.time('23:00');
    G.bgm('f_fest');
    await G.fadeIn(1000);
    await N('23時。霧のロンドンにそびえる、時計台。');
    await X('harold', '《名探偵》殿と助手殿ですな！ 衛兵長のハロルドです！', 'smile');
    await X('harold', '巫女様は上の控室に。零時の鐘とともに、祭儀の間で予言の儀が始まります！', 'serious');
    await X('siesta', 'ありがとう。……じゃあ助手、皆に挨拶しておこうか。', 'smile');
    f().g_harold = true;
    G.clearActors(); G.restore();
    G.cam(null); G.cinema(false);
    G.toast('祭典の<b>関係者に挨拶</b>しよう。ついてくる<b>シエスタに話しかける</b>とヒントがもらえます。', 6000);
  }

  async function talkHarold() {
    if (ch() === 3) { await X('harold', '東門の見張りを倍にしました！ 爆発物など、持ち込ませはしません！', 'serious'); return; }
    await X('harold', '東門の警備が少し手薄でしてな。人手が足りんのです。', 'think');
    if (!f().g_harold) { f().g_harold = true; await afterGreet(); }
  }
  async function talkEdgar() {
    if (ch() === 3) { await X('edgar', '儀式の準備は整っております。……どうか、巫女様をお守りください。', 'serious'); return; }
    if (!f().g_edgar) {
      f().g_edgar = true;
      await X('edgar', '司祭のエドガーと申します。零時の鐘が鳴り終わると同時に、巫女様が予言を授かるのです。', 'serious');
      await X('edgar', '百年続く祭典です。……今宵も、無事に終わりますよう。', 'closed');
      await afterGreet(); return;
    }
    await X('edgar', '鐘の真下は、最も神聖な場所。どうかお静かに。', 'closed');
  }
  async function talkLily() {
    if (ch() === 3) return lilyKey();
    if (!f().g_lily) {
      f().g_lily = true;
      await X('lily', 'あ、あのっ、巫女様の侍女の、リリィです……！', 'shock');
      await X('lily', '巫女様、ずっと緊張してらして……。お二人が来てくださって、本当によかった。', 'smile');
      await afterGreet(); return;
    }
    await X('lily', '控室の鍵も機械室の鍵も、私が合鍵を預かってるんです。……なくさないように。', 'think');
  }
  async function lilyKey() {
    if (has('f_key')) { await X('lily', 'どうか、お気をつけて……！', 'sad'); return; }
    if (!f().planned) { await X('lily', '巫女様は、ずっと鐘の音を気にしてらして……。', 'sad'); return; }
    await M('リリィさん。機械室の合鍵を貸してください。', 'serious');
    await X('lily', 'き、機械室の……？ でも、あそこは時計守のオズワルドさんしか……。', 'shock');
    await X('siesta', '巫女の命がかかってる。お願い。', 'serious');
    await X('lily', '……分かりました。どうか、巫女様を。', 'serious');
    await G.gain('f_key', '鍵を借りた');
  }
  async function talkOswald() {
    if (ch() === 3) {
      await X('oswald', 'おや、また来られたか。紅茶はいかがかな。', 'smile');
      await N('差し出されたカップ。その手の甲に――あの、根の痣があった。');
      await M('（……やっぱり。未来で見た通りだ）', 'serious');
      return;
    }
    if (!f().g_oswald) {
      f().g_oswald = true;
      await X('oswald', '時計守のオズワルドだ。この塔の歯車を、三十年守ってきた。', 'smile');
      await X('oswald', '冷えるだろう。紅茶を一杯、どうかね。', 'smile');
      SND.se('ok');
      await N('差し出されたカップを受け取る。……その手の甲に、木の根のような痣が浮かんでいた。');
      f().sawHand = true;
      await M('（変わった痣……）', 'think');
      await X('oswald', '機械室は危ないから、鍵をかけてある。近づかんようにな。', 'serious');
      await afterGreet(); return;
    }
    await X('oswald', '時計はいい。決して嘘をつかん。', 'smile');
  }
  async function talkMultigate() {
    if (ch() === 3) { await X('multigate', '……あなたの目。何かを“視て”きた人の目をしていますね。', 'serious'); return; }
    if (!f().g_multigate) {
      f().g_multigate = true;
      await X('multigate', '……あなたたちが、《名探偵》と、その助手。', 'serious');
      await X('multigate', '《巫女》、マルチルゲート。……来てくれて、感謝します。', 'closed');
      await X('siesta', '久しぶり。顔色、悪いね。', 'smile');
      await X('multigate', '……予言を、視てしまったから。', 'sad');
      await X('multigate', '今夜、この塔に《根》が来る。そして零時の鐘の下で――ふたつの命が途切れる。', 'serious');
      await G.gain('f_prophecy', '予言を聞いた');
      await X('siesta', '大丈夫。そのために、私たちが来たんだから。', 'smile');
      await afterGreet(); return;
    }
    await X('multigate', '……鐘の音が、怖いのです。', 'sad');
  }
  async function afterGreet() {
    if (ch() !== 2 || greeted() < 5 || f().blast) return;
    f().blast = true;
    await G.fadeOut(600);
    G.time('23:40');
    G.cinema(true);
    await G.fadeIn(300);
    SND.se('crash'); SND.se('thunder'); G.shake(8, 900, true); G.flash('#ffb060', 400);
    await N('――轟音。塔全体が揺れた。');
    await X('harold', '（遠く）東門で爆発だ――！！ 衛兵、集まれ！！', 'shock');
    G.bgm('tension');
    await X('siesta', '……。助手、巫女のそばにいて。', 'serious');
    await X('siesta', '東門を見てくる。すぐ戻るから。', 'serious');
    await M('シエスタ！ 一人じゃ――', 'shock');
    await X('siesta', '大丈夫。約束したでしょ。私は死なないって。', 'smile');
    await N('シエスタは振り返らずに、階段を駆け下りていった。');
    await G.fadeOut(900);
    await midnight1();
  }

  function hallSetup() {
    G.clearActors();
    G.place('multigate', 13, 3, 'down'); G.place('edgar', 15, 3, 'down'); G.place('lily', 11, 6, 'up');
    G.place('me', 13, 6, 'up');
    G.cam(13.5, 4.5); G.snap();
  }
  async function midnight1() {
    G.load('CT', 13, 6, 'up');
    G.cinema(true); hallSetup();
    STATE.follow = false;
    G.time('23:59');
    await G.fadeIn(800);
    await N('零時一分前。祭儀の間。シエスタは、まだ戻らない。');
    G.time('00:00');
    SND.se('strike'); G.shake(3, 600);
    await N('――ゴォン。零時の鐘が、鳴り始めた。');
    await X('edgar', 'では――予言の儀を。', 'serious');
    SND.se('glitch'); G.shake(6, 800, true);
    await N('床板が、内側から突き破られた。');
    G.place('oswald', 13, 5, 'up');
    await X('oswald', '時は満ちた。……世界樹に、栄光を。', 'smile');
    G.spot('oswald_x');
    SND.se('crit'); G.flash('#7ad86a', 400);
    await N('時計守の体から、無数の根が噴き出した。');
    await X('oswald_x', '巫女の予言など、根ごと枯らしてくれる――！', 'angry', { tremble: true });
    G.spot(null);
    await M('オズワルドさん……!? その手の痣……！', 'shock');
    G.place('siesta', 12, 7, 'up');
    await X('siesta', 'ごめん、遅くなった！ 東門は――陽動だった！', 'serious');
    G.checkpoint('vision');
    await vision();
  }
  async function vision() {
    G.cinema(true);
    if (W.mapId !== 'CT') G.load('CT', 13, 6, 'up');
    hallSetup(); G.place('oswald', 13, 5, 'up'); G.place('siesta', 12, 7, 'up');
    STATE.party.me.hp = STATE.party.me.max; STATE.party.siesta.hp = STATE.party.siesta.max;
    await G.fadeIn(300);
    const r = await G.battle({
      kind: 'clock', vision: true, name: 'オズワルド《根の眷属》', svg: ROOT_SVG, hp: 240, regen: 240,
      atk: [12, 17], bloom: [12, 16], pattern: ['thorn', 'bloom', 'thorn', 'charge', 'spear'], bgm: 's_battle',
      intro: '根の眷属が襲いかかってきた！',
    });
    if (r === 'vision') await tragedy();
  }
  async function tragedy() {
    G.bgm(null);
    G.scene('vision_end');
    await G.fadeIn(1200);
    await N('鐘楼の上から降り注いだ根の槍が――');
    await N('シエスタと、巫女の体を、同時に貫いていた。');
    await M('……シエ、スタ……？', 'shock', { tremble: true });
    await X('siesta', '……ごめん、助手。……約束、守れなかった……ね……。', 'closed', { tremble: true });
    await X('multigate', '……予言、は……変えられ、ない……', 'closed', { tremble: true });
    await M('いや……いやだ……！ また、私は……！！', 'sad', { tremble: true });
    SND.se('heart');
    await N('胸元で、何かが熱を持った。');
    G.scene('scripture');
    SND.se('clue'); G.flash('#ffffff', 900);
    await N('――《聖典》が、まばゆい光を放っていた。');
    await N('光が、すべてを呑み込んでいく。');
    await G.fadeOut(1400);
    G.scene(null);
    await G.mono(['…………。', '――鐘の音が、聞こえない。']);
    await awaken();
  }

  /* ------------------------------------------------------------------
     第三章 二度目の零時
     ------------------------------------------------------------------ */
  async function awaken() {
    STATE.chapter = 3; f().foresight = true;
    STATE.follow = true;
    await G.chapter('第三章', '二度目の零時', '― 23:00 ―');
    G.load('CT', 9, 15, 'up');
    G.cinema(true); G.clearActors();
    G.place('me', 9, 15, 'up'); G.place('siesta', 10, 15, 'up'); G.place('harold', 9, 13, 'down');
    G.cam(9.5, 14); G.snap();
    G.time('23:00');
    await G.fadeIn(1200);
    await N('――気がつくと、私は時計台の入口ホールに立っていた。');
    await X('harold', '《名探偵》殿と助手殿ですな！ 衛兵長のハロルドです！', 'smile');
    await M('（……え？）', 'shock');
    await X('harold', '巫女様は上の控室に。零時の鐘とともに――', 'serious');
    await M('（同じ言葉……。時計は、23時……）', 'shock');
    await X('siesta', '……助手？ どうしたの。顔、真っ青だよ。', 'think');
    await N('シエスタが、生きている。当たり前みたいに、隣にいる。');
    await M('……シエスタ……っ。', 'sad', { tremble: true });
    await X('siesta', 'え、ちょっと……泣いてる？', 'shock');
    G.bgm('truth');
    await M('（時間が、巻き戻った……？ タイムリープ……？）', 'think');
    await N('いや――違う。');
    await N('時計の針は、一度も逆には回っていない。シエスタも、ハロルドさんも、何も覚えていない。');
    await M('（私は“戻った”んじゃない。……“視た”んだ）', 'serious');
    await M('（これから起こる未来を――あの《聖典》が、私に見せたんだ）', 'serious');
    SND.se('clue'); G.flash('#fff4d0', 400);
    await N('――《聖典》に宿った力。それは、【未来視】。');
    await G.gain('v_gate', '未来視の記憶');
    await G.gain('v_hand', '未来視の記憶');
    if (!has('v_root')) await G.gain('v_root', '未来視の記憶');
    await G.gain('v_spear', '未来視の記憶');
    G.checkpoint('plan');
    await plan();
  }

  async function T(who, text, e, o) { G.spot(who); return G.say(who, text, e, o); }
  const penalty = async () => {
    G.focus(-20);
    if (STATE.focus <= 0) await G.gameOver('BAD END', '信じてもらえなかった未来', '言葉が、まとまらなかった。\nシエスタは「大丈夫」と笑って、23時40分、東門へ駆けていった。\n――そして、同じ未来が繰り返された。');
  };
  const WRONG = ['……助手。落ち着いて。君が視たものを、順番に。', 'うーん、それじゃよく分からない。', '……それ、本当に視たもの？'];
  const P = (prompt, ids, o = {}) => G.present(prompt, ids, Object.assign({ penalty, noAuto: true, speaker: 'siesta', wrongLines: WRONG }, o));

  async function plan() {
    STATE.chapter = 3; STATE.focus = 100;
    G.cinema(true);
    if (W.mapId !== 'CT') { G.load('CT', 9, 15, 'up'); }
    G.clearActors(); G.place('me', 9, 15, 'up'); G.place('siesta', 10, 15, 'up'); G.place('harold', 9, 13, 'down');
    G.cam(9.5, 14); G.snap();
    await G.fadeIn(500);
    G.bgm('deduction');
    await M('シエスタ。……信じられないかもしれないけど、聞いて。', 'serious');
    await X('siesta', '……うん。君がそんな顔をするなら、きっと本当なんだろうね。聞かせて。', 'serious');
    G.toast('<b>第三章</b>：未来視の記憶を、シエスタに伝えよう。間違えると<b>説得力</b>が減ります。', 6000);
    G.refresh(); $('hud').classList.remove('hidden'); setTimeout(G.refresh, 4000);
    await X('siesta', 'まず。……私は、どうして巫女のそばを離れたの？', 'think');
    await P('シエスタが巫女から離れた理由を示す記憶は？', ['v_gate'], { hint: '23時40分。塔が揺れた、あの音。', alt: { f_prophecy: '予言じゃなくて、君が“視た”出来事を教えて。' } });
    await X('siesta', '東門の爆発……陽動、ね。なら、私はどこにも行かない。巫女の隣から離れない。', 'serious');
    await X('siesta', 'じゃあ次。襲ってきたのは――誰？', 'serious');
    G.spot(null);
    const who = await G.pickPerson('根の眷属の正体は？', ['harold', 'edgar', 'lily', 'oswald']);
    if (who !== 'oswald') {
      const nm = { harold: 'ハロルド', edgar: 'エドガー', lily: 'リリィ' }[who];
      await M(`……${nm}さん、だと思う。`, 'serious');
      await X('siesta', '……分かった。君を信じる。', 'serious');
      SND.se('wrong');
      await G.gameOver('BAD END', '同じ未来', `${nm}を拘束した騒ぎの陰で、本当の“根”は静かに育ち続けた。\n零時の鐘の下――ふたつの命が、また途切れた。`);
    }
    await M('時計守の、オズワルドさん。', 'serious');
    await P('オズワルドだと言える根拠は？', ['v_hand'], { hint: '紅茶を受け取った時、彼の手に何が見えた？' });
    await X('siesta', '根の痣、か。……あの人、ずっとこの塔にいたんだもんね。仕込む時間はいくらでもあった。', 'think');
    await X('siesta', 'でも、それだけじゃ勝てなかったんでしょ？ 未来の私たちは。', 'serious');
    await P('“敵が倒れなかった”理由を示す記憶は？', ['v_root'], { hint: '戦いの最中、巫女が何かを告げていた。', alt: { v_hand: 'それは正体。知りたいのは、なぜ倒れなかったか。' } });
    await X('siesta', '機械室の根。……なら、零時より前に断ち切る。', 'serious');
    await X('siesta', '最後。――私と巫女は、何にやられたの？', 'closed');
    await P('最後の一撃を示す記憶は？', ['v_spear'], { hint: '鐘楼の上。降り注いだ、あれ。' });
    await X('siesta', '鐘楼の上からの槍。……予兆は、根が軋む音。', 'serious');
    await X('siesta', 'なら、その時は君が叫んで。君の《聖典》は、きっともう一度応えてくれる。', 'smile');
    await M('……うん。', 'serious');
    await X('siesta', 'ありがとう、助手。君のおかげで――未来が、変えられる。', 'smile');
    f().planned = true;
    G.bgm('f_fest');
    G.clearActors(); G.restore();
    G.cam(null); G.cinema(false);
    G.toast('<b>作戦</b>：リリィから<b>機械室の合鍵</b>を借りて、零時の前に<b>機械室の根</b>を断とう。', 7000);
  }

  async function machineDoor() {
    if (ch() === 2) { await N('機械室の扉。鍵がかかっている。'); await X('oswald', 'そこは危ない。近づかんように。', 'serious'); return; }
    if (ch() === 3 && f().planned && !has('f_key')) { await N('機械室の扉。鍵がかかっている。'); await M('（リリィさんが合鍵を持ってるはず）', 'think'); return; }
    if (ch() === 3 && has('f_key') && !f().doorOpen) {
      f().doorOpen = true; SND.se('door');
      await N('合鍵を差し込むと、重い扉がゆっくりと開いた。');
    }
  }
  const doorSolid = () => !(ch() === 3 && f().doorOpen);

  async function examCore() {
    if (f().coreDown) { await N('枯れ果てた根の塊。もう、脈打ってはいない。'); return; }
    G.cinema(true);
    G.bgm('tension');
    await N('大歯車の陰――床から天井まで、脈打つ根の塊が張り巡らされていた。');
    await X('siesta', '……これが、未来で彼を生かしていた《根》。', 'serious');
    await M('シエスタ、お願い！', 'serious');
    SND.se('crit'); G.shake(6, 700, true); G.flash('#fff', 300);
    await N('マスケット銃の轟音。根の核が砕け、緑の光が霧のように散った。');
    f().coreDown = true;
    G.time('23:50');
    await G.wait(600);
    SND.se('glitch');
    await X('oswald', '――何をしたッ！！', 'angry');
    G.place('oswald', 4, 8, 'up');
    await N('扉口に、時計守オズワルドが立っていた。その手の甲の痣が、どす黒く脈打っている。');
    f().exposed = true;
    await X('oswald', '三十年……三十年かけて育てた根を……！ 名探偵、貴様ァ……！', 'angry', { tremble: true });
    await X('siesta', '残念。君の未来は、もう視られてるんだ。――私の助手にね。', 'smile');
    G.spot('oswald_x');
    SND.se('crit'); G.flash('#7ad86a', 400); G.shake(6, 700, true);
    await N('オズワルドの体から、根が噴き出す。だが――その勢いは、未来で見たものより、ずっと弱い。');
    await X('oswald_x', 'ならば、根が尽きる前に……巫女ごと、貴様らを貫くまで！！', 'angry', { tremble: true });
    G.spot(null);
    await X('siesta', '助手。……今度は、勝とう。', 'serious');
    G.checkpoint('fight');
    await fight();
  }
  async function fight() {
    G.cinema(true);
    if (W.mapId !== 'CT') G.load('CT', 4, 6, 'up');
    STATE.chapter = 3; f().coreDown = true; f().exposed = true;
    STATE.party.me.hp = STATE.party.me.max; STATE.party.siesta.hp = STATE.party.siesta.max; STATE.items.tonic = 2;
    G.clearActors(); G.place('me', 4, 7, 'up'); G.place('siesta', 5, 7, 'up'); G.place('oswald', 4, 5, 'down');
    G.cam(4.5, 6); G.snap();
    await G.fadeIn(300);
    await G.battle({
      kind: 'clock', name: 'オズワルド《根の眷属》', svg: ROOT_SVG, hp: 240, regen: 0,
      atk: [12, 17], bloom: [12, 16], pattern: ['thorn', 'bind', 'thorn', 'charge', 'spear', 'bloom', 'thorn', 'charge', 'spear'], bgm: 's_battle',
      intro: '根の眷属が襲いかかってきた！ ――もう、根からの再生はない！',
      loseText: '鐘楼の上から、根の槍が降り注いだ。\n未来は、変えられなかった――。',
    });
    f().hpLeft = Math.round((STATE.party.me.hp + STATE.party.siesta.hp) / (STATE.party.me.max + STATE.party.siesta.max) * 100);
    await victory();
  }

  /* ------------------------------------------------------------------
     終章 完全勝利
     ------------------------------------------------------------------ */
  async function victory() {
    STATE.chapter = 4; f().won = true;
    G.bgm('truth');
    G.cinema(true);
    await N('根が、枯れていく。');
    await N('オズワルドは膝をつき、ただの老人の姿に戻って、床に崩れた。');
    await X('oswald', '……世界樹は……枯れん……。《庭》は……北の、果てに……', 'closed');
    await N('そこまで言って、時計守は意識を失った。');
    await X('siesta', '……おつかれさま、助手。', 'smile');
    await M('シエスタ……生きてる。……生きてるよね？', 'sad', { tremble: true });
    await X('siesta', 'うん。生きてる。……君が、未来を変えたから。', 'smile');
    await G.fadeOut(1000);
    // 零時
    G.load('CT', 13, 6, 'up');
    G.clearActors();
    G.place('multigate', 13, 3, 'down'); G.place('edgar', 15, 3, 'down'); G.place('lily', 11, 6, 'up'); G.place('harold', 16, 6, 'up');
    G.place('me', 13, 6, 'up'); G.place('siesta', 14, 6, 'up');
    G.cam(13.5, 4.5); G.snap();
    G.time('00:00');
    await G.fadeIn(900);
    SND.se('strike');
    await N('――ゴォン。零時の鐘が、静かな祭儀の間に響き渡った。');
    await N('今度は、誰も倒れていない。');
    G.bgm('f_fest');
    await X('edgar', 'では――予言の儀を。', 'serious');
    await N('マルチルゲートが祭壇に手をかざすと、淡い光が祭儀の間を満たした。');
    await X('multigate', '……視えます。', 'serious');
    G.scene('hideout');
    await G.wait(900);
    await X('multigate', '北の果て。凍てつく海に浮かぶ、白い孤島。', 'serious');
    await X('multigate', '打ち捨てられた種子の研究所――その地下に、《ユグドラシル》の根が眠っている。', 'serious');
    await X('siesta', '……見つけた。シードを撒いてる連中の、本拠地。', 'serious');
    G.scene(null);
    await X('multigate', '……不思議。私の予言は、変わらないはずでした。', 'think');
    await X('multigate', '鐘の下で、ふたつの命が途切れる――そう視えていたのに。', 'think');
    await X('siesta', '予言を変えたのは、私じゃないよ。', 'smile');
    await N('シエスタは、私の背中をぽんと押した。');
    await X('siesta', 'この子。私の、自慢の助手。', 'smile');
    await M('ちょ、ちょっと……！', 'shock');
    await X('multigate', '……そう。あなたが。', 'smile');
    await X('multigate', '《聖典》に選ばれし者。……ありがとう。', 'smile');
    await G.fadeOut(1200);
    // エピローグ
    STATE.chapter = 5;
    G.load('HT', 10, 6, 'left');
    G.clearActors(); G.place('siesta', 7, 4, 'down'); G.place('me', 9, 6, 'up');
    G.cam(8, 5); G.snap();
    G.time('03:00');
    G.bgm('s_ending');
    await G.fadeIn(1200);
    await N('ホテルに戻ったのは、夜明け前だった。');
    await X('siesta', '……ねえ、助手。', 'serious');
    await X('siesta', '未来の私、どんな顔してた？', 'think');
    await M('…………。', 'closed');
    await M('……謝ってた。約束、守れなかったって。', 'sad');
    await X('siesta', 'そっか。', 'closed');
    await X('siesta', 'じゃあ、今度こそ守らなきゃね。私は死なない。君も死なせない。', 'smile');
    await X('siesta', '……ふふ。それに、今度は君が私を守ってくれたし。', 'smile');
    await M('……紅茶、いれるね。ミルク多めで、砂糖二つ。', 'smile');
    await X('siesta', 'さすが、私の助手。', 'smile');
    await G.fadeOut(1400);
    G.bgm(null);
    await G.mono([
      '――こうして、時計台の夜は終わった。',
      '完全勝利。\nそして私たちは、ユグドラシルの“根”の在処を知った。',
      '北の果て、凍てつく海の孤島。\n世界樹の根が眠る場所へ――。',
      '探偵助手 {N} の手記より　FILE.05',
    ]);
    G.scene('hideout');
    await G.mono(['FILE.06 へ続く']);
    G.scene(null);
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
      const need = [['harold', 'ハロルド（入口ホール）'], ['edgar', 'エドガー（祭儀の間）'], ['lily', 'リリィ（巫女の控室）'], ['multigate', 'マルチルゲート（巫女の控室）'], ['oswald', 'オズワルド（回廊の西）']].filter(([k]) => !f()['g_' + k]).map(x => x[1]);
      await S(need.length ? `まだ挨拶してないのは、${need.join('、')}。` : '全員に挨拶したね。', 'think');
      return;
    }
    if (c === 3) {
      if (!has('f_key')) { await S('機械室の合鍵は、巫女の控室にいるリリィが持ってるはず。北東の部屋だよ。', 'serious'); return; }
      if (!f().coreDown) { await S('機械室は北西。根の塊を見つけたら、私が撃ち抜く。', 'serious'); return; }
    }
    await S('……大丈夫。今度は、君がいる。', 'smile');
  }

  /* ------------------------------------------------------------------
     イベント
     ------------------------------------------------------------------ */
  const EVENTS = {
    HT: [
      { at: [[7, 6]], sprite: 'teaset', check: async () => { await N('ミルクたっぷりの紅茶。シエスタのお気に入りだ。'); } },
    ],
    CT: [
      { at: [[4, 8]], solid: doorSolid, bump: machineDoor, check: machineDoor },
      { at: [[4, 6]], sprite: 'rootcore', when: () => ch() === 3 && !f().coreDown, check: examCore, clue: () => ch() === 3 && f().doorOpen && !f().coreDown },
      { at: [[4, 6]], sprite: 'deadroot', when: () => f().coreDown },
    ],
  };

  const TALK = {
    siesta: async () => hint(),
    harold: talkHarold, edgar: talkEdgar, lily: talkLily, oswald: talkOswald, multigate: talkMultigate,
  };

  function onResume() {
    W.storm = false;
    SND.rain(0); SND.hum(0);
    SND.bgm(STATE.chapter >= 2 && STATE.chapter <= 3 ? 'f_fest' : 's_explore');
  }

  return {
    npcs, objective, FLAVOR, flavor, EVENTS, talk: id => (TALK[id] ? TALK[id]() : Promise.resolve()),
    prologue, hint, onResume, hintFromMenu: true, initState,
    vision, plan, fight,
    hintMenu: () => 'シエスタに聞く（ヒント）',
    hideTrust: () => true,
    focusLabel: '説得力',
    nbName: '手帳',
    start: { map: 'HT', x: 10, y: 6, dir: 'left' },
    people: () => {
      const L = ['siesta'];
      if (STATE.chapter >= 1) L.push('multigate', 'kase', 'kujo', 'yogarasu');
      if (STATE.chapter >= 2) L.push('harold', 'edgar', 'lily', 'oswald');
      return L;
    },
    evidenceIds: () => F_EVIDENCE_ORDER,
    result() {
      const fo = STATE.focus || 0, hp = STATE.flags.hpLeft || 0;
      const score = Math.round(fo * 0.6 + hp * 0.4);
      const [rank, title] = score >= 88 ? ['S', '未来を変えた助手'] : score >= 70 ? ['A', '聖典に選ばれし者'] : score >= 50 ? ['B', '名探偵の助手'] : ['C', 'ぎりぎりの未来'];
      return {
        label: '《名探偵》の助手としての評価', rank, title,
        stats: `最後の説得力　${fo} / 100<br>戦闘後の残りHP　${hp}%<br>集めた記憶・証拠　${STATE.evidence.length} / ${F_EVIDENCE_ORDER.length}`,
        credits: `<h2>未来視の時計台</h2><p style="color:#f4dca0">― 探偵助手の手記 FILE.05 ―</p>
          <h4>《名探偵》</h4><p>シエスタ</p><h4>探偵助手</h4><p>${esc(STATE.name)}</p>
          <h4>《巫女》</h4><p>マルチルゲート</p>
          <h4>時計台の人々</h4><p>ハロルド</p><p>エドガー</p><p>リリィ</p><p>オズワルド</p>
          <h4>in memory of</h4><p>先代《名探偵》 九条 玲司</p>
          <h4>シナリオ・プログラム・グラフィック・音楽</h4><p>すべてブラウザ上で生成</p>
          <h4>Special Thanks</h4><p>最後まで遊んでくれたあなた</p><div class="end">FILE.06 へ続く</div>`,
        bgm: 's_ending',
      };
    },
  };
})();
