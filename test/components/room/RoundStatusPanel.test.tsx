import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RoundStatusPanel } from '../../../src/components/room/round/RoundStatusPanel';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../../src/api/errors', () => ({
  getErrorMessage: () => 'Ready failed',
}));

vi.mock('@chakra-ui/react', () => ({
  Code: ({ children }: { children?: ReactNode }) => <code>{children}</code>,
  Stack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
}));

vi.mock('../../../src/components/common/ErrorAlert', () => ({
  ErrorAlert: ({ title, message }: { title: string; message: string }) => (
    <div>{`${title}:${message}`}</div>
  ),
}));

vi.mock('../../../src/components/common/BrandButton.tsx', () => ({
  AccentButton: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

const baseRoom = {
  id: 'room-1',
  language: 'IT' as const,
  status: 'IN_PROGRESS' as const,
  players: [],
  currentRound: {
    roundNumber: 2,
    maxAttempts: 6,
    guessesByPlayerId: {},
    statusByPlayerId: {},
    roundStatus: 'ENDED' as const,
    solution: 'APPLE',
  },
};

describe('RoundStatusPanel', () => {
  it('shows a message when the room is not in progress', () => {
    render(
      <RoundStatusPanel
        room={{ ...baseRoom, status: 'WAITING_FOR_PLAYERS' }}
        endedRound={null}
        myRoundStatus={undefined}
        onReadyNextRound={vi.fn()}
        isReadyPending={false}
        readyError={null}
      />,
    );

    expect(screen.getByText('room.round.notInProgressYet')).toBeTruthy();
  });

  it('shows the solution for a lost round and allows readying up', () => {
    const onReadyNextRound = vi.fn();
    render(
      <RoundStatusPanel
        room={baseRoom}
        endedRound={baseRoom.currentRound}
        myRoundStatus="LOST"
        onReadyNextRound={onReadyNextRound}
        isReadyPending={false}
        readyError={null}
      />,
    );

    expect(screen.getByText('room.round.youLostThisRound')).toBeTruthy();
    expect(screen.getByText('room.round.solution')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'room.round.readyForNextRound' }));
    expect(onReadyNextRound).toHaveBeenCalledWith(2);
  });

  it('shows the ready error and hides the button when already ready', () => {
    render(
      <RoundStatusPanel
        room={baseRoom}
        endedRound={baseRoom.currentRound}
        myRoundStatus="READY"
        onReadyNextRound={vi.fn()}
        isReadyPending={false}
        readyError={new Error('boom')}
      />,
    );

    expect(screen.queryByRole('button', { name: 'room.round.readyForNextRound' })).toBeNull();
    expect(screen.getByText('room.round.readyRejected:Ready failed')).toBeTruthy();
  });
});
