import { Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { PlayerDto, RoomDto, RoundStatus } from '../../../api/types';
import { PlayerStatsBar } from './PlayerStatsBar';

export function RoundPanel(props: { player: PlayerDto; opponent?: PlayerDto; room: RoomDto }) {
  const { t } = useTranslation();
  const round = props.room.currentRound;
  const roundNumberText =
    typeof round?.roundNumber === 'number' ? String(round.roundNumber) : t('room.playerStats.dash');

  const roundStatusLabel = (roundStatus: RoundStatus): string => {
    switch (roundStatus) {
      case 'PLAYING':
        return t('room.round.statusPlaying');
      case 'ENDED':
        return t('room.round.statusEnded');
    }
  };
  const roundStatusSuffix = round?.roundStatus ? `(${roundStatusLabel(round.roundStatus)})` : '';

  return (
    <Stack>
      <Text fontWeight="bold" textAlign="center">
        {t('room.round.title', { roundNumber: roundNumberText })} {roundStatusSuffix}
      </Text>
      <PlayerStatsBar player={props.player} opponent={props.opponent} room={props.room} />
    </Stack>
  );
}
