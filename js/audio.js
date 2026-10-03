'use strict';
/* =========================================================
   SND : すべての音をWebAudioで合成する（外部音源なし）
   ========================================================= */
const SND = (() => {
  let ac = null, master, busMusic, busSe, busAmb, reverb, noiseBuf;
  let rainNodes = null;
  const vol = { bgm: 0.7, se: 0.8, amb: 0.4 };
  let track = null, trackName = null, trackGain = null, seqTimer = null, nextT = 0, stepN = 0;

  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.9;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.01; comp.release.value = 0.2;
    master.connect(comp); comp.connect(ac.destination);
    busMusic = ac.createGain(); busMusic.connect(master);
    busSe = ac.createGain(); busSe.connect(master);
    busAmb = ac.createGain(); busAmb.connect(master);
    applyVol();
    reverb = ac.createConvolver(); reverb.buffer = impulse(3.2, 2.6);
    const rv = ac.createGain(); rv.gain.value = 0.42; reverb.connect(rv); rv.connect(busMusic);
    noiseBuf = makeNoise(3);
  }
  function applyVol() {
    if (!ac) return;
    busMusic.gain.value = vol.bgm * 0.55;
    busSe.gain.value = vol.se;
    busAmb.gain.value = vol.amb * 0.7;
  }
  function setVol(k, v) { vol[k] = Math.max(0, Math.min(1, v)); applyVol(); }

  function impulse(sec, decay) {
    const len = ac.sampleRate * sec, b = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }
  function makeNoise(sec) {
    const len = ac.sampleRate * sec, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = w * 0.6 + last * 3; }
    return b;
  }
  function noise(t, dur, { type = 'lowpass', freq = 1000, q = 1, gain = 0.3, attack = 0.002, dest = busSe, sweep = null, rate = 1 } = {}) {
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.playbackRate.value = rate;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t, Math.random() * 2); s.stop(t + dur + 0.05);
  }
  function osc(t, freq, dur, { type = 'sine', gain = 0.2, attack = 0.005, release = null, dest = busSe, detune = 0, to = null, filter = null, send = 0 } = {}) {
    const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t); o.detune.value = detune;
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    if (release) { g.gain.setValueAtTime(gain, t + Math.max(attack, dur - release)); }
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o;
    if (filter) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filter; o.connect(f); n = f; }
    n.connect(g); g.connect(dest);
    if (send && reverb) { const sg = ac.createGain(); sg.gain.value = send; g.connect(sg); sg.connect(reverb); }
    o.start(t); o.stop(t + dur + 0.05);
  }

  /* ---------------- instruments (music) ---------------- */
  const out = () => trackGain || busMusic;
  function sendRv(node, amt) { if (!reverb) return; const g = ac.createGain(); g.gain.value = amt; node.connect(g); g.connect(reverb); }
  function pad(notes, t, dur, gain = 0.06, bright = 900) {
    notes.forEach(m => {
      [-7, 7].forEach(dt => {
        const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = dt;
        const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = bright; f.Q.value = 0.4;
        const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(gain / notes.length, t + Math.min(1.2, dur * 0.4));
        g.gain.setValueAtTime(gain / notes.length, t + dur * 0.75);
        g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.6);
        o.connect(f); f.connect(g); g.connect(out()); sendRv(g, 0.6);
        o.start(t); o.stop(t + dur + 0.7);
      });
    });
  }
  function bell(m, t, gain = 0.06, dec = 2.2) {
    [[1, 1], [2.01, 0.35], [3.98, 0.12]].forEach(([r, a]) => {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = mtof(m) * r;
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain * a, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec / r);
      o.connect(g); g.connect(out()); sendRv(g, 0.8);
      o.start(t); o.stop(t + dec + 0.1);
    });
  }
  function piano(m, t, gain = 0.07, dec = 2.4) {
    [[1, 1, 'triangle'], [2, 0.3, 'sine'], [3, 0.12, 'sine']].forEach(([r, a, ty]) => {
      const o = ac.createOscillator(); o.type = ty; o.frequency.value = mtof(m) * r;
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain * a, t + 0.006);
      g.gain.exponentialRampToValueAtTime(gain * a * 0.4, t + 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      o.connect(g); g.connect(out()); sendRv(g, 0.5);
      o.start(t); o.stop(t + dec + 0.1);
    });
  }
  function pluck(m, t, gain = 0.09, dec = 0.5) {
    const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(m);
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(300, t + dec);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
    o.connect(f); f.connect(g); g.connect(out()); sendRv(g, 0.3);
    o.start(t); o.stop(t + dec + 0.05);
  }
  function bass(m, t, dur, gain = 0.14) {
    const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(m);
    const o2 = ac.createOscillator(); o2.type = 'sine'; o2.frequency.value = mtof(m - 12);
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.setValueAtTime(gain, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); o2.connect(f); f.connect(g); g.connect(out());
    o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function synth(m, t, dur, gain = 0.05, type = 'sawtooth', cut = 2400) {
    [-6, 6].forEach(dt => {
      const o = ac.createOscillator(); o.type = type; o.frequency.value = mtof(m); o.detune.value = dt;
      const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(cut, t); f.frequency.exponentialRampToValueAtTime(Math.max(300, cut * 0.3), t + dur);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain / 2, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f); f.connect(g); g.connect(out()); sendRv(g, 0.35);
      o.start(t); o.stop(t + dur + 0.05);
    });
  }
  function tick(t, hi, gain = 0.05) { noise(t, 0.03, { type: 'bandpass', freq: hi ? 3200 : 2300, q: 8, gain, dest: out() }); }
  function kick(t, gain = 0.3) { osc(t, 140, 0.22, { to: 38, gain, dest: out() }); }
  function snare(t, gain = 0.1) { noise(t, 0.16, { type: 'bandpass', freq: 1900, q: 0.8, gain, dest: out() }); osc(t, 190, 0.08, { type: 'triangle', gain: gain * 0.6, dest: out() }); }
  function hat(t, gain = 0.03) { noise(t, 0.035, { type: 'highpass', freq: 7500, gain, dest: out() }); }
  function heart(t, gain = 0.22) { osc(t, 70, 0.16, { to: 40, gain, dest: out() }); osc(t + 0.2, 65, 0.18, { to: 38, gain: gain * 0.75, dest: out() }); }

  /* ---------------- tracks ---------------- */
  const TRACKS = {
    title: { bpm: 64, fn(s, t, d) {
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const P = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]];
      if (b === 0) { pad(P[bar], t, d * 8, 0.11, 800); bass(P[bar][0] - 24, t, d * 8, 0.12); }
      const M = [76, 0, 0, 0, 74, 0, 72, 0, 71, 0, 0, 0, 72, 0, 69, 0, 69, 0, 0, 0, 72, 0, 77, 0, 76, 0, 0, 0, 75, 0, 76, 0];
      const m = M[s % 32]; if (m) bell(m, t, 0.05, 3);
      if (b === 4 || b === 6) piano(P[bar][(b / 2) % 3] + 12, t, 0.025);
    } },
    mansion: { bpm: 80, fn(s, t, d) {
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const P = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]];
      const ch = P[bar];
      if (b === 0) { pad(ch, t, d * 8, 0.06, 700); bass(ch[0] - 12, t, d * 8, 0.1); }
      const pat = [0, 1, 2, 1, 2, 1, 0, 2];
      bell(ch[pat[b]] + 24, t, 0.018, 1.2);
      const M = [0, 0, 74, 0, 0, 0, 72, 0, 0, 0, 70, 0, 69, 0, 0, 0, 0, 0, 67, 0, 69, 0, 70, 0, 0, 0, 69, 0, 0, 0, 0, 0];
      const m = M[s % 32]; if (m) bell(m + 12, t, 0.035, 2.5);
      if (b % 2 === 0) tick(t, b % 4 === 0, 0.022);
    } },
    investigate: { bpm: 100, fn(s, t, d) {
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const BL = [[45, 0, 52, 0, 48, 0, 52, 51], [45, 0, 52, 0, 50, 0, 52, 0], [41, 0, 48, 0, 45, 0, 48, 0], [40, 0, 47, 0, 44, 0, 47, 46]];
      const n = BL[bar][b]; if (n) pluck(n - 12, t, 0.13, 0.45);
      tick(t, b % 2 === 0, b % 2 === 0 ? 0.03 : 0.015);
      if (b === 0) pad([[57, 60, 64], [57, 62, 65], [53, 57, 60], [52, 56, 59]][bar], t, d * 8, 0.035, 600);
      const M = [0, 0, 76, 0, 0, 0, 72, 0, 0, 74, 0, 0, 71, 0, 0, 0, 0, 0, 72, 0, 0, 0, 69, 0, 71, 0, 0, 68, 0, 0, 0, 0];
      const m = M[s % 32]; if (m) bell(m, t, 0.03, 1.4);
    } },
    tension: { bpm: 60, fn(s, t, d) {
      const b = s % 16;
      if (b === 0) { pad([45, 46, 52], t, d * 16, 0.07, 500); bass(33, t, d * 16, 0.1); }
      if (b % 4 === 0) heart(t, 0.18);
      if (s % 32 === 10) bell(82, t, 0.025, 4);
      if (s % 32 === 26) bell(81, t, 0.02, 4);
    } },
    deduction: { bpm: 138, fn(s, t, d) {
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const R = [50, 46, 48, 45];
      const C = [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64]];
      const r = R[bar];
      bass(r - 12 + [0, 0, 12, 0, 0, 12, 0, 10][b], t, d * 0.9, 0.13);
      if (b === 0 || b === 3 || b === 4) kick(t, 0.22);
      if (b === 2 || b === 6) snare(t, 0.08);
      hat(t, b % 2 ? 0.015 : 0.03);
      if (b === 0) pad(C[bar], t, d * 7.5, 0.06, 1800);
      const M = [74, 0, 0, 72, 74, 0, 77, 0, 70, 0, 0, 69, 70, 0, 74, 0, 72, 0, 0, 71, 72, 0, 76, 0, 73, 0, 76, 0, 79, 0, 81, 0];
      const m = M[s % 32]; if (m) pluck(m, t, 0.06, 0.4);
    } },
    truth: { bpm: 66, fn(s, t, d) {
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const P = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]];
      const ch = P[bar], pat = [0, 1, 2, 1, 2, 1, 2, 1];
      piano(ch[pat[b]], t, 0.035, 1.8);
      if (b === 0) { piano(ch[0] - 12, t, 0.06, 3); pad(ch, t, d * 8, 0.03, 600); }
      const M = [76, 0, 0, 0, 0, 0, 74, 72, 72, 0, 0, 0, 0, 0, 71, 69, 71, 0, 0, 0, 72, 0, 74, 0, 71, 0, 0, 0, 0, 0, 0, 0];
      const m = M[s % 32]; if (m) piano(m + 12, t, 0.04, 2.6);
    } },
    ending: { bpm: 84, fn(s, t, d) {
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const P = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];
      const ch = P[bar], pat = [0, 1, 2, 1, 0, 1, 2, 1];
      piano(ch[pat[b]] + 12, t, 0.03, 1.6);
      if (b === 0) { piano(ch[0] - 12, t, 0.06, 3); pad(ch, t, d * 8, 0.04, 900); }
      const M = [76, 0, 0, 79, 0, 0, 77, 76, 74, 0, 0, 0, 71, 0, 0, 0, 72, 0, 0, 76, 0, 0, 79, 0, 77, 0, 76, 0, 74, 0, 0, 0];
      const m = M[s % 32]; if (m) bell(m + 12, t, 0.03, 2.2);
    } },
    c_title: { bpm: 96, fn(s, t, d) {
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const P = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]];
      const ch = P[bar];
      if (b === 0) { pad(ch, t, d * 8, 0.07, 1400); bass(ch[0] - 24, t, d * 8, 0.12); }
      synth(ch[[0, 1, 2, 1, 2, 1, 0, 2][b]] + 12, t, d * 0.9, 0.022, 'square', 1800);
      if (b % 2 === 0) hat(t, 0.012);
      if (b === 0 || b === 4) kick(t, 0.14);
      const M = [76, 0, 0, 79, 0, 0, 76, 0, 74, 0, 0, 0, 72, 0, 71, 0, 72, 0, 0, 76, 0, 0, 79, 0, 81, 0, 79, 0, 76, 0, 0, 0];
      const m = M[s % 32]; if (m) synth(m, t, d * 2.2, 0.035, 'sawtooth', 3000);
    } },
    c_explore: { bpm: 88, fn(s, t, d) {
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const P = [[50, 53, 57, 60], [46, 50, 53, 57], [48, 52, 55, 59], [45, 48, 52, 55]];
      const ch = P[bar];
      if (b === 0) { pad(ch, t, d * 8, 0.05, 900); bass(ch[0] - 12, t, d * 4, 0.11); }
      if (b === 4) bass(ch[0] - 12, t, d * 4, 0.09);
      synth(ch[(b * 3) % 4] + 24, t, d * 0.6, 0.016, 'triangle', 2600);
      if (b % 2 === 1) hat(t, 0.01);
      if (b === 2 || b === 6) tick(t, true, 0.02);
    } },
    c_tension: { bpm: 70, fn(s, t, d) {
      const b = s % 16;
      if (b === 0) { pad([38, 45, 51], t, d * 16, 0.07, 600); bass(26, t, d * 16, 0.12); }
      if (b % 4 === 0) heart(t, 0.16);
      if (s % 2 === 0) synth(74 + (s % 32 === 12 ? 1 : 0), t, d * 0.3, 0.008, 'square', 1500);
      if (s % 32 === 20) bell(85, t, 0.02, 3);
    } },
    c_battle: { bpm: 150, fn(s, t, d) {
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const R = [45, 41, 43, 40];
      const r = R[bar];
      bass(r - 12 + [0, 12, 0, 12, 0, 12, 10, 12][b], t, d * 0.8, 0.12);
      if (b === 0 || b === 4) kick(t, 0.24); if (b === 2 || b === 6) snare(t, 0.09); hat(t, b % 2 ? 0.014 : 0.026);
      if (b === 0) pad([r + 12, r + 15, r + 19], t, d * 7, 0.05, 2200);
      const M = [69, 0, 72, 0, 76, 0, 74, 72, 69, 0, 72, 0, 77, 0, 76, 74, 67, 0, 71, 0, 74, 0, 72, 71, 68, 0, 71, 0, 76, 0, 74, 0];
      const m = M[s % 32]; if (m) synth(m, t, d * 0.9, 0.03, 'square', 2600);
    } },
    c_boss: { bpm: 160, fn(s, t, d) {
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const R = [38, 38, 36, 37];
      const r = R[bar];
      bass(r - 12 + [0, 0, 12, 0, 0, 12, 0, 13][b], t, d * 0.8, 0.14);
      if (b % 2 === 0) kick(t, 0.26); if (b === 4) snare(t, 0.11); hat(t, 0.02);
      if (b === 0) pad([r + 12, r + 13, r + 19], t, d * 7, 0.06, 1800);
      const M = [74, 0, 73, 74, 77, 0, 76, 0, 74, 0, 73, 74, 70, 0, 69, 0, 74, 0, 73, 74, 77, 0, 80, 0, 81, 0, 80, 77, 76, 0, 73, 0];
      const m = M[s % 32]; if (m) synth(m, t, d * 0.8, 0.032, 'sawtooth', 3200);
    } },
    c_debate: { bpm: 142, fn(s, t, d) {
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const R = [50, 46, 48, 45], C = [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64]];
      bass(R[bar] - 12 + [0, 0, 12, 0, 0, 12, 0, 10][b], t, d * 0.85, 0.13);
      if (b === 0 || b === 3 || b === 4) kick(t, 0.22); if (b === 2 || b === 6) snare(t, 0.08); hat(t, b % 2 ? 0.014 : 0.028);
      if (b === 0) pad(C[bar], t, d * 7.5, 0.05, 2400);
      synth(C[bar][b % 3] + 12, t, d * 0.5, 0.012, 'square', 2200);
      const M = [74, 0, 0, 72, 74, 0, 77, 0, 70, 0, 0, 69, 70, 0, 74, 0, 72, 0, 0, 71, 72, 0, 76, 0, 73, 0, 76, 0, 79, 0, 81, 0];
      const m = M[s % 32]; if (m) synth(m, t, d * 0.8, 0.03, 'sawtooth', 3000);
    } },
    c_ending: { bpm: 84, fn(s, t, d) {
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const P = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]];
      const ch = P[bar];
      if (b === 0) { pad(ch, t, d * 8, 0.05, 1200); bass(ch[0] - 24, t, d * 8, 0.1); }
      synth(ch[[0, 1, 2, 3, 2, 1, 2, 3][b]] + 12, t, d * 1.2, 0.016, 'triangle', 3000);
      const M = [76, 0, 0, 79, 0, 0, 77, 76, 74, 0, 0, 0, 72, 0, 0, 0, 72, 0, 0, 76, 0, 0, 79, 0, 83, 0, 81, 0, 79, 0, 0, 0];
      const m = M[s % 32]; if (m) bell(m + 12, t, 0.03, 2.4);
    } },
    /* ---- 怪盗と宝玉編 ---- */
    t_title: { bpm: 132, fn(s, t, d) {  // 三拍子の暗いワルツ
      const bar = Math.floor(s / 6) % 4, b = s % 6;
      const P = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]];
      const ch = P[bar];
      if (b === 0) { bass(ch[0] - 12, t, d * 2, 0.13); pad(ch, t, d * 6, 0.045, 700); }
      if (b === 2 || b === 4) { piano(ch[1], t, 0.026, 0.8); piano(ch[2], t, 0.022, 0.8); }
      const M = [74, 0, 0, 0, 77, 76, 74, 0, 0, 0, 70, 0, 72, 0, 0, 0, 70, 69, 69, 0, 0, 0, 0, 0];
      const m = M[s % 24]; if (m) bell(m, t, 0.04, 2.6);
      if (s % 48 === 45) bell(86, t, 0.018, 4);
    } },
    t_explore: { bpm: 96, fn(s, t, d) {  // ノワール・ジャズ風
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const W = [[38, 41, 45, 48, 50, 48, 45, 41], [43, 46, 50, 53, 55, 53, 50, 46], [36, 40, 43, 46, 48, 46, 43, 40], [45, 49, 52, 55, 57, 55, 52, 49]];
      if (b % 2 === 0) pluck(W[bar][b] - 12, t, 0.12, 0.5);
      if (b % 2 === 1) hat(t, 0.012); else tick(t, b === 0, 0.016);
      if (b === 0) pad([[62, 65, 69, 72], [67, 70, 74, 77], [60, 64, 67, 70], [61, 64, 67, 69]][bar], t, d * 8, 0.028, 1100);
      const M = [0, 0, 74, 0, 72, 0, 69, 0, 0, 0, 70, 69, 67, 0, 0, 0, 0, 0, 72, 0, 70, 0, 67, 0, 69, 0, 0, 0, 0, 0, 0, 0];
      const m = M[s % 32]; if (m) piano(m, t, 0.03, 1.4);
    } },
    t_clock: { bpm: 120, fn(s, t, d) {  // 刻まれる秒針
      const b = s % 16;
      tick(t, b % 2 === 0, b % 2 === 0 ? 0.035 : 0.02);
      if (b === 0) { pad([38, 44, 50], t, d * 16, 0.06, 520); bass(26, t, d * 16, 0.12); }
      if (b % 8 === 0) heart(t, 0.14);
      if (s % 32 === 6) bell(81, t, 0.02, 3); if (s % 32 === 22) bell(80, t, 0.02, 3);
    } },
    t_sad: { bpm: 56, fn(s, t, d) {  // 喪失
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const P = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 55, 59]];
      const ch = P[bar], pat = [0, 1, 2, 1, 2, 1, 0, 1];
      piano(ch[pat[b]], t, 0.03, 2.2);
      if (b === 0) { piano(ch[0] - 12, t, 0.055, 3.5); pad(ch, t, d * 8, 0.025, 500); }
      const M = [72, 0, 0, 0, 71, 0, 69, 0, 69, 0, 0, 0, 0, 0, 0, 0, 65, 0, 0, 67, 69, 0, 0, 0, 68, 0, 0, 0, 0, 0, 0, 0];
      const m = M[s % 32]; if (m) piano(m + 12, t, 0.035, 3);
    } },
    /* ---- 空の名探偵編 ---- */
    s_title: { bpm: 92, fn(s, t, d) {  // 夜間飛行：澄んだワルツ風
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const P = [[64, 67, 71, 74], [60, 64, 67, 71], [62, 65, 69, 72], [59, 62, 67, 71]];
      const ch = P[bar];
      if (b === 0) { pad(ch, t, d * 8, 0.04, 1600); bass(ch[0] - 24, t, d * 8, 0.1); }
      bell(ch[[0, 2, 1, 3, 2, 1, 3, 2][b]] + 12, t, 0.016, 1.4);
      const M = [79, 0, 0, 78, 76, 0, 74, 0, 72, 0, 0, 0, 71, 0, 72, 74, 74, 0, 0, 76, 77, 0, 79, 0, 78, 0, 0, 0, 0, 0, 0, 0];
      const m = M[s % 32]; if (m) piano(m, t, 0.04, 2.2);
    } },
    s_explore: { bpm: 104, fn(s, t, d) {  // 機内：軽やかなスウィング
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const W = [[43, 47, 50, 52], [48, 52, 55, 57], [45, 48, 52, 55], [50, 54, 57, 60]];
      if (b % 2 === 0) pluck(W[bar][b / 2] - 12, t, 0.12, 0.45);
      if (b % 2 === 1) hat(t, 0.012); else tick(t, b % 4 === 0, 0.014);
      if (b === 0) pad([[67, 71, 74, 78], [72, 76, 79, 83], [69, 72, 76, 79], [74, 78, 81, 84]][bar], t, d * 8, 0.022, 1500);
      const M = [0, 0, 79, 0, 81, 0, 79, 76, 0, 0, 74, 0, 76, 0, 0, 0, 0, 0, 72, 0, 74, 0, 76, 79, 0, 0, 78, 0, 0, 0, 0, 0];
      const m = M[s % 32]; if (m) bell(m, t, 0.026, 1.2);
    } },
    s_battle: { bpm: 156, fn(s, t, d) {
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const R = [40, 40, 36, 38];
      const r = R[bar];
      bass(r - 12 + [0, 0, 12, 0, 0, 12, 0, 10][b], t, d * 0.8, 0.14);
      if (b % 2 === 0) kick(t, 0.24); if (b === 4) snare(t, 0.11); hat(t, b % 2 ? 0.014 : 0.024);
      if (b === 0) pad([r + 12, r + 15, r + 19], t, d * 7, 0.05, 2000);
      const M = [76, 0, 74, 76, 79, 0, 76, 0, 74, 0, 72, 74, 71, 0, 67, 0, 76, 0, 74, 76, 79, 0, 83, 0, 81, 0, 79, 76, 78, 0, 75, 0];
      const m = M[s % 32]; if (m) synth(m, t, d * 0.8, 0.03, 'square', 2800);
    } },
    s_ending: { bpm: 80, fn(s, t, d) {
      const bar = Math.floor(s / 8) % 4, b = s % 8;
      const P = [[67, 71, 74], [64, 67, 71], [60, 64, 67], [62, 66, 69]];
      const ch = P[bar], pat = [0, 1, 2, 1, 0, 1, 2, 1];
      piano(ch[pat[b]], t, 0.03, 1.8);
      if (b === 0) { piano(ch[0] - 12, t, 0.055, 3); pad(ch, t, d * 8, 0.035, 1100); }
      const M = [79, 0, 0, 81, 79, 0, 76, 0, 74, 0, 0, 0, 76, 0, 79, 0, 76, 0, 0, 74, 72, 0, 71, 0, 72, 0, 74, 0, 0, 0, 0, 0];
      const m = M[s % 32]; if (m) bell(m + 12, t, 0.028, 2.4);
    } },
  };

  function schedule() {
    if (!track || !ac) return;
    const sd = 60 / track.bpm / 2;
    while (nextT < ac.currentTime + 0.2) {
      try { track.fn(stepN, nextT, sd); } catch (e) { console.warn(e); }
      nextT += sd; stepN++;
    }
  }
  function bgm(name) {
    if (!ac) { trackName = name; return; }
    if (trackName === name && track) return;
    trackName = name;
    if (trackGain) {
      const g = trackGain; g.gain.setTargetAtTime(0.0001, ac.currentTime, 0.4);
      setTimeout(() => { try { g.disconnect(); } catch (e) {} }, 3000);
    }
    clearInterval(seqTimer); track = null; trackGain = null;
    if (!name || !TRACKS[name]) return;
    trackGain = ac.createGain(); trackGain.gain.value = 0.0001; trackGain.connect(busMusic);
    trackGain.gain.setTargetAtTime(1, ac.currentTime + 0.05, 0.6);
    track = TRACKS[name]; stepN = 0; nextT = ac.currentTime + 0.12;
    seqTimer = setInterval(schedule, 40); schedule();
  }
  function resumeBgm() { const n = trackName; trackName = null; if (n) bgm(n); }

  /* ---------------- ambience ---------------- */
  function rain(level) {
    if (!ac) return;
    if (!rainNodes) {
      const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
      const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 400;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
      const g = ac.createGain(); g.gain.value = 0;
      const s2 = ac.createBufferSource(); s2.buffer = noiseBuf; s2.loop = true; s2.playbackRate.value = 0.5;
      const lp2 = ac.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 300;
      const g2 = ac.createGain(); g2.gain.value = 0.5;
      s.connect(hp); hp.connect(lp); lp.connect(g); s2.connect(lp2); lp2.connect(g2); g2.connect(g); g.connect(busAmb);
      s.start(); s2.start();
      rainNodes = { g };
    }
    rainNodes.g.gain.setTargetAtTime(level * 0.1, ac.currentTime, 1.2);
  }

  let humNodes = null;
  function hum(level) {
    if (!ac) return;
    if (!humNodes) {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = 55;
      const o2 = ac.createOscillator(); o2.type = 'sine'; o2.frequency.value = 110.6;
      const s2 = ac.createBufferSource(); s2.buffer = noiseBuf; s2.loop = true;
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 4;
      const ng = ac.createGain(); ng.gain.value = 0.15;
      const g = ac.createGain(); g.gain.value = 0;
      o.connect(g); o2.connect(g); s2.connect(bp); bp.connect(ng); ng.connect(g); g.connect(busAmb);
      o.start(); o2.start(); s2.start();
      humNodes = { g };
    }
    humNodes.g.gain.setTargetAtTime(level * 0.05, ac.currentTime, 1.0);
  }

  /* ---------------- SFX ---------------- */
  const SFX = {
    blip(p = 1) { const t = ac.currentTime; osc(t, 520 * p + Math.random() * 30, 0.035, { type: 'square', gain: 0.018, filter: 1800 }); },
    cursor() { const t = ac.currentTime; osc(t, 1300, 0.04, { type: 'sine', gain: 0.05 }); },
    ok() { const t = ac.currentTime; osc(t, 880, 0.09, { gain: 0.07 }); osc(t + 0.05, 1320, 0.12, { gain: 0.05 }); },
    cancel() { const t = ac.currentTime; osc(t, 660, 0.08, { gain: 0.06 }); osc(t + 0.05, 440, 0.1, { gain: 0.05 }); },
    page() { const t = ac.currentTime; noise(t, 0.18, { type: 'bandpass', freq: 3000, q: 0.6, gain: 0.08, sweep: 900, attack: 0.03 }); },
    clue() { const t = ac.currentTime; [72, 76, 79, 84, 88].forEach((m, i) => osc(t + i * 0.07, mtof(m), 1.2, { gain: 0.06, send: 0.6 })); noise(t, 0.5, { type: 'highpass', freq: 6000, gain: 0.04, attack: 0.2 }); },
    present() { const t = ac.currentTime; noise(t, 0.35, { type: 'bandpass', freq: 600, q: 0.7, gain: 0.25, sweep: 5000, attack: 0.15 }); [62, 69, 74, 78].forEach(m => osc(t + 0.3, mtof(m), 0.9, { type: 'sawtooth', gain: 0.05, filter: 2500, send: 0.4 })); osc(t + 0.3, 70, 0.4, { to: 35, gain: 0.35 }); },
    sting() { const t = ac.currentTime; [38, 44, 50, 51].forEach(m => osc(t, mtof(m), 2.2, { type: 'sawtooth', gain: 0.06, filter: 900, send: 0.6 })); osc(t, 90, 0.5, { to: 30, gain: 0.4 }); noise(t, 1.5, { freq: 300, gain: 0.15 }); },
    wrong() { const t = ac.currentTime; osc(t, 196, 0.18, { type: 'square', gain: 0.05, filter: 900 }); osc(t + 0.16, 147, 0.32, { type: 'square', gain: 0.05, filter: 900 }); },
    crash() {
      const t = ac.currentTime;
      noise(t, 0.6, { freq: 5000, sweep: 400, gain: 0.5 }); osc(t, 120, 0.3, { to: 40, gain: 0.4 });
      for (let i = 0; i < 14; i++) osc(t + Math.random() * 0.35, 2200 + Math.random() * 4000, 0.15 + Math.random() * 0.4, { gain: 0.03 + Math.random() * 0.03, send: 0.3 });
    },
    thunder(dist = 1) {
      const t = ac.currentTime;
      noise(t, 0.25, { type: 'highpass', freq: 1800, gain: 0.25 * dist });
      noise(t + 0.05, 3.5, { type: 'lowpass', freq: 380, sweep: 60, gain: 0.7 * dist, attack: 0.08, rate: 0.6 });
      noise(t + 0.3, 2.5, { type: 'lowpass', freq: 160, gain: 0.5 * dist, attack: 0.4, rate: 0.4 });
    },
    knock() { const t = ac.currentTime; [0, 0.22].forEach(d => { osc(t + d, 180, 0.12, { to: 90, gain: 0.25 }); noise(t + d, 0.05, { type: 'bandpass', freq: 900, gain: 0.15 }); }); },
    door() { const t = ac.currentTime; osc(t, 300, 0.5, { type: 'sawtooth', to: 520, gain: 0.025, filter: 1400 }); osc(t + 0.45, 90, 0.2, { to: 50, gain: 0.25 }); noise(t + 0.45, 0.1, { freq: 600, gain: 0.12 }); },
    step() { const t = ac.currentTime; noise(t, 0.06, { freq: 500 + Math.random() * 200, gain: 0.05 }); },
    strike() { const t = ac.currentTime; osc(t, 110, 0.4, { to: 30, gain: 0.5 }); noise(t, 0.25, { freq: 900, gain: 0.4 }); },
    chime() { const t = ac.currentTime; bellSe(64, t, 0.12); bellSe(52, t, 0.08); },
    heart() { const t = ac.currentTime; osc(t, 70, 0.16, { to: 40, gain: 0.3 }); osc(t + 0.2, 65, 0.18, { to: 38, gain: 0.22 }); },
    whoosh() { const t = ac.currentTime; noise(t, 0.5, { type: 'bandpass', freq: 400, q: 0.8, gain: 0.18, sweep: 3500, attack: 0.2 }); },
    gavel() { const t = ac.currentTime; osc(t, 200, 0.12, { to: 80, gain: 0.4 }); noise(t, 0.08, { type: 'bandpass', freq: 1500, gain: 0.3 }); },
    zap() { const t = ac.currentTime; osc(t, 1800, 0.18, { type: 'sawtooth', to: 200, gain: 0.08, filter: 4000 }); noise(t, 0.12, { type: 'highpass', freq: 3000, gain: 0.08 }); },
    hit() { const t = ac.currentTime; osc(t, 220, 0.15, { type: 'square', to: 60, gain: 0.12, filter: 1500 }); noise(t, 0.1, { freq: 1200, gain: 0.2 }); },
    crit() { const t = ac.currentTime; osc(t, 2400, 0.25, { type: 'sawtooth', to: 300, gain: 0.08, filter: 5000 }); osc(t + 0.05, 90, 0.35, { to: 30, gain: 0.4 }); noise(t, 0.3, { freq: 2500, gain: 0.25 }); },
    hurt() { const t = ac.currentTime; osc(t, 160, 0.25, { type: 'square', to: 50, gain: 0.12, filter: 900 }); noise(t, 0.2, { freq: 600, gain: 0.25 }); },
    heal() { const t = ac.currentTime; [67, 71, 74, 79].forEach((m, i) => osc(t + i * 0.06, mtof(m), 0.5, { gain: 0.05, send: 0.5 })); },
    shield() { const t = ac.currentTime; osc(t, 300, 0.5, { type: 'triangle', to: 900, gain: 0.07 }); noise(t, 0.4, { type: 'bandpass', freq: 2000, gain: 0.06, sweep: 6000 }); },
    glitch() { const t = ac.currentTime; for (let i = 0; i < 6; i++) osc(t + i * 0.03, 200 + Math.random() * 2000, 0.04, { type: 'square', gain: 0.04 }); },
    charge() { const t = ac.currentTime; osc(t, 100, 1.0, { type: 'sawtooth', to: 900, gain: 0.05, filter: 2000 }); },
    victory() { const t = ac.currentTime; [72, 76, 79, 84, 79, 84, 88].forEach((m, i) => osc(t + i * 0.09, mtof(m), 0.5, { type: 'square', gain: 0.035, filter: 3000, send: 0.4 })); },
    gameover() { const t = ac.currentTime; [64, 60, 57, 52].forEach((m, i) => osc(t + i * 0.35, mtof(m), 1.2, { type: 'triangle', gain: 0.07, send: 0.6 })); osc(t, 80, 2.5, { to: 30, gain: 0.25 }); },
    dive() { const t = ac.currentTime; noise(t, 1.6, { type: 'bandpass', freq: 200, q: 1, gain: 0.3, sweep: 8000, attack: 1.0 }); osc(t, 60, 1.6, { type: 'sawtooth', to: 1800, gain: 0.05, filter: 4000 }); },
    ice() { const t = ac.currentTime; for (let i = 0; i < 5; i++) osc(t + i * 0.05, 2800 + Math.random() * 1500, 0.25, { gain: 0.03, send: 0.5 }); },
  };
  function bellSe(m, t, gain) {
    [[1, 1], [2.4, 0.4], [5.1, 0.12]].forEach(([r, a]) => osc(t, mtof(m) * r, 4.5 / r, { gain: gain * a, send: 0.6 }));
  }
  function se(name, ...a) { if (!ac || !SFX[name]) return; try { SFX[name](...a); } catch (e) { console.warn(e); } }

  return { init, bgm, resumeBgm, rain, hum, se, setVol, vol, get ready() { return !!ac; } };
})();
