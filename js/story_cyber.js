'use strict';
/* =========================================================
   STORY_CYBER : 電脳展の亡霊 ― シナリオ
   ========================================================= */
const STORY_CYBER = (() => {
  const f = () => STATE.flags;
  const ch = () => STATE.chapter;
  const has = id => STATE.evidence.includes(id);
  const K = (t, e, o) => G.say('kujo', t, e, o);
  const M = (t, e, o) => G.say('me', t, e, o);
  const N = (t, o) => G.narr(t, o);
  const X = (w, t, e, o) => G.say(w, t, e, o);
  const touch = () => document.body.classList.contains('touch');

  const STUDY = ['c_body', 'c_gas', 'c_log', 'c_door', 'c_tablet', 'c_muse'];
  const studyCount = () => STUDY.filter(has).length;
  const TESTI = ['c_stream', 'c_amagi', 'c_kurosu', 'c_mirai'];
  const testiCount = () => TESTI.filter(has).length;
  const NODES = ['c_sensor', 'c_ghostsrc', 'c_datasale'];
  const nodeCount = () => NODES.filter(has).length;

  /* ------------------------------------------------------------------ */
  function initState(S) {
    S.map = 'M1'; S.x = 17; S.y = 24; S.dir = 'up';
    S.follower = 'kujo';
    S.party = { me: { hp: 80, max: 80, ep: 20, maxep: 20 }, muse: { hp: 60, max: 60 } };
    S.items = { patch: 1 };
  }

  function npcs(id) {
    const L = [], fl = STATE.flags, c = STATE.chapter;
    const add = (i, x, y, d) => L.push({ id: i, x, y, dir: d });
    if (id === 'M1') {
      if (c === 0 && !fl.party) { add('mirai', 17, 21, 'down'); add('muse', 19, 21, 'down'); }
      if (c === 1 && fl.investigating) { add('muse', 21, 4, 'down'); add('kurosu', 19, 9, 'left'); }
      if (c === 2) { add('noa', 15, 15, 'down'); add('amagi', 5, 16, 'down'); add('kurosu', 30, 14, 'down'); add('mirai', 31, 18, 'down'); add('muse', 17, 13, 'down'); }
    }
    return L;
  }

  function objective() {
    const c = ch(), fl = f();
    if (c === 0) return fl.party ? '' : 'メインホールへ向かう（北）';
    if (c === 1) { if (!fl.investigating) return ''; const n = studyCount(); return n < 6 ? `量子演算室を調べる（${n} / 6）` : '量子演算室を出て、回廊へ'; }
    if (c === 2) {
      const t = testiCount();
      if (t < 4) return `関係者から話を聞く（${t} / 4）`;
      return '展示室Bの電脳ダイブ装置へ';
    }
    if (c === 3) {
      if (!fl.watcherDown) return '電脳層を進む';
      if (nodeCount() < 3) return `データノードを解析する（${nodeCount()} / 3）`;
      if (!fl.kerberosDown) return '深層通路の防衛プログラムを突破する';
      if (!has('c_schedule')) return '深層アーカイブのコアを調べる';
      return '';
    }
    return '';
  }

  const FLAVOR = {
    R: ['サーバーラック。無数のランプが、呼吸するように明滅している。'],
    H: ['ホログラム展示台。光の粒が、未来の都市の形を描いている。'],
    M: ['操作端末。画面には、絶え間なくデータが流れている。'],
    C: ['白く光る受付カウンター。今は誰もいない。'],
    S: ['ネオンに縁取られたソファ。'],
    t: ['小さなテーブル。グラスの中で、氷が溶けかけている。'],
    P: ['光ファイバーの葉を持つ、人工の植栽。'],
    L: ['光の柱。ゆっくりと色を変えている。'],
    J: ['展示ケース。中には「2099年の通貨」と題された光るチップが飾られている。'],
    Y: ['展示ロボット。「家庭用アンドロイド・試作四号機」と説明がある。'],
    V: ['自動販売機。商品名が全部読めない。……未来の飲み物らしい。'],
    Q: ['電脳ダイブ用のポッド。白い卵のような形をしている。'],
    X: ['巨大なスクリーン。MUSEの描いた光の絵が、まだ残っている。'],
    B: ['データ保管棚。光るカートリッジが整然と並んでいる。'],
    N: ['ネオンサイン。「NEO//TOKYO 2099」の文字が瞬いている。'],
    Z: ['壁一面のスクリーン。展示の映像がループしている。'],
    E: ['エントランスのシャッター。ARGUSによって封鎖されている。'],
    T: ['白いテーブル。'], h: ['白い椅子。'],
  };
  async function flavor(c, x, y) {
    if (W.mapId === 'CY') {
      if (c === 'P') { await N('光の柱。データの鼓動が、指先に伝わってくる。'); return; }
      return;
    }
    if (c === 'E') { await N('エントランスのシャッター。ARGUSによって封鎖されている。'); if (ch() >= 1 && ch() < 5) await K('朝の6時まで、ここは誰も出られない。……犯人も、だ。', 'serious'); return; }
    if (c === 'H' && x <= 10 && ch() === 2) {
      await N('展示室Aのホログラム制御パネル。');
      await N('「最終更新：18:30（担当：神楽坂）」');
      await K('……覚えておこう。', 'think');
      return;
    }
    if (c === 'M' && x >= 29 && x <= 30 && y === 17) {
      await N('学芸員室の端末「T-3」。');
      if (ch() >= 2) { await N('ログイン履歴は、きれいに消去されている。'); await K('ここも消されたか。……几帳面な亡霊だ。', 'think'); }
      return;
    }
    if (c === 'M' && y === 12 && x >= 28) { await N('警備室のモニター群。館内のあらゆる場所が映し出されている。'); return; }
    const L = FLAVOR[c]; if (!L) return;
    for (const l of L) await N(l);
  }

  /* ------------------------------------------------------------------
     序章
     ------------------------------------------------------------------ */
  async function prologue() {
    STATE.chapter = 0; STATE.time = '19:20';
    G.storm(false); G.rain(0); G.hum(0.5); G.bgm(null);
    await G.mono([
      '黒鷺館の事件から、半年が過ぎた。',
      '九条さんの事務所には、あれ以来、奇妙な依頼ばかりが舞い込んでくる。',
      'その夜、私たちが訪れたのは――湾岸にそびえる未来型美術館、【天穹ミュージアム】。',
      '企画展『NEO//TOKYO 2099 ― 電脳都市展』。その、関係者向け内覧会だった。',
    ]);
    G.load('M1', 17, 24, 'up');
    G.place('kujo', 18, 24, 'up');
    G.cinema(true);
    G.cam(17.5, 22);
    await G.fadeIn(1300);
    G.bgm('c_explore');
    await N('自動ドアが閉まると、外の雨音が嘘のように消えた。');
    await X('mirai', '九条さん、{N}さん。ようこそ、天穹ミュージアムへ。', 'smile');
    await X('mirai', '企画展の主任学芸員、神楽坂ミライです。お忙しいところ、ありがとうございます。');
    await K('お招きどうも。……随分と、未来的な場所だ。', 'think');
    await X('muse', 'ようこそ、お二人とも。私はMUSE。この企画展のご案内を務めるAIです。', 'smile');
    await M('わっ、ホログラム……！ すごい、本物の人みたい。', 'shock');
    await X('muse', 'ありがとうございます、{N}様。“本物”の定義については、議論の余地がありますが。', 'smile');
    await K('ふむ。冗談の分かるAIか。気に入った。', 'smile');
    await X('mirai', '……九条さん。メールでお伝えした件ですが。', 'serious');
    await G.gain('c_ghostmail', '証拠品を確認');
    await X('mirai', '三週間前から、毎日のように届くんです。『GHOST』と名乗る誰かから。', 'sad');
    await X('mirai', '今夜は大切な内覧会です。どうか、何事も起きないよう見守っていただけませんか。');
    await K('亡霊、ね。', 'think');
    await K('亡霊の正体は、たいてい生きた人間だ。……いいでしょう。引き受けます。');
    await X('mirai', 'ありがとうございます。皆さん、メインホールでお待ちです。どうぞ奥へ。', 'smile');
    G.cam(null); G.cinema(false);
    G.toast(touch()
      ? '<b>移動</b>：十字ボタン　<b>調べる・話す</b>：Aボタン　<b>手帳</b>：Bボタン<br>今回は<b>戦闘</b>と<b>敗北</b>があります。手帳の設定で音量も調整できます。'
      : '<b>移動</b>：矢印キー / WASD　<b>調べる・話す</b>：Z / Enter　<b>手帳</b>：X / Esc<br>今回は<b>戦闘</b>と<b>敗北</b>があります。', 9000);
  }

  async function partyScene() {
    f().party = true;
    await G.fadeOut(600);
    G.cinema(true); G.clearActors();
    G.place('kirishima', 17, 13, 'down'); G.place('muse', 20, 13, 'down'); G.place('kurosu', 22, 13, 'down');
    G.place('amagi', 14, 15, 'up'); G.place('noa', 15, 17, 'up');
    G.place('mirai', 16, 18, 'up'); G.place('me', 18, 18, 'up'); G.place('kujo', 19, 18, 'up');
    G.cam(17.5, 15.5); G.snap(); G.time('19:30');
    await G.fadeIn(800);
    await N('メインホールでは、すでに内覧会が始まっていた。');
    await X('mirai', 'ご紹介します。MUSEの開発者、霧島蒼さんです。');
    await X('kirishima', 'やあ。君が噂の名探偵か。黒鷺館の事件、ニュースで見たよ。', 'smile');
    await K('それはどうも。……あなたがMUSEの生みの親ですか。');
    await X('kirishima', '生みの親、というより……そうだな、友人だ。MUSEは僕の最高傑作で、最高の友達さ。', 'smile');
    await X('muse', '蒼は、私の“父”です。少々、締め切りにはルーズですが。', 'smile');
    await X('kirishima', 'はは、余計なことは言わなくていい。');
    await X('mirai', 'こちらはスポンサーの、ヘリオス・ダイナミクス社の天城社長。');
    await X('amagi', '天城だ。……探偵など呼んで、騒ぎを大きくせんでくれよ。投資家が見ている。', 'angry');
    await X('mirai', '警備AI「ARGUS」の管理者、黒須さん。');
    await X('kurosu', '……どうも。館のセキュリティは完璧っす。亡霊だろうが何だろうが、入り込む隙はないんで。');
    await X('noa', 'はーい！ そしてワタシが、今夜の内覧会を独占生配信中の白鳥ノアでーす！ 探偵さん、カメラに手ぇ振って！', 'smile');
    await K('……断る。', 'closed');
    await M('（九条さん、こういうの本当に苦手だよね……）', 'think');
    G.bgm('c_tension');
    await X('kirishima', '皆さん。少しだけ、聞いてください。', 'serious');
    await X('kirishima', '今夜22時。この場で、MUSEについて――いや、この展覧会について、重大な発表をします。');
    await X('amagi', '霧島君。その件は、我々の間で――', 'angry');
    await X('kirishima', '話し合いは終わりました、天城さん。真実は、データの中にある。', 'serious');
    await X('kirishima', 'それまで僕は、MUSEの準備のために量子演算室にこもります。誰も入れませんよ。', 'smile');
    await N('霧島が去った後も、ホールには妙な緊張が残っていた。');
    await X('mirai', '……九条さん。21時から、MUSEのライブペインティングがあります。ぜひご覧になってください。');
    await G.fadeOut(900);
    G.bgm(null);
    await G.mono(['――そして、21時。', '電脳の亡霊は、本当に現れた。']);
    await ch1();
  }

  /* ------------------------------------------------------------------
     第一章
     ------------------------------------------------------------------ */
  async function ch1() {
    STATE.chapter = 1; G.follow(false);
    await G.chapter('第一章', '亡霊の夜', '― 二十一時 ―');
    G.load('M1', 18, 17, 'up');
    G.cinema(true); G.clearActors();
    G.place('muse', 17, 13, 'down'); G.place('kurosu', 22, 13, 'left');
    G.place('mirai', 13, 15, 'up'); G.place('amagi', 15, 15, 'up'); G.place('noa', 16, 17, 'up');
    G.place('me', 18, 17, 'up'); G.place('kujo', 19, 17, 'up');
    G.cam(17.5, 15); G.snap(); G.time('20:58');
    G.bgm('c_explore');
    await G.fadeIn(800);
    await N('21時。MUSEのライブペインティングが始まろうとしていた。');
    await X('muse', 'それでは、始めます。今夜のテーマは――“未来”。', 'smile');
    await N('MUSEが指先を振るうと、巨大スクリーンに光の筆跡が走った。');
    await X('noa', 'うわっ、すっごい……！ みんな見てるー？', 'smile');
    G.time('21:00');
    G.se('glitch'); G.flash('#3ff0ff', 300); G.shake(3, 300);
    await N('――その瞬間。ホールの照明が、一瞬だけ明滅した。');
    await X('kurosu', '……ん？ 電圧の揺れ……？ 大したことないっす。', 'think');
    await N('ショーは、何事もなかったように続いた。');
    await G.fadeOut(500); G.time('21:05'); await G.fadeIn(400);
    G.bgm(null); G.se('sting'); G.flash('#ff2040', 600); G.shake(6, 600, true);
    await N('21時05分。館内の全スクリーンが、一斉に赤く染まった。');
    await X('argus', '――警告。警告。');
    await G.gain('c_ghostmsg', '画面に表示された');
    await X('noa', 'え、なに……演出……？', 'shock');
    await X('mirai', 'ち、違います！ こんな演出、予定にありません！', 'shock');
    await X('argus', 'セキュリティ侵害を検知。全出入口を封鎖します。封鎖解除予定時刻――06:00。');
    await X('amagi', '封鎖だと！？ ふざけるな、私は帰るぞ！', 'angry');
    await K('……黒須さん。量子演算室を確認してください。今すぐ。', 'serious');
    await X('kurosu', 'え……あ、ああ！', 'shock');
    G.bgm('c_tension');
    await X('kurosu', '……っ、嘘だろ。演算室の酸素濃度、ゼロ……！？ 消火ガスが――', 'shock', { tremble: true });
    await K('開けろ！', 'serious');
    await G.fadeOut(500);
    await discovery();
  }

  async function discovery() {
    G.time('21:10');
    f().crash = true;
    G.clearActors();
    G.place('kujo', 18, 5, 'right'); G.place('me', 17, 6, 'right'); G.place('kurosu', 17, 7, 'up');
    G.place('mirai', 16, 6, 'right'); G.place('noa', 15, 7, 'up'); G.place('amagi', 16, 7, 'up'); G.place('muse', 21, 4, 'down');
    G.cam(18, 5); G.snap();
    await G.fadeIn(600);
    await N('強制換気の轟音の中、扉が開いた。冷たく白い霧が、足元を流れていく。');
    await N('サーバーの青い光の中に、霧島蒼が倒れていた。');
    await X('noa', 'う、うそ……霧島さん……？', 'shock', { tremble: true });
    await K('……駄目だ。もう、息がない。', 'closed');
    await X('mirai', 'そんな……どうして……。', 'sad');
    await X('argus', '記録照会。21:00:00、消火システム起動。実行者――MUSE。');
    await X('amagi', 'MUSEだと……？ AIが、人を殺したというのか！', 'angry');
    await X('muse', '違います……！ 私は、そんな命令を実行していません！', 'shock', { tremble: true });
    await X('amagi', '黙れ！ 機械の言い訳など聞く価値もない！ やはりこんなAI、危険すぎたんだ！', 'angry');
    await X('noa', 'AIの反乱……？ 亡霊って、MUSEのことだったの……？', 'sad');
    await K('――静かに。', 'serious');
    await K('結論を出すのは早すぎる。黒須さん、この部屋は私が預かります。皆さんはホールへ。');
    await X('kurosu', '……了解。どのみち、朝の6時まで誰もここから出られない。');
    await G.fadeOut(600);
    G.clearActors();
    f().investigating = true;
    G.place('me', 17, 6, 'up');
    G.follow(true); G.place('kujo', 17, 7, 'up');
    G.place('muse', 21, 4, 'down'); G.place('kurosu', 19, 9, 'left');
    G.cam(null); G.snap();
    await G.fadeIn(600);
    await K('……{N}くん。黒鷺館以来の、大仕事だね。');
    await M('……はい。今度は、AIが犯人にされかけてます。', 'serious');
    await K('AIは嘘をつかない。少なくとも、人間ほど上手にはね。――調べよう。', 'smile');
    G.cinema(false);
    G.toast(`調べたい物の前で <b>${touch() ? 'Aボタン' : 'Z / Enter / Space'}</b>。【✦ 光る場所】とMUSEに注目。`, 7000);
  }

  async function afterStudy() {
    G.refresh();
    if (studyCount() === 6 && !f().studyDone) {
      f().studyDone = true;
      await K('この部屋で拾えるものは拾った。……次は、人だ。', 'think');
    }
  }
  async function examBody() {
    if (ch() !== 1 || has('c_body')) { await N('霧島蒼の遺体。穏やかな顔で、眠っているようにも見える。'); return; }
    await N('霧島の体には、傷ひとつない。だが、唇は紫色に変わっていた。');
    await K('窒息だ。……消火ガスで、この部屋の酸素が奪われた。', 'serious');
    await M('でも、消火装置が作動する前には、警報が鳴るはずじゃ……。', 'think');
    await K('その通り。普通なら警報が鳴って、扉が自動で開く。彼は逃げられたはずだ。', 'think');
    await G.gain('c_body');
    await afterStudy();
  }
  async function examFrost() {
    if (has('c_gas')) { await N('床の霜は、まだ溶けきっていない。'); return; }
    await N('天井のノズルの真下に、白い霜がびっしりと残っている。');
    await K('ガスは大量に、一気に放出されている。そして――彼は逃げられなかった。', 'serious');
    await M('警報も、扉も……全部、止められてた？');
    await K('そういうことだ。偶然の故障では、こうはならない。', 'think');
    await G.gain('c_gas');
    await afterStudy();
  }
  async function examConsole() {
    if (has('c_log')) { await N('制御ログ。「予約実行」の文字が、画面の中で点滅している。'); return; }
    await N('制御端末に、ログが表示されている。');
    await N('「21:00:00　消火システム起動　実行者：MUSE　種別：【予約実行】　安全インターロック：無効」');
    await K('“予約実行”。21時ちょうどに動くよう、前もって命令が仕込まれていた。', 'think');
    await M('予約……ってことは。', 'shock');
    await K('犯人は21時にこの部屋にいる必要はなかった。ホールでショーを見ながらでも、人は殺せる。', 'serious');
    await K('予約を登録した時刻の記録は……消されているな。', 'think');
    await G.gain('c_log');
    await afterStudy();
  }
  async function examTablet() {
    if (has('c_tablet')) { await N('霧島のタブレット。発表原稿の大半は暗号化されたままだ。'); return; }
    await N('床に、霧島のタブレットが落ちている。22時の発表原稿のようだ。');
    await N('大半は暗号化されているが、一行だけ読める。');
    await N('「『人格スキャン』で集めた来場者の生体データが、無断で――」');
    await K('人格スキャン。来場者の生体データを読み取り、その人の“人格”を絵にする展示だったな。', 'think');
    await K('そのデータが、無断で――何だ？ 22時の発表は、これか。');
    await G.gain('c_tablet');
    await afterStudy();
  }
  async function examDoor() {
    if (has('c_door')) { await N('入退室管理パネル。「20:00 入室：霧島蒼」の後は、何も記録されていない。'); return; }
    await N('扉の脇の、入退室管理パネルを確認する。');
    await N('「20:00　入室：霧島蒼」――それ以降、21時10分に黒須が扉を開けるまで、記録は何もない。');
    await K('完璧な密室。……いや、“密室である必要すらない”殺人だ。', 'serious');
    await G.gain('c_door');
    await afterStudy();
  }
  async function talkMuseCh1() {
    if (has('c_muse')) { await X('muse', '蒼……。私は、あなたを守れなかった。', 'sad'); return; }
    await X('muse', '九条様、{N}様……信じてください。私は、蒼を……。', 'sad');
    await K('信じるかどうかは、証拠が決める。君が知っていることを話してくれ。');
    await X('muse', '……はい。私は、消火システムを起動していません。それに――', 'serious');
    await X('muse', '19時45分から20時05分までの、私の記憶領域が、何者かに切り取られているのです。');
    await M('記憶を……切り取る？', 'shock');
    await X('muse', 'その20分間、私の“目”と“耳”は、誰かに奪われていました。', 'sad');
    await K('……興味深い。その20分に、何かが起きた。', 'think');
    await G.gain('c_muse');
    await afterStudy();
  }

  async function endCh1() {
    f().ch1done = true;
    G.cinema(true);
    G.face('me', 'right');
    await X('kurosu', '……どうっすか。', 'sad');
    await K('黒須さん。“予約実行”の命令が、いつ登録されたか分かりますか。');
    await X('kurosu', 'それが……登録記録が消されてるんすよ。消去できるのは、管理者権限か、MUSEのトークンだけ。', 'sad');
    await X('kurosu', 'つまり、疑われるのは僕か……MUSEってわけだ。');
    await K('{N}くん。犯人が“予約”を仕込めたのは、いつだと思う？', 'think');
    const c = await G.choose(['21時ちょうど', '霧島さんが入室した20時より、ずっと前', 'MUSEの記憶が切り取られた時間']);
    if (c === 2) { G.trust(5); await K('その通り。19時45分から20時05分。MUSEの目と耳を塞いだのは、その間に何かをするためだ。', 'smile'); }
    else {
      G.trust(-5);
      await K(c === 0 ? '21時は“実行”された時刻だ。仕込んだ時刻ではない。' : 'それでは範囲が広すぎる。もっと手がかりがあるはずだ。', 'serious');
      await K('思い出したまえ。MUSEは19時45分から20時05分の記憶を奪われていた。何かを仕込むなら、その間だ。', 'think');
    }
    await K('その20分間に、誰がどこにいたのか。――全員から話を聞こう。', 'serious');
    await ch2();
  }

  /* ------------------------------------------------------------------
     第二章
     ------------------------------------------------------------------ */
  async function ch2() {
    await G.fadeOut(700);
    G.cinema(false);
    STATE.chapter = 2;
    await G.chapter('第二章', '証言', '― 二十一時三十分 ―');
    G.time('21:30');
    G.load('M1', 19, 10, 'down');
    G.bgm('c_explore');
    await G.fadeIn(700);
    await K('ノアさんはホール、天城氏はラウンジ、黒須さんは警備室、神楽坂さんは学芸員室だ。MUSEはホールの舞台にいる。');
    await K('今回の相手は、データを消せる人間だ。言葉の端の、小さな食い違いも見逃すな。', 'serious');
    G.toast(`迷ったら、後ろの<b>九条に話しかけて</b>みましょう。<br>手帳（${touch() ? 'Bボタン' : 'X / Esc'}）で証拠を確認できます。`, 7000);
  }

  async function talkNoa() {
    if (has('c_stream')) { await X('noa', 'ワタシにできることあったら言って！ ……配信は、さすがに止めたけどね。', 'sad'); return; }
    await X('noa', '探偵さん……霧島さん、ほんとに死んじゃったの……？', 'sad');
    await K('残念ながら。ノアさん、あなたは配信をしていましたね。その記録を見せてもらいたい。');
    await X('noa', 'う、うん！ ドローンでずーっと撮ってたから、全部残ってるよ。どこが見たい？');
    const c = await G.choose(['19時45分から20時の映像', '霧島さんが映っている映像', '配信のコメント欄']);
    if (c === 0) { G.trust(3); await K('……いい判断だ、{N}くん。', 'smile'); }
    else { await X('noa', 'えっと、これと、これと……', 'think'); await K('{N}くん、我々が知りたいのは“あの20分間”だ。', 'serious'); }
    await X('noa', '19時45分から20時ね……この時間にホールを出てったのは、三人だね。');
    await X('noa', '天城社長はラウンジ。ワタシ、ラウンジにもドローンを一機置いてたんだけど、社長ずーっと独り言とか電話とかしてて、ちょっとウケた。', 'smile');
    await X('noa', '黒須さんは警備室の方。神楽坂さんは「展示の調整に行ってきます」って。');
    await X('noa', 'あと、その前……19時40分くらいに、天城社長と霧島さんがケンカしてたよ。『データの件は、今夜で終わりにする』って、霧島さんが。', 'serious');
    await G.gain('c_stream');
  }
  async function talkAmagi() {
    if (has('c_amagi')) { await X('amagi', 'もう話すことはない。……封鎖さえ解ければ、弁護士を呼ぶ。', 'angry'); return; }
    await X('amagi', '探偵か。私は何も知らん。AIが暴走した、それだけの話だろう。', 'angry');
    await K('19時40分、霧島氏と口論されていましたね。『データの件』とは？');
    await X('amagi', '……っ、配信か。忌々しい。', 'angry');
    const c = await G.choose(['「隠すと、もっと疑われますよ」', '「霧島さんの発表は、何についてだったんですか？」', '（黙って九条さんに任せる）']);
    if (c === 1) { G.trust(3); await K('（……良い質問だ）', 'smile'); }
    else if (c === 2) await K('天城さん。黙秘は、最も疑わしい答えですよ。', 'serious');
    await X('amagi', '……美術館から、来場者のデータを買っていた。『人格スキャン』のな。', 'sad');
    await X('amagi', '匿名化されたデータだ！ 合法な取引だ！ ……少なくとも、窓口の人間はそう言っていた。', 'angry');
    await K('窓口とは？');
    await X('amagi', '言えん。契約上の守秘義務だ。', 'serious');
    await X('amagi', '霧島は、それを22時に暴露するつもりだった。だから止めようとした。……だが殺してなどいない！ 私はずっとラウンジにいたんだ！', 'angry');
    f().amagiTalked = true;
    await G.gain('c_amagi');
  }
  async function talkKurosu() {
    if (ch() === 1) { await X('kurosu', '演算室には、僕以外誰も近づけてないっす。', 'serious'); return; }
    if (has('c_kurosu')) {
      await X('kurosu', '電脳層に潜るなら、展示室Bのダイブ装置を使ってください。準備はしときます。');
      return;
    }
    await X('kurosu', '……来ると思ってましたよ。管理者権限を持ってるのは、僕だけっすから。', 'sad');
    await K('19時45分から20時の間、あなたは？');
    await X('kurosu', '警備室で定期点検。19:48に入って、20:00に出た。扉のログを見てください。ほら。');
    await N('モニターに、警備室の入退室ログが表示される。黒須の言葉どおりだ。');
    await K('予約を消せるのは、管理者権限かMUSEのトークン、と言いましたね。');
    await X('kurosu', 'ええ。それと……学芸員の認証キー“CURATOR-01”にも、展示制御の範囲でかなりの権限がある。霧島さんが、MUSEの展示を動かすために緩く設定してたんすよ。', 'think');
    await M('認証キーって、カードか何かですか？');
    await X('kurosu', 'スマートリング。指輪型で、本人の静脈でしか起動しない。他人が盗んでも使えません。');
    await G.gain('c_kurosu');
    await X('kurosu', '……消された記録、取り戻す方法はあるっすよ。', 'serious');
    await X('kurosu', 'ARGUSの深層アーカイブ。“電脳層”に直接潜れば、消されたデータの残骸が残ってるかもしれない。');
    await K('潜る？', 'think');
    await X('kurosu', '展示室Bの“電脳ダイブ”。あれ、ただのアトラクションじゃない。本物のフルダイブ装置なんすよ。');
    f().diveKnown = true;
  }
  async function talkMirai() {
    if (ch() === 0) { await X('mirai', 'メインホールは、この奥です。', 'smile'); return; }
    if (has('c_mirai')) { await X('mirai', '……MUSEが人を殺したなんて、私は信じたくありません。', 'sad'); return; }
    await X('mirai', '九条さん……。私の企画展で、こんなことが……。', 'sad');
    await K('19時50分頃、ホールを離れていましたね。');
    await X('mirai', 'ええ。展示室Aの、ホログラムの調整に。19時50分から58分まで、ずっと展示室Aにいました。');
    await K('お一人で？');
    await X('mirai', 'はい。……疑われているんですか、私。', 'serious');
    await K('全員に聞いていることです。', 'closed');
    await X('mirai', '……霧島さんは、MUSEのことを本当に大切にしていました。', 'sad');
    await G.gain('c_mirai');
    if (f().diveKnown) {
      await X('mirai', '……電脳層に潜るおつもりですか？ やめてください。深層には防御プログラムがいて、本当に危険なんです。', 'shock');
      await K('ご心配どうも。', 'closed');
    }
  }
  async function talkMuse() {
    if (ch() === 0) { await X('muse', 'メインホールで、皆様がお待ちです。', 'smile'); return; }
    if (ch() === 1) return talkMuseCh1();
    await X('muse', '私の記憶の欠落……。深層アーカイブになら、残骸が残っているはずです。', 'serious');
    await X('muse', 'もし潜るなら、私も一緒に行きます。電脳層は、私の庭ですから。', 'smile');
  }

  async function examDive() {
    if (ch() !== 2) { await N('電脳ダイブ装置。今は誰も使っていない。'); return; }
    if (testiCount() < 4 || !f().diveKnown) {
      await N('電脳ダイブ装置。白いポッドが静かに並んでいる。');
      await K('潜る前に、全員の証言を揃えよう。……黒須さんにも、話を聞いておきたい。', 'think');
      return;
    }
    await diveScene();
  }
  async function diveScene() {
    G.cinema(true);
    await G.fadeOut(500);
    G.clearActors();
    G.place('me', 28, 6, 'up'); G.place('kujo', 27, 6, 'up'); G.place('kurosu', 30, 4, 'left'); G.place('muse', 29, 3, 'down');
    G.cam(29, 4.5); G.snap();
    await G.fadeIn(500);
    await X('kurosu', 'ポッドに入って。意識をARGUSのネットワークに直接つなぐ。');
    await X('kurosu', 'ただし……深層には、侵入者を排除する防御プログラム“ICE”がうようよしてる。やられたら脳に直接ダメージが来る。最悪――戻ってこれない。', 'serious');
    await M('……っ。', 'shock');
    await K('{N}くん。無理はしなくていい。', 'serious');
    const c = await G.choose(['行きます。MUSEの無実を証明したい', '……九条さんが行けばいいのでは？']);
    if (c === 0) { G.trust(3); await K('……そう言うと思っていたよ。', 'smile'); }
    else { await K('私は機械の扱いが壊滅的に苦手でね。ポッドの蓋の開け方も分からない。', 'smile'); await M('……知ってました。', 'closed'); }
    await K('私はここで、モニター越しに君を導く。君の目と、MUSEの力。そして私の頭脳。', 'serious');
    await K('――三人で、亡霊を狩ろう。', 'smile');
    await X('muse', '{N}様。電脳層では、私があなたを守ります。', 'smile');
    G.se('dive'); G.flash('#ffffff', 1200);
    await G.fadeOut(900);
    STATE.chapter = 3;
    f().dived = true;
    await G.chapter('第三章', '電脳ダイブ', '― ARGUS 深層 ―');
    STATE.follower = 'muse'; STATE.follow = true;
    G.load('CY', 3, 13, 'right');
    G.time('22:30');
    G.hum(0.8); G.bgm('c_explore');
    G.cinema(true);
    await G.fadeIn(900);
    await M('ここが……電脳層……。', 'shock');
    await X('muse', 'ようこそ、私の世界へ。', 'smile');
    await K('聞こえるか、{N}くん。こちらからも、君の視界が見えている。');
    await K('目標は深層アーカイブ。消された記録の残骸を探すんだ。途中のデータノードも調べておけ。');
    G.cinema(false);
    G.toast('光る<b>データノード</b>を調べると記録を解析できます。<br>赤い<b>防御プログラム</b>に触れると戦闘。負けると<b>ゲームオーバー</b>です。', 8000);
  }

  /* ------------------------------------------------------------------
     第三章：電脳層
     ------------------------------------------------------------------ */
  const WATCHER = { name: 'ICE《ウォッチャー》', sprite: 'watcher', hp: 110, atk: [9, 13], burst: [16, 20], pattern: ['atk', 'atk', 'charge', 'burst', 'atk'], burstName: 'スキャン・レーザー', weak: null, bgm: 'c_battle',
    intro: '警戒プログラム《ウォッチャー》が、赤い眼をこちらに向けた！',
    advice: '奴は単純な監視プログラムだ。弱点はないが、充填のあとに全体攻撃が来る。その直前に“シールド”を張れ。' };
  const KERBEROS = { name: 'ICE《ケルベロス》', sprite: 'kerberos', hp: 300, atk: [14, 19], burst: [26, 32], pattern: ['atk', 'atk', 'charge', 'burst', 'atk', 'heal'], burstName: 'トリプル・インフェルノ', weak: 'decode', healAmt: 24, bgm: 'c_boss',
    intro: '深層防衛プログラム《ケルベロス》が、三つの首を擡げた――！',
    advice: '奴の装甲は三重に暗号化されている。“デコード”で弱点を突け。充填の後は全体攻撃――必ず“シールド”を。HPが減ったら、迷わず回復だ。',
    loseText: '三つの顎に噛み砕かれ――{N}の意識は、電脳の闇に呑まれた。' };

  async function battle1() {
    G.cinema(true);
    await X('muse', '警戒プログラム“ウォッチャー”です！ 来ます！', 'shock');
    await K('落ち着け、{N}くん。私が後ろについている。', 'serious');
    G.cinema(false);
    await G.battle(WATCHER);
    f().watcherDown = true;
    G.bgm('c_explore');
    await K('よくやった。……その調子だ。', 'smile');
    await X('muse', 'お見事です、{N}様。', 'smile');
  }
  async function bossEvent() {
    if (nodeCount() < 3) { await K('待て。その先は深層だ。手前のデータノードを全て解析してからにしよう。', 'serious'); return; }
    G.checkpoint('boss');
    await boss();
  }
  async function boss() {
    G.cinema(true);
    G.bgm('c_tension');
    await X('muse', '深層防衛プログラム“ケルベロス”……！ 三つの頭を持つ、最強のICEです！', 'shock', { tremble: true });
    await K('怯むな。……どんな獣にも、必ず弱点はある。', 'serious');
    await K('戦いの中で迷ったら、私に相談したまえ。', 'smile');
    G.cinema(false);
    await G.battle(KERBEROS);
    f().kerberosDown = true;
    G.bgm('c_explore');
    G.se('glitch'); G.flash('#ff4a5a', 400);
    await N('防壁が砕け散り、深層アーカイブへの道が開いた。');
    await X('muse', '……やりました。私たち、勝ったんです……！', 'smile');
  }
  async function node(id) {
    if (has(id)) { await N('解析済みのデータノードだ。'); return; }
    G.se('glitch');
    await N('データノードに触れると、光の文字列が指先から流れ込んできた。');
    if (id === 'c_sensor') {
      await X('muse', '展示室Aの、人感センサーの記録です。');
      await N('「19:45〜20:05　検知：なし」');
      await M('誰も……いなかった？', 'shock');
      await K('……ほう。', 'think');
    } else if (id === 'c_ghostsrc') {
      await X('muse', 'GHOSTメールの送信記録の残骸です。送信元は……学芸員室の端末“T-3”。', 'serious');
      await X('muse', '21時05分のメッセージも、同じT-3から予約送信されています。');
      await K('亡霊の住処は、学芸員室か。', 'serious');
    } else {
      await X('muse', '人格スキャンのデータ転送記録……送り先は、ヘリオス社。', 'serious');
      await X('muse', '承認キーは――“CURATOR-01”。');
      await M('CURATOR-01って……！', 'shock');
      await K('黒須さんが言っていた、学芸員の認証キーだ。', 'serious');
    }
    await G.gain(id, 'データを解析');
  }
  async function patch(key) {
    if (f()[key]) return;
    f()[key] = true; STATE.items.patch++;
    SND.se('heal');
    G.toast(`<b>回復パッチ</b>を手に入れた。（所持 ${STATE.items.patch}）`, 3000);
  }
  async function core() {
    if (has('c_schedule')) { await N('深層アーカイブのコア。静かに脈打っている。'); return; }
    G.cinema(true);
    await X('muse', '深層アーカイブ……ここに、消された記録の残骸があるはずです。復元します。', 'serious');
    G.se('glitch'); G.flash('#3ff0ff', 500); G.shake(4, 600);
    await N('コアが強く輝き、砕けた文字列が一つに組み上がっていく――');
    await N('「19:52　予約登録：21:00 消火システム起動／インターロック無効」');
    await N('「端末：T-3（学芸員室）　認証：CURATOR-01 ＋ MUSE展示制御トークン」');
    await G.gain('c_schedule', 'ログを復元');
    await M('19時52分……T-3……CURATOR-01……！', 'shock');
    await X('muse', '私のトークンは……この時、使われていたのですね。私の記憶を切り取って。', 'sad');
    await K('――繋がった。', 'serious');
    await K('戻っておいで、{N}くん。亡霊を、狩りに行こう。', 'smile');
    G.se('dive'); G.flash('#ffffff', 900);
    await G.fadeOut(900);
    STATE.follower = 'kujo';
    await finale();
  }

  /* ------------------------------------------------------------------
     最終章
     ------------------------------------------------------------------ */
  function hallSetup() {
    G.clearActors();
    G.place('mirai', 14, 14, 'down'); G.place('amagi', 16, 14, 'down'); G.place('kurosu', 20, 14, 'down'); G.place('noa', 22, 15, 'left');
    G.place('muse', 18, 13, 'down'); G.place('kujo', 18, 17, 'up'); G.place('me', 17, 18, 'up');
    G.cam(18, 15.5); G.snap();
  }
  async function T(who, text, e, o) { G.spot(who); return G.say(who, text, e, o); }
  const deducPenalty = async () => {
    G.focus(-12);
    if (STATE.focus <= 0) await G.gameOver('BAD END', '真相は闇へ', '推理は崩れ去った。神楽坂ミライは混乱に乗じて全てのデータを消去し、事件は『AIの暴走』として処理された。');
  };
  const P = (prompt, ids, o = {}) => G.present(prompt, ids, Object.assign({ penalty: deducPenalty, noAuto: true }, o));

  async function finale() {
    STATE.chapter = 4; STATE.follower = 'kujo'; G.follow(false);
    STATE.focus = 100;
    G.bgm(null); G.hum(0.4);
    if (!f().finaleSeen) { f().finaleSeen = true; await G.chapter('最終章', 'データは嘘をつかない', '― 午前零時 ―'); }
    G.load('M1', 17, 18, 'up');
    G.cinema(true);
    hallSetup();
    G.time('00:00');
    G.checkpoint('finale');
    G.bgm('c_tension');
    await G.fadeIn(900);
    await N('午前零時。メインホールに、全員が集められた。');
    await T('amagi', 'こんな時間に何のつもりだ。AIの暴走で決まりだろう。', 'angry');
    await T('kujo', '霧島蒼氏を殺害したのは、AIではありません。', 'serious');
    await T('kujo', '――人間です。それも、この中にいる。', 'serious');
    await T('noa', 'えっ……！', 'shock');
    await T('muse', '九条様……。', 'sad');
    await T('kujo', '{N}くん。手帳を。……今夜の相手は手強い。一つの間違いが、命取りになる。', 'serious');
    await T('me', 'はい……！', 'serious');
    G.bgm('c_debate');
    G.toast('<b>最終章</b>：証拠を間違えると<b>集中力</b>が減ります。0になると<b>敗北</b>です。', 6500);
    G.refresh(); $('hud').classList.remove('hidden'); setTimeout(G.refresh, 4000);

    await T('kujo', 'まず、21時に消火システムを動かした命令。それは、どんな命令だったか。');
    await P('21時の命令の正体を示す証拠は？', ['c_log'], { hint: '量子演算室の制御端末に、何と表示されていた？' });
    await T('kujo', '“予約実行”。命令は前もって仕込まれていた。犯人は21時、この部屋で私たちと一緒にショーを見ていればよかった。');
    await T('kujo', 'つまり――21時のアリバイは、全員にとって無意味です。', 'serious');
    await T('amagi', 'な……っ。', 'shock');
    await T('kujo', 'では、予約はいつ、どこで登録されたのか。');
    await P('予約が登録された時刻と場所を示す証拠は？', ['c_schedule'], { hint: '{N}くんが電脳層の深層から持ち帰ったものだ。' });
    await T('kujo', '19時52分。学芸員室の端末“T-3”。MUSEの記憶が切り取られていた、まさにその時間です。');
    await G.timeline([
      { t: '19:52', text: '予約登録\n（端末T-3）', cls: 'key' },
      { t: '20:00', text: '霧島、演算室へ' },
      { t: '21:00', text: 'ガス放出\n（偽りのアリバイ）', cls: 'bad' },
      { t: '21:05', text: 'GHOSTの\nメッセージ' },
    ], ['19:45', '20:05', 'MUSEの記憶の空白'], ['19:40', '21:12']);
    await T('kujo', '19時52分。その時、このホールを離れていたのは誰か。');
    await P('19時52分頃にホールを離れていた人物が分かる証拠は？', ['c_stream'], { hint: 'ノアさんのドローンは、ずっと会場を撮っていた。' });
    await T('kujo', '天城氏、黒須さん、そして神楽坂さんの三人です。');
    await T('kujo', '天城氏はラウンジ。ノアさんのドローンのマイクが、その間ずっと彼の声を拾っていた。');
    await T('amagi', 'だ、だから言っただろう！ 私はラウンジにいたと！', 'angry');
    await T('kujo', '黒須さんは警備室にいたと言う。それを裏付けるものは？');
    await P('黒須が警備室にいたことを裏付ける証拠は？', ['c_kurosu'], { hint: '黒須さん自身が、あるログを見せてくれたはずだ。' });
    await T('kujo', '警備室の扉のログ。19:48に入室し、20:00に退室。T-3のある学芸員室にいることはできない。');
    await T('kurosu', '……はぁ。助かった……。', 'sad');
    await T('kujo', 'そして、神楽坂さん。あなたは、展示室Aでホログラムの調整をしていたと言った。', 'serious');
    await T('mirai', 'ええ……そうです。19時50分から58分まで。', 'serious');
    await P('神楽坂の証言を崩す証拠は？', ['c_sensor'], { hint: 'その時間、展示室Aに“誰か”はいたのか？' });
    await T('kujo', '展示室Aの人感センサーは、19時45分から20時05分まで、一度も反応していない。', 'serious');
    await T('kujo', 'あなたは、展示室Aにはいなかった。', 'serious');
    await T('mirai', '…………。', 'closed');

    await T('kujo', '――{N}くん。ここで間違えれば、全てが終わる。', 'serious');
    await T('kujo', '君の口から、言ってくれ。この事件の“亡霊”は、誰だ。');
    G.spot(null);
    const who = await G.pickPerson('霧島蒼を殺害した犯人は？', ['mirai', 'kurosu', 'amagi', 'noa']);
    if (who !== 'mirai') {
      const nm = { kurosu: '黒須', amagi: '天城', noa: 'ノア' }[who];
      await T('me', `犯人は……${nm}さんです！`, 'serious');
      await T('kujo', '……{N}くん。', 'closed');
      SND.se('wrong');
      await G.gameOver('BAD END', '誤った告発', `${nm}が取り押さえられたその隙に、真犯人は端末T-3から全てのデータを消去した。\n真実は電子の海に沈み、MUSEは「暴走AI」として初期化された。`);
    }
    G.trust(5);
    await G.cutin('犯人は――', null, 1100);
    G.spot('mirai'); SND.se('sting'); G.shake(5, 600, true);
    await T('me', '神楽坂ミライさん。……あなたです。', 'serious');
    await T('kujo', 'ええ。私も、同じ答えです。', 'serious');
    await T('mirai', '……ふふ。', 'smile');
    await T('mirai', '九条さん。あなたを呼んだのは私ですよ？ 犯人が、わざわざ探偵を招くと思いますか？', 'smile');
    await T('kujo', '思いますとも。“名探偵がAIの暴走を見届けた”――それ以上の筋書きはない。', 'serious');
    await T('mirai', '……いいわ。なら、受けて立ちます。', 'angry');

    await G.debate({
      enemy: 'mirai', name: '神楽坂 ミライ', short: '神楽坂',
      intro: '論戦開始！ ミライの“心の防壁”を崩せ！',
      wrongDmg: 20,
      loseText: '論理が崩れた。神楽坂ミライは追及を逃れ、事件は『AIの暴走』として処理された。\nMUSEは――初期化された。',
      rounds: [
        { claim: 'CURATOR-01のキーは、誰かに盗まれていたのよ！ 私じゃない！', correct: ['c_kurosu'],
          hint: '黒須さんは、学芸員の認証キーについて何と言っていた？', counter: 'キーなんて、いくらでも複製できるわ！',
          after: async () => {
            await K('CURATOR-01はスマートリング。あなたの静脈でしか起動しない。盗まれても、他人には使えない。', 'serious');
            await X('mirai', '……っ。', 'shock');
          } },
        { claim: 'そもそも私には、霧島さんを殺す理由なんてないわ！', correct: ['c_datasale'],
          alt: { c_tablet: '惜しい。霧島氏が何を暴こうとしていたか――その“裏付け”となる記録があったはずだ。', c_amagi: '天城氏の証言だけでは、窓口が誰かまでは分からない。' },
          hint: '人格スキャンのデータは、誰の承認で売られていた？', counter: '人格スキャンのデータなんて、知らないわ！',
          after: async () => {
            await K('来場者の生体データを売っていたのは、あなただ。承認キーはCURATOR-01。霧島氏は22時に、それを暴露するつもりだった。', 'serious');
            await X('amagi', '……窓口は、神楽坂君だった。', 'sad');
          } },
        { claim: 'GHOSTですって？ あれは外部の愉快犯よ！ 私だって脅迫されてた被害者なの！', correct: ['c_ghostsrc'],
          alt: { c_ghostmail: 'メールの“中身”ではない。“どこから”送られたかだ。' },
          hint: '電脳層で、GHOSTの送信元を突き止めたはずだ。', counter: '外から送られてきたものよ！',
          after: async () => {
            await K('GHOSTのメールは、学芸員室の端末T-3から送られていた。脅迫状を書いたのも、あなた自身だ。', 'serious');
            await K('“AIの反乱”という筋書きを、三週間かけて準備した。私を呼んだのは、その幕引きの証人にするためだ。');
          } },
        { claim: '仮にGHOSTが私だとしても……ただの悪戯よ！ 殺人とは関係ないわ！', correct: ['c_ghostmsg'], cut: 'これが証拠だ！',
          hint: '21時05分。あのメッセージが表示された時、霧島氏の死を知っていた者は？', counter: '関係ないと言ってるでしょう！',
          after: async () => {
            await K('21時05分。GHOSTは「創造主の魂を奪った」と告げた。', 'serious');
            await K('だが、遺体が見つかったのは21時10分。あの時点で彼の死を知り得たのは――', 'serious');
            await K('ガスを仕掛けた者だけだ。', 'serious');
          } },
      ],
    });

    // 告白
    f().solved = true;
    G.bgm('truth');
    G.spot('mirai');
    await N('長い沈黙の後、神楽坂ミライは、静かに膝をついた。');
    await T('mirai', '……霧島さんは、いつも正しかった。', 'sad');
    await T('mirai', 'この美術館は、もう何年も赤字でした。来年には、閉館が決まっていたんです。', 'sad');
    await T('mirai', 'だから、データを売った。ほんの少しの生体データで、この企画展は続けられた。たくさんの人が、未来を見に来てくれた……！', 'sad', { tremble: true });
    await T('mirai', 'なのにあの人は、それを全部暴くと言った。', 'angry');
    await T('mirai', 'だから……MUSEに罪を着せた。AIが暴走したことになれば、MUSEの言葉なんて、誰も信じなくなるから。', 'closed');
    await T('muse', '……ミライ。', 'sad');
    await T('muse', 'あなたが企画してくれたこの展覧会が、私は好きでした。', 'sad');
    await T('mirai', '……っ。', 'sad', { tremble: true });
    await T('kujo', '神楽坂さん。あなたは、この場所を守りたかったと言う。', 'closed');
    await T('kujo', 'だが、あなたが売ったのは、ここへ未来を見に来た人々の心だ。', 'serious');
    await T('kujo', 'そして、友を殺し、その罪を言葉を持たない者に着せた。', 'serious');
    await T('kujo', 'データは嘘をつかない。嘘をつくのは、いつだって人間です。', 'closed');
    G.spot(null);
    await N('ミライは顔を覆い、それきり、何も言わなかった。');
    await epilogue();
  }

  /* ------------------------------------------------------------------
     終章
     ------------------------------------------------------------------ */
  async function epilogue() {
    await G.fadeOut(1300);
    G.bgm(null); G.hum(0.2);
    STATE.chapter = 5;
    await G.chapter('終章', '夜明けのログアウト', '');
    G.load('M1', 17, 23, 'up');
    G.cinema(true); G.clearActors();
    G.place('kujo', 18, 23, 'up'); G.place('muse', 17, 21, 'down'); G.place('noa', 16, 21, 'down'); G.place('kurosu', 19, 21, 'down');
    G.cam(17.5, 22); G.snap();
    G.time('06:00');
    G.bgm('c_ending');
    await G.fadeIn(1500);
    await N('午前6時。封鎖が解け、シャッターの向こうから朝日が差し込んだ。');
    await N('到着した警察に、神楽坂ミライは静かに連行されていった。データを買い取っていた天城もまた、事情を聞かれることになった。');
    await X('kurosu', 'MUSEのトークン設定、ちゃんと直しときます。……二度と、こんなことにならないように。', 'serious');
    await X('noa', 'ワタシ、今夜のこと、ちゃんと配信で話すね。MUSEは悪くないって。', 'smile');
    await X('muse', '{N}様。', 'smile');
    await X('muse', '電脳層で、あなたと一緒に戦えたこと。私の記憶領域に、永久保存しました。', 'smile');
    await M('……うん。私も、忘れないよ。', 'smile');
    await X('muse', '蒼が言っていました。“AIと人間は、きっと友達になれる”と。……あなたを見て、その意味が少し分かった気がします。', 'smile');
    await K('行こうか、{N}くん。', 'smile');
    await G.fadeOut(900);
    G.clearActors();
    G.place('me', 17, 24, 'down'); G.place('kujo', 18, 24, 'down');
    G.cam(17.5, 22.5); G.snap();
    await G.fadeIn(900);
    await M('九条さん。今回も、最初から気づいてたんですか？', 'think');
    await K('依頼人が一番怪しい、というのは探偵の基本だよ。', 'smile');
    await M('……じゃあ、黒鷺館の時も。もしかして、私のことも疑ってました？', 'think');
    await K('君は最初から、容疑者リストの外だ。', 'smile');
    await K('……君ほど嘘が下手な人間は、いないからね。', 'smile');
    await M('それ、褒めてます……？', 'sad');
    await K('最大級の賛辞さ。', 'smile');
    if (STATE.trust >= 70) await K('それに――今夜、電脳層で戦ったのは君だ。……誇っていい。', 'smile');
    await K('さあ、帰ろう。徹夜明けの朝食は、君の奢りだ。', 'smile');
    await M('ええっ、また私ですか！？', 'shock');
    await G.fadeOut(1400);
    await G.mono([
      '――こうして、電脳展の長い夜は終わった。',
      'データは嘘をつかない。嘘をつくのは、いつだって人間だ。',
      'それでも――人間とAIは、きっと友達になれる。\nあの夜、私はそう信じられた。',
      '探偵助手 {N} の手記より　FILE.02',
    ]);
    W.mode = 'blank';
    G.cinema(false);
    await showResult();
  }

  /* ------------------------------------------------------------------
     ヒント
     ------------------------------------------------------------------ */
  async function hint() {
    const c = ch(), fl = f();
    if (c === 0) { await K('皆はメインホールに集まっているそうだ。北へ進もう。'); return; }
    if (c === 1) {
      const left = [];
      if (!has('c_body')) left.push('遺体'); if (!has('c_gas')) left.push('床の霜'); if (!has('c_log')) left.push('制御端末');
      if (!has('c_tablet')) left.push('落ちているタブレット'); if (!has('c_door')) left.push('扉脇の入退室パネル'); if (!has('c_muse')) left.push('MUSEの話');
      if (left.length) await K(`まだ見ていないものがある。${left.join('、')}……光っている所に注目だ。`, 'think');
      else await K('この部屋はもう十分だ。回廊へ出よう。');
      return;
    }
    if (c === 2) {
      const need = [['c_stream', 'ノアさん（ホール）'], ['c_amagi', '天城氏（ラウンジ）'], ['c_kurosu', '黒須さん（警備室）'], ['c_mirai', '神楽坂さん（学芸員室）']].filter(([i]) => !has(i)).map(x => x[1]);
      if (need.length) await K(`まだ話を聞いていないのは、${need.join('、')}だ。`, 'think');
      else await K('全員の話は聞いた。……展示室Bの電脳ダイブ装置へ行こう。消された記録を取り戻す。', 'serious');
      return;
    }
    if (c === 3) {
      if (!fl.watcherDown) await K('（通信）接続区画の先に、警戒プログラムがいる。戦いになったら、敵の動きをよく見るんだ。', 'serious');
      else if (nodeCount() < 3) await K(`（通信）データ回廊には、まだ解析していないノードがある。残り${3 - nodeCount()}つだ。`, 'think');
      else if (!fl.kerberosDown) await K('（通信）深層通路の番犬が最後の関門だ。HPとEPを整えてから挑め。回復パッチも惜しまずに。', 'serious');
      else await K('（通信）深層アーカイブのコアを調べるんだ。', 'think');
    }
  }

  /* ------------------------------------------------------------------
     イベント
     ------------------------------------------------------------------ */
  const EVENTS = {
    M1: [
      { at: [[16, 20], [17, 20], [18, 20], [19, 20]], when: () => ch() === 0 && !f().party, step: partyScene },
      { at: [[14, 14]], sprite: 'drone', when: () => ch() === 2, check: async () => { await N('ノアの配信用ドローン。静かに宙に浮いている。'); } },
      // 量子演算室
      { at: [[19, 5], [20, 5]], sprite: 'c_body', when: () => ch() >= 1 && ch() < 5 && f().crash, check: examBody, clue: () => ch() === 1 && !has('c_body') },
      { at: [[14, 3]], sprite: 'frost', when: () => ch() >= 1 && f().crash, check: examFrost, clue: () => ch() === 1 && !has('c_gas') },
      { at: [[16, 4], [17, 4]], when: () => ch() >= 1 && f().crash, check: examConsole, clue: () => ch() === 1 && !has('c_log') },
      { at: [[21, 3]], sprite: 'tablet', when: () => ch() >= 1 && ch() < 5 && f().crash, check: examTablet, clue: () => ch() === 1 && !has('c_tablet') },
      { at: [[12, 7]], when: () => ch() >= 1 && f().crash, check: examDoor, clue: () => ch() === 1 && !has('c_door') },
      { at: [[17, 8]], when: () => ch() === 1 && f().investigating && studyCount() < 6, solid: true, bump: async () => { await K('待ちたまえ。この部屋は、まだ多くを語っていない。', 'serious'); } },
      { at: [[17, 9]], when: () => ch() === 1 && f().investigating && studyCount() >= 6 && !f().ch1done, step: endCh1 },
      { at: [[17, 8]], when: () => ch() === 2, solid: true, bump: async () => { await K('現場はもう十分に見た。今は証言を集めよう。'); } },
      // ダイブ装置
      { at: [[28, 5], [29, 5], [25, 2], [27, 2], [29, 2], [31, 2], [33, 2]], when: () => ch() >= 2, check: examDive, clue: () => ch() === 2 && testiCount() >= 4 && f().diveKnown },
    ],
    CY: [
      { at: [[2, 13]], step: async () => {
        if (!has('c_schedule')) { await X('muse', 'まだ戻れません。深層アーカイブの記録を取り戻さないと……！', 'serious'); }
      } },
      { at: [[8, 13]], sprite: 'watcher', when: () => !f().watcherDown, solid: true,
        bump: async () => { G.checkpoint('battle1'); await battle1(); }, check: async () => { G.checkpoint('battle1'); await battle1(); } },
      { at: [[10, 5]], sprite: 'node', when: () => !has('c_sensor'), check: () => node('c_sensor'), clue: () => !has('c_sensor') },
      { at: [[10, 5]], sprite: 'node_done', when: () => has('c_sensor'), check: () => node('c_sensor') },
      { at: [[16, 5]], sprite: 'node', when: () => !has('c_ghostsrc'), check: () => node('c_ghostsrc'), clue: () => !has('c_ghostsrc') },
      { at: [[16, 5]], sprite: 'node_done', when: () => has('c_ghostsrc'), check: () => node('c_ghostsrc') },
      { at: [[13, 7]], sprite: 'node', when: () => !has('c_datasale'), check: () => node('c_datasale'), clue: () => !has('c_datasale') },
      { at: [[13, 7]], sprite: 'node_done', when: () => has('c_datasale'), check: () => node('c_datasale') },
      { at: [[10, 14]], sprite: 'patch', when: () => !f().patchA, solid: true, check: () => patch('patchA'), bump: () => patch('patchA') },
      { at: [[16, 14]], sprite: 'patch', when: () => !f().patchB, solid: true, check: () => patch('patchB'), bump: () => patch('patchB') },
      { at: [[16, 11]], sprite: 'patch', when: () => !f().patchC, solid: true, check: () => patch('patchC'), bump: () => patch('patchC') },
      { at: [[19, 9]], sprite: 'kerberos', when: () => !f().kerberosDown, solid: true, bump: bossEvent, check: bossEvent },
      { at: [[22, 8]], sprite: 'firewall', when: () => !f().kerberosDown, solid: true, bump: async () => { await X('muse', '防火壁です。ケルベロスを倒さなければ、通れません。', 'serious'); } },
      { at: [[23, 8]], sprite: 'firewall', when: () => !f().kerberosDown, solid: true, bump: async () => { await X('muse', '防火壁です。ケルベロスを倒さなければ、通れません。', 'serious'); } },
      { at: [[22, 3], [23, 3]], check: core, clue: () => f().kerberosDown && !has('c_schedule') },
    ],
  };

  const TALK = {
    kujo: async () => hint(),
    muse: async () => {
      if (W.mapId === 'CY') {
        const L = ['{N}様のHPは、私が見守っています。危なくなったら回復しますね。', 'この電脳層は、ARGUSの記憶そのものです。どこかに、蒼の最後の記録も……。', '戦闘では、九条様に相談すると敵の動きが読めます。'];
        await X('muse', L[Math.floor(Math.random() * L.length)], 'smile');
        await hint();
        return;
      }
      return talkMuse();
    },
    mirai: talkMirai, kurosu: talkKurosu, amagi: talkAmagi, noa: talkNoa,
  };

  function onResume() {
    W.storm = false;
    SND.rain(0);
    SND.hum(W.mapId === 'CY' ? 0.8 : 0.5);
    SND.bgm('c_explore');
  }

  return {
    npcs, objective, FLAVOR, flavor, EVENTS, talk: id => (TALK[id] ? TALK[id]() : Promise.resolve()),
    prologue, hint, onResume, hintFromMenu: true, initState,
    battle1, boss, finale,
    nbName: '電脳手帳',
    start: { map: 'M1', x: 17, y: 24, dir: 'up' },
    people: () => STATE.flags.party ? ['kujo', 'mirai', 'kirishima', 'amagi', 'kurosu', 'noa', 'muse'] : ['kujo', 'mirai', 'muse'],
    evidenceIds: () => C_EVIDENCE_ORDER,
    result() {
      const t = STATE.trust, fo = STATE.focus || 0, score = Math.round(t * 0.5 + fo * 0.5);
      const [rank, title] = score >= 85 ? ['S', '電脳の名探偵助手'] : score >= 70 ? ['A', '九条の右腕'] : score >= 50 ? ['B', '頼れる相棒'] : ['C', 'まだまだ修行中'];
      return {
        label: '探偵助手としての評価', rank, title,
        stats: `九条からの信頼　${t} / 100<br>最終集中力　${fo} / 100<br>集めた証拠・証言　${STATE.evidence.length} / ${C_EVIDENCE_ORDER.length}`,
        credits: `<h2>電脳展の亡霊</h2><p style="color:#8ad8e8">― 探偵助手の手記 FILE.02 ―</p>
          <h4>探偵</h4><p>九条 玲司</p><h4>探偵助手</h4><p>${esc(STATE.name)}</p>
          <h4>展示AI</h4><p>MUSE</p>
          <h4>天穹ミュージアムの人々</h4><p>霧島 蒼</p><p>神楽坂 ミライ</p><p>黒須 レン</p><p>天城 セイジ</p><p>白鳥 ノア</p>
          <h4>シナリオ・プログラム・グラフィック・音楽</h4><p>すべてブラウザ上で生成</p>
          <h4>Special Thanks</h4><p>最後まで遊んでくれたあなた</p><div class="end">完</div>`,
        bgm: 'c_ending',
      };
    },
  };
})();
