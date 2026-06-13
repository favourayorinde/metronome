import type { BeatState } from '../audio/MetronomeEngine';
import { P, hexA, TIME_SIGNATURES, SUBDIVISION_DEFS } from '../types';

interface Props {
  beatsPerBar: number;
  noteValue: number;
  subdiv: number;
  beatStates: BeatState[];
  currentBeat: number;
  playing: boolean;
  onCycleBeat: (i: number) => void;
  onSetSig: (n: number, v: number) => void;
  onSetSubdiv: (s: number) => void;
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '10px 6px', textAlign: 'center', borderRadius: 11, fontSize: 13,
    fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none',
    border: `1px solid ${active ? 'transparent' : P.line}`,
    background: active ? P.accent : P.surface,
    color: active ? '#fff' : P.text,
    boxShadow: active ? '0 2px 0 #0a5e55' : `0 2px 0 ${P.edge}`,
    transition: 'all .12s',
  };
}

export function RhythmScreen({
  beatsPerBar, noteValue, subdiv, beatStates, currentBeat, playing,
  onCycleBeat, onSetSig, onSetSubdiv,
}: Props) {
  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ padding: '10px 20px 4px', gap: 12 }}>
      {/* header */}
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, letterSpacing: '.24em', color: P.muted, fontWeight: 700 }}>RHYTHM</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, color: P.muted,
          border: `1px solid ${P.line}`, padding: '4px 11px', borderRadius: 999,
        }}>{beatsPerBar}/{noteValue}</span>
      </div>

      {/* beat map well */}
      <div style={{
        borderRadius: 18, background: P.well,
        boxShadow: 'inset 0 3px 8px rgba(50,38,14,.16)',
        padding: '14px 16px 13px',
      }}>
        <div className="flex items-baseline justify-between" style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 11, letterSpacing: '.16em', color: P.muted, fontWeight: 700 }}>BEAT MAP</span>
          <span style={{ fontSize: 11.5, color: P.muted }}>tap a bar · accent → mute → normal</span>
        </div>
        <div className="flex gap-2 items-end" style={{ height: 112 }}>
          {beatStates.map((st, i) => {
            const active = playing && i === currentBeat;
            const isAcc = st === 'accent';
            const muted = st === 'mute';
            const hot = isAcc ? P.amber : P.accent;
            const h = muted ? 66 : isAcc ? 104 : 70;

            const cellStyle: React.CSSProperties = {
              width: '100%', height: h, borderRadius: 12,
              transition: 'all .1s ease', boxSizing: 'border-box',
            };
            if (muted) {
              cellStyle.background = 'transparent';
              cellStyle.border = `1.5px dashed ${hexA(P.text, 0.3)}`;
            } else if (active) {
              cellStyle.background = hot;
              cellStyle.transform = 'translateY(-4px)';
              cellStyle.boxShadow = `0 12px 22px ${hexA(hot, 0.38)}`;
            } else {
              cellStyle.background = P.idle;
              cellStyle.boxShadow = isAcc
                ? `inset 0 4px 0 ${hexA(P.amber, 0.9)}, inset 0 -2px 4px rgba(50,38,14,.1)`
                : 'inset 0 2px 4px rgba(50,38,14,.14)';
            }

            const numColor = active ? P.accent : (isAcc ? P.amber : P.muted);

            return (
              <div key={i} onClick={() => onCycleBeat(i)}
                   className="flex-1 flex flex-col items-center justify-end gap-[7px] cursor-pointer">
                <div style={cellStyle} />
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: numColor,
                }}>{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* time signature */}
      <div className="flex flex-col gap-2">
        <span style={{ fontSize: 11, letterSpacing: '.16em', color: P.muted, fontWeight: 700 }}>TIME SIGNATURE</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 7 }}>
          {TIME_SIGNATURES.map(ts => (
            <div key={ts.label} onClick={() => onSetSig(ts.beats, ts.noteValue)}
                 style={chipStyle(beatsPerBar === ts.beats && noteValue === ts.noteValue)}>
              {ts.label}
            </div>
          ))}
        </div>
      </div>

      {/* subdivision */}
      <div className="flex flex-col gap-2">
        <span style={{ fontSize: 11, letterSpacing: '.16em', color: P.muted, fontWeight: 700 }}>SUBDIVISION</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
          {SUBDIVISION_DEFS.map(sd => (
            <div key={sd.value} onClick={() => onSetSubdiv(sd.value)}
                 style={chipStyle(subdiv === sd.value)}>
              {sd.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
