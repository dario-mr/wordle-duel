import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getJson: vi.fn(),
  backendUrl: vi.fn((path: string) => `https://backend.test${path}`),
  withQuery: vi.fn((url: string, entries: Iterable<[string, string | number]>) => {
    const next = new URL(url);
    for (const [key, value] of entries) {
      next.searchParams.set(key, String(value));
    }
    return next.toString();
  }),
}));

vi.mock('../../../../src/shared/api/wdsClient', () => ({ getJson: mocks.getJson }));
vi.mock('../../../../src/shared/api/url', () => ({
  backendUrl: mocks.backendUrl,
  withQuery: mocks.withQuery,
}));

describe('admin users api', () => {
  beforeEach(() => {
    mocks.getJson.mockReset();
    mocks.backendUrl.mockClear();
    mocks.withQuery.mockClear();
  });

  it('builds query params for paging, sorting, and filters', async () => {
    const { getAdminUsers } = await import('../../../../src/features/admin/users/api');
    const init = { signal: new AbortController().signal };

    void getAdminUsers(
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
