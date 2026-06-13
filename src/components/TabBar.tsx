import type { ScreenId } from '../types';
import { P } from '../types';
import { Gauge, Music, Volume2, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  screen: ScreenId;
  onSetScreen: (s: ScreenId) => void;
}

const TABS: { id: ScreenId; label: string; Icon: LucideIcon }[] = [
  { id: 'tempo',  label: 'Tempo',  Icon: Gauge },
  { id: 'rhythm', label: 'Rhythm', Icon: Music },
  { id: 'sound',  label: 'Sound',  Icon: Volume2 },
  { id: 'train',  label: 'Train',  Icon: TrendingUp },
];

export function TabBar({ screen, onSetScreen }: Props) {
  return (
    <div className="flex flex-shrink-0" style={{ borderTop: `1px solid ${P.line}`, background: P.surface }}>
      {TABS.map(({ id, label, Icon }) => {
        const active = screen === id;
        return (
          <div key={id} onClick={() => onSetScreen(id)}
               className="flex-1 flex flex-col items-center gap-[5px] cursor-pointer relative"
               style={{ padding: '11px 0 16px' }}>
            <div style={{
              position: 'absolute', top: 0, width: 26, height: 3,
              borderRadius: '0 0 3px 3px',
              background: active ? P.accent : 'transparent',
            }} />
            <Icon size={20} strokeWidth={active ? 2.2 : 1.6} color={active ? P.accent : P.muted} />
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: active ? P.accent : P.muted,
              letterSpacing: '.01em',
            }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
