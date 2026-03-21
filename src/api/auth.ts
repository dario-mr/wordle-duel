import { clearAccessToken, getAccessToken, subscribeAccessToken } from '../auth/tokenManager';
import type { JwtUser } from '../auth/jwtUser';
import { getUserFromAccessToken } from '../auth/jwtUser';
import { apiFetch } from './apiFetch';
import { backendUrl } from './url';

let currentUserSnapshotToken: string | null | undefined;
let currentUserSnapshot: JwtUser | null = null;

export function beginGoogleLogin(): void {
  window.location.assign(backendUrl('/oauth2/authorization/google'));
}

export async function logout(): Promise<void> {
  const res = await apiFetch(backendUrl('/auth/logout'), { method: 'POST' });

  if (res.ok || res.status === 401 || res.status === 403) {
    clearAccessToken();
    return;
  }

  throw new Error(`Logout failed with status ${String(res.status)}`);
}

export function getCurrentUser(): JwtUser | null {
  const token = getAccessToken();

  if (token === currentUserSnapshotToken) {
    return currentUserSnapshot;
  }

  currentUserSnapshotToken = token;
  currentUserSnapshot = token ? getUserFromAccessToken(token) : null;
  return currentUserSnapshot;
}

export function subscribeCurrentUser(listener: () => void): () => void {
  return subscribeAccessToken(listener);
}
