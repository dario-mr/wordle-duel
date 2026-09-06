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
  test('opens the admin hub from the renamed profile action', async ({ page }) => {
    await mockAuthenticatedSession(page, { roles: ['ADMIN'] });

    await page.goto('/');
    await page.getByRole('button', { name: 'Profile' }).click();
    await expect(page.getByRole('button', { name: 'Admin' })).toBeVisible();

    await page.getByRole('button', { name: 'Admin' }).click();

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

  test('filters admin users by full name and loads the next page after scrolling', async ({
    page,
  }) => {
    await mockAuthenticatedSession(page, { roles: ['ADMIN'] });
    const adminRequests: string[] = [];

    await page.route(/\/admin\/users(?:\?.*)?$/, async (route) => {
      const url = new URL(route.request().url());
      adminRequests.push(url.search);

      const pageParam = url.searchParams.get('page') ?? '0';
      const fullName = url.searchParams.get('fullName');

      if (fullName === 'Alice' && pageParam === '1') {
        await fulfillJson(route, {
          content: [
            adminUser('user-2', 'Alice Beta', 'alice.beta@example.com', '2026-01-02T00:00:00Z'),
          ],
          page: { size: 50, number: 1, totalElements: 51, totalPages: 2 },
        });
        return;
      }

      if (fullName === 'Alice') {
        await fulfillJson(route, {
          content: [
            adminUser('user-1', 'Alice Alpha', 'alice.alpha@example.com', '2026-01-01T00:00:00Z'),
          ],
          page: { size: 50, number: 0, totalElements: 51, totalPages: 2 },
        });
        return;
      }

      await fulfillJson(route, {
        content: Array.from({ length: 50 }, (_, index) =>
          adminUser(
            `user-${String(index + 1)}`,
            `User ${String(index + 1)}`,
            `user${String(index + 1)}@example.com`,
            '2026-01-01T00:00:00Z',
          ),
        ),
        page: { size: 50, number: 0, totalElements: 51, totalPages: 2 },
      });
    });

    await page.goto('/users');
    await expect(page).toHaveURL(/\/users$/);
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'User 1', exact: true })).toBeVisible();

    const fullNameFilter = page.getByRole('textbox', { name: 'Full Name' });
    await fullNameFilter.fill(' Alice ');
    expect(adminRequests).toHaveLength(1);

    await fullNameFilter.press('Enter');
    await expect(page.getByText('Alice Alpha')).toBeVisible();

    await page.mouse.wheel(0, 100000);
    await expect(page.getByText('Alice Beta')).toBeVisible();

    expect(adminRequests).toContain('?page=0&size=50');
    expect(adminRequests).toContain('?page=0&size=50&fullName=Alice');
    expect(adminRequests).toContain('?page=1&size=50&fullName=Alice');
  });
});
