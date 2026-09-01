import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WdsApiError, type GuessLetterStatus, type RoomDto } from '../../src/api/types';
import { UNAUTHENTICATED_CODE } from '../../src/constants';
import { RoomPage } from '../../src/pages/RoomPage';

interface MockRoomQueryResult {
  data?: RoomDto;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  error: unknown;
}

interface SubmitGuessCallbacks {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

const mocks = vi.hoisted(() => ({
  roomId: 'room-1' as string | undefined,
  navigate: vi.fn(),
  getCurrentUser: vi.fn(),
  roomQueryResult: {
    data: undefined,
    isLoading: false,
    isFetching: false,
    isSuccess: false,
    error: null,
  } as MockRoomQueryResult,
  lastRoomQueryArgs: undefined as
    { roomId: string | undefined; enabled: boolean | undefined } | undefined,
  useRoomTopic: vi.fn(),
  submitMutate: vi.fn(),
  submitMutation: {
    isPending: false,
    mutate: vi.fn(),
  },
  nextRoundMutation: {
    isPending: false,
    error: null as Error | null,
    mutate: vi.fn(),
  },
  rematchMutation: {
    isPending: false,
    error: null as Error | null,
    isSuccess: false,
    data: undefined as { roomId: string | null } | undefined,
    mutate: vi.fn(),
  },
  showToast: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ roomId: mocks.roomId }),
  useNavigate: () => mocks.navigate,
}));

vi.mock('../../src/auth/useCurrentUser', () => ({
  useCurrentUser: () => mocks.getCurrentUser() as { id: string; roles: string[] } | null,
}));

vi.mock('../../src/api/errors', () => ({
  getErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : 'Unknown room error',
}));

vi.mock('../../src/query/roomQueries', () => ({
  useRoomQuery: (roomId: string | undefined, args?: { enabled?: boolean }) => {
    mocks.lastRoomQueryArgs = { roomId, enabled: args?.enabled };
    return mocks.roomQueryResult;
  },
  useSubmitGuessMutation: () => mocks.submitMutation,
  useNextRoundMutation: () => mocks.nextRoundMutation,
  useRematchMutation: () => mocks.rematchMutation,
}));

vi.mock('../../src/ws/useRoomTopic', () => ({
  useRoomTopic: mocks.useRoomTopic,
}));

vi.mock('../../src/hooks/useSingleToast', () => ({
  useSingleToast: () => ({ show: mocks.showToast }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

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
  PlayerBoard: ({ currentGuess, room }: { currentGuess?: string; room: RoomDto }) => (
    <div>{`player-board:${room.id}:${currentGuess ?? ''}`}</div>
  ),
}));

vi.mock('../../src/components/room/round/RoundStatusPanel', () => ({
  RoundStatusPanel: ({
    room,
    onRematch,
    onBackToHome,
  }: {
    room: RoomDto;
    onRematch: () => void;
    onBackToHome: () => void;
  }) => (
    <div>
      <div>{`round-status:${room.currentRound ? 'active' : 'waiting'}`}</div>
      {room.status === 'CLOSED' && (
        <button type="button" onClick={onRematch}>
          room.round.playAgain
        </button>
      )}
      {room.status === 'CLOSED' && (
        <button type="button" onClick={onBackToHome}>
          room.round.backToHome
        </button>
      )}
    </div>
  ),
}));

vi.mock('../../src/components/room/keyboard/GuessKeyboard', () => ({
  GuessKeyboard: ({
    value,
    onChange,
    onSubmit,
    letterStatusByLetter,
  }: {
    value: string;
    onChange: (nextValue: string) => void;
    onSubmit: (word: string) => void;
    letterStatusByLetter?: Partial<Record<string, GuessLetterStatus>>;
  }) => (
    <div>
      <div>{`keyboard-value:${value}`}</div>
      <div>{`letters:${Object.keys(letterStatusByLetter ?? {}).join(',')}`}</div>
      <button
        type="button"
        onClick={() => {
          onChange('APPLE');
        }}
      >
        change-guess
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

function createRoom(args?: {
  status?: RoomDto['status'];
  meId?: string;
  includeMe?: boolean;
  currentRound?: RoomDto['currentRound'];
}): RoomDto {
  const meId = args?.meId ?? 'me-1';
  const includeMe = args?.includeMe ?? true;
  const players = includeMe
    ? [
        { id: meId, score: 10, displayName: 'Me' },
        { id: 'opponent-1', score: 8, displayName: 'Opponent' },
      ]
    : [
        { id: 'opponent-1', score: 8, displayName: 'Opponent' },
        { id: 'opponent-2', score: 6, displayName: 'Second' },
      ];

  return {
    id: 'room-1',
    language: 'IT',
    rounds: 5,
    status: args?.status ?? 'IN_PROGRESS',
    players,
    currentRound:
      args?.status === 'WAITING_FOR_PLAYERS'
        ? null
        : args?.currentRound === undefined
          ? {
              roundNumber: 2,
              maxAttempts: 6,
              guesses: includeMe
                ? [
                    {
                      word: 'ALLEY',
                      attemptNumber: 1,
                      letters: [
                        { letter: 'A', status: 'PRESENT' },
                        { letter: 'L', status: 'ABSENT' },
                      ],
                    },
                  ]
                : [],
              playerStatus: 'PLAYING',
              roundStatus: 'PLAYING',
            }
          : args.currentRound,
  };
}

describe('RoomPage', () => {
  beforeEach(() => {
    mocks.roomId = 'room-1';
    mocks.navigate.mockReset();
    mocks.getCurrentUser.mockReset();
    mocks.getCurrentUser.mockReturnValue({ id: 'me-1', roles: ['USER'] });
    mocks.roomQueryResult = {
      data: createRoom(),
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      error: null,
    };
    mocks.lastRoomQueryArgs = undefined;
    mocks.useRoomTopic.mockReset();
    mocks.submitMutate.mockReset();
    mocks.submitMutation = {
      isPending: false,
      mutate: vi.fn((_vars: { word: string }, options?: SubmitGuessCallbacks) => {
        options?.onSuccess?.();
      }),
    };
    mocks.nextRoundMutation = {
      isPending: false,
      error: null,
      mutate: vi.fn(),
    };
    mocks.rematchMutation = {
      isPending: false,
      error: null,
      isSuccess: false,
      data: undefined,
      mutate: vi.fn(),
    };
    mocks.showToast.mockReset();
  });

  it('shows an invalid-link error when the route has no roomId', () => {
    mocks.roomId = undefined;

    render(<RoomPage />);

    expect(screen.getByText('room.invalidLinkTitle:room.invalidLinkMessage')).toBeTruthy();
  });

  it('renders nothing for unauthenticated room query errors', () => {
    mocks.roomQueryResult = {
      data: undefined,
      isLoading: false,
      isFetching: false,
      isSuccess: false,
      error: new WdsApiError({
        status: 401,
        code: UNAUTHENTICATED_CODE,
        message: 'Unauthenticated',
      }),
    };

    const { container } = render(<RoomPage />);

    expect(container.firstChild).toBeNull();
  });

  it('does not open a room websocket for an unauthenticated user', () => {
    mocks.getCurrentUser.mockReturnValue(null);

    render(<RoomPage />);

    const [topicRoomId, topicOptions] = mocks.useRoomTopic.mock.calls[0] as [
      string | undefined,
      { onRematchStarted?: unknown },
    ];
    expect(topicRoomId).toBeUndefined();
    expect(typeof topicOptions.onRematchStarted).toBe('function');
  });

  it('shows the join gate when the authenticated user is not part of the room', () => {
    mocks.getCurrentUser.mockReturnValue({ id: 'me-1', roles: ['USER'] });
    mocks.roomQueryResult.data = createRoom({ includeMe: false });

    render(<RoomPage />);

    expect(screen.getByText('join-gate:room-1')).toBeTruthy();
  });

  it('keeps the completed final board visible while the player waits for match closure', () => {
    mocks.roomQueryResult.data = createRoom({
      currentRound: {
        roundNumber: 5,
        maxAttempts: 6,
        guesses: [],
        playerStatus: 'LOST',
        roundStatus: 'PLAYING',
        solution: 'APPLE',
      },
    });

    render(<RoomPage />);

    expect(screen.queryByText(/keyboard-value:/)).toBeNull();
    expect(screen.getByText('player-board:room-1:')).toBeTruthy();
    expect(screen.getByText('round-status:active')).toBeTruthy();
  });

  it('clears the current guess after a successful submit', async () => {
    render(<RoomPage />);

    fireEvent.click(screen.getByRole('button', { name: 'change-guess' }));
    expect(screen.getByText('keyboard-value:APPLE')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'submit-guess' }));

    const calls = mocks.submitMutation.mutate.mock.calls as unknown[][];
    expect(calls[0]?.[0]).toEqual({ word: 'APPLE' });

    await waitFor(() => {
      expect(screen.getByText('keyboard-value:')).toBeTruthy();
    });
  });

  it('navigates to the room returned by a rematch request', () => {
    mocks.roomQueryResult.data = createRoom({ status: 'CLOSED', currentRound: null });

    render(<RoomPage />);

    fireEvent.click(screen.getByRole('button', { name: 'room.round.playAgain' }));

    expect(mocks.rematchMutation.mutate).toHaveBeenCalledWith(undefined, expect.any(Object));

    const calls = mocks.rematchMutation.mutate.mock.calls as unknown[][];
    const options = calls[0]?.[1] as
      { onSuccess?: (response: { roomId: string | null }) => void } | undefined;
    options?.onSuccess?.({ roomId: 'room-2' });

    expect(mocks.navigate).toHaveBeenCalledWith('/rooms/room-2');
  });

  it('navigates to the room announced by the rematch event', () => {
    mocks.roomQueryResult.data = createRoom({ status: 'CLOSED', currentRound: null });

    render(<RoomPage />);

    const options = mocks.useRoomTopic.mock.calls[0]?.[1] as
      { onRematchStarted?: (roomId: string) => void } | undefined;
    options?.onRematchStarted?.('room-2');

    expect(mocks.navigate).toHaveBeenCalledWith('/rooms/room-2');
  });

  it('returns to home from a completed match', () => {
    mocks.roomQueryResult.data = createRoom({ status: 'CLOSED', currentRound: null });

    render(<RoomPage />);

    fireEvent.click(screen.getByRole('button', { name: 'room.round.backToHome' }));

    expect(mocks.navigate).toHaveBeenCalledWith('/');
  });
});
