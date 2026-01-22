import { Box, HStack } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import type { GuessLetterStatus } from '../../../api/types';
import { WORD_LENGTH } from '../../../constants';
import { getLetterColorByStatus } from '../../../utils/getLetterColorByStatus.ts';

export interface Cell {
  letter: string;
  status?: GuessLetterStatus;
}

const REVEAL_DURATION_MS = 500;
const REVEAL_STAGGER_MS = 325;

const TYPING_POP_DURATION_MS = 120;

const typingPop = keyframes`
  0% {
    transform: scale(1);
  }
  55% {
    transform: scale(1.18);
  }
  100% {
    transform: scale(1);
  }
`;

const cellFlip = keyframes`
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(180deg);
  }
`;

const TILE_SIZE = '3.25rem';

const tileProps = {
  width: 'full',
  height: 'full',
  borderWidth: '1px',
  bg: 'transparent',
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '2xl',
  borderRadius: 'sm',
  overflow: 'hidden',
} as const;

const faceProps = {
  width: 'full',
  height: 'full',
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backfaceVisibility: 'hidden',
} as const;

export function GuessRow({
  word,
  letters: cells,
  animateReveal,
}: {
  word: string;
  letters?: Cell[];
  animateReveal?: boolean;
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
          revealDelayMs={idx * REVEAL_STAGGER_MS}
          revealDurationMs={REVEAL_DURATION_MS}
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
  const bg = status ? getLetterColorByStatus(status) : 'transparent';
  const trimmedLetter = letter.trim();

  const shouldAnimateTyping = !status && trimmedLetter.length > 0;
  const typingAnimation = shouldAnimateTyping
    ? `${typingPop} ${String(TYPING_POP_DURATION_MS)}ms ease-out`
    : undefined;

  const shouldAnimateRevealCell = Boolean(animateReveal && status);
  const revealAnimation = shouldAnimateRevealCell
    ? `${cellFlip} ${String(revealDurationMs)}ms ease-out forwards`
    : undefined;
  const revealAnimationDelay = shouldAnimateRevealCell ? `${String(revealDelayMs)}ms` : undefined;

  // If there is a status, but we're not animating, show the "back" face.
  const finalTransform = status ? 'rotateX(180deg)' : 'rotateX(0deg)';

  return (
    <Box boxSize={TILE_SIZE} position="relative" perspective="600px">
      <Box
        key={status ? 'revealed' : letter}
        {...tileProps}
        willChange={typingAnimation ? 'transform' : undefined}
        animation={typingAnimation}
      >
        <Box
          width="full"
          height="full"
          position="relative"
          transformStyle="preserve-3d"
          transformOrigin="center"
          willChange={shouldAnimateRevealCell ? 'transform' : undefined}
          transform={shouldAnimateRevealCell ? undefined : finalTransform}
          animation={revealAnimation}
          animationDelay={revealAnimationDelay}
        >
          {/* Front face (pre-reveal) */}
          <Box {...faceProps} bg="transparent">
            {letter}
          </Box>

          {/* Back face (revealed) */}
          <Box {...faceProps} bg={bg} transform="rotateX(180deg)">
            {letter}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
