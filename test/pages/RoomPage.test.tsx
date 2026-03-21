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
  getCurrentUser: vi.fn(),
  subscribeCurrentUser: vi.fn<(listener: () => void) => () => void>(),
  roomQueryResult: {
    data: undefined,
    isLoading: false,
    isFetching: false,
    isSuccess: false,
    error: null,
  } as MockRoomQueryResult,
  lastRoomQueryArgs: undefined as
    | { roomId: string | undefined; enabled: boolean | undefined }
    | undefined,
  useRoomTopic: vi.fn(),
  submitMutate: vi.fn(),
  readyMutate: vi.fn(),
  submitMutation: {
    isPending: false,
    mutate: vi.fn(),
  },
  readyMutation: {
    isPending: false,
    error: null as Error | null,
    mutate: vi.fn(),
  },
  showToast: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ roomId: mocks.roomId }),
}));

vi.mock('../../src/api/auth', () => ({
  getCurrentUser: mocks.getCurrentUser,
  subscribeCurrentUser: mocks.subscribeCurrentUser,
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
  useReadyForNextRoundMutation: () => mocks.readyMutation,
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
  RoundStatusPanel: ({ myRoundStatus }: { myRoundStatus?: string }) => (
    <div>{`round-status:${myRoundStatus ?? 'none'}`}</div>
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
  myRoundStatus?: 'PLAYING' | 'READY' | 'LOST' | 'WON';
  roundStatus?: 'PLAYING' | 'ENDED';
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
    status: args?.status ?? 'IN_PROGRESS',
    players,
    currentRound:
      args?.status === 'WAITING_FOR_PLAYERS'
        ? null
        : {
            roundNumber: 2,
            maxAttempts: 6,
            guessesByPlayerId: includeMe
              ? {
                  [meId]: [
                    {
                      word: 'ALLEY',
                      attemptNumber: 1,
                      letters: [
                        { letter: 'A', status: 'PRESENT' },
                        { letter: 'L', status: 'ABSENT' },
                      ],
                    },
                  ],
                }
              : {},
            statusByPlayerId: includeMe
              ? { [meId]: args?.myRoundStatus ?? 'PLAYING', 'opponent-1': 'PLAYING' }
              : {},
            roundStatus: args?.roundStatus ?? 'PLAYING',
            solution: 'APPLE',
          },
  };
}

describe('RoomPage', () => {
  beforeEach(() => {
    mocks.roomId = 'room-1';
    mocks.getCurrentUser.mockReset();
    mocks.getCurrentUser.mockReturnValue({ id: 'me-1', roles: ['USER'] });
    mocks.subscribeCurrentUser.mockReset();
    mocks.subscribeCurrentUser.mockReturnValue(() => undefined);
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
    mocks.readyMutate.mockReset();
    mocks.submitMutation = {
      isPending: false,
      mutate: vi.fn((_vars: { word: string }, options?: SubmitGuessCallbacks) => {
        options?.onSuccess?.();
      }),
    };
    mocks.readyMutation = {
      isPending: false,
      error: null,
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

  it('shows the join gate when the authenticated user is not part of the room', () => {
    mocks.getCurrentUser.mockReturnValue({ id: 'me-1', roles: ['USER'] });
    mocks.roomQueryResult.data = createRoom({ includeMe: false });

    render(<RoomPage />);

    expect(screen.getByText('join-gate:room-1')).toBeTruthy();
  });

  it('hides the keyboard and shows the round status once the player is ready', () => {
    mocks.roomQueryResult.data = createRoom({ myRoundStatus: 'READY' });

    render(<RoomPage />);

    expect(screen.queryByText(/keyboard-value:/)).toBeNull();
    expect(screen.getByText('round-status:READY')).toBeTruthy();
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
});
