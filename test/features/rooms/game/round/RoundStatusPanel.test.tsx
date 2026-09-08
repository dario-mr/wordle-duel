import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RoundStatusPanel } from '../../../../../src/features/rooms/game/round/RoundStatusPanel';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../../../../src/shared/api/errors', () => ({
  getErrorMessage: () => 'Next round failed',
}));

vi.mock('@chakra-ui/react', () => ({
  Code: ({ children }: { children?: ReactNode }) => <code>{children}</code>,
  Stack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
}));

vi.mock('../../../../../src/shared/ui/ErrorAlert', () => ({
  ErrorAlert: ({ title, message }: { title: string; message: string }) => (
    <div>{`${title}:${message}`}</div>
  ),
}));

vi.mock('../../../../../src/shared/ui/BrandButton', () => ({
  PrimaryButton: ({
    children,
    disabled,
    onClick,
  }: {
    children?: ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

function room(args?: {
  status?: 'IN_PROGRESS' | 'MATCH_FINISHED';
  roundNumber?: number;
  playerStatus?: 'WON' | 'LOST';
  rematchRequested?: boolean;
}) {
  return {
    id: 'room-1',
    language: 'IT' as const,
    rounds: 5 as const,
    status: args?.status ?? 'IN_PROGRESS',
    rematchRequested: args?.rematchRequested ?? false,
    players: [],
    currentRound: {
      roundNumber: args?.roundNumber ?? 2,
      maxAttempts: 6,
      guesses: [],
      playerStatus: args?.playerStatus ?? 'LOST',
      roundStatus: 'PLAYING' as const,
      solution: 'APPLE',
    },
  };
}

function panelProps(roomDto = room()) {
  return {
    room: roomDto,
    onNextRound: vi.fn(),
    isNextRoundPending: false,
    nextRoundError: null,
    onRematch: vi.fn(),
    isRematchPending: false,
    isRematchWaiting: roomDto.rematchRequested,
    rematchError: null,
  };
}

describe('RoundStatusPanel', () => {
  it('shows the completed board result, solution, and next-round action', () => {
    const props = panelProps();
    render(<RoundStatusPanel {...props} />);

    expect(screen.getByText('room.round.youLostThisRound')).toBeTruthy();
    expect(screen.getByText(/room\.round\.solution:/)).toBeTruthy();
    expect(screen.getByText('APPLE')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'room.round.nextRound' }));
    expect(props.onNextRound).toHaveBeenCalledOnce();
  });

  it('waits after a completed final round instead of offering another round', () => {
    render(<RoundStatusPanel {...panelProps(room({ roundNumber: 5 }))} />);

    expect(screen.getByText('room.round.waitingForOpponent')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'room.round.nextRound' })).toBeNull();
  });

  it('hides the round result after the match finishes', () => {
    render(
      <RoundStatusPanel
        {...panelProps(room({ status: 'MATCH_FINISHED', roundNumber: 5, playerStatus: 'WON' }))}
      />,
    );

    expect(screen.queryByText('room.round.youWonThisRound')).toBeNull();
    expect(screen.getByRole('button', { name: 'room.round.playAgain' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'room.round.backToHome' })).toBeNull();
  });

  it('shows the persisted waiting state and blocks another rematch request', () => {
    const props = panelProps(room({ status: 'MATCH_FINISHED', rematchRequested: true }));
    render(<RoundStatusPanel {...props} />);

    const button = screen.getByRole('button', { name: 'room.round.waitingForOpponent' });
    expect(button.hasAttribute('disabled')).toBe(true);
    fireEvent.click(button);
    expect(props.onRematch).not.toHaveBeenCalled();
  });

  it('keeps the lost round solution visible after the match finishes', () => {
    render(
      <RoundStatusPanel
        {...panelProps(room({ status: 'MATCH_FINISHED', roundNumber: 5, playerStatus: 'LOST' }))}
      />,
    );

    expect(screen.getByText('room.round.youLostThisRound')).toBeTruthy();
    expect(screen.getByText('APPLE')).toBeTruthy();
  });
});
