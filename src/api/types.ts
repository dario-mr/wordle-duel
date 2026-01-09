export type Language = 'IT';

export type RoomStatus = 'WAITING_FOR_PLAYERS' | 'IN_PROGRESS' | 'CLOSED';

export interface PlayerDto {
  id: string;
  score: number;
}

export type RoundStatus = 'PLAYING' | 'ENDED';

export type RoundPlayerStatus = 'PLAYING' | 'WON' | 'LOST' | 'READY';

export type GuessLetterStatus = 'CORRECT' | 'PRESENT' | 'ABSENT';

export interface GuessLetterDto {
  letter: string;
  status: GuessLetterStatus;
}

export interface GuessDto {
  word: string;
  letters: GuessLetterDto[];
  attemptNumber: number;
}

export interface RoundDto {
  roundNumber: number;
  maxAttempts: number;
  guessesByPlayerId: Record<string, GuessDto[]>;
  statusByPlayerId: Record<string, RoundPlayerStatus>;
  roundStatus: RoundStatus;
  solution?: string;
}

export interface RoomDto {
  id: string;
  language: Language;
  status: RoomStatus;
  players: PlayerDto[];
  currentRound: RoundDto | null;
}

export interface ErrorResponseDto {
  code: string;
  message: string;
}

export interface CreateRoomRequest {
  playerId: string;
  language: Language;
}

export interface JoinRoomRequest {
  playerId: string;
}

export interface SubmitGuessRequest {
  playerId: string;
  word: string;
}

export interface ReadyForNextRoundRequest {
  playerId: string;
  roundNumber: number;
}

export interface SubmitGuessResponse {
  room: RoomDto;
}

export type RoomEventType =
  | 'ROOM_CREATED'
  | 'PLAYER_JOINED'
  | 'ROUND_STARTED'
  | 'ROUND_FINISHED'
  | 'SCORES_UPDATED';

export interface RoomEventDto {
  type: RoomEventType;
  payload: unknown;
}
