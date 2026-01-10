import { Heading, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { useId, useState } from 'react';
import { Card } from '../common/Card';
import { JoinRoomButton } from '../common/JoinRoomButton';

export function JoinRoomCard(props: {
  getPlayerId: () => string;
  onJoined: (roomId: string) => void;
}) {
  const [roomIdInput, setRoomIdInput] = useState('');
  const joinButtonId = useId();

  const roomIdToJoin = roomIdInput.trim();

  return (
    <Card borderLeftColor="fg.accent">
      <Stack
        as="form"
        gap={3}
        onSubmit={(e) => {
          e.preventDefault();
          document.getElementById(joinButtonId)?.click();
        }}
      >
        <Heading size="md">Join room</Heading>

        <Stack gap={1}>
          <Text fontSize="sm" fontWeight="medium">
            Room ID
          </Text>
          <HStack>
            <Input
              value={roomIdInput}
              onChange={(e) => {
                setRoomIdInput(e.target.value);
              }}
              placeholder="Room ID"
              autoCapitalize="off"
              autoCorrect="off"
            />
            <JoinRoomButton
              roomId={roomIdToJoin}
              getPlayerId={props.getPlayerId}
              onJoined={(joinedRoomId) => {
                props.onJoined(joinedRoomId);
              }}
              buttonProps={{ type: 'button', id: joinButtonId }}
            />
          </HStack>
        </Stack>
      </Stack>
    </Card>
  );
}
