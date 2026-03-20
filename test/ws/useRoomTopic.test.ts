import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  let lastConfig: Record<string, unknown> | undefined;
  let subscribeHandler: ((message: { body: string }) => void) | undefined;

  const invalidateQueries = vi.fn();
  const deactivate = vi.fn().mockResolvedValue(undefined);
  const activate = vi.fn(function (this: { onConnect?: () => void }) {
    return undefined;
  });

  class MockClient {
    connectHeaders: Record<string, string> = {};
    brokerURL?: string;
    reconnectDelay?: number;
    beforeConnect?: () => Promise<void>;
    onConnect?: () => void;
    onStompError?: (frame: { headers: { message: string } }) => void;

    constructor(config: Record<string, unknown>) {
      lastConfig = { ...config, __client: this };
      Object.assign(this, config);
    }

    subscribe(destination: string, handler: (message: { body: string }) => void) {
      subscribeHandler = handler;
      return { unsubscribe: vi.fn(), destination };
    }

    activate = activate;
    deactivate = deactivate;
  }

  return {
    MockClient,
    getLastConfig: () => lastConfig,
    getSubscribeHandler: () => subscribeHandler,
    invalidateQueries,
    deactivate,
    activate,
    getWsBrokerUrl: vi.fn(() => 'ws://localhost/ws'),
    getValidAccessToken: vi.fn(),
    roomQueryKey: vi.fn((roomId: string) => ['room', roomId] as const),
  };
});

vi.mock('@stomp/stompjs', () => ({
  Client: mocks.MockClient,
}));

vi.mock('@tanstack/react-query', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: mocks.invalidateQueries,
    }),
  };
});

vi.mock('../../src/config/wds', () => ({
  getWsBrokerUrl: mocks.getWsBrokerUrl,
}));

vi.mock('../../src/auth/tokenManager', () => ({
  getValidAccessToken: mocks.getValidAccessToken,
}));

vi.mock('../../src/query/roomQueries', () => ({
  roomQueryKey: mocks.roomQueryKey,
}));

describe('useRoomTopic', () => {
  beforeEach(() => {
    mocks.invalidateQueries.mockReset();
    mocks.deactivate.mockReset();
    mocks.activate.mockReset();
    mocks.getWsBrokerUrl.mockClear();
    mocks.getValidAccessToken.mockReset();
    mocks.roomQueryKey.mockClear();
  });

  it('does nothing when roomId is missing', async () => {
    const { useRoomTopic } = await import('../../src/ws/useRoomTopic');
    renderHook(() => {
      useRoomTopic(undefined);
    });

    expect(mocks.getLastConfig()).toBeUndefined();
  });

  it('activates the stomp client and deactivates on unmount', async () => {
    const { useRoomTopic } = await import('../../src/ws/useRoomTopic');
    const { unmount } = renderHook(() => {
      useRoomTopic('room-1');
    });

    expect(mocks.activate).toHaveBeenCalledTimes(1);

    unmount();

    await waitFor(() => {
      expect(mocks.deactivate).toHaveBeenCalledTimes(1);
    });
  });

  it('beforeConnect sets an authorization header when a token exists', async () => {
    const { useRoomTopic } = await import('../../src/ws/useRoomTopic');
    mocks.getValidAccessToken.mockResolvedValue('token-1');

    renderHook(() => {
      useRoomTopic('room-1');
    });
    const config = mocks.getLastConfig() as { beforeConnect?: () => Promise<void> };

    await (config.beforeConnect?.() ?? Promise.resolve());

    expect(
      (mocks.getLastConfig() as { __client: { connectHeaders: Record<string, string> } }).__client
        .connectHeaders,
    ).toEqual({
      Authorization: 'Bearer token-1',
    });
  });

  it('subscribes on connect and invalidates the room query on messages', async () => {
    const { useRoomTopic } = await import('../../src/ws/useRoomTopic');
    renderHook(() => {
      useRoomTopic('room-1');
    });

    const config = mocks.getLastConfig() as { onConnect?: () => void };
    config.onConnect?.();
    mocks.getSubscribeHandler()?.({ body: '{"type":"ROOM_CREATED"}' });
    mocks.getSubscribeHandler()?.({ body: 'not-json' });

    await waitFor(() => {
      expect(mocks.invalidateQueries).toHaveBeenCalledTimes(2);
      expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['room', 'room-1'] });
    });
  });
});
