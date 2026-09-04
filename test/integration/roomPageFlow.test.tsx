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
  getRoom: vi.fn(),
  listRoomMessages: vi.fn(),
  markRoomMessagesRead: vi.fn(),
  sendRoomMessage: vi.fn(),
  submitGuess: vi.fn(),
  startNextRound: vi.fn(),
  useRoomTopic: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock('../../src/auth/useCurrentUser', () => ({
  useCurrentUser: () =>
    mocks.getCurrentUser() as { id: string; roles: string[] } | null | undefined,
}));

vi.mock('../../src/api/rooms', () => ({
  createRoom: vi.fn(),
  getRoom: mocks.getRoom,
  joinRoom: vi.fn(),
  listRoomMessages: mocks.listRoomMessages,
  listMyRooms: vi.fn(),
  markRoomMessagesRead: mocks.markRoomMessagesRead,
  requestRematch: vi.fn(),
  sendRoomMessage: mocks.sendRoomMessage,
  startNextRound: mocks.startNextRound,
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

vi.mock('../../src/components/room/RoomChatDrawer', () => ({
  RoomChatDrawer: ({
    unreadCount,
    onOpenChange,
  }: {
    unreadCount: number;
    onOpenChange: (open: boolean) => void;
  }) => (
    <button
      type="button"
      onClick={() => {
        onOpenChange(true);
      }}
    >
      {'room-chat:' + String(unreadCount)}
    </button>
  ),
}));

vi.mock('../../src/components/room/round/RoundPanel.tsx', () => ({
  RoundPanel: ({ chat }: { chat?: ReactNode }) => (
    <div>
      round-panel
      {chat}
    </div>
  ),
}));

vi.mock('../../src/components/room/board/PlayerBoard', () => ({
  PlayerBoard: ({ currentGuess, room }: { currentGuess?: string; room: RoomDto }) => (
    <div data-testid="player-board">{`${String(room.currentRound?.roundNumber)}:${currentGuess ?? ''}`}</div>
  ),
}));

vi.mock('../../src/components/room/round/RoundStatusPanel', () => ({
  RoundStatusPanel: ({ room, onNextRound }: { room: RoomDto; onNextRound: () => void }) =>
    room.currentRound?.playerStatus === 'PLAYING' ? null : (
      <button type="button" onClick={onNextRound}>
        next-round
      </button>
    ),
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
    rounds: 5,
    status: 'IN_PROGRESS',
    players: [
      { id: 'me-1', score: 10, displayName: 'Me' },
      { id: 'opponent-1', score: 9, displayName: 'Opponent' },
    ],
    currentRound: {
      roundNumber: 2,
      maxAttempts: 6,
      guesses: [
        {
          word: 'ALLEY',
          attemptNumber: 1,
          letters: [
            { letter: 'A', status: 'PRESENT' },
            { letter: 'L', status: 'ABSENT' },
          ],
        },
      ],
      playerStatus: 'PLAYING',
      roundStatus: 'PLAYING',
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
    mocks.listRoomMessages.mockReset();
    mocks.listRoomMessages.mockResolvedValue({ messages: [], unreadCount: 0 });
    mocks.markRoomMessagesRead.mockReset();
    mocks.sendRoomMessage.mockReset();
    mocks.submitGuess.mockReset();
    mocks.startNextRound.mockReset();
    mocks.useRoomTopic.mockReset();
    mocks.showToast.mockReset();
  });

  it('keeps the completed board until the player starts their next round', async () => {
    const initialRoom = createRoom('room-1');
    const currentRound = initialRoom.currentRound;
    if (!currentRound) {
      throw new Error('Expected a current round for integration test');
    }

    const completedRoom: RoomDto = {
      ...initialRoom,
      currentRound: {
        ...currentRound,
        playerStatus: 'WON',
        roundStatus: 'PLAYING',
      },
    };
    const nextRoom: RoomDto = {
      ...initialRoom,
      currentRound: {
        roundNumber: currentRound.roundNumber + 1,
        maxAttempts: 6,
        guesses: [],
        playerStatus: 'PLAYING',
        roundStatus: 'PLAYING',
      },
    };

    mocks.getRoom.mockResolvedValue(initialRoom);
    mocks.submitGuess.mockResolvedValue({ room: completedRoom });
    mocks.startNextRound.mockResolvedValue(nextRoom);

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
    expect(screen.getByTestId('player-board').textContent).toBe('2:APPLE');

    fireEvent.click(screen.getByRole('button', { name: 'submit-guess' }));

    await waitFor(() => {
      expect(mocks.submitGuess).toHaveBeenCalledWith({
        roomId: 'room-1',
        body: { word: 'APPLE' },
      });
      expect(screen.queryByTestId('keyboard-value')).toBeNull();
      expect(queryClient.getQueryData(roomQueryKey('room-1'))).toEqual(completedRoom);
    });

    fireEvent.click(screen.getByRole('button', { name: 'next-round' }));

    await waitFor(() => {
      expect(mocks.startNextRound).toHaveBeenCalledWith('room-1');
      expect(screen.getByTestId('keyboard-value').textContent).toBe('');
      expect(screen.getByTestId('player-board').textContent).toBe('3:');
      expect(queryClient.getQueryData(roomQueryKey('room-1'))).toEqual(nextRoom);
    });
  });

  it('uses the persisted unread count and marks messages read when chat opens', async () => {
    mocks.getRoom.mockResolvedValue(createRoom('room-1'));
    mocks.listRoomMessages.mockResolvedValue({ messages: [], unreadCount: 2 });
    mocks.markRoomMessagesRead.mockResolvedValue({ messages: [], unreadCount: 0 });

    renderRoomPage(createTestQueryClient());

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'room-chat:2' })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'room-chat:2' }));

    await waitFor(() => {
      expect(mocks.markRoomMessagesRead).toHaveBeenCalledWith('room-1');
      expect(screen.getByRole('button', { name: 'room-chat:0' })).toBeTruthy();
    });
  });
});
