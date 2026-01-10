import { type ButtonProps, Stack } from '@chakra-ui/react';
import { useRef } from 'react';
import { getErrorMessage } from '../../api/errors.ts';
import { useJoinRoomMutation } from '../../query/roomQueries';
import { AccentButton } from './BrandButton';
import { toaster } from './toasterInstance';

export function JoinRoomButton(props: {
  roomId: string | undefined;
  getPlayerId: () => string;
  onJoined?: (roomId: string) => void;
  buttonProps?: Omit<ButtonProps, 'onClick' | 'loading' | 'disabled'>;
}) {
  const joinMutation = useJoinRoomMutation();

  const lastErrorToastIdRef = useRef<string | null>(null);

  const dismissErrorToast = () => {
    if (!lastErrorToastIdRef.current) {
      return;
    }

    toaster.dismiss(lastErrorToastIdRef.current);
    lastErrorToastIdRef.current = null;
  };

  const showErrorToast = (message: string) => {
    dismissErrorToast();

    lastErrorToastIdRef.current = toaster.create({
      type: 'error',
      title: 'Join room failed',
      description: message,
      duration: 3500,
      closable: true,
    });
  };

  return (
    <Stack gap={2} align="center">
      <AccentButton
        loading={joinMutation.isPending}
        disabled={!props.roomId || joinMutation.isPending}
        onClick={() => {
          if (!props.roomId) {
            return;
          }
          joinMutation.mutate(
            { roomId: props.roomId, playerId: props.getPlayerId() },
            {
              onSuccess: (joined) => {
                dismissErrorToast();
                props.onJoined?.(joined.id);
              },
              onError: (err) => {
                showErrorToast(getErrorMessage(err));
              },
            },
          );
        }}
        {...props.buttonProps}
      >
        Join
      </AccentButton>
    </Stack>
  );
}
