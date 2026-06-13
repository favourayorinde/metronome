import { P, tempoTerm } from '../types';

interface Props {
  bpm: number;
  playing: boolean;
  onTogglePlay: () => void;
  onNudge: (d: number) => void;
  onGoTempo: () => void;
}

export function MiniTransport({ bpm, playing, onTogglePlay, onNudge, onGoTempo }: Props) {
  return (
    <div className="flex items-center gap-[14px] flex-shrink-0"
         style={{ padding: '10px 20px', borderTop: `1px solid ${P.line}` }}>
      {/* play/pause */}
      <div onClick={onTogglePlay} className="flex items-center justify-center cursor-pointer flex-shrink-0"
           style={{
             width: 52, height: 52, borderRadius: '50%', background: P.amber,
             boxShadow: `0 3px 0 ${P.edge}, 0 8px 18px rgba(189,130,48,.34)`,
           }}>
        {playing ? (
          <div className="flex gap-[5px]">
            <div style={{ width: 6, height: 20, borderRadius: 2, background: '#fff' }} />
            <div style={{ width: 6, height: 20, borderRadius: 2, background: '#fff' }} />
          </div>
        ) : (
          <div style={{ width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '17px solid #fff', marginLeft: 3 }} />
        )}
      </div>

      {/* bpm display */}
      <div onClick={onGoTempo} className="flex-1 flex flex-col gap-[1px] cursor-pointer">
        <div className="flex items-baseline gap-[7px]">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{bpm}</span>
          <span style={{ fontSize: 11, color: P.muted, fontWeight: 700, letterSpacing: '.1em' }}>BPM</span>
        </div>
        <span style={{ fontSize: 12, color: P.muted }}>{tempoTerm(bpm)}</span>
      </div>

      {/* nudge buttons */}
      <div className="flex gap-[9px] flex-shrink-0">
        {[-1, 1].map(d => (
          <div key={d} onClick={() => onNudge(d)} className="flex items-center justify-center cursor-pointer select-none"
               style={{
                 width: 42, height: 42, borderRadius: 11, background: P.surface,
                 border: `1px solid ${P.line}`, boxShadow: `0 2px 0 ${P.edge}`,
                 fontSize: 22, color: P.text,
               }}>
            {d < 0 ? '−' : '+'}
          </div>
        ))}
      </div>
    </div>
  );
}
