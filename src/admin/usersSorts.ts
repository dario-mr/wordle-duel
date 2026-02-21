export const USERS_SORT_FIELDS = ['fullName', 'email', 'createdOn'] as const;

export type UsersSortField = (typeof USERS_SORT_FIELDS)[number];
export type UsersSortDirection = 'asc' | 'desc';
export type UsersSort = { field: UsersSortField; direction: UsersSortDirection } | null;

export function toggleUsersSort(current: UsersSort, field: UsersSortField): UsersSort {
  if (current?.field !== field) {
    return { field, direction: 'asc' };
  }
  if (current.direction === 'asc') {
    return { field, direction: 'desc' };
  }
  return null;
}

export function toUsersSortParam(sort: UsersSort): string | undefined {
  if (!sort) {
    return undefined;
  }
  return `${sort.field},${sort.direction}`;
}
