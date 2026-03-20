import { describe, expect, it } from 'vitest';
import { toUsersSortParam, toggleUsersSort } from '../../src/admin/usersSorts';

describe('toggleUsersSort', () => {
  it('starts ascending when choosing a new field', () => {
    expect(toggleUsersSort(null, 'email')).toEqual({ field: 'email', direction: 'asc' });
  });

  it('cycles ascending to descending to none', () => {
    const asc = toggleUsersSort(null, 'fullName');
    const desc = toggleUsersSort(asc, 'fullName');
    const cleared = toggleUsersSort(desc, 'fullName');

    expect(asc).toEqual({ field: 'fullName', direction: 'asc' });
    expect(desc).toEqual({ field: 'fullName', direction: 'desc' });
    expect(cleared).toBeNull();
  });
});

describe('toUsersSortParam', () => {
  it('serializes the sort parameter', () => {
    expect(toUsersSortParam({ field: 'createdOn', direction: 'desc' })).toBe('createdOn,desc');
    expect(toUsersSortParam(null)).toBeUndefined();
  });
});
