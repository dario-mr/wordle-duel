import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from '../../src/pages/HomePage';
import { LoginPage } from '../../src/pages/LoginPage';
import { STORAGE_KEYS } from '../../src/state/storageKeys';
import { resetAuthModuleMocks } from '../testUtils/auth';
import { renderWithMemoryRouter, Route } from '../testUtils/router';

const mocks = vi.hoisted(() => ({
  beginGoogleLogin: vi.fn(),
  getCurrentUser: vi.fn(),
  subscribeCurrentUser: vi.fn<(listener: () => void) => () => void>(),
}));

vi.mock('../../src/api/auth', () => ({
  beginGoogleLogin: mocks.beginGoogleLogin,
  getCurrentUser: mocks.getCurrentUser,
  subscribeCurrentUser: mocks.subscribeCurrentUser,
}));

vi.mock('react-i18next', async () => await import('../testUtils/reactI18nextMock'));

vi.mock('@chakra-ui/react', () => ({
  Heading: ({ children }: { children?: ReactNode }) => <h1>{children}</h1>,
  Link: ({
    children,
    href,
    onClick,
  }: {
    children?: ReactNode;
    href?: string;
    onClick?: (event: { preventDefault: () => void }) => void;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        onClick?.({
          preventDefault: () => {
            event.preventDefault();
          },
        });
      }}
    >
      {children}
    </a>
  ),
  Stack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
}));

vi.mock('../../src/components/common/BrandButton', () => ({
  GoogleLoginButton: ({ onClick }: { onClick: () => void }) => (
    <button
      type="button"
      onClick={() => {
        onClick();
      }}
    >
      Login with Google
    </button>
  ),
}));

vi.mock('../../src/components/home/CreateRoomCard', () => ({
  CreateRoomCard: () => <div>create-room-card</div>,
}));

vi.mock('../../src/components/home/JoinRoomCard', () => ({
  JoinRoomCard: () => <div>join-room-card</div>,
}));

function LocationDisplay() {
  const location = useLocation();
  return <div>{`${location.pathname}${location.search}${location.hash}`}</div>;
}

describe('auth return flow', () => {
  beforeEach(() => {
    mocks.beginGoogleLogin.mockReset();
    resetAuthModuleMocks(mocks);
    sessionStorage.clear();
  });

  it('preserves a safe returnTo through login and consumes it on home', async () => {
    const loginRender = renderWithMemoryRouter(<Route path="/login" element={<LoginPage />} />, {
      initialEntries: ['/login?returnTo=%2Frooms%2Fabc'],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Login with Google' }));

    await waitFor(() => {
      expect(sessionStorage.getItem(STORAGE_KEYS.authReturnTo)).toBe('/rooms/abc');
      expect(mocks.beginGoogleLogin).toHaveBeenCalledTimes(1);
    });

    loginRender.unmount();

    renderWithMemoryRouter(
      <>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms/:roomId" element={<LocationDisplay />} />
      </>,
      { initialEntries: ['/'] },
    );

    await waitFor(() => {
      expect(screen.getByText('/rooms/abc')).toBeTruthy();
      expect(sessionStorage.getItem(STORAGE_KEYS.authReturnTo)).toBeNull();
    });
  });
});
