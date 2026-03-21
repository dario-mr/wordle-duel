import { type ButtonProps, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useJoinRoomAction } from '../../hooks/useJoinRoomAction';
import { AccentButton } from './BrandButton';

export function JoinRoomButton(props: {
  roomId: string | undefined;
  onJoined?: (roomId: string) => void;
  onJoin?: (roomId: string | undefined) => void;
  isJoining?: boolean;
  buttonProps?: Omit<ButtonProps, 'onClick' | 'loading' | 'disabled'>;
}) {
  const { t } = useTranslation();
  const joinAction = useJoinRoomAction({ onJoined: props.onJoined });
  const isPending = props.isJoining ?? joinAction.isPending;
  const handleJoin = props.onJoin ?? joinAction.joinRoom;

  return (
    <Stack gap={2} align="center">
      <AccentButton
        loading={isPending}
        disabled={!props.roomId || isPending}
        onClick={() => {
          handleJoin(props.roomId);
        }}
        {...props.buttonProps}
      >
        {t('common.join')}
      </AccentButton>
    </Stack>
  );
}
