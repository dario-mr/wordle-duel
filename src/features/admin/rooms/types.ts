import type { Language, RoomRounds, RoomStatus } from '../../rooms/types';

export interface AdminRoomPlayerDto {
  id: string;
  wins: number;
  matchScore: number | null;
  displayName: string | null;
}

export interface AdminRoomDto {
  id: string;
  language: Language;
  rounds: RoomRounds;
  status: RoomStatus;
  players: AdminRoomPlayerDto[];
  createdAt: string;
  lastUpdatedAt: string;
}

export interface AdminRoomsResponse {
  content: AdminRoomDto[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
