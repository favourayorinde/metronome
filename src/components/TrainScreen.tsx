import { P } from '../types';

interface Props {
  bpm: number;
  beatsPerBar: number;
  noteValue: number;
  playing: boolean;
  countIn: number;
  ramp: boolean;
  rampEnd: number;
  rampStep: number;
  rampBars: number;
  barsPlayed: number;
  onSetCountIn: (n: number) => void;
  onToggleRamp: () => void;
  onSetRampEnd: (n: number) => void;
  onSetRampStep: (n: number) => void;
  onSetRampBars: (n: number) => void;
}

function Stepper({ label, value, onDec, onInc }: { label: string; value: string; onDec: () => void; onInc: () => void }) {
  const btnStyle: React.CSSProperties = {
    width: 36, height: 36, borderRadius: 10,
    border: `1px solid ${P.line}`, background: P.surface,
    boxShadow: `0 2px 0 ${P.edge}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, cursor: 'pointer', userSelect: 'none', color: P.text,
  };
  return (
    <div className="flex items-center justify-between">
      <span style={{ fontSize: 11, letterSpacing: '.16em', color: P.muted, fontWeight: 700 }}>{label}</span>
      <div className="flex items-center gap-3">
        <div onClick={onDec} style={btnStyle}>−</div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, minWidth: 46, textAlign: 'center' }}>{value}</span>
        <div onClick={onInc} style={btnStyle}>+</div>
      </div>
    </div>
  );
}

export function TrainScreen({
  bpm, beatsPerBar, noteValue, playing, countIn, ramp, rampEnd, rampStep, rampBars, barsPlayed,
  onSetCountIn, onToggleRamp, onSetRampEnd, onSetRampStep, onSetRampBars,
}: Props) {
  const countInLabel = countIn + (countIn === 1 ? ' bar' : ' bars');
  const rampLabel = `${bpm} → ${rampEnd} bpm · +${rampStep} every ${rampBars}${rampBars === 1 ? ' bar' : ' bars'}`;
  const barsText = String(barsPlayed).padStart(3, '0');
  const sessionHint = playing ? 'counting…' : (barsPlayed > 0 ? 'paused — press play to resume' : 'press play to begin');

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ padding: '10px 20px 4px', gap: 11 }}>
      {/* header */}
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, letterSpacing: '.24em', color: P.muted, fontWeight: 700 }}>TRAIN</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, color: P.muted,
          border: `1px solid ${P.line}`, padding: '4px 11px', borderRadius: 999,
        }}>{beatsPerBar}/{noteValue}</span>
      </div>

      {/* count-in card */}
      <div className="flex items-center justify-between" style={{
        borderRadius: 16, background: P.surface, border: `1px solid ${P.line}`,
        boxShadow: `0 2px 0 ${P.edge}`, padding: '14px 16px',
      }}>
        <div className="flex flex-col gap-[2px]">
          <span style={{ fontSize: 15, fontWeight: 700 }}>Count-in</span>
          <span style={{ fontSize: 12, color: P.muted }}>Empty bars before the click</span>
        </div>
        <div className="flex items-center gap-3">
          <div onClick={() => onSetCountIn(countIn - 1)} className="flex items-center justify-center cursor-pointer select-none"
               style={{
                 width: 36, height: 36, borderRadius: 10, border: `1px solid ${P.line}`,
                 background: P.surface, boxShadow: `0 2px 0 ${P.edge}`, fontSize: 20, color: P.text,
               }}>−</div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, minWidth: 52, textAlign: 'center' }}>{countInLabel}</span>
          <div onClick={() => onSetCountIn(countIn + 1)} className="flex items-center justify-center cursor-pointer select-none"
               style={{
                 width: 36, height: 36, borderRadius: 10, border: `1px solid ${P.line}`,
                 background: P.surface, boxShadow: `0 2px 0 ${P.edge}`, fontSize: 20, color: P.text,
               }}>+</div>
        </div>
      </div>

      {/* gradual tempo card */}
      <div className="flex flex-col gap-[11px]" style={{
        borderRadius: 16, background: P.surface, border: `1px solid ${P.line}`,
        boxShadow: `0 2px 0 ${P.edge}`, padding: '14px 16px',
      }}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-[2px]">
            <span style={{ fontSize: 15, fontWeight: 700 }}>Gradual tempo</span>
            <span style={{ fontSize: 12, color: P.muted }}>{rampLabel}</span>
          </div>
          {/* toggle */}
          <div onClick={onToggleRamp} className="cursor-pointer flex-shrink-0"
               style={{
                 width: 46, height: 26, borderRadius: 999, position: 'relative',
                 background: ramp ? P.accent : P.idle,
                 transition: 'all .15s',
                 boxShadow: 'inset 0 1px 3px rgba(50,38,14,.2)',
               }}>
            <div style={{
              position: 'absolute', top: 3, left: ramp ? 23 : 3,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'all .15s', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
            }} />
          </div>
        </div>

        {ramp && (
          <>
            <div style={{ borderTop: `1px solid ${P.line}`, paddingTop: 11 }}>
              <Stepper label="TARGET BPM" value={String(rampEnd)}
                       onDec={() => onSetRampEnd(rampEnd - 4)} onInc={() => onSetRampEnd(rampEnd + 4)} />
            </div>
            <div style={{ borderTop: `1px solid ${P.line}`, paddingTop: 11 }}>
              <Stepper label="RAISE BY" value={`+${rampStep} bpm`}
                       onDec={() => onSetRampStep(rampStep - 1)} onInc={() => onSetRampStep(rampStep + 1)} />
            </div>
            <div style={{ borderTop: `1px solid ${P.line}`, paddingTop: 11 }}>
              <Stepper label="EVERY" value={rampBars + (rampBars === 1 ? ' bar' : ' bars')}
                       onDec={() => onSetRampBars(rampBars - 1)} onInc={() => onSetRampBars(rampBars + 1)} />
            </div>
          </>
        )}
      </div>

      {/* bars this session well */}
      <div className="flex-1 flex flex-col items-center justify-center gap-[3px] min-h-0" style={{
        borderRadius: 16, background: P.well,
        boxShadow: 'inset 0 3px 8px rgba(50,38,14,.16)',
        padding: 16,
      }}>
        <span style={{ fontSize: 11, letterSpacing: '.16em', color: P.muted, fontWeight: 700 }}>BARS THIS SESSION</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 60, fontWeight: 600, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums', color: P.text,
        }}>{barsText}</span>
        <span style={{ fontSize: 12.5, color: P.muted }}>{sessionHint}</span>
      </div>
    </div>
  );
}
