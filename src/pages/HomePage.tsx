import { Alert, Button, Code, Heading, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WdsApiError } from '../api/wdsClient';
import { roomQueryKey, useCreateRoomMutation, useJoinRoomMutation } from '../query/roomQueries';
import { usePlayerStore } from '../state/playerStore';

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

export function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const playerId = usePlayerStore((s) => s.playerId);
  const ensurePlayerId = usePlayerStore((s) => s.ensurePlayerId);
  const effectivePlayerId = useMemo(() => playerId ?? ensurePlayerId(), [ensurePlayerId, playerId]);

  const [roomIdToJoin, setRoomIdToJoin] = useState('');

  const createMutation = useCreateRoomMutation();
  const joinMutation = useJoinRoomMutation();

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
      <Heading size="lg">Wordle Duel</Heading>
      <Text>
        Your player id: <Code>{effectivePlayerId}</Code>
      </Text>

      {createMutation.error ? (
        <ErrorAlert title="Create room failed" message={displayError(createMutation.error)} />
      ) : null}

      {joinMutation.error ? (
        <ErrorAlert title="Join room failed" message={displayError(joinMutation.error)} />
      ) : null}

      <Stack gap={3}>
        <Heading size="md">Create room</Heading>
        <Button
          colorPalette="teal"
          loading={createMutation.isPending}
          onClick={async () => {
            const room = await createMutation.mutateAsync({
              playerId: ensurePlayerId(),
              language: 'IT',
            });
            queryClient.setQueryData(roomQueryKey(room.id), room);
            navigate(`/rooms/${room.id}`);
          }}
        >
          Create room (IT)
        </Button>
      </Stack>

      <Stack gap={3}>
        <Heading size="md">Join room</Heading>
        <HStack>
          <Input
            value={roomIdToJoin}
            onChange={(e) => {
              setRoomIdToJoin(e.target.value.trim());
            }}
            placeholder="Room ID"
            autoCapitalize="off"
            autoCorrect="off"
          />
          <Button
            variant="outline"
            loading={joinMutation.isPending}
            disabled={!roomIdToJoin}
            onClick={async () => {
              const joined = await joinMutation.mutateAsync({
                roomId: roomIdToJoin,
                playerId: ensurePlayerId(),
              });
              queryClient.setQueryData(roomQueryKey(joined.id), joined);
              navigate(`/rooms/${joined.id}`);
            }}
          >
            Join
          </Button>
        </HStack>
      </Stack>
    </Stack>
  );
}
