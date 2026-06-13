import type { ScreenId } from '../types';
import { P } from '../types';

interface Props {
  screen: ScreenId;
  onSetScreen: (s: ScreenId) => void;
}

const TABS: { id: ScreenId; label: string }[] = [
  { id: 'tempo', label: 'Tempo' },
  { id: 'rhythm', label: 'Rhythm' },
  { id: 'sound', label: 'Sound' },
  { id: 'train', label: 'Train' },
];

export function TabBar({ screen, onSetScreen }: Props) {
  return (
    <div className="flex flex-shrink-0" style={{ borderTop: `1px solid ${P.line}`, background: P.surface }}>
      {TABS.map(t => {
        const active = screen === t.id;
        return (
          <div key={t.id} onClick={() => onSetScreen(t.id)}
               className="flex-1 flex flex-col items-center gap-[6px] cursor-pointer relative"
               style={{ padding: '11px 0 16px' }}>
            <div style={{
              position: 'absolute', top: 0, width: 26, height: 3,
              borderRadius: '0 0 3px 3px',
              background: active ? P.accent : 'transparent',
            }} />
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: active ? P.accent : 'rgba(36,29,18,.22)',
            }} />
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: active ? P.accent : P.muted,
              letterSpacing: '.01em',
            }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}
