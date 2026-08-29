import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  backendUrl: vi.fn((path: string) => `http://backend.test${path}`),
}));

vi.mock('../../src/api/apiFetch', () => ({
  apiFetch: mocks.apiFetch,
}));

vi.mock('../../src/api/url', () => ({
  backendUrl: mocks.backendUrl,
}));

async function loadAuthApi() {
  vi.resetModules();
  return await import('../../src/api/auth');
}

describe('api/auth', () => {
  beforeEach(() => {
    mocks.apiFetch.mockReset();
    mocks.backendUrl.mockClear();
  });

  it('beginGoogleLogin redirects to the google oauth entrypoint', async () => {
    const api = await loadAuthApi();
    const assign = vi.fn();
    vi.stubGlobal('location', { origin: window.location.origin, assign });

    api.beginGoogleLogin();

    expect(assign).toHaveBeenCalledWith('http://backend.test/oauth2/authorization/google');
  });

  it('accepts successful and already-logged-out responses', async () => {
    const api = await loadAuthApi();
    mocks.apiFetch
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 403 }));

    await expect(api.logout()).resolves.toBeUndefined();
    await expect(api.logout()).resolves.toBeUndefined();
    await expect(api.logout()).resolves.toBeUndefined();

    expect(mocks.apiFetch).toHaveBeenCalledTimes(3);
    expect(mocks.apiFetch).toHaveBeenCalledWith('http://backend.test/auth/logout', {
      method: 'POST',
    });
  });

  it('throws on unexpected logout statuses', async () => {
    const api = await loadAuthApi();
    mocks.apiFetch.mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(api.logout()).rejects.toThrow('Logout failed with status 500');
  });
});
