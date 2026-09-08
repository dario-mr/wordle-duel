import { expect, test } from '@playwright/test';
import {
  fulfillJson,
  mockAuthenticatedSession,
  mockUnauthenticatedSession,
  roomDto,
} from './testHelpers';
import type { RoomDto } from '../../src/features/rooms/types';

function liveRoom(roomId: string): RoomDto {
  return {
    id: roomId,
    language: 'IT',
    rounds: 5,
    status: 'IN_PROGRESS',
    rematchRequested: false,
    players: [
      { id: 'user-1', wins: 0, matchScore: 0, displayName: 'Alice Example' },
      { id: 'user-2', wins: 0, matchScore: 0, displayName: 'Bob Example' },
    ],
    currentRound: {
      roundNumber: 1,
      maxAttempts: 6,
      guesses: [],
      playerStatus: 'PLAYING',
      roundStatus: 'PLAYING',
    },
  };
}

test.describe('room page flow', () => {
  test('redirects unauthenticated users to login with a returnTo value', async ({ page }) => {
    await mockUnauthenticatedSession(page);

    await page.goto('/rooms/room-private');

    await expect(page).toHaveURL(/\/login\?returnTo=%2Frooms%2Froom-private$/);
    await expect(page.getByRole('heading', { name: 'Login required' })).toBeVisible();

    const storedReturnTo = await page.evaluate(() =>
      window.sessionStorage.getItem('wd.auth.returnTo'),
    );
    expect(storedReturnTo).toBe('/rooms/room-private');
  });

  test('lets an authenticated non-player join a waiting room', async ({ page }) => {
    await mockAuthenticatedSession(page);

    await page.route('**/api/v1/rooms/room-join-me', async (route) => {
      await fulfillJson(
        route,
        roomDto('room-join-me', { playerId: 'user-2', displayName: 'Bob Example' }),
      );
    });

    await page.route('**/api/v1/rooms/room-join-me/join', async (route) => {
      await fulfillJson(route, {
        ...roomDto('room-join-me'),
        players: [
          { id: 'user-2', wins: 0, matchScore: null, displayName: 'Bob Example' },
          { id: 'user-1', wins: 0, matchScore: null, displayName: 'Alice Example' },
        ],
      });
    });

    await page.goto('/rooms/room-join-me');

    await expect(page.getByText('Join this room')).toBeVisible();
    await page.getByRole('button', { name: 'Join' }).click();

    await expect(page).toHaveURL(/\/rooms\/room-join-me$/);
    await expect(page.getByText('Waiting for opponent...')).toBeVisible();
  });

  test('shows the completed board until the player starts the next round', async ({ page }) => {
    await mockAuthenticatedSession(page);

    const initialRoom = liveRoom('room-live');
    const completedRoom = {
      ...initialRoom,
      currentRound: {
        ...initialRoom.currentRound,
        guesses: [
          {
            word: 'APPLE',
            attemptNumber: 1,
            letters: [
              { letter: 'A', status: 'CORRECT' },
              { letter: 'P', status: 'CORRECT' },
              { letter: 'P', status: 'CORRECT' },
              { letter: 'L', status: 'CORRECT' },
              { letter: 'E', status: 'CORRECT' },
            ],
          },
        ],
        playerStatus: 'WON',
        roundStatus: 'PLAYING',
      },
    };
    const nextRoom = {
      ...initialRoom,
      currentRound: {
        roundNumber: 2,
        maxAttempts: 6,
        guesses: [],
        playerStatus: 'PLAYING',
        roundStatus: 'PLAYING',
      },
    };

    await page.route('**/api/v1/rooms/room-live', async (route) => {
      await fulfillJson(route, initialRoom);
    });

    await page.route('**/api/v1/rooms/room-live/messages', async (route) => {
      await fulfillJson(route, { messages: [], unreadCount: 0 });
    });

    await page.route('**/api/v1/rooms/room-live/guess', async (route) => {
      expect(route.request().postDataJSON()).toEqual({ word: 'APPLE' });
      await fulfillJson(route, { room: completedRoom });
    });

    await page.route('**/api/v1/rooms/room-live/next', async (route) => {
      await fulfillJson(route, nextRoom);
    });

    await page.goto('/rooms/room-live');

    const enterButton = page.getByRole('button', { name: 'Enter' });
    await expect(enterButton).toBeDisabled();

    await page.keyboard.type('apple');
    await expect(enterButton).toBeEnabled();

    await page.keyboard.press('Enter');

    await expect(enterButton).toHaveCount(0);
    await expect(page.getByText('You won this round')).toBeVisible();
    await page.getByRole('button', { name: 'Next round' }).click();
    await expect(enterButton).toBeDisabled();
  });
});

for (const outcome of ['won', 'lost', 'draw'] as const) {
  test(`animates a ${outcome} match on load and respects reduced motion`, async ({ page }) => {
    await mockAuthenticatedSession(page);
    const initial = liveRoom('match-end');
    const initialRound = initial.currentRound;
    if (!initialRound) {
      throw new Error('Expected liveRoom to include a current round');
    }
    const complete: RoomDto = {
      ...initial,
      status: 'MATCH_FINISHED',
      players: initial.players.map((player, index) => ({
        ...player,
        matchScore:
          outcome === 'draw' ? 29 : (outcome === 'won' ? index === 0 : index === 1) ? 3 : 2,
      })),
      currentRound: {
        ...initialRound,
        playerStatus: outcome === 'lost' ? 'LOST' : 'WON',
        roundStatus: 'ENDED',
        solution: 'APPLE',
        guesses: [
          {
            word: 'APPLE',
            attemptNumber: 1,
            letters: Array.from('APPLE', (letter) => ({ letter, status: 'CORRECT' })),
          },
        ],
      },
    };
    let room = initial;
    await page.route('**/api/v1/rooms/match-end', (route) => fulfillJson(route, room));
    await page.route('**/api/v1/rooms/match-end/messages', (route) =>
      fulfillJson(route, { messages: [], unreadCount: 0 }),
    );
    await page.route('**/api/v1/rooms/match-end/messages/read', (route) =>
      fulfillJson(route, { messages: [], unreadCount: 0 }),
    );
    await page.route('**/api/v1/rooms/match-end/guess', (route) => {
      room = complete;
      return fulfillJson(route, { room });
    });

    await page.goto('/rooms/match-end');
    await expect(page.getByRole('button', { name: 'Enter' })).toBeDisabled();
    await page.keyboard.type('apple');
    await page.keyboard.press('Enter');
    const root = page.locator('[data-match-end]');
    await expect(root).toHaveAttribute('data-match-end', outcome);
    const sequence = await root.evaluate((element) => {
      const targets = [
        ...(element.getAttribute('data-match-end') === 'draw' ? [] : ['[data-winning-score]']),
        '.match-result',
        '.guess-flip',
        '.match-play-again',
        ...(element.getAttribute('data-match-end') === 'won'
          ? ['.winning-row > .guess-tile']
          : element.getAttribute('data-match-end') === 'lost'
            ? ['.match-solution', '.solution-letter']
            : []),
      ];
      return targets.map((selector) => {
        const target = element.querySelector(selector);
        if (!target) {
          throw new Error(`Missing animation target: ${selector}`);
        }
        const style = getComputedStyle(target);
        return {
          selector,
          name: style.animationName,
          delay: style.animationDelay,
          duration: style.animationDuration,
          lastDelay: getComputedStyle(
            Array.from(element.querySelectorAll(selector)).at(-1) ?? target,
          ).animationDelay,
        };
      });
    });
    expect(sequence.every((entry) => entry.name !== 'none')).toBe(true);
    const timing = (selector: string) => {
      const entry = sequence.find((item) => item.selector === selector);
      if (!entry) {
        throw new Error(`Missing timing: ${selector}`);
      }
      return {
        start: parseFloat(entry.delay),
        end: parseFloat(entry.lastDelay) + parseFloat(entry.duration),
      };
    };

    if (outcome === 'won') {
      expect(timing('.winning-row > .guess-tile').start).toBeGreaterThanOrEqual(
        timing('.guess-flip').end,
      );
      expect(timing('.match-result').start).toBeGreaterThanOrEqual(
        timing('.winning-row > .guess-tile').end,
      );
    }
    if (outcome !== 'draw') {
      expect(timing('.match-result').start).toBeGreaterThanOrEqual(
        timing('[data-winning-score]').end,
      );
    } else {
      await expect(page.getByText('The match is a draw')).toBeVisible();
      await expect(page.getByText('You lost this match')).toHaveCount(0);
      await expect(root.locator('[data-winning-score], .match-winner')).toHaveCount(0);
    }
    if (outcome === 'lost') {
      expect(timing('.match-solution').start).toBeGreaterThanOrEqual(timing('.match-result').end);
      expect(timing('.solution-letter').start).toBeGreaterThanOrEqual(
        timing('.match-solution').end,
      );
      expect(timing('.match-play-again').start).toBeGreaterThanOrEqual(
        timing('.solution-letter').end,
      );
    } else {
      expect(timing('.match-play-again').start).toBeGreaterThanOrEqual(timing('.match-result').end);
    }
    await expect
      .poll(() =>
        root.evaluate(
          (element) =>
            element
              .getAnimations({ subtree: true })
              .filter(
                (animation) =>
                  animation instanceof CSSAnimation && animation.playState === 'running',
              ).length,
        ),
      )
      .toBe(0);
    // Opening chat causes a normal rerender; completed animations must stay finished.
    await page.getByRole('button', { name: 'Open chat' }).click();
    expect(
      await root.evaluate(
        (element) =>
          element
            .getAnimations({ subtree: true })
            .filter(
              (animation) => animation instanceof CSSAnimation && animation.playState === 'running',
            ).length,
      ),
    ).toBe(0);

    await page.reload();
    await expect(page.getByRole('button', { name: 'Play again' })).toBeVisible();
    await expect(root).toHaveCount(0);

    room = initial;
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await expect(page.getByRole('button', { name: 'Enter' })).toBeDisabled();
    await page.keyboard.type('apple');
    await page.keyboard.press('Enter');
    await expect(root).toHaveAttribute('data-match-end', outcome);
    expect(await root.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(
      0,
    );
    const revealedFace = await root
      .locator('.guess-flip')
      .first()
      .evaluate((element) => {
        const transform = new DOMMatrix(getComputedStyle(element).transform);
        return { y: transform.m22, z: transform.m33 };
      });
    expect(revealedFace).toEqual({ y: -1, z: -1 });
    await expect(page.getByRole('button', { name: 'Play again' })).toBeVisible();
  });
}

for (const outcome of ['WON', 'LOST'] as const) {
  test(`animates only the bottom panel when a round is ${outcome}`, async ({ page }) => {
    await mockAuthenticatedSession(page);
    let room = liveRoom('round-end');
    const round = room.currentRound;
    if (!round) {
      throw new Error('Expected a current round');
    }
    await page.route('**/api/v1/rooms/round-end', (route) => fulfillJson(route, room));
    await page.route('**/api/v1/rooms/round-end/messages', (route) =>
      fulfillJson(route, { messages: [], unreadCount: 0 }),
    );
    await page.route('**/api/v1/rooms/round-end/guess', (route) => {
      room = { ...room, currentRound: { ...round, playerStatus: outcome, solution: 'APPLE' } };
      return fulfillJson(route, { room });
    });
    await page.goto('/rooms/round-end');
    await expect(page.getByRole('button', { name: 'Enter' })).toBeDisabled();
    await page.keyboard.type('apple');
    await page.keyboard.press('Enter');
    const root = page.locator('[data-round-end]');
    await expect(root).toHaveAttribute('data-round-end', outcome.toLowerCase());
    for (const selector of [
      '.match-result',
      '.round-action',
      ...(outcome === 'LOST' ? ['.match-solution', '.solution-letter'] : []),
    ]) {
      expect(
        await root
          .locator(selector)
          .first()
          .evaluate((element) => getComputedStyle(element).animationName),
      ).not.toBe('none');
    }
    expect(
      await root
        .locator('.guess-tile')
        .first()
        .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe('none');
    await expect(page.getByRole('button', { name: 'Next round' })).toBeVisible();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await root.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(
      0,
    );
    await page.reload();
    await expect(page.getByRole('button', { name: 'Next round' })).toBeVisible();
    await expect(root).toHaveCount(0);
  });
}
