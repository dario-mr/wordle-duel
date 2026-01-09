import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RoomDto, SubmitGuessResponse } from '../api/types';
import { createRoom, getRoom, joinRoom, readyForNextRound, submitGuess } from '../api/rooms';
import { WdsApiError } from '../api/wdsClient';

export function roomQueryKey(roomId: string) {
  return ['room', roomId] as const;
}

export function useRoomQuery(roomId: string | undefined) {
  return useQuery({
    queryKey: roomId ? roomQueryKey(roomId) : ['room', 'missing'],
    queryFn: () => {
      if (!roomId) {
        throw new Error('Missing roomId');
      }
      return getRoom(roomId);
    },
    enabled: Boolean(roomId),
  });
}

export function useCreateRoomMutation() {
  return useMutation({
    mutationFn: createRoom,
  });
}

export function useJoinRoomMutation() {
  return useMutation({
    mutationFn: ({ roomId, playerId }: { roomId: string; playerId: string }) =>
      joinRoom({ roomId, body: { playerId } }),
  });
}

export function useSubmitGuessMutation(args: { roomId: string; playerId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ word }: { word: string }) =>
      submitGuess({ roomId: args.roomId, body: { playerId: args.playerId, word } }),
    onSuccess: (data: SubmitGuessResponse) => {
      queryClient.setQueryData<RoomDto>(roomQueryKey(args.roomId), data.room);
    },
    onError: (error: unknown) => {
      if (error instanceof WdsApiError && error.code === 'ROUND_FINISHED') {
        void queryClient.invalidateQueries({ queryKey: roomQueryKey(args.roomId) });
      }
    },
  });
}

export function useReadyForNextRoundMutation(args: { roomId: string; playerId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roundNumber }: { roundNumber: number }) =>
      readyForNextRound({
        roomId: args.roomId,
        body: { playerId: args.playerId, roundNumber },
      }),
    onSuccess: (data: RoomDto) => {
      queryClient.setQueryData<RoomDto>(roomQueryKey(args.roomId), data);
    },
  });
}
