import { Stack } from '@chakra-ui/react';
import type { PlayerDto, RoomDto } from '../../../api/types';
import { type Cell, GuessRow } from './GuessRow';
import { MAX_GUESS_ATTEMPTS } from '../../../constants.ts';

export function PlayerBoard(props: {
  player: PlayerDto;
  opponent?: PlayerDto;
  room: RoomDto;
  currentGuess?: string;
}) {
  const round = props.room.currentRound;
  const guesses = round?.guessesByPlayerId[props.player.id] ?? [];
  const maxAttempts = round?.maxAttempts ?? MAX_GUESS_ATTEMPTS;

  const rows = Array.from({ length: maxAttempts }, (_, index) => {
    const guess = guesses.at(index);
    if (!guess) {
      const isNextPlayableRow = index === guesses.length;
      const showCurrentGuess = isNextPlayableRow && Boolean(props.currentGuess);
      return {
        key: showCurrentGuess ? 'current-guess' : `empty-${String(index)}`,
        word: showCurrentGuess ? (props.currentGuess ?? '') : '',
        letters: undefined as Cell[] | undefined,
      };
    }
    return {
      key: `guess-${String(guess.attemptNumber)}`,
      word: guess.word,
      letters: guess.letters,
    };
  });

  return (
    <Stack gap={3} align="center">
      <Stack gap={1} align="center">
        {rows.map((row) => (
          <GuessRow key={row.key} word={row.word} letters={row.letters} />
        ))}
      </Stack>
    </Stack>
  );
}
