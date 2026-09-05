import { render, screen } from '@testing-library/react';
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
  it('shows finished rooms as ordinary cards after active rooms', () => {
    render(
      <MyRoomsView
        rooms={[
          room('finished', 'MATCH_FINISHED'),
          room('waiting', 'WAITING_FOR_PLAYERS'),
          room('progress', 'IN_PROGRESS'),
        ]}
        myPlayerId="me"
        onOpenRoom={vi.fn()}
      />,
    );

    expect(screen.getByTestId('room-progress')).toBeTruthy();
    expect(screen.getByTestId('room-waiting')).toBeTruthy();
    expect(screen.getByTestId('room-finished')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /myRooms.history/ })).toBeNull();
    expect(screen.getAllByRole('article').map((card) => card.dataset.testid)).toEqual([
      'room-progress',
      'room-waiting',
      'room-finished',
    ]);
  });
});
