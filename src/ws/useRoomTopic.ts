import { Client, type IMessage } from '@stomp/stompjs';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWsBrokerUrl } from '../config/wds';
import type { RematchStartedPayload, RoomEventDto } from '../api/types';
import { roomQueryKey } from '../query/roomQueries';

export function useRoomTopic(
  roomId: string | undefined,
  options?: { onRematchStarted?: (roomId: string) => void },
) {
  const queryClient = useQueryClient();
  const onRematchStarted = options?.onRematchStarted;

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
            if (event.type === 'REMATCH_STARTED' && isRematchStartedPayload(event.payload)) {
              onRematchStarted?.(event.payload.roomId);
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
  }, [onRematchStarted, queryClient, roomId]);
}

function isRematchStartedPayload(value: unknown): value is RematchStartedPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'roomId' in value &&
    typeof value.roomId === 'string' &&
    value.roomId.length > 0
  );
}
