import { HStack, Separator, Spinner, Stack, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getCurrentUser, subscribeCurrentUser } from '../api/auth';
import { getErrorMessage } from '../api/errors';
import { type GuessLetterStatus, WdsApiError } from '../api/types';
import { UNAUTHENTICATED_CODE, WORD_LENGTH } from '../constants';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { GuessKeyboard } from '../components/room/keyboard/GuessKeyboard';
import { PlayerBoard } from '../components/room/board/PlayerBoard';
import { RoomJoinGate } from '../components/room/RoomJoinGate';
import { RoomSharePanel } from '../components/room/RoomSharePanel';
import { RoundStatusPanel } from '../components/room/round/RoundStatusPanel';
import {
  useReadyForNextRoundMutation,
  useRoomQuery,
  useSubmitGuessMutation,
} from '../query/roomQueries';
import { useRoomTopic } from '../ws/useRoomTopic';
import { RoundPanel } from '../components/room/round/RoundPanel.tsx';
import { useSingleToast } from '../hooks/useSingleToast';

export function RoomPage() {
  const { t } = useTranslation();
  const { roomId } = useParams();

  const [meUser, setMeUser] = useState(() => getCurrentUser());

  useEffect(() => {
    return subscribeCurrentUser(() => {
      setMeUser(getCurrentUser());
    });
  }, []);

  const myPlayerId = meUser?.id ?? '';

  const { data: room, isLoading, isFetching, isSuccess, error } = useRoomQuery(roomId);
  useRoomTopic(roomId);

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

  const readyForNextRoundMutation = useReadyForNextRoundMutation({
    roomId: roomId ?? '',
  });

  const myRoundStatus = currentRound?.statusByPlayerId[myPlayerId];
  const endedRound = currentRound?.roundStatus === 'ENDED' ? currentRound : null;
  const isRoundEnded = Boolean(endedRound);

  const me = room?.players.find((p) => p.id === myPlayerId);
  const opponent = room?.players.find((p) => p.id !== myPlayerId);

  const letterStatusByLetter = useMemo<Partial<Record<string, GuessLetterStatus>>>(() => {
    if (!me || !currentRound) {
      return {};
    }

    const guesses = currentRound.guessesByPlayerId[me.id] ?? [];
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
  }, [currentRound, me]);

  const showGuessKeyboard =
    room?.status === 'IN_PROGRESS' && (!myRoundStatus || myRoundStatus === 'PLAYING');

  const showRoundStatusPanel =
    room?.status !== 'IN_PROGRESS' ||
    Boolean(endedRound) ||
    (Boolean(myRoundStatus) && myRoundStatus !== 'PLAYING');

  const canSubmit =
    Boolean(roomId) &&
    Boolean(myPlayerId) &&
    room?.status === 'IN_PROGRESS' &&
    currentRound?.roundStatus === 'PLAYING' &&
    myRoundStatus === 'PLAYING' &&
    guess.length === WORD_LENGTH &&
    !submitGuessMutation.isPending;

  const { show: showToast } = useSingleToast();
  const showErrorToast = (message: string) => {
    showToast({
      type: 'warning',
      title: t('room.guess.rejectedTitle'),
      description: message,
      duration: 3000,
      closable: true,
    });
  };

  if (!roomId) {
    return (
      <Stack gap={6} align="center" justify="center" minH="50vh" textAlign="center">
        <ErrorAlert title={t('room.invalidLinkTitle')} message={t('room.invalidLinkMessage')} />
      </Stack>
    );
  }

  if (isLoading || isFetching) {
    return (
      <Stack gap={6}>
        <HStack align="center" justify="center" alignItems="center">
          <Spinner />
          <Text>{t('common.loadingRoom')}</Text>
        </HStack>
      </Stack>
    );
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
    return <RoomJoinGate room={room} roomId={roomId} />;
  }

  if (room.status === 'WAITING_FOR_PLAYERS') {
    return <RoomSharePanel roomId={roomId} />;
  }

  return (
    <Stack gap={3}>
      <RoundPanel player={me} opponent={opponent} room={room} />

      <Separator />

      <PlayerBoard
        player={me}
        opponent={opponent}
        room={room}
        currentGuess={showGuessKeyboard ? guess : ''}
      />

      {showRoundStatusPanel && (
        <RoundStatusPanel
          room={room}
          endedRound={endedRound}
          myRoundStatus={myRoundStatus}
          isReadyPending={readyForNextRoundMutation.isPending}
          readyError={readyForNextRoundMutation.error}
          onReadyNextRound={(roundNumber) => {
            if (!roomId) {
              return;
            }
            readyForNextRoundMutation.mutate({ roundNumber });
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
          disabled={isRoundEnded || myRoundStatus !== 'PLAYING'}
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
