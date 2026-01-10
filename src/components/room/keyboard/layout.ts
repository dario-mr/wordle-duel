export type KeyboardRowLetters = (typeof KEY_ROWS)[number];
export const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
] as const;

export const KEYBOARD_TOTAL_COLUMNS = 20;
export const LETTER_KEY_COL_SPAN = 2;
export const ACTION_KEY_COL_SPAN = 3;
