export const ADMIN_ROOMS_SORT_FIELDS = [
  'status',
  'roomId',
  'players',
  'rounds',
  'language',
  'createdAt',
  'lastUpdatedAt',
] as const;

export type AdminRoomsSortField = (typeof ADMIN_ROOMS_SORT_FIELDS)[number];
export type AdminRoomsSortDirection = 'asc' | 'desc';
export type AdminRoomsSort = {
  field: AdminRoomsSortField;
  direction: AdminRoomsSortDirection;
} | null;

export function toggleAdminRoomsSort(
  current: AdminRoomsSort,
  field: AdminRoomsSortField,
): AdminRoomsSort {
  if (current?.field !== field) {
    return { field, direction: 'asc' };
  }
  if (current.direction === 'asc') {
    return { field, direction: 'desc' };
  }
  return null;
}

export function toAdminRoomsSortParam(sort: AdminRoomsSort): string | undefined {
  if (!sort) {
    return undefined;
  }
  return `${sort.field},${sort.direction}`;
}
