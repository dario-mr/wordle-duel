import type {
  Language,
  RoomRounds,
  RoomStatus,
  RoundPlayerStatus,
  RoundStatus,
} from '../../rooms/types';

export interface AdminRoomPlayerDto {
  id: string;
  wins: number;
  matchScore: number | null;
  displayName: string | null;
  currentRoundNumber: number | null;
}

export interface AdminRoomRoundDto {
  roundNumber: number;
  solution: string;
  roundStatus: RoundStatus;
  playerStatus: Partial<Record<string, RoundPlayerStatus>>;
}

export interface AdminRoomDto {
  id: string;
  language: Language;
  configuredRounds: RoomRounds;
  status: RoomStatus;
  players: AdminRoomPlayerDto[];
  rounds: AdminRoomRoundDto[];
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
