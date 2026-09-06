import { WORD_LENGTH } from '../constants';

export function normalizeGuess(raw: string, wordLength: number = WORD_LENGTH): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, wordLength);
}
