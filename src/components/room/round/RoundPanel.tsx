import { Stack } from '@chakra-ui/react';
import type { PlayerDto, RoomDto } from '../../../api/types';
import type { ReactNode } from 'react';
import { PlayerStatsBar } from './PlayerStatsBar';
import { RoundTitle } from './RoundTitle';

export function RoundPanel(props: {
  player: PlayerDto;
  opponent?: PlayerDto;
  room: RoomDto;
  chat?: ReactNode;
}) {
  const round = props.room.currentRound;

  return (
    <Stack gap={5}>
      {round || props.room.status === 'MATCH_FINISHED' ? (
        <RoundTitle
          roundNumber={round?.roundNumber}
          rounds={props.room.rounds}
          roomStatus={props.room.status}
          language={props.room.language}
          endElement={props.chat}
        />
      ) : null}
      <PlayerStatsBar player={props.player} opponent={props.opponent} room={props.room} />
    </Stack>
  );
}
