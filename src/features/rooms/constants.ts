export const WORD_LENGTH = 5;
export const MAX_GUESS_ATTEMPTS = 6;
export const LANGUAGE_OPTIONS = [{ value: 'IT', labelKey: 'roomLanguage.it' }] as const;
export const ROUND_OPTIONS = [
  { value: 5, labelKey: 'home.createRoom.rounds5' },
  { value: 10, labelKey: 'home.createRoom.rounds10' },
  { value: 'ENDLESS', labelKey: 'home.createRoom.roundsEndless' },
] as const;
