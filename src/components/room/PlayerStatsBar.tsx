import { Badge, HStack, Text, VStack } from '@chakra-ui/react';
import type { PlayerDto, RoomDto } from '../../api/types';

export function PlayerStatsBar(props: { player: PlayerDto; opponent?: PlayerDto; room: RoomDto }) {
  const round = props.room.currentRound;
  const myStatus = round?.statusByPlayerId[props.player.id];
  const opponentStatus = props.opponent ? round?.statusByPlayerId[props.opponent.id] : undefined;

  return (
    <HStack w="100%" justify="space-between" wrap="nowrap" gap={10}>
      <VStack align="flex-start" gap={1}>
        <Text fontWeight="semibold">Me</Text>
        <HStack gap={2}>
          <Text fontSize="sm">Score:</Text>
          <Badge>{props.player.score}</Badge>
        </HStack>
        <HStack gap={2}>
          <Text fontSize="sm">Status:</Text>
          <Badge>{myStatus ?? '—'}</Badge>
        </HStack>
      </VStack>

      <VStack align="flex-end" textAlign="right" gap={1}>
        <Text fontWeight="semibold">Opponent</Text>
        <HStack gap={2}>
          <Text fontSize="sm">Score:</Text>
          <Badge>{props.opponent ? props.opponent.score : '—'}</Badge>
        </HStack>
        <HStack gap={2}>
          <Text fontSize="sm">Status:</Text>
          <Badge>{props.opponent ? (opponentStatus ?? '—') : '—'}</Badge>
        </HStack>
      </VStack>
    </HStack>
  );
}
