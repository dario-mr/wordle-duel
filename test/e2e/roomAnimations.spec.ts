import { expect, test, type Locator } from '@playwright/test';
import type { GuessDto, RoomDto } from '../../src/features/rooms/types';
import { liveRoom, openRoom, winningGuess } from './testHelpers';

const lostGuesses: GuessDto[] = ['CANTO', 'PIANO', 'SASSO', 'MOLTO', 'GATTO', 'FALSO'].map(
  (word, index) => ({
    word,
    attemptNumber: index + 1,
    letters: Array.from(word, (letter) => ({ letter, status: 'ABSENT' })),
  }),
);
const won = { playerStatus: 'WON', guesses: [winningGuess], word: 'verde' } as const;
const lost = { playerStatus: 'LOST', guesses: lostGuesses, word: 'falso' } as const;
const result = '.match-result';
const score = '[data-winning-score]';
const bounce = '.winning-row > .guess-tile';
const flip = '.guess-flip';
const solution = '.match-solution';
const letters = '.solution-letter';
const rematch = '.match-play-again';
const next = '.round-action';

const cases = [
  {
    name: 'match win',
    scope: 'match',
    outcome: 'won',
    ...won,
    scores: [3, 2],
    message: '🏆 You won the match',
    action: 'Play again',
    winnerCount: 1,
    order: [
      [flip, bounce],
      [bounce, result],
      [score, result],
      [result, rematch],
    ],
  },
  {
    name: 'match loss',
    scope: 'match',
    outcome: 'lost',
    ...lost,
    scores: [2, 3],
    message: 'You lost this match',
    action: 'Play again',
    winnerCount: 1,
    order: [
      [flip, score],
      [score, result],
      [result, solution],
      [solution, letters],
      [letters, rematch],
    ],
  },
  {
    name: 'match draw',
    scope: 'match',
    outcome: 'draw',
    ...won,
    scores: [29, 29],
    message: 'The match is a draw',
    action: 'Play again',
    winnerCount: 0,
    order: [
      [flip, result],
      [result, rematch],
    ],
  },
  {
    name: 'round win',
    scope: 'round',
    outcome: 'won',
    ...won,
    scores: [1, 0],
    message: 'You won this round',
    action: 'Next round',
    winnerCount: 0,
    order: [[result, next]],
  },
  {
    name: 'round loss',
    scope: 'round',
    outcome: 'lost',
    ...lost,
    scores: [0, 1],
    message: 'You lost this round',
    action: 'Next round',
    winnerCount: 0,
    order: [
      [result, solution],
      [solution, letters],
      [letters, next],
    ],
  },
] as const;

// Read browser timings, including the final staggered tile/letter, without importing app constants.
async function animationTiming(targets: Locator) {
  const timings = await targets.evaluateAll((elements) =>
    elements
      .map((element) => getComputedStyle(element))
      .filter((style) => style.animationName !== 'none')
      .map((style) => ({
        start: parseFloat(style.animationDelay),
        end: parseFloat(style.animationDelay) + parseFloat(style.animationDuration),
      })),
  );
  expect(timings.length, `No animation on ${targets.toString()}`).toBeGreaterThan(0);
  return {
    start: Math.min(...timings.map((item) => item.start)),
    end: Math.max(...timings.map((item) => item.end)),
  };
}

function runningAnimations(root: Locator) {
  return root.evaluate(
    (element) =>
      element
        .getAnimations({ subtree: true })
        .filter(
          (animation) => animation instanceof CSSAnimation && animation.playState === 'running',
        ).length,
  );
}

for (const scenario of cases) {
  test.describe(scenario.name, () => {
    const room = liveRoom('animation-room');
    const currentRound = {
      ...room.currentRound,
      roundNumber: scenario.scope === 'match' ? 5 : 2,
      guesses: scenario.guesses.slice(0, -1),
    };
    const initial: RoomDto = { ...room, currentRound };
    const complete: RoomDto = {
      ...initial,
      status: scenario.scope === 'match' ? 'MATCH_FINISHED' : 'IN_PROGRESS',
      players: initial.players.map((player, index) => ({
        ...player,
        matchScore: scenario.scores[index === 0 ? 0 : 1],
      })),
      currentRound: {
        ...currentRound,
        guesses: [...scenario.guesses],
        playerStatus: scenario.playerStatus,
        roundStatus: 'ENDED',
        solution: 'VERDE',
      },
    };
    const word = scenario.word;
    const rootSelector = `[data-${scenario.scope}-end]`;

    test.beforeEach(async ({ page }) => {
      await openRoom(page, initial, complete);
    });

    test('sequences the result and action after their preceding animations', async ({ page }) => {
      await page.keyboard.type(word);
      await page.keyboard.press('Enter');
      const root = page.locator(rootSelector);
      await expect(root).toHaveAttribute(`data-${scenario.scope}-end`, scenario.outcome);

      for (const [before, after] of scenario.order) {
        const preceding = await animationTiming(root.locator(before));
        const following = await animationTiming(root.locator(after));
        expect(following.start, `${after} must wait for ${before}`).toBeGreaterThanOrEqual(
          preceding.end,
        );
      }
      await expect(root.locator(result)).toHaveText(scenario.message);
      await expect(root.locator('.match-winner')).toHaveCount(scenario.winnerCount);
      await expect(page.getByRole('button', { name: scenario.action })).toBeVisible();
      if (scenario.scope === 'round') {
        expect(
          await root
            .locator('.guess-tile')
            .evaluateAll((tiles) =>
              tiles.every((tile) => getComputedStyle(tile).animationName === 'none'),
            ),
        ).toBe(true);
      }
    });

    test('does not replay completed animations on rerender', async ({ page }) => {
      await page.keyboard.type(word);
      await page.keyboard.press('Enter');
      const root = page.locator(rootSelector);
      await expect(root).toBeVisible();
      await expect.poll(() => runningAnimations(root)).toBe(0);
      await page.getByRole('button', { name: 'Open chat' }).click();
      expect(await runningAnimations(root)).toBe(0);
    });

    test('does not animate a completed result after reload', async ({ page }) => {
      await page.keyboard.type(word);
      await page.keyboard.press('Enter');
      await expect(page.locator(rootSelector)).toBeVisible();
      await page.reload();
      await expect(page.locator(result)).toHaveText(scenario.message);
      await expect(page.locator(rootSelector)).toHaveCount(0);
      await expect(page.getByRole('button', { name: scenario.action })).toBeVisible();
    });

    test('shows final tile faces and results immediately with reduced motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.keyboard.type(word);
      await page.keyboard.press('Enter');
      const root = page.locator(rootSelector);
      await expect(root).toBeVisible();
      expect(
        await root.evaluate((element) => element.getAnimations({ subtree: true }).length),
      ).toBe(0);
      const revealedFaces = await root.locator(flip).evaluateAll(
        (tiles, count) =>
          tiles.slice(0, count).map((tile) => {
            const transform = new DOMMatrix(getComputedStyle(tile).transform);
            return { y: transform.m22, z: transform.m33 };
          }),
        scenario.guesses.length * 5,
      );
      expect(revealedFaces).toEqual(
        Array.from({ length: scenario.guesses.length * 5 }, () => ({ y: -1, z: -1 })),
      );
      await expect(root.locator(result)).toHaveText(scenario.message);
      await expect(page.getByRole('button', { name: scenario.action })).toBeVisible();
    });
  });
}
