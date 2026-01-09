import { Alert, Button, Heading, HStack, Input, NativeSelect, Stack } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/errors';
import { Card } from '../components/Card';
import { LANGUAGE_OPTIONS } from '../constants';
import { JoinRoomButton } from '../components/JoinRoomButton';
import { roomQueryKey, useCreateRoomMutation } from '../query/roomQueries';
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

  return (
    <Stack gap={5}>
      <Heading size="lg" textAlign="center">
        Welcome to Wordle Duel!
      </Heading>

      {createMutation.error ? (
        <ErrorAlert title="Create room failed" message={getErrorMessage(createMutation.error)} />
      ) : null}

      <Card>
        <Stack gap={3}>
          <Heading size="md">Create room</Heading>
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
          <Button
            bg="fg.primary"
            color="fg"
            _hover={{ filter: 'brightness(0.9)' }}
            _active={{ filter: 'brightness(0.9)' }}
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
            Create room
          </Button>
        </Stack>
      </Card>

      <Card borderLeftColor="fg.accent">
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
            <JoinRoomButton
              roomId={roomIdToJoin}
              getPlayerId={ensurePlayerId}
              onJoined={(joinedRoomId) => {
                void navigate(`/rooms/${joinedRoomId}`);
              }}
            />
          </HStack>
        </Stack>
      </Card>
    </Stack>
  );
}
