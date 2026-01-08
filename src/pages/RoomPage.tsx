import {
  Alert,
  Badge,
  Box,
  Button,
  Code,
  HStack,
  Input,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { GuessLetterStatus, PlayerDto, RoomDto } from '../api/types';
import { WdsApiError } from '../api/wdsClient';
import { WORD_LENGTH } from '../constants';
import { useJoinRoomMutation, useRoomQuery, useSubmitGuessMutation } from '../query/roomQueries';
import { usePlayerStore } from '../state/playerStore';
import { useRoomTopic } from '../ws/useRoomTopic';

interface Cell {
  letter: string;
  status?: GuessLetterStatus;
}

function statusColor(status: GuessLetterStatus): string {
  switch (status) {
    case 'CORRECT':
      return 'green.500';
    case 'PRESENT':
      return 'yellow.500';
    case 'ABSENT':
      return 'gray.600';
  }
}

function LetterCell(props: { letter: string; status?: GuessLetterStatus }) {
  return (
    <Box
      w={12}
      h={12}
      borderWidth="1px"
      borderColor="gray.300"
      bg={props.status ? statusColor(props.status) : 'transparent'}
      color={props.status ? 'white' : 'inherit'}
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="bold"
      borderRadius="md"
    >
      {props.letter}
    </Box>
  );
}

function GuessRow(props: { word: string; letters?: Cell[] }) {
  const letters = useMemo<Cell[]>(() => {
    if (props.letters?.length === WORD_LENGTH) {
      return props.letters;
    }
    return props.word
      .padEnd(WORD_LENGTH, ' ')
      .slice(0, WORD_LENGTH)
      .split('')
      .map((ch) => ({ letter: ch }));
  }, [props.letters, props.word]);

  return (
    <HStack gap={2} justify="center">
      {letters.map((l, idx) => (
        <LetterCell key={idx} letter={l.letter} status={l.status} />
      ))}
    </HStack>
  );
}

function PlayerBoard(props: { player: PlayerDto; opponent?: PlayerDto; room: RoomDto }) {
  const round = props.room.currentRound;
  const guesses = round?.guessesByPlayerId[props.player.id] ?? [];
  const maxAttempts = round?.maxAttempts ?? 6;

  const rows = Array.from({ length: maxAttempts }, (_, index) => {
    const guess = guesses.at(index);
    if (!guess) {
      return { key: `empty-${String(index)}`, word: '', letters: undefined as Cell[] | undefined };
    }
    return {
      key: `guess-${String(guess.attemptNumber)}`,
      word: guess.word,
      letters: guess.letters,
    };
  });

  return (
    <Stack gap={3} align="center">
      <HStack justify="center">
        <Badge>My score: {props.player.score}</Badge>
        {props.opponent ? <Badge>Opponent's score: {props.opponent.score}</Badge> : null}
      </HStack>

      <Stack gap={2} align="center">
        {rows.map((row) => (
          <GuessRow key={row.key} word={row.word} letters={row.letters} />
        ))}
      </Stack>
    </Stack>
  );
}

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

  const [guess, setGuess] = useState('');

  const submitGuessMutation = useSubmitGuessMutation({
    roomId: roomId ?? '',
    playerId: effectivePlayerId,
  });

  const myRoundStatus = room?.currentRound?.statusByPlayerId[effectivePlayerId];
  const me = room?.players.find((p) => p.id === effectivePlayerId);
  const opponent = room?.players.find((p) => p.id !== effectivePlayerId);
  const isRoundFinished = room?.currentRound?.finished === true;

  const canSubmit =
    Boolean(roomId) &&
    room?.status === 'IN_PROGRESS' &&
    (myRoundStatus === 'PLAYING' || isRoundFinished) &&
    guess.length === WORD_LENGTH &&
    !submitGuessMutation.isPending;

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
              ) : myRoundStatus && myRoundStatus !== 'PLAYING' ? (
                <Text fontSize="sm">
                  You {myRoundStatus.toLowerCase()} this round.
                  <br />
                  {isRoundFinished
                    ? 'Enter a new guess to start the next round.'
                    : 'Wait for the other player to complete his round.'}
                </Text>
              ) : null}

              <HStack py={3}>
                <Input
                  value={guess}
                  onChange={(e) => {
                    setGuess(normalizeGuess(e.target.value));
                  }}
                  placeholder="ABCDE"
                  maxLength={WORD_LENGTH}
                  disabled={
                    room.status !== 'IN_PROGRESS' ||
                    (!isRoundFinished && myRoundStatus !== 'PLAYING')
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
                          setGuess('');
                        },
                      },
                    );
                  }}
                >
                  Submit
                </Button>
              </HStack>
              {submitGuessMutation.error ? (
                <ErrorAlert
                  title="Guess rejected"
                  message={displayError(submitGuessMutation.error)}
                />
              ) : null}
            </Stack>
          </Stack>
        )
      ) : null}
    </Stack>
  );
}
