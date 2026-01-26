import { Grid, HStack, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { PlayerDto, RoomDto, RoundPlayerStatus } from '../../../api/types';
import { roundPlayerStatusTextKey } from '../../../utils/roomStatusText';
import { Card } from '../../common/Card';
import { RoundPlayerStatusIcon } from '../../common/RoundPlayerStatusIcon';
import { getRoundPlayerIcon } from '../../../utils/roomStatusVisuals';

export function PlayerStatsBar(props: { player: PlayerDto; opponent?: PlayerDto; room: RoomDto }) {
  const { t } = useTranslation();

  const round = props.room.currentRound;
  const myStatus = round?.statusByPlayerId[props.player.id];
  const opponentStatus = props.opponent ? round?.statusByPlayerId[props.opponent.id] : undefined;

  const DASH = t('room.playerStats.dash');

  const formatStatus = (status: RoundPlayerStatus | undefined) =>
    status ? t(roundPlayerStatusTextKey[status]) : DASH;

  const meName = `${props.player.displayName} (${t('room.playerStats.me')})`;
  const opponentName = props.opponent?.displayName ?? t('room.playerStats.opponent');
  const opponentScore = props.opponent?.score ?? DASH;

  const meIcon = getRoundPlayerIcon(myStatus);
  const opponentIcon = getRoundPlayerIcon(opponentStatus);

  return (
    <Card borderLeftWidth="default" borderLeftColor="default" p={3}>
      <Grid w="100%" templateColumns="1fr auto 1fr" columnGap={10} alignItems="center">
        <VStack align="flex-start" gap={2} minW={0}>
          <Text fontWeight="semibold">{meName}</Text>
          <HStack gap={2} minW={0}>
            <RoundPlayerStatusIcon bg={meIcon.bg} color={meIcon.fg} label={meIcon.label} />
            <Text fontSize="sm" opacity="0.7" truncate>
              {formatStatus(myStatus)}
            </Text>
          </HStack>
        </VStack>

        <HStack justify="center" wrap="nowrap" gap={2}>
          <Text fontWeight="semibold" flexShrink={0}>
            {props.player.score}
          </Text>
          <Text opacity="0.5">{DASH}</Text>
          <Text fontWeight="semibold" flexShrink={0}>
            {opponentScore}
          </Text>
        </HStack>

        <VStack align="flex-end" textAlign="right" gap={2} minW={0}>
          <Text fontWeight="semibold">{opponentName}</Text>
          <HStack gap={2} minW={0} justify="flex-end">
            <RoundPlayerStatusIcon
              bg={opponentIcon.bg}
              color={opponentIcon.fg}
              label={opponentIcon.label}
            />
            <Text fontSize="sm" opacity="0.7" truncate>
              {formatStatus(opponentStatus)}
            </Text>
          </HStack>
        </VStack>
      </Grid>
    </Card>
  );
}
