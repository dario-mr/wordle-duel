import { describe, expect, it, vi } from 'vitest';
import en from '../../src/i18n/en';
import italian from '../../src/i18n/it';
import { WdsApiError } from '../../src/api/types';

const mocks = vi.hoisted(() => ({
  t: vi.fn((key: string, options?: { status?: number }) =>
    key === 'errors.api.ROOM_FULL'
      ? 'This room is full'
      : key === 'errors.api.UNEXPECTED_ERROR'
        ? `Request failed with status ${String(options?.status)}`
        : 'Unknown error',
  ),
  exists: vi.fn((key: string) => key.startsWith('errors.api.') && key !== 'errors.api.FUTURE_CODE'),
}));

vi.mock('../../src/i18n', () => ({
  i18n: { t: mocks.t, exists: mocks.exists },
}));

describe('getErrorMessage', () => {
  it('returns the error message for Error instances', async () => {
    const { getErrorMessage } = await import('../../src/api/errors');

    expect(getErrorMessage(new Error('Boom'))).toBe('Boom');
  });

  it('translates known API error codes', async () => {
    const { getErrorMessage } = await import('../../src/api/errors');

    expect(getErrorMessage(new WdsApiError({ status: 409, code: 'ROOM_FULL' }))).toBe(
      'This room is full',
    );
  });

  it('passes the status to API error translations', async () => {
    const { getErrorMessage } = await import('../../src/api/errors');

    expect(getErrorMessage(new WdsApiError({ status: 502, code: 'UNEXPECTED_ERROR' }))).toBe(
      'Request failed with status 502',
    );
  });

  it('uses the generic translation for unknown API error codes', async () => {
    const { getErrorMessage } = await import('../../src/api/errors');

    expect(getErrorMessage(new WdsApiError({ status: 400, code: 'FUTURE_CODE' }))).toBe(
      'Unknown error',
    );
  });

  it('falls back to the translated unknown error message', async () => {
    const { getErrorMessage } = await import('../../src/api/errors');

    expect(getErrorMessage('boom')).toBe('Unknown error');
  });

  it('defines the same API error keys for English and Italian', () => {
    expect(Object.keys(en.errors.api).sort()).toEqual(Object.keys(italian.errors.api).sort());
  });
});
