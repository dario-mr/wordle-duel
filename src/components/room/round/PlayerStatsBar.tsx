import { Box, Grid, HStack, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { PlayerDto, RoomDto } from '../../../api/types';

export function PlayerStatsBar(props: { player: PlayerDto; opponent?: PlayerDto; room: RoomDto }) {
  const { t } = useTranslation();

  const DASH = t('room.playerStats.dash');
  const meName = `${props.player.displayName} (${t('room.playerStats.me')})`;
  const opponentName = props.opponent?.displayName ?? t('room.playerStats.opponent');
  const meScore = props.player.matchScore ?? DASH;
  const opponentScore = props.opponent?.matchScore ?? DASH;
  const isMatchComplete = props.room.status === 'MATCH_FINISHED';
  const meIsWinner =
    isMatchComplete &&
    props.player.matchScore != null &&
    props.opponent?.matchScore != null &&
    props.player.matchScore > props.opponent.matchScore;
  const opponentIsWinner =
    isMatchComplete &&
    props.player.matchScore != null &&
    props.opponent?.matchScore != null &&
    props.opponent.matchScore > props.player.matchScore;
  const meScoreColor = opponentIsWinner ? 'fg.muted' : 'fg';
  const opponentScoreColor = meIsWinner ? 'fg.muted' : 'fg';
  const winnerLabel = t('room.playerStats.winner');

  return (
    <Grid
      w="full"
      templateColumns="minmax(0, 1fr) auto minmax(0, 1fr)"
      columnGap={2}
      alignItems="stretch"
      borderBottomWidth="1px"
      borderColor="border.divider"
      pb={4}
    >
      <VStack align="center" justify="center" textAlign="center" gap={2} minW={0}>
        <Text fontSize="md" fontWeight="semibold" truncate w="full">
          {meName}
        </Text>
        {meIsWinner && (
          <Text color="fg.warning" fontSize="sm" fontWeight="bold" whiteSpace="nowrap">
            <Box as="span" aria-hidden="true">
              🏆
            </Box>{' '}
            {winnerLabel}
          </Text>
        )}
      </VStack>

      <HStack
        justify="center"
        gap={2}
        px={6}
        borderLeftWidth="1px"
        borderRightWidth="1px"
        borderColor="border.divider"
        whiteSpace="nowrap"
      >
        <Text fontSize="3xl" lineHeight="1" fontWeight="bold" color={meScoreColor}>
          {meScore}
        </Text>
        <Text fontSize="2xl" lineHeight="1" color="fg.subtle">
          {DASH}
        </Text>
        <Text fontSize="3xl" lineHeight="1" fontWeight="bold" color={opponentScoreColor}>
          {opponentScore}
        </Text>
      </HStack>

      <VStack align="center" justify="center" textAlign="center" gap={1} minW={0}>
        <Text fontSize="md" fontWeight="semibold" truncate w="full">
          {opponentName}
        </Text>
        {opponentIsWinner && (
          <Text color="fg.warning" fontSize="sm" fontWeight="bold" whiteSpace="nowrap">
            <Box as="span" aria-hidden="true">
              🏆
            </Box>{' '}
            {winnerLabel}
          </Text>
        )}
      </VStack>
    </Grid>
  );
}
