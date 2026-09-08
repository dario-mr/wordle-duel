import { expect, test } from '@playwright/test';
import {
  fulfillJson,
  mockAuthenticatedSession,
  mockUnauthenticatedSession,
  roomDto,
  liveRoom,
  openRoom,
  winningGuess,
} from './testHelpers';

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
    const initialRoom = liveRoom('room-live');
    const completedRoom = {
      ...initialRoom,
      currentRound: {
        ...initialRoom.currentRound,
        guesses: [winningGuess],
        playerStatus: 'WON' as const,
        roundStatus: 'PLAYING' as const,
      },
    };
    const nextRoom = {
      ...initialRoom,
      currentRound: {
        roundNumber: 2,
        maxAttempts: 6,
        guesses: [],
        playerStatus: 'PLAYING',
        roundStatus: 'PLAYING' as const,
      },
    };

    await page.route('**/api/v1/rooms/room-live/next', async (route) => {
      await fulfillJson(route, nextRoom);
    });

    await openRoom(page, initialRoom, completedRoom);

    const enterButton = page.getByRole('button', { name: 'Enter' });
    await expect(enterButton).toBeDisabled();

    await page.keyboard.type('verde');
    await expect(enterButton).toBeEnabled();

    await page.keyboard.press('Enter');

    await expect(enterButton).toHaveCount(0);
    await expect(page.getByText('You won this round')).toBeVisible();
    await page.getByRole('button', { name: 'Next round' }).click();
    await expect(enterButton).toBeDisabled();
  });
});
