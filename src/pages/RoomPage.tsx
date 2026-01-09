import { Alert, Button, Code, HStack, Input, Spinner, Stack, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WdsApiError } from '../api/wdsClient';
import { WORD_LENGTH } from '../constants';
import {
  useJoinRoomMutation,
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
  const joinMutation = useJoinRoomMutation();

  useRoomTopic(roomId);

  const [guessState, setGuessState] = useState<{ roundNumber?: number; value: string }>({
    value: '',
  });

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

  const displayError = (err: unknown): string => {
    if (err instanceof WdsApiError) {
      return err.message;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Unknown error';
  };

  if (room && !me) {
    return <Text>You are not registered as a player in this room.</Text>;
  }

  return (
    <Stack gap={6}>
      {isLoading ? (
        <HStack>
          <Spinner />
          <Text>Loading room...</Text>
        </HStack>
      ) : null}

      {error ? <ErrorAlert title="Room error" message={displayError(error)} /> : null}
      {joinMutation.error ? (
        <ErrorAlert title="Join error" message={displayError(joinMutation.error)} />
      ) : null}

      {room ? (
        room.status === 'WAITING_FOR_PLAYERS' ? (
          <Stack gap={1} align="flex-start">
            <Text fontSize="sm">Waiting for opponent...</Text>
            <Text fontSize="sm">
              Room ID: <Code>{roomId}</Code>
            </Text>
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
                      message={displayError(readyForNextRoundMutation.error)}
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
                        if (typeof currentRoundNumber !== 'number') {
                          return;
                        }
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
                              if (typeof currentRoundNumber !== 'number') {
                                return;
                              }
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
                      message={displayError(submitGuessMutation.error)}
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
