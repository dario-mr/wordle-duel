import { describe, expect, it } from 'vitest';
import {
  adminRoomsFiltersEqual,
  EMPTY_ADMIN_ROOMS_FILTERS,
  getActiveAdminRoomsFilters,
} from '../../../../src/features/admin/rooms/filters';

describe('adminRoomsFiltersEqual', () => {
  it('includes date filters in equality checks', () => {
    expect(
      adminRoomsFiltersEqual(EMPTY_ADMIN_ROOMS_FILTERS, {
        ...EMPTY_ADMIN_ROOMS_FILTERS,
        createdAt: '2025-06-01',
      }),
    ).toBe(false);
  });
});

describe('getActiveAdminRoomsFilters', () => {
  it('returns selected dates as active filters', () => {
    expect(
      getActiveAdminRoomsFilters({
        ...EMPTY_ADMIN_ROOMS_FILTERS,
        createdAt: '2025-06-01',
        lastUpdatedAt: '2025-06-02',
      }),
    ).toEqual({ createdAt: '2025-06-01', lastUpdatedAt: '2025-06-02' });
  });
});
