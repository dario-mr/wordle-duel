import { getBackendBasePath, getRestApiV1BaseUrl } from '../config/wds';

type QueryValue = string | number | boolean | null | undefined;

export function backendUrl(path: string): string {
  return joinUrl(getBackendBasePath(), path);
}

export function apiV1Url(path: string): string {
  return joinUrl(getRestApiV1BaseUrl(), path);
}

export function withQuery(url: string, entries: Iterable<readonly [string, QueryValue]>): string {
  const nextUrl = new URL(url, window.location.origin);

  for (const [key, value] of entries) {
    if (value !== undefined && value !== null) {
      nextUrl.searchParams.set(key, String(value));
    }
  }

  return nextUrl.toString();
}

function joinUrl(base: string, path: string): string {
  const baseUrl = toBaseUrl(base);
  const normalizedPath = path.replace(/^\//, '');
  return new URL(normalizedPath, baseUrl).toString();
}

function toBaseUrl(base: string): URL {
  const url = base.startsWith('http') ? new URL(base) : new URL(base, window.location.origin);

  if (!url.pathname.endsWith('/')) {
    url.pathname = `${url.pathname}/`;
  }

  return url;
}
