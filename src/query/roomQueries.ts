import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  type CreateRoomRequest,
  type RoomDto,
  type RoomMessageDto,
  type RoomMessagesDto,
  type RoomMessagePreset,
  type SubmitGuessResponse,
} from '../api/types';
import {
  createRoom,
  getRoom,
  joinRoom,
  listRoomMessages,
  listMyRooms,
  markRoomMessagesRead,
  requestRematch,
  sendRoomMessage,
  startNextRound,
  submitGuess,
} from '../api/rooms';
import { i18n } from '../i18n';

export function roomQueryKey(roomId: string) {
  return ['room', roomId] as const;
}

export function roomMessagesQueryKey(roomId: string) {
  return ['roomMessages', roomId] as const;
}

export function useRoomQuery(roomId: string | undefined, args?: { enabled?: boolean }) {
  return useQuery({
    queryKey: roomId ? roomQueryKey(roomId) : ['room', 'missing'],
    enabled: (args?.enabled ?? true) && !!roomId,
    queryFn: ({ signal }) => {
      if (!roomId) {
        throw new Error(i18n.t('errors.missingRoomId'));
      }
      return getRoom(roomId, { signal });
    },
  });
}

export function useMyRoomsQuery(args: { enabled: boolean }) {
  return useQuery({
    queryKey: ['myRooms'],
    queryFn: ({ signal }) => listMyRooms({ signal }),
    enabled: args.enabled,
  });
}

export function useRoomMessagesQuery(roomId: string | undefined, args?: { enabled?: boolean }) {
  return useQuery({
    queryKey: roomId ? roomMessagesQueryKey(roomId) : ['roomMessages', 'missing'],
    enabled: (args?.enabled ?? true) && !!roomId,
    queryFn: ({ signal }) => {
      if (!roomId) {
        throw new Error(i18n.t('errors.missingRoomId'));
      }
      return listRoomMessages(roomId, { signal });
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
  });
}

export function useNextRoundMutation(args: { roomId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startNextRound(args.roomId),
    onSuccess: (room: RoomDto) => {
      queryClient.setQueryData<RoomDto>(roomQueryKey(args.roomId), room);
    },
  });
}

export function useRematchMutation(args: { roomId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => requestRematch(args.roomId),
    onSuccess: ({ started }) => {
      if (started) {
        void Promise.all([
          queryClient.invalidateQueries({ queryKey: roomQueryKey(args.roomId) }),
          queryClient.invalidateQueries({ queryKey: ['myRooms'] }),
        ]);
      }
    },
  });
}

export function useSendRoomMessageMutation(args: { roomId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preset: RoomMessagePreset) =>
      sendRoomMessage({ roomId: args.roomId, body: { preset } }),
    onSuccess: (message: RoomMessageDto) => {
      queryClient.setQueryData<RoomMessagesDto>(roomMessagesQueryKey(args.roomId), (data) => ({
        messages: [...(data?.messages ?? []), message],
        unreadCount: data?.unreadCount ?? 0,
      }));
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: roomMessagesQueryKey(args.roomId) });
    },
  });
}

export function useMarkRoomMessagesReadMutation(args: { roomId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markRoomMessagesRead(args.roomId),
    onSuccess: (data: RoomMessagesDto) => {
      queryClient.setQueryData(roomMessagesQueryKey(args.roomId), data);
    },
  });
}
