import { Heading, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { RoomDto } from '../../api/types';
import { MyRoomCard } from './MyRoomCard';

interface MyRoomsViewProps {
  rooms: RoomDto[];
  myPlayerId: string;
  onOpenRoom: (roomId: string) => void;
}

export function MyRoomsView({ rooms, myPlayerId, onOpenRoom }: MyRoomsViewProps) {
  const { t } = useTranslation();

  const roomsToRender = rooms.slice().sort((left, right) => {
    if (left.status === right.status) {
      return 0;
    }
    if (left.status === 'IN_PROGRESS') {
      return -1;
    }
    if (right.status === 'IN_PROGRESS') {
      return 1;
    }
    return left.status === 'WAITING_FOR_PLAYERS' ? -1 : 1;
  });

  return (
    <Stack gap={6}>
      <Heading size="lg" textAlign="center">
        {t('myRooms.title')}
      </Heading>

      {rooms.length === 0 ? (
        <Text textAlign="center">{t('myRooms.empty')}</Text>
      ) : (
        <Stack gap={4}>
          {roomsToRender.map((room) => (
            <MyRoomCard
              key={room.id}
              room={room}
              myPlayerId={myPlayerId}
              onOpen={() => {
                onOpenRoom(room.id);
              }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
