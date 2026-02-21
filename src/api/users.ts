import { USERS_FILTER_FIELDS, type UsersFilters } from '../admin/usersFilters';
import { getBackendBasePath, getRestApiV1BaseUrl } from '../config/wds';
import type { AdminUsersResponse, UserMeDto } from './types';
import { joinUrl } from './url';
import { fetchJson } from './wdsClient';

interface AdminUsersParams extends Partial<UsersFilters> {
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
  for (const field of USERS_FILTER_FIELDS) {
    const value = params?.[field];
    if (value !== undefined) {
      query.set(field, value);
    }
  }
  const qs = query.toString();
  return fetchJson(joinUrl(getBackendBasePath(), `/admin/users${qs ? `?${qs}` : ''}`), init);
}

function apiUrl(path: string): string {
  return joinUrl(getRestApiV1BaseUrl(), path);
}
