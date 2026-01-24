import { Box, Stack, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlayerDto, RoomDto, RoundPlayerStatus } from '../../api/types';
import { roomStatusTextKey, roundPlayerStatusTextKey } from '../../utils/roomStatusText';
import { Card } from '../common/Card';
import { getRoomStatusStyle, getRoundPlayerIcon } from './roomVisuals';

const roomStatusTextKeyByStatus: Partial<Record<string, string>> = roomStatusTextKey;

interface MyRoomCardProps {
  room: RoomDto;
  myPlayerId: string;
  onOpen: () => void;
}

export function MyRoomCard({ room, myPlayerId, onOpen }: MyRoomCardProps) {
  const { t } = useTranslation();
  const DASH = t('room.playerStats.dash');

  const formatPlayerStatus = (status: RoundPlayerStatus | undefined) =>
    status ? t(roundPlayerStatusTextKey[status]) : DASH;

  const getPlayerLabel = (player: PlayerDto | undefined, fallback: string) => {
    return player?.displayName ?? fallback;
  };

  const formatRoomLanguage = (language: string) => {
    const normalized = language.trim().toLowerCase();
    return t(`roomLanguage.${normalized}`, {
      defaultValue: t(`locales.${normalized}`, { defaultValue: language }),
    });
  };

  const { mePlayer, opponent } = useMemo(() => {
    const mePlayer = room.players.find((p) => p.id === myPlayerId);
    const opponent = room.players.find((p) => p.id !== myPlayerId);
    return { mePlayer, opponent };
  }, [myPlayerId, room.players]);

  const meName = getPlayerLabel(mePlayer, 'Me');
  const opponentName = getPlayerLabel(opponent, '?');

  const meScore = mePlayer?.score ?? 0;
  const opponentScore = opponent?.score ?? 0;

  const roundNumber = room.currentRound?.roundNumber;

  const myRoundStatusRaw = room.currentRound?.statusByPlayerId[myPlayerId];
  const opponentRoundStatusRaw = opponent?.id
    ? room.currentRound?.statusByPlayerId[opponent.id]
    : undefined;

  const statusLabel = t(roomStatusTextKeyByStatus[room.status] ?? 'room.playerStats.statusUnknown');

  const subtitleParts: string[] = [statusLabel];
  if (typeof roundNumber === 'number') {
    subtitleParts.push(t('room.round.title', { roundNumber: String(roundNumber) }));
    subtitleParts.push(formatRoomLanguage(room.language));
  }
  const subtitle = subtitleParts.join(' • ');

  const statusStyle = getRoomStatusStyle(room.status);

  const meIcon = getRoundPlayerIcon(myRoundStatusRaw);
  const opponentIcon = getRoundPlayerIcon(opponentRoundStatusRaw);

  const playerRows = [
    { name: meName, score: meScore, icon: meIcon },
    { name: opponent ? opponentName : DASH, score: opponentScore, icon: opponentIcon },
  ];

  return (
    <Card
      as="button"
      borderLeftColor={statusStyle.borderLeftColor}
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

          <Box
            px={3}
            py={1}
            borderRadius="full"
            bg={statusStyle.pillBg}
            color={statusStyle.pillColor}
            fontWeight="bold"
            letterSpacing="wider"
            fontSize="xs"
            flexShrink={0}
          >
            {statusLabel}
          </Box>
        </Box>

        <Text fontSize="sm" opacity="0.8" letterSpacing="widest">
          {subtitle}
        </Text>

        <Box my={2} borderTopWidth="1px" borderColor="border.emphasized" opacity={0.35} />

        <Stack gap={3}>
          {playerRows.map((row, index) => (
            <Box key={`${room.id}-${String(index)}`} w="full">
              <Box display="grid" gridTemplateColumns="auto 1fr auto" alignItems="center" gap={4}>
                <Box
                  boxSize={6}
                  borderRadius="full"
                  bg={row.icon.bg}
                  color={row.icon.fg}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                  title={formatPlayerStatus(
                    index === 0 ? myRoundStatusRaw : opponentRoundStatusRaw,
                  )}
                >
                  {row.icon.label}
                </Box>

                <Text fontWeight="semibold" truncate>
                  {row.name}
                </Text>

                <Text fontWeight="bold">{row.score}</Text>
              </Box>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
