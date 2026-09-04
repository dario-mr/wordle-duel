import type {
  CreateRoomRequest,
  RematchResponseDto,
  RoomDto,
  RoomMessageDto,
  RoomMessagesDto,
  SendRoomMessageRequest,
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

export function startNextRound(roomId: string): Promise<RoomDto> {
  return postJson<RoomDto>(roomUrl(roomId, '/next'));
}

export function requestRematch(roomId: string): Promise<RematchResponseDto> {
  return postJson<RematchResponseDto>(roomUrl(roomId, '/rematch'));
}

export function listRoomMessages(roomId: string, init?: RequestInit): Promise<RoomMessagesDto> {
  return getJson<RoomMessagesDto>(roomUrl(roomId, '/messages'), init);
}

export function markRoomMessagesRead(roomId: string): Promise<RoomMessagesDto> {
  return postJson<RoomMessagesDto>(roomUrl(roomId, '/messages/read'));
}

export function sendRoomMessage(args: {
  roomId: string;
  body: SendRoomMessageRequest;
}): Promise<RoomMessageDto> {
  return postJson<RoomMessageDto>(roomUrl(args.roomId, '/messages'), args.body);
}

function roomUrl(roomId: string, suffix = ''): string {
  return apiV1Url(`/rooms/${encodeURIComponent(roomId)}${suffix}`);
}
