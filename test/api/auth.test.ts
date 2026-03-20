import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clearAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
  subscribeAccessToken: vi.fn((listener: () => void) => {
    return () => {
      listener();
    };
  }),
  getUserFromAccessToken: vi.fn(),
  apiFetch: vi.fn(),
  backendUrl: vi.fn((path: string) => `http://backend.test${path}`),
}));

vi.mock('../../src/auth/tokenManager', () => ({
  clearAccessToken: mocks.clearAccessToken,
  getAccessToken: mocks.getAccessToken,
  subscribeAccessToken: mocks.subscribeAccessToken,
}));

vi.mock('../../src/auth/jwtUser', () => ({
  getUserFromAccessToken: mocks.getUserFromAccessToken,
}));

vi.mock('../../src/api/apiFetch', () => ({
  apiFetch: mocks.apiFetch,
}));

vi.mock('../../src/api/url', () => ({
  backendUrl: mocks.backendUrl,
}));

describe('api/auth', () => {
  beforeEach(() => {
    mocks.clearAccessToken.mockReset();
    mocks.getAccessToken.mockReset();
    mocks.subscribeAccessToken.mockClear();
    mocks.getUserFromAccessToken.mockReset();
    mocks.apiFetch.mockReset();
    mocks.backendUrl.mockClear();
  });

  it('beginGoogleLogin redirects to the google oauth entrypoint', async () => {
    const api = await import('../../src/api/auth');
    const assign = vi.fn();
    vi.stubGlobal('location', { origin: window.location.origin, assign });

    api.beginGoogleLogin();

    expect(assign).toHaveBeenCalledWith('http://backend.test/oauth2/authorization/google');
  });

  it('logout clears the token on ok, 401, and 403', async () => {
    const api = await import('../../src/api/auth');
    mocks.apiFetch
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 403 }));

    await expect(api.logout()).resolves.toBeUndefined();
    await expect(api.logout()).resolves.toBeUndefined();
    await expect(api.logout()).resolves.toBeUndefined();

    expect(mocks.clearAccessToken).toHaveBeenCalledTimes(3);
  });

  it('logout throws on unexpected statuses', async () => {
    const api = await import('../../src/api/auth');
    mocks.apiFetch.mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(api.logout()).rejects.toThrow('Logout failed with status 500');
  });

  it('getCurrentUser decodes the current token', async () => {
    const api = await import('../../src/api/auth');
    mocks.getAccessToken.mockReturnValue('token-1');
    mocks.getUserFromAccessToken.mockReturnValue({ id: 'user-1' });

    expect(api.getCurrentUser()).toEqual({ id: 'user-1' });
    expect(mocks.getUserFromAccessToken).toHaveBeenCalledWith('token-1');
  });

  it('subscribeCurrentUser proxies the token subscription', async () => {
    const api = await import('../../src/api/auth');
    const listener = vi.fn();

    api.subscribeCurrentUser(listener);

    expect(mocks.subscribeAccessToken).toHaveBeenCalledWith(listener);
  });
});
