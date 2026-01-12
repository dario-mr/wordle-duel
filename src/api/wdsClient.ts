import { i18n } from '../i18n';
import type { ErrorResponseDto } from './types';

export class WdsApiError extends Error {
  status: number;
  code: string;

  constructor(args: { status: number; code: string; message: string }) {
    super(args.message);
    this.name = 'WdsApiError';
    this.status = args.status;
    this.code = args.code;
  }
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let code = 'UNEXPECTED_ERROR';
    let message = i18n.t('errors.requestFailedWithStatus', { status: res.status });

    try {
      const raw = (await res.json()) as unknown;
      if (isErrorResponseDto(raw)) {
        code = raw.code;
        message = raw.message;
      }
    } catch {
      // ignore
    }

    throw new WdsApiError({ status: res.status, code, message });
  }

  if (res.status === 204) {
    return null as T;
  }
  return (await res.json()) as T;
}

function isErrorResponseDto(value: unknown): value is ErrorResponseDto {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.code === 'string' && typeof record.message === 'string';
}
