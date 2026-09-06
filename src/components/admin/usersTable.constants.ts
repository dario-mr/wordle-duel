export const USERS_COL_WIDTHS = {
  avatar: '60px',
  fullName: '20%',
  displayName: '20%',
  email: '30%',
  joined: '120px',
} as const;

export const USERS_COLUMN_SIZING = {
  avatar: { size: 60, minSize: 60, maxSize: 60 },
  fullName: { size: 160, minSize: 120 },
  displayName: { size: 160, minSize: 120 },
  email: { size: 240, minSize: 160 },
  joined: { size: 100, minSize: 100 },
} as const;

export const USERS_HEADER_FILTER_SLOT_HEIGHT = '32px';
export const USERS_HEADER_LABEL_SLOT_HEIGHT = '40px';
export const USERS_HEADER_GAP = 1;
