// MetronomeEngine.js — Web Audio lookahead scheduler with oscillator-synthesized sounds.
// Plain ES module. No external dependencies. Used by MetronomeApp.dc.html.

export class MetronomeEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noiseBuffer = null;

    // config
    this.bpm = 120;
    this.beatsPerBar = 4;
    this.subdiv = 1;            // notes per beat (1,2,3,4)
    this.sound = 'click';
    this.accentFirst = true;
    this.beatStates = ['accent', 'normal', 'normal', 'normal']; // per-beat: accent|normal|mute
    this.volume = 0.9;

    // runtime
    this.playing = false;
    this.beatPtr = 0;
    this.subPtr = 0;
    this.nextNoteTime = 0;
    this.scheduleAhead = 0.12;  // seconds
    this.lookahead = 25;        // ms
    this.timer = null;
    this.barCount = 0;

    // callbacks
    this.onBeat = null;         // (beatIndex, subIndex, isDownbeat, type)
  }

  _ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
    // white noise buffer for hats / rim
    const len = Math.floor(this.ctx.sampleRate * 0.4);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.value = v;
  }

  // --- synth voices -------------------------------------------------------
  _tone(time, freq, dur, type, peak) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(peak, time + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  _noise(time, dur, peak, hp) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filt = ctx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = hp;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.connect(filt);
    filt.connect(g);
    g.connect(this.master);
    src.start(time);
    src.stop(time + dur + 0.02);
  }

  // kind: 'accent' | 'beat' | 'sub'
  _voice(time, kind) {
    const accent = kind === 'accent';
    const sub = kind === 'sub';
    const vol = accent ? 1.0 : sub ? 0.32 : 0.62;
    switch (this.sound) {
      case 'woodblock': {
        const f = accent ? 1280 : sub ? 1500 : 1000;
        this._tone(time, f, 0.045, 'triangle', 0.5 * vol);
        this._tone(time, f * 1.5, 0.03, 'triangle', 0.18 * vol);
        break;
      }
      case 'hihat': {
        this._noise(time, sub ? 0.025 : 0.05, 0.5 * vol, accent ? 7000 : 9000);
        break;
      }
      case 'rim': {
        this._tone(time, accent ? 480 : 400, 0.03, 'square', 0.28 * vol);
        this._noise(time, 0.02, 0.35 * vol, 3000);
        break;
      }
      case 'cowbell': {
        this._tone(time, accent ? 840 : 800, 0.09, 'square', 0.3 * vol);
        this._tone(time, accent ? 560 : 540, 0.09, 'square', 0.3 * vol);
        break;
      }
      case 'click':
      default: {
        const f = accent ? 1500 : sub ? 1400 : 1000;
        this._tone(time, f, sub ? 0.022 : 0.035, 'sine', 0.6 * vol);
        break;
      }
    }
  }

  // --- scheduler ----------------------------------------------------------
  _scheduleNote(time) {
    const beat = this.beatPtr;
    const sub = this.subPtr;
    const isDownbeat = sub === 0;
    const state = this.beatStates[beat] || 'normal';

    if (state !== 'mute') {
      if (isDownbeat) {
        const accent = state === 'accent' || (beat === 0 && this.accentFirst);
        this._voice(time, accent ? 'accent' : 'beat');
      } else {
        this._voice(time, 'sub');
      }
    }

    // visual callback at the audio time
    if (this.onBeat) {
      const delay = Math.max(0, (time - this.ctx.currentTime) * 1000);
      const type = state === 'mute' ? 'mute'
        : (state === 'accent' || (beat === 0 && this.accentFirst)) ? 'accent' : 'normal';
      setTimeout(() => {
        if (this.playing) this.onBeat(beat, sub, isDownbeat, type);
      }, delay);
    }
  }

  _advance() {
    const spb = 60.0 / this.bpm;
    const sps = spb / this.subdiv;
    this.nextNoteTime += sps;
    this.subPtr++;
    if (this.subPtr >= this.subdiv) {
      this.subPtr = 0;
      this.beatPtr++;
      if (this.beatPtr >= this.beatsPerBar) {
        this.beatPtr = 0;
        this.barCount++;
      }
    }
  }

  _tick() {
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAhead) {
      this._scheduleNote(this.nextNoteTime);
      this._advance();
    }
    this.timer = setTimeout(() => this._tick(), this.lookahead);
  }

  start() {
    this._ensure();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.playing) return;
    this.playing = true;
    this.beatPtr = 0;
    this.subPtr = 0;
    this.barCount = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.08;
    this._tick();
  }

  stop() {
    this.playing = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  toggle() {
    if (this.playing) this.stop(); else this.start();
    return this.playing;
  }

  preview() {
    this._ensure();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this._voice(this.ctx.currentTime + 0.01, 'beat');
  }

  setBeatsPerBar(n) {
    this.beatsPerBar = n;
    const next = [];
    for (let i = 0; i < n; i++) {
      next.push(this.beatStates[i] || (i === 0 ? 'accent' : 'normal'));
    }
    this.beatStates = next;
    if (this.beatPtr >= n) this.beatPtr = 0;
  }
}
