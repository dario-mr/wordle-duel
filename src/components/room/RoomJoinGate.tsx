import { Stack, Text } from '@chakra-ui/react';
import type { RoomDto } from '../../api/types';
import { JoinRoomButton } from '../common/JoinRoomButton';

export function RoomJoinGate(props: {
  room: RoomDto;
  roomId: string | undefined;
  getPlayerId: () => string;
}) {
  if (props.room.players.length === 1) {
    return (
      <Stack gap={6} minH="50vh" align="center" justify="center" textAlign="center">
        <Text fontSize="2xl" fontWeight="semibold">
          Join this room
        </Text>
        <Text fontSize="md" color="fg.info">
          A player is waiting for an opponent.
        </Text>
        <JoinRoomButton roomId={props.roomId} getPlayerId={props.getPlayerId} />
      </Stack>
    );
  }

  return (
    <Text fontSize="xl" fontWeight="semibold" textAlign="center">
      You are not a player in this room.
    </Text>
  );
}
