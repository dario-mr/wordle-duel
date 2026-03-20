import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  t: vi.fn(() => 'Unknown error'),
}));

vi.mock('../../src/i18n', () => ({
  i18n: { t: mocks.t },
}));

describe('getErrorMessage', () => {
  it('returns the error message for Error instances', async () => {
    const { getErrorMessage } = await import('../../src/api/errors');

    expect(getErrorMessage(new Error('Boom'))).toBe('Boom');
  });

  it('falls back to the translated unknown error message', async () => {
    const { getErrorMessage } = await import('../../src/api/errors');

    expect(getErrorMessage('boom')).toBe('Unknown error');
  });
});
