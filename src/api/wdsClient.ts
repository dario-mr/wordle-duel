import { i18n } from '../i18n';
import { redirectToLogin } from '../auth/redirectToLogin';
import { getValidAccessToken, refreshAccessToken } from '../auth/tokenManager';
import { UNAUTHENTICATED_CODE, UNEXPECTED_RESPONSE_CODE } from '../constants.ts';
import { apiFetch } from './apiFetch';
import { type ErrorResponseDto, WdsApiError } from './types';

export function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  return fetchJson<T>(url, init);
}

export function postJson<TResponse>(
  url: string,
  body?: unknown,
  init?: Omit<RequestInit, 'body' | 'method'>,
): Promise<TResponse> {
  return fetchJson<TResponse>(url, withJsonBody(init, body));
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  return parseJsonResponse<T>(await fetchAuthorized(url, init));
}

async function fetchAuthorized(url: string, init?: RequestInit): Promise<Response> {
  const baseInit = withJsonHeaders(init);
  let res = await doAuthorizedFetch(url, baseInit, await getAccessTokenOrRedirect());

  if (res.status === 401) {
    res = await doAuthorizedFetch(url, baseInit, await getAccessTokenOrRedirect({ refresh: true }));

    if (res.status === 401) {
      return redirectToLoginAndHalt();
    }
  }

  if (!res.ok) {
    throw await parseApiError(res);
  }

  return res;
}

async function getAccessTokenOrRedirect(args?: { refresh?: boolean }): Promise<string> {
  let token = args?.refresh ? await refreshAccessToken() : await getValidAccessToken();
  if (!token && !args?.refresh) {
    token = await refreshAccessToken();
  }

  if (!token) {
    return redirectToLoginAndHalt();
  }

  return token;
}

function doAuthorizedFetch(url: string, init: RequestInit, token: string): Promise<Response> {
  return apiFetch(url, withAuthorization(init, token));
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
  let message = i18n.t('errors.requestFailedWithStatus', { status: res.status });

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
        message = raw.message;
      }
    } catch {
      // ignore
    }
  }

  return new WdsApiError({ status: res.status, code, message });
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

function withAuthorization(init: RequestInit, token: string | null): RequestInit {
  if (!token) {
    return init;
  }

  const headers = new Headers(init.headers);

  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return {
    ...init,
    headers,
  };
}

function isErrorResponseDto(value: unknown): value is ErrorResponseDto {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.code === 'string' && typeof record.message === 'string';
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
    message: i18n.t('errors.unauthenticated'),
  });
}

function makeUnexpectedResponseError(status: number): WdsApiError {
  return new WdsApiError({
    status,
    code: UNEXPECTED_RESPONSE_CODE,
    message: i18n.t('errors.unexpectedResponse'),
  });
}
