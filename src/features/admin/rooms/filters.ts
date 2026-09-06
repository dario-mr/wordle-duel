import type { Language, RoomStatus } from '../../rooms/types';

export const ADMIN_ROOM_STATUS_OPTIONS = [
  'WAITING_FOR_PLAYERS',
  'IN_PROGRESS',
  'MATCH_FINISHED',
] as const satisfies readonly RoomStatus[];

export type AdminRoomRoundsFilter = 'FIVE' | 'TEN' | 'ENDLESS';

export interface AdminRoomsFilters {
  statuses: RoomStatus[];
  language: Language | '';
  rounds: AdminRoomRoundsFilter | '';
  roomId: string;
  playerSearch: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export const EMPTY_ADMIN_ROOMS_FILTERS: AdminRoomsFilters = {
  statuses: [],
  language: '',
  rounds: '',
  roomId: '',
  playerSearch: '',
  createdAt: '',
  lastUpdatedAt: '',
};

export function trimAdminRoomsFilters(filters: AdminRoomsFilters): AdminRoomsFilters {
  return {
    ...filters,
    roomId: filters.roomId.trim(),
    playerSearch: filters.playerSearch.trim(),
  };
}

export function adminRoomsFiltersEqual(left: AdminRoomsFilters, right: AdminRoomsFilters): boolean {
  return (
    left.language === right.language &&
    left.rounds === right.rounds &&
    left.roomId === right.roomId &&
    left.playerSearch === right.playerSearch &&
    left.createdAt === right.createdAt &&
    left.lastUpdatedAt === right.lastUpdatedAt &&
    left.statuses.length === right.statuses.length &&
    left.statuses.every((status, index) => status === right.statuses[index])
  );
}

export function getActiveAdminRoomsFilters(filters: AdminRoomsFilters): Partial<AdminRoomsFilters> {
  const active: Partial<AdminRoomsFilters> = {};

  if (filters.statuses.length > 0) {
    active.statuses = filters.statuses;
  }
  if (filters.language) {
    active.language = filters.language;
  }
  if (filters.rounds) {
    active.rounds = filters.rounds;
  }
  if (filters.roomId) {
    active.roomId = filters.roomId;
  }
  if (filters.playerSearch) {
    active.playerSearch = filters.playerSearch;
  }
  if (filters.createdAt) {
    active.createdAt = filters.createdAt;
  }
  if (filters.lastUpdatedAt) {
    active.lastUpdatedAt = filters.lastUpdatedAt;
  }

  return active;
}
