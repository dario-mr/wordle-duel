import { describe, expect, it } from 'vitest';
import { withQuery } from '../../../src/shared/api/url';

describe('api/url', () => {
  it('preserves repeated query keys for collection filters', () => {
    const url = withQuery('https://api.test/admin/rooms', [
      ['status', 'WAITING_FOR_PLAYERS'],
      ['status', 'IN_PROGRESS'],
    ]);

    expect(new URL(url).searchParams.getAll('status')).toEqual([
      'WAITING_FOR_PLAYERS',
      'IN_PROGRESS',
    ]);
  });
});
