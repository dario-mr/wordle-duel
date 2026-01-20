export class WdsApiError extends Error {
  status: number;
  code: string;

  constructor(args: { status: number; code: string; message: string }) {
    super(args.message);
    this.name = 'WdsApiError';
    this.status = args.status;
    this.code = args.code;
  }
}

export type Language = 'IT';

export type RoomStatus = 'WAITING_FOR_PLAYERS' | 'IN_PROGRESS' | 'CLOSED';

export interface PlayerDto {
  id: string;
  score: number;
  displayName: string;
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
  language: Language;
}

export interface SubmitGuessRequest {
  word: string;
}

export interface ReadyForNextRoundRequest {
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
