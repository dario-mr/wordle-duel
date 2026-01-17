import { Heading, Stack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CreateRoomCard } from '../components/home/CreateRoomCard';
import { JoinRoomCard } from '../components/home/JoinRoomCard';
import { STORAGE_KEYS } from '../state/storageKeys';
import { sanitizeReturnTo } from '../utils/sanitizeReturnTo';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const rawReturnTo = sessionStorage.getItem(STORAGE_KEYS.authReturnTo);
    const returnTo = sanitizeReturnTo(rawReturnTo);

    if (rawReturnTo != null) {
      sessionStorage.removeItem(STORAGE_KEYS.authReturnTo);
    }

    if (returnTo) {
      void navigate(returnTo);
    }
  }, [navigate]);

  const goToRoom = (roomId: string) => {
    void navigate(`/rooms/${roomId}`);
  };

  return (
    <Stack gap={5}>
      <Heading size="lg" textAlign="center">
        {t('home.welcome')}
      </Heading>

      <CreateRoomCard onCreated={goToRoom} />
      <JoinRoomCard onJoined={goToRoom} />
    </Stack>
  );
}
