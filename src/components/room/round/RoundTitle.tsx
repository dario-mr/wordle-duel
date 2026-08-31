import { Box, HStack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { Language, RoomRounds, RoomStatus, RoundStatus } from '../../../api/types';
import { Pill } from '../../common/Pill';
import { RoomLanguageFlag } from '../../myrooms/RoomLanguageFlag';

interface RoundTitleProps {
  roundNumber?: number | null;
  rounds?: RoomRounds | null;
  roundStatus?: RoundStatus | null;
  roomStatus?: RoomStatus | null;
  language: Language;
}

export function RoundTitle({
  roundNumber,
  rounds,
  roundStatus,
  roomStatus,
  language,
}: RoundTitleProps) {
  const { t } = useTranslation();

  const DASH = t('room.playerStats.dash');

  const roundNumberText = roundNumber != null ? String(roundNumber) : DASH;
  const roundTitle =
    rounds != null && rounds !== 'ENDLESS'
      ? t('room.round.compactTitle', {
          roundNumber: roundNumberText,
          rounds: String(rounds),
        })
      : t('room.round.title', { roundNumber: roundNumberText });
  const isMatchComplete = roomStatus === 'CLOSED';
  const isRoundComplete = roundStatus === 'ENDED';
  const isStatusWithProgress = isMatchComplete || isRoundComplete;
  const statusLabel = isMatchComplete
    ? t('room.round.matchComplete').toUpperCase()
    : isRoundComplete
      ? t('room.round.roundComplete').toUpperCase()
      : roundTitle.toUpperCase();

  return (
    <HStack w="full" justifyContent="center">
      <Pill
        display="flex"
        alignItems="center"
        gap={3}
        borderWidth="1px"
        borderColor="border.muted"
        bg="bg.panel"
        color={isStatusWithProgress ? 'fg.success' : 'fg.primary'}
        px={4}
        py={1.5}
      >
        <Box
          aria-hidden="true"
          boxSize="8px"
          borderRadius="full"
          bg={isStatusWithProgress ? 'fg.success' : 'fg.primary'}
          flexShrink={0}
        />
        <Text fontSize={{ base: '2xs', md: 'xs' }} fontWeight="semibold" letterSpacing="wide">
          {statusLabel}
        </Text>
        {isStatusWithProgress && (
          <>
            <Box aria-hidden="true" h="1.25rem" borderLeftWidth="1px" borderColor="border.muted" />
            <Text color="fg.muted" fontWeight="medium" letterSpacing="normal" whiteSpace="nowrap">
              {roundTitle}
            </Text>
          </>
        )}
        <Box aria-hidden="true" h="1.25rem" borderLeftWidth="1px" borderColor="border.muted" />
        <RoomLanguageFlag language={language} fontSize="lg" />
      </Pill>
    </HStack>
  );
}
