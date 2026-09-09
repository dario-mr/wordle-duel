import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RoomDto, RoomMessagesDto } from '../../../src/features/rooms/types';
import {
  roomMessagesQueryKey,
  roomQueryKey,
  useCreateRoomMutation,
  useJoinRoomMutation,
  useMarkRoomMessagesReadMutation,
  useNextRoundMutation,
  useRematchMutation,
  useRoomMessagesQuery,
  useRoomQuery,
  useSendRoomMessageMutation,
  useSubmitGuessMutation,
} from '../../../src/features/rooms/queries';
import { createQueryClientWrapper } from '../../testUtils/queryClient';

const mocks = vi.hoisted(() => ({
  createRoom: vi.fn(),
  getRoom: vi.fn(),
  joinRoom: vi.fn(),
  listRoomMessages: vi.fn(),
  listMyRooms: vi.fn(),
  markRoomMessagesRead: vi.fn(),
  requestRematch: vi.fn(),
  sendRoomMessage: vi.fn(),
  startNextRound: vi.fn(),
  submitGuess: vi.fn(),
}));

vi.mock('../../../src/features/rooms/api', () => ({
  createRoom: mocks.createRoom,
  getRoom: mocks.getRoom,
  joinRoom: mocks.joinRoom,
  listRoomMessages: mocks.listRoomMessages,
  listMyRooms: mocks.listMyRooms,
  markRoomMessagesRead: mocks.markRoomMessagesRead,
  requestRematch: mocks.requestRematch,
  sendRoomMessage: mocks.sendRoomMessage,
  startNextRound: mocks.startNextRound,
  submitGuess: mocks.submitGuess,
}));

vi.mock('../../../src/i18n/index', () => ({
  i18n: {
    t: (key: string) => key,
  },
}));

function createRoomDto(id: string): RoomDto {
  return {
    id,
    language: 'IT',
    rounds: 5,
    status: 'WAITING_FOR_PLAYERS',
    rematchRequested: false,
    players: [],
    currentRound: null,
  };
}

describe('roomQueries', () => {
  beforeEach(() => {
    mocks.createRoom.mockReset();
    mocks.getRoom.mockReset();
    mocks.joinRoom.mockReset();
    mocks.listRoomMessages.mockReset();
    mocks.listMyRooms.mockReset();
    mocks.markRoomMessagesRead.mockReset();
    mocks.requestRematch.mockReset();
    mocks.sendRoomMessage.mockReset();
    mocks.startNextRound.mockReset();
    mocks.submitGuess.mockReset();
  });

  describe('roomQueryKey', () => {
    it('returns a stable room cache key', () => {
      expect(roomQueryKey('room-1')).toEqual(['room', 'room-1']);
    });
  });

  describe('useRoomQuery', () => {
    it('does not fetch when roomId is missing', async () => {
      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(() => useRoomQuery(undefined), { wrapper });

      await waitFor(() => {
        expect(result.current.fetchStatus).toBe('idle');
      });

      expect(mocks.getRoom).not.toHaveBeenCalled();
    });
  });

  describe('useRoomMessagesQuery', () => {
    it('does not fetch when disabled', async () => {
      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(() => useRoomMessagesQuery('room-1', { enabled: false }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.fetchStatus).toBe('idle');
      });

      expect(mocks.listRoomMessages).not.toHaveBeenCalled();
    });
  });

  describe('useCreateRoomMutation', () => {
    it('writes the created room into the cache on success', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper();
      const room = createRoomDto('created-room');
      mocks.createRoom.mockResolvedValue(room);

      const { result } = renderHook(() => useCreateRoomMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ language: 'IT', rounds: 5 });
      });

      expect(queryClient.getQueryData(roomQueryKey('created-room'))).toEqual(room);
    });
  });

  describe('useJoinRoomMutation', () => {
    it('writes the joined room into the cache on success', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper();
      const room = createRoomDto('joined-room');
      mocks.joinRoom.mockResolvedValue(room);

      const { result } = renderHook(() => useJoinRoomMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ roomId: 'joined-room' });
      });

      expect(queryClient.getQueryData(roomQueryKey('joined-room'))).toEqual(room);
    });
  });

  describe('useSubmitGuessMutation', () => {
    it('writes the returned room into the cache on success', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper();
      const room = createRoomDto('room-1');
      mocks.submitGuess.mockResolvedValue({ room });

      const { result } = renderHook(() => useSubmitGuessMutation({ roomId: 'room-1' }), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ word: 'APPLE' });
      });

      expect(queryClient.getQueryData(roomQueryKey('room-1'))).toEqual(room);
    });
  });

  describe('useNextRoundMutation', () => {
    it('writes the returned next round into the cache on success', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper();
      const room = createRoomDto('room-1');
      mocks.startNextRound.mockResolvedValue(room);

      const { result } = renderHook(() => useNextRoundMutation({ roomId: 'room-1' }), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(mocks.startNextRound).toHaveBeenCalledWith('room-1');
      expect(queryClient.getQueryData(roomQueryKey('room-1'))).toEqual(room);
    });
  });

  describe('useRematchMutation', () => {
    it('keeps the current room while waiting for the opponent', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper();
      const room = createRoomDto('room-1');
      const response = { started: false };
      queryClient.setQueryData(roomQueryKey('room-1'), room);
      mocks.requestRematch.mockResolvedValue(response);

      const { result } = renderHook(() => useRematchMutation({ roomId: 'room-1' }), { wrapper });

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(mocks.requestRematch).toHaveBeenCalledWith('room-1');
      expect(queryClient.getQueryData(roomQueryKey('room-1'))).toEqual({
        ...room,
        rematchRequested: true,
      });
      await waitFor(() => {
        expect(result.current.data).toEqual(response);
      });
    });

    it('refreshes the current room and room list when the rematch starts', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper();
      const response = { started: true };
      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
      mocks.requestRematch.mockResolvedValue(response);

      const { result } = renderHook(() => useRematchMutation({ roomId: 'room-1' }), { wrapper });

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: roomQueryKey('room-1') });
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['myRooms'] });
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: roomMessagesQueryKey('room-1'),
      });
      await waitFor(() => {
        expect(result.current.data).toEqual(response);
      });
    });
  });

  describe('useSendRoomMessageMutation', () => {
    it('refreshes messages after send without duplicating a fetched message', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper();
      const message = {
        id: 1,
        senderPlayerId: 'player-1',
        preset: 'GOOD_LUCK' as const,
        createdAt: '2026-09-03T12:00:00Z',
      };
      const messages = { messages: [message], unreadCount: 0 };
      mocks.listRoomMessages.mockResolvedValue(messages);
      let resolveSend: (value: typeof message) => void = () => undefined;
      mocks.sendRoomMessage.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSend = resolve;
          }),
      );

      const { result } = renderHook(
        () => ({
          messages: useRoomMessagesQuery('room-1'),
          mutation: useSendRoomMessageMutation({ roomId: 'room-1' }),
        }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.messages.data).toEqual(messages);
      });

      act(() => {
        result.current.mutation.mutate('GOOD_LUCK');
      });

      await waitFor(() => {
        expect(result.current.mutation.isPending).toBe(true);
      });
      expect(queryClient.getQueryData(roomMessagesQueryKey('room-1'))).toEqual(messages);
      resolveSend(message);

      expect(mocks.sendRoomMessage).toHaveBeenCalledWith({
        roomId: 'room-1',
        body: { preset: 'GOOD_LUCK' },
      });

      await waitFor(() => {
        expect(result.current.mutation.isPending).toBe(false);
        expect(mocks.listRoomMessages).toHaveBeenCalledTimes(2);
      });
      expect(queryClient.getQueryData(roomMessagesQueryKey('room-1'))).toEqual(messages);
    });
  });

  describe('useMarkRoomMessagesReadMutation', () => {
    it('refreshes instead of overwriting newer messages with a late acknowledgement', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper();
      const earlierMessage = {
        id: 1,
        senderPlayerId: 'player-2',
        preset: 'WOW' as const,
        createdAt: '2026-09-03T12:00:00Z',
      };
      const newerMessages: RoomMessagesDto = {
        messages: [1, 2, 3].map((id) => ({
          id,
          senderPlayerId: 'player-1',
          preset: 'GOOD_LUCK' as const,
          createdAt: `2026-09-03T12:00:0${String(id)}Z`,
        })),
        unreadCount: 0,
      };
      const staleAcknowledgement: RoomMessagesDto = { messages: [earlierMessage], unreadCount: 0 };
      mocks.listRoomMessages
        .mockResolvedValueOnce({ messages: [earlierMessage], unreadCount: 1 })
        .mockResolvedValue(newerMessages);
      let resolveRead: (value: RoomMessagesDto) => void = () => undefined;
      mocks.markRoomMessagesRead.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveRead = resolve;
          }),
      );

      const { result } = renderHook(
        () => ({
          messages: useRoomMessagesQuery('room-1'),
          mutation: useMarkRoomMessagesReadMutation({ roomId: 'room-1' }),
        }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.messages.data?.messages).toEqual([earlierMessage]);
      });

      act(() => {
        result.current.mutation.mutate();
      });

      await waitFor(() => {
        expect(result.current.mutation.isPending).toBe(true);
      });
      queryClient.setQueryData(roomMessagesQueryKey('room-1'), newerMessages);
      resolveRead(staleAcknowledgement);

      expect(mocks.markRoomMessagesRead).toHaveBeenCalledWith('room-1');

      await waitFor(() => {
        expect(result.current.mutation.isPending).toBe(false);
        expect(mocks.listRoomMessages).toHaveBeenCalledTimes(2);
      });
      expect(queryClient.getQueryData(roomMessagesQueryKey('room-1'))).toEqual(newerMessages);
    });
  });
});
