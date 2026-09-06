import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WdsApiError } from '../../../src/shared/api/apiError';

const mocks = vi.hoisted(() => ({
  getJson: vi.fn(),
  apiV1Url: vi.fn((path: string) => `https://api.test${path}`),
}));

vi.mock('../../../src/shared/api/wdsClient', () => ({
  getJson: mocks.getJson,
}));

vi.mock('../../../src/shared/api/url', () => ({
  apiV1Url: mocks.apiV1Url,
}));

describe('api/users', () => {
  beforeEach(() => {
    mocks.getJson.mockReset();
    mocks.apiV1Url.mockClear();
  });

  it('getMe calls the users me endpoint', async () => {
    const api = await import('../../../src/features/auth/api');
    const init = { signal: new AbortController().signal };

    void api.getMe(init);

    expect(mocks.getJson).toHaveBeenCalledWith('https://api.test/users/me', init, {
      redirectOnUnauthorized: false,
    });
  });

  it('returns null when the current-user endpoint returns 401', async () => {
    const api = await import('../../../src/features/auth/api');
    mocks.getJson.mockRejectedValueOnce(new WdsApiError({ status: 401, code: 'UNAUTHENTICATED' }));

    await expect(api.getMe()).resolves.toBeNull();
  });
});
