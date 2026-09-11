export { liveRoom, winningGuess } from '../testUtils/rooms';
import type { RoomDto } from '../../src/features/rooms/types';
import { expect, type Page, type Route } from '@playwright/test';

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
    email?: string;
  },
) {
  let sessionActive = true;
  const userId = args?.userId ?? 'user-1';
  const roles = args?.roles ?? ['USER'];
  const fullName = args?.fullName ?? 'Alice Example';
  const displayName = args?.displayName ?? 'alice';
  const email = args?.email ?? 'alice@example.com';

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
      email,
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
    rematchRequested: false,
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

export async function openRoom(page: Page, initial: RoomDto, afterGuess?: RoomDto) {
  await mockAuthenticatedSession(page);
  let room = initial;
  const url = `**/api/v1/rooms/${initial.id}`;
  await page.route(url, (route) => fulfillJson(route, room));
  await page.route(`${url}/messages`, (route) =>
    fulfillJson(route, { messages: [], unreadCount: 0 }),
  );
  await page.route(`${url}/messages/read`, (route) =>
    fulfillJson(route, { messages: [], unreadCount: 0 }),
  );
  if (afterGuess) {
    await page.route(`${url}/guess`, (route) => {
      expect(route.request().postDataJSON()).toEqual({
        word: afterGuess.currentRound?.guesses.at(-1)?.word,
      });
      room = afterGuess;
      return fulfillJson(route, { room });
    });
  }
  await page.goto(`/rooms/${initial.id}`);
  if (initial.currentRound?.playerStatus === 'PLAYING') {
    await expect(page.getByRole('button', { name: 'Enter' })).toBeDisabled();
  }
}
