import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getJson: vi.fn(),
  backendUrl: vi.fn((path: string) => `https://backend.test${path}`),
  withQuery: vi.fn((url: string, entries: Iterable<readonly [string, string | number]>) => {
    const search = new URLSearchParams();
    for (const [key, value] of entries) {
      search.append(key, String(value));
    }
    return `${url}?${search.toString()}`;
  }),
}));

vi.mock('../../../../src/shared/api/wdsClient', () => ({ getJson: mocks.getJson }));
vi.mock('../../../../src/shared/api/url', () => ({
  backendUrl: mocks.backendUrl,
  withQuery: mocks.withQuery,
}));

describe('admin rooms api', () => {
  beforeEach(() => {
    mocks.getJson.mockReset();
    mocks.backendUrl.mockClear();
    mocks.withQuery.mockClear();
  });

  it('builds repeatable statuses and date filters', async () => {
    const { getAdminRooms } = await import('../../../../src/features/admin/rooms/api');
    const init: RequestInit = { signal: new AbortController().signal };

    void getAdminRooms(
      {
        page: 0,
        size: 50,
        sort: 'players,asc',
        statuses: ['WAITING_FOR_PLAYERS', 'IN_PROGRESS'],
        language: 'IT',
        rounds: 'FIVE',
        roomId: 'abc',
        playerSearch: 'user-1',
        createdAt: '2025-06-01',
        lastUpdatedAt: '2025-06-02',
      },
      init,
    );

    expect(mocks.getJson).toHaveBeenLastCalledWith(
      'https://backend.test/admin/rooms?page=0&size=50&sort=players%2Casc&status=WAITING_FOR_PLAYERS&status=IN_PROGRESS&language=IT&rounds=FIVE&roomId=abc&playerSearch=user-1&createdAt=2025-06-01&lastUpdatedAt=2025-06-02',
      init,
    );
  });
});
