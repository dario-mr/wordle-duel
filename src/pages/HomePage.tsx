import { Heading, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CreateRoomForm } from '../components/home/CreateRoomForm';
import { type HomeTab, HomeTabs } from '../components/home/HomeTabs';
import { JoinRoomForm } from '../components/home/JoinRoomForm';
import { STORAGE_KEYS } from '../state/storageKeys';
import { sanitizeReturnTo } from '../utils/sanitizeReturnTo';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<HomeTab>('create');

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
    <Stack gap={8} pt={8} pb={16} mx={2}>
      <Stack gap={2} align="center" textAlign="center">
        <Heading size="3xl" lineHeight="1.2">
          {t('home.welcome')}
        </Heading>
        <Text color="fg" opacity={0.6} fontSize="md">
          {t('home.subtitle')}
        </Text>
      </Stack>

      <HomeTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div id="create-room-panel" role="tabpanel" hidden={activeTab !== 'create'}>
        <CreateRoomForm onCreated={goToRoom} />
      </div>
      <div id="join-room-panel" role="tabpanel" hidden={activeTab !== 'join'}>
        <JoinRoomForm onJoined={goToRoom} />
      </div>
    </Stack>
  );
}
