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

export function Metronome() {
  const m = useMetronome();
  const { tap } = useTapTempo(m.setBpm);
  useWakeLock(m.playing);

  const activeIndex = SCREEN_ORDER.indexOf(m.screen);

  return (
    <div className="flex flex-col" style={{
      height: '100dvh', maxWidth: 430, margin: '0 auto',
      background: P.bg, color: P.text,
      fontFamily: 'var(--font-ui)',
    }}>
      {/* <StatusBar /> */}

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex',
          height: '100%',
          transform: `translateX(-${activeIndex * 100}%)`,
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
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
