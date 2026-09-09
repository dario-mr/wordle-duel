export const ROOMS_HEADER_CONTROL_HEIGHTS = {
  text: '32px',
  select: '40px',
} as const;

export const ROOMS_HEADER_MIN_HEIGHT = '5.5rem';
export const ROOMS_STACK_GAP = 1;

export const ROOMS_COLUMN_SIZING = {
  status: { size: 160, minSize: 150 },
  id: { size: 180, minSize: 150 },
  players: { size: 190, minSize: 160 },
  scores: { size: 120, minSize: 110 },
  rounds: { size: 110, minSize: 100 },
  language: { size: 110, minSize: 100 },
  createdAt: { size: 150, minSize: 140 },
  lastUpdatedAt: { size: 150, minSize: 140 },
} as const;

export const ROOMS_TABLE_MIN_WIDTH = '70rem';

export const ROOMS_ROW_SKELETON_SIZES = {
  lineHeight: '1.25rem',
  status: { width: '7.5rem', height: '2rem' },
  id: '9rem',
  players: ['5rem', '4rem'],
  scores: ['5rem', '4.5rem'],
  rounds: '2rem',
  language: '4rem',
  date: '5.5rem',
} as const;
