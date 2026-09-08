import { Stack } from '@chakra-ui/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { UNAUTHENTICATED_CODE, WdsApiError } from '../../../shared/api/apiError';
import { getErrorMessage } from '../../../shared/api/errors';
import type { GuessLetterStatus } from '../types';
import { useCurrentUser } from '../../auth/useCurrentUser';
import { WORD_LENGTH } from '../constants';
import { ErrorAlert } from '../../../shared/ui/ErrorAlert';
import { GuessKeyboard } from './keyboard/GuessKeyboard';
import { PlayerBoard } from './board/PlayerBoard';
import { RoomJoinGate } from './RoomJoinGate';
import { RoomChatDrawer } from './RoomChatDrawer';
import { RoomSharePanel } from './RoomSharePanel';
import { RoundStatusPanel } from './round/RoundStatusPanel';
import {
  useMarkRoomMessagesReadMutation,
  useNextRoundMutation,
  useRematchMutation,
  useRoomMessagesQuery,
  useRoomQuery,
  useSendRoomMessageMutation,
  useSubmitGuessMutation,
} from '../queries';
import { useRoomTopic } from './useRoomTopic';
import { RoundPanel } from './round/RoundPanel';
import { useSingleToast } from '../../../shared/hooks/useSingleToast';
import { ERROR_TOAST_DURATION_MS } from '../../../shared/ui/constants';
import { RoomSkeleton } from './RoomSkeleton';

export function RoomPage() {
  const { t } = useTranslation();
  const { roomId } = useParams();
  const meUser = useCurrentUser();

  const myPlayerId = meUser?.id ?? '';
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
  const [guessState, setGuessState] = useState<{ roundNumber?: number; value: string }>({
    value: '',
  });
  const [chatOpen, setChatOpen] = useState(false);
  const chatOpenRef = useRef(false);

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
  const isMatchWinner =
    room?.status === 'MATCH_FINISHED' && me?.matchScore != null && opponent?.matchScore != null
      ? me.matchScore > opponent.matchScore
      : null;
  const isChatReady = Boolean(
    me && room?.status !== 'WAITING_FOR_PLAYERS' && room?.players.length === 2,
  );
  const messagesQuery = useRoomMessagesQuery(roomId, { enabled: isChatReady });
  const sendMessageMutation = useSendRoomMessageMutation({ roomId: roomId ?? '' });
  const markMessagesReadMutation = useMarkRoomMessagesReadMutation({ roomId: roomId ?? '' });
  const markMessagesRead = markMessagesReadMutation.mutate;
  const messages = messagesQuery.data?.messages ?? [];
  const unreadMessageCount = messagesQuery.data?.unreadCount ?? 0;
  const isMessageSendBlocked =
    messages.length >= 3 &&
    messages.slice(-3).every((message) => message.senderPlayerId === myPlayerId);
  const handleChatOpenChange = useCallback(
    (open: boolean) => {
      chatOpenRef.current = open;
      setChatOpen(open);
      if (open) {
        markMessagesRead();
      }
    },
    [markMessagesRead],
  );
  const handleRoomMessageSent = useCallback(
    (message: { senderPlayerId: string }) => {
      if (message.senderPlayerId !== myPlayerId && chatOpenRef.current) {
        markMessagesRead();
      }
    },
    [markMessagesRead, myPlayerId],
  );
  useRoomTopic(meUser && me ? roomId : undefined, { onRoomMessageSent: handleRoomMessageSent });

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
  const showChatErrorToast = (message: string) => {
    showToast({
      type: 'warning',
      title: t('room.chat.sendRejectedTitle'),
      description: message,
      duration: ERROR_TOAST_DURATION_MS,
      closable: true,
    });
  };

  const handleRematch = () => {
    if (!roomId) {
      return;
    }

    rematchMutation.mutate();
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
      <RoundPanel
        player={me}
        opponent={opponent}
        room={room}
        chat={
          <RoomChatDrawer
            messages={messages}
            players={room.players}
            myPlayerId={myPlayerId}
            unreadCount={unreadMessageCount}
            open={chatOpen}
            isLoading={messagesQuery.isLoading}
            isSending={sendMessageMutation.isPending}
            isSendBlocked={isMessageSendBlocked}
            onOpenChange={handleChatOpenChange}
            onSend={(preset) => {
              sendMessageMutation.mutate(preset, {
                onError: (err) => {
                  showChatErrorToast(getErrorMessage(err));
                },
              });
            }}
          />
        }
      />

      {currentRound ? (
        <PlayerBoard room={room} currentGuess={showGuessKeyboard ? guess : ''} />
      ) : null}

      {showRoundStatusPanel && (
        <RoundStatusPanel
          room={room}
          isMatchWinner={isMatchWinner}
          onNextRound={() => {
            nextRoundMutation.mutate();
          }}
          isNextRoundPending={nextRoundMutation.isPending}
          nextRoundError={nextRoundMutation.error}
          onRematch={handleRematch}
          isRematchPending={rematchMutation.isPending}
          isRematchWaiting={room.rematchRequested}
          rematchError={rematchMutation.error}
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
