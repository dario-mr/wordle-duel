import { Heading, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CreateRoomCard } from '../components/home/CreateRoomCard';
import { JoinRoomCard } from '../components/home/JoinRoomCard';
import { usePlayerStore } from '../state/playerStore';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ensurePlayerId = usePlayerStore((s) => s.ensurePlayerId);

  const goToRoom = (roomId: string) => {
    void navigate(`/rooms/${roomId}`);
  };

  return (
    <Stack gap={5}>
      <Heading size="lg" textAlign="center">
        {t('home.welcome')}
      </Heading>

      <CreateRoomCard getPlayerId={ensurePlayerId} onCreated={goToRoom} />
      <JoinRoomCard getPlayerId={ensurePlayerId} onJoined={goToRoom} />
    </Stack>
  );
}
