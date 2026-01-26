import { HStack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { RoundStatus } from '../../../api/types';
import { roundStatusTextKey } from '../../../utils/roomStatusText';
import { Pill } from '../../common/Pill';
import { getRoundStatusStyle } from '../../../utils/roomStatusVisuals';

interface RoundTitleProps {
  roundNumber?: number | null;
  roundStatus?: RoundStatus | null;
}

export function RoundTitle({ roundNumber, roundStatus }: RoundTitleProps) {
  const { t } = useTranslation();

  const DASH = t('room.playerStats.dash');

  const roundNumberText = roundNumber != null ? String(roundNumber) : DASH;
  const roundStatusLabel = roundStatus ? t(roundStatusTextKey[roundStatus]).toUpperCase() : DASH;
  const roundStatusStyle = getRoundStatusStyle(roundStatus);

  return (
    <HStack w="full" justifyContent="center" gap={3}>
      <Text textAlign="center">{t('room.round.title', { roundNumber: roundNumberText })}</Text>
      <Pill fontSize="2xs" bg={roundStatusStyle.pillBg} color={roundStatusStyle.pillColor}>
        {roundStatusLabel}
      </Pill>
    </HStack>
  );
}
