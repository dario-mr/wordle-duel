import { Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { RoomDto } from '../../api/types';
import { JoinRoomButton } from '../common/JoinRoomButton';

export function RoomJoinGate(props: { room: RoomDto; roomId: string | undefined }) {
  const { t } = useTranslation();
  if (props.room.players.length === 1) {
    return (
      <Stack gap={6} minH="50vh" align="center" justify="center" textAlign="center">
        <Text fontSize="2xl" fontWeight="semibold">
          {t('room.joinGate.joinThisRoom')}
        </Text>
        <Text fontSize="md" color="fg.info">
          {t('room.joinGate.waitingForOpponent')}
        </Text>
        <JoinRoomButton roomId={props.roomId} />
      </Stack>
    );
  }

  return (
    <Text fontSize="xl" fontWeight="semibold" textAlign="center">
      {t('room.joinGate.notAPlayer')}
    </Text>
  );
}
