import type { Page, Route } from '@playwright/test';

export async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

export async function mockUnauthenticatedSession(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    await route.fulfill({ status: 401 });
  });
}

export async function mockAuthenticatedSession(
  page: Page,
  args?: {
    userId?: string;
    roles?: string[];
    fullName?: string;
    displayName?: string;
  },
) {
  let sessionActive = true;
  const userId = args?.userId ?? 'user-1';
  const roles = args?.roles ?? ['USER'];
  const fullName = args?.fullName ?? 'Alice Example';
  const displayName = args?.displayName ?? 'alice';

  await page.route('**/auth/logout', async (route) => {
    sessionActive = false;
    await route.fulfill({ status: 204 });
  });

  await page.route('**/api/v1/users/me', async (route) => {
    if (!sessionActive) {
      await route.fulfill({ status: 401 });
      return;
    }

    await fulfillJson(route, {
      id: userId,
      fullName,
      displayName,
      pictureUrl: null,
      roles,
    });
  });
}

export function roomDto(roomId: string, args?: { playerId?: string; displayName?: string }) {
  return {
    id: roomId,
    language: 'IT',
    rounds: 5,
    status: 'WAITING_FOR_PLAYERS',
    players: [
      {
        id: args?.playerId ?? 'user-1',
        wins: 0,
        matchScore: null,
        displayName: args?.displayName ?? 'Alice Example',
      },
    ],
    currentRound: null,
  };
}
