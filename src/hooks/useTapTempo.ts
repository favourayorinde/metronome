import { useCallback, useRef } from 'react';
import { MIN_BPM, MAX_BPM } from '../types';

export function useTapTempo(onBpmDetected: (bpm: number) => void) {
  const tapsRef = useRef<number[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tap = useCallback(() => {
    const now = Date.now();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      tapsRef.current = [];
    }, 2000);

    tapsRef.current.push(now);
    if (tapsRef.current.length > 8) {
      tapsRef.current = tapsRef.current.slice(-8);
    }

    if (tapsRef.current.length >= 2) {
      const taps = tapsRef.current;
      let totalInterval = 0;
      for (let i = 1; i < taps.length; i++) {
        totalInterval += taps[i] - taps[i - 1];
      }
      const avgInterval = totalInterval / (taps.length - 1);
      const bpm = Math.round(60000 / avgInterval);
      const clamped = Math.max(MIN_BPM, Math.min(MAX_BPM, bpm));
      onBpmDetected(clamped);
    }
  }, [onBpmDetected]);

  return { tap };
}
