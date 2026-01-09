import { Alert, Button, type ButtonProps, Stack } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { getErrorMessage } from '../api/errors';
import { roomQueryKey, useJoinRoomMutation } from '../query/roomQueries';

export function JoinRoomButton(props: {
  roomId: string | undefined;
  getPlayerId: () => string;
  onJoined?: (roomId: string) => void;
  buttonProps?: Omit<ButtonProps, 'onClick' | 'loading' | 'disabled'>;
}) {
  const queryClient = useQueryClient();
  const joinMutation = useJoinRoomMutation();

  const [errorToastMessage, setErrorToastMessage] = useState<string | null>(null);
  const hideErrorTimeoutIdRef = useRef<number | null>(null);

  const showErrorToast = (message: string) => {
    setErrorToastMessage(message);

    if (hideErrorTimeoutIdRef.current !== null) {
      window.clearTimeout(hideErrorTimeoutIdRef.current);
    }

    hideErrorTimeoutIdRef.current = window.setTimeout(() => {
      setErrorToastMessage(null);
      hideErrorTimeoutIdRef.current = null;
    }, 3500);
  };

  return (
    <Stack gap={2} align="center">
      <Button
        bg="fg.accent"
        color="fg"
        _hover={{ filter: 'brightness(0.9)' }}
        _active={{ filter: 'brightness(0.9)' }}
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
                setErrorToastMessage(null);
                if (hideErrorTimeoutIdRef.current !== null) {
                  window.clearTimeout(hideErrorTimeoutIdRef.current);
                  hideErrorTimeoutIdRef.current = null;
                }

                queryClient.setQueryData(roomQueryKey(joined.id), joined);
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
      </Button>

      {errorToastMessage ? (
        <Alert.Root
          status="error"
          position="fixed"
          bottom={4}
          left="50%"
          transform="translateX(-50%)"
          zIndex={1400}
          w="calc(100vw - 2rem)"
          maxW="sm"
          boxShadow="lg"
          borderRadius="md"
          px={4}
          py={3}
        >
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Join room failed</Alert.Title>
            <Alert.Description>{errorToastMessage}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : null}
    </Stack>
  );
}
