import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  redirectToLogin: vi.fn(),
  apiFetch: vi.fn(),
}));

vi.mock('../../src/auth/redirectToLogin', () => ({
  redirectToLogin: mocks.redirectToLogin,
}));

vi.mock('../../src/api/apiFetch', () => ({
  apiFetch: mocks.apiFetch,
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
  return (calls[index]?.[1] as RequestInit | undefined) ?? {};
}

describe('wdsClient', () => {
  beforeEach(() => {
    mocks.redirectToLogin.mockReset();
    mocks.apiFetch.mockReset();
  });

  it('uses the session cookie and parses JSON without a bearer header', async () => {
    const client = await loadClient();
    mocks.apiFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await expect(client.getJson<{ ok: boolean }>('/api/test')).resolves.toEqual({ ok: true });

    const headers = new Headers(getApiFetchInitCall().headers);
    expect(headers.get('Authorization')).toBeNull();
    expect(headers.get('Accept')).toBe('application/json');
    expect(mocks.apiFetch).toHaveBeenCalledTimes(1);
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

  it('redirects once on a 401 without retrying the request', async () => {
    const client = await loadClient();
    mocks.apiFetch.mockResolvedValueOnce(new Response(null, { status: 401 }));

    await expect(client.getJson('/api/test')).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHENTICATED',
    });
    expect(mocks.redirectToLogin).toHaveBeenCalledTimes(1);
    expect(mocks.apiFetch).toHaveBeenCalledTimes(1);
  });

  it('can leave a 401 for the current-user query to interpret', async () => {
    const client = await loadClient();
    mocks.apiFetch.mockResolvedValueOnce(new Response(null, { status: 401 }));

    await expect(
      client.getJson('/api/test', undefined, { redirectOnUnauthorized: false }),
    ).rejects.toMatchObject({ status: 401 });
    expect(mocks.redirectToLogin).not.toHaveBeenCalled();
    expect(mocks.apiFetch).toHaveBeenCalledTimes(1);
  });

  it('parses backend json errors into WdsApiError', async () => {
    const client = await loadClient();
    mocks.apiFetch.mockResolvedValueOnce(
      jsonResponse(
        { code: 'ROOM_FULL' },
        { status: 409, headers: { 'content-type': 'application/json' } },
      ),
    );

    await expect(client.getJson('/api/test')).rejects.toMatchObject({
      status: 409,
      code: 'ROOM_FULL',
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
