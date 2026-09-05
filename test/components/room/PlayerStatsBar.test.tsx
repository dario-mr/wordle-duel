import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { RoomDto } from '../../../src/api/types';
import { PlayerStatsBar } from '../../../src/components/room/round/PlayerStatsBar';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@chakra-ui/react', () => ({
  Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Grid: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
  VStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

function room(status: RoomDto['status']): RoomDto {
  return {
    id: 'room-1',
    language: 'IT',
    rounds: 5,
    status,
    players: [],
    currentRound: null,
  };
}

describe('PlayerStatsBar', () => {
  it('shows live match scores instead of cumulative wins', () => {
    render(
      <PlayerStatsBar
        room={room('IN_PROGRESS')}
        player={{ id: 'me', wins: 10, matchScore: 2, displayName: 'Me' }}
        opponent={{ id: 'opponent', wins: 20, matchScore: 1, displayName: 'Opponent' }}
      />,
    );

    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.queryByText('room.playerStats.winner')).toBeNull();
  });

  it('shows final match scores and winner', () => {
    render(
      <PlayerStatsBar
        room={room('MATCH_FINISHED')}
        player={{ id: 'me', wins: 10, matchScore: 2, displayName: 'Me' }}
        opponent={{ id: 'opponent', wins: 20, matchScore: 1, displayName: 'Opponent' }}
      />,
    );

    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('room.playerStats.winner')).toBeTruthy();
    expect(screen.getAllByText('room.playerStats.dash')).toHaveLength(1);
  });
});
