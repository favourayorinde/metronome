import { useRef, useState } from 'react';
import { useMetronome } from '../hooks/useMetronome';
import { useTapTempo } from '../hooks/useTapTempo';
import { useWakeLock } from '../hooks/useWakeLock';
import { StatusBar } from './StatusBar';
import { TabBar } from './TabBar';
import { MiniTransport } from './MiniTransport';
import { TempoScreen } from './TempoScreen';
import { RhythmScreen } from './RhythmScreen';
import { SoundScreen } from './SoundScreen';
import { TrainScreen } from './TrainScreen';
import { P, type ScreenId } from '../types';

const SCREEN_ORDER: ScreenId[] = ['tempo', 'rhythm', 'sound', 'train'];
const SNAP_THRESHOLD = 50;

export function Metronome() {
  const m = useMetronome();
  const { tap } = useTapTempo(m.setBpm);
  useWakeLock(m.playing);

  const activeIndex = SCREEN_ORDER.indexOf(m.screen);
  const [dragOffset, setDragOffset] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const raw = e.clientX - startX.current;
    // resist at edges
    const atStart = activeIndex === 0 && raw > 0;
    const atEnd = activeIndex === SCREEN_ORDER.length - 1 && raw < 0;
    setDragOffset(atStart || atEnd ? raw / 3 : raw);
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (dragOffset < -SNAP_THRESHOLD && activeIndex < SCREEN_ORDER.length - 1) {
      m.setScreen(SCREEN_ORDER[activeIndex + 1]);
    } else if (dragOffset > SNAP_THRESHOLD && activeIndex > 0) {
      m.setScreen(SCREEN_ORDER[activeIndex - 1]);
    }
    setDragOffset(0);
  }

  const containerWidth = trackRef.current?.offsetWidth ?? 0;
  const translateX = containerWidth
    ? -(activeIndex * containerWidth) + dragOffset
    : 0;

  return (
    <div className="flex flex-col" style={{
      height: '100dvh', maxWidth: 430, margin: '0 auto',
      background: P.bg, color: P.text,
      fontFamily: 'var(--font-ui)',
    }}>
      {/* <StatusBar /> */}

      <div
        ref={trackRef}
        style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0, display: 'flex', flexDirection: 'column', touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div style={{
          display: 'flex',
          height: '100%',
          transform: containerWidth ? `translateX(${translateX}px)` : `translateX(-${activeIndex * 100}%)`,
          transition: dragging.current ? 'none' : 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {SCREEN_ORDER.map(id => (
            <div key={id} style={{ width: '100%', flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {id === 'tempo' && (
                <TempoScreen
                  bpm={m.bpm} playing={m.playing} beatsPerBar={m.beatsPerBar} noteValue={m.noteValue}
                  beatStates={m.beatStates} currentBeat={m.currentBeat}
                  onBpmChange={m.setBpm} onNudge={m.nudge} onTogglePlay={m.togglePlay}
                  onCycleBeat={m.cycleBeat} onTap={tap}
                />
              )}
              {id === 'rhythm' && (
                <RhythmScreen
                  beatsPerBar={m.beatsPerBar} noteValue={m.noteValue} subdiv={m.subdiv}
                  beatStates={m.beatStates} currentBeat={m.currentBeat} playing={m.playing}
                  onCycleBeat={m.cycleBeat} onSetSig={m.setSig} onSetSubdiv={m.setSubdiv}
                />
              )}
              {id === 'sound' && (
                <SoundScreen
                  sound={m.sound} volume={m.volume}
                  onSetSound={m.setSound} onSetVolume={m.setVolume}
                />
              )}
              {id === 'train' && (
                <TrainScreen
                  bpm={m.bpm} beatsPerBar={m.beatsPerBar} noteValue={m.noteValue}
                  playing={m.playing} countIn={m.countIn} ramp={m.ramp}
                  rampEnd={m.rampEnd} rampStep={m.rampStep} rampBars={m.rampBars}
                  barsPlayed={m.barsPlayed}
                  onSetCountIn={m.setCountIn} onToggleRamp={m.toggleRamp}
                  onSetRampEnd={m.setRampEnd} onSetRampStep={m.setRampStep} onSetRampBars={m.setRampBars}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {m.screen !== 'tempo' && (
        <MiniTransport
          bpm={m.bpm} playing={m.playing}
          onTogglePlay={m.togglePlay} onNudge={m.nudge}
          onGoTempo={() => m.setScreen('tempo')}
        />
      )}

      <TabBar screen={m.screen} onSetScreen={m.setScreen} />
    </div>
  );
}
