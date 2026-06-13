import type { SoundName } from '../audio/MetronomeEngine';
import { P, SOUND_DEFS } from '../types';

interface Props {
  sound: SoundName;
  volume: number;
  onSetSound: (s: SoundName) => void;
  onSetVolume: (v: number) => void;
}

export function SoundScreen({ sound, volume, onSetSound, onSetVolume }: Props) {
  const volNum = Math.round(volume * 100);

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ padding: '10px 20px 4px', gap: 12 }}>
      {/* header */}
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, letterSpacing: '.24em', color: P.muted, fontWeight: 700 }}>SOUND</span>
        <span style={{ fontSize: 12, color: P.muted }}>tap to preview</span>
      </div>

      {/* sound cards */}
      <div className="flex flex-col gap-2">
        {SOUND_DEFS.map(c => {
          const sel = sound === c.id;
          const barColor = sel ? 'rgba(255,255,255,.92)' : P.accent;
          return (
            <div key={c.id} onClick={() => onSetSound(c.id)}
                 className="flex items-center justify-between cursor-pointer select-none"
                 style={{
                   padding: '11px 15px', borderRadius: 13,
                   border: `1px solid ${sel ? 'transparent' : P.line}`,
                   background: sel ? P.accent : P.surface,
                   boxShadow: sel ? '0 2px 0 #0a5e55' : `0 2px 0 ${P.edge}`,
                   transition: 'all .12s',
                 }}>
              <div className="flex flex-col gap-[2px]">
                <span style={{ fontSize: 15, fontWeight: 700, color: sel ? '#fff' : P.text }}>{c.label}</span>
                <span style={{ fontSize: 11.5, color: sel ? 'rgba(255,255,255,.7)' : P.muted }}>{c.desc}</span>
              </div>
              <div className="flex items-center gap-[3px]" style={{ height: 18 }}>
                {c.bars.map((h, i) => (
                  <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: barColor }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* volume well */}
      <div style={{
        borderRadius: 16, background: P.well,
        boxShadow: 'inset 0 3px 8px rgba(50,38,14,.16)',
        padding: '13px 16px',
      }}>
        <div className="flex items-baseline justify-between" style={{ marginBottom: 9 }}>
          <span style={{ fontSize: 11, letterSpacing: '.16em', color: P.muted, fontWeight: 700 }}>VOLUME</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: P.text }}>{volNum}%</span>
        </div>
        <div className="flex items-center gap-3">
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: P.muted, flexShrink: 0 }} />
          <input type="range" min={0} max={100} step={1} value={volNum}
                 onChange={e => onSetVolume(+e.target.value / 100)}
                 className="flex-1 cursor-pointer" style={{ height: 22 }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: P.muted, flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
