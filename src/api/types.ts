export class WdsApiError extends Error {
  status: number;
  code: string;

  constructor(args: { status: number; code: string }) {
    super(args.code);
    this.name = 'WdsApiError';
    this.status = args.status;
    this.code = args.code;
  }
}

export type Language = 'IT';

export type RoomRounds = 5 | 10 | 'ENDLESS';

export type RoomStatus = 'WAITING_FOR_PLAYERS' | 'IN_PROGRESS' | 'CLOSED';

export interface PlayerDto {
  id: string;
  score: number;
  displayName: string;
}

export type RoundStatus = 'PLAYING' | 'ENDED';

export type RoundPlayerStatus = 'PLAYING' | 'WON' | 'LOST';

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
  guesses: GuessDto[];
  playerStatus: RoundPlayerStatus;
  roundStatus: RoundStatus;
  solution?: string;
}

export interface RoomDto {
  id: string;
  language: Language;
  rounds: RoomRounds;
  status: RoomStatus;
  players: PlayerDto[];
  currentRound: RoundDto | null;
}

export interface ErrorResponseDto {
  code: string;
}

export interface CreateRoomRequest {
  language: Language;
  rounds: RoomRounds;
}

export interface SubmitGuessRequest {
  word: string;
}

export interface RematchResponseDto {
  roomId: string | null;
}

export interface SubmitGuessResponse {
  room: RoomDto;
}

export const ROOM_MESSAGE_PRESETS = [
  'GOOD_LUCK',
  'WOW',
  'LOL',
  'SWEAT_SMILE',
  'ANGRY_FACE',
  'GOOD_GAME',
  'REMATCH',
] as const;

export type RoomMessagePreset = (typeof ROOM_MESSAGE_PRESETS)[number];

export interface RoomMessageDto {
  id: number;
  senderPlayerId: string;
  preset: RoomMessagePreset;
  createdAt: string;
}

export interface RoomMessagesDto {
  messages: RoomMessageDto[];
  unreadCount: number;
}

export interface SendRoomMessageRequest {
  preset: RoomMessagePreset;
}

export type RoomEventType =
  | 'ROOM_CREATED'
  | 'PLAYER_JOINED'
  | 'SCORES_UPDATED'
  | 'ROOM_CLOSED'
  | 'REMATCH_STARTED'
  | 'ROOM_MESSAGE_SENT';

export interface RematchStartedPayload {
  roomId: string;
}

export interface RoomEventDto {
  type: RoomEventType;
  payload: unknown;
}

export type RoomMessagePayload = RoomMessageDto;

export interface UserMeDto {
  id: string;
  fullName: string;
  displayName: string;
  pictureUrl: string | null;
  roles: UserRole[];
}

export type UserRole = 'USER' | 'ADMIN';

export interface AdminUserDto {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  pictureUrl: string | null;
  createdOn: string;
}

export interface AdminUsersResponse {
  content: AdminUserDto[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
