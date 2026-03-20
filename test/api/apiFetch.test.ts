import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from '../../src/api/apiFetch';
import { CSRF_HEADER_NAME } from '../../src/api/csrf';

describe('apiFetch', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it('always includes credentials and normalizes the method', async () => {
    await apiFetch('/rooms', { method: 'post' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/rooms',
      expect.objectContaining({
        credentials: 'include',
        method: 'POST',
      }),
    );
  });

  it('adds the CSRF header for unsafe methods when the cookie exists', async () => {
    document.cookie = 'WD-XSRF-TOKEN=csrf-token';

    await apiFetch('/rooms', { method: 'POST' });

    const [, init] = fetchMock.mock.calls[0] ?? [];
    const headers = new Headers(init?.headers);
    expect(headers.get(CSRF_HEADER_NAME)).toBe('csrf-token');
  });

  it('does not add the CSRF header for safe methods', async () => {
    document.cookie = 'WD-XSRF-TOKEN=csrf-token';

    await apiFetch('/rooms', { method: 'GET' });

    const [, init] = fetchMock.mock.calls[0] ?? [];
    const headers = new Headers(init?.headers);
    expect(headers.has(CSRF_HEADER_NAME)).toBe(false);
  });

  it('does not override an explicit CSRF header', async () => {
    document.cookie = 'WD-XSRF-TOKEN=cookie-token';

    await apiFetch('/rooms', {
      method: 'DELETE',
      headers: {
        [CSRF_HEADER_NAME]: 'manual-token',
      },
    });

    const [, init] = fetchMock.mock.calls[0] ?? [];
    const headers = new Headers(init?.headers);
    expect(headers.get(CSRF_HEADER_NAME)).toBe('manual-token');
  });
});
