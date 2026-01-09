import { Alert, Button, Code, HStack, Input, Spinner, Stack, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getErrorMessage } from '../api/errors';
import { WdsApiError } from '../api/wdsClient';
import { WORD_LENGTH } from '../constants';
import { JoinRoomButton } from '../components/JoinRoomButton';
import {
  useReadyForNextRoundMutation,
  useRoomQuery,
  useSubmitGuessMutation,
} from '../query/roomQueries';
import { usePlayerStore } from '../state/playerStore';
import { PlayerBoard } from '../components/room/PlayerBoard';
import { useRoomTopic } from '../ws/useRoomTopic';

function normalizeGuess(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, WORD_LENGTH);
}

function ErrorAlert(props: { title: string; message: string }) {
  return (
    <Alert.Root status="error">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{props.title}</Alert.Title>
        <Alert.Description>{props.message}</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}

export function RoomPage() {
  const { roomId } = useParams();

  const playerId = usePlayerStore((s) => s.playerId);
  const ensurePlayerId = usePlayerStore((s) => s.ensurePlayerId);

  const effectivePlayerId = useMemo(() => playerId ?? ensurePlayerId(), [ensurePlayerId, playerId]);

  const { data: room, isLoading, error } = useRoomQuery(roomId);

  useRoomTopic(roomId);

  const [guessState, setGuessState] = useState<{ roundNumber?: number; value: string }>({
    value: '',
  });

  const [hasCopiedRoomId, setHasCopiedRoomId] = useState(false);

  const copyRoomLink = () => {
    if (!roomId) {
      return;
    }

    const url = window.location.href;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        setHasCopiedRoomId(true);
        window.setTimeout(() => {
          setHasCopiedRoomId(false);
        }, 2000);
      })
      .catch(() => {
        setHasCopiedRoomId(false);
        window.prompt('Copy this room link:', url);
      });
  };

  const shareRoomLink = async () => {
    if (!roomId) {
      return;
    }

    const url = window.location.href;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          url,
          title: 'Wordle Duel',
          text: 'Join my Wordle Duel room',
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
      }
    }
  };

  const submitGuessMutation = useSubmitGuessMutation({
    roomId: roomId ?? '',
    playerId: effectivePlayerId,
  });

  const currentRound = room?.currentRound ?? null;
  const myRoundStatus = currentRound?.statusByPlayerId[effectivePlayerId];
  const me = room?.players.find((p) => p.id === effectivePlayerId);
  const opponent = room?.players.find((p) => p.id !== effectivePlayerId);
  const currentRoundNumber = currentRound?.roundNumber;
  const endedRound = currentRound?.roundStatus === 'ENDED' ? currentRound : null;
  const isRoundEnded = Boolean(endedRound);

  const guess =
    typeof currentRoundNumber === 'number' && guessState.roundNumber === currentRoundNumber
      ? guessState.value
      : '';

  const readyForNextRoundMutation = useReadyForNextRoundMutation({
    roomId: roomId ?? '',
    playerId: effectivePlayerId,
  });

  const canSubmit =
    Boolean(roomId) &&
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

  if (room && !me) {
    if (room.players.length === 1) {
      return (
        <Stack gap={6} minH="50vh" align="center" justify="center" textAlign="center">
          <Text fontSize="2xl" fontWeight="semibold">
            Join this room
          </Text>
          <Text fontSize="md" color="fg.info">
            A player is waiting for an opponent.
          </Text>
          <JoinRoomButton roomId={roomId} getPlayerId={() => effectivePlayerId} />
        </Stack>
      );
    }

    return (
      <Text fontSize="xl" fontWeight="semibold" textAlign="center">
        You are not a player in this room.
      </Text>
    );
  }

  return (
    <Stack gap={6}>
      {isLoading ? (
        <HStack align="center" justify="center" alignItems="center">
          <Spinner />
          <Text>Loading room...</Text>
        </HStack>
      ) : null}

      {error ? <ErrorAlert title="Room error" message={getErrorMessage(error)} /> : null}

      {room ? (
        room.status === 'WAITING_FOR_PLAYERS' ? (
          <Stack gap={5} minH="50vh" align="center" justify="center" textAlign="center">
            <Text fontSize="2xl" fontWeight="semibold">
              Waiting for opponent...
            </Text>
            <Text fontSize="md" color="fg.info">
              Share this room link with a friend to join.
            </Text>
            <HStack gap={3} flexWrap="wrap" justify="center">
              <Button
                bg="fg.primary"
                size="sm"
                color="fg"
                disabled={!roomId}
                onClick={copyRoomLink}
              >
                {hasCopiedRoomId ? 'Copied' : 'Copy link'}
              </Button>

              <Button
                size="sm"
                bg="fg.accent"
                color="fg"
                disabled={!roomId}
                onClick={() => void shareRoomLink()}
              >
                Share
              </Button>
            </HStack>
          </Stack>
        ) : (
          <Stack gap={4}>
            {me ? <PlayerBoard player={me} opponent={opponent} room={room} /> : null}

            <Stack gap={3}>
              {room.status !== 'IN_PROGRESS' ? (
                <Text fontSize="sm">Game not in progress yet.</Text>
              ) : endedRound ? (
                <Stack gap={2} align="center">
                  <Text fontSize="sm">
                    Round ended.
                    {endedRound.solution ? (
                      <>
                        {' '}
                        Solution: <Code>{endedRound.solution}</Code>
                      </>
                    ) : null}
                  </Text>

                  {myRoundStatus === 'READY' ? (
                    <Text fontSize="sm">Waiting for opponent...</Text>
                  ) : (
                    <Button
                      colorPalette="teal"
                      loading={readyForNextRoundMutation.isPending}
                      disabled={!roomId || readyForNextRoundMutation.isPending}
                      onClick={() => {
                        if (!roomId) {
                          return;
                        }
                        readyForNextRoundMutation.mutate({
                          roundNumber: endedRound.roundNumber,
                        });
                      }}
                    >
                      Ready for next round
                    </Button>
                  )}

                  {readyForNextRoundMutation.error ? (
                    <ErrorAlert
                      title="Ready rejected"
                      message={getErrorMessage(readyForNextRoundMutation.error)}
                    />
                  ) : null}
                </Stack>
              ) : myRoundStatus && myRoundStatus !== 'PLAYING' ? (
                <Text fontSize="sm" textAlign="center">
                  You {myRoundStatus.toLowerCase()} this round. Waiting for opponent...
                </Text>
              ) : null}

              {room.status === 'IN_PROGRESS' &&
              myRoundStatus &&
              myRoundStatus !== 'PLAYING' ? null : (
                <>
                  <HStack py={3}>
                    <Input
                      value={guess}
                      onChange={(e) => {
                        setGuessState({
                          roundNumber: currentRoundNumber,
                          value: normalizeGuess(e.target.value),
                        });
                      }}
                      placeholder="ABCDE"
                      maxLength={WORD_LENGTH}
                      disabled={
                        room.status !== 'IN_PROGRESS' || isRoundEnded || myRoundStatus !== 'PLAYING'
                      }
                      autoCapitalize="characters"
                      autoCorrect="off"
                    />
                    <Button
                      colorPalette="teal"
                      disabled={!canSubmit}
                      loading={submitGuessMutation.isPending}
                      onClick={() => {
                        if (!roomId) {
                          return;
                        }
                        const word = normalizeGuess(guess);
                        submitGuessMutation.mutate(
                          { word },
                          {
                            onSuccess: () => {
                              setGuessState({ roundNumber: currentRoundNumber, value: '' });
                            },
                          },
                        );
                      }}
                    >
                      Submit
                    </Button>
                  </HStack>
                  {shouldShowGuessRejectedError ? (
                    <ErrorAlert
                      title="Guess rejected"
                      message={getErrorMessage(submitGuessMutation.error)}
                    />
                  ) : null}
                </>
              )}
            </Stack>
          </Stack>
        )
      ) : null}
    </Stack>
  );
}
