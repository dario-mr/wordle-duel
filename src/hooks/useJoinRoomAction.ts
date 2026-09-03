import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../api/errors';
import { ERROR_TOAST_DURATION_MS } from '../constants';
import { useJoinRoomMutation } from '../query/roomQueries';
import { useSingleToast } from './useSingleToast';

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
