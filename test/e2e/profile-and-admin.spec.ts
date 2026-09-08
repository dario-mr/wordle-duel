import { expect, test } from '@playwright/test';
import { fulfillJson, mockAuthenticatedSession } from './testHelpers';

function adminUser(id: string, fullName: string, email: string, createdOn: string) {
  return {
    id,
    email,
    fullName,
    displayName: fullName.toLowerCase().replace(/\s+/g, '.'),
    pictureUrl: null,
    createdOn,
  };
}

test.describe('profile and admin flows', () => {
  test('opens the admin hub from the navbar', async ({ page }) => {
    await mockAuthenticatedSession(page, { roles: ['ADMIN'] });

    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();

    await page.getByRole('link', { name: 'Admin' }).click();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Rooms' })).toBeVisible();
  });

  test('redirects non-admin users to the home page', async ({ page }) => {
    await mockAuthenticatedSession(page, { roles: ['USER'] });

    await page.goto('/users');

    await expect(page).toHaveURL(/\/$/);
  });

  test('logs out from the profile popover and clears the stored return target', async ({
    page,
  }) => {
    await mockAuthenticatedSession(page);

    await page.goto('/');
    await page.evaluate(() => {
      window.sessionStorage.setItem('wd.auth.returnTo', '/rooms/room-1');
    });
    await page.getByRole('button', { name: 'Profile' }).click();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page).toHaveURL(/\/$/);
    const storedReturnTo = await page.evaluate(() =>
      window.sessionStorage.getItem('wd.auth.returnTo'),
    );
    expect(storedReturnTo).toBeNull();

    await page.getByRole('button', { name: 'Profile' }).click();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  });

  test('applies a trimmed full-name filter only after submission', async ({ page }) => {
    await mockAuthenticatedSession(page, { roles: ['ADMIN'] });
    const requests: Record<string, string>[] = [];
    await page.route(/\/admin\/users(?:\?.*)?$/, async (route) => {
      const params = Object.fromEntries(new URL(route.request().url()).searchParams);
      requests.push(params);
      await fulfillJson(route, {
        content: [
          adminUser(
            'user-1',
            params.fullName === 'Alice' ? 'Alice Alpha' : 'User 1',
            'user@example.com',
            '2026-01-01T00:00:00Z',
          ),
        ],
        page: { size: 50, number: 0, totalElements: 1, totalPages: 1 },
      });
    });
    await page.goto('/users');
    await expect(page.getByRole('cell', { name: 'User 1', exact: true })).toBeVisible();
    const filter = page.getByRole('textbox', { name: 'Full Name' });
    await filter.fill(' Alice ');
    expect(requests).toEqual([{ page: '0', size: '50' }]);
    await filter.press('Enter');
    await expect(page.getByRole('cell', { name: 'Alice Alpha', exact: true })).toBeVisible();
    expect(requests).toEqual([
      { page: '0', size: '50' },
      { page: '0', size: '50', fullName: 'Alice' },
    ]);
  });

  test('loads the next users page when scrolling to the end of a full page', async ({ page }) => {
    await mockAuthenticatedSession(page, { roles: ['ADMIN'] });
    const requestedPages: number[] = [];
    const users = Array.from({ length: 51 }, (_, index) =>
      adminUser(
        'user-' + String(index + 1),
        'User ' + String(index + 1),
        'user' + String(index + 1) + '@example.com',
        '2026-01-01T00:00:00Z',
      ),
    );
    await page.route(/\/admin\/users(?:\?.*)?$/, async (route) => {
      const number = Number(new URL(route.request().url()).searchParams.get('page'));
      requestedPages.push(number);
      await fulfillJson(route, {
        content: users.slice(number * 50, (number + 1) * 50),
        page: { size: 50, number, totalElements: 51, totalPages: 2 },
      });
    });
    await page.goto('/users');
    await expect(page.getByRole('cell', { name: 'User 1', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'User 50', exact: true })).not.toBeInViewport();
    expect(requestedPages).toEqual([0]);
    await page.getByRole('cell', { name: 'User 50', exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('cell', { name: 'User 51', exact: true })).toBeAttached();
    expect(requestedPages).toEqual([0, 1]);
  });
});
