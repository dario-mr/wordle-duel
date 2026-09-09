import { QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RoomDto } from '../../src/features/rooms/types';
import { RoomPage } from '../../src/features/rooms/game/RoomPage';
import { roomQueryKey } from '../../src/features/rooms/queries';
import { liveRoom, winningGuess } from '../testUtils/rooms';
import { UNAUTHENTICATED_CODE, WdsApiError } from '../../src/shared/api/apiError';
import { createTestQueryClient } from '../testUtils/queryClient';
import { withMemoryRouter, Route } from '../testUtils/router';

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  authError: null as unknown,
  refetchAuth: vi.fn(),
  getRoom: vi.fn(),
  requestRematch: vi.fn(),
  listRoomMessages: vi.fn(),
  markRoomMessagesRead: vi.fn(),
  sendRoomMessage: vi.fn(),
  submitGuess: vi.fn(),
  startNextRound: vi.fn(),
  useRoomTopic: vi.fn<typeof import('../../src/features/rooms/game/useRoomTopic').useRoomTopic>(),
  showToast: vi.fn(),
}));

vi.mock('../../src/features/auth/queries', () => ({
  useMeQuery: () => ({
    data: mocks.getCurrentUser() as { id: string; roles: string[] } | null | undefined,
    error: mocks.authError,
    refetch: mocks.refetchAuth,
  }),
}));

vi.mock('../../src/features/auth/AuthErrorAlert', () => ({
  AuthErrorAlert: ({ error, onRetry }: { error: unknown; onRetry: () => void }) => (
    <div>
      {`auth-error:${error instanceof Error ? error.message : String(error)}`}
      <button type="button" onClick={onRetry}>
        retry-auth
      </button>
    </div>
  ),
}));

vi.mock('../../src/features/rooms/api', () => ({
  createRoom: vi.fn(),
  getRoom: mocks.getRoom,
  joinRoom: vi.fn(),
  listRoomMessages: mocks.listRoomMessages,
  listMyRooms: vi.fn(),
  markRoomMessagesRead: mocks.markRoomMessagesRead,
  requestRematch: mocks.requestRematch,
  sendRoomMessage: mocks.sendRoomMessage,
  startNextRound: mocks.startNextRound,
  submitGuess: mocks.submitGuess,
}));

vi.mock('../../src/features/rooms/game/useRoomTopic', () => ({
  useRoomTopic: mocks.useRoomTopic,
}));

vi.mock('../../src/shared/hooks/useSingleToast', () => ({
  useSingleToast: () => ({ show: mocks.showToast }),
}));

vi.mock('../../src/shared/api/errors', () => ({
  getErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : 'Unknown room error',
}));

vi.mock('react-i18next', async () => await import('../testUtils/reactI18nextMock'));

vi.mock('@chakra-ui/react', () => ({
  Stack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../src/shared/ui/ErrorAlert', () => ({
  ErrorAlert: ({ title, message }: { title: string; message: string }) => (
    <div>{`${title}:${message}`}</div>
  ),
}));

vi.mock('../../src/features/rooms/game/RoomSkeleton', () => ({
  RoomSkeleton: () => <div>room-skeleton</div>,
}));

vi.mock('../../src/features/rooms/game/RoomJoinGate', () => ({
  RoomJoinGate: ({ roomId }: { roomId?: string }) => <div>{`join-gate:${roomId ?? ''}`}</div>,
}));

vi.mock('../../src/features/rooms/game/RoomSharePanel', () => ({
  RoomSharePanel: ({ roomId }: { roomId?: string }) => <div>{`share-panel:${roomId ?? ''}`}</div>,
}));

vi.mock('../../src/features/rooms/game/RoomChatDrawer', () => ({
  RoomChatDrawer: ({
    unreadCount,
    onOpenChange,
    onSend,
    isSendBlocked,
  }: ComponentProps<
    typeof import('../../src/features/rooms/game/RoomChatDrawer').RoomChatDrawer
  >) => (
    <div>
      <button
        onClick={() => {
          onOpenChange(true);
        }}
      >
        room-chat:{unreadCount}
      </button>
      <button
        disabled={isSendBlocked}
        onClick={() => {
          onSend('GOOD_LUCK');
        }}
      >
        send-chat
      </button>
    </div>
  ),
}));

vi.mock('../../src/features/rooms/game/round/RoundPanel', () => ({
  RoundPanel: ({ chat }: { chat?: ReactNode }) => (
    <div>
      round-panel
      {chat}
    </div>
  ),
}));

vi.mock('../../src/features/rooms/game/board/PlayerBoard', () => ({
  PlayerBoard: ({ currentGuess, room }: { currentGuess?: string; room: RoomDto }) => (
    <div data-testid="player-board">{`${String(room.currentRound?.roundNumber)}:${currentGuess ?? ''}`}</div>
  ),
}));

vi.mock('../../src/features/rooms/game/round/RoundStatusPanel', () => ({
  RoundStatusPanel: ({
    room,
    onNextRound,
    onRematch,
    isRematchWaiting,
  }: ComponentProps<
    typeof import('../../src/features/rooms/game/round/RoundStatusPanel').RoundStatusPanel
  >) =>
    room.status === 'MATCH_FINISHED' ? (
      <button disabled={isRematchWaiting} onClick={onRematch}>
        {isRematchWaiting ? 'waiting-for-rematch' : 'play-again'}
      </button>
    ) : (
      <button onClick={onNextRound}>next-round</button>
    ),
}));

vi.mock('../../src/features/rooms/game/keyboard/GuessKeyboard', () => ({
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
          onChange('VERDE');
        }}
      >
        type-verde
      </button>
      <button
        type="button"
        onClick={() => {
          onSubmit('VERDE');
        }}
      >
        submit-guess
      </button>
    </div>
  ),
}));

function renderRoomPage(queryClient = createTestQueryClient(), path = '/rooms/room-1') {
  return render(
    <QueryClientProvider client={queryClient}>
      {withMemoryRouter(<Route path="/rooms/:roomId?" element={<RoomPage />} />, {
        initialEntries: [path],
      })}
    </QueryClientProvider>,
  );
}

describe('room page flow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getCurrentUser.mockReturnValue({ id: 'user-1', roles: ['USER'] });
    mocks.getRoom.mockResolvedValue(liveRoom('room-1'));
    mocks.listRoomMessages.mockResolvedValue({ messages: [], unreadCount: 0 });
    mocks.markRoomMessagesRead.mockResolvedValue({ messages: [], unreadCount: 0 });
  });

  it('shows an invalid-link error without requesting a room', () => {
    renderRoomPage(createTestQueryClient(), '/rooms');
    expect(screen.getByText('room.invalidLinkTitle:room.invalidLinkMessage')).toBeTruthy();
    expect(mocks.getRoom).not.toHaveBeenCalled();
  });

  it('renders nothing for unauthenticated room errors', async () => {
    mocks.getRoom.mockRejectedValue(new WdsApiError({ status: 401, code: UNAUTHENTICATED_CODE }));
    const { container } = renderRoomPage();
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('does not subscribe to the room for an unauthenticated user', async () => {
    mocks.getCurrentUser.mockReturnValue(null);
    const queryClient = createTestQueryClient();
    renderRoomPage(queryClient);
    await waitFor(() => {
      expect(queryClient.getQueryState(roomQueryKey('room-1'))?.status).toBe('success');
    });
    expect(mocks.useRoomTopic.mock.calls.every(([roomId]) => roomId === undefined)).toBe(true);
  });

  it('shows the join gate for a nonparticipant', async () => {
    mocks.getCurrentUser.mockReturnValue({ id: 'visitor', roles: ['USER'] });
    renderRoomPage();
    expect(await screen.findByText('join-gate:room-1')).toBeTruthy();
    expect(mocks.listRoomMessages).not.toHaveBeenCalled();
  });

  it('shows sharing and does not fetch chat while waiting for an opponent', async () => {
    const room = liveRoom('room-1');
    mocks.getRoom.mockResolvedValue({
      ...room,
      status: 'WAITING_FOR_PLAYERS',
      currentRound: null,
      players: room.players.slice(0, 1),
    });
    renderRoomPage();
    expect(await screen.findByText('share-panel:room-1')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'send-chat' })).toBeNull();
    expect(mocks.listRoomMessages).not.toHaveBeenCalled();
  });

  it('blocks chat after three consecutive messages from the current player', async () => {
    mocks.listRoomMessages.mockResolvedValue({
      messages: [1, 2, 3].map((id) => ({
        id,
        senderPlayerId: 'user-1',
        preset: 'GOOD_LUCK',
        createdAt: '2026-09-03T12:00:00Z',
      })),
      unreadCount: 0,
    });
    renderRoomPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'send-chat' }).hasAttribute('disabled')).toBe(true);
    });
  });

  it('shows a toast when the server rejects a chat message', async () => {
    mocks.sendRoomMessage.mockRejectedValue(
      new WdsApiError({ status: 409, code: 'CHAT_MESSAGE_LIMIT_REACHED' }),
    );
    renderRoomPage();
    fireEvent.click(await screen.findByRole('button', { name: 'send-chat' }));
    await waitFor(() => {
      expect(mocks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          title: 'room.chat.sendRejectedTitle',
          description: 'CHAT_MESSAGE_LIMIT_REACHED',
        }),
      );
    });
    expect(mocks.sendRoomMessage).toHaveBeenCalledWith({
      roomId: 'room-1',
      body: { preset: 'GOOD_LUCK' },
    });
  });

  it('marks an incoming opponent message read while chat is open', async () => {
    renderRoomPage();
    fireEvent.click(await screen.findByRole('button', { name: 'room-chat:0' }));
    await waitFor(() => {
      expect(mocks.markRoomMessagesRead).toHaveBeenCalledTimes(1);
    });
    const options = mocks.useRoomTopic.mock.lastCall?.[1];
    act(() => {
      options?.onRoomMessageSent?.({
        id: 1,
        senderPlayerId: 'user-2',
        preset: 'WOW',
        createdAt: '2026-09-03T12:00:00Z',
      });
    });
    await waitFor(() => {
      expect(mocks.markRoomMessagesRead).toHaveBeenCalledTimes(2);
    });
  });

  it('keeps the final board visible while waiting for match closure', async () => {
    const room = liveRoom('room-1');
    mocks.getRoom.mockResolvedValue({
      ...room,
      currentRound: {
        ...room.currentRound,
        roundNumber: 5,
        guesses: [winningGuess],
        playerStatus: 'WON',
        solution: 'VERDE',
      },
    });
    renderRoomPage();
    expect((await screen.findByTestId('player-board')).textContent).toBe('5:');
    expect(screen.queryByTestId('keyboard-value')).toBeNull();
  });

  it('clears the typed guess after an accepted nonwinning guess', async () => {
    const room = liveRoom('room-1');
    mocks.submitGuess.mockResolvedValue({
      room: {
        ...room,
        currentRound: {
          ...room.currentRound,
          guesses: [
            {
              ...winningGuess,
              letters: Array.from('VERDE', (letter) => ({ letter, status: 'ABSENT' })),
            },
          ],
        },
      },
    });
    renderRoomPage();
    fireEvent.click(await screen.findByRole('button', { name: 'type-verde' }));
    expect(screen.getByTestId('keyboard-value').textContent).toBe('VERDE');
    fireEvent.click(screen.getByRole('button', { name: 'submit-guess' }));
    await waitFor(() => {
      expect(screen.getByTestId('keyboard-value').textContent).toBe('');
    });
  });

  it('updates rematch waiting state from the server response', async () => {
    mocks.getRoom.mockResolvedValue({
      ...liveRoom('room-1'),
      status: 'MATCH_FINISHED',
      currentRound: null,
    });
    mocks.requestRematch.mockResolvedValue({ started: false });
    const queryClient = createTestQueryClient();
    renderRoomPage(queryClient);
    fireEvent.click(await screen.findByRole('button', { name: 'play-again' }));
    expect(await screen.findByRole('button', { name: 'waiting-for-rematch' })).toBeTruthy();
    expect(mocks.requestRematch).toHaveBeenCalledWith('room-1');
    expect(queryClient.getQueryData(roomQueryKey('room-1'))).toMatchObject({
      rematchRequested: true,
    });
  });

  it('loads persisted rematch waiting state without a new request', async () => {
    mocks.getRoom.mockResolvedValue({
      ...liveRoom('room-1'),
      status: 'MATCH_FINISHED',
      currentRound: null,
      rematchRequested: true,
    });
    renderRoomPage();
    expect(await screen.findByRole('button', { name: 'waiting-for-rematch' })).toBeTruthy();
    expect(mocks.requestRematch).not.toHaveBeenCalled();
  });

  it('keeps the completed board until the player starts their next round', async () => {
    const initialRoom = liveRoom('room-1');
    const currentRound = initialRoom.currentRound;

    const completedRoom: RoomDto = {
      ...initialRoom,
      currentRound: {
        ...currentRound,
        guesses: [winningGuess],
        solution: 'VERDE',
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

    fireEvent.click(screen.getByRole('button', { name: 'type-verde' }));
    expect(screen.getByTestId('keyboard-value').textContent).toBe('VERDE');
    expect(screen.getByTestId('player-board').textContent).toBe('1:VERDE');

    fireEvent.click(screen.getByRole('button', { name: 'submit-guess' }));

    await waitFor(() => {
      expect(mocks.submitGuess).toHaveBeenCalledWith({
        roomId: 'room-1',
        body: { word: 'VERDE' },
      });
      expect(screen.queryByTestId('keyboard-value')).toBeNull();
      expect(queryClient.getQueryData(roomQueryKey('room-1'))).toEqual(completedRoom);
    });

    fireEvent.click(screen.getByRole('button', { name: 'next-round' }));

    await waitFor(() => {
      expect(mocks.startNextRound).toHaveBeenCalledWith('room-1');
      expect(screen.getByTestId('keyboard-value').textContent).toBe('');
      expect(screen.getByTestId('player-board').textContent).toBe('2:');
      expect(queryClient.getQueryData(roomQueryKey('room-1'))).toEqual(nextRoom);
    });
  });

  it('uses the persisted unread count and marks messages read when chat opens', async () => {
    mocks.getRoom.mockResolvedValue(liveRoom('room-1'));
    mocks.listRoomMessages
      .mockResolvedValueOnce({ messages: [], unreadCount: 2 })
      .mockResolvedValue({ messages: [], unreadCount: 0 });
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
