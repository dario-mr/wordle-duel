import { Stack } from '@chakra-ui/react';
import type { PlayerDto, RoomDto } from '../../../api/types';
import { PlayerStatsBar } from './PlayerStatsBar';
import { RoundTitle } from './RoundTitle';

export function RoundPanel(props: { player: PlayerDto; opponent?: PlayerDto; room: RoomDto }) {
  const round = props.room.currentRound;

  return (
    <Stack gap={3}>
      <RoundTitle roundNumber={round?.roundNumber} roundStatus={round?.roundStatus} />
      <PlayerStatsBar player={props.player} opponent={props.opponent} room={props.room} />
    </Stack>
  );
}
