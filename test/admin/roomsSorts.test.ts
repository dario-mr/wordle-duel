import { describe, expect, it } from 'vitest';
import { toAdminRoomsSortParam, toggleAdminRoomsSort } from '../../src/admin/roomsSorts';

describe('toggleAdminRoomsSort', () => {
  it('cycles a room column from ascending to descending to none', () => {
    const asc = toggleAdminRoomsSort(null, 'players');
    const desc = toggleAdminRoomsSort(asc, 'players');
    const cleared = toggleAdminRoomsSort(desc, 'players');

    expect(asc).toEqual({ field: 'players', direction: 'asc' });
    expect(desc).toEqual({ field: 'players', direction: 'desc' });
    expect(cleared).toBeNull();
  });
});

describe('toAdminRoomsSortParam', () => {
  it('serializes the room sort parameter', () => {
    expect(toAdminRoomsSortParam({ field: 'rounds', direction: 'desc' })).toBe('rounds,desc');
    expect(toAdminRoomsSortParam({ field: 'createdAt', direction: 'asc' })).toBe('createdAt,asc');
    expect(toAdminRoomsSortParam(null)).toBeUndefined();
  });
});
