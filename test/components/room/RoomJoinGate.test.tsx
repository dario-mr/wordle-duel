import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RoomJoinGate } from '../../../src/components/room/RoomJoinGate';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@chakra-ui/react', () => ({
  Stack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
}));

vi.mock('../../../src/components/common/JoinRoomButton', () => ({
  JoinRoomButton: ({ roomId }: { roomId?: string }) => <button type="button">{roomId}</button>,
}));

const baseRoom = {
  id: 'room-1',
  language: 'IT' as const,
  status: 'WAITING_FOR_PLAYERS' as const,
  players: [{ id: 'p1', score: 0, displayName: 'Alice' }],
  currentRound: null,
};

describe('RoomJoinGate', () => {
  it('shows the join CTA when the room has one player', () => {
    render(<RoomJoinGate room={baseRoom} roomId="room-1" />);

    expect(screen.getByText('room.joinGate.joinThisRoom')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'room-1' })).toBeTruthy();
  });

  it('shows the not-a-player message when the room is full', () => {
    render(
      <RoomJoinGate
        room={{
          ...baseRoom,
          players: [...baseRoom.players, { id: 'p2', score: 0, displayName: 'Bob' }],
        }}
        roomId="room-1"
      />,
    );

    expect(screen.getByText('room.joinGate.notAPlayer')).toBeTruthy();
  });
});
