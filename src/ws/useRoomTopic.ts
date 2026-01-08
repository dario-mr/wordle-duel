import { Client, type IMessage } from '@stomp/stompjs';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWsBrokerUrl } from '../config/wds';
import type { RoomEventDto } from '../api/types';
import { roomQueryKey } from '../query/roomQueries';

type RoomTopicStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useRoomTopic(roomId: string | undefined) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RoomTopicStatus>('disconnected');

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const client = new Client({
      brokerURL: getWsBrokerUrl(),
      reconnectDelay: 2000,
      onConnect: () => {
        setStatus('connected');
        client.subscribe(`/topic/rooms/${roomId}`, (message: IMessage) => {
          try {
            JSON.parse(message.body) as RoomEventDto;
          } catch {
            // ignore payload parsing for now
          }
          queryClient.invalidateQueries({ queryKey: roomQueryKey(roomId) });
        });
      },
      onStompError: () => {
        setStatus('error');
      },
      onWebSocketClose: () => {
        setStatus('disconnected');
      },
    });

    setStatus('connecting');
    client.activate();

    return () => {
      setStatus('disconnected');
      client.deactivate();
    };
  }, [queryClient, roomId]);

  return { status };
}
