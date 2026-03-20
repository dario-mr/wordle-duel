import type {
  CreateRoomRequest,
  ReadyForNextRoundRequest,
  RoomDto,
  SubmitGuessRequest,
  SubmitGuessResponse,
} from './types';
import { getJson, postJson } from './wdsClient';
import { apiV1Url } from './url';

export function createRoom(body: CreateRoomRequest): Promise<RoomDto> {
  return postJson<RoomDto>(apiV1Url('/rooms'), body);
}

export function joinRoom(roomId: string): Promise<RoomDto> {
  return postJson<RoomDto>(roomUrl(roomId, '/join'));
}

export function getRoom(roomId: string, init?: RequestInit): Promise<RoomDto> {
  return getJson<RoomDto>(roomUrl(roomId), init);
}

export function listMyRooms(init?: RequestInit): Promise<RoomDto[]> {
  return getJson<RoomDto[]>(apiV1Url('/rooms'), init);
}

export function submitGuess(args: {
  roomId: string;
  body: SubmitGuessRequest;
}): Promise<SubmitGuessResponse> {
  return postJson<SubmitGuessResponse>(roomUrl(args.roomId, '/guess'), args.body);
}

export function readyForNextRound(args: {
  roomId: string;
  body: ReadyForNextRoundRequest;
}): Promise<RoomDto> {
  return postJson<RoomDto>(roomUrl(args.roomId, '/ready'), args.body);
}

function roomUrl(roomId: string, suffix = ''): string {
  return apiV1Url(`/rooms/${encodeURIComponent(roomId)}${suffix}`);
}
