import type { SystemStyleObject } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { WORD_LENGTH } from '../constants';

// Durations and gaps in milliseconds
const flipDuration = 175;
const flipStagger = 25;
const bounceDuration = 300;
const bounceStagger = 50;
const emphasisDuration = 300;
const arriveDuration = 300;
const letterDuration = 250;
const letterStagger = 70;
const scoreGap = 125;
const actionGap = 50;

const flipEnd = flipDuration + (WORD_LENGTH - 1) * flipStagger;
const boardStart = flipEnd;
const boardEnd = boardStart + bounceDuration + (WORD_LENGTH - 1) * bounceStagger;
const scoreStart = flipEnd + scoreGap;
const resultStart = Math.max(boardEnd, scoreStart + emphasisDuration);
const solutionStart = resultStart + arriveDuration;
const lettersStart = solutionStart + arriveDuration;
const solutionEnd = lettersStart + (WORD_LENGTH - 1) * letterStagger + letterDuration;
const winActionStart = resultStart + arriveDuration + actionGap;
const lossActionStart = solutionEnd + actionGap;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  45% { transform: translateY(-7px); }
`;
const emphasize = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(var(--match-scale)); }
`;
const arrive = keyframes`
  from { opacity: 0; transform: translateY(7px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const roundAnimations: SystemStyleObject = {
  '&[data-match-end]': {
    // Finish every flip before the board celebration starts.
    '& .guess-flip': {
      animationDuration: `${String(flipDuration)}ms`,
      animationDelay: `calc(var(--tile-index) * ${String(flipStagger)}ms)`,
    },
    '& .match-status-dot': {
      '--match-scale': '1.4',
      animation: `${emphasize} ${String(emphasisDuration)}ms ease-out`,
    },
    '& [data-winning-score]': {
      '--match-scale': '1.1',
      animation: `${emphasize} ${String(emphasisDuration)}ms ease-out ${String(scoreStart)}ms`,
    },
    '& [data-winning-score="me"]': { '--match-scale': '1.15' },
    '& .match-winner': {
      animation: `${arrive} ${String(arriveDuration)}ms ease-out ${String(resultStart)}ms both`,
    },
  },
  '&:is([data-match-end], [data-round-end])': {
    '& .match-result': {
      animation: `${arrive} ${String(arriveDuration)}ms ease-out ${String(resultStart)}ms both`,
    },
    '& .match-solution': {
      animation: `${arrive} ${String(arriveDuration)}ms ease-out ${String(solutionStart)}ms both`,
    },
    '& .solution-letter': {
      animation: `${arrive} ${String(letterDuration)}ms ease-out both`,
      animationDelay: `calc(${String(lettersStart)}ms + var(--letter-index) * ${String(letterStagger)}ms)`,
    },
    '& .match-play-again, & .round-action': {
      animation: `${arrive} ${String(arriveDuration)}ms ease-out ${String(winActionStart)}ms both`,
    },
  },
  '&[data-match-end="won"] .winning-row > .guess-tile': {
    animation: `${bounce} ${String(bounceDuration)}ms ease-out`,
    animationDelay: `calc(${String(boardStart)}ms + var(--tile-index) * ${String(bounceStagger)}ms)`,
  },
  '&[data-match-end="lost"] .match-play-again, &[data-round-end="lost"] .round-action': {
    animationDelay: `${String(lossActionStart)}ms`,
  },
};
