import { getCookieValue } from '../utils/cookies';

const CSRF_COOKIE_NAME = 'WD-XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-WD-XSRF-TOKEN';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = new Headers(init.headers);

  if (isUnsafeMethod(method) && !headers.has(CSRF_HEADER_NAME)) {
    const token = getXsrfTokenFromCookie();
    if (token) {
      headers.set(CSRF_HEADER_NAME, token);
    }
  }

  return fetch(input, {
    ...init,
    method,
    headers,
    credentials: 'include',
    redirect: 'manual',
  });
}

function getXsrfTokenFromCookie(): string | undefined {
  return getCookieValue(CSRF_COOKIE_NAME);
}

function isUnsafeMethod(method: string | undefined): boolean {
  return UNSAFE_METHODS.has((method ?? 'GET').toUpperCase());
}
