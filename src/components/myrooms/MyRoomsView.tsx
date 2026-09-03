import { Button, Heading, Stack, Text } from '@chakra-ui/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const activeRooms = rooms
    .filter((room) => room.status !== 'CLOSED')
    .sort((left, right) => {
      if (left.status === right.status) {
        return 0;
      }
      return left.status === 'IN_PROGRESS' ? -1 : 1;
    });
  const historyRooms = rooms.filter((room) => room.status === 'CLOSED');

  const renderRooms = (roomsToRender: RoomDto[]) => (
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
  );

  return (
    <Stack gap={6}>
      <Heading size="lg" textAlign="center">
        {t('myRooms.title')}
      </Heading>

      {rooms.length === 0 ? (
        <Text textAlign="center">{t('myRooms.empty')}</Text>
      ) : (
        <Stack gap={6}>
          <Stack gap={3}>
            {activeRooms.length > 0 ? (
              renderRooms(activeRooms)
            ) : (
              <Text color="fg.muted">{t('myRooms.noActive')}</Text>
            )}
          </Stack>

          {historyRooms.length > 0 ? (
            <Stack gap={3}>
              <Button
                type="button"
                variant="plain"
                w="full"
                justifyContent="space-between"
                px={0}
                color="fg.navigation"
                aria-expanded={isHistoryOpen}
                aria-controls="my-rooms-history"
                _hover={{ color: 'fg' }}
                _active={{ color: 'fg' }}
                onClick={() => {
                  setIsHistoryOpen((open) => !open);
                }}
              >
                <Text fontWeight="bold">
                  {t('myRooms.history', { count: historyRooms.length })}
                </Text>
                {isHistoryOpen ? (
                  <ChevronDown aria-hidden="true" size={18} />
                ) : (
                  <ChevronRight aria-hidden="true" size={18} />
                )}
              </Button>
              {isHistoryOpen ? (
                <Stack id="my-rooms-history" gap={4}>
                  {renderRooms(historyRooms)}
                </Stack>
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      )}
    </Stack>
  );
}
