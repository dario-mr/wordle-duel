import { getBackendBasePath, getRestApiV1BaseUrl } from '../config/wds';
import type { AdminUsersResponse, UserMeDto } from './types';
import { joinUrl } from './url';
import { fetchJson } from './wdsClient';

interface AdminUsersParams {
  page?: number;
  size?: number;
  sort?: string;
}

export function getMe(init?: RequestInit): Promise<UserMeDto> {
  return fetchJson(apiUrl('/users/me'), init);
}

export function getAdminUsers(
  params?: AdminUsersParams,
  init?: RequestInit,
): Promise<AdminUsersResponse> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) {
    query.set('page', String(params.page));
  }
  if (params?.size !== undefined) {
    query.set('size', String(params.size));
  }
  if (params?.sort !== undefined) {
    query.set('sort', params.sort);
  }
  const qs = query.toString();
  return fetchJson(joinUrl(getBackendBasePath(), `/admin/users${qs ? `?${qs}` : ''}`), init);
}

function apiUrl(path: string): string {
  return joinUrl(getRestApiV1BaseUrl(), path);
}
