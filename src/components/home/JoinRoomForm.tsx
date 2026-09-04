import { Input, Stack, Text } from '@chakra-ui/react';
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
      h="full"
      onSubmit={(e) => {
        e.preventDefault();
        joinRoom(roomIdToJoin);
      }}
    >
      <Text color="fg" opacity={0.6} fontSize="md" mb={8} textAlign="center">
        {t('home.joinRoom.description')}
      </Text>

      <Stack gap={2} w="full">
        <Text fontSize="sm" fontWeight="medium">
          {t('home.joinRoom.roomIdLabel')}
        </Text>
        <Input
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
      </Stack>

      <Stack mt="auto" w="full">
        <JoinRoomButton
          roomId={roomIdToJoin}
          onJoin={joinRoom}
          isJoining={isPending}
          buttonProps={{
            type: 'button',
            w: 'full',
            minH: '2rem',
          }}
        />
      </Stack>
    </Stack>
  );
}
