import { Separator, Stack, Text } from '@chakra-ui/react';
import type { PlayerDto, RoomDto, RoundStatus } from '../../api/types';
import { type Cell, GuessRow } from './GuessRow';
import { PlayerStatsBar } from './PlayerStatsBar';

export function PlayerBoard(props: { player: PlayerDto; opponent?: PlayerDto; room: RoomDto }) {
  const round = props.room.currentRound;
  const guesses = round?.guessesByPlayerId[props.player.id] ?? [];
  const maxAttempts = round?.maxAttempts ?? 6;

  const rows = Array.from({ length: maxAttempts }, (_, index) => {
    const guess = guesses.at(index);
    if (!guess) {
      return { key: `empty-${String(index)}`, word: '', letters: undefined as Cell[] | undefined };
    }
    return {
      key: `guess-${String(guess.attemptNumber)}`,
      word: guess.word,
      letters: guess.letters,
    };
  });

  return (
    <Stack gap={3} align="center">
      <Text fontWeight="bold">
        Round {round?.roundNumber ?? '—'}{' '}
        {round?.roundStatus ? '(' + roundStatusText(round.roundStatus) + ')' : ''}
      </Text>
      <PlayerStatsBar player={props.player} opponent={props.opponent} room={props.room} />
      <Separator w="100%" />

      <Stack gap={2} align="center">
        {rows.map((row) => (
          <GuessRow key={row.key} word={row.word} letters={row.letters} />
        ))}
      </Stack>
    </Stack>
  );
}

function roundStatusText(roundStatus: RoundStatus): string {
  switch (roundStatus) {
    case 'PLAYING':
      return 'in progress';
    case 'ENDED':
      return 'ended';
  }
}
