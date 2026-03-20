import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getJson: vi.fn(),
  apiV1Url: vi.fn((path: string) => `https://api.test${path}`),
  backendUrl: vi.fn((path: string) => `https://backend.test${path}`),
  withQuery: vi.fn((url: string, entries: Iterable<[string, string | number]>) => {
    const next = new URL(url);
    for (const [key, value] of entries) {
      next.searchParams.set(key, String(value));
    }
    return next.toString();
  }),
}));

vi.mock('../../src/api/wdsClient', () => ({
  getJson: mocks.getJson,
}));

vi.mock('../../src/api/url', () => ({
  apiV1Url: mocks.apiV1Url,
  backendUrl: mocks.backendUrl,
  withQuery: mocks.withQuery,
}));

describe('api/users', () => {
  beforeEach(() => {
    mocks.getJson.mockReset();
    mocks.apiV1Url.mockClear();
    mocks.backendUrl.mockClear();
    mocks.withQuery.mockClear();
  });

  it('getMe calls the users me endpoint', async () => {
    const api = await import('../../src/api/users');
    const init = { signal: new AbortController().signal };

    void api.getMe(init);

    expect(mocks.getJson).toHaveBeenCalledWith('https://api.test/users/me', init);
  });

  it('getAdminUsers builds query params for paging, sorting, and filters', async () => {
    const api = await import('../../src/api/users');
    const init = { signal: new AbortController().signal };

    void api.getAdminUsers(
      {
        page: 2,
        size: 50,
        sort: 'email,asc',
        fullName: 'Alice',
        email: 'alice@example.com',
      },
      init,
    );

    expect(mocks.withQuery).toHaveBeenCalledWith(
      'https://backend.test/admin/users',
      expect.arrayContaining([
        ['page', 2],
        ['size', 50],
        ['sort', 'email,asc'],
        ['fullName', 'Alice'],
        ['email', 'alice@example.com'],
      ]),
    );
    expect(mocks.getJson).toHaveBeenCalledWith(
      'https://backend.test/admin/users?page=2&size=50&sort=email%2Casc&fullName=Alice&email=alice%40example.com',
      init,
    );
  });
});
