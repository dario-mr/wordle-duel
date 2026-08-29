import { USERS_FILTER_FIELDS, type UsersFilters } from '../admin/usersFilters';
import { WdsApiError, type AdminUsersResponse, type UserMeDto } from './types';
import { apiV1Url, backendUrl, withQuery } from './url';
import { getJson } from './wdsClient';

interface AdminUsersParams extends Partial<UsersFilters> {
  page?: number;
  size?: number;
  sort?: string;
}

export async function getMe(init?: RequestInit): Promise<UserMeDto | null> {
  try {
    return await getJson<UserMeDto>(apiV1Url('/users/me'), init, {
      redirectOnUnauthorized: false,
    });
  } catch (error) {
    if (error instanceof WdsApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export function getAdminUsers(
  params?: AdminUsersParams,
  init?: RequestInit,
): Promise<AdminUsersResponse> {
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

  for (const field of USERS_FILTER_FIELDS) {
    const value = params?.[field];
    if (value !== undefined) {
      queryEntries.push([field, value]);
    }
  }

  return getJson<AdminUsersResponse>(withQuery(backendUrl('/admin/users'), queryEntries), init);
}
