import { HStack, Spinner, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getErrorMessage } from '../api/errors';
import { WdsApiError } from '../api/wdsClient';
import { WORD_LENGTH } from '../constants';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { GuessKeyboard } from '../components/room/keyboard/GuessKeyboard';
import { PlayerBoard } from '../components/room/board/PlayerBoard';
import { RoomJoinGate } from '../components/room/RoomJoinGate';
import { RoomSharePanel } from '../components/room/RoomSharePanel';
import { RoundStatusPanel } from '../components/room/RoundStatusPanel';
import {
  useReadyForNextRoundMutation,
  useRoomQuery,
  useSubmitGuessMutation,
} from '../query/roomQueries';
import { usePlayerStore } from '../state/playerStore';
import { useRoomTopic } from '../ws/useRoomTopic';

export function RoomPage() {
  const { t } = useTranslation();
  const { roomId } = useParams();

  const playerId = usePlayerStore((s) => s.playerId);
  const ensurePlayerId = usePlayerStore((s) => s.ensurePlayerId);

  useEffect(() => {
    if (!playerId) {
      ensurePlayerId();
    }
  }, [ensurePlayerId, playerId]);

  const effectivePlayerId = playerId ?? '';

  const { data: room, isLoading, error } = useRoomQuery(roomId);
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
    playerId: effectivePlayerId,
  });

  const readyForNextRoundMutation = useReadyForNextRoundMutation({
    roomId: roomId ?? '',
    playerId: effectivePlayerId,
  });

  const myRoundStatus = currentRound?.statusByPlayerId[effectivePlayerId];
  const endedRound = currentRound?.roundStatus === 'ENDED' ? currentRound : null;
  const isRoundEnded = Boolean(endedRound);

  const me = room?.players.find((p) => p.id === effectivePlayerId);
  const opponent = room?.players.find((p) => p.id !== effectivePlayerId);

  const showGuessForm =
    room?.status === 'IN_PROGRESS' && (!myRoundStatus || myRoundStatus === 'PLAYING');

  const showRoundStatusPanel =
    room?.status !== 'IN_PROGRESS' ||
    Boolean(endedRound) ||
    (Boolean(myRoundStatus) && myRoundStatus !== 'PLAYING');

  const canSubmit =
    Boolean(roomId) &&
    Boolean(effectivePlayerId) &&
    room?.status === 'IN_PROGRESS' &&
    currentRound?.roundStatus === 'PLAYING' &&
    myRoundStatus === 'PLAYING' &&
    guess.length === WORD_LENGTH &&
    !submitGuessMutation.isPending;

  const shouldShowGuessRejectedError =
    submitGuessMutation.error &&
    !(
      submitGuessMutation.error instanceof WdsApiError &&
      submitGuessMutation.error.code === 'ROUND_FINISHED' &&
      isRoundEnded
    );

  const guessRejectedMessage = shouldShowGuessRejectedError
    ? getErrorMessage(submitGuessMutation.error)
    : undefined;

  if (!roomId) {
    return (
      <Stack gap={6} align="center" justify="center" minH="50vh" textAlign="center">
        <ErrorAlert title={t('room.invalidLinkTitle')} message={t('room.invalidLinkMessage')} />
      </Stack>
    );
  }

  if (isLoading) {
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
    return (
      <Stack gap={6}>
        <ErrorAlert title={t('room.errorTitle')} message={getErrorMessage(error)} />
      </Stack>
    );
  }

  if (!room) {
    return (
      <Stack gap={6}>
        <ErrorAlert
          title={t('room.unexpectedStateTitle')}
          message={t('room.unexpectedStateMessage', { roomId })}
        />
      </Stack>
    );
  }

  if (!me) {
    return <RoomJoinGate room={room} roomId={roomId} getPlayerId={ensurePlayerId} />;
  }

  if (room.status === 'WAITING_FOR_PLAYERS') {
    return <RoomSharePanel roomId={roomId} />;
  }

  return (
    <Stack gap={4}>
      <PlayerBoard
        player={me}
        opponent={opponent}
        room={room}
        currentGuess={showGuessForm ? guess : ''}
      />

      {showRoundStatusPanel ? (
        <RoundStatusPanel
          room={room}
          endedRound={endedRound}
          myRoundStatus={myRoundStatus}
          isReadyPending={readyForNextRoundMutation.isPending}
          readyError={readyForNextRoundMutation.error}
          onReadyNextRound={(roundNumber) => {
            if (!roomId || !effectivePlayerId) {
              return;
            }
            readyForNextRoundMutation.mutate({ roundNumber });
          }}
        />
      ) : null}

      {showGuessForm ? (
        <GuessKeyboard
          value={guess}
          onChange={(nextValue) => {
            setGuessState({ roundNumber: currentRoundNumber, value: nextValue });
          }}
          disabled={isRoundEnded || myRoundStatus !== 'PLAYING'}
          canSubmit={canSubmit}
          isSubmitting={submitGuessMutation.isPending}
          errorMessage={guessRejectedMessage}
          onSubmit={(word) => {
            if (!roomId || !effectivePlayerId) {
              return;
            }
            submitGuessMutation.mutate(
              { word },
              {
                onSuccess: () => {
                  setGuessState({ roundNumber: currentRoundNumber, value: '' });
                },
              },
            );
          }}
        />
      ) : null}
    </Stack>
  );
}
