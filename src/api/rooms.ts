import { getRestApiV1BaseUrl } from '../config/wds';
import { fetchJson } from './wdsClient';
import type {
  CreateRoomRequest,
  JoinRoomRequest,
  RoomDto,
  SubmitGuessRequest,
  SubmitGuessResponse,
} from './types';

function apiUrl(path: string): string {
  const apiBase = getRestApiV1BaseUrl();
  const base = apiBase.startsWith('http')
    ? apiBase
    : new URL(apiBase, window.location.origin).toString();

  return new URL(path.replace(/^\//, ''), base).toString();
}

export function createRoom(body: CreateRoomRequest): Promise<RoomDto> {
  return fetchJson(apiUrl('/rooms'), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function joinRoom(args: { roomId: string; body: JoinRoomRequest }): Promise<RoomDto> {
  return fetchJson(apiUrl(`/rooms/${encodeURIComponent(args.roomId)}/join`), {
    method: 'POST',
    body: JSON.stringify(args.body),
  });
}

export function getRoom(roomId: string): Promise<RoomDto> {
  return fetchJson(apiUrl(`/rooms/${encodeURIComponent(roomId)}`));
}

export function submitGuess(args: {
  roomId: string;
  body: SubmitGuessRequest;
}): Promise<SubmitGuessResponse> {
  return fetchJson(apiUrl(`/rooms/${encodeURIComponent(args.roomId)}/guess`), {
    method: 'POST',
    body: JSON.stringify(args.body),
  });
}
