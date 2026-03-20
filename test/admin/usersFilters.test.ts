import { describe, expect, it } from 'vitest';
import {
  EMPTY_USERS_FILTERS,
  getActiveUsersFilters,
  trimUsersFilters,
  usersFiltersEqual,
} from '../../src/admin/usersFilters';

describe('trimUsersFilters', () => {
  it('trims all filter values', () => {
    expect(
      trimUsersFilters({
        fullName: '  Alice  ',
        email: '  alice@example.com ',
        displayName: ' ali ',
      }),
    ).toEqual({
      fullName: 'Alice',
      email: 'alice@example.com',
      displayName: 'ali',
    });
  });
});

describe('usersFiltersEqual', () => {
  it('checks equality across all fields', () => {
    expect(
      usersFiltersEqual(EMPTY_USERS_FILTERS, {
        fullName: '',
        email: '',
        displayName: '',
      }),
    ).toBe(true);

    expect(
      usersFiltersEqual(EMPTY_USERS_FILTERS, {
        fullName: 'Alice',
        email: '',
        displayName: '',
      }),
    ).toBe(false);
  });
});

describe('getActiveUsersFilters', () => {
  it('returns only active filters', () => {
    expect(
      getActiveUsersFilters({
        fullName: 'Alice',
        email: '',
        displayName: 'ali',
      }),
    ).toEqual({
      fullName: 'Alice',
      displayName: 'ali',
    });
  });
});
