import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { RoomDto } from '../../../src/api/types';
import { MyRoomsView } from '../../../src/components/myrooms/MyRoomsView';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@chakra-ui/react', () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children?: ReactNode;
    onClick?: () => void;
    'aria-expanded'?: boolean;
    'aria-controls'?: string;
  }) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Heading: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
  Separator: () => <hr />,
  Stack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
}));

vi.mock('../../../src/components/myrooms/MyRoomCard', () => ({
  MyRoomCard: ({ room }: { room: RoomDto }) => (
    <article data-testid={`room-${room.id}`}>{room.id}</article>
  ),
}));

function room(id: string, status: RoomDto['status']): RoomDto {
  return {
    id,
    language: 'IT',
    rounds: 5,
    status,
    players: [],
    currentRound: null,
  };
}

describe('MyRoomsView', () => {
  it('shows active rooms together and hides closed rooms by default', () => {
    render(
      <MyRoomsView
        rooms={[
          room('closed', 'CLOSED'),
          room('waiting', 'WAITING_FOR_PLAYERS'),
          room('progress', 'IN_PROGRESS'),
        ]}
        myPlayerId="me"
        onOpenRoom={vi.fn()}
      />,
    );

    expect(screen.getByTestId('room-progress')).toBeTruthy();
    expect(screen.getByTestId('room-waiting')).toBeTruthy();
    expect(screen.queryByTestId('room-closed')).toBeNull();
    expect(
      screen.getByRole('button', { name: /myRooms.history/ }).getAttribute('aria-expanded'),
    ).toBe('false');
  });

  it('reveals regular history cards when history is opened', () => {
    render(<MyRoomsView rooms={[room('closed', 'CLOSED')]} myPlayerId="me" onOpenRoom={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /myRooms.history/ }));

    expect(screen.getByTestId('room-closed')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /myRooms.history/ }).getAttribute('aria-expanded'),
    ).toBe('true');
  });
});
