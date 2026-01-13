import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { GuessDto } from '../api/types';

export function useGuessRevealAnimation(args: {
  guesses: GuessDto[];
  roundNumber: number | undefined;
  playerId: string;
}) {
  const [animatedAttemptNumber, setAnimatedAttemptNumber] = useState<number | null>(null);

  const prevSnapshotRef = useRef({
    roundNumber: args.roundNumber,
    playerId: args.playerId,
    guessCount: args.guesses.length,
  });

  useLayoutEffect(() => {
    const prev = prevSnapshotRef.current;
    const next = {
      roundNumber: args.roundNumber,
      playerId: args.playerId,
      guessCount: args.guesses.length,
    };

    const contextChanged = prev.roundNumber !== next.roundNumber || prev.playerId !== next.playerId;
    let nextAnimatedAttemptNumber: number | null = null;

    if (!contextChanged && next.guessCount > prev.guessCount) {
      nextAnimatedAttemptNumber = args.guesses.at(-1)?.attemptNumber ?? null;
    }

    prevSnapshotRef.current = next;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnimatedAttemptNumber((current) =>
      current === nextAnimatedAttemptNumber ? current : nextAnimatedAttemptNumber,
    );
  }, [args.guesses, args.playerId, args.roundNumber]);

  const shouldAnimateGuess = useCallback(
    (guess: GuessDto | undefined) => {
      if (!guess || animatedAttemptNumber === null) {
        return false;
      }

      return guess.attemptNumber === animatedAttemptNumber;
    },
    [animatedAttemptNumber],
  );

  return { shouldAnimateGuess };
}
