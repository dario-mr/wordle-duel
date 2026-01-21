import { getRestApiV1BaseUrl } from '../config/wds';
import type { UserMeDto } from './types';
import { joinUrl } from './url';
import { fetchJson } from './wdsClient';

export function getMe(init?: RequestInit): Promise<UserMeDto> {
  return fetchJson(apiUrl('/users/me'), init);
}

function apiUrl(path: string): string {
  return joinUrl(getRestApiV1BaseUrl(), path);
}
