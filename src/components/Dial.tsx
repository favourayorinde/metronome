import { useCallback } from 'react';
import { P, hexA, MIN_BPM, MAX_BPM } from '../types';

interface Props {
  bpm: number;
  onBpmChange: (bpm: number) => void;
}

export function Dial({ bpm, onBpmChange }: Props) {
  const ang = -135 + ((bpm - MIN_BPM) / (MAX_BPM - MIN_BPM)) * 270;

  const ticks: { angle: number; major: boolean; on: boolean }[] = [];
  for (let i = 0; i <= 28; i++) {
    const ta = -135 + (i / 28) * 270;
    ticks.push({ angle: ta, major: i % 4 === 0, on: ta <= ang + 0.01 });
  }

  const knobDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let last = Math.atan2(e.clientY - cy, e.clientX - cx);
    let acc = bpm;

    const move = (ev: PointerEvent) => {
      const a = Math.atan2(ev.clientY - cy, ev.clientX - cx);
      let d = a - last;
      if (d > Math.PI) d -= 2 * Math.PI;
      if (d < -Math.PI) d += 2 * Math.PI;
      last = a;
      acc += (d * 180 / Math.PI) / 270 * 280;
      acc = Math.max(MIN_BPM, Math.min(MAX_BPM, acc));
      onBpmChange(Math.round(acc));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }, [bpm, onBpmChange]);

  return (
    <div onPointerDown={knobDown}
         className="relative cursor-grab select-none"
         style={{ width: 224, height: 224, touchAction: 'none' }}>
      {/* tick marks */}
      {ticks.map((t, i) => (
        <div key={i} style={{
          position: 'absolute', left: '50%', top: '50%',
          width: t.major ? 3 : 2,
          height: t.major ? 13 : 8,
          borderRadius: 2,
          background: t.on
            ? hexA(P.accent, t.major ? 0.95 : 0.65)
            : hexA(P.text, t.major ? 0.4 : 0.2),
          transform: `translate(-50%,-50%) rotate(${t.angle}deg) translateY(-101px)`,
          transition: 'background .12s ease',
        }} />
      ))}

      {/* knob */}
      <div style={{
        position: 'absolute', left: 29, top: 29, width: 166, height: 166, borderRadius: '50%',
        background: 'linear-gradient(155deg,#fbf6ea,#e3d9c2)',
        boxShadow: '0 16px 30px rgba(50,38,14,.20), 0 0 0 1px rgba(50,38,14,.18), inset 0 2px 0 rgba(255,255,255,.85), inset 0 -4px 8px rgba(50,38,14,.10)',
        transform: `rotate(${ang}deg)`,
      }}>
        {/* pointer */}
        <div style={{
          position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)',
          width: 6, height: 20, borderRadius: 3, background: P.accent,
        }} />
      </div>

      {/* center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 44, fontWeight: 600,
          letterSpacing: '-.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        }}>{bpm}</span>
        <span style={{
          fontSize: 11, color: P.muted, fontWeight: 700, letterSpacing: '.18em', marginTop: 4,
        }}>BPM</span>
      </div>
    </div>
  );
}
