import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getJson: vi.fn(),
  postJson: vi.fn(),
  apiV1Url: vi.fn((path: string) => `https://api.test${path}`),
  backendUrl: vi.fn((path: string) => `https://backend.test${path}`),
  withQuery: vi.fn((url: string, entries: Iterable<readonly [string, string | number]>) => {
    const search = new URLSearchParams();
    for (const [key, value] of entries) {
      search.append(key, String(value));
    }
    return `${url}?${search.toString()}`;
  }),
}));

vi.mock('../../src/api/wdsClient', () => ({
  getJson: mocks.getJson,
  postJson: mocks.postJson,
}));

vi.mock('../../src/api/url', () => ({
  apiV1Url: mocks.apiV1Url,
  backendUrl: mocks.backendUrl,
  withQuery: mocks.withQuery,
}));

describe('api/rooms', () => {
  beforeEach(() => {
    mocks.getJson.mockReset();
    mocks.postJson.mockReset();
    mocks.apiV1Url.mockClear();
    mocks.backendUrl.mockClear();
    mocks.withQuery.mockClear();
  });

  it('creates and lists rooms via the base rooms endpoint', async () => {
    const api = await import('../../src/api/rooms');
    void api.createRoom({ language: 'IT', rounds: 5 });
    const init: RequestInit = { signal: new AbortController().signal };
    void api.listMyRooms(init);

    expect(mocks.postJson).toHaveBeenCalledWith('https://api.test/rooms', {
      language: 'IT',
      rounds: 5,
    });
    expect(mocks.getJson).toHaveBeenCalledWith('https://api.test/rooms', init);
  });

  it('encodes room ids for room-specific endpoints', async () => {
    const api = await import('../../src/api/rooms');
    void api.joinRoom('room/1');
    void api.getRoom('room/1');
    void api.submitGuess({ roomId: 'room/1', body: { word: 'APPLE' } });
    void api.startNextRound('room/1');
    void api.requestRematch('room/1');
    void api.listRoomMessages('room/1');
    void api.markRoomMessagesRead('room/1');
    void api.sendRoomMessage({ roomId: 'room/1', body: { preset: 'GOOD_LUCK' } });

    expect(mocks.postJson).toHaveBeenNthCalledWith(1, 'https://api.test/rooms/room%2F1/join');
    expect(mocks.getJson).toHaveBeenCalledWith('https://api.test/rooms/room%2F1', undefined);
    expect(mocks.postJson).toHaveBeenNthCalledWith(2, 'https://api.test/rooms/room%2F1/guess', {
      word: 'APPLE',
    });
    expect(mocks.postJson).toHaveBeenNthCalledWith(3, 'https://api.test/rooms/room%2F1/next');
    expect(mocks.postJson).toHaveBeenNthCalledWith(4, 'https://api.test/rooms/room%2F1/rematch');
    expect(mocks.getJson).toHaveBeenCalledWith(
      'https://api.test/rooms/room%2F1/messages',
      undefined,
    );
    expect(mocks.postJson).toHaveBeenNthCalledWith(
      5,
      'https://api.test/rooms/room%2F1/messages/read',
    );
    expect(mocks.postJson).toHaveBeenNthCalledWith(6, 'https://api.test/rooms/room%2F1/messages', {
      preset: 'GOOD_LUCK',
    });
  });

  it('builds the admin rooms query with repeatable statuses and date filters', async () => {
    const api = await import('../../src/api/rooms');
    const init: RequestInit = { signal: new AbortController().signal };

    void api.getAdminRooms(
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
