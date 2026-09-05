import { Client, type IMessage } from '@stomp/stompjs';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWsBrokerUrl } from '../config/wds';
import type { RoomEventDto, RoomMessagePayload } from '../api/types';
import { roomMessagesQueryKey, roomQueryKey } from '../query/roomQueries';

export function useRoomTopic(
  roomId: string | undefined,
  options?: {
    onRoomMessageSent?: (message: RoomMessagePayload) => void;
  },
) {
  const queryClient = useQueryClient();
  const onRoomMessageSent = options?.onRoomMessageSent;

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const client = new Client({
      brokerURL: getWsBrokerUrl(),
      reconnectDelay: 2000,
      onConnect: () => {
        client.subscribe(`/topic/rooms/${roomId}`, (message: IMessage) => {
          try {
            const event = JSON.parse(message.body) as RoomEventDto;
            if (event.type === 'ROOM_MESSAGE_SENT') {
              if (isRoomMessagePayload(event.payload)) {
                onRoomMessageSent?.(event.payload);
              }
              void queryClient.invalidateQueries({ queryKey: roomMessagesQueryKey(roomId) });
              return;
            }
            if (event.type === 'MATCH_FINISHED' || event.type === 'MATCH_RESTARTED') {
              void Promise.all([
                queryClient.invalidateQueries({ queryKey: roomQueryKey(roomId) }),
                queryClient.invalidateQueries({ queryKey: ['myRooms'] }),
              ]);
              return;
            }
          } catch {
            // ignore payload parsing for now
          }
          void queryClient.invalidateQueries({ queryKey: roomQueryKey(roomId) });
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers.message);
      },
    });

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [onRoomMessageSent, queryClient, roomId]);
}

function isRoomMessagePayload(value: unknown): value is RoomMessagePayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'senderPlayerId' in value &&
    typeof value.senderPlayerId === 'string' &&
    'preset' in value &&
    typeof value.preset === 'string' &&
    'createdAt' in value &&
    typeof value.createdAt === 'string'
  );
}
