import { Stack } from '@chakra-ui/react';
import { useMemo } from 'react';
import type { PlayerDto, RoomDto } from '../../../api/types';
import { MAX_GUESS_ATTEMPTS } from '../../../constants.ts';
import { useGuessRevealAnimation } from '../../../hooks/useGuessRevealAnimation';
import { type Cell, GuessRow } from './GuessRow';

export function PlayerBoard(props: {
  player: PlayerDto;
  opponent?: PlayerDto;
  room: RoomDto;
  currentGuess?: string;
}) {
  const round = props.room.currentRound;
  const roundNumber = round?.roundNumber;
  const maxAttempts = round?.maxAttempts ?? MAX_GUESS_ATTEMPTS;

  const guesses = useMemo(() => {
    return round?.guessesByPlayerId[props.player.id] ?? [];
  }, [round, props.player.id]);

  const { shouldAnimateGuess } = useGuessRevealAnimation({
    guesses,
    roundNumber,
    playerId: props.player.id,
  });

  const rows = Array.from({ length: maxAttempts }, (_, index) => {
    const guess = guesses.at(index);
    if (!guess) {
      const isNextPlayableRow = index === guesses.length;
      const showCurrentGuess = isNextPlayableRow && Boolean(props.currentGuess);
      return {
        key: showCurrentGuess ? 'current-guess' : `empty-${String(index)}`,
        word: showCurrentGuess ? (props.currentGuess ?? '') : '',
        letters: undefined as Cell[] | undefined,
        animateReveal: false,
      };
    }
    return {
      key: `guess-${String(guess.attemptNumber)}`,
      word: guess.word,
      letters: guess.letters,
      animateReveal: shouldAnimateGuess(guess),
    };
  });

  return (
    <Stack gap={3} align="center">
      <Stack gap={1} align="center">
        {rows.map((row) => (
          <GuessRow
            key={row.key}
            word={row.word}
            letters={row.letters}
            animateReveal={row.animateReveal}
          />
        ))}
      </Stack>
    </Stack>
  );
}
