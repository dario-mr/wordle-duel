import { Stack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, subscribeCurrentUser } from '../api/auth';
import { getErrorMessage } from '../api/errors';
import { WdsApiError } from '../api/types';
import { UNAUTHENTICATED_CODE } from '../constants';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { MyRoomsSkeleton } from '../components/myrooms/MyRoomsSkeleton';
import { MyRoomsView } from '../components/myrooms/MyRoomsView';
import { useMyRoomsQuery } from '../query/roomQueries';

export function MyRoomsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [me, setMe] = useState(() => getCurrentUser());

  useEffect(() => {
    return subscribeCurrentUser(() => {
      setMe(getCurrentUser());
    });
  }, []);

  const { data, isLoading, isFetching, error } = useMyRoomsQuery({ enabled: true });

  const rooms = data ?? [];

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
