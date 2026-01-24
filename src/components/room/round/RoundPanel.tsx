import { Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { PlayerDto, RoomDto } from '../../../api/types';
import { roundStatusTextKey } from '../../../utils/roomStatusText';
import { PlayerStatsBar } from './PlayerStatsBar';

export function RoundPanel(props: { player: PlayerDto; opponent?: PlayerDto; room: RoomDto }) {
  const { t } = useTranslation();
  const round = props.room.currentRound;
  const roundNumberText =
    typeof round?.roundNumber === 'number' ? String(round.roundNumber) : t('room.playerStats.dash');

  const roundStatusSuffix = round?.roundStatus
    ? `(${t(roundStatusTextKey[round.roundStatus])})`
    : '';

  return (
    <Stack>
      <Text fontWeight="bold" textAlign="center">
        {t('room.round.title', { roundNumber: roundNumberText })} {roundStatusSuffix}
      </Text>
      <PlayerStatsBar player={props.player} opponent={props.opponent} room={props.room} />
    </Stack>
  );
}
