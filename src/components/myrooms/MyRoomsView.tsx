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

  return (
    <Stack gap={4}>
      <Heading size="lg" textAlign="center">
        {t('myRooms.title')}
      </Heading>

      {rooms.length === 0 ? (
        <Text textAlign="center">{t('myRooms.empty')}</Text>
      ) : (
        <Stack gap={3}>
          {rooms.map((room) => (
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
