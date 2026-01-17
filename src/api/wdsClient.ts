import { i18n } from '../i18n';
import { redirectToLogin } from '../auth/redirectToLogin';
import { type ErrorResponseDto, WdsApiError } from './types';
import { apiFetch } from './apiFetch';
import { isRedirectResponse, isUnauthenticatedResponse } from '../utils/httpUtils';
import { getValidAccessToken, refreshAccessToken } from '../auth/tokenManager';

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const baseInit = withJsonHeaders(init);
  const doFetch = (token: string | null) => apiFetch(url, withAuthorization(baseInit, token));

  let token = await getValidAccessToken();
  token ??= await refreshAccessToken();

  let res = await doFetch(token);

  if (isLoginRedirect(res)) {
    return await redirectToLoginAndHalt();
  }

  if (res.status === 401) {
    token = await refreshAccessToken();
    if (!token) {
      return await redirectToLoginAndHalt();
    }

    res = await doFetch(token);

    if (isLoginRedirect(res) || res.status === 401) {
      return await redirectToLoginAndHalt();
    }
  }

  if (!res.ok) {
    throw await parseApiError(res);
  }

  if (res.status === 204) {
    return null as T;
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
    return isUnauthenticatedResponse(res)
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

function isLoginRedirect(res: Response): boolean {
  if (isRedirectResponse(res)) {
    return true;
  }

  const contentType = getContentType(res);
  if (!contentType.includes('text/html')) {
    return false;
  }

  return res.status === 401 || res.status === 403;
}

async function redirectToLoginAndHalt(): Promise<never> {
  const redirected = handleUnauthenticated();

  if (redirected) {
    await new Promise<never>(() => {
      // Intentionally never resolve/reject.
    });
  }

  throw makeUnauthenticatedError();
}

function handleUnauthenticated(): boolean {
  try {
    redirectToLogin();
    return true;
  } catch {
    return false;
  }
}

function makeUnauthenticatedError(): WdsApiError {
  return new WdsApiError({
    status: 401,
    code: 'UNAUTHENTICATED',
    message: i18n.t('errors.unauthenticated'),
  });
}

function makeUnexpectedResponseError(status: number): WdsApiError {
  return new WdsApiError({
    status,
    code: 'UNEXPECTED_RESPONSE',
    message: i18n.t('errors.unexpectedResponse'),
  });
}
