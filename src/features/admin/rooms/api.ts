import { backendUrl, withQuery } from '../../../shared/api/url';
import { deleteRequest, getJson } from '../../../shared/api/wdsClient';
import type { AdminRoomsFilters } from './filters';
import type { AdminRoomsResponse } from './types';

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
