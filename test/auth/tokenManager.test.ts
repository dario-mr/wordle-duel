import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  getXsrfTokenFromCookie: vi.fn<() => string | undefined>(),
  backendUrl: vi.fn((path: string) => `http://backend.test${path}`),
}));

vi.mock('../../src/api/apiFetch', () => ({
  apiFetch: mocks.apiFetch,
}));

vi.mock('../../src/api/csrf', () => ({
  getXsrfTokenFromCookie: mocks.getXsrfTokenFromCookie,
}));

vi.mock('../../src/api/url', () => ({
  backendUrl: mocks.backendUrl,
}));

async function loadTokenManager() {
  vi.resetModules();
  return await import('../../src/auth/tokenManager');
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

describe('tokenManager', () => {
  beforeEach(() => {
    mocks.apiFetch.mockReset();
    mocks.getXsrfTokenFromCookie.mockReset();
    mocks.backendUrl.mockClear();
    mocks.getXsrfTokenFromCookie.mockReturnValue('csrf-token');
  });

  afterEach(async () => {
    const tokenManager = await loadTokenManager();
    tokenManager.clearAccessToken();
    vi.useRealTimers();
  });

  describe('getValidAccessToken', () => {
    it('returns the cached token when it is still valid', async () => {
      const tokenManager = await loadTokenManager();
      mocks.apiFetch.mockResolvedValueOnce(
        jsonResponse({ accessToken: 'token-1', expiresInSeconds: 300 }),
      );

      await tokenManager.refreshAccessToken();
      const token = await tokenManager.getValidAccessToken();

      expect(token).toBe('token-1');
      expect(mocks.apiFetch).toHaveBeenCalledTimes(1);
    });

    it('refreshes the token when it is inside the safety window', async () => {
      const tokenManager = await loadTokenManager();
      mocks.apiFetch
        .mockResolvedValueOnce(jsonResponse({ accessToken: 'token-1', expiresInSeconds: 10 }))
        .mockResolvedValueOnce(jsonResponse({ accessToken: 'token-2', expiresInSeconds: 300 }));

      await tokenManager.refreshAccessToken();
      const token = await tokenManager.getValidAccessToken();

      expect(token).toBe('token-2');
      expect(mocks.apiFetch).toHaveBeenCalledTimes(2);
    });

    it('returns null when there is no cached token', async () => {
      const tokenManager = await loadTokenManager();

      await expect(tokenManager.getValidAccessToken()).resolves.toBeNull();
      expect(mocks.apiFetch).not.toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('deduplicates concurrent refresh calls', async () => {
      const tokenManager = await loadTokenManager();
      let resolveFetch: ((value: Response) => void) | undefined;
      mocks.apiFetch.mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          }),
      );

      const first = tokenManager.refreshAccessToken();
      const second = tokenManager.refreshAccessToken();

      resolveFetch?.(jsonResponse({ accessToken: 'token-1', expiresInSeconds: 300 }));

      await expect(first).resolves.toBe('token-1');
      await expect(second).resolves.toBe('token-1');
      expect(mocks.apiFetch).toHaveBeenCalledTimes(1);
    });

    it('retries once when a csrf cookie appears after a 401 response', async () => {
      const tokenManager = await loadTokenManager();
      mocks.getXsrfTokenFromCookie
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce('csrf-token')
        .mockReturnValue('csrf-token');
      mocks.apiFetch
        .mockResolvedValueOnce(new Response(null, { status: 401 }))
        .mockResolvedValueOnce(jsonResponse({ accessToken: 'token-1', expiresInSeconds: 300 }));

      await expect(tokenManager.refreshAccessToken()).resolves.toBe('token-1');
      expect(mocks.apiFetch).toHaveBeenCalledTimes(2);
    });

    it('clears the token and returns null on 401 or 403', async () => {
      const tokenManager = await loadTokenManager();
      const listener = vi.fn();
      tokenManager.subscribeAccessToken(listener);

      mocks.apiFetch.mockResolvedValueOnce(new Response(null, { status: 401 }));
      await expect(tokenManager.refreshAccessToken()).resolves.toBeNull();
      expect(tokenManager.getAccessToken()).toBeNull();
      expect(listener).toHaveBeenCalled();

      mocks.apiFetch.mockResolvedValueOnce(new Response(null, { status: 403 }));
      await expect(tokenManager.refreshAccessToken()).resolves.toBeNull();
    });

    it('throws on non-json responses', async () => {
      const tokenManager = await loadTokenManager();
      mocks.apiFetch.mockResolvedValueOnce(
        new Response('ok', { status: 200, headers: { 'content-type': 'text/plain' } }),
      );

      await expect(tokenManager.refreshAccessToken()).rejects.toThrow(
        'Unexpected response content-type: text/plain',
      );
    });

    it('throws on malformed payloads', async () => {
      const tokenManager = await loadTokenManager();
      mocks.apiFetch.mockResolvedValueOnce(
        jsonResponse({ accessToken: 42, expiresInSeconds: 'x' }),
      );

      await expect(tokenManager.refreshAccessToken()).rejects.toThrow(
        'Unexpected refresh response payload',
      );
    });

    it('notifies all listeners even if one throws', async () => {
      const tokenManager = await loadTokenManager();
      const noisyListener = vi.fn(() => {
        throw new Error('listener failed');
      });
      const healthyListener = vi.fn();
      tokenManager.subscribeAccessToken(noisyListener);
      tokenManager.subscribeAccessToken(healthyListener);
      mocks.apiFetch.mockResolvedValueOnce(
        jsonResponse({ accessToken: 'token-1', expiresInSeconds: 300 }),
      );

      await tokenManager.refreshAccessToken();
      tokenManager.clearAccessToken();

      expect(noisyListener).toHaveBeenCalledTimes(2);
      expect(healthyListener).toHaveBeenCalledTimes(2);
    });

    it('returns null without calling the backend after a known unauthenticated probe', async () => {
      const tokenManager = await loadTokenManager();
      mocks.apiFetch.mockResolvedValueOnce(new Response(null, { status: 401 }));

      await tokenManager.refreshAccessToken();
      mocks.apiFetch.mockClear();

      await expect(tokenManager.refreshAccessToken()).resolves.toBeNull();
      expect(mocks.apiFetch).not.toHaveBeenCalled();
    });
  });
});
