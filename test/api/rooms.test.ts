import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getJson: vi.fn(),
  postJson: vi.fn(),
  apiV1Url: vi.fn((path: string) => `https://api.test${path}`),
}));

vi.mock('../../src/api/wdsClient', () => ({
  getJson: mocks.getJson,
  postJson: mocks.postJson,
}));

vi.mock('../../src/api/url', () => ({
  apiV1Url: mocks.apiV1Url,
}));

describe('api/rooms', () => {
  beforeEach(() => {
    mocks.getJson.mockReset();
    mocks.postJson.mockReset();
    mocks.apiV1Url.mockClear();
  });

  it('creates and lists rooms via the base rooms endpoint', async () => {
    const api = await import('../../src/api/rooms');
    void api.createRoom({ language: 'IT' });
    const init: RequestInit = { signal: new AbortController().signal };
    void api.listMyRooms(init);

    expect(mocks.postJson).toHaveBeenCalledWith('https://api.test/rooms', { language: 'IT' });
    expect(mocks.getJson).toHaveBeenCalledWith('https://api.test/rooms', init);
  });

  it('encodes room ids for room-specific endpoints', async () => {
    const api = await import('../../src/api/rooms');
    void api.joinRoom('room/1');
    void api.getRoom('room/1');
    void api.submitGuess({ roomId: 'room/1', body: { word: 'APPLE' } });
    void api.readyForNextRound({ roomId: 'room/1', body: { roundNumber: 2 } });

    expect(mocks.postJson).toHaveBeenNthCalledWith(1, 'https://api.test/rooms/room%2F1/join');
    expect(mocks.getJson).toHaveBeenCalledWith('https://api.test/rooms/room%2F1', undefined);
    expect(mocks.postJson).toHaveBeenNthCalledWith(2, 'https://api.test/rooms/room%2F1/guess', {
      word: 'APPLE',
    });
    expect(mocks.postJson).toHaveBeenNthCalledWith(3, 'https://api.test/rooms/room%2F1/ready', {
      roundNumber: 2,
    });
  });
});
