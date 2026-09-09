import { Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UNAUTHENTICATED_CODE, WdsApiError } from '../../../shared/api/apiError';
import { getErrorMessage } from '../../../shared/api/errors';
import { AuthErrorAlert } from '../../auth/AuthErrorAlert';
import { useMeQuery } from '../../auth/queries';
import { ErrorAlert } from '../../../shared/ui/ErrorAlert';
import { MyRoomsSkeleton } from './MyRoomsSkeleton';
import { MyRoomsView } from './MyRoomsView';
import { useMyRoomsQuery } from '../queries';

export function MyRoomsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: me, error: authError, refetch: refetchAuth } = useMeQuery();

  const { data, isLoading, isFetching, error } = useMyRoomsQuery({ enabled: me !== undefined });

  const rooms = data ?? [];

  if (authError && me === undefined) {
    return <AuthErrorAlert error={authError} onRetry={() => void refetchAuth()} />;
  }

  if (!data && (isLoading || isFetching)) {
    return <MyRoomsSkeleton />;
  }

  if (error) {
    if (error instanceof WdsApiError && error.code === UNAUTHENTICATED_CODE) {
      return null; // redirectToLogin() already navigates
    }

    return (
      <Stack gap={6}>
        <ErrorAlert title={t('room.errorTitle')} message={getErrorMessage(error)} />
      </Stack>
    );
  }

  if (!me) {
    return null;
  }

  return (
    <MyRoomsView
      rooms={rooms}
      myPlayerId={me.id}
      onOpenRoom={(roomId) => void navigate(`/rooms/${roomId}`)}
    />
  );
}
