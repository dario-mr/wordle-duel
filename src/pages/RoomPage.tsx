import { Stack } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../api/errors';
import { type GuessLetterStatus, WdsApiError } from '../api/types';
import { useCurrentUser } from '../auth/useCurrentUser';
import { ERROR_TOAST_DURATION_MS, UNAUTHENTICATED_CODE, WORD_LENGTH } from '../constants';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { GuessKeyboard } from '../components/room/keyboard/GuessKeyboard';
import { PlayerBoard } from '../components/room/board/PlayerBoard';
import { RoomJoinGate } from '../components/room/RoomJoinGate';
import { RoomSharePanel } from '../components/room/RoomSharePanel';
import { RoundStatusPanel } from '../components/room/round/RoundStatusPanel';
import {
  useNextRoundMutation,
  useRematchMutation,
  useRoomQuery,
  useSubmitGuessMutation,
} from '../query/roomQueries';
import { useRoomTopic } from '../ws/useRoomTopic';
import { RoundPanel } from '../components/room/round/RoundPanel.tsx';
import { useSingleToast } from '../hooks/useSingleToast';
import { RoomSkeleton } from '../components/room/RoomSkeleton.tsx';

export function RoomPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const meUser = useCurrentUser();

  const myPlayerId = meUser?.id ?? '';
  const handleRematchStarted = useCallback(
    (newRoomId: string) => {
      void navigate(`/rooms/${newRoomId}`);
    },
    [navigate],
  );

  const authResolved = meUser !== undefined;
  const {
    data: room,
    isLoading,
    isFetching,
    isSuccess,
    error,
  } = useRoomQuery(roomId, {
    enabled: authResolved,
  });
  useRoomTopic(meUser ? roomId : undefined, { onRematchStarted: handleRematchStarted });

  const [guessState, setGuessState] = useState<{ roundNumber?: number; value: string }>({
    value: '',
  });

  const currentRound = room?.currentRound ?? null;
  const currentRoundNumber = currentRound?.roundNumber;

  const guess =
    typeof currentRoundNumber === 'number' && guessState.roundNumber === currentRoundNumber
      ? guessState.value
      : '';

  const submitGuessMutation = useSubmitGuessMutation({
    roomId: roomId ?? '',
  });
  const nextRoundMutation = useNextRoundMutation({ roomId: roomId ?? '' });

  const rematchMutation = useRematchMutation({ roomId: roomId ?? '' });

  const myRoundStatus = currentRound?.playerStatus;

  const me = room?.players.find((p) => p.id === myPlayerId);
  const opponent = room?.players.find((p) => p.id !== myPlayerId);

  const letterStatusByLetter = useMemo<Partial<Record<string, GuessLetterStatus>>>(() => {
    if (!currentRound) {
      return {};
    }

    const guesses = currentRound.guesses;
    const strength: Record<GuessLetterStatus, number> = {
      ABSENT: 0,
      PRESENT: 1,
      CORRECT: 2,
    };

    const result: Partial<Record<string, GuessLetterStatus>> = {};

    for (const guess of guesses) {
      for (const { letter, status } of guess.letters) {
        const normalizedLetter = letter.toUpperCase();
        const prevStatus = result[normalizedLetter];

        if (!prevStatus || strength[status] > strength[prevStatus]) {
          result[normalizedLetter] = status;
        }
      }
    }

    return result;
  }, [currentRound]);

  const showGuessKeyboard = room?.status === 'IN_PROGRESS' && myRoundStatus === 'PLAYING';

  const showRoundStatusPanel =
    room?.status !== 'IN_PROGRESS' || !currentRound || myRoundStatus !== 'PLAYING';

  const canSubmit =
    Boolean(roomId) &&
    Boolean(myPlayerId) &&
    room?.status === 'IN_PROGRESS' &&
    myRoundStatus === 'PLAYING' &&
    guess.length === WORD_LENGTH &&
    !submitGuessMutation.isPending;

  const { show: showToast } = useSingleToast();
  const showErrorToast = (message: string) => {
    showToast({
      type: 'warning',
      title: t('room.guess.rejectedTitle'),
      description: message,
      duration: ERROR_TOAST_DURATION_MS,
      closable: true,
    });
  };

  const handleRematch = () => {
    if (!roomId) {
      return;
    }

    rematchMutation.mutate(undefined, {
      onSuccess: ({ roomId: newRoomId }) => {
        if (newRoomId) {
          handleRematchStarted(newRoomId);
        }
      },
    });
  };

  if (!roomId) {
    return (
      <Stack gap={6} align="center" justify="center" minH="50vh" textAlign="center">
        <ErrorAlert title={t('room.invalidLinkTitle')} message={t('room.invalidLinkMessage')} />
      </Stack>
    );
  }

  if (!room && (isLoading || isFetching)) {
    return <RoomSkeleton />;
  }

  if (error) {
    if (error instanceof WdsApiError && error.code === UNAUTHENTICATED_CODE) {
      return null; // redirectToLogin() already navigates
    }

    return (
      <Stack gap={6}>
        <ErrorAlert title={t('room.errorTitle')} message={getErrorMessage(error)} />
      </Stack>
    );
  }

  if (!isSuccess) {
    return null;
  }

  if (!me) {
    if (!myPlayerId) {
      return <RoomSkeleton />;
    }
    return <RoomJoinGate room={room} roomId={roomId} />;
  }

  if (room.status === 'WAITING_FOR_PLAYERS') {
    return <RoomSharePanel roomId={roomId} />;
  }

  return (
    <Stack gap={5} w="full" maxW="44rem" mx="auto" pb={4}>
      <RoundPanel player={me} opponent={opponent} room={room} />

      {currentRound ? (
        <PlayerBoard room={room} currentGuess={showGuessKeyboard ? guess : ''} />
      ) : null}

      {showRoundStatusPanel && (
        <RoundStatusPanel
          room={room}
          onNextRound={() => {
            nextRoundMutation.mutate();
          }}
          isNextRoundPending={nextRoundMutation.isPending}
          nextRoundError={nextRoundMutation.error}
          onRematch={handleRematch}
          isRematchPending={rematchMutation.isPending}
          isRematchWaiting={rematchMutation.isSuccess && rematchMutation.data.roomId === null}
          rematchError={rematchMutation.error}
          onBackToHome={() => {
            void navigate('/');
          }}
        />
      )}

      {showGuessKeyboard && (
        <GuessKeyboard
          value={guess}
          letterStatusByLetter={letterStatusByLetter}
          onChange={(nextValue) => {
            setGuessState({ roundNumber: currentRoundNumber, value: nextValue });
          }}
          disabled={false}
          canSubmit={canSubmit}
          isSubmitting={submitGuessMutation.isPending}
          onSubmit={(word) => {
            if (!roomId) {
              return;
            }
            submitGuessMutation.mutate(
              { word },
              {
                onSuccess: () => {
                  setGuessState({ roundNumber: currentRoundNumber, value: '' });
                },
                onError: (err) => {
                  showErrorToast(getErrorMessage(err));
                },
              },
            );
          }}
        />
      )}
    </Stack>
  );
}
