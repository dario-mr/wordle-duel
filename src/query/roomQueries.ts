import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RoomDto, SubmitGuessResponse } from '../api/types';
import { createRoom, getRoom, joinRoom, submitGuess } from '../api/rooms';

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
    refetchInterval: roomId ? 5000 : false,
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
  });
}
