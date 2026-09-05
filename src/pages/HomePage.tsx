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
    <Stack gap={8} pt={8} pb={16}>
      <Stack gap={2} align="center" textAlign="center">
        <Heading
          fontSize="3.5rem"
          lineHeight="0.8"
          letterSpacing="wider"
          fontWeight="medium"
          fontFamily="Sniglet"
          css={{ WebkitTextStroke: '3px currentColor' }}
        >
          {t('app.name')}
        </Heading>
        <Text color="fg" opacity={0.6} fontSize="lg" fontWeight="medium" fontFamily="Sniglet">
          {t('home.subtitle')}
        </Text>
      </Stack>

      <Stack
        gap={0}
        borderWidth="1px"
        borderColor="border"
        borderRadius="3xl"
        overflow="hidden"
        bg="bg.card"
      >
        <HomeTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <Stack gap={0} p={{ base: 5, sm: 8 }} display="grid">
          <Stack
            as="div"
            id="create-room-panel"
            role="tabpanel"
            gap={0}
            gridArea="1 / 1"
            visibility={activeTab === 'create' ? 'visible' : 'hidden'}
            pointerEvents={activeTab === 'create' ? 'auto' : 'none'}
            aria-hidden={activeTab !== 'create'}
          >
            <CreateRoomForm onCreated={goToRoom} />
          </Stack>
          <Stack
            as="div"
            id="join-room-panel"
            role="tabpanel"
            gap={0}
            gridArea="1 / 1"
            visibility={activeTab === 'join' ? 'visible' : 'hidden'}
            pointerEvents={activeTab === 'join' ? 'auto' : 'none'}
            aria-hidden={activeTab !== 'join'}
          >
            <JoinRoomForm onJoined={goToRoom} />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
