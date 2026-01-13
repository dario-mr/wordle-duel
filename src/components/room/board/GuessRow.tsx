import { Box, HStack } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import type { GuessLetterStatus } from '../../../api/types';
import { WORD_LENGTH } from '../../../constants';
import { getLetterColorByStatus } from '../../../utils/getLetterColorByStatus.ts';

export interface Cell {
  letter: string;
  status?: GuessLetterStatus;
}

const DEFAULT_GUESS_REVEAL_DURATION_MS = 550;
const DEFAULT_GUESS_REVEAL_STAGGER_MS = 325;

const letterReveal = keyframes`
  0% {
    opacity: 0;
    transform: perspective(600px) rotateX(90deg)
  }
  40% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: perspective(600px) rotateX(0deg);
  }
`;

export function GuessRow({
  word,
  letters: cells,
  animateReveal,
  revealDurationMs = DEFAULT_GUESS_REVEAL_DURATION_MS,
  revealStaggerMs = DEFAULT_GUESS_REVEAL_STAGGER_MS,
}: {
  word: string;
  letters?: Cell[];
  animateReveal?: boolean;
  revealDurationMs?: number;
  revealStaggerMs?: number;
}) {
  const letters: Cell[] =
    cells?.length === WORD_LENGTH
      ? cells
      : word
          .padEnd(WORD_LENGTH, ' ')
          .slice(0, WORD_LENGTH)
          .split('')
          .map((ch) => ({ letter: ch }));

  const shouldAnimateReveal = Boolean(animateReveal && cells?.length === WORD_LENGTH);

  return (
    <HStack gap={1} justify="center">
      {letters.map((l, idx) => (
        <LetterCell
          key={idx}
          letter={l.letter}
          status={l.status}
          animateReveal={shouldAnimateReveal}
          revealDelayMs={idx * revealStaggerMs}
          revealDurationMs={revealDurationMs}
        />
      ))}
    </HStack>
  );
}

function LetterCell({
  letter,
  status,
  animateReveal,
  revealDelayMs,
  revealDurationMs,
}: {
  letter: string;
  status?: GuessLetterStatus;
  animateReveal: boolean;
  revealDelayMs: number;
  revealDurationMs: number;
}) {
  const shouldAnimate = Boolean(animateReveal && status);
  const bg = status ? getLetterColorByStatus(status) : 'transparent';
  const animation = shouldAnimate
    ? `${letterReveal} ${String(revealDurationMs)}ms ease-out forwards`
    : undefined;
  const animationDelay = shouldAnimate ? `${String(revealDelayMs)}ms` : undefined;

  return (
    <Box
      boxSize="3.25rem"
      borderWidth="1px"
      bg="transparent"
      color="inherit"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="bold"
      fontSize="2xl"
      borderRadius="sm"
      overflow="hidden"
      position="relative"
    >
      <Box
        width="full"
        height="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        zIndex={2}
      >
        {letter}
      </Box>

      {status && (
        <Box
          aria-hidden
          width="full"
          height="full"
          position="absolute"
          inset={0}
          zIndex={1}
          bg={bg}
          backfaceVisibility="hidden"
          transformOrigin="center"
          transformStyle="preserve-3d"
          willChange={shouldAnimate ? 'transform, opacity' : undefined}
          opacity={shouldAnimate ? 0 : 1}
          animation={animation}
          animationDelay={animationDelay}
        />
      )}
    </Box>
  );
}
