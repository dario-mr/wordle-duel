import { Badge, HStack, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { PlayerDto, RoomDto, RoundPlayerStatus } from '../../api/types';

export function PlayerStatsBar(props: { player: PlayerDto; opponent?: PlayerDto; room: RoomDto }) {
  const { t } = useTranslation();

  const round = props.room.currentRound;
  const myStatus = round?.statusByPlayerId[props.player.id];
  const opponentStatus = props.opponent ? round?.statusByPlayerId[props.opponent.id] : undefined;

  return (
    <HStack w="100%" justify="space-between" wrap="nowrap" gap={10}>
      <VStack align="flex-start" gap={1}>
        <Text fontWeight="semibold">{t('room.playerStats.me')}</Text>
        <HStack gap={2}>
          <Text fontSize="sm">{t('room.playerStats.score')}</Text>
          <Badge>{props.player.score}</Badge>
        </HStack>
        <HStack gap={2}>
          <Text fontSize="sm">{t('room.playerStats.status')}</Text>
          <Badge>
            {myStatus ? t(getRoundPlayerStatusTextKey(myStatus)) : t('room.playerStats.dash')}
          </Badge>
        </HStack>
      </VStack>

      <VStack align="flex-end" textAlign="right" gap={1}>
        <Text fontWeight="semibold">{t('room.playerStats.opponent')}</Text>
        <HStack gap={2}>
          <Text fontSize="sm">{t('room.playerStats.score')}</Text>
          <Badge>{props.opponent ? props.opponent.score : t('room.playerStats.dash')}</Badge>
        </HStack>
        <HStack gap={2}>
          <Text fontSize="sm">{t('room.playerStats.status')}</Text>
          <Badge>
            {props.opponent
              ? opponentStatus
                ? t(getRoundPlayerStatusTextKey(opponentStatus))
                : t('room.playerStats.dash')
              : t('room.playerStats.dash')}
          </Badge>
        </HStack>
      </VStack>
    </HStack>
  );
}

function getRoundPlayerStatusTextKey(status: RoundPlayerStatus): string {
  switch (status) {
    case 'PLAYING':
      return 'room.playerStats.statusPlaying';
    case 'WON':
      return 'room.playerStats.statusWon';
    case 'LOST':
      return 'room.playerStats.statusLost';
    case 'READY':
      return 'room.playerStats.statusReady';
    default: {
      return 'room.playerStats.statusUnknown';
    }
  }
}
