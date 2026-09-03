import { redirectToLogin } from '../auth/redirectToLogin';
import { UNAUTHENTICATED_CODE, UNEXPECTED_RESPONSE_CODE } from '../constants.ts';
import { apiFetch } from './apiFetch';
import { type ErrorResponseDto, WdsApiError } from './types';

export function getJson<T>(
  url: string,
  init?: RequestInit,
  options?: { redirectOnUnauthorized?: boolean },
): Promise<T> {
  return fetchJson<T>(url, init, options);
}

export function postJson<TResponse>(
  url: string,
  body?: unknown,
  init?: Omit<RequestInit, 'body' | 'method'>,
): Promise<TResponse> {
  return fetchJson<TResponse>(url, withJsonBody(init, body));
}

async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  options?: { redirectOnUnauthorized?: boolean },
): Promise<T> {
  return parseJsonResponse<T>(await fetchAuthorized(url, init, options));
}

async function fetchAuthorized(
  url: string,
  init?: RequestInit,
  options?: { redirectOnUnauthorized?: boolean },
): Promise<Response> {
  const baseInit = withJsonHeaders(init);
  const res = await apiFetch(url, baseInit);

  if (res.status === 401 && options?.redirectOnUnauthorized !== false) {
    return redirectToLoginAndHalt();
  }

  if (!res.ok) {
    throw await parseApiError(res);
  }

  return res;
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    throw makeUnexpectedResponseError(res.status);
  }

  const contentType = getContentType(res);
  if (!contentType.includes('application/json')) {
    throw makeUnexpectedResponseError(res.status);
  }

  return (await res.json()) as T;
}

async function parseApiError(res: Response): Promise<WdsApiError> {
  let code = 'UNEXPECTED_ERROR';

  const contentType = getContentType(res);
  if (contentType.includes('text/html')) {
    return res.status === 401
      ? makeUnauthenticatedError()
      : makeUnexpectedResponseError(res.status);
  }

  if (contentType.includes('application/json')) {
    try {
      const raw = (await res.json()) as unknown;
      if (isErrorResponseDto(raw)) {
        code = raw.code;
      }
    } catch {
      // ignore
    }
  }

  return new WdsApiError({ status: res.status, code });
}

function withJsonHeaders(init: RequestInit | undefined): RequestInit {
  const headers = new Headers(init?.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (typeof init?.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return {
    ...init,
    headers,
  };
}

function withJsonBody(
  init: Omit<RequestInit, 'body' | 'method'> | undefined,
  body: unknown,
): RequestInit {
  return {
    ...init,
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

function isErrorResponseDto(value: unknown): value is ErrorResponseDto {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.code === 'string';
}

function getContentType(res: Response): string {
  return res.headers.get('content-type') ?? '';
}

function redirectToLoginAndHalt(): never {
  redirectToLogin();
  throw makeUnauthenticatedError();
}

function makeUnauthenticatedError(): WdsApiError {
  return new WdsApiError({
    status: 401,
    code: UNAUTHENTICATED_CODE,
  });
}

function makeUnexpectedResponseError(status: number): WdsApiError {
  return new WdsApiError({
    status,
    code: UNEXPECTED_RESPONSE_CODE,
  });
}
