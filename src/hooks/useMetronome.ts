import { useCallback, useEffect, useRef, useState } from 'react';
import { MetronomeEngine } from '../audio/MetronomeEngine';
import type { BeatState, SoundName } from '../audio/MetronomeEngine';
import type { ScreenId } from '../types';
import { MIN_BPM, MAX_BPM } from '../types';

export function useMetronome() {
  const [bpm, setBpmState] = useState(120);
  const [playing, setPlaying] = useState(false);
  const [beatsPerBar, setBeatsPerBarState] = useState(4);
  const [noteValue, setNoteValueState] = useState(4);
  const [subdiv, setSubdivState] = useState(1);
  const [sound, setSoundState] = useState<SoundName>('click');
  const [beatStates, setBeatStatesState] = useState<BeatState[]>(['accent', 'normal', 'normal', 'normal']);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [volume, setVolumeState] = useState(0.9);
  const [screen, setScreen] = useState<ScreenId>('tempo');
  const [countIn, setCountInState] = useState(1);
  const [ramp, setRampState] = useState(false);
  const [rampEnd, setRampEndState] = useState(160);
  const [rampStep, setRampStepState] = useState(2);
  const [rampBars, setRampBarsState] = useState(2);
  const [barsPlayed, setBarsPlayed] = useState(0);

  const engineRef = useRef<MetronomeEngine | null>(null);
  const rampedAtRef = useRef(0);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      const e = new MetronomeEngine();
      e.onBeat = (beat) => setCurrentBeat(beat);
      engineRef.current = e;
    }
    return engineRef.current;
  }, []);

  // Poll bar count and apply ramp
  useEffect(() => {
    const poll = setInterval(() => {
      const e = engineRef.current;
      if (!e || !e.playing) return;
      const bars = e.barCount;
      setBarsPlayed(bars);

      // Read current ramp state from refs to avoid stale closures
      // We'll use the engine's bpm and the state for ramp config
    }, 200);
    return () => clearInterval(poll);
  }, []);

  // Separate effect for ramp logic to avoid stale closures
  useEffect(() => {
    const poll = setInterval(() => {
      const e = engineRef.current;
      if (!e || !e.playing || !ramp) return;
      const bars = e.barCount;
      if (bars > 0 && bars % rampBars === 0 && bars !== rampedAtRef.current && bpm < rampEnd) {
        rampedAtRef.current = bars;
        const newBpm = Math.min(rampEnd, bpm + rampStep);
        e.bpm = newBpm;
        setBpmState(newBpm);
      }
    }, 200);
    return () => clearInterval(poll);
  }, [ramp, rampBars, rampStep, rampEnd, bpm]);

  const setBpm = useCallback((v: number) => {
    v = Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(v)));
    const e = getEngine();
    e.bpm = v;
    setBpmState(v);
  }, [getEngine]);

  const nudge = useCallback((d: number) => {
    setBpmState(prev => {
      const v = Math.max(MIN_BPM, Math.min(MAX_BPM, prev + d));
      const e = engineRef.current;
      if (e) e.bpm = v;
      return v;
    });
  }, []);

  const togglePlay = useCallback(() => {
    const e = getEngine();
    const nowPlaying = e.toggle();
    if (nowPlaying) rampedAtRef.current = 0;
    setPlaying(nowPlaying);
    setCurrentBeat(nowPlaying ? 0 : -1);
    if (nowPlaying) setBarsPlayed(0);
  }, [getEngine]);

  const setSig = useCallback((n: number, v: number) => {
    const e = getEngine();
    e.setBeatsPerBar(n);
    setBeatStatesState(e.beatStates.slice());
    setBeatsPerBarState(n);
    setNoteValueState(v);
    setCurrentBeat(-1);
  }, [getEngine]);

  const setSubdiv = useCallback((s: number) => {
    const e = getEngine();
    e.subdiv = s;
    setSubdivState(s);
  }, []);

  const setSound = useCallback((s: SoundName) => {
    const e = getEngine();
    e.sound = s;
    e.preview();
    setSoundState(s);
  }, [getEngine]);

  const cycleBeat = useCallback((i: number) => {
    const order: Record<string, BeatState> = { accent: 'mute', mute: 'normal', normal: 'accent' };
    setBeatStatesState(prev => {
      const next = prev.slice();
      next[i] = order[next[i] || 'normal'];
      const e = engineRef.current;
      if (e) e.beatStates = next.slice();
      return next;
    });
  }, []);

  const setVolume = useCallback((v: number) => {
    v = Math.max(0, Math.min(1, v));
    const e = getEngine();
    e.setVolume(v);
    setVolumeState(v);
  }, [getEngine]);

  const setCountIn = useCallback((n: number) => {
    setCountInState(Math.max(0, Math.min(8, n)));
  }, []);

  const toggleRamp = useCallback(() => {
    setRampState(prev => !prev);
  }, []);

  const setRampEnd = useCallback((n: number) => {
    setRampEndState(Math.max(MIN_BPM, Math.min(MAX_BPM, n)));
  }, []);

  const setRampStep = useCallback((n: number) => {
    setRampStepState(Math.max(1, Math.min(20, n)));
  }, []);

  const setRampBars = useCallback((n: number) => {
    setRampBarsState(Math.max(1, Math.min(16, n)));
  }, []);

  return {
    bpm, playing, beatsPerBar, noteValue, subdiv, sound,
    beatStates, currentBeat, volume, screen, countIn,
    ramp, rampEnd, rampStep, rampBars, barsPlayed,

    setBpm, nudge, togglePlay, setSig, setSubdiv, setSound,
    cycleBeat, setVolume, setScreen, setCountIn,
    toggleRamp, setRampEnd, setRampStep, setRampBars,
  };
}
