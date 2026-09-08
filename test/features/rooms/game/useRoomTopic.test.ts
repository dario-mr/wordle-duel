import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRoomTopic } from '../../../../src/features/rooms/game/useRoomTopic';

const mocks = vi.hoisted(() => {
  let lastConfig: Record<string, unknown> | undefined;
  let subscribeHandler: ((message: { body: string }) => void) | undefined;

  const invalidateQueries = vi.fn();
  const deactivate = vi.fn().mockResolvedValue(undefined);
  const activate = vi.fn();

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
    reset: () => {
      lastConfig = undefined;
      subscribeHandler = undefined;
    },
    MockClient,
    getLastConfig: () => lastConfig,
    getSubscribeHandler: () => subscribeHandler,
    invalidateQueries,
    deactivate,
    activate,
    getWsBrokerUrl: vi.fn(() => 'ws://localhost/ws'),
    roomMessagesQueryKey: vi.fn((roomId: string) => ['roomMessages', roomId] as const),
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

vi.mock('../../../../src/shared/config/wds', () => ({
  getWsBrokerUrl: mocks.getWsBrokerUrl,
}));

vi.mock('../../../../src/features/rooms/queries', () => ({
  roomMessagesQueryKey: mocks.roomMessagesQueryKey,
  roomQueryKey: mocks.roomQueryKey,
}));

describe('useRoomTopic', () => {
  beforeEach(() => {
    mocks.reset();
    mocks.invalidateQueries.mockReset();
    mocks.deactivate.mockReset();
    mocks.activate.mockReset();
    mocks.getWsBrokerUrl.mockClear();
    mocks.roomMessagesQueryKey.mockClear();
    mocks.roomQueryKey.mockClear();
  });

  it('does nothing when roomId is missing', () => {
    renderHook(() => {
      useRoomTopic(undefined);
    });

    expect(mocks.getLastConfig()).toBeUndefined();
  });

  it('activates the stomp client and deactivates on unmount', async () => {
    const { unmount } = renderHook(() => {
      useRoomTopic('room-1');
    });

    expect(mocks.activate).toHaveBeenCalledTimes(1);

    unmount();

    await waitFor(() => {
      expect(mocks.deactivate).toHaveBeenCalledTimes(1);
    });
  });

  it('does not configure a STOMP authorization header', () => {
    renderHook(() => {
      useRoomTopic('room-1');
    });

    expect(mocks.getLastConfig()).not.toHaveProperty('beforeConnect');
    expect(
      (mocks.getLastConfig() as { __client: { connectHeaders: Record<string, string> } }).__client
        .connectHeaders,
    ).toEqual({});
  });

  it.each([
    ['SCORES_UPDATED', [['room', 'room-1']]],
    ['MATCH_FINISHED', [['room', 'room-1'], ['myRooms']]],
    ['MATCH_RESTARTED', [['room', 'room-1'], ['myRooms'], ['roomMessages', 'room-1']]],
  ])('invalidates the expected queries for %s', (type, queryKeys) => {
    renderHook(() => {
      useRoomTopic('room-1');
    });
    (mocks.getLastConfig() as { onConnect: () => void }).onConnect();
    mocks.getSubscribeHandler()?.({ body: JSON.stringify({ type }) });
    expect(mocks.invalidateQueries.mock.calls).toEqual(queryKeys.map((queryKey) => [{ queryKey }]));
  });

  it('refreshes the room when a message cannot be parsed', () => {
    renderHook(() => {
      useRoomTopic('room-1');
    });
    (mocks.getLastConfig() as { onConnect: () => void }).onConnect();
    mocks.getSubscribeHandler()?.({ body: 'not-json' });
    expect(mocks.invalidateQueries.mock.calls).toEqual([[{ queryKey: ['room', 'room-1'] }]]);
  });

  it('refreshes the subscribed room even when a rematch payload names another room', async () => {
    renderHook(() => {
      useRoomTopic('room-1');
    });

    const config = mocks.getLastConfig() as { onConnect?: () => void };
    config.onConnect?.();
    mocks.getSubscribeHandler()?.({
      body: JSON.stringify({ type: 'MATCH_RESTARTED', payload: { roomId: 'room-2' } }),
    });

    await waitFor(() => {
      expect(mocks.invalidateQueries).toHaveBeenCalledTimes(3);
      expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['room', 'room-1'] });
      expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['myRooms'] });
      expect(mocks.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['roomMessages', 'room-1'],
      });
    });
  });

  it('refetches messages without refetching the room for a chat event', async () => {
    const onRoomMessageSent = vi.fn();
    renderHook(() => {
      useRoomTopic('room-1', { onRoomMessageSent });
    });

    const config = mocks.getLastConfig() as { onConnect?: () => void };
    config.onConnect?.();
    mocks.getSubscribeHandler()?.({
      body: JSON.stringify({
        type: 'ROOM_MESSAGE_SENT',
        payload: {
          id: 1,
          senderPlayerId: 'player-2',
          preset: 'WOW',
          createdAt: '2026-09-03T12:00:00Z',
        },
      }),
    });

    await waitFor(() => {
      expect(mocks.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['roomMessages', 'room-1'],
      });
      expect(mocks.invalidateQueries).toHaveBeenCalledTimes(1);
      expect(onRoomMessageSent).toHaveBeenCalledWith({
        id: 1,
        senderPlayerId: 'player-2',
        preset: 'WOW',
        createdAt: '2026-09-03T12:00:00Z',
      });
    });
  });
});
