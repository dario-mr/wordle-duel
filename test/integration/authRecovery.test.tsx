import { ChakraProvider } from '@chakra-ui/react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { theme } from '../../src/app/theme';
import { AdminPage } from '../../src/features/admin/AdminPage';
import { LoginPage } from '../../src/features/auth/LoginPage';
import { meQueryKey } from '../../src/features/auth/queries';
import type { UserMeDto } from '../../src/features/auth/types';
import { MyRoomsPage } from '../../src/features/rooms/my-rooms/MyRoomsPage';
import { createQueryClientWrapper } from '../testUtils/queryClient';

vi.mock('react-i18next', async () => await import('../testUtils/reactI18nextMock'));

const user: UserMeDto = {
  id: 'admin-1',
  email: 'admin@example.com',
  fullName: 'Test Admin',
  displayName: 'Admin',
  pictureUrl: null,
  roles: ['ADMIN'],
};
const fetchMock = vi.fn<typeof fetch>();
let queryContext: ReturnType<typeof createQueryClientWrapper>;

beforeEach(() => {
  queryContext = createQueryClientWrapper();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  queryContext.queryClient.clear();
});

function renderPage(page: ReactNode) {
  return render(
    <ChakraProvider value={theme}>
      <MemoryRouter>{page}</MemoryRouter>
    </ChakraProvider>,
    { wrapper: queryContext.wrapper },
  );
}

it('keeps login available while the session lookup is pending', async () => {
  let resolveSession!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(
    new Promise<Response>((resolve) => {
      resolveSession = resolve;
    }),
  );

  renderPage(<LoginPage />);

  expect(screen.getByRole('button', { name: /profile.loginWithGoogle/ })).toBeTruthy();
  act(() => {
    resolveSession(new Response(null, { status: 401 }));
  });
  await waitFor(() => {
    expect(queryContext.queryClient.getQueryData(meQueryKey())).toBeNull();
  });
  expect(screen.getByRole('button', { name: /profile.loginWithGoogle/ })).toBeTruthy();
});

it('recovers from an initial auth failure without fetching rooms before auth resolves', async () => {
  let resolveSession!: (response: Response) => void;
  fetchMock
    .mockRejectedValueOnce(new TypeError('Session lookup failed'))
    .mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveSession = resolve;
      }),
    )
    .mockResolvedValueOnce(Response.json([]));

  renderPage(<MyRoomsPage />);

  await screen.findByText('Session lookup failed');
  expect(screen.getByText('auth.errorTitle')).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getByRole('button', { name: 'common.retry' }));
  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  for (const [url] of fetchMock.mock.calls) {
    expect(url).toEqual(expect.stringMatching(/\/users\/me$/));
  }

  act(() => {
    resolveSession(Response.json(user));
  });

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
  expect(fetchMock.mock.calls[2][0]).toEqual(expect.stringMatching(/\/rooms$/));
  await screen.findByText('myRooms.empty');
  expect(screen.queryByText('auth.errorTitle')).toBeNull();
});

it('preserves the authenticated screen when a background session refresh fails', async () => {
  queryContext.queryClient.setQueryData(meQueryKey(), user);
  fetchMock.mockResolvedValueOnce(Response.json({ code: 'UNEXPECTED_ERROR' }, { status: 500 }));

  renderPage(<AdminPage />);
  expect(screen.getByText('admin.title')).toBeTruthy();

  await act(async () => {
    await queryContext.queryClient.invalidateQueries({ queryKey: meQueryKey() });
  });

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(queryContext.queryClient.getQueryState(meQueryKey())?.status).toBe('error');
  expect(screen.getByText('admin.title')).toBeTruthy();
  expect(screen.queryByText('auth.errorTitle')).toBeNull();
});
