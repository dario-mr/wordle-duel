import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JoinRoomCard } from '../../../src/components/home/JoinRoomCard';

const mocks = vi.hoisted(() => ({
  joinRoom: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@chakra-ui/react', () => ({
  Heading: ({ children }: { children?: ReactNode }) => <h1>{children}</h1>,
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Input: ({
    value,
    onChange,
    placeholder,
  }: {
    value?: string;
    onChange?: (event: { target: { value: string } }) => void;
    placeholder?: string;
  }) => (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) => {
        onChange?.({ target: { value: event.target.value } });
      }}
    />
  ),
  Stack: ({
    children,
    as,
    onSubmit,
  }: {
    children?: ReactNode;
    as?: string;
    onSubmit?: (event: { preventDefault: () => void }) => void;
  }) => {
    if (as === 'form') {
      return (
        <form
          onSubmit={(event) => {
            onSubmit?.(event);
          }}
        >
          {children}
        </form>
      );
    }

    return <div>{children}</div>;
  },
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}));

vi.mock('../../../src/components/common/Card', () => ({
  Card: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../../src/hooks/useJoinRoomAction', () => ({
  useJoinRoomAction: () => ({
    joinRoom: mocks.joinRoom,
    isPending: false,
  }),
}));

vi.mock('../../../src/components/common/JoinRoomButton', () => ({
  JoinRoomButton: ({
    roomId,
    onJoin,
  }: {
    roomId: string | undefined;
    onJoin?: (roomId: string | undefined) => void;
  }) => (
    <button
      type="button"
      onClick={() => {
        onJoin?.(roomId);
      }}
    >
      Join
    </button>
  ),
}));

describe('JoinRoomCard', () => {
  beforeEach(() => {
    mocks.joinRoom.mockReset();
  });

  it('submits the trimmed room id through the form handler', () => {
    render(<JoinRoomCard onJoined={() => undefined} />);

    fireEvent.change(screen.getByPlaceholderText('home.joinRoom.roomIdPlaceholder'), {
      target: { value: ' room-1 ' },
    });
    const form = screen.getByRole('button', { name: 'Join' }).closest('form');
    expect(form).toBeTruthy();
    if (!form) {
      return;
    }
    fireEvent.submit(form);

    expect(mocks.joinRoom).toHaveBeenCalledWith('room-1');
  });

  it('uses the same join action for button clicks', () => {
    render(<JoinRoomCard onJoined={() => undefined} />);

    fireEvent.change(screen.getByPlaceholderText('home.joinRoom.roomIdPlaceholder'), {
      target: { value: 'room-2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Join' }));

    expect(mocks.joinRoom).toHaveBeenCalledWith('room-2');
  });
});
