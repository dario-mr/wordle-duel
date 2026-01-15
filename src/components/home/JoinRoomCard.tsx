import { Heading, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../common/Card';
import { JoinRoomButton } from '../common/JoinRoomButton';

export function JoinRoomCard(props: { onJoined: (roomId: string) => void }) {
  const { t } = useTranslation();
  const [roomIdInput, setRoomIdInput] = useState('');
  const joinButtonId = useId();

  const roomIdToJoin = roomIdInput.trim();

  return (
    <Card borderLeftColor="fg.accent">
      <Stack
        as="form"
        gap={3}
        onSubmit={(e) => {
          e.preventDefault();
          document.getElementById(joinButtonId)?.click();
        }}
      >
        <Heading size="md">{t('home.joinRoom.title')}</Heading>

        <Stack gap={1}>
          <Text fontSize="sm" fontWeight="medium">
            {t('home.joinRoom.roomIdLabel')}
          </Text>
          <HStack>
            <Input
              value={roomIdInput}
              onChange={(e) => {
                setRoomIdInput(e.target.value);
              }}
              placeholder={t('home.joinRoom.roomIdPlaceholder')}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <JoinRoomButton
              roomId={roomIdToJoin}
              onJoined={(joinedRoomId) => {
                props.onJoined(joinedRoomId);
              }}
              buttonProps={{ type: 'button', id: joinButtonId }}
            />
          </HStack>
        </Stack>
      </Stack>
    </Card>
  );
}
