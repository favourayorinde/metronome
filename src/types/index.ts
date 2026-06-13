export type { SoundName, BeatState } from '../audio/MetronomeEngine';

export type ScreenId = 'tempo' | 'rhythm' | 'sound' | 'train';

export interface TimeSignatureDef {
  label: string;
  beats: number;
  noteValue: number;
}

export const TIME_SIGNATURES: TimeSignatureDef[] = [
  { label: '4/4', beats: 4, noteValue: 4 },
  { label: '3/4', beats: 3, noteValue: 4 },
  { label: '6/8', beats: 6, noteValue: 8 },
  { label: '5/4', beats: 5, noteValue: 4 },
  { label: '7/8', beats: 7, noteValue: 8 },
  { label: '2/4', beats: 2, noteValue: 4 },
];

export const SUBDIVISION_DEFS: { label: string; value: number }[] = [
  { label: 'Quarter', value: 1 },
  { label: 'Eighth', value: 2 },
  { label: 'Triplet', value: 3 },
  { label: '16th', value: 4 },
];

export const PRESET_DEFS: { label: string; bpm: number }[] = [
  { label: 'Ballad', bpm: 72 },
  { label: 'Groove', bpm: 96 },
  { label: 'Allegro', bpm: 132 },
  { label: 'Drive', bpm: 160 },
];

export const SOUND_DEFS: { label: string; id: SoundName; desc: string; bars: number[] }[] = [
  { label: 'Click', id: 'click', desc: 'Pure sine tick', bars: [3, 16, 4, 3, 3] },
  { label: 'Woodblock', id: 'woodblock', desc: 'Warm hollow knock', bars: [5, 13, 9, 5, 3] },
  { label: 'Hi-hat', id: 'hihat', desc: 'Crisp noise burst', bars: [8, 10, 7, 10, 8] },
  { label: 'Rim', id: 'rim', desc: 'Sharp snap', bars: [3, 6, 15, 6, 3] },
  { label: 'Cowbell', id: 'cowbell', desc: 'Bright metallic', bars: [7, 13, 6, 13, 7] },
];

export const MIN_BPM = 20;
export const MAX_BPM = 300;

export function tempoTerm(bpm: number): string {
  if (bpm <= 60) return 'Largo';
  if (bpm <= 76) return 'Adagio';
  if (bpm <= 108) return 'Andante';
  if (bpm <= 120) return 'Moderato';
  if (bpm <= 156) return 'Allegro';
  if (bpm <= 176) return 'Vivace';
  return 'Presto';
}

export function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export const P = {
  bg: '#ece5d7',
  text: '#241d12',
  muted: '#8c8270',
  accent: '#0f9a8a',
  amber: '#bd8230',
  idle: '#ddd2bd',
  line: 'rgba(50,38,14,.16)',
  surface: '#f7f2e7',
  well: '#e0d7c2',
  edge: 'rgba(50,38,14,.20)',
} as const;
