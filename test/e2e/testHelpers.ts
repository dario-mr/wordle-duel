import type { Page, Route } from '@playwright/test';

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString('base64url');
}

export function makeJwt(payload: Record<string, unknown>): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

export async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

export async function mockUnauthenticatedSession(page: Page) {
  await page.route('**/auth/refresh', async (route) => {
    await route.fulfill({ status: 401 });
  });
}

export async function mockAuthenticatedSession(
  page: Page,
  args?: {
    userId?: string;
    email?: string;
    roles?: string[];
    fullName?: string;
    displayName?: string;
  },
) {
  const userId = args?.userId ?? 'user-1';
  const email = args?.email ?? 'alice@example.com';
  const roles = args?.roles ?? ['USER'];
  const fullName = args?.fullName ?? 'Alice Example';
  const displayName = args?.displayName ?? 'alice';
  const token = makeJwt({
    sub: userId,
    email,
    roles,
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  await page.route('**/auth/refresh', async (route) => {
    await fulfillJson(route, { accessToken: token, expiresInSeconds: 3600 });
  });

  await page.route('**/api/v1/users/me', async (route) => {
    await fulfillJson(route, {
      id: userId,
      fullName,
      displayName,
      pictureUrl: null,
    });
  });
}

export function roomDto(roomId: string, args?: { playerId?: string; displayName?: string }) {
  return {
    id: roomId,
    language: 'IT',
    status: 'WAITING_FOR_PLAYERS',
    players: [
      {
        id: args?.playerId ?? 'user-1',
        score: 0,
        displayName: args?.displayName ?? 'Alice Example',
      },
    ],
    currentRound: null,
  };
}
