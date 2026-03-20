import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ChangeEvent, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfilePopover } from '../../../src/components/navbar/profile/ProfilePopover';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  cancelQueries: vi.fn().mockResolvedValue(undefined),
  removeQueries: vi.fn(),
  showToast: vi.fn(),
  beginGoogleLogin: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  getCurrentUser: vi.fn(),
  subscribeCurrentUser: vi.fn(() => () => undefined),
  meQueryResult: { data: { fullName: 'Alice', pictureUrl: null as string | null } },
  setLocale: vi.fn(),
  setTheme: vi.fn(),
  locale: 'en',
  theme: 'light',
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    cancelQueries: mocks.cancelQueries,
    removeQueries: mocks.removeQueries,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../../src/api/auth', () => ({
  beginGoogleLogin: mocks.beginGoogleLogin,
  logout: mocks.logout,
  getCurrentUser: mocks.getCurrentUser,
  subscribeCurrentUser: mocks.subscribeCurrentUser,
}));

vi.mock('../../../src/api/errors', () => ({
  getErrorMessage: () => 'Logout failed',
}));

vi.mock('../../../src/query/meQueries', () => ({
  meQueryKey: () => ['me'],
  useMeQuery: () => mocks.meQueryResult,
}));

vi.mock('../../../src/hooks/useSingleToast', () => ({
  useSingleToast: () => ({ show: mocks.showToast }),
}));

vi.mock('../../../src/state/localeStore', () => ({
  useLocaleStore: (
    selector: (state: { locale: string; setLocale: (locale: string) => void }) => unknown,
  ) => selector({ locale: mocks.locale, setLocale: mocks.setLocale }),
}));

vi.mock('../../../src/state/themeStore', () => ({
  useThemeStore: (
    selector: (state: { theme: string; setTheme: (theme: string) => void }) => unknown,
  ) => selector({ theme: mocks.theme, setTheme: mocks.setTheme }),
}));

vi.mock('@chakra-ui/react', () => ({
  Grid: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Popover: {
    Root: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Trigger: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Positioner: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Content: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    CloseTrigger: () => null,
    Header: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Title: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Body: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  },
  Separator: () => null,
  Stack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}));

vi.mock('../../../src/components/navbar/profile/AuthActions', () => ({
  AuthActions: ({
    me,
    onLogin,
    onLogout,
  }: {
    me: { roles?: string[] } | null;
    onLogin: () => void;
    onLogout: () => void;
  }) => (
    <div>
      <button type="button" onClick={onLogin}>
        login
      </button>
      {me ? (
        <button type="button" onClick={onLogout}>
          logout
        </button>
      ) : null}
    </div>
  ),
}));

vi.mock('../../../src/components/navbar/profile/LanguageSelect', () => ({
  LanguageSelect: ({ onChange }: { onChange: (e: ChangeEvent<HTMLSelectElement>) => void }) => (
    <select
      aria-label="language"
      onChange={(e) => {
        onChange(e as ChangeEvent<HTMLSelectElement>);
      }}
    >
      <option value="en">en</option>
      <option value="it">it</option>
    </select>
  ),
}));

vi.mock('../../../src/components/navbar/profile/ThemeSelect', () => ({
  ThemeSelect: ({ onChange }: { onChange: (e: ChangeEvent<HTMLSelectElement>) => void }) => (
    <select
      aria-label="theme"
      onChange={(e) => {
        onChange(e as ChangeEvent<HTMLSelectElement>);
      }}
    >
      <option value="light">light</option>
      <option value="dark">dark</option>
    </select>
  ),
}));

vi.mock('../../../src/components/navbar/profile/ProfileTriggerButton', () => ({
  ProfileTriggerButton: () => <button type="button">profile</button>,
}));

vi.mock('../../../src/components/common/BrandButton.tsx', () => ({
  PrimaryButton: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('ProfilePopover', () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.cancelQueries.mockReset();
    mocks.cancelQueries.mockResolvedValue(undefined);
    mocks.removeQueries.mockReset();
    mocks.showToast.mockReset();
    mocks.beginGoogleLogin.mockReset();
    mocks.logout.mockReset();
    mocks.logout.mockResolvedValue(undefined);
    mocks.getCurrentUser.mockReset();
    mocks.subscribeCurrentUser.mockReset();
    mocks.subscribeCurrentUser.mockReturnValue(() => undefined);
    mocks.meQueryResult = { data: { fullName: 'Alice', pictureUrl: null } };
    mocks.setLocale.mockReset();
    mocks.setTheme.mockReset();
    sessionStorage.clear();
  });

  it('shows login actions when logged out and starts google login', () => {
    mocks.getCurrentUser.mockReturnValue(null);
    render(<ProfilePopover />);

    fireEvent.click(screen.getByRole('button', { name: 'login' }));

    expect(mocks.beginGoogleLogin).toHaveBeenCalled();
    expect(screen.queryByText('profile.myRooms')).toBeNull();
  });

  it('shows admin navigation for admins', () => {
    mocks.getCurrentUser.mockReturnValue({ id: 'user-1', roles: ['ADMIN'] });
    render(<ProfilePopover />);

    expect(screen.getByText('profile.myRooms')).toBeTruthy();
    expect(screen.getByText('admin.users.navLink')).toBeTruthy();
  });

  it('logout clears queries, removes returnTo, and navigates home', async () => {
    mocks.getCurrentUser.mockReturnValue({ id: 'user-1', roles: ['USER'] });
    sessionStorage.setItem('wd.auth.returnTo', '/rooms/abc');

    render(<ProfilePopover />);
    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => {
      expect(mocks.cancelQueries).toHaveBeenCalledWith({ queryKey: ['room'], exact: false });
      expect(mocks.cancelQueries).toHaveBeenCalledWith({ queryKey: ['me'], exact: true });
      expect(mocks.removeQueries).toHaveBeenCalledWith({ queryKey: ['room'], exact: false });
      expect(mocks.removeQueries).toHaveBeenCalledWith({ queryKey: ['me'], exact: true });
      expect(sessionStorage.getItem('wd.auth.returnTo')).toBeNull();
      expect(mocks.navigate).toHaveBeenCalledWith('/', { replace: true });
      expect(mocks.logout).toHaveBeenCalled();
    });
  });

  it('shows a toast when logout fails', async () => {
    mocks.getCurrentUser.mockReturnValue({ id: 'user-1', roles: ['USER'] });
    mocks.logout.mockRejectedValueOnce(new Error('boom'));

    render(<ProfilePopover />);
    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => {
      expect(mocks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          title: 'toasts.logoutFailed',
          description: 'Logout failed',
        }),
      );
    });
  });
});
