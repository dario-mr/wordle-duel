import { Alert, Button, Heading, HStack, Input, NativeSelect, Stack } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WdsApiError } from '../api/wdsClient';
import { roomQueryKey, useCreateRoomMutation, useJoinRoomMutation } from '../query/roomQueries';
import { LANGUAGE_OPTIONS } from '../constants';
import { usePlayerStore } from '../state/playerStore';

type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['value'];

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

  const ensurePlayerId = usePlayerStore((s) => s.ensurePlayerId);

  const [language, setLanguage] = useState<LanguageCode>(LANGUAGE_OPTIONS[0].value);
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
      <Heading size="lg">Welcome to Wordle Duel!</Heading>

      <Stack gap={2}>
        <Heading size="sm">Language</Heading>
        <NativeSelect.Root maxW="240px">
          <NativeSelect.Field
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value as LanguageCode);
            }}
            aria-label="Language"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
      </Stack>

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
          onClick={() => {
            createMutation.mutate(
              {
                playerId: ensurePlayerId(),
                language,
              },
              {
                onSuccess: (room) => {
                  queryClient.setQueryData(roomQueryKey(room.id), room);
                  void navigate(`/rooms/${room.id}`);
                },
              },
            );
          }}
        >
          Create room ({language})
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
            onClick={() => {
              joinMutation.mutate(
                {
                  roomId: roomIdToJoin,
                  playerId: ensurePlayerId(),
                },
                {
                  onSuccess: (joined) => {
                    queryClient.setQueryData(roomQueryKey(joined.id), joined);
                    void navigate(`/rooms/${joined.id}`);
                  },
                },
              );
            }}
          >
            Join
          </Button>
        </HStack>
      </Stack>
    </Stack>
  );
}
