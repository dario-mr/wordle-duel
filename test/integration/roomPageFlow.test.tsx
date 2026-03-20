import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RoomDto } from '../../src/api/types';
import { RoomPage } from '../../src/pages/RoomPage';
import { roomQueryKey } from '../../src/query/roomQueries';
import { resetAuthModuleMocks } from '../testUtils/auth';
import { createTestQueryClient } from '../testUtils/queryClient';
import { withMemoryRouter, Route } from '../testUtils/router';

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  subscribeCurrentUser: vi.fn<(listener: () => void) => () => void>(),
  getRoom: vi.fn(),
  submitGuess: vi.fn(),
  readyForNextRound: vi.fn(),
  useRoomTopic: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock('../../src/api/auth', () => ({
  getCurrentUser: mocks.getCurrentUser,
  subscribeCurrentUser: mocks.subscribeCurrentUser,
}));

vi.mock('../../src/api/rooms', () => ({
  createRoom: vi.fn(),
  getRoom: mocks.getRoom,
  joinRoom: vi.fn(),
  listMyRooms: vi.fn(),
  readyForNextRound: mocks.readyForNextRound,
  submitGuess: mocks.submitGuess,
}));

vi.mock('../../src/ws/useRoomTopic', () => ({
  useRoomTopic: mocks.useRoomTopic,
}));

vi.mock('../../src/hooks/useSingleToast', () => ({
  useSingleToast: () => ({ show: mocks.showToast }),
}));

vi.mock('../../src/api/errors', () => ({
  getErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : 'Unknown room error',
}));

vi.mock('react-i18next', async () => await import('../testUtils/reactI18nextMock'));

vi.mock('@chakra-ui/react', () => ({
  Stack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../src/components/common/ErrorAlert', () => ({
  ErrorAlert: ({ title, message }: { title: string; message: string }) => (
    <div>{`${title}:${message}`}</div>
  ),
}));

vi.mock('../../src/components/room/RoomSkeleton.tsx', () => ({
  RoomSkeleton: () => <div>room-skeleton</div>,
}));

vi.mock('../../src/components/room/RoomJoinGate', () => ({
  RoomJoinGate: ({ roomId }: { roomId?: string }) => <div>{`join-gate:${roomId ?? ''}`}</div>,
}));

vi.mock('../../src/components/room/RoomSharePanel', () => ({
  RoomSharePanel: ({ roomId }: { roomId?: string }) => <div>{`share-panel:${roomId ?? ''}`}</div>,
}));

vi.mock('../../src/components/room/round/RoundPanel.tsx', () => ({
  RoundPanel: () => <div>round-panel</div>,
}));

vi.mock('../../src/components/room/board/PlayerBoard', () => ({
  PlayerBoard: ({ currentGuess }: { currentGuess?: string }) => (
    <div data-testid="player-board">{currentGuess ?? ''}</div>
  ),
}));

vi.mock('../../src/components/room/round/RoundStatusPanel', () => ({
  RoundStatusPanel: () => <div>round-status</div>,
}));

vi.mock('../../src/components/room/keyboard/GuessKeyboard', () => ({
  GuessKeyboard: ({
    value,
    onChange,
    onSubmit,
  }: {
    value: string;
    onChange: (nextValue: string) => void;
    onSubmit: (word: string) => void;
  }) => (
    <div>
      <div data-testid="keyboard-value">{value}</div>
      <button
        type="button"
        onClick={() => {
          onChange('APPLE');
        }}
      >
        type-apple
      </button>
      <button
        type="button"
        onClick={() => {
          onSubmit('APPLE');
        }}
      >
        submit-guess
      </button>
    </div>
  ),
}));

function createRoom(roomId: string): RoomDto {
  return {
    id: roomId,
    language: 'IT',
    status: 'IN_PROGRESS',
    players: [
      { id: 'me-1', score: 10, displayName: 'Me' },
      { id: 'opponent-1', score: 9, displayName: 'Opponent' },
    ],
    currentRound: {
      roundNumber: 2,
      maxAttempts: 6,
      guessesByPlayerId: {
        'me-1': [
          {
            word: 'ALLEY',
            attemptNumber: 1,
            letters: [
              { letter: 'A', status: 'PRESENT' },
              { letter: 'L', status: 'ABSENT' },
            ],
          },
        ],
      },
      statusByPlayerId: {
        'me-1': 'PLAYING',
        'opponent-1': 'PLAYING',
      },
      roundStatus: 'PLAYING',
      solution: 'APPLE',
    },
  };
}

function renderRoomPage(queryClient: ReturnType<typeof createTestQueryClient>) {
  return render(
    <QueryClientProvider client={queryClient}>
      {withMemoryRouter(<Route path="/rooms/:roomId" element={<RoomPage />} />, {
        initialEntries: ['/rooms/room-1'],
      })}
    </QueryClientProvider>,
  );
}

describe('room page flow', () => {
  beforeEach(() => {
    resetAuthModuleMocks(mocks, { id: 'me-1', roles: ['USER'] });
    mocks.getRoom.mockReset();
    mocks.submitGuess.mockReset();
    mocks.readyForNextRound.mockReset();
    mocks.useRoomTopic.mockReset();
    mocks.showToast.mockReset();
  });

  it('loads the room through the real query hook and clears the guess after submit', async () => {
    const initialRoom = createRoom('room-1');
    const currentRound = initialRoom.currentRound;
    if (!currentRound) {
      throw new Error('Expected a current round for integration test');
    }

    const updatedRoom: RoomDto = {
      ...initialRoom,
      currentRound: {
        ...currentRound,
        guessesByPlayerId: {
          ...currentRound.guessesByPlayerId,
          'me-1': [
            ...(currentRound.guessesByPlayerId['me-1'] ?? []),
            {
              word: 'APPLE',
              attemptNumber: 2,
              letters: [
                { letter: 'A', status: 'CORRECT' },
                { letter: 'P', status: 'CORRECT' },
              ],
            },
          ],
        },
      },
    };

    mocks.getRoom.mockResolvedValue(initialRoom);
    mocks.submitGuess.mockResolvedValue({ room: updatedRoom });
    mocks.readyForNextRound.mockResolvedValue(updatedRoom);

    const queryClient = createTestQueryClient();

    renderRoomPage(queryClient);

    await waitFor(() => {
      const calls = mocks.getRoom.mock.calls as unknown[][];
      const requestInit = calls[0]?.[1] as RequestInit | undefined;
      expect(calls[0]?.[0]).toBe('room-1');
      expect(requestInit?.signal).toBeInstanceOf(AbortSignal);
      expect(screen.getByTestId('keyboard-value').textContent).toBe('');
    });

    fireEvent.click(screen.getByRole('button', { name: 'type-apple' }));
    expect(screen.getByTestId('keyboard-value').textContent).toBe('APPLE');
    expect(screen.getByTestId('player-board').textContent).toBe('APPLE');

    fireEvent.click(screen.getByRole('button', { name: 'submit-guess' }));

    await waitFor(() => {
      expect(mocks.submitGuess).toHaveBeenCalledWith({
        roomId: 'room-1',
        body: { word: 'APPLE' },
      });
      expect(screen.getByTestId('keyboard-value').textContent).toBe('');
      expect(screen.getByTestId('player-board').textContent).toBe('');
      expect(queryClient.getQueryData(roomQueryKey('room-1'))).toEqual(updatedRoom);
    });
  });
});
