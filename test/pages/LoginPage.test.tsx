import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { MouseEvent, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '../../src/pages/LoginPage';
import { STORAGE_KEYS } from '../../src/state/storageKeys';
import { resetAuthModuleMocks } from '../testUtils/auth';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  beginGoogleLogin: vi.fn(),
  getCurrentUser: vi.fn(),
  subscribeCurrentUser: vi.fn<(listener: () => void) => () => void>(),
  searchParams: new URLSearchParams(),
}));

vi.mock('../../src/api/auth', () => ({
  beginGoogleLogin: mocks.beginGoogleLogin,
  getCurrentUser: mocks.getCurrentUser,
  subscribeCurrentUser: mocks.subscribeCurrentUser,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
  useSearchParams: () => [mocks.searchParams],
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
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  }) => (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
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
    <button type="button" onClick={onClick}>
      Login with Google
    </button>
  ),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.beginGoogleLogin.mockReset();
    resetAuthModuleMocks(mocks);
    mocks.searchParams = new URLSearchParams();
    window.sessionStorage.clear();
  });

  it('stores a sanitized returnTo query parameter', async () => {
    mocks.searchParams = new URLSearchParams('returnTo=%2Frooms%2Fabc');

    render(<LoginPage />);

    await waitFor(() => {
      expect(window.sessionStorage.getItem(STORAGE_KEYS.authReturnTo)).toBe('/rooms/abc');
    });
  });

  it('ignores an unsafe returnTo query parameter', async () => {
    mocks.searchParams = new URLSearchParams('returnTo=https%3A%2F%2Fevil.test');

    render(<LoginPage />);

    await waitFor(() => {
      expect(window.sessionStorage.getItem(STORAGE_KEYS.authReturnTo)).toBeNull();
    });
  });

  it('redirects home when the user is already authenticated', async () => {
    mocks.getCurrentUser.mockReturnValue({ id: 'user-1' });

    const { container } = render(<LoginPage />);

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith('/', { replace: true });
    });
    expect(container.firstChild).toBeNull();
  });

  it('clicking login stores a safe returnTo and starts Google login', async () => {
    mocks.searchParams = new URLSearchParams('returnTo=%2Fmy-rooms');

    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Login with Google' }));

    await waitFor(() => {
      expect(window.sessionStorage.getItem(STORAGE_KEYS.authReturnTo)).toBe('/my-rooms');
      expect(mocks.beginGoogleLogin).toHaveBeenCalledTimes(1);
    });
  });

  it('clicking login removes an unsafe stored returnTo before starting login', async () => {
    window.sessionStorage.setItem(STORAGE_KEYS.authReturnTo, 'https://evil.test');

    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Login with Google' }));

    await waitFor(() => {
      expect(window.sessionStorage.getItem(STORAGE_KEYS.authReturnTo)).toBeNull();
      expect(mocks.beginGoogleLogin).toHaveBeenCalledTimes(1);
    });
  });
});
