import { describe, expect, it } from 'vitest';
import { normalizeGuess } from '../../src/utils/normalizeGuess';

describe('normalizeGuess', () => {
  it('uppercases and strips non-letter characters', () => {
    expect(normalizeGuess('a b-c1d!e')).toBe('ABCDE');
  });

  it('caps the result at the requested word length', () => {
    expect(normalizeGuess('alphabet', 4)).toBe('ALPH');
  });

  it('uses the default word length when none is provided', () => {
    expect(normalizeGuess('abcdef')).toBe('ABCDE');
  });
});
