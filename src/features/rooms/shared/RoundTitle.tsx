import { Box, HStack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import type { Language, RoomRounds, RoomStatus } from '../types';
import { Pill } from './Pill';
import { RoomLanguageFlag } from './RoomLanguageFlag';
import { roomStatusTextKey } from './roomStatusText';

interface RoundTitleProps {
  roundNumber?: number | null;
  rounds?: RoomRounds | null;
  roomStatus?: RoomStatus | null;
  language?: Language;
  endElement?: ReactNode;
  statusOnly?: boolean;
}

export function RoundTitle({
  roundNumber,
  rounds,
  roomStatus,
  language,
  endElement,
  statusOnly = false,
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
  const statusLabel = statusOnly
    ? roomStatus
      ? t(roomStatusTextKey[roomStatus])
      : ''
    : isMatchComplete
      ? t('room.round.matchComplete').toUpperCase()
      : isMatchInProgress
        ? t('room.status.inProgress').toUpperCase()
        : roundTitle.toUpperCase();
  const statusColor = isMatchComplete
    ? 'fg.success'
    : isMatchInProgress
      ? 'yellow.400'
      : 'fg.primary';

  const pill = (
    <Pill
      display={statusOnly ? 'inline-flex' : 'flex'}
      alignItems="center"
      gap={3}
      borderWidth="1px"
      borderColor="border.muted"
      bg="bg.panel"
      color={statusColor}
      px={4}
      py={1.5}
    >
      <Box
        className="match-status-dot"
        aria-hidden="true"
        boxSize="8px"
        borderRadius="full"
        bg={statusColor}
        flexShrink={0}
      />
      <Text fontSize={{ base: '2xs', md: 'xs' }} fontWeight="semibold" letterSpacing="wide">
        {statusLabel}
      </Text>
      {!statusOnly && isStatusWithProgress && (
        <>
          <Box aria-hidden="true" h="1.25rem" borderLeftWidth="1px" borderColor="border.muted" />
          <Text color="fg.muted" fontWeight="medium" letterSpacing="normal" whiteSpace="nowrap">
            {roundTitle}
          </Text>
        </>
      )}
      {!statusOnly && language && (
        <>
          <Box aria-hidden="true" h="1.25rem" borderLeftWidth="1px" borderColor="border.muted" />
          <RoomLanguageFlag language={language} fontSize="lg" />
        </>
      )}
    </Pill>
  );

  return statusOnly ? (
    pill
  ) : (
    <HStack w="full" justifyContent="center" position="relative">
      {pill}
      {endElement ? (
        <Box position="absolute" right={0} top="50%" transform="translateY(-50%)">
          {endElement}
        </Box>
      ) : null}
    </HStack>
  );
}
