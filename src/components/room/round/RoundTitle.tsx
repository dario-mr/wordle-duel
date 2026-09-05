import { Box, HStack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import type { Language, RoomRounds, RoomStatus } from '../../../api/types';
import { Pill } from '../../common/Pill';
import { RoomLanguageFlag } from '../../myrooms/RoomLanguageFlag';

interface RoundTitleProps {
  roundNumber?: number | null;
  rounds?: RoomRounds | null;
  roomStatus?: RoomStatus | null;
  language: Language;
  endElement?: ReactNode;
}

export function RoundTitle({
  roundNumber,
  rounds,
  roomStatus,
  language,
  endElement,
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
  const isMatchComplete = roomStatus === 'MATCH_FINISHED';
  const isMatchInProgress = roomStatus === 'IN_PROGRESS';
  const isStatusWithProgress = isMatchComplete || isMatchInProgress;
  const statusLabel = isMatchComplete
    ? t('room.round.matchComplete').toUpperCase()
    : isMatchInProgress
      ? t('room.status.inProgress').toUpperCase()
      : roundTitle.toUpperCase();
  const statusColor = isMatchComplete
    ? 'fg.success'
    : isMatchInProgress
      ? 'yellow.400'
      : 'fg.primary';

  return (
    <HStack w="full" justifyContent="center" position="relative">
      <Pill
        display="flex"
        alignItems="center"
        gap={3}
        borderWidth="1px"
        borderColor="border.muted"
        bg="bg.panel"
        color={statusColor}
        px={4}
        py={1.5}
      >
        <Box aria-hidden="true" boxSize="8px" borderRadius="full" bg={statusColor} flexShrink={0} />
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
      {endElement ? (
        <Box position="absolute" right={0} top="50%" transform="translateY(-50%)">
          {endElement}
        </Box>
      ) : null}
    </HStack>
  );
}
