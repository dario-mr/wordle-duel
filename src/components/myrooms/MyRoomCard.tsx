import { Box, HStack, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { PlayerDto, RoomDto } from '../../api/types';
import { roomStatusTextKey } from '../../utils/roomStatusText';
import { Card } from '../common/Card';
import { RoomLanguageFlag } from './RoomLanguageFlag';

interface MyRoomCardProps {
  room: RoomDto;
  myPlayerId: string;
  onOpen: () => void;
}

export function MyRoomCard({ room, myPlayerId, onOpen }: MyRoomCardProps) {
  const { t } = useTranslation();
  const DASH = t('room.playerStats.dash');

  const getPlayerLabel = (player: PlayerDto | undefined, fallback: string) => {
    return player?.displayName ?? fallback;
  };

  const mePlayer = room.players.find((p) => p.id === myPlayerId);
  const opponent = room.players.find((p) => p.id !== myPlayerId);

  const meName = getPlayerLabel(mePlayer, 'Me');
  const opponentName = getPlayerLabel(opponent, '?');

  const playerRows = [
    {
      name: meName,
      matchScore: mePlayer?.matchScore ?? DASH,
      wins: room.status === 'WAITING_FOR_PLAYERS' ? 0 : (mePlayer?.wins ?? 0),
    },
    {
      name: opponent ? opponentName : DASH,
      matchScore: opponent?.matchScore ?? DASH,
      wins: room.status === 'WAITING_FOR_PLAYERS' ? 0 : (opponent?.wins ?? DASH),
    },
  ];

  const roomStatusLabel = t(roomStatusTextKey[room.status]);

  const roundNumber = room.currentRound?.roundNumber;
  const roundNumberText = roundNumber != null ? String(roundNumber) : DASH;
  const roundTitle =
    room.rounds === 'ENDLESS'
      ? t('room.round.title', { roundNumber: roundNumberText })
      : t('room.round.titleWithRounds', {
          roundNumber: roundNumberText,
          rounds: String(room.rounds),
        });

  const meMatchScore =
    room.status === 'WAITING_FOR_PLAYERS' ? DASH : (mePlayer?.matchScore ?? DASH);
  const opponentMatchScore =
    room.status === 'WAITING_FOR_PLAYERS' ? DASH : (opponent?.matchScore ?? DASH);

  const matchScoreRow = (
    <HStack justify="center" gap={2}>
      <Text fontSize="2xl" lineHeight="1" fontWeight="bold">
        {meMatchScore}
      </Text>
      <Text fontSize="xl" lineHeight="1" color="fg.subtle">
        {DASH}
      </Text>
      <Text fontSize="2xl" lineHeight="1" fontWeight="bold">
        {opponentMatchScore}
      </Text>
    </HStack>
  );

  return (
    <Card
      as="button"
      textAlign="left"
      cursor="pointer"
      py={4}
      _hover={{ boxShadow: 'md' }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: 'blue.500',
        outlineOffset: '2px',
      }}
      onClick={onOpen}
    >
      <Stack gap={3} w="full">
        <Box w="full" display="flex" alignItems="center" justifyContent="space-between">
          <Text fontSize="lg" fontWeight="bold" truncate>
            {meName} vs {opponentName}
          </Text>
          <RoomLanguageFlag language={room.language} fontSize="lg" />
        </Box>

        <Card boxShadow="none" borderRadius="2xl" bg="bg.panel" py={2.5}>
          <Stack gap={3} w="full">
            <Stack gap={1} align="center">
              {room.status === 'WAITING_FOR_PLAYERS' ? (
                <Text color="fg.muted" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">
                  {roomStatusLabel}
                </Text>
              ) : room.status === 'MATCH_FINISHED' ? (
                <Text color="fg.success" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">
                  {t('room.round.matchComplete').toUpperCase()}
                </Text>
              ) : (
                <Text color="yellow.400" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">
                  {t('room.status.inProgress')}
                </Text>
              )}
              {matchScoreRow}
              {room.status !== 'WAITING_FOR_PLAYERS' ? (
                <Text fontSize="sm" opacity="0.7">
                  {roundTitle}
                </Text>
              ) : null}
            </Stack>
          </Stack>
        </Card>

        <Stack gap={2}>
          <Text mt={3} px={3} fontSize="sm" color="fg" opacity={0.6} textAlign="left">
            {t('room.playerStats.wins')}
          </Text>
          <Box borderWidth="1px" borderStyle="dashed" borderColor="border.muted" borderRadius="xl">
            {playerRows.map((row, index) => (
              <Box
                key={`${room.id}-wins-${String(index)}`}
                px={3}
                py={2}
                borderBottomWidth={index === 0 ? '1px' : 0}
                borderStyle="dashed"
                borderColor="border.muted"
              >
                <Box
                  display="grid"
                  gridTemplateColumns="minmax(0, 1fr) 2.5rem"
                  alignItems="stretch"
                  gap={4}
                >
                  <Text alignSelf="center" fontWeight="semibold" truncate>
                    {row.name}
                  </Text>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderLeftWidth="1px"
                    borderStyle="dashed"
                    borderColor="border.muted"
                    pl={4}
                  >
                    <Text fontWeight="bold">{row.wins}</Text>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
}
