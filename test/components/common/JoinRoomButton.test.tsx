import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JoinRoomButton } from '../../../src/components/common/JoinRoomButton';

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  showToast: vi.fn(),
  dismissToast: vi.fn(),
}));

vi.mock('../../../src/query/roomQueries', () => ({
  useJoinRoomMutation: () => ({
    isPending: false,
    mutate: mocks.mutate,
  }),
}));

vi.mock('../../../src/hooks/useSingleToast', () => ({
  useSingleToast: () => ({
    show: mocks.showToast,
    dismiss: mocks.dismissToast,
  }),
}));

vi.mock('../../../src/api/errors.ts', () => ({
  getErrorMessage: () => 'Join failed',
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@chakra-ui/react', () => ({
  Stack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../../src/components/common/BrandButton', () => ({
  AccentButton: ({
    children,
    onClick,
    disabled,
  }: {
    children?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('JoinRoomButton', () => {
  beforeEach(() => {
    mocks.mutate.mockReset();
    mocks.showToast.mockReset();
    mocks.dismissToast.mockReset();
  });

  it('disables the button when roomId is missing', () => {
    render(<JoinRoomButton roomId={undefined} />);

    expect(screen.getByRole('button')).toHaveProperty('disabled', true);
  });

  it('calls the mutation and forwards success to onJoined', () => {
    const onJoined = vi.fn();
    mocks.mutate.mockImplementation(
      (
        _vars: { roomId: string },
        options?: {
          onSuccess?: (joined: { id: string }) => void;
          onError?: (err: unknown) => void;
        },
      ) => {
        options?.onSuccess?.({ id: 'room-1' });
      },
    );

    render(<JoinRoomButton roomId="room-1" onJoined={onJoined} />);
    fireEvent.click(screen.getByRole('button'));

    const [vars, options] = mocks.mutate.mock.calls[0] as [
      { roomId: string },
      { onSuccess?: (joined: { id: string }) => void; onError?: (err: unknown) => void },
    ];

    expect(vars).toEqual({ roomId: 'room-1' });
    expect(options.onSuccess).toEqual(expect.any(Function));
    expect(options.onError).toEqual(expect.any(Function));
    expect(mocks.dismissToast).toHaveBeenCalled();
    expect(onJoined).toHaveBeenCalledWith('room-1');
  });

  it('shows an error toast when the mutation fails', () => {
    mocks.mutate.mockImplementation(
      (
        _vars: { roomId: string },
        options?: {
          onSuccess?: (joined: { id: string }) => void;
          onError?: (err: unknown) => void;
        },
      ) => {
        options?.onError?.(new Error('boom'));
      },
    );

    render(<JoinRoomButton roomId="room-1" />);
    fireEvent.click(screen.getByRole('button'));

    expect(mocks.showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        title: 'toasts.joinRoomFailed',
        description: 'Join failed',
      }),
    );
  });
});
