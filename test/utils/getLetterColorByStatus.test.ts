import { describe, expect, it } from 'vitest';
import { getLetterColorByStatus } from '../../src/utils/getLetterColorByStatus';

describe('getLetterColorByStatus', () => {
  it('maps each guess letter status to the expected color', () => {
    expect(getLetterColorByStatus('CORRECT')).toBe('green.600');
    expect(getLetterColorByStatus('PRESENT')).toBe('yellow.500');
    expect(getLetterColorByStatus('ABSENT')).toBe('gray.600');
  });
});
