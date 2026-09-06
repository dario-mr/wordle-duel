import { backendUrl, withQuery } from '../../../shared/api/url';
import { getJson } from '../../../shared/api/wdsClient';
import { USERS_FILTER_FIELDS, type UsersFilters } from './filters';
import type { AdminUsersResponse } from './types';

interface AdminUsersParams extends Partial<UsersFilters> {
  page?: number;
  size?: number;
  sort?: string;
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
