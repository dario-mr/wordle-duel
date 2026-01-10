import { HStack, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useRoomLinkShare } from '../../hooks/useRoomLinkShare';
import { AccentButton, PrimaryButton } from '../common/BrandButton';

export function RoomSharePanel(props: { roomId: string | undefined }) {
  const { t } = useTranslation();
  const { hasCopiedRoomLink, copyRoomLink, shareRoomLink } = useRoomLinkShare(props.roomId);

  return (
    <Stack gap={5} minH="50vh" align="center" justify="center" textAlign="center">
      <Text fontSize="2xl" fontWeight="semibold">
        {t('room.share.waitingTitle')}
      </Text>
      <Text fontSize="md" color="fg.info">
        {t('room.share.shareHint')}
      </Text>
      <HStack gap={3} flexWrap="wrap" justify="center">
        <PrimaryButton size="sm" disabled={!props.roomId} onClick={() => void copyRoomLink()}>
          {hasCopiedRoomLink ? t('common.copied') : t('common.copyLink')}
        </PrimaryButton>

        <AccentButton size="sm" disabled={!props.roomId} onClick={() => void shareRoomLink()}>
          {t('common.share')}
        </AccentButton>
      </HStack>
    </Stack>
  );
}
