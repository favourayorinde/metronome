import type { BeatState } from '../audio/MetronomeEngine';
import { Dial } from './Dial';
import { P, hexA, tempoTerm, PRESET_DEFS } from '../types';

interface Props {
  bpm: number;
  playing: boolean;
  beatsPerBar: number;
  noteValue: number;
  beatStates: BeatState[];
  currentBeat: number;
  onBpmChange: (v: number) => void;
  onNudge: (d: number) => void;
  onTogglePlay: () => void;
  onCycleBeat: (i: number) => void;
  onTap: () => void;
}

export function TempoScreen({
  bpm, playing, beatsPerBar, noteValue, beatStates, currentBeat,
  onBpmChange, onNudge, onTogglePlay, onCycleBeat, onTap,
}: Props) {
  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ padding: '10px 22px 4px', gap: 6 }}>
      {/* header */}
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, letterSpacing: '.24em', color: P.muted, fontWeight: 700 }}>TEMPO</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, color: P.muted,
          border: `1px solid ${P.line}`, padding: '4px 11px', borderRadius: 999,
        }}>{beatsPerBar}/{noteValue}</span>
      </div>

      {/* dial area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1 min-h-0">
        <Dial bpm={bpm} onBpmChange={onBpmChange} />
        <span style={{ fontSize: 14, color: P.muted }}>{tempoTerm(bpm)} — drag the dial</span>
      </div>

      {/* beat segments */}
      <div className="flex gap-2 items-end">
        {beatStates.map((st, i) => {
          const active = playing && i === currentBeat;
          const isAcc = st === 'accent';
          const muted = st === 'mute';
          const hot = isAcc ? P.amber : P.accent;

          const style: React.CSSProperties = {
            flex: '1 1 0', height: 30, borderRadius: 999, cursor: 'pointer',
            transition: 'all .09s ease', boxSizing: 'border-box',
          };
          if (muted) {
            style.background = 'transparent';
            style.border = `1.5px dashed ${hexA(P.text, 0.3)}`;
          } else if (active) {
            style.background = hot;
            style.transform = 'translateY(-3px)';
            style.boxShadow = `0 8px 18px ${hexA(hot, 0.4)}`;
          } else {
            style.background = P.idle;
            style.boxShadow = isAcc
              ? `inset 0 3px 0 ${hexA(P.amber, 0.9)}`
              : 'inset 0 2px 4px rgba(50,38,14,.16)';
          }

          return <div key={i} style={style} onClick={() => onCycleBeat(i)} />;
        })}
      </div>

      {/* transport */}
      <div className="flex items-center justify-center gap-[18px]" style={{ padding: '4px 0' }}>
        <div onClick={() => onNudge(-1)} className="flex items-center justify-center cursor-pointer select-none"
             style={{
               width: 52, height: 52, borderRadius: '50%', background: P.surface,
               border: `1px solid ${P.line}`, boxShadow: `0 2px 0 ${P.edge}`,
               fontSize: 26, color: P.text,
             }}>−</div>
        <div onClick={onTogglePlay} className="flex items-center justify-center cursor-pointer"
             style={{
               width: 74, height: 74, borderRadius: '50%', background: P.amber,
               boxShadow: `0 3px 0 #8a5c1d, 0 14px 28px rgba(189,130,48,.38)`,
             }}>
          {playing ? (
            <div className="flex gap-[6px]">
              <div style={{ width: 7, height: 24, borderRadius: 2, background: '#fff' }} />
              <div style={{ width: 7, height: 24, borderRadius: 2, background: '#fff' }} />
            </div>
          ) : (
            <div style={{ width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: '20px solid #fff', marginLeft: 5 }} />
          )}
        </div>
        <div onClick={() => onNudge(1)} className="flex items-center justify-center cursor-pointer select-none"
             style={{
               width: 52, height: 52, borderRadius: '50%', background: P.surface,
               border: `1px solid ${P.line}`, boxShadow: `0 2px 0 ${P.edge}`,
               fontSize: 26, color: P.text,
             }}>+</div>
      </div>

      {/* presets */}
      <div className="flex gap-2">
        {PRESET_DEFS.map(p => {
          const active = bpm === p.bpm;
          return (
            <div key={p.bpm} onClick={() => onBpmChange(p.bpm)} className="cursor-pointer select-none"
                 style={{
                   flex: '1 1 0', padding: '10px 6px', textAlign: 'center', borderRadius: 11,
                   fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                   border: `1px solid ${active ? 'transparent' : P.line}`,
                   background: active ? P.accent : P.surface,
                   color: active ? '#fff' : P.text,
                   boxShadow: active ? '0 2px 0 #0a5e55' : `0 2px 0 ${P.edge}`,
                   transition: 'all .12s',
                 }}>
              {p.label} {p.bpm}
            </div>
          );
        })}
      </div>

      {/* tap tempo */}
      <div onClick={onTap} className="cursor-pointer select-none"
           style={{
             textAlign: 'center', padding: '13px 0', borderRadius: 13,
             background: P.surface, border: `1px solid ${P.line}`, boxShadow: `0 2px 0 ${P.edge}`,
             fontWeight: 700, letterSpacing: '.16em', fontSize: 13, color: P.text,
             marginBlock: 8,
           }}>
        TAP TEMPO
      </div>
    </div>
  );
}
