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
import { deleteRequest, getJson, postJson } from './wdsClient';
import { apiV1Url, backendUrl, withQuery } from './url';
import type { AdminRoomsFilters } from '../admin/roomsFilters';
import type { AdminRoomsResponse } from './types';

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

export function getAdminRooms(
  params?: Partial<AdminRoomsFilters> & { page?: number; size?: number; sort?: string },
  init?: RequestInit,
): Promise<AdminRoomsResponse> {
  const queryEntries: [string, string | number][] = [];

  if (params?.page !== undefined) {
    queryEntries.push(['page', params.page]);
  }
  if (params?.size !== undefined) {
    queryEntries.push(['size', params.size]);
  }
  if (params?.sort !== undefined) {
    queryEntries.push(['sort', params.sort]);
  }
  for (const status of params?.statuses ?? []) {
    queryEntries.push(['status', status]);
  }
  if (params?.language) {
    queryEntries.push(['language', params.language]);
  }
  if (params?.rounds) {
    queryEntries.push(['rounds', params.rounds]);
  }
  if (params?.roomId !== undefined) {
    queryEntries.push(['roomId', params.roomId]);
  }
  if (params?.playerSearch !== undefined) {
    queryEntries.push(['playerSearch', params.playerSearch]);
  }
  if (params?.createdAt !== undefined) {
    queryEntries.push(['createdAt', params.createdAt]);
  }
  if (params?.lastUpdatedAt !== undefined) {
    queryEntries.push(['lastUpdatedAt', params.lastUpdatedAt]);
  }

  return getJson<AdminRoomsResponse>(withQuery(backendUrl('/admin/rooms'), queryEntries), init);
}

export function deleteAdminRoom(roomId: string): Promise<void> {
  return deleteRequest(backendUrl(`/admin/rooms/${encodeURIComponent(roomId)}`));
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
