import { Client, type IMessage } from '@stomp/stompjs';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWsBrokerUrl } from '../config/wds';
import type { RoomEventDto } from '../api/types';
import { roomQueryKey } from '../query/roomQueries';

export function useRoomTopic(roomId: string | undefined) {
  const queryClient = useQueryClient();

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
            JSON.parse(message.body) as RoomEventDto;
          } catch {
            // ignore payload parsing for now
          }
          void queryClient.invalidateQueries({ queryKey: roomQueryKey(roomId) });
        });
      },
    });

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [queryClient, roomId]);
}
