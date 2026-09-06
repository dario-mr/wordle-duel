import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../shared/api/errors';
import { useJoinRoomMutation } from '../queries';
import { useSingleToast } from '../../../shared/hooks/useSingleToast';
import { ERROR_TOAST_DURATION_MS } from '../../../shared/ui/constants';

export function useJoinRoomAction(args?: { onJoined?: (roomId: string) => void }) {
  const { t } = useTranslation();
  const joinMutation = useJoinRoomMutation();
  const { show: showToast, dismiss: dismissErrorToast } = useSingleToast();

  const joinRoom = (roomId: string | undefined) => {
    if (!roomId || joinMutation.isPending) {
      return;
    }

    joinMutation.mutate(
      { roomId },
      {
        onSuccess: (joined) => {
          dismissErrorToast();
          args?.onJoined?.(joined.id);
        },
        onError: (err) => {
          showToast({
            type: 'warning',
            title: t('toasts.joinRoomFailed'),
            description: getErrorMessage(err),
            duration: ERROR_TOAST_DURATION_MS,
            closable: true,
          });
        },
      },
    );
  };

  return {
    isPending: joinMutation.isPending,
    joinRoom,
  };
}
