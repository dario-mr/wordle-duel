import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  type CreateRoomRequest,
  type RoomDto,
  type SubmitGuessResponse,
  WdsApiError,
} from '../api/types';
import { createRoom, getRoom, joinRoom, readyForNextRound, submitGuess } from '../api/rooms';
import { i18n } from '../i18n';

export function roomQueryKey(roomId: string) {
  return ['room', roomId] as const;
}

export function useRoomQuery(roomId: string | undefined) {
  return useQuery({
    queryKey: roomId ? roomQueryKey(roomId) : ['room', 'missing'],
    enabled: !!roomId,
    queryFn: ({ signal }) => {
      if (!roomId) {
        throw new Error(i18n.t('errors.missingRoomId'));
      }
      return getRoom(roomId, { signal });
    },
  });
}

export function useCreateRoomMutation(
  options?: UseMutationOptions<RoomDto, unknown, CreateRoomRequest>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoom,
    ...options,
    onSuccess: (room, variables, context, mutation) => {
      queryClient.setQueryData<RoomDto>(roomQueryKey(room.id), room);
      options?.onSuccess?.(room, variables, context, mutation);
    },
  });
}

interface JoinRoomVariables {
  roomId: string;
}

export function useJoinRoomMutation(
  options?: UseMutationOptions<RoomDto, unknown, JoinRoomVariables>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId }: JoinRoomVariables) => joinRoom(roomId),
    ...options,
    onSuccess: (room, variables, context, mutation) => {
      queryClient.setQueryData<RoomDto>(roomQueryKey(room.id), room);
      options?.onSuccess?.(room, variables, context, mutation);
    },
  });
}

export function useSubmitGuessMutation(args: { roomId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ word }: { word: string }) =>
      submitGuess({ roomId: args.roomId, body: { word } }),
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

export function useReadyForNextRoundMutation(args: { roomId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roundNumber }: { roundNumber: number }) =>
      readyForNextRound({
        roomId: args.roomId,
        body: { roundNumber },
      }),
    onSuccess: (data: RoomDto) => {
      queryClient.setQueryData<RoomDto>(roomQueryKey(args.roomId), data);
    },
  });
}
