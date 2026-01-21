import { apiFetch } from '../api/apiFetch';
import { getXsrfTokenFromCookie } from '../api/csrf';
import { getBackendBasePath } from '../config/wds';

const EXPIRY_SAFETY_WINDOW_MS = 30_000;
const listeners = new Set<() => void>();

let accessToken: string | null = null;
let accessTokenExpiresAtMs: number | null = null;
let refreshInFlight: Promise<string | null> | null = null;
let sessionProbeResult: 'unknown' | 'authenticated' | 'unauthenticated' = 'unknown';

export function subscribeAccessToken(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function clearAccessToken(): void {
  accessToken = null;
  accessTokenExpiresAtMs = null;
  notifyAccessTokenChanged();
}

export function getAccessToken(): string | null {
  return accessToken;
}

export async function getValidAccessToken(): Promise<string | null> {
  if (!accessToken) {
    return null;
  }

  if (accessTokenExpiresAtMs == null) {
    return accessToken;
  }

  const now = Date.now();
  const shouldRefresh = now >= accessTokenExpiresAtMs - EXPIRY_SAFETY_WINDOW_MS;

  if (!shouldRefresh) {
    return accessToken;
  }

  return await refreshAccessToken();
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!accessToken && sessionProbeResult !== 'unknown') {
    return null;
  }

  if (refreshInFlight) {
    return await refreshInFlight;
  }

  refreshInFlight = doRefresh().finally(() => {
    refreshInFlight = null;
  });

  return await refreshInFlight;
}

function notifyAccessTokenChanged(): void {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // ignore listener errors
    }
  }
}

async function doRefresh(): Promise<string | null> {
  const wasMissingCsrfCookie = !getXsrfTokenFromCookie();
  let res = await apiFetch(backendUrl('/auth/refresh'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  });

  const gotCsrfCookie = Boolean(getXsrfTokenFromCookie());
  const shouldRetryAfterCsrfCookie =
    wasMissingCsrfCookie && gotCsrfCookie && (res.status === 401 || res.status === 403);

  if (shouldRetryAfterCsrfCookie) {
    res = await apiFetch(backendUrl('/auth/refresh'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    });
  }

  if (res.status === 401 || res.status === 403) {
    sessionProbeResult = 'unauthenticated';
    clearAccessToken();
    return null;
  }

  if (!res.ok) {
    throw new Error(`Token refresh failed with status ${String(res.status)}`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Unexpected response content-type: ${contentType}`);
  }

  const raw = (await res.json()) as unknown;

  if (!raw || typeof raw !== 'object') {
    throw new Error('Unexpected refresh response payload');
  }

  const record = raw as Record<string, unknown>;
  const nextAccessToken = record.accessToken;
  const nextExpiresInSeconds = record.expiresInSeconds;

  if (typeof nextAccessToken !== 'string' || typeof nextExpiresInSeconds !== 'number') {
    throw new Error('Unexpected refresh response payload');
  }

  accessToken = nextAccessToken;
  accessTokenExpiresAtMs = Date.now() + nextExpiresInSeconds * 1000;
  sessionProbeResult = 'authenticated';
  notifyAccessTokenChanged();

  return accessToken;
}

function backendUrl(path: string): string {
  const basePath = getBackendBasePath();
  const base = new URL(basePath, window.location.origin).toString();
  return new URL(path.replace(/^\//, ''), base).toString();
}
