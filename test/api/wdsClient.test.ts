import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getValidAccessToken: vi.fn(),
  refreshAccessToken: vi.fn(),
  redirectToLogin: vi.fn(),
  apiFetch: vi.fn(),
  t: vi.fn((key: string, params?: { status?: number }) =>
    key === 'errors.requestFailedWithStatus' ? `status:${String(params?.status ?? '')}` : key,
  ),
}));

vi.mock('../../src/auth/tokenManager', () => ({
  getValidAccessToken: mocks.getValidAccessToken,
  refreshAccessToken: mocks.refreshAccessToken,
}));

vi.mock('../../src/auth/redirectToLogin', () => ({
  redirectToLogin: mocks.redirectToLogin,
}));

vi.mock('../../src/api/apiFetch', () => ({
  apiFetch: mocks.apiFetch,
}));

vi.mock('../../src/i18n', () => ({
  i18n: {
    t: mocks.t,
  },
}));

async function loadClient() {
  vi.resetModules();
  return await import('../../src/api/wdsClient');
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

function getApiFetchInitCall(index = 0): RequestInit {
  const calls = mocks.apiFetch.mock.calls as unknown[][];
  if (!(index in calls)) {
    return {};
  }
  const init = calls[index]?.[1];
  return (init as RequestInit | undefined) ?? {};
}

describe('wdsClient', () => {
  beforeEach(() => {
    mocks.getValidAccessToken.mockReset();
    mocks.refreshAccessToken.mockReset();
    mocks.redirectToLogin.mockReset();
    mocks.apiFetch.mockReset();
    mocks.t.mockClear();
    mocks.getValidAccessToken.mockResolvedValue('token-1');
    mocks.refreshAccessToken.mockResolvedValue('token-2');
  });

  it('getJson adds auth and parses JSON', async () => {
    const client = await loadClient();
    mocks.apiFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await expect(client.getJson<{ ok: boolean }>('/api/test')).resolves.toEqual({ ok: true });

    const headers = new Headers(getApiFetchInitCall().headers);
    expect(headers.get('Authorization')).toBe('Bearer token-1');
    expect(headers.get('Accept')).toBe('application/json');
  });

  it('postJson serializes the body and sets the method', async () => {
    const client = await loadClient();
    mocks.apiFetch.mockResolvedValueOnce(jsonResponse({ id: 1 }));

    await client.postJson('/api/test', { name: 'Alice' });

    const init = getApiFetchInitCall();
    expect(init).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ name: 'Alice' }),
    });
    const headers = new Headers(init.headers);
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('retries once on 401 after refreshing the token', async () => {
    const client = await loadClient();
    mocks.apiFetch
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    await expect(client.getJson<{ ok: boolean }>('/api/test')).resolves.toEqual({ ok: true });
    expect(mocks.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(mocks.apiFetch).toHaveBeenCalledTimes(2);
  });

  it('redirects and throws unauthenticated when no token can be obtained', async () => {
    const client = await loadClient();
    mocks.getValidAccessToken.mockResolvedValueOnce(null);
    mocks.refreshAccessToken.mockResolvedValueOnce(null);

    await expect(client.getJson('/api/test')).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHENTICATED',
    });
    expect(mocks.redirectToLogin).toHaveBeenCalledTimes(1);
    expect(mocks.apiFetch).not.toHaveBeenCalled();
  });

  it('parses backend json errors into WdsApiError', async () => {
    const client = await loadClient();
    mocks.apiFetch.mockResolvedValueOnce(
      jsonResponse(
        { code: 'ROOM_FULL', message: 'Room is full' },
        { status: 409, headers: { 'content-type': 'application/json' } },
      ),
    );

    await expect(client.getJson('/api/test')).rejects.toMatchObject({
      status: 409,
      code: 'ROOM_FULL',
      message: 'Room is full',
    });
  });

  it('maps html 401 to unauthenticated', async () => {
    const client = await loadClient();
    mocks.apiFetch.mockResolvedValueOnce(
      new Response('<html lang="en"></html>', {
        status: 401,
        headers: { 'content-type': 'text/html' },
      }),
    );
    mocks.refreshAccessToken.mockResolvedValueOnce('token-2');
    mocks.apiFetch.mockResolvedValueOnce(
      new Response('<html lang="en"></html>', {
        status: 401,
        headers: { 'content-type': 'text/html' },
      }),
    );

    await expect(client.getJson('/api/test')).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHENTICATED',
    });
  });

  it('maps html non-401 errors to unexpected response', async () => {
    const client = await loadClient();
    mocks.apiFetch.mockResolvedValueOnce(
      new Response('<html lang="en"></html>', {
        status: 500,
        headers: { 'content-type': 'text/html' },
      }),
    );

    await expect(client.getJson('/api/test')).rejects.toMatchObject({
      status: 500,
      code: 'UNEXPECTED_RESPONSE',
    });
  });

  it('rejects 204 responses for json endpoints', async () => {
    const client = await loadClient();
    mocks.apiFetch.mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(client.getJson('/api/test')).rejects.toMatchObject({
      status: 204,
      code: 'UNEXPECTED_RESPONSE',
    });
  });

  it('rejects successful non-json responses', async () => {
    const client = await loadClient();
    mocks.apiFetch.mockResolvedValueOnce(
      new Response('ok', { status: 200, headers: { 'content-type': 'text/plain' } }),
    );

    await expect(client.getJson('/api/test')).rejects.toMatchObject({
      status: 200,
      code: 'UNEXPECTED_RESPONSE',
    });
  });
});
