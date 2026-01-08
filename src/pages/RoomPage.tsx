import {
  Alert,
  Badge,
  Box,
  Button,
  Code,
  Heading,
  HStack,
  Input,
  Separator,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { GuessLetterStatus, PlayerDto, RoomDto } from '../api/types';
import { WdsApiError } from '../api/wdsClient';
import { getShareRoomUrl } from '../config/wds';
import {
  roomQueryKey,
  useJoinRoomMutation,
  useRoomQuery,
  useSubmitGuessMutation,
} from '../query/roomQueries';
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
      w={10}
      h={10}
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
    if (props.letters?.length === 5) {
      return props.letters;
    }
    return props.word
      .padEnd(5, ' ')
      .slice(0, 5)
      .split('')
      .map((ch) => ({ letter: ch }));
  }, [props.letters, props.word]);

  return (
    <HStack gap={2}>
      {letters.map((l, idx) => (
        <LetterCell key={idx} letter={l.letter} status={l.status} />
      ))}
    </HStack>
  );
}

function PlayerBoard(props: { player: PlayerDto; room: RoomDto }) {
  const round = props.room.currentRound;
  const guesses = round?.guessesByPlayerId?.[props.player.id] ?? [];
  const maxAttempts = round?.maxAttempts ?? 6;
  const status = round?.statusByPlayerId?.[props.player.id];

  const rows = Array.from({ length: maxAttempts }, (_, index) => {
    const guess = guesses[index];
    if (!guess) {
      return { key: `empty-${index}`, word: '', letters: undefined as Cell[] | undefined };
    }
    return {
      key: `guess-${guess.attemptNumber}`,
      word: guess.word,
      letters: guess.letters,
    };
  });

  return (
    <Stack gap={3}>
      <HStack justify="space-between">
        <Heading size="sm">
          Player <Code>{props.player.id}</Code>
        </Heading>
        <HStack>
          <Badge>Score: {props.player.score}</Badge>
          {status ? <Badge>{status}</Badge> : null}
        </HStack>
      </HStack>

      <Stack gap={2}>
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
    .slice(0, 5);
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const shareUrl = useMemo(() => {
    if (!roomId) {
      return '';
    }
    return getShareRoomUrl(roomId);
  }, [roomId]);

  const myRoundStatus = room?.currentRound?.statusByPlayerId?.[effectivePlayerId];

  const canSubmit =
    Boolean(roomId) &&
    room?.status === 'IN_PROGRESS' &&
    myRoundStatus === 'PLAYING' &&
    guess.length === 5 &&
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

  return (
    <Stack gap={6}>
      <HStack justify="space-between">
        <Stack gap={1}>
          <Heading size="lg">Room</Heading>
          <Text>
            ID: <Code>{roomId}</Code>
          </Text>
        </Stack>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back
        </Button>
      </HStack>

      {isLoading ? (
        <HStack>
          <Spinner />
          <Text>Loading room…</Text>
        </HStack>
      ) : null}

      {error ? <ErrorAlert title="Room error" message={displayError(error)} /> : null}
      {joinMutation.error ? (
        <ErrorAlert title="Join error" message={displayError(joinMutation.error)} />
      ) : null}
      {submitGuessMutation.error ? (
        <ErrorAlert title="Guess rejected" message={displayError(submitGuessMutation.error)} />
      ) : null}

      {room ? (
        <Stack gap={4}>
          <HStack justify="space-between">
            <HStack>
              <Badge>Language: {room.language}</Badge>
              <Badge>Status: {room.status}</Badge>
            </HStack>
            {room.status === 'WAITING_FOR_PLAYERS' ? (
              <Stack gap={1} align="flex-end">
                <Text fontSize="sm">Waiting for opponent…</Text>
                <Text fontSize="sm">
                  Share: <Code>{shareUrl}</Code>
                </Text>
              </Stack>
            ) : null}
          </HStack>

          <Separator />

          <Heading size="md">Players</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            {room.players.map((p) => (
              <PlayerBoard key={p.id} player={p} room={room} />
            ))}
          </SimpleGrid>

          <Separator />

          <Heading size="md">Your guess</Heading>
          <Stack gap={3}>
            <Text fontSize="sm">
              You are <Code>{effectivePlayerId}</Code>
            </Text>

            {room.status !== 'IN_PROGRESS' ? (
              <Text fontSize="sm">Game not in progress yet.</Text>
            ) : myRoundStatus && myRoundStatus !== 'PLAYING' ? (
              <Text fontSize="sm">You are {myRoundStatus.toLowerCase()} for this round.</Text>
            ) : null}

            <HStack>
              <Input
                value={guess}
                onChange={(e) => {
                  setGuess(normalizeGuess(e.target.value));
                }}
                placeholder="ABCDE"
                maxLength={5}
                disabled={room.status !== 'IN_PROGRESS' || myRoundStatus !== 'PLAYING'}
                autoCapitalize="characters"
                autoCorrect="off"
              />
              <Button
                colorPalette="teal"
                disabled={!canSubmit}
                loading={submitGuessMutation.isPending}
                onClick={async () => {
                  if (!roomId) {
                    return;
                  }
                  const word = normalizeGuess(guess);
                  const result = await submitGuessMutation.mutateAsync({ word });
                  queryClient.setQueryData(roomQueryKey(roomId), result.room);
                  setGuess('');
                }}
              >
                Submit
              </Button>
            </HStack>
          </Stack>
        </Stack>
      ) : null}

      {!room && !isLoading && roomId ? (
        <Stack gap={3}>
          <Text>Room not loaded yet.</Text>
          <Button
            onClick={async () => {
              const pid = ensurePlayerId();
              const joined = await joinMutation.mutateAsync({ roomId, playerId: pid });
              queryClient.setQueryData(roomQueryKey(roomId), joined);
            }}
          >
            Try joining
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
}
