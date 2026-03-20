import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WdsApiError, type RoomDto } from '../../src/api/types';
import {
  roomQueryKey,
  useCreateRoomMutation,
  useJoinRoomMutation,
  useReadyForNextRoundMutation,
  useRoomQuery,
  useSubmitGuessMutation,
} from '../../src/query/roomQueries';
import { createQueryClientWrapper } from '../testUtils/queryClient';

const mocks = vi.hoisted(() => ({
  createRoom: vi.fn(),
  getRoom: vi.fn(),
  joinRoom: vi.fn(),
  listMyRooms: vi.fn(),
  readyForNextRound: vi.fn(),
  submitGuess: vi.fn(),
}));

vi.mock('../../src/api/rooms', () => ({
  createRoom: mocks.createRoom,
  getRoom: mocks.getRoom,
  joinRoom: mocks.joinRoom,
  listMyRooms: mocks.listMyRooms,
  readyForNextRound: mocks.readyForNextRound,
  submitGuess: mocks.submitGuess,
}));

vi.mock('../../src/i18n', () => ({
  i18n: {
    t: (key: string) => key,
  },
}));

function createRoomDto(id: string): RoomDto {
  return {
    id,
    language: 'IT',
    status: 'WAITING_FOR_PLAYERS',
    players: [],
    currentRound: null,
  };
}

describe('roomQueries', () => {
  beforeEach(() => {
    mocks.createRoom.mockReset();
    mocks.getRoom.mockReset();
    mocks.joinRoom.mockReset();
    mocks.listMyRooms.mockReset();
    mocks.readyForNextRound.mockReset();
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

  describe('useCreateRoomMutation', () => {
    it('writes the created room into the cache on success', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper();
      const room = createRoomDto('created-room');
      mocks.createRoom.mockResolvedValue(room);

      const { result } = renderHook(() => useCreateRoomMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ language: 'IT' });
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

    it('invalidates the room query when the round has already finished', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper();
      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
      mocks.submitGuess.mockRejectedValue(
        new WdsApiError({
          status: 409,
          code: 'ROUND_FINISHED',
          message: 'Round already finished',
        }),
      );

      const { result } = renderHook(() => useSubmitGuessMutation({ roomId: 'room-1' }), {
        wrapper,
      });

      await act(async () => {
        await expect(result.current.mutateAsync({ word: 'APPLE' })).rejects.toBeInstanceOf(
          WdsApiError,
        );
      });

      await waitFor(() => {
        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: roomQueryKey('room-1') });
      });
    });
  });

  describe('useReadyForNextRoundMutation', () => {
    it('writes the latest room into the cache on success', async () => {
      const { queryClient, wrapper } = createQueryClientWrapper();
      const room = createRoomDto('room-1');
      mocks.readyForNextRound.mockResolvedValue(room);

      const { result } = renderHook(() => useReadyForNextRoundMutation({ roomId: 'room-1' }), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ roundNumber: 2 });
      });

      expect(queryClient.getQueryData(roomQueryKey('room-1'))).toEqual(room);
    });
  });
});
