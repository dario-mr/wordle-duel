import { HStack, Stack, Text } from '@chakra-ui/react';
import { useRoomLinkShare } from '../../hooks/useRoomLinkShare';
import { AccentButton, PrimaryButton } from '../common/BrandButton';

export function RoomSharePanel(props: { roomId: string | undefined }) {
  const { hasCopiedRoomLink, copyRoomLink, shareRoomLink } = useRoomLinkShare(props.roomId);

  return (
    <Stack gap={5} minH="50vh" align="center" justify="center" textAlign="center">
      <Text fontSize="2xl" fontWeight="semibold">
        Waiting for opponent...
      </Text>
      <Text fontSize="md" color="fg.info">
        Share this room link with a friend to join.
      </Text>
      <HStack gap={3} flexWrap="wrap" justify="center">
        <PrimaryButton size="sm" disabled={!props.roomId} onClick={() => void copyRoomLink()}>
          {hasCopiedRoomLink ? 'Copied' : 'Copy link'}
        </PrimaryButton>

        <AccentButton size="sm" disabled={!props.roomId} onClick={() => void shareRoomLink()}>
          Share
        </AccentButton>
      </HStack>
    </Stack>
  );
}
