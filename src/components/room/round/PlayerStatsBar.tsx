import { Badge, HStack, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { PlayerDto, RoomDto, RoundPlayerStatus } from '../../../api/types';
import { roundPlayerStatusTextKey } from '../../../utils/roomStatusText';

export function PlayerStatsBar(props: { player: PlayerDto; opponent?: PlayerDto; room: RoomDto }) {
  const { t } = useTranslation();

  const round = props.room.currentRound;
  const myStatus = round?.statusByPlayerId[props.player.id];
  const opponentStatus = props.opponent ? round?.statusByPlayerId[props.opponent.id] : undefined;

  const DASH = t('room.playerStats.dash');
  const scoreLabel = t('room.playerStats.score');
  const statusLabel = t('room.playerStats.status');

  const formatStatus = (status: RoundPlayerStatus | undefined) =>
    status ? t(roundPlayerStatusTextKey[status]) : DASH;

  const meName = `${props.player.displayName} (${t('room.playerStats.me')})`;
  const opponentName = props.opponent?.displayName ?? t('room.playerStats.opponent');
  const opponentScore = props.opponent?.score ?? DASH;

  return (
    <HStack w="100%" justify="space-between" wrap="nowrap" gap={10}>
      <VStack align="flex-start" gap={1}>
        <Text fontWeight="semibold">{meName}</Text>
        <HStack gap={2}>
          <Text fontSize="sm">{scoreLabel}</Text>
          <Badge>{props.player.score}</Badge>
        </HStack>
        <HStack gap={2}>
          <Text fontSize="sm">{statusLabel}</Text>
          <Badge>{formatStatus(myStatus)}</Badge>
        </HStack>
      </VStack>

      <VStack align="flex-end" textAlign="right" gap={1}>
        <Text fontWeight="semibold">{opponentName}</Text>
        <HStack gap={2}>
          <Text fontSize="sm">{scoreLabel}</Text>
          <Badge>{opponentScore}</Badge>
        </HStack>
        <HStack gap={2}>
          <Text fontSize="sm">{statusLabel}</Text>
          <Badge>{formatStatus(opponentStatus)}</Badge>
        </HStack>
      </VStack>
    </HStack>
  );
}
