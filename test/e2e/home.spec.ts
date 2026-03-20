import { expect, test } from '@playwright/test';
import {
  fulfillJson,
  mockAuthenticatedSession,
  mockUnauthenticatedSession,
  roomDto,
} from './testHelpers';

test.describe('home flows', () => {
  test('consumes a stored auth returnTo and redirects in the browser', async ({ page }) => {
    await mockUnauthenticatedSession(page);
    await page.addInitScript(() => {
      window.sessionStorage.setItem('wd.auth.returnTo', '/legal');
    });

    await page.goto('/');

    await expect(page).toHaveURL(/\/legal$/);
    await expect(page.getByRole('heading', { name: 'Legal & Policies' })).toBeVisible();
    const storedReturnTo = await page.evaluate(() =>
      window.sessionStorage.getItem('wd.auth.returnTo'),
    );
    expect(storedReturnTo).toBeNull();
  });

  test('creates a room and navigates to it', async ({ page }) => {
    await mockAuthenticatedSession(page);

    await page.route('**/api/v1/rooms', async (route) => {
      if (route.request().method() === 'POST') {
        await fulfillJson(route, roomDto('room-created'));
        return;
      }

      await route.fallback();
    });

    await page.route('**/api/v1/rooms/room-created', async (route) => {
      await fulfillJson(route, roomDto('room-created'));
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Create room' }).click();

    await expect(page).toHaveURL(/\/rooms\/room-created$/);
    await expect(page.getByText('Waiting for opponent...')).toBeVisible();
  });

  test('joins a room from the home form and navigates to it', async ({ page }) => {
    await mockAuthenticatedSession(page);

    await page.route('**/api/v1/rooms/room-join', async (route) => {
      await fulfillJson(route, roomDto('room-join'));
    });

    await page.route('**/api/v1/rooms/room-join/join', async (route) => {
      await fulfillJson(route, roomDto('room-join'));
    });

    await page.goto('/');
    await page.getByPlaceholder('Room ID').fill('room-join');
    await page.getByRole('button', { name: 'Join' }).click();

    await expect(page).toHaveURL(/\/rooms\/room-join$/);
    await expect(page.getByText('Waiting for opponent...')).toBeVisible();
  });
});
