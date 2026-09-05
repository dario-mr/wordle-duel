import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { RoomDto } from '../../../src/api/types';
import { MyRoomCard } from '../../../src/components/myrooms/MyRoomCard';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@chakra-ui/react', () => ({
  Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Stack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
}));

vi.mock('../../../src/components/common/Card', () => ({
  Card: ({ children }: { children?: ReactNode }) => <article>{children}</article>,
}));

vi.mock('../../../src/components/common/Pill', () => ({
  Pill: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}));

vi.mock('../../../src/components/myrooms/RoomLanguageFlag', () => ({
  RoomLanguageFlag: () => <span>flag</span>,
}));

function room(status: RoomDto['status']): RoomDto {
  return {
    id: 'room-1',
    language: 'IT',
    rounds: 5,
    status,
    players: [
      { id: 'me', wins: 10, matchScore: 2, displayName: 'Me' },
      { id: 'opponent', wins: 8, matchScore: 1, displayName: 'Opponent' },
    ],
    currentRound: null,
  };
}

describe('MyRoomCard', () => {
  it('shows live match scores and cumulative wins for an active match', () => {
    render(<MyRoomCard room={room('IN_PROGRESS')} myPlayerId="me" onOpen={vi.fn()} />);

    expect(screen.getByText('room.playerStats.wins')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
  });

  it('shows final match scores and cumulative wins after the match finishes', () => {
    render(<MyRoomCard room={room('MATCH_FINISHED')} myPlayerId="me" onOpen={vi.fn()} />);

    expect(screen.getByText('room.status.matchFinished')).toBeTruthy();
    expect(screen.getByText('room.playerStats.wins')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
  });
});
