export type SoundName = 'click' | 'woodblock' | 'hihat' | 'rim' | 'cowbell';
export type BeatState = 'accent' | 'normal' | 'mute';

export class MetronomeEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  noiseBuffer: AudioBuffer | null = null;

  bpm = 120;
  beatsPerBar = 4;
  subdiv = 1;
  sound: SoundName = 'click';
  accentFirst = true;
  beatStates: BeatState[] = ['accent', 'normal', 'normal', 'normal'];
  volume = 0.9;

  playing = false;
  beatPtr = 0;
  subPtr = 0;
  nextNoteTime = 0;
  scheduleAhead = 0.12;
  lookahead = 25;
  timer: ReturnType<typeof setTimeout> | null = null;
  barCount = 0;

  onBeat: ((beatIndex: number, subIndex: number, isDownbeat: boolean, type: BeatState) => void) | null = null;

  private _ensure(): void {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
    const len = Math.floor(this.ctx.sampleRate * 0.4);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;
  }

  setVolume(v: number): void {
    this.volume = v;
    if (this.master) this.master.gain.value = v;
  }

  private _tone(time: number, freq: number, dur: number, type: OscillatorType, peak: number): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(peak, time + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(g);
    g.connect(this.master!);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private _noise(time: number, dur: number, peak: number, hp: number): void {
    const ctx = this.ctx!;
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
    g.connect(this.master!);
    src.start(time);
    src.stop(time + dur + 0.02);
  }

  private _voice(time: number, kind: 'accent' | 'beat' | 'sub'): void {
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

  private _scheduleNote(time: number): void {
    const beat = this.beatPtr;
    const sub = this.subPtr;
    const isDownbeat = sub === 0;
    const state = this.beatStates[beat] || 'normal';

    if (state !== 'mute') {
      if (isDownbeat) {
        this._voice(time, state === 'accent' ? 'accent' : 'beat');
      } else {
        this._voice(time, 'sub');
      }
    }

    if (this.onBeat) {
      const delay = Math.max(0, (time - this.ctx!.currentTime) * 1000);
      const type: BeatState = state;
      setTimeout(() => {
        if (this.playing) this.onBeat?.(beat, sub, isDownbeat, type);
      }, delay);
    }
  }

  private _advance(): void {
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

  private _tick(): void {
    while (this.nextNoteTime < this.ctx!.currentTime + this.scheduleAhead) {
      this._scheduleNote(this.nextNoteTime);
      this._advance();
    }
    this.timer = setTimeout(() => this._tick(), this.lookahead);
  }

  start(): void {
    this._ensure();
    if (this.ctx!.state === 'suspended') this.ctx!.resume();
    if (this.playing) return;
    this.playing = true;
    this.beatPtr = 0;
    this.subPtr = 0;
    this.barCount = 0;
    this.nextNoteTime = this.ctx!.currentTime + 0.08;
    this._tick();
  }

  stop(): void {
    this.playing = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  toggle(): boolean {
    if (this.playing) this.stop(); else this.start();
    return this.playing;
  }

  preview(): void {
    this._ensure();
    if (this.ctx!.state === 'suspended') this.ctx!.resume();
    this._voice(this.ctx!.currentTime + 0.01, 'beat');
  }

  setBeatsPerBar(n: number): void {
    this.beatsPerBar = n;
    const next: BeatState[] = [];
    for (let i = 0; i < n; i++) {
      next.push(this.beatStates[i] || (i === 0 ? 'accent' : 'normal'));
    }
    this.beatStates = next;
    if (this.beatPtr >= n) this.beatPtr = 0;
  }
}
