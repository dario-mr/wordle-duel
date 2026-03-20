import { expect, test } from '@playwright/test';
import {
  fulfillJson,
  mockAuthenticatedSession,
  mockUnauthenticatedSession,
  roomDto,
} from './testHelpers';

function liveRoom(roomId: string) {
  return {
    id: roomId,
    language: 'IT',
    status: 'IN_PROGRESS',
    players: [
      { id: 'user-1', score: 0, displayName: 'Alice Example' },
      { id: 'user-2', score: 0, displayName: 'Bob Example' },
    ],
    currentRound: {
      roundNumber: 1,
      maxAttempts: 6,
      guessesByPlayerId: {
        'user-1': [],
        'user-2': [],
      },
      statusByPlayerId: {
        'user-1': 'PLAYING',
        'user-2': 'PLAYING',
      },
      roundStatus: 'PLAYING',
      solution: 'APPLE',
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
          { id: 'user-2', score: 0, displayName: 'Bob Example' },
          { id: 'user-1', score: 0, displayName: 'Alice Example' },
        ],
      });
    });

    await page.goto('/rooms/room-join-me');

    await expect(page.getByText('Join this room')).toBeVisible();
    await page.getByRole('button', { name: 'Join' }).click();

    await expect(page).toHaveURL(/\/rooms\/room-join-me$/);
    await expect(page.getByText('Waiting for opponent...')).toBeVisible();
  });

  test('submits a guess through the real keyboard and clears the input after success', async ({
    page,
  }) => {
    await mockAuthenticatedSession(page);

    const initialRoom = liveRoom('room-live');
    const updatedRoom = {
      ...initialRoom,
      currentRound: {
        ...initialRoom.currentRound,
        guessesByPlayerId: {
          ...initialRoom.currentRound.guessesByPlayerId,
          'user-1': [
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
        },
        statusByPlayerId: {
          ...initialRoom.currentRound.statusByPlayerId,
          'user-1': 'WON',
        },
        roundStatus: 'ENDED',
      },
    };

    await page.route('**/api/v1/rooms/room-live', async (route) => {
      await fulfillJson(route, initialRoom);
    });

    await page.route('**/api/v1/rooms/room-live/guess', async (route) => {
      expect(route.request().postDataJSON()).toEqual({ word: 'APPLE' });
      await fulfillJson(route, { room: updatedRoom });
    });

    await page.goto('/rooms/room-live');

    const enterButton = page.getByRole('button', { name: 'Enter' });
    await expect(enterButton).toBeDisabled();

    await page.keyboard.type('apple');
    await expect(enterButton).toBeEnabled();

    await page.keyboard.press('Enter');

    await expect(enterButton).toHaveCount(0);
    await expect(page.getByText('You won!')).toBeVisible();
  });
});
