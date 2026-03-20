import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from '../../src/pages/HomePage';
import { STORAGE_KEYS } from '../../src/state/storageKeys';

const navigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@chakra-ui/react', () => ({
  Heading: ({ children }: { children?: ReactNode }) => <h1>{children}</h1>,
  Stack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../src/components/home/CreateRoomCard', () => ({
  CreateRoomCard: ({ onCreated }: { onCreated: (roomId: string) => void }) => (
    <button
      type="button"
      onClick={() => {
        onCreated('created-room');
      }}
    >
      Create room
    </button>
  ),
}));

vi.mock('../../src/components/home/JoinRoomCard', () => ({
  JoinRoomCard: ({ onJoined }: { onJoined: (roomId: string) => void }) => (
    <button
      type="button"
      onClick={() => {
        onJoined('joined-room');
      }}
    >
      Join room
    </button>
  ),
}));

describe('HomePage', () => {
  beforeEach(() => {
    navigate.mockReset();
    window.sessionStorage.clear();
  });

  it('navigates to a safe stored returnTo and clears it from storage', async () => {
    window.sessionStorage.setItem(STORAGE_KEYS.authReturnTo, '/rooms/abc');

    render(<HomePage />);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/rooms/abc');
      expect(window.sessionStorage.getItem(STORAGE_KEYS.authReturnTo)).toBeNull();
    });
  });

  it('drops an unsafe stored returnTo without navigating to it', async () => {
    window.sessionStorage.setItem(STORAGE_KEYS.authReturnTo, 'https://evil.test');

    render(<HomePage />);

    await waitFor(() => {
      expect(window.sessionStorage.getItem(STORAGE_KEYS.authReturnTo)).toBeNull();
    });
    expect(navigate).not.toHaveBeenCalledWith('https://evil.test');
  });

  it('navigates to the created room when the create card succeeds', () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole('button', { name: 'Create room' }));

    expect(navigate).toHaveBeenCalledWith('/rooms/created-room');
  });

  it('navigates to the joined room when the join card succeeds', () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole('button', { name: 'Join room' }));

    expect(navigate).toHaveBeenCalledWith('/rooms/joined-room');
  });
});
