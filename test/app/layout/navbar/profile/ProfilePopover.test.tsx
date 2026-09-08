import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfilePopover } from '../../../../../src/app/layout/navbar/profile/ProfilePopover';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  cancelQueries: vi.fn().mockResolvedValue(undefined),
  setQueryData: vi.fn(),
  removeQueries: vi.fn(),
  showToast: vi.fn(),
  beginGoogleLogin: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  getCurrentUser: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    cancelQueries: mocks.cancelQueries,
    setQueryData: mocks.setQueryData,
    removeQueries: mocks.removeQueries,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../../../../src/features/auth/oauth', () => ({
  beginGoogleLogin: mocks.beginGoogleLogin,
  logout: mocks.logout,
}));

vi.mock('../../../../../src/features/auth/useCurrentUser', () => ({
  useCurrentUser: () =>
    mocks.getCurrentUser() as { id: string; roles: string[] } | null | undefined,
}));

vi.mock('../../../../../src/shared/api/errors', () => ({
  getErrorMessage: () => 'Logout failed',
}));

vi.mock('../../../../../src/features/auth/queries', () => ({
  meQueryKey: () => ['me'],
}));

vi.mock('../../../../../src/shared/hooks/useSingleToast', () => ({
  useSingleToast: () => ({ show: mocks.showToast }),
}));

vi.mock('@chakra-ui/react', () => {
  const Container = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  return {
    Avatar: { Root: Container, Image: () => null, Fallback: Container },
    Flex: Container,
    Stack: Container,
    Text: Container,
    Popover: {
      Root: Container,
      Trigger: Container,
      Positioner: Container,
      Content: Container,
      CloseTrigger: () => null,
      Header: Container,
      Title: Container,
      Body: Container,
    },
  };
});

vi.mock('../../../../../src/app/layout/navbar/profile/AuthActions', () => ({
  AuthActions: ({ onLogin }: { onLogin: () => void }) => <button onClick={onLogin}>login</button>,
}));

vi.mock('../../../../../src/app/layout/navbar/profile/ProfileMenuContent', () => ({
  ProfileMenuContent: ({
    me,
    onLogoutClick,
    logoutPending,
  }: ComponentProps<
    typeof import('../../../../../src/app/layout/navbar/profile/ProfileMenuContent').ProfileMenuContent
  >) =>
    me ? (
      <button disabled={logoutPending} onClick={onLogoutClick}>
        profile.logout
      </button>
    ) : null,
}));

vi.mock('../../../../../src/app/layout/navbar/profile/ProfileTriggerButton', () => ({
  ProfileTriggerButton: () => <button type="button">profile</button>,
}));

describe('ProfilePopover', () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.cancelQueries.mockReset();
    mocks.cancelQueries.mockResolvedValue(undefined);
    mocks.setQueryData.mockReset();
    mocks.removeQueries.mockReset();
    mocks.showToast.mockReset();
    mocks.beginGoogleLogin.mockReset();
    mocks.logout.mockReset();
    mocks.logout.mockResolvedValue(undefined);
    mocks.getCurrentUser.mockReset();
    sessionStorage.clear();
  });

  it('shows login actions when logged out and starts google login', () => {
    mocks.getCurrentUser.mockReturnValue(null);
    render(<ProfilePopover />);

    fireEvent.click(screen.getByRole('button', { name: 'login' }));

    expect(mocks.beginGoogleLogin).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'profile.logout' })).toBeNull();
  });

  it('logout clears queries, removes returnTo, and navigates home', async () => {
    mocks.getCurrentUser.mockReturnValue({ id: 'user-1', roles: ['USER'] });
    sessionStorage.setItem('wd.auth.returnTo', '/rooms/abc');

    render(<ProfilePopover />);
    fireEvent.click(screen.getByRole('button', { name: 'profile.logout' }));

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
    fireEvent.click(screen.getByRole('button', { name: 'profile.logout' }));

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
