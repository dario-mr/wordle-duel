import { getRestApiV1BaseUrl } from '../config/wds';
import type {
  CreateRoomRequest,
  ReadyForNextRoundRequest,
  RoomDto,
  SubmitGuessRequest,
  SubmitGuessResponse,
} from './types';
import { fetchJson } from './wdsClient';
import { joinUrl } from './url';

export function createRoom(body: CreateRoomRequest): Promise<RoomDto> {
  return fetchJson(apiUrl('/rooms'), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function joinRoom(roomId: string): Promise<RoomDto> {
  return fetchJson(roomUrl(roomId, '/join'), {
    method: 'POST',
  });
}

export function getRoom(roomId: string, init?: RequestInit): Promise<RoomDto> {
  return fetchJson(roomUrl(roomId), init);
}

export function listMyRooms(init?: RequestInit): Promise<RoomDto[]> {
  return fetchJson(apiUrl('/rooms'), init);
}

export function submitGuess(args: {
  roomId: string;
  body: SubmitGuessRequest;
}): Promise<SubmitGuessResponse> {
  return fetchJson(roomUrl(args.roomId, '/guess'), {
    method: 'POST',
    body: JSON.stringify(args.body),
  });
}

export function readyForNextRound(args: {
  roomId: string;
  body: ReadyForNextRoundRequest;
}): Promise<RoomDto> {
  return fetchJson(roomUrl(args.roomId, '/ready'), {
    method: 'POST',
    body: JSON.stringify(args.body),
  });
}

function apiUrl(path: string): string {
  return joinUrl(getRestApiV1BaseUrl(), path);
}

function roomUrl(roomId: string, suffix = ''): string {
  return apiUrl(`/rooms/${encodeURIComponent(roomId)}${suffix}`);
}
