export const LETTER_KEY_BUTTON_PROPS = {
  size: { base: 'xs', sm: 'sm' },
  variant: 'outline',
  flex: '1',
  minW: '0',
  px: { base: 0, sm: 2 },
} as const;

export const ACTION_KEY_BUTTON_PROPS = {
  size: { base: 'xs', sm: 'sm' },
  variant: 'outline',
  flex: { base: 1.6, sm: 1.4 },
  minW: '0',
  px: { base: 1, sm: 3 },
} as const;
