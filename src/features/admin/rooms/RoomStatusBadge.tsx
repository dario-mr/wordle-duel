import { Badge } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { RoomStatus } from '../../rooms/types';
import { roomStatusTextKey } from '../../rooms/shared/roomStatusText';
import { roomStatusColorByStatus } from '../../rooms/shared/roomStatusVisuals';

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const { t } = useTranslation();
  const color = roomStatusColorByStatus[status];

  return (
    <Badge
      px={3}
      py={1}
      borderRadius="full"
      borderWidth="1px"
      borderColor={color}
      bg="bg.subtle"
      color={color}
      fontSize="xs"
      fontWeight="semibold"
      letterSpacing="wide"
      whiteSpace="nowrap"
    >
      {t(roomStatusTextKey[status])}
    </Badge>
  );
}
