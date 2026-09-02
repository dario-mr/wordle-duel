import { HStack, Input, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useJoinRoomAction } from '../../hooks/useJoinRoomAction';
import { JoinRoomButton } from '../common/JoinRoomButton';

export function JoinRoomForm(props: { onJoined: (roomId: string) => void }) {
  const { t } = useTranslation();
  const [roomIdInput, setRoomIdInput] = useState('');
  const { joinRoom, isPending } = useJoinRoomAction({ onJoined: props.onJoined });

  const roomIdToJoin = roomIdInput.trim();

  return (
    <Stack
      as="form"
      gap={0}
      w="full"
      onSubmit={(e) => {
        e.preventDefault();
        joinRoom(roomIdToJoin);
      }}
    >
      <Text color="fg" opacity={0.6} fontSize="md" mb={8}>
        {t('home.joinRoom.description')}
      </Text>

      <Stack gap={2} w="full" mb={8}>
        <Text fontSize="sm" fontWeight="medium">
          {t('home.joinRoom.roomIdLabel')}
        </Text>
        <HStack gap={3} w="full" alignItems="stretch" flexDirection={{ base: 'column', sm: 'row' }}>
          <Input
            flex="1"
            value={roomIdInput}
            minH="3rem"
            borderRadius="0.9rem"
            fontSize="1.05rem"
            onChange={(e) => {
              setRoomIdInput(e.target.value);
            }}
            placeholder={t('home.joinRoom.roomIdPlaceholder')}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <JoinRoomButton
            roomId={roomIdToJoin}
            onJoin={joinRoom}
            isJoining={isPending}
            buttonProps={{
              type: 'button',
              minW: '8.5rem',
              w: { base: 'full', sm: 'auto' },
              minH: '3rem',
              fontSize: '1.05rem',
            }}
          />
        </HStack>
      </Stack>
    </Stack>
  );
}
