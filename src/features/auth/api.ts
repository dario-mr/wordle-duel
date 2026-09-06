import { WdsApiError } from '../../shared/api/apiError';
import { apiV1Url } from '../../shared/api/url';
import { getJson } from '../../shared/api/wdsClient';
import type { UserMeDto } from './types';

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
