import { Box, HStack, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { PlayerDto, RoomDto } from '../../api/types';
import { roomStatusTextKey } from '../../utils/roomStatusText';
import { Card } from '../common/Card';
import { Pill } from '../common/Pill';
import { roomStatusStyleByStatus } from '../../utils/roomStatusVisuals';
import { RoomLanguageFlag } from './RoomLanguageFlag';

interface MyRoomCardProps {
  room: RoomDto;
  myPlayerId: string;
  onOpen: () => void;
}

interface StatusPillModel {
  label: string;
  bg: string;
  color: string;
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
      wins: mePlayer?.wins ?? 0,
    },
    {
      name: opponent ? opponentName : DASH,
      matchScore: opponent?.matchScore ?? DASH,
      wins: opponent?.wins ?? DASH,
    },
  ];

  const roomStatusLabel = t(roomStatusTextKey[room.status]);
  const roomStatusStyle = roomStatusStyleByStatus[room.status];

  const roundNumber = room.currentRound?.roundNumber;
  const roundTitle =
    room.rounds === 'ENDLESS'
      ? t('room.round.title', { roundNumber: String(roundNumber) })
      : t('room.round.titleWithRounds', {
          roundNumber: String(roundNumber),
          rounds: String(room.rounds),
        });

  const statusPill: StatusPillModel = {
    label: roomStatusLabel,
    bg: roomStatusStyle.pillBg,
    color: roomStatusStyle.pillColor,
  };

  return (
    <Card
      borderLeftWidth="default"
      as="button"
      textAlign="left"
      cursor="pointer"
      _hover={{ boxShadow: 'md' }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: 'blue.500',
        outlineOffset: '2px',
      }}
      onClick={onOpen}
    >
      <Stack gap={2} w="full">
        <Box w="full" display="flex" alignItems="center" justifyContent="space-between">
          <Text fontSize="lg" fontWeight="bold" truncate>
            {meName} vs {opponentName}
          </Text>
          <Pill bg={statusPill.bg} color={statusPill.color} fontSize="2xs">
            {statusPill.label}
          </Pill>
        </Box>

        {roundNumber != null ? (
          <HStack gap={3} alignItems="center" flexWrap="wrap">
            <Text fontSize="sm" opacity="0.7">
              {roundTitle}
            </Text>
            <RoomLanguageFlag language={room.language} fontSize="lg" />
          </HStack>
        ) : null}

        {room.status === 'IN_PROGRESS' ? (
          <>
            <Stack gap={2}>
              {playerRows.map((row, index) => (
                <Box key={`${room.id}-match-${String(index)}`} w="full">
                  <Box display="grid" gridTemplateColumns="1fr auto" alignItems="center" gap={4}>
                    <Text fontWeight="semibold" truncate>
                      {row.name}
                    </Text>
                    <Text fontWeight="bold">{row.matchScore}</Text>
                  </Box>
                </Box>
              ))}
            </Stack>
            <Box my={2} borderTopWidth="1px" borderColor="border.divider" />
          </>
        ) : null}
        <Stack gap={2}>
          <Text fontSize="sm" color="fg" opacity={0.6}>
            {t('room.playerStats.wins')}
          </Text>
          {playerRows.map((row, index) => (
            <Box key={`${room.id}-wins-${String(index)}`} w="full">
              <Box display="grid" gridTemplateColumns="1fr auto" alignItems="center" gap={4}>
                <Text fontWeight="semibold" truncate>
                  {row.name}
                </Text>
                <Text fontWeight="bold">{row.wins}</Text>
              </Box>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
